# CANON MANIFEST — Effect_Runtime_Kernels

## Project Identity
- Project root: `/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Active_Projects/Effect_Runtime_Kernels`
- Agent: trident (the v4.4.2-paragon-wave-manager lineage, dist head 14e45a5e)
- Model/Provider: the session's current model
- Created: 2026-09-03 (scaffolded by canon-doc-setup)
- Project: MacroKernel_Edition-v1.0 — the JSON/Effect runtime-kernel library (one production library; the mechanical-tools / embedded-agents / skill-rockets asks are use-case families of it)

## The 11 Canon Docs (contract)
| # | Doc | Floor | Semantics | Frequency |
|---|-----|-------|-----------|-----------|
| 1 | COMPACTION_SURVIVAL.md | 200+ | OVERWRITE | per milestone |
| 2 | CURRENT_STATE.md | 200+ | OVERWRITE | per milestone |
| 3 | NEXT_STEPS.md | 200+ | OVERWRITE | per milestone |
| 4 | TASK_QUEUE.md | 200+ | OVERWRITE | per milestone |
| 5 | BUILD_STATE.md | 200+ | OVERWRITE (SHA chain appended) | per milestone |
| 6 | CHANGELOG.md | 200+ | APPEND | per session |
| 7 | POST-COMPACTION_PROMPT.md | 200+ | OVERWRITE | pre-compaction |
| 8 | DECISION_CHAIN.md | 200+ | APPEND | per ruling |
| 9 | EVIDENCE_STATE.md | 200+ | APPEND + overwrite summary | per evidence |
| 10 | RUNNING_BUILD_LOG.md | stub | APPEND ONLY | every wave/feature/learning |
| 11 | RUNNING_DEBUG_LOG.md | stub | APPEND ONLY | every debug/root-cause |

## Baseline
- Baseline SHA: `a4c8f19e` — the spec-set manifest (sha256 over the 4 specs, NUL-joined; recorded at scaffold; see EVIDENCE_STATE.md §1)
- Baseline date: 2026-09-03
- Build state: **SPEC-STAGE — no code exists.** The first code artifact (W1/S1E) supersedes this baseline.

## The Spec Set (the authority chain — all under specs/)
| Artifact | Lines | Role |
|---|---|---|
| MACRO_KERNEL_BOILERPLATE_L2_SPEC.md | 5,290 | THE L2 — the implementation authority (§6.1 the wave map; §7 the 199 assertions; the 11-row battery) |
| JESL_LIBRARY_DPL1_SPEC.md | 343 | the library DPL1 (the core contracts, slices S1–S6, 12 criteria, §7's 7 + the 9-fixture set) — awaits the v1.1-E Phase-2 patch (W0) |
| EFFECT_TS_RUNTIME_BIBLE.md | 514 | EFFECT-RT v1.0 — laws E1–E10, the kernel services map, the node→Effect table, the 3 drivers, the scanners, 5K, P3-1..12 |
| JESL_EFFECT_PHASE2_DPL1_SPEC.md | 284 | the Phase-2 docs-wave spec (D9–D15, PART 2E, S1E–S8L, criteria 13–16, S8/S9/S10) |
| WAVE_PLAN.md (root) | ~120 | the dispatch-ready W0–W10 expansion of L2 §6.1 |
| Companion canon (EXTERNAL, do not move): KNOWLEDGE_LIBRARY/Bibles/JSON_EVENT_SCRIPTING_BIBLE.md | 1,119 | JESL v1.1 — the grammar + the 48-entry catalog + the 9 laws; W0 patches it to v1.2 |

## Update Log
- 2026-09-03 — scaffolded by canon-doc-setup; the spec set consolidated from 4 scattered locations; WAVE_PLAN.md written; baseline recorded.
