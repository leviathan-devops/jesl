import { describe, it, expect } from "@effect/vitest"
import { Effect, Layer, Context } from "effect"
import { makeJournal, Journal, verifyChain } from "../core/journal"
import { decodeDoc, validateDoc } from "../core/schema"
import { runIdeaToBible, makeStubLlmLayer, exploreOne, mergeToBible, schemaGateBible, buildNodeHandles, type ExploreResult } from "../kernels/idea-to-bible/activities"
import { runProgram } from "../core/executor"
import type { WorkflowDoc } from "../core/schema"
import * as Fs from "node:fs"
import * as Path from "node:path"
import { fileURLToPath } from "node:url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = Path.dirname(__filename)
const sampleIdea = Fs.readFileSync(Path.resolve(__dirname, "../kernels/idea-to-bible/fixtures/sample-idea.txt"), "utf-8").trim()
const expectedBibleRaw = JSON.parse(Fs.readFileSync(Path.resolve(__dirname, "../kernels/idea-to-bible/fixtures/expected-bible.json"), "utf-8"))
const workflowRaw = JSON.parse(Fs.readFileSync(Path.resolve(__dirname, "../kernels/idea-to-bible/workflow.json"), "utf-8"))

describe("idea-to-bible kernel", () => {
  it.effect("happy-path idea -> bible schema-gate passes", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const runId = "test-happy-001"
      const layer = Layer.merge(Layer.succeed(Journal, journal), makeStubLlmLayer())
      const bible = yield* runIdeaToBible(sampleIdea, { runId }).pipe(Effect.provide(layer))
      expect(bible.$schema).toBe("trident-workflow-v1")
      expect(bible.meta.name.startsWith("bible-")).toBe(true)
      expect(bible.nodes.length).toBe(4)
      expect(bible.edges.length).toBe(3)
      const decoded = yield* decodeDoc(bible as unknown)
      expect(decoded.$schema).toBe("trident-workflow-v1")
      const isKnown = (k: string) => ["gate", "event-filter", "machine", "journal-sink", "triplet-writer", "parallel", "prompt", "shell-exec", "capture-engine", "oracle-gate", "state-machine", "pipeline", "retry-chain", "fallback-chain", "pause", "circuit-breaker"].includes(k)
      const v = yield* validateDoc(decoded as any, isKnown).pipe(Effect.either)
      expect(v._tag).toBe("Right")
      const rows = yield* journal.rows(runId).pipe(Effect.provide(layer))
      expect(rows.length).toBeGreaterThanOrEqual(14)
      const ok = yield* journal.verify(runId).pipe(Effect.provide(layer))
      expect(ok).toBe(true)
    }))

  it.effect("blank idea -> structured error [JESL CHANNEL-UNSET]", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const runId = "test-blank-002"
      const layer = Layer.merge(Layer.succeed(Journal, journal), makeStubLlmLayer())
      const res = yield* runIdeaToBible("", { runId }).pipe(Effect.provide(layer), Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(err.code).toBe("[JESL CHANNEL-UNSET]")
        expect(err.node).toBe("validate-idea")
        expect(err.field).toBe("idea")
        expect(err.remedy).toContain("non-empty")
      }
      const rows = yield* journal.rows(runId).pipe(Effect.provide(layer))
      expect(rows.some((r: any) => r.node === "validate-idea" && r.verdict === "FAIL")).toBe(true)
      const res2 = yield* runIdeaToBible("   ", { runId: "test-blank-002b" }).pipe(Effect.provide(layer), Effect.either)
      expect(res2._tag).toBe("Left")
    }))

  it.effect("journal chain intact post-run sha256 verified", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const runId = "test-chain-003"
      const layer = Layer.merge(Layer.succeed(Journal, journal), makeStubLlmLayer())
      yield* runIdeaToBible(sampleIdea, { runId }).pipe(Effect.provide(layer))
      const rows = yield* journal.rows(runId).pipe(Effect.provide(layer))
      expect(rows.length).toBeGreaterThanOrEqual(14)
      expect(rows[0]!.prev).toBe("genesis")
      for (let i = 1; i < rows.length; i++) expect(rows[i]!.prev).toBe(rows[i - 1]!.self)
      expect(verifyChain(rows as any)).toBe(true)
      const ok = yield* journal.verify(runId).pipe(Effect.provide(layer))
      expect(ok).toBe(true)
      const expectedNodes = ["validate-idea", "explore-domain", "explore-constraints", "explore-value", "merge-bible", "schema-gate", "journal-sink"]
      for (const n of expectedNodes) expect(rows.some((r: any) => r.node === n)).toBe(true)
      const invokeRows = rows.filter((r: any) => r.kind === "invoke")
      const verdictRows = rows.filter((r: any) => r.kind === "verdict")
      expect(invokeRows.length).toBe(verdictRows.length)
    }))

  it.effect("parallel explore fan-out via stub Llm returns 3 structured results", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const runId = "test-parallel-004"
      const scripted: Record<string, ExploreResult> = {
        domain: { angle: "domain", findings: ["domain: custom-scripted", "entity: Foo"], confidence: 0.99, anchor: "explore:domain:scripted" },
        constraints: { angle: "constraints", findings: ["constraint: custom"], confidence: 0.95, anchor: "explore:constraints:scripted" },
        value: { angle: "value", findings: ["value: custom"], confidence: 0.96, anchor: "explore:value:scripted" }
      }
      const layer = Layer.merge(Layer.succeed(Journal, journal), makeStubLlmLayer(scripted))
      const results = yield* Effect.forEach(["domain", "constraints", "value"], (a) => exploreOne(a, sampleIdea, runId), { concurrency: 15 }).pipe(Effect.provide(layer))
      expect(results.length).toBe(3)
      expect(results[0]!.angle).toBe("domain")
      expect(results[1]!.angle).toBe("constraints")
      expect(results[2]!.angle).toBe("value")
      expect(results[0]!.anchor).toBe("explore:domain:scripted")
      expect(results[0]!.findings.length).toBeGreaterThan(0)
      const bible = yield* mergeToBible(sampleIdea, results as any, runId).pipe(Effect.provide(layer))
      expect(bible.meta.name.startsWith("bible-")).toBe(true)
      expect((bible as any).exploreResults.length).toBe(3)
      const gated = yield* schemaGateBible(bible, runId).pipe(Effect.provide(layer))
      expect(gated.$schema).toBe("trident-workflow-v1")
    }))

  it.effect("workflow.json shape is valid trident-workflow-v1 and fixtures load", () =>
    Effect.gen(function* () {
      expect(workflowRaw.$schema).toBe("trident-workflow-v1")
      expect(workflowRaw.meta.name).toBe("idea-to-bible")
      expect(workflowRaw.meta.tier).toBe(2)
      expect(workflowRaw.nodes.length).toBe(7)
      expect(workflowRaw.edges.length).toBe(8)
      const doc = yield* decodeDoc(workflowRaw as unknown)
      expect(doc.nodes.length).toBe(7)
      const isKnown = (k: string) => ["gate", "prompt", "journal-sink"].includes(k)
      const v = yield* validateDoc(doc as any, isKnown).pipe(Effect.either)
      expect(v._tag).toBe("Right")
      expect(expectedBibleRaw.$schema).toBe("trident-workflow-v1")
      expect(expectedBibleRaw.nodes.length).toBe(4)
      expect(sampleIdea.length).toBeGreaterThan(20)
      const expectedDecoded = yield* decodeDoc(expectedBibleRaw as unknown)
      expect(expectedDecoded.meta.name).toBe("bible-from-idea")
    }))

  it.effect("runProgram via workflow.json executes with nodeHandles", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const runId = "test-workflow-exec-006"
      const idea = sampleIdea
      const doc = yield* decodeDoc(workflowRaw as unknown) as WorkflowDoc
      const handles = buildNodeHandles(idea, runId)
      const layer = Layer.merge(Layer.succeed(Journal, journal), makeStubLlmLayer())
      const ctx: any = {
        runId,
        doc,
        vars: { idea },
        nodeHandles: handles,
        caps: Context.empty(),
        clock: { currentTimeMillis: Effect.sync(() => Date.now()) } as any,
        budget: { startedAt: Date.now(), deadlineMs: 600000, maxNodesFiring: 15 },
        boundCaps: new Set<string>(),
        capsRequirements: {}
      }
      const summary: any = yield* runProgram(doc as any, ctx).pipe(Effect.provide(layer) as any)
      expect(summary.results["validate-idea"].verdict).toBe("PASS")
      expect(summary.batches.length).toBeGreaterThanOrEqual(1)
      expect(Object.keys(summary.results).length).toBeGreaterThanOrEqual(5)
    }))
})
