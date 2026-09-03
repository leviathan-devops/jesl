import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

type CbState = "CLOSED" | "OPEN" | "HALF_OPEN"
interface CbEntry { failures: number; state: CbState; openedAt: number }

const store = new Map<string, CbEntry>()

export const circuitBreakerNode: NodeImpl = {
  kind: "circuit-breaker",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { key?: string; cooldownMs?: number; threshold?: number; failure?: boolean }
      const key = cfg.key ?? inp.node.id
      const cooldownMs = cfg.cooldownMs ?? 5000
      const threshold = cfg.threshold ?? 3
      const startMs = yield* Clock.currentTimeMillis
      let entry = store.get(key)
      if (!entry) {
        entry = { failures: 0, state: "CLOSED", openedAt: 0 }
        store.set(key, entry)
      }
      if (entry.state === "OPEN") {
        const now = startMs
        const elapsed = now - entry.openedAt
        if (elapsed >= cooldownMs) {
          entry = { failures: entry.failures, state: "HALF_OPEN", openedAt: entry.openedAt }
          store.set(key, entry)
        } else {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "circuit-breaker", state: "OPEN", anchor: `${inp.node.id}:OPEN:${entry.failures}` }, timing: { startMs, endMs } } as NodeResult
        }
      }
      let isFailure: boolean
      if (typeof cfg.failure === "boolean") isFailure = cfg.failure
      else {
        const inbound = inp.inbound as Record<string, unknown>
        if ("failure" in inbound) isFailure = inbound["failure"] === true
        else if ("success" in inbound) isFailure = inbound["success"] === false
        else if ("error" in inbound) isFailure = inbound["error"] !== undefined && inbound["error"] !== null
        else if ("ok" in inbound) isFailure = inbound["ok"] === false
        else isFailure = false
      }
      if (isFailure) {
        const nextFailures = entry.failures + 1
        if (nextFailures >= threshold) {
          const openedAt = yield* Clock.currentTimeMillis
          store.set(key, { failures: nextFailures, state: "OPEN", openedAt })
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "circuit-breaker", state: "OPEN", anchor: `${inp.node.id}:trip:${nextFailures}` }, timing: { startMs, endMs } } as NodeResult
        }
        store.set(key, { ...entry, failures: nextFailures })
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "circuit-breaker", state: entry.state, anchor: `${inp.node.id}:fail:${nextFailures}` }, timing: { startMs, endMs } } as NodeResult
      }
      if (entry.state === "HALF_OPEN") {
        store.set(key, { failures: 0, state: "CLOSED", openedAt: 0 })
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "PASS" as const, evidence: { pattern: "circuit-breaker", state: "CLOSED", anchor: `${inp.node.id}:HALF_OPEN->CLOSED` }, timing: { startMs, endMs }, outputs: { state: "CLOSED", failures: 0 } } as NodeResult
      }
      if (entry.failures !== 0) store.set(key, { ...entry, failures: 0 })
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: "circuit-breaker", state: "CLOSED", anchor: `${inp.node.id}:CLOSED` }, timing: { startMs, endMs }, outputs: { state: "CLOSED", failures: 0 } } as NodeResult
    })
}

export const _circuitStore = store
export const _resetCircuit = (key?: string) => {
  if (key) store.delete(key)
  else store.clear()
}
