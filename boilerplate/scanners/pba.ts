import { Effect, Option, Clock } from "effect"
import { Bus, type BusEvent } from "../core/bus"
import { Journal } from "../core/journal"
import { PBA_HIT_EVENT } from "./shared"
import { scoreSignals, confidence, classifyBand, ALL_FAMILIES, type FourBankFamily } from "./pba-banks"

function extractText(payload: unknown): string {
  if (payload == null) return ""
  if (typeof payload === "string") return payload
  if (typeof payload === "object") {
    const p = payload as Record<string, unknown>
    if (typeof p["text"] === "string") return p["text"] as string
    if (typeof p["deliberation"] === "string") return p["deliberation"] as string
    if (typeof p["reasoning"] === "string") return p["reasoning"] as string
    const part = p["part"] as unknown
    if (part && typeof part === "object" && typeof (part as any).text === "string") return (part as any).text as string
    try { return JSON.stringify(p) } catch { return String(p) }
  }
  return String(payload)
}

export const detectFamilies = (text: string, families: FourBankFamily[] = ALL_FAMILIES): Array<{ family: string; confidence: number; band: "ENFORCE" | "DAMPEN" | "SUPPRESS"; evidence: string }> => {
  const out: Array<{ family: string; confidence: number; band: "ENFORCE" | "DAMPEN" | "SUPPRESS"; evidence: string }> = []
  for (const f of families) {
    const { pos, neg, evidence } = scoreSignals(text, f)
    if (pos === 0) continue
    const conf = confidence(pos, neg)
    const band = classifyBand(conf)
    if (band === "SUPPRESS") continue
    if (conf >= 0.3 && pos > 0) out.push({ family: f.id, confidence: conf, band, evidence })
  }
  return out
}

export const attachPbaScanner = Effect.gen(function* () {
  const bus: any = yield* Bus as any
  const handler = (e: BusEvent): Effect.Effect<void> =>
    (Effect.gen(function* () {
      const text = extractText(e.payload)
      if (!text || text.trim().length === 0) return
      const hits = detectFamilies(text)
      for (const h of hits) {
        if (h.band !== "ENFORCE") continue
        const ts = yield* Clock.currentTimeMillis
        const payload = {
          family: h.family,
          confidence: h.confidence,
          band: h.band,
          evidence: h.evidence,
          verdict: "hit" as const,
          reason: `pba family ${h.family} ENFORCE conf=${h.confidence.toFixed(3)} evidence=${h.evidence}`,
          run: e.run,
          ts,
          text
        }
        yield* (bus.emit(PBA_HIT_EVENT, payload, e.run) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
        const journalOpt: any = yield* (Effect.serviceOption(Journal) as any)
        if (Option.isSome(journalOpt as any)) {
          const j: any = (journalOpt as any).value
          yield* (j.append({ run: e.run, node: `pba:${h.family}`, kind: PBA_HIT_EVENT, source: `scanner/pba/${h.family}`, evidence: { pattern: PBA_HIT_EVENT, state: h.family, anchor: `${e.run}:${h.evidence.slice(0, 40)}` } }) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
        }
      }
    }) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)

  const patterns = ["deliberation.*", "message.part.updated", "pba.reasoning.*", "reasoning.*", "chat.*", "assistant.*"]
  for (const pat of patterns) {
    yield* (bus.subscribe(pat, handler) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
  }
})

export const makePbaService = attachPbaScanner
