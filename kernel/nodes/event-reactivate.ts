import { Effect, Clock, Deferred } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

const channelMap = new Map<string, Deferred.Deferred<unknown, unknown>>()
const emittedLog = new Map<string, unknown[]>()

export const eventReactivateNode: NodeImpl = {
  kind: "event-reactivate",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { channel?: string; key?: string; signal?: unknown }
      const channel = cfg.channel ?? cfg.key ?? inp.node.id
      const signal = cfg.signal ?? (inp.inbound["signal"] as unknown) ?? (inp.inbound["event"] as unknown) ?? (inp.inbound["resume"] as unknown) ?? (Object.values(inp.inbound)[0] as unknown) ?? true
      const startMs = yield* Clock.currentTimeMillis
      const log = emittedLog.get(channel) ?? []
      log.push(signal)
      emittedLog.set(channel, log)
      const existing = channelMap.get(channel)
      if (existing) {
        yield* Deferred.succeed(existing, signal).pipe(Effect.catchAll(() => Effect.void))
        channelMap.delete(channel)
      } else {
        const d = yield* Deferred.make<unknown, unknown>()
        yield* Deferred.succeed(d, signal).pipe(Effect.catchAll(() => Effect.void))
        channelMap.set(channel, d)
      }
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: "event-reactivate", state: "REACTIVATED", anchor: `${inp.node.id}:${channel}:${log.length}` }, timing: { startMs, endMs }, outputs: { channel, signal, count: log.length } } as NodeResult
    })
}

export const reactivateWait = (channel: string): Effect.Effect<unknown, unknown, never> =>
  Effect.gen(function* () {
    let d = channelMap.get(channel)
    if (!d) {
      d = yield* Deferred.make<unknown, unknown>()
      channelMap.set(channel, d)
    }
    const v = yield* Deferred.await(d)
    channelMap.delete(channel)
    return v
  })

export const _reactivateMap = channelMap
export const _reactivateLog = emittedLog
export const _resetReactivate = (key?: string) => {
  if (key) { channelMap.delete(key); emittedLog.delete(key) }
  else { channelMap.clear(); emittedLog.clear() }
}
