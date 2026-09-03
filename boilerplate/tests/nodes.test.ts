import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect, Clock, Deferred } from "effect"
import { gateNode } from "../nodes/gate"
import { eventFilterNode } from "../nodes/event-filter"
import { captureEngineNode, _captureStore } from "../nodes/capture-engine"
import { pipelineNode } from "../nodes/pipeline"
import { parallelNode } from "../nodes/parallel"
import { retryChainNode } from "../nodes/retry-chain"
import { fallbackChainNode } from "../nodes/fallback-chain"
import { pauseNode, pauseResume } from "../nodes/pause"
import { journalSinkNode } from "../nodes/journal-sink"
import { tripletWriterNode } from "../nodes/triplet-writer"
import { stateMachineNode, _stateStore } from "../nodes/state-machine"
import { mathEvalNode, MathExprService } from "../nodes/math-eval"
import { stubNodes } from "../nodes/stubs"
import { makeJournal, Journal } from "../core/journal"

const runNode = (impl: any, input: any, ctx: any = {}) => impl.invoke(input, ctx)

describe("nodes — 12 full-behavior", () => {
  it.effect("gate passes on predicate true", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(gateNode, { node: { id: "g1", config: { asserts: [{ path: "$.x", op: "eq", value: 5 }] } }, inbound: { x: 5 } })
      expect(res.verdict).toBe("PASS")
      expect(res.evidence.pattern).toBe("gate.assert")
    }))

  it.effect("gate blocks on predicate false", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(gateNode, { node: { id: "g1", config: { asserts: [{ path: "$.x", op: "eq", value: 5 }] } }, inbound: { x: 3 } })
      expect(res.verdict).toBe("FAIL")
    }))

  it.effect("event-filter matches", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(eventFilterNode, { node: { id: "ef1", config: { pattern: "tool.call.*" } }, inbound: { event: { type: "tool.call.bash", payload: { cmd: "ls" } } } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.matched).toBeDefined()
    }))

  it.effect("event-filter drops non-matching", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(eventFilterNode, { node: { id: "ef1", config: { pattern: "tool.call.bash" } }, inbound: { event: { type: "tool.call.python", payload: {} } } })
      expect(res.verdict).toBe("READY_FALSE")
    }))

  it.effect("capture-engine stores", () =>
    Effect.gen(function* () {
      _captureStore.clear()
      const res: any = yield* runNode(captureEngineNode, { node: { id: "cap1", config: { into: "out" } }, inbound: { event: { text: "hello" } } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.out).toEqual({ text: "hello" })
      expect(_captureStore.size).toBe(1)
    }))

  it.effect("pipeline runs A→B: fnA then fnB", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(pipelineNode, { node: { id: "pl1", config: { fnA: (v: any) => v * 2, fnB: (v: any) => v + 3 } }, inbound: { input: 5 } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.result).toBe(13)
    }))

  it.effect("parallel runs 3 concurrent with cap 15", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(parallelNode, { node: { id: "par1", config: { concurrency: 15 } }, inbound: { items: [1,2,3] } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.results).toEqual([1,2,3])
      expect(res.outputs.count).toBe(3)
    }))

  it.effect("retry-chain retries twice then succeeds", () =>
    Effect.gen(function* () {
      let calls = 0
      const res: any = yield* runNode(retryChainNode, { node: { id: "rc1", config: { maxRetries: 2, fn: (attempt: number) => attempt < 2 ? Effect.fail(new Error("fail")) : Effect.succeed("ok") } }, inbound: {} })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.attempts).toBe(3)
    }))

  it.effect("retry-chain retries twice then fails per config", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(retryChainNode, { node: { id: "rc1", config: { maxRetries: 2, failTimes: 10 } }, inbound: {} })
      expect(res.verdict).toBe("FAIL")
    }))

  it.effect("fallback-chain falls to second arm", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(fallbackChainNode, { node: { id: "fb1", config: { primaryShouldFail: true, fallbackValue: { ok: "fallback" } } }, inbound: {} })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.which).toBe("fallback")
    }))

  it.effect("pause resolves on resume", () =>
    Effect.gen(function* () {
      const fiber = yield* Effect.fork(runNode(pauseNode, { node: { id: "pause1", config: { key: "test-pause2" } }, inbound: {} }))
      yield* Effect.promise(() => new Promise<void>(r => setTimeout(r, 10)))
      yield* pauseResume("test-pause2", "resumed-value")
      const res: any = yield* fiber.await
      const val = res._tag === "Success" ? res.value : (res as any)
      const actual = val.value ?? val
      expect((actual as any).verdict).toBe("PASS")
      expect((actual as any).outputs.resumed).toBe("resumed-value")
    }))

  it.effect("journal-sink writes a row through journal interface", () =>
    Effect.gen(function* () {
      const j = yield* makeJournal
      const res: any = yield* runNode(journalSinkNode, { node: { id: "js1" }, inbound: { data: { hello: 1 } } }, { journal: j, runId: "run-js", doc: { meta: { name: "wf" } } }).pipe(Effect.provideService(Journal, j))
      expect(res.verdict).toBe("PASS")
      const rows = yield* j.rows("run-js")
      expect(rows.length).toBe(1)
      expect(rows[0]!.source).toContain("js1")
    }))

  it.effect("triplet-writer emits {pattern,state,anchor}", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(tripletWriterNode, { node: { id: "tw1", config: { triplet: { pattern: "p1", state: "s1", anchor: "file:1" } } }, inbound: {} })
      expect(res.verdict).toBe("PASS")
      expect(res.evidence.pattern).toBe("p1")
      expect(res.outputs.triplet.anchor).toBe("file:1")
    }))

  it.effect("state-machine transitions per table", () =>
    Effect.gen(function* () {
      _stateStore.clear()
      const r1: any = yield* runNode(stateMachineNode, { node: { id: "sm1", config: { initial: "idle", event: "start" } }, inbound: {} })
      expect(r1.outputs.state).toBe("running")
      const r2: any = yield* runNode(stateMachineNode, { node: { id: "sm1", config: { event: "finish" } }, inbound: {} })
      expect(r2.outputs.state).toBe("done")
      expect(r2.verdict).toBe("PASS")
    }))

  it.effect("math-eval delegates through interface and maps result", () =>
    Effect.gen(function* () {
      const svc = { eval: (expr: any, env: any) => Effect.succeed(42) }
      const res: any = yield* runNode(mathEvalNode, { node: { id: "me1", config: { expr: { _tag: "literal", value: 1 }, env: {} } }, inbound: {} }).pipe(Effect.provideService(MathExprService, svc as any))
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.result).toBe(42)
    }))

  it.effect("structural stubs return INCONCLUSIVE + TODO-anchor for the rest", () =>
    Effect.gen(function* () {
      for (const stub of stubNodes) {
        const res: any = yield* stub.invoke({ node: { id: "x" }, inbound: {} }, {})
        expect(res.verdict).toBe("INCONCLUSIVE")
        expect(res.evidence.anchor).toContain("TODO")
      }
    }))
})
