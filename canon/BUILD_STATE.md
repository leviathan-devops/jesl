# BUILD STATE — Effect_Runtime_Kernels (MacroKernel_Edition-v1.0)

## Purpose
The build ledger: the checkpoint tree, the SHA chain, the verified results, the module inventory, the build command, the frozen list. Overwritten per milestone EXCEPT the SHA chain (append-only).

## Section 1 — Checkpoint Structure (the tree + counts)
[FILL: per milestone]
- 2026-09-03 (scaffold): the workspace = specs/ (4 files: EFFECT_TS_RUNTIME_BIBLE 514L · JESL_EFFECT_PHASE2_DPL1_SPEC 284L · JESL_LIBRARY_DPL1_SPEC 343L · MACRO_KERNEL_BOILERPLATE_L2_SPEC 5,290L) + WAVE_PLAN.md (~120L) + context_management/ (this 11-doc set). NO code tree yet — the first build checkpoint (W1) creates jesl/.
- 2026-09-02 (W0 CLOSE): the docs wave landed. specs/JESL_LIBRARY_DPL1_SPEC.md now 477L (v1.1-E); the external bible 1,595L (v1.2). Still NO code tree — W1 creates jesl/. W0 evidence: the orchestrator's independent grep battery (PART 2E :287 between PART 2 :118 and PART 3 :731 · 2E.×44 · 9G :1556 · tokens 8/8 · laws 1A–1I each ×1 · criteria 13–16 ×4 rows · S1–S6 originals 1/1/1) — the full audit at .trident/wave-audit/w0.md.

## Section 2 — SHA Chain (append-only — every checkpoint)
| Date | Artifact | SHA256 (head) | Delta |
|---|---|---|---|
| 2026-09-03 | The spec-set manifest (the 4 specs, NUL-joined) | `a4c8f19e…` (the full digest in EVIDENCE_STATE §1) | the baseline — SPEC-STAGE |
| 2026-09-02 | W0/A1 — the JESL bible v1.2 (1,119L → 1,595L, +476L) | `68afa78e` | PART 2E (2E.0–2E.12, 443L) inserted at :287 + 6 patches + 9G table :1556 + v1.2 row :1589; additive-only verified (laws 1A–1I byte-intact; catalog 5A–5G preserved + 5K×8 new); audit .trident/wave-audit/w0.md |
| 2026-09-02 | W0/A2 — the library DPL1 v1.1-E (343L → 477L, +134L) | `35abb828` | §2.9 :172 (D9–D15 + Effect contracts + TaggedError table + Driver Layers + Workflow.make) + §5.2 :357 (S1E–S8L) + criteria 13–16 :392–395 + §8 Phase-2 chain :473 + v1.1-E marker :5; S1–S6/criteria 1–12/§7/§8-directive intact |
| 2026-09-02 | The spec-set manifest RECOMPUTED post-W0 | `f77b448f` | supersedes `396e4930` — the sanctioned W0 delta; re-verified UNTOUCHED at the W1 audit (the W1 agents' zero-spec-drift proof) |
| 2026-09-02 | W1 — the jesl/ code tree (36 .ts files, 3,810L: core/ 10 modules + nodes/ 15 + tests/ 11) | tree digest `12ffbb3d` | S1E gate GREEN: tsc 0 · vitest 104/104 · the 8 tokens byte-exact · the diamond in 2 batches (3-node strict + 4-node w/ overlap); purity verified (0 node: imports, 0 Date.now/setTimeout/Math.random/runPromise in core after the auditor's 2 fixes); audit .trident/wave-audit/w1.md; effect 3.22.1 + @effect/platform 0.84.11 + platform-node 0.108.1 |
| 2026-09-02 | W2 — the CLI + the execution surface (46 .ts files, 5,028L total: + cli/ ×3 + drivers/cli-live + 4 real execution nodes + 8 fixtures + 25 tests) | tree digest `e07eaf5c` | S2E gate GREEN on the host, REAL path: mech-gate "verdict":"PASS" exit 0 · 4 refusals exact tokens exit 2 · needs-llm [JESL CAP-UNBOUND] no-artifact · replay verified:true · tsc 0 · vitest 129/129 · runPromise ×1 (cli/main only); the audit caught a fitted-to-golden passHandle mask + 3 real W1 defects (schema config strip, executor empty inbound, journal fallback self) — all root-cause-fixed by the auditor; audit .trident/wave-audit/w2.md |
| 2026-09-02 | W3 — the driver + the scanners (59 .ts files, ~6,400L total: + drivers/{opencode-live,hook-bridge,session-live} + scanners/ ×7 + 35 tests) | tree digest `c154678b` (post the replay loud-fail fix; tarball sha `235a08d2` deployed) | S3E gate GREEN incl. THE FIRST [CT] CHECKPOINT: 10/10 scenarios in the clean container (shark-effect-kernels-w3b) — the full battery 164/164 · the token/exit suite · the ask-launcher roundtrip E2E (criterion 11) · the scanners 23/23 · the adversarials (the corrupted journal → verified:false + exit 1 after the Law-7 replay fix; the empty doc refused; the usage errors token-clean); the Paragon wrap carries provenance shas; audit w3.md + .trident/container-test-results.json |
| 2026-09-02 | W4 — the generation + the durability (64 .ts files total: + nodes/prompt.ts + workflow/{jesl-run,activities} + 20 tests; deps +@effect/workflow 0.19.1 +@effect/ai 0.37.0) | tree digest `408f7500` | S4E gate GREEN: tsc 0 · vitest 184/184 · THE NO-RE-PAY proven (the second run: invoke counter 0, covers true, verdict FROM rows — criterion 15) · the bracket repair≤2 · confidence 0.55→UNCLEAR · the DurableDeferred ask (counter 1) · the corrupt loud-fail; the sweep fixed [JESL JOURNAL-CORRUPT] ×5 (the 9th-token class, the W3 pattern); audit w4.md |


| 2026-09-03 | W5 — the packager + the battery (71 .ts files: + packager/ ×4 + tests/battery* + fixtures-kill-resume + 27 tests) | tree digest `b7ab2cbc` (tarball aab37463 deployed) | S5E-S6E gate GREEN + THE SECOND [CT]: 211/211 · the battery 11/11 in-container (S6 emits the rocket via the real packager, exit 0) · criterion 9 re-validation · THE DETERMINISM DEFECT FIXED (canonicalSerialize excluded ts — chainsIdentical:true); audit w5.md |
| 2026-09-03 | W6 — the wraps (77 .ts files: + wraps/ ×4 + 22 tests; deps +@effect/language-service 0.87.2; the prepare patch) | tree digest `c80f56a9` (tarball dcabd97c deployed) | S7P+S8L gate GREEN + THE THIRD [CT]: 233/233 · the battery 11/11 in-container · the TEST_EVASION pre-arm deny (the Paragon provenance shas) · the REAL LspCap (the CLI probe ledger) · the EFFECT_ARTIFACT_GATE deny/allow; audit w6.md |## Section 3 — Verified Results (passTokens per scenario)
| 2026-09-03 | W7 — the MPSE bridge (87 .ts files: + mpse/ ×7 + 42 tests; the 24-kind MathExpr IR + the oracle registry + the D17 EXCLUDED_BORN_OFF calibrate) | tree digest `01dc9691` | S4E-P2 gate GREEN: tsc 0 · vitest 275/275 (25 files) · the demo fixture compiles + D17 EXCLUDED reproduced (pass:3 excluded:1 fail:0) · the ORACLE-MISSING quote-gate · the discharge matrix · the kernel protos + stubs; audit w7.md |
| 2026-09-03 | W8 — the 6 lifecycle kernels (99 .ts files: + kernels/ ×6 dirs × 4 files each + 39 tests; the full lifecycle chain idea→bible→spec→kernels→code→verify→ship) | tree digest `02aac5b0` | P3 gate GREEN: tsc 0 · vitest 314/314 (31 files) · all 6 kernels with per-kernel fixtures + the journal chain · D3 INSERTION proven via spec-to-kernels composing runDemo; audit w8.md |
| 2026-09-03 | W9 — profiles + bindings (107 .ts files: + profiles/ ×5 + bindings/ ×2 + 16 tests) | tree digest `c96aeb38` | P4 gate GREEN: tsc 0 · vitest 330/330 (33 files) · 3 profiles zero branches · the ParagonHostBinding contract + the OpenCode binding (all 11 Tags); audit w9.md |
| 2026-09-03 | W10 — the boilerplate extraction + the adoption dry-run (109 .ts files: + boilerplate/extraction.ts + tests/boilerplate.test.ts + 6 tests) | tree digest `681bf869` (tarball 30fa9ec4 deployed to shark-effect-kernels-w10) | THE FINAL [CT] GATE GREEN: tsc 0 · vitest 336/336 (34 files) · the battery 11/11 in-container · the adoption dry-run PROVEN (the extracted tree compiles + its core is byte-identical + its manifest validates) · the corrupted journal → verified:false · the usage errors token-clean · THE PRODUCT IS SHIPPABLE |
[FILL: per battery run — scenario | passToken | the tool-result context | verdict]
- 2026-09-03: the scaffold's structure gate — all 9 docs ≥200L, the 2 stubs with APPEND-ONLY, the section spot-check — see EVIDENCE_STATE §2.

## Section 4 — Module Inventory (file → lines → purpose → status)
[FILL: per milestone — mirrors CURRENT_STATE §1 with the line counts]
| File | Lines | Purpose | Status |
|---|---|---|---|
| specs/MACRO_KERNEL_BOILERPLATE_L2_SPEC.md | 5,290 | THE L2 authority | SOLID |
| specs/JESL_LIBRARY_DPL1_SPEC.md | 343 | the library DPL1 | SOLID (v1.1-E pending W0) |
| specs/EFFECT_TS_RUNTIME_BIBLE.md | 514 | the Effect canon | SOLID |
| specs/JESL_EFFECT_PHASE2_DPL1_SPEC.md | 284 | the docs-wave spec | SOLID (IS the W0 instruction) |
| WAVE_PLAN.md | ~120 | the W0–W10 dispatch plan | SOLID |
| jesl/** (the code tree) | 0 | the library | OPEN — W1 creates |

## Section 5 — Build Command + Env
[FILL: at W1]
- LOCKED AT W1: `cd jesl && bun install && bunx tsc --noEmit && npx vitest run`. THE TEST RUNNER IS `npx vitest run` — `bun test` DOES NOT WORK with @effect/vitest (`ctx?.onTestFinished is not a function`; bun:test ≠ vitest) — discovered at W1, recorded here as the canon gate command. Deps INSTALLED (effect 3.22.1 · @effect/platform 0.84.11 · @effect/platform-node 0.108.1 — peer warning: expects 0.97.1, benign, VERIFY-ON-INSTALL stands · @effect/vitest 0.24.1 · typescript 5.9.3 · vitest 3.2.7 · @types/bun 1.4.0). tsconfig: ES2022/ESNext/bundler/strict/noUncheckedIndexedAccess/skipLibCheck/noEmit, include core+nodes+tests. @effect/workflow + @effect/ai NOT installed (W4). No Rust; no grok code.

## Section 6 — Frozen-Machinery List (never modify — wrap only)
- Codename:PARAGON src (the six layers; container-proven 11/11; buildSha 7b1afac5).
- Paragon_V1_Backend_Machinery src (@paragon/substrate; 163/0/500).
- Paragon_Microstructures (12 ms-*; 143/0) — the survivors are WRAPPED; the de-dup edits (DD18 sig, DD19 escalation, DD20 ratio-import) happen in THIS project's node wrappers or via a sanctioned upstream patch wave — never silently.
- The v4.4.2 wave-manager/paragon engine (911/2) — the wrap targets.
- KNOWLEDGE_LIBRARY/Bibles/JSON_EVENT_SCRIPTING_BIBLE.md — W0 is ADDITIVE-ONLY.

## Anti-Patterns for This Doc
- NAPKIN: a SHA without its artifact. PADDING: inventory rows without purpose/status. DRIFT: a SHA chain entry whose artifact no longer matches → the cross-check is EVIDENCE_STATE §1's digest recomputation.

## Fill Guidance
- When: per milestone. How: OVERWRITE §1/§3/§4/§5/§6; APPEND §2 only. Substance: SHA + line counts from wc -l runs; results cite the artifact rows.

## Section 7 — The Checkpoint Protocol
A checkpoint is created at every wave close: the tree state (the file list + line counts) recorded here §1; the new digest appended §2; the gate's outputs into §3. The full Checkpoints/ directory snapshot happens ONLY at the container checkpoints (W3/W5/W6/W10) and at ship — `cp -r` the tree minus node_modules into Checkpoints/<wave>-<date>/.

## Section 8 — The Planned Checkpoint Series (the expected SHA-chain trajectory)
[FILL: as they land]
| Expected at | The artifact | Notes |
|---|---|---|
| W1 close | the first code digest (jesl/ tree) | supersedes the spec-set baseline as THE build SHA |
| W2 close | + the CLI dist | the first runnable |
| W3 close | Checkpoints/w3-driver/ | the first [CT] |
| W5 close | Checkpoints/w5-battery/ + container-test-results.json | 10/10 |
| W10 close | Checkpoints/SHIP/ + the final dist | 11/11 + the extraction |

## Section 9 — The Build Environment Detail (locked at W1)
- Runtime: bun; language: TypeScript ESM strict; the tsc gate: `bunx tsc --noEmit`.
- The dep set (K16): effect · @effect/platform(-node|bun — VERIFY-ON-INSTALL) · @effect/vitest · @effect/language-service (+ the prepare patch, W6) · @effect/workflow (W4+) · @effect/ai (W4+). zod ONLY at the OpenCode edge for one slice (D15).
- The test gate: `bun test` (it.effect); the isolation gate: verifyImportGraph on src/ (the Law18 pattern).
- NO Rust; NO grok code; the frozen list in §6 is read-only.

## Section 10 — The Frozen List Anchors (expand-on-demand)
[FILL: if a frozen surface must be touched, the D-entry + the sanctioned patch wave goes here first]
- All entries in §6 + the external JESL bible (additive-only per W0's gate).

## Section 11 — The Dependency Spine (the wave DAG)
```
W0 docs ──► W1 core ──► W2 cli ──► W3 driver+scanners [CT] ──► W4 gen ──► W5 pkg+battery [CT] ──► W6 wraps [CT]
                └───────────────────────────────────► W7 bridge ──► W8 kernels ──► W9 profiles ──► W10 ship [CT]
```
W7 depends on W1 (the core) + the Paragon canon — it MAY run parallel to W3-W6. W8 needs W7. W10 needs all.

## Section 12 — The Target Package Layout (the full tree — the F/DW inventory)
```
MacroKernel_Edition-v1.0/
  core/       FIXED   schema · graph · bus · channels · executor · journal · registry · caps · errors
  nodes/      FIXED   ~40 kinds (the 18 deterministic + 9 ms-* + 8 paragon + 4 execution + 3 generation)
  drivers/    FIXED   CliLive · OpenCodeLive · TestLive (+ sdk/watcher/cron)
  mpse/       FIXED   parser · rule-cards · oracle-compile · kernel-emit · stub-emit · calibrate
  kernels/    EDIT    the 6 lifecycle kernels (SKILL.md + workflow.json + ctx.json + activities.ts + fixtures/)
  profiles/   EDIT    trident · trading · sales (the DomainModule family sets — data)
  bindings/   EDIT    the host packs (the ParagonHostBinding contract)
  packager/   FIXED   tool.ts · chain.ts · skill.ts (the 3 emitters)
  tests/      FIXED   the battery + per-kernel fixtures + the 11-row container plan
  package.json + tsconfig.json
```

| 2026-09-03 | THE DOC-COMPLETION PASS (the post-build documentation) | the deliverables: JESL_KERNEL_ARCHITECTURE_BIBLE.md v1.1 (1,786L, 28 PARTS — filled from the 6-agent absorb wave wave-1788426315484-ff7ff9) · JESL_KERNEL_OPERATING_MANUAL.md v1.0 (504L, all 5 sections filled) · the boilerplate ADOPTION.md · w9.md REBUILT (50L→103L; §§1-5 reconstructed from canon, §§6-9 original) | THE D26 SWEEP: jesl/cli/args.ts:52 + boilerplate src/cli/cli/args.ts:52 "JSON Event Scripting Library" → "JSON Effect Scripting Language" (zero test assertions on the string, grep-verified pre-change); BUILD_REPORT canon line carries the D26 record; the 4 remaining "JSON Event" occurrences are historical quotes (DECISION_CHAIN D26 CONTEXT, CHANGELOG quote ledger, the rename notes) — CORRECT | CORRECTIONS FOLDED INTO THE DOCS: battery.ts 461L (not 448) · @ts-nocheck ×4 incl. battery.ts · 28 container rows (not 33 — aggregation) · WAVE_PLAN 57L (not ~120) |
