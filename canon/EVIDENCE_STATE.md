# EVIDENCE STATE — JESL (MacroKernel_Edition-v1.0)

## Purpose
The evidence ledger: the SHA chain, the behavioral passTokens, the audit findings, proven-vs-claimed, the container-run provenance. APPEND per evidence; the summary block overwrites.

## Summary (overwrites per milestone)
- SPEC-STAGE. The evidence set = the spec-chain digests + the generation/audit evidence + the scaffold's structure gate. The first runtime evidence lands at W2 (the headless run) and the first container rows at W3.

## §1 — SHA Chain (the digests; recompute to verify)
[FILL: append per artifact]
- 2026-09-03 — THE SPEC-SET MANIFEST (the 4 specs, NUL-joined, in the listed order): recompute via
  `cd specs && cat MACRO_KERNEL_BOILERPLATE_L2_SPEC.md <(printf '\0') JESL_LIBRARY_DPL1_SPEC.md <(printf '\0') EFFECT_TS_RUNTIME_BIBLE.md <(printf '\0') JESL_EFFECT_PHASE2_DPL1_SPEC.md | sha256sum`
  The recorded head: `396e4930` (recomputed at the gate — the MNI lesson applied: the run is the truth) (the CANON_MANIFEST baseline). Any mismatch = a spec was edited outside a canon-doc-update — investigate before trusting the docs.
- 2026-09-02 — **POST-W0 RECOMPUTE: `f77b448f`** (the W0 DPL1 edit is the sanctioned delta; recorded in BUILD_STATE §2). This supersedes `396e4930` as the manifest head; the CANON_MANIFEST baseline updates to `f77b448f` at this canon-doc-update.
- 2026-09-02 — the W0 artifact digests (recompute per file): bible v1.2 = `68afa78e` (1,595L); DPL1 v1.1-E = `35abb828` (477L). The pre-edit bible sha per A1's own pre-edit run: `875fc485` (1,119L — corroborated by the scaffold records; not independently recomputable post-edit).
- 2026-09-03 — the individual spec digests at consolidation (recompute per file): L2 = the 5,290L artifact post-audit; DPL1 343L; EFFECT-RT 514L; Phase-2 284L; WAVE_PLAN ~120L; the external JESL bible 1,119L.

## §2 — Behavioral PassTokens (tool-result-bound, per scenario)
[FILL: append per battery run]
- 2026-09-03 — the scaffold's STRUCTURE GATE: all 9 standard docs ≥200 lines (the wc -l runs in the gate script); the 2 logs carry APPEND-ONLY; the section spot-check passes — the gate output recorded in this doc's generation session (the script per canon-doc-setup STEP 5).
- 2026-09-02 — **W0 GATE (the nine-questions probe) 9/9** — orchestrator-run greps on the landed artifacts: bible `PART 2E` heading :287 between PART 2 :118 and PART 3 :731; `2E\.` ×44 (≥13); `9G — THE JESL` :1556; `Effect.forEach` ×13 (≥2); the 8 frozen tokens 5/4/7/8/14/1/1/1 (all ≥1, none renamed); laws 1A–1I each ×1; DPL1 `## 2.9` :172 + `## §5.2` :357 + criteria rows 13–16 ×4 + `v1.1-E` ×2 + `idempotencyKey` ×1 + S1–S6 originals 1/1/1. Artifact: .trident/wave-audit/w0.md.

## §3 — Audit Findings (TRUE stats, never prose)
- 2026-09-03 — THE L2 POST-GENERATION AUDIT (the artifact: the L2's EOF appendix): findings = 3 (the placeholder container plan with `THE-MANDATE--operator--2026-09` ×~20 occurrences; the §3/§4 duplicate title; the §6/§8 duplicate title); fixes = 3 surgical edits (the real 11-row battery; the EXTENDED retitle + disambiguation; the SURFACES retitle); verification = placeholder grep 0 · dup-title grep 0 · real-token grep 29 hits · 5,290L final. The one "wave-tracker" drift-marker hit = a false positive (the legitimate subagent-dispatch wrap description, L2 §8).

## §4 — Proven vs Claimed
| Item | Status |
|---|---|
| The L2's 199 assertions / 164 code blocks | CLAIMED (generated) — the assertions become PROVEN at their waves' gates |
| The Paragon substrates (the wrap targets) | **PROVEN** (their own container artifacts: Codename 11/11 buildSha 7b1afac5; V1 163/0/500; ms-* 143/0; LASME_v1 23+ tests) |
| The Effect ecosystem APIs | PROVEN upstream; OUR integration = SPEC-GATED until S1E's VERIFY-ON-INSTALL + the W4 gate |
| The 11-row battery | SPEC — the definition of done; PROVEN only at .trident/container-test-results.json |

## §5 — Container-Run Provenance
[FILL: append per checkpoint — container | stream | byte offsets | the artifact]
- (none yet — the first checkpoint is W3.)

## §6 — The Honest Ledger
- The v4.4.4 project = SPEC-STAGE (no src observed); the γ-layer targets its spec (G7).
- The MNI-3 lesson is standing: tokens-not-counts in every future passToken (G15).

## Anti-Patterns for This Doc
- NAPKIN: SHAs without recomputation commands. PADDING: prose "verified" rows. DRIFT: a proven row without its artifact path → the cross-check: recompute §1; open every §2/§5 artifact.

## Fill Guidance
- When: per evidence event. How: APPEND §1/§2/§3/§5; overwrite the Summary + §4. Substance: every row = a command + its expected output + the artifact path.

## §7 — The Per-Artifact Digest Table (recompute any row to verify)
[FILL: per artifact]
| Artifact | Lines | The digest command |
|---|---|---|
| specs/MACRO_KERNEL_BOILERPLATE_L2_SPEC.md | 5,290 | sha256sum specs/MACRO_KERNEL_BOILERPLATE_L2_SPEC.md |
| specs/JESL_LIBRARY_DPL1_SPEC.md | 477 | sha256sum specs/JESL_LIBRARY_DPL1_SPEC.md |
| specs/EFFECT_TS_RUNTIME_BIBLE.md | 514 | sha256sum specs/EFFECT_TS_RUNTIME_BIBLE.md |
| specs/JESL_EFFECT_PHASE2_DPL1_SPEC.md | 284 | sha256sum specs/JESL_EFFECT_PHASE2_DPL1_SPEC.md |
| WAVE_PLAN.md | ~120 | sha256sum WAVE_PLAN.md |
| The external JESL bible | 1,595 | sha256sum KNOWLEDGE_LIBRARY/Bibles/JSON_EVENT_SCRIPTING_BIBLE.md |
| jesl/ (the code tree, W1) | 3,810 (36 files) | `cd jesl && find core nodes tests -name "*.ts" | sort | xargs sha256sum | sha256sum` → head `12ffbb3d` |
NOTE: the spec-set manifest head recorded as `a4c8f19e` at scaffold time was superseded by `396e4930` (gate recompute), then by `f77b448f` (the sanctioned W0 delta) — the RECOMPUTED value is always the truth. The W1 audit re-verified `f77b448f` UNTOUCHED (zero spec drift through the first code wave).

## §8 — The Battery-Row Template (the format every future container row uses)
```
{ "scenario": "<S#>", "passToken": "<the frozen string>", "passTokenMatch": true,
  "failToken": "<the banned string>", "failTokenAbsent": true,
  "toolResultContext": "<the stdout/stderr excerpt>", "verdict": "PASS",
  "container": "<name>", "artifact": ".trident/container-test-results.json" }
```

## §9 — The Evidence-Event Protocol
An evidence event = anything that changes what is PROVEN: a gate run, a container row, an audit, a digest recompute. Each appends to its §; the Summary + §4 overwrite. An evidence row without its command+artifact is a CLAIM — delete it or complete it.

## §10 — The Full 11-Row Battery (the definition of done — from the L2's EOF)
| # | Scenario | Pass token | Fail token |
|---|---|---|---|
| S1 | jesl run mech-gate | `"verdict":"PASS"` + exit 0 | any traceback |
| S2 | jesl validate × 4 bad fixtures | each matching `[JESL ...]` in stderr | exit 0 on any |
| S3 | needs-llm under keyless CLI | `[JESL CAP-UNBOUND] llm` + NO artifact | any fabricated artifact |
| S4 | replay determinism + kill -9 | sha chain diff EMPTY + resume | hash mismatch |
| S5 | parallel-5 (branch 3 fails) | `overlapCount ≥ 1` + all 5 rows | sequential or missing |
| S6 | skill rocket via bash | exit 0 + artifact on disk | missing or non-zero |
| S7 | tier/unbracketed/ask-launcher | both tokens + the roundtrip journal row | clean validate |
| S8 | kernel hygiene ripgrep + LSP | zero banned hits + diagnostics exit 0 | any hit |
| S9 | activity replay × 2 | invoke count 0 + identical chain | re-exec |
| A1 | the malformed battery | each named token, never a hang | accepted-invalid-input |
| A2 | the pre-arm chain | `pba.family.hit` then `pta.intercept`, bash never ran | bash executed |
PASS: 11/11, tool-result-bound, recorded in .trident/container-test-results.json.
