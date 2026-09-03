import { Effect, Clock } from "effect"
import { Journal } from "../../core/journal"

export interface VerifyArtifacts {
  readonly files: ReadonlyArray<string>
  readonly outDir?: string
  readonly name?: string
  readonly [k: string]: unknown
}

export interface VerifyScenario {
  readonly name: string
  readonly passToken: string
  readonly failToken: string
  readonly run: (artifacts: VerifyArtifacts) => Effect.Effect<string, unknown, any>
}

export interface VerifyRow {
  readonly scenario: string
  readonly passToken: string
  readonly passTokenMatch: boolean
  readonly failToken: string
  readonly failTokenAbsent: boolean
  readonly toolResultContext: string
  readonly verdict: "PASS" | "FAIL"
}

export interface VerifyReport {
  readonly pass: number
  readonly fail: number
  readonly rows: ReadonlyArray<VerifyRow>
}

function toRow(
  scenario: string,
  passToken: string,
  passTokenMatch: boolean,
  failToken: string,
  failTokenAbsent: boolean,
  toolResultContext: string,
  verdict: VerifyRow["verdict"]
): VerifyRow {
  return { scenario, passToken, passTokenMatch, failToken, failTokenAbsent, toolResultContext: toolResultContext.slice(0, 800), verdict }
}

export const runScenario = (
  scenario: VerifyScenario,
  artifacts: VerifyArtifacts,
  runId: string
): Effect.Effect<VerifyRow, never, Journal> =>
  Effect.gen(function* () {
    const journal = yield* Journal
    const startMs = yield* Clock.currentTimeMillis
    yield* journal.append({
      run: runId,
      node: scenario.name,
      kind: "invoke" as any,
      source: `workflow/verify/${scenario.name}`,
      evidence: { pattern: `verify.scenario.${scenario.name}`, state: "FIRED", anchor: `${scenario.name}:invoke` }
    } as any) as any
    let toolResult = ""
    let caught: unknown = undefined
    const eff = scenario.run(artifacts)
    const res = yield* Effect.either(eff) as any
    if (res._tag === "Right") {
      toolResult = String(res.right ?? "")
    } else {
      caught = res.left
      toolResult = String((caught as any)?.message ?? String(caught ?? ""))
    }
    const passTokenMatch = toolResult.includes(scenario.passToken)
    const failTokenAbsent = scenario.failToken.length === 0 ? true : !toolResult.includes(scenario.failToken)
    const verdict: VerifyRow["verdict"] = passTokenMatch && failTokenAbsent ? "PASS" : "FAIL"
    const endMs = yield* Clock.currentTimeMillis
    const evidenceState = verdict
    yield* journal.append({
      run: runId,
      node: scenario.name,
      kind: "verdict" as any,
      verdict: verdict as any,
      source: `workflow/verify/${scenario.name}`,
      evidence: { pattern: `verify.scenario.${scenario.name}`, state: evidenceState, anchor: `${scenario.name}:${verdict}` }
    } as any) as any
    void startMs
    void endMs
    return toRow(scenario.name, scenario.passToken, passTokenMatch, scenario.failToken, failTokenAbsent, toolResult, verdict)
  }).pipe(
    Effect.catchAllDefect((d) =>
      Effect.succeed(toRow(scenario.name, scenario.passToken, false, scenario.failToken, true, `defect:${String((d as any)?.message ?? d).slice(0, 300)}`, "FAIL"))
    ),
    Effect.catchAll((e) =>
      Effect.succeed(toRow(scenario.name, scenario.passToken, false, scenario.failToken, true, `error:${String((e as any)?.message ?? e).slice(0, 300)}`, "FAIL"))
    )
  ) as any

export const runVerify = (
  artifacts: VerifyArtifacts,
  scenarios: ReadonlyArray<VerifyScenario>,
  opts?: { runId?: string; concurrency?: number }
): Effect.Effect<VerifyReport, never, Journal> =>
  (Effect.gen(function* () {
    const journal = yield* Journal
    const runId = opts?.runId ?? `verify-${Date.now()}`
    const concurrency = opts?.concurrency ?? 15
    yield* journal.append({
      run: runId,
      node: "verify-collect",
      kind: "invoke" as any,
      source: "workflow/verify/verify-collect",
      evidence: { pattern: "verify.collect", state: "FIRED", anchor: "verify-collect:invoke" }
    } as any) as any
    yield* journal.append({
      run: runId,
      node: "verify-collect",
      kind: "verdict" as any,
      verdict: "PASS" as any,
      source: "workflow/verify/verify-collect",
      evidence: { pattern: "verify.collect", state: "PASS", anchor: "verify-collect:PASS" }
    } as any) as any
    const perScenario = (s: VerifyScenario) => runScenario(s, artifacts, runId)
    const rows = yield* Effect.forEach(scenarios, perScenario, { concurrency }) as any
    const pass = (rows as VerifyRow[]).filter((r) => r.verdict === "PASS").length
    const fail = (rows as VerifyRow[]).filter((r) => r.verdict === "FAIL").length
    yield* journal.append({
      run: runId,
      node: "verify-report",
      kind: "verdict" as any,
      verdict: fail === 0 ? "PASS" as any : "FAIL" as any,
      source: "workflow/verify/verify-report",
      evidence: { pattern: "verify.report", state: fail === 0 ? "PASS" : "FAIL", anchor: `verify-report:${pass}/${fail}` }
    } as any) as any
    return { pass, fail, rows: rows as VerifyRow[] }
  }) as unknown as Effect.Effect<VerifyReport, never, Journal>)

export const runVerifyWithBatteryShape = (
  artifacts: VerifyArtifacts,
  factories: ReadonlyArray<(artifacts: VerifyArtifacts) => VerifyScenario>
): Effect.Effect<VerifyReport, never, Journal> =>
  Effect.gen(function* () {
    const scenarios = factories.map((f) => f(artifacts))
    return yield* runVerify(artifacts, scenarios)
  })

export function makeArtifactFixture(name = "sample"): VerifyArtifacts {
  return { files: [`src/${name}.ts`, `dist/${name}.js`], outDir: "dist", name, hash: `hash-${name}` }
}

export const defaultScenarios = (artifacts: VerifyArtifacts): ReadonlyArray<VerifyScenario> => [
  { name: "S1", passToken: "PASS", failToken: "FAIL", run: () => Effect.succeed(`tool-result: PASS for ${artifacts.name ?? "artifacts"} files=${artifacts.files.join(",")}`) },
  { name: "S2", passToken: "ok", failToken: "error", run: () => Effect.succeed("tool-result: ok") },
  { name: "S3", passToken: "done", failToken: "", run: () => Effect.succeed("tool-result: done") }
]
