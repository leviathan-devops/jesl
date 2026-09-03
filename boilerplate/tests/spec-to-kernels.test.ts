import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect, Layer, Clock } from "effect"
import * as Fs from "node:fs"
import * as Path from "node:path"
import { fileURLToPath } from "node:url"
import { makeJournal, Journal, verifyChain } from "../core/journal"
import { runSpecToKernels } from "../kernels/spec-to-kernels/activities"
import { decodeDoc, validateDoc } from "../core/schema"

const __filename = fileURLToPath(import.meta.url)
const __dirname = Path.dirname(__filename)
const fixturesDir = Path.resolve(__dirname, "../kernels/spec-to-kernels/fixtures")
const happyPath = Path.join(fixturesDir, "sample-spec.json")
const badPath = Path.join(fixturesDir, "bad-spec.json")
const bornOffPath = Path.join(fixturesDir, "born-off-spec.json")

function isKnownKind(k: string): boolean {
  const known = new Set([
    "event-filter", "capture-engine", "machine", "gate", "oracle-gate", "circuit-breaker",
    "state-machine", "journal-sink", "triplet-writer", "sqlite-sink", "replay-source",
    "pipeline", "parallel", "retry-chain", "fallback-chain", "pause", "cron-trigger",
    "event-reactivate", "ratio-classifier", "synapse", "intent-classifier",
    "escalation-memory", "evidence-gate", "layer-loader", "math-eval", "oracle-discharge",
    "claim-gate", "config-lock", "workflow-machine", "mpse-discharge", "evidence-machine",
    "audit-registry", "shell-exec", "python-exec", "http-request", "file-io", "prompt"
  ])
  return known.has(k)
}

describe("spec-to-kernels kernel — THE INSERTION D3", () => {
  it.effect("happy spec → kernel protos + stubs emitted (math-before-code)", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const out = yield* runSpecToKernels(happyPath, { runId: "specKernels-happy-001" }).pipe(Effect.provide(layer))
      expect(out.cards.length).toBeGreaterThanOrEqual(3)
      expect(Object.keys(out.kernel).length).toBe(out.cards.length)
      expect(Object.keys(out.stubs).length).toBe(out.cards.length)
      for (const c of out.cards) {
        const proto = out.kernel[c.id]
        expect(proto).toBeDefined()
        expect(proto.workflow).toBeDefined()
        const stub = out.stubs[c.id] as unknown as string
        expect(stub!.length).toBeGreaterThan(10)
        expect(stub).toContain(c.id)
      }
      expect(out.doc.$schema).toBe("trident-workflow-v1")
    }))

  it.effect("D17 EXCLUDED count asserted — born-off → EXCLUDED, not FAIL", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const out = yield* runSpecToKernels(happyPath, { runId: "specKernels-d17-002" }).pipe(Effect.provide(layer))
      expect(out.report.fail).toBe(0)
      expect(out.report.excluded).toBe(1)
      const excluded = out.report.rows.filter((r: any) => r.status === "EXCLUDED")
      expect(excluded.length).toBe(1)
      expect(excluded[0]!.nodeId).toBe("bornOff")
      expect(excluded[0]!.reason).toContain("EXCLUDED_BORN_OFF")
      expect(excluded[0]!.status).toBe("EXCLUDED")
      expect(excluded[0]!.status).not.toBe("FAIL")
    }))

  it.effect("born-off fixture also EXCLUDED (second proof)", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const out = yield* runSpecToKernels(bornOffPath, { runId: "specKernels-born-003" }).pipe(Effect.provide(layer))
      expect(out.report.excluded).toBe(1)
      expect(out.report.fail).toBe(0)
      const row = out.report.rows.find((r: any) => r.nodeId === "bornOff")
      expect(row).toBeDefined()
      expect(row!.status).toBe("EXCLUDED")
    }))

  it.effect("TestLive dry-run executes the emitted kernel doc (headless)", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const out = yield* runSpecToKernels(happyPath, { runId: "specKernels-dry-004" }).pipe(Effect.provide(layer))
      expect(Object.keys(out.dryRun).length).toBe(out.cards.length)
      for (const [kid, summary] of Object.entries(out.dryRun)) {
        expect(summary).toBeDefined()
        expect(summary.batches.length).toBeGreaterThanOrEqual(1)
        expect(Object.keys(summary.results).length).toBeGreaterThanOrEqual(1)
        for (const r of Object.values(summary.results)) {
          expect(r.verdict).not.toBe("FAIL")
          expect((r as any).evidence).toBeDefined()
          expect((r as any).evidence.anchor.length).toBeGreaterThan(0)
        }
        expect(summary.rows.length).toBeGreaterThan(0)
        const hasInvoke = summary.rows.some((row: any) => row.kind === "invoke")
        const hasVerdict = summary.rows.some((row: any) => row.kind === "verdict")
        expect(hasInvoke).toBe(true)
        expect(hasVerdict).toBe(true)
      }
    }))

  it.effect("bad spec → structured JeslError (loud-fail, no fallback artifact)", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const res = yield* runSpecToKernels(badPath, { runId: "specKernels-bad-005" }).pipe(Effect.either, Effect.provide(layer))
      expect(res._tag).toBe("Left")
      const err: any = (res as any).left
      expect(err.code).toBeDefined()
      expect(String(err.code)).toContain("[JESL")
      expect(String(err.code)).toContain("UNKNOWN-NODE")
      expect(err.node).toBeDefined()
      expect(err.field).toBeDefined()
      expect(err.remedy).toBeDefined()
    }))

  it.effect("journal chain intact — sha256 prev/self linked, source workflow/spec-to-kernels/<node>", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const runId = "specKernels-journal-006"
      const out = yield* runSpecToKernels(happyPath, { runId }).pipe(Effect.provide(layer))
      const rows = yield* journal.rows(runId).pipe(Effect.provide(layer))
      expect(rows.length).toBeGreaterThanOrEqual(9)
      const ok = yield* journal.verify(runId).pipe(Effect.provide(layer))
      expect(ok).toBe(true)
      expect(verifyChain(rows as any)).toBe(true)
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i]!.prev).toBe(rows[i - 1]!.self)
        expect(rows[i]!.seq).toBe(i)
      }
      const nodes = new Set(rows.map((r: any) => r.node))
      expect(nodes.has("spec-parse")).toBe(true)
      expect(nodes.has("calibrate")).toBe(true)
      expect(nodes.has("decompose")).toBe(true)
      expect(nodes.has("dry-run")).toBe(true)
      for (const r of rows) {
        expect(r.source).toContain("workflow/spec-to-kernels/")
      }
      expect(out.journalTail).toBe(rows[rows.length - 1]!.self)
    }))

  it.effect("workflow.json decodes and validates clean (known kinds, tier 1, acyclic)", () =>
    Effect.gen(function* () {
      const wfRaw = JSON.parse(Fs.readFileSync(Path.resolve(__dirname, "../kernels/spec-to-kernels/workflow.json"), "utf-8"))
      const doc = yield* decodeDoc(wfRaw)
      expect(doc.$schema).toBe("trident-workflow-v1")
      expect(doc.meta.name).toBe("spec-to-kernels")
      expect(doc.meta.tier).toBe(1)
      const res = yield* validateDoc(doc, isKnownKind).pipe(Effect.either)
      expect(res._tag).toBe("Right")
      expect(doc.nodes.length).toBe(5)
      expect(doc.edges.length).toBe(4)
    }))

  it.effect("output IS the macro kernel prototype — kernel proto shape per L2 §4.14", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const out = yield* runSpecToKernels(happyPath, { runId: "specKernels-proto-007" }).pipe(Effect.provide(layer))
      for (const proto of Object.values(out.kernel)) {
        const wf: any = (proto as any).workflow
        expect(wf.$schema).toBe("trident-workflow-v1")
        expect(wf.meta.tier).toBe(1)
        expect(Array.isArray(wf.nodes)).toBe(true)
        expect(wf.nodes.length).toBeGreaterThan(0)
        expect((proto as any).activity).toContain("Activity")
        expect((proto as any).nodeId).toBeDefined()
      }
    }))
})
