import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

export const retryChainNode: NodeImpl = {
  kind: "retry-chain",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { maxRetries?: number; failTimes?: number; fn?: (attempt: number) => Effect.Effect<unknown, unknown>; shouldFail?: (attempt: number) => boolean }
      const maxRetries = cfg.maxRetries ?? 2
      const failTimes = cfg.failTimes ?? 2
      const startMs = yield* Clock.currentTimeMillis
      let attempt = 0
      let lastError: unknown = undefined
      while (attempt <= maxRetries) {
        let ok = true
        if (cfg.fn) {
          const res = yield* Effect.either(cfg.fn(attempt))
          if (res._tag === "Right") {
            const endMs = yield* Clock.currentTimeMillis
            return { verdict: "PASS" as const, evidence: { pattern: "retry-chain", state: "RETRIED", anchor: `${inp.node.id}:${attempt}` }, timing: { startMs, endMs }, outputs: { result: res.right, attempts: attempt + 1 } } as NodeResult
          } else {
            lastError = res.left
            ok = false
          }
        } else if (cfg.shouldFail) {
          ok = !cfg.shouldFail(attempt)
          if (!ok) lastError = `fail at ${attempt}`
        } else {
          ok = attempt >= failTimes
          if (!ok) lastError = `fail at ${attempt}`
        }
        if (ok) {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "PASS" as const, evidence: { pattern: "retry-chain", state: "RETRIED", anchor: `${inp.node.id}:${attempt}` }, timing: { startMs, endMs }, outputs: { attempts: attempt + 1 } } as NodeResult
        }
        attempt++
        if (attempt > maxRetries) break
      }
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "FAIL" as const, evidence: { pattern: "retry-chain", state: "EXHAUSTED", anchor: `${inp.node.id}:exhausted` }, timing: { startMs, endMs }, error: lastError ?? { code: "RETRY_EXHAUSTED" } } as NodeResult
    })
}
