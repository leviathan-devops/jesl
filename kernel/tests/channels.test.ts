import { describe, it, expect } from "@effect/vitest"
import { Effect, Fiber } from "effect"
import { makeChannels } from "../core/channels"

describe("channels", () => {
  it.effect("NO-SEED on declared entry channel without seed", () =>
    Effect.gen(function* () {
      const ch = yield* makeChannels
      yield* ch.declareEntry(["entryCh"])
      const res = yield* Effect.either(ch.seedFrom({}))
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL NO-SEED]")
        expect(String(err.node)).toBe("entryCh")
      }
    }))

  it.effect("CHANNEL-UNSET on read-before-write with node id in error", () =>
    Effect.gen(function* () {
      const ch = yield* makeChannels
      const res = yield* Effect.either(ch.read("missing", "NodeX"))
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL CHANNEL-UNSET]")
        expect(err.node).toBe("NodeX")
        expect(err.field).toBe("missing")
      }
    }))

  it.effect("write-then-read roundtrip", () =>
    Effect.gen(function* () {
      const ch = yield* makeChannels
      yield* ch.write("ch1", { v: 42 })
      const v = yield* ch.read("ch1", "n1")
      expect(v).toEqual({ v: 42 })
    }))

  it.effect("write wakes waiting read via Deferred", () =>
    Effect.gen(function* () {
      const ch = yield* makeChannels
      const fiber = yield* Effect.fork(ch.awaitWritten(new Set(["ch1"])))
      yield* Effect.yieldNow()
      yield* ch.write("ch1", 99)
      const done = yield* Fiber.join(fiber)
      expect(done).toBeUndefined()
      const v = yield* ch.read("ch1", "n1")
      expect(v).toBe(99)
    }))

  it.effect("snapshot immutability — mutating copy does not affect store", () =>
    Effect.gen(function* () {
      const ch = yield* makeChannels
      yield* ch.write("ch1", { a: 1 })
      const snap = yield* ch.snapshot()
      const rec: any = snap.entries()
      rec["ch1"] = { a: 999 }
      rec["evil"] = 123
      const v = yield* ch.read("ch1", "n1")
      expect(v).toEqual({ a: 1 })
      const snap2 = yield* ch.snapshot()
      expect(snap2.isWritten("evil")).toBe(false)
    }))

  it.effect("observer law — write deep-copies value", () =>
    Effect.gen(function* () {
      const ch = yield* makeChannels
      const obj: any = { x: 1 }
      yield* ch.write("ch1", obj)
      obj.x = 999
      const v: any = yield* ch.read("ch1", "n1")
      expect(v.x).toBe(1)
    }))

  it.effect("seedFrom wakes awaiters", () =>
    Effect.gen(function* () {
      const ch = yield* makeChannels
      const fiber = yield* Effect.fork(ch.awaitWritten(new Set(["seedCh"])))
      yield* Effect.yieldNow()
      yield* ch.seedFrom({ seedCh: "hello" })
      yield* Fiber.join(fiber)
      const v = yield* ch.read("seedCh", "n1")
      expect(v).toBe("hello")
    }))
})
