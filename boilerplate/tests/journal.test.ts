import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect, Clock } from "effect"
import { makeJournal, HashCap, verifyChain } from "../core/journal"

describe("journal", () => {
  it.effect("chain verifies: 100 appends → every self recomputable and prev chain unbroken", () =>
    Effect.gen(function* () {
      const j = yield* makeJournal
      for (let i = 0; i < 100; i++) {
        yield* j.append({ run: "run-chain", node: `n${i}`, kind: "verdict", verdict: "PASS", evidence: { pattern: "p", state: "s", anchor: `a:${i}` }, source: `workflow/wf/n${i}` })
      }
      const rows = yield* j.rows("run-chain")
      expect(rows.length).toBe(100)
      expect(rows[0]!.prev).toBe("genesis")
      for (let i = 1; i < rows.length; i++) expect(rows[i]!.prev).toBe(rows[i-1]!.self)
      const ok = yield* j.verify("run-chain")
      expect(ok).toBe(true)
      expect(verifyChain(rows)).toBe(true)
    }))

  it.effect("tamper detection: flip a row then verify reports break loudly", () =>
    Effect.gen(function* () {
      const j = yield* makeJournal
      yield* j.append({ run: "run-tamper", node: "A", kind: "verdict", verdict: "PASS", evidence: { pattern: "p", state: "s", anchor: "a:1" }, source: "workflow/wf/A" })
      yield* j.append({ run: "run-tamper", node: "B", kind: "verdict", verdict: "PASS", evidence: { pattern: "p", state: "s", anchor: "a:2" }, source: "workflow/wf/B" })
      const rows = yield* j.rows("run-tamper")
      const tampered = rows.map(r => ({ ...r })) as any[]
      tampered[0]!.evidence = { pattern: "tampered", state: "s", anchor: "a:1" }
      expect(verifyChain(tampered as any)).toBe(false)
      const okOrig = yield* j.verify("run-tamper")
      expect(okOrig).toBe(true)
    }))

  it.effect("covers(docHash+seed) replay predicate: same doc+seed already has rows → true", () =>
    Effect.gen(function* () {
      const j = yield* makeJournal
      const docHash = "abc123"
      const seed = "seedXYZ"
      const { simpleHashExport } = yield* Effect.promise(() => import("../core/journal"))
      const runId = (simpleHashExport as any)(docHash + "\x00" + seed).slice(0,16)
      yield* j.append({ run: runId, node: "X", kind: "verdict", verdict: "PASS", evidence: { pattern: "p", state: "s", anchor: "a" }, source: `workflow/wf/X` })
      const c1 = yield* j.covers(docHash, seed)
      expect(c1).toBe(true)
      const c2 = yield* j.covers(docHash, "other-seed")
      expect(c2).toBe(false)
    }))

  it.effect("serialize/resume: journal + serialized context = resume artifact", () =>
    Effect.gen(function* () {
      const j1 = yield* makeJournal
      yield* j1.append({ run: "run-ser", node: "A", kind: "verdict", verdict: "PASS", evidence: { pattern: "p", state: "s", anchor: "a:1" }, source: "workflow/wf/A" })
      yield* j1.append({ run: "run-ser", node: "B", kind: "verdict", verdict: "PASS", evidence: { pattern: "p", state: "s", anchor: "a:2" }, source: "workflow/wf/B" })
      const ser = yield* j1.serialize()
      const j2 = yield* makeJournal
      yield* j2.restore(ser)
      const rows = yield* j2.rows("run-ser")
      expect(rows.length).toBe(2)
      expect(yield* j2.verify("run-ser")).toBe(true)
    }))

  it.effect("InMemory isolation: two journals do not share rows", () =>
    Effect.gen(function* () {
      const j1 = yield* makeJournal
      const j2 = yield* makeJournal
      yield* j1.append({ run: "r1", node: "A", kind: "verdict", verdict: "PASS", evidence: { pattern: "p", state: "s", anchor: "a" }, source: "workflow/wf/A" })
      const rows2 = yield* j2.rows("r1")
      expect(rows2.length).toBe(0)
    }))
})
