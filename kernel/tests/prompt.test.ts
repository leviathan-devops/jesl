import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect, Layer, Context } from "effect"
import { promptNode } from "../nodes/prompt"
import { Llm } from "../core/caps"
import { Journal, makeJournal } from "../core/journal"

const makeStubLlm = (responses: Array<{ text: string; confidence?: number; model?: string } | Error>, counter?: { count: number }) => {
  let idx = 0
  return Layer.succeed(Llm, {
    callModel: (req: any) => {
      if (counter) counter.count++
      const r = responses[idx] ?? responses[responses.length - 1]
      idx++
      if (r instanceof Error) return Effect.fail(r)
      return Effect.succeed(r)
    }
  } as any)
}

const runNode = (impl: any, input: any, ctx: any = {}) => impl.invoke(input, ctx)

describe("prompt node — F16", () => {
  it.effect("template mode fills template with no Llm bound (deterministic PASS)", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(promptNode, { node: { id: "p1", config: { mode: "template", template: "Hello ${name}!" } }, inbound: { name: "world" } }, {})
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.output).toBe("Hello world!")
    }))

  it.effect("llm mode with stubbed Llm returning valid output -> PASS with outputs.output + confidence", () =>
    Effect.gen(function* () {
      const layer = makeStubLlm([{ text: "hello llm", confidence: 0.9, model: "test-model" }])
      const res: any = yield* runNode(promptNode, { node: { id: "p2", config: { mode: "llm", prompt: "say hi", maxTokens: 100, bracket: { contract: "hello" } } }, inbound: {} }, { runId: "run-1", doc: { meta: { name: "wf" } } }).pipe(Effect.provide(layer))
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.output).toBe("hello llm")
      expect(res.outputs.confidence).toBe(0.9)
    }))

  it.effect("bracket contract satisfied on first try -> 1 invoke no repairs", () =>
    Effect.gen(function* () {
      const counter = { count: 0 }
      const layer = makeStubLlm([{ text: "VALID_OUTPUT", confidence: 0.9 }], counter)
      const res: any = yield* runNode(promptNode, { node: { id: "p3", config: { mode: "llm", prompt: "do", bracket: { contract: "VALID_OUTPUT" } } }, inbound: {} }, { runId: "run-b1", doc: { meta: { name: "wf" } } }).pipe(Effect.provide(layer))
      expect(res.verdict).toBe("PASS")
      expect(counter.count).toBe(1)
    }))

  it.effect("contract violation then repaired response -> exactly 2 invokes (repair <=2 proven)", () =>
    Effect.gen(function* () {
      const counter = { count: 0 }
      const layer = makeStubLlm([{ text: "WRONG", confidence: 0.9 }, { text: "EXPECTED_VALID", confidence: 0.9 }], counter)
      const res: any = yield* runNode(promptNode, { node: { id: "p4", config: { mode: "llm", prompt: "do", bracket: { contract: "EXPECTED_VALID" } } }, inbound: {} }, { runId: "run-b2", doc: { meta: { name: "wf" } } }).pipe(Effect.provide(layer))
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.output).toBe("EXPECTED_VALID")
      expect(counter.count).toBe(2)
    }))

  it.effect("3 consecutive violations -> FAIL with final violation in evidence", () =>
    Effect.gen(function* () {
      const counter = { count: 0 }
      const layer = makeStubLlm([{ text: "bad1", confidence: 0.9 }, { text: "bad2", confidence: 0.9 }, { text: "bad3", confidence: 0.9 }], counter)
      const res: any = yield* runNode(promptNode, { node: { id: "p5", config: { mode: "llm", prompt: "do", bracket: { contract: "MUST_CONTAIN_THIS" } } }, inbound: {} }, { runId: "run-b3", doc: { meta: { name: "wf" } } }).pipe(Effect.provide(layer))
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.state).toBe("FAIL")
      expect(counter.count).toBe(3)
      const errMsg = (res.error as any)?.message ?? ""
      expect(errMsg).toContain("MUST_CONTAIN_THIS")
    }))

  it.effect("confidence 0.4 -> INCONCLUSIVE with evidence.state UNCLEAR + confidence in payload", () =>
    Effect.gen(function* () {
      const layer = makeStubLlm([{ text: "answer", confidence: 0.4 }])
      const res: any = yield* runNode(promptNode, { node: { id: "p6", config: { mode: "llm", prompt: "do" } }, inbound: {} }, { runId: "run-c1", doc: { meta: { name: "wf" } } }).pipe(Effect.provide(layer))
      expect(res.verdict).toBe("INCONCLUSIVE")
      expect(res.evidence.state).toBe("UNCLEAR")
      expect(res.outputs.confidence).toBe(0.4)
    }))

  it.effect("confidence 0.7 -> PASS", () =>
    Effect.gen(function* () {
      const layer = makeStubLlm([{ text: "good", confidence: 0.7 }])
      const res: any = yield* runNode(promptNode, { node: { id: "p7", config: { mode: "llm", prompt: "do" } }, inbound: {} }, { runId: "run-c2", doc: { meta: { name: "wf" } } }).pipe(Effect.provide(layer))
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.confidence).toBe(0.7)
    }))

  it.effect("no Llm bound + mode llm -> [JESL CAP-UNBOUND] pre-flight", () =>
    Effect.gen(function* () {
      const result = yield* runNode(promptNode, { node: { id: "p8", config: { mode: "llm", prompt: "do" } }, inbound: {} }, { runId: "run-cap", doc: { meta: { name: "wf" } } }).pipe(Effect.either)
      expect(result._tag).toBe("Left")
      const err: any = (result as any).left
      const code = err?.code ?? err?.message ?? String(err)
      expect(code).toContain("[JESL CAP-UNBOUND]")
    }))

  it.effect("journal rows: pre-invoke + verdict rows present for generation invoke (via in-memory journal)", () =>
    Effect.gen(function* () {
      const j = yield* makeJournal
      const layer = makeStubLlm([{ text: "hello", confidence: 0.9 }]).pipe(Layer.provideMerge(Layer.effect(Journal, makeJournal)))
      const j2 = yield* makeJournal
      const llmLayer = makeStubLlm([{ text: "hello journal", confidence: 0.9 }])
      const combined = Layer.merge(llmLayer, Layer.effect(Journal, Effect.succeed(j2)))
      const res: any = yield* runNode(promptNode, { node: { id: "p9", config: { mode: "llm", prompt: "test journal" } }, inbound: {} }, { runId: "run-j1", doc: { meta: { name: "wf" } } }).pipe(Effect.provide(combined))
      expect(res.verdict).toBe("PASS")
      const rows = yield* j2.rows("run-j1")
      expect(rows.length).toBeGreaterThanOrEqual(2)
      const kinds = rows.map((r: any) => r.kind)
      expect(kinds).toContain("invoke")
      expect(kinds).toContain("verdict")
    }))

  it.effect("replaceStub: prompt kind get() returns real impl after module init + replacement fails loudly", () =>
    Effect.gen(function* () {
      const mod: any = yield* Effect.tryPromise({ try: async () => await import("../nodes/prompt"), catch: (e) => e })
      expect(mod.promptNode).toBeDefined()
      expect(mod.promptNode.kind).toBe("prompt")
      let threw = false
      try {
        const { replaceStubSync } = yield* Effect.tryPromise({ try: async () => await import("../core/registry"), catch: () => ({ replaceStubSync: null }) }) as any
        if (replaceStubSync) {
          const fake: any = { kind: "prompt", family: "generation", requiredCaps: [], invoke: () => Effect.succeed({ verdict: "PASS", evidence: { pattern: "fake", state: "PASS", anchor: "x:1" }, timing: { startMs: 0, endMs: 0 } }) }
          replaceStubSync("prompt", fake)
        }
      } catch (e: any) {
        threw = true
        const msg = e?.message ?? String(e)
        expect(msg).toContain("append-only")
      }
      expect(threw).toBe(true)
    }))
})
