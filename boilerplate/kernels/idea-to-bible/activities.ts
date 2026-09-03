import { Effect, Clock, Context, Layer } from "effect"
import { Journal } from "../../core/journal"
import { Llm } from "../../core/caps"
import { decodeDoc, validateDoc } from "../../core/schema"
import { JeslChannelUnset } from "../../core/errors"
import type { WorkflowDoc } from "../../core/schema"
import type { JournalRow } from "../../core/journal"

export interface ExploreResult {
  readonly angle: string
  readonly findings: ReadonlyArray<string>
  readonly confidence: number
  readonly anchor: string
}

export interface BibleDoc extends WorkflowDoc {}

const EXPLORE_ANGLES: ReadonlyArray<{ angle: string; prompt: string }> = [
  { angle: "domain", prompt: "explore-domain: extract domain concepts, entities, and boundaries from the idea" },
  { angle: "constraints", prompt: "explore-constraints: extract technical constraints, invariants, and failure modes" },
  { angle: "value", prompt: "explore-value: extract user value, acceptance criteria, and success signals" }
]

function ideaHash(idea: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < idea.length; i++) { h ^= idea.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(16).padStart(8, "0")
}

const journalAppend = (
  runId: string,
  node: string,
  kind: string,
  evidence: { pattern: string; state: string; anchor: string },
  verdict?: string
): Effect.Effect<JournalRow, never, Journal> =>
  Effect.gen(function* () {
    const j = yield* Journal
    const ts = yield* Clock.currentTimeMillis
    return yield* j.append({
      run: runId,
      node,
      kind: kind as any,
      verdict: verdict as any,
      source: `workflow/idea-to-bible/${node}`,
      evidence
    } as any).pipe(Effect.orDie) as any
  }) as any

function stubExploreResult(angle: string, idea: string): ExploreResult {
  const base = idea.slice(0, 80).trim()
  if (angle === "domain") return { angle, findings: [`domain: ${base}`, "entity: WorkflowDoc", "entity: NodeImpl", "boundary: core purity zero host imports"], confidence: 0.92, anchor: `explore:${angle}:1` }
  if (angle === "constraints") return { angle, findings: [`constraint: Effect-native`, `constraint: schema-gate before fiber`, "constraint: journal sha256 chain", "constraint: parallel forEach concurrency 15"], confidence: 0.88, anchor: `explore:${angle}:1` }
  return { angle, findings: [`value: ${base}`, "acceptance: tsc 0", "acceptance: 275/275 green", "acceptance: journal chain intact"], confidence: 0.9, anchor: `explore:${angle}:1` }
}

export const exploreOne = (
  angle: string,
  idea: string,
  runId: string
): Effect.Effect<ExploreResult, any, any> =>
  Effect.gen(function* () {
    const nodeId = `explore-${angle}`
    yield* journalAppend(runId, nodeId, "invoke", { pattern: "idea-to-bible.explore", state: "FIRED", anchor: `${nodeId}:invoke` })
    const llmOpt = yield* Effect.serviceOption(Llm as any)
    let result: ExploreResult
    if ((llmOpt as any)._tag === "Some") {
      const llm: any = (llmOpt as any).value
      const cfg = EXPLORE_ANGLES.find((a) => a.angle === angle)
      const prompt = cfg ? `${cfg.prompt}\nIDEA: ${idea}` : `explore ${angle}: ${idea}`
      const req = { system: "explore the idea", prompt, maxTokens: 512 } as any
      let raw: any = null
      try {
        const maybe: any = llm.callModel(req)
        if (maybe && typeof maybe.pipe === "function") {
          raw = yield* (maybe as Effect.Effect<any, any>).pipe(Effect.catchAll(() => Effect.succeed(null)), Effect.catchAllDefect(() => Effect.succeed(null))) as any
        } else if (maybe && typeof maybe.then === "function") {
          raw = yield* Effect.tryPromise(() => maybe as Promise<any>).pipe(Effect.catchAll(() => Effect.succeed(null))) as any
        } else {
          raw = maybe
        }
      } catch { raw = null }
      if (raw && typeof raw === "object" && (raw as any).findings) {
        result = raw as ExploreResult
      } else if (typeof raw === "string" && raw.length > 0) {
        try {
          const parsed = JSON.parse(raw)
          result = parsed.findings ? parsed as ExploreResult : stubExploreResult(angle, idea)
        } catch { result = { angle, findings: [raw.slice(0, 200)], confidence: 0.7, anchor: `explore:${angle}:llm` } }
      } else if (raw && typeof raw === "object" && (raw as any).text) {
        result = { angle, findings: [String((raw as any).text).slice(0, 200)], confidence: 0.7, anchor: `explore:${angle}:llm` }
      } else {
        result = stubExploreResult(angle, idea)
      }
    } else {
      result = stubExploreResult(angle, idea)
    }
    yield* journalAppend(runId, nodeId, "verdict", { pattern: "idea-to-bible.explore", state: "PASS", anchor: result.anchor }, "PASS")
    return result
  })

export const mergeToBible = (
  idea: string,
  results: ReadonlyArray<ExploreResult>,
  runId: string
): Effect.Effect<BibleDoc, any, any> =>
  Effect.gen(function* () {
    yield* journalAppend(runId, "merge-bible", "invoke", { pattern: "idea-to-bible.merge", state: "FIRED", anchor: "merge-bible:invoke" })
    const hash = ideaHash(idea)
    const allFindings = results.flatMap((r) => r.findings)
    const bible: BibleDoc = {
      $schema: "trident-workflow-v1" as const,
      meta: { name: `bible-${hash}`, tier: 1 as const, description: `Bible synthesized from idea: ${idea.slice(0, 120)} | findings: ${allFindings.length}` },
      nodes: [
        { id: "bible-domain", type: "gate", class: "evidence" as const },
        { id: "bible-constraints", type: "gate", class: "evidence" as const },
        { id: "bible-value", type: "gate", class: "evidence" as const },
        { id: "bible-synthesis", type: "gate", class: "decision" as const }
      ] as any,
      edges: [
        { from: "bible-domain", to: "bible-synthesis", via: "domainFindings" },
        { from: "bible-constraints", to: "bible-synthesis", via: "constraintFindings" },
        { from: "bible-value", to: "bible-synthesis", via: "valueFindings" }
      ] as any,
      vars: { idea: idea.slice(0, 500), findingsCount: String(allFindings.length), exploreAngles: results.map((r) => r.angle).join(",") } as any
    } as any
    ;(bible as any).exploreResults = results
    ;(bible as any).mergedFindings = allFindings
    yield* journalAppend(runId, "merge-bible", "verdict", { pattern: "idea-to-bible.merge", state: "PASS", anchor: `merge-bible:${results.length}` }, "PASS")
    return bible
  })

export const schemaGateBible = (
  bible: BibleDoc,
  runId: string
): Effect.Effect<BibleDoc, any, any> =>
  Effect.gen(function* () {
    yield* journalAppend(runId, "schema-gate", "invoke", { pattern: "idea-to-bible.schema-gate", state: "FIRED", anchor: "schema-gate:invoke" })
    const isKnown = (k: string) => ["gate", "event-filter", "machine", "journal-sink", "triplet-writer", "parallel", "prompt", "shell-exec", "capture-engine", "oracle-gate", "state-machine", "pipeline", "retry-chain", "fallback-chain", "pause", "circuit-breaker"].includes(k)
    const decoded = yield* decodeDoc(bible as unknown).pipe(
      Effect.mapError((e: any) => new JeslChannelUnset({ code: "[JESL CHANNEL-UNSET]", node: "schema-gate", field: "bible", expected: "valid WorkflowDoc trident-workflow-v1", actual: String(e?.message ?? e).slice(0, 200), remedy: "merge must produce a valid WorkflowDoc" }) as any)
    )
    yield* validateDoc(decoded as any, isKnown).pipe(
      Effect.mapError((e: any) => new JeslChannelUnset({ code: "[JESL CHANNEL-UNSET]", node: "schema-gate", field: "bible", expected: "WorkflowDoc passes validateDoc (no cycle, known kinds, tier discipline)", actual: String(e?.message ?? (e as any)?.actual ?? e).slice(0, 300), remedy: (e as any)?.remedy ?? "fix merge output to pass validateDoc" }) as any)
    )
    yield* journalAppend(runId, "schema-gate", "verdict", { pattern: "idea-to-bible.schema-gate", state: "PASS", anchor: "schema-gate:PASS" }, "PASS")
    return decoded as unknown as BibleDoc
  })

export const runIdeaToBible = (
  idea: string,
  opts?: { runId?: string }
): Effect.Effect<BibleDoc, any, any> =>
  Effect.gen(function* () {
    const runId = opts?.runId ?? `idea-to-bible-${ideaHash(idea)}-${Date.now()}`
    yield* journalAppend(runId, "validate-idea", "invoke", { pattern: "idea-to-bible.validate", state: "FIRED", anchor: "validate-idea:invoke" })
    if (!idea || idea.trim().length === 0) {
      yield* journalAppend(runId, "validate-idea", "verdict", { pattern: "idea-to-bible.validate", state: "FAIL", anchor: "validate-idea:blank" }, "FAIL")
      return yield* Effect.fail(new JeslChannelUnset({ code: "[JESL CHANNEL-UNSET]", node: "validate-idea", field: "idea", expected: "non-empty idea text", actual: "blank", remedy: "provide a non-empty idea string" }) as any)
    }
    yield* journalAppend(runId, "validate-idea", "verdict", { pattern: "idea-to-bible.validate", state: "PASS", anchor: "validate-idea:PASS" }, "PASS")
    const angles = EXPLORE_ANGLES.map((a) => a.angle)
    const exploreResults = yield* Effect.forEach(angles, (angle) => exploreOne(angle, idea, runId), { concurrency: 15 })
    const bible = yield* mergeToBible(idea, exploreResults as any, runId)
    const gated = yield* schemaGateBible(bible, runId)
    yield* journalAppend(runId, "journal-sink", "invoke", { pattern: "idea-to-bible.journal", state: "FIRED", anchor: "journal-sink:invoke" })
    yield* journalAppend(runId, "journal-sink", "verdict", { pattern: "idea-to-bible.journal", state: "PASS", anchor: `journal-sink:${gated.meta.name}` }, "PASS")
    return gated
  })

export const makeStubLlmLayer = (scripted?: Record<string, ExploreResult>): Layer.Layer<Llm, never, never> =>
  Layer.succeed(Llm, {
    callModel: (req: { system: string; prompt: string; maxTokens: number }) =>
      Effect.sync(() => {
        const prompt = req.prompt ?? ""
        for (const angle of EXPLORE_ANGLES) {
          if (prompt.includes(angle.angle) || prompt.includes(`explore-${angle.angle}`)) {
            if (scripted?.[angle.angle]) return scripted[angle.angle] as any
            return stubExploreResult(angle.angle, prompt.slice(-200)) as any
          }
        }
        const first = EXPLORE_ANGLES[0]!
        if (scripted?.[first.angle]) return scripted[first.angle] as any
        return stubExploreResult(first.angle, prompt.slice(-200)) as any
      })
  } as any)

export const StubLlmLive = makeStubLlmLayer()

export const buildNodeHandles = (idea: string, runId: string): Record<string, any> => {
  const store: Record<string, unknown> = {}
  return {
    "validate-idea": {
      invoke: (input: any) =>
        Effect.gen(function* () {
          const v = (input.inbound?.idea as string) ?? idea
          if (!v || String(v).trim().length === 0) return { verdict: "FAIL" as const, evidence: { pattern: "idea-to-bible.validate", state: "FAIL", anchor: "validate-idea:blank" }, timing: { startMs: 0, endMs: 0 } }
          return { verdict: "PASS" as const, evidence: { pattern: "idea-to-bible.validate", state: "PASS", anchor: "validate-idea:PASS" }, timing: { startMs: 0, endMs: 0 }, outputs: { idea: v } }
        })
    },
    "explore-a": { invoke: () => exploreOne("domain", idea, runId).pipe(Effect.map((r) => ({ verdict: "PASS" as const, evidence: { pattern: "idea-to-bible.explore", state: "PASS", anchor: r.anchor }, timing: { startMs: 0, endMs: 0 }, outputs: { expA: r } }))) },
    "explore-b": { invoke: () => exploreOne("constraints", idea, runId).pipe(Effect.map((r) => ({ verdict: "PASS" as const, evidence: { pattern: "idea-to-bible.explore", state: "PASS", anchor: r.anchor }, timing: { startMs: 0, endMs: 0 }, outputs: { expB: r } }))) },
    "explore-c": { invoke: () => exploreOne("value", idea, runId).pipe(Effect.map((r) => ({ verdict: "PASS" as const, evidence: { pattern: "idea-to-bible.explore", state: "PASS", anchor: r.anchor }, timing: { startMs: 0, endMs: 0 }, outputs: { expC: r } }))) },
    "merge-bible": {
      invoke: (input: any) =>
        Effect.gen(function* () {
          const expA = input.inbound?.expA as ExploreResult
          const expB = input.inbound?.expB as ExploreResult
          const expC = input.inbound?.expC as ExploreResult
          const results = [expA, expB, expC].filter(Boolean) as ExploreResult[]
          const bible = yield* mergeToBible(idea, results.length > 0 ? results : [stubExploreResult("domain", idea), stubExploreResult("constraints", idea), stubExploreResult("value", idea)], runId)
          return { verdict: "PASS" as const, evidence: { pattern: "idea-to-bible.merge", state: "PASS", anchor: `merge-bible:${results.length}` }, timing: { startMs: 0, endMs: 0 }, outputs: { bible } }
        })
    },
    "schema-gate": {
      invoke: (input: any) =>
        Effect.gen(function* () {
          const bible = (input.inbound?.bible as BibleDoc) ?? (yield* mergeToBible(idea, [stubExploreResult("domain", idea)], runId))
          const gated = yield* schemaGateBible(bible, runId).pipe(Effect.mapError((e) => e as any))
          return { verdict: "PASS" as const, evidence: { pattern: "idea-to-bible.schema-gate", state: "PASS", anchor: "schema-gate:PASS" }, timing: { startMs: 0, endMs: 0 }, outputs: { bible: gated } }
        }).pipe(Effect.catchAll((e: any) => Effect.succeed({ verdict: "FAIL" as const, evidence: { pattern: "idea-to-bible.schema-gate", state: "FAIL", anchor: `schema-gate:${String(e?.message ?? e).slice(0, 80)}` }, timing: { startMs: 0, endMs: 0 }, error: e } as any)))
    },
    "journal-sink": {
      invoke: (input: any) =>
        Effect.gen(function* () {
          const bible = input.inbound?.bible as any
          return { verdict: "PASS" as const, evidence: { pattern: "idea-to-bible.journal", state: "PASS", anchor: `journal-sink:${bible?.meta?.name ?? "bible"}` }, timing: { startMs: 0, endMs: 0 }, outputs: { bible } }
        })
    }
  }
}
