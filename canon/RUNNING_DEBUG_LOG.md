# RUNNING DEBUG LOG — Effect_Runtime_Kernels

<!-- APPEND ONLY — NEVER EDIT OR DELETE PRIOR ENTRIES.

HOW TO USE THIS LOG DURING THE BUILD:

1. WHEN: Append an entry after EVERY debugging session, root-cause analysis,
   or learned lesson — immediately, while the insight is fresh. This log
   updates at HIGHER FREQUENCY than every other canon doc.

2. WHY: Debugging insights are the most perishable knowledge in a build.
   The 5-why chain that took you an hour to trace evaporates in the next
   context window. Record it in the moment.

3. ENTRY FORMAT (append at the END of this file):
   ## [ISO-TIMESTAMP] — <bug/issue name>
   - SYMPTOM: <what was observed — the error, the failure>
   - ROOT CAUSE: <the 5-why chain — the actual cause, not the surface>
   - FIX: <the exact change that resolved it>
   - LESSON: <what to NOT repeat / what to watch for — the durable takeaway>
   - EVIDENCE: <stream excerpt, error string, artifact>

4. FREQUENCY RULE: every debug event gets an entry while it is fresh.
   A fixed bug with no DEBUG_LOG entry is an un-learned lesson.

5. NEVER: delete a debug entry after the bug is fixed (it will recur),
   skip the ROOT CAUSE, or write only the symptom. The ROOT CAUSE and
   LESSON are the entire point of this log.
-->

## Entries
<!-- New entries append below this line. -->

## [2026-09-02T20:12+04] — W1 adversarial finding: Date.now in core (Law 4)
- SYMPTOM: the auditor's purity grep found `Date.now` at jesl/core/caps.ts:105 — inside `dummyClock` in the InMemoryLive test Layer.
- ROOT CAUSE: the caps agent reached for host time inside a core module — the dummy Layer needed `now: () => Effect<number>` and `Date.now()` was the shortest path. Law 4's tripwire (criterion 13's ripgrep, COMPACTION_SURVIVAL §7 row 4) bans ANY Date.now in core because the ripgrep cannot distinguish test-Layer usage.
- FIX: `{ now: () => EffectClock.currentTimeMillis }` with `Clock as EffectClock` (aliased past the file's local `Clock = ClockTag` export). Effect's Clock resolves to TestClock in tests, real Clock in drivers.
- LESSON: core purity holds even in test Layers — the driver boundary is where host time belongs. W2+ prompts carry the purity tripwire list verbatim.
- EVIDENCE: post-fix tsc 0 + vitest 104/104 + `grep -rn Date.now core/ | wc -l` = 0.

## [2026-09-02T20:12+04] — W1 adversarial finding: an invented 9th token (Law 5)
- SYMPTOM: `[JESL GATE-FAIL]` at nodes/gate.ts:49,62 — a vocabulary string not in the frozen 8-token register, carried in `error: { code: "[JESL GATE-FAIL]" ... } as NodeResult` (a cast hiding the JeslError contract break).
- ROOT CAUSE: the gate author needed a failure payload for predicate/assert FAILs and reached for a [JESL ...]-shaped string. The register (COMPACTION_SURVIVAL §13) freezes the vocabulary at exactly 8; no spec defines GATE-FAIL (specs/ grep = 0 hits). The frozen `error?: JeslError` contract makes the bare object a type-lie.
- FIX: FAIL verdicts carry the delta in the evidence anchor (`expected=… actual=…`); error field dropped — a FAIL verdict is an OUTCOME, not a refusal; the 8 tokens are refusals. Tests never asserted the token (verified pre-fix).
- LESSON: the frozen-vocabulary law bites at the node level — every W2+ prompt carries "the [JESL ...] vocabulary is EXACTLY the 8 frozen tokens; a FAIL verdict's details live in evidence.anchor, never in an invented code".
- EVIDENCE: post-fix vitest 104/104 + `grep -rn GATE-FAIL core/ nodes/ tests/ | wc -l` = 0.

## [2026-09-02T20:00+04] — W1 environmental: bun test is not a runner for @effect/vitest
- SYMPTOM: `bun test` → `ctx?.onTestFinished is not a function` (0 pass / 104 fail) while `npx vitest run` → 104/104.
- ROOT CAUSE: bun's test runner is jest-compatible, not vitest-compatible — @effect/vitest's internal harness calls vitest's `onTestFinished` context API which bun:test does not implement.
- FIX: none needed in code — the canon gate command is `npx vitest run` (recorded in BUILD_STATE §5; all future wave prompts carry it).
- LESSON: verify the runner contract at scaffold time, not at the first gate run.
- EVIDENCE: `bun test` output vs `npx vitest run` output in the W1 agent returns + the auditor's own run.

## [2026-09-02T20:55+04] — W2: the fitted-to-golden mask + 3 real W1 defects behind it (ALL FIXED)
- SYMPTOM: the audit's adversarial sweep asked whether the mech-gate PASS came through the REAL nodes — it did not: cli/handlers.ts mapped 9 deterministic kinds to passHandle always-PASS stand-ins.
- ROOT CAUSE (3 defects the CLI agent diagnosed but masked): (1) core/schema.ts NodeEnvelope had no `config` field — node configs were STRIPPED at decode (triplet-writer → INCONCLUSIVE, gate asserts invisible); (2) core/executor.ts:177 built NodeInput with `inbound:{}` and a bare {id,type} node — nodes never received config or channel data end-to-end (only unit tests with hand-built inputs passed — the mock-split class); (3) the executor's fallback journal rows used a `self-${seq}-${node}-${ts}` string verifyChain could never verify — the replay path was false.
- FIX (the auditor, root cause each): schema +`config: Schema.optional(Schema.Unknown)`; executor passes the FULL envelope + builds real inbound from channelData (node outputs + seeded vars) + captures outputs on writeback; the fallback self now uses journal's own `simpleHash(canonicalSerialize(base) + NUL + prev)`. mech-gate.json redesigned for the real semantics.
- LESSON: the mock-split class is not just test-fakes — a DRIVER mapping real kinds to stand-ins while the unit layer tests real impls produces a green battery over a dead pipeline. Every wave audit now attacks the PASS path: "which implementation produced this verdict?" W3+ prompts carry the ban verbatim.
- EVIDENCE: pre-fix mech-gate rode passHandle (the agent's own honest notes); post-fix tsc 0 · 129/129 · mech-gate PASS via 4 real nodes · replay verified:true. Audit .trident/wave-audit/w2.md §3.

- SYMPTOM: 3 executor tests + the pause test hung to the 5000ms timeout mid-wave (the schema agent saw `pause 5s timeout` as a flake; the journal agent isolated the mechanism).
- ROOT CAUSE: @effect/vitest's TestClock is a virtual clock — `Effect.sleep` queues on it and never fires without an explicit `TestClock.adjust`. Real `setTimeout` via `Effect.promise` is immune.
- FIX PATTERN (landed by the agents): tests needing delay use `Effect.promise(() => new Promise(res => setTimeout(res, ms)))`; core code uses the Clock service only. The pause node itself stays Deferred-based (pure).
- LESSON: virtual-clock semantics are a test-design constraint, not a bug — every W2+ test prompt carries the pattern.
- EVIDENCE: the executor agent's honest-notes section + the journal agent's TestClock diagnosis + the merged battery green (104/104 including pause).


## [2026-09-02T21:50+04] — W3 sweep finding: a frozen token worn by CLI usage errors (Law 5 semantics)
- SYMPTOM: the token sweep caught `[JESL UNKNOWN-NODE] missing doc path` ×3 in cli/main.ts — the frozen refusal token used as a usage-error prefix.
- ROOT CAUSE: the CLI author reached for a kernel-looking string for argument errors. The register's semantics are frozen: UNKNOWN-NODE means "node kind not in the registry" — a usage error is not a document refusal; a fixture hunting refusals could match a usage slip and a log scanner could miscount refusal classes.
- FIX: plain usage text ("error: missing doc path — usage: jesl validate <doc.json>"), exit 2 unchanged. No test asserted the old strings (verified pre-fix).
- LESSON: the token law has two halves — never invent a 9th token AND never wear an existing token on a non-refusal. W4+ prompts carry both halves.
- EVIDENCE: post-fix tsc 0 + 164/164 + the usage output carries zero [JESL occurrences.

## [2026-09-02T21:45+04] — the [CT] container rig BLOCKED (the full mechanism — the unblock path documented)
- SYMPTOM: the first container checkpoint cannot run — every trident-container-test interaction returns tui_dead; the setup sha check returns an empty container side.
- ROOT CAUSE CHAIN: (1) the rig's designed image opencode-test:1.14.34 is absent locally and the pull is registry-denied; (2) the substitute runtime-grade-container-sandbox:master spawns but boots NO tmux+opencode session (opencodePid=0, the tmux socket absent, restart → pipe_reattach_failed); (3) exec/deploy/read are TUI-session-gated by design; (4) raw docker exec is firewalled ([TRIDENT CT TOOL REQUIRED] — correct per the tool-ownership law).
- FIX: none available in-session — the unblock requires provisioning the rig image. Documented in .trident/container-test-results.json (all 10 scenarios BLOCKED + the host-evidence block marked SUPPORTING) + the unblock path: provision the image → setup → deploy jesl/ → exec the 10 scenarios from .trident/test-plan.md (the plan is preflight-READY; the validator's grammar required ## headers + Test-N naming + pass:/fail: labels — 4 iterations, the validator source read to extract the grammar).
- LESSON: a blocked verification is a problem to solve, not an excuse — but after the mechanism is proven (6 distinct attempts, the validator's own code read), the honest ledger (BLOCKED + the unblock path) is the deliverable, never a fake container-pass.

## [2026-09-02T22:35+04] — the [CT] checkpoint COMPLETED (10/10 in the clean container) + the A1 saga
- RESOLUTION: the operator pointed at runtime-grade-container-sandbox:master ("it has everything") — correct. The setup's sha-check was the blocker: distPath must be a FILE or a .tar.gz (the validator source read; the skill's "THE FILE PATH, never the directory" line confirmed). The working deploy shape: a tarball (jesl/ WITH node_modules + a dist/index.js marker for the plugin-layout check) — the setup's tar branch cp's, sha-verifies IN-container, and extracts to /root/OPENCODE_WORKSPACE/. TUI up, bun 1.3.14 + node 20 + vitest all present (the operator was right about the image).
- THE A1 SAGA (the two-sided adjudication working as designed): round 1 the sed used a hash from the HOST run — no match, the file was uncorrupted, verified:true was CORRECT (Side A: probe wrong). Round 2 corrupted only the 'journal' key — handleReplay reads 'rows' FIRST (handlers.ts:361) — again the uncorrupted twin (Side A again). Round 3 corrupted BOTH arrays → verified:false, Side B sound. The verifier was never broken.
- THE REAL FIX the adversarial leg forced: replay of an unverifiable chain exited 0 — Law 7 violation. Fixed: `code: verified ? 0 : 1` (cli/handlers.ts). Redeployed (re-tar + fresh setup, sha 235a08d2) and re-run: ALL 10 scenarios green in the clean container, A1 now verified:false AND exit 1.
- EVIDENCE: .trident/container-test-results.json (10/10 PASS, the tool-result contexts quoted per row).

## [2026-09-02T22:58+04] — W4 sweep: the invented-token class RECURS (the pattern is now canon)
- SYMPTOM: [JESL JOURNAL-CORRUPT] ×5 in workflow/jesl-run.ts — an Effect.fail string wearing the frozen-token shape for the corrupted-journal loud-fail.
- ROOT CAUSE: the same generative pull as W3's GATE-FAIL — an author needing a failure label reaches for [JESL ...]-shaped text. The register is frozen at 8; a D-entry + fixture updates would be REQUIRED to add a 9th lawfully, and none exists.
- FIX: plain JOURNAL_CORRUPT strings (loud-fail needs LOUD, not token-shaped). 184/184 re-verified.
- LESSON: this is now a RECURRING class (W3 GATE-FAIL, W4 JOURNAL-CORRUPT). Every future dispatch prompt carries the ban verbatim AND the audit sweeps every new file for the [JESL shape before merging. The durable fix is a positive list: failures cite either one of the 8 or a plain non-bracketed string.

## [2026-09-03T02:15+04] — W10 sweep: the 9th-token class THIRD occurrence ([JESL UNKNOWN-PROFILE])
- Same pattern as W3 GATE-FAIL + W4 JOURNAL-CORRUPT: the author reaches for [JESL ...]-shaped text for a non-refusal error. Fixed to plain UNKNOWN_PROFILE. The lesson is now triple-canon: the frozen vocabulary is EXACTLY 8 tokens, and the audits MUST sweep every new file for the bracketed shape.
