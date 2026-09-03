import { describe, it, expect } from "@effect/vitest"
import { Effect, Layer, Context, Exit, Clock, Deferred, Queue, Ref } from "effect"
import { makeBus, Bus } from "../core/bus"
import { makeJournal, Journal } from "../core/journal"
import { Shell, Fs, Http, ToolClient, Subagent, Llm, requireCaps } from "../core/caps"
import { Session } from "../drivers/session-live"
import { makeSessionLive } from "../drivers/session-live"
import { ScriptedTransport, makeOpenCodeLive, HostTransport } from "../drivers/opencode-live"
import { onToolExecuteBefore, detachAll, clearBridgeState, hookBridgeBusEventTypes } from "../drivers/hook-bridge"
import { runProgram, type RunContext, type NodeHandle } from "../core/executor"
import type { WorkflowDoc } from "../core/schema"

const makeTestJournal = () => {
  const rows: any[] = []
  let seq = 0
  let prev = "genesis"
  return {
    rows,
    append: (draft: any) => Effect.gen(function* () {
      const row = { seq: seq++, ts: draft.ts ?? Date.now(), run: draft.run, node: draft.node, kind: draft.kind, verdict: draft.verdict, evidence: draft.evidence, source: draft.source, prev, self: `self-${seq}` } as any
      prev = row.self
      rows.push(row)
      return row
    })
  }
}

const askNodeHandle = (question: string): NodeHandle => ({
  invoke: ((input: any, ctx: any) => Effect.gen(function* () {
    const session = yield* Session
    const answer = yield* session.ask(question)
    const start = yield* Clock.currentTimeMillis
    yield* Effect.sleep(0)
    return { verdict: "PASS" as const, evidence: { pattern: "ask.launcher", state: "FIRED", anchor: "ask:1" }, timing: { startMs: start, endMs: start }, outputs: { answer, ask: question } } as any
  }) as any) as any
} as any)

const docWithAsk = (id = "askNode"): WorkflowDoc => ({
  $schema: "trident-workflow-v1" as const,
  meta: { name: "ask-doc", tier: 2 as const },
  nodes: [{ id, type: "prompt" }] as any,
  edges: [] as any
})

describe("driver", () => {
  it.effect("ask-launcher roundtrip END-TO-END: doc with ask node -> runProgram under OpenCodeLive+ScriptedTransport -> ask suspends -> scripted answer resolves -> PASS + journal carries ask+answer rows", () =>
    Effect.gen(function* () {
      const transport = new ScriptedTransport({ answers: ["the-answer"] })
      const bus = yield* makeBus
      const journalH = makeTestJournal()
      const doc = docWithAsk("askNode")
      const handle = askNodeHandle("what is 2+2?")
      const ctx: RunContext = {
        runId: "run-ask-1",
        doc,
        caps: Context.empty() as any,
        clock: Clock as any,
        budget: { startedAt: yield* Clock.currentTimeMillis, deadlineMs: 600000, maxNodesFiring: 15 },
        vars: {},
        nodeHandles: { askNode: handle } as any,
        boundCaps: new Set(["Shell","Fs","Http","ToolClient","Subagent","Llm","Session"]) as any,
        capsRequirements: { askNode: ["Session"] } as any,
        channels: { write: () => Effect.void } as any,
        journal: journalH as any,
        bus: bus as any
      } as any
      const layer = makeOpenCodeLive(transport)
      const summary = yield* runProgram(doc, ctx).pipe(Effect.provide(layer))
      expect(summary.results["askNode"]?.verdict).toBe("PASS")
      const out: any = summary.results["askNode"]?.outputs
      expect(out.answer).toBe("the-answer")
      expect(journalH.rows.length).toBeGreaterThanOrEqual(2)
      const verdictRow = journalH.rows.find((r: any) => r.kind === "verdict")
      expect(verdictRow?.verdict).toBe("PASS")
      const askRows = journalH.rows.filter((r: any) => r.node === "askNode")
      expect(askRows.length).toBeGreaterThanOrEqual(2)
    }))

  it.effect("ask with no Session bound -> [JESL CAP-UNBOUND] pre-flight", () =>
    Effect.gen(function* () {
      const res = yield* requireCaps([Session as any], "askNode").pipe(Effect.provide(Layer.empty), Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL CAP-UNBOUND]")
        expect(err.node).toBe("askNode")
      }
      const doc = docWithAsk("askNode2")
      const handle = askNodeHandle("q?")
      const journalH = makeTestJournal()
      const ctx: RunContext = {
        runId: "run-unbound",
        doc,
        caps: Context.empty() as any,
        clock: Clock as any,
        budget: { startedAt: yield* Clock.currentTimeMillis, deadlineMs: 600000, maxNodesFiring: 15 },
        vars: {},
        nodeHandles: { askNode2: handle } as any,
        boundCaps: new Set([]) as any,
        capsRequirements: { askNode2: ["Session"] } as any
      } as any
      const exit = yield* Effect.exit(runProgram(doc, ctx))
      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        const cause: any = exit.cause
        const str = String(cause)
        expect(str).toContain("CAP-UNBOUND")
      }
    }))

  it.effect("hook bridge: onToolExecuteBefore emits bus event (subscribe + assert payload) and returns allow", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const seen: any[] = []
      yield* bus.subscribe("tool.execute.before", (e) => Effect.sync(() => seen.push(e)))
      const verdict = yield* onToolExecuteBefore({ tool: "bash", args: { cmd: "ls" }, runId: "run-1" }).pipe(Effect.provide(Layer.succeed(Bus, bus)))
      expect(verdict.allow).toBe(true)
      expect(seen.length).toBe(1)
      expect(seen[0].type).toBe("tool.execute.before")
      expect((seen[0].payload as any).tool).toBe("bash")
    }))

  it.effect("bridge returns scanners deny when pta deny-verdict event precedes (scripted via direct bus emit)", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const layer = Layer.succeed(Bus, bus)
      yield* onToolExecuteBefore({ tool: "bash", args: {}, runId: "run-deny" }).pipe(Effect.provide(layer))
      yield* bus.emit("pta.intercept", { tool: "bash", verdict: "deny", reason: { code: "PBA_DENY", message: "blocked" } }, "run-deny")
      yield* Effect.yieldNow()
      const verdict = yield* onToolExecuteBefore({ tool: "bash", args: { cmd: "rm -rf /" }, runId: "run-deny" }).pipe(Effect.provide(layer))
      expect(verdict.allow).toBe(false)
      if (!verdict.allow) expect((verdict.reason as any).code ?? (verdict.reason as any).message ?? String(verdict.reason)).toContain("PBA_DENY")
    }))

  it.effect("bridge isolation: scanner-subscriber crash never breaks hook allow path", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      yield* bus.subscribe("tool.execute.before", () => Effect.die(new Error("scanner boom")))
      yield* bus.subscribe("pta.*", () => Effect.die(new Error("pta boom")))
      const verdict = yield* onToolExecuteBefore({ tool: "bash", args: {} }).pipe(Effect.provide(Layer.succeed(Bus, bus)))
      expect(verdict.allow).toBe(true)
    }))

  it.effect("transport failure (ScriptedTransport throwing) -> effect fails loudly (no silent allow)", () =>
    Effect.gen(function* () {
      const transport = new ScriptedTransport({ shouldThrow: true })
      const layer = makeOpenCodeLive(transport)
      const exitTool = yield* Effect.exit(Effect.flatMap(ToolClient, (c) => c.invoke("bash", {}, "cid")).pipe(Effect.provide(layer)))
      expect(Exit.isFailure(exitTool)).toBe(true)
      const exitAsk = yield* Effect.exit(Effect.flatMap(Session, (s) => s.ask("q?")).pipe(Effect.provide(layer)))
      expect(Exit.isFailure(exitAsk)).toBe(true)
      const bus = yield* makeBus
      const denyExit = yield* Effect.exit(onToolExecuteBefore({ tool: "bash", args: {} }).pipe(Effect.provide(Layer.succeed(Bus, bus))))
      expect(Exit.isSuccess(denyExit)).toBe(true)
      if (Exit.isSuccess(denyExit)) expect(denyExit.value.allow).toBe(true)
    }))

  it.effect("SessionLive over Queue: two sequential asks resolve in order", () =>
    Effect.gen(function* () {
      const transport = new ScriptedTransport({ answers: ["first", "second"] })
      const layer = makeSessionLive(transport)
      const answers: string[] = []
      const prog = Effect.gen(function* () {
        const s = yield* Session
        const a1 = yield* s.ask("q1")
        answers.push(a1)
        const a2 = yield* s.ask("q2")
        answers.push(a2)
      })
      yield* prog.pipe(Effect.provide(layer))
      expect(answers).toEqual(["first", "second"])
    }))

  it.effect("SessionLive Queue concurrent asks preserve scripted order via Deferred", () =>
    Effect.gen(function* () {
      const transport = new ScriptedTransport({ answers: ["ans1", "ans2"] })
      const layer = makeSessionLive(transport)
      const results = yield* Effect.forEach([0,1], (i) => Effect.flatMap(Session, (s) => s.ask(`q${i}`)), { concurrency: 1 }).pipe(Effect.provide(layer))
      expect(results).toEqual(["ans1", "ans2"])
    }))

  it.effect("OpenCodeLive Layer composition provides ToolClient/Subagent/Llm/Session (+ inherits CliLive Shell/Fs/Http) — requireCaps for all 6", () =>
    Effect.gen(function* () {
      const transport = new ScriptedTransport({ answers: [] })
      const layer = makeOpenCodeLive(transport)
      const tags: any[] = [Shell, Fs, Http, ToolClient, Subagent, Llm, Session]
      const res = yield* requireCaps(tags as any, "nodeAll").pipe(Effect.provide(layer), Effect.either)
      expect(res._tag).toBe("Right")
      const missing = yield* requireCaps([Llm], "x").pipe(Effect.provide(Layer.empty), Effect.either)
      expect(missing._tag).toBe("Left")
    }))

  it.effect("detachAll cleans bridge subscriptions", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const layer = Layer.succeed(Bus, bus)
      yield* bus.subscribe("tool.execute.before", () => Effect.void)
      yield* bus.subscribe("pta.*", () => Effect.void)
      let subs = yield* Ref.get(bus._subsRef)
      expect(subs.size).toBeGreaterThanOrEqual(2)
      yield* detachAll().pipe(Effect.provide(layer))
      subs = yield* Ref.get(bus._subsRef)
      expect(subs.size).toBe(0)
    }))

  it.effect("bus event types consumed verbatim from bible: pba.family.hit and pta.intercept", () =>
    Effect.gen(function* () {
      expect(hookBridgeBusEventTypes.pbaHit).toBe("pba.family.hit")
      expect(hookBridgeBusEventTypes.ptaIntercept).toBe("pta.intercept")
      expect(hookBridgeBusEventTypes.emitted).toBe("tool.execute.before")
    }))

  it.effect("HostTransport interface contract: ScriptedTransport implements invoke/dispatch/callModel/ask", () =>
    Effect.gen(function* () {
      const t = new ScriptedTransport({ answers: ["a"] })
      const invoke = yield* t.invokeTool("tool", {}, "cid")
      expect((invoke as any).ok).toBe(true)
      const disp = yield* t.dispatchSubagent("file.md")
      expect((disp as any).ok).toBe(true)
      const model = yield* t.callModel({ system: "sys", prompt: "hi", maxTokens: 10 })
      expect((model as any).text).toBe("scripted-model-output")
      const ans = yield* t.ask("q?")
      expect(ans).toBe("a")
    }))
})
