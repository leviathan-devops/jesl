import { Effect, Schema, Clock, Context } from "effect"
import * as Activity from "@effect/workflow/Activity"
import * as DurableDeferred from "@effect/workflow/DurableDeferred"
import { Journal, makeJournal, simpleHashExport, canonicalSerializeExport } from "../core/journal"
import type { NodeHandle, NodeInput, NodeResult, RunContext } from "../core/executor"

export const NodeResultSchema = Schema.Struct({
  verdict: Schema.Literal("PASS", "FAIL", "INCONCLUSIVE", "READY_FALSE"),
  outputs: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  evidence: Schema.Struct({ pattern: Schema.String, state: Schema.String, anchor: Schema.String }),
  timing: Schema.Struct({ startMs: Schema.Number, endMs: Schema.Number })
})

export const JeslErrorSchema = Schema.String

export function makeNodeActivity(
  nodeId: string,
  handle: NodeHandle,
  docName = "wf"
): Activity.Activity<typeof NodeResultSchema, typeof JeslErrorSchema, any> {
  return Activity.make({
    name: `node:${nodeId}`,
    success: NodeResultSchema as any,
    error: JeslErrorSchema as any,
    execute: Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const input: NodeInput = { node: { id: nodeId, type: nodeId } as any, inbound: {} as any }
      const fakeCtx = { runId: "activity", doc: { meta: { name: docName } } as any, vars: {} } as RunContext
      const res = yield* handle.invoke(input, fakeCtx).pipe(
        Effect.catchAll((e: any) => Effect.succeed({ verdict: "FAIL" as const, evidence: { pattern: "activity.error", state: "FAIL", anchor: `${nodeId}:1` }, timing: { startMs: now, endMs: now }, error: e } as NodeResult)),
        Effect.catchAllDefect((d) => Effect.succeed({ verdict: "INCONCLUSIVE" as const, evidence: { pattern: "activity.defect", state: "INCONCLUSIVE", anchor: `${nodeId}:defect` }, timing: { startMs: now, endMs: now } } as NodeResult))
      )
      return res as any
    })
  }) as any
}

export const AskQuestionSchema = Schema.Struct({ question: Schema.String, nodeId: Schema.String })
export const AskAnswerSchema = Schema.String

export const DurableAsk = DurableDeferred.make("ask-launcher", {
  success: AskAnswerSchema as any,
  error: Schema.String as any
})

export function seedToString(seed: unknown): string {
  if (seed === null || seed === undefined) return String(seed)
  if (typeof seed === "string") return seed
  try {
    return canonicalSerializeExport(seed as any)
  } catch {
    try { return JSON.stringify(seed) ?? String(seed) } catch { return String(seed) }
  }
}

export function journalAskKey(nodeId: string, runId: string): string {
  return `ask:${runId}:${nodeId}`
}

export function journalAnswerKey(nodeId: string, runId: string): string {
  return `answer:${runId}:${nodeId}`
}

export const durableAsk = (
  question: string,
  nodeId: string,
  runId: string
): Effect.Effect<string, string, Journal> =>
  Effect.gen(function* () {
    const journal = yield* Journal
    const rows = yield* journal.rows(runId)
    const answerRow = rows.find((r: any) => r.node === nodeId && r.kind === "answer" && (r as any).evidence?.pattern === "ask.answer")
    if (answerRow) {
      const ans = (answerRow as any).evidence?.anchor ?? ""
      const decoded = ans.startsWith("answer:") ? ans.slice(7) : ans
      return decoded
    }
    const askExists = rows.some((r: any) => r.node === nodeId && r.kind === "ask")
    if (!askExists) {
      yield* journal.append({
        run: runId,
        node: nodeId,
        kind: "ask" as any,
        source: `workflow/JeslRun/node:${nodeId}`,
        evidence: { pattern: "ask.question", state: "PENDING", anchor: `question:${question}` }
      } as any)
    }
    return yield* Effect.fail(`SUSPENDED:ask:${nodeId}` as any)
  })

export const provideAnswer = (
  answer: string,
  nodeId: string,
  runId: string
): Effect.Effect<void, never, Journal> =>
  Effect.gen(function* () {
    const journal = yield* Journal
    yield* journal.append({
      run: runId,
      node: nodeId,
      kind: "answer" as any,
      source: `workflow/JeslRun/node:${nodeId}`,
      evidence: { pattern: "ask.answer", state: "ANSWERED", anchor: `answer:${answer}` }
    } as any)
  })

export const hasAnswer = (nodeId: string, runId: string): Effect.Effect<boolean, never, Journal> =>
  Effect.gen(function* () {
    const j = yield* Journal
    const rows = yield* j.rows(runId)
    return rows.some((r: any) => r.node === nodeId && r.kind === "answer")
  })

export const hasAsk = (nodeId: string, runId: string): Effect.Effect<boolean, never, Journal> =>
  Effect.gen(function* () {
    const j = yield* Journal
    const rows = yield* j.rows(runId)
    return rows.some((r: any) => r.node === nodeId && r.kind === "ask")
  })
