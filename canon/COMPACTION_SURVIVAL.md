# COMPACTION SURVIVAL — JESL (MacroKernel_Edition-v1.0)

## Purpose
The doc a POST-COMPACTION agent reads FIRST to regain full operating awareness without re-deriving anything. Everything needed to resume: the laws, the doctrine, the state pointer, the entry sequence.

## Section 1 — Operating Laws (the full set, with rationale)
1. **THE LIBRARY IS THE PRODUCT.** One library; mechanical tools / embedded agents / skill rockets are USE-CASE FAMILIES (compositions), never separate systems. RATIONALE: the operator's 2026-09-01 correction — "the 2 examples i gave are USE CASE TARGETS OF THE FULLY PRODUCTION GRADE LIBRARY. THROW THAT IN THE TRASH AND WIRE THE LIBRARY PROPERLY."
2. **SPEC-ONLY until the operator's go.** "dont build it just spec it" (standing ×2). No bun init, no deps, no scaffolding before the explicit go. The waves in WAVE_PLAN.md are DISPATCH-READY but FROZEN.
3. **THE SINGLE-RUNTIME LAW (E10).** Effect is the only kernel: one run* per hook/CLI invocation; inside, only yield*. XState/Promise loops/hook bodies are projectors or edges. floatingEffect + runEffectInsideEffect enforce mechanically (after S8L's patch).
4. **THE PURITY LAW (E3/K2).** jesl/core = zero host imports (no node:fs/global fetch/Date.now/Math.random/setTimeout) + zero raw Promise I/O in NodeImpl. Drivers adapt Promises at the cap boundary only (Effect.tryPromise).
5. **THE TOKEN-STABILITY LAW (D15/K3).** The [JESL ...] vocabulary is string-frozen: UNKNOWN-NODE, CYCLE, TIER-VIOLATION, UNBRACKETED-GENERATION, CAP-UNBOUND, ORACLE-MISSING, CHANNEL-UNSET, NO-SEED. Each = a Schema.TaggedError whose code PRINTS the exact token. Fixtures prove the strings across every migration.
6. **THE JOURNAL LAW (E5/1B).** Every node journals (pre-invoke + verdict, sha256-chained, source-discriminated); verdicts computed FROM rows never prose; covers() = replay (Activities never re-paid); the journal + serialized context = resume.
7. **THE LOUD-FAIL LAW (W10).** [JESL CAP-UNBOUND] with NO artifact; {ready:false, errors named}; INCONCLUSIVE = a fail-state never a pass; the FALLBACK TEST: same-artifact-only or banned.
8. **THE SEPARATION LAW (1A/E8).** Detect/decide/generate never merge in one node; detectors never decide; generators never verify themselves; tier/unbracket violations are SCHEMA refusals, not review comments.
9. **THE MPSE LAW.** Math-before-code; the oracle registry append-only (ORACLE_CONFLICT); floats need epsilon; discharge = integer equality (zero false positives); NaN→CONTRADICTED; unregistered→UNVERIFIABLE; D13 quote-gate; D17 EXCLUDED_BORN_OFF; A3 hostile-corpus rides as data.
10. **THE GROUNDING LAW (K14).** Effect wraps PROVEN machinery; a SPEC-GATED node ships only after its substrate's container row exists. MathExpr stays the IR (JESL math nodes COMPILE to the 24-kind grammar — no parallel expression language).
11. **THE COMPAT LAW (D7/K13).** Append-only registry; versioned $schema; v1 docs run on later registries forever; kinds never rename.
12. **THE LOWEST-COMPOSITION LAW (1I/E9).** The fewest generative nodes that satisfy; tier-1 forbids llm/subagent in R; tier-2 brackets generation (gate + repair≤2 + confidence 0.55→UNCLEAR).
13. **THE PROMPT-CACHING LAW (K4).** system.transform byte-identical every call (one char = 33×); ALL dynamic content via tool.execute.before only. The v4.4.4 shell is IMMUTABLE — Effect turbo-charges internals.

## Section 2 — Settled Doctrine (verbatim rulings)
- "JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime."
- "the shadow generates what only a language model can generate; the lexicons detect what patterns can detect; the state machines decide what state can decide; the actors execute what agents can execute"
- "the regex is a mechanical DETECTOR only (the detection layer, never the decision layer)" — Warhead 9
- "EITHER A LOUD FUCKING ERROR OR IT WORKS" — the loud-fail law
- "the firewall does not read the agent's reasoning — it evaluates the agent's number against the oracle"
- "Math is the spec. Code is the implementation. Tests are the proof."
- "EXISTENCE IS NOT AUDIT" — LASME_v1 audit-registry
- "THE SHELL STAYS. THE INTERNALS GET TURBO-CHARGED." — v4.4.4 §1:77
- The insertion: "MPSE specs --> macro kernel prototyps --> code specs" (engineered against v4.4.4 §2:106)
- The rockets: "skills as the payload deliver for ephemeral-kernel-tools ('rockets' - one off execution)"

## Section 3 — State at a Glance
[FILL: per milestone — the wave last closed, the gate result, the current SHA, the open defects]
- **2026-09-02 (W0-W10 ALL CLOSED — THE PRODUCT IS SHIPPABLE):** MacroKernel_Edition-v1.0 built to completion. 109 .ts files, 336 tests green (34 files), tree digest `681bf869`. All 10 waves closed with per-wave audits (.trident/wave-audit/w0-w10.md). All 4 [CT] container checkpoints GREEN (W3/W5/W6/W10). Zero spec drift (manifest `f77b448f` stable through all waves). The W7 MPSE bridge (the 24-kind IR + the oracle + D17), the W8 lifecycle kernels (6 kernels), the W9 profiles/bindings, the W10 extraction/adoption — all built and proven. The W1-W10 sweep found and fixed: 2 purity violations, 3 invented tokens, 1 determinism defect, 1 fitted-to-golden mask, 1 schema config strip, 1 executor empty inbound, 1 journal self-hash mismatch, 1 replay exit-code gap. All root-cause fixed, all re-verified.

## Section 4 — Doc Map (all 11 + the spec set)
| Doc | Path (relative to root) |
|---|---|
| This doc / CURRENT_STATE / NEXT_STEPS / TASK_QUEUE / BUILD_STATE / CHANGELOG / POST-COMPACTION_PROMPT / DECISION_CHAIN / EVIDENCE_STATE / RUNNING_BUILD_LOG / RUNNING_DEBUG_LOG | context_management/*.md |
| THE L2 (the implementation authority) | specs/MACRO_KERNEL_BOILERPLATE_L2_SPEC.md (5,290L) |
| The library DPL1 | specs/JESL_LIBRARY_DPL1_SPEC.md (477L; v1.1-E — the W0 patch LANDED) |
| EFFECT-RT v1.0 | specs/EFFECT_TS_RUNTIME_BIBLE.md (514L) |
| The Phase-2 docs-wave spec | specs/JESL_EFFECT_PHASE2_DPL1_SPEC.md (284L) |
| The wave plan | WAVE_PLAN.md (root) |
| The JESL bible (EXTERNAL canon) | KNOWLEDGE_LIBRARY/Bibles/JSON_EVENT_SCRIPTING_BIBLE.md (1,595L; v1.2 — the W0 patch LANDED) |

## Section 5 — Fresh-Agent Entry Rules (the 5 actions)
1. Read THIS doc fully (the laws + the doctrine).
2. Read context_management/BUILD_STATE.md + CURRENT_STATE.md (the state + the SHA chain).
3. Read WAVE_PLAN.md (what's next + its gate).
4. Read the L2's §6 (the wave map of record) + §7 (the battery) — the sections that govern dispatch.
5. Verify the state claim mechanically (the sha256 of the spec set vs EVIDENCE_STATE §1; later: the dist SHA). Then execute the next wave — NEVER ask permission (autonomy law), NEVER build before the operator's go (Law 2).

## Section 6 — Operating Rules Quick-Reference
- Dispatch: waves via the wave manager / direct task batch — ALL agents in ONE message; disjoint files; DPL1-grade prompts.
- Per wave: the gate is mechanical (tsc/battery/token greps) — a wave that cannot demonstrate its gate does not merge.
- Evidence: passTokens tool-result-bound; results in .trident/container-test-results.json; "structural PASS" = FLAWED.
- After every wave: canon-doc-update (BUILD_STATE SHA append, CHANGELOG entry, the two RUNNING logs while fresh).
- Do-nots: no second runtime; no T0 authorization; no replay re-pay; no separate journals; no Rhai/JS eval; no Effect.gen as the authoring language; no rewriting PBA banks/R0-R17 in Effect.gen (wrap); no custom tsserver; no GUI; no unrequested fallbacks; no deleting JESL laws/catalog/fixtures; no renaming kinds; no node:fs/fetch/Date.now in core.

## Anti-Patterns for This Doc
- NAPKIN: a 20-line "read the specs" note → the post-compaction agent re-derives the laws and violates the token freeze. PADDING: restating every spec section → drift from the specs of record. DRIFT: laws edited without a DECISION_CHAIN entry → the cross-check is DECISION_CHAIN's ruling list vs this §1/§2.

## Fill Guidance
- When: per milestone (canon-doc-update). How: OVERWRITE sections 3 + 5 freshness; the laws change ONLY via a DECISION_CHAIN ruling. Substance: ≥3 file:line/SHA refs per update.

## Section 7 — Law Enforcement Matrix (each law's mechanism + tripwire)
| Law | Enforced by | The tripwire (what fires when violated) |
|---|---|---|
| 1 Library-is-product | the schema (meta.tier audited) | [JESL TIER-VIOLATION] at validate |
| 2 Spec-only | DECISION_CHAIN D-PENDING + this doc | A wave dispatch without the D-PENDING entry = the freeze broken |
| 3 Single runtime | S8L patch + LSP rules | floatingEffect / runEffectInsideEffect at error severity |
| 4 Purity | criterion 13 ripgrep + verifyImportGraph | any node:fs/fetch/Date.now hit in jesl/core |
| 5 Token stability | the fixture battery (8↔8) | a fixture's emitted string ≠ the frozen token |
| 6 Journal | the executor (pre-invoke + verdict rows) | a node verdict row absent = the evidence-less anti-pattern |
| 7 Loud-fail | the TaggedError family + the FALLBACK TEST | a ready:true with a substitute artifact = FALSE SUCCESS |
| 8 Separation | the authoring gate | [JESL UNBRACKETED-GENERATION] |
| 9 MPSE | the oracle registry + D13/D17 | ORACLE_CONFLICT / EXCLUDED_BORN_OFF at compile |
| 10 Grounding | the SPEC-GATED ledger (EVIDENCE_STATE §4) | a PROVEN claim with no container row |
| 11 Compat | the registry's append-only map | a kind rename = release-blocking |
| 12 Lowest-composition | the R-type per run | llm in a tier-1 run's R = refused |
| 13 Prompt caching | the driver (system.transform untouched) | a byte diff in the transform output |

## Section 8 — The Emergency Recovery Procedure (when anything breaks mid-build)
1. STOP the wave — no further dispatches from the broken substrate.
2. READ RUNNING_DEBUG_LOG's last entries (the freshest failure context).
3. REPRODUCE mechanically (the failing command, exact output).
4. ROOT-CAUSE (5-why; never the surface symptom).
5. FIX the smallest change; regression-sweep the importers (zero broken windows).
6. LOG to RUNNING_DEBUG_LOG + append the BUILD_STATE delta.
7. RESUME the wave ONLY after the gate re-passes.

## Section 9 — The Compaction Protocol (what happens at the cliff)
- pre-compaction: canon-doc-update refreshes ALL 11; POST-COMPACTION_PROMPT overwritten with the live state; the spec-set digest recomputed into EVIDENCE_STATE §1.
- post-compaction: the fresh agent runs Section 5's entry sequence; the first action is executable without clarification; the state claim is verified against the digest.
- The two RUNNING logs are the perishable-knowledge insurance — they are read SECOND after this doc.

## Section 10 — The Wave Map (the one-glance build order)
```
W0 docs -> W1 core -> W2 cli -> W3 driver+scanners[CT] -> W4 gen -> W5 pkg+battery[CT]
                └────────────────────────────> W7 bridge -> W8 kernels -> W9 profiles -> W10 ship[CT]
                                              (W6 wraps[CT] after W5)
```
[CT] = a container checkpoint (a .trident/container-test-results.json row required).

## Section 11 — The Doctrine Cross-Reference (law ↔ source)
| Law | Source anchor |
|---|---|
| Separation | Warhead 9; EFFECT-RT E8; JESL 1A |
| Journal | EFFECT-RT E5; JESL 1B; grok journal.rs (the shape-proof) |
| Loud-fail | SHADOW_ENHANCED_TOOLS (the FALLBACK TEST); W10 |
| MPSE | MPSE_COMPLETE bible; the L2's K10 |
| Wrap-never-rewrite | Phase-2 D12 / P3-6; the L2's K14 |
| Caching | v4.4.4 §:261-267 (the 33× law) |
| Insertion | v4.4.4 §2:106 + D3 here |
| Rockets | D4 here; L2 §1.6 |

## Section 12 — Standing Reminders (the per-wave checklist)
- [ ] the wave's prompts are DPL1-grade (the dispatch-templates skill)
- [ ] the files are disjoint per agent
- [ ] the gate commands are in the prompt verbatim
- [ ] the canon updates ran (BUILD_STATE SHA, CHANGELOG, the RUNNING logs)
- [ ] the tokens unchanged (the fixture grep)
- [ ] no frozen machinery touched (BUILD_STATE §6)
- [ ] the evidence rows cite artifacts, not prose

## Section 13 — The Token Register (frozen — grep these verbatim)
```
[JESL UNKNOWN-NODE]          [JESL CYCLE]
[JESL TIER-VIOLATION]        [JESL UNBRACKETED-GENERATION]
[JESL CAP-UNBOUND]           [JESL ORACLE-MISSING]
[JESL CHANNEL-UNSET]         [JESL NO-SEED]
```
Any change to these strings requires a D-entry AND a fixture-battery update in the same wave. The
fixtures prove them; the fixtures ARE the tripwire. A migration that renames a token breaks the
battery loudly — that is the design working.

## Section 14 — The Node-Kind Registry (the ~40 kinds — the portability surface)
Deterministic (no caps): event-filter · capture-engine · machine · gate · oracle-gate ·
circuit-breaker · state-machine · journal-sink · triplet-writer · sqlite-sink · replay-source ·
pipeline · parallel · retry-chain · fallback-chain · pause · cron-trigger · event-reactivate ·
ratio-classifier · synapse · intent-classifier · escalation-memory · evidence-gate · layer-loader ·
math-eval · oracle-discharge · claim-gate · config-lock · workflow-machine · mpse-discharge ·
evidence-machine · audit-registry.
Execution (cap-bound): shell-exec · python-exec · http-request · file-io.
Generation (bracketed): prompt (dual-mode) · subagent-dispatch · shadow-agent.
APPEND-ONLY: kinds are never renamed or removed — new kinds only. A v1 doc runs on later
registries forever.

## Section 15 — The Canonical Constants (every threshold + its BECAUSE)
| Constant | Value | BECAUSE |
|---|---|---|
| concurrency cap | 15 | the wave-manager's proven bounded pool; >15 overwhelms the RPM ledger |
| stagger | 1-3s | spreads the first 8 emissions across one EXILE window |
| EXILE_MS | 45000 | the ledger window on nvidia/opencode rungs |
| POOL_TTL | 600_000 | 2× the gate freshness (300s) — the pool outlives its newest member |
| gate freshness | 300s | CLAIM_FRESH_WINDOW_MS from the baseline — the claim-after-evidence window |
| refractory | 25 seq | the paragon synapse's measured refractory period |
| α (decay) | 0.05 | the synapse decay rate per sequence step |
| fire threshold | 1.0 (family-keyed) | thr-v1 versioned |
| escalation windows | 5/2/0 | the deadline at esc-count ≤1/=2/≥3 |
| skip-tier | 0/2/3 | the tier floor at esc-count ≤1/=2/≥3 |
| repair max | 2 | the unbounded-repair lesson |
| confidence floor | 0.55 | below = UNCLEAR never a defect |
| read cap | 320 lines | the pi-harness bound |
| grep cap | 120 results | the pi-harness bound |
| RING_CAP | 50 events | the evidence ring |
| VERDICT_TTL_MS | 5000 | the verdict cache |
| depth | 256 (MathExpr) | the evaluator bound |
| domain | 10K (quantifiers) | the DOMAIN_UNBOUNDED guard |

## Section 16 — THE OVERHAUL STATE (2026-09-03, the pre-dispatch checkpoint)
- The build is CLOSED (W0-W10). The docs are CLOSED (5 bibles + 1 library, consolidated in Bibles/JESL/).
- The NEXT action is: dispatch the JESL Full-Function Overhaul (4 waves, 12 agents) to implement the 20 stubs + algorithm cards + lexicon + cleanup.
- The wave plan is at .trident/wave-plan.md (WAVES: 4). The DPL1 is at specs/JESL_FULL_FUNCTION_OVERHAUL_DPL1_SPEC.md.
- The POST-COMPACTION_PROMPT.md has the EXACT dispatch instruction — a fresh agent reads it and fires Wave 1.
- DO NOT re-plan. DO NOT re-research. The planning is DONE. Execute the waves.
