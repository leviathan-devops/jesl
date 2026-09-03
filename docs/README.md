# THE JESL KNOWLEDGE FOLDER — INDEX

> **WHAT THIS IS:** the consolidated JESL document library. Every JESL-relevant bible, manual, and canon lives here. Anything superseded or executed is in `archive/`.
> **CODE:** the kernel source lives at `Effect_Runtime_Kernels/jesl/` (109 .ts files · runner `npx vitest run` · 336 tests green).

---

## THE READING ORDER (fresh agent: top to bottom)

| # | Doc | Lines | Role |
|---|---|---|---|
| 1 | **JESL_SPELLCASTING_LIBRARY.md** | 915 | THE KNOWLEDGE LIBRARY — cards, rolodex, compiler machines, kernels (4 machine types), rockets, the 5-stage spellcasting pipeline, TDM framework map, algorithms (active spells), build scenarios (God Loop / code-audit / container-test / firewall / ship / D3) |
| 2 | **EFFECT_SPELLCASTING_BIBLE.md** | 492 | THE CANON MECHANICS — the shared physics of magic across Skyrim/Oblivion/Witcher/Eragon, extracted to the universal spell model (primitives, pricing, targeting, execution classes, resolution, stacking, the interface-compiler, the mastery ladder) + the 9-stage pipeline |
| 3 | **JESL_KERNEL_OPERATING_MANUAL.md** | 504 | THE OPERATING MANUAL — how to USE the kernel: author docs, cast via CLI, the programmatic API, packaging, the lifecycle kernels |
| 4 | **JESL_KERNEL_ARCHITECTURE_BIBLE.md** | 1,786 | THE ARCHITECTURE — how to BUILD on the kernel: all 10 core modules deep-dived, the node system, drivers, scanners, MPSE bridge, lifecycle kernels, testing architecture (336-test ledger), the evidence chain |
| 5 | **EFFECT_TS_RUNTIME_BIBLE.md** | 514 | THE EFFECT CANON — laws E1-E10, the kernel services map, node→Effect table, drivers=Layers, Workflow vs Fiber |
| 6 | **JSON_EVENT_SCRIPTING_BIBLE.md** | 1,595 | THE LANGUAGE CANON v1.2 — the grammar, laws 1A-1I, the node-kind registry, PART 2E (the Effect bind), the catalog, 9G law table. THE FILENAME STAYS JSON_EVENT (frozen anchor; the prose expansion is "JSON Effect Scripting Language" per D26) |

---

## THE ARCHIVE (executed / superseded — do not cite as live authority)

| Doc | Why archived |
|---|---|
| `archive/JESL_EFFECT_PHASE2_DPL1_SPEC.md` | the Phase-2 docs-wave instruction — EXECUTED at W0 (its content is absorbed into JSON_EVENT_SCRIPTING_BIBLE v1.2 PART 2E + the DPL1 v1.1-E §2.9/§5.2). The live authority copy is pinned at `Effect_Runtime_Kernels/specs/` in the manifest `f77b448f` |

---

## THE PINNED AUTHORITY (lives elsewhere — pointers, not copies)

These are the READ-ONLY implementation authorities, pinned by the spec manifest `f77b448f` (NUL-joined sha256, stable through all 10 build waves). They stay at their pinned paths to keep the manifest verifiable:

| Spec | Path | Lines |
|---|---|---|
| THE L2 (implementation authority) | `Effect_Runtime_Kernels/specs/MACRO_KERNEL_BOILERPLATE_L2_SPEC.md` | 5,290 |
| THE LIBRARY DPL1 (v1.1-E) | `Effect_Runtime_Kernels/specs/JESL_LIBRARY_DPL1_SPEC.md` | 477 |
| THE PHASE-2 SPEC (executed) | `Effect_Runtime_Kernels/specs/JESL_EFFECT_PHASE2_DPL1_SPEC.md` | 284 |
| THE TDM SPEC | `Trident_Agent/Active_Projects/v4.4.3/TRIDENT_DECISION_MAKING_TOOL_SPEC.md` | 1,525 |

Manifest recompute:
```bash
cd Effect_Runtime_Kernels/specs && cat MACRO_KERNEL_BOILERPLATE_L2_SPEC.md <(printf '\0') \
  JESL_LIBRARY_DPL1_SPEC.md <(printf '\0') EFFECT_TS_RUNTIME_BIBLE.md <(printf '\0') \
  JESL_EFFECT_PHASE2_DPL1_SPEC.md | sha256sum
# expect f77b448fff1ea3f38524949c09c3b0d89657e5cc90131f990b32d574f8a8ff1c
```

NOTE: EFFECT_TS_RUNTIME_BIBLE.md lives in BOTH places — this folder (moved 2026-09-03) and the pinned specs/ copy (byte-identical at move time; the specs/ copy is the manifest-pinned one).

---

## THE RELATED CANON (outside this folder)

| Doc | Path | Relevance |
|---|---|---|
| BUILD_REPORT | `Effect_Runtime_Kernels/BUILD_REPORT.md` (597L) | the wave-by-wave build evidence |
| CANON (12 docs) | `Effect_Runtime_Kernels/context_management/` | the live state ledger |
| WAVE AUDITS | `Effect_Runtime_Kernels/.trident/wave-audit/w0-w9.md` | per-wave verdicts |
| CONTAINER ARTIFACT | `Effect_Runtime_Kernels/.trident/container-test-results.json` | 28 runtime rows, 4 checkpoints |
| TDM v4.4.3 TRUTH CONTEXT | `trident-tmp/ctx-c-v443-truth.md` + `trident-tmp/ms-decision.md` | the v4.4.3 decision-engine working context |
