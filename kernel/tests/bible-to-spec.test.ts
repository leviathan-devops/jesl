import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect, Layer, Clock } from "effect"
import { makeJournal, Journal, verifyChain, simpleHashExport, canonicalSerializeExport } from "../core/journal"
import { decodeDoc, validateDoc } from "../core/schema"
import { runBibleToSpecSimple, digestBible, lintMathContracts, gateDPL1Spec } from "../kernels/bible-to-spec/activities"
import bibleValid from "../kernels/bible-to-spec/fixtures/bible-valid.json" with { type: "json" }
import bibleMathBad from "../kernels/bible-to-spec/fixtures/bible-math-bad.json" with { type: "json" }
import bibleMinimal from "../kernels/bible-to-spec/fixtures/bible-minimal.json" with { type: "json" }
import workflowJson from "../kernels/bible-to-spec/workflow.json" with { type: "json" }

describe("bible-to-spec kernel — F19 #2", () => {
  it.effect("happy bible → spec via runBibleToSpecSimple with DPL1 gate PASS", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const spec = yield* runBibleToSpecSimple(bibleValid as any).pipe(Effect.provide(layer))
      expect(spec.$schema).toBe("trident-workflow-v1")
      expect(spec.meta.name).toBe("bible-valid-spec")
      expect(spec.nodes.length).toBeGreaterThan(0)
      const decoded = yield* decodeDoc(spec as any).pipe(Effect.provide(layer))
      expect(decoded.meta.name).toBe(spec.meta.name)
      // journal chain intact
      const rows: readonly any[] = yield* journal.allRows().pipe(Effect.provide(layer))
      expect(rows.length).toBeGreaterThan(0)
      const ok = yield* journal.verify().pipe(Effect.provide(layer))
      expect(ok).toBe(true)
      const hasDigest = rows.some((r: any) => r.node === "digest" && r.evidence?.pattern === "bible.digest")
      const hasFr = rows.some((r: any) => r.node === "fr-extract")
      const hasLint = rows.some((r: any) => r.node === "math-lint")
      const hasGate = rows.some((r: any) => r.node === "template-gate")
      expect(hasDigest).toBe(true)
      expect(hasFr).toBe(true)
      expect(hasLint).toBe(true)
      expect(hasGate).toBe(true)
      // workflow shape
      expect(workflowJson.$schema).toBe("trident-workflow-v1")
      expect(workflowJson.meta.name).toBe("bible-to-spec")
      expect(workflowJson.nodes.length).toBe(5)
      expect(workflowJson.edges.length).toBe(4)
    }))

  it.effect("missing bible → structured error [JESL CHANNEL-UNSET]", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const res: any = yield* runBibleToSpecSimple(null as any).pipe(Effect.either, Effect.provide(layer))
      expect(res._tag).toBe("Left")
      const err: any = res.left
      expect(err.code).toBe("[JESL CHANNEL-UNSET]")
      expect(err.node).toBe("digest")
      expect(err.field).toBe("bible")
      const rows: readonly any[] = yield* journal.allRows().pipe(Effect.provide(layer))
      // at least one invoke row before fail
      expect(rows.length).toBeGreaterThan(0)
    }))

  it.effect("math-contract lint catches bad expression via lintMathContracts", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const res: any = yield* lintMathContracts(bibleMathBad as any).pipe(Effect.either, Effect.provide(layer))
      expect(res._tag).toBe("Left")
      const err: any = res.left
      expect(err.code).toBe("[JESL UNKNOWN-NODE]")
      expect(err.field).toBe("config.math")
      expect(err.node).toBe("broken")
      expect(String(err.actual)).toBe("@@@invalid math ((")
      const rows: readonly any[] = yield* journal.allRows().pipe(Effect.provide(layer))
      const failRow = rows.find((r: any) => r.node === "math-lint" && r.verdict === "FAIL")
      expect(failRow).toBeDefined()
    }))

  it.effect("journal chain intact across digest→FR→lint→gate", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const spec = yield* runBibleToSpecSimple(bibleMinimal as any).pipe(Effect.provide(layer))
      expect(spec.$schema).toBe("trident-workflow-v1")
      const rows: readonly any[] = yield* journal.allRows().pipe(Effect.provide(layer))
      expect(rows.length).toBeGreaterThanOrEqual(6)
      const ok = yield* journal.verify().pipe(Effect.provide(layer))
      expect(ok).toBe(true)
      const chainOk = verifyChain(rows)
      expect(chainOk).toBe(true)
      for (let i = 0; i < rows.length; i++) {
        const expectedPrev = i === 0 ? "genesis" : rows[i - 1].self
        expect(rows[i].prev).toBe(expectedPrev)
        expect(rows[i].seq).toBe(i)
      }
      const sources = rows.map((r: any) => r.source)
      for (const s of sources) expect(s).toContain("workflow/bible-to-spec/")
    }))

  it.effect("digest hash + inventory correct and template gate validates spec", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const digest = yield* digestBible(bibleValid as any).pipe(Effect.provide(layer))
      expect(digest.hash.length).toBeGreaterThan(16)
      const expectedHash = simpleHashExport(canonicalSerializeExport(bibleValid as any))
      expect(digest.hash).toBe(expectedHash)
      expect(digest.inventory.nodeCount).toBe(3)
      expect(digest.inventory.edgeCount).toBe(2)
      expect(digest.inventory.nodeIds).toEqual(["intro", "auth", "billing"])
      expect(digest.inventory.name).toBe("bible-valid")
      // gate a hand-built candidate via gateDPL1Spec
      const candidate = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "candidate-spec", tier: 1 as const },
        nodes: [{ id: "a", type: "gate" }],
        edges: []
      }
      const gated = yield* gateDPL1Spec(candidate as any).pipe(Effect.provide(layer))
      expect(gated.meta.name).toBe("candidate-spec")
      expect(gated.$schema).toBe("trident-workflow-v1")
      // bad candidate refused
      const bad: any = { $schema: "trident-workflow-v1", meta: { name: "bad", tier: 1 }, nodes: [], edges: [] }
      const badRes: any = yield* gateDPL1Spec(bad as any).pipe(Effect.either, Effect.provide(layer))
      expect(badRes._tag).toBe("Left")
    }))

  it.effect("workflow.json validates via WorkflowCodec", () =>
    Effect.gen(function* () {
      const doc: any = yield* decodeDoc(workflowJson as any)
      expect(doc.$schema).toBe("trident-workflow-v1")
      expect(doc.meta.name).toBe("bible-to-spec")
      const res: any = yield* validateDoc(doc, (k: string) => ["gate", "journal-sink"].includes(k)).pipe(Effect.either)
      expect(res._tag).toBe("Right")
    }))
})
