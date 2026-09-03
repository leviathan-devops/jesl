import { Effect, Schema, Clock, Context, Layer } from "effect"
import * as Workflow from "@effect/workflow/Workflow"
import * as Activity from "@effect/workflow/Activity"
import { Journal, simpleHashExport, canonicalSerializeExport } from "../core/journal"
import { runProgram, type RunContext, type NodeHandle, type RunSummary, type Verdict } from "../core/executor"
import type { WorkflowDoc } from "../core/schema"
import { makeNodeActivity } from "./activities"

export const RunReceiptSchema = Schema.Struct({
  runId: Schema.String,
  verdict: Schema.String,
  rowsCount: Schema.Number,
  journalTail: Schema.String
})
export type RunReceipt = typeof RunReceiptSchema.Type

export const JeslErrorSchema = Schema.String

export function seedToString(seed: unknown): string {
  if (seed === null || seed === undefined) return String(seed)
  if (typeof seed === "string") return seed
  try { return canonicalSerializeExport(seed as any) } catch { try { return JSON.stringify(seed) ?? String(seed) } catch { return String(seed) } }
}

export function hashSeed(seed: unknown): string {
  return simpleHashExport(seedToString(seed))
}

export function idempotencyKeyFor(docHash: string, seed: unknown): string {
  return `${docHash}:${hashSeed(seed)}`
}

export const JeslRunPayload = Schema.Struct({
  docHash: Schema.String,
  seed: Schema.Unknown
})

export const JeslRun = Workflow.make({
  name: "JeslRun",
  payload: JeslRunPayload as any,
  success: RunReceiptSchema as any,
  error: JeslErrorSchema as any,
  idempotencyKey: ({ docHash, seed }: { docHash: string; seed: unknown }) => idempotencyKeyFor(docHash, seed)
})

export function rebuildSummaryFromRows(rows: ReadonlyArray<any>, runId: string): { summary: RunSummary; verdict: Verdict } {
  const verdictRows = rows.filter((r: any) => r.kind === "verdict" && r.verdict)
  let verdict: Verdict = "PASS"
  if (verdictRows.some((r: any) => r.verdict === "FAIL")) verdict = "FAIL"
  else if (verdictRows.some((r: any) => r.verdict === "INCONCLUSIVE")) verdict = "INCONCLUSIVE"
  else if (verdictRows.length > 0 && verdictRows.every((r: any) => r.verdict === "READY_FALSE")) verdict = "READY_FALSE"
  else if (verdictRows.length === 0 && rows.length > 0) verdict = "PASS"
  const results: Record<string, any> = {}
  for (const r of verdictRows) {
    const node = r.node
    if (!results[node]) {
      results[node] = { verdict: r.verdict, evidence: r.evidence ?? { pattern: "replay", state: r.verdict, anchor: `${node}:replay` }, timing: { startMs: r.ts, endMs: r.ts } }
    }
  }
  const batches: string[][] = []
  if (rows.length > 0) batches.push([...new Set(rows.map((r: any) => r.node))])
  const summary: RunSummary = { results, batches: batches as any, rows: rows as any, verdict } as any
  return { summary, verdict }
}

export const runJeslWorkflow = (
  docHash: string,
  seed: unknown,
  doc: WorkflowDoc,
  baseCtx: Omit<RunContext, "runId" | "journal"> & { runId?: string }
): Effect.Effect<{ receipt: RunReceipt; summary: RunSummary; invoked: number; runId: string }, string, Journal> =>
  Effect.gen(function* () {
    const journal = yield* Journal
    const seedStr = seedToString(seed)
    const runId = simpleHashExport(docHash + "\x00" + seedStr).slice(0, 16)
    const existingRows = yield* journal.rows(runId)
    if (existingRows.length > 0) {
      const verifyOk = yield* journal.verify(runId)
      if (!verifyOk) {
        return yield* Effect.fail(`JOURNAL_CORRUPT journal verify failed for run ${runId} — loud fail` as any)
      }
      for (let i = 0; i < existingRows.length; i++) {
        const r: any = existingRows[i]
        if (r.seq !== i) {
          const filtered = existingRows.filter((x: any) => x.run === runId)
          const idx = filtered.indexOf(r)
          if (r.seq !== idx) return yield* Effect.fail(`JOURNAL_CORRUPT seq mismatch at ${i}` as any)
        }
      }
      const { summary, verdict } = rebuildSummaryFromRows(existingRows as any, runId)
      const tail = existingRows.length > 0 ? (existingRows[existingRows.length - 1] as any).self : "genesis"
      const receipt: RunReceipt = { runId, verdict, rowsCount: existingRows.length, journalTail: tail }
      return { receipt, summary, invoked: 0, runId }
    }
    const covers = yield* journal.covers(docHash, seedStr)
    if (covers) {
      const verifyOk = yield* journal.verify(runId)
      if (!verifyOk) {
        return yield* Effect.fail(`JOURNAL_CORRUPT journal verify failed for run ${runId} — loud fail` as any)
      }
      const rows = yield* journal.rows(runId)
      if (rows.length === 0) {
        return yield* Effect.fail(`JOURNAL_CORRUPT covers true but rows empty for ${runId}` as any)
      }
      for (let i = 0; i < rows.length; i++) {
        const r: any = rows[i]
        if (r.seq !== i) {
          const filtered = rows.filter((x: any) => x.run === runId)
          const idx = filtered.indexOf(r)
          if (r.seq !== idx) return yield* Effect.fail(`JOURNAL_CORRUPT seq mismatch at ${i}` as any)
        }
      }
      const { summary, verdict } = rebuildSummaryFromRows(rows as any, runId)
      const tail = rows.length > 0 ? (rows[rows.length - 1] as any).self : "genesis"
      const receipt: RunReceipt = { runId, verdict, rowsCount: rows.length, journalTail: tail }
      return { receipt, summary, invoked: 0, runId }
    }
    const ctxRunId = runId
    const activities: Record<string, any> = {}
    for (const [nid, h] of Object.entries(baseCtx.nodeHandles ?? {})) {
      activities[nid] = makeNodeActivity(nid, h as NodeHandle, (doc as any).meta?.name ?? "wf")
    }
    const journalView = {
      append: (draft: any) => {
        const mappedSource = draft.source ? String(draft.source).replace(/workflow\/[^/]+\//, `workflow/JeslRun/node:`) : `workflow/JeslRun/node:${draft.node}`
        const finalSource = mappedSource.includes("node:") ? mappedSource : `workflow/JeslRun/node:${draft.node}`
        return journal.append({ ...draft, run: ctxRunId, source: finalSource } as any)
      }
    } as any
    const ctx: RunContext = {
      ...baseCtx,
      runId: ctxRunId,
      doc,
      journal: journalView,
      vars: { ...(baseCtx.vars ?? {}), seed: seedStr } as any
    } as unknown as RunContext
    const summary = yield* runProgram(doc, ctx).pipe(
      Effect.catchAll((e: any) => Effect.fail(String(e?.code ?? e?.message ?? e)) as any),
      Effect.catchAllDefect((d) => Effect.fail(String((d as any)?.message ?? d)) as any)
    ) as Effect.Effect<RunSummary, string>
    const rows = yield* journal.rows(ctxRunId)
    const tail = rows.length > 0 ? (rows[rows.length - 1] as any).self : "genesis"
    const verdictFromSummary: Verdict = (summary as any).verdict ?? (() => {
      const vals = Object.values((summary as any).results ?? {}) as any[]
      if (vals.some((r: any) => r.verdict === "FAIL")) return "FAIL" as Verdict
      if (vals.some((r: any) => r.verdict === "INCONCLUSIVE")) return "INCONCLUSIVE" as Verdict
      return "PASS" as Verdict
    })()
    const receipt: RunReceipt = { runId: ctxRunId, verdict: verdictFromSummary, rowsCount: rows.length, journalTail: tail }
    return { receipt, summary, invoked: Object.keys((summary as any).results ?? {}).length, runId: ctxRunId }
  })

export const makeJeslRunLayer = (
  doc: WorkflowDoc,
  makeCtx: (payload: { docHash: string; seed: unknown }, executionId: string) => Effect.Effect<RunContext, unknown, Journal>
): Layer.Layer<never, never, any> =>
  (JeslRun as any).toLayer((payload: { docHash: string; seed: unknown }, executionId: string) =>
    Effect.gen(function* () {
      const journal = yield* Journal
      const ctx = yield* makeCtx(payload, executionId)
      const res = yield* runJeslWorkflow(payload.docHash, payload.seed, doc, ctx as any).pipe(
        Effect.map((r) => r.receipt),
        Effect.catchAll((e) => Effect.fail(String(e)) as any)
      )
      return res
    })
  )

export const JeslRunLive = Layer.empty as Layer.Layer<never>
