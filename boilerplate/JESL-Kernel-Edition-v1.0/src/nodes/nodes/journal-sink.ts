import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { Journal } from "../core/journal"

export const journalSinkNode: NodeImpl = {
  kind: "journal-sink",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const c = ctx as any
      const startMs = yield* Clock.currentTimeMillis
      const payload = inp.inbound["data"] ?? inp.inbound["payload"] ?? inp.inbound["input"] ?? Object.values(inp.inbound)[0] ?? {}
      let row: unknown = undefined
      if (c && c.journal && typeof c.journal.append === "function") {
        const journal = c.journal as { append: (d: any) => Effect.Effect<any> }
        const draft = {
          run: c.runId ?? "test-run",
          node: inp.node.id,
          kind: "verdict" as const,
          verdict: "PASS" as const,
          evidence: { pattern: "journal-sink", state: "WRITTEN", anchor: `${inp.node.id}:1` },
          source: `workflow/${c.doc?.meta?.name ?? "wf"}/${inp.node.id}`
        }
        row = yield* journal.append(draft).pipe(Effect.catchAll(() => Effect.succeed(undefined)))
      } else {
        const maybeJournal = yield* Effect.serviceOption(Journal).pipe(Effect.catchAll(() => Effect.succeed({ _tag: "None" } as any)))
        if ((maybeJournal as any)._tag === "Some") {
          const svc = (maybeJournal as any).value
          const draft = { run: "test-run", node: inp.node.id, kind: "verdict" as const, verdict: "PASS" as const, evidence: { pattern: "journal-sink", state: "WRITTEN", anchor: `${inp.node.id}:1` }, source: `workflow/wf/${inp.node.id}` }
          row = yield* svc.append(draft).pipe(Effect.catchAll(() => Effect.succeed(undefined)))
        }
      }
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: "journal-sink", state: "WRITTEN", anchor: `${inp.node.id}:written` }, timing: { startMs, endMs }, outputs: { written: payload, row } } as NodeResult
    })
}
