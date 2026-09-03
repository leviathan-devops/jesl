import { Effect, Ref } from "effect"
import { Bus, type BusService } from "../core/bus"

export type HookVerdict = { allow: true } | { allow: false; reason: unknown }

export interface ToolExecuteEvent {
  readonly tool: string
  readonly args: unknown
  readonly runId?: string
  readonly source?: string
}

const busDenyMaps = new WeakMap<BusService, Map<string, unknown>>()
const busInstalled = new WeakMap<BusService, boolean>()

const getDenyMap = (bus: BusService): Map<string, unknown> => {
  let m = busDenyMaps.get(bus)
  if (!m) { m = new Map(); busDenyMaps.set(bus, m) }
  return m
}

const ensurePtaSubscription = (bus: BusService): Effect.Effect<void> =>
  Effect.gen(function* () {
    if (busInstalled.get(bus)) return
    busInstalled.set(bus, true)
    yield* bus.subscribe("pta.*", (e) =>
      Effect.gen(function* () {
        const payload: any = e.payload
        const isDeny = payload?.verdict === "deny" || payload?.allow === false || payload?.decision === "deny" || payload?.verdict === "DENY"
        if (isDeny) {
          const map = getDenyMap(bus)
          const key = payload.tool ?? e.type
          map.set(key, payload.reason ?? payload)
          map.set("__pta_deny__", payload.reason ?? payload)
          if (payload.tool) map.set(payload.tool, payload.reason ?? payload)
        }
      }).pipe(Effect.catchAllCause(() => Effect.void))
    )
    yield* bus.subscribe("pba.*", () => Effect.void).pipe(Effect.catchAllCause(() => Effect.void))
  })

export const onToolExecuteBefore = (event: ToolExecuteEvent): Effect.Effect<HookVerdict, never, Bus> =>
  Effect.gen(function* () {
    const bus = yield* Bus
    yield* ensurePtaSubscription(bus).pipe(Effect.catchAllCause(() => Effect.void))
    const ctx: any = yield* Effect.context<any>()
    let toolEngine: any = null
    try {
      const m: Map<any, any> = (ctx as any).unsafeMap as Map<any, any>
      if (m) {
        for (const [k, v] of m) {
          const id = (k as any).key ?? (k as any).identifier ?? String(k)
          if (id === "jesl/ToolEngine") { toolEngine = v; break }
        }
      }
    } catch {}
    if (toolEngine && typeof toolEngine.intercept === "function") {
      const result: any = yield* (toolEngine.intercept({ tool: event.tool, args: event.args, run: event.runId ?? "default" }) as Effect.Effect<any>).pipe(
        Effect.catchAllCause(() => Effect.succeed(null))
      )
      if (result !== null && result !== undefined) {
        yield* bus.emit("tool.execute.before", { tool: event.tool, args: event.args, source: event.source ?? "hook-bridge", runId: event.runId }, event.runId ?? "default").pipe(Effect.catchAllCause(() => Effect.void))
        if (result.verdict === "deny") {
          return { allow: false as const, reason: result.reason }
        }
        return { allow: true as const }
      }
    }
    yield* bus.emit("tool.execute.before", { tool: event.tool, args: event.args, source: event.source ?? "hook-bridge", runId: event.runId }, event.runId ?? "default").pipe(Effect.catchAllCause(() => Effect.void))
    const map = getDenyMap(bus)
    const direct = map.get(event.tool)
    const runKey = event.runId ? map.get(`${event.runId}:${event.tool}`) : undefined
    const generic = map.get("__pta_deny__")
    const denyReason = direct ?? runKey ?? generic
    if (denyReason !== undefined) {
      return { allow: false as const, reason: denyReason }
    }
    return { allow: true as const }
  })

export const clearBridgeState = (bus: BusService): Effect.Effect<void> =>
  Effect.sync(() => {
    const m = busDenyMaps.get(bus)
    if (m) m.clear()
  })

export const detachAll = (runId?: string): Effect.Effect<void, never, Bus> =>
  Effect.gen(function* () {
    const bus = yield* Bus
    const m = busDenyMaps.get(bus)
    if (m) m.clear()
    busInstalled.delete(bus)
    yield* bus.detachAll(runId).pipe(Effect.catchAllCause(() => Effect.void))
  })

export const hookBridgeBusEventTypes = {
  emitted: "tool.execute.before" as const,
  pbaHit: "pba.family.hit" as const,
  ptaIntercept: "pta.intercept" as const,
}
