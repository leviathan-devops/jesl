import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { Journal } from "../core/journal"

export const tripletWriterNode: NodeImpl = {
  kind: "triplet-writer",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { triplet?: { pattern: string; state: string; anchor: string }; pattern?: string; state?: string; anchor?: string }
      const triplet = cfg.triplet ?? (cfg.pattern ? { pattern: cfg.pattern, state: cfg.state ?? "FIRED", anchor: cfg.anchor ?? `${inp.node.id}:1` } : (inp.inbound["triplet"] as any) ?? (Object.values(inp.inbound)[0] as any))
      const startMs = yield* Clock.currentTimeMillis
      if (!triplet || !triplet.pattern || !triplet.state || !triplet.anchor) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "INCONCLUSIVE" as const, evidence: { pattern: "triplet-writer", state: "INCONCLUSIVE", anchor: `${inp.node.id}:no-triplet` }, timing: { startMs, endMs } } as NodeResult
      }
      const maybeJournal = yield* Effect.serviceOption(Journal).pipe(Effect.catchAll(() => Effect.succeed({ _tag: "None" } as any)))
      if ((maybeJournal as any)._tag === "Some") {
        const svc = (maybeJournal as any).value
        const draft = { run: "triplet-run", node: inp.node.id, kind: "verdict" as const, verdict: "PASS" as const, evidence: triplet, source: `workflow/wf/${inp.node.id}` }
        yield* svc.append(draft).pipe(Effect.catchAll(() => Effect.void))
      }
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: triplet, timing: { startMs, endMs }, outputs: { triplet } } as NodeResult
    })
}
