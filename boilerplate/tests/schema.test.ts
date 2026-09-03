import { describe, it, expect } from "@effect/vitest"
import { Effect } from "effect"
import { decodeDoc, validateDoc } from "../core/schema"

const validDoc = {
  $schema: "trident-workflow-v1" as const,
  meta: { name: "test-workflow", tier: 1 as const },
  nodes: [{ id: "a", type: "gate" }, { id: "b", type: "gate" }],
  edges: [{ from: "a", to: "b", via: "ch1" }],
  vars: { myVar: "hello" }
}

const isKnownGate = (k: string) => k === "gate" || k === "event-filter" || k === "machine"

describe("schema", () => {
  it.effect("valid doc decodes PASS", () =>
    Effect.gen(function* () {
      const doc = yield* decodeDoc(validDoc)
      expect(doc.$schema).toBe("trident-workflow-v1")
      expect(doc.meta.name).toBe("test-workflow")
      expect(doc.nodes.length).toBe(2)
      const v = yield* validateDoc(doc, isKnownGate).pipe(Effect.either)
      expect(v._tag).toBe("Right")
    }))

  it.effect("duplicate node id refused", () =>
    Effect.gen(function* () {
      const raw = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "dup", tier: 1 as const },
        nodes: [{ id: "a", type: "gate" }, { id: "a", type: "gate" }],
        edges: []
      }
      const doc = yield* decodeDoc(raw)
      const res = yield* validateDoc(doc, isKnownGate).pipe(Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL UNKNOWN-NODE]")
        expect(String(err.actual)).toContain("duplicate")
        expect(err.field).toBe("nodes[id]")
      }
    }))

  it.effect("bad $schema refused", () =>
    Effect.gen(function* () {
      const raw = {
        $schema: "bad-schema",
        meta: { name: "bad", tier: 1 as const },
        nodes: [{ id: "a", type: "gate" }],
        edges: []
      }
      const res = yield* decodeDoc(raw as any).pipe(Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL UNKNOWN-NODE]")
        expect(err.field).toBe("$schema")
      }
    }))

  it.effect("unknown kind (predicate=false) emits code '[JESL UNKNOWN-NODE]' exactly", () =>
    Effect.gen(function* () {
      const raw = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "unk", tier: 1 as const },
        nodes: [{ id: "n1", type: "totally-unknown-kind-xyz" }],
        edges: []
      }
      const doc = yield* decodeDoc(raw)
      const res = yield* validateDoc(doc, () => false).pipe(Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL UNKNOWN-NODE]")
        expect(Buffer.from(err.code).toString("hex")).toBe(Buffer.from("[JESL UNKNOWN-NODE]").toString("hex"))
        expect(err.node).toBe("n1")
        expect(err.field).toBe("type")
        expect(err.actual).toBe("totally-unknown-kind-xyz")
      }
    }))

  it.effect("tier violation emits '[JESL TIER-VIOLATION]'", () =>
    Effect.gen(function* () {
      const raw = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "tier-bad", tier: 1 as const },
        nodes: [{ id: "gen1", type: "prompt" }],
        edges: []
      }
      const doc = yield* decodeDoc(raw)
      const res = yield* validateDoc(doc, (k) => k === "prompt").pipe(Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL TIER-VIOLATION]")
        expect(Buffer.from(err.code).toString("hex")).toBe(Buffer.from("[JESL TIER-VIOLATION]").toString("hex"))
        expect(err.node).toBe("gen1")
        expect(err.field).toBe("meta.tier")
      }
    }))

  it.effect("edge missing endpoint refused", () =>
    Effect.gen(function* () {
      const raw = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "edge-bad", tier: 1 as const },
        nodes: [{ id: "a", type: "gate" }],
        edges: [{ from: "a", to: "missing-node", via: "ch1" }]
      }
      const doc = yield* decodeDoc(raw)
      const res = yield* validateDoc(doc, isKnownGate).pipe(Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL UNKNOWN-NODE]")
        expect(err.field).toBe("edges[to]")
        expect(err.actual).toBe("missing-node")
      }
    }))

  it.effect("empty nodes refused", () =>
    Effect.gen(function* () {
      const raw = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "empty", tier: 1 as const },
        nodes: [],
        edges: []
      }
      const res = yield* decodeDoc(raw as any).pipe(Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL UNKNOWN-NODE]")
        expect(err.field).toBe("nodes")
      }
    }))

  it.effect("vars type violation refused", () =>
    Effect.gen(function* () {
      const raw = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "vars-bad", tier: 1 as const },
        nodes: [{ id: "a", type: "gate" }],
        edges: [],
        vars: { good: "hello", bad: 123 as any }
      }
      const res = yield* decodeDoc(raw as any).pipe(Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL UNKNOWN-NODE]")
        expect(err.field).toBe("vars")
      }
    }))

  it.effect("edge from missing endpoint refused", () =>
    Effect.gen(function* () {
      const raw = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "edge-from-bad", tier: 2 as const },
        nodes: [{ id: "a", type: "gate" }],
        edges: [{ from: "ghost", to: "a", via: "ch1" }]
      }
      const doc = yield* decodeDoc(raw)
      const res = yield* validateDoc(doc, isKnownGate).pipe(Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL UNKNOWN-NODE]")
        expect(err.field).toBe("edges[from]")
      }
    }))

  it.effect("valid tier 2 with generation kind passes", () =>
    Effect.gen(function* () {
      const raw = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "tier2-ok", tier: 2 as const },
        nodes: [{ id: "gen1", type: "prompt", class: "generation" as const }],
        edges: []
      }
      const doc = yield* decodeDoc(raw)
      const res = yield* validateDoc(doc, (k) => k === "prompt").pipe(Effect.either)
      expect(res._tag).toBe("Right")
    }))
})
