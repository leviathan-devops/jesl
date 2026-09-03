import { describe, it, expect } from "@effect/vitest"
import { Effect } from "effect"
import { buildGraph } from "../core/graph"
import type { WorkflowDoc } from "../core/schema"

const docDiamond = (nodes: Array<{ id: string; type: string }>, edges: Array<{ from: string; to: string; via: string }>): WorkflowDoc => ({
  $schema: "trident-workflow-v1" as const,
  meta: { name: "diamond", tier: 1 as const },
  nodes: nodes as any,
  edges: edges as any
})

describe("graph", () => {
  it.effect("diamond resolves exactly 2 batches and middle batch is {B,C}", () =>
    Effect.gen(function* () {
      const doc = docDiamond(
        [{ id: "A", type: "x" }, { id: "B", type: "x" }, { id: "C", type: "x" }],
        [{ from: "A", to: "B", via: "ch1" }, { from: "A", to: "C", via: "ch1" }]
      )
      const g = yield* buildGraph(doc)
      const batches = g.parallelBatches()
      expect(batches.length).toBe(2)
      const middle = batches[1]!
      expect(new Set(middle)).toEqual(new Set(["B", "C"]))
    }))

  it.effect("direct cycle A->B->A emits [JESL CYCLE]", () =>
    Effect.gen(function* () {
      const doc = docDiamond(
        [{ id: "A", type: "x" }, { id: "B", type: "x" }],
        [{ from: "A", to: "B", via: "c1" }, { from: "B", to: "A", via: "c2" }]
      )
      const res = yield* Effect.either(buildGraph(doc))
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL CYCLE]")
        expect(String(err.actual)).toContain("→")
      }
    }))

  it.effect("self-cycle emits [JESL CYCLE]", () =>
    Effect.gen(function* () {
      const doc = docDiamond(
        [{ id: "A", type: "x" }],
        [{ from: "A", to: "A", via: "c1" }]
      )
      const res = yield* Effect.either(buildGraph(doc))
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL CYCLE]")
      }
    }))

  it.effect("edge to unknown endpoint fails", () =>
    Effect.gen(function* () {
      const doc = docDiamond(
        [{ id: "A", type: "x" }],
        [{ from: "A", to: "UNKNOWN", via: "c1" }]
      )
      const res = yield* Effect.either(buildGraph(doc))
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL UNKNOWN-NODE]")
      }
    }))

  it.effect("4-node chain yields 4 batches", () =>
    Effect.gen(function* () {
      const doc = docDiamond(
        [{ id: "A", type: "x" }, { id: "B", type: "x" }, { id: "C", type: "x" }, { id: "D", type: "x" }],
        [{ from: "A", to: "B", via: "c1" }, { from: "B", to: "C", via: "c2" }, { from: "C", to: "D", via: "c3" }]
      )
      const g = yield* buildGraph(doc)
      const batches = g.parallelBatches()
      expect(batches.length).toBe(4)
      expect(batches[0]).toEqual(["A"])
      expect(batches[3]).toEqual(["D"])
    }))

  it.effect("15+ independent nodes capped at 15 per batch", () =>
    Effect.gen(function* () {
      const nodes = Array.from({ length: 16 }, (_, i) => ({ id: `N${i}`, type: "x" }))
      const doc = docDiamond(nodes, [])
      const g = yield* buildGraph(doc)
      const batches = g.parallelBatches()
      expect(batches.length).toBe(2)
      expect(batches[0]!.length).toBe(15)
      expect(batches[1]!.length).toBe(1)
    }))

  it.effect("4-node diamond A->B,A->C,B->D,C->D yields 3 Kahn levels", () =>
    Effect.gen(function* () {
      const doc = docDiamond(
        [{ id: "A", type: "x" }, { id: "B", type: "x" }, { id: "C", type: "x" }, { id: "D", type: "x" }],
        [{ from: "A", to: "B", via: "ch1" }, { from: "A", to: "C", via: "ch1" }, { from: "B", to: "D", via: "ch3" }, { from: "C", to: "D", via: "ch4" }]
      )
      const g = yield* buildGraph(doc)
      const batches = g.parallelBatches()
      expect(batches.length).toBe(3)
      expect(batches[0]).toEqual(["A"])
      expect(new Set(batches[1]!)).toEqual(new Set(["B", "C"]))
      expect(batches[2]).toEqual(["D"])
    }))
})
