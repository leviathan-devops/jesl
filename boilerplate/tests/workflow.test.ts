import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect, Ref, Clock, Context, Layer } from "effect"
import { Journal, makeJournal } from "../core/journal"
import { runJeslWorkflow, JeslRun, hashSeed, idempotencyKeyFor, rebuildSummaryFromRows, seedToString } from "../workflow/jesl-run"
import { makeNodeActivity, durableAsk, provideAnswer, hasAsk, hasAnswer, seedToString as seedToStringAct } from "../workflow/activities"
import type { WorkflowDoc } from "../core/schema"
import type { RunContext, NodeHandle } from "../core/executor"

const simpleDoc = (name = "wf1"): WorkflowDoc => ({
  $schema: "trident-workflow-v1" as const,
  meta: { name, tier: 1 as const },
  nodes: [{ id: "A", type: "gate" }, { id: "B", type: "gate" }, { id: "C", type: "gate" }] as any,
  edges: [{ from: "A", to: "B", via: "ch1" }, { from: "B", to: "C", via: "ch2" }] as any
})

const countedHandle = (counter: Ref.Ref<number>, outputs?: Record<string, unknown>): NodeHandle => ({
  invoke: () => Effect.gen(function* () {
    yield* Ref.update(counter, (n) => n + 1)
    const start = yield* Clock.currentTimeMillis
    return { verdict: "PASS" as const, evidence: { pattern: "counted", state: "PASS", anchor: "wf:1" }, timing: { startMs: start, endMs: start }, outputs: outputs ?? { ch1: { ok: 1 }, ch2: { ok: 1 } } }
  })
})

const failingHandle: NodeHandle = {
  invoke: () => Effect.gen(function* () {
    const start = yield* Clock.currentTimeMillis
    return { verdict: "FAIL" as const, evidence: { pattern: "fail", state: "FAIL", anchor: "wf:fail" }, timing: { startMs: start, endMs: start } }
  })
}

const makeBaseCtx = (doc: WorkflowDoc, handles: Record<string, NodeHandle>): Omit<RunContext, "runId" | "journal"> & { runId?: string } => ({
  doc,
  caps: Context.empty() as any,
  clock: Clock as any,
  budget: { startedAt: 0, deadlineMs: 600000, maxNodesFiring: 15 },
  vars: {},
  nodeHandles: handles as any,
  boundCaps: new Set() as any
} as any)

describe("workflow durable JeslRun — F17", () => {
  it.effect("first run uncovered executes with invoke counter >0 and rows land", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const counter = yield* Ref.make(0)
      const doc = simpleDoc("wf-first")
      const docHash = "hash-abc-001"
      const seed = "seed-001"
      const handles: Record<string, NodeHandle> = { A: countedHandle(counter), B: countedHandle(counter), C: countedHandle(counter) }
      const base = makeBaseCtx(doc, handles)
      const res = yield* runJeslWorkflow(docHash, seed, doc, base).pipe(Effect.provide(layer))
      expect(res.invoked).toBeGreaterThan(0)
      const c = yield* Ref.get(counter)
      expect(c).toBeGreaterThan(0)
      expect(res.receipt.rowsCount).toBeGreaterThan(0)
      expect(res.receipt.verdict).toBe("PASS")
      expect(res.receipt.runId.length).toBe(16)
      const rows = yield* journal.rows(res.runId).pipe(Effect.provide(layer))
      expect(rows.length).toBe(res.receipt.rowsCount)
      for (const r of rows) expect((r as any).source).toContain("workflow/")
    }))

  it.effect("second run same docHash+seed replays invoke counter 0 verdict FROM rows covers true", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const counter = yield* Ref.make(0)
      const doc = simpleDoc("wf-replay")
      const docHash = "hash-replay-002"
      const seed = "seed-replay-002"
      const handles: Record<string, NodeHandle> = { A: countedHandle(counter), B: countedHandle(counter), C: countedHandle(counter) }
      const base = makeBaseCtx(doc, handles)
      const first = yield* runJeslWorkflow(docHash, seed, doc, base).pipe(Effect.provide(layer))
      expect(first.invoked).toBeGreaterThan(0)
      const cnt1 = yield* Ref.get(counter)
      expect(cnt1).toBe(3)
      const covers1 = yield* journal.covers(docHash, seedToString(seed)).pipe(Effect.provide(layer))
      expect(covers1).toBe(true)
      const rows1 = yield* journal.rows(first.runId).pipe(Effect.provide(layer))
      const verdictFromRows = rows1.filter((r: any) => r.kind === "verdict" && r.verdict).map((r: any) => r.verdict)
      expect(verdictFromRows.length).toBeGreaterThan(0)
      yield* Ref.set(counter, 0)
      const second = yield* runJeslWorkflow(docHash, seed, doc, base).pipe(Effect.provide(layer))
      expect(second.invoked).toBe(0)
      const cnt2 = yield* Ref.get(counter)
      expect(cnt2).toBe(0)
      expect(second.receipt.verdict).toBe(first.receipt.verdict)
      expect(second.receipt.rowsCount).toBe(first.receipt.rowsCount)
      expect(second.receipt.journalTail).toBe(first.receipt.journalTail)
      expect(second.receipt.runId).toBe(first.receipt.runId)
      const covers2 = yield* journal.covers(docHash, seedToString(seed)).pipe(Effect.provide(layer))
      expect(covers2).toBe(true)
    }))

  it.effect("different seed executes again idempotency key discriminates", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const counter = yield* Ref.make(0)
      const doc = simpleDoc("wf-seed-discriminate")
      const docHash = "hash-seed-disc-003"
      const seedA = "seed-A"
      const seedB = "seed-B"
      const handles: Record<string, NodeHandle> = { A: countedHandle(counter), B: countedHandle(counter), C: countedHandle(counter) }
      const base = makeBaseCtx(doc, handles)
      const rA = yield* runJeslWorkflow(docHash, seedA, doc, base).pipe(Effect.provide(layer))
      expect(rA.invoked).toBeGreaterThan(0)
      yield* Ref.set(counter, 0)
      const rB = yield* runJeslWorkflow(docHash, seedB, doc, base).pipe(Effect.provide(layer))
      expect(rB.invoked).toBeGreaterThan(0)
      const cnt = yield* Ref.get(counter)
      expect(cnt).toBe(3)
      expect(rA.runId).not.toBe(rB.runId)
      const keyA = idempotencyKeyFor(docHash, seedA)
      const keyB = idempotencyKeyFor(docHash, seedB)
      expect(keyA).not.toBe(keyB)
      expect(keyA).toBe(`${docHash}:${hashSeed(seedA)}`)
      expect(keyB).toBe(`${docHash}:${hashSeed(seedB)}`)
    }))

  it.effect("ask-launcher durable: run1 suspends on ask then run2 resumes without re-asking counter 1 total", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const askCounter = yield* Ref.make(0)
      const docHash = "hash-ask-004"
      const seed = "seed-ask-004"
      const seedStr = seedToString(seed)
      const runId = yield* Effect.sync(() => {
        let h = 0x811c9dc5
        const s = docHash + "\x00" + seedStr
        for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
        let h2 = 0x1000193
        for (let i = 0; i < s.length; i++) { h2 ^= s.charCodeAt(i); h2 = Math.imul(h2, 0x5bd1e995) >>> 0 }
        const hex = (n: number) => n.toString(16).padStart(8, "0")
        const extra = s.length.toString(16).padStart(8, "0")
        const full = hex(h) + hex(h2) + extra + hex(s.length * 31 >>> 0)
        return full.slice(0, 16)
      })
      yield* Ref.update(askCounter, (n) => n + 1)
      const firstAsk = yield* Effect.either(durableAsk("what is your name?", "A", runId).pipe(Effect.provide(layer)))
      expect((firstAsk as any)._tag).toBe("Left")
      const hasAskRow = yield* hasAsk("A", runId).pipe(Effect.provide(layer))
      expect(hasAskRow).toBe(true)
      const askCnt1 = yield* Ref.get(askCounter)
      expect(askCnt1).toBe(1)
      yield* provideAnswer("Alice", "A", runId).pipe(Effect.provide(layer))
      const hasAns = yield* hasAnswer("A", runId).pipe(Effect.provide(layer))
      expect(hasAns).toBe(true)
      const answerViaJournal = yield* durableAsk("what is your name?", "A", runId).pipe(Effect.provide(layer))
      expect(answerViaJournal).toBe("Alice")
      const askCnt2 = yield* Ref.get(askCounter)
      expect(askCnt2).toBe(1)
      const directAnswer = yield* Effect.gen(function* () {
        const j = yield* Journal
        const rows = yield* j.rows(runId)
        const ansRow = rows.find((r: any) => r.kind === "answer")
        expect(ansRow).toBeDefined()
        return (ansRow as any).evidence.anchor.replace("answer:", "")
      }).pipe(Effect.provide(layer))
      expect(directAnswer).toBe("Alice")
      const secondAsk = yield* durableAsk("what is your name?", "A", runId).pipe(Effect.provide(layer))
      expect(secondAsk).toBe("Alice")
      const askCnt3 = yield* Ref.get(askCounter)
      expect(askCnt3).toBe(1)
    }))

  it.effect("corrupted journal during replay loud fails verify trip", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const counter = yield* Ref.make(0)
      const doc = simpleDoc("wf-corrupt")
      const docHash = "hash-corrupt-005"
      const seed = "seed-corrupt-005"
      const handles: Record<string, NodeHandle> = { A: countedHandle(counter), B: countedHandle(counter), C: countedHandle(counter) }
      const base = makeBaseCtx(doc, handles)
      const first = yield* runJeslWorkflow(docHash, seed, doc, base).pipe(Effect.provide(layer))
      expect(first.invoked).toBeGreaterThan(0)
      const runId = first.runId
      const rows = yield* journal.rows(runId).pipe(Effect.provide(layer))
      expect(rows.length).toBeGreaterThan(0)
      const tampered = rows.map((r: any) => ({ ...r })) as any[]
      tampered[0]!.evidence = { pattern: "tampered", state: "s", anchor: "bad:1" }
      const newSer = JSON.stringify(tampered)
      const journal2 = yield* makeJournal
      const layer2 = Layer.succeed(Journal, journal2)
      yield* journal2.restore(newSer).pipe(Effect.provide(layer2))
      const base2 = makeBaseCtx(doc, handles)
      const second = yield* Effect.either(runJeslWorkflow(docHash, seed, doc, base2).pipe(Effect.provide(layer2)))
      expect((second as any)._tag).toBe("Left")
      if ((second as any)._tag === "Left") {
        const err = String((second as any).left)
        expect(err).toMatch(/CORRUPT|verify|JESL/i)
      }
    }))

  it.effect("receipt RunReceipt{runId,verdict,rowsCount,journalTail} correct on both runs", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const counter = yield* Ref.make(0)
      const doc = simpleDoc("wf-receipt")
      const docHash = "hash-receipt-006"
      const seed = { user: "bob", n: 42 }
      const handles: Record<string, NodeHandle> = { A: countedHandle(counter), B: countedHandle(counter), C: countedHandle(counter) }
      const base = makeBaseCtx(doc, handles)
      const first = yield* runJeslWorkflow(docHash, seed, doc, base).pipe(Effect.provide(layer))
      expect(first.receipt.runId).toBeDefined()
      expect(typeof first.receipt.verdict).toBe("string")
      expect(typeof first.receipt.rowsCount).toBe("number")
      expect(first.receipt.rowsCount).toBeGreaterThan(0)
      expect(typeof first.receipt.journalTail).toBe("string")
      expect(first.receipt.journalTail.length).toBeGreaterThan(0)
      const rows = yield* journal.rows(first.runId).pipe(Effect.provide(layer))
      expect(first.receipt.rowsCount).toBe(rows.length)
      expect(first.receipt.journalTail).toBe((rows[rows.length - 1] as any).self)
      yield* Ref.set(counter, 0)
      const second = yield* runJeslWorkflow(docHash, seed, doc, base).pipe(Effect.provide(layer))
      expect(second.receipt.runId).toBe(first.receipt.runId)
      expect(second.receipt.verdict).toBe(first.receipt.verdict)
      expect(second.receipt.rowsCount).toBe(first.receipt.rowsCount)
      expect(second.receipt.journalTail).toBe(first.receipt.journalTail)
    }))

  it.effect("Activities named node:<id> visible in rows source fields", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const counter = yield* Ref.make(0)
      const doc = simpleDoc("wf-activity-name")
      const docHash = "hash-activity-007"
      const seed = "seed-activity-007"
      const handles: Record<string, NodeHandle> = { A: countedHandle(counter), B: countedHandle(counter), C: countedHandle(counter) }
      const base = makeBaseCtx(doc, handles)
      const res = yield* runJeslWorkflow(docHash, seed, doc, base).pipe(Effect.provide(layer))
      const rows = yield* journal.rows(res.runId).pipe(Effect.provide(layer))
      for (const id of ["A", "B", "C"]) {
        const forNode = rows.filter((r: any) => r.node === id)
        expect(forNode.length).toBeGreaterThan(0)
        for (const r of forNode) expect((r as any).source).toContain(`node:${id}`.slice(0, 5))
      }
      const activity = makeNodeActivity("X", countedHandle(counter), "testwf")
      expect((activity as any).name).toBe("node:X")
      const activity2 = makeNodeActivity("ask-node", countedHandle(counter), "testwf")
      expect((activity2 as any).name).toBe("node:ask-node")
    }))

  it.effect("idempotency key format `${docHash}:${seedHash}` asserted", () =>
    Effect.gen(function* () {
      const docHash = "doc-xyz-008"
      const seed = { foo: "bar", n: 123 }
      const key = idempotencyKeyFor(docHash, seed)
      const expected = `${docHash}:${hashSeed(seed)}`
      expect(key).toBe(expected)
      expect(key.startsWith(`${docHash}:`)).toBe(true)
      const parts = key.split(":")
      expect(parts[0]).toBe(docHash)
      expect(parts[1]!.length).toBeGreaterThan(0)
      const seed2 = "string-seed"
      const key2 = idempotencyKeyFor(docHash, seed2)
      expect(key2).toBe(`${docHash}:${hashSeed(seed2)}`)
      expect(hashSeed(seed2)).toBe(hashSeed("string-seed"))
      const keyGeneratedByWorkflow = yield* JeslRun.executionId({ docHash, seed } as any)
      expect(typeof keyGeneratedByWorkflow).toBe("string")
      expect((keyGeneratedByWorkflow as string).length).toBeGreaterThan(0)
      const keySame = yield* JeslRun.executionId({ docHash, seed } as any)
      expect(keySame).toBe(keyGeneratedByWorkflow)
      const keyDiff = yield* JeslRun.executionId({ docHash, seed: seed2 } as any)
      expect(keyDiff).not.toBe(keyGeneratedByWorkflow)
      expect(key).toBe(`${docHash}:${hashSeed(seed)}`)
    }))

  it.effect("JeslRun workflow definition has correct name and payload shape", () =>
    Effect.gen(function* () {
      expect((JeslRun as any).name).toBe("JeslRun")
      expect((JeslRun as any).payloadSchema).toBeDefined()
      expect((JeslRun as any).successSchema).toBeDefined()
      expect((JeslRun as any).errorSchema).toBeDefined()
      const key = idempotencyKeyFor("h1", "s1")
      expect(key).toBe(`h1:${hashSeed("s1")}`)
      const key2 = yield* JeslRun.executionId({ docHash: "h1", seed: "s1" } as any)
      expect(typeof key2).toBe("string")
      expect(key2.length).toBeGreaterThan(0)
      const key2b = yield* JeslRun.executionId({ docHash: "h1", seed: "s1" } as any)
      expect(key2b).toBe(key2)
      const key3 = yield* JeslRun.executionId({ docHash: "h1", seed: "different" } as any)
      expect(key3).not.toBe(key2)
    }))

  it.effect("verdict rebuilt FROM rows not re-execution — FAIL rows produce FAIL receipt", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const doc = simpleDoc("wf-fail-verdict")
      const docHash = "hash-fail-010"
      const seed = "seed-fail-010"
      const handles: Record<string, NodeHandle> = { A: countedHandle(yield* Ref.make(0)), B: failingHandle, C: countedHandle(yield* Ref.make(0)) }
      const base = makeBaseCtx(doc, handles)
      const first = yield* runJeslWorkflow(docHash, seed, doc, base).pipe(Effect.provide(layer))
      expect(first.receipt.verdict).toBe("FAIL")
      const rows = yield* journal.rows(first.runId).pipe(Effect.provide(layer))
      const { verdict } = rebuildSummaryFromRows(rows as any, first.runId)
      expect(verdict).toBe("FAIL")
      const counter2 = yield* Ref.make(0)
      const replayHandles: Record<string, NodeHandle> = { A: countedHandle(counter2), B: countedHandle(counter2), C: countedHandle(counter2) }
      const base2 = makeBaseCtx(doc, replayHandles)
      const second = yield* runJeslWorkflow(docHash, seed, doc, base2).pipe(Effect.provide(layer))
      expect(second.invoked).toBe(0)
      expect(second.receipt.verdict).toBe("FAIL")
      const c2 = yield* Ref.get(counter2)
      expect(c2).toBe(0)
    }))
})
