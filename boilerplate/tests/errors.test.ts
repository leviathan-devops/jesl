import { describe, it, expect } from "@effect/vitest"
import { Effect } from "effect"
import {
  JeslUnknownNode,
  JeslCycle,
  JeslTierViolation,
  JeslUnbracketedGeneration,
  JeslCapUnbound,
  JeslOracleMissing,
  JeslChannelUnset,
  JeslNoSeed,
  JESL_TOKENS,
  type JeslError
} from "../core/errors"

describe("errors", () => {
  it.effect("JeslUnknownNode code byte-exact", () =>
    Effect.gen(function* () {
      const e = new JeslUnknownNode({ code: "[JESL UNKNOWN-NODE]", node: "n1", field: "type", expected: "a", actual: "b", remedy: "fix" } as any)
      expect(e.code).toBe("[JESL UNKNOWN-NODE]")
      expect(Buffer.from(e.code).toString("hex")).toBe(Buffer.from("[JESL UNKNOWN-NODE]").toString("hex"))
    }))

  it.effect("JeslCycle code byte-exact", () =>
    Effect.gen(function* () {
      const e = new JeslCycle({ code: "[JESL CYCLE]", node: "n1", field: "edges", expected: "acyclic", actual: "cycle", remedy: "break" } as any)
      expect(e.code).toBe("[JESL CYCLE]")
      expect(Buffer.from(e.code).toString("hex")).toBe(Buffer.from("[JESL CYCLE]").toString("hex"))
    }))

  it.effect("JeslTierViolation code byte-exact", () =>
    Effect.gen(function* () {
      const e = new JeslTierViolation({ code: "[JESL TIER-VIOLATION]", node: "n1", field: "meta.tier", expected: "tier2", actual: "tier1", remedy: "raise" } as any)
      expect(e.code).toBe("[JESL TIER-VIOLATION]")
      expect(Buffer.from(e.code).toString("hex")).toBe(Buffer.from("[JESL TIER-VIOLATION]").toString("hex"))
    }))

  it.effect("JeslUnbracketedGeneration code byte-exact", () =>
    Effect.gen(function* () {
      const e = new JeslUnbracketedGeneration({ code: "[JESL UNBRACKETED-GENERATION]", node: "n1", field: "bracket", expected: "contract", actual: "absent", remedy: "declare" } as any)
      expect(e.code).toBe("[JESL UNBRACKETED-GENERATION]")
      expect(Buffer.from(e.code).toString("hex")).toBe(Buffer.from("[JESL UNBRACKETED-GENERATION]").toString("hex"))
    }))

  it.effect("JeslCapUnbound code byte-exact", () =>
    Effect.gen(function* () {
      const e = new JeslCapUnbound({ code: "[JESL CAP-UNBOUND]", node: "n1", field: "caps", expected: "llm", actual: "llm", remedy: "bind" } as any)
      expect(e.code).toBe("[JESL CAP-UNBOUND]")
      expect(Buffer.from(e.code).toString("hex")).toBe(Buffer.from("[JESL CAP-UNBOUND]").toString("hex"))
    }))

  it.effect("JeslOracleMissing code byte-exact", () =>
    Effect.gen(function* () {
      const e = new JeslOracleMissing({ code: "[JESL ORACLE-MISSING]", node: "n1", field: "oracle", expected: "row", actual: "absent", remedy: "compile" } as any)
      expect(e.code).toBe("[JESL ORACLE-MISSING]")
      expect(Buffer.from(e.code).toString("hex")).toBe(Buffer.from("[JESL ORACLE-MISSING]").toString("hex"))
    }))

  it.effect("JeslChannelUnset code byte-exact", () =>
    Effect.gen(function* () {
      const e = new JeslChannelUnset({ code: "[JESL CHANNEL-UNSET]", node: "n1", field: "ch1", expected: "written", actual: "unset", remedy: "seed" } as any)
      expect(e.code).toBe("[JESL CHANNEL-UNSET]")
      expect(Buffer.from(e.code).toString("hex")).toBe(Buffer.from("[JESL CHANNEL-UNSET]").toString("hex"))
    }))

  it.effect("JeslNoSeed code byte-exact", () =>
    Effect.gen(function* () {
      const e = new JeslNoSeed({ code: "[JESL NO-SEED]", node: "n1", field: "vars", expected: "seed", actual: "unset", remedy: "seed" } as any)
      expect(e.code).toBe("[JESL NO-SEED]")
      expect(Buffer.from(e.code).toString("hex")).toBe(Buffer.from("[JESL NO-SEED]").toString("hex"))
    }))

  it.effect("JeslError union assigns all 8", () =>
    Effect.gen(function* () {
      const list: JeslError[] = [
        new JeslUnknownNode({ code: "[JESL UNKNOWN-NODE]", node: "n", field: "f", expected: "e", actual: "a", remedy: "r" } as any),
        new JeslCycle({ code: "[JESL CYCLE]", node: "n", field: "f", expected: "e", actual: "a", remedy: "r" } as any),
        new JeslTierViolation({ code: "[JESL TIER-VIOLATION]", node: "n", field: "f", expected: "e", actual: "a", remedy: "r" } as any),
        new JeslUnbracketedGeneration({ code: "[JESL UNBRACKETED-GENERATION]", node: "n", field: "f", expected: "e", actual: "a", remedy: "r" } as any),
        new JeslCapUnbound({ code: "[JESL CAP-UNBOUND]", node: "n", field: "f", expected: "e", actual: "a", remedy: "r" } as any),
        new JeslOracleMissing({ code: "[JESL ORACLE-MISSING]", node: "n", field: "f", expected: "e", actual: "a", remedy: "r" } as any),
        new JeslChannelUnset({ code: "[JESL CHANNEL-UNSET]", node: "n", field: "f", expected: "e", actual: "a", remedy: "r" } as any),
        new JeslNoSeed({ code: "[JESL NO-SEED]", node: "n", field: "f", expected: "e", actual: "a", remedy: "r" } as any)
      ]
      expect(list.length).toBe(8)
      expect(list.every((e) => typeof (e as any).code === "string")).toBe(true)
    }))

  it.effect("JESL_TOKENS values byte-exact single source", () =>
    Effect.gen(function* () {
      expect(JESL_TOKENS.UNKNOWN_NODE).toBe("[JESL UNKNOWN-NODE]")
      expect(JESL_TOKENS.CYCLE).toBe("[JESL CYCLE]")
      expect(JESL_TOKENS.TIER_VIOLATION).toBe("[JESL TIER-VIOLATION]")
      expect(JESL_TOKENS.UNBRACKETED_GENERATION).toBe("[JESL UNBRACKETED-GENERATION]")
      expect(JESL_TOKENS.CAP_UNBOUND).toBe("[JESL CAP-UNBOUND]")
      expect(JESL_TOKENS.ORACLE_MISSING).toBe("[JESL ORACLE-MISSING]")
      expect(JESL_TOKENS.CHANNEL_UNSET).toBe("[JESL CHANNEL-UNSET]")
      expect(JESL_TOKENS.NO_SEED).toBe("[JESL NO-SEED]")
      for (const v of Object.values(JESL_TOKENS)) {
        expect(Buffer.from(v).toString()).toBe(v)
      }
    }))

  it.effect("each error is Schema.TaggedError instance with _tag", () =>
    Effect.gen(function* () {
      const e = new JeslChannelUnset({ code: "[JESL CHANNEL-UNSET]", node: "n1", field: "ch", expected: "written", actual: "unset", remedy: "seed" } as any)
      expect((e as any)._tag).toBe("JeslChannelUnset")
      expect(e instanceof JeslChannelUnset).toBe(true)
    }))
})
