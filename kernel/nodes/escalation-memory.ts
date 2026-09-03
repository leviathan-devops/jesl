import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import { replaceStubSync } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { computeDeadline, computeSkipTier } from "../wraps/behavior-engine"

const escalationMap = new Map<string, number>()

export function _resetEscalationState(): void {
  escalationMap.clear()
}

export function _getEscalationState(): ReadonlyMap<string, number> {
  return new Map(escalationMap)
}

export const escalationMemoryNode: NodeImpl = {
  kind: "escalation-memory",
  family: "decision",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const startMs = yield* Clock.currentTimeMillis
      try {
        const inp = input as NodeInput
        if (!inp || typeof inp !== "object") {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "escalation-memory.error", state: "FAIL", anchor: "escalation-memory:invalid-input:1" }, timing: { startMs, endMs }, outputs: { error: "invalid input" } } as NodeResult
        }
        const cfg = (inp.node.config ?? {}) as Record<string, unknown>
        const inbound = (inp.inbound ?? {}) as Record<string, unknown>
        const familyRaw = inbound.family ?? inbound.familyId ?? cfg.family ?? cfg.familyId
        if (familyRaw == null || String(familyRaw).trim() === "") {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "escalation-memory.error", state: "FAIL", anchor: `${inp.node.id}:missing-family:1` }, timing: { startMs, endMs }, outputs: {}, error: "family required" } as NodeResult
        }
        const family = String(familyRaw)
        const prevCount = escalationMap.get(family) ?? 0
        let deadlineWindow: number
        let skipTier: number
        try {
          deadlineWindow = computeDeadline(prevCount)
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          throw new Error(`computeDeadline failed for count ${prevCount}: ${msg}`)
        }
        try {
          skipTier = computeSkipTier(prevCount)
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          throw new Error(`computeSkipTier failed for count ${prevCount}: ${msg}`)
        }
        const nextCount = prevCount + 1
        escalationMap.set(family, nextCount)
        let nextDeadline: number
        let nextSkip: number
        try {
          nextDeadline = computeDeadline(nextCount)
          nextSkip = computeSkipTier(nextCount)
        } catch {
          nextDeadline = deadlineWindow
          nextSkip = skipTier
        }
        const endMs = yield* Clock.currentTimeMillis
        return {
          verdict: "PASS" as const,
          evidence: { pattern: "escalation-memory.track", state: `COUNT_${nextCount}`, anchor: `${inp.node.id}:${family}:${nextCount}:${deadlineWindow}:${skipTier}:1` },
          timing: { startMs, endMs },
          outputs: { family, escalationCount: nextCount, prevCount, deadlineWindow, skipTier, nextDeadlineWindow: nextDeadline, nextSkipTier: nextSkip },
        } as NodeResult
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e)
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "escalation-memory.error", state: "FAIL", anchor: `escalation-memory:error:1` }, timing: { startMs, endMs }, outputs: {}, error: errMsg } as NodeResult
      }
    }),
}

try {
  replaceStubSync("escalation-memory", escalationMemoryNode)
} catch (e) {
  const _m = e instanceof Error ? e.message : String(e)
  void _m
}
