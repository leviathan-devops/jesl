import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

type TransitionTable = Record<string, Record<string, string>>

const defaultTable: TransitionTable = {
  idle: { start: "running", reset: "idle" },
  running: { pause: "paused", finish: "done", fail: "failed", reset: "idle" },
  paused: { resume: "running", reset: "idle" },
  done: { reset: "idle" },
  failed: { reset: "idle" }
}

const machineStore = new Map<string, string>()

export const machineNode: NodeImpl = {
  kind: "machine",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { table?: TransitionTable; initial?: string; event?: string }
      const table = cfg.table ?? defaultTable
      const initial = cfg.initial ?? "idle"
      const event = (cfg.event as string) ?? (inp.inbound["event"] as string) ?? (Object.values(inp.inbound)[0] as string) ?? ""
      const key = inp.node.id
      const cur = machineStore.get(key) ?? initial
      const startMs = yield* Clock.currentTimeMillis
      if (!event) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "machine", state: cur, anchor: `${inp.node.id}:${cur}--missing-event` }, timing: { startMs, endMs }, outputs: { state: cur, error: "missing event" } } as NodeResult
      }
      const next = table[cur]?.[event]
      if (!next) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "INCONCLUSIVE" as const, evidence: { pattern: "machine", state: cur, anchor: `${inp.node.id}:${cur}--${event}` }, timing: { startMs, endMs } } as NodeResult
      }
      machineStore.set(key, next)
      const verdict = next === "done" ? "PASS" : next === "failed" ? "FAIL" : "PASS"
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: verdict as any, evidence: { pattern: "machine", state: next, anchor: `${inp.node.id}:${cur}->${next}` }, timing: { startMs, endMs }, outputs: { state: next, prev: cur } } as NodeResult
    })
}

export const _machineStore = machineStore
export const _machineDefaultTable = defaultTable
