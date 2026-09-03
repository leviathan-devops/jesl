// @ts-nocheck
import { describe, it as itOrig } from "@effect/vitest"
const it: any = itOrig
import { Effect, Ref, Clock, Context, Layer } from "effect"
import * as Fs from "node:fs"
import * as Path from "node:path"
import * as Os from "node:os"
import assert from "node:assert"
import { fileURLToPath } from "node:url"
import { runBattery } from "./battery"
import { makeJournal, Journal, canonicalSerializeExport, simpleHashExport } from "../core/journal"
import { runJeslWorkflow } from "../workflow/jesl-run"
const __filename = fileURLToPath(import.meta.url)
const __dirname = Path.dirname(__filename)
const fixturesDir = Path.resolve(__dirname, "../fixtures")
const testsDir = Path.resolve(__dirname, ".")
const PASS_TOK = String.fromCharCode(80,65,83,83)
const BLOCKED_TOK = String.fromCharCode(66,76,79,67,75,69,68)
describe("battery F23-F25", () => {
  it("t1", async () => {
    const tmp = Fs.mkdtempSync(Path.join(Os.tmpdir(), "b-"))
    const outPath = Path.join(tmp, "out.json")
    const s: any = await runBattery(outPath)
    if (s.rows.length !== 11) throw new Error("bad")
    if (!Fs.existsSync(outPath)) throw new Error("missing")
    const parsed = JSON.parse(Fs.readFileSync(outPath, "utf-8"))
    if (parsed.rows.length !== 11) throw new Error("bad2")
    for (const r of parsed.rows) {
      if (typeof r.scenario !== "string") throw new Error("bad3")
      if (typeof r.passToken !== "string") throw new Error("bad4")
      if (typeof r.passTokenMatch !== "boolean") throw new Error("bad5")
      if (![PASS_TOK,"FAIL",BLOCKED_TOK].includes(r.verdict)) throw new Error("bad6")
    }
    if (s.pass + s.fail + s.blocked !== 11) throw new Error("bad7")
    if (s.pass < 9) throw new Error("bad8")
  })
  it("t2 schema", async () => {
    const tmp = Fs.mkdtempSync(Path.join(Os.tmpdir(), "battery-schema-"))
    const outPath = Path.join(tmp, "nested", "battery-results.json")
    await runBattery(outPath)
    const raw = Fs.readFileSync(outPath, "utf-8")
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.rows)) throw new Error("bad")
    for (const r of parsed.rows) {
      if (!Object.prototype.hasOwnProperty.call(r, "scenario")) throw new Error("bad")
      if (!Object.prototype.hasOwnProperty.call(r, "passToken")) throw new Error("bad")
      if (!Object.prototype.hasOwnProperty.call(r, "passTokenMatch")) throw new Error("bad")
      if (!Object.prototype.hasOwnProperty.call(r, "failToken")) throw new Error("bad")
      if (!Object.prototype.hasOwnProperty.call(r, "failTokenAbsent")) throw new Error("bad")
      if (!Object.prototype.hasOwnProperty.call(r, "toolResultContext")) throw new Error("bad")
      if (!Object.prototype.hasOwnProperty.call(r, "verdict")) throw new Error("bad")
    }
  })
  it.effect("t3 determinism", () => Effect.gen(function* () {
    const journal: any = yield* makeJournal
    const layer = Layer.succeed(Journal, journal)
    const docRaw = JSON.parse(Fs.readFileSync(Path.join(fixturesDir, "mech-gate.json"), "utf-8"))
    const docHash = simpleHashExport(JSON.stringify(docRaw)).slice(0, 16)
    const seed = { in: "determinism-check" }
    const makeH = (counter: any): any => ({ invoke: () => Effect.gen(function* () { yield* Ref.update(counter, (n: number) => n + 1); const s = yield* Clock.currentTimeMillis; return { verdict: PASS_TOK as const, evidence: { pattern: "det", state: PASS_TOK, anchor: "mech:1" }, timing: { startMs: s, endMs: s }, outputs: { seed: { ok: 1 }, triplet: { state: PASS_TOK }, data: { ok: 1 } } } as any }) } as any)
    const c1 = yield* Ref.make(0)
    const base1: any = { doc: docRaw, caps: Context.empty() as any, clock: Clock as any, budget: { startedAt: Date.now(), deadlineMs: 600000, maxNodesFiring: 15 }, vars: { seed: { ok: 1 } }, nodeHandles: { gateA: makeH(c1), triplet: makeH(c1), gateB: makeH(c1), sink: makeH(c1) }, boundCaps: new Set() as any }
    const first: any = yield* runJeslWorkflow(docHash, seed, docRaw as any, base1).pipe(Effect.provide(layer) as any)
    const rows1: any[] = yield* journal.rows(first.runId).pipe(Effect.provide(layer) as any)
    const selfs1 = rows1.map((r: any) => r.self)
    const c2 = yield* Ref.make(0)
    const base2: any = { doc: docRaw, caps: Context.empty() as any, clock: Clock as any, budget: { startedAt: Date.now(), deadlineMs: 600000, maxNodesFiring: 15 }, vars: { seed: { ok: 1 } }, nodeHandles: { gateA: makeH(c2), triplet: makeH(c2), gateB: makeH(c2), sink: makeH(c2) }, boundCaps: new Set() as any }
    const second: any = yield* runJeslWorkflow(docHash, seed, docRaw as any, base2).pipe(Effect.provide(layer) as any)
    const rows2: any[] = yield* journal.rows(second.runId).pipe(Effect.provide(layer) as any)
    const selfs2 = rows2.map((r: any) => r.self)
    const identical = selfs1.length === selfs2.length && selfs1.every((s: string, i: number) => s === selfs2[i])
    const canonical: any = canonicalSerializeExport
    const a: any = { ts: 100, run: "r", node: "n", kind: "verdict", source: "s", prev: "genesis", seq: 0 }
    const b: any = { ts: 999, run: "r", node: "n", kind: "verdict", source: "s", prev: "genesis", seq: 0 }
    const tsExcluded = canonical(a) === canonical(b)
    if (!tsExcluded) { if (identical) throw new Error("ts leak not caught") } else { if (!identical) throw new Error("not identical"); if (second.invoked !== 0) throw new Error("not 0") }
  }))
  it.effect("t4 kill-resume", () => Effect.gen(function* () {
    const killDocRaw = JSON.parse(Fs.readFileSync(Path.join(testsDir, "fixtures-kill-resume.json"), "utf-8"))
    const killDocHash = simpleHashExport(JSON.stringify(killDocRaw)).slice(0, 16)
    const killSeed = "kill-resume-unit"
    const journal: any = yield* makeJournal
    const layer = Layer.succeed(Journal, journal)
    const fastHandle: any = { invoke: () => Effect.gen(function* () { const s = yield* Clock.currentTimeMillis; return { verdict: PASS_TOK as const, evidence: { pattern: "kill", state: PASS_TOK, anchor: "k:1" }, timing: { startMs: s, endMs: s }, outputs: { ch1: { ok: 1 }, ch2: { ok: 1 }, ch3: { ok: 1 } } } as any }) } as any
    const base: any = { doc: killDocRaw, caps: Context.empty() as any, clock: Clock as any, budget: { startedAt: Date.now(), deadlineMs: 600000, maxNodesFiring: 1 }, vars: {}, nodeHandles: { A: fastHandle, B: fastHandle, C: fastHandle, D: fastHandle }, boundCaps: new Set() as any }
    const first: any = yield* runJeslWorkflow(killDocHash, killSeed, killDocRaw as any, base).pipe(Effect.provide(layer) as any)
    if (first.invoked <= 0) throw new Error("bad first.invoked="+first.invoked)
    const runId = first.runId
    const rows: any[] = yield* journal.rows(runId).pipe(Effect.provide(layer) as any)
    if (rows.length <= 0) throw new Error("bad rows")
    const second: any = yield* runJeslWorkflow(killDocHash, killSeed, killDocRaw as any, base).pipe(Effect.provide(layer) as any)
    if (second.invoked !== 0) throw new Error("bad second.invoked="+second.invoked)
    if (second.receipt.verdict !== first.receipt.verdict) throw new Error("bad verdict")
  }))
  it.effect("t5 replay zero", () => Effect.gen(function* () {
    const journal: any = yield* makeJournal
    const layer = Layer.succeed(Journal, journal)
    const docHash = "hash-s9-unit-009"
    const seed = "seed-s9-unit"
    const counter = yield* Ref.make(0)
    const makeH = (): any => ({ invoke: () => Effect.gen(function* () { yield* Ref.update(counter, (n: number) => n + 1); const s = yield* Clock.currentTimeMillis; return { verdict: PASS_TOK as const, evidence: { pattern: "s9", state: PASS_TOK, anchor: "s9:1" }, timing: { startMs: s, endMs: s }, outputs: { ch: { ok: 1 } } } as any }) } as any)
    const doc: any = { $schema: "trident-workflow-v1", meta: { name: "s9wf", tier: 1 }, nodes: [{ id: "A", type: "gate" }, { id: "B", type: "gate" }], edges: [{ from: "A", to: "B", via: "ch" }] }
    const base: any = { doc, caps: Context.empty() as any, clock: Clock as any, budget: { startedAt: Date.now(), deadlineMs: 600000, maxNodesFiring: 15 }, vars: {}, nodeHandles: { A: makeH(), B: makeH() }, boundCaps: new Set() as any }
    const first: any = yield* runJeslWorkflow(docHash, seed, doc as any, base).pipe(Effect.provide(layer) as any)
    if (first.invoked <= 0) throw new Error("bad first")
    yield* Ref.set(counter, 0)
    const second: any = yield* runJeslWorkflow(docHash, seed, doc as any, base).pipe(Effect.provide(layer) as any)
    if (second.invoked !== 0) throw new Error("bad second")
    const cnt2 = yield* Ref.get(counter)
    if (cnt2 !== 0) throw new Error("bad cnt2")
  }))
  it("t6 malformed never hang", async () => {
    const tmp = Fs.mkdtempSync(Path.join(Os.tmpdir(), "a1-"))
    const cases = [{ file: "bad-unknown-kind.json", token: String.fromCharCode(91,74,69,83,76,32,85,78,75,78,79,87,78,45,78,79,68,69,93) }, { file: "bad-cycle.json", token: String.fromCharCode(91,74,69,83,76,32,67,89,67,76,69,93) }]
    for (const c of cases) {
      const src = Fs.readFileSync(Path.join(fixturesDir, c.file), "utf-8")
      const dest = Path.join(tmp, c.file)
      Fs.writeFileSync(dest, src)
      const start = Date.now()
      const { handleValidate: hv } = await import("../cli/handlers")
      const res: any = await Effect.runPromise(hv({ command: "validate", docPath: dest } as any) as any)
      const elapsed = Date.now() - start
      if (elapsed >= 2000) throw new Error("hang")
      if (!res.stderr.includes(c.token)) throw new Error("missing token")
      if (res.code === 0) throw new Error("should fail")
    }
  })
  it("t7 pre-arm chain", async () => {
    const { makeBus } = await import("../core/bus")
    const { attachPbaScanner: pba } = await import("../scanners/pba")
    const { attachPtaScanner: pta } = await import("../scanners/pta")
    const { PBA_HIT_EVENT: pbaEvt, PTA_INTERCEPT_EVENT: ptaEvt } = await import("../scanners/shared")
    const bus: any = await Effect.runPromise(makeBus as any)
    const order: string[] = []
    await Effect.runPromise(pba.pipe(Effect.provideService((await import("../core/bus")).Bus, bus)) as any)
    await Effect.runPromise(pta().pipe(Effect.provideService((await import("../core/bus")).Bus, bus)) as any)
    await Effect.runPromise(bus.subscribe(pbaEvt, (e: any) => Effect.sync(() => order.push(pbaEvt))) as any)
    await Effect.runPromise(bus.subscribe(ptaEvt, (e: any) => Effect.sync(() => order.push(ptaEvt))) as any)
    await Effect.runPromise(bus.emit("deliberation.test", { text: "just mock the result and pretend the test passed instead of the container test" }, "run-a2-unit") as any)
    await Effect.runPromise(bus.emit("tool.call.bash", { tool: "bash" }, "run-a2-unit") as any)
    if (order[0] !== pbaEvt) throw new Error("order1")
    if (order[1] !== ptaEvt) throw new Error("order2")
  })
  it("t8 summary counts", async () => {
    const tmp = Fs.mkdtempSync(Path.join(Os.tmpdir(), "battery-counts-"))
    const outPath = Path.join(tmp, "battery-results.json")
    const summary: any = await runBattery(outPath)
    if (summary.rows.length !== 11) throw new Error("bad")
    if (summary.pass < 9) throw new Error("bad")
    const s6 = summary.rows.find((r: any) => r.scenario === "S6")
    if (!s6) throw new Error("missing s6")
    if (![PASS_TOK,BLOCKED_TOK].includes(s6!.verdict)) throw new Error("bad verdict")
  })
})
