# TASK QUEUE — Effect_Runtime_Kernels (MacroKernel_Edition-v1.0)

## Purpose
The live queue: the gates, the active tasks, the completed-with-evidence, the backlog, the blocked. Overwritten per milestone. The dispatch source of truth alongside WAVE_PLAN.md.

## Section 1 — Gates
[FILL: per milestone — gate | state | the artifact]
| Gate | State | Evidence |
|---|---|---|
| The operator's BUILD GO | **GREEN (D25, 2026-09-02/03)** | DECISION_CHAIN D25 — "ABSORB. THEN EXECUTE. Do not stop until the ship package is complete." — all waves W0→W10 authorized; Law 2 satisfied and retired |
| W0 gate (the 9-questions probe) | **GREEN (2026-09-02)** | .trident/wave-audit/w0.md — 13 hunks VERDICT: CORRECT, coverage 100%; the probe 9/9 orchestrator-verified; bible v1.2 sha 68afa78e, DPL1 v1.1-E sha 35abb828 |
| W1 gate (tsc 0 + battery + same-tokens + diamond) | **GREEN (2026-09-02)** | .trident/wave-audit/w1.md — tsc 0 · vitest 104/104 · tokens byte-exact · diamond 2-batches; tree digest 12ffbb3d |
| S1E gate (tsc 0 + battery + same-tokens + diamond) | **GREEN (2026-09-02)** | = the W1 gate, closed with the audit |
| S2E gate (criteria 3,4,6,8 on the host) | **GREEN (2026-09-02, real path)** | .trident/wave-audit/w2.md — mech-gate PASS exit 0 via REAL nodes · 4 refusals exact · CAP-UNBOUND no-artifact · replay verified; tree digest e07eaf5c |
| S3E gate (criterion 11 + the roundtrip) | **GREEN (2026-09-02, host)** | .trident/wave-audit/w3.md — the ask-launcher E2E 12/12 · the scanners 23/23 · 164/164 total; tree digest c154678b |
| The 11-row battery [CT] | **FIRST CHECKPOINT GREEN (2026-09-02, container shark-effect-kernels-w3b)** | .trident/container-test-results.json — 10/10 scenarios PASS in the clean container (the full battery 164/164 · the token/exit suite · the roundtrip · the scanners · the adversarials incl. the corrupted-journal loud-fail); tarball sha 235a08d2 |
| The 11-row battery | NOT RUN | No .trident/container-test-results.json (first rows at W3) |
| Structure gate (canon scaffold) | **GREEN (2026-09-03)** | The scaffold verification in EVIDENCE_STATE §1 |

## Section 2 — Active Tasks
[FILL: owner + done-when + deps]
| Task | Owner | Done-when | Deps |
|---|---|---|---|
| W0 dispatch prep (the DPL1-grade prompts for A1 bible + A2 DPL1) | the primary (on go) | 2 prompts at the dispatch standard, preflighted | the operator's go |
| W0/A1 the bible PART 2E | build agent | Phase-2 §2.1's 13 rows + 5 patches + v1.2; additive-only greps pass | W0 dispatch |
| W0/A2 the DPL1 v1.1-E | build agent | §2.9 + §5.2 + criteria 13–16 + §8; section numbers stable | W0 dispatch |

## Section 3 — Completed Tasks (with evidence)
| Task | Evidence |
|---|---|
| The 5-region Paragon synthesis (Codename/Lexicon/LASME/ms-*/V1) | The 2026-09-03 explore returns (5 agents, fully anchored); folded into the L2's inputs |
| The L2 generation + audit | specs/MACRO_KERNEL_BOILERPLATE_L2_SPEC.md — 5,290L; preflight 8/8; 3 defects fixed; the audit appendix |
| The spec consolidation + the workspace | specs/ (4 files); WAVE_PLAN.md; this scaffold |
| The JESL canon chain (bible v1.1 + DPL1 + EFFECT-RT + Phase-2) | The 4 specs + the external bible (1,119L); the hive pointer bible/bible-jesl-json-event-scripting-library-v1 |

## Section 4 — Backlog (prioritized + rationale)
1. W1–W10 per WAVE_PLAN.md (the order is the priority; each is spec'd in the L2's §3/§4 + §6.1).
2. The Phase-2 stubs (semantic-search/docs-patterns) — stay honest-zero until the embedding surface lands (G10).
3. The shadow-agent full pi-harness binding (subagent-dispatch v2 per the original DPL1's out-of-scope).

## Section 5 — Blocked Items (blocker + unblock path)
| Item | Blocker | Unblock |
|---|---|---|
| ALL build waves (W0–W10) | The operator's go (Law 2) | The operator says go → record the ruling in DECISION_CHAIN → dispatch W0 |

## Anti-Patterns for This Doc
- NAPKIN: a todo list without done-whens. PADDING: wave-plan restatement (pointer instead). DRIFT: a completed task without evidence → the cross-check is EVIDENCE_STATE's rows.

## Fill Guidance
- When: per milestone + per gate transition. How: OVERWRITE. Substance: every done-when names a command/artifact; every completed row cites its evidence path.

## Section 6 — The Full Wave Task Table (all 11 waves — the queue's complete surface)
[FILL: the state column flips as waves dispatch/close]
| Wave | Agents | Files | Done-when (the gate) | State |
|---|---|---|---|---|
| W0 docs | 2 | the bible + the DPL1 (additive) | 9/9 probe; additive-only greps | **CLOSED (gate 9/9; audit w0.md)** |
| W1 core | 5 | F1-F9 + F10/F11 | tsc 0 · battery · same-tokens · diamond | **CLOSED (S1E gate GREEN; audit w1.md)** |
| W2 cli | 2 | F12-F13 | criteria 3,4,6,8 host | **CLOSED (S2E gate GREEN, real path; audit w2.md)** |
| W3 driver | 3 | F14-F15 | criterion 11 + roundtrip [CT] | **CLOSED (code gates GREEN + the [CT] checkpoint 10/10 in-container)** |
| W4 gen | 2 | F16-F17 | S7 + no-re-pay | **CLOSED (S4E gate GREEN: the no-re-pay proven; audit w4.md)** |
| W5 pkg+battery | 2 | F20 + F23-F25 | 3 targets · det · kill [CT] | **CLOSED (211/211 + the battery 11/11 in-container; audit w5.md)** |
| W6 wraps | 2 | the services + the LSP gate | S10 + the token [CT] | **CLOSED (233/233 + the THIRD [CT] in-container; audit w6.md)** |
| W7 bridge | 3 | F18 | the demo compile + D17 | **CLOSED (275/275; the demo compiles, D17 EXCLUDED reproduced; audit w7.md)** |
| W8 kernels | 6 | F19 ×6 | fixtures + the chain | **CLOSED (314/314; all 6 kernels + the journal chain; audit w8.md)** |
| W9 profiles | 2 | F21-F22 | 3 profiles, zero branches | **CLOSED (330/330; zero branches proven; audit w9.md)** |
| W10 ship | 1 | the extraction | 11/11 + adoption [CT] | **CLOSED (336/336 + the battery 11/11 + the FINAL [CT] in-container; the adoption dry-run PROVEN)** |

## Section 7 — The Gate Transition Log (append-only mirror)
[FILL: per transition — timestamp | gate | RED→GREEN | the artifact]
| Timestamp | Gate | Transition | Artifact |
|---|---|---|---|
| 2026-09-03 | Structure gate | → GREEN | the scaffold script output (EVIDENCE_STATE §2) |

## Section 8 — The Backlog Detail (the parked items, with un-park conditions)
1. The Phase-2 stubs (semantic/docs) — un-park when the embedding surface lands (G10).
2. The shadow-agent full pi-harness binding — un-park at the v2 wave (per the DPL1's out-of-scope).
3. The Codename↔V1 repo consolidation decision — un-park when the operator rules (both are the same six layers; one repo survives at ship time).

## Section 9 — The Per-Wave Gate Commands (verbatim — paste into the dispatch prompts)
```bash
# W0 gate: the 9-questions probe (manual read) + additive-only greps
grep -c "PART 2E" <bible>          # must be ≥ 1
grep -c "1A — THE" <bible>         # the laws still present

# W1 gate:
cd jesl && bunx tsc --noEmit && bun test
# every token fixture emits its exact string; the diamond in 2 batches

# W2 gate:
jesl run fixtures/mech-gate.json --in fixtures/in.json   # "verdict":"PASS" exit 0
jesl validate fixtures/bad-unknown-kind.json              # [JESL UNKNOWN-NODE] exit ≠ 0

# W3/W5/W6/W10 gates: the container battery (the 11-row plan, EVIDENCE_STATE §10)
```

## Section 10 — The Consolidation Survivor Table (single source of truth per mechanism)
| Mechanism | The survivor | The losers become |
|---|---|---|
| 4-bank classifier | ms-ratio-classifier | lexicon data only |
| λ-synapse | sentinel/synapse.ts | FamilyNeuron merged |
| enforcement lattice | V1 pure step() + ms-escalation-memory (the sole table) | LASME_v1's generalized def = the schema |
| evidence adjudication | the 8-kind event machine + ms-evidence-gates | the collector = the pool service |
| chain tracking | ms-chain-tracker | — |
| warhead delivery | ms-warhead-dispatcher + the 24-template corpus as data | — |
| journal | the JESL journal service | ms-persistence's atomic-write = the sink path |
| intent fusion | ms-intent-classifier (the inlined scorer EXTRACTED to import ms-ratio) | — |
