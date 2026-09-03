import { describe, it, expect } from "@effect/vitest"
import { Effect, Layer, Exit } from "effect"
import { Shell, Fs, Http, ToolClient, Subagent, Llm, Journal, Clock, InMemoryLive, TestLive, CliLive, ShellLive, LlmLive, requireCaps } from "../core/caps"

describe("caps", () => {
  it.effect("all-bound requireCaps passes", () =>
    Effect.gen(function* () {
      const res = yield* requireCaps([Shell, Fs], "nodeA").pipe(
        Effect.provide(InMemoryLive),
        Effect.either
      )
      expect(res._tag).toBe("Right")
    }))

  it.effect("missing cap emits code [JESL CAP-UNBOUND] with cap+node fields", () =>
    Effect.gen(function* () {
      const res = yield* requireCaps([Llm], "nodeX").pipe(
        Effect.provide(Layer.empty),
        Effect.either
      )
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL CAP-UNBOUND]")
        expect(String(err.cap)).toContain("llm")
        expect(err.node).toBe("nodeX")
        expect(err.field).toBe("caps")
      }
    }))

  it.effect("missing first cap in list names that cap", () =>
    Effect.gen(function* () {
      const res = yield* requireCaps([Shell, Llm, Fs], "nodeY").pipe(
        Effect.provide(ShellLive),
        Effect.either
      )
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL CAP-UNBOUND]")
        expect(String(err.cap)).toContain("llm")
        expect(err.node).toBe("nodeY")
      }
    }))

  it.effect("Layer provide makes requireCaps pass", () =>
    Effect.gen(function* () {
      const without = yield* requireCaps([Llm], "nodeZ").pipe(Effect.provide(Layer.empty), Effect.either)
      expect(without._tag).toBe("Left")
      const withLayer = yield* requireCaps([Llm], "nodeZ").pipe(Effect.provide(LlmLive), Effect.either)
      expect(withLayer._tag).toBe("Right")
    }))

  it.effect("InMemory test Layer provides every Tag", () =>
    Effect.gen(function* () {
      const allTags = [Shell, Fs, Http, ToolClient, Subagent, Llm, Journal, Clock] as const
      const res = yield* requireCaps([...allTags], "nodeAll").pipe(Effect.provide(InMemoryLive), Effect.either)
      expect(res._tag).toBe("Right")
      const testLiveRes = yield* requireCaps([...allTags], "nodeAll2").pipe(Effect.provide(TestLive), Effect.either)
      expect(testLiveRes._tag).toBe("Right")
    }))

  it.effect("CliLive provides Shell Fs Http Journal but not Llm", () =>
    Effect.gen(function* () {
      const cliOk = yield* requireCaps([Shell, Fs, Http, Journal], "cliNode").pipe(Effect.provide(CliLive), Effect.either)
      expect(cliOk._tag).toBe("Right")
      const cliMissing = yield* requireCaps([Llm], "cliNode2").pipe(Effect.provide(CliLive), Effect.either)
      expect(cliMissing._tag).toBe("Left")
      if (cliMissing._tag === "Left") expect((cliMissing.left as any).code).toBe("[JESL CAP-UNBOUND]")
    }))

  it.effect("unbound node produces NO output artifact — effect fails not succeeds-with-empty", () =>
    Effect.gen(function* () {
      const program = Effect.gen(function* () {
        yield* requireCaps([Llm], "unboundNode")
        return { outputs: { result: "should-not-exist" } }
      })
      const exit = yield* Effect.exit(program.pipe(Effect.provide(Layer.empty)))
      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        expect(Exit.isSuccess(exit)).toBe(false)
      }
      const successExit = yield* Effect.exit(program.pipe(Effect.provide(InMemoryLive)))
      expect(Exit.isSuccess(successExit)).toBe(true)
      if (Exit.isSuccess(successExit)) {
        expect((successExit.value as any).outputs.result).toBe("should-not-exist")
      }
    }))

  it.effect("TestLive escape hatch — the DPL1 InMemory composition", () =>
    Effect.gen(function* () {
      const res = yield* requireCaps([Shell, Fs, Http, ToolClient, Subagent, Llm], "escNode").pipe(
        Effect.provide(TestLive),
        Effect.either
      )
      expect(res._tag).toBe("Right")
    }))
})
