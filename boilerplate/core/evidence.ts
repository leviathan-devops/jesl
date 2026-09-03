import { Effect, Clock, Ref, Context, Layer } from "effect"

export const RING_CAP = 50
export const VERDICT_TTL_MS = 5000
export const CLAIM_FRESH_WINDOW_MS = 300000

export type EvidenceKind = "unit" | "container" | "smoke" | "dist_change" | "claim" | "evidence_clear" | "source_change" | "status"

export interface EvidenceEvent {
  readonly kind: EvidenceKind
  readonly subject: string
  readonly at: number
  readonly payload?: unknown
  readonly probeOutput?: string
  readonly filePath?: string
  readonly detail?: { probeOutput?: string; filePath?: string }
}

export interface VerdictRecord {
  readonly subject: string
  readonly verdict: "EVIDENCED" | "UNEVIDENCED" | "REJECTED"
  readonly at: number
  readonly reason?: string
}

function isEventFresh(ev: EvidenceEvent, now: number, windowMs = CLAIM_FRESH_WINDOW_MS): boolean {
  return now - ev.at <= windowMs
}

function canSourceChange(ev: EvidenceEvent): boolean {
  if (ev.kind !== "source_change") return false
  if (!ev.filePath && !(ev.detail as any)?.filePath && !(ev.payload as any)?.filePath) return false
  if (!ev.subject) return false
  return true
}

function canStatus(ev: EvidenceEvent): boolean {
  if (ev.kind !== "status") return false
  const out = ev.probeOutput ?? (ev.detail as any)?.probeOutput ?? (ev.payload as any)?.probeOutput
  if (!out || String(out).length === 0) return false
  return true
}

const PASS_COUNT_RE = /\d+\s+pass/i
const WRITE_TOOLS = ["write", "edit", "write_file"] as const

function analyzeResult(tool: string, resultText: string): EvidenceKind | null {
  if ((WRITE_TOOLS as readonly string[]).includes(tool)) return "source_change"
  if (PASS_COUNT_RE.test(resultText)) {
    if (resultText.includes("container")) return "container"
    return "unit"
  }
  if (resultText.includes("smoke")) return "smoke"
  if (resultText.includes("dist")) return "dist_change"
  if (resultText.includes("claim")) return "claim"
  if (resultText.includes("evidence_clear")) return "evidence_clear"
  return null
}

export interface EvidenceService {
  readonly ingest: (ev: EvidenceEvent) => Effect.Effect<VerdictRecord>
  readonly queryVerdict: (subject: string) => Effect.Effect<VerdictRecord>
  readonly ringSize: (subject: string) => Effect.Effect<number>
  readonly isFresh: (ev: EvidenceEvent) => Effect.Effect<boolean>
  readonly analyzeResult: (tool: string, text: string) => EvidenceKind | null
  readonly canSourceChange: (ev: EvidenceEvent) => boolean
  readonly canStatus: (ev: EvidenceEvent) => boolean
  readonly isEventFresh: typeof isEventFresh
  readonly clear: (subject: string) => Effect.Effect<void>
}

export class EvidenceMachine extends Context.Tag("jesl/EvidenceMachine")<EvidenceMachine, EvidenceService>() {}

export const makeEvidenceMachine = Effect.gen(function* () {
  const rings = yield* Ref.make(new Map<string, EvidenceEvent[]>())
  const verdicts = yield* Ref.make(new Map<string, VerdictRecord>())
  const lastSourceAt = yield* Ref.make(new Map<string, number>())

  const ingest = (ev: EvidenceEvent): Effect.Effect<VerdictRecord> =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      if (!isEventFresh(ev, now)) {
        const v: VerdictRecord = { subject: ev.subject, verdict: "REJECTED", at: now, reason: "stale" }
        return v
      }
      if (ev.kind === "source_change") {
        if (!canSourceChange(ev)) {
          const v: VerdictRecord = { subject: ev.subject, verdict: "UNEVIDENCED", at: now, reason: "source_change without path" }
          yield* Ref.update(verdicts, (m) => { const n = new Map(m); n.set(ev.subject, v); return n })
          return v
        }
        const last = (yield* Ref.get(lastSourceAt)).get(ev.subject) ?? -1
        if (ev.at <= last) {
          const v: VerdictRecord = { subject: ev.subject, verdict: "REJECTED", at: now, reason: "non-monotonic" }
          return v
        }
        yield* Ref.update(lastSourceAt, (m) => { const n = new Map(m); n.set(ev.subject, ev.at); return n })
      }
      if (ev.kind === "status") {
        if (!canStatus(ev)) {
          const v: VerdictRecord = { subject: ev.subject, verdict: "UNEVIDENCED", at: now, reason: "status without probeOutput" }
          yield* Ref.update(verdicts, (m) => { const n = new Map(m); n.set(ev.subject, v); return n })
          return v
        }
      }
      const map = yield* Ref.get(rings)
      const list = map.get(ev.subject) ?? []
      const next = [...list, ev]
      const capped = next.length > RING_CAP ? next.slice(next.length - RING_CAP) : next
      const nm = new Map(map)
      nm.set(ev.subject, capped)
      yield* Ref.set(rings, nm)

      let verdict: VerdictRecord
      if (ev.kind === "claim") {
        const hasSource = capped.some(e => e.kind === "source_change" && isEventFresh(e, now))
        verdict = hasSource ? { subject: ev.subject, verdict: "EVIDENCED", at: now } : { subject: ev.subject, verdict: "UNEVIDENCED", at: now, reason: "no fresh source_change" }
      } else if (["unit", "container", "smoke", "dist_change"].includes(ev.kind)) {
        verdict = { subject: ev.subject, verdict: "EVIDENCED", at: now }
      } else {
        verdict = { subject: ev.subject, verdict: "EVIDENCED", at: now }
      }
      yield* Ref.update(verdicts, (m) => { const n = new Map(m); n.set(ev.subject, verdict); return n })
      return verdict
    })

  const queryVerdict = (subject: string): Effect.Effect<VerdictRecord> =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const m = yield* Ref.get(verdicts)
      const v = m.get(subject)
      if (!v) return { subject, verdict: "UNEVIDENCED" as const, at: now, reason: "no verdict" }
      if (now - v.at > VERDICT_TTL_MS) return { subject, verdict: "UNEVIDENCED" as const, at: now, reason: "stale verdict" }
      return v
    })

  const svc: EvidenceService = {
    ingest,
    queryVerdict,
    ringSize: (subject: string) => Effect.map(Ref.get(rings), (m) => (m.get(subject) ?? []).length),
    isFresh: (ev: EvidenceEvent) => Effect.gen(function* () { const now = yield* Clock.currentTimeMillis; return isEventFresh(ev, now) }),
    analyzeResult,
    canSourceChange,
    canStatus,
    isEventFresh,
    clear: (subject: string) => Effect.gen(function* () {
      yield* Ref.update(rings, (m) => { const n = new Map(m); n.delete(subject); return n })
      yield* Ref.update(verdicts, (m) => { const n = new Map(m); n.delete(subject); return n })
    })
  }
  return svc
})

export const EvidenceMachineLive = Layer.effect(EvidenceMachine, makeEvidenceMachine)
export const EvidenceMachineTestLive = EvidenceMachineLive

export const _isEventFresh = isEventFresh
export const _canSourceChange = canSourceChange
export const _canStatus = canStatus
export const _analyzeResult = analyzeResult
