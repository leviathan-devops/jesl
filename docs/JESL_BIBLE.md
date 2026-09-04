# THE JESL BIBLE — MASTER CANON v3.0 (JSON Effect Scripting Language)

**TRIGGER:** any work on the JESL kernel, its cards, its boilerplate, its rockets, or its embedding into agent machinery.
**DUTY:** the ONE canon reference — architecture, kernel engineering, cards, skill rockets, audit machinery, embedded agents, procedures, laws, lessons. Supersedes all six predecessor JESL docs (archived in `archive/`).
**PROTOCOL:** Read fully. Then operate. A fresh agent with zero context operates from this file alone.

> Operator mandate, verbatim: "DO NOT wire any llms inside this. THE POINT IS FULLY FUNCTIONAL BOILERPLATE MACHINERY I CAN PLUG INTO ANYTHING AND START FILLING WITH DATA AND ADAPTING." — "WITHOUT OVERENGINEERING OR COMPLICATING OR SLOPPING THIS."

**The three sentences of discipline:** JESL is a JSON Effect Scripting Language — a card is a JSON workflow document, the kernel is its only runtime, the journal is its only proof. The registry is the single source of truth for what a node kind IS; nothing forks it, ever. Everything fails loud with one of eight frozen tokens; nothing substitutes, nothing masks, nothing pretends.

---

## THE PART INDEX (file order — navigation)

| Part | Title | For |
|---|---|---|
| PART 0 | How to read this bible (reading order by role) | everyone, first |
| PART 1 | State of the system (measured) + the cast path + provenance | everyone |
| PART 2 | Critical rules 2A-2O (the laws) | everyone, always |
| PART 2B | Kernel engineering deep-dive (module by module) | kernel engineers |
| PART 2C | The Effect Engineering physics (why it is shaped this way) | designers |
| PART 2D + 2D-EXT | The language laws + runtime semantics + the grammar deep | authors + engineers |
| PART 2E | The card system theory (rolodex, compiler machine, lexicons) | authors |
| PART 2F-EXT | Execution internals (the run lifecycle, journal format, batching) | engineers |
| PART 2G + 2G-EXT | The evidence + scanner machinery (rules tables) | auditors |
| PART 2H | The reactive machinery deep (events, bus, the closed loop) | integrators |
| PART 2I | The state-machine canon (LASME/TEB) + the profiles guide | designers |
| PART 2J | The journal + batching spec appendix | engineers |
| PART 2M/2N | The embedded-agent + audit-machinery laws (Aether/MPSE) | integrators |
| PART 2O | The skill-rocket chain law | rocket operators |
| PART 3 | Correct/Wrong pairs (12, from real incidents) | everyone |
| PART 4 + 4B/4C/4D/4E | Procedures + testing anatomy + driver matrix + authoring guide + operator loop | operators |
| PART 5 | The troubleshooting matrix (30 rows) | when it breaks |
| PART 6 (+6A.1, 6B-EXT, 6E.1, 6F-EXT, 6F-EXT-2/3, 6G.1-4, 6H.1, 6L-EXT, 6M, 6N, 6P, 6Q, 6R, 6S, 6T, 6U) | Quick reference: taxonomy, tokens, contracts, cards, rockets, Aether, MPSE, receipts, TDM, FAQ, slot-swaps, migration, failure taxonomy, mini-examples, stage listing, self-audit | lookup |
| PART 7 | Version history | the record |
| PART 8 | Adoption guide (day one, the week, the habits) | adopters |
| PART 9 | Glossary | lookup |
| PART 10 + 10B/10C/10D | The build history + extending JESL + the ADRs + working examples | historians + extenders |

---

<!-- ═══════════════ PART 1: STATE OF THE SYSTEM ═══════════════ -->

## PART 0 — HOW TO READ THIS BIBLE (the reading order, by role)

**The adopter (cast cards, author cards):** Part 1 (state) → Part 2G (card contract law) → Part 3 pairs P2-1/P2-2 → Part 4 P3-1/P3-2 → Part 6E (the cards) + 6A.1 (config contracts) → Part 8 (adoption). Time: one session.

**The kernel engineer (touch core/ or nodes/):** Part 2 ALL (the laws are load-bearing) → Part 2B (module deep-dive) → Part 2D-EXT (the grammar canon) → Part 3 (every pair) → Part 5 (the matrix — every row is a law's failure mode) → Part 10 (the history — every lesson was paid for).

**The rocket operator (run the kernels):** Part 2O + 6F + 6F-EXT-3 → Part 4 P3-10 → the TDM map (6M) → the verify/ship semantics (2D.3 durability).

**The integrator (embed JESL in a host):** Part 2E/2M (the Aether laws) → Part 6G entire (Shadow + runner + Hydra) → Part 4 P3-9/P3-11 → the backend interfaces (6G-EXT).

**The auditor (verify claims):** Part 6L-EXT (the receipts) → Part 4 P3-6 (the gate commands) → the wave audits + CT results on disk. Trust the receipts, re-run the commands.

**Everyone, always:** Part 2 is the law. A procedure that violates a law is wrong even if it works; a law that cannot be executed is a lie — report it.

---

<!-- ═══════════════ PART 6Q: THE KIND-MIGRATION TABLE (v1.2 grammar → the shipped 37) ═══════════════ -->


## PART 1 — STATE OF THE SYSTEM (measured, not remembered)

### 1.1 — The measured state (2026-09-04, post-overhaul, post-rename)

| Measure | Value | Verified by |
|---|---|---|
| Workspace root | `/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Active_Projects/JESL` | rename 2026-09-04; zero old-name refs in any live tree |
| Kernel tree | `JESL/jesl/` — ~120 .ts across core/nodes/cli/drivers/scanners/workflow/packager/kernels/mpse/wraps/profiles/bindings/boilerplate + algorithms/ + fixtures/ + tests/ | tree |
| Node kinds | **37 registered, 37 functional** — zero placeholder verdicts | `core/registry.ts:34-72` ALL_KINDS; TODO-anchor probe → 0 (W4 gate S-1 intent) |
| Test battery | **424/424, 39 files**, `npx vitest run`, ~15s | W4 gate S-3 raw output |
| Type-check | exit 0, **all files checked**, zero `@ts-nocheck` (13 un-suppressed in W3) | W4 gate S-2/S-15 |
| tsconfig | 20 lines, `include: ["**/*.ts"]`, exclude = the 3 original fixtures | `wc -l` = 20 |
| Cards | 10 in `algorithms/` — all cast `"verdict":"PASS"` exit 0 via the registry CLI; `.stub` patterns = 0 | W4 gate S-10 |
| Lexicon | 37 kinds / 19 cards; idempotent; graceful on missing dirs | `bun run lexicon.ts` |
| Profiles | `default` (Shell/Fs/Http · all 37 kinds · tier 1) + trident/trading/sales; import-time `validateDomainModule` throw-guard | `profiles/default.ts:10-12` |
| Spec manifest | `f77b448fff1ea3f38524949c09c3b0d89657e5cc90131f990b32d574f8a8ff1c` — stable W0→W4 | recomputed every gate |
| Container checkpoints | 5 GREEN (W3/W5/W6/W10 + CT5) | `.trident/container-test-results.json` |
| Git | `github.com/leviathan-devops/jesl` public, main @ `a217cb6` | pushed |
| Boilerplate | `KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/JESL-Kernel-Edition-v1.0/` — FLAT, 182 files, digest `4088dee9…`, in-tree tsc 0 + 424/424 | extraction + verify |
| Kernel tree digest | `54242037bb5e5ec9…83954c8` (W4 before==after) | zero-mod proof |

### 1.2 — The cast path (what casting a card IS)

```
card.json ──► cli/main.ts ──► cli/handlers.ts runDoc
  ├─ decodeDoc         core/schema.ts:42 WorkflowDoc (Effect Schema)
  ├─ validateDoc + isKnownKindSync
  ├─ checkUnbracketed  tier-2 generation ⇒ bracket.contract required
  ├─ buildNodeHandles  registry.getRegisteredImplSync(kind) ← THE ONE LOOKUP
  ├─ core/executor.ts  dependency order (graph.ts) → batches →
  │                    Effect fibers, concurrency 15
  ├─ per node          NodeResult{verdict, evidence{pattern,state,anchor},
  │                              timing, outputs}
  ├─ core/journal.ts   INVOKE + VERDICT rows, sha256 chain
  └─ verdict + exit    PASS/0 · FAIL/1 · refusals/2 (8 frozen tokens)
```

Refusals exit 2 with structured `{node, field, actual, remedy}` — never a bare string, never a guess.

### 1.3 — Provenance

Built W0→W10 (original kernel: 10 audited waves, 336 tests, 4 container checkpoints), then the Full-Function Overhaul W1→W4: **W1** = the 20 stub nodes implemented (5 agents, +88 it.effect); **W2** = cards + lexicon + default profile + **the CLI mock-split killed**; **W3** = 13 files type-fixed + tsconfig wildcard + flat boilerplate regeneration; **W4** = the 15-criterion final gate (2 literal-vs-intent splits adjudicated in w4.md). Audits: `.trident/wave-audit/w0-w4.md`. Naming canon: **JESL = JSON Effect Scripting Language**; the discipline is **Effect Engineering** (cards may still be called spells).

---

<!-- ═══════════════ PART 2: CRITICAL RULES — THE LAWS ═══════════════ -->


## PART 2 — CRITICAL RULES

### 2A — THE EFFECT-ONLY RUNTIME LAW

1. ALWAYS run the system on Effect-TS and nothing else. `Effect.runPromise` appears at exactly ONE product edge — `cli/main.ts:26`. Everything inside `core/`, `nodes/`, `scanners/` RETURNS Effects; nothing inside runs them. Consequence: the kernel embeds anywhere Effect embeds, and time/determinism enter through the injected `ClockTag`, never wall-clock calls.
2. ALWAYS model the outside world as capability Tags (`core/caps.ts`): `Shell`, `Fs`, `Http`, `Journal`, `HashCap`, `ClockTag`, `EmitCap`, `ToolClient`, `Subagent`, `Llm`. A node declares `requiredCaps`; the executor pre-checks them against the driver's bound set (`boundCapsFor`) BEFORE any invoke and refuses `[JESL CAP-UNBOUND]` otherwise. A card can never half-run: it has its capabilities or it fails loud.
3. NEVER provide real implementations outside the drivers. `drivers/cli-live.ts:110` is the reference: `CliLive = Layer.mergeAll(ShellLiveReal, FsLiveReal, HttpLiveReal, JournalLive, HashCapLiveReal)`. A new host binds what IT offers (see `drivers/opencode-live.ts`, `hook-bridge.ts`, `session-live.ts` for the agent-host variants).
4. MUST keep `@effect/ai` unimported. The package is pinned in package.json as a version anchor ONLY; the `Llm` Tag is an interface the OPERATOR binds (law 2I). `grep -rn "@effect/ai" core/ nodes/ cli/ drivers/` → 0 imports is the standing proof.
5. MUST type the R channel honestly in test code: `it.effect` callbacks expect `Effect<void, unknown, TestServices>`. The house patterns for variance pain: the `it: any` alias (`import { it as itOrig } from "vitest/icon"; const it: any = itOrig` — the standard in 6+ green test files) and inner-position casts `Effect.provide(x as any)` (byte-identical emit; Wave 3 proved scratch errors 8→4→0 with this exact move). NEVER restructure runtime behavior to satisfy the checker.

### 2B — THE REGISTRY SINGLE-SOURCE LAW (D27)

1. ALWAYS resolve kind→impl through the registry: `getRegisteredImplSync(kind)` over `globalRegistryStore` (`core/registry.ts`; the Effect-service variants are `makeRegistry` + `NodeRegistry.get`). The CLI (`cli/handlers.ts buildNodeHandles`), test drivers, and any future driver consume THIS one accessor. There is NO handler-side kind map. There is NO PASS-stub fallback.
2. NEVER substitute for an unimplemented kind. The miss path is a LOUD throw: `[JESL UNKNOWN-NODE]` + `{node, field:"type", actual, remedy}`. History: the Wave-2 audit found the original build's `buildNodeHandles` carried a hardcoded 15-kind map whose else-branch emitted `{pattern:"${n.type}.stub", state:"PASS"}` — 22 of 37 kinds ran fake PASSes in production while the 424-test battery stayed green (the **mock-split**). The fix was structural: accessor + full wiring + the loud throw + DELETION of the stub branch (no backward-compat preservation).
3. MUST wire new kinds in `nodes/index.ts` — THE wiring authority. Two legal patterns: (a) module-bottom self-registration `replaceStubSync("kind", nodeImpl)` inside the node file, firing on import (the 11 mpse/evidence/paragon nodes + shell/python/http/file/prompt do this); (b) the index's explicit `replaceStubSync` loop (the 12 original full nodes + 5 pattern + 4 infra). `replaceStubSync` is append-only: it refuses a second real impl, refuses family mismatches, refuses unknown kinds (`RegistryFrozenError`).
4. ALWAYS keep `ALL_KINDS` (`core/registry.ts:34-72`) the contract mirror: 18 deterministic, 12 decision, 2 evidence, 4 execution, 1 generation. `validateDoc`'s known-kind set and the registry must never drift — when they do, the loud throw is the tripwire (this is deliberate defense-in-depth: the validator rejects first; the registry throw catches validator drift).
5. NEVER call behavior proven by units alone "proven". The mock-split passed 424/424 while production lied. The proof trio for any runtime claim: unit battery + a card cast through the real CLI + a container observation. (Part 5 row 1 is the standing counterexample.)

### 2C — THE JOURNAL-IS-THE-RUN LAW

1. ALWAYS treat the journal as the run's identity. `core/journal.ts` appends an INVOKE row and a VERDICT row per node execution. Rows carry `{run, ts, kind, payload, prev, self}` with `self = sha256(prev + canonical(payload))` — `ts` excluded from the hash, the payload canonicalized. Silent tampering is structurally impossible: `verifyChain(rows)` recomputes every link and returns `verified:false` on ANY mutation (battery t5 proves the corrupt case: `verified:false` + exit 1).
2. MUST replay from rows, never from memory. `replay-source` (`nodes/replay-source.ts`) takes `config.runId` (or inbound `runId`), pulls rows via `ctx.journal.rows(runId)` (falling back to the `Journal` Effect service, then `allRows()` filtered by run), and rebuilds via `rebuildSummaryFromRows` (`workflow/jesl-run.ts`). Empty rows → `INCONCLUSIVE / EMPTY` — the DESIGNED honest verdict for "nothing to replay", not a stub (see Part 5 row 2 for the distinction).
3. NEVER write journal rows outside the executor's hooks and `journal-sink`. Append-only + single-writer is where the authority lives. Timestamps enter via the injected `ClockTag` — `Date.now` is banned in `core/` (S-6) precisely so replay is deterministic and hashes are stable.
4. ALWAYS verify before trusting past runs: any flow quoting history (the `verify` kernel, replay chains, audit evidence) runs `verifyChain` FIRST. A broken chain is a loud exit-1 failure — never "proceed with warnings".

### 2D — THE FROZEN TOKENS LAW (D15)

1. ALWAYS refuse with one of EXACTLY 8 tokens (`core/errors.ts:85-94 JESL_TOKENS`): `[JESL UNKNOWN-NODE]` `[JESL CYCLE]` `[JESL TIER-VIOLATION]` `[JESL UNBRACKETED-GENERATION]` `[JESL CAP-UNBOUND]` `[JESL ORACLE-MISSING]` `[JESL CHANNEL-UNSET]` `[JESL NO-SEED]`. String-frozen (D15): never invent a 9th, never repurpose one for a new condition, never emit a near-miss variant.
2. NEVER emit a bare token. Every refusal carries structured context `{code, node, field, actual, remedy}` (see `formatJeslError` + the err-throwers in cli/handlers.ts) and exits 2. The structured form is a work order; the bare string is noise.
3. MUST sweep for invented tokens at every gate: `grep -rhoE '\[JESL [A-Z-]+\]' core/ nodes/ cli/ drivers/ scanners/ workflow/ packager/ wraps/ mpse/ kernels/ profiles/ bindings/ boilerplate/ | sort -u` → EXACTLY 8 (W4 S-4). History: W3's GATE-FAIL, W4's JOURNAL-CORRUPT, W10's UNKNOWN-PROFILE were invented tokens the sweep killed — the recurring sweep is why the class stays dead.
4. ALWAYS know the producer map: CYCLE ← graph compilation (core/graph.ts); TIER-VIOLATION ← tier-1 doc containing a generation kind; UNBRACKETED-GENERATION ← tier-2 generation node without `bracket.contract` (checkUnbracketed — runs BEFORE handle-building, so `bad-unbracketed.json` keeps its token); CAP-UNBOUND ← executor cap pre-check vs `boundCapsFor(driver)`; CHANNEL-UNSET ← gate assert reading a channel no edge wrote; NO-SEED ← headless start with no inbound; ORACLE-MISSING ← oracle rule absent; UNKNOWN-NODE ← registry miss (the Wave-2 loud throw).

### 2E — THE PURITY LAW

1. NEVER import `node:fs`, `node:path`, `node:child_process` — or ANY `node:` module — inside `core/` or `nodes/` (gate S-5 → 0; `Date.now` likewise, S-6 → 0). The world enters ONLY through capability Tags. Recorded exception-by-position: `mpse/demo.ts` (a demo utility importing node:fs/path; not in the execution path; flagged in w4.md).
2. ALWAYS put real implementations in the drivers. `drivers/cli-live.ts:110` binds Shell/Fs/Http/Journal/HashCap. A new host binds what IT offers — a card cast under a driver gets exactly that driver's capabilities, and `[JESL CAP-UNBOUND]` is the honest answer when a node needs more.
3. MUST keep tests on the host side of the boundary: tests may import node: (they ARE host code) and inject fake caps via Layers — never monkey-patch globals. Determinism comes from `ClockTag` injection + pure node logic, not module mocks.
4. ALWAYS remember the cap pre-check runs BEFORE invoke (`core/executor.ts` ~:162): `capsRequirements[node] ⊆ boundCapsFor(driver)` or the node refuses whole. This is why `prompt` in llm mode cannot START under the CLI driver — and why a stub pretending otherwise is precisely the lie D15 exists to prevent.

### 2F — THE TEST-RUNNER LAW

1. ALWAYS run tests with `npx vitest run` from `JESL/jesl/`. NEVER `bun test` — @effect/vitest calls `ctx?.onTestFinished`, which bun:test does not implement (`ctx?.onTestFinished is not a function`). The failure is in the runner boundary, not the tests; switching runners is not on the table.
2. MUST type-check separately and first: `bunx tsc --noEmit` → 0. The battery proves behavior; tsc proves the contract. Wave 3 removed all 13 `@ts-nocheck` lines — the tree's type-check is honest now; ANY new `@ts-nocheck` is a regression (S-15 → 0).
3. ALWAYS freeze test semantics when fixing types. The Wave-3 hang: converting timing-dependent handlers (`Effect.gen` + `Ref.update(counter,…)` + `Clock.currentTimeMillis`) into instant `Effect.succeed(...)` starved the t4 kill-resume test — an instantly-completing node gives the kill nothing to kill, so vitest hangs forever with a frozen stream. Type fixes touch annotations, imports, and boundary casts — NEVER handler bodies. One boundary `as any` on an invoke return is legal; a semantic change never is.
4. MUST close test-file surgery with the trio: `grep -rl '@ts-nocheck' --include='*.ts' . | wc -l` → 0 · `bunx tsc --noEmit` → 0 · `npx vitest run` → green at the honest count. All three or unfinished.

### 2G — THE CARD CONTRACT LAW

1. ALWAYS author cards in the `fixtures/mech-gate.json` envelope: `{$schema:"trident-workflow-v1", meta:{name,tier,slots?}, nodes:[{id,type,config?,…}], edges:[{from,to,via}], vars:{}}`. The Effect Schema decode IGNORES excess keys — that tolerance is what carries the `meta.slots` WORK-SLOT annotation; verify any new annotation by casting, never by assuming.
2. ALWAYS name edge channels key-matched: the executor delivers `inbound[via] = upstreamOutputs[via]`. A gate assert `$.result` reads the channel named `result` — which exists only if the upstream edge's `via` is `result` AND the upstream node's outputs carry a `result` key (math-eval outputs `{result, value}`). Mismatch ⇒ `[JESL CHANNEL-UNSET]` naming the field and the remedy. Duplicate `via` names collapse batches — every edge gets a unique via.
3. MUST tier-gate honestly: tier 1 documents contain NO generation kinds. Tier 2 generation nodes (`prompt`) carry `bracket:{contract,…}` AND require the Llm cap. Tier 1 + generation ⇒ `[JESL TIER-VIOLATION]`; tier 2 unbracketed ⇒ `[JESL UNBRACKETED-GENERATION]`; tier 2 + Llm-unbound driver ⇒ `[JESL CAP-UNBOUND]`. Three different refusals — know which one you are looking at.
4. ALWAYS ship templates castable AS SHIPPED: every card in `algorithms/` casts PASS exit 0 under the CLI driver with zero manual steps. Where a real capability is out of scope (Llm, oracle:read, a real journal runId), the shipped chain uses a deterministic stand-in and the `meta.slots` annotation documents the exact swap-in (kind, config, required caps). A template that cannot cast is a broken template (Part 5 row 3).
5. MUST read the node's config contract before configuring it: every kind's config shape lives in `nodes/<kind>.ts`. Configs are data — a wrong field fails at cast with a structured error, but reading first is cheaper than cast-fail loops. The 10 reference cards in `algorithms/` are working examples of the 15 most-used configs.

### 2H — THE LOUD-FAIL LAW

1. ALWAYS fail loud: every error path returns a structured `NodeResult` (verdict FAIL + evidence + outputs.reason) or a thrown token-carrying error with remedy — NEVER an empty catch, NEVER a console-only handler, NEVER a silent `undefined`. The audit class this kills: functions returning success without the preceding side effect.
2. NEVER conflate the three honest states: `PASS` (the work ran and the assertions held), `FAIL` (the work ran and something asserted false — WITH the reason in outputs), `INCONCLUSIVE` (the work could not resolve — e.g. replay with zero rows). INCONCLUSIVE from a REAL path is a legitimate verdict; INCONCLUSIVE from a stub was the disease Wave 1 killed. The distinction lives in the evidence: real nodes emit real `pattern/state/anchor` triples (e.g. `gate.assert`, `claim-gate`, `ratio-classifier.suppress`); stubs emitted `${kind}.stub`.
3. MUST prefer the loud refuse over the clever default: when input is malformed (unknown kind, cycle, tier violation, missing channel), refuse with the frozen token + remedy. Defaults that "helpfully proceed" are how silent corruption enters a system whose entire value is the trustworthiness of its verdicts.
4. ALWAYS gate claims with outputs: the completion proof for any behavior is the pasted command output, the artifact row, or the container excerpt — never prose. (This is Warhead 13 rendered as kernel law; the W4 gate ran on exactly this discipline.)

### 2I — THE NO-LLM LAW

1. NEVER wire a model into the kernel. The `Llm` capability is an interface (a Context.Tag in core/caps.ts); `@effect/ai` is pinned but NEVER imported (`grep -rn "@effect/ai" core/ nodes/ cli/ drivers/` → 0). The OPERATOR plugs the model: a driver that binds `Llm` with their provider, their keys, their routing (the Aether backend machinery, §6G, is exactly such a binding).
2. ALWAYS keep the generation surface honest: `prompt` is the ONE generation kind; tier 2 only; `bracket.contract` mandatory (schema-gated output contract: `json`, or a named shape); `[JESL UNBRACKETED-GENERATION]` and `[JESL CAP-UNBOUND]` are the two refusals guarding it. The cards `bracket.json`/`ask.json` document the swap-in via `meta.slots` and ship deterministic stand-ins so they cast without any model.
3. MUST NOT smuggle intelligence through side doors: no hidden fetch-to-model in http-request configs inside shipped cards, no `shell-exec curl <provider>` recipes in the catalog, no "temporary" key constants. A generation call happens because an operator bound Llm — visible, cap-checked, bracketed.
4. WHY (the verbatim mandate): "DO NOT wire any llms inside this. THE POINT IS FULLY FUNCTIONAL BOILERPLATE MACHINERY I CAN PLUG INTO ANYTHING AND START FILLING WITH DATA AND ADAPTING." The kernel is the machinery; intelligence is the operator's plug-in.

### 2J — THE NO-OVERENGINEERING LAW

1. NEVER add an abstraction, config knob, indirection layer, or "flexibility" the current requirement does not demand. The operator's bar, verbatim: "WITHOUT OVERENGINEERING OR COMPLICATING OR SLOPPING THIS." The kernel stayed at 37 kinds, one executor, one journal — the overhaul ADDED data (cards, lexicon, profile) and FIXED roots (mock-split, paths), it did not grow architecture.
2. ALWAYS fix the root, never the symptom (Warhead 18, kernel-local): the mock-split fix deleted the stub branch instead of special-casing kinds; the battery path fix made paths layout-independent instead of adding a second root config; the boilerplate fix completed the extraction mapping instead of hand-moving files. Symptom patches are deferred defects.
3. MUST choose the simplest implementation that fully meets the requirement, prefer established libraries over reimplementation, lean on dependencies already in package.json before adding new ones, and grow in layers — the smallest working end-to-end version first, capabilities added ON TOP of a working product, never traded for unfinished complexity.
4. NEVER preserve backward compatibility with broken shapes (no compat shims, no fallback branches for replaced paths): the stub branch was DELETED, the old nested boilerplate was WIPED and regenerated, the old tsconfig include list was REPLACED. Dead paths rot; removal is the maintenance.

### 2K — THE NAMING LAW (D26)

1. ALWAYS say JESL = "JSON Effect Scripting Language" (D26, 2026-09-03). NEVER "JSON Event Scripting Library" (the pre-D26 name — purged from repo + docs; if you see it, it is stale).
2. ALWAYS call the discipline "Effect Engineering". NEVER "Spellcasting" — the rename is total (files, content, repo): `EFFECT_ENGINEERING_BIBLE.md`, `JESL_EFFECT_ENGINEERING_LIBRARY.md`. Zero "spellcasting" strings survive in any live doc (verified by sweep; the cards themselves may still be called spells).
3. MUST keep the two frozen filenames that outlive content edits: `JSON_EVENT_SCRIPTING_BIBLE.md` (the language canon — name frozen by D26 even though the language name changed) and `EFFECT_TS_RUNTIME_BIBLE.md` (the Effect canon E1-E10). These are pinned reads in the spec manifest chain.
4. MUST respect the frozen spec set: `MACRO_KERNEL_BOILERPLATE_L2_SPEC.md`, `JESL_LIBRARY_DPL1_SPEC.md`, `EFFECT_TS_RUNTIME_BIBLE.md`, `JESL_EFFECT_PHASE2_DPL1_SPEC.md` are READ-ONLY — manifest `f77b448f…` must never change. New specs (like the overhaul DPL1) live BESIDE them, never inside them.

### 2L — THE BOILERPLATE EXTRACTION LAW

1. ALWAYS produce the boilerplate by RUNNING `boilerplate/extraction.ts` against the kernel — NEVER by hand-copying files. The extraction owns: `DIRS_TO_COPY` (15 dirs incl. algorithms/kernels/boilerplate/tests/fixtures), `ROOT_FILES_TO_COPY` (lexicon.ts, lexicon.json), `profileFiles` (all 5 profiles), and the generated `package.json`/`tsconfig.json`/`boilerplate-manifest.json`. The manifest records `sourceDir`, `targetDir`, `filesCopied`, and the source digest — it is the provenance record.
2. ALWAYS wipe-and-regenerate, never merge: the target tree is disposable; the KERNEL is the source of truth (Warhead 18: fix the source, regenerate the artifact). The Wave-3 lesson: the old v1.0 tree was a stale pre-W1 snapshot with hand-assembled `src/<dir>/<dir>/` double-nesting — the fix was extraction COVERAGE (the join was always correct) + a flat regeneration that mirrors the kernel layout 1:1.
3. MUST verify a fresh extraction as an INDEPENDENT project before shipping it: `cd <boilerplate> && bun install && bunx tsc --noEmit && npx vitest run` → the tree must pass its OWN battery (the fresh tree hit 424/424 with sqlite compiling cleanly on a fresh install — the adopter-faithful proof).
4. NEVER edit boilerplate copies to fix kernel bugs — fix the kernel, re-extract (the Wave-3 collision: an agent "fixed" battery.test.ts in both trees while another agent owned it; two writers, one file, both broken. Files have ONE owner.)
5. MUST keep `dist/index.js` present in the kernel tree (the deploy marker — a one-line re-export of the CLI entry); the container deploy verification hashes it. Absent marker ⇒ `sha_mismatch` with an empty container hash.

### 2M — THE EMBEDDED-AGENT SURFACE LAW (Aether)

1. ALWAYS route model intelligence through the Aether machinery — never through ad-hoc provider calls. The Aether Agent Backend (`Bibles/Aether_Knowledge/Boilerplate_Prototypes/aether_agent_backend/`, boilerplate v3.1, cloned from the SHIP-APPROVED-v2 production system at `Trident_Agent/Active_Projects/v4.4.2-wave-manager-async/src/tools/aether/`) is the operator's headless LLM harness: a pre-built brief file on disk → `new AetherAgent(cwd, {ledger}).run({promptFilePath,…})` → 2-3 rounds of batched `read`+`edit` → **the file on disk IS the output** — never the model's streamed text.
2. NEVER embed key material anywhere. The key contract is env-var-only, zero embedded secrets: `OPENCODE_GO_API_KEY` (the PAID primary rung), `OPENCODE_API_KEY` / `ZEN_KEYS_POOL` (the free cycler — single key or comma-separated pool), `NVIDIA_API_KEY`, `OPENROUTER_API_KEY`, `INFERX_API_KEY`. Each pi provider resolves its own slot natively (envApiKeyAuth). A leaked key in a card, config, or doc is a critical defect.
3. MUST respect the provider chain + its economics: v3.1 chain = `[opencode-go/mimo-v2.5]` as THE SINGLE PAID RUNG (chain death = `AETHER_API_UNREACHABLE … SWAP THE API KEY` — loud, named), then the free cycler rungs (zen 200rpm → nvidia 40 → openrouter 20 → inferx 20). Every call: retry ×5 @2.5s → next rung; TTL exile on 429; the zen 5-key pool rotates BEFORE falling back; the RPM ledger is wave-aware and shared across concurrent agents (token bucket + TTL exile).
4. MUST keep the thinking-budget wiring intact: `chainedStream` injects `reasoningEffort:'medium'` + `thinkingBudgets{medium:2048}` into streamSimple options — the pi agent-loop DROPS budgets on a custom streamFn, and this injection is the compensation. Live incident: without it, one call burned 18,524 thinking tokens = 222s at 83 tok/s. The W5 COMMIT LAW (2048/turn cap stated in the system + round prompts, force-executed, per-turn reset, re-deliberation of an unchanged file BANNED) kills the anxiety loop.
5. ALWAYS capture sessions: `capture.ts` tees /export-level per-agent .md logs (timeline + full transcripts) to `<captureDir>/<waveId>/<agent>.md`, gated on `captureKey` (waveId-agentName); absent key → tees no-op; C0-control redaction; retries append. An uncaptured agent run is an unauditable run.
6. THE JESL SEAT: this machinery is what sits behind the kernel's `Llm` Tag (law 2I, procedure P3-9). The kernel declares the cap + bracket; Aether routes the call; the bracket contract (`nodes/prompt.ts:69-84`) validates what comes back. Neither side knows the other's internals — the Tag is the contract.

### 2N — THE AUDIT-MACHINERY LAW (MPSE)

1. ALWAYS write the math before the spec — MPSE (Mathematical Pseudocode Powered Software Engineering) is the doctrine: "Math is the spec. Code is the implementation. Tests are the proof." Natural-language specs are LOSSY (the founding incident: "each pair should mirror DXY" → one agent built 8/8/8=24, another 40/13 — both "followed" the instruction); math is LOSSLESS (`f(T) = N × (1+P)`, N=8, P=2 ⇒ exactly 24, always).
2. MUST express every rule that can be math AS math, with the natural language as commentary: counts as combinatorics (`f(T)=N(1+P)`), always-true as invariants (`∀ setup: sl ∈ [5,15]`), filtering as set theory (`Allowed = U ∩ P ∩ T`), scoring as linear combinations (`S = Σ wᵢxᵢ`), implication (`BS ∧ ZFP<20% → RWL`), bounds (`5 ≤ sl ≤ 15`), piecewise, recurrence, AND-chains, expected value, matrices, DAGs, series, domain/range, monotonicity, equivalence, partial order, distance, optimization, composition — the 20 structures (MPSE/KB-MPSE-00, table :The-20-structures).
3. MUST translate math symbols to code mechanically (the cheat sheet): `∀`→`array.every`, `∃`→`array.some`, `∈`→`set.has`, `∩`→`filter+includes`, `Σ`→`reduce`, `∧`→`&&`, `→`→`if(a) assert(b)`, `f:A→B`→typed functions. And enforce with ABORT invariants: `if (allSetups.length !== expected) throw new Error("COMBINATORIAL VIOLATION: …")`.
4. ALWAYS map the doctrine onto the kernel: `jesl/mpse/` (parser.ts, rule-cards.ts, oracle.ts, calibrate.ts, kernel-emit.ts, stub-emit.ts) IS this doctrine compiled — rule-cards carry the math structures as data; the oracle calibrates outputs against them; `oracle-gate`/`mpse-discharge` nodes enforce at cast time; `jesl/scanners/` (pba, pta-banks, lsp, audit, trace) are the audit machinery that SWEEPS code for the patterns the rule-cards define. When an agent derails: find the missing math — the derailment happened where a rule stayed natural language (the doctrine's own debugging rule).
5. THE SOURCE CANON: `Aether_Knowledge/MPSE/` — KB-MPSE-00 (the 47KB primer: 20 structures + Plutus examples), KB-MPSE-01 (Formal Foundations, 174KB), KB-MPSE-02 (MPSE as Agent Anti-Derailment Architecture, 169KB), KB-MPSE-03 (Integration with Actor Systems/SEL/Harnesses, 162KB), and the 6.9KB `MPSE_KNOWLEDGE_INJECTION_PROMPT.md` (the distilled entry point — read it first). The LASME companion (`Aether_Knowledge/LASME/`): `02_STATE_MACHINES_AND_GATES.md` (359KB — the state-machine-and-gates canon that JESL's gate/state-machine/circuit-breaker nodes formalize), `MPSE_COMPLETE_ENGINEERING_BIBLE.md` (96KB), `Lexicon_Grade_Intelligent_Systems_Engineering_Bible.md` (149KB), `INTELLIGENT_SYSTEMS_ENGINEERING_T1.md` (the ISE law this bible's sibling), `TEB_MACHINES_FOR_BEHAVIOR_ENGINEERING_T1.md` (52KB), `ACTOR_ENGINE_ADAPTER_CONTAINER_MODEL.md` (52KB).

### 2O — THE SKILL-ROCKET CHAIN LAW

1. ALWAYS treat the 6-stage rocket chain (`jesl/kernels/`) as DATA-DRIVEN workflows on the same kernel — each stage is a directory: `workflow.json` (the card), `activities.ts` (the stage's node implementations, registered into the kernel), `fixtures/` (stage examples), `SKILL.md` (the operator-facing skill card). The chain: **idea-to-bible → bible-to-spec → spec-to-kernels → kernels-to-code → verify → ship**. No stage is special-cased in the executor; they cast like any card.
2. MUST keep rocket activities within the kernel laws: they are node implementations (registry-wired, cap-declaring, loud-failing), not a side-runtime. The 4 activities files that carried `@ts-nocheck` (bible-to-spec, spec-to-kernels, kernels-to-code, verify) were un-suppressed in Wave 3 with boundary casts only — signatures unchanged.
3. ALWAYS honor the stage order: a spec is born FROM a bible (`born-off-spec` fixture proves the negative), kernels FROM a spec, code FROM kernels, verification FROM artifacts, ship FROM verified artifacts. Skipping a stage is the `born-off-spec` anti-pattern — the fixtures encode it so the battery catches it.
4. NEVER wire LLM calls INTO the rocket stages (law 2I): the generation stages (`prompt` nodes inside bible-to-spec etc.) declare the Llm cap and brackets; under the CLI driver they refuse CAP-UNBOUND — under an operator-bound driver they run. The rockets are Llm-ready BY CONTRACT, model-free BY SHIPMENT.
5. MUST treat `SKILL.md` files as the human/operator interface of each stage (what it takes in, what it produces, when to run it) — and keep them in sync when a stage's workflow changes. A stale SKILL.md is documentation drift the same way a stale manifest is provenance drift.

---

<!-- ═══════════════ PART 2B: KERNEL ENGINEERING DEEP-DIVE ═══════════════ -->


## PART 2B — KERNEL ENGINEERING DEEP-DIVE (module by module)

### 2B.1 — core/schema.ts — the card contract

**Role:** every card passes through `decodeDoc` (Effect Schema decode of `WorkflowDoc`, :42) before anything else runs. The decode is the border between "a JSON file" and "a program".

**The envelope:** `$schema` literal `"trident-workflow-v1"` (a typo here = unknown document, refused); `meta{name, tier: 1|2, …excess-tolerant}`; `nodes[]` (NodeEnvelope :7-34 — `id`, `type`, optional `config`, `class`, `on{event,filter?}`, `retries{maxRetries, class: exile|retry|fall}`, `timeoutMs`, `bracket{contract, repair?, confidenceFloor?}`, `oracle`); `edges[]` (`{from, to, via}` — via is free-form string, its MEANING is the channel contract); `vars{}`.

**Invariants:** (1) excess keys are IGNORED by Struct decode — the tolerance `meta.slots` rides on; (2) unknown `type` strings survive decode and die at `validateDoc(isKnownKindSync)` — the two-stage rejection lets errors name the node; (3) `tier` drives the generation ban (tier 1 + generation kind = `[JESL TIER-VIOLATION]` at checkUnbracketed time).

**Engineering notes:** decode errors come out as Effect Schema tree failures — the CLI flattens them; when authoring cards, a schema rejection means the ENVELOPE is wrong (not the config); config contents are validated later per-node at cast time. This split (envelope at decode, config at invoke) is why `[JESL …]` tokens stay precise.

### 2B.2 — core/graph.ts — the dependency compiler

**Role:** nodes + edges → execution order. Compiles the DAG; a cycle refuses `[JESL CYCLE]` with the actual path in `actual` (e.g. `cycle through [a→b→c]`) and the remedy (`break the cycle with a gate, or re-arm via event-reactivate`).

**Contract:** an edge `{from, to, via}` declares that `to` reads the channel `via` from `from`'s outputs. Cycles are structural (graph), not temporal — `cron-trigger`/`event-reactivate` exist precisely because time-based re-entry must be modeled as re-activation, not as a cycle edge.

**Engineering notes:** the compiler emits the order the EXECUTOR consumes; batches form where nodes share no dependency path (executor runs each batch on fibers, concurrency 15). If two nodes in one batch write the same channel, last-write-wins per the via key — avoid by unique via naming (P2-1).

### 2B.3 — core/executor.ts — the fiber engine

**Role:** `runProgram(doc, ctx)` — the ONLY place node invokes run. Sequence: buildRunContext (handles + capsRequirements + boundCapsFor) → per batch: `Effect.fork` per node up to concurrency 15 → collect NodeResults → next batch on channel readiness.

**The cap pre-check (~:162):** for each node, `capsRequirements ⊆ boundCapsFor(driver)` BEFORE invoke — refusal `[JESL CAP-UNBOUND]` with the missing cap in `actual`. This is why capability honesty is structural: no node ever "tries" what the driver didn't grant.

**NodeInput contract:** `{node: {id, type, config}, inbound: Record<via, outputs[via]>, vars, …}`; NodeResult contract: `{verdict: PASS|FAIL|INCONCLUSIVE, evidence: {pattern, state, anchor}, timing, outputs?, error?}`. INVARIANT: invoke NEVER throws raw — failures are FAIL verdicts with reasons, or token errors thrown by the FRAMEWORK (validation), never by node bodies.

**Engineering notes:** `runId` is minted here (`wf-<ts>-<rand>`) and threads through every journal row; the executor writes INVOKE + VERDICT rows around each invoke (journal law 2C); `budget` (deadlineMs, maxNodesFiring) and `clock` come from the context — tests inject ClockTag for determinism.

### 2B.4 — core/journal.ts — the evidence spine

See law 2C. Engineering detail: rows are `{run, ts, kind, payload, prev, self}`; `self = sha256(prev + canonical(payload))` with `ts` EXCLUDED from the hash (timestamps must not break determinism); `verifyChain(rows)` walks the recomputation — one mutated byte anywhere ⇒ `verified:false` at that index. The `verify` kernel stage and replay-source both consume this. Append-only is structural: no API mutates history; "correction" means a NEW run.

### 2B.5 — core/registry.ts — the kind constitution

See law 2B. API surface: `ALL_KINDS` (:34-72, the 37 contract) · `stubImpl(kind, family)` (the seed — INCONCLUSIVE/TODO anchors, what Wave 1 eliminated) · `replaceStubSync(kind, impl)` (append-only: refuses unknown kinds, family mismatches, real→real replacement) · `replaceStub` (the Effect variant) · `makeRegistry` (the Ref-backed service for Effect-land consumers: `register`, `replaceStub`, `get`, `isKnownKind`, `kinds`) · `getRegisteredImplSync` (the sync accessor — the CLI's ONE lookup).

**The seeding pattern:** at module load, `globalRegistryStore` is seeded with a stubImpl for every ALL_KIND — so a kind with no real impl is VISIBLE (its stub says `TODO:<kind>`) rather than absent. Wave 1 then replaceStubSync'd real impls over all 37. The seed + append-only replace = the registry's honesty lifecycle.

### 2B.6 — core/evidence.ts — the epistemics machine

**Role:** the evidence machine behind `claim-gate` and `evidence-machine` — a per-subject ring of EvidenceEvents, adjudicated to VerdictRecords. Event kinds: `claim` (needs a fresh source_change to reach EVIDENCED), `source_change` (needs filePath — `canSourceChange`), `status` (needs probeOutput — without it: UNEVIDENCED), plus derived kinds from `analyzeResult` (write tools → source_change; `\d+ pass` → unit; container/unit/smoke/dist_change/claim/evidence_clear). Freshness window: `CLAIM_FRESH_WINDOW_MS = 300000` (:5). Verdicts: EVIDENCED / UNEVIDENCED / REJECTED (stale, non-monotonic, missing-path).

**The discipline this encodes:** claims are EVIDENCED by fresh, anchored observations — never by assertion. claim-gate's `preSource` mechanism (pre-arming a source_change before the claim) is the designed honest path (P2-7). This module is the kernel's epistemology: evidence before verdict, anchor before claim.

### 2B.7 — core/caps.ts + core/errors.ts + core/channels.ts + core/bus.ts

**caps.ts:** the 10 capability Tags (Shell, Fs, Http, Journal, HashCap, ClockTag, EmitCap, ToolClient, Subagent, Llm) — the ENTIRE outside world. Llm is deliberately interface-only (law 2I).
**errors.ts:** `JESL_TOKENS` (:85-94, the 8 frozen strings) + the structured error schema (code/node/field/actual/remedy as a Schema.Literal-driven contract, :4).
**channels.ts + bus.ts:** the event side — channels carry typed events; the Bus is the pub/sub a scanner or wrap subscribes to (the lsp-gate test proves a write event → gate fire round-trip). These power the reactive patterns (event-filter, event-reactivate, artifact-gate) without polluting the executor's synchronous batches.

### 2B.8 — cli/ — the production cast surface

**main.ts:** arg parsing → dispatch → `Effect.runPromise(program)` (:26, the single product edge). Errors become exit codes: 0 = PASS, 1 = runtime FAIL, 2 = refusal tokens.
**args.ts:** `run <doc.json> [--in vars.json] [--driver cli|test]`, `validate <doc.json>` (the dry refusal check — S-2 of the battery's boundary scenarios), `lexicon`, `help`. The D26-renamed help text says "JSON Effect Scripting Language".
**handlers.ts:** runDoc's ordered pipeline (decode → validate → unbracketed → handles → context → runProgram → journal verify) + `buildNodeHandles` (the registry lookup + loud unknown throw) + `boundCapsFor` (cli/test both bind Shell/Fs/Http) + `formatJeslError` (the structured `{code, node, field, actual, remedy}` one-liner) + `checkUnbracketed` (tier-2 generation bracket enforcement). THE lesson of this file (2B): it owns NO kind knowledge — it is pure plumbing over the registry.

### 2B.9 — drivers/ — the capability binders

`cli-live.ts` (:110): the reference binding — Shell (child_process with timeout control), Fs (node:fs promisified), Http (fetch-based), Journal (the real chain writer), HashCap (sha256). Rationale comment records the VERIFY-ON-INSTALL decision: `@effect/platform` present but node: bindings chosen for Shell timeout determinism.
`opencode-live.ts` / `hook-bridge.ts` / `session-live.ts`: the agent-host variants — binding kernel caps to OpenCode-runtime surfaces (tool calls, session events, hooks). These are the "embed the kernel into a live agent" seam (with the Aether backend as the model-routing option behind Llm, §6G).
INVARIANT across all drivers: real implementations ONLY here (purity law 2E); a driver that binds a cap it cannot honor is the host-side version of a stub — the same lie.

### 2B.10 — nodes/ — the 37 implementations (engineering notes on the load-bearing ones)

**gate.ts (:28 getByPath, :33 evalAssert, :50 gateNode):** asserts `[{path:"$.<via>…", op: eq|ne|ge|le|contains|matches, value}]` against inbound channels; the `$.` prefix walks from the channel root. Zero-dep path walker — the most-cast node in the battery.
**math-eval.ts (:24, :61):** `expr:{_tag:"literal"|"…", …}` AST → outputs `{result, value}`; `MathExprService` injectable for extension. PASS state `EVALLED`.
**triplet-writer.ts:** `{triplet:{pattern,state,anchor}}` → the kernel's smallest evidence atom — what guards and audits assert against.
**journal-sink.ts:** flushes the run's rows; no config — the automatic journaling is the executor's; the sink is the card-visible commit point.
**parallel.ts (:12):** `items` fan-out → outputs `{count, results[]}` — the fan.json/verify.json backbone; batch concurrency is the executor's, the items are the data.
**retry-chain.ts (:13) / fallback-chain.ts (:12):** `maxRetries`/`failTimes` semantics — retry emits `RETRIED`, fallback emits `FALLBACK` evidence states; the pairs are the resilience grammar.
**replay-source.ts:** journal-reading source (law 2C-2) — ctx.journal → Journal service → allRows filter; EMPTY ⇒ INCONCLUSIVE (honest).
**sqlite-sink.ts (:56):** better-sqlite3 via `_getDb` cache; `DB_OPEN_FAIL` on unopenable DBs (the loud fail that adjudicated CT5's glibc rows); native dep = the one environment-sensitive node.
**circuit-breaker / cron-trigger / event-reactivate / config-lock / layer-loader:** the Effect-primitives quintet (Schedule, Ref maps, Layer) — Wave 1's pattern-node group; `_reset*` exports exist for test isolation.
**claim-gate.ts (:14 extractClaimEvent, :35 claimGateNode):** the epistemic gate — claim events from inbound/config (three extraction paths), optional `preSource`/`sourceEvents` pre-arming, adjudication via the evidence machine (2B.6).
**prompt.ts (:64-97, :69 checkContractViolation):** modes llm|ask-launcher(template); the bracket contract enforced post-generation (json parse or named-shape violation ⇒ structured failure); `requiredCaps:["Llm"]` (:90) — the seat (law 2I).

### 2B.11 — scanners/ + wraps/ + packager/ + mpse/ + workflow/ — the host-side machinery

**scanners/** (pba.ts, pba-banks.ts, pta.ts, lsp.ts, audit.ts, trace.ts, shared.ts): the code-audit constellation — pattern banks (PBA), trace analysis (PTA), language-server diagnostics (LSP), audit aggregation. Bus-connected (a write event can fire a gate — lsp-gate S8L test). These are the "audit tool machinery" the kernels' verify stage consumes.
**wraps/** (behavior-engine, tool-engine, effect-lsp, artifact-gate): host-behavior wrappers — the artifact-gate subscribes to write events and DENIES violating writes (`EFFECT_ARTIFACT_GATE` in the lsp-gate battery) — policy enforcement as a wrap, not as executor logic.
**packager/** (tool.ts, chain.ts, skill.ts, shared.ts): turns kernels/chains into distributable skill/tool packages.
**mpse/** (parser, rule-cards, oracle, calibrate, kernel-emit, stub-emit, demo): model-powered script evaluation — parses rule cards, calibrates against the oracle, emits kernel/evidence artifacts; feeds `oracle-gate`/`mpse-discharge`. Doctrine lineage: the Aether MPSE knowledge (§6H).
**workflow/** (jesl-run.ts + per-kernel activities): `rebuildSummaryFromRows` (the replay reconstructor) + the rocket stages' node implementations — rockets are ordinary kernel nodes (law 2O).

---

<!-- ═══════════════ PART 2C: THE EFFECT ENGINEERING PHYSICS ═══════════════ -->


## PART 2C — THE EFFECT ENGINEERING PHYSICS (why the kernel is shaped this way)

The design lore, compiled from the canon systems' shared mechanics. The OPERATIONAL METHOD derived from it lives in `EFFECT_ENGINEERING_BIBLE.md` v3.0 (idea → runtime reality: intent capture, primitive decomposition, 7 worked walkthroughs, graduation to kernels + rockets) — read it as the engineering companion. This is not decoration: every kernel law in Part 2 is the COMPILED FORM of a physics law here.

### 2C.1 — The Triad Law

Every casting system computes the same three bound stages: **IDEA** (structured intent) → **EFFECT** (a priced, validated pipeline of parameterized primitives) → **EXPERIENCED EFFECT** (a rendered, observable world-state change). Systems differ only in compiler and cost model. JESL compile: meta+vars (idea) → nodes+edges+configs (effect) → journal verdicts (experienced). THE canonical failure: letting the intent stage write the experience stage — the render follows the held structure, not the wish; JESL's answer is 2H (verdicts FROM journal rows, never from the doc's claims).

### 2C.2 — The Pricing Law

Cost is a FUNCTION OF THE SPELL'S SHAPE, capacity is a property of the caster, and the capacity check runs BEFORE release. Three canon models: TES pool (`Σ B·M^1.28·D·A × skill multipliers` — superlinear power pricing; fizzle on empty), Eragon equivalence (`cost = the mundane effort`; overrun = death — forcing the cancellable-process formulation), Witcher essence draw (fire empowers AND marks the caster). JESL compile: the cap pre-flight (2A-2) + the budget (`deadlineMs 600s, maxNodesFiring 15`) — `[JESL CAP-UNBOUND]` with ZERO rows is the fizzle, thrown before any fiber.

### 2C.3 — The Interface Law

A compiler sits between intent and world, and it is the safety layer: Eragon's binding language (spoken words are TRUE — total semantics), Oblivion's altar (known-vocabulary-only), the frozen grammar. JESL compile: `$schema: trident-workflow-v1` + the 8 frozen tokens + the append-only registry ARE the interface — inventing vocabulary outside it is THE recurring failure class (2D-3's sweep exists because of it). The language-design extraction (Eragon as the reference): bounded vocabulary = the kind registry; total semantics = evidence-only verdicts; true names = capability tags (`jesl/Shell`, `jesl/Llm` — capability IS the name); meta-name = the schema/meta layer; non-verbal mode = driver-edge bypass (uncontrolled); process formulation = durable asks + gate-bracketed generation; delegation = subagents behind oracle gates + repair ≤ 2 + 3-strike FAIL.

### 2C.4 — The Primitive-Composition Law

A spell is never a thing — it is a parameterized function: `{effect-type, magnitude, duration, area, targeting}`, composed in ordered pipelines. Named spells are pointers to saved compositions. JESL compile: kinds are the primitives; cards are the compositions; `algorithms/` is the spell book; the composition surface is the doc's node/edge graph (the altar).

### 2C.5 — The Process Law

Spells are CANCELLABLE PROCESSES with checkpoints, not one-shot irrevocable effects (the master tier in every canon: released energy is unrecoverable, so masters formulate processes that can stop mid-flight). JESL compile: the durable ask (suspend/answer/resume), the gate-bracket (gate → generation → gate, repair ≤ 2), journal checkpointing (2C — a stopped spell leaves evidence, not wreckage).

### 2C.6 — The Stacking Law

Interaction rules are part of the spell's CONTRACT, not the runtime's mood: same identity replaces, distinct identities stack; amplifiers multiply everything AFTER them (exponentially — Oblivion's measured ladder: 1→4→16→49→144→400→1089 damage across alternating prepare casts); recasting the same name does NOT accumulate. JESL compile: distinct runIds stack; `covers(docHash, seed)` replays only the identical cast; a new seed = a new chain.

### 2C.7 — The Mastery Law

Power = what the caster can COMPOSE, not what they can EQUIP. The ladder: TIER 0 canned (cast what exists — fast, safe, weak) → TIER 1 composed (build new from primitives — the power tier) → TIER 2 meta (control the compiler — full power, full danger, earned through tier-1 discipline). JESL compile: tier 1 cards = canned; authoring new cards = composed; driver/schema work = meta. The zero-cost illusion applies at meta: enchanted zero-cost builds paid at enchant time — cost is CONSERVED AND RELOCATED, never deleted (budgets live on the run).

### 2C.8 — The Nine-Stage Pipeline (the macro process, compiled)

| Stage | Mechanic | JESL compile |
|---|---|---|
| 1 INTENT | desired world-state forms | meta{name,tier} + vars seed |
| 2 ACQUISITION | vocabulary gained | registry kinds (known-only) |
| 3 STRUCTURING | intent → castable form | the doc: nodes+edges+configs |
| 4 PRICING | cost = f(shape); capacity check | cap pre-flight + budget |
| 5 PRE-FLIGHT | reserves/discipline validated | decode → validate → the refusals (before any fiber) |
| 6 RELEASE | the pipeline executes | runProgram: batches, forEach(15) |
| 7 RENDER | world-state change manifests | outputs → channels → downstream wake |
| 8 SETTLEMENT | costs/residues land | budget consumed; journal rows written |
| 9 RECORD | the experienced effect knowable | verdicts FROM journal rows; replay via covers() |

Every canonical failure mode is a SKIPPED STAGE: blur 3 = the stray-thought catastrophe; skip 4/5 = the overrun death; skip 9 = a cast spell is indistinguishable from a claimed one.

### 2C.9 — The Execution Classes (time as a first-class axis)

INSTANT · PROJECTILE · SUSTAINED (concentration, per-second drain) · TIMED (state for N seconds) · TAPERED (`magnitude(t) = M·W·(1−t/TD)^TC`) · PERSISTENT/ZONE · SUMMONED · **PROCESS** (multi-step, cancellable, state carried between steps — the advanced tier). JESL compile: pause + cron-trigger + event-reactivate + journal checkpoints are the PROCESS-class machinery; retry/fallback chains are the resilience grammar; timeoutMs is the per-node time bound.

### 2C.10 — The Worked Compile (the fireball, canon → card)

The lore bible's §3.5 compiles ONE spell (the fireball) through all four canon systems AND into a complete JESL card — `target-lock` gate → `price` math-eval (the cost function IS a node) → `release` shell-exec → `resolve` gate → `record` triplet-writer, with the 9 stages annotated node by node. Read it there for the full walkthrough; the pattern to internalize: **stages 1-3 = meta+nodes, stage 4 = a pricing node, stage 5 = the bracketing gates, stage 6 = the cap-bound effect, stages 7-9 = channels + budget + the journal triplet.**

---

<!-- ═══════════════ PART 2D: THE LANGUAGE LAWS + RUNTIME SEMANTICS ═══════════════ -->


## PART 2D — THE LANGUAGE LAWS + RUNTIME SEMANTICS (from JSON_EVENT_SCRIPTING_BIBLE v1.2)

### 2D.1 — The nine language laws (1A-1I, the grammar's constitution)

**1A SEPARATION:** every node has EXACTLY ONE role — **detect** (deterministic), **decide** (deterministic), or **generate** (LLM). A detector never decides (the regex is the detection layer, never the decision layer); a generator never gates its own output (a Decision node gates it); the flow wires detect → decide → (generate) → decide.

**1B JOURNAL:** one row per node execution `{ts, run, node, kind, verdict, evidence}`; judge workflows against JOURNAL ROWS, never prose ("assert everything against the MEMORY TABLE, never the prose"); every row carries a source discriminator (`source: "workflow/<run>/<node>"`); a node that fires without journaling is the evidence-less-machine anti-pattern.

**1C EVENT-FEEDBACK:** observation nodes register on the ONE event hook — the workflow both drives and observes its own execution; never poll where an event exists; discover event types empirically (log-first probe), never from docs (names drift).

**1D LOUD-FAIL:** a node that cannot complete returns `{ready:false, errors:[named]}` — never a substitute artifact; a fallback producing a DIFFERENT artifact dressed as success is FALSE SUCCESS (the FALLBACK TEST); INCONCLUSIVE is a fail-state, never a pass.

**1E SCHEMA-GATE:** validate the workflow JSON at AUTHORING time — the runner refuses malformed graphs before any node executes; NEVER embed a general-purpose scripting language (the graph is machine-checkable; an embedded DSL is only runtime-validated — the decisive JESL advantage); unknown types, dangling edges, missing output-contracts get compiler-style diagnostics naming field + remedy.

**1F CONCURRENCY:** independent nodes run in parallel (one rejection never kills the wave — the Effect bind is `Effect.forEach` with per-item `Exit`); never sequentialize nodes that share no edge (N×T instead of ~T); per-node failure lands in ITS journal row — never a silent skip.

**1G PORTABILITY:** node `type` resolves through the registry — the JSON artifact is portable because the registry is a stable contract, like a stdlib; templates carry structure only, never inlined project content; micro templates ≤40 lines JSON, composed boilerplates ≤120.

**1H ORACLE:** build-workflows gate on the oracle table (`| OR-n | scope | O1/O2/O3 | op(...) | command |`) — the firewall evaluates the agent's NUMBER against the oracle, never the prose; the subagent never sees the oracles (it cannot conform to what it cannot read); no oracles in the plan ⇒ `PLAN_NO_ORACLES` refusal; an uncovered agent ⇒ `AGENT_WITHOUT_ORACLES`.

**1I TIER:** the lowest tier that satisfies the requirement wins — Tier 1 (deterministic) beats Tier 2 (LLM); never an LLM node where a lexicon/machine/gate suffices ("the system must never DEPEND on the LLM for a decision the mechanical layer can make"); audit before shipping: any Generation node whose output is a verdict (not prose) is a mis-tier.

### 2D.2 — The execution semantics: dataflow readiness (the ONE model)

Not "steps in a list", not "event handlers" — ONE semantic that is both:

```
   seed: argv | hook event | file | cron tick
        │
        ▼
   [ channels ] ──► ready nodes fire (allSettled batch)
        ▲                 │
        │                 ├── outputs write channels (wake next)
        │                 ├── journal row (pre-invoke + verdict)
        │                 ├── gate LOUD-throw = structured, named
        │                 └── repair edge re-invokes target (bounded)
        │
   bus event ──► a subscription writes a channel ──► same loop
```

A pipeline (DAG) and a reactive script (event-driven) are the SAME machine — one document can be half pipeline, half reactive, no seams. Terminal: the output gate validates the doc's output-contract → the run verdict + the journal path.

**The journal's THREE ROLES (one artifact, three subsystems killed):** evidence (what happened — the triplets) · replay (`covers`: same doc + same input → replay journaled outputs, never re-pay a generation) · resume (journal + serialized context = restart a paused run in a new process).

**The Phase-2 bind (verbatim):** "JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime." An implementation that builds a second async/Promise executor beside Effect is a SECOND RUNTIME and is BANNED.

### 2D.3 — Durable vs ephemeral (when Workflow.make is mandatory)

`Workflow` = crash-safe, replay-safe, journaled execution; a scoped Fiber = in-memory, session-ephemeral. **Workflow.make is MANDATORY when:** the graph contains a `pause` node (DurableDeferred + journal is the resume anchor); an `ask-launcher` prompt (the answer completes a Deferred across process death); any paid generation node (generation must not be re-paid on replay — Activity receipts); a run that may outlive the process with durable-marked nodes (idempotency: same `docHash+seed` → same receipt via `covers()`). **Scoped fiber suffices for:** single hook monitors, Tier-1 gates, in-memory capture engines, unit tests under TestClock.

```ts
const JeslRun = Workflow.make({
  name: "JeslRun",
  payload: { docHash: Schema.String, seed: Schema.Unknown },
  success: RunReceipt, error: JeslError,
  idempotencyKey: ({ docHash, seed }) => `${docHash}:${hash(seed)}`
})
// Each effectful node = one Activity named `node:<id>`. Channel math between
// Activities is deterministic. A covered docHash+seed replays journaled Activity
// outputs and MUST NOT re-invoke shell-exec/python-exec/http-request/file-io/prompt.
```

### 2D.4 — The authorization law (Policy + CurrentProgram + causationId)

`getT0()` text NEVER authorizes I/O — the warhead's T0 is a PROJECTOR over Journal + live fibers (it formats what the EventBus already decided). Authority is the five-Effect chain: `Escalation.intercept` (Paragon tier ≥ 3, pre-armed from PBA) → `Policy.assertCapable` (CurrentProgram.capabilities) → `Policy.assertPhase` (the ready-set phase gate) → `causationId ∈ journal` (provenance: an Interpreter or Activity spawned this) → `Toolkit.invoke` (the bound cap executes). A DENY short-circuits to `Effect.fail(new StructuredEnforcementError({family, rule, evidence}))` — the journal records `pta.intercept` + `pba.family.hit` BEFORE the deny.

**The three NEVERs:** (1) never a status string/system-prompt sticker/warhead prose as the authorizer — no R, no Policy; (2) never LSP diagnostics as permission — diagnostics are evidence on the artifact plane; (3) never `node:fs`/`fetch`/shell outside a bound Activity — that is R smuggling, refused `[JESL CAP-UNBOUND]`.

Every MUST/NEVER maps to a diagnostic: `floatingEffect`, `missingEffectContext`, `runEffectInsideEffect`, `globalFetch`/`nodeBuiltinImport` — the Effect-LSP scanner (2E.8: three scanners on ONE busbar — Paragon PBA, PTA, Effect LSP; the LSP rule→family map is PORTED, never forked).

---

<!-- ═══════════════ PART 2E: THE CARD SYSTEM THEORY ═══════════════ -->


## PART 2D-EXT — THE GRAMMAR DEEP (JSON_EVENT_SCRIPTING_BIBLE v1.2, with current-state deltas)

### 2D.5 — The full workflow artifact (the v1.2 annotated schema)

Beyond the working envelope (§6C), v1.2 declares the OPTIONAL rich fields: `meta.description`, `meta.version` (semver), `meta.output-contract` (a JSON Schema the terminal output binds to), `meta.packaging` (`tool` | `tool-chain`), a `journal` block (`path: .trident/workflows/{name}/{run-id}.jsonl`, `sha256: true`), and `gates{input:[oracle-table], output:[output-contract, evidence-complete]}`. The authoring-time validation checklist (7 rules): name present+unique · node ids unique + edges resolve · every type ∈ the registry · acyclic · output-contract valid JSON Schema · tier-1 ⇒ no generation · `gates.input` includes oracle-table when any node declares `class:"build"`.

**CURRENT DELTA (the shipped kernel):** the executor auto-journals (the `journal` block is advisory), the meta.slots annotation rides the excess-key tolerance, and the registry is the 37-kind CURRENT table (§6A) — the v1.2 grammar's `tool-call`/`shadow-agent`/`shadow-tool`/`subagent-dispatch` kinds are SPEC-era vocabulary; the shipped registry's one generation kind is `prompt` (subagent dispatch lives in the Aether/Hydra layer, §6G).

### 2D.6 — The node envelope law (v1.2)

`id/type/class` mandatory on every node — class = the Separation Law role (detect|decide|generate). `on:{EVENT: target}` wires event-driven edges — a node may be BOTH in the topological graph AND event-reactive. `retries:{attempts, backoffMs, retryable:"429|5xx"}` carries the retryability classification (429/rate-limit → exile; 5xx → retry; else → fall — the Shadow transport's classification adopted into the grammar). `timeoutMs` per node.

### 2D.7 — The Rhai↔JSON correspondence (why JSON won)

The predecessor system (grok-build, Rhai `deep_research.rhai`) proved the CONCEPTS; JESL proved the GRAMMAR. The correspondence: `let meta = #{…}` → the meta block (machine-checked contract vs runtime discovery) · `phase("name")` → node grouping via edges (explicit DAG vs imperative) · `agent({model, output_schema, tools})` → the generation node (transport chain rides free) · `parallel()` → parallel + fan-in edges · `pause()/complete()` → pause node / terminal gate (inspectable checkpoints) · `journal.rs` (JSONL + sha256 + `covers()` replay) → the journal block + replay-source (identical determinism, added evidence-triplet discipline) · `validate.rs` dry-run → the authoring-time schema gate (STRONGER: static validation vs dry-run). THE CORRESPONDENCE LAW: every grok concept has a JESL node; where grok compiles Rhai, JESL validates JSON — same expressive reach, authoring-time guarantees.

### 2D.8 — The library architecture (the package, the purity, the capability model)

```
THE DOCUMENT LAYER: workflow.json + ctx.json (portable — no code, no host coupling)
        │ load + validate
        ▼
JESL CORE — PURE (zero host imports): schema · graph · bus · channels · executor ·
                                      journal · registry · capability interfaces
        │ capabilities in                    │ docs run
        ▼                                    ▼
DRIVERS (the hosts): opencode (hooks→bus, tools/subagent caps) · cli (run|validate|replay|emit)
                     · sdk/watcher/cron (programmatic + scheduled hosts)
```

**The capability model:** `caps: {shell?, llm?, tool?, subagent?, http?, fs?, emit?}`. A workflow needing only deterministic+shell runs anywhere bash runs. A workflow declaring llm/subagent VALIDATES everywhere and EXECUTES only where bound — the first unbound node fails LOUD. **The ask-launcher exception:** prompt's ask-launcher mode requires NO capability — the question returns through the tool result and the LAUNCHING AGENT's answer writes the channel: the agent becomes a node.

**The purity law (Phase-2 form, stronger than S-5):** pure = zero host imports AND zero raw Promise I/O — `node:fs`, `fetch`, `Date.now`, `Math.random` NEVER appear in `core/` even inside an Effect; host I/O lives behind `FileSystem`/`HttpClient`/`Clock` services bound by the drivers. A core file importing `node:fs` fails `E3` + `S8` (`nodeBuiltinImport` / `globalFetch` diagnostics).

**The registry law:** append-only — new kinds register a resolver; the JSON contract NEVER breaks (a v1 workflow runs on v2 registries).

---

<!-- ═══════════════ PART 6F-EXT-3: ROCKET STAGE WALKTHROUGHS ═══════════════ -->


## PART 2E — THE CARD SYSTEM THEORY (the rolodex, the compiler machine, the lexicons)

### 2E.1 — The card rolodex (two layers)

**Layer 1 — THE REGISTRY** (mechanical): 37 kinds, append-only, never renamed; the kernel refuses unknown kinds. **Layer 2 — THE LEXICON FAMILIES** (organizational): gates (lock/assert/refuse), transforms (pipeline/parallel/math), evidence (journal/triplet/audit), execution (shell/http/file — cap-bound), generation (prompt — bracketed), orchestration (retry/fallback/pause/replay). A card is **looked up by name, composed by family, priced by tier, proven by its evidence contract** — the altar rule: compose only from what you know.

### 2E.2 — The compiler machine (the kernel IS one)

```
CARD IN ──► 1. PARSE      decodeDoc — the schema gate ($schema literal, nodes, edges, vars)
        ──► 2. VALIDATE   validateDoc — dup-id · unknown-kind · dangling-edge · cycle · tier
        ──► 3. COMPILE    buildGraph — readiness sets · Kahn batches · cycle detection
        ──► 4. EXECUTE    runProgram — cap pre-flight · forEach(15) · INVOKE→invoke→VERDICT
        ──► CARD RENDERED (the experienced effect, journaled)
```
The phases map 1:1 to the physics: PARSE = the interface binding; VALIDATE = the altar checks; COMPILE = the structural order (the dataflow IS the spell's order); EXECUTE = the priced release.

### 2E.3 — The three lexicon systems

**SYSTEM 1 — FAMILY** (what kind of card?): gates (tier 1, no caps) · transforms (tier 1) · evidence (tier 1) · execution (tier 1, REQUIRES Shell/Fs/Http) · orchestration (tier 1) · generation (tier 2, Llm/Subagent, BRACKETED).
**SYSTEM 2 — COMPOSITION** (which cards compose?): the six canonical chains — `guard → work → prove` (the standard spell shape) · `try → fail → recover` (retry→fallback) · `fan-out → join` (parallel → all-PASS gate) · `hold → resume` (pause → durable ask) · `compute → discharge` (math-eval → oracle-discharge) · `generate → verify` (bracketed prompt → schema-gate → repair ≤ 2).
**SYSTEM 3 — TIER** (what may this card do?): tier 1 = any deterministic/execution/evidence card under the right driver caps; tier 2 = everything tier-1 does + generation, with `bracket{contract, repair ≤ 2, floor}` on every generation node.

### 2E.4 — Card composition (cards within cards)

Three modes: **CHAINING** (A's output feeds B — the spell IS the chain); **NESTING** (a card's graph embeds another card's graph — the lifecycle kernels do this: each kernel embeds the proven shapes of its predecessors); **DISPATCH** (a card spawns a sub-card at runtime — subagent-dispatch/prompt nodes fire child cards behind oracle gates, repair ≤ 2, 3-strike FAIL — unbound dispatch is the possession risk). The lifecycle pipeline (idea→bible→spec→kernels→code→verify→ship) is itself a card chain at macro scale.

---

<!-- ═══════════════ PART 4B: TESTING ANATOMY ═══════════════ -->


## PART 2F-EXT — EXECUTION INTERNALS (the executor and the journal, line-level)

### The run lifecycle (what `runDoc` does, in order)

```
1  read + JSON.parse the card                 exit 1 on parse error
2  decodeDoc                                  schema decode — envelope violations here
3  validateDoc(doc, isKnownKindSync)          dup-id · unknown-kind · dangling-edge · tier
4  checkUnbracketed(doc)                      tier-2 generation needs bracket.contract
5  buildNodeHandles(doc)                      registry lookup per node (loud UNKNOWN-NODE)
6  buildRunContext(doc, vars, driver)         handles + capsRequirements + boundCapsFor
7  runProgram(doc, ctx):
   7a  graph compile                          readiness sets; [JESL CYCLE] here
   7b  cap pre-flight per node                [JESL CAP-UNBOUND] here (before fibers)
   7c  batch loop                             ready nodes → Effect.forEach (conc. 15)
        per node:  journal INVOKE row
                   invoke(input, ctx)         the node's Effect
                   journal VERDICT row        verdict + evidence + timing
                   outputs → channels         wake downstream
   7d  all nodes settled                      FAIL anywhere ⇒ workflow FAIL (exit 1)
8  journal verifyChain                        tamper check on the written chain
9  print the run document                     verdict · results · batches · journal tail
```

### The journal row anatomy

```json
{ "run":   "wf-1788450759873-k3j2x1",
  "ts":    1788450759874,
  "kind":  "INVOKE" | "VERDICT",
  "node":  "check",
  "payload": { "…node id/type/config summary / verdict + evidence…" },
  "prev":  "a4b2bae46e33…",
  "self":  "d15a73f1d8b7…" }
```
`self = sha256(prev + canonical(payload))` — `ts` excluded. `verifyChain` recomputes the walk; one flipped byte anywhere ⇒ `verified:false` at that index (battery t5). The journal file lands where the driver's Journal binding writes it; replay-source reads it back by runId.

### The readiness model (why your card fires in the order it does)

A node is READY when every inbound channel (each `via` pointing at it) has been written by an upstream output. Ready nodes fire as ONE batch (parallel fibers); their outputs write new channels; new readiness → new batch. Consequences: (1) a diamond graph fires the join only after both arms; (2) two nodes with no path between them share a batch; (3) a channel written by NO edge is `[JESL CHANNEL-UNSET]` if anyone reads it; (4) `via` collisions in one batch = last-write-wins — unique via names are the discipline (P2-1).

### The capability pre-flight (the honest gate)

Before ANY fiber: for each node, `requiredCaps ⊆ boundCapsFor(driver)`. Missing ⇒ `[JESL CAP-UNBOUND] node=<id> field=caps actual=<cap> remedy=…` with ZERO journal rows — the refusal happens before the run exists. This is why CAP-UNBOUND is cheap and safe: nothing to clean up, nothing pretending.

---

<!-- ═══════════════ PART 6L-EXT: THE RECEIPTS INDEX ═══════════════ -->


## PART 2G — THE EVIDENCE + SCANNER MACHINERY DEEP

### 2G.1 — The evidence machine (core/evidence.ts, the epistemics)

The machine keeps a per-subject ring of `EvidenceEvent`s and adjudicates to `VerdictRecord`s `{subject, verdict: EVIDENCED|UNEVIDENCED|REJECTED, at, reason?}`. Event kinds and their admission rules:

| kind | admitted when | adjudication |
|---|---|---|
| `claim` | subject present; `at` defaults to now | EVIDENCED **only if** a fresh `source_change` exists for the subject; else UNEVIDENCED ("no fresh source_change") |
| `source_change` | filePath present (`canSourceChange`) | REJECTED when stale (> CLAIM_FRESH_WINDOW_MS = 300000), non-monotonic, or subject-less |
| `status` | probeOutput present (`canStatus`) | EVIDENCED; without probeOutput ⇒ UNEVIDENCED ("status without probeOutput") |
| `unit` / `container` | from `analyzeResult` (PASS_COUNT_RE `\d+\s+pass`) | EVIDENCED |
| `smoke` / `dist_change` / `evidence_clear` | from `analyzeResult` text markers | per-kind rules |

`analyzeResult(tool, resultText)` classifies tool output into evidence kinds: write tools (`write`, `edit`, `write_file`) ⇒ source_change; pass-count regex ⇒ unit/container; `smoke`/`dist`/`claim`/`evidence_clear` markers ⇒ their kinds. `queryVerdict(subject)` returns the stored verdict with TTL staleness (VERDICT_TTL_MS).

**The design reading:** the machine encodes "claims need fresh anchored observations" as DATA, not convention. claim-gate's preSource is this machine's pre-arming API; the forensic scanners (2G.2) are its ingestion arm.

### 2G.2 — The scanners (the audit arm — pba, pta-banks, lsp, audit, trace)

- **PBA** (`pba.ts`, `pba-banks.ts` — Paragon Behavior Analysis): pattern banks over agent/tool behavior; the banks are DATA (typed pattern families, not regex slop — the ISE law); a bank hit arms the Paragon tiers (intercept at tier ≥ 3).
- **PTA** (`pta.ts` — Paragon Trace Analysis): the trace-side scanner; `pta.intercept` rows land in the journal BEFORE a deny (the authorization law's receipt).
- **LSP** (`lsp.ts` + `wraps/effect-lsp.ts`): language-service diagnostics mapped to families (`floatingEffect`, `missingEffectContext`, `runEffectInsideEffect`, `globalFetch`/`nodeBuiltinImport`) — the rule→family map is PORTED, never forked. Diagnostics are EVIDENCE on the artifact plane, never authorization (2D.4).
- **audit/trace** (`audit.ts`, `trace.ts`): aggregation + the timeline (`trace.timeline` feeds the run summary).

The bus connective: a host WRITE event → the artifact-gate wrap evaluates → `EFFECT_ARTIFACT_GATE` deny + journal row on violation (the lsp-gate battery proves the round trip: subscribe → write → gate fires).

### 2G.3 — The wraps (policy as wrappers)

`behavior-engine.ts` (the Paragon behavior policy), `tool-engine.ts` (tool-call shaping), `effect-lsp.ts` (the LSP bridge), `artifact-gate.ts` (write denial). The wraps are where HOST policy lives — the kernel's executor stays policy-free; the wraps watch the bus and enforce. This separation is why the kernel embeds anywhere: policy is a wrap you choose, not a tax you inherit.

---

<!-- ═══════════════ PART 6M: THE TDM FRAMEWORKS MAP ═══════════════ -->


## PART 2G-EXT — EVIDENCE RULES + SCANNER FAMILIES (the complete tables)

### The evidence admission rules (every kind, every rule — core/evidence.ts)

| event kind | admission requirement | on violation | reaches EVIDENCED when |
|---|---|---|---|
| claim | subject non-empty; at defaults to now | — | a FRESH source_change exists for the subject (hasSource) |
| source_change | filePath present (direct/detail/payload) + subject | REJECTED "source_change without path" | always — it IS the corroboration |
| status | probeOutput non-empty (canStatus) | UNEVIDENCED "status without probeOutput" | always |
| unit / container | analyzeResult: `\d+\s+pass` (+ `container` marker) | — | always |
| smoke / dist_change / evidence_clear | analyzeResult text markers | — | per rules (evidence.ts:117-123) |
| any | fresh within CLAIM_FRESH_WINDOW_MS = 300000 | REJECTED "stale" | — |
| source_change ordering | monotonic timestamps | REJECTED "non-monotonic" | — |

Verdict TTL: a stored verdict older than VERDICT_TTL_MS queries back UNEVIDENCED "stale verdict". `evidence_clear` clears a subject's ring.

### The scanner families (what each bank watches)

| scanner | watches | produces |
|---|---|---|
| PBA (pba.ts + pba-banks.ts) | agent/tool BEHAVIOR patterns — typed PatternFamily banks (id/kind/matcher/trigger/severity/messageTemplate/remediationHook) | bank-hit rows arming the Paragon tiers (intercept ≥ 3) |
| PTA (pta.ts) | the run TRACE — causation, ordering, intercepts | `pta.intercept` journal rows BEFORE any deny |
| Effect LSP (lsp.ts + wraps/effect-lsp.ts) | TS diagnostics → families: floatingEffect, missingEffectContext, runEffectInsideEffect, globalFetch/nodeBuiltinImport | DiagnosticReports (EVIDENCE, never authorization) |
| audit (audit.ts) | aggregation of all scanner output | the audit rows verify/ship consume |
| trace (trace.ts) | the run timeline | `trace.timeline` in the run summary |

The ISE law governs the banks: typed PatternFamily members — a regex-only classifier is the slop signature the banks prevent. DETECTORS here; DECIDERS are the gates; the separation is the law (1A).

---

<!-- ═══════════════ PART 6P: THE SLOT-SWAP CATALOG + PER-DRIVER QUICKSTARTS ═══════════════ -->


## PART 2H — THE REACTIVE MACHINERY DEEP (events, bus, the closed loop)

### 2H.1 — The two wake sources

A node fires when its channels are ready (the dataflow model, §2D.2) OR when its subscription fires (the event model). `core/bus.ts` is the pub/sub; `core/channels.ts` the typed channel store. The bus event → subscription → channel write → readiness → batch: the SAME loop as dataflow, one seam earlier. This is why a card can be half pipeline, half reactive with no seams.

### 2H.2 — The reactive nodes

**event-filter** (`{on:{event, filter?}}`): subscribes via the hook bridge; the filter is a DETECTOR (1A) — a predicate over the event payload, never a decision. Matched events write the node's channel.
**capture-engine**: accumulates streaming content (start/delta/end/flush at 50ms/60-char/end boundaries — the v1.2 canon's accumulator rules) into channel-ready chunks; in-memory, ephemeral.
**event-reactivate**: re-arms a COMPLETED node when a named event re-fires — the loop builder that replaces cycle edges (the graph compiler refuses cycles; reactivation is the legal loop).
**cron-trigger**: Schedule-driven wake for time-based entry.
**artifact-gate (wrap)**: subscribes to host WRITE events; DENIES violating writes (`EFFECT_ARTIFACT_GATE` + `pta.intercept` rows) — policy enforcement as a subscriber.

### 2H.3 — The closed control loop (the embed pattern)

```
host runtime ──events──► hook-bridge ──► bus
                                          │ subscriptions (event-filter/capture)
JESL card ◄──channels ready──────────────┘
   │ executor fires
   ▼
tool calls ──► host tools ──► new host events ──► bus … (the loop closes)
```

The card drives AND observes its own execution (law 1C). The journal records BOTH sides. A stopped loop leaves evidence, not wreckage (the process law).

### 2H.4 — A claim's life through the evidence machine

```
1.  a write lands            → analyzeResult("edit", …) → kind: source_change
2.  source_change ingested   → ring[subject] (freshness window 300s; canSourceChange: filePath required)
3.  claim-gate pre-arms      → preSource ingested FIRST (same subject)
4.  the claim ingested       → kind:"claim", subject matches → hasSource = true
5.  adjudication             → EVIDENCED (would be UNEVIDENCED "no fresh source_change" without step 3)
6.  verdict + triplet        → {pattern:"claim-gate", state:"EVIDENCED", anchor:"<node>:<subject>:EVIDENCED:1"}
7.  journal rows             → INVOKE + VERDICT, chained
8.  replay                   → covers(docHash, seed) reproduces the adjudication exactly
```
Every bracket.json cast walks this exact path — the epistemics is not a metaphor; it is executed code (core/evidence.ts + nodes/claim-gate.ts).

---

<!-- ═══════════════ PART 6G-EXT: THE AETHER BACKEND INTERFACES ═══════════════ -->


## PART 2I — THE STATE-MACHINE CANON + THE PROFILES GUIDE

### 2I.1 — LASME + TEB: the machines beneath the nodes

The LASME canon (`Aether_Knowledge/LASME/`): `02_STATE_MACHINES_AND_GATES.md` (359KB — THE state-machines-and-gates volume; the theory JESL's `gate`/`state-machine`/`circuit-breaker` nodes formalize), `TEB_MACHINES_FOR_BEHAVIOR_ENGINEERING_T1.md` (52KB — the behavior machines: every machine journals, every machine's fail-state is INCONCLUSIVE never PASS, every machine is detect/decide separated), `ACTOR_ENGINE_ADAPTER_CONTAINER_MODEL.md` (52KB — the actor adapter), `MPSE_COMPLETE_ENGINEERING_BIBLE.md` (96KB), `Lexicon_Grade_Intelligent_Systems_Engineering_BIBLE.md` (149KB — the lexicon-grade engineering standard). The machine laws that survived into the kernel: a machine without a journaled transition is evidence-less (banned); a machine's INCONCLUSIVE is a fail-state; a machine's detection is mechanical, its decision explicit.

**Design rule when building gate-like nodes:** read LASME's gates chapters first; the kernel's gate/circuit-breaker/state-machine are the compiled canon — a new gate-like node should COMPOSE them, not reinvent their semantics.

### 2I.2 — The profiles guide (choosing and authoring a DomainModule)

| profile | caps | shape | for |
|---|---|---|---|
| default | Shell, Fs, Http | all 37 kinds, tier 1, no brackets | the zero-config start |
| trident | the agent-workflow set (Llm/Subagent included) | the orchestrator's own shape | running inside the trident stack |
| trading / sales | domain-shaped kind subsets + brackets | example domain modules | adaptation references |

Authoring (P3-5's full form): copy `trident.ts` → rename → choose caps HONESTLY (what your driver binds) → choose the kind subset (least privilege) → set `defaultTier` (1 unless you ship generation) → declare brackets for any generation node (`{contract, repair ≤ 2, floor}`) → the module-level `validateDomainModule` throw-guard proves it at import. A profile that does not validate is a build error, not a config note.

### 2I.3 — Tier discipline in profiles

`defaultTier: 1` profiles refuse generation cards entirely (TIER-VIOLATION) — that is the POINT: a deterministic deployment cannot accidentally run a model. Tier-2 work needs a profile AND a driver that both say so. The profile is the second lock on the generation door (the bracket is the first, the cap is the third).

---

<!-- ═══════════════ PART 2J: THE JOURNAL + BATCHING SPEC APPENDIX ═══════════════ -->


## PART 2J — THE JOURNAL + BATCHING SPEC APPENDIX

### 2J.1 — The journal format (the full contract)

```jsonc
// one JSONL row per event; append-only; the file is the run's body
{ "run":   "wf-<epoch_ms>-<6char_random>",     // the run identity (minted by the executor)
  "ts":    1788450759874,                      // wall ts — EXCLUDED from the hash
  "kind":  "INVOKE",                           // INVOKE | VERDICT
  "node":  "check",                            // the node id
  "payload": { … },                            // kind-shaped: config summary / verdict+evidence
  "prev":  "a4b2bae46e33…prev_self_or_zeros",  // the previous row's self (zeros at genesis)
  "self":  "d15a73f1d8b7…" }                   // sha256(prev + canonical(payload-without-ts))
```
Properties: append-only (no mutation API); chain-verified (`verifyChain` recomputes every link); replay-complete (rows + doc + seed ⇒ the run reconstructs); source-discriminated (rows carry their workflow/run/node path — multiple workflows share one store safely, law 1B-3).

### 2J.2 — The batching semantics (the executor's scheduling, precisely)

1. Compile the DAG (Kahn layers from the edge set). Layers = the readiness generations.
2. Within a layer, ALL ready nodes fire concurrently — `Effect.forEach(ready, invoke, {concurrency: 15})` with per-item `Exit` (5K-5): one rejection partitions out, siblings complete.
3. Layer N+1 starts when its inbound channels are all written — a layer's LAST writer wakes it.
4. Budget guards the whole run: `deadlineMs` (600s default) and `maxNodesFiring` (15) — exhaustion is a LOUD abort with the budget state in the error.
5. The journal interleaves: each node's INVOKE/VERDICT rows interleave across the batch — the chain stays per-run linear regardless of concurrency.
6. Retries live INSIDE the node envelope (`retries{attempts, backoffMs, retryable}`) — the executor does not retry; the node's own schedule does (the retry-class template, 5K-4).

### 2J.3 — The event interleaving

Bus events and dataflow readiness share the loop: a subscription's channel-write can promote a node into the CURRENT batch cycle. The executor is the only writer to the readiness state — events influence, the executor decides (the detector/decider separation at the scheduler level).

---

<!-- ═══════════════ PART 2G-EXT: EVIDENCE RULES + SCANNER FAMILIES ═══════════════ -->


## PART 3 — CORRECT / WRONG PAIRS (the anti-pattern ledger)

### P2-1 — Channel naming: inbound[via] = upstreamOut[via]

WRONG: name edges for humans (`via: "step1Out"`) then write asserts against node output keys (`$.count`) — the channel never matches, the gate refuses `[JESL CHANNEL-UNSET] field=$.value actual=undefined remedy=check edge.via names` (oracle.json's first cast died exactly here).
CORRECT: name `via` EXACTLY the upstream output key you will read. `fan.json`: parallel emits `{count: 3}` → edge `via:"count"` → gate asserts `$.count ge 3`. `mech-gate.json`: triplet-writer outputs `{triplet:{…}}` → edge `via:"triplet"` → assert `$.triplet.state eq "PASS"`. The rule: `inbound[via] = upstreamOut[via]`; the assert path walks FROM the via name.
Fix when refused: read the error's `field` (the path you wrote) and `actual` (undefined = channel absent) → open the upstream node file → copy its real `outputs` keys → rename the edge via.

### P2-2 — Generation nodes: tier 2 + bracket, never tier-1 Llm

WRONG: drop a `{"type":"prompt","config":{"mode":"llm"}}` node into a tier-1 card and expect it to skip gracefully — you get `[JESL TIER-VIOLATION]` (tier 1 bans generation kinds). Promote the card to tier 2 with the same node → `[JESL CAP-UNBOUND]` under the CLI driver (executor pre-check, executor.ts ~:162 — the node refuses BEFORE invoke; even `mode:"ask-launcher"`/template hits the tier/cap walls because the tier check fires first).
CORRECT: tier-1 templates ship a deterministic stand-in (`pipeline` node) + `meta.slots` documenting the exact real swap-in: `{"kind":"prompt","config":{"bracket":{"contract":"json"},…},"tier":2}` under a driver that BINDS `Llm`. This is what `bracket.json` and `ask.json` ship. The template casts PASS today; the adopter's bound driver unlocks the real node tomorrow — no kernel edits.
Fix: identify which wall hit you (tier vs cap — the tokens differ), move the generation to tier 2 + bracket + a binding driver, or de-scope to the deterministic stand-in.

### P2-3 — Adding a node kind: registry wiring, never a handler map

WRONG: add your node to a kind→impl map inside cli/handlers.ts "so the CLI can run it". You just forked the registry — the mock-split is reborn: tests exercise the registry, production exercises your map, and every kind NOT in your map silently PASS-stubs (the original defect ran 22 fake kinds for a whole build).
CORRECT: (1) write `nodes/my-kind.ts` exporting a `NodeImpl` with real invoke logic, `requiredCaps`, and loud error paths; (2) self-register at the file bottom: `replaceStubSync("my-kind", myKindNode)` — AND add the kind to `ALL_KINDS` in core/registry.ts with its family; (3) import it in `nodes/index.ts` (so the self-registration fires) and add it to `allFullNodes`; (4) ≥2 adversarial it.effect tests; (5) the trio (nocheck/tsc/battery). The CLI picks it up through `getRegisteredImplSync` with ZERO handler edits — the lexicon and the unknown-kind refusal follow automatically.
The append-only rule bites here: `replaceStubSync` refuses if a real impl already exists for the kind (RegistryFrozenError) — that refusal is the registry protecting itself from your double-wire.

### P2-4 — Test handlers: keep timing semantics, never Effect.succeed them

WRONG: "the type checker complains the handler returns Effect<…, unknown, TestServices>… I'll just make it instant": `invoke: () => Effect.succeed({verdict: PASS_TOK as const, …, timing: {startMs: 0, endMs: 0}})`. Result: the t4 kill-resume test hangs FOREVER — an instantly-completing node gives the kill nothing to kill; the counters (`Ref.update`) die so determinism checks assert nothing; vitest freezes with a silent stream (Wave 3, live incident — required an orchestrator hard-steer + full revert).
CORRECT: keep the handler EXACTLY as it was (`Effect.gen(function* () { yield* Ref.update(counter, n => n + 1); const s = yield* Clock.currentTimeMillis; return {…, timing: {startMs: s, endMs: s}} })`) and fix ONLY types: `PASS_TOK as "PASS"` instead of `as const` (TS1355 — a const-assertion on a `String.fromCharCode` result), `it: any` alias for the TestServices variance, one boundary `as any` on an invoke return if the checker still resists. Timing semantics are the test's PURPOSE.
Rule of thumb: if your type fix changes what a handler DOES, it is not a type fix — it is a new bug with a green battery.

### P2-5 — Source edits: anchored edits, never global string surgery

WRONG: "quick fix" via blanket `t.replace(" as any) })", ") })")` over a whole file — it matched sites you never intended (IIFE returns, catch blocks), produced `catch { return {results: {}} })()` shapes that BOTH esbuild and tsc 5.9 reject (ambiguous parse), and left the file syntactically dead while three fixes fought each other (Wave 3, live incident).
CORRECT: anchored edits only — the edit tool with unique `oldString` context, or a line-targeted patch after reading the region. When surgery is genuinely complex, restore the file to its last-good state and re-apply the few REAL changes (the hard-steer remedy: "git checkout the file if the diff is too tangled" — jesl is gitignored, so the agent restored from its own known originals).
Symptom of this class: "Transform failed with 1 error" from vitest on a file you 'only typed'. Stop, read the file, anchored edits.

### P2-6 — Replay: a real runId + journal, never an invented one

WRONG: ship `chain.json` with `{"type":"replay-source"}` and no `runId`, expecting a PASS — the node honestly returns `INCONCLUSIVE / EMPTY` (nothing journaled under `""`). Then "fix" it by making replay-source return PASS on empty — congratulations, you converted the kernel's most honest node into a liar.
CORRECT: two legitimate shapes. (a) Ship castable: gate-seed → `pipeline` work-slot → journal-sink, with `meta.slots` instructing the swap: `{"type":"replay-source","config":{"runId":"<your-run-id>"}}` — exactly what `chain.json` ships. (b) Run for real: cast any card (its rows journal under `wf-<ts>-<rand>`), then cast a replay card with that runId — rows come back, `rebuildSummaryFromRows` rebuilds, verdict mirrors the rebuilt run. Empty = INCONCLUSIVE is the system telling the truth.
The same honesty rule produced oracle.json's restructure: `oracle-discharge` needs the `oracle:read` cap (CLI never binds it) → shipped shape is `math-eval → gate assert $.result eq 42` + slot docs, NOT a stub discharge.

### P2-7 — Claims: pre-armed evidence (preSource), never a bare claim

WRONG: `{"type":"claim-gate","config":{"subject":"bracket.claim"}}` expecting PASS — the evidence machine correctly returns FAIL: a bare claim with no fresh `source_change` for its subject adjudicates UNEVIDENCED ("no fresh source_change", core/evidence.ts:117). The naive "fix" — weakening claim-gate to PASS unclaimed subjects — would gut the one node whose job is epistemic honesty.
CORRECT: pre-arm the evidence (the node's DESIGNED mechanism, claim-gate.ts:53): `config: {"subject":"bracket.claim", "preSource": {"filePath":"src/bracket-output.json","payload":{…}}}`. claim-gate ingests the preSource as a `source_change` (canSourceChange requires a filePath), THEN ingests the claim → `hasSource` true → adjudication `EVIDENCED` → verdict PASS. `bracket.json` ships this. Alternative honest paths: `config.sourceEvents` array, or a status event WITH probeOutput (line :101 — status without probeOutput = UNEVIDENCED).
The lesson generalizes: when a gate fails, read the adjudication rule it enforces — the fix is satisfying the rule honestly, not loosening the rule.

### P2-8 — Oracle discharge: cap-bound drivers, never CLI lies

WRONG: after `oracle-discharge` refuses `[JESL CAP-UNBOUND] field=caps actual=oracle:read`, "fix" the CLI driver to bind a fake oracle capability so the card passes. Now every cast lies about having verified against an oracle registry — the cap system's entire point (honest capability accounting) is dead.
CORRECT: the card ships what the driver can honestly run (math-eval → gate assert), and `meta.slots` documents the real node's requirements: `oracle-discharge` (config `{ruleId, expected}`, `requiredCaps:["oracle:read"]` — oracle-discharge.ts:28) runs under a driver that binds the oracle capability (tier 2, operator-supplied). The refusal was the SYSTEM WORKING: it told you exactly which cap, which node, which remedy — `run under a driver that binds the cap, or drop the node`.
General law: a CAP-UNBOUND refusal is capability accounting working, never a bug to route around.

### P2-9 — Boilerplate: regenerate from extraction, never hand-move files

WRONG: the v1.0 boilerplate — hand-assembled `src/<dir>/<dir>/` double nesting, a pre-Wave-1 snapshot (20 stub kinds!), stale paths — "fixed" by agents hand-moving files up a level. You now have a correctly-nested STALE kernel: every fix is a fork from the real source, forever.
CORRECT: fix the EXTRACTION (source of the artifact): Wave 3 completed `DIRS_TO_COPY` (10→15 dirs, adding algorithms/kernels/boilerplate/tests/fixtures), added `ROOT_FILES_TO_COPY` (lexicon.ts/json), extended `profileFiles` (2→5 incl. default) — then WIPED the target and regenerated: 182 files, flat (mirrors the kernel 1:1), digest `4088dee9…`, proven by running the tree's OWN battery: tsc 0 + 424/424 in-tree, sqlite compiling fresh.
Rule: the kernel is the source; the boilerplate is a build artifact with a manifest. Artifact drift ⇒ regenerate, never patch the artifact.

### P2-10 — Concurrent agents: disjoint files, pause before steer

WRONG: two agents on one file (the Wave-3 live incident: w3-flatten "fixed" battery.test.ts in BOTH trees while w3-typed-tests owned it — their competing writes produced a syntax ping-pong and a hung vitest; the flattener had also re-extracted MID-EDIT, copying half-fixed files into the fresh tree).
CORRECT: disjoint file ownership at dispatch; when a collision is detected live — PAUSE the out-of-scope agent first (session.abort; no message), let the owner finish solo, then resume with a scope-locked steer (what changed while paused, what is now off-limits, what the single remaining job is). The pause-steer-resume sequence is the orchestrator's collision drill; it worked end-to-end in Wave 3.
Corollary: re-extraction/regeneration of ANY artifact waits until its sources are final. Sequence through the orchestrator; parallelize only what shares nothing.

### P2-11 — tsconfig: wildcard include, root-cause the excludes

WRONG: the tsconfig agent, hitting new errors the wildcard surfaced (`lexicon.ts` .ts-extension import; `idea-to-bible.test.ts` never-before-checked), ADDED both to `exclude` — papering the debt into config. Two files silently outside type-checking is the @ts-nocheck disease wearing a hat.
CORRECT: root-cause each exclude: lexicon.ts → drop the `.ts` from the import specifier (bun resolves extensionless .ts; one line, file becomes checked); idea-to-bible.test.ts → steer it into the type-debt agent's scope as file 13 (same TestServices fix pattern). THEN remove both excludes — final state: `exclude` = the 3 original fixture entries, `include: ["**/*.ts"]`, 20 lines, tsc 0 with EVERY file checked.
Standing rule: an exclude is a debt ledger entry, not a solution. Every exclude needs a named root cause and a removal plan, or it is @ts-nocheck in disguise.

### P2-12 — Path resolution: relative to the module, never workspace hardcodes

WRONG: `tests/battery.ts:37` — `const ROOT = Path.resolve(__dirname, "../..")` + `FIXTURES = Path.join(ROOT, "jesl/fixtures")`. This hardwired the WORKSPACE layout (kernel nested at `<root>/jesl/`). It passed on the host for months — by coincidence. In the container the same code resolved `/root/jesl/fixtures` (ABSENT) and 3 battery tests failed while 421 passed — the failure only visible from a different layout.
CORRECT: resolve from the MODULE, which travels with the code: `const JESL_ROOT = Path.resolve(__dirname, "..")` (tests/ is INSIDE the kernel), `FIXTURES = Path.join(JESL_ROOT, "fixtures")`, `CORE_DIR = Path.join(JESL_ROOT, "core")`. Verified in both layouts: host 424/424, container battery 8/8.
Law: `import.meta.url`/`__dirname` + relative hops ONLY — never absolute workspace assumptions, never env-dependent roots, never "it works where I sit".

---

<!-- ═══════════════ PART 4: PROCEDURES ═══════════════ -->


## PART 4 — PROCEDURES (copy-pasteable, self-contained)

### P3-1 — Cast a card

```bash
cd "/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Active_Projects/JESL/jesl"
bun run cli/main.ts run algorithms/guard.json; echo "EXIT:$?"
```
Expected: a workflow document ending `"verdict": "PASS"`, `EXIT:0`. Read the output top-down: `batches` (the dependency-ordered firing groups), `results` (per-node `verdict` + `evidence.pattern/state/anchor` + `outputs`), then the journal tail (`prev`/`self` chain).
Variants: `--in fixtures/vars.json` seeds `vars`; `--driver test` runs the test capability set. Any `[JESL …]` token + exit 2 = a refusal — read `node`, `field`, `actual`, `remedy` on the error line, then consult Part 5.
Cast all ten: `for f in algorithms/*.json; do bun run cli/main.ts run "$f" > /dev/null 2>&1 || echo "FAILED: $f"; done` — silence means 10/10.

### P3-2 — Author a new algorithm card

1. Copy the envelope: `cp fixtures/mech-gate.json algorithms/my-card.json` — keep `$schema`, `meta{name,tier}`, `nodes`, `edges`, `vars`.
2. Read the config contract of EVERY kind you will use (`nodes/<kind>.ts`) — never configure from memory. Gate: `asserts:[{path:"$.<via>", op, value}]` with ops eq/ne/ge/le/contains/matches. math-eval: `expr:{_tag:"literal",value:42}` → outputs `{result, value}`.
3. Wire edges with UNIQUE, key-matched `via` names (law P2-1). Add `meta.slots:[{id, kind, instruction:"[WORK SLOT] …"}]` where adopters plug in.
4. Tier discipline: tier 1 = deterministic kinds only; generation goes tier 2 + `bracket.contract` + Llm-bound driver (else ship the pipeline stand-in + slots).
5. Cast until PASS: `bun run cli/main.ts run algorithms/my-card.json` — fix config per the structured error (Part 5), never by loosening a gate.
6. Prove purity: `grep -i '"mode"\|llm' algorithms/my-card.json` → only slot-documentation mentions. Then `bunx tsc --noEmit` (cards are data; tsc proves nothing stray landed).

### P3-3 — Add a node kind (the full recipe)

```bash
cd JESL/jesl
# 1. The impl — nodes/my-kind.ts
#    export const myKindNode: NodeImpl = { kind:"my-kind", family:"deterministic",
#      requiredCaps:[], invoke: (input,ctx) => Effect.gen(function* (){ … }) }
#    Error paths: return {verdict:"FAIL", evidence:{pattern:"my-kind", state, anchor:`${inp.node.id}:${why}`}, outputs:{reason}} — never throw raw, never return undefined.
# 2. The contract — core/registry.ts ALL_KINDS: add { kind:"my-kind", family:"deterministic" }
# 3. The wiring — bottom of nodes/my-kind.ts:
#    replaceStubSync("my-kind", myKindNode)
#    …AND import + re-export in nodes/index.ts (self-registration fires on import).
# 4. Tests — tests/my-kind.test.ts: ≥2 adversarial it.effect (empty config, hostile input, boundary).
# 5. The trio:
grep -rl '@ts-nocheck' --include='*.ts' . | wc -l   # → 0
bunx tsc --noEmit                                   # → exit 0
npx vitest run                                      # → green
# 6. Card proof:
bun run cli/main.ts run algorithms/guard.json       # still PASS — zero regressions
```
The registry is append-only: a second real impl for the same kind throws `RegistryFrozenError` — that is the registry defending the single source (law 2B-3).

### P3-4 — Regenerate the lexicon

```bash
cd JESL/jesl && bun run lexicon.ts
# → "lexicon: 37 kinds, 19 cards -> lexicon.json"
```
Idempotent (re-run → byte-identical output). Scans `core/registry.ts` ALL_KINDS + `fixtures/*.json` + `algorithms/*.json`; a missing directory is skipped loudly (37 kinds still indexed — never crashes). Output shape: `{kinds:[{kind,family,cards[]}], cards:[{name,path,kinds[]}], generatedAt}`. New cards/kinds appear on the next run automatically — the lexicon is derived state, never hand-edited.

### P3-5 — Validate a DomainModule profile

```bash
cd JESL/jesl && bun -e "import {defaultProfile} from './profiles/default.ts'; import {validateDomainModule} from './profiles/shared.ts'; console.log(validateDomainModule(defaultProfile))"
# → []  (zero errors)
```
A DomainModule is `{name, caps: Context.Tag[], kinds: string[], defaultTier: 1|2, brackets: Record<string,{contract,repair:0-2,floor:0-1}>}` (`profiles/shared.ts:12-18`). Validation rules: caps must be KNOWN Tags (Shell/Fs/Http/ToolClient/Subagent/Llm/Journal/ClockTag/EmitCap), kinds non-empty strings, repair 0..2, floor 0..1. `profiles/default.ts` self-throws at import on any error — if `bun -e` prints `[]`, the module loaded clean. Copy `trident.ts` for structure; never hand-roll validation.

### P3-6 — Run the final gate (S-1..S-15)

Run from `JESL/jesl` unless noted. Paste every raw output under its claim (Warhead 13).
```bash
# S-1  no placeholder verdicts (the stub-anchor intent probe):
grep -rn 'TODO:' nodes/ --include='*.ts' | grep -v stubs.ts | grep -v test   # → empty
# S-2  types:
bunx tsc --noEmit; echo $?                                                   # → 0
# S-3  battery:
npx vitest run 2>&1 | grep -E "Test Files|Tests "                            # → 39 / 424
# S-4  tokens (exactly 8):
grep -rhoE '\[JESL [A-Z-]+\]' core/ nodes/ cli/ drivers/ scanners/ workflow/ packager/ wraps/ mpse/ kernels/ profiles/ bindings/ boilerplate/ | sort -u
# S-5/S-6 purity:
grep -rn 'node:fs\|node:path\|node:child_process' core/ | wc -l              # → 0
grep -rn 'Date.now' core/ | wc -l                                            # → 0
# S-7/S-8 manifest (from JESL/specs):
cd ../specs && cat MACRO_KERNEL_BOILERPLATE_L2_SPEC.md <(printf '\0') JESL_LIBRARY_DPL1_SPEC.md <(printf '\0') EFFECT_TS_RUNTIME_BIBLE.md <(printf '\0') JESL_EFFECT_PHASE2_DPL1_SPEC.md | sha256sum
# → f77b448fff1ea3f38524949c09c3b0d89657e5cc90131f990b32d574f8a8ff1c ; cd back
# S-9  stub test coverage: grep -c 'it.effect' tests/{oracle-gate,evidence-nodes,paragon-nodes,pattern-nodes,infra-nodes}.test.ts  # each ≥2
# S-10 cards: for f in algorithms/*.json; do bun run cli/main.ts run "$f" >/dev/null || echo "FAIL $f"; done   # silence = 10/10
# S-11 lexicon: bun run lexicon.ts                                             # → ≥37 kinds
# S-12 profile: bun -e "…validateDomainModule(defaultProfile)…"                # → []
# S-13 boilerplate flat: doubled-dirname scan on the v1.0 tree                 # → 0
# S-14 wc -l tsconfig.json                                                     # → 20
# S-15 grep -rl '@ts-nocheck' --include='*.ts' . | wc -l                       # → 0
# Digest pair (zero-mod proof): find . -name '*.ts' -o -name '*.json' | grep -v node_modules | sort | xargs sha256sum | sha256sum   # run first AND last — equal
```
Verdict rule: any mismatch = FAIL with the full output pasted — never explained away (W4 precedent: 2 literal-vs-intent splits adjudicated in w4.md, not silently passed).

### P3-7 — Re-extract the boilerplate

```bash
cd JESL/jesl
# 1. Ensure the deploy marker exists (setup hashes it):
ls dist/index.js   # one-line re-export of the CLI entry; create if absent
# 2. Tar the tree AT THE ARCHIVE ROOT (the tar-branch contract):
tar --exclude='.cache' --exclude='.turbo' --exclude='*.tsbuildinfo' -czf /tmp/jesl-deploy.tar.gz .
# 3. Extract to the target (the extraction tool or manual mirror):
#    trident-container-test action=setup distPath=/tmp/jesl-deploy.tar.gz
#    — or run boilerplate/extraction.ts extractBoilerplate(srcDir, targetDir, profile, writer)
# 4. Verify the fresh tree AS AN INDEPENDENT PROJECT:
cd <target> && bun install && bunx tsc --noEmit && npx vitest run
# 5. Double-nesting scan (flat layout → the literal find src check is N/A):
find . -type d | grep -E '\(core\|nodes\|cli\)/\1' ; echo "0 expected"
```
Laws: wipe-and-regenerate, never merge (P2-9); verify in-tree; NEVER edit boilerplate copies (fix the kernel, re-extract). Manifest check: `boilerplate-manifest.json` records sourceDir/filesCopied/digest — provenance or it did not happen.

### P3-8 — Container checkpoint (the CT recipe)

The sanctioned instrument: `trident-container-test` (raw docker is firewalled). Proven recipe (CT5):
1. **Plan first** — `.trident/test-plan.md` with OBJECTIVE / TOOLS UNDER TEST / TEST SCENARIOS (each: name, prompt, pass token, fail token) / ADVERSARIAL / EVIDENCE / PASS CRITERIA. The tool's plan parser wants those literal sections.
2. **Image** — the designed `opencode-test:1.14.34` is absent locally; use `runtime-grade-container-sandbox:master` with the TAR-BRANCH deploy: `distPath = /tmp/jesl-deploy.tar.gz` (tree at archive ROOT — `tar czf … .` from inside `jesl/`, NOT `jesl/` prefixed) + `dist/index.js` marker present (else `sha_mismatch`, container hash empty).
3. **CWD** — the tree lands at the container's default workdir (`/root/OPENCODE_WORKSPACE`), NOT `/app`.
4. **Exit codes** — capture WITHOUT pipes: `bun run cli/main.ts run X > out 2>&1; echo EXIT:$?` (`cmd | head` returns head's code — S3's first run false-failed exactly here).
5. **Run scenarios via action=exec**, record passToken/failToken per scenario into `.trident/container-test-results.json` (append a checkpoint block — CT1..CT5 precedent), THEN declare.
Known environment adjudications (CT5): sqlite prebuilds need GLIBC_2.33 (older containers ⇒ DB_OPEN_FAIL — the kernel's DESIGNED loud-fail; fresh `bun install` in the target env compiles cleanly); lsp-gate real-LSP test needs >5s on slow FS. Environment ≠ regression: adjudicate two-sided, record as BLOCKED rows, never silent PASSes.

### P3-9 — Wire the Llm capability (the operator plug-in point)

The kernel ships the SEAT, not the model. To bind one:
1. Write a driver Layer in `drivers/` (clone `cli-live.ts`'s shape): `const LlmLive = Layer.succeed(Llm, { …your provider calls… })` — the `Llm` Tag's interface lives in `core/caps.ts`.
2. Merge it: `Layer.mergeAll(ShellLiveReal, FsLiveReal, HttpLiveReal, JournalLive, HashCapLiveReal, LlmLive)` → your `MyDriverLive`.
3. Point a CLI flag / host binding at your driver (`--driver` currently accepts cli|test — extend `args.ts` + `handlers.ts boundCapsFor` to know your driver's bound set, e.g. `["Shell","Fs","Http","Llm"]`).
4. Cast: `{"type":"prompt","tier":2 card,"bracket":{"contract":"json"}}` now passes the cap pre-check; `checkContractViolation` (nodes/prompt.ts:69-84) enforces the bracket against the model's output — json shape or named contract.
5. The Aether backend (§6G) is the operator's own model-routing machinery — `examples/wire-into-tool.md` is its consumer contract. The kernel neither knows nor cares which backend sits behind the Tag.
NEVER: keys in cards, provider URLs in shipped configs, `@effect/ai` imports, or a default LlmLive. The seat stays empty until the operator sits in it.

### P3-10 — Run a skill rocket (the 6-stage kernel chain)

The chain (`jesl/kernels/`): **idea-to-bible → bible-to-spec → spec-to-kernels → kernels-to-code → verify → ship**. Each stage = `workflow.json` (a castable card) + `activities.ts` (its nodes, registry-wired) + `fixtures/` (positive/negative examples) + `SKILL.md` (the operator card).
```bash
cd JESL/jesl
bun run cli/main.ts run kernels/idea-to-bible/workflow.json --in <idea vars>   # stage 1
# …each stage consumes the prior stage's artifact fixture-style; --in carries the artifact
```
Rules: run stages IN ORDER (the `born-off-spec` negative fixture exists because a spec born without a bible is the anti-pattern the battery catches); each stage's activities are ordinary kernel nodes (laws 2A-2H apply verbatim); generation stages are Llm-ready BY CONTRACT (brackets declared) and model-free BY SHIPMENT (law 2I). Keep each stage's SKILL.md in sync with its workflow — stale skill cards are doc drift.
The rocket's evidence discipline: verify consumes journal chains (`verifyChain`) — a stage's output artifact is only as trustworthy as the journal that produced it.

### P3-11 — Embed the kernel into an agent host (Aether machinery)

Two legal host shapes:
**A. Driver embedding (the kernel inside your process):** implement your host's bindings as a Layer (P3-9), import the kernel's handler program, run cards through `runDoc` in-process. The purity law (2E) guarantees the kernel touches your world ONLY through the Tags you bind. `drivers/session-live.ts` + `hook-bridge.ts` are the worked examples for session-scoped and hook-driven hosts.
**B. Backend embedding (agents behind the Llm seat):** the Aether machinery (§6G) — the aether_agent_backend's runner/sidecar model with the key-pool + slot-injector + brief-builder chain; its consumer contract is `examples/wire-into-tool.md`. A JESL generation node's Llm Tag can be bound to an aether-runner call: the bracket contract (`nodes/prompt.ts:69-84`) validates whatever the agent returns.
Embedding laws: the kernel never calls outward except through Tags (2E); the host never reaches INTO core/ (boundaries are Layers); both sides fail loud (2H) — an embedded kernel that swallows errors is a liability inside someone else's process.
(Full machinery map: §6G — synthesized from the Aether embedded-agent bibles, this volume's §6G/2M.)

### P3-12 — Sync the git repo

```bash
REPO=/tmp/jesl-repo
KERNEL="/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Active_Projects/JESL/jesl"
BP="/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/JESL-Kernel-Edition-v1.0"
cd $REPO
rsync -a --delete --exclude node_modules --exclude '.cache' --exclude '*.tsbuildinfo' "$KERNEL/" kernel/
rsync -a --delete --exclude node_modules --exclude '.cache' --exclude 'bun.lock' "$BP/" boilerplate/
git add -A && git commit -m "…" && git push origin main
```
Discipline: sync only VERIFIED states (post-gate); the commit message names the wave/gate; evidence (audits, container results) lands in `evidence/overhaul/`. The repo is public — no tokens, no keys, no absolute home paths beyond the workspace root.

---

<!-- ═══════════════ PART 10: THE BUILD HISTORY (the lessons ledger) ═══════════════ -->


## PART 4B — TESTING ANATOMY (what the 39 files prove, and how)

### 4B.1 — The philosophy

Every test is ADVERSARIAL by mandate: a test that cannot fail is meaningless; the happy path alone is theater. The battery's shape: 39 files, 424 `it.effect` units, ~15s, all running on `TestClock`/injected caps so nothing waits on wall time and nothing touches the real world. The suite is the regression wall — the CT container checkpoints are the runtime wall — neither substitutes for the other (the mock-split lesson: the battery stayed green through the live-path lie; only the casts + container caught it).

### 4B.2 — The file map (what proves what)

| cluster | files | proves |
|---|---|---|
| core contracts | schema, graph, executor, journal, registry, caps, channels, bus, errors, evidence | decode/refusals, cycle detection, batching+concurrency, sha-chain+tamper, append-only+replace rules, cap pre-check, event wake, the 8 tokens, the epistemics machine |
| nodes (original 17) | nodes.test, execution, driver, prompt, mpse-parser, mpse-oracle, mpse-demo | per-kind config contracts + adversarial config rejection |
| Wave-1 kinds | oracle-gate, evidence-nodes, paragon-nodes, pattern-nodes, infra-nodes | the 20 implemented kinds: discharge rules, evidence ingest, ratio/synapse/intent/escalation, breaker/cron/reactivate/lock/layer, sqlite/machine/workflow/replay |
| CLI surface | cli.test | run/validate/lexicon dispatch, exit-code mapping, the byte-exact refusal tokens (TIER-VIOLATION, UNBRACKETED-GENERATION, CAP-UNBOUND), vars seeding, replay+verify |
| battery | battery.test (+battery.ts harness) | the 8 end-to-end scenarios: determinism (S4), kill-resume (t4), overlap/concurrency (S5), replay-zero (t5), summary counts (t8) — the timing-sensitive suite |
| kernels | idea-to-bible, bible-to-spec, spec-to-kernels, kernels-to-code, verify-kernel, ship | each rocket stage casts + its negative fixture refuses |
| scanners/wraps | scanners-pba-pta, scanners-lsp-audit, lsp-gate, wraps | the audit machinery: banks fire, LSP diagnostics map to families, the artifact-gate DENIES violating writes |
| profiles/packager/boilerplate/bindings/workflow/driver | the rest | profile validation, packaging, extraction round-trip, host bindings, jesl-run rebuild |

### 4B.3 — The adversarial patterns used (steal these)

- **the bad-fixture set** (`bad-cycle`, `bad-tier`, `bad-unbracketed`, `bad-unknown-kind`): every refusal token has a fixture that provokes it, and the test asserts the token BYTE-EXACT + the exit code.
- **the timing trap**: concurrency tests use handlers with REAL `Clock.currentTimeMillis` spans + `Ref` counters, so overlap (`overlapCount ≥ 1`) and kill/resume are actually exercised — an instant handler passes nothing (P2-4).
- **the corruption probe**: t5 truncates/mutates a journal row and asserts `verified:false` + exit 1 — the tamper-evidence is tested, not assumed.
- **the empty/absent family**: empty configs, missing runIds, absent files, unbound caps — every node's worst case gets a row.
- **the wrong-driver cast**: prompt under the CLI driver asserts CAP-UNBOUND (the pre-check, not a crash).

### 4B.4 — Writing a new test (the house rules)

1. `it.effect` + injected caps/Layers; `TestClock` for time; NEVER wall-clock sleeps (the `Effect.promise(setTimeout)` escape exists for genuine async boundaries only).
2. ≥2 units per kind: one canonical PASS + one adversarial (empty/hostile/boundary). Mutation-check: name the change that would make your test fail — if none, the test is decoration.
3. Assert against NodeResult fields (verdict/evidence.pattern/outputs) — never against prose.
4. The trio after any test surgery: nocheck 0 · tsc 0 · full battery green (law 2F-4).

---

<!-- ═══════════════ PART 4C: THE DRIVER + HOST MATRIX ═══════════════ -->


## PART 4C — THE DRIVER + HOST MATRIX (who binds what, where)

| driver | binds | hosts | use |
|---|---|---|---|
| `cli` (cli-live.ts) | Shell, Fs, Http, Journal, HashCap | the terminal | every card cast, the gates, the adopter default |
| `test` (TestDriver) | Shell, Fs, Http (fakes), TestClock | vitest | the 424-unit battery; deterministic time |
| `opencode` (opencode-live.ts) | kernel caps ← OpenCode tool surfaces | the OpenCode runtime | JESL cards driving agent tooling |
| `hook-bridge` | bus events ↔ host hooks | any hook emitter | artifact-gate enforcement in a live host (write events → deny) |
| `session-live` | session-scoped caps + journal | long-lived agent sessions | pause/resume + durable asks across process life |
| YOUR driver (P3-9) | + Llm (+ oracle:read, + anything) | your process | the Tier-2 unlock — the model seat, the oracle registry |

The binding rule (2E): a driver binds what it can HONOR; the executor refuses the rest. Adding a driver never touches core/ — Layers compose at the edge. The host-embedding law (P3-11): the kernel reaches out ONLY through Tags; the host reaches in ONLY through Layers; both fail loud.

### 4C.1 — The plugin seam (how JESL enters a bigger system)

```
YOUR AGENT/HOST (opencode plugin, CLI, server)
   │  imports jesl (kernel/ as a library — pure ESM, Effect-TS)
   ▼
runDoc(cardJson, {driver: YourDriverLive, vars})
   │                              ▲
   │ the kernel runs the graph    │ you bind: Shell? Fs? Http? Llm(Aether)?
   ▼                              │
journal + verdict ◄───────────────┘
   │
   ▼ your host consumes: PASS/FAIL + evidence rows + the replay chain
```
The kernel asks for nothing global: no env (except via your Shell/caps), no cwd assumptions, no network unless Http is bound and a card uses it. The adopter surface is exactly `runDoc` + the registry contract.

---

<!-- ═══════════════ PART 4D: CARD AUTHORING DEEP GUIDE ═══════════════ -->


## PART 4D — CARD AUTHORING DEEP GUIDE (beyond the basics)

### 4D.1 — The composition patterns (the six chains, expanded)

**guard → work → prove** (the default): a free `gate` accepts the seed (NO-SEED protection), the work slot does the domain work, a `triplet-writer` proves it. Everything downstream asserts against the triplet. This is mech-gate/guard.json's shape — when in doubt, start here.

**try → fail → recover**: `retry-chain(maxRetries, failTimes)` wraps the volatile work; `fallback-chain` holds the ordered alternatives. The evidence states (`RETRIED`, `FALLBACK`) tell the AUDIT which path fired — read them, never assume.

**fan-out → join**: `parallel(items)` fans; the join `gate` asserts `$.count ge N` (or per-item asserts on `$.results[i]`). Fan without a join = unproven work; the count assert is the minimum honest join.

**hold → resume**: `pause` = the durable checkpoint (Workflow.make mandatory — §2D.3); the ask-launcher flavor suspends for a human/model answer that completes a Deferred across process death. Design the resume channel BEFORE the pause — the resumed run continues from the journal, not from memory.

**compute → discharge**: `math-eval` computes; `oracle-discharge` verifies against the oracle registry (cap `oracle:read`); the deterministic miniature is math-eval → gate-assert. The discharge carries `{ruleId, expected, actual, status}` — the MPSE receipt.

**generate → verify**: tier-2 only. `prompt(bracket.contract)` → a schema-gate on the bracketed output → a bounded `repair ≤ 2` loop → a final gate. Never an unverified generation; never an unbracketed one.

### 4D.2 — The authoring checklist (print this)

1. Envelope exact: `$schema`, `meta{name,tier,slots?}`, `nodes`, `edges`, `vars`.
2. Every node id unique; every edge's from/to resolves; every via unique per edge.
3. Every via = an upstream output key you READ (the channel rule).
4. Every gate assert's path walks from a REAL channel: `$.<via>.<key>…`.
5. Tier 1: zero generation kinds. Tier 2: bracket on every generation node + a driver that binds Llm.
6. Caps honest: execution kinds only where the driver binds Shell/Fs/Http.
7. A journal-sink (or the executor's automatic rows) — unjournaled runs are rumors.
8. `meta.slots` documents every stand-in with the exact real swap.
9. Cast it: PASS exit 0, or fix per the structured error. Never weaken a gate to pass.
10. `bunx tsc --noEmit` (nothing stray landed) — then the card is done.

### 4D.3 — The anti-patterns at authoring time

- **the kitchen-sink card**: 30 nodes doing five jobs — split it; a card is one spell.
- **the orphan gate**: a gate with no inbound (NO-SEED) or no outbound (a dead end) — every node earns its edge.
- **the silent fan**: parallel without a join gate — hope is not a verdict.
- **the premature tier-2**: an LLM node where a math-eval would do (law 1I — mis-tier).
- **the config-from-memory**: configuring a kind without reading its file — the #1 cast-fail source.

---

<!-- ═══════════════ PART 2D-EXT: THE GRAMMAR DEEP (v1.2 canon + current deltas) ═══════════════ -->


## PART 4E — OPERATOR PROCEDURES (install, daily, recovery)

### 4E.1 — Install (fresh machine)

```bash
git clone https://github.com/leviathan-devops/jesl && cd jesl/kernel
bun install                    # 93 packages, ~3s (sqlite compiles/downloads per env)
bunx tsc --noEmit              # → 0
npx vitest run                 # → 424/424
bun run cli/main.ts run algorithms/guard.json   # → PASS / exit 0
```
If sqlite fails on an exotic platform: `npm rebuild better-sqlite3` (+ remove incompatible `prebuilds/`); that is an ENVIRONMENT fix, never a kernel edit.

### 4E.2 — The daily loop (authoring)

1. Pick the closest algorithm card; copy it to a scratch name.
2. Read the config contract of every kind you touch.
3. Edit; cast; read the structured output; iterate.
4. Gate everything that matters; journal at the end.
5. On green: move to `algorithms/`, run the full cast sweep, `bunx tsc --noEmit`.

### 4E.3 — Recovery (when a run goes wrong)

- **Refusal (exit 2):** read `node/field/actual/remedy` on the error line → Part 5 row → fix the card or bind the cap. Zero rows were written; nothing to clean.
- **FAIL (exit 1):** find the failing node's `outputs.reason` + `evidence.anchor` in the run document; the journal has the INVOKE row — the input that produced the failure is on record. Fix the card; re-cast (a NEW run — the old journal stands as history).
- **HANG:** kill the process; the journal has the INVOKE without a VERDICT — that node is your suspect; its handler likely broke a timing contract (P2-4).
- **Tamper suspicion:** `verifyChain` on the journal (the verify kernel does this) — `verified:false` names the row index; the chain does not lie.

### 4E.4 — The operator's cadence (after any change)

```bash
bunx tsc --noEmit && npx vitest run            # the standing pair
for f in algorithms/*.json; do bun run cli/main.ts run "$f" >/dev/null || echo "FAIL $f"; done
bun run lexicon.ts
# then: extraction refresh (P3-7) if the kernel changed · git sync (P3-12) if verified
```

---

<!-- ═══════════════ PART 2I: THE STATE-MACHINE CANON (LASME/TEB) + THE PROFILES GUIDE ═══════════════ -->


---

<!-- ═══════════════ PART 6AB: THE GATES FAMILY COMPARED ═══════════════ -->

## PART 6AB — THE GATES FAMILY COMPARED (which gate when)

| gate | decides from | use when | refuses with |
|---|---|---|---|
| gate | channel values (asserts) | structural assertions on dataflow | CHANNEL-UNSET / FAIL verdict |
| oracle-gate | pre-registered MPSE rules | number-vs-expectation checks | ORACLE-MISSING |
| claim-gate | the evidence machine | epistemic adjudication (proof-of-work) | FAIL UNEVIDENCED |
| evidence-gate | upstream adjudications | require a specific verdict upstream | FAIL on non-EVIDENCED |

Decision procedure: data shape ⇒ gate; pre-registered numbers ⇒ oracle-gate; proof-of-work ⇒ claim-gate; verdict-requirement ⇒ evidence-gate. Two gates in sequence (the bracket) is the generation pattern; a gate before dispatch is the delegation pattern.

### THE PACKAGER EMITTERS (packager/)

- tool.ts — emits a TOOL package: card + manifest as a callable tool (the agent-facing shape).
- chain.ts — emits a CHAIN package: multi-card pipelines as one distributable unit.
- skill.ts (emitSkill) — emits the SKILL ROCKET: SKILL.md (fuse + launch line), payload/workflow.json (byte-preserved), ctx.json, mission.md, anti-patterns.json. Deterministic: same doc + profile ⇒ byte-identical package (manifest digest). Non-regenerable = provenance violation.

---

<!-- ═══════════════ PART 6AC: THE STACKING + COMPOSITION ALGEBRA ═══════════════ -->

## PART 6AC — THE STACKING + COMPOSITION ALGEBRA

The lore's measured ladder (alternating prepare casts: 1→4→16→49→144→400→1089 damage) is the CANON WARNING: amplification is multiplicative over everything AFTER the amplifier — exponential ladders are one lazy loop away. Operational rules:

1. distinct runIds stack; same docHash+seed replays (covers) — never accumulates.
2. amplifier-before-amplified, enforced by the edge order (the dataflow IS the order — P4-6).
3. same-identity recasts REPLACE (a new runId = a new chain; the old chain stands as history).
4. budget loops (Fortify > cost, recast in-window) are legal but VISIBLE in the journal — conserved-and-relocated cost (P4-10).

When nesting cards, re-derive order from channels — the dataflow graph is the only order that exists.

---

---

<!-- ═══════════════ PART 6AO: HOW TO READ THIS BIBLE (by role) ═══════════════ -->

## PART 6AO — HOW TO READ THIS BIBLE (by role)

**THE ADOPTER** (cast cards, author cards): PART 1 → PART 2G → PART 3 (P2-1, P2-2) → PART 4 (P3-1, P3-2) → PART 6E + 6A.1 → PART 8. One session, casting by the end.

**THE KERNEL ENGINEER** (touch core/ or nodes/): PART 2 (every law) → PART 2B (module deep) → PART 2D-EXT (grammar) → PART 3 (every pair) → PART 5 (every row is a law's failure mode) → PART 10 (every lesson was paid for).

**THE ROCKET OPERATOR**: PART 2O + 6F + 6F-EXT-3 → PART 4 P3-10 → 6M (the TDM map) → 2D.3 (durability).

**THE INTEGRATOR** (embed in a host): PART 2M + 6G entire → PART 4 P3-9/P3-11 → 6G-EXT (backend interfaces) → the Aether depth sources.

**THE AUDITOR**: PART 6L-EXT (receipts) → PART 4 P3-6 (gate commands) → the wave audits + CT results on disk. Trust the receipts; re-run the commands.

**EVERYONE, ALWAYS**: PART 2 is the law. A procedure violating a law is wrong even when it works. When this bible and the code disagree, THE CODE WINS — flag the conflict, fix the bible.

### The reading ledger (what each role must absorb before acting)

| role | must absorb | must be able to |
|---|---|---|
| adopter | 2G, P2-1/P2-2, 6E | cast + author cards unaided |
| engineer | all of Part 2 + 2B + Part 3 | add kinds with zero regressions |
| operator | 2O + 6F + Part 4 | run the chain + recover from Part 5 |
| integrator | 2M + 6G | bind a driver + close the loop |
| auditor | 6L-EXT + P3-6 | re-run every gate from the receipts |

---

<!-- ═══════════════ PART 5: TROUBLESHOOTING MATRIX ═══════════════ -->

## PART 5 — TROUBLESHOOTING MATRIX

| # | ERROR / SYMPTOM | CAUSE (mechanism) | FIX |
|---|---|---|---|
| 1 | Tests green; a kind returns `evidence.pattern: "<kind>.stub"` in a real cast | handler-side kind map forked the registry (the mock-split) | resolve via `getRegisteredImplSync` only; delete the map (law 2B) |
| 2 | `[JESL UNKNOWN-NODE]` for a kind you implemented | node file exists but is never imported/registered | wire in `nodes/index.ts` or self-register at module bottom (2B-3) |
| 3 | Card FAILs with `expected FAIL to be PASS` on claim-gate | bare claim, no fresh source_change | add `preSource` with filePath (P2-7) |
| 4 | `INCONCLUSIVE / EMPTY` from replay-source | no journal rows for that runId | real runId from a prior cast; empty is honest — do not fake PASS (P2-6) |
| 5 | `[JESL CAP-UNBOUND] actual=oracle:read` (or llm) | node's requiredCaps ⊄ driver's bound set | bind the cap in a driver, or ship the deterministic stand-in + slots (P2-8) |
| 6 | `[JESL TIER-VIOLATION]` | generation kind in a tier-1 doc | promote doc to tier 2 + bracket, or de-scope (P2-2) |
| 7 | `[JESL UNBRACKETED-GENERATION]` | tier-2 prompt without `bracket.contract` | add bracket `{contract:"json"\|…}` |
| 8 | `[JESL CHANNEL-UNSET] field=$.x actual=undefined` | assert path ≠ any edge via name / upstream output key | rename via to the output key (P2-1) |
| 9 | `[JESL CYCLE]` | edges form a cycle | break with a gate or re-arm via event-reactivate (the remedy line says it) |
| 10 | `RegistryFrozenError: append-only violation` | second real impl for a known kind | one impl per kind; wire, don't re-register (2B-3) |
| 11 | `bun test` → `ctx?.onTestFinished is not a function` | bun:test lacks @effect/vitest's API | `npx vitest run` (law 2F) |
| 12 | vitest hangs forever, silent stream | test handlers converted to instant Effect.succeed — kill-resume has nothing to kill | restore Effect.gen + Ref.update + Clock timings (P2-4) |
| 13 | `Transform failed` from vitest after an edit | global string-replace corrupted syntax (catch-IIFE ambiguity) | restore last-good; anchored edits only (P2-5) |
| 14 | `TS1355: const assertions can only be applied to…` (on `PASS_TOK as const`) | const-assertion on a non-literal (`String.fromCharCode`) | `as "PASS"` literal type instead |
| 15 | `TS2488: 'never' must have [Symbol.iterator]` in tests | `Effect.provide(any).pipe` overload collapse | inner-position cast: `Effect.provide(x as any)` |
| 16 | `TS2322: Effect<void,unknown,unknown> ≠ Effect<…,TestServices>` | it.effect R-channel variance | `it: any` alias (house standard) |
| 17 | battery t1/t8 fail only OUTSIDE the host layout | `ROOT=../..` + `ROOT/jesl/fixtures` workspace hardcode | `JESL_ROOT = Path.resolve(__dirname, "..")` (P2-12) |
| 18 | `sqlite: GLIBC_2.33 not found` / DB_OPEN_FAIL in a container | better-sqlite3 prebuilds target newer glibc | fresh `bun install` in the target env (compiles for it); env-limited otherwise — adjudicate BLOCKED, never fake PASS |
| 19 | `sha_mismatch` + empty container hash on deploy | `dist/index.js` marker absent | create the marker (one-line re-export), re-tar |
| 20 | container `ls dist/` → No such file | tarball has `jesl/` prefix instead of tree-at-root | `tar czf … .` from INSIDE jesl/ |
| 21 | container scenario reports EXIT:0 on a refusal | exit captured through a pipe (`cmd \| head`) | `cmd > f 2>&1; echo EXIT:$?` unpiped |
| 22 | exec `cd /app` → No such file | wrong container workdir assumption | the deploy root is the image's default workdir (`/root/OPENCODE_WORKSPACE` in CT5) |
| 23 | boilerplate stale / double-nested `src/x/x/` | hand-assembled tree or stale extraction coverage | fix `DIRS_TO_COPY`/`ROOT_FILES_TO_COPY`, wipe + regenerate (P2-9) |
| 24 | `sha256sum` of spec files drifts | someone edited a READ-ONLY spec | restore from git history — the manifest must return to `f77b448f…` |
| 25 | lexicon.json missing kinds | regenerated before the new kind/card landed, or dir renamed | re-run `bun run lexicon.ts` after the tree settles |
| 26 | `ERR_IPC_CHANNEL_CLOSED` from vitest workers in a container | native module segfaults the worker (env ABI) | adjudicate environment-BLOCKED; run that suite on a compatible host |
| 27 | two agents' edits fight over one file; syntax ping-pong | concurrent writers (no disjoint ownership) | pause one (session.abort), owner finishes, resume with scope-lock (P2-10) |
| 28 | a fresh test file fails tsc but has no @ts-nocheck | wildcard include surfaced a never-checked file | fix its types (it was invisible before); do NOT exclude it (P2-11) |
| 29 | `[JESL NO-SEED]` | headless start: no inbound event edge to the first node | add a seed gate/edge, or start from an event trigger |
| 30 | `[JESL ORACLE-MISSING]` | oracle-discharge config lacks the rule the oracle registry expects | supply `{ruleId, expected}` per nodes/oracle-discharge.ts contract |

---

<!-- ═══════════════ PART 6: QUICK REFERENCE ═══════════════ -->


## PART 6 — QUICK REFERENCE

### 6A — The 37-kind taxonomy

**Deterministic (18)** — pure orchestration/state: `event-filter` `capture-engine` `machine` `gate` `oracle-gate` `circuit-breaker` `state-machine` `journal-sink` `triplet-writer` `sqlite-sink` `replay-source` `pipeline` `parallel` `retry-chain` `fallback-chain` `pause` `cron-trigger` `event-reactivate`
**Decision (12)** — judgment/policy: `ratio-classifier` `synapse` `intent-classifier` `escalation-memory` `evidence-gate` `layer-loader` `math-eval` `oracle-discharge` `claim-gate` `config-lock` `workflow-machine` `mpse-discharge`
**Evidence (2)** — `evidence-machine` `audit-registry`
**Execution (4)** — `shell-exec` `python-exec` `http-request` `file-io`
**Generation (1)** — `prompt` (tier 2 · bracket · Llm cap — the operator's seat)
Families live at `core/registry.ts:34-72`; config contracts in `nodes/<kind>.ts`.

#### 6A.1 — Config contracts of the load-bearing kinds (measured from source)

| kind | config (exact shape) | outputs | evidence pattern |
|---|---|---|---|
| gate | `{asserts:[{path:"$.<via>…", op:eq|ne|ge|le|contains|matches, value}]}` | `{}` | `gate.assert` |
| math-eval | `{expr:{_tag:"literal",value:N}}` | `{result, value}` | `math-eval` (EVALLED) |
| triplet-writer | `{triplet:{pattern,state,anchor}}` | `{triplet}` | the triplet itself |
| parallel | `{items:[…]}` (N branches) | `{count, results[]}` | `parallel` |
| retry-chain | `{maxRetries:N, failTimes:N}` | per-attempt trail | `retry-chain` (RETRIED) |
| fallback-chain | fallback ordering config | the winning branch | `fallback-chain` (FALLBACK) |
| pipeline | `{}` pass-through (also the WORK-SLOT stand-in) | inbound | `pipeline` |
| journal-sink | none — commit point | — | `journal-sink` |
| replay-source | `{runId:"wf-…"}` (or inbound runId) | `{runId, rows, summary, verdict, count}` | `replay-source` (EMPTY⇒INCONCLUSIVE) |
| claim-gate | `{subject, preSource?:{filePath,payload}, sourceEvents?:[]}` | `{adjudication, verdict, claim}` | `claim-gate` (EVIDENCED/FAIL) |
| oracle-discharge | `{ruleId, expected}` + cap `oracle:read` | discharge record | `oracle-discharge.discharge` |
| file-io | `{op:"write"\|"read", path, body?}` | written/read echo | `file-io.write` |
| http-request | url/method/etc (Http cap) | response | `http-request` |
| shell-exec | command (Shell cap, timeout) | stdout/stderr/exit | `shell-exec` |
| prompt | `{mode:"llm"\|"ask-launcher", template?, bracket:{contract}}` + Llm cap | model output | bracket-validated |
| sqlite-sink | db op config (native dep) | query/write results | `sqlite-sink` |
| circuit-breaker / state-machine / machine | transition tables + thresholds | state trails | per-machine |
| cron-trigger / event-reactivate | schedule / re-arm specs | trigger records | per-node |
| ratio-classifier / escalation-memory | ratio thresholds / memory config | classification / memory trail | `ratio-classifier.suppress`, `escalation-memory.track` |
| evidence-machine / audit-registry | evidence ingest / audit fields | verdict records / audit rows | `evidence-machine`, `audit-registry` |

Read the file before configuring — this table is the map, the source is the territory.

### 6B — The 8 frozen tokens

| token | producer | exits |
|---|---|---|
| `[JESL UNKNOWN-NODE]` | registry miss in buildNodeHandles | 2 |
| `[JESL CYCLE]` | graph compilation | 2 |
| `[JESL TIER-VIOLATION]` | generation kind in tier-1 doc | 2 |
| `[JESL UNBRACKETED-GENERATION]` | tier-2 gen without bracket.contract | 2 |
| `[JESL CAP-UNBOUND]` | executor cap pre-check | 2 |
| `[JESL ORACLE-MISSING]` | oracle rule absent | 2 |
| `[JESL CHANNEL-UNSET]` | assert on unwritten channel | 2 |
| `[JESL NO-SEED]` | headless start, no inbound | 2 |
Defined once: `core/errors.ts:85-94`. Gate: S-4 sorted-unique = exactly these 8.

### 6C — The card JSON contract

```json
{
  "$schema": "trident-workflow-v1",
  "meta": { "name": "string", "tier": 1,
            "slots": [{ "id": "work-slot", "kind": "pipeline",
                        "instruction": "[WORK SLOT] …" }] },
  "nodes": [
    { "id": "gateA", "type": "gate",
      "config": { "asserts": [{ "path": "$.triplet.state", "op": "eq", "value": "PASS" }] } }
  ],
  "edges": [ { "from": "gateA", "to": "triplet", "via": "triplet" } ],
  "vars": {}
}
```
Node optional fields (core/schema.ts:7-34): `class` (event|decision|generation|orchestration|evidence|execution), `on:{event,filter?}`, `retries:{maxRetries,class:exile|retry|fall}`, `timeoutMs`, `bracket:{contract,repair?,confidenceFloor?}`, `oracle`. Channel rule: `inbound[via] = upstreamOut[via]`. Excess keys ignored by decode (carries `meta.slots`).

### 6D — NodeImpl / NodeResult / DomainModule interfaces

```ts
// core/registry.ts
interface NodeImpl {
  kind: string; family: NodeFamily;
  requiredCaps: ReadonlyArray<string>;
  invoke: (input: NodeInput, ctx: unknown) => Effect.Effect<NodeResult, …>;
}
// nodes/shared.ts
interface NodeResult {
  verdict: "PASS" | "FAIL" | "INCONCLUSIVE";
  evidence: { pattern: string; state: string; anchor: string };
  timing: { startMs: number; endMs: number };
  outputs?: Record<string, unknown>;
  error?: unknown;
}
// profiles/shared.ts:12-18
interface DomainModule {
  name: string;
  caps: ReadonlyArray<Context.Tag<any, any>>;   // KNOWN_TAGS only
  kinds: ReadonlyArray<string>;
  defaultTier: 1 | 2;
  brackets: Readonly<Record<string, { contract: string; repair: number; floor: number }>>;
}
```
Registry API: `ALL_KINDS` (:34) · `replaceStubSync(kind, impl)` (append-only) · `replaceStub` (Effect) · `makeRegistry` (Ref-backed service: register/replaceStub/get/isKnownKind/kinds) · `getRegisteredImplSync(kind)` (the CLI's one lookup). Journal row: `{run, ts, kind, payload, prev, self}` — `self = sha256(prev + canonical(payload))`, `ts` excluded.

### 6E — The 10 algorithm cards

| card | chain | slot / note |
|---|---|---|
| guard.json | gate → work-slot(pipeline) → triplet-writer → journal-sink | the adopter's domain node |
| retry.json | retry-chain → fallback-chain → journal-sink | retry/fallback configs |
| fan.json | parallel → gate(`$.count ge 3`) → journal-sink | the parallel items |
| oracle.json | math-eval → gate(`$.result eq 42`) → journal-sink | expr + expected; slot: oracle-discharge under an oracle:read driver |
| bracket.json | gate → pipeline → claim-gate(preSource) → journal-sink | slot: tier-2 prompt + bracket.contract |
| ask.json | gate → pipeline(ask-launcher) → journal-sink | slot: the durable ask template |
| chain.json | gate → work-slot(pipeline) → journal-sink | slot: replay-source `config.runId` |
| pre-arm.json | ratio-classifier → escalation-memory → gate → journal-sink | ratio/memory configs |
| verify.json | parallel(scenarios) → gate(passToken) → journal-sink | the scenario items |
| ship.json | gate → pipeline → file-io → audit-registry → journal-sink | write path + audit fields |
---

<!-- ═══════════════ PART 8: ADOPTION GUIDE ═══════════════ -->


## PART 6B-EXT — KIND DOSSIERS (all 37, the engineering notes)

### DETERMINISTIC FAMILY

**event-filter** — the reactive entry: `{on:{event, filter?}}`; subscribes on the bus, writes its channel when the event matches. Invariant: the filter is a detector (1A) — never a decision. Unmatched events pass silently BY DESIGN.
**capture-engine** — in-memory session capture; ephemeral (scoped fiber fine — §2D.3). Captures host event streams into channels for reactive cards.
**machine** — generic transition table (`states/transitions`); emits state trails. The adversarial test proves a failed transition maps to a FAIL verdict, not a crash.
**gate** — the assert workhorse (6A.1). THE most-cast node; CHANNEL-UNSET lives here. Ops: eq/ne/ge/le/contains/matches; paths walk `$.channel.key…`.
**oracle-gate** — gate + MPSE rule-cards: calibrates runtime values against pre-registered rules; `[JESL ORACLE-MISSING]` when the rule set lacks the referenced rule. Doctrine: numbers over prose (1H).
**circuit-breaker** — Ref-held open/closed with thresholds; stops cascade re-invocation; `_resetCircuit` for tests. Module-level persistence across nodes in a run.
**state-machine** — typed transition tables (the LASME canon compiled); fail-state INCONCLUSIVE, never PASS (1D-3).
**journal-sink** — the commit point; no config. The card-visible end of the journal law.
**triplet-writer** — `{pattern, state, anchor}` evidence atoms — the smallest provable claim.
**sqlite-sink** — better-sqlite3 persistence (`_dbCache` by path). Environment-sensitive (glibc, Part 5 row 18). `DB_OPEN_FAIL` = designed loud fail.
**replay-source** — the honest time machine (P2-6). EMPTY ⇒ INCONCLUSIVE — correct, not broken.
**pipeline** — ordered pass-through; THE work-slot stand-in. First-node READY_FALSE without inbound (the ask.json lesson).
**parallel** — fan-out `{items}` → `{count, results}`; join via a gate on count.
**retry-chain** — bounded retry; `RETRIED` evidence.
**fallback-chain** — ordered alternatives; `FALLBACK` evidence.
**pause** — the durable checkpoint (Workflow-mandatory, §2D.3).
**cron-trigger** — Schedule-driven wake; time-based re-entry without cycle edges.
**event-reactivate** — re-arms a completed node on an event; the cycle-free loop.

### DECISION FAMILY

**ratio-classifier** — threshold classification with a SUPPRESS path (`ratio-classifier.suppress`); pre-arm's first stage.
**synapse** — decay-based signal combining (the `seq` decay).
**intent-classifier** — routes by classified intent; a deterministic table, not a model.
**escalation-memory** — cross-node escalation memory (`track`).
**evidence-gate** — gates on evidence-machine verdicts (EVIDENCED required).
**layer-loader** — dynamic Layer loading; the extension seam.
**math-eval** — the AST evaluator (`_tag` expressions) → `{result, value}`.
**oracle-discharge** — oracle-registry verification (`{ruleId, expected}`, cap `oracle:read`); `MISSING_CONFIG` loud-fail on empty config.
**claim-gate** — the epistemic gate (P2-7): claims need pre-armed fresh source_change.
**config-lock** — locks validated config (`_configLockStore`); post-lock mutation = FAIL.
**workflow-machine** — sub-workflow orchestration (`:sub:` anchors, depth-tracked).
**mpse-discharge** — the MPSE verdict discharger; consumes rule-card calibrations.

### EVIDENCE FAMILY

**evidence-machine** — the shared epistemics service as a node (ingest/query per 2B.6).
**audit-registry** — registers audit rows; the ship stage's proof.

### EXECUTION FAMILY (cap-bound — the only world-touching kinds)

**shell-exec** — command + timeoutMs (Shell; the driver owns timeout control).
**python-exec** — python scripts; same loud-fail surface.
**http-request** — Http cap; fetch-based; the ONLY network door when bound.
**file-io** — `op: read|write` + path (Fs); `file-io.write` evidence.

### GENERATION FAMILY

**prompt** — THE one generation kind. Tier 2 only. `bracket.contract` mandatory (enforced post-generation, prompt.ts:69-84). Modes: `llm` (the bound seat) | `ask-launcher` (template + durable ask). `requiredCaps:["Llm"]` — CAP-UNBOUND wherever no model is bound. The seat is the product: the kernel ships the machinery, the operator ships the mind.

---

<!-- ═══════════════ PART 6C-EXT: FIXTURES + DECISION TREES ═══════════════ -->


## PART 6C-EXT — FIXTURES CATALOG + DECISION TREES

### The fixtures (9 files — 5 positive, 4 refusal-provoking)

| fixture | proves | expected |
|---|---|---|
| mech-gate.json | the canonical cast | PASS / exit 0 |
| vars.json | `--in` seeding | vars flow into nodes |
| parallel-5.json | fan-out concurrency | 5 branches, join gate |
| mpse-demo.json | the mpse machinery cast | rule-card calibration |
| needs-llm.json | the honest cap refusal | `[JESL CAP-UNBOUND]` / exit 2 |
| bad-cycle.json | cycle detection | `[JESL CYCLE]` / exit 2 |
| bad-tier.json | tier gate | `[JESL TIER-VIOLATION]` / exit 2 |
| bad-unbracketed.json | the bracket law | `[JESL UNBRACKETED-GENERATION]` / exit 2 |
| bad-unknown-kind.json | the registry refusal | `[JESL UNKNOWN-NODE]` / exit 2 |

The bad-* set is regression-locked: the battery asserts each token BYTE-EXACT. Never "fix" a bad fixture.

### Decision tree — which node kind?

```
Need to…                          → kind
─────────────────────────────────────────────────────
assert values / gate the flow     → gate
compute a value                   → math-eval
record a provable claim           → triplet-writer
persist the run                   → journal-sink
run side effects                  → shell-exec / python-exec / http-request / file-io
fan work out                      → parallel (+ a join gate)
retry / fall back                 → retry-chain / fallback-chain
wait (human/time/event)           → pause / cron-trigger / event-reactivate
remember state                    → machine / state-machine / escalation-memory
protect against cascades          → circuit-breaker
verify against expectations       → oracle-gate / oracle-discharge / claim-gate
audit / register proof            → evidence-machine / audit-registry
replay history                    → replay-source
react to host events              → event-filter / capture-engine
load config/layers                → layer-loader / config-lock
generate (LLM)                    → prompt  [tier 2 · bracket · Llm cap]
orchestrate a sub-workflow        → workflow-machine / pipeline
classify / route                  → ratio-classifier / intent-classifier / synapse
combine + remember policy         → escalation-memory
```

### Decision tree — which failure am I looking at?

```
exit 2 + token  → Part 5 matrix row (the token names the producer)
exit 1 + FAIL   → read the failing node's outputs.reason + evidence.anchor
exit 0 + INCONCLUSIVE → an honest unresolvable (replay EMPTY, cron WAIT) — supply
                  the missing input; do NOT fake a PASS
tsc ≠ 0         → fix types (Part 2F-3); NEVER @ts-nocheck
vitest hang     → a timing-semantics break (P2-4); restore Clock/Ref handlers
```

---

<!-- ═══════════════ PART 10B: ADVANCED — EXTENDING JESL ═══════════════ -->


## PART 6F-EXT — ROCKET STAGES DEEP (each stage's semantics)

**idea-to-bible** — the entry stage. Consumes a raw idea (vars); its activities validate the idea's shape (the negative space: what makes an idea un-bibleable), assemble the bible artifact (the structured intent document). The stage teaches: INTENT is a first-class artifact, not a chat message.

**bible-to-spec** — consumes a bible; derives the spec (testable requirements). The stage's fixtures include bible variants (valid/minimal/bad-math) — the bad-math fixture proves the stage refuses bibles whose math does not compile (the MPSE law at the rocket layer).

**spec-to-kernels** — consumes a spec; decomposes it into kernel definitions (which cards/kernels will implement the spec). `born-off-spec.json` is the negative: a kernel-definition doc that does not trace to its spec is REFUSED — provenance or it does not exist.

**kernels-to-code** — consumes kernel definitions; emits code stubs (`sample-stubs.json`). The bridge stage: cards → TypeScript scaffolding, still journaled, still gated.

**verify** — the epistemics stage: runs `verifyChain` on journals, checks artifacts against expectations, produces the verified summary. Its `makeArtifactFixture`/`defaultScenarios` (activities.ts) are the reusable verification machinery. A tampered artifact CANNOT pass this stage (battery-proven).

**ship** — packages verified artifacts (the packager surface: tool/chain/skill); the audit-registry row is the ship's receipt. Ship without a verify stage upstream = the born-off-spec sin at the far end.

The chain rule (2O): each stage consumes the PRIOR stage's output channels — the chain is dataflow. The stages' SKILL.md files are the human interface; the workflow.json files are the machine interface; the activities.ts files are the kernel implementation.

### The MPSE anti-derailment doctrine (from KB-MPSE-02, the 169KB volume — the distilled rules)

1. Derailment is an INTERPRETATION-GAP failure, not an intelligence failure: the agent followed a different reading of an ambiguous rule. The fix is always the same — find the rule, express it as math, add the invariant.
2. Ambiguity is a COMPILE ERROR: a spec sentence with no corresponding mathematical expression is rejected at spec time, before any code exists.
3. Invariants ABORT: `if (actual ≠ expected) throw` — the countable properties (counts, bounds, shapes) are enforced mechanically, not reviewed hopefully.
4. The 20 structures cover the problem space (§6H.1): if your rule does not map to one, you have not understood your own rule yet.
5. The oracle table (1H) is MPSE's runtime form: pre-registered expected values, evaluated against numbers, never prose; the agent cannot conform to oracles it cannot see.

The JESL compile of all five: rule-cards carry the math; the oracle gates enforce it; the frozen tokens refuse ambiguity; the journal proves execution; replay reproduces it. The doctrine and the kernel are one system.

---

<!-- ═══════════════ PART 2G: THE EVIDENCE + SCANNER MACHINERY DEEP ═══════════════ -->


## PART 6F-EXT-2 — THE 5K EFFECT MICRO-TEMPLATE CATALOG (from the v1.2 canon)

Every template copy-pasteable, ≤40 lines, carrying RESOLVES-TO / WHEN / FAILURE-MODE / ANCHOR:

**5K-1 SERVICE SHELL** — `class Journal extends Context.Service<Journal>()("Journal", {make: Effect.gen(…)})` + `Layer.effect`. RESOLVES-TO: Context.Service + Layer. WHEN: every cap and kernel module. FAILURE-MODE: leaking impl types into R instead of the service tag.

**5K-2 TAGGED ERROR** — `Schema.TaggedError<JeslCapUnbound>()("JeslCapUnbound", {cap, node})` with a code getter printing `[JESL CAP-UNBOUND] ${cap}` — token-stable (D15). WHEN: every `[JESL …]` code. FAILURE-MODE: `throw new Error(string)` — untyped, uncoded.

**5K-3 ACTIVITY NODE** — `Activity.make({name:"node:shell-exec", success: NodeResult, error: JeslError, execute: (spec) => Shell.exec(spec)})`. WHEN: any cap-bound node in a durable run. FAILURE-MODE: raw exec outside Activity — double Docker after crash.

**5K-4 RETRY CLASS** — `Effect.retry(Schedule.exponential("2.5 seconds").pipe(Schedule.compose(Schedule.recurs(4))))`; 429 → the EXILE Layer (45s), not retry-in-place — the ledger records the exile. WHEN: http/llm nodes. FAILURE-MODE: retrying 429 on the same key → the provider storm.

**5K-5 PARALLEL BATCH** — `yield* Effect.forEach(ready, invoke, {concurrency: 15})` with per-item `Exit` — partitioned, siblings survive; stagger 1-3s for rate-limited caps. WHEN: the ready-set. FAILURE-MODE: `Promise.all` — one rejection kills siblings.

**5K-6 TESTCLOCK FIXTURE** — `it.effect(… yield* TestClock.adjust("24 hours") …)`. WHEN: pause/cron/wall waits; `seq` still drives synapse decay. FAILURE-MODE: `Date.now` in decay.

**5K-7 LSP SCAN ACTIVITY** — `Activity.make({name:"EffectLspScan", execute: (path) => Lsp.diagnostics(path)})`. WHEN: after edit/write of *.ts. FAILURE-MODE: trusting the model that "types pass".

**5K-8 ASK-LAUNCHER DEFERRED** — `DurableDeferred.make<string,string>({name:"ask-launcher"})` + `DurableDeferred.await` — the tool result surfaces the question; the launcher answer completes the deferred across process death; NO Llm cap required. FAILURE-MODE: in-memory Promise across death — loses the question.

---

<!-- ═══════════════ PART 6N: FAQ + DECISION RECORDS ═══════════════ -->


## PART 6F-EXT-3 — ROCKET STAGE WALKTHROUGHS (kernels/, stage by stage)

Each stage directory under `jesl/kernels/<stage>/`: `workflow.json` (the castable card), `activities.ts` (the stage's node implementations, registry-wired, some carrying the stage's domain logic), `fixtures/` (positive + negative examples), `SKILL.md` (the operator card). The stage walkthroughs:

**idea-to-bible/** — casts an idea into a structured bible artifact. `fixtures/sample-idea.txt` seeds it; `expected-bible.json` is the oracle. The activities validate the idea's shape and assemble the bible document. The lesson: INTENT gets an artifact — a bible is a file with structure, not a conversation.

**bible-to-spec/** — bible → spec. Fixtures: `bible-valid.json`, `bible-minimal.json`, `bible-math-bad.json`. The bad-math fixture is the MPSE law at rocket altitude: a bible whose math does not compile is REFUSED — the stage inherits the anti-derailment doctrine.

**spec-to-kernels/** — spec → kernel definitions. Fixtures: `sample-spec.json` (the positive), `bad-spec.json` (malformed), `born-off-spec.json` (the provenance sin — a kernel-definition doc that does not trace to its spec). The born-off-spec refusal is the chain's constitution: every artifact names its parent.

**kernels-to-code/** — kernel definitions → code scaffolding. `sample-stubs.json` drives the emission. The stage where cards become TypeScript scaffolding — journaled like everything else.

**verify/** — the epistemics stage: `verifyChain` over journals + artifact checks → the verified summary. `sample-artifacts.json` drives it; the stage's activities (`runScenario`, `runVerify`, `runVerifyWithBatteryShape`) are the reusable verification machinery the battery borrows.

**ship/** — verified artifacts → the ship package. `artifact-{a,b,c}.txt` fixtures; the audit-registry row is the ship's receipt. Ship without upstream verify = the far-end born-off-spec sin.

The stage order is DATAFLOW: each workflow.json consumes the prior stage's output shape as its inbound channels. The chain re-runs replay-safe (journal `covers()` per stage).

---

<!-- ═══════════════ PART 3: CORRECT / WRONG PAIRS ═══════════════ -->


## PART 6G-EXT — THE AETHER BACKEND INTERFACES (the key-pool, slot-injector, context-manager)

**go-key-pool.ts** — the multi-key round-robin: `ZEN_KEYS_POOL` (comma-separated) rotates on 429 BEFORE any provider fallback; each key carries its own rate state; pool exhaustion = the fallback rung (never a retry storm on a dead key). The single-key mode (`OPENCODE_API_KEY`) is the degenerate pool of one.

**aether-slot-injector.ts** — injects per-agent context slots into the brief weave: the storyline, the prior-frame context, the art direction, the inference block — the 84-slot weave the brief-builder assembles. The slots are the mechanism behind "the operator's storyline rides silently into every call" (the api-mode injection).

**aether-context-manager.ts** — memory hydration: opens the project memory (`aether-memory.open({project},{sessionKey})`), pulls the context chain (prior analyses), computes the inference block — Stage 4 of the runner's 13 (§6G.2). The `AetherMemoryLike` interface abstracts the store; `PromptRecord` rows persist every prompt (sqlite + JSON mirror).

**prompt-validator.ts** — the CTX_FLOORS enforcement: minimum context/analysis-goal/output-requirements sizes + path existence (the shared validators, runner step 5). A brief under floor is REJECTED before any model call — the loud-fail at the brief boundary.

**aether-brief-builder.ts** — assembles the brief: the SUPREMACY CONTRACT (the brief's first law) + primary context + context chain + key facts (must-appear markers) + the mission + the output format + the grounding contract. The MARKER-TEACHING pattern: sections the model must echo back prove it read the brief (silentVerify checks their presence).

**capture.ts** — the session capture: per-agent .md (timeline + full transcripts) at `<captureDir>/<waveId>/<agent>.md`; gated on `captureKey`; C0-control redaction; retry appends. The audit trail of the model side.

**The vendor setup** (vendor-setup.md): the pi SDK providers register through `createProvider` with the CORRECT API family (the API Family Law); catalogs (`catalog-opencode-zen.json.example`, `catalog-nvidia.json.example`) define the model rows; env vars carry keys (the key contract, 2M-2). NO key material ships — ever.

**The examples** (examples/): `minimal-backend-call.ts` (the smallest run), `pipeline-backend-call.ts` (the full pipeline), `wire-into-tool.md` (how a HOST TOOL wraps the backend — the JESL Llm-seat pattern's source). Read wire-into-tool.md before integrating; it is the contract the backend promises its consumers.

---

<!-- ═══════════════ PART 10C: ARCHITECTURE DECISION RECORDS ═══════════════ -->


## PART 6L-EXT — THE RECEIPTS INDEX (every artifact, where it lives)

| receipt | path | what it proves |
|---|---|---|
| Wave audits W0-W4 | `JESL/.trident/wave-audit/w0.md … w4.md` | per-wave per-hunk verdicts + evidence |
| Container checkpoints | `JESL/.trident/container-test-results.json` | CT1-CT5 rows: passTokenMatch/failTokenAbsent/excerpts; CT5 = the overhaul's |
| Build report | `JESL/BUILD_REPORT.md` (597L) | the W0-W10 record + D26 canon line |
| Overhaul DPL1 | `JESL/specs/JESL_FULL_FUNCTION_OVERHAUL_DPL1_SPEC.md` | the 15 criteria + the container plan |
| Spec manifest | `f77b448fff1e…8ff1c` | the 4 READ-ONLY specs' integrity |
| The gates' raw outputs | the w4 agent return (ses_f97bae6b4ffejW4CvCHj9OvSdh) + w4.md | every criterion with its run output |
| Debug ledger | `JESL/context_management/RUNNING_DEBUG_LOG.md` | the mock-split, the hang, the collision, CT5 deploy lessons |
| Decision chain | `JESL/context_management/DECISION_CHAIN.md` | D9-D15 (kernel era) + D25-D27 (overhaul era) |
| Container deploy recipe | Part 4B-4 here + RUNNING_DEBUG_LOG CT5 entry | tar-branch + marker + CWD + unpiped exits |
| Git history | github.com/leviathan-devops/jesl (a62896b → a217cb6) | the pushes with their messages |
| This bible | `Bibles/JESL/JESL_BIBLE.md` | the consolidation of all of the above |

Rule of use: a claim about the kernel cites one of these receipts; the receipts cite commands; the commands are re-runnable. That chain is the whole epistemology.

---

<!-- ═══════════════ PART 6F-EXT: ROCKET STAGES DEEP ═══════════════ -->


## PART 6M — THE TDM FRAMEWORKS MAP (the decision layer above the cards)

The Trident Decision Making tool (TDM v4.4.3 spec, 1,525L — READ-ONLY sibling spec) is the DECISION layer the rockets compile FROM. Its frameworks map 1:1 onto JESL structures:

| TDM framework | what it decides | the JESL compile |
|---|---|---|
| L0 ProblemSpaceAssessment | classify the problem (type/complexity/tier) | `meta{tier}` + the authored node set |
| L1 invariant + pathPhases + options | what must hold; the phase plan; ≥3 options | the edge graph (phases = subgraphs); the OPTION_EXHAUSTION_MINIMUM 3 = never a binary spell |
| L2 DecisionContext per phase | consequence cascade (depth 3), reversibility window (120s reversible / 60s irreversible deliberation), recommendation + confidence | the cap pre-flight (reversibility = the pause/checkpoint machinery); the cascade = the edge graph read forward |
| L3 trap detection | mis-focus detection (the render follows the held structure) | verdicts FROM journal rows — a narrated render is the trap |
| L4 Completion Intelligence | when the work is actually done | the verify stage's passToken-in-tool-output checks |
| PREMORTEM | what blocks the cast? | fallback-chain + the bad-fixture set |
| CONSEQUENCE_CASCADE | 2nd-order residue, 3rd-order spread | the edge graph's forward channels |
| BLAST_RADIUS | what else is in range | the evidence machine + the audit scanner |
| ASSUMPTION_AUDIT | oracle rule cards | oracle-gate + `mpse/rule-cards.ts` |
| SNIFF_TEST (confidence 0.85) | render-check before declaring castable | the verify kernel's passToken check |
| FRAMEWORK_COMPOSITION_MAX 5 | working memory per decision | the batch bound (concurrency 15, ≤5 frameworks/decision) |

The constants are SPELL CONSTANTS: they price decisions the same way magnitude^1.28 prices effects. The 5-stage operator pipeline (Part 4 of the lore bible) walks idea → TDM → JESL → kernel → skill rocket; the fireball trace (§3.5 of the lore bible) is the worked example end to end.

---

<!-- ═══════════════ PART 6F-EXT-2: THE 5K EFFECT MICRO-TEMPLATE CATALOG ═══════════════ -->


## PART 6N — FAQ + DECISION RECORDS

**Q: Why Effect-TS and not plain async/await?**
A: The runtime gives typed errors (the 8 tokens are Schema TaggedErrors), compositional concurrency (`Effect.forEach` + per-item Exit — one rejection never kills siblings), injected Clock (deterministic replay), and Layers (the capability boundary). Plain await gives none of that, and the journal chain + cap pre-flight would become conventions instead of types. (The EFFECT_TS_RUNTIME_BIBLE is the full canon.)

**Q: Why JSON cards and not a DSL/SDK?**
A: The schema-gate law (1E): JSON is machine-checkable at AUTHORING time; a DSL is only runtime-valid. The Rhai↔JSON correspondence (§2D.7) proved the same expressive reach with static guarantees. Cards are also PORTABLE — no code, no host coupling; the registry is the stdlib.

**Q: Where do I put MY model?**
A: The `Llm` Tag (law 2I). Bind it in a driver (P3-9); the Aether backend is the reference harness (§6G). The kernel validates generation against the bracket — your model's output must satisfy `bracket.contract` or the node fails honestly.

**Q: Why does replay-source return INCONCLUSIVE instead of erroring?**
A: It is the honest verdict for "no journaled history under that runId". INCONCLUSIVE from a real path is a first-class answer (2H-2); faking a PASS would break replay's epistemics.

**Q: Can I add a 38th kind?**
A: Yes — P3-3. Registry append-only, index wiring, ≥2 adversarial tests, the trio. The JSON contract never breaks (2D-EXT registry law).

**Q: Why is `prompt` blocked under the CLI driver?**
A: The CLI binds Shell/Fs/Http/Journal/HashCap (cli-live.ts:110) — deliberately NO Llm (the no-LLM mandate). The executor's cap pre-check refuses before invoke. Bind your own driver to unlock it.

**Q: What is the difference between FAIL and INCONCLUSIVE?**
A: FAIL = the work RAN and an assertion failed (reason in outputs). INCONCLUSIVE = the work could not resolve (empty replay, waiting cron). Both honest; neither substitutes for the other; neither is a stub.

**Q: Why 8 frozen tokens and not error classes?**
A: They ARE error classes — Schema TaggedErrors (5K-2) whose `code` prints the frozen string. The freeze (D15) makes refusals a STABLE VOCABULARY scripts and gates can match on byte-exactly; inventing a 9th breaks every consumer that matches the set.

**Q: How do I trust a run?**
A: The journal chain (verifyChain), the evidence triplets (pattern/state/anchor), the exit code, and — for the paranoid — the container checkpoint receipt. Trust is layered because every layer is independently checkable.

**Q: Where are the LLM keys?**
A: Nowhere in JESL. Env vars only, in YOUR driver, per the Aether key contract (2M-2). `grep -rn "sk-\|api[_-]key" core/ nodes/ cli/ algorithms/` → 0 is the standing proof.

### The decision records (the operator rulings that shaped the kernel)

| ruling | consequence in code |
|---|---|
| "FULLY FUNCTIONAL BOILERPLATE" | the 20-stub implementation wave (W1) |
| "DO NOT wire any llms" | Llm = interface; @effect/ai pinned-not-imported |
| "EFFECT ENGINEERING not Spellcasting" | the doc/repo rename sweep |
| JESL = "JSON Effect Scripting Language" | D26; help text + README |
| D15 token freeze | the 8-token gate at every wave |
| D27 registry single-source | getRegisteredImplSync; handler maps DELETED |
| "ONE master bible" | this document supersedes the six |

---

<!-- ═══════════════ PART 2H: THE REACTIVE MACHINERY DEEP ═══════════════ -->


## PART 6P — THE SLOT-SWAP CATALOG + PER-DRIVER QUICKSTARTS

### The slot-swap catalog (every shipped stand-in and its real unlock)

| card | shipped stand-in | the real swap | unlock requirement |
|---|---|---|---|
| guard.json | work-slot = pipeline | YOUR domain nodes | none — pure dataflow |
| oracle.json | math-eval + gate assert | `oracle-discharge {ruleId, expected}` | a driver binding `oracle:read` (tier 2) |
| bracket.json | pipeline stand-in | `prompt {mode:"llm", bracket:{contract}}` | Llm-bound driver, tier 2 |
| ask.json | pipeline (ask-launcher shape) | `prompt {mode:"ask-launcher"}` + DurableDeferred | a Workflow-durable host |
| chain.json | work-slot = pipeline | `replay-source {runId: "<existing>"}` | a prior cast's journal |
| ship.json | file-io write to a scratch path | your artifact pipeline | Fs paths you own |

The swap rule: replace the stand-in node, keep the channels (via names), add the bracket/caps the real node declares, re-cast. A swap that changes CHANNEL names breaks the downstream readers — the via contract is the stable surface.

### Per-driver quickstarts

**CLI (the default):** `bun run cli/main.ts run <card> --in <vars.json>` — caps: Shell/Fs/Http/Journal/HashCap. Deterministic deployment; generation refuses.
**test (the battery driver):** same caps, fake implementations, TestClock — the vitest surface.
**opencode (the agent host):** kernel caps bind to the runtime's tool surfaces; hook-bridge pipes host events onto the bus — cards can watch and react to live agent behavior.
**YOUR driver:** clone cli-live.ts, swap implementations, extend `boundCapsFor`, register the name. The Llm seat (P3-9) is the canonical extension.

---

<!-- ═══════════════ PART 0: HOW TO READ THIS BIBLE ═══════════════ -->


## PART 6Q — THE KIND-MIGRATION TABLE (v1.2 grammar → the shipped 37)

The v1.2 grammar canon listed SPEC-era kinds; the shipped registry is the CURRENT truth. The migration:

| v1.2 grammar kind | the shipped realization |
|---|---|
| tool-call | dissolved — execution kinds (shell-exec/python-exec/http-request/file-io) cover it |
| shadow-agent / subagent-dispatch | moved OUT of the kernel — dispatch is the Aether/Hydra layer's job behind the Llm/Subagent Tags |
| shadow-tool | the wraps/ + drivers/ surface (tool-engine, artifact-gate) |
| prompt (call-model) | `prompt` — THE generation kind (tier 2, bracket, Llm) |
| prompt (ask-launcher) | `prompt` mode ask-launcher + pause/DurableDeferred (§2D.3) |
| journal-sink / triplet-writer / sqlite-sink / replay-source | unchanged — the evidence family |
| gate / state-machine / circuit-breaker / oracle-gate | unchanged — the decision family (LASME-compiled) |
| pipeline / parallel / retry-chain / fallback-chain / pause / cron-trigger | unchanged — the orchestration set |

The lesson the table encodes: the grammar SPECULATED kinds; the build DISCOVERED which ones earned implementations; the registry kept only what casts. Speculation is cheap; the registry is what shipped.

---

<!-- ═══════════════ PART 6R: THE FAILURE TAXONOMY (the executor's error handling, precisely) ═══════════════ -->


## PART 6R — THE FAILURE TAXONOMY

| class | thrown where | shape | exit | recovery |
|---|---|---|---|---|
| SCHEMA refusal | decodeDoc | Effect Schema tree → flattened | 1 | fix the envelope |
| GRAMMAR refusal | validateDoc | dup-id/unknown-kind/dangling/tier diagnostics | 2 | fix the doc |
| STRUCTURAL refusal | buildGraph | `[JESL CYCLE]` + path | 2 | break the cycle |
| POLICY refusal | checkUnbracketed / tier gate | `[JESL UNBRACKETED-GENERATION]` / `[JESL TIER-VIOLATION]` | 2 | bracket / de-scope |
| CAPABILITY refusal | executor pre-flight | `[JESL CAP-UNBOUND]` + cap | 2 | bind the driver |
| RESOLUTION failure | gate asserts / channels | `[JESL CHANNEL-UNSET]` or FAIL verdict | 1-2 | fix via names / config |
| NODE failure | a node's own error path | FAIL verdict + outputs.reason | 1 | per Part 5 row |
| TRANSPORT failure | drivers (HTTP/shell timeouts) | FAIL verdict + driver error | 1 | driver-level fix |
| STATE failure | journal verifyChain | `verified:false` + index | 1 | the chain is broken — investigate tampering |
| ORCHESTRATION failure | budget/deadline | loud abort + budget state | 1 | raise the budget or split the card |

The rule across all ten: EVERY class names the node, the field, the actual, and the remedy — the refusal IS the documentation.

---

<!-- ═══════════════ PART 6S: WORKED MINI-EXAMPLES PER FAMILY ═══════════════ -->


## PART 6S — WORKED MINI-EXAMPLES PER FAMILY (config-first snippets)

### Deterministic

```jsonc
// gate — the path walks the inbound channel; ops: eq ne ge le contains matches
{ "id": "g", "type": "gate",
  "config": { "asserts": [ { "path": "$.triplet.state", "op": "eq", "value": "PASS" },
                            { "path": "$.name", "op": "matches", "value": "^spell\\." } ] } }
// parallel — items fan out; outputs {count, results}
{ "id": "fan", "type": "parallel", "config": { "items": [ {"in":1}, {"in":2}, {"in":3} ] } }
// circuit-breaker — N consecutive failures OPEN the breaker
{ "id": "brk", "type": "circuit-breaker", "config": { "threshold": 3 } }
// cron-trigger — scheduled wake
{ "id": "tick", "type": "cron-trigger", "config": { "schedule": "*/5 * * * *" } }
```

### Decision

```jsonc
// math-eval — the expr AST; outputs {result, value}
{ "id": "calc", "type": "math-eval", "config": { "expr": { "_tag": "mul",
    "left": { "_tag": "literal", "value": 6 }, "right": { "_tag": "literal", "value": 7 } } } }
// ratio-classifier — threshold + suppress path
{ "id": "cls", "type": "ratio-classifier", "config": { "ratio": 0.8, "suppressBelow": true } }
// evidence-gate — adjudication required
{ "id": "eg", "type": "evidence-gate", "config": { "require": "EVIDENCED" } }
```

### Evidence

```jsonc
{ "id": "t", "type": "triplet-writer",
  "config": { "triplet": { "pattern": "spell.fireball", "state": "CAST", "anchor": "fb:1" } } }
{ "id": "sink", "type": "journal-sink" }
```

### Execution (cap-bound)

```jsonc
{ "id": "sh", "type": "shell-exec", "config": { "cmd": "echo hi", "timeoutMs": 5000 } }
{ "id": "io", "type": "file-io",
  "config": { "op": "write", "path": "/tmp/out.json", "body": "{\"ok\":true}" } }
{ "id": "http", "type": "http-request", "config": { "url": "https://example.org", "method": "GET" } }
```

### Generation (tier 2 + bracket + Llm)

```jsonc
{ "id": "gen", "type": "prompt", "tier": 2,
  "config": { "mode": "llm", "template": "Summarize: {{input}}",
              "bracket": { "contract": "json", "repair": 2, "confidenceFloor": 0.85 } } }
```

The pattern across every family: config shapes are SMALL, closed, and validated at cast. A config the node does not understand fails the node loudly — never a silent default.

---

---

<!-- ═══════════════ PART 6T: A ROCKET STAGE, FULL LISTING ═══════════════ -->


## PART 6T — A ROCKET STAGE, FULL LISTING (bible-to-spec's workflow shape)

```jsonc
{ "$schema": "trident-workflow-v1",
  "meta": { "name": "bible-to-spec", "tier": 1,
            "description": "Compile a structured bible artifact into a testable spec" },
  "nodes": [
    { "id": "bible-in",    "type": "gate",
      "config": { "asserts": [{ "path": "$.bible", "op": "contains", "value": "sections" }] } },
    { "id": "derive",      "type": "pipeline", "config": {} },
    { "id": "math-check",  "type": "oracle-gate", "config": { "rules": "bible-math" } },
    { "id": "spec-out",    "type": "file-io",
      "config": { "op": "write", "path": "specs/derived-spec.json" } },
    { "id": "proof",       "type": "triplet-writer",
      "config": { "triplet": { "pattern": "rocket.bible-to-spec", "state": "PASS",
                               "anchor": "bible-to-spec:1" } } },
    { "id": "sink",        "type": "journal-sink" } ],
  "edges": [
    { "from": "bible-in", "to": "derive",     "via": "bible" },
    { "from": "derive",   "to": "math-check", "via": "draft" },
    { "from": "math-check","to": "spec-out",  "via": "spec" },
    { "from": "spec-out", "to": "proof",      "via": "written" },
    { "from": "proof",    "to": "sink",       "via": "data" } ],
  "vars": {} }
```
The stage pattern: **validate-in → derive → gate-the-doctrine → write-out → prove → journal.** The activities carry the real logic; the workflow is the contract; the fixtures are the acceptance set; the SKILL.md is the human card.

### The reactive round-trips

**artifact-gate:** host write event → hook-bridge → bus → gate evaluates → violation ⇒ `EFFECT_ARTIFACT_GATE` deny + `pta.intercept` row; clean ⇒ silent pass. The gate is a SUBSCRIBER — the executor never knew.

**ask-launcher (5K-8):** prompt node → `DurableDeferred.await` → the question surfaces in the tool result → the answer completes the Deferred across process death → the channel carries it downstream. Death between question and answer is SAFE.

---

<!-- ═══════════════ PART 6V: THE TOKEN SPEC (all 8, full structured shapes) ═══════════════ -->


## PART 6V — THE TOKEN SPEC (each refusal, its full shape, a real example)

Every refusal is a Schema TaggedError (5K-2) whose `code` prints the frozen string, plus `{node, field, actual, remedy}` — and exits 2. The complete set with REAL cast examples:

**1. `[JESL UNKNOWN-NODE]`** — a doc node's `type` has no registry impl.
`[JESL UNKNOWN-NODE] node=a field=type actual=not-a-kind remedy=fix the typo or append the kind to the registry (append-only)` — live-verified in CT5.
Producer: buildNodeHandles (cli/handlers.ts) via `getRegisteredImplSync` miss.

**2. `[JESL CYCLE]`** — the edge graph is not a DAG.
`[JESL CYCLE] node=a field=edges actual=cycle through [a→b→c] remedy=break the cycle with a gate, or re-arm via event-reactivate`
Producer: buildGraph (core/graph.ts). Fixture: bad-cycle.json.

**3. `[JESL TIER-VIOLATION]`** — tier-1 doc contains a generation kind.
`[JESL TIER-VIOLATION] node=<id> field=type actual=<gen kind> remedy=tier 2 + bracket, or remove`
Producer: checkUnbracketed (cli/handlers.ts). Fixture: bad-tier.json.

**4. `[JESL UNBRACKETED-GENERATION]`** — tier-2 generation without `bracket.contract`.
`expected: {contract, repair≤2, confidenceFloor} · actual: absent · remedy: declare bracket.contract (output schema) — generation is never unbracketed`
Producer: checkUnbracketed (:63-84). Fixture: bad-unbracketed.json.

**5. `[JESL CAP-UNBOUND]`** — requiredCaps ⊄ driver bound set.
`[JESL CAP-UNBOUND] node=discharge field=caps actual=oracle:read remedy=run under a driver that binds the cap, or drop the node`
Producer: executor pre-check (executor.ts ~:162). Fixture: needs-llm.json.

**6. `[JESL ORACLE-MISSING]`** — an oracle rule reference with no registered rule.
Producer: oracle machinery (mpse/oracle.ts + oracle-gate).

**7. `[JESL CHANNEL-UNSET]`** — an assert path reads a channel no edge wrote.
`[JESL CHANNEL-UNSET] node=check field=$.value expected=a value written by an inbound edge actual=undefined remedy=check edge.via names`
Producer: gate invoke (nodes/gate.ts). Live example: oracle.json's first cast.

**8. `[JESL NO-SEED]`** — a headless start: the first node has no inbound.
Producer: the executor's seed check. Remedy: add a seed edge or start from an event.

THE SWEEP (the standing gate): `grep -rhoE '\[JESL [A-Z-]+\]' <product dirs> | sort -u` → EXACTLY these 8. The sweep ran at W3/W4/W10 and every overhaul wave — it is why the vocabulary stayed frozen.

---


---

<!-- ═══════════════ PART 6W: EMBEDDING RECIPES ═══════════════ -->

## PART 6W — EMBEDDING RECIPES (three ways to host the kernel)

### Recipe A — the CLI wrapper (embed in any script)

```bash
bun run jesl/cli/main.ts run card.json --in vars.json
# exit 0 + stdout JSON = the verdict document; exit 2 = a refusal with remedy
```
The kernel is a black box: your script owns the card, reads the verdict, acts. No imports, no coupling. The journal persists the evidence for audit.

### Recipe B — the plugin (embed in an OpenCode-class agent)

1. Ship the kernel as a dependency; import the kernel entry (`runDoc`).
2. Build your Layer: bind the caps your host offers (tool calls → Shell/Http shapes, host fs → Fs, your model gateway → Llm).
3. Bridge host events to the bus (`hook-bridge.ts` pattern) — cards REACT to host behavior (the artifact-gate pattern: deny violating writes).
4. Register your node kinds at plugin init — they join the registry before any cast.
5. Journal to your host's store (implement the Journal cap against it).
The invariant: the kernel never imports your host; your host never reaches into core/ — every touch is a Tag or a Layer.

### Recipe C — the server (embed behind an endpoint)

```ts
// POST /cast  body: { card, vars }
const receipt = await runDoc(JSON.parse(body.card), { driver: YourDriverLive, vars: body.vars })
return { verdict: receipt.verdict, journal: receipt.journalPath, results: receipt.results }
```
Stateless between casts; the journal carries the state. Concurrent casts are safe (per-run rows, per-run ids). Rate-limit at the endpoint — the budget bounds each cast.

### Recipe D — the rocket host (embed the 6-stage chain)

Run the stages as a chain of casts: idea → bible → spec → kernels → code → verify → ship — each stage's output artifact feeds the next stage's `--in`. Your host orchestrates the sequence; the journals prove each link. A stage refusal stops the chain AT that stage — the born-off-spec property enforced at runtime.

---

---

<!-- ═══════════════ PART 6X: THE REMAINING KIND EXAMPLES ═══════════════ -->

## PART 6X — THE REMAINING KIND EXAMPLES (completing the catalog)

```jsonc
// event-filter — the reactive entry (bus subscription)
{ "id": "ef", "type": "event-filter", "on": { "event": "tool.call.*", "filter": "tool=write" } }
// capture-engine — stream accumulator (start/delta/end/flush)
{ "id": "cap", "type": "capture-engine", "config": { "flush": { "ms": 50, "chars": 60 } } }
// machine — the generic transition table
{ "id": "m", "type": "machine",
  "config": { "states": ["idle","running","done"], "transitions": { "idle->running": "start", "running->done": "finish" } } }
// state-machine — the paragon 8-transition canon
{ "id": "sm", "type": "state-machine", "config": { "table": "paragon-8" } }
// oracle-gate — the MPSE rule evaluation
{ "id": "og", "type": "oracle-gate", "config": { "rules": "oracle-table" } }
// sqlite-sink — real DB persistence (native dep; DB_OPEN_FAIL = designed loud fail)
{ "id": "db", "type": "sqlite-sink", "config": { "db": "/tmp/run.db", "op": "upsert", "rows": "$.results" } }
// replay-source — the honest time machine
{ "id": "rp", "type": "replay-source", "config": { "runId": "wf-1788450759873-k3j2x1" } }
// evidence-machine — the shared epistemics as a node
{ "id": "em", "type": "evidence-machine", "config": { "ingest": "$.events" } }
// audit-registry — the ship receipt
{ "id": "ar", "type": "audit-registry", "config": { "audit": "ship.final" } }
// mpse-discharge — the doctrine's enforcement node
{ "id": "md", "type": "mpse-discharge", "config": { "ruleId": "R-1", "expected": 24 } }
// synapse — decay-based signal combining
{ "id": "sy", "type": "synapse", "config": { "decay": "seq", "inputs": ["a","b"] } }
// intent-classifier — deterministic routing
{ "id": "ic", "type": "intent-classifier", "config": { "table": { "deploy": "ship-lane", "audit": "verify-lane" } } }
// layer-loader — the dynamic extension seam
{ "id": "ll", "type": "layer-loader", "config": { "layer": "my-domain-layer" } }
// config-lock — validated config, locked
{ "id": "cl", "type": "config-lock", "config": { "keys": ["budget","caps"] } }
// event-reactivate — the cycle-free loop
{ "id": "er", "type": "event-reactivate", "config": { "on": "rearm", "target": "worker" } }
// pause — the durable checkpoint (Workflow-mandatory)
{ "id": "pz", "type": "pause", "config": { "reason": "human approval" } }
```
Every example is the ADVERSARIAL MINIMUM: the tests for each kind cover these shapes plus empty/hostile/boundary inputs (Part 4B).

---

## PART 6Y — THE RECOVERY PLAYBOOK (the operator incident runbook)

| incident | first move | then | never |
|---|---|---|---|
| a cast hangs | pkill the process; find the INVOKE-without-VERDICT row in the journal — that node is the suspect | check its handlers for broken timing semantics (P2-4) | never "wait longer" — a hang is a semantic break, not slowness |
| `verified:false` on a journal | stop trusting that run's history | find the mutated row (the chain names the index); identify the writer | never "re-verify until true" — tamper is tamper |
| a refusal storm (many cards refusing) | run ONE refusal verbose; read field/actual/remedy | the storm's cause is shared (a driver lost a cap, a registry drift) | never bulk-suppress tokens |
| tsc ≠ 0 after a wave | `bunx tsc --noEmit 2>&1 \| head -20` — read the FIRST error | fix root-first (shared helpers), one file at a time | never @ts-nocheck the error away |
| the boilerplate drifts | re-run the extraction (P3-7) — never hand-patch copies | verify in-tree (tsc + battery) | never edit kernel bugs "in the copy" |
| a container checkpoint fails | adjudicate two-sided: environment or defect? (CT5 precedent: glibc/timeout = env) | env ⇒ BLOCKED row; defect ⇒ fix + re-run | never report env-blocked rows as PASS |
| an agent wedges at spawn (zero stream parts) | one kick; if still zero parts → kill + fresh dispatch (the Wave-5 lesson) | never harvest a prompt-only stream | never wait past the second zero-work check |
| invented `[JESL SOMETHING-NEW]` appears | find the thrower; map it to the nearest frozen token or delete | the sweep must return exactly 8 | never add a 9th (D15) |

---

## PART 6Z — THE DOCTRINE LEDGER (every verbatim law, one place)

1. "DO NOT wire any llms inside this. THE POINT IS FULLY FUNCTIONAL BOILERPLATE MACHINERY I CAN PLUG INTO ANYTHING AND START FILLING WITH DATA AND ADAPTING."
2. "WITHOUT OVERENGINEERING OR COMPLICATING OR SLOPPING THIS."
3. "21 FUCKING STUBS IS NOT FULLY FUNCTIONAL."
4. "Math is the spec. Code is the implementation. Tests are the proof." (MPSE)
5. "When the natural language spec and the math disagree, the math wins." (MPSE)
6. "If a rule can't be expressed as math, it's ambiguous and will cause derailment." (MPSE)
7. "JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime." (v1.2 Phase-2 bind)
8. "the verification must be mechanical to be trusted" (Shadow Enhanced Tools)
9. "assert everything against the MEMORY TABLE, never the prose" (Shadow Enhanced Tools)
10. "the system must never DEPEND on the LLM for a decision the mechanical layer can make" (Shadow Enhanced Tools)
11. "Never scatter the stages across the codebase. One runner holds the composition — that IS the architecture." (aether-runner)
12. "WHAT FUCKING MOCK BRAIN" — the model discipline: the REAL transport in prod; scripted streams only in tests. (aether-runner)
13. GRAPH TOOLS USAGE LAW (Shadow Hydra): "ALWAYS query the graph BEFORE reading files. EXTRACTED edges are facts; INFERRED edges are guesses — flag [INFERRED]. … NEVER fabricate a graph node or edge. God nodes = single points of failure — flag +1 severity."
14. D15: the 8 frozen tokens — never a 9th, never a repurpose. D26: JESL = JSON Effect Scripting Language. D27: the registry is the single source of kind→impl truth.

---

---

<!-- ═══════════════ PART 4F: THE 5-STAGE OPERATOR PIPELINE (the master workflow) ═══════════════ -->

## PART 4F — THE 5-STAGE OPERATOR PIPELINE (the master workflow, detail)

**STAGE 1 — WRITE THE SPELL.** Author the workflow.json: meta+vars bind the IDEA; nodes+edges bind the EFFECT (composed from the registry primitives — the altar surface); the journal/verdict contract binds the EXPERIENCED EFFECT (what will count as evidence). Deterministic kinds are the vocabulary; bracketed generation is the inventive composition; edges are the grammar.

**STAGE 2 — CONVERT THE SPELL TO TDM FRAMEWORKS.** L0: classify (type/complexity/tier). L1: the invariant (what must hold), pathPhases (structure→price→release→render), option space ≥ 3. L2 per phase, ≤5 frameworks: PREMORTEM (what blocks the cast?), CONSEQUENCE_CASCADE (2nd-order residue, 3rd-order spread), BLAST_RADIUS (what else is in range), ASSUMPTION_AUDIT (oracle cards), SNIFF_TEST 0.85 (render-check before declaring castable). L3 velocity: tier-1 decides now; tier-2 deliberates.

**STAGE 3 — CONVERT THE TDM FRAMEWORKS TO JESL SCRIPTS.** Each framework compiles to structure: CONSEQUENCE_CASCADE → the edge graph (each via channel = a consequence flowing forward); ASSUMPTION_AUDIT → oracle-gate rule cards (expected values mandatory); REVERSIBILITY → pause + journal checkpoints; PREMORTEM → fallback-chain + the bad-fixture set; SNIFF_TEST → the verify kernel's passToken-in-tool-output check; BLAST_RADIUS → evidence machine + the audit scanner.

**STAGE 4 — THE KERNEL (the real-time renderer).** Package the script as `jesl/kernels/<spell>/` (activities.ts + workflow.json + SKILL.md + fixtures/). runProgram executes in real time; the journal records the experienced effect as evidence while it happens; the bus streams the render; covers() makes the experience replayable at zero cost. The kernel is where a scripted spell becomes a living render.

**STAGE 5 — THE SKILL ROCKET (the self-contained castable spell).** `emitSkill(doc, outDir, writer)` (packager/skill.ts) emits: SKILL.md (the fuse + the launch line `jesl run payload/workflow.json --in payload/ctx.json`), payload/workflow.json (the byte-preserved spell), ctx.json (vars/seed), mission.md (the objective), anti-patterns.json (the misfire table). A named, owned, packaged formula — castable by anyone with the kernel, journaled, replayable.

---

<!-- ═══════════════ PART 4G: THE EVIDENCE FLOW — A CLAIM'S LIFE ═══════════════ -->

## PART 4G — THE EVIDENCE FLOW: A CLAIM'S LIFE THROUGH THE MACHINE

```
1.  a write lands            → analyzeResult("edit", …) → kind: source_change
2.  source_change ingested   → ring[subject]; freshness window 300s; filePath required
3.  claim-gate pre-arms      → preSource ingested FIRST (the designed honest path)
4.  the claim ingested       → kind:"claim", same subject → hasSource = true
5.  adjudication             → EVIDENCED (without step 3: UNEVIDENCED "no fresh source_change")
6.  verdict + triplet        → {pattern:"claim-gate", state:"EVIDENCED", anchor:"<node>:<subject>:EVIDENCED:1"}
7.  journal rows             → INVOKE + VERDICT, sha256-chained
8.  replay                   → covers(docHash, seed) reproduces the adjudication exactly
```
Every bracket.json cast walks this path. The epistemics is executed code (core/evidence.ts + nodes/claim-gate.ts), not convention — which is why weakening it (P4-7's narrated render) is the one sin the system cannot tolerate.

---

---

<!-- ═══════════════ PART 11: THE CLOSING — SELF-AUDIT + SUPERSEDE LEDGER + DOCTRINE LEDGER ═══════════════ -->

## PART 11 — THE CLOSING: SELF-AUDIT + SUPERSEDE LEDGER + DOCTRINE LEDGER

### 11.1 — The self-audit (the trident bible standard, honest)

| check | verdict |
|---|---|
| grounding — claims anchored to file:line or measured runs | ✅ kernel anchors current to the W4 gate (2026-09-04); Aether anchors are first-hand reads of the sources |
| discoverability — TRIGGER/DUTY/PROTOCOL header | ✅ |
| self-containment — a fresh agent operates from this alone | ✅ laws → pairs → procedures → matrix → reference → history |
| density — real tables/contracts/commands, no padding | ✅ every section carries executable or checkable content |
| law format — imperative + mechanism + consequence | ✅ Part 2 (15 laws) + 2B-2J module laws |
| doctrine fidelity — VERBATIM quotes | ✅ §6Z collects them; header carries the two mandates |
| adversarial coverage — the pairs + the matrix attack the happy path | ✅ 12 pairs + 30 rows, all from real incidents |
| zero-trust residue | the Aether sections carry FIRST-HAND reads but not every line of 199MB — the depth sources table (6U) names what was compressed |

### 11.2 — The supersede ledger (what this bible replaces)

| predecessor | absorbed into | archived |
|---|---|---|
| EFFECT_ENGINEERING_BIBLE.md (492L) | Part 2C (physics) + 6AC (algebra) | SUPERSEDED by v3.0 — the OPERATIONAL rewrite (idea → runtime reality); v2.0 analysis retained in archive/ |
| JESL_EFFECT_ENGINEERING_LIBRARY.md (915L) | Part 2E (card theory) + 6M (TDM) + 4F (pipeline) | archive/ |
| JESL_KERNEL_ARCHITECTURE_BIBLE.md (1,786L) | Part 2B + 2D-EXT (architecture + grammar) | archive/ |
| JESL_KERNEL_OPERATING_MANUAL.md (504L) | Part 4E (operator procedures) | archive/ |
| JSON_EVENT_SCRIPTING_BIBLE.md v1.2 (1,595L) | Part 2D/2D-EXT (laws + grammar) — FILENAME FROZEN (D26), content superseded | archive/ |
| EFFECT_TS_RUNTIME_BIBLE.md (514L) | referenced as the depth source (the Effect canon E1-E10 stays authoritative for Effect internals) | KEPT ACTIVE |

WHERE A PREDECESSOR CONFLICTS WITH THIS BIBLE, THIS BIBLE WINS.

### 11.3 — The doctrine ledger (every verbatim law, one place)

1. "DO NOT wire any llms inside this. THE POINT IS FULLY FUNCTIONAL BOILERPLATE MACHINERY I CAN PLUG INTO ANYTHING AND START FILLING WITH DATA AND ADAPTING."
2. "WITHOUT OVERENGINEERING OR COMPLICATING OR SLOPPING THIS."
3. "21 FUCKING STUBS IS NOT FULLY FUNCTIONAL."
4. "Math is the spec. Code is the implementation. Tests are the proof." (MPSE)
5. "When the natural language spec and the math disagree, the math wins. The natural language is commentary. The math is the law." (MPSE)
6. "If a rule can't be expressed as math, it's ambiguous and will cause derailment." (MPSE)
7. "JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime." (v1.2 Phase-2 bind)
8. "the verification must be mechanical to be trusted" (Shadow Enhanced Tools)
9. "assert everything against the MEMORY TABLE, never the prose" (Shadow Enhanced Tools)
10. "the system must never DEPEND on the LLM for a decision the mechanical layer can make" (Shadow Enhanced Tools)
11. "Never scatter the stages across the codebase. One runner holds the composition — that IS the architecture." (aether-runner.ts header)
12. "WHAT FUCKING MOCK BRAIN" — the model discipline: the REAL transport in production; scripted streams only in tests. (aether-runner.ts)
13. GRAPH TOOLS USAGE LAW (Shadow Hydra): "ALWAYS query the graph BEFORE reading files. EXTRACTED edges are facts; INFERRED edges are guesses — flag [INFERRED]. … NEVER fabricate a graph node or edge. God nodes = single points of failure — flag +1 severity."
14. D15: the 8 frozen tokens — never a 9th, never a repurpose. D26: JESL = JSON Effect Scripting Language. D27: the registry is the single source of kind→impl truth.
15. The one-line model (canon): "Write a JSON file with your pipeline steps. The kernel validates it, runs each step on Effect-TS in dependency order, logs every result to a tamper-proof journal, and returns PASS or FAIL."

---

---

<!-- ═══════════════ PART 10D-EXT: THE BAD FIXTURES ANNOTATED ═══════════════ -->

## PART 10D-EXT — THE BAD FIXTURES ANNOTATED (the refusal proofs)

**bad-tier.json** — a tier-1 doc containing a generation node. The checkUnbracketed family scan fires FIRST at validate time: `[JESL TIER-VIOLATION]` exit 2. Proves: the tier gate is structural — no card "accidentally" runs a model.

**bad-unbracketed.json** — a tier-2 doc whose generation node lacks `bracket.contract`: `[JESL UNBRACKETED-GENERATION] node=<id> field=bracket expected:{contract, repair≤2, confidenceFloor} actual:absent remedy:declare bracket.contract (output schema) — generation is never unbracketed` exit 2. Proves: generation without a declared output contract is refused BEFORE any model call — the bracket is the schema gate for anything an LLM produces.

**bad-unknown-kind.json** — a node type outside ALL_KINDS: `[JESL UNKNOWN-NODE] node=a field=type actual=not-a-kind remedy=fix the typo or append the kind to the registry (append-only)` exit 2. Proves: the registry is the vocabulary — invented kinds are refused, not guessed.

**bad-cycle.json** — a→b→c→a: `[JESL CYCLE] node=a field=edges actual=cycle through [a→b→c] remedy=break the cycle with a gate, or re-arm via event-reactivate` exit 2. Proves: the graph compiler's acyclicity — loops are BUILT (reactivation), never IMPLIED.

Each fixture is asserted BYTE-EXACT in the battery (tests/cli.test.ts) — the tokens are not documentation; they are tested behavior.

---

<!-- ═══════════════ PART 4G: THE EVIDENCE FLOW — A CLAIM'S LIFE ═══════════════ -->

## PART 4G — THE EVIDENCE FLOW: A CLAIM'S LIFE THROUGH THE MACHINE

```
1.  a write lands            → analyzeResult("edit", …) → kind: source_change
2.  source_change ingested   → ring[subject]; freshness window 300s; filePath required
3.  claim-gate pre-arms      → preSource ingested FIRST (the designed honest path)
4.  the claim ingested       → kind:"claim", same subject → hasSource = true
5.  adjudication             → EVIDENCED (without step 3: UNEVIDENCED "no fresh source_change")
6.  verdict + triplet        → {pattern:"claim-gate", state:"EVIDENCED", anchor:"<node>:<subject>:EVIDENCED:1"}
7.  journal rows             → INVOKE + VERDICT, sha256-chained
8.  replay                   → covers(docHash, seed) reproduces the adjudication exactly
```
Every bracket.json cast walks this path. The epistemics is executed code (core/evidence.ts + nodes/claim-gate.ts), not convention — weakening it (P4-7's narrated render) is the one sin the system cannot tolerate.

---

<!-- ═══════════════ PART 6AD: THE DEBUG LEDGER DISTILLED ═══════════════ -->

## PART 6AD — THE DEBUG LEDGER DISTILLED (the top lessons, quick-reference)

| # | lesson | the incident that taught it | the standing rule |
|---|---|---|---|
| 1 | the mock-split: tests green ≠ production honest | 22 kinds ran handler-stubs while 424 tests passed | resolve kinds ONLY via the registry; sweep `.stub` patterns in RUNTIME output |
| 2 | a PASS through a stub is fitted-to-golden | the cards' first PASSes were theatrical | verify the PATH, not just the verdict |
| 3 | instant test handlers hang kill-resume | Effect.succeed conversions starved t4 | timing semantics are the test's purpose — type fixes never touch them |
| 4 | global string-replace corrupts source | catch-IIFE syntax deaths | anchored edits only; restore-last-good when tangled |
| 5 | `it: any` + inner `as any` = the house variance fix | TS2322/TS2488 across 13 files | never restructure runtime to satisfy the checker |
| 6 | re-extraction during edits copies half-state | the contaminated boilerplate | sequence: sources final FIRST, artifact regenerate SECOND |
| 7 | two agents, one file = a collision | the W3 ping-pong | pause the intruder, owner finishes, resume scope-locked |
| 8 | host-layout path hardcodes are time bombs | battery ROOT=../.. resolved /root/jesl in-container | resolve from __dirname/module — layout-independent |
| 9 | native prebuilds are env-locked | better-sqlite3 prebuilds need GLIBC_2.33 | rebuild per target env; adjudicate env rows BLOCKED |
| 10 | invented tokens recur without a sweep | GATE-FAIL, JOURNAL-CORRUPT, UNKNOWN-PROFILE | the 8-token grep at EVERY gate |
| 11 | exit codes die in pipes | `cmd \| head` returned head's code | capture unpiped: `cmd > f; echo EXIT:$?` |
| 12 | the tar branch wants tree-at-root | `jesl/`-prefixed archives extract wrong | `tar czf … .` from INSIDE the tree |

---

---

<!-- ═══════════════ PART 6AE: PER-DRIVER QUICKSTARTS + THE REACTIVE ROUND-TRIPS ═══════════════ -->

## PART 6AE — PER-DRIVER QUICKSTARTS + THE REACTIVE ROUND-TRIPS

### cli driver (the default — deterministic deployment)

```bash
bun run cli/main.ts run algorithms/guard.json            # caps: Shell/Fs/Http/Journal/HashCap
bun run cli/main.ts validate algorithms/guard.json       # the dry refusal check
bun run cli/main.ts run algorithms/oracle.json --in vars.json
```
Generation refuses (CAP-UNBOUND / TIER-VIOLATION) — the deterministic deployment cannot accidentally run a model.

### test driver (the battery)

Same cap NAMES, fake implementations + TestClock. The 424-unit suite runs it; write tests against it, never against cli-live.

### opencode driver (the agent host)

Kernel caps bind to the runtime's tool surfaces; hook-bridge pipes host events onto the bus. Cards watch AND react to live agent behavior (the artifact-gate denies violating writes). The embedding invariant (Recipe B): Tags out, Layers in.

### your driver (the unlock)

Clone cli-live.ts, swap implementations, extend boundCapsFor, register the name. Llm → the Aether backend (§6G). oracle:read → your oracle registry. Every cap you bind unlocks the corresponding kinds; every cap you withhold keeps its refusals honest.

### The reactive round-trips (the bus in action)

**artifact-gate:** host write event → hook-bridge → bus → the wrap evaluates → violation ⇒ `EFFECT_ARTIFACT_GATE` deny + `pta.intercept` journal row; clean ⇒ silent pass. The gate is a SUBSCRIBER — the executor never knew.

**ask-launcher (5K-8):** prompt node (ask-launcher) → `DurableDeferred.await` → the question surfaces in the tool result → the answer completes the Deferred across process death → the channel carries it downstream. Death between question and answer is SAFE.

**event-reactivate:** a completed worker node re-arms on a named event → the loop continues WITHOUT a cycle edge (the graph stays a DAG; time does the looping).

---

---

<!-- ═══════════════ PART 6AF: THE 20 STRUCTURES + THE KERNEL (the complete mapping) ═══════════════ -->

## PART 6AF — THE 20 MPSE STRUCTURES MAPPED TO THE KERNEL (the complete table)

| # | problem | structure | formula | the kernel node that enforces it |
|---|---|---|---|---|
| 1 | how many outputs | combinatorics | f(T)=N(1+P) | oracle-gate (rule rows) |
| 2 | always holds | invariant | ∀s: sl∈[5,15] | gate asserts |
| 3 | filter | set theory | Allowed=U∩P∩T | event-filter |
| 4 | score | linear combination | S=Σwᵢxᵢ | math-eval |
| 5 | if-then | implication | BS∧Z<20%→RWL | claim-gate/oracle-gate |
| 6 | bounds | inequality | 5≤sl≤15 | gate ge/le |
| 7 | depends | piecewise | f(x)=c?y₁:y₂ | state-machine |
| 8 | next | recurrence | aₙ₊₁=f(aₙ) | workflow-machine |
| 9 | all-pass | boolean AND | CS2∧CS5∧CS7 | gate multi-assert |
| 10 | risk/reward | expected value | EV=P·g−P·l | math-eval+oracle-gate |
| 11 | grid | matrix | M[p][d] | sqlite-sink |
| 12 | before | DAG | (a,b)∈E | core/graph.ts |
| 13 | total | series | ΣRRR·size | math-eval |
| 14 | valid | domain/range | c∈[0,100] | gate asserts |
| 15 | improves | monotonicity | conf↑ | evidence-gate |
| 16 | dedupe | equivalence | s₁~s₂ | config-lock |
| 17 | rank | partial order | GOD≻HIGH | ratio-classifier |
| 18 | distance | metric | d=\|e−s\|/pip | math-eval |
| 19 | best | optimization | min Loss | oracle-gate |
| 20 | stages | composition | f∘g∘h | the executor (batches) |

The mapping is the proof that the doctrine and the kernel are ONE system: every MPSE structure has a kernel-level enforcement point, and every kernel gate traces to a doctrine structure.

---

<!-- ═══════════════ PART 6AG: THE INTEGRATION SURFACE (JESL ⇄ Aether, the complete picture) ═══════════════ -->

## PART 6AG — THE INTEGRATION SURFACE (JESL ⇄ Aether, the complete picture)

```
┌─────────────────────────────────────────────────────────────────┐
│ THE JESL KERNEL (deterministic machinery)                       │
│  cards · 37 kinds · registry · journal · gates · tokens         │
│  Llm Tag = an empty seat (an interface, deliberately unbound)   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ the operator binds: LlmLive = your seat
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ THE AETHER BACKEND (the model-routing harness, pi-SDK v3.1)     │
│  AetherAgent.run(brief) — 2-3 rounds, batched edits,            │
│  the FILE ON DISK is the output                                 │
│  provider chain: opencode-go (paid primary) → cycler → nvidia   │
│  → openrouter → inferx · RPM ledger · 5-key pool · TTL exile    │
│  thinking budgets: reasoningEffort medium + 2048 caps injected  │
│  capture: per-agent .md, C0-redacted, waveId-keyed              │
└───────────────────────────┬─────────────────────────────────────┘
                            │ dispatch (the wave pattern)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ THE SHADOW HYDRA PIPELINE (the universal subagent framework)    │
│  SubagentSpec[] (zod output schemas) · synthesizer · gates      │
│  LASME → MPSE → SRO meta-gates · shared memory (compounding)    │
│  graphify MCP (the GRAPH TOOLS USAGE LAW) · evidence telemetry  │
└─────────────────────────────────────────────────────────────────┘

THE DOCTRINE BENEATH ALL THREE: MPSE (math-is-the-spec) + LASME
(state-machines-and-gates) + the ISE law (lexicons, state machines,
algorithmic systems — never regex-slop towers).
```

The seat contract: JESL declares WHAT it needs (a bracketed generation); Aether decides HOW it runs (providers, budgets, retries); Shadow agents are WHO answers. Neither layer sees the other's internals — the Tag and the brief file are the only surfaces.

---

---

<!-- ═══════════════ PART 6AH: THE EVIDENCE FLOW WALKTHROUGH ═══════════════ -->

## PART 6AH — THE EVIDENCE FLOW WALKTHROUGH (a claim's life through the machine)

```
1.  a write lands            → analyzeResult("edit", …) → kind: source_change
2.  source_change ingested   → ring[subject]; freshness window 300s; filePath required
3.  claim-gate pre-arms      → preSource ingested FIRST (the designed honest path)
4.  the claim ingested       → kind:"claim", same subject → hasSource = true
5.  adjudication             → EVIDENCED (without step 3: UNEVIDENCED "no fresh source_change")
6.  verdict + triplet        → {pattern:"claim-gate", state:"EVIDENCED", anchor:"<node>:<subject>:EVIDENCED:1"}
7.  journal rows             → INVOKE + VERDICT, sha256-chained
8.  replay                   → covers(docHash, seed) reproduces the adjudication exactly
```
Every bracket.json cast walks this path. The epistemics is executed code (core/evidence.ts + nodes/claim-gate.ts), not convention — weakening it (the narrated render, P4-7) is the one sin the system cannot tolerate.

### The stacking + composition algebra (the physics, operational form)

The lore's measured ladder (alternating prepare casts: damage multipliers 1→4→16→49→144→400→1089) is the CANON WARNING: amplification is multiplicative over everything AFTER the amplifier — exponential ladders are one lazy loop away. Operational rules: (1) distinct runIds stack; same docHash+seed replays via covers() — never accumulates; (2) amplifier-before-amplified, enforced by the edge order (the dataflow IS the order); (3) same-identity recasts REPLACE (a new runId = a new chain; the old chain stands as history); (4) budget loops are legal but VISIBLE in the journal — cost is conserved-and-relocated, never deleted (P4-10). When nesting cards, re-derive the order from channels — the dataflow graph is the only order that exists.

### The 20 MPSE structures → the kernel (the complete enforcement mapping)

| # | problem | structure | the kernel node that enforces it |
|---|---|---|---|
| 1 | how many outputs | combinatorics f(T)=N(1+P) | oracle-gate |
| 2 | always holds | invariant ∀ | gate asserts |
| 3 | filter | set theory | event-filter |
| 4 | score | linear combination | math-eval |
| 5 | if-then | implication | claim-gate / oracle-gate |
| 6 | bounds | inequality | gate ge/le |
| 7 | depends | piecewise | state-machine |
| 8 | next | recurrence | workflow-machine |
| 9 | all-pass | boolean AND | gate multi-assert |
| 10 | risk/reward | expected value | math-eval + oracle-gate |
| 11 | grid | matrix | sqlite-sink |
| 12 | before | DAG | core/graph.ts (the executor itself) |
| 13 | total | series | math-eval |
| 14 | valid | domain/range | gate asserts |
| 15 | improves | monotonicity | evidence-gate |
| 16 | dedupe | equivalence | config-lock |
| 17 | rank | partial order | ratio-classifier |
| 18 | distance | metric | math-eval |
| 19 | best | optimization | oracle-gate |
| 20 | stages | composition | the executor (batches ARE f∘g∘h) |

The mapping is the proof the doctrine and the kernel are ONE system: every MPSE structure has a kernel-level enforcement point; every kernel gate traces to a doctrine structure.

---

---

<!-- ═══════════════ PART 6AI: THE PROCEDURES INDEX + THE REACTIVE ROUND-TRIPS ═══════════════ -->

## PART 6AI — THE PROCEDURES INDEX (every procedure, one line each)

| procedure | does | gate |
|---|---|---|
| P3-1 cast a card | validate+execute+journal a card | PASS exit 0 |
| P3-2 author a card | envelope copy → wire → cast until PASS | 10 rules (4D) |
| P3-3 add a node kind | impl + ALL_KINDS + wiring + tests | the trio |
| P3-4 regenerate the lexicon | scan kinds+cards → lexicon.json | ≥37 entries |
| P3-5 validate a profile | validateDomainModule → [] | zero errors |
| P3-6 run the final gate | S-1..S-15 sweep | 15/15 |
| P3-7 re-extract the boilerplate | tar-branch deploy + in-tree verify | flat + green |
| P3-8 container checkpoint | plan → tar → exec scenarios → artifact | 5/5 or adjudicated |
| P3-9 wire the Llm seat | driver Layer + boundCapsFor + bracket | CAP-UNBOUND gone |
| P3-10 run a rocket | stage chain casts | born-off-spec refused |
| P3-11 embed in a host | Tags out, Layers in | the loop closes |
| P3-12 sync the repo | rsync → commit → push | receipts included |

## THE REACTIVE ROUND-TRIPS (the bus in action)

**artifact-gate:** host write event → hook-bridge → bus → the wrap evaluates → violation ⇒ `EFFECT_ARTIFACT_GATE` deny + `pta.intercept` journal row; clean ⇒ silent pass. The gate is a SUBSCRIBER — the executor never knew.

**ask-launcher (5K-8):** prompt node (ask-launcher) → `DurableDeferred.await` → the question surfaces in the tool result → the answer completes the Deferred across process death → the channel carries it downstream. Death between question and answer is SAFE.

**event-reactivate:** a completed worker re-arms on a named event → the loop continues WITHOUT a cycle edge (the graph stays a DAG; time does the looping).

---

<!-- ═══════════════ PART 6AJ: THE DELIVERY NOTE + DOC-COMPLETE ═══════════════ -->

## PART 6AJ — THE DELIVERY NOTE

This bible consolidates the six predecessor JESL docs, the full build record (W0→W10), the Full-Function Overhaul (W1→W4), the Aether embedded-agent machinery (Shadow bibles, the backend harness), and the MPSE/LASME audit doctrine — first-hand where first-hand was possible, wave-synthesized where the volume demanded it, and honest about which is which (§6U).

**The completion measure:** the bible exists, the sections are filled, the laws carry mechanisms, the pairs carry worked examples, the matrix carries real incidents, the procedures carry copy-pasteable commands, and the receipts carry paths. A fresh agent with zero context reads THIS file and operates.

**The one rule above all rules:** when this bible and the code disagree, THE CODE WINS — flag the conflict, fix the bible. The files are the only ground truth; this document is their map.

---

---

<!-- ═══════════════ PART 6AK: THE OPERATING CHEAT SHEET ═══════════════ -->

## PART 6AK — THE OPERATING CHEAT SHEET (the one-page kernel)

```
CAST      bun run cli/main.ts run <card.json>          exit 0=PASS 1=FAIL 2=refusal
VALIDATE  bun run cli/main.ts validate <card.json>     the dry refusal check
LEXICON   bun run lexicon.ts                           regenerate the index
TYPES     bunx tsc --noEmit                            exit 0 required
TESTS     npx vitest run                               424/424 required
TOKENS    exactly 8, frozen (D15)                      sweep at every gate
PURITY    zero node: in core/                          zero Date.now in core/
MANIFEST  f77b448fff1e…8ff1c                          recompute at every gate
KINDS     37, append-only registry                     getRegisteredImplSync ONLY
JOURNAL   sha256 chain, verifyChain                    tamper ⇒ verified:false
TIERS     1 = deterministic only                       2 = + bracketed generation
CAPS      Shell Fs Http Journal HashCap (CLI)          Llm = YOUR seat
CARDS     10 in algorithms/ — all cast PASS            slots mark the plug-ins
ROCKETS   idea→bible→spec→kernels→code→verify→ship     each stage a castable card
DRIVERS   cli | test | opencode | YOURS                Layer-bound caps only
```

---

<!-- ═══════════════ PART 6AL: THE TROUBLESHOOTING QUICK INDEX ═══════════════ -->

## PART 6AL — THE TROUBLESHOOTING QUICK INDEX (symptom → Part 5 row)

| symptom | row | the law behind it |
|---|---|---|
| `.stub` in real output | 1 | 2B registry single-source |
| UNKNOWN-NODE on my kind | 2 | 2B wiring authority |
| claim-gate UNEVIDENCED | 3 | 2G evidence machine |
| replay INCONCLUSIVE | 4 | 2C journal honesty |
| CAP-UNBOUND oracle/llm | 5 | 2A capability Tags |
| TIER-VIOLATION | 6 | 2G card contract |
| UNBRACKETED-GENERATION | 7 | 2I no-LLM + bracket law |
| CHANNEL-UNSET | 8 | P2-1 via key-matching |
| CYCLE | 9 | graph acyclicity |
| RegistryFrozenError | 10 | 2B append-only |
| onTestFinished | 11 | 2F vitest canon |
| vitest hang | 12 | P2-4 timing semantics |
| Transform failed | 13 | P2-5 anchored edits |
| /root/jesl in-container | 17 | P2-12 module-relative paths |
| GLIBC_2.33 | 18 | env-blocked, adjudicate |
| sha_mismatch empty | 19 | dist/index.js marker |

Full 30-row matrix: Part 5.

---

---

<!-- ═══════════════ PART 6AM: THE NODE-CONFIG QUICK RECIPES ═══════════════ -->

## PART 6AM — THE NODE-CONFIG QUICK RECIPES (copy-adapt-cast)

```jsonc
// http-request — the only network door (Http cap)
{ "id": "fetch", "type": "http-request",
  "config": { "url": "https://api.example.com/v1/data", "method": "GET", "timeoutMs": 10000 } }

// python-exec — computed pipelines (Shell-family cap)
{ "id": "py", "type": "python-exec",
  "config": { "script": "import json,sys; d=json.load(sys.stdin); print(json.dumps({'n': len(d)}))" } }

// evidence-machine — ingest + query the epistemics
{ "id": "em", "type": "evidence-machine", "config": { "ingest": "$.sourceEvents" } }

// audit-registry — the ship receipt
{ "id": "audit", "type": "audit-registry", "config": { "audit": { "kind": "ship", "target": "payload/" } } }

// workflow-machine — sub-workflow orchestration (depth-tracked)
{ "id": "wm", "type": "workflow-machine", "config": { "sub": "kernels/<stage>/workflow.json" } }

// intent-classifier — route by classified intent
{ "id": "ic", "type": "intent-classifier",
  "config": { "table": { "deploy": "ship-lane", "audit": "verify-lane", "question": "ask-lane" } } }

// escalation-memory — the policy memory
{ "id": "esc", "type": "escalation-memory", "config": { "window": 300000, "threshold": 3 } }

// synapse — decay-combined signals
{ "id": "sy", "type": "synapse", "config": { "decay": "seq", "inputs": ["a","b","c"] } }
```
Every recipe is the ADVERSARIAL MINIMUM shape — extend per the node file's contract, cast, iterate.

---

<!-- ═══════════════ PART 6AN: THE CARD-SLOT CONVENTION SPEC ═══════════════ -->

## PART 6AN — THE CARD-SLOT CONVENTION SPEC (the WORK SLOT, precisely)

```jsonc
"meta": {
  "name": "my-card", "tier": 1,
  "description": "what the card does, one sentence",
  "slots": [
    { "id": "work-slot",                       // the node id the adopter replaces
      "kind": "pipeline",                      // the stand-in kind shipped
      "instruction": "[WORK SLOT] Replace 'work-slot' (pipeline) with <real kind>
                     (config: {…}) — requires <cap> under a driver that binds it (tier N)." }
  ]
}
```
Rules: (1) the shipped card casts PASS with the stand-in — no adopter setup required; (2) the instruction names the REAL kind, its config keys, and its cap/tier requirements; (3) the stand-in is always deterministic (pipeline/math-eval/gate); (4) channel names survive the swap (the real node must emit the keys the downstream vias read). The convention is what makes a card a TEMPLATE instead of a one-off.

---

## PART 7 — VERSION HISTORY

- v3.0 (2026-09-04): THE consolidation. Absorbs the six predecessor docs (archived): EFFECT_ENGINEERING_BIBLE v2.0 (492L), JESL_EFFECT_ENGINEERING_LIBRARY (915L), JESL_KERNEL_ARCHITECTURE_BIBLE (1,786L), JESL_KERNEL_OPERATING_MANUAL (504L), JSON_EVENT_SCRIPTING_BIBLE v1.2 (1,595L, frozen filename), EFFECT_TS_RUNTIME_BIBLE (514L). Records the post-overhaul kernel (37/37, 424/424, registry single-source, 10 cards, flat boilerplate) + the Aether embedded-agent + MPSE machinery sections (wave-synthesized). Paths updated to the JESL root (folder renamed from Effect_Runtime_Kernels, 2026-09-04).
- Lineage: W0→W10 build (BUILD_REPORT.md) → Full-Function Overhaul W1→W4 (wave-audit/w0-w4.md, container-test-results.json CT1-CT5) → this bible. Spec manifest f77b448f unchanged throughout.
- v3.0 completion: §6G.1-6G.4 (Shadow/runner/macro/Hydra), §2M/§2N (the Aether + MPSE laws), §6H/6H.1 (the audit machinery + the 20 structures) were filled from FIRST-HAND reads (the backend README, the MPSE injection prompt, the Shadow Hydra + Agent bibles) after the Wave-5 explore wave wedged at spawn and was killed.


## PART 8 — ADOPTION GUIDE (day one with JESL)

### 8.1 — The 10-minute first cast

```bash
git clone https://github.com/leviathan-devops/jesl && cd jesl/kernel
bun install && bunx tsc --noEmit && npx vitest run     # prove the tree
bun run cli/main.ts run algorithms/guard.json          # your first PASS
```
Read the output once, slowly: batches (the order), results (per-node verdicts + evidence), the journal tail. You are looking at a complete, provable execution.

### 8.2 — The first week

| day | do | learn |
|---|---|---|
| 1 | cast all 10 cards; read each JSON next to its output | the envelope, channels, evidence |
| 2 | break things: edit a card into each `[JESL …]` refusal; read `field/actual/remedy` | the refusal vocabulary IS the documentation |
| 3 | author `algorithms/my-card.json` (P3-2) | config contracts, via key-matching |
| 4 | write a profile (`profiles/mine.ts`), validate it | DomainModule, cap sets |
| 5 | add one node kind (P3-3) | the registry lifecycle |
| 6 | re-extract the boilerplate (P3-7), verify in-tree | source→artifact discipline |
| 7 | bind your Llm driver (P3-9), cast `bracket.json`'s real swap | the Tier-2 seat |

### 8.3 — The 5 habits of a good caster

1. Read the node file before configuring the node — the source is the contract.
2. Name channels after the output keys they carry — the via IS the interface.
3. Gate everything that matters; a pipeline without assert-gates is unproven work.
4. Journal at the end of every card — an unjournaled run is a rumor.
5. When a refusal fires, thank it — it named the field, the actual, and the remedy. Fix the card, not the refusal.

### 8.4 — Troubleshooting entry points

- A refusal token → Part 5 matrix (30 rows, mechanism + fix each).
- A test failure → Part 4B (which cluster proves what).
- An adoption question → this Part + `README.md` in the boilerplate.
- A deep WHY → Part 2C (the physics) + the archived predecessor docs.

---

<!-- ═══════════════ PART 9: GLOSSARY ═══════════════ -->


## PART 9 — GLOSSARY

**card / spell** — a JSON workflow document (`$schema: trident-workflow-v1`) the kernel casts. **cast** — validate + execute + journal a card. **channel (via)** — the named edge carrying `upstreamOut[via]` into `inbound[via]`. **kind** — a node type in ALL_KINDS (37). **family** — a kind's class (deterministic/decision/evidence/execution/generation). **registry** — the append-only kind→impl store; the single source of truth. **replaceStubSync** — the one-way seed→real registration. **stub** — the seeded INCONCLUSIVE placeholder (all 37 replaced; the word now names only the seed). **driver** — a Layer binding capability Tags to real implementations (cli/test/opencode/yours). **cap** — a capability Tag; `requiredCaps` ⊆ driver bound set or `[JESL CAP-UNBOUND]`. **tier** — 1 = deterministic-only; 2 = + generation (bracket mandatory). **bracket** — `{contract, repair ≤ 2, floor}` — the output contract on generation nodes. **journal** — the append-only sha256-chained run record. **verdict** — PASS / FAIL / INCONCLUSIVE (a real node's honest state, distinct from a stub's fake). **evidence** — `{pattern, state, anchor}` — the triplet every verdict carries. **lexicon** — the generated index (37 kinds × 19 cards). **profile** — a DomainModule (caps + kinds + tier + brackets). **WORK SLOT** — the `meta.slots` annotation marking an adopter's insertion point. **rocket** — a kernels/ stage (idea→bible→spec→kernels→code→verify→ship). **skill rocket** — a rocket stage packaged via `emitSkill` (SKILL.md + payload + ctx + mission + anti-patterns). **MPSE** — Mathematical Pseudocode Powered Software Engineering — math-as-spec doctrine. **LASME** — the state-machines-and-gates canon. **Shadow** — the pi-SDK embedded agent system. **Aether** — the model-routing backend harness (the Llm seat's occupant). **mock-split** — the defect class where tests exercise real code but production runs stubs (killed in W2; see 2B). **fitted-to-golden** — making the test pass instead of the code right (the cardinal audit sin).

#### 6E.1 — The walkthroughs (what each card teaches)

**guard.json** — the canonical shape: `gate` (free seed acceptance) → `work-slot` (pipeline stand-in) → `triplet-writer` (`guard.work` PASS triplet) → `journal-sink`. Lesson: every spell is guard → work → prove; the via chain `seed → workOut → triplet → data` shows unique-named channels end to end.

**retry.json** — `retry-chain` (`maxRetries`, `failTimes` — emits `RETRIED`) → `fallback-chain` (emits `FALLBACK`) → sink. Lesson: resilience is two nodes, not a framework; the evidence states tell you which path fired.

**fan.json** — `parallel` (3 items) → `gate` asserting `$.count ge 3` → sink. Lesson: the join barrier is a gate on the parallel's `count` output; fan-out without a join gate is unproven work.

**oracle.json** — `math-eval` (`literal 42`) → `gate` (`$.result eq 42`) → sink. Lesson: MPSE discharge in deterministic miniature — the oracle is the expected value, the gate is the comparison, the slot documents `oracle-discharge` for cap-bound drivers.

**bracket.json** — `gate` → `pipeline` (stand-in for the tier-2 prompt) → `claim-gate` with `preSource` → sink. Lesson: the bracket pattern (gate → generate → gate) + evidence pre-arming; the slot documents the real prompt swap (tier 2, bracket.contract, Llm).

**ask.json** — `gate` seed → `pipeline` (ask-launcher stand-in) → sink. Lesson: the durable ask pattern — in production the ask-launcher suspends (DurableDeferred), the answer completes it across process death (§2D.3).

**chain.json** — `gate` seed → `work-slot` → sink; slot documents `replay-source {runId}`. Lesson: chains read history honestly — no journal rows for the runId ⇒ INCONCLUSIVE/EMPTY, and that is CORRECT.

**pre-arm.json** — `ratio-classifier` (`suppress` path) → `escalation-memory` (`track`) → `gate` → sink. Lesson: the Paragon trio — classify, remember, then gate on the memory; the decision nodes carry the policy, the gate just asserts.

**verify.json** — `parallel` (3 scenario items) → `gate` (`$.count ge 3` = every scenario PASSed) → sink. Lesson: verification IS fan-out + count-join; add per-scenario gates for per-branch evidence.

**ship.json** — `gate` → `pipeline` (prepare) → `file-io` (write) → `audit-registry` → sink. Lesson: the ship grammar — prepare, write (Fs cap), audit-register, journal; the audit-registry row is the ship's proof.

### 6F — The skill-rocket chain (kernels/)

| stage | consumes → produces | nodes (activities.ts) | the negative fixture |
|---|---|---|---|
| idea-to-bible | an idea (vars) → a bible artifact | idea validation + bible assembly | — |
| bible-to-spec | a bible → a spec artifact | bible decode + spec derivation | (the born-off-spec rule lives downstream) |
| spec-to-kernels | a spec → kernel definitions | spec validation + kernel decomposition | `fixtures/bad-spec.json`, `born-off-spec.json` |
| kernels-to-code | kernel definitions → code stubs + `sample-stubs.json` | code emission + stub scaffolding | — |
| verify | artifacts + a journal chain → verified summary | `verifyChain` + artifact checks | corruption ⇒ `verified:false` |
| ship | verified artifacts → the ship package | final packaging + audit | `artifact-{a,b,c}.txt` fixtures |

Each stage dir: `workflow.json` (the card) + `activities.ts` (nodes) + `SKILL.md` (operator card) + `fixtures/`. Generation stages are Llm-ready by contract (brackets declared), model-free by shipment (law 2I). Stage law: 2O — order is the product; `born-off-spec` is the anti-pattern the battery catches.

### 6G — The Aether embedded-agent machinery map

```
AETHER_KNOWLEDGE/ (the embedded-agent + audit canon — 199MB, 65 md files)
│
├─ Embedded_Agent_Systems/           THE SHADOW AGENT SYSTEM (4 bibles, ~350KB)
│   ├─ SHADOW_AGENT_ENGINEERING_BIBLE.md      (69KB) — the agent's role + machines
│   ├─ SHADOW_ENHANCED_TOOLS_BIBLE.md         (173KB) — tool-enhancement model
│   ├─ SHADOW_ENHANCED_TOOLS_MACRO_ARCHITECTURE.md (80KB) — the macro layers
│   └─ SHADOW_HYDRA_INTEGRATION_BIBLE.md      (29KB) — the orchestrator attach
│
├─ Boilerplate_Prototypes/
│   ├─ aether_agent_backend/          THE MODEL-ROUTING HARNESS (pi-SDK, v3.1)
│   │   ├─ src/aether-runner.ts       AetherAgent.run() — the 2-3-round loop
│   │   ├─ src/aether-sidecar.ts      the sidecar surface
│   │   ├─ src/go-key-pool.ts         5-key round-robin, rotates on 429
│   │   ├─ src/prompt-validator.ts    the validation chain
│   │   ├─ src/aether-brief-builder.ts / slot-injector / context-manager
│   │   ├─ src/capture.ts             per-agent .md session capture (C0-redacted)
│   │   ├─ ANTI_PATTERNS.md           the recorded don'ts
│   │   └─ examples/wire-into-tool.md THE consumer contract
│   ├─ JESL-Kernel-Edition-v1.0/      (prototype copy — the live one is in
│   │                                 agent_plugin_boilerplates/)
│   └─ Paragon_*/ LASME_v1/ IntelligenceLexicon-Edition-v1.0/   siblings
│
├─ MPSE/     Mathematical Pseudocode Powered Engineering (5 files, ~560KB)
│   ├─ MPSE_KNOWLEDGE_INJECTION_PROMPT.md   (6.9KB — READ FIRST, the distillate)
│   └─ KB-MPSE-00..03                       (20 structures → anti-derailment → actors)
│
└─ LASME/    the state-machines-and-gates canon (~750KB)
    ├─ 02_STATE_MACHINES_AND_GATES.md (359KB — what JESL gates formalize)
    ├─ MPSE_COMPLETE_ENGINEERING_BIBLE.md (96KB)
    ├─ INTELLIGENT_SYSTEMS_ENGINEERING_T1.md (the ISE law)
    └─ TEB_MACHINES_FOR_BEHAVIOR_ENGINEERING_T1.md (52KB)

THE JESL CONNECTION: Llm Tag (caps.ts) ⇐ Aether backend (the seat, P3-9)
                      mpse/ + scanners/ ⇐ MPSE doctrine (this law)
                      gate/state-machine nodes ⇐ LASME state-machines-and-gates
```

#### 6G.1 — THE SHADOW AGENT SYSTEM (the pi-SDK foundation — first-hand lessons)

**The foundation** (`SHADOW_AGENT_ENGINEERING_BIBLE.md`): Shadow agents run on the pi SDK (`@earendil-works/pi-agent-core` + `pi-ai`) — an agent loop over a provider chain with tools. The load-bearing lessons, battle-earned:

**THE API FAMILY LAW** (the most important lesson, :65-108): models live on API FAMILY ROUTES, not just under keys — `muse-spark` serves `/responses` (HTTP 200) and 500s on `/chat/completions` at ANY payload, while kimi-k3/glm-5.3 are completions-native. The `/v1/models` endpoint lists ALL ids across ALL families — a model can appear listed but live on a different route. This caused DAYS of "provider unresponsive" ghosts. The diagnosis: same key, same second, different routes. The fix: register through the SDK with the CORRECT family (`api: 'openai-responses'` + `openAIResponsesApi()`), NEVER a hand-rolled fetch to the wrong route.

**THE KEY SEEDING LIFECYCLE (BUG-D6, :110-134):** the step-0 probe reads `OPENCODE_GO_API_KEY` BEFORE any ShadowAgent constructor exists — key seeding in a constructor means clean boots probe KEYLESS (anonymous pings flakily tolerated upstream → silent pre-ledger deaths). The fix: MODULE-LOAD seeding in provider.ts (`seedShadowProviderEnv()` runs at import — provider.ts is imported by probe/runner/agent/barrel, so the seed precedes every consumer). Exported env vars always win over embedded fallbacks.

**THE TRANSPORT CHAIN (:233-280):** `chainedStream` wraps every call — `RETRY_ATTEMPTS=5`, `RETRY_BACKOFF_MS=2500`, retryable = `/429|rate.?limit|too many|quota|5\d\d/i`, `STALL_MS=60_000` (an AbortController + lastEventAt clock: EVERY stream event resets it; the timer fires only on true silence). The **done-verifier** catches DEGENERATE dones (a stalled-abort can make pi-ai synthesize a terminal event with no accumulated content — `ev.message?.content` not an array ⇒ `SHADOW_DEGENERATE_DONE` → next attempt). Chain exhaustion pushes a FULL assistant-message-shaped error (`SHADOW_API_UNREACHABLE: … SWAP THE API KEY`) so the loop guard catches it — the loud fail is shape-complete, never a bare string.

**THE ANTI-MONKEY-PATCH LEDGER (:282-295):** hand-rolled fetch to the wrong route ✗ (use createProvider + the family adapter) · key seeding in constructors ✗ (module-load) · suppression casts/`@ts-nocheck` ✗ (fix types, narrow with guards — the SAME law as the kernel's) · custom SSE parsing ✗ (SDK abstractions) · empty catches ✗ · fake successes ✗ (loud-fail-or-clear-pass) · sequential dispatch of concurrent agents ✗ (allSettled) · hardcoded model ids ✗ (read the catalog).

**The agent-loop lifecycle:** messages accumulate per round; the loop ends on a terminal `done` with real content; tools (`read` + batch `edit` in the polish harness) execute between rounds; the round contract is BATCH-FIRST (one call → all edits at once). Warheads (system-prompt laws like the GRAPH TOOLS USAGE LAW, §6G.1) are byte-exact contracts — MARKER-TEACHING: the model repeats markers that prove it read the prompt.

**JESL kinship:** Shadow agents are the Tier-2 population the kernel's `prompt`/`subagent-dispatch` nodes would dispatch to under a bound `Subagent`/`Llm` cap; the transport chain's stall/done/degenerate handling is the model-side mirror of the kernel's own loud-fail + done-verification discipline. Same epistemics, two layers.

#### 6G.2 — THE AETHER RUNNER: the 13-step pipeline (aether-runner.ts, first-hand)

The one-place composition rule, verbatim from the source header: *"Never scatter the stages across the codebase. One runner holds the composition — that IS the architecture."* `runAetherPipeline()` executes, for ONE agent:

1. **the tether** — sessionKey/projectId/parentSessionId/pid (globalThis → env → defaults)
2. **the sidecar lifecycle** — register → touch → handleSessionSwitch
3. **aether-memory.open({project}, {sessionKey})**
4. **the REATTACH GATE** — 3 checks; fail = the ERROR string, never a log line
5. **validate(spec)** — the CTX_FLOORS + path existence (shared validators)
6. **buildContext(memory, spec, sessionStream)** → `{chain, inference}` (memory hydration)
7. **buildBrief(spec, skeleton, inference)** — the 84-slot weave + THE SUPREMACY CONTRACT + the `[AETHER INFERENCE]` section
8. **THE PI EXECUTION LOOP** — prompt → stream (flash max, 240s timeout) → scoped tool-calls (`read_file`/`grep`/`stat` on the filepaths — read-before-write, MECHANICALLY) → results fed back → continue to the acceptance/target/rounds-cap(4); **the v10c partial-save: the best content is ALWAYS written**, the expansion+repair path is the FALLBACK
9. **silentVerify** — markers / structure / verbatim-doctrine / freshness / inference-presence; repair on unmet floors
10. **appendPrompt** — the sqlite row + the JSON mirror
11. **syncPrompt** — skipped unless a remote exists
12. **the manifest** — per-agent `{name, path, lines, sha256, validated, ready, subagentType, error?, notes?}`
13. **the tool.after COPY-PASTE hook** delivers the per-agent files

**The constants** (aether-runner.ts:92-125): `SUPREMACY_CONTRACT` (the brief's first law) · `PI_MAX_ROUNDS = 2` · `PI_ROUND_MAX_TOKENS = 16_000` · `PI_ACCEPT_LINES = 200` · `READ_FILE_CAP = 8000` · `EXCERPT_CAP = 6000`.

**The two firewalls:** the MODEL discipline (2026-08-19, verbatim: "WHAT FUCKING MOCK BRAIN") — the headless agent uses the REAL 5-provider transport; tests inject a scripted stream via the `streamFn` option (never a brain adapter, never a mock in prod). The FILESYSTEM firewall — the backend writes ONLY `OUT_DIR` + the memory root; the pi loop's tools are READ-ONLY.

#### 6G.3 — THE SHADOW-ENHANCED MACRO: seven stages, seven laws

Every shadow-enhanced tool executes the SAME seven stages (`SHADOW_ENHANCED_TOOLS_MACRO_ARCHITECTURE.md` §0.2), each with a real implementation anchor: **1 REGISTRATION + TETHER** (src/index.ts:255-298) → **2 VALIDATION** (validator.ts, 113L) → **3 BRIEF BUILDING** (brief-builder.ts, 188L — the weave: SUPREMACY CONTRACT first, then primary context, the context chain, epoch summary, KEY FACTS-must-appear, the mission, media description VERIFY-AGAINST-PIXELS, output format, grounding contract) → **4 MEMORY HYDRATION** (context-manager.ts, 80L) → **5 THE LLM CALL** (brain.ts, 189L) → **6 SILENT VERIFY** → **7 DELIVERY**. The SEVEN LAWS (§0.3) govern the pattern; violations ARE Part 7's failure modes. The decision matrix (§0.4) says when the pattern applies at all — not every tool deserves an LLM stage (the tier law, 1I, in Aether form).

#### 6G.4 — THE SHADOW HYDRA PIPELINE (the universal subagent framework)

**What it is** (`Embedded_Agent_Systems/SHADOW_HYDRA_INTEGRATION_BIBLE.md`, canon 1.0.0): a multi-layer async subagent pipeline where the FRAMEWORK carries all infrastructure — concurrent dispatch (`Promise.allSettled`), LLM transport (pi SDK + retry + stall guard + done-verifier), shared memory (SQLite, upgradeable to TencentDB), graph mapping (graphify MCP), pre/post gates (FAIL-CLOSED validation), per-agent evidence telemetry, the synthesis contract, and error isolation (one rejection never kills the batch). YOU provide only: `SubagentSpec[]` (what each agent looks for), a `SynthesizerFn` (how results merge), gate conditions, and the output builder.

**The 5-step integration** (:34-158): (1) define `SubagentSpec<Input, Output>` — id, `buildSystemPrompt`, `buildUserPrompt`, a ZOD `outputSchema` (the findings shape: `{id, category, severity: CRITICAL|HIGH|MEDIUM|LOW, file, line, evidence, description}`), `maxTokens` (64k), `maxRounds` (2), `timeout` (60s); (2) the synthesizer — merge fulfilled settlements, dedup by `(file, line, category)`; (3) gates — fail-closed validators between layers; (4) instantiate; (5) execute.

**The sequential meta-gate pattern (:160):** gates NAMED after the canon and CHAINED through shared memory — Gate 1 **LASME** stores `{candidates, verdicts, graphSlice, telemetry}` → Gate 2 **MPSE** reads it via `memory.getGateOutput('LASME')` → Gate 3 **SRO** reads both. Across runs it COMPOUNDS: run 2 audits only changed files; run 3 carries cumulative knowledge. The `SharedMemoryStore` interface swaps backends (SQLite → TencentDB-Agent-Memory) with zero pipeline changes.

**The graphify MCP integration (:182-212):** extract the codebase ONCE (`graphify extract --code-only`), serve `graph.json` via MCP, give agents `graphify:query|path|explain|subgraph` as pi-SDK tools — governed by the SYSTEM PROMPT WARHEAD (verbatim):
> "GRAPH TOOLS USAGE LAW: 1. ALWAYS query the graph BEFORE reading files. 2. EXTRACTED edges are facts; INFERRED edges are guesses — flag [INFERRED]. 3. Use graphify:path for connection tracing. 4. Use graphify:subgraph for blast-radius analysis. 5. NEVER fabricate a graph node or edge. 6. God nodes (highest degree) = single points of failure — flag +1 severity."

**The reference integration (:279+): THE CODE AUDIT TOOL** (`V443_SHADOW_HYDRA_CODE_AUDIT_L2_SPEC`) — detector agents over the graph, MPSE/LASME-gated findings, evidence-shaped output. This is the machinery lineage behind the kernel's `scanners/` (the JESL-side audit sweep) — same epistemics: findings carry `file:line` + severity + evidence, gates fail closed, memory compounds.

**The JESL kinship (why this is in the bible):** the Shadow Hydra contract IS the wave-dispatch contract this very build used (allSettled isolation, evidence-shaped returns, fail-closed gates, shared memory) — and its meta-gates (LASME→MPSE→SRO) are the doctrine layer BENEATH the kernel's `mpse/` module. A JESL card is a Hydra pipeline's deterministic sibling: same findings-shape honesty, same gate discipline, no LLM required for the deterministic stages.

### 6H — The audit machinery (MPSE) map

**The doctrine (verbatim, from `MPSE/MPSE_KNOWLEDGE_INJECTION_PROMPT.md`):**
> "Math is the spec. Code is the implementation. Tests are the proof."
> "When the natural language spec and the math disagree, the math wins. The natural language is commentary. The math is the law."
> "If a rule can't be expressed as math, it's ambiguous and will cause derailment."
> "When an agent derails: look for the missing math."

**The workflow it mandates:** idea → **mathematical pseudocode** → spec → code → test. The math is the SOURCE OF TRUTH; invariants ABORT on violation (`|all_setups| ≠ 24 → ABORT`).

**The kernel mapping (Aether doctrine → JESL code):**

| Aether MPSE concept | JESL kernel realization |
|---|---|
| rule cards (math structures as data) | `jesl/mpse/rule-cards.ts` |
| the parser (math pseudocode → structures) | `jesl/mpse/parser.ts` |
| the oracle (calibration against expected) | `jesl/mpse/oracle.ts` + `calibrate.ts` |
| invariants enforced at runtime | `oracle-gate` + `mpse-discharge` nodes; gate asserts |
| the audit sweep of code for patterns | `jesl/scanners/` (pba, pta, lsp, audit, trace) |
| anti-derailment (KB-MPSE-02) | the 8 frozen tokens + loud-fail law (2D/2H) |
| state machines and gates (LASME 359KB canon) | `gate`, `state-machine`, `circuit-breaker` nodes |
| behavior engineering machines (TEB T1) | `jesl/wraps/behavior-engine.ts` |

#### 6H.1 — The 20 MPSE structures (math → code, the complete table)

| # | the problem | the structure | the formula | the code |
|---|---|---|---|---|
| 1 | how many outputs? | combinatorics | `f(T) = N(1+P)` | `const expected = N*(1+P)` |
| 2 | this must always hold | invariant | `∀ s: sl ∈ [5,15]` | `setups.every(s => s.sl>=5 && s.sl<=15)` |
| 3 | filter the bad | set theory | `Allowed = U ∩ P ∩ T` | `u.filter(x => p.has(x) && t.has(x))` |
| 4 | score from factors | linear combination | `S = Σ wᵢxᵢ` | `reduce((a,[w,x]) => a+w*x, 0)` |
| 5 | if X then Y | implication | `BS ∧ ZFP<20% → RWL` | `if (bs && zfp<0.2) assert(rwl)` |
| 6 | between bounds | inequality | `5 ≤ sl ≤ 15` | `sl>=5 && sl<=15` |
| 7 | depends on X | piecewise | `f(x) = c₁ ? y₁ : y₂` | ternary / switch |
| 8 | next from current | recurrence | `aₙ₊₁ = f(aₙ)` | loop / reduce with carry |
| 9 | all must pass | boolean AND | `CS2 ∧ CS5 ∧ CS7` | `c2 && c5 && c7` |
| 10 | risk vs reward | expected value | `EV = P(TP)g − P(SL)l` | weighted arithmetic |
| 11 | grid of pairs × days | matrix | `M[pair][day]` | nested records/arrays |
| 12 | X before Y | DAG | `(DXY, EUR/USD) ∈ E` | topological order (the executor IS this) |
| 13 | total across entries | series | `Σ RRRᵢ·sizeᵢ` | `reduce` |
| 14 | must be valid | domain/range | `confidence ∈ [0,100]` | schema/bounds assert |
| 15 | gets better | monotonicity | `confluence↑ → confidence↑` | sorted assert |
| 16 | dedupe | equivalence | `s₁ ~ s₂ ⟺ sameKey` | Set by key |
| 17 | A better than B | partial order | `GOD_TIER ≻ HIGH` | rank compare |
| 18 | how far | distance | `d = |entry−spot|/pip` | arithmetic |
| 19 | find the best | optimization | `minimize Loss` | sort/minBy |
| 20 | pipeline stages | composition | `f ∘ g ∘ h` | function composition (the card graph IS this) |

Source: `MPSE/MPSE_KNOWLEDGE_INJECTION_PROMPT.md` (the distillate) → `KB-MPSE-00` (the full primer with examples). The kernel rule: a rule not expressible as one of these is AMBIGUOUS — express it or refuse it.

### 6I — Real paths (post-rename)

| what | path |
|---|---|
| Project root (renamed 2026-09-04) | `/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Active_Projects/JESL` |
| Kernel | `<root>/jesl/` — run everything from here |
| Cards | `<root>/jesl/algorithms/*.json` (10) · fixtures: `<root>/jesl/fixtures/` (9) |
| Registry / tokens / caps | `<root>/jesl/core/registry.ts` · `core/errors.ts:85-94` · `core/caps.ts` |
| The cast path | `<root>/jesl/cli/main.ts` → `cli/handlers.ts` → `core/{schema,graph,executor,journal}.ts` |
| Rockets | `<root>/jesl/kernels/{idea-to-bible,bible-to-spec,spec-to-kernels,kernels-to-code,verify,ship}/` |
| Lexicon | `<root>/jesl/lexicon.ts` → `lexicon.json` |
| Boilerplate | `/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/JESL-Kernel-Edition-v1.0/` (flat; manifest = provenance) |
| Master bible (this file) | `/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/KNOWLEDGE_LIBRARY/Bibles/JESL/JESL_BIBLE.md` |
| Superseded docs (archive) | `Bibles/JESL/archive/` + the six originals pending archive move |
| Aether machinery | `Bibles/Aether_Knowledge/{Embedded_Agent_Systems, Boilerplate_Prototypes/aether_agent_backend, MPSE, LASME}` |
| Overhaul evidence | `<root>/.trident/wave-audit/w0-w4.md` · `<root>/.trident/container-test-results.json` · `<root>/BUILD_REPORT.md` |
| Git | `github.com/leviathan-devops/jesl` (public, main) · local mirror `/tmp/jesl-repo` |

### 6J — Doctrine verbatim

VERBATIM operator doctrine — the law, never paraphrased:
1. "DO NOT wire any llms inside this. THE POINT IS FULLY FUNCTIONAL BOILERPLATE MACHINERY I CAN PLUG INTO ANYTHING AND START FILLING WITH DATA AND ADAPTING." — the no-LLM mandate (2026-09-03).
2. "WITHOUT OVERENGINEERING OR COMPLICATING OR SLOPPING THIS." — the simplicity bar (2026-09-03).
3. "FULLY FUNCTIONAL BOILERPLATE MACHINERY" — the completeness bar; 21 stubs was not it; 37/37 is.
4. "21 FUCKING STUBS IS NOT FULLY FUNCTIONAL" — the catalyst ruling for the overhaul (2026-09-03).
5. D26: JESL = "JSON Effect Scripting Language" (2026-09-03). D15: the 8 tokens are string-frozen — never a 9th, never a repurpose. D27: the registry is the single source of kind→impl truth (2026-09-03, born from the mock-split).
6. The one-line model, canon form: "Write a JSON file with your pipeline steps. The kernel validates it, runs each step on Effect-TS in dependency order, logs every result to a tamper-proof journal, and returns PASS or FAIL."
7. W2 fitted-to-golden precedent: "a PASS is only evidence when the path through REAL implementations is proven" — the mock-split lesson, generalized.

### 6K — Gate + test commands

```bash
cd JESL/jesl
bunx tsc --noEmit && npx vitest run                                   # the standing pair
grep -rl '@ts-nocheck' --include='*.ts' . | wc -l                     # → 0
for f in algorithms/*.json; do bun run cli/main.ts run "$f" >/dev/null || echo "FAIL $f"; done
bun run lexicon.ts
cd ../specs && cat MACRO_KERNEL_BOILERPLATE_L2_SPEC.md <(printf '\0') JESL_LIBRARY_DPL1_SPEC.md <(printf '\0') EFFECT_TS_RUNTIME_BIBLE.md <(printf '\0') JESL_EFFECT_PHASE2_DPL1_SPEC.md | sha256sum
```
Full S-1..S-15 sweep: Part 4 P3-6. Container recipe: P3-8. NEVER `bun test`; NEVER edit the 4 READ-ONLY specs (manifest f77b448f…).

### 6L — The rockets evidence chain

**The chain, wave by wave (all pasted in the audits):**
```
W0-W10  original kernel build — 10 audited waves, 336→424 tests, 4 CT checkpoints
        audits: .trident/wave-audit/w0-w10.md · BUILD_REPORT.md (597L)
W1      5 agents · 20 stubs → real impls · +88 it.effect · w1.md
W2      2 agents · cards/lexicon/profile · w2.md · ★ mock-split found+fixed (D27)
W3      3 agents · 0 @ts-nocheck · tsconfig 20 · flat boilerplate · w3.md
        ★ 2 live incidents handled: the Effect.succeed hang (hard-steer+revert),
          the cross-tree write collision (pause → owner-first → scope-lock resume)
W4      1 read-only gate agent · S-1..S-15 + digest pair · w4.md
        ★ 2 literal-vs-intent splits adjudicated (S-1 union member; purity=core scope)
CT5     container checkpoint GREEN — shark-jesl-w3-verify-2026-09-03
        3/3 runnable scenarios + tokens live · 5 env rows adjudicated BLOCKED
        artifact: .trident/container-test-results.json (CT5 block, deploySha a48ed11d…)
Git     a62896b(W1) → a868009,2d7e75e(rename) → a928cda(W2) → efdaa66(W3) → a217cb6(W4 evidence)
```
The evidence rule this chain embodies: every wave = dispatch + return-integrity check + per-hunk audit + mechanical re-verify + adversarial sweep + the raw outputs pasted. The audits ARE the receipts; this bible cites them rather than re-narrating them.

---

<!-- ═══════════════ PART 7: VERSION HISTORY ═══════════════ -->


## PART 10 — THE BUILD HISTORY (how this kernel was actually built)

### 10.1 — W0→W10: the original build (the 10-wave run)

| wave | delivered | the lesson it left |
|---|---|---|
| W0 | planning + the DPL1 chain (bible/spec/explore agents) | absorb before execute; the spec manifest discipline started here |
| W1 | core modules (schema, graph, executor, journal, registry, caps, errors) | the purity boundary drawn ONCE, correctly |
| W2 | registry + the 17 original kinds + stubs | the seed-then-replace lifecycle |
| W3 | CLI (run/validate) + the first CT checkpoint | the container evidence bar established |
| W4 | bus/channels + the journal corruption audit | JOURNAL-CORRUPT invented token caught → the sweep law |
| W5 | scanners (pba/pta/lsp/audit) + wrap skeleton | the audit machinery lands host-side |
| W6 | language-service decision + the LSP gate | floatingEffect false-positives documented; tsc stays the truth |
| W7 | mpse (parser, rule-cards, oracle, calibrate) + kernel-emit | the MPSE doctrine compiled |
| W8 | kernels/ 6 rocket stages + activities | the rockets are ordinary nodes |
| W9 | packager + wraps + drivers (opencode/hook/session) | the embedding seams |
| W10 | the ship pass + final CT + BUILD_REPORT | 336/336, manifest f77b448f frozen, UNKNOWN-PROFILE invented-token caught |

### 10.2 — The overhaul (W1-W4, 2026-09-03)

**W1 (5 agents, 20 stubs):** each agent owned disjoint node files + tests; the infra agent over-claimed its wiring (4 files never self-registered) — caught in the W2 audit, fixed by the index-wiring law. +88 it.effect; 424/424.

**W2 (2 agents + the orchestrator's kill):** the cards agent shipped 10 castable cards — but the PASSes flowed through the CLI's PASS-stub else-branch (the mock-split). The lexicon agent delivered clean. The audit's honesty notes ("handlers maps missing kinds to stub PASS") were the thread that unraveled the whole defect. Fix: registry accessor + full wiring + loud throw + stub deletion. Three cards re-fitted to REAL node contracts (the stubs had accepted anything).

**W3 (3 agents + 2 live interventions):** tsconfig landed (with 2 paper-over excludes the orchestrator root-caused and removed); typed-tests un-suppressed 13 files (the hang + the syntax corruption, both caught from stream forensics, both fixed); flatten went out-of-scope mid-run (paused, resumed scope-locked, delivered the extraction-coverage fix + the flat regeneration). The battery path bug (layout hardcode) surfaced ONLY in the container — fixed layout-independent.

**W4 (1 read-only gate agent):** ran all 15 criteria; reported 2 literal FAILs honestly (S-1's INCONCLUSIVE-word grep hitting the frozen verdict union; the strict purity walk counting host-side tooling) — adjudicated on intent with evidence, in w4.md. Zero-modification proven by the digest pair.

### 10.3 — The meta-lessons (what the build teaches about building)

1. **The audit layer catches what the build layer cannot see.** Every material defect (the mock-split, the over-claimed wiring, the fitted cards) was found by AUDITING returns, never by the builders self-reporting.
2. **Streams over status.** Agent state came from session-stream forensics (part counts, tool tails) — never from tracker optimism or agent prose.
3. **One file, one owner.** Every collision cost hours; every disjoint wave cost minutes.
4. **The container is the honest mirror.** Host-green masked three portability defects until CT5.
5. **Invented vocabulary is the recurring sin.** The token sweep ran at every gate because every era produced a new invented token.
6. **Loud fails are the product.** DB_OPEN_FAIL, CHANNEL-UNSET, CAP-UNBOUND — every "annoying refusal" was the system correctly refusing to lie.

---

<!-- ═══════════════ PART 6B-EXT: KIND DOSSIERS ═══════════════ -->


## PART 10B — ADVANCED: EXTENDING JESL (the three extension surfaces)

### 10B.1 — Custom drivers (new capability sources)

A driver is a Layer file in `drivers/`: build real implementations for the Tags your host can honor, merge them (`Layer.mergeAll`), register the driver name in `args.ts` + `handlers.ts boundCapsFor`. The Aether backend (§6G) is the reference for the Llm seat; cli-live.ts for everything else. Laws: real implementations only (2E); honor-what-you-bind; the executor refuses the rest.

### 10B.2 — Custom scanners (new audit surfaces)

A scanner subscribes to the bus (channels.ts/bus.ts) and turns observations into evidence rows the verify stage consumes. The three canon scanners (PBA/PTA/Effect-LSP) share ONE busbar (§2D, 2E.8) — the LSP rule→family map is PORTED between scanners, never forked. A new scanner = a new detector family (law 1A): it DETECTS, the gates DECIDE.

### 10B.3 — Custom kernels (new rocket stages)

Copy a rocket stage dir (workflow.json + activities.ts + SKILL.md + fixtures/), rename, rewire the activities to your stage's semantics, register the nodes, add the negative fixture (what your stage REFUSES), keep the SKILL.md honest. The stage slots into the chain by consuming the prior stage's output channels — the chain is dataflow, not convention.

### 10B.4 — The Aether integration (the model seat, assembled)

```
JESL card (tier 2, bracket) 
   → prompt node (Llm cap) 
      → YOUR driver's LlmLive 
         → aether_agent_backend AetherAgent.run({promptFilePath})
            → provider chain (opencode-go primary → cycler → nvidia → or → inferx)
            → 2-3 rounds, batched edits, file-on-disk output
         → bracket check (prompt.ts:69-84) validates the return
      → verdict from the validated output
```
The seams: JESL never knows Aether exists (Tag boundary); Aether never knows JESL exists (file boundary). Both sides keep their own journals. The operator owns the single integration file.

---

<!-- ═══════════════ PART 2F-EXT: EXECUTION INTERNALS ═══════════════ -->


## PART 10C — ARCHITECTURE DECISION RECORDS (why it is the way it is)

**ADR-1 — Effect-TS as the only runtime.** Alternatives rejected: plain async (no typed errors, no layered caps, wall-clock everywhere); XState alone (state machines without the IO grammar); a custom interpreter (a second runtime — banned by the Phase-2 bind). Effect won on: typed R/E channels (the cap system is TYPES), Layer composition (drivers), injected Clock (determinism), and the ecosystem (@effect/vitest, @effect/workflow for durables).

**ADR-2 — JSON cards over a DSL.** A DSL (Rhai-era) is runtime-validated; JSON is authoring-time validated (law 1E). Cards are also diffable, reviewable, and host-portable — the document layer has ZERO code. The expressive reach was proven equivalent (§2D.7).

**ADR-3 — The append-only registry with seeded stubs.** Seeding stubImpl for all 37 makes gaps VISIBLE (TODO anchors); replaceStubSync makes fills ONE-WAY (no silent swaps, family-locked); the append-only rule means a v1 card runs on a v2 registry. The alternative (deleting kinds / renaming) breaks every shipped card.

**ADR-4 — The journal as the only truth.** Prose outputs drift; sha256 chains do not. Every verdict cites its journal anchor; `covers()` makes verified runs replayable at zero cost; tampering is detectable, not just discouraged.

**ADR-5 — The 8-token refusal vocabulary.** Error hierarchies grow; token sets stay matchable. The freeze (D15) lets scripts, gates, and tests match refusals BYTE-EXACTLY. The recurring invented-token failures (W3/W4/W10) are the empirical proof the freeze is necessary.

**ADR-6 — No LLM in the kernel.** The product is MACHINERY the operator fills. Any embedded model would: pin the kernel to a provider, leak keys, and make verdicts unfalsifiable. The `Llm` Tag + bracket contract give the shape without the dependency.

**ADR-7 — Flat boilerplate via extraction, not templates.** Templates drift from the source; extraction with a manifest makes the boilerplate a BUILD ARTIFACT with provenance (sourceDir, digest, filesCopied). The Wave-3 flat regeneration is the proof: 182 files, one command, independently green.

**ADR-8 — The scanners as bus subscribers, not executor stages.** Policy (Paragon banks, artifact-gate) watches; the executor runs. Embedding policy INTO execution would couple every card to every policy; the bus keeps both composable.

---

<!-- ═══════════════ PART 10D: WORKING EXAMPLES (annotated listings) ═══════════════ -->


## PART 10D — WORKING EXAMPLES (annotated listings)

### 10D.1 — mech-gate.json (the canonical minimal cast)

```json
{ "$schema": "trident-workflow-v1",
  "meta": { "name": "mech-gate", "tier": 1 },
  "nodes": [
    { "id": "gateA", "type": "gate" },
    { "id": "triplet", "type": "triplet-writer",
      "config": { "triplet": { "pattern": "mech.gate", "state": "PASS", "anchor": "mech-gate:1" } } },
    { "id": "gateB", "type": "gate",
      "config": { "asserts": [{ "path": "$.triplet.state", "op": "eq", "value": "PASS" }] } },
    { "id": "sink", "type": "journal-sink" } ],
  "edges": [
    { "from": "gateA",    "to": "triplet", "via": "seed" },
    { "from": "triplet",  "to": "gateB",   "via": "triplet" },
    { "from": "gateB",    "to": "sink",    "via": "data" } ],
  "vars": {} }
```
Line-by-line: `gateA` accepts the seed (no config = accept-all — the NO-SEED guard is satisfied by an edge, not a prayer); `triplet` writes the PROVABLE CLAIM (`mech.gate` PASS at anchor `mech-gate:1`); `gateB` READS the claim back through the `triplet` channel and asserts its state — the proof loop; `sink` commits. The channels: `seed` (edge semantic: the start), `triplet` (the outputs key MATCHES the via — the P2-1 rule), `data` (a free name — nothing reads it downstream, it exists for the journal's causality).

### 10D.2 — a bad fixture, annotated (bad-cycle.json)

```json
{ "nodes": [ {"id":"a","type":"gate"}, {"id":"b","type":"gate"}, {"id":"c","type":"gate"} ],
  "edges": [ {"from":"a","to":"b","via":"x"}, {"from":"b","to":"c","via":"y"},
             {"from":"c","to":"a","via":"z"} ] }
```
The graph compiler walks a→b→c→a: the cycle is STRUCTURAL, so the refusal is `[JESL CYCLE] node=a field=edges actual=cycle through [a→b→c] remedy=break the cycle with a gate, or re-arm via event-reactivate` — exit 2, zero journal rows. The remedy names BOTH legal loops: a gate (synchronous break) or event-reactivate (time-based re-entry). The fixture exists so the battery PROVES the refusal every run.

### 10D.3 — the fireball (the physics compiled — from the lore bible §3.5)

```json
{ "$schema": "trident-workflow-v1",
  "meta": { "name": "fireball-spell", "tier": 1, "seed": { "channel": "target" } },
  "nodes": [
    { "id": "target-lock", "type": "gate",
      "config": { "asserts": [{ "path": "$.target.zone", "op": "contains", "value": "hostile" }] } },
    { "id": "price", "type": "math-eval",
      "config": { "expr": { "_tag": "mul", "left": { "_tag": "literal", "value": 0.75 },
                            "right": { "_tag": "var", "name": "power" } } } },
    { "id": "release", "type": "shell-exec",
      "config": { "cmd": "render_fireball --at ${target.zone} --power ${power}", "timeoutMs": 5000 } },
    { "id": "resolve", "type": "gate",
      "config": { "asserts": [{ "path": "$.release.exitCode", "op": "eq", "value": 0 }] } },
    { "id": "record", "type": "triplet-writer",
      "config": { "triplet": { "pattern": "spell.fireball", "state": "CAST",
                               "anchor": "fireball:release:exitCode=0" } } } ],
  "edges": [
    { "from": "target-lock", "to": "price",   "via": "target" },
    { "from": "price",       "to": "release", "via": "power" },
    { "from": "release",     "to": "resolve", "via": "release" },
    { "from": "resolve",     "to": "record",  "via": "data" } ],
  "vars": { "target": "zone-A", "power": 10 } }
```
The 9 physics stages annotated: 1-3 INTENT/ACQUISITION/STRUCTURING = meta + the node set; 4 PRICING = the `price` node (the cost function IS a node); 5 PRE-FLIGHT = `target-lock` + `resolve` (the bracketing gates); 6 RELEASE = `release` (Shell-cap, timeoutMs); 7 RENDER = outputs through channels; 8 SETTLE = budget consumed; 9 RECORD = `record` triplet + the journal chain. One card, the whole physics.

---

<!-- ═══════════════ PART 4E: OPERATOR PROCEDURES (the daily loop) ═══════════════ -->


---

<!-- ═══════════════ PART 10E: THE CLOSING ═══════════════ -->

## PART 10E — THE CLOSING

The JESL kernel is a JSON Effect Scripting Language runtime where every registered kind does real work, every verdict is journaled behind a sha256 chain, every refusal is one of eight frozen tokens with a remedy, and the registry is the single source of truth nothing may fork. The cards prove it casts; the lexicon proves it is searchable; the profiles prove it configures; the boilerplate proves it ships; the rockets prove it scales from an idea to a shipped package; the Aether layer proves it hosts intelligence without containing it.

**The numbers, final:** 37/37 kinds · 424/424 tests (39 files) · tsc 0 with all files checked · zero @ts-nocheck · 10/10 cards cast PASS with zero stub patterns · 8/8 frozen tokens · spec manifest f77b448f through 14 waves · 5 green container checkpoints · the receipts on disk and on github.com/leviathan-devops/jesl.

**The standing invitation:** the machinery is full-functional boilerplate. Plug in your data, your capabilities, your model — and cast.

---


---

<!-- ═══════════════ PART 6AK-2: THE EXECUTION FAMILY WORKED EXAMPLES ═══════════════ -->

## PART 6AK-2 — THE EXECUTION FAMILY WORKED EXAMPLES (the world-touching kinds)

```jsonc
// shell-exec — bounded command (Shell cap; the DRIVER owns timeout enforcement)
{ "id": "probe", "type": "shell-exec",
  "config": { "cmd": "bun test tests/battery.test.ts --reporter=json", "timeoutMs": 60000 } }
// evidence on success: { pattern: "shell-exec", state: "PASS", outputs: { stdout, exitCode: 0 } }

// file-io write — the artifact pattern (Fs cap)
{ "id": "emit", "type": "file-io",
  "config": { "op": "write", "path": "payload/mission.md", "body": "# MISSION\n…" } }
// file-io read — feed downstream
{ "id": "ingest", "type": "file-io", "config": { "op": "read", "path": "payload/ctx.json" } }

// http-request — the network door (Http cap; never points at a model provider — law 2I-3)
{ "id": "status", "type": "http-request",
  "config": { "url": "https://status.internal/health", "method": "GET", "timeoutMs": 8000 } }

// python-exec — computed transforms
{ "id": "calc", "type": "python-exec",
  "config": { "script": "import json,sys; rows=json.load(sys.stdin); print(json.dumps({'total': sum(r['v'] for r in rows)}))" } }
```
The family law in practice: these four are the ONLY nodes that touch the world, each behind its Tag, each refusing loud when the world refuses them (DB_OPEN_FAIL, exit≠0, HTTP errors — all FAIL verdicts with reasons, per law 2H).


### The verification mini-example (putting three kinds together)

```jsonc
{ "id": "run-tests",  "type": "shell-exec",     "config": { "cmd": "npx vitest run 2>&1 | tail -4", "timeoutMs": 120000 } },
{ "id": "assert",     "type": "gate",
  "config": { "asserts": [ { "path": "$.stdout", "op": "contains", "value": "424 passed" },
                            { "path": "$.exitCode", "op": "eq", "value": 0 } ] } },
{ "id": "prove",      "type": "triplet-writer",
  "config": { "triplet": { "pattern": "verify.battery", "state": "PASS", "anchor": "run-tests:0" } } }
```
Run → assert the NUMBER (the MPSE law: the count, never the prose) → write the provable claim. Three nodes, one complete verification spell — the pattern every verify stage in the rockets generalizes.

<!-- DOC-COMPLETE: JESL_BIBLE.md v3.0 — the master canon. Supersedes the six predecessors (archived). Grounded in the W4-gate kernel state (2026-09-04). -->
