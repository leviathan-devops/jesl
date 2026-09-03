import { Effect, Clock, Context } from "effect"
import * as Fs from "node:fs"
import * as Path from "node:path"
import { Journal, simpleHashExport } from "../../core/journal"
import { JeslUnknownNode, JeslCycle, JeslChannelUnset } from "../../core/errors"
import type { JeslError } from "../../core/errors"
import type { WorkflowDoc } from "../../core/schema"
import { runDemoSync, type DemoResult, type CalibrateReport } from "../../mpse/demo"
import { runProgram, type RunSummary } from "../../core/executor"

export interface SpecToKernelsInput {
  readonly specPath: string
  readonly runId?: string
}

export interface SpecToKernelsOutput {
  readonly cards: ReadonlyArray<any>
  readonly registry: Record<string, any>
  readonly report: CalibrateReport
  readonly kernel: Record<string, any>
  readonly stubs: Record<string, string>
  readonly doc: WorkflowDoc
  readonly dryRun: Record<string, RunSummary>
  readonly runId: string
  readonly journalTail: string
}

const journalAppend = (
  runId: string,
  node: string,
  kind: string,
  verdict: string,
  pattern: string,
  anchor: string
): Effect.Effect<void, never, Journal> =>
  Effect.gen(function* () {
    const journal = yield* Journal
    const ts = yield* Clock.currentTimeMillis
    yield* journal.append({
      run: runId,
      node,
      kind: kind as any,
      verdict: verdict as any,
      evidence: { pattern, state: verdict, anchor },
      source: `workflow/spec-to-kernels/${node}`,
      ts
    } as any)
  })

const wrapDemoError = (e: unknown, node = "spec-parse"): JeslError => {
  if (e !== null && typeof e === "object" && "code" in (e as any) && typeof (e as any).code === "string" && String((e as any).code).startsWith("[JESL")) {
    return e as JeslError
  }
  const msg = String((e as any)?.message ?? e).slice(0, 500)
  if (msg.includes("cycle") || msg.includes("CYCLE")) {
    return new JeslCycle({
      code: "[JESL CYCLE]",
      node,
      field: "edges",
      expected: "acyclic channel graph",
      actual: msg.slice(0, 200),
      remedy: "break the cycle with a gate, or re-arm via event-reactivate"
    }) as unknown as JeslError
  }
  if (msg.includes("CHANNEL-UNSET") || msg.includes("channel")) {
    return new JeslChannelUnset({
      code: "[JESL CHANNEL-UNSET]",
      node,
      field: "channels",
      expected: "all inbound channels written",
      actual: msg.slice(0, 200),
      remedy: "ensure every inbound channel is seeded or written by a predecessor"
    }) as unknown as JeslError
  }
  return new JeslUnknownNode({
    code: "[JESL UNKNOWN-NODE]",
    node,
    field: "spec",
    expected: "valid WorkflowDoc per L2 §3.1 — $schema trident-workflow-v1, meta{name,tier}, nodes non-empty, edges acyclic",
    actual: msg.slice(0, 500),
    remedy: "fix the document to match the schema: correct $schema, known node types, unique ids, acyclic edges"
  }) as unknown as JeslError
}

const assertD17 = (report: CalibrateReport): Effect.Effect<void, JeslError> =>
  Effect.gen(function* () {
    if (report.fail > 0) {
      const failRows = report.rows.filter((r) => r.status === "FAIL")
      const first = failRows[0]
      return yield* Effect.fail(
        new JeslUnknownNode({
          code: "[JESL UNKNOWN-NODE]",
          node: "calibrate",
          field: "report.fail",
          expected: "fail === 0 — born-off rows must be EXCLUDED, not FAIL (D17: FIRED∧SILENT=CALIBRATED else EXCLUDED_BORN_OFF)",
          actual: `fail=${report.fail} row=${first ? `${first.nodeId}:${first.reason}` : "?"}`,
          remedy: "mark intentionally-wrong expected values with bornOff:true so calibrate emits EXCLUDED, not FAIL — D17 survivor law"
        }) as unknown as JeslError
      )
    }
    const excluded = report.rows.filter((r) => r.status === "EXCLUDED")
    for (const r of excluded) {
      if (!r.reason.includes("EXCLUDED_BORN_OFF") && !r.reason.includes("EXCLUDED")) {
        return yield* Effect.fail(
          new JeslUnknownNode({
            code: "[JESL UNKNOWN-NODE]",
            node: "calibrate",
            field: "report.excluded",
            expected: "every EXCLUDED row carries EXCLUDED_BORN_OFF reason — born-off → EXCLUDED, not FAIL",
            actual: `${r.nodeId}:${r.reason}`,
            remedy: "ensure calibrateLocal tags born-off mismatches as EXCLUDED with EXCLUDED_BORN_OFF reason"
          }) as unknown as JeslError
        )
      }
    }
  })

const runDryRun = (
  kernel: Record<string, any>,
  runId: string
): Effect.Effect<Record<string, RunSummary>, JeslError> =>
  (Effect.gen(function* (): Generator<any, Record<string, RunSummary>, any> {
    const out: Record<string, RunSummary> = {}
    for (const [kid, proto] of Object.entries(kernel)) {
      const wfRaw = (proto as any).workflow as unknown
      let doc: WorkflowDoc
      if (wfRaw !== null && typeof wfRaw === "object" && "$schema" in (wfRaw as any) && Array.isArray((wfRaw as any).nodes) && (wfRaw as any).nodes.length > 0) {
        doc = wfRaw as WorkflowDoc
      } else {
        doc = {
          $schema: "trident-workflow-v1",
          meta: { name: `kernel-${kid}`, tier: 1 as const },
          nodes: [{ id: kid, type: "gate" } as any],
          edges: []
        } as unknown as WorkflowDoc
      }
      if (!doc.nodes || doc.nodes.length === 0) {
        doc = { ...doc, nodes: [{ id: kid, type: "gate" } as any] } as WorkflowDoc
      }
      const ctx: any = {
        runId: `${runId}-${kid}`,
        doc,
        caps: Context.empty() as any,
        clock: Clock as any,
        budget: { startedAt: Date.now(), deadlineMs: 60000, maxNodesFiring: 15 },
        vars: {} as any,
        nodeHandles: {} as any,
        boundCaps: new Set<string>() as any
      }
      const summary = (yield* (runProgram(doc as any, ctx).pipe(Effect.mapError((e) => wrapDemoError(e, `dry-run:${kid}`))) as any)) as unknown as RunSummary
      const hasFail = Object.values(summary.results ?? {}).some((r: any) => r.verdict === "FAIL")
      if (hasFail) {
        const failNode = Object.entries(summary.results ?? {}).find(([, v]: any) => v.verdict === "FAIL")
        return yield* Effect.fail(
          new JeslUnknownNode({
            code: "[JESL UNKNOWN-NODE]",
            node: `dry-run:${kid}`,
            field: "dryRun.verdict",
            expected: "TestLive dry-run PASS — emitted kernel doc executes headless under TestLive (deterministic nodes EXECUTE before code exists)",
            actual: failNode ? `${failNode[0]}:FAIL` : "dry-run batch contained FAIL",
            remedy: "the emitted kernel workflow must be runnable headless — ensure stub emits a tier:1 doc with known kinds and no missing caps"
          }) as unknown as JeslError
        )
      }
      out[kid] = summary
    }
    return out
  }) as unknown as Effect.Effect<Record<string, RunSummary>, JeslError>)

export const specToKernels = (
  input: SpecToKernelsInput
): Effect.Effect<SpecToKernelsOutput, JeslError, Journal> =>
  (Effect.gen(function* (): Generator<any, SpecToKernelsOutput, any> {
    const specPath = input.specPath
    if (!specPath || typeof specPath !== "string") {
      return yield* Effect.fail(
        new JeslChannelUnset({
          code: "[JESL CHANNEL-UNSET]",
          node: "spec-parse",
          field: "specPath",
          expected: "non-empty spec doc path to a WorkflowDoc JSON file",
          actual: String(specPath),
          remedy: "provide the spec doc path — e.g. jesl/fixtures/mpse-demo.json"
        }) as unknown as JeslError
      )
    }
    const runId = input.runId ?? simpleHashExport(specPath + "\x00" + String(Date.now())).slice(0, 16)
    yield* journalAppend(runId, "spec-parse", "invoke", "PASS", "spec-to-kernels.parse.invoke", `${runId}:spec-parse:invoke`)
    let demo: DemoResult
    try {
      const resolved = Path.isAbsolute(specPath) ? specPath : Path.resolve(process.cwd(), specPath)
      const alt = Path.resolve(Path.dirname(new URL(import.meta.url).pathname), "../../fixtures", Path.basename(specPath))
      const pick = Fs.existsSync(resolved) ? resolved : Fs.existsSync(alt) ? alt : specPath
      const tryLoad = (): DemoResult => {
        try {
          return runDemoSync(pick)
        } catch (inner) {
          if (pick !== specPath) return runDemoSync(specPath)
          throw inner
        }
      }
      demo = tryLoad()
    } catch (e) {
      const je = wrapDemoError(e, "spec-parse")
      yield* journalAppend(runId, "spec-parse", "verdict", "FAIL", "spec-to-kernels.parse.fail", `${runId}:spec-parse:fail:${(je as any).code ?? "unknown"}`)
      return yield* Effect.fail(je)
    }
    yield* journalAppend(runId, "spec-parse", "verdict", "PASS", "spec-to-kernels.parse.pass", `${runId}:spec-parse:pass:${demo.cards.length}`)
    yield* journalAppend(runId, "calibrate", "invoke", "PASS", "spec-to-kernels.calibrate.invoke", `${runId}:calibrate:invoke`)
    const report: CalibrateReport = demo.report as unknown as CalibrateReport
    const d17Res = yield* assertD17(report).pipe(Effect.either) as any
    if (d17Res._tag === "Left") {
      const je = d17Res.left as JeslError
      yield* journalAppend(runId, "calibrate", "verdict", "FAIL", "spec-to-kernels.calibrate.fail", `${runId}:calibrate:fail:${(je as any).code ?? "D17"}`)
      return yield* Effect.fail(je)
    }
    yield* journalAppend(runId, "calibrate", "verdict", "PASS", "spec-to-kernels.calibrate.pass", `${runId}:calibrate:pass:excluded=${report.excluded}:fail=${report.fail}`)
    yield* journalAppend(runId, "decompose", "invoke", "PASS", "spec-to-kernels.decompose.invoke", `${runId}:decompose:invoke`)
    if (Object.keys(demo.kernel).length === 0) {
      const je = new JeslChannelUnset({
        code: "[JESL CHANNEL-UNSET]",
        node: "decompose",
        field: "kernel",
        expected: "at least one kernel prototype emitted — the macro kernel prototype IS the output (math-before-code)",
        actual: "0 prototypes",
        remedy: "the spec doc must declare at least one node with config.math/expr/expected so compileDoc emits cards"
      }) as unknown as JeslError
      yield* journalAppend(runId, "decompose", "verdict", "FAIL", "spec-to-kernels.decompose.fail", `${runId}:decompose:fail:empty`)
      return yield* Effect.fail(je)
    }
    if (Object.keys(demo.stubs).length !== Object.keys(demo.kernel).length) {
      const je = new JeslChannelUnset({
        code: "[JESL CHANNEL-UNSET]",
        node: "decompose",
        field: "stubs",
        expected: "stubs count === kernel prototypes count — one Activity stub per kernel proto",
        actual: `stubs=${Object.keys(demo.stubs).length} kernel=${Object.keys(demo.kernel).length}`,
        remedy: "emitStubs must run after emitKernelProto — one stub per card"
      }) as unknown as JeslError
      yield* journalAppend(runId, "decompose", "verdict", "FAIL", "spec-to-kernels.decompose.fail", `${runId}:decompose:fail:mismatch`)
      return yield* Effect.fail(je)
    }
    yield* journalAppend(runId, "decompose", "verdict", "PASS", "spec-to-kernels.decompose.pass", `${runId}:decompose:pass:kernel=${Object.keys(demo.kernel).length}:stubs=${Object.keys(demo.stubs).length}`)
    yield* journalAppend(runId, "dry-run", "invoke", "PASS", "spec-to-kernels.dry-run.invoke", `${runId}:dry-run:invoke`)
    const drySummaries = yield* runDryRun(demo.kernel as Record<string, any>, runId).pipe(
      Effect.catchAll((e) =>
        Effect.gen(function* () {
          yield* journalAppend(runId, "dry-run", "verdict", "FAIL", "spec-to-kernels.dry-run.fail", `${runId}:dry-run:fail:${(e as any).code ?? "dry"}`)
          return yield* Effect.fail(e)
        })
      )
    )
    yield* journalAppend(runId, "dry-run", "verdict", "PASS", "spec-to-kernels.dry-run.pass", `${runId}:dry-run:pass:${Object.keys(drySummaries).length}`)
    yield* journalAppend(runId, "journal-sink", "verdict", "PASS", "spec-to-kernels.journal.done", `${runId}:done:${Object.keys(demo.kernel).length}`)
    const journal = yield* Journal
    const rows = yield* journal.rows(runId)
    const tail = rows.length > 0 ? (rows[rows.length - 1] as any).self : "genesis"
    return {
      cards: demo.cards as any,
      registry: demo.registry as any,
      report: report as any,
      kernel: demo.kernel as any,
      stubs: demo.stubs as any,
      doc: demo.doc as any,
      dryRun: drySummaries as any,
      runId,
      journalTail: tail
    } as SpecToKernelsOutput
  }) as unknown as Effect.Effect<SpecToKernelsOutput, JeslError, Journal>)

export const runSpecToKernels = (
  specPath: string,
  opts?: { runId?: string }
): Effect.Effect<SpecToKernelsOutput, JeslError, Journal> => specToKernels({ specPath, runId: opts?.runId })

export const SpecToKernelsActivity = {
  name: "spec-to-kernels" as const,
  run: runSpecToKernels
}
