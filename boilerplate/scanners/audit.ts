import { Effect, Option } from "effect"
import { Bus, type BusEvent } from "../core/bus"
import { Journal } from "../core/journal"

function hasTriplet(payload: unknown): boolean {
  if (payload === null || typeof payload !== "object") return false
  const p = payload as Record<string, unknown>
  const ev = p["evidence"] as unknown
  if (ev === null || typeof ev !== "object") return false
  const e = ev as Record<string, unknown>
  const pattern = e["pattern"]
  const state = e["state"]
  const anchor = e["anchor"]
  return (
    typeof pattern === "string" && pattern.length > 0 && typeof state === "string" && state.length > 0 && typeof anchor === "string" && anchor.length > 0
  )
}

export const attachAuditScanner = Effect.gen(function* () {
  const bus: any = yield* Bus as any
  const handler = (e: BusEvent): Effect.Effect<void> =>
    (Effect.gen(function* () {
      const payload: any = e.payload
      if (hasTriplet(payload)) return
      const violation = {
        originalType: e.type,
        reason: "missing evidence triplet",
        payload: payload,
        run: e.run
      }
      yield* (bus.emit("audit.violation", violation, e.run) as any).pipe(
        Effect.catchAllCause(() => Effect.void) as any
      )
      const journalOpt: any = yield* (Effect.serviceOption(Journal) as any)
      if (Option.isSome(journalOpt as any)) {
        const j: any = (journalOpt as any).value
        yield* (j
          .append({
            run: e.run,
            node: (payload && typeof payload === "object" && (payload as any).node) || "audit",
            kind: "audit.violation",
            source: "scanner/audit",
            evidence: {
              pattern: "audit.violation",
              state: "violation",
              anchor: `${e.type}:${e.run}`
            }
          }) as any
        ).pipe(Effect.catchAllCause(() => Effect.void) as any)
      }
    }) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)

  yield* (bus.subscribe("*verdict*", handler) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
})
