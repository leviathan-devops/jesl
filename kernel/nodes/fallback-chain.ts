import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

export const fallbackChainNode: NodeImpl = {
  kind: "fallback-chain",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { primary?: Effect.Effect<unknown, unknown>; fallback?: Effect.Effect<unknown, unknown>; primaryShouldFail?: boolean; primaryValue?: unknown; fallbackValue?: unknown }
      const startMs = yield* Clock.currentTimeMillis
      let primaryRes: Effect.Effect<unknown, unknown>
      if (cfg.primary) primaryRes = cfg.primary
      else if (cfg.primaryShouldFail) primaryRes = Effect.fail(new Error("primary fail"))
      else if (cfg.primaryValue !== undefined) primaryRes = Effect.succeed(cfg.primaryValue)
      else primaryRes = inp.inbound["primary"] !== undefined ? Effect.succeed(inp.inbound["primary"]) : Effect.fail(new Error("no primary"))
      const primaryEither = yield* Effect.either(primaryRes)
      if (primaryEither._tag === "Right") {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "PASS" as const, evidence: { pattern: "fallback-chain", state: "PRIMARY", anchor: `${inp.node.id}:primary` }, timing: { startMs, endMs }, outputs: { result: primaryEither.right, which: "primary" } } as NodeResult
      }
      let fallbackRes: Effect.Effect<unknown, unknown>
      if (cfg.fallback) fallbackRes = cfg.fallback
      else if (cfg.fallbackValue !== undefined) fallbackRes = Effect.succeed(cfg.fallbackValue)
      else fallbackRes = inp.inbound["fallback"] !== undefined ? Effect.succeed(inp.inbound["fallback"]) : Effect.succeed({ fallback: true })
      const fallbackEither = yield* Effect.either(fallbackRes)
      if (fallbackEither._tag === "Right") {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "PASS" as const, evidence: { pattern: "fallback-chain", state: "FALLBACK", anchor: `${inp.node.id}:fallback` }, timing: { startMs, endMs }, outputs: { result: fallbackEither.right, which: "fallback" } } as NodeResult
      }
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "FAIL" as const, evidence: { pattern: "fallback-chain", state: "BOTH_FAILED", anchor: `${inp.node.id}:both` }, timing: { startMs, endMs }, error: fallbackEither.left } as NodeResult
    })
}
