import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

export const parallelNode: NodeImpl = {
  kind: "parallel",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { items?: unknown[]; concurrency?: number; delayMs?: number }
      const items: unknown[] = (cfg.items as unknown[]) ?? (inp.inbound["items"] as unknown[]) ?? []
      const concurrency = cfg.concurrency ?? 15
      const startMs = yield* Clock.currentTimeMillis
      if (items.length === 0) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "PASS" as const, evidence: { pattern: "parallel", state: "EMPTY", anchor: `${inp.node.id}:empty` }, timing: { startMs, endMs }, outputs: { results: [] } } as NodeResult
      }
      const results = yield* Effect.forEach(items, (item) =>
        Effect.gen(function* () {
          if (cfg.delayMs) yield* Effect.sleep(cfg.delayMs)
          return item
        }), { concurrency })
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: "parallel", state: "FANNED", anchor: `${inp.node.id}:${items.length}` }, timing: { startMs, endMs }, outputs: { results, count: results.length } } as NodeResult
    })
}
