# CURRENT STATE — JESL (MacroKernel_Edition-v1.0)

## Purpose
The per-module, per-artifact status board: what EXISTS, what is SOLID, what is OPEN — with the anchors. Overwritten per milestone. A fresh agent reads this to know exactly where the build stands without re-probing the tree.

## Section 1 — Per-Module Status
[FILL: per milestone — module | status (built/solid/broken/open) | the anchor | the SHA]
| Module / Artifact | Status | Anchor / Evidence |
|---|---|---|
| The L2 spec | **SOLID** | specs/MACRO_KERNEL_BOILERPLATE_L2_SPEC.md — 5,290L; generated from the preflighted 8-field input (8/8 PASS); post-gen audit: 3 defects found + surgically fixed + verified (the audit appendix at EOF) |
| EFFECT-RT bible | **SOLID** | specs/EFFECT_TS_RUNTIME_BIBLE.md — 514L; laws E1–E10; the kernel services map; 5K; P3-1..12 |
| The Phase-2 docs-wave spec | **SOLID (its §2 IS the W0 instruction)** | specs/JESL_EFFECT_PHASE2_DPL1_SPEC.md — 284L; D9–D15; PART 2E table; S1E–S8L; criteria 13–16 |
| The wave plan | **SOLID** | WAVE_PLAN.md — W0–W10, ~30 agents, the gates, the dependency spine |
| The JESL bible (external canon) | **BUILT v1.2 (W0 CLOSED)** | KNOWLEDGE_LIBRARY/Bibles/JSON_EVENT_SCRIPTING_BIBLE.md — 1,595L; sha `68afa78e`; PART 2E at :287 (2E.0–2E.12) + 9G :1556 + v1.2 row :1589; additive-only verified; audit .trident/wave-audit/w0.md |
| The library DPL1 | **BUILT v1.1-E (W0 CLOSED)** | specs/JESL_LIBRARY_DPL1_SPEC.md — 477L; sha `35abb828`; §2.9 :172 + §5.2 :357 + criteria 13–16 :392–395 + §8 Phase-2 chain :473; S1–S6/criteria 1–12/§7 intact |
| jesl/core (F1–F9) | **BUILT (W1 CLOSED — S1E gate GREEN)** | jesl/core/ 10 modules, 1,857L: schema 211 · graph 222 · channels 158 · bus 189 · caps 133 · errors 94 · executor 222 · journal 277 · registry 191 · evidence 160; tsc 0 · 104/104; tree digest `12ffbb3d`; audit .trident/wave-audit/w1.md |
| The node registry (F10–F13, F16) | **BUILT for the deterministic set (F10)** | jesl/registry.ts 191L (33 kinds append-only) + jesl/nodes/ 12 full + 21 stubs; F12–F13/F16 remain OPEN (W2/W4) |
| The 8-kind evidence machine (F11) | **BUILT (the G1 port)** | jesl/core/evidence.ts 160L — 8 kinds, RING_CAP 50, VERDICT_TTL_MS 5000, 18 tests |
| The drivers (F12, F14) | **F12+F14 BUILT (W2+W3)** — cli/ ×3 (the single runPromise edge) + drivers/{opencode-live,hook-bridge,session-live,cli-live}; the HostTransport seam; the ask-launcher roundtrip E2E (criterion 11) | tests/driver.test.ts 12/12 |
| The scanners (F15) | **BUILT (W3)** — scanners/ ×7: pba-banks (the Paragon wrap w/ provenance shas) + pba/pta (the pre-arm deny-unless-armed chain) + lsp (the honest unavailable state) + audit + trace; 23 tests | one bus, five scanners — the coexistence test proves it |
| The prompt node + jesl-run Workflow (F16–F17) | **BUILT (W4)** — nodes/prompt.ts (dual-mode Activity, bracket repair≤2, confidence→UNCLEAR) + workflow/{jesl-run,activities}.ts (Workflow.make JeslRun, DurableDeferred ask, the no-re-pay replay — criterion 15 PROVEN) | tests/prompt+workflow 20 units; 184/184 |
| The MPSE bridge (F18) | **OPEN — spec'd** | L2 §4.14 (the insertion's executor) |
| The lifecycle kernels (F19) | **OPEN — spec'd** | L2 §4.15 (six kernels) |
| The packager / profiles / bindings (F20–F22) | **OPEN — spec'd** | L2 §4.16–4.17 |
| The battery (F23–F25) | **OPEN — spec'd** | L2 §7 + the 11-row container plan at EOF |

## Section 2 — Proven Machinery Inventory (what NOT to re-open + why)
These substrates are CONTAINER-PROVEN — the locus WRAPS them, never rewrites (D12/P3-6):
- **Codename:PARAGON six layers** — 316/0/976 local; 11/11 container (paragon-p12-r4; buildSha 7b1afac5; dist 118.48KB sha 5e78ea68). The math (24-kind grammar, total evaluator, oracle integer-equality), the LASME core (step() order-load-bearing, I2 triad), the 6 machines, the sentinel (synapse I1–I7, fleet), the graph (11 tables, LOGIC-LSP D25).
- **Paragon_V1_Backend_Machinery (@paragon/substrate)** — 163/0/500 clean-tree in-container; zero deps; Law18 isolation verified. THE ISOMORPHISMS: bracket≡acquireRelease; Checked≡the E channel; ThresholdRegister≡Layer; ingestEvent≡EventBus; MathExpr IS the IR.
- **Paragon_Microstructures** — 12 ms-* modules, 143/0 floor + 500-run properties; zero cross-MS imports. The survivors per L2 §1.5.
- **The v4.4.2 wave-manager + paragon engine** — wave-dispatch 1906L etc.; battery 911/2 tsc 0. The subagent-dispatch + control-plane binding wraps it.
- **IntelligenceLexicon v1.0** — 435L; 3,000-assertion determinism. Seeds the lexicon data.
- **LASME_v1** — 1,884L; 23+ adversarial tests. The engine-template core (WITH the G1 gap: 6-of-8 event kinds).
- **Effect ecosystem (upstream)** — effect, @effect/platform, @effect/vitest, @effect/language-service, @effect/workflow, @effect/ai — REAL per EFFECT-RT's grounding map (the v4 workflow API surface = VERIFY-ON-INSTALL at S1E, DD24).

## Section 3 — Architecture As-It-Is (deviations from design noted)
- AS-DESIGNED: the four-layer Effect stack (α pipeline self-hosting / β rocket propulsion / γ build supervision / δ verification); the dataflow-readiness executor; caps-as-R; the three scanners on one bus; the journal's three roles.
- DEVIATION-CLASS to watch (none yet — no code): any Promise in core, any second journal, any T0 authorization, any renamed token = a Law violation, escalate to DECISION_CHAIN immediately.
- The pipeline insertion: v4.4.4 §2:106 + the macro-kernel-prototype stage between MPSE and code specs; the dry-run on TestLive is the stage's gate.

## Section 4 — Open Items (the live queue mirror)
[FILL: per milestone — mirrors TASK_QUEUE's Active rows with anchors]
- 2026-09-02 (W0 CLOSED): W0 gate 9/9 GREEN (the nine-questions probe, orchestrator-verified; audit .trident/wave-audit/w0.md). Spec-set manifest recomputed `396e4930`→`f77b448f` (the sanctioned W0 delta).
- 2026-09-02 (W1 LIVE→CLOSED): W1 dispatched via the wave manager (wave-1788363307259-3d85d0) — 5 trident_build agents on the greenfield jesl/ tree. ALL 5 RETURNED; the auditor's merged-tree gate: tsc 0 · vitest 104/104 · tokens byte-exact · diamond 2-batches · purity clean after 2 adversarial fixes (Date.now in caps.ts; the invented 9th token in gate.ts). Audit: .trident/wave-audit/w1.md. MERGE NOTES RESOLVED: the graph agent's fallback files were superseded by the owners' versions; the cross-file type patches (journal sigs, bus casts) are in the audit.
- NEXT: W2 (CLI + execution) is the next dispatch — F12 the jesl bin + F13 the 4 execution kinds, gate criteria 3,4,6,8 on the host.

## Anti-Patterns for This Doc
- NAPKIN: "specs done, code todo" → the agent re-probes everything. PADDING: restating the L2 verbatim → drift. DRIFT: a status row without an anchor/SHA → the cross-check is BUILD_STATE's SHA chain vs this table.

## Fill Guidance
- When: per milestone. How: OVERWRITE. Substance: every row carries a path or SHA; status transitions cite the closing gate's artifact.

## Section 5 — The Substrate Digest (per wrapped region — what each contributes)
| Region | Contributes to the locus | Its own proof |
|---|---|---|
| Codename:PARAGON | the IR (MathExpr+oracle), the LASME core, the 6 machines, the sentinel, the graph+LOGIC-LSP, preflight | 316/0/976 local; 11/11 container |
| Paragon_V1_Backend | the same six layers shipped + the isomorphism proof | 163/0/500 clean-tree |
| Paragon_Microstructures | the node kinds (9 survivors) + the constants | 143/0 + 500-run properties |
| IntelligenceLexicon | the lexicon data (3 machines) + the compact scorer form | 3,000-assertion determinism |
| LASME_v1 | the engine template + the decision-family nodes (with G1) | 23+ adversarial tests |
| v4.4.2 wave-manager | the subagent-dispatch + control-plane wrap | 911/2 tsc 0 |
| Effect ecosystem | the kernel primitives | upstream; VERIFY-ON-INSTALL at S1E |

## Section 6 — The Deviation-Watch Ledger (the template)
[FILL: per milestone — any deviation from the L2's design, with the anchor + the disposition]
| Deviation | Where | Disposition (accepted + D-entry / fixed / escalated) |
|---|---|---|
| (none — no code) | — | — |

## Section 7 — The Probe Commands (verify this doc's claims)
```
cd specs && wc -l *.md                          # the spec line counts
sha256sum <the NUL-join per EVIDENCE_STATE §1>   # the spec-set digest
ls jesl/ 2>/dev/null || echo "NO CODE TREE"      # the build state
grep -c "JESL " specs/JESL_LIBRARY_DPL1_SPEC.md   # the token surface
```

## Section 8 — The Milestone Transition Rule
When a wave closes: CURRENT_STATE §1 rows flip OPEN→BUILT (with the gate artifact); §2 gains nothing (the frozen list is append-only); §4 re-mirrors TASK_QUEUE; this §7's probes are re-run and pasted into EVIDENCE_STATE §2. A row never flips without its gate's artifact path.

## Section 9 — The Per-Module Detail Rows (the expansion surface for W1+)
[FILL: as modules land, one row per FILE (not per module): file | lines | the exported surface | the covering test | the status]
| File | Lines | Exports | Covering test | Status |
|---|---|---|---|---|
| (none — W1 creates) | | | | |

## Section 10 — The Data Contracts (the shapes every module agrees on — verbatim from L2 §3.0)
```ts
// The RunContext (serializable — the resume artifact)
interface RunContext {
  runId: string                  // wf-<ts>-<rand>
  doc: WorkflowDoc               // the validated document (frozen for the run)
  channels: Map<string, unknown> // the dataflow store (edge.via names)
  journal: JournalHandle         // append + covers() + serialize()
  bus: Bus                       // emit/on/detach
  caps: BoundCaps                // the driver's bound implementations
  budget: { startedAt: number; deadlineMs: number; maxNodesFiring: 15 }
  vars: Record<string, unknown>  // ctx.json + --in merged (seed channels)
}

// The Node Result (every invoke returns exactly this)
interface NodeResult {
  verdict: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'READY_FALSE'
  outputs?: Record<channelName, unknown>
  error?: JeslError
  evidence: { pattern: string; state: string; anchor: string }
  timing: { startMs: number; endMs: number }
}

// The Journal Row (one JSON line, sha256-chained)
{ "seq": 7, "ts": 0, "run": "wf-...", "node": "verify",
  "kind": "gate", "verdict": "PASS",
  "evidence": { "pattern": "...", "state": "...", "anchor": "file:line" },
  "source": "workflow/<name>/<node>", "prev": "<sha>", "self": "<sha>" }
```

## Section 11 — The Effect Stack (the deps + the layers — locked at W1)
| Package | Role | Wave |
|---|---|---|
| effect | the kernel (Effect, Context, Layer, Schema, Fiber, Schedule) | W1 |
| @effect/platform(-node\|bun) | FileSystem/Http/Command caps — VERIFY-ON-INSTALL | W2 |
| @effect/vitest | the it.effect test plane | W1 |
| @effect/language-service | the artifact-plane police (+ patch in prepare) | W6 |
| @effect/workflow | durable runs (Workflow.make, Activities) | W4 |
| @effect/ai | call-model (the llm cap) | W4 |
