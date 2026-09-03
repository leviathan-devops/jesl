import { Effect, Clock, Cause, Option, Context, Exit } from "effect"
import { JeslCapUnbound, type JeslError } from "./errors"
import type { WorkflowDoc } from "./schema"
import { simpleHashExport, canonicalSerializeExport } from "./journal"

export type Verdict = "PASS" | "FAIL" | "INCONCLUSIVE" | "READY_FALSE"

export interface Triplet {
  readonly pattern: string
  readonly state: string
  readonly anchor: string
}

export interface NodeResult {
  readonly verdict: Verdict
  readonly outputs?: Record<string, unknown>
  readonly error?: JeslError
  readonly evidence: Triplet
  readonly timing: { startMs: number; endMs: number }
}

export interface JournalRow {
  readonly seq: number
  readonly ts: number
  readonly run: string
  readonly node: string
  readonly kind: "invoke" | "verdict" | "bus.event" | "bus.handler.error" | "run.open" | "run.close"
  readonly verdict?: Verdict
  readonly evidence?: Triplet
  readonly source: string
  readonly prev: string
  readonly self: string
}

export interface RunBudget {
  readonly startedAt: number
  readonly deadlineMs: number
  readonly maxNodesFiring: number
}

export interface ChannelsView {
  readonly write: (name: string, value: unknown) => Effect.Effect<void>
  readonly isWritten?: (name: string) => Effect.Effect<boolean>
}

export interface JournalView {
  readonly append: (draft: { run: string; node: string; kind: "invoke" | "verdict"; verdict?: Verdict; evidence?: Triplet; source: string; ts: number }) => Effect.Effect<JournalRow>
}

export interface NodeInput {
  readonly node: Readonly<{ id: string; type: string }>
  readonly inbound: Readonly<Record<string, unknown>>
}

export interface NodeHandle {
  readonly invoke: (input: NodeInput, ctx: RunContext) => Effect.Effect<NodeResult, JeslError>
  readonly requiredCaps?: ReadonlyArray<string>
}

export interface RunContext {
  readonly runId: string
  readonly doc: WorkflowDoc
  readonly channels?: ChannelsView
  readonly journal?: JournalView
  readonly bus?: unknown
  readonly caps: Context.Context<any>
  readonly clock: Clock.Clock
  readonly budget: RunBudget
  readonly vars: Readonly<Record<string, unknown>>
  readonly nodeHandles: Record<string, NodeHandle>
  readonly boundCaps?: ReadonlySet<string>
  readonly capsRequirements?: Record<string, ReadonlyArray<string>>
}

export interface RunSummary {
  readonly results: Record<string, NodeResult>
  readonly batches: ReadonlyArray<ReadonlyArray<string>>
  readonly rows: ReadonlyArray<JournalRow>
  readonly verdict?: Verdict
}

export const runProgram = (doc: WorkflowDoc, ctx: RunContext): Effect.Effect<RunSummary, JeslError> =>
  Effect.gen(function* () {
    const inbound = new Map<string, Set<string>>()
    const outbound = new Map<string, Array<{ to: string; via: string }>>()
    for (const n of doc.nodes) {
      inbound.set(n.id, new Set())
      outbound.set(n.id, [])
    }
    for (const e of doc.edges) {
      inbound.get(e.to)?.add(e.via)
      outbound.get(e.from)?.push({ to: e.to, via: e.via })
    }
    const nodeMap = new Map(doc.nodes.map((n) => [n.id, n] as const))
    const written = new Set<string>()
    const channelData = new Map<string, unknown>()
    for (const k of Object.keys(ctx.vars ?? {})) { written.add(k); channelData.set(k, (ctx.vars as any)[k]) }
    if ((doc as any).vars) {
      for (const k of Object.keys((doc as any).vars)) { written.add(k); if (!channelData.has(k)) channelData.set(k, (doc as any).vars[k]) }
    }
    const completed = new Set<string>()
    const results: Record<string, NodeResult> = {}
    const batches: string[][] = []
    const internalRows: JournalRow[] = []
    let seq = 0
    let prevSelf = "genesis"
    const journalAppend = (draft: { run: string; node: string; kind: "invoke" | "verdict"; verdict?: Verdict; evidence?: Triplet; source: string; ts: number }): Effect.Effect<JournalRow> => {
      if (ctx.journal?.append) {
        return Effect.gen(function* () {
          const row = yield* ctx.journal!.append(draft as any)
          internalRows.push(row)
          return row
        })
      }
      return Effect.gen(function* () {
        const row: JournalRow = {
          seq: seq++,
          ts: draft.ts,
          run: draft.run,
          node: draft.node,
          kind: draft.kind as any,
          verdict: draft.verdict,
          evidence: draft.evidence,
          source: draft.source,
          prev: prevSelf,
          self: ""
        } as JournalRow
        // The fallback path must produce rows the journal's verifyChain can verify — same canonical+hash algorithm ( Law 6: the chain is THE proof ).
        const base: Omit<JournalRow, "self"> = {
          seq: row.seq, ts: row.ts, run: row.run, node: row.node, kind: row.kind as any,
          verdict: row.verdict as any, evidence: row.evidence, source: row.source, prev: row.prev
        }
        const self = simpleHashExport(canonicalSerializeExport(base as unknown) + "\x00" + row.prev)
        const finalRow = { ...row, self } as JournalRow
        prevSelf = self
        internalRows.push(finalRow)
        return finalRow
      })
    }
    const maxFiring = ctx.budget?.maxNodesFiring ?? 15
    const deadlineMs = ctx.budget?.deadlineMs ?? 600000
    const startedAt = ctx.budget?.startedAt ?? 0
    while (completed.size < doc.nodes.length) {
      const now = yield* Clock.currentTimeMillis
      if (now - startedAt > deadlineMs) break
      const ready: string[] = []
      for (const n of doc.nodes) {
        if (completed.has(n.id)) continue
        const req = inbound.get(n.id) ?? new Set()
        let ok = true
        for (const ch of req) {
          if (!written.has(ch)) { ok = false; break }
        }
        if (ok) ready.push(n.id)
      }
      if (ready.length === 0) break
      const batch = ready.slice(0, maxFiring)
      batches.push([...batch])
      for (const nodeId of batch) {
        const handle = ctx.nodeHandles?.[nodeId] as NodeHandle | undefined
        const reqCaps: ReadonlyArray<string> = (handle as any)?.requiredCaps ?? (ctx as any).capsRequirements?.[nodeId] ?? []
        if (reqCaps.length > 0) {
          const bound: ReadonlySet<string> = (ctx as any).boundCaps ?? new Set<string>()
          for (const cap of reqCaps) {
            const isBound = bound instanceof Set ? bound.has(cap) : false
            if (!isBound) {
              return yield* Effect.fail(new JeslCapUnbound({
                code: "[JESL CAP-UNBOUND]",
                node: nodeId,
                field: "caps",
                expected: `driver Layer providing ${cap}`,
                actual: cap,
                remedy: "run under a driver that binds the cap, or drop the node"
              }) as unknown as JeslError)
            }
          }
        }
      }
      const perNode = (nodeId: string): Effect.Effect<NodeResult, never> =>
        Effect.gen(function* () {
          const handle = ctx.nodeHandles?.[nodeId] as NodeHandle | undefined
          const startMs = yield* Clock.currentTimeMillis
          yield* journalAppend({ run: ctx.runId, node: nodeId, kind: "invoke", source: `workflow/${(doc as any).meta?.name ?? "wf"}/${nodeId}`, ts: startMs })
          const req = inbound.get(nodeId) ?? new Set()
          // The node's REAL inbound: channel name → the written value (node outputs first, seeded vars as the fallback) — nodes read their inputs through this (Law: dataflow readiness over named channels).
          const inboundData: Record<string, unknown> = {}
          for (const ch of req) inboundData[ch] = channelData.has(ch) ? channelData.get(ch) : (ctx.vars as any)?.[ch]
          const input: NodeInput = { node: nodeMap.get(nodeId) as any, inbound: inboundData }
          let invokeEffect: Effect.Effect<NodeResult, JeslError>
          if (!handle) {
            invokeEffect = Effect.succeed<NodeResult>({ verdict: "PASS", evidence: { pattern: "executor.invoke", state: "FIRED", anchor: `workflow/${(doc as any).meta?.name ?? "wf"}/${nodeId}` }, timing: { startMs, endMs: startMs } })
          } else {
            invokeEffect = handle.invoke(input, ctx as any)
          }
          const exit = yield* Effect.exit(invokeEffect)
          const endMs = yield* Clock.currentTimeMillis
          let nr: NodeResult
          if (Exit.isSuccess(exit)) {
            const v = exit.value as NodeResult
            const evidence = (v as any).evidence ?? { pattern: "executor.invoke", state: (v as any).verdict ?? "FIRED", anchor: `workflow/${(doc as any).meta?.name ?? "wf"}/${nodeId}` }
            nr = { verdict: v.verdict, outputs: (v as any).outputs, error: (v as any).error, evidence, timing: { startMs, endMs } }
          } else {
            const cause = exit.cause
            const failureOpt = Cause.failureOption(cause)
            if (Option.isSome(failureOpt)) {
              const err = failureOpt.value as JeslError
              nr = { verdict: "FAIL", error: err, evidence: { pattern: "executor.failure", state: "FAIL", anchor: `workflow/${(doc as any).meta?.name ?? "wf"}/${nodeId}` }, timing: { startMs, endMs } }
            } else {
              nr = { verdict: "INCONCLUSIVE", evidence: { pattern: "executor.defect", state: "INCONCLUSIVE", anchor: `workflow/${(doc as any).meta?.name ?? "wf"}/${nodeId}` }, timing: { startMs, endMs } }
            }
          }
          yield* journalAppend({ run: ctx.runId, node: nodeId, kind: "verdict", verdict: nr.verdict, evidence: nr.evidence, source: `workflow/${(doc as any).meta?.name ?? "wf"}/${nodeId}`, ts: endMs })
          const outs = outbound.get(nodeId) ?? []
          for (const e of outs) {
            const val = (nr.outputs as any)?.[e.via] ?? (nr.outputs as any)?.default ?? { ok: 1 }
            written.add(e.via)
            channelData.set(e.via, val)
            if (ctx.channels?.write) {
              yield* ctx.channels.write(e.via, val).pipe(Effect.catchAll(() => Effect.void))
            }
          }
          return nr
        })
      const nodeResults = yield* Effect.forEach(batch, perNode, { concurrency: maxFiring })
      batch.forEach((id, idx) => {
        const nr = nodeResults[idx]!
        results[id] = nr
        completed.add(id)
      })
    }
    const rows = internalRows
    const summary: RunSummary = { results, batches, rows }
    return summary
  })
