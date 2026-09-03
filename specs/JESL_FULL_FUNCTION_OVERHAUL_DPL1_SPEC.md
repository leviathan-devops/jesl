# BUILD SPEC ARTIFACT — JESL FULL-FUNCTION OVERHAUL
**Target:** `Effect_Runtime_Kernels/jesl/`
**Generated:** 2026-09-03
**Trident Version:** v4.4.3
**Status:** PLANNING
**Artifact Type:** BUILD_SPEC (Layer 1 Prompt)

---

## §1 PROBLEM STATEMENT

The JESL kernel registers 37 node kinds. 17 are implemented and return real verdicts when cast. 20 are stubs whose `invoke()` returns `{verdict: "INCONCLUSIVE", anchor: "TODO:<kind>:1"}` — they do nothing. The boilerplate derived from this kernel inherits the gap: a consumer casting any of the 20 stub kinds gets a placeholder, not a result.

**The product mandate:** "FULLY FUNCTIONAL BOILERPLATE MACHINERY I CAN PLUG INTO ANYTHING AND START FILLING WITH DATA AND ADAPTING." Every registered kind must do real work when cast. No INCONCLUSIVE placeholders in the production catalog.

Additionally: the boilerplate's `src/` layout is double-nested (`src/core/core/`), the tsconfig uses a 53-line per-directory include, and 12 .ts files carry `// @ts-nocheck`. These are adoption friction, not blockers, but they ship in the 1.0 boilerplate and must be cleaned.

## §2 ARCHITECTURE

The kernel is a JSON-graph executor on Effect-TS. Cards (workflow.json documents) are validated through a schema gate, compiled to a dependency graph, and executed on Effect fibers (concurrency 15). Every node invocation journals an INVOKE and a VERDICT row to a sha256-chained evidence log. The registry is append-only: stubs are replaced via `replaceStubSync(kind, impl)` at module import time.

The 20 stubs live in `nodes/stubs.ts` as a `stub(kind, family)` factory. Their logic exists elsewhere in the codebase:
- 12 wrap existing modules (mpse, evidence, scanners, wraps)
- 5 implement standard patterns (circuit-breaker, cron, event-reactivate, config-lock, layer-loader)
- 3 need new implementations (sqlite-sink, machine, workflow-machine)

## §3 DISCOVERY INTELLIGENCE

| Metric | Value | Source |
|---|---|---|
| TypeScript files | 109 | `find . -name '*.ts' -not -path '*/node_modules/*' \| wc -l` |
| Tests | 336 passed (34 files) | `npx vitest run` |
| Node kinds registered | 37 | `core/registry.ts:34-72` ALL_KINDS |
| Node kinds implemented | 17 | grep replaceStubSync across nodes/*.ts |
| Node kinds stubbed | 20 | 37 - 17 |
| stub() calls in stubs.ts | 25 | `grep -c 'stub(' nodes/stubs.ts` (includes superseded) |
| @ts-nocheck files | 12 | `grep -rl '@ts-nocheck' --include='*.ts'` |
| tsconfig include lines | 53 | `wc -l tsconfig.json` |
| algorithms/ dir | ABSENT | `test -d algorithms` |
| lexicon.ts | ABSENT | `test -f lexicon.ts` |
| profiles | 4 | trident, trading, sales, shared |
| spec manifest | `f77b448f` | recomputed 2026-09-03 |
| tree digest | `681bf869` | BUILD_STATE §2 |

## §4 CORE INSIGHT

The kernel's core machinery (schema gate, graph compiler, executor, journal, registry, packager) is production-grade — 336 tests, 4 container checkpoints, zero spec drift. The 20 stubs are **leaf nodes**: each one wraps existing logic (or a standard pattern) in a thin `invoke()` that returns a `NodeResult`. They are not core changes — they are leaves on a proven tree.

The implementation strategy is: **wire existing logic, don't reinvent it.** 12 of the 20 stubs call into modules that are already written and tested (mpse/oracle, core/evidence, scanners/pba-banks, wraps/behavior-engine). 5 implement well-known patterns using Effect primitives (Schedule, Ref, Layer). 3 need new logic (sqlite-sink, machine merge, workflow-machine).

**The non-negotiables:**
- Error handling on every path: a node's `invoke()` must return a proper `NodeResult` on success AND failure — never throw, never return undefined
- Boundary validation: config is untrusted input — validate before use
- Purity: zero `node:` imports in core/nodes (the driver boundary is the only host I/O)
- Token stability: the 8 frozen `[JESL ...]` tokens are the only refusal vocabulary

## §5 SCOPE

1. Implement 20 stub nodes in `jesl/nodes/` (one file per stub)
2. Create 10 algorithm card templates in `jesl/algorithms/`
3. Create the lexicon manifest generator (`jesl/lexicon.ts`)
4. Create the default profile (`jesl/profiles/default.ts`)
5. Flatten the boilerplate src/ double-nesting
6. Consolidate the tsconfig to a wildcard include
7. Remove @ts-nocheck from all 12 files
8. All 37 kinds return real verdicts when cast
9. Zero regressions on the existing 336-test battery
10. New tests for every implemented stub (~50 new it.effect units)

## §6 SUCCESS CRITERIA

| # | Criterion | Verification |
|---|---|---|
| S-1 | All 37 kinds return real verdicts (zero INCONCLUSIVE from non-stub paths) | `grep -rn 'INCONCLUSIVE' nodes/ \| grep -v stubs.ts \| grep -v test` → 0 hits |
| S-2 | TypeScript compiles clean | `cd jesl && bunx tsc --noEmit` → exit 0 |
| S-3 | Full test battery green (336 existing + ~50 new) | `npx vitest run` → all passed, 0 failed |
| S-4 | Token gate: exactly 8 frozen strings | `grep -rhoE '\[JESL [A-Z-]+\]' core/ nodes/ cli/ drivers/ scanners/ workflow/ packager/ wraps/ mpse/ kernels/ profiles/ bindings/ boilerplate/ \| sort -u` → exactly 8 |
| S-5 | Purity gate: zero node: imports in core/ | `grep -rn 'node:fs\|node:path\|node:child_process' core/ \| wc -l` → 0 |
| S-6 | Purity gate: zero Date.now in core/ | `grep -rn 'Date.now' core/ \| wc -l` → 0 |
| S-7 | Spec manifest unchanged | `cd specs && cat <4 files> \| sha256sum` → `f77b448f…` |
| S-8 | Spec-drift gate: zero drift through the overhaul | same as S-7, recomputed post-wave |
| S-9 | Every stub node has ≥2 it.effect tests | `grep -c 'it.effect' nodes/<stub>.test.ts` per node → ≥2 |
| S-10 | Algorithm cards cast cleanly | `bun run cli/main.ts run algorithms/guard.json` → PASS exit 0 |
| S-11 | Lexicon manifest generates | `bun run jesl/lexicon.ts` → lexicon.json exists with ≥37 entries |
| S-12 | Default profile validates | `grep -c 'DomainModule' profiles/default.ts` → ≥1 |
| S-13 | Boilerplate flattened (no double nesting) | `find boilerplate/src -name '*.ts' -path '*/*/*' \| wc -l` → 0 (only one dir level) |
| S-14 | tsconfig consolidated | `wc -l boilerplate/tsconfig.json` ≤ 20 (wildcard include) |
| S-15 | Zero @ts-nocheck | `grep -rl '@ts-nocheck' . --include='*.ts' \| wc -l` → 0 |

## §7 CONTAINER TEST PLAN

**Evidence requirement:** every scenario records its pass/fail in `.trident/container-test-results.json` with the pass token matched in tool-result context.

**Pass threshold:** 5/5 scenarios PASS. One FAIL invalidates the suite.

| # | Angle | Scenario | Pass token | Fail token |
|---|---|---|---|---|
| S1 | INTEGRATION | `jesl run fixtures/mech-gate.json` → full pipeline | `"verdict":"PASS"` + exit 0 | exit ≠ 0 |
| S2 | BOUNDARY | `jesl validate` each of the 4 bad fixtures → exact tokens | each `[JESL ...]` token, exit 2 | exit 0 on any |
| S3 | TOOLS | all 37 kinds cast without INCONCLUSIVE (new: oracle-gate, evidence-gate, circuit-breaker, etc.) | each stub's test passes with real verdict | `INCONCLUSIVE` from any non-stub path |
| S4 | ERRORS | cast with missing config fields → structured error, never a crash | the error message names the missing field | `ReferenceError` or crash |
| S5 | CONCURRENCY | parallel-5 with one branch failing → siblings survive | `overlapCount ≥ 1` + all 5 rows | sequential or missing rows |
| A1 | STATE | corrupted journal → replay → loud fail | `"verified":false` + exit 1 | `"verified":true` on corrupt |
| A2 | AUDIT | run the audit spell → findings have file:line anchors | `anchor=file:line` in results | findings without anchors |

<!-- DPL1-COMPLETE -->
