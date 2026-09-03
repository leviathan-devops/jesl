# Verify Kernel — Container-Suite Runner

## Fuse
Run `verify` after `kernels-to-code`. It takes the emitted code artifacts and proves them via a parallel battery.

## Payload
- `workflow.json` — the JESL graph: `verify-collect -> (S1,S2,S3) parallel -> verify-report` with oracle rows per scenario, passToken tool-result-bound.
- `activities.ts` — Effect Activities: `runVerify(artifacts, scenarios)` via `Effect.forEach(concurrency:15)` allSettled, each scenario journals invoke→verdict, collects `{pass,fail,rows}`.
- `fixtures/sample-artifacts.json` — minimal artifact fixture from kernels-to-code output.

## Launch
```ts
import { runVerify, makeArtifactFixture } from "./kernels/verify/activities"
import { makeJournal, Journal } from "./core/journal"
import { Effect, Layer } from "effect"
const artifacts = makeArtifactFixture("demo")
const scenarios = [
  { name: "S1", passToken: "PASS", failToken: "", run: () => Effect.succeed("tool-result: PASS") }
]
const report = await Effect.runPromise(
  runVerify(artifacts, scenarios).pipe(Effect.provide(Layer.effect(Journal)(makeJournal)))
)
// report: { pass, fail, rows: [{ scenario, passToken, passTokenMatch, failTokenAbsent, verdict }] }
```

## Laws
- Law 6: every step journals (invoke/verdict rows, sha256 chain via Journal service).
- Law 7: verdict from passToken match in toolResult — never fabricated.
- Law 11: Effect.forEach with per-scenario Effect.either — one failure never kills siblings.

## Workflow
`bunx jesl run jesl/kernels/verify/workflow.json --in jesl/kernels/verify/fixtures/sample-artifacts.json`
