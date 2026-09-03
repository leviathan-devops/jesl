import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { Journal } from "../core/journal"
import { rebuildSummaryFromRows } from "../workflow/jesl-run"

export const replaySourceNode: NodeImpl = {
  kind: "replay-source",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { runId?: string }
      const runId = (cfg.runId as string) ?? (inp.inbound["runId"] as string) ?? (Object.values(inp.inbound)[0] as string) ?? ""
      const startMs = yield* Clock.currentTimeMillis
      if (!runId) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "replay-source", state: "MISSING_RUNID", anchor: `${inp.node.id}:missing-runId` }, timing: { startMs, endMs }, outputs: { error: "missing runId" } } as NodeResult
      }
      let rows: ReadonlyArray<any> = []
      const c = ctx as any
      if (c && c.journal && typeof c.journal.rows === "function") {
        try {
          const maybe = c.journal.rows(runId)
          if (maybe && typeof maybe.pipe === "function") {
            rows = (yield* maybe.pipe(Effect.catchAll(() => Effect.succeed([] as any)))) as any
          } else if (maybe && typeof maybe.then === "function") {
            rows = (yield* Effect.promise(() => maybe as Promise<any>).pipe(Effect.catchAll(() => Effect.succeed([] as any)))) as any
          } else if (Array.isArray(maybe)) {
            rows = maybe
          }
        } catch (e) {
          console.error(`replay-source ctx.journal.rows failed for ${runId}: ${String((e as any)?.message ?? e)}`)
          rows = []
        }
      }
      if (rows.length === 0) {
        const maybeJournal = yield* Effect.serviceOption(Journal).pipe(Effect.catchAll(() => Effect.succeed({ _tag: "None" } as any)))
        if ((maybeJournal as any)._tag === "Some") {
          const svc = (maybeJournal as any).value
          try {
            rows = (yield* svc.rows(runId).pipe(Effect.catchAll(() => Effect.succeed([] as any)))) as any
          } catch (e) {
            console.error(`replay-source Journal.rows failed for ${runId}: ${String((e as any)?.message ?? e)}`)
            rows = []
          }
          if (rows.length === 0) {
            try {
              const all = (yield* svc.allRows().pipe(Effect.catchAll(() => Effect.succeed([] as any)))) as any
              rows = (all as any[]).filter((r: any) => r.run === runId)
            } catch (e) {
              console.error(`replay-source Journal.allRows failed: ${String((e as any)?.message ?? e)}`)
            }
          }
        }
      }
      if (rows.length === 0) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "INCONCLUSIVE" as const, evidence: { pattern: "replay-source", state: "EMPTY", anchor: `${inp.node.id}:empty:${runId}` }, timing: { startMs, endMs }, outputs: { runId, rows: [], count: 0 } } as NodeResult
      }
      let rebuilt: any
      try {
        rebuilt = rebuildSummaryFromRows(rows as any, runId)
      } catch (e: any) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "replay-source", state: "REBUILD_FAIL", anchor: `${inp.node.id}:rebuild-fail` }, timing: { startMs, endMs }, outputs: { error: String(e?.message ?? e), runId } } as NodeResult
      }
      const endMs = yield* Clock.currentTimeMillis
      return {
        verdict: rebuilt.verdict as any,
        evidence: { pattern: "replay-source", state: rebuilt.verdict, anchor: `${inp.node.id}:replay:${runId}:${rebuilt.verdict}` },
        timing: { startMs, endMs },
        outputs: { runId, rows, summary: rebuilt.summary, verdict: rebuilt.verdict, count: rows.length }
      } as NodeResult
    })
}
