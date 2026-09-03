import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

const lastFire = new Map<string, number>()

export const cronTriggerNode: NodeImpl = {
  kind: "cron-trigger",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { everyMs?: number; key?: string }
      const everyMs = cfg.everyMs
      const key = cfg.key ?? inp.node.id
      const startMs = yield* Clock.currentTimeMillis
      if (everyMs === undefined || everyMs === null) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "READY_FALSE" as const, evidence: { pattern: "cron-trigger", state: "NO_SCHEDULE", anchor: `${inp.node.id}:no-everyMs` }, timing: { startMs, endMs } } as NodeResult
      }
      if (typeof everyMs !== "number" || !Number.isFinite(everyMs) || everyMs <= 0) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "cron-trigger", state: "INVALID", anchor: `${inp.node.id}:invalid:${String(everyMs)}` }, timing: { startMs, endMs } } as NodeResult
      }
      const last = lastFire.get(key)
      const now = startMs
      if (last === undefined) {
        lastFire.set(key, now)
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "PASS" as const, evidence: { pattern: "cron-trigger", state: "FIRED", anchor: `${inp.node.id}:first:${now}` }, timing: { startMs, endMs }, outputs: { firedAt: now, elapsed: 0 } } as NodeResult
      }
      const elapsed = now - last
      if (elapsed >= everyMs) {
        lastFire.set(key, now)
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "PASS" as const, evidence: { pattern: "cron-trigger", state: "FIRED", anchor: `${inp.node.id}:tick:${elapsed}` }, timing: { startMs, endMs }, outputs: { firedAt: now, elapsed } } as NodeResult
      }
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "INCONCLUSIVE" as const, evidence: { pattern: "cron-trigger", state: "WAIT", anchor: `${inp.node.id}:wait:${elapsed}/${everyMs}` }, timing: { startMs, endMs }, outputs: { elapsed, remaining: everyMs - elapsed } } as NodeResult
    })
}

export const _cronStore = lastFire
export const _resetCron = (key?: string) => {
  if (key) lastFire.delete(key)
  else lastFire.clear()
}
