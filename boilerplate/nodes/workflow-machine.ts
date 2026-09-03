import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { decodeDoc, validateDoc } from "../core/schema"
import { runProgram } from "../core/executor"

const MAX_DEPTH = 3

function getDepth(ctx: unknown): number {
  const c = ctx as any
  if (c == null) return 0
  if (typeof c._workflowDepth === "number") return c._workflowDepth
  if (typeof c.workflowDepth === "number") return c.workflowDepth
  if (c.vars && typeof c.vars._workflowDepth === "number") return c.vars._workflowDepth
  if (c.vars && typeof c.vars.workflowDepth === "number") return c.vars.workflowDepth
  return 0
}

export const workflowMachineNode: NodeImpl = {
  kind: "workflow-machine",
  family: "decision",
  requiredCaps: [],
  invoke: (input: unknown, ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { workflow?: unknown; vars?: Record<string, unknown>; doc?: unknown }
      const rawWorkflow = cfg.workflow ?? cfg.doc ?? inp.inbound["workflow"] ?? inp.inbound["doc"] ?? null
      const extraVars = (cfg.vars as Record<string, unknown>) ?? (inp.inbound["vars"] as Record<string, unknown>) ?? {}
      const startMs = yield* Clock.currentTimeMillis
      if (rawWorkflow == null) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "workflow-machine", state: "MISSING_WORKFLOW", anchor: `${inp.node.id}:missing-workflow` }, timing: { startMs, endMs }, outputs: { error: "missing workflow" } } as NodeResult
      }
      const depth = getDepth(ctx)
      if (depth >= MAX_DEPTH) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "workflow-machine", state: "DEPTH_EXCEEDED", anchor: `${inp.node.id}:depth-${depth}` }, timing: { startMs, endMs }, outputs: { error: `depth limit ${MAX_DEPTH} exceeded at ${depth}`, depth } } as NodeResult
      }
      let docObj: unknown
      if (typeof rawWorkflow === "string") {
        const s = rawWorkflow.trim()
        if (s.startsWith("{")) {
          try {
            docObj = JSON.parse(s)
          } catch (e: any) {
            const endMs = yield* Clock.currentTimeMillis
            return { verdict: "FAIL" as const, evidence: { pattern: "workflow-machine", state: "PARSE_FAIL", anchor: `${inp.node.id}:parse-fail` }, timing: { startMs, endMs }, outputs: { error: String(e?.message ?? e) } } as NodeResult
          }
        } else {
          const endMs2 = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "workflow-machine", state: "READ_FAIL", anchor: `${inp.node.id}:read-fail` }, timing: { startMs, endMs: endMs2 }, outputs: { error: `file path workflow not supported in this runtime: ${s.slice(0, 80)}` } } as NodeResult
        }
      } else {
        docObj = rawWorkflow
      }
      const decodedEither = yield* Effect.either(decodeDoc(docObj))
      if (decodedEither._tag === "Left") {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "workflow-machine", state: "DECODE_FAIL", anchor: `${inp.node.id}:decode-fail` }, timing: { startMs, endMs }, outputs: { error: String((decodedEither.left as any)?.message ?? decodedEither.left) } } as NodeResult
      }
      const doc = (decodedEither as any).right as any
      const isKnownKind = (k: string) => true
      const validationEither = yield* Effect.either(validateDoc(doc, isKnownKind))
      if (validationEither._tag === "Left") {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "workflow-machine", state: "VALIDATE_FAIL", anchor: `${inp.node.id}:validate-fail` }, timing: { startMs, endMs }, outputs: { error: String((validationEither.left as any)?.message ?? validationEither.left) } } as NodeResult
      }
      const parentCtx = (ctx ?? {}) as any
      const childVars = { ...(parentCtx.vars ?? {}), ...extraVars, _workflowDepth: depth + 1, workflowDepth: depth + 1 }
      const childCtx: any = {
        ...parentCtx,
        runId: `${parentCtx.runId ?? "run"}:wf:${inp.node.id}:${depth + 1}`,
        doc,
        vars: childVars,
        _workflowDepth: depth + 1,
        workflowDepth: depth + 1
      }
      if (!childCtx.nodeHandles) childCtx.nodeHandles = parentCtx.nodeHandles ?? {}
      if (!childCtx.caps) childCtx.caps = parentCtx.caps
      if (!childCtx.clock) childCtx.clock = parentCtx.clock
      if (!childCtx.budget) childCtx.budget = parentCtx.budget ?? { startedAt: startMs, deadlineMs: 600000, maxNodesFiring: 15 }
      const summary = yield* runProgram(doc, childCtx).pipe(
        Effect.catchAll((e: any) =>
          Effect.succeed({
            results: {},
            batches: [],
            rows: [],
            verdict: "FAIL" as const,
            _error: String(e?.message ?? e?.code ?? e)
          } as any)
        ),
        Effect.catchAllDefect((d) =>
          Effect.succeed({
            results: {},
            batches: [],
            rows: [],
            verdict: "INCONCLUSIVE" as const,
            _defect: String((d as any)?.message ?? d)
          } as any)
        )
      ) as any
      if ((summary as any)._error) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "workflow-machine", state: "SUB_FAIL", anchor: `${inp.node.id}:sub-fail` }, timing: { startMs, endMs }, outputs: { error: (summary as any)._error, summary } } as NodeResult
      }
      if ((summary as any)._defect) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "INCONCLUSIVE" as const, evidence: { pattern: "workflow-machine", state: "SUB_DEFECT", anchor: `${inp.node.id}:sub-defect` }, timing: { startMs, endMs }, outputs: { error: (summary as any)._defect, summary } } as NodeResult
      }
      const verdict = (summary as any).verdict ?? (() => {
        const vals = Object.values((summary as any).results ?? {}) as any[]
        if (vals.some((r: any) => r.verdict === "FAIL")) return "FAIL"
        if (vals.some((r: any) => r.verdict === "INCONCLUSIVE")) return "INCONCLUSIVE"
        return "PASS"
      })()
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: verdict as any, evidence: { pattern: "workflow-machine", state: verdict, anchor: `${inp.node.id}:sub:${verdict}` }, timing: { startMs, endMs }, outputs: { summary, verdict, depth: depth + 1 } } as NodeResult
    })
}
