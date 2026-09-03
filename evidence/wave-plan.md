# JESL FULL-FUNCTION OVERHAUL — WAVE PLAN
WAVES: 4

## TARGET (verbatim success criteria)
T-1: all 37 kinds return real verdicts (zero INCONCLUSIVE from non-stub paths)
T-2: tsc 0
T-3: vitest all green (336 existing + ~50 new)
T-4: token gate 8/8
T-5: purity gate 0 node: in core/
T-6: spec manifest f77b448f unchanged
T-7: every stub node has ≥2 it.effect tests
T-8: algorithm cards cast cleanly (PASS exit 0)
T-9: lexicon manifest generates (≥37 entries)
T-10: default profile validates
T-11: boilerplate flattened (no double nesting)
T-12: tsconfig consolidated (wildcard include)
T-13: zero @ts-nocheck

## BASELINE (verified 2026-09-03)
B-1: 109 .ts files, 336/336 tests green, tsc 0
B-2: 37 kinds registered, 17 implemented, 20 stubs returning INCONCLUSIVE
B-3: 25 stub() calls in stubs.ts (5 superseded by replaceStubSync)
B-4: 12 files carry @ts-nocheck
B-5: tsconfig has 53-line per-directory include
B-6: no algorithms/ dir, no lexicon.ts
B-7: 4 profiles (trident, trading, sales, shared) — no default
B-8: spec manifest f77b448f stable
B-9: tree digest 681bf869

## TARGET CLASSIFICATION
Type: OVERHAUL (fill gaps in a proven system)
D-routes: D3 (stub-as-done — an agent marks a stub implemented without real logic)
T-classes: T1 (theatrical INCONCLUSIVE), T2 (empty invoke that returns PASS without work)

## FORWARD WAVES

### Wave 1 — THE 20 STUB IMPLEMENTATIONS [depends: nothing]
Gate: `cd jesl && bunx tsc --noEmit && npx vitest run && grep -rn 'INCONCLUSIVE' nodes/ --include='*.ts' | grep -v stubs.ts | grep -v test | wc -l` → 0

| Subagent | Files (disjoint) | Stubs | Wraps |
|---|---|---|---|
| w1-mpse-nodes | nodes/oracle-gate.ts, nodes/oracle-discharge.ts, nodes/mpse-discharge.ts + tests | 3 | mpse/oracle.ts + mpse/demo.ts |
| w1-evidence-nodes | nodes/evidence-gate.ts, nodes/evidence-machine.ts, nodes/claim-gate.ts, nodes/audit-registry.ts + tests | 4 | core/evidence.ts + scanners/audit.ts |
| w1-paragon-nodes | nodes/ratio-classifier.ts, nodes/synapse.ts, nodes/intent-classifier.ts, nodes/escalation-memory.ts + tests | 4 | scanners/pba-banks.ts + wraps/behavior-engine.ts |
| w1-pattern-nodes | nodes/circuit-breaker.ts, nodes/cron-trigger.ts, nodes/event-reactivate.ts, nodes/config-lock.ts, nodes/layer-loader.ts + tests | 5 | Effect primitives (Schedule, Ref, Layer) |
| w1-infra-nodes | nodes/sqlite-sink.ts, nodes/machine.ts, nodes/workflow-machine.ts, nodes/replay-source.ts + tests | 4 | better-sqlite3 + workflow/jesl-run.ts |

Each agent: write the node file(s), call replaceStubSync at module bottom, write 2-3 it.effect tests, verify tsc 0 + own tests green.

### Wave 2 — ALGORITHM CARDS + LEXICON + DEFAULT PROFILE [depends: wave 1]
Gate: `bun run cli/main.ts run algorithms/guard.json` → PASS exit 0 · `lexicon.json` exists with ≥37 entries · `profiles/default.ts` validates

| Subagent | Files (disjoint) | Micro-tasks |
|---|---|---|
| w2-algorithm-cards | jesl/algorithms/*.json (10 files) | author the 10 named chains as castable cards using the now-functional kinds |
| w2-lexicon-profile | jesl/lexicon.ts, jesl/profiles/default.ts | the manifest generator (~50 lines) + the default DomainModule (~15 lines) |

### Wave 3 — BOILERPLATE CLEANUP [depends: wave 2]
Gate: `tsc 0` · `vitest all green` · `grep -rl '@ts-nocheck' --include='*.ts' | wc -l` → 0 · `find boilerplate/src -name '*.ts' -path '*/*/*/*' | wc -l` → 0 (no double nesting)

| Subagent | Files (disjoint) | Micro-tasks |
|---|---|---|
| w3-flatten | boilerplate/src/** | move files up one level, fix imports, fix tsconfig |
| w3-typed-tests | the 12 @ts-nocheck files | add correct TestServices type annotations, remove @ts-nocheck |
| w3-tsconfig | tsconfig.json | replace per-dir include with wildcard |

### Wave 4 — FINAL GATE + REGRESSION SWEEP [depends: wave 3]
Gate: the full battery (336 + new) + all 15 success criteria (S-1..S-15)

| Subagent | Scope |
|---|---|
| w4-final-gate | run the full battery, the token gate, the purity gate, the spec manifest, the boilerplate re-extraction, paste all raw outputs |

## DEPENDENCY GRAPH
```
W1 (20 stubs) ──► W2 (cards+lexicon) ──► W3 (cleanup) ──► W4 (final gate)
```

## COVERAGE MAP
| Criterion | Wave | Agent |
|---|---|---|
| T-1 (37/37 real) | W1 | all 5 agents |
| T-2 (tsc 0) | W1-W3 | all agents |
| T-3 (battery) | W1+W4 | w4-final-gate |
| T-4 (tokens) | W4 | w4-final-gate |
| T-5 (purity) | W4 | w4-final-gate |
| T-6 (manifest) | W4 | w4-final-gate |
| T-7 (stub tests) | W1 | all 5 agents |
| T-8 (algorithms) | W2 | w2-algorithm-cards |
| T-9 (lexicon) | W2 | w2-lexicon-profile |
| T-10 (default profile) | W2 | w2-lexicon-profile |
| T-11 (flatten) | W3 | w3-flatten |
| T-12 (tsconfig) | W3 | w3-tsconfig |
| T-13 (@ts-nocheck) | W3 | w3-typed-tests |
