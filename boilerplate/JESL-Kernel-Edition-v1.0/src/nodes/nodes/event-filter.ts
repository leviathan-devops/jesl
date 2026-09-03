import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

function matchGlob(pattern: string, type: string): boolean {
  if (pattern === "*") return true
  const esc = pattern.replace(/[-[\]{}()+?.\\^$|]/g, "\\$&")
  const reg = esc.replace(/\*/g, ".*")
  return new RegExp(`^${reg}$`).test(type)
}

export const eventFilterNode: NodeImpl = {
  kind: "event-filter",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { pattern?: string; subscribe?: string; filter?: string; event?: { type: string; payload: unknown }; expectedType?: string }
      const pattern = cfg.pattern ?? cfg.subscribe ?? "*"
      const ev = cfg.event ?? inp.inbound["event"] as any
      const startMs = yield* Clock.currentTimeMillis
      if (!ev || typeof ev !== "object" || !(ev as any).type) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "READY_FALSE" as const, evidence: { pattern: `event-filter:${pattern}`, state: "READY_FALSE", anchor: `${inp.node.id}:no-event` }, timing: { startMs, endMs } } as NodeResult
      }
      const type = (ev as any).type as string
      if (!matchGlob(pattern, type)) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "READY_FALSE" as const, evidence: { pattern: `event-filter:${pattern}`, state: "DROPPED", anchor: `${inp.node.id}:drop` }, timing: { startMs, endMs } } as NodeResult
      }
      if (cfg.filter) {
        const payload = (ev as any).payload
        const ok = typeof payload === "string" ? payload.includes(cfg.filter) : JSON.stringify(payload ?? "").includes(cfg.filter)
        if (!ok) {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "READY_FALSE" as const, evidence: { pattern: `event-filter:${pattern}`, state: "FILTERED", anchor: `${inp.node.id}:filtered` }, timing: { startMs, endMs } } as NodeResult
        }
      }
      if (cfg.expectedType && (ev as any).type !== cfg.expectedType) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "READY_FALSE" as const, evidence: { pattern: `event-filter:${pattern}`, state: "MISMATCH", anchor: `${inp.node.id}:mismatch` }, timing: { startMs, endMs } } as NodeResult
      }
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: `event-filter:${pattern}`, state: "MATCHED", anchor: `${inp.node.id}:matched` }, timing: { startMs, endMs }, outputs: { matched: ev } } as NodeResult
    })
}
