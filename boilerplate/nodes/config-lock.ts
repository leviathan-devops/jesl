import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

const lockStore = new Map<string, unknown>()

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null) return a === b
  if (typeof a !== typeof b) return false
  if (typeof a === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch { return false }
  }
  return false
}

export const configLockNode: NodeImpl = {
  kind: "config-lock",
  family: "decision",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { key?: string; lockKey?: string; value?: unknown }
      const key = cfg.lockKey ?? cfg.key ?? inp.node.id
      const inbound = inp.inbound as Record<string, unknown>
      let proposed: unknown
      if (cfg.value !== undefined) proposed = cfg.value
      else if (inbound["value"] !== undefined) proposed = inbound["value"]
      else if (inbound["config"] !== undefined) proposed = inbound["config"]
      else {
        const vals = Object.values(inbound)
        proposed = vals.length > 0 ? vals[0] : undefined
      }
      const startMs = yield* Clock.currentTimeMillis
      if (proposed === undefined) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "READY_FALSE" as const, evidence: { pattern: "config-lock", state: "EMPTY", anchor: `${inp.node.id}:empty` }, timing: { startMs, endMs } } as NodeResult
      }
      const existing = lockStore.get(key)
      if (existing !== undefined) {
        if (deepEqual(existing, proposed)) {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "PASS" as const, evidence: { pattern: "config-lock", state: "LOCKED_MATCH", anchor: `${inp.node.id}:${key}:match` }, timing: { startMs, endMs }, outputs: { key, value: existing, locked: true } } as NodeResult
        }
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "config-lock", state: "MUTATION", anchor: `${inp.node.id}:${key}:expected=${String(JSON.stringify(existing))} actual=${String(JSON.stringify(proposed))}` }, timing: { startMs, endMs }, outputs: { key, expected: existing, actual: proposed } } as NodeResult
      }
      lockStore.set(key, proposed)
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: "config-lock", state: "LOCKED", anchor: `${inp.node.id}:${key}:first` }, timing: { startMs, endMs }, outputs: { key, value: proposed, locked: true } } as NodeResult
    })
}

export const _configLockStore = lockStore
export const _resetConfigLock = (key?: string) => {
  if (key) lockStore.delete(key)
  else lockStore.clear()
}
