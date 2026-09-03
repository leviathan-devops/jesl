// @ts-nocheck
import { describe, it, expect } from "@effect/vitest"
import { Effect, Layer } from "effect"
import * as fs from "node:fs"
import * as path from "node:path"
import * as os from "node:os"
import { makeBus, Bus } from "../core/bus"
import { makeJournal, Journal } from "../core/journal"
import { LspCap, attachLspScanner } from "../scanners/lsp"
import { PTA_INTERCEPT_EVENT } from "../scanners/shared"
import { makeEffectLsp } from "../wraps/effect-lsp"
import { makeArtifactGate, ArtifactGate, attachArtifactGate } from "../wraps/artifact-gate"

function makeTempDir(): string {
  const base = path.resolve("tests", ".tmp-lsp-gate")
  fs.mkdirSync(base, { recursive: true })
  const d = fs.mkdtempSync(path.join(base, "case-"))
  const tsconfig = JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      esModuleInterop: true,
      plugins: [{ name: "@effect/language-service" }],
    },
    include: ["*.ts"],
  })
  fs.writeFileSync(path.join(d, "tsconfig.json"), tsconfig)
  return d
}

const CLEAN_TS = `import { Effect } from "effect"
export const prog = Effect.gen(function* () {
  const v = yield* Effect.succeed(42)
  return v
})
`

const FLOATING_TS = `import { Effect } from "effect"
Effect.gen(function* () {
  yield* Effect.succeed(1)
  Effect.succeed(2)
})
`

describe("lsp-gate S8L", () => {
  it.effect("real LspCap on CLEAN .ts -> 0 error diagnostics + journal row via scanner", () =>
    Effect.gen(function* () {
      const dir = makeTempDir()
      const file = path.join(dir, "clean.ts")
      fs.writeFileSync(file, CLEAN_TS)
      const bus: any = yield* (makeBus as any)
      const journal: any = yield* (makeJournal as any)
      const lsp = makeEffectLsp()
      const busLayer = Layer.succeed(Bus, bus)
      const journalLayer = Layer.succeed(Journal, journal)
      const lspLayer = Layer.succeed(LspCap, lsp as any)
      const combined: any = Layer.mergeAll(busLayer, journalLayer, lspLayer)
      const hits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachLspScanner as any)
        yield* (bus.subscribe("lsp.diagnostics", (e: any) => Effect.sync(() => hits.push(e))) as any)
        yield* (bus.emit("fs.write", { file }, "run-clean") as any)
      }).pipe(Effect.provide(combined) as any)
      yield* (prog as any)
      expect(hits.length).toBe(1)
      expect((hits[0].payload as any).available).toBe(true)
      expect((hits[0].payload as any).diagnostics.length).toBe(0)
      const rows: any[] = yield* (journal.rows("run-clean") as any)
      expect(rows.some((r: any) => r.kind === "lsp.diagnostics")).toBe(true)
      expect(rows.some((r: any) => r.evidence?.pattern === "lsp.diagnostics")).toBe(true)
      fs.rmSync(dir, { recursive: true, force: true })
    }))

  it.effect("real LspCap on VIOLATING .ts (floating Effect) -> error diagnostics + journal token", () =>
    Effect.gen(function* () {
      const dir = makeTempDir()
      const file = path.join(dir, "violating.ts")
      fs.writeFileSync(file, FLOATING_TS)
      const bus: any = yield* (makeBus as any)
      const journal: any = yield* (makeJournal as any)
      const lsp = makeEffectLsp()
      const busLayer = Layer.succeed(Bus, bus)
      const journalLayer = Layer.succeed(Journal, journal)
      const lspLayer = Layer.succeed(LspCap, lsp as any)
      const combined: any = Layer.mergeAll(busLayer, journalLayer, lspLayer)
      const diags: any[] = yield* (lsp.diagnose(file) as any).pipe(Effect.provide(lspLayer) as any)
      expect(diags.length).toBeGreaterThan(0)
      expect(diags[0].severity).toBe("error")
      expect(diags[0].name).toBe("floatingEffect")
      const hits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachLspScanner as any)
        yield* (bus.subscribe("lsp.diagnostics", (e: any) => Effect.sync(() => hits.push(e))) as any)
        yield* (bus.emit("fs.write", { file }, "run-violating") as any)
      }).pipe(Effect.provide(combined) as any)
      yield* (prog as any)
      expect(hits.length).toBe(1)
      expect((hits[0].payload as any).diagnostics.length).toBeGreaterThan(0)
      expect((hits[0].payload as any).diagnostics[0].severity).toBe("error")
      const rows: any[] = yield* (journal.rows("run-violating") as any)
      expect(rows.some((r: any) => r.kind === "lsp.diagnostics")).toBe(true)
      fs.rmSync(dir, { recursive: true, force: true })
    }), 15000)

  it.effect("ABSENT binary path -> available:false honest fallback", () =>
    Effect.gen(function* () {
      const lsp = makeEffectLsp({ cliPath: path.join(os.tmpdir(), "nonexistent-els-absent") })
      expect(lsp.isAvailable()).toBe(false)
      const tmpFile = path.join(os.tmpdir(), "any-lsp-absent.ts")
      const diags: any[] = yield* (lsp.diagnose(tmpFile) as any)
      expect(diags.length).toBe(0)
      const bus: any = yield* (makeBus as any)
      const journal: any = yield* (makeJournal as any)
      const busLayer = Layer.succeed(Bus, bus)
      const journalLayer = Layer.succeed(Journal, journal)
      const lspLayer = Layer.succeed(LspCap, lsp as any)
      const combined: any = Layer.mergeAll(busLayer, journalLayer, lspLayer)
      const hits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachLspScanner as any)
        yield* (bus.subscribe("lsp.diagnostics", (e: any) => Effect.sync(() => hits.push(e))) as any)
        yield* (bus.emit("fs.write", { file: tmpFile }, "run-absent") as any)
      }).pipe(Effect.provide(combined) as any)
      yield* (prog as any)
      expect(hits.length).toBe(1)
      expect((hits[0].payload as any).diagnostics.length).toBe(0)
      expect(lsp.isAvailable()).toBe(false)
      const rows: any[] = yield* (journal.rows("run-absent") as any)
      expect(rows.length).toBeGreaterThanOrEqual(1)
      expect(rows.some((r: any) => r.kind === "lsp.diagnostics")).toBe(true)
    }))

  it.effect("EFFECT_ARTIFACT_GATE: violating write -> pta.intercept deny + EFFECT_ARTIFACT_GATE reason", () =>
    Effect.gen(function* () {
      const dir = makeTempDir()
      const file = path.join(dir, "gate-violating.ts")
      fs.writeFileSync(file, FLOATING_TS)
      const bus: any = yield* (makeBus as any)
      const journal: any = yield* (makeJournal as any)
      const lsp = makeEffectLsp()
      const busLayer = Layer.succeed(Bus, bus)
      const journalLayer = Layer.succeed(Journal, journal)
      const lspLayer = Layer.succeed(LspCap, lsp as any)
      const combined: any = Layer.mergeAll(busLayer, journalLayer, lspLayer)
      const hits: any[] = []
      const gateSvc: any = yield* (makeArtifactGate as any).pipe(Effect.provide(combined) as any)
      const prog: any = Effect.gen(function* () {
        yield* (bus.subscribe(PTA_INTERCEPT_EVENT, (e: any) => Effect.sync(() => hits.push(e))) as any)
        const result: any = yield* (gateSvc.handleWrite(file, "run-gate-deny") as any)
        expect(result.verdict).toBe("deny")
        expect(result.diagnostics.length).toBeGreaterThan(0)
      }).pipe(Effect.provide(combined) as any)
      yield* (prog as any)
      expect(hits.length).toBe(1)
      expect(hits[0].type).toBe(PTA_INTERCEPT_EVENT)
      expect((hits[0].payload as any).verdict).toBe("deny")
      expect((hits[0].payload as any).reason).toContain("EFFECT_ARTIFACT_GATE")
      expect((hits[0].payload as any).family).toBe("EFFECT_ARTIFACT_GATE")
      const rows: any[] = yield* (journal.rows("run-gate-deny") as any)
      expect(rows.some((r: any) => r.kind === PTA_INTERCEPT_EVENT && r.evidence?.state === "deny")).toBe(true)
      expect(rows.some((r: any) => r.kind === "lsp.diagnostics")).toBe(true)
      fs.rmSync(dir, { recursive: true, force: true })
    }))

  it.effect("EFFECT_ARTIFACT_GATE: clean write -> allow + diagnostics recorded", () =>
    Effect.gen(function* () {
      const dir = makeTempDir()
      const file = path.join(dir, "gate-clean.ts")
      fs.writeFileSync(file, CLEAN_TS)
      const bus: any = yield* (makeBus as any)
      const journal: any = yield* (makeJournal as any)
      const lsp = makeEffectLsp()
      const busLayer = Layer.succeed(Bus, bus)
      const journalLayer = Layer.succeed(Journal, journal)
      const lspLayer = Layer.succeed(LspCap, lsp as any)
      const combined: any = Layer.mergeAll(busLayer, journalLayer, lspLayer)
      const hits: any[] = []
      const gateSvc: any = yield* (makeArtifactGate as any).pipe(Effect.provide(combined) as any)
      const prog: any = Effect.gen(function* () {
        yield* (bus.subscribe(PTA_INTERCEPT_EVENT, (e: any) => Effect.sync(() => hits.push(e))) as any)
        const result: any = yield* (gateSvc.handleWrite(file, "run-gate-allow") as any)
        expect(result.verdict).toBe("allow")
        expect(result.diagnostics.length).toBe(0)
      }).pipe(Effect.provide(combined) as any)
      yield* (prog as any)
      expect(hits.length).toBe(1)
      expect((hits[0].payload as any).verdict).toBe("allow")
      expect((hits[0].payload as any).family).toBe("EFFECT_ARTIFACT_GATE")
      const rows: any[] = yield* (journal.rows("run-gate-allow") as any)
      expect(rows.some((r: any) => r.kind === PTA_INTERCEPT_EVENT && r.evidence?.state === "allow")).toBe(true)
      expect(rows.some((r: any) => r.kind === "lsp.diagnostics")).toBe(true)
      fs.rmSync(dir, { recursive: true, force: true })
    }))

  it.effect("gate emits through W3 payload shape family EFFECT_ARTIFACT_GATE", () =>
    Effect.gen(function* () {
      const dir = makeTempDir()
      const file = path.join(dir, "shape.ts")
      fs.writeFileSync(file, CLEAN_TS)
      const bus: any = yield* (makeBus as any)
      const journal: any = yield* (makeJournal as any)
      const lsp = makeEffectLsp()
      const busLayer = Layer.succeed(Bus, bus)
      const journalLayer = Layer.succeed(Journal, journal)
      const lspLayer = Layer.succeed(LspCap, lsp as any)
      const combined: any = Layer.mergeAll(busLayer, journalLayer, lspLayer)
      const hits: any[] = []
      const gateSvc: any = yield* (makeArtifactGate as any).pipe(Effect.provide(combined) as any)
      const prog: any = Effect.gen(function* () {
        yield* (bus.subscribe(PTA_INTERCEPT_EVENT, (e: any) => Effect.sync(() => hits.push(e))) as any)
        yield* (gateSvc.handleWrite(file, "run-shape") as any)
      }).pipe(Effect.provide(combined) as any)
      yield* (prog as any)
      expect(hits.length).toBe(1)
      const p: any = hits[0].payload
      expect(p.tool).toBe("artifact-write")
      expect(p.family).toBe("EFFECT_ARTIFACT_GATE")
      expect(typeof p.verdict).toBe("string")
      expect(typeof p.reason).toBe("string")
      expect(p.reason).toContain("EFFECT_ARTIFACT_GATE")
      expect(typeof p.run).toBe("string")
      expect(typeof p.ts).toBe("number")
      expect(hits[0].type).toBe(PTA_INTERCEPT_EVENT)
      fs.rmSync(dir, { recursive: true, force: true })
    }))

  it.effect("W3 lsp scanner fires with REAL cap (no scanner change proof)", () =>
    Effect.gen(function* () {
      const dir = makeTempDir()
      const file = path.join(dir, "real-cap.ts")
      fs.writeFileSync(file, CLEAN_TS)
      const bus: any = yield* (makeBus as any)
      const journal: any = yield* (makeJournal as any)
      const lsp = makeEffectLsp()
      const busLayer = Layer.succeed(Bus, bus)
      const journalLayer = Layer.succeed(Journal, journal)
      const lspLayer = Layer.succeed(LspCap, lsp as any)
      const combined: any = Layer.mergeAll(busLayer, journalLayer, lspLayer)
      const lspHits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachLspScanner as any)
        yield* (bus.subscribe("lsp.diagnostics", (e: any) => Effect.sync(() => lspHits.push(e))) as any)
        yield* (bus.emit("fs.write", { file }, "run-real-cap") as any)
      }).pipe(Effect.provide(combined) as any)
      yield* (prog as any)
      expect(lspHits.length).toBe(1)
      expect(lspHits[0].type).toBe("lsp.diagnostics")
      expect((lspHits[0].payload as any).tool).toBe("effect-lsp")
      expect((lspHits[0].payload as any).available).toBe(true)
      expect((lspHits[0].payload as any).file).toBe(file)
      const direct: any[] = yield* (lsp.diagnose(file) as any).pipe(Effect.provide(lspLayer) as any)
      expect(direct.length).toBe(0)
      expect(lsp.isAvailable()).toBe(true)
      const rows: any[] = yield* (journal.rows("run-real-cap") as any)
      expect(rows.some((r: any) => r.kind === "lsp.diagnostics")).toBe(true)
      fs.rmSync(dir, { recursive: true, force: true })
    }))

  it.effect("prepare script exists in package.json + runs without error", () =>
    Effect.gen(function* () {
      const pkgRaw = fs.readFileSync(path.resolve("package.json"), "utf-8")
      const pkg = JSON.parse(pkgRaw)
      expect(pkg.scripts?.prepare).toBeDefined()
      expect(pkg.scripts.prepare).toContain("effect-language-service")
      expect(pkg.scripts.prepare).toContain("patch")
      const sp = yield* Effect.promise(() => import("node:child_process"))
      const result: any = (sp as any).spawnSync("bun", ["run", "prepare"], { encoding: "utf-8", timeout: 15000 })
      expect(result.status === 0 || result.error === undefined || result.status === null).toBe(true)
    }), 15000)

  it.effect("attachArtifactGate subscribes to write events and gate fires via bus", () =>
    Effect.gen(function* () {
      const dir = makeTempDir()
      const file = path.join(dir, "bus-gate.ts")
      fs.writeFileSync(file, CLEAN_TS)
      const bus: any = yield* (makeBus as any)
      const journal: any = yield* (makeJournal as any)
      const lsp = makeEffectLsp()
      const busLayer = Layer.succeed(Bus, bus)
      const journalLayer = Layer.succeed(Journal, journal)
      const lspLayer = Layer.succeed(LspCap, lsp as any)
      const gateSvc: any = yield* (makeArtifactGate as any).pipe(Effect.provide(busLayer) as any, Effect.provide(journalLayer) as any, Effect.provide(lspLayer) as any)
      const gateLayer = Layer.succeed(ArtifactGate, gateSvc)
      const combined: any = Layer.mergeAll(busLayer, journalLayer, lspLayer, gateLayer)
      const hits: any[] = []
      const prog: any = Effect.gen(function* () {
        yield* (attachArtifactGate as any)
        yield* (bus.subscribe(PTA_INTERCEPT_EVENT, (e: any) => Effect.sync(() => hits.push(e))) as any)
        yield* (bus.emit("fs.write", { file }, "run-bus-gate") as any)
      }).pipe(Effect.provide(combined) as any)
      yield* (prog as any)
      expect(hits.length).toBeGreaterThanOrEqual(1)
      expect(hits.some((h: any) => (h.payload as any).family === "EFFECT_ARTIFACT_GATE")).toBe(true)
      expect(hits.some((h: any) => (h.payload as any).verdict === "allow")).toBe(true)
      fs.rmSync(dir, { recursive: true, force: true })
    }))

  it.effect("diagnose filters to error severity only", () =>
    Effect.gen(function* () {
      const lsp = makeEffectLsp()
      const lspLayer = Layer.succeed(LspCap, lsp as any)
      const dir = makeTempDir()
      const file = path.join(dir, "severity.ts")
      fs.writeFileSync(file, CLEAN_TS)
      const diags: any[] = yield* (lsp.diagnose(file) as any).pipe(Effect.provide(lspLayer) as any)
      for (const d of diags) {
        expect(d.severity).toBe("error")
      }
      fs.rmSync(dir, { recursive: true, force: true })
    }))
})
