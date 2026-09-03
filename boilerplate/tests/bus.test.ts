import { describe, it, expect } from "@effect/vitest"
import { Effect, Ref } from "effect"
import { makeBus, globMatch } from "../core/bus"

describe("bus", () => {
  it.effect("glob match hit — tool.call.* matches tool.call.bash", () =>
    Effect.gen(function* () {
      expect(globMatch("tool.call.*", "tool.call.bash")).toBe(true)
      expect(globMatch("pba.*", "pba.family.hit")).toBe(true)
      expect(globMatch("pba.family.*", "pba.family.hit")).toBe(true)
      expect(globMatch("*", "anything.at.all")).toBe(true)
      expect(globMatch("pba.family.hit", "pba.family.hit")).toBe(true)
    }))

  it.effect("glob match miss — tool.call.* does not match tool.other.bash", () =>
    Effect.gen(function* () {
      expect(globMatch("tool.call.*", "tool.other.bash")).toBe(false)
      expect(globMatch("pba.*", "pta.family.hit")).toBe(false)
      expect(globMatch("tool.call.*", "tool.call")).toBe(false)
    }))

  it.effect("handler failure does not break sibling handlers NOR fail the emit", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const events: string[] = []
      yield* bus.subscribe("probe.*", () => Effect.die(new Error("boom")))
      yield* bus.subscribe("probe.*", (e) => Effect.sync(() => events.push(e.type)))
      const exit = yield* Effect.exit(bus.emit("probe.a", { x: 1 }))
      expect(exit._tag).toBe("Success")
      expect(events.length).toBe(1)
      expect(events[0]).toBe("probe.a")
    }))

  it.effect("handler cannot mutate the emitted event", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const original = { a: 1, nested: { b: 2 } }
      const seen: unknown[] = []
      yield* bus.subscribe("mut.*", (e) =>
        Effect.sync(() => {
          const p: any = e.payload
          try { p.a = 999 } catch (_e) { void _e }
          try { p.nested.b = 999 } catch (_e) { void _e }
          try { (e as any).type = "hacked" } catch (_e) { void _e }
        }))
      yield* bus.subscribe("mut.*", (e) => Effect.sync(() => seen.push(JSON.parse(JSON.stringify(e.payload)))))
      yield* bus.emit("mut.test", original)
      expect(seen.length).toBe(1)
      expect(seen[0]).toEqual({ a: 1, nested: { b: 2 } })
      expect(original).toEqual({ a: 1, nested: { b: 2 } })
    }))

  it.effect("detach stops delivery", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const hits: string[] = []
      const unsub = yield* bus.subscribe("detach.*", (e) => Effect.sync(() => hits.push(e.type)))
      yield* bus.emit("detach.a", 1)
      expect(hits.length).toBe(1)
      yield* unsub
      yield* bus.emit("detach.a", 1)
      expect(hits.length).toBe(1)
    }))

  it.effect("1000 emit/subscribe cycles leak-free", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      for (let i = 0; i < 1000; i++) {
        const unsub = yield* bus.subscribe(`leak.${i}.*`, () => Effect.void)
        yield* bus.emit(`leak.${i}.hit`, i)
        yield* unsub
      }
      yield* bus.detachAll()
      const hits: string[] = []
      const unsub = yield* bus.subscribe("leak.*", (e) => Effect.sync(() => hits.push(e.type)))
      yield* bus.detachAll()
      yield* bus.emit("leak.999.hit", 1)
      expect(hits.length).toBe(0)
      yield* unsub.pipe(Effect.catchAll(() => Effect.void))
      const subs = yield* Ref.get(bus._subsRef)
      expect(subs.size).toBe(0)
    }))

  it.effect("pba.family.hit pattern delivery", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const hits: string[] = []
      yield* bus.subscribe("pba.*", (e) => Effect.sync(() => hits.push(e.type)))
      yield* bus.emit("pba.family.hit", { family: "test" })
      expect(hits.length).toBe(1)
      expect(hits[0]).toBe("pba.family.hit")
    }))

  it.effect("pta and lsp patterns via glob", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const ptaHits: string[] = []
      const lspHits: string[] = []
      yield* bus.subscribe("pta.*", (e) => Effect.sync(() => ptaHits.push(e.type)))
      yield* bus.subscribe("lsp.*", (e) => Effect.sync(() => lspHits.push(e.type)))
      yield* bus.emit("pta.intercept", { tool: "bash" })
      yield* bus.emit("lsp.diagnostics", { file: "a.ts" })
      expect(ptaHits).toEqual(["pta.intercept"])
      expect(lspHits).toEqual(["lsp.diagnostics"])
    }))

  it.effect("tool.call.* glob and concurrent handlers", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const hits: string[] = []
      yield* bus.subscribe("tool.call.*", (e) => Effect.sync(() => hits.push(e.type)))
      yield* bus.emit("tool.call.bash", { cmd: "ls" })
      yield* bus.emit("tool.call.python", { cmd: "py" })
      expect(hits).toEqual(["tool.call.bash", "tool.call.python"])
    }))
})
