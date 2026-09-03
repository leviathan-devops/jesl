import { Effect, Clock, Deferred } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

const deferredMap = new Map<string, Deferred.Deferred<unknown, unknown>>()

export const pauseNode: NodeImpl = {
  kind: "pause",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { key?: string; resumeValue?: unknown; immediateResume?: boolean }
      const key = cfg.key ?? inp.node.id
      const startMs = yield* Clock.currentTimeMillis
      if (cfg.immediateResume) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "PASS" as const, evidence: { pattern: "pause", state: "RESUMED", anchor: `${inp.node.id}:resume` }, timing: { startMs, endMs }, outputs: { resumed: cfg.resumeValue ?? true } } as NodeResult
      }
      let d = deferredMap.get(key)
      if (!d) {
        d = yield* Deferred.make<unknown, unknown>()
        deferredMap.set(key, d)
        if (cfg.resumeValue !== undefined) {
          yield* Deferred.succeed(d, cfg.resumeValue)
        }
      }
      const inboundResume = inp.inbound["resume"] ?? inp.inbound["signal"]
      if (inboundResume !== undefined) {
        yield* Deferred.succeed(d, inboundResume).pipe(Effect.catchAll(() => Effect.void))
      }
      const val = yield* Deferred.await(d)
      deferredMap.delete(key)
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: "pause", state: "RESUMED", anchor: `${inp.node.id}:resumed` }, timing: { startMs, endMs }, outputs: { resumed: val } } as NodeResult
    })
}

export const pauseResume = (key: string, value: unknown): Effect.Effect<void> =>
  Effect.gen(function* () {
    const d = deferredMap.get(key)
    if (d) yield* Deferred.succeed(d, value).pipe(Effect.catchAll(() => Effect.void))
    else {
      const nd = yield* Deferred.make<unknown, unknown>()
      yield* Deferred.succeed(nd, value)
      deferredMap.set(key, nd)
    }
  })

export const _pauseMap = deferredMap
