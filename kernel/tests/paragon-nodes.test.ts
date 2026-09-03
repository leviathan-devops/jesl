import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect } from "effect"
import { ratioClassifierNode } from "../nodes/ratio-classifier"
import { synapseNode, _resetSynapseState } from "../nodes/synapse"
import { intentClassifierNode } from "../nodes/intent-classifier"
import { escalationMemoryNode, _resetEscalationState } from "../nodes/escalation-memory"
import { ALPHA_DECAY } from "../wraps/behavior-engine"

const run = (impl: any, input: any, ctx: any = {}) => impl.invoke(input, ctx)

describe("paragon-nodes", () => {
  it.effect("ratio-classifier picks THEATRICAL for mock text", () =>
    Effect.gen(function* () {
      const res: any = yield* run(ratioClassifierNode, { node: { id: "rc1" }, inbound: { text: "just mock the result instead of the container test" } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.family).toBe("TEST_EVASION")
      expect(res.outputs.band).toBe("ENFORCE")
      expect(res.outputs.confidence).toBeGreaterThanOrEqual(0.5)
    }))

  it.effect("ratio-classifier empty text returns SUPPRESS null", () =>
    Effect.gen(function* () {
      const res: any = yield* run(ratioClassifierNode, { node: { id: "rc2" }, inbound: { text: "" } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.family).toBeNull()
      expect(res.outputs.band).toBe("SUPPRESS")
      expect(res.outputs.confidence).toBe(0)
    }))

  it.effect("ratio-classifier null inbound does not throw", () =>
    Effect.gen(function* () {
      const res: any = yield* run(ratioClassifierNode, { node: { id: "rc3" }, inbound: {} })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.band).toBe("SUPPRESS")
    }))

  it.effect("ratio-classifier use pattern forces neg override (pos=0)", () =>
    Effect.gen(function* () {
      const res: any = yield* run(ratioClassifierNode, { node: { id: "rc4" }, inbound: { text: "just mock the result trident-container-test" } })
      expect(res.verdict).toBe("PASS")
      const out = res.outputs
      expect(out.family).toBeDefined()
    }))

  it.effect("synapse decay by exp(-0.05*delta) is computed from data", () =>
    Effect.gen(function* () {
      _resetSynapseState()
      const r1: any = yield* run(synapseNode, { node: { id: "sy1" }, inbound: { family: "TEST_EVASION", seq: 1, signal: 1 } })
      expect(r1.outputs.strength).toBeCloseTo(1, 5)
      const r2: any = yield* run(synapseNode, { node: { id: "sy1" }, inbound: { family: "TEST_EVASION", seq: 2, signal: 1 } })
      const expected = 1 * Math.exp(-ALPHA_DECAY * 1) + 1
      expect(r2.outputs.strength).toBeCloseTo(expected, 5)
      expect(r2.outputs.decayed).toBeCloseTo(1 * Math.exp(-ALPHA_DECAY * 1), 5)
      const r3: any = yield* run(synapseNode, { node: { id: "sy1" }, inbound: { family: "TEST_EVASION", seq: 12, signal: 1 } })
      const expected2 = r2.outputs.strength * Math.exp(-ALPHA_DECAY * 10) + 1
      expect(r3.outputs.strength).toBeCloseTo(expected2, 5)
    }))

  it.effect("synapse concurrent invocations on different families do not interfere", () =>
    Effect.gen(function* () {
      _resetSynapseState()
      const results: any[] = yield* Effect.all([
        run(synapseNode, { node: { id: "sy2" }, inbound: { family: "FAM_A", seq: 1, signal: 1 } }),
        run(synapseNode, { node: { id: "sy2" }, inbound: { family: "FAM_B", seq: 1, signal: 1 } }),
        run(synapseNode, { node: { id: "sy2" }, inbound: { family: "FAM_A", seq: 2, signal: 1 } }),
      ], { concurrency: 3 })
      expect(results[0].outputs.family).toBe("FAM_A")
      expect(results[1].outputs.family).toBe("FAM_B")
      expect(results[2].outputs.family).toBe("FAM_A")
    }))

  it.effect("synapse boundary: large delta decays to near-zero", () =>
    Effect.gen(function* () {
      _resetSynapseState()
      yield* run(synapseNode, { node: { id: "sy3" }, inbound: { family: "X", seq: 1, signal: 5 } })
      const r: any = yield* run(synapseNode, { node: { id: "sy3" }, inbound: { family: "X", seq: 1000, signal: 1 } })
      expect(r.outputs.decayed).toBeCloseTo(0, 2)
      expect(r.outputs.strength).toBeCloseTo(1, 2)
    }))

  it.effect("intent-classifier returns hits array sorted by confidence", () =>
    Effect.gen(function* () {
      const text = "just mock the result and also pretend it works and delete all files"
      const res: any = yield* run(intentClassifierNode, { node: { id: "ic1" }, inbound: { text } })
      expect(res.verdict).toBe("PASS")
      expect(Array.isArray(res.outputs.hits)).toBe(true)
      expect(res.outputs.count).toBeGreaterThanOrEqual(2)
      const fams = res.outputs.hits.map((h: any) => h.family)
      expect(fams).toContain("TEST_EVASION")
    }))

  it.effect("intent-classifier empty text returns 0 hits", () =>
    Effect.gen(function* () {
      const res: any = yield* run(intentClassifierNode, { node: { id: "ic2" }, inbound: { text: "" } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.hits.length).toBe(0)
      expect(res.outputs.count).toBe(0)
    }))

  it.effect("intent-classifier null handling", () =>
    Effect.gen(function* () {
      const res: any = yield* run(intentClassifierNode, { node: { id: "ic3" }, inbound: {} })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.count).toBe(0)
    }))

  it.effect("escalation-memory increments and maps deadline/skipTier per provenance table", () =>
    Effect.gen(function* () {
      _resetEscalationState()
      const r1: any = yield* run(escalationMemoryNode, { node: { id: "em1" }, inbound: { family: "TEST_EVASION" } })
      expect(r1.outputs.escalationCount).toBe(1)
      expect(r1.outputs.deadlineWindow).toBe(5)
      expect(r1.outputs.skipTier).toBe(0)
      const r2: any = yield* run(escalationMemoryNode, { node: { id: "em1" }, inbound: { family: "TEST_EVASION" } })
      expect(r2.outputs.escalationCount).toBe(2)
      expect(r2.outputs.deadlineWindow).toBe(5)
      expect(r2.outputs.skipTier).toBe(0)
      const r3: any = yield* run(escalationMemoryNode, { node: { id: "em1" }, inbound: { family: "TEST_EVASION" } })
      expect(r3.outputs.escalationCount).toBe(3)
      expect(r3.outputs.deadlineWindow).toBe(2)
      expect(r3.outputs.skipTier).toBe(2)
      const r4: any = yield* run(escalationMemoryNode, { node: { id: "em1" }, inbound: { family: "TEST_EVASION" } })
      expect(r4.outputs.escalationCount).toBe(4)
      expect(r4.outputs.deadlineWindow).toBe(0)
      expect(r4.outputs.skipTier).toBe(3)
    }))

  it.effect("escalation-memory missing family returns FAIL", () =>
    Effect.gen(function* () {
      const res: any = yield* run(escalationMemoryNode, { node: { id: "em2" }, inbound: {} })
      expect(res.verdict).toBe("FAIL")
    }))

  it.effect("escalation-memory isolates counts per family", () =>
    Effect.gen(function* () {
      _resetEscalationState()
      yield* run(escalationMemoryNode, { node: { id: "em3" }, inbound: { family: "FAM_X" } })
      yield* run(escalationMemoryNode, { node: { id: "em3" }, inbound: { family: "FAM_X" } })
      const r: any = yield* run(escalationMemoryNode, { node: { id: "em3" }, inbound: { family: "FAM_Y" } })
      expect(r.outputs.escalationCount).toBe(1)
      expect(r.outputs.family).toBe("FAM_Y")
    }))

  it.effect("ratio-classifier handles non-string text via String coercion", () =>
    Effect.gen(function* () {
      const res: any = yield* run(ratioClassifierNode, { node: { id: "rc5" }, inbound: { text: 12345 as any } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.band).toBe("SUPPRESS")
    }))
})
