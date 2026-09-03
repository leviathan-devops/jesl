import { Effect, Option, Clock } from "effect"
import { Bus, type BusEvent } from "../core/bus"
import { Journal } from "../core/journal"
import { PBA_HIT_EVENT, PTA_INTERCEPT_EVENT, PTA_DENY_REASON, PTA_ALLOW_REASON, makePreArmRing, type PreArmRing } from "./shared"

function extractTool(payload: unknown, type: string): string {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>
    if (typeof p["tool"] === "string") return p["tool"] as string
    if (typeof p["name"] === "string") return p["name"] as string
  }
  const seg = type.split(".")
  return seg[seg.length - 1] ?? type
}

export const attachPtaScanner = (opts?: { ring?: PreArmRing }) =>
  Effect.gen(function* () {
    const bus: any = yield* Bus as any
    const ring: PreArmRing = opts?.ring ?? makePreArmRing(20)

    const pbaHandler = (e: BusEvent): Effect.Effect<void> =>
      (Effect.gen(function* () {
        const p: any = e.payload
        const family = typeof p?.family === "string" ? p.family : String(p?.family ?? "unknown")
        const entry = { family, confidence: p?.confidence ?? 0, band: p?.band ?? "ENFORCE", evidence: p?.evidence ?? "", verdict: "hit" as const, reason: p?.reason ?? "", run: e.run, ts: e.ts, text: p?.text ?? "" }
        ring.push(entry as any)
      }) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)

    yield* (bus.subscribe(PBA_HIT_EVENT, pbaHandler) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)

    const toolHandler = (e: BusEvent): Effect.Effect<void> =>
      (Effect.gen(function* () {
        const tool = extractTool(e.payload, e.type)
        const preArmed = ring.hasArmed()
        const family = ring.lastFamily()
        const ts = yield* Clock.currentTimeMillis
        const verdict: "allow" | "deny" = preArmed ? "allow" : "deny"
        const reason = preArmed ? PTA_ALLOW_REASON : PTA_DENY_REASON
        const payload = { tool, family, verdict, reason, run: e.run, ts, preArmed }
        yield* (bus.emit(PTA_INTERCEPT_EVENT, payload, e.run) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
        const journalOpt: any = yield* (Effect.serviceOption(Journal) as any)
        if (Option.isSome(journalOpt as any)) {
          const j: any = (journalOpt as any).value
          yield* (j.append({ run: e.run, node: `pta:${tool}`, kind: PTA_INTERCEPT_EVENT, source: `scanner/pta/${tool}`, evidence: { pattern: PTA_INTERCEPT_EVENT, state: verdict, anchor: `${e.run}:${tool}:${family ?? "none"}` } }) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
        }
      }) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)

    yield* (bus.subscribe("tool.call.*", toolHandler) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
  })

export const makePtaService = attachPtaScanner
