# Spec-to-Kernels Kernel — THE INSERTION (D3)

## Fuse
The step between MPSE and Code Specs. You hand it a spec doc (WorkflowDoc JSON) that carries fenced-math / oracle intent per node (via `config.math / config.expr / config.expected / config.bornOff`). The kernel composes the W7 MPSE bridge and adds the TestLive dry-run — then you feed its output to `kernels-to-code`.

## What It Does — The Pipeline (§4.15)
```
spec doc --fenced-math parse (D13) --> cards[]
        --oracle compile           --> registry { OR-<id>: {expected,computed,provenance} }
        --calibrate D17            --> report {pass, excluded, fail, rows}  (born-off → EXCLUDED, not FAIL)
        --decomposition            --> kernel prototypes  { <id>: {workflow, activity} }
        --stub emission            --> stubs { <id>: "Effect Activity stub" }
        --TestLive dry-run         --> dryRun summaries via runProgram under TestLive
        --journal sink             --> sha256 chain (spec-parse → calibrate → decompose → dry-run → sink)
```
The W7 MPSE bridge is a **composition**: `import { runDemoSync } from "../../mpse/demo"` — the single entry that does `compileDoc → compileOracle → calibrate → emitKernelProto → emitStubs`. The kernel wraps `runDemoSync` as an Effect Activity and **adds** the dry-run (Law 7: EXCLUDED ≠ FAIL, Law D3: map MathExpr → kernel coverage).

## Output IS the Macro Kernel Prototype
`kernel` keys the workflow protos (each `{ workflow: {$schema, meta{name,tier:1}, nodes, edges}, activity }`), `stubs` keys the typed Activity strings. Code Specs then specify only the delta: which kernels compose, which stubs to fill.

## Launch
```ts
import { runSpecToKernels } from "./kernels/spec-to-kernels/activities"
import { makeJournal, Journal } from "./core/journal"
import { Effect, Layer } from "effect"

const result = await Effect.runPromise(
  runSpecToKernels("jesl/fixtures/mpse-demo.json", { runId: "specKernels-demo" })
    .pipe(Effect.provide(Layer.effect(Journal)(makeJournal)))
)
// result.cards.length >= 3
// result.report.excluded >= 0 ; born-off row → EXCLUDED (reason EXCLUDED_BORN_OFF)
// result.report.fail === 0
// Object.keys(result.kernel).length === result.cards.length
// Object.keys(result.stubs).length === result.cards.length
// result.dryRun — one RunSummary per kernel proto, each PASS headless under TestLive
// result.doc — the decoded WorkflowDoc
// Journal rows for runId verify chain: prev/self sha256 linked, source workflow/spec-to-kernels/<node>
```

## D17 Guard
`calibrate` asserts: every `bornOff:true` mismatch becomes `EXCLUDED` with `reason: EXCLUDED_BORN_OFF`, never `FAIL`. A `FAIL` row is loud (`[JESL UNKNOWN-NODE] calibrate:fail`). Verify: `report.rows.find(r=>r.nodeId==="bornOff").status==="EXCLUDED"`.

## Dry-Run Law
The emitted kernel doc executes via `runProgram(doc, ctx)` under `TestLive = InMemoryLive = Shell+Fs+Http+Tool+Subagent+Llm+Journal+Clock+Emit` merged. Deterministic nodes EXECUTE before code exists; D1–D9 surface pre-build at zero cost. Each proto summary must have zero `FAIL` verdicts.

## Workflow
`bunx jesl run jesl/kernels/spec-to-kernels/workflow.json --in jesl/kernels/spec-to-kernels/fixtures/sample-spec.json`
`bunx jesl validate jesl/kernels/spec-to-kernels/workflow.json` → exit 0

## Laws
- Law α: kernels ARE Effect programs — this kernel IS the compiler of the insertion.
- Law 7: D17 check MUST assert `EXCLUDED ≠ FAIL`.
- Law E5: world-touching work in Activity (runDemo is the Activity).
- Law K8: loud-fail or clear-pass — bad spec → structured JeslError with `[JESL UNKNOWN-NODE]` / `[JESL CYCLE]`.
- Law K13: registry append-only — workflow kinds are known (`mpse-discharge`, `evidence-gate`, `gate`, `journal-sink`).

## Files
- `workflow.json` — tier-1 spec-to-kernels graph (spec-parse → calibrate → decompose → dry-run → sink)
- `activities.ts` — `runSpecToKernels / specToKernels / SpecToKernelsActivity`
- `fixtures/sample-spec.json` + `fixtures/bad-spec.json` — happy + error fixtures

