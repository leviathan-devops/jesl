import { Effect, Clock } from "effect"
import type { JournalRow } from "../core/journal"

export interface Triplet { pattern: string; state: string; anchor: string }
export interface NodeResult {
  readonly verdict: "PASS" | "FAIL" | "INCONCLUSIVE" | "READY_FALSE"
  readonly outputs?: Record<string, unknown>
  readonly error?: unknown
  readonly evidence: Triplet
  readonly timing: { startMs: number; endMs: number }
}
export interface NodeInput {
  readonly node: { id: string; type: string; config?: Record<string, unknown> }
  readonly inbound: Record<string, unknown>
}
export const nowTiming = Effect.gen(function* () {
  const t = yield* Clock.currentTimeMillis
  return { startMs: t, endMs: t }
})
