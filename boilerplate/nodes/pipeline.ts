import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

export const pipelineNode: NodeImpl = {
  kind: "pipeline",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { steps?: Array<{ fn?: (v: unknown) => unknown; value?: unknown }>; fnA?: (v: unknown) => unknown; fnB?: (v: unknown) => unknown }
      const startMs = yield* Clock.currentTimeMillis
      const inboundVal = inp.inbound["input"] ?? Object.values(inp.inbound)[0]
      if (inboundVal === undefined) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "READY_FALSE" as const, evidence: { pattern: "pipeline", state: "NO_INPUT", anchor: `${inp.node.id}:no-input` }, timing: { startMs, endMs } } as NodeResult
      }
      let cur: unknown = inboundVal
      if (cfg.steps) {
        for (const s of cfg.steps) {
          if (s.fn) cur = s.fn(cur)
          else if (s.value !== undefined) cur = s.value
        }
      } else {
        if (cfg.fnA) cur = cfg.fnA(cur)
        if (cfg.fnB) cur = cfg.fnB(cur)
        if (!cfg.fnA && !cfg.fnB) cur = inboundVal
      }
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: "pipeline", state: "PIPED", anchor: `${inp.node.id}:piped` }, timing: { startMs, endMs }, outputs: { output: cur, result: cur } } as NodeResult
    })
}
