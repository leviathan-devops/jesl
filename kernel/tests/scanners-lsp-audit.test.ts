// @ts-nocheck
import { describe, it, expect } from "@effect/vitest"
import { Effect, Ref, Layer } from "effect"
import { makeBus, Bus } from "../core/bus"
import { makeJournal, Journal } from "../core/journal"
import { InMemoryLsp, attachLspScanner } from "../scanners/lsp"
import { attachAuditScanner } from "../scanners/audit"
import { attachTraceScanner } from "../scanners/trace"

describe("scanners lsp audit trace F15b", () => {
  // @ts-ignore
  it.effect("LSP with InMemoryLsp bound -> write produces lsp.diagnostics + journal", () =>
    Effect.gen(function* () {
      const bus: any = yield* (makeBus as any)
      const journal: any = yield* (makeJournal as any)
      const findings = [{ rule: "floatingEffect", message: "float" }]
      const lspLayer = InMemoryLsp(findings)
      const busLayer = Layer.succeed(Bus, bus)
      const journalLayer = Layer.succeed(Journal, journal)
      const combined: any = Layer.mergeAll(busLayer, journalLayer, lspLayer)
      const hits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachLspScanner as any)
        yield* (bus.subscribe("lsp.diagnostics", (e: any) => Effect.sync(() => hits.push(e))) as any)
        yield* (bus.emit("fs.write", { file: "src/a.ts" }, "run-lsp-1") as any)
      }).pipe(Effect.provide(combined) as any)
      yield* (prog as any)
      expect(hits.length).toBe(1)
      expect((hits[0].payload as any).available).toBe(true)
      expect((hits[0].payload as any).file).toBe("src/a.ts")
      expect((hits[0].payload as any).diagnostics).toEqual(findings)
      expect(hits[0].type).toBe("lsp.diagnostics")
      const rows: any[] = yield* (journal.rows("run-lsp-1") as any)
      expect(rows.some((r: any) => r.kind === "lsp.diagnostics")).toBe(true)
    }))

  // @ts-ignore
  it.effect("LSP with NO cap bound -> honest available:false + journal never crash", () =>
    Effect.gen(function* () {
      const bus: any = yield* (makeBus as any)
      const journal: any = yield* (makeJournal as any)
      const busLayer = Layer.succeed(Bus, bus)
      const journalLayer = Layer.succeed(Journal, journal)
      const combined: any = Layer.mergeAll(busLayer, journalLayer)
      const hits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachLspScanner as any)
        yield* (bus.subscribe("lsp.diagnostics", (e: any) => Effect.sync(() => hits.push(e))) as any)
        yield* (bus.emit("write", { file: "src/b.ts" }, "run-lsp-2") as any)
      }).pipe(Effect.provide(combined) as any)
      yield* (prog as any)
      expect(hits.length).toBe(1)
      expect((hits[0].payload as any).available).toBe(false)
      expect((hits[0].payload as any).tool).toBe("effect-lsp")
      const rows: any[] = yield* (journal.rows("run-lsp-2") as any)
      expect(rows.length).toBe(1)
      expect(rows[0].evidence?.state).toBe("unavailable")
    }))

  // @ts-ignore
  it.effect("audit: verdict WITH evidence triplet -> no violation", () =>
    Effect.gen(function* () {
      const bus: any = yield* (makeBus as any)
      const busLayer = Layer.succeed(Bus, bus)
      const hits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachAuditScanner as any)
        yield* (bus.subscribe("audit.violation", (e: any) => Effect.sync(() => hits.push(e))) as any)
        yield* (bus.emit("node.verdict", { node: "n1", verdict: "PASS", evidence: { pattern: "p", state: "s", anchor: "a:1" } }, "run-audit-1") as any)
      }).pipe(Effect.provide(busLayer) as any)
      yield* (prog as any)
      expect(hits.length).toBe(0)
    }))

  // @ts-ignore
  it.effect("audit: verdict WITHOUT evidence -> audit.violation", () =>
    Effect.gen(function* () {
      const bus: any = yield* (makeBus as any)
      const busLayer = Layer.succeed(Bus, bus)
      const hits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachAuditScanner as any)
        yield* (bus.subscribe("audit.violation", (e: any) => Effect.sync(() => hits.push(e))) as any)
        yield* (bus.emit("node.verdict", { node: "n2", verdict: "PASS" }, "run-audit-2") as any)
      }).pipe(Effect.provide(busLayer) as any)
      yield* (prog as any)
      expect(hits.length).toBe(1)
      expect(hits[0].type).toBe("audit.violation")
      expect((hits[0].payload as any).originalType).toBe("node.verdict")
    }))

  // @ts-ignore
  it.effect("audit: incomplete triplet -> violation", () =>
    Effect.gen(function* () {
      const bus: any = yield* (makeBus as any)
      const busLayer = Layer.succeed(Bus, bus)
      const hits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachAuditScanner as any)
        yield* (bus.subscribe("audit.violation", (e: any) => Effect.sync(() => hits.push(e))) as any)
        yield* (bus.emit("run.verdict", { evidence: { pattern: "p", state: "s" } }, "run-audit-3") as any)
      }).pipe(Effect.provide(busLayer) as any)
      yield* (prog as any)
      expect(hits.length).toBe(1)
    }))

  // @ts-ignore
  it.effect("trace: 3 nodes lifecycle -> trace.timeline with 3 entries durations >=0", () =>
    Effect.gen(function* () {
      const bus: any = yield* (makeBus as any)
      const busLayer = Layer.succeed(Bus, bus)
      const hits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachTraceScanner as any)
        yield* (bus.subscribe("trace.timeline", (e: any) => Effect.sync(() => hits.push(e))) as any)
        const run = "run-trace-1"
        yield* (bus.emit("node.invoke", { node: "n1" }, run) as any)
        yield* (bus.emit("node.invoke", { node: "n2" }, run) as any)
        yield* (bus.emit("node.invoke", { node: "n3" }, run) as any)
        yield* (bus.emit("node.verdict", { node: "n1" }, run) as any)
        yield* (bus.emit("node.verdict", { node: "n2" }, run) as any)
        yield* (bus.emit("node.verdict", { node: "n3" }, run) as any)
        yield* (bus.emit("run.close", {}, run) as any)
      }).pipe(Effect.provide(busLayer) as any)
      yield* (prog as any)
      expect(hits.length).toBe(1)
      const payload: any = hits[0].payload
      expect(payload.timeline.length).toBe(3)
      for (const ent of payload.timeline) {
        expect(ent.duration).toBeGreaterThanOrEqual(0)
        expect(typeof ent.started).toBe("number")
        expect(typeof ent.finished).toBe("number")
      }
    }))

  // @ts-ignore
  it.effect("three scanners coexist without cross-talk", () =>
    Effect.gen(function* () {
      const bus: any = yield* (makeBus as any)
      const busLayer = Layer.succeed(Bus, bus)
      const lspHits: any[] = []
      const auditHits: any[] = []
      const traceHits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachLspScanner as any)
        yield* (attachAuditScanner as any)
        yield* (attachTraceScanner as any)
        yield* (bus.subscribe("lsp.diagnostics", (e: any) => Effect.sync(() => lspHits.push(e))) as any)
        yield* (bus.subscribe("audit.violation", (e: any) => Effect.sync(() => auditHits.push(e))) as any)
        yield* (bus.subscribe("trace.timeline", (e: any) => Effect.sync(() => traceHits.push(e))) as any)
        yield* (bus.emit("tool.call.bash", { cmd: "ls" }, "run-coexist") as any)
        yield* (bus.emit("pba.family.hit", { family: "X" }, "run-coexist") as any)
        yield* (bus.emit("pta.intercept", {}, "run-coexist") as any)
      }).pipe(Effect.provide(busLayer) as any)
      yield* (prog as any)
      expect(lspHits.length).toBe(0)
      expect(auditHits.length).toBe(0)
      expect(traceHits.length).toBe(0)
    }))

  // @ts-ignore
  it.effect("detachAll cleans all three", () =>
    Effect.gen(function* () {
      const bus: any = yield* (makeBus as any)
      const busLayer = Layer.succeed(Bus, bus)
      const hits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachLspScanner as any)
        yield* (attachAuditScanner as any)
        yield* (attachTraceScanner as any)
        yield* (bus.subscribe("lsp.diagnostics", (e: any) => Effect.sync(() => hits.push(e))) as any)
        yield* (bus.detachAll() as any)
        yield* (bus.emit("fs.write", { file: "src/c.ts" }, "run-detach") as any)
        yield* (bus.emit("node.verdict", { node: "n" }, "run-detach") as any)
      }).pipe(Effect.provide(busLayer) as any)
      yield* (prog as any)
      expect(hits.length).toBe(0)
      const subs: any = yield* (Ref.get(bus._subsRef) as any)
      expect(subs.size).toBe(0)
    }))

  // @ts-ignore
  it.effect("scanner crash is bus-isolated", () =>
    Effect.gen(function* () {
      const bus: any = yield* (makeBus as any)
      const busLayer = Layer.succeed(Bus, bus)
      const goodHits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachLspScanner as any)
        yield* (bus.subscribe("fs.write", () => Effect.die(new Error("boom"))) as any)
        yield* (bus.subscribe("lsp.diagnostics", (e: any) => Effect.sync(() => goodHits.push(e))) as any)
        const exit: any = yield* Effect.exit(bus.emit("fs.write", { file: "src/crash.ts" }, "run-crash") as any)
        expect(exit._tag).toBe("Success")
      }).pipe(Effect.provide(busLayer) as any)
      yield* (prog as any)
      expect(goodHits.length).toBe(1)
      expect((goodHits[0].payload as any).available).toBe(false)
    }))

  // @ts-ignore
  it.effect("LSP payload shape tool available:false is DIAGNOSTIC-TOKEN-SHAPED", () =>
    Effect.gen(function* () {
      const bus: any = yield* (makeBus as any)
      const busLayer = Layer.succeed(Bus, bus)
      const hits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachLspScanner as any)
        yield* (bus.subscribe("lsp.diagnostics", (e: any) => Effect.sync(() => hits.push(e))) as any)
        yield* (bus.emit("file.write", { path: "src/d.ts" }, "run-shape") as any)
      }).pipe(Effect.provide(busLayer) as any)
      yield* (prog as any)
      expect(hits.length).toBe(1)
      const p: any = hits[0].payload
      expect(p.tool).toBe("effect-lsp")
      expect(typeof p.available).toBe("boolean")
      expect(p.available).toBe(false)
    }))
})
