# NEXT STEPS — JESL (MacroKernel_Edition-v1.0)

## Purpose
The forward plan: the next wave(s), the files they touch, the done-when gates, the risks. Overwritten per milestone. THIS doc + WAVE_PLAN.md are the dispatch pair.

## Section 1 — Wave Plan (the next 3 waves, expanded; the full set in WAVE_PLAN.md)
[FILL: per milestone — the next waves, their agent splits, their gates]
- **W0-W4 — ALL CLOSED.** W4: the generation surface + the durability layer — the no-re-pay replay PROVEN (invoke counter 0 on the second run, criterion 15); 184/184; audit w4.md. The W4 sweep fixed the recurring 9th-token class (JOURNAL-CORRUPT — the pattern is canon now, every dispatch carries the ban).
- **W0-W5 — ALL CLOSED.** W5: the 3 emitters (criterion 9 re-validation) + the executable 11-row battery (determinism + kill-resume + the artifact) — 211/211 + the battery 11/11 in-container; audit w5.md. THE BATTERY CAUGHT A REAL KERNEL DEFECT (canonicalSerialize included ts — determinism broken) — fixed and proven (chainsIdentical:true).
- **W0-W7 — ALL CLOSED.** W7: the MPSE bridge — the 24-kind MathExpr IR, the oracle registry (append-only + discharge matrix), the D17 EXCLUDED_BORN_OFF calibrate, the kernel/stub emits, the demo gate (the fixture compiles + D17 reproduced); 275/275; audit w7.md.
- **IMMEDIATE — W8 THE LIFECYCLE KERNELS (P3).** 6 agents: F19 ×6 (one per kernel: idea-to-bible, bible-to-spec, spec-to-kernels, kernels-to-code, verify, ship). Each kernel = SKILL.md + workflow.json + ctx.json + activities.ts + fixtures/. GATE: per-kernel fixtures + the lifecycle journal chain.
(Then W9 profiles → W10 ship [container].)

## Section 2 — Files to Touch (the next wave's surface + blast radius)
[FILL: per wave]
- W0/A1: KNOWLEDGE_LIBRARY/Bibles/JSON_EVENT_SCRIPTING_BIBLE.md (additive ONLY — insert PART 2E; patch 0.2/1F/2.5/Part9; v1.2 row). BLAST: the canon read by every JESL consumer — additive-only enforced.
- W0/A2: specs/JESL_LIBRARY_DPL1_SPEC.md (additive: §2.9, §5.2, criteria 13–16, §8; v1.1-E row). BLAST: the DPL1 referenced by the L2's §6 — keep section numbers stable.
- W1: the NEW tree jesl/core/*.ts + jesl/nodes/*.ts (greenfield — zero existing-code blast radius; the wrap targets are read-only).

## Section 3 — Done-When Criteria (measurable)
- W0 done-when: the Phase-2 §5 checklist answers 9/9 YES from {bible, DPL1, EFFECT-RT} alone; grep proves PART 2E exists once, no JESL law deleted, tokens unchanged.
- W1 done-when: `bunx tsc --noEmit` exit 0 in jesl/; `bun test` 0 fail; every one of the 8 token fixtures emits its exact string; the 3-node diamond journal shows exactly 2 batches; the 8-kind evidence machine's fixtures pass (each kind: accept + reject).
- W2 done-when: `jesl run fixtures/mech-gate.json` exits 0 with `"verdict":"PASS"` on stdout; the 4 bad fixtures refuse with their tokens; needs-llm yields `[JESL CAP-UNBOUND] llm` with NO artifact.

## Section 4 — Gate
The wave gate is the ONLY merge authority: a wave that cannot demonstrate its done-when mechanically does not merge (the slice law). The container checkpoints (W3/W5/W6/W10) additionally require .trident/container-test-results.json rows.

## Section 5 — Test Plan (the scenarios + passTokens for the near waves)
[FILL: per wave — mirrors L2 §7/the battery]
- W1: the token battery (8 fixtures ↔ 8 tokens, bidirectional grep zero orphans); the readiness diamond; the journal chain (kill-safe append; covers()).
- W2: S1/S2/S3 of the 11-row battery (run/validate/cap-unbound) — passTokens: `"verdict":"PASS"`, the per-fixture [JESL ...] strings, `[JESL CAP-UNBOUND] llm`.

## Section 6 — Risk Register
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| The @effect/workflow API surface differs (v3 vs v4) | med | W4/F17 rework | VERIFY-ON-INSTALL at S1E (DD24): write the concept, verify the import, adjust — never invent |
| The G1 port misses a guard subtlety (monotonic at, dist-scope) | med | The evidence machine mis-adjudicates | Port the baseline's OWN tests with the code (evidence-tracker's fixtures) — the accept/reject pairs |
| Token drift during the Effect migration | low | Fixtures break loudly (good) | K3: the S1E gate requires the same strings; the fixture battery is the tripwire |
| The docs wave accidentally deletes canon | low | Law 17 violation | Additive-only greps in the W0 gate (PART 2E present once; no law/catalog row removed) |
| W0 executes before the go | — | Law 2 violation | The freeze is canon (this doc + COMPACTION_SURVIVAL Law 2) |

## Anti-Patterns for This Doc
- NAPKIN: "build the core next" with no gate → a wave merges on vibes. PADDING: restating WAVE_PLAN verbatim → keep the next-3 expansion + pointer. DRIFT: a done-when that isn't mechanical.

## Fill Guidance
- When: per milestone. How: OVERWRITE. Substance: each done-when names its command + expected output; each risk names its mitigation's anchor.

## Section 7 — The Wave-by-Wave Expansion (all 11, one block each)
- **W0 docs:** A1 bible PART 2E (13 rows: 2E.0 bind → 2E.12 grounding) + 5 patches + v1.2; A2 DPL1 §2.9/§5.2/criteria-13-16/§8 + v1.1-E. GATE: 9/9 probe.
- **W1 core (S1E):** F1 schema · F2+F4 graph+channels · F3+F8 bus+caps · F5+F9 executor+errors · F6+F7 journal+registry+F10/F11 nodes+the evidence machine. GATE: tsc 0 · battery · same-tokens · diamond.
- **W2 cli (S2E):** F12 bin · F13 execution kinds. GATE: criteria 3,4,6,8 host.
- **W3 driver+scanners (S3E) [CT]:** F14 the Layer · F15 the five scanners. GATE: criterion 11 + the ask-launcher roundtrip.
- **W4 generation (S4E):** F16 prompt dual-mode · F17 jesl-run Workflow. GATE: S7 + no-re-pay.
- **W5 packager+battery (S5E-S6E) [CT]:** F20 emitters · F23-F25 fixtures+artifact. GATE: 3 targets run · 10/10 · determinism · kill-resume.
- **W6 wraps (S7P+S8L) [CT]:** the Paragon services · the LSP gate+patch. GATE: S10 pre-arm · the diagnostics token.
- **W7 bridge (P2):** F18 parser/cards · oracle/calibrate · kernel/stub emit. GATE: the demo fixture compiles; D17 reproduced.
- **W8 kernels (P3):** F19 ×6 (one agent per kernel). GATE: per-kernel fixtures + the lifecycle journal chain.
- **W9 profiles (P4):** F21 domains · F22 the binding pack. GATE: 3 profiles, zero branches.
- **W10 ship (P5) [CT]:** the full battery + the extraction. GATE: 11/11 + the adoption dry-run.

## Section 8 — The Test-Plan Scenario Table (the near waves)
| Wave | Scenario | passToken |
|---|---|---|
| W1 | the token battery | each frozen string, per fixture |
| W1 | the readiness diamond | exactly 2 batches in the journal |
| W2 | S1 run | `"verdict":"PASS"` |
| W2 | S2 validate | the per-fixture tokens |
| W2 | S3 cap-unbound | `[JESL CAP-UNBOUND] llm` + no artifact |

## Section 9 — The Dispatch Prep Checklist (per wave)
- [ ] the wave's file list confirmed disjoint
- [ ] each agent prompt carries its gate verbatim
- [ ] the frozen-machinery list re-read (BUILD_STATE §6)
- [ ] the canon-update pass scheduled post-gate
- [ ] the operator's go still in force (DECISION_CHAIN D-PENDING)

## Section 10 — The Six Lifecycle Kernels (the W8 deliverables — one line each)
1. **idea-to-bible:** parallel(explore) → merge machine → shadow-tool(cs T2) → schema-gate → journal.
2. **bible-to-spec:** digest → FR extraction (lexicon) → math-contract lint → DPL1 template gate.
3. **spec-to-kernels (THE INSERTION):** fenced-math parse → oracle compile → decomposition → stub emission → D17 → TestLive dry-run.
4. **kernels-to-code:** stub inventory → bracketed subagent-dispatch → per-stub oracle-gate → journal.
5. **verify:** the container-suite (scenarios as parallel + oracle rows; passToken tool-result-bound).
6. **ship:** manifest → copy → docs → audit gate chain.

## Section 11 — The Skill Rocket Anatomy (the W5/W8 emit target)
```
.opencode/skills/<rocket-name>/
  SKILL.md           ← the fuse: identity + when + the launch command
  payload/
    ctx.json         ← CONTEXT: preloaded knowledge, contracts
    mission.md       ← PROMPT: the objective + constraints
    anti-patterns.json ← TRAPS: the wrong/pairs as machine data
    schemas/         ← JSON SCHEMA: the output-contract + arg shapes
    workflow.json    ← EFFECT SHELL: the JESL graph
    activities.ts    ← the Effect Activity stubs/engines
    engines/         ← PREBUILT: doc-writer, matrix-calc, ... bound at launch
    tests/           ← TESTS: fixtures + oracle rows + the TestLive suite
```

## Section 12 — The Four Effect Layers (α/β/γ/δ — where Effect lives)
- **α pipeline self-hosting:** the 6 lifecycle kernels ARE Effect programs; the MPSE compiler runs as services.
- **β rocket propulsion:** every launch = Schema.decode → graph → provide(Layer) → fibers; the driver choice IS the Layer stack.
- **γ build supervision:** PBA/PTA/LSP as Effect services on one EventBus; Poseidon = one Workflow; XState = projectors.
- **δ verification:** TestLive everywhere; verdicts FROM journal rows.

## SECTION 13 — THE FULL-FUNCTION OVERHAUL (the active plan)
### The dispatch instruction
The wave plan is at `.trident/wave-plan.md` (WAVES: 4). The DPL1 spec is at `specs/JESL_FULL_FUNCTION_OVERHAUL_DPL1_SPEC.md`.
**THE NEXT SESSION DISPATCHES WAVE 1.** Do not re-plan. Do not re-research. Fire the generate.

### The 4 waves
| Wave | What | Agents | Gate |
|---|---|---|---|
| W1 | implement 20 stub nodes (5 parallel agents, disjoint files) | 5 | tsc 0 + vitest + zero INCONCLUSIVE |
| W2 | algorithm cards + lexicon manifest + default profile | 2 | guard.json PASS + lexicon ≥37 + profile validates |
| W3 | boilerplate flatten + tsconfig wildcard + @ts-nocheck removal | 3 | tsc 0 + vitest + zero nocheck + no double nesting |
| W4 | full gate + regression sweep + container [CT] | 1 | all 15 criteria (S-1..S-15) green |

### The 15 success criteria
See the DPL1 spec §6 — every criterion is command-verifiable.
