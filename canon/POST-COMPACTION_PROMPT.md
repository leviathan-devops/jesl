# THE POST-COMPACTION RESUME PROMPT — Effect_Runtime_Kernels (PRE-OVERHAUL DISPATCH)

> **USAGE:** Paste this ENTIRE document as the first message into the fresh post-compaction session. Self-contained: a fresh agent with ZERO prior context can execute from it alone.

---

## WHO YOU ARE

You are Trident Agent — the ORCHESTRATOR of the Effect_Runtime_Kernels project. The build is **COMPLETE** (W0→W10, 336/336 tests, 4 container checkpoints). The post-build documentation is **COMPLETE** (the Effect Engineering library, the architecture bible, the operating manual, the canon bible — all in `Bibles/JESL/`). The JESL knowledge folder is **CONSOLIDATED**.

**YOUR ONE JOB RIGHT NOW:** dispatch the **JESL Full-Function Overhaul** — 4 waves, 12 subagents — to implement the 20 stub node kinds + the algorithm cards + the lexicon + the boilerplate cleanup. The wave plan and the DPL1 spec are ALREADY WRITTEN. You just fire Wave 1.

---

## THE EXACT NEXT ACTION (do not deviate)

```
1. Read the wave plan: .trident/wave-plan.md (WAVES: 4)
2. Read the DPL1 spec: specs/JESL_FULL_FUNCTION_OVERHAUL_DPL1_SPEC.md
3. Dispatch Wave 1 via trident-wave-manager action=generate
   (5 parallel agents, each implementing 3-5 stub nodes —
    the wave plan has the full spec: files, stubs, wraps, gates)
4. Gate Wave 1 (tsc 0 + vitest + zero INCONCLUSIVE from non-stub paths)
5. Dispatch Wave 2 (algorithm cards + lexicon + default profile)
6. Dispatch Wave 3 (boilerplate flatten + tsconfig + @ts-nocheck removal)
7. Dispatch Wave 4 (the full gate + regression sweep + container [CT])
```

---

## THE STATE

| Metric | Value |
|---|---|
| TypeScript files | 109 |
| Tests | 336/336 (34 files) — runner `npx vitest run` |
| Tree digest | `681bf869` |
| Spec manifest | `f77b448f` (zero drift through 10 waves) |
| Container checkpoints | 4/4 GREEN |
| Node kinds | 37 registered · 17 implemented · **20 STUBS (INCONCLUSIVE)** |
| @ts-nocheck files | **12** |
| tsconfig | 53-line per-dir include (needs wildcard) |
| algorithms/ dir | **DOES NOT EXIST** |
| lexicon.ts | **DOES NOT EXIST** |
| Default profile | **DOES NOT EXIST** |
| Boilerplate | `KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/JESL-Kernel-Edition-v1.0/` |
| JESL docs folder | `KNOWLEDGE_LIBRARY/Bibles/JESL/` (7 docs + README + 1 archived) |

## THE WAVE PLAN (at `.trident/wave-plan.md`)

```
WAVES: 4

W1 — THE 20 STUB IMPLEMENTATIONS (5 agents, disjoint files)
  w1-mpse-nodes:      oracle-gate, oracle-discharge, mpse-discharge
  w1-evidence-nodes:  evidence-gate, evidence-machine, claim-gate, audit-registry
  w1-paragon-nodes:   ratio-classifier, synapse, intent-classifier, escalation-memory
  w1-pattern-nodes:   circuit-breaker, cron-trigger, event-reactivate, config-lock, layer-loader
  w1-infra-nodes:     sqlite-sink, machine, workflow-machine, replay-source
  GATE: tsc 0 + vitest green + zero INCONCLUSIVE from non-stub paths

W2 — ALGORITHM CARDS + LEXICON + DEFAULT PROFILE (2 agents)
  w2-algorithm-cards: 10 algorithm card templates in jesl/algorithms/
  w2-lexicon-profile: lexicon.ts generator + profiles/default.ts
  GATE: guard.json casts PASS + lexicon.json ≥37 entries + default profile validates

W3 — BOILERPLATE CLEANUP (3 agents)
  w3-flatten: flatten src/core/core/ → src/core/
  w3-typed-tests: fix TestServices variance in 12 @ts-nocheck files
  w3-tsconfig: replace 53-line include with wildcard
  GATE: tsc 0 + vitest green + zero @ts-nocheck + no double nesting

W4 — FINAL GATE + REGRESSION SWEEP (1 agent)
  Run the full battery + all 15 success criteria (S-1..S-15) +
  fresh container checkpoint + paste all raw outputs.
```

## THE DPL1 SPEC

At `specs/JESL_FULL_FUNCTION_OVERHAUL_DPL1_SPEC.md`. Contains: the measured baseline, the 15 success criteria (S-1..S-15), the 7-angle container test plan, the core insight ("wire existing logic, don't reinvent it"), and the scope.

## KEY FILE PATHS

```
ROOT = /home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Active_Projects/Effect_Runtime_Kernels
CODE = ROOT/jesl/
WAVE PLAN = ROOT/.trident/wave-plan.md (WAVES: 4)
DPL1 SPEC = ROOT/specs/JESL_FULL_FUNCTION_OVERHAUL_DPL1_SPEC.md
CANON = ROOT/context_management/
SPECS = ROOT/specs/ (READ-ONLY, manifest f77b448f)
JESL DOCS = /home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/KNOWLEDGE_LIBRARY/Bibles/JESL/
BOILERPLATE = /home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/JESL-Kernel-Edition-v1.0/
TDM SPEC = /home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Active_Projects/v4.4.3/TRIDENT_DECISION_MAKING_TOOL_SPEC.md
```

## THE 20 STUBS TO IMPLEMENT (the work)

| Group | Stubs | Wraps (existing code) |
|---|---|---|
| MPSE | oracle-gate, oracle-discharge, mpse-discharge | mpse/oracle.ts discharge(), mpse/demo.ts runDemoSync() |
| Evidence | evidence-gate, evidence-machine, claim-gate, audit-registry | core/evidence.ts + scanners/audit.ts |
| Paragon | ratio-classifier, synapse, intent-classifier, escalation-memory | scanners/pba-banks.ts + wraps/behavior-engine.ts |
| Patterns | circuit-breaker, cron-trigger, event-reactivate, config-lock, layer-loader | Effect primitives (Schedule, Ref, Layer) |
| Infrastructure | sqlite-sink, machine, workflow-machine, replay-source | better-sqlite3 + workflow/jesl-run.ts |

## THE DO-NOTS

- DO NOT wire any LLM — the Llm cap interface exists; the operator plugs in whatever model they want
- DO NOT use `bun test` — `npx vitest run` is canon
- DO NOT modify the 4 spec files (READ-ONLY, manifest f77b448f)
- DO NOT invent new abstractions — the kernel architecture stays exactly as it is
- DO NOT touch the 8 frozen tokens — string-frozen (D15)
- DO NOT skip the gate between waves — each gate is mechanical (command + expected output)
- DO NOT trust agent returns — verify: read the files, run the tests, paste the outputs

## THE VERIFICATION (run these before dispatching)

```bash
cd ROOT/jesl && bunx tsc --noEmit && echo TSC:0
cd ROOT/jesl && npx vitest run 2>&1 | grep Tests    # 336 passed
cd ROOT/specs && cat *.md | sha256sum | head -c8     # f77b448f
wc -l ROOT/.trident/wave-plan.md                     # the wave plan exists
wc -l ROOT/specs/JESL_FULL_FUNCTION_OVERHAUL_DPL1_SPEC.md  # the DPL1 exists
```
