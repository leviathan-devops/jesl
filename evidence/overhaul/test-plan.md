# TEST PLAN — JESL Wave 3 Runtime Verification (container checkpoint)

## OBJECTIVE

Runtime-grade container verification of the JESL kernel post-Wave-3: tsconfig wildcard consolidation (20 lines), @ts-nocheck removed from 13 files via type-only fixes, registry-backed CLI kind-to-impl resolution (the Wave-2 mock-split fix). Proves the production cast path, the full 424-test battery, and the frozen-token loud-fail behavior survive the Wave 3 edits inside a fresh container.

## TOOLS UNDER TEST

- jesl/cli/main.ts run path — registry-backed resolution via core/registry.ts getRegisteredImplSync; Wave-3 touched cli/handlers.ts imports and the loud unknown-kind throw.
- tests/battery.ts + tests/battery.test.ts — un-suppressed in Wave 3; handlers restored to Effect.gen + Ref.update + Clock.currentTimeMillis form after the mid-course Effect.succeed damage (reverted per orchestrator correction).
- tsconfig.json — 20-line wildcard include; exclude list = the 3 original fixture exclusions only.
- Frozen-token refusal paths: [JESL CYCLE] (schema/graph), [JESL UNKNOWN-NODE] (registry unknown kind, loud throw added Wave 2).
- core/journal.ts verifyChain — state integrity loud-fail.

Blast radius: every Wave-3-changed file's importers are test files inside the 39-file battery; the 10 algorithm cards are the production consumers of the registry path; lexicon.ts + profiles/default.ts are type-checked now that tsconfig includes all files.

## TEST SCENARIOS

Scenario 1: production-cast
prompt: cd /app/jesl && bun run cli/main.ts run algorithms/guard.json; echo EXIT:$?
pass criteria: output contains "verdict":"PASS" and EXIT:0
fail criteria: output contains any [JESL error token, or exit code is not 0

Scenario 2: full-battery
prompt: cd /app/jesl && timeout 280 npx vitest run 2>&1 | tail -n 8
pass criteria: output contains Tests  424 passed and Test Files  39 passed
fail criteria: output contains failed in the summary lines, or the run hits the 280 second timeout (a hang is a FAIL)

Scenario 3: cycle-refusal-adversarial
prompt: cd /app/jesl && bun run cli/main.ts run fixtures/bad-cycle.json; echo EXIT:$?
pass criteria: output contains [JESL CYCLE] and EXIT:2
fail criteria: exit code 0, or a wrong token string emitted

Scenario 4: unknown-kind-adversarial
prompt: write /tmp/bad-kind.json with a node of type not-a-kind, then cd /app/jesl && bun run cli/main.ts run /tmp/bad-kind.json; echo EXIT:$?
pass criteria: output contains [JESL UNKNOWN-NODE] and a non-zero exit code
fail criteria: exit code 0, or a silent PASS verdict

## ADVERSARIAL

Scenario 3 exercises the malformed-graph refusal (cycle detection) and Scenario 4 the unknown-kind loud-fail through the NEW registry-backed resolution path — the exact failure classes Wave 3 touched. Scenario 2's timeout guard covers the hang class introduced and reverted during the first typed-tests pass (instant Effect.succeed handlers starved the kill-resume test).

## EVIDENCE

.trident/container-test-results.json with per-scenario rows (scenario, passTokenMatch, failTokenAbsent, toolResultExcerpt, verdict); sha256 digest of the deployed jesl tree recorded in the artifact; raw tool-result excerpts per scenario; container name and image recorded.

## PASS CRITERIA

4 of 4 scenarios PASS with pass tokens matched in tool-result context and fail tokens absent; the results artifact is written before any PASS declaration; any single FAIL invalidates the suite and routes to a fix before re-run.
