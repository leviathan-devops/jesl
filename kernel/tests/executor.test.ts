import { describe, it, expect } from "@effect/vitest"
import { Effect, Context, Clock, Duration } from "effect"
import { runProgram, type RunContext, type NodeHandle, type JournalRow } from "../core/executor"
import { JeslChannelUnset } from "../core/errors"
import type { WorkflowDoc } from "../core/schema"

const makeJournal = (runId: string) => {
  const rows: JournalRow[] = []
  let seq = 0
  let prev = "genesis"
  return {
    rows,
    append: (draft: { run: string; node: string; kind: "invoke" | "verdict"; verdict?: any; evidence?: any; source: string; ts: number }) =>
      Effect.gen(function* () {
        const row: JournalRow = {
          seq: seq++,
          ts: draft.ts,
          run: draft.run,
          node: draft.node,
          kind: draft.kind as any,
          verdict: draft.verdict,
          evidence: draft.evidence,
          source: draft.source,
          prev,
          self: ""
        } as any
        const self = `self-${row.seq}-${row.node}-${row.ts}`
        const finalRow = { ...row, self } as JournalRow
        prev = self
        rows.push(finalRow)
        return finalRow
      })
  }
}

const makeChannels = () => {
  const store = new Map<string, unknown>()
  return {
    write: (name: string, value: unknown) => Effect.sync(() => { store.set(name, value) }),
    isWritten: (name: string) => Effect.succeed(store.has(name)),
    store
  }
}

const passHandle = (delayMs = 0, outputs?: Record<string, unknown>): NodeHandle => ({
  invoke: () =>
    Effect.gen(function* () {
      if (delayMs > 0) yield* Effect.promise(() => new Promise<void>((res) => setTimeout(res, delayMs)))
      return {
        verdict: "PASS" as const,
        outputs: outputs ?? { default: { ok: 1 } },
        evidence: { pattern: "test.pass", state: "FIRED", anchor: "test:1" },
        timing: { startMs: 0, endMs: 0 }
      }
    })
})

const failHandle = (delayMs = 0): NodeHandle => ({
  invoke: () =>
    Effect.gen(function* () {
      if (delayMs > 0) yield* Effect.promise(() => new Promise<void>((res) => setTimeout(res, delayMs)))
      return yield* Effect.fail(new JeslChannelUnset({ code: "[JESL CHANNEL-UNSET]", node: "failNode", field: "ch", expected: "written", actual: "unset", remedy: "seed" } as any))
    })
})

const readyFalseHandle: NodeHandle = {
  invoke: () => Effect.succeed({ verdict: "READY_FALSE" as const, evidence: { pattern: "test.ready", state: "READY_FALSE", anchor: "test:1" }, timing: { startMs: 0, endMs: 0 } })
}

const defectHandle: NodeHandle = {
  invoke: () => Effect.die(new Error("boom defect"))
}

const capHandle: NodeHandle = {
  requiredCaps: ["llm"],
  invoke: () => Effect.succeed({ verdict: "PASS" as const, evidence: { pattern: "test", state: "FIRED", anchor: "a" }, timing: { startMs: 0, endMs: 0 } })
}

const docDiamond4 = (): WorkflowDoc => ({
  $schema: "trident-workflow-v1" as const,
  meta: { name: "diamond", tier: 1 as const },
  nodes: [{ id: "A", type: "x" }, { id: "B", type: "x" }, { id: "C", type: "x" }, { id: "D", type: "x" }] as any,
  edges: [
    { from: "A", to: "B", via: "ch1" },
    { from: "A", to: "C", via: "ch2" }
  ] as any
})

const baseCtx = (doc: WorkflowDoc, handles: Record<string, NodeHandle>, journal: ReturnType<typeof makeJournal>, extra: Partial<RunContext> = {}): RunContext => ({
  runId: "run-1",
  doc,
  channels: makeChannels() as any,
  journal: journal as any,
  caps: Context.empty() as any,
  clock: Clock as any,
  budget: { startedAt: 0, deadlineMs: 600000, maxNodesFiring: 15 },
  vars: {},
  nodeHandles: handles,
  ...extra
} as unknown as RunContext)

describe("executor", () => {
  it.effect("diamond runs to PASS on all 4 nodes with exactly 2 batches", () =>
    Effect.gen(function* () {
      const doc = docDiamond4()
      const journal = makeJournal("run-1")
      const handles: Record<string, NodeHandle> = {
        A: passHandle(0, { ch1: { v: 1 }, ch2: { v: 1 } }),
        B: passHandle(20),
        C: passHandle(20),
        D: passHandle(0)
      }
      const ctx = baseCtx(doc, handles, journal, { caps: Context.empty() as any, budget: { startedAt: yield* Clock.currentTimeMillis, deadlineMs: 600000, maxNodesFiring: 15 } })
      const summary = yield* runProgram(doc, ctx)
      expect(Object.keys(summary.results).length).toBe(4)
      for (const id of ["A", "B", "C", "D"]) expect(summary.results[id]?.verdict).toBe("PASS")
      expect(summary.batches.length).toBe(2)
      const secondBatch = summary.batches[1]!
      expect(new Set(secondBatch)).toEqual(new Set(["B", "C"]))
    }))

  it.effect("B and C OVERLAP (timing windows intersect — concurrency proof)", () =>
    Effect.gen(function* () {
      const doc = docDiamond4()
      const journal = makeJournal("run-1")
      const handles: Record<string, NodeHandle> = {
        A: passHandle(0, { ch1: {}, ch2: {} }),
        B: passHandle(40),
        C: passHandle(40),
        D: passHandle(0)
      }
      const ctx = baseCtx(doc, handles, journal, { budget: { startedAt: yield* Clock.currentTimeMillis, deadlineMs: 600000, maxNodesFiring: 15 } })
      const summary = yield* runProgram(doc, ctx)
      const b = summary.results["B"]!
      const c = summary.results["C"]!
      const overlap = b.timing.startMs <= c.timing.endMs && c.timing.startMs <= b.timing.endMs
      expect(overlap).toBe(true)
      const sameBatch = summary.batches.some((batch) => batch.includes("B") && batch.includes("C"))
      expect(sameBatch).toBe(true)
    }))

  it.effect("isolation: failing node yields FAIL while batch siblings still PASS", () =>
    Effect.gen(function* () {
      const doc: WorkflowDoc = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "iso", tier: 1 as const },
        nodes: [{ id: "A", type: "x" }, { id: "B", type: "x" }] as any,
        edges: [] as any
      }
      const journal = makeJournal("run-1")
      const handles: Record<string, NodeHandle> = {
        A: failHandle(0),
        B: passHandle(0)
      }
      const ctx = baseCtx(doc, handles, journal)
      const summary = yield* runProgram(doc, ctx)
      expect(summary.results["A"]?.verdict).toBe("FAIL")
      expect(summary.results["A"]?.error).toBeDefined()
      expect((summary.results["A"]?.error as any)?.code).toBe("[JESL CHANNEL-UNSET]")
      expect(summary.results["B"]?.verdict).toBe("PASS")
    }))

  it.effect("cap-unbound pre-flight yields [JESL CAP-UNBOUND] with NO invoke rows for that node", () =>
    Effect.gen(function* () {
      const doc: WorkflowDoc = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "cap", tier: 1 as const },
        nodes: [{ id: "needLlm", type: "prompt" }] as any,
        edges: [] as any
      }
      const journal = makeJournal("run-1")
      const handles: Record<string, NodeHandle> = { needLlm: capHandle }
      const ctx = baseCtx(doc, handles, journal, { boundCaps: new Set() } as any)
      const res = yield* Effect.either(runProgram(doc, ctx))
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL CAP-UNBOUND]")
        expect(String(err.node)).toBe("needLlm")
      }
      const rowsForNode = journal.rows.filter((r) => r.node === "needLlm")
      expect(rowsForNode.length).toBe(0)
    }))

  it.effect("journal receives pre-invoke + verdict rows per node (in-memory Layer)", () =>
    Effect.gen(function* () {
      const doc = docDiamond4()
      const journal = makeJournal("run-1")
      const handles: Record<string, NodeHandle> = {
        A: passHandle(0, { ch1: {}, ch2: {} }),
        B: passHandle(0),
        C: passHandle(0),
        D: passHandle(0)
      }
      const ctx = baseCtx(doc, handles, journal)
      const summary = yield* runProgram(doc, ctx)
      expect(journal.rows.length).toBe(8)
      expect(summary.rows.length).toBe(8)
      for (const id of ["A", "B", "C", "D"]) {
        const invokeRows = journal.rows.filter((r) => r.node === id && r.kind === "invoke")
        const verdictRows = journal.rows.filter((r) => r.node === id && r.kind === "verdict")
        expect(invokeRows.length).toBe(1)
        expect(verdictRows.length).toBe(1)
        expect(verdictRows[0]!.verdict).toBe("PASS")
      }
    }))

  it.effect("READY_FALSE when node reports not-ready", () =>
    Effect.gen(function* () {
      const doc: WorkflowDoc = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "rf", tier: 1 as const },
        nodes: [{ id: "X", type: "x" }] as any,
        edges: [] as any
      }
      const journal = makeJournal("run-1")
      const handles: Record<string, NodeHandle> = { X: readyFalseHandle }
      const ctx = baseCtx(doc, handles, journal)
      const summary = yield* runProgram(doc, ctx)
      expect(summary.results["X"]?.verdict).toBe("READY_FALSE")
      expect(journal.rows.some((r) => r.node === "X" && r.verdict === "READY_FALSE")).toBe(true)
    }))

  it.effect("INCONCLUSIVE on defect throw", () =>
    Effect.gen(function* () {
      const doc: WorkflowDoc = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "inc", tier: 1 as const },
        nodes: [{ id: "Y", type: "x" }] as any,
        edges: [] as any
      }
      const journal = makeJournal("run-1")
      const handles: Record<string, NodeHandle> = { Y: defectHandle }
      const ctx = baseCtx(doc, handles, journal)
      const summary = yield* runProgram(doc, ctx)
      expect(summary.results["Y"]?.verdict).toBe("INCONCLUSIVE")
      expect(journal.rows.some((r) => r.node === "Y" && r.verdict === "INCONCLUSIVE")).toBe(true)
    }))

  it.effect("timing via Clock not Date.now — startMs < endMs and uses Clock", () =>
    Effect.gen(function* () {
      const doc: WorkflowDoc = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "tim", tier: 1 as const },
        nodes: [{ id: "T", type: "x" }] as any,
        edges: [] as any
      }
      const journal = makeJournal("run-1")
      const handles: Record<string, NodeHandle> = { T: passHandle(10) }
      const ctx = baseCtx(doc, handles, journal)
      const before = yield* Clock.currentTimeMillis
      const summary = yield* runProgram(doc, ctx)
      const after = yield* Clock.currentTimeMillis
      const t = summary.results["T"]!.timing
      expect(t.startMs).toBeGreaterThanOrEqual(before)
      expect(t.endMs).toBeGreaterThanOrEqual(t.startMs)
      expect(t.endMs).toBeLessThanOrEqual(after)
    }))
})
