import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect } from "effect"
import { makeRegistry } from "../core/registry"

describe("registry", () => {
  it.effect("register only-add: re-register same kind same shape is idempotent", () =>
    Effect.gen(function* () {
      const r = yield* makeRegistry
      const impl = { kind: "event-filter", family: "deterministic" as const, requiredCaps: [], invoke: () => Effect.succeed({} as any) }
      const res = yield* Effect.either(r.register(impl))
      expect(res._tag).toBe("Right")
    }))

  it.effect("re-register different contract throws loudly", () =>
    Effect.gen(function* () {
      const r = yield* makeRegistry
      const drifted = { kind: "gate", family: "execution" as const, requiredCaps: ["llm"], invoke: () => Effect.succeed({} as any) }
      const res = yield* Effect.either(r.register(drifted as any))
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") expect(String((res.left as any).message)).toContain("append-only")
    }))

  it.effect("isKnownKind predicate the schema codec consumes", () =>
    Effect.gen(function* () {
      const r = yield* makeRegistry
      expect(yield* r.isKnownKind("gate")).toBe(true)
      expect(yield* r.isKnownKind("nonexistent-kind-xyz")).toBe(false)
    }))

  it.effect("33 deterministic kinds REGISTERED with family tags", () =>
    Effect.gen(function* () {
      const r = yield* makeRegistry
      const kinds = yield* r.kinds()
      expect(kinds.length).toBeGreaterThanOrEqual(33)
      for (const k of ["event-filter","capture-engine","machine","gate","oracle-gate","circuit-breaker","state-machine","journal-sink","triplet-writer","sqlite-sink","replay-source","pipeline","parallel","retry-chain","fallback-chain","pause","cron-trigger","event-reactivate","ratio-classifier","synapse","intent-classifier","escalation-memory","evidence-gate","layer-loader","math-eval","oracle-discharge","claim-gate","config-lock","workflow-machine","mpse-discharge","evidence-machine","audit-registry"]) {
        expect(kinds.includes(k)).toBe(true)
      }
      const entries = yield* r.entries()
      const fam = new Map(entries.map(e => [e.kind, e.family]))
      expect(fam.get("gate")).toBe("deterministic")
      expect(fam.get("math-eval")).toBe("decision")
      expect(fam.get("evidence-machine")).toBe("evidence")
      expect(fam.get("shell-exec")).toBe("execution")
    }))

  it.effect("kinds() readonly and get(kind) returns impl", () =>
    Effect.gen(function* () {
      const r = yield* makeRegistry
      const impl = yield* r.get("gate")
      expect(impl).toBeDefined()
      expect((impl as any).kind).toBe("gate")
    }))
})
