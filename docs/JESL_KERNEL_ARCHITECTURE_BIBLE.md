# JESL KERNEL — THE COMPLETE ARCHITECTURE BIBLE

> **Trigger:** Any agent that needs to BUILD on, DEBUG, EXTEND, or understand the MacroKernel_Edition-v1.0 architecture.
> **Duty:** Read fully. Then operate. This is the single self-contained reference — the canon that survives compaction.
> **Standard:** BUG_HUNTER_ARCHITECTURE_BIBLE.md (4002L) — this bible targets the same density.
> **Version:** v1.1 — filled post-W10 (2026-09-03) from the source tree + the 6-agent absorb wave. Every claim carries a file:line anchor into `jesl/` or the evidence artifacts.

---

## THE CRITICAL DISTINCTION — READ THIS FIRST

**JESL is a LIBRARY, not a plugin.** The `jesl/` directory IS the product. The CLI, the profiles, the host bindings, the lifecycle kernels — they are all compositions of the same core primitives. There is no "plugin" to install; the kernel IS the package. The consumer imports `core/executor.ts` and calls `runProgram(doc, ctx)`.

**JESL = JSON Effect Scripting Language** (D26, 2026-09-03 — the operator renamed the expansion from "JSON Event Scripting Library"; the acronym and the 8 frozen tokens are UNCHANGED).

**Effect-TS is the ONLY runtime.** Every function returns an `Effect<A, E, R>`. There is no `async/await`, no `Promise.allSettled`, no `setTimeout` in core. The single `Effect.runPromise` lives in `cli/main.ts:26` (the driver edge). Law 3: construction ≠ execution.

**The canon line** (bible 2E.0 :289): *JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime.*

---

## THE TABLE OF CONTENTS

```
PART 0:  THE CURRENT STATE (version, gates, what works, what doesn't)
PART 1:  THE KERNEL IN ONE BREATH
PART 2:  THE ARCHITECTURE IN ONE DIAGRAM
PART 3:  THE CORE MODULES (deep dive: 10 modules)
PART 4:  THE NODE SYSTEM (33 kinds, the executor loop, the journal)
PART 5:  THE DRIVER SYSTEM (CliLive, OpenCodeLive, hook-bridge, SessionLive)
PART 6:  THE MPSE BRIDGE (parser → rule-cards → oracle → calibrate → emit)
PART 7:  THE LIFECYCLE KERNELS (6 kernels: idea → ship)
PART 8:  THE PACKAGER (3 emitters + the boilerplate extraction)
PART 9:  THE SCANNERS (PBA, PTA, LSP, audit, trace)
PART 10: THE PROFILES + BINDINGS
PART 11: THE TESTING ARCHITECTURE (336 tests, the battery, the container checkpoints)
PART 12: THE EVIDENCE: WHAT WAS PROVEN AND HOW
```

---

# PART 0: THE CURRENT STATE

## 0.1 The version and the checkpoint

| Fact | Value | Source |
|---|---|---|
| Edition | MacroKernel_Edition-v1.0 | BUILD_REPORT.md:1 |
| Final tree digest | `681bf8696924a040` (109 .ts files) | BUILD_STATE.md §2 W10 row |
| Final tarball | `30fa9ec4c12b4ce9f2c049f5d233428d52836e81bff53d4a125ebfcd34b29573` | container-test-results.json W10_FINAL |
| Final container | `shark-effect-kernels-w10` (runtime-grade-container-sandbox:master, bun 1.3.14, node v20.20.2) | container-test-results.json:190 |
| Spec-set manifest | `f77b448fff1ea3f38524949c09c3b0d89657e5cc90131f990b32d574f8a8ff1c` — STABLE through all 10 waves (zero drift) | EVIDENCE_STATE §1; recomputed 2026-09-03 this session |
| The last verified state | THE SHIP GATE GREEN — the product is shippable | RUNNING_BUILD_LOG [2026-09-03T02:20+04] |

The spec manifest recompute command (run it to verify zero drift):

```bash
cd ROOT/specs && cat MACRO_KERNEL_BOILERPLATE_L2_SPEC.md <(printf '\0') JESL_LIBRARY_DPL1_SPEC.md <(printf '\0') EFFECT_TS_RUNTIME_BIBLE.md <(printf '\0') JESL_EFFECT_PHASE2_DPL1_SPEC.md | sha256sum
# expect f77b448fff1e…8ff1c
```

## 0.2 The mechanical gates (the last verified state)

| Gate | Command | Expected | Verified |
|---|---|---|---|
| Type-check | `cd jesl && bunx tsc --noEmit` | exit 0 | 2026-09-03 this session (`TSC_EXIT:0`) |
| Unit battery | `cd jesl && npx vitest run` | 336 passed (34 files) | 2026-09-03 this session (16.62s) |
| The 11-row battery | `bun run tests/battery.ts <out>` (or via battery.test) | pass:11 fail:0 blocked:0 | W10_FINAL [CT] in-container |
| Happy path | `bun run cli/main.ts run fixtures/mech-gate.json` | `"verdict":"PASS"` exit 0 | W10_FINAL [CT] T3 |
| Spec drift | the manifest recompute above | `f77b448f…` | 2026-09-03 this session |
| Tree digest | `cd jesl && find core nodes tests cli drivers scanners workflow packager wraps mpse kernels profiles bindings boilerplate -name "*.ts" \| sort \| xargs sha256sum \| sha256sum` | `681bf869…` | W10 close |

## 0.3 What IS working (verified at runtime — the W10_FINAL [CT] rows)

Every row below is a container-verified behavior (container-test-results.json, W3/W5/W6/W10_FINAL; 28 flat scenario rows total — the "11/11" battery rows aggregate into 6 T-rows per later checkpoint):

| Behavior | Pass token (tool-result context) | Checkpoint |
|---|---|---|
| The full unit battery in a clean container | `Tests 336 passed (336) — exit 0` | W10 T1 |
| The executable 11-row battery | `pass:11 fail:0 blocked:0 — S1-S9+A1-A2 all PASS` | W10 T2 |
| mech-gate happy path through REAL nodes | `T3 exit 0, "verdict": "PASS"` | W3/W5/W6/W10 T3 |
| The 4 refusal fixtures, exact tokens, exit 2 | `[JESL UNKNOWN-NODE]` `[JESL CYCLE]` `[JESL TIER-VIOLATION]` `[JESL UNBRACKETED-GENERATION]` each exit 2 | W3 T3 / W5 T4 |
| CAP-UNBOUND loud-fail, NO artifact | `T4: 2 tok=2 art=0` | W3 T4 |
| Replay clean | `"verified": true` exit 0 | W3 T5 |
| The ask-launcher roundtrip (criterion 11) | `tests/driver.test.ts Tests 12 passed (12)` | W3 T6 |
| The scanners coexistence | `23 passed (23) across scanners-pba-pta + scanners-lsp-audit` | W3 T7 |
| The corrupted-journal adversarial | `A1_EXIT:1 "verified": false` | W3/W5/W6/W10 A1 |
| Usage-token hygiene | `A2/A3_EXIT:2 JESL=0` (zero bracketed tokens in usage errors) | W3 A3 / W5/W6/W10 A2 |
| The boilerplate adoption dry-run | `Tests 6 passed (6) — the copy-and-customize proof` | W10 T4 |
| The TEST_EVASION pre-arm deny | `tests/wraps.test.ts 12 passed — TEST_EVASION pre-arm deny` | W6 T4 |

## 0.4 What is NOT yet working (the honest blockers)

| Residual | Detail | Where recorded |
|---|---|---|
| 21 structural stubs | Return INCONCLUSIVE with anchor `TODO:<kind>:1` — the remaining deterministic kinds (stubs.ts:18-43) | BUILD_REPORT honest residuals |
| `@ts-nocheck` on 4 files | battery.ts:1, battery.test.ts:1, scanners-pba-pta.test.ts:1, scanners-lsp-audit.test.ts:1 (the @effect/vitest TestServices generic variance) + the 6 kernel activities carry it per the W8 agents | tests-agent return §1; BUILD_REPORT #1 |
| tsconfig include is per-directory explicit | mpse/ enters via test imports; the language-service plugin is OUT of the main tsconfig (14 false-positive floatingEffects in tests would break tsc 0) | BUILD_REPORT #2; w6 residuals |
| DurableDeferred ask is test-mode durable | The journal substrate works (ask row persists, answer row resumes, counter 1); the WorkflowEngine process-death persistence is future work | w4 residuals; BUILD_REPORT #3 |
| @effect/ai installed but NOT imported | The Llm cap abstraction (core/caps.ts:21-22) stands alone; @effect/ai is version-pinned for future use per DD24 | BUILD_REPORT #8 |
| W1 tracker stale "stuck" alert | `w1-journal-registry-nodes` shows STUCK_NO_ACTIVITY — tracker lag; that agent completed, was harvested, audited at w1.md | BUILD_REPORT #5 |
| DPL1 front-matter stale "989L" | The bible is actually 1,595L (v1.2); A2 left the stale count (out of scope) | BUILD_REPORT #6 |
| ship hash naming | `ShipManifest.sha256` values come from `simpleHashExport` (FNV-style), not true sha256 — behavior consistent, name overstates crypto | kernels-agent §5 K6 |
| boilerplate double-nesting | The W10 extraction wrote `src/<dir>/<dir>/*.ts` (74 files double-nested); the adoption guide documents the layout | fixtures-agent §1 PART B |
| w9.md was truncated (50L) | REBUILT 2026-09-03 (§§1-5 reconstructed from canon; §§6-9 original) | w9.md header note |

## 0.5 The dist SHA chain (the fingerprint record — append-only)

| Wave | Tree digest | Files | Tests | Tarball (container waves) |
|---|---|---|---|---|
| W1 | `12ffbb3d78f831c3` | 36 | 104 | — |
| W2 | `e07eaf5c` | 46 | 129 | — |
| W3 | `c154678b67fc9e31` | 59 | 164 | `235a08d2…90fe3` |
| W4 | `408f7500e63d33df` | 64 | 184 | — |
| W5 | `b7ab2cbc` | 71 | 211 | `aab37463…ac2a` |
| W6 | `c80f56a9` | 77 | 233 | `dcabd97c…01a54` |
| W7 | `01dc9691` | 87 | 275 | — |
| W8 | `02aac5b0f556cb71` | 99 | 314 | — |
| W9 | `c96aeb38` | 107 | 330 | — |
| W10 | `681bf8696924a040` | 109 | 336 | `30fa9ec4…29573` |

Every step ADDITIVE — zero regressions. The audit chain: `.trident/wave-audit/w0.md` … `w9.md` (w10's evidence lives in BUILD_REPORT.md + the W10_FINAL container rows).

---

# PART 1: THE KERNEL IN ONE BREATH

## 1.1 What the kernel actually is

JESL is a workflow engine where you author JSON pipelines, the kernel validates them via Effect Schema, builds the dependency graph, executes nodes in dataflow-readiness order on Effect fibers (capped at 15), journals every step to a sha256-chained evidence log, and returns a verdict. The 33 registered node kinds range from gate assertions to shell commands to AI calls. The journal proves what happened and enables replay (`covers(docHash, seed)` — invoke counter 0 on replay). The capability model (Context.Tags + driver Layers) means the same kernel runs identically under real I/O (CliLive), in-memory stubs (TestLive), or the opencode host (OpenCodeLive).

The one-paragraph thesis (bible §0.1 :27): *Rhai gives grok an imperative script; JESL gives us a machine-validatable graph over an already-runtime-grade substrate — strictly more powerful, because our nodes ARE the proven machines.*

The dataflow-readiness definition (bible §2.6 :266): *Every edge names a channel (via: "claims"); the context holds a channel store; a node becomes ready when ALL its inbound channels are written. The executor fires ready nodes as one allSettled batch; outputs write more channels, waking more nodes.* — implemented in Effect form: `Effect.forEach(batch, perNode, {concurrency: maxFiring})` (executor.ts:224).

## 1.2 What the kernel IS NOT

- **NOT a general-purpose scripting language** (D2/Law 1E: the graph is machine-checkable; Rhai/JS eval is banned — bible :100-103 forbidden list)
- **NOT a GUI/visual editor** (D13: no custom tsserver fork, no mermaid — the LSP arrives via CLI wrap + patch)
- **NOT a standalone app** (it is a LIBRARY — the consumer imports core/executor.ts; the CLI is one driver edge)
- **NOT a second runtime** (Effect is the ONLY kernel; XState/Promises are projectors or edges — E10)
- **NOT auto-discovering** (it executes what the doc declares — no implicit magic)

## 1.3 The illusions that kill kernel-based engineering (adapted from BUG_HUNTER_ARCHITECTURE_BIBLE)

1. **"The kernel auto-discovers what to do."** It executes what the doc declares — readiness from edges, verdicts from nodes. Nothing else.
2. **"The 33 kinds all work."** 16 are implemented (12 full-behavior + 4 execution); the rest are INCONCLUSIVE stubs (stubs.ts). A stub is not a working node.
3. **"The 336 tests prove the kernel is correct."** They prove the CONTRACTS hold (tokens byte-exact, chain verifies, diamond batches). The MPSE discharge matrix proves the MATH. The oracle proves correctness; the tests prove the machinery.
4. **"The journal proves correctness."** It proves WHAT happened (the sha256 chain), not WHETHER it was right — the oracle discharge is the correctness instrument (mpse/oracle.ts).
5. **"The container checkpoint is the audit."** It is the GATE, not the audit — the wave audits (.trident/wave-audit/w0-w9.md) are the audit; the container rows are the runtime proof behind them.

## 1.4 The nine laws (bible PART 1, 1A-1I — verbatim, each with its Effect twin per 9G)

| Law | Verbatim core | Effect twin (9G :1562-1570) |
|---|---|---|
| 1A SEPARATION (:69-74) | each node EXACTLY ONE role: detect/decide/generate; NEVER detector decides; NEVER generator gates its own output | E8 — EffectLsp family map; P3-6/P3-7 |
| 1B JOURNAL (:75-80) | journal every node `{ts,run,node,kind,verdict,evidence}`; NEVER judge by prose — assert against rows; source discriminator on every row | E5 — journal sha256 chain; S9 invoke 0 |
| 1C EVENT-FEEDBACK (:81-85) | observation nodes on the ONE event hook; NEVER poll where an event exists | EventBus — RING_CAP 50 |
| 1D LOUD-FAIL (:86-90) | `{ready:false, errors:[named]}` never a substitute artifact; INCONCLUSIVE is a fail-state | Schema.TaggedError + P3-12 |
| 1E SCHEMA-GATE (:91-95) | schema-validate at authoring; NEVER embed a scripting language; compiler-style diagnostics with field+remedy | E4 — decodeUnknown BEFORE any fiber |
| 1F CONCURRENCY (:96-101) | independent nodes in parallel; per-node failure in ITS row. **THE EFFECT TWIN (:100):** `Effect.forEach / Exit`, not `Promise.allSettled` in core | E6 — forEach(15) + Exit/partition |
| 1G PORTABILITY (:102-106) | resolve `type` through the registry; templates carry structure, args carry context | Layer-swapped caps; registry append-only |
| 1H ORACLE (:107-111) | gate build-workflows with the oracle table; NEVER let the subagent see the oracles; refuse generate without oracles | oracle-gate as Effect.sync; MPSE integer equality |
| 1I TIER (:112-116) | lowest tier wins; Tier 1 forbids LLM nodes; a Generation node whose output is a verdict is a mis-tier | E9 — TIER-VIOLATION / UNBRACKETED-GENERATION |

## 1.5 The settled decisions D1-D15 (the canon spine)

| ID | Verbatim lock | Anchor |
|---|---|---|
| D1 | the library is the product — the asks are USE-CASE FAMILIES | DPL1 :24 |
| D2 | core is pure (zero host imports); hosts are drivers | DPL1 :24 |
| D3 | effects are capability interfaces bound by drivers (CAP-UNBOUND loud) | DPL1 :24 |
| D4 | ONE execution semantic: dataflow readiness over named channels + the bus | DPL1 :24 |
| D5 | the journal is the run (evidence + replay + resume in one artifact) | DPL1 :24 |
| D6 | one document emits three targets (plugin tool / tool-chain / skill directory) | DPL1 :24 |
| D7 | append-only registry + versioned doc schema = the compat contract | DPL1 :24 |
| D8 | MathExpr is the IR — JESL math nodes compile to the 24-kind grammar | DPL1 :24 |
| D9 | Effect is the kernel — invoke returns Effect, never raw Promise in core | DPL1 :180 |
| D10 | caps ↔ Context.Service/Layer; CAP-UNBOUND = missing R | DPL1 :181 |
| D11 | durable runs (pause, ask-launcher, generation replay) use Workflow+Activity; ephemeral stays scoped fiber | DPL1 :182 |
| D12 | Paragon PBA/PTA wrap existing math as services — never rewritten | DPL1 :183 |
| D13 | Effect LSP via CLI wrap + patch — never a tsserver fork | DPL1 :184 |
| D14 | additive docs — no law/catalog/fixture deleted | DPL1 :185 |
| D15 | Schema dual-run — codecs migrate WITHOUT renaming the [JESL …] codes | DPL1 :186 |

Operator rulings of record: D25 BUILD GO ("ABSORB. THEN EXECUTE. Do not stop until the ship package is complete.") and D26 the JESL rename (DECISION_CHAIN.md:114-119).

---

# PART 2: THE ARCHITECTURE IN ONE DIAGRAM

## 2.1 The macro architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                MacroKernel_Edition-v1.0                           │
│              109 .ts files · 336 tests · 34 files                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─── CORE (10 modules) ──────────────────────────────────────┐  │
│  │                                                             │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │  │
│  │  │ schema │ │ graph  │ │channels│ │  bus   │ │  caps  │  │  │
│  │  │ decode │ │ DAG +  │ │ data-  │ │ glob   │ │ Context│  │  │
│  │  │ +valid │ │batches │ │ flow   │ │ pub/sub│ │ .Tags  │  │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘  │  │
│  │                                                             │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │  │
│  │  │ errors │ │executor│ │journal │ │registry│ │evidence│  │  │
│  │  │ 8 frozen│ │Effect. │ │sha256  │ │ append-│ │ 8-kind │  │  │
│  │  │ tokens │ │forEach │ │ chain  │ │ only   │ │machine │  │  │
│  │  │        │ │ conc:15│ │+covers │ │ 33 kind│ │RING 50 │  │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─── NODES (33 kinds) ─┐  ┌─── CLI ─────────────────────────┐   │
│  │ gate, event-filter,   │  │ jesl run/validate/replay        │   │
│  │ capture, pipeline,    │  │ single Effect.runPromise edge   │   │
│  │ parallel, retry,      │  │ exit 0=PASS · 1=FAIL · 2=REFUSE │   │
│  │ fallback, pause,      │  └─────────────────────────────────┘   │
│  │ journal-sink, triplet,│                                        │
│  │ state-machine,        │  ┌─── DRIVERS ─────────────────────┐   │
│  │ math-eval, prompt,    │  │ CliLive (real spawn/fs/http)     │   │
│  │ shell-exec, python,   │  │ OpenCodeLive (HostTransport)     │   │
│  │ http, file-io         │  │ SessionLive (Deferred ask)       │   │
│  └───────────────────────┘  │ hook-bridge (bus ← hook events)  │   │
│                              └─────────────────────────────────┘   │
│  ┌─── PACKAGER ─────────┐                                        │
│  │ tool / chain / skill │  ┌─── SCANNERS ────────────────────┐   │
│  │ one doc → 3 targets  │  │ PBA (5-family detection)        │   │
│  └──────────────────────┘  │ PTA (deny-unless-armed)          │   │
│                              │ LSP (real CLI wrap v0.87.2)     │   │
│  ┌─── WORKFLOW ─────────┐   │ audit (claim↔evidence)           │   │
│  │ Workflow.make         │   │ trace (per-run timeline)          │   │
│  │ JeslRun               │   └─────────────────────────────────┘   │
│  │ idempotencyKey:       │                                        │
│  │  docHash:seedHash     │  ┌─── WRAPS ──────────────────────┐   │
│  └──────────────────────┘   │ BehaviorEngine (arm)             │   │
│                              │ ToolEngine (intercept)           │   │
│  ┌─── MPSE BRIDGE ──────┐   │ effect-lsp (CLI wrap v0.87.2)   │   │
│  │ 24-kind MathExpr      │  │ artifact-gate (PTA)              │   │
│  │ oracle registry       │  └─────────────────────────────────┘   │
│  │ calibrate (D17)       │                                        │
│  │ kernel/stub emit      │                                        │
│  └──────────────────────┘                                        │
│                                                                   │
│  ┌─── KERNELS (6) ──────┐  ┌─── PROFILES ───┐ ┌── BINDINGS ──┐  │
│  │ idea→bible            │  │ trident (t1)   │ │ HostBinding  │  │
│  │ bible→spec            │  │ trading (t2)   │ │ OpenCode     │  │
│  │ spec→kernels (D3)     │  │ sales   (t2)   │ │  Binding     │  │
│  │ kernels→code          │  └────────────────┘ └──────────────┘  │
│  │ verify                │                                        │
│  │ ship                  │  ┌─── BOILERPLATE ─────────────────┐   │
│  └──────────────────────┘  │ extraction + adoption dry-run    │   │
│                              └─────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## 2.2 The execution flow (one run, step by step)

```
 1. CLI parses args (cli/args.ts:11-49) → dispatch (cli/handlers.ts:387-395)
 2. readJsonFile (handlers.ts:44-47) → decodeDoc (schema.ts:84-87, Schema.decodeUnknown)
       └─ failure → [JESL UNKNOWN-NODE] with field+remedy → exit 2
 3. validateDoc(doc, isKnownKindSync) (handlers.ts:216 → schema.ts:89-205)
       └─ duplicate-id / unknown-kind / dangling-edge / CYCLE / TIER-VIOLATION → exit 2
 4. checkUnbracketed (handlers.ts:63-83) ── tier-2 generation without bracket → exit 2
 5. buildRunContext (handlers.ts:143-157): nodeHandles from the REAL impl map (:94-111),
    boundCaps {Shell,Fs,Http} for the cli driver (:135-139)
 6. runProgram(doc, ctx) (core/executor.ts:82-234):
    a. inbound/outbound maps from edges (:84-93)
    b. seed channels: ctx.vars then doc.vars (:97-100)
    c. LOOP while nodes remain (:143-158):
         ready = nodes whose inbound channels are all written
         batch = ready.slice(0, maxFiring=15)
    d. cap pre-flight per node (:159-178): required cap ∉ boundCaps
         → Effect.fail([JESL CAP-UNBOUND]) — NO invoke row
    e. per node via Effect.forEach(batch, perNode, {concurrency: 15}) (:224):
         journal invoke row (:183)
         → REAL inbound from channelData (:184-188)
         → handle.invoke → Effect.exit capture (:195)
         → verdict map: success→PASS | tagged fail→FAIL | defect→INCONCLUSIVE (:197-211)
         → journal verdict row (:212)
         → writeback: outputs[via] ?? outputs.default ?? {ok:1} → channels.write (:213-221)
 7. RunSummary {results, batches, rows} (:231-233)
 8. overall verdict FROM results (handlers.ts:312-318) → stdout JSON → exit 0|1
```

## 2.3 The component × component interaction table

| Component | Talks to | Contract |
|---|---|---|
| schema → registry | `isKnownKind` injected (schema.ts:91) | decode → validate → the 5 refusals |
| graph → schema | consumes `WorkflowDoc` (graph.ts:2) | Kahn levels + cycle + chunk15 (graph.ts:24-31,49-77) |
| executor → graph+channels+journal+caps | RunContext (executor.ts:60-73) | readiness loop + cap pre-flight + journal rows |
| journal → HashCap/Clock | HashCap Context.Tag (journal.ts:33) | self = hash(canonical(base)+"\0"+prev); ts EXCLUDED (journal.ts:44) |
| bus → all scanners | emit/subscribe (bus.ts:61-69) | deepFreeze payloads; forkDaemon isolation (bus.ts:80-103) |
| drivers → caps | Layer.mergeAll (cli-live.ts:110, opencode-live.ts:93) | the driver IS the world (D10) |
| hook-bridge → bus+ToolEngine | WeakMap per bus (hook-bridge.ts:13-14) | pta deny fold + observer isolation |
| wraps → scanners | BehaviorEngine subscribes pba.family.hit (behavior-engine.ts:121) | arm → intercept → deny |
| mpse → schema+parser | compileDoc (rule-cards.ts:73-113) | 24-kind IR → oracle → D17 |
| packager → schema | validatedDoc gate (packager/shared.ts:21-28) | criterion-9 re-validation on every emit |
| kernels → mpse+executor+caps | runDemoSync (spec-to-kernels:9), runProgram (:10), Subagent (kernels-to-code:4) | the D3 insertion + bracketed dispatch |

## 2.4 The file inventory (109 .ts files, the build total)

| Directory | Files | ~Lines | Purpose | Mutability (L2 §2.5) |
|---|---|---|---|---|
| core/ | 10 | 1,857 | schema 212 · graph 222 · channels 158 · bus 189 · caps 133 · errors 94 · executor 234 · journal 278 · registry 255 · evidence 160 | FIXED |
| nodes/ | 19 | ~1,600 | 16 implemented kinds + stubs + shared + index | FIXED, append-only |
| cli/ | 3 | ~490 | main 37 · args 59 · handlers 395 | FIXED |
| drivers/ | 4 | ~340 | cli-live 124 · opencode-live 96 · hook-bridge 100 · session-live 44 | FIXED |
| scanners/ | 7 | ~520 | pba-banks 95 · pba 71 · pta 51 · lsp 78 · audit 54 · trace 92 · shared 48 | FIXED |
| workflow/ | 2 | ~290 | jesl-run 169 · activities 119 | FIXED |
| packager/ | 4 | ~290 | shared 104 · tool 37 · chain 63 · skill 87 | FIXED |
| wraps/ | 4 | ~530 | behavior-engine 193 · tool-engine 90 · effect-lsp 126 · artifact-gate 113 | FIXED |
| mpse/ | 7 | ~1,230 | parser 303 · rule-cards 113 · oracle 200 · calibrate 162 · kernel-emit 149 · stub-emit 105 · demo 252 | FIXED |
| kernels/ | 6 dirs (18 files) | ~1,700 | idea-to-bible 231+23+62 · bible-to-spec 284+59+83 · spec-to-kernels 280+20+62 · kernels-to-code 302+15+40 · verify 153+19+32 · ship 298+25+52 (+fixtures) | EDIT |
| profiles/ | 4 | ~120 | shared 77 · trident 13 · trading 15 · sales 15 | EDIT |
| bindings/ | 2 | ~100 | host-binding 71 · opencode-binding 29 | EDIT |
| boilerplate/ | 1 | 215 | extraction.ts | FIXED |
| tests/ | 36 (34 test + battery.ts + kill-resume.json) | ~5,300 | the 336-unit battery + the 11-row runner (461L) | FIXED |

---

# PART 3: THE CORE MODULES (DEEP DIVE)

## 3.1 schema.ts (212L) — the authoring surface's gatekeeper

**The Schema (schema.ts:42-55):** `$schema: Literal("trident-workflow-v1")` · `meta {name: string, tier: 1|2, description?, seed?: {channel}}` · `nodes: NonEmptyArray(NodeEnvelope)` · `edges: Array({from,to,via})` · `vars?: Record<string,string>` · `journal?` · `gates?`.

**NodeEnvelope (schema.ts:7-34):** `id, type, config? (Schema.Unknown — the W2 fix), class? (event|decision|generation|orchestration|evidence|execution), on? {event, filter?}, retries? {maxRetries, class: exile|retry|fall}, timeoutMs?, bracket? {contract, repair? {target, max: Literal(2)}, confidenceFloor?}, oracle?`.

**decodeDoc (schema.ts:84-87):** `Schema.decodeUnknown(WorkflowDoc)` mapped through `mapParseError` (:61-82) — the field path is extracted from the message and every decode failure becomes `JeslUnknownNode` with field+expected+actual+remedy (compiler-style diagnostics, Law 1E).

**validateDoc (schema.ts:89-205) — the 5 refusals in order:**
1. duplicate id (:96-106) → `[JESL UNKNOWN-NODE]` field=nodes[id]
2. unknown kind via the INJECTED `isKnownKind` (:109-120) → field=type — the registry dependency is dependency-injected so the schema module stays decoupled
3. dangling edge endpoints (:122-144) → field=edges[from]|edges[to]
4. Kahn cycle (:146-179): indegree map + queue; if the topological order is shorter than the node list, the residual (indegree>0) set IS the cycle → `[JESL CYCLE]` with `cycle through [a→b→c]`
5. tier discipline (:181-204): tier 1 + `GENERATION_KINDS` (`prompt|shadow-agent|subagent-dispatch|generation`, :5) by type OR class=generation → `[JESL TIER-VIOLATION]`

**Design decision:** the schema rejects at authoring time — before any fiber, before any journal row. The DPL1 §2.9 contract (`:228-252`) binds each refusal to a `Schema.TaggedError` whose `code` field PRINTS the frozen token byte-exactly.

## 3.2 graph.ts (222L) — the dependency graph

**GraphIndex (graph.ts:5-16):** `inbound: Map<nodeId, Set<channel>>`, `outbound: Map<nodeId, Array<{to,via}>>`, `entryNodes()`, `terminalNodes()`, `parallelBatches()`, `readySet(snapshot, state)`.

**Kahn levels (:49-77):** the level structure IS the parallelism proof — the 3-node diamond resolves to exactly 2 batches (graph.test.ts); levels longer than 15 are chunked by `chunk15` (:26-31, `MAX_NODES_FIRING = 15` at :24).

**buildGraph (:126-210):** re-validates endpoints (self-healing if called directly) incl. the 1-node self-loop → `[JESL CYCLE]` (:150-159); produces the frozen `Graph` object with `readyBatches(snapshot, state)` (:203-207) — readiness filtered by the channels actually WRITTEN (dataflow, not just topology) and chunked at 15.

**GraphService (:218-222):** `Effect.Service` wrapper — the graph builder as a Context service.

## 3.3 channels.ts (158L) — the dataflow store

**ChannelsService (:15-24):** `seedFrom(vars)` ([JESL NO-SEED] if a declared entry channel has no seed — :69-97) · `write(channel, value)` (deep-copy + Deferred wake — :98-106) · `read(channel, nodeId)` ([JESL CHANNEL-UNSET] on unset — :107-122) · `isWritten` · `snapshot()` (a deep-copy ChannelSnapshot — the observer law, :33-47) · `awaitWritten(names)` (the Deferred waiter pattern — :129-153) · `declareEntry`.

**Mechanics:** `Ref<Map<channel, value>>` + `Ref<Map<channel, Deferred[]>>` (:29-31). Every write deep-copies (JSON round-trip, :10-13) so no consumer can mutate shared state; the wake loop succeeds all waiters on the channel and clears them (:49-58).

**Design decision:** deep-copy is the observer law's enforcement — a snapshot can never alias the live store. The cost (JSON serialization per write) is accepted for determinism.

## 3.4 bus.ts (189L) — the EventBus

**BusEvent (:3-10):** `{type, payload, ts, run, source, node?}`.

**glob matching (:28-52):** `*` = all; `prefix.*` = namespace; exact; per-segment `*` via the regex path (`globToRegex` escapes everything except `*`).

**emitEvent (:78-106):** deep-copies then deep-freezes the payload AND the event (:80-88) — subscribers can never mutate what they see. Matching subscribers each run on `forkDaemon` + `catchAllCause` (:99-103): a crashing handler never takes down the emitter or sibling handlers (the observer law).

**subscribe/on/detach/detachAll (:121-173):** `subscribe` returns an unsubscribe Effect; `on` is the Scope-aware variant; `detachAll(runId?)` clears per-run subscriptions. The `_subsRef` is exposed for leak tests (bus.test.ts proves 1000 cycles leak-free).

## 3.5 caps.ts (133L) — the capability Tags

**The 9 Tags (:31-50):** `Shell ("jesl/Shell")`, `Fs`, `Http`, `ToolClient`, `Subagent`, `Llm`, `Journal`, `ClockTag ("jesl/Clock")`, `EmitCap ("jesl/EmitCap")` — plus the `*Cap` aliases (:42-50). Service interfaces at :4-29.

**requireCaps (:70-94):** reads the live Context via `Effect.context`, `Context.getOption` per tag; a miss → `JeslCapUnbound` with `expected: "driver Layer providing <cap>"`, `actual: <cap>`, `remedy: "run under a driver that binds the cap, or drop the node"`. The cap name is derived from the tag id (`capName`, :63-68).

**The Live layers (:98-132):** 9 dummy services → `ShellLive…EmitLive` → `InMemoryLive` (mergeAll) ≡ `TestLive` (:130). The dummy Clock uses `EffectClock.currentTimeMillis` (:105 — the W1 purity fix: `Date.now` was caught by the auditor's ripgrep and replaced). `CliLive`/`OpenCodeLive` here are the DUMMY compositions for tests; the REAL ones live in drivers/cli-live.ts.

**Design decision (D10):** caps are Context.Tags — a node's `R` channel names its requirements, and a missing Layer member is a LOUD refusal at pre-flight (executor.ts:159-178) with NO invoke row, never a silent skip.

## 3.6 errors.ts (94L) — the frozen vocabulary

**The 8 Schema.TaggedError classes (:3-73):** `JeslUnknownNode "[JESL UNKNOWN-NODE]"`, `JeslCycle "[JESL CYCLE]"`, `JeslTierViolation "[JESL TIER-VIOLATION]"`, `JeslUnbracketedGeneration "[JESL UNBRACKETED-GENERATION]"`, `JeslCapUnbound "[JESL CAP-UNBOUND]"`, `JeslOracleMissing "[JESL ORACLE-MISSING]"`, `JeslChannelUnset "[JESL CHANNEL-UNSET]"`, `JeslNoSeed "[JESL NO-SEED]"` — each with `{code: Schema.Literal(<the token>), node, field, expected, actual, remedy}`.

**JESL_TOKENS (:85-94):** the const map — the SINGLE SOURCE of the token strings. The token register is string-frozen (D15): any change requires a DECISION_CHAIN entry AND a fixture-battery update in the same wave (COMPACTION_SURVIVAL §13). The triple-canon lesson: never invent a 9th bracketed token (W1 GATE-FAIL, W4 JOURNAL-CORRUPT, W10 UNKNOWN-PROFILE were all caught and reduced to plain strings) AND never wear an existing token on a non-refusal (W3's usage-error fix).

## 3.7 executor.ts (234L) — the execution engine

**Types (:6-80):** `Verdict = PASS|FAIL|INCONCLUSIVE|READY_FALSE` · `NodeResult {verdict, outputs?, error?, evidence: Triplet{pattern,state,anchor}, timing {startMs,endMs}}` · `JournalRow {seq, ts, run, node, kind: invoke|verdict|bus.event|bus.handler.error|run.open|run.close, verdict?, evidence?, source, prev, self}` · `RunBudget {startedAt, deadlineMs, maxNodesFiring}` · `RunContext` (PART 3.7 of the Manual) · `NodeInput {node: full envelope, inbound: Record<channel, value>}` · `NodeHandle {invoke, requiredCaps?}` · `RunSummary {results, batches, rows}`.

**The journal fallback (:107-139):** without an injected journal, the executor mints rows itself — `self = simpleHashExport(canonicalSerializeExport(base) + "\x00" + prev)` (:133) — the SAME algorithm `verifyChain` checks (journal.ts:260-275). This is the W2 fix: the old `self-${seq}-${node}-${ts}` string was unverifiable, breaking replay silently.

**runProgram (:82-234):** the full loop documented at PART 2.2. Key subtleties:
- The deadline check uses `Clock.currentTimeMillis` (:144) — never wall-clock.
- Cap pre-flight happens for the WHOLE batch BEFORE any invoke (:159-178) — one unbound cap aborts the batch with zero rows.
- Verdict mapping (:197-211): `Exit.isSuccess` → the node's own verdict; a tagged `Cause.failureOption` → FAIL carrying the JeslError; anything else (defect) → INCONCLUSIVE.
- Writeback (:213-221): `outputs[via] ?? outputs.default ?? {ok: 1}` — a node with no matching output key still writes `{ok:1}` so downstream readiness proceeds (the fixture fixtures rely on this).

## 3.8 journal.ts (278L) — the evidence spine

**Row shape (:9-20):** `{seq, ts, run, node, kind, verdict?, evidence?: Triplet, source, prev, self}`.

**canonicalSerialize (:35-50):** sorted keys, `self` EXCLUDED (:43), `ts` EXCLUDED (:44 — the W5 determinism fix: including the wall-clock timestamp made two runs of the same doc+seed produce different chains, breaking criterion 5).

**simpleHash (:52-65):** the FNV-style dual-register hash — the core's own hash (pure, no node:crypto). The driver injects REAL sha256 via `HashCap` (:33, `Layer.succeed(HashCap, {hash: realHash})` in cli-live.ts:13); core falls back to simpleHash when no cap is present (`hashWithCap`, :67-70).

**makeJournal (:86-239):** per-run row lists in a Ref + a global list. `append` (:107-145): seq = list length, prev = previous self (or "genesis"), self = hash(canonical(base)+"\0"+prev). `covers(docHash, seed)` (:153-173): runId = `hash(docHash+"\0"+seed).slice(0,16)` → rows present AND chain verifies → true (the replay gate). `verify` (:191-230): per-row prev-linkage + seq check + self recompute. `serialize/restore` (:174-190): JSON round-trip preserving per-run partitioning.

**verifyChain (:260-275):** the standalone checker used by cli/handlers.ts replay (handlers.ts:360).

**The three roles of the journal (D5):** EVIDENCE (the chain proves what happened) · REPLAY (covers() → rebuild the verdict FROM rows — workflow/jesl-run.ts:46-64 `rebuildSummaryFromRows`) · RESUME (serialize/restore + the durable ask rows).

## 3.9 registry.ts (255L) — the kind registry

**ALL_KINDS (:34-72):** 37 entries — 32 deterministic+decision+evidence kinds, 4 execution, `prompt` (generation). The comment surface is the portability contract (append-only, D7).

**stubImpl (:74-86):** the INCONCLUSIVE stub — `anchor: "TODO:<kind>:1"` — with the `TODO` marker INSIDE the function source so `isStubImpl` (:93-101) can detect stub-ness by stringifying the invoke.

**The append-only law (:130-147, :205-244):** `register` on an existing kind → idempotent iff same family AND same requiredCaps, else `RegistryFrozenError: append-only violation`. `replaceStub`/`replaceStubSync` (:103-109, :148-163, :226-243): allowed ONLY over a stub (never over a real impl), ONLY same family — the seam the real nodes use at import time.

**The sync cache (:192-204):** `getSync/isKnownKindSync/kindsSync/contract` read a Map snapshot built at construction — the CLI's hot path (validate) never awaits the Ref.

## 3.10 evidence.ts (160L) — the 8-kind evidence machine (the G1 port from LASME_v1)

**Constants (:3-5):** `RING_CAP = 50`, `VERDICT_TTL_MS = 5000`, `CLAIM_FRESH_WINDOW_MS = 300000`.

**EvidenceKind (:7):** unit | container | smoke | dist_change | claim | evidence_clear | source_change | status.

**The guards:** `isEventFresh` (:26-28) · `canSourceChange` (:30-35 — requires a filePath) · `canStatus` (:37-42 — requires a probeOutput).

**ingest (:79-125):** stale events → REJECTED; source_change without path → UNEVIDENCED; NON-MONOTONIC source_change (at ≤ last) → REJECTED (:92-97 — the LASME monotonicity guard); status without probeOutput → UNEVIDENCED. The ring caps at 50 per subject (oldest evicted, :106-112). A `claim` → EVIDENCED iff a FRESH source_change exists in the ring (:115-117) — the claim↔evidence adjudication the audit scanner mirrors.

**queryVerdict (:127-135):** TTL-checked; stale → UNEVIDENCED.

---

# PART 4: THE NODE SYSTEM

## 4.1 The executor loop (see PART 2.2 — the trace is the canon)

## 4.2 The 12 full-behavior nodes (the invocation contracts)

| Node | Config | Reads | Writes | Failure modes (anchors) |
|---|---|---|---|---|
| gate | `{asserts: [{path, op: eq|ge|le|ne|contains|matches, value}]}` or `{predicate}` | dot-path into inbound (gate.ts:9-19) | `{gate.<id>: true}` | path unset → CHANNEL-UNSET (:59); assert false → FAIL `expected=X actual=Y` (:64) |
| event-filter | `{pattern?, filter?, event?, expectedType?}` | config.event \| inbound.event | `{matched}` | all misses READY_FALSE: no-event/DROPPED/FILTERED/MISMATCH (:25-43) |
| capture-engine | `{into?, key?}` | event\|input\|data\|first | `{[into]: payload, count}` | no payload → READY_FALSE (:20); module store `<id>:<into>` (:22) |
| pipeline | `{steps?: [{fn?|value?}], fnA?, fnB?}` | input\|first | `{output, result}` | no input → READY_FALSE (:17) |
| parallel | `{items?, concurrency?=15, delayMs?}` | config.items \| inbound.items | `{results, count}` | empty → PASS EMPTY (:18) |
| retry-chain | `{maxRetries?=2, failTimes?=2, fn?, shouldFail?}` | — (fn carries work) | `{result?, attempts}` | exhausted → FAIL EXHAUSTED (:44) |
| fallback-chain | `{primary?, fallback?, …Value?}` | inbound.primary/fallback | `{result, which}` | both fail → FAIL BOTH_FAILED (:34) |
| pause | `{key?, resumeValue?, immediateResume?}` | inbound.resume\|signal | `{resumed}` | suspends on Deferred.await (:33); resume via `pauseResume(key,v)` (:40-49) |
| journal-sink | — | data\|payload\|input\|first | `{written, row}` | append errors swallowed → row undefined (:27) |
| triplet-writer | `{triplet}` or fields | inbound.triplet | `{triplet}` | missing field → INCONCLUSIVE (:16-19) |
| state-machine | `{table?, initial?, event?}` | config.event \| inbound.event | `{state, prev}` | no transition → INCONCLUSIVE (:32-35) |
| math-eval | `{expr?, env?}` | inbound.expr\|math | `{result, value}` | no expr → INCONCLUSIVE (:30); unbound var → INCONCLUSIVE (:53-56); MathExprService delegates when bound (:32-44) |

## 4.3 The 4 execution nodes (cap-bound)

| Node | Cap | Config | PASS writes | FAIL anchors |
|---|---|---|---|---|
| shell-exec | Shell | `{cmd?, timeoutMs?=5000, maxOutputBytes?=1048576}` | `{stdout, stderr, exitCode, output}` | missing-cmd (:29) · timeout (:43) · exit-N (:54) |
| python-exec | Shell | `{code?|script?+args?, timeoutMs?=10000}` | same | missing-code (:40) · timeout (:53) · exit-N (:61) |
| http-request | Http | `{method?="GET", url?, headers?, body?}` | `{status, body}` (2xx only) | missing-url (:26) · transport (:37) · non-2xx (:45) |
| file-io | Fs | `{op?="read"|"write", path?, body?}` | write `{path, bytesWritten}` / read `{path, content}` | missing-path (:23) · cap errors (:34,44) |

All four self-register via `replaceStubSync` at import (e.g. shell-exec.ts:58-61).

## 4.4 The structural stubs

`stubImpl` (core/registry.ts:74-86) + `stubNodes` (nodes/stubs.ts:18-43): 24 stub entries (incl. superseded execution stubs) returning `{verdict: INCONCLUSIVE, anchor: "TODO:<kind>:1"}`. Purpose: `isKnownKindSync` stays true for the whole catalog (Law 1G) while impls land via the append-only `replaceStub` seam.

## 4.5 The prompt node (nodes/prompt.ts, 223L) — the generation Activity

**Dual mode (:96-101):** `mode` resolves aliases `call-model→llm`, `ask-launcher→template`.

**Template mode (:101-119):** pure `${}`/`{{}}` interpolation (prompt.ts:17-37) → PASS. No Llm cap. Journal invoke+verdict rows.

**LLM mode (:121-217):**
1. `requireCaps([Llm])` (:121)
2. bracket present but contract empty → FAIL with error code `[JESL UNBRACKETED-GENERATION]` (:127 — the one in-node use of a frozen token, semantics-matched: generation without a valid bracket)
3. up to 3 attempts (:169): journal pre-row with the 8-char prompt hash (:145-156,170-172) → `llm.callModel({system, prompt, maxTokens, thinking?})` (:173-175)
4. transport error → FAIL `LLM_TRANSPORT` (:176-183)
5. contract check (:69-85): path-like or `json` contract → JSON.parse; otherwise substring/JSON-embedding
6. violation at attempt ≤1 → append `[Repair] Previous output violated contract: …` (:193-196); at attempt 2 → FAIL `CONTRACT_VIOLATION` (:211-216)
7. `confidence ?? 1` below `confidenceFloor ?? 0.55` → INCONCLUSIVE `UNCLEAR` (:199-204)
8. else PASS with the 12-char output hash + confidence + model in the journal row (:205-209)

**Registration:** `replaceStubSync("prompt", promptNode)` at module load (:220-223).

## 4.6 The workflow layer (the durability plane)

**workflow/jesl-run.ts (169L):**
- `JeslRun = Workflow.make({name: "JeslRun", payload: {docHash, seed}, success: RunReceipt, error: string, idempotencyKey: ({docHash, seed}) => \`${docHash}:${hashSeed(seed)}\`})` (:38-44) — the DPL1 §2.9 :270-276 contract landed.
- `runJeslWorkflow(docHash, seed, doc, baseCtx)` (:66-151): runId = `hash(docHash+"\0"+seedStr).slice(0,16)` (:75) → existing rows? verify (corrupt → plain `JOURNAL_CORRUPT` loud-fail strings, :80-89 — NOT bracketed tokens; the W4 fix) → `rebuildSummaryFromRows` → receipt with `invoked: 0` (:90-93). covers()? same replay path (:95-117). else → build per-node Activities + a journal view that rewrites `source` to `workflow/JeslRun/node:<id>` (:119-129) → `runProgram` (:137-140) → receipt with the real invoked count.
- `rebuildSummaryFromRows` (:46-64): the verdict FROM verdict-kind rows — FAIL beats INCONCLUSIVE beats PASS; results keyed by node from the FIRST verdict row each.

**workflow/activities.ts (119L):** `makeNodeActivity(nodeId, handle, docName)` — `Activity.make({name: "node:<id>", success: NodeResultSchema, execute})` (:16-36). `durableAsk(question, nodeId, runId)` (:64-89): an answer row (`kind: "answer"`, evidence.pattern `ask.answer`) short-circuits; else an ask row persists (`kind: "ask"`) and the effect FAILS with `SUSPENDED:ask:<nodeId>` — the DurableDeferred suspension the host resumes. `provideAnswer` (:91-105) writes the answer row.

---

# PART 5: THE DRIVER SYSTEM

## 5.1 CliLive — the production driver (drivers/cli-live.ts, 124L)

`CliLive = Layer.mergeAll(ShellLiveReal, FsLiveReal, HttpLiveReal, JournalLive, HashCapLiveReal)` (:110).

- **ShellLiveReal (:15-66):** `spawn(cmd, {shell: true})` — stdout/stderr accumulated with maxOutputBytes truncation; a `setTimeout` kill timer fires `SIGKILL` and rejects with `Error{code: "TIMEOUT"}` (:26-36); the close handler resolves `{stdout, stderr, exitCode}`.
- **FsLiveReal (:68-82):** `readFile` utf-8; `write` = mkdir -p dirname + writeFile.
- **HttpLiveReal (:84-106):** `fetch` with JSON body auto-serialization + content-type default; returns `{status, body: text, headers}`.
- **HashCapLiveReal (:9-13):** `node:crypto createHash("sha256")` — the REAL hash the journal chain uses in production.
- **VerifyLedger (:118-124):** the design-decision record — @effect/platform was probed (DD24) and node: bindings chosen for Shell timeout control. The `node:` imports are LEGAL here: the driver boundary (Law 4).

## 5.2 OpenCodeLive — the host driver (drivers/opencode-live.ts, 96L)

**HostTransport (:7-12):** `{invokeTool(tool, args, causationId), dispatchSubagent(promptFile), callModel({system, prompt, maxTokens, thinking?}), ask(question, opts?)}` — the library's host-agnostic seam. NO opencode SDK import anywhere (bindings.test.ts proves zero `from 'opencode'`).

**ScriptedTransport (:16-76):** the test transport — scripted ask answers (shift queue + `pushAnswer`), optional impl overrides for invoke/dispatch/callModel, `shouldThrow` for failure injection.

**makeOpenCodeLive (:78-94):** `Layer.mergeAll(CliLive, ToolClient(transport.invokeTool), Subagent(transport.dispatchSubagent), Llm(transport.callModel), SessionLive(transport.ask), BusLive)` — the full 11-Tag stack the OpenCode binding declares (bindings/opencode-binding.ts:14).

## 5.3 SessionLive — the ask-launcher (drivers/session-live.ts, 44L)

`makeSessionLive(transport)` (:10-33): `Session` Tag; `ask` = Queue.unbounded (ordering) + per-ask Deferred + `forkDaemon` transport call → `Deferred.await`. The roundtrip: a node suspends mid-run; the host answers via the transport; the Deferred completes; the run continues. Zero sleeps — the W3 E2E proves suspend→answer→PASS with journal rows (driver.test.ts 12/12; container W3 T6).

## 5.4 hook-bridge — the event seam (drivers/hook-bridge.ts, 100L)

`onToolExecuteBefore({tool, args, runId})` (:42-79):
1. `ensurePtaSubscription(bus)` — once per Bus instance (WeakMap, :13-14): subscribe `pta.*` and fold DENY payloads into a per-bus deny map (:22-40).
2. If a `ToolEngine` is bound in the context (found by scanning the context's unsafeMap for key `jesl/ToolEngine`, :46-56): consult `intercept({tool, args, run})` FIRST (:57-67) — deny → `{allow: false, reason}`; allow → emit `tool.execute.before` + `{allow: true}`.
3. Else (no engine — the W3-style pure-scanner path): emit `tool.execute.before` and consult the deny map (direct tool key → `<runId>:<tool>` → generic `__pta_deny__`, :69-78).

Every branch is `catchAllCause`-isolated — a scanner crash never breaks the hook (the observer law). The event-type constants are exported (:96-100): `tool.execute.before` / `pba.family.hit` / `pta.intercept`.

---

# PART 6: THE MPSE BRIDGE (math-before-code)

## 6.1 The parser (mpse/parser.ts, 303L) — the 24-kind MathExpr IR

**The IR (:6-30):** literal · var · add · sub · mul · div · mod · eq · neq · lt · lte · gt · gte · and · or · not · neg · if · call · list · index · forall · exists · temporal (prev|eventually|globally|until). `MATH_EXPR_KINDS` (:32-38) is the canonical list — D8: JESL math nodes COMPILE to this grammar; there is no parallel JSON expression language.

**Guards:** `MPSE_DEPTH_LIMIT = 256` (:3) · `MPSE_DOMAIN_LIMIT = 10000` (:4 — the DOMAIN_UNBOUNDED guard).

**Tokenizer (:64-110):** strings, numbers, identifiers/keywords (and/or/not/if/then/else/forall/exists/prev/eventually/globally/until), `&&`/`||` sugar, comparison ops, arithmetic, brackets.

**The recursive-descent parser (:112-282)** — precedence chain `or → and → comparison → add → mul → unary → postfix → primary`; depth checked at every level (`checkDepth`, :122-124 → `DEPTH_EXCEEDED`); `extractFencedMath` (:53-62) lifts ```math fenced blocks from spec prose; position tracking on every `MpseError` (:40-45).

**parseMathExpr (:284-303):** empty input → MPSE_PARSE_ERROR; trailing tokens → MPSE_PARSE_ERROR.

## 6.2 The rule cards (mpse/rule-cards.ts, 113L)

**compileRule (:27-71):** the oracle presence gate — `expected === undefined` → `[JESL ORACLE-MISSING]` with remedy "a rule card without its oracle is [JESL ORACLE-MISSING]" (:30-38). NaN expected → accepted with severity CONTRADICTED (:39-42). FLOAT WITHOUT EPSILON → `FLOAT_EPSILON_MISSING` (:43-50). Non-positive/NaN tolerance → MPSE_PARSE_ERROR (:51-60). Provenance {source, line, quote} recorded on every card.

**compileDoc (:73-113):** per node, the math key scan (`math|expr|expression`) + the expected key scan (`expected|oracle|value`); a math-bearing node without ANY expected key → ORACLE-MISSING (:97-106).

## 6.3 The oracle (mpse/oracle.ts, 200L)

**compileOracle (:143-181):** append-only Map keyed by `oracleKey ?? card.id`; a DUPLICATE key → `OracleConflictError` (code `ORACLE_CONFLICT`, :47-53) — first registration wins, re-register is LOUD. Each rule carries provenance + `computed` (the local arithmetic evaluation, :55-75).

**discharge (:94-141) — the correctness matrix:**
| actual/expected shape | rule |
|---|---|
| unregistered ruleId | UNVERIFIABLE |
| NaN or non-finite actual | CONTRADICTED |
| int expected + int actual | strict `===` — "integer equality mismatch — zero false positives" |
| float without tolerance | strict `===` |
| float with tolerance | `|diff| <= eps` |
| boolean pair | strict === |
| arrays | order-insensitive element equality |
| anything else | strict === |

## 6.4 The calibrate (mpse/calibrate.ts, 162L) — the D17 gate

**D17 EXCLUDED_BORN_OFF:** a born-off sample (intentionally-wrong expected, bornOff: true) → status **EXCLUDED**, never FAIL (:133-138: "D17 EXCLUDED_BORN_OFF — exclusion born-off never satisfiable"). The report `{pass, contradict, unverifiable, excluded, fail, total, rows, excludedCount, pendingParallel}` — with FAIL mapped into CONTRADICTED in the registry path (:148-157). The demo path (:82-114) mirrors for the fixture shape.

## 6.5 The emits + demo

**kernel-emit.ts (149L):** `emitKernelProto` — per math-contract node a `KernelProto {id, kind, expr, exprSource, oracleRules, activitySkeleton, workflow}` — the Activity.make skeleton with the oracle linkage rendered as source text (:42-66).

**stub-emit.ts (105L):** `emitStubs` — the delta `CodeStub {id, kind, expr, oracleRef, delta, template}`: "what the implementation wave must build vs what the kernel already proves" (:54-69).

**demo.ts (252L):** `runDemoSync(docPath)` (:203-227) — read → decodeDoc → validateDoc → compileDocLocal → compileOracleLocal → calibrateLocal → emitKernelProtoLocal → emitStubsLocal → `DemoResult {cards, registry, report, kernel, stubs, doc}`. `detectPendingParallel` (:96-110) reports which sibling mpse modules were absent at compose time (the PENDING-PARALLEL cross-agent coordination record). The W7 gate: the 5-node fixture compiles and D17 is reproduced (pass:3 excluded:1 fail:0).

---

# PART 7: THE LIFECYCLE KERNELS (6 kernels — the idea→ship chain)

Each kernel: `activities.ts` (the Effect pipeline) + `workflow.json` (the JESL graph) + `SKILL.md` (the fuse) + `fixtures/`.

## 7.1 idea-to-bible (activities.ts 231L)

**In→Out:** raw idea text → `BibleDoc` (a valid tier-1 WorkflowDoc with 4 nodes/3 edges, meta.name `bible-<hash>`).
**Pipeline:** `runIdeaToBible` (:150-169): validate (blank → journal FAIL + `Effect.fail([JESL CHANNEL-UNSET])`, :157-159) → **parallel explore**: `Effect.forEach(EXPLORE_ANGLES, exploreOne, {concurrency: 15})` (:163; the 3 angles at :18-22) — `exploreOne` uses `Effect.serviceOption(Llm)` (:65): bound → `llm.callModel` (:68-81); absent → the deterministic `stubExploreResult` (:50-55) → `mergeToBible` (:102-131, FNV-1a ideaHash :24-28) → `schemaGateBible` (:133-148, decodeDoc :140 + validateDoc :143).
**Test Layer:** `makeStubLlmLayer` (:171-186) — the scripted Llm keyed by angle. `buildNodeHandles` (:190-231) maps the 7 workflow nodes to Activities for the executor path.
**Journals:** `workflow/idea-to-bible-<hash>-<ts>` with per-stage invoke+verdict rows.
**Tests:** 6 (blank → CHANNEL-UNSET; parallel fan-out c=15; journal ≥14 rows).

## 7.2 bible-to-spec (activities.ts 284L)

**In→Out:** bible doc → DPL1 spec candidate (a valid WorkflowDoc, tier 1, FR nodes + linear edges).
**Pipeline:** `runBibleToSpecSimple` (:228-276): `digestBible` (:49-96 — null/`$schema` guards :53-77, hash via canonicalSerialize+simpleHash :78-79, Inventory) → FR extraction (Llm optional via `serviceOption`; deterministic fallback `FR-{idx}` from node config :132-141) → **`lintMathContracts` (:150-191) — THE MPSE ENTRY**: scan `math|expression|expr|formula|contract` keys (:158) → `parseMathExpr` per value (:170) → parse failure → `[JESL UNKNOWN-NODE]` field=config.<key> with the parse reason (:174-184) → `buildSpecCandidate` (:210-226) → `gateDPL1Spec` (:193-208, decodeDoc+validateDoc against ALL_KINDS).
**Fixtures:** bible-valid.json (math parses), bible-math-bad.json (`@@@invalid math ((` → lint refusal), bible-minimal.json (1-node edge).
**Tests:** 6.

## 7.3 spec-to-kernels (activities.ts 280L) — **D3 THE INSERTION**

**In→Out:** spec JSON file → `{cards, registry, report, kernel, stubs, doc, dryRun, runId, journalTail}`.
**THE INSERTION ANCHORS (verbatim, the operator's load-bearing ruling "MPSE specs → macro kernel prototypes → code specs"):**
- `import { runDemoSync, type DemoResult, type CalibrateReport } from "../../mpse/demo"` — **:9**
- `import { runProgram, type RunSummary } from "../../core/executor"` — **:10**
- runDemoSync call site #1 (cwd-resolved pick): **:197** `return runDemoSync(pick)`
- runDemoSync call site #2 (fixture-relative fallback): **:199** `return runDemoSync(specPath)`
- **assertD17 (:86-117):** `report.fail > 0` → FAIL with expected "fail === 0 — born-off rows must be EXCLUDED, not FAIL (D17: FIRED∧SILENT=CALIBRATED else EXCLUDED_BORN_OFF)" (:96); every EXCLUDED row must carry EXCLUDED_BORN_OFF in its reason (:102-116). Composed: **:212** `const d17Res = yield* assertD17(report).pipe(Effect.either)`.
- **runDryRun (:119-169):** per kernel proto, `runProgram(doc, ctx)` under an empty-capability context with a 60s budget — **:151** the call site — "the deterministic substrate EXECUTES before code exists". Any FAIL verdict in the summary → `[JESL UNKNOWN-NODE] dry-run:<kid>` (:155-164). Composed: **:246**.
**Pipeline stages:** spec-parse (:189-209, wrapDemoError maps cycle→JeslCycle, channel→JeslChannelUnset, else UnknownNode :51-84) → calibrate/D17 (:210-218) → decompose guards (:219-243: empty kernel, stubs≠kernel count) → dry-run (:245-254) → journal-sink (:255-258).
**Fixtures:** sample-spec.json (58L, 5 nodes with bornOff:true on the born-off node :46), born-off-spec.json (13L minimal), bad-spec.json (11L, `unknown-kind-xyz` → loud refusal).
**Tests:** 8.

## 7.4 kernels-to-code (activities.ts 302L) — the stub-consumption kernel

**In→Out:** stub inventory (polymorphic) → `KernelsToCodeReport {pass, fail, inconclusive, rows, runId, inventory, chainValid}`.
**Pipeline:** `inventoryStubs` (:113-141 — array | {stubs} | {nodes} | Map | record) → `makeRegistry` (:143-147, compileOracle from the stubs) → per stub `processStub` (:158-255): the **bracket repair kernel** — `yield* Subagent` (:165), loop 3 attempts (:172 = initial + max 2 repairs): journal invoke (:174) → `subagent.dispatch("kernels-to-code/stub-<id>.prompt")` via `Effect.either` (:175-176) → dispatch fail → FAIL break (:177-183) → `extractCode` (:185, :51-66 polymorphic text|code|output|content|result) → **confidence floor**: `< 0.55` → INCONCLUSIVE UNCLEAR break (:188-194) → `actualFromCode` (:195, :68-89 numeric/bool coercion) → `registry.discharge(ruleId, actual)` (:199) → verdict branches: PASS break (:206-210) · CONTRADICTED/FAIL retry-until-attempt-2 (:212-228) · UNVERIFIABLE → INCONCLUSIVE (:230-235) · EXCLUDED → FAIL (:236-241). Batch: `Effect.forEach(stubs, processStub, {concurrency: opts?.concurrency ?? 1})` (:274-275). Overall: `fail===0 && inconclusive===0 → PASS` (:279).
**Workflow.json:** tier 2 with the bracket on `k2c-dispatch`: `{contract: "code-spec", repair: {target: "k2c-oracle-gate", max: 2}, confidenceFloor: 0.55}` (workflow.json:6).
**Tests:** 7 (invoke counter 2 on one repair; 3-strike → FAIL; float/NaN/0.4-UNCLEAR).

## 7.5 verify (activities.ts 153L)

**In→Out:** `VerifyArtifacts` + `VerifyScenario[] {name, passToken, failToken, run}` → `VerifyReport {pass, fail, rows}`.
**Pipeline:** `runScenario` (:47-95): journal invoke → `Effect.either(scenario.run(artifacts))` (:65) → `passTokenMatch = toolResult.includes(passToken)` (:72), `failTokenAbsent = !toolResult.includes(failToken)` (:73), `verdict = pass && absent ? PASS : FAIL` (:74) — THE token-in-tool-result law; defect/error catchAll → FAIL rows (:88-94) — **W11: one failing scenario never kills siblings**. Batch: `Effect.forEach(scenarios, perScenario, {concurrency: 15})` (:122, default 15 at :105).
**Tests:** 5.

## 7.6 ship (activities.ts 298L) — the release kernel

**In→Out:** `ShipArtifact[] {path, content}` → `ShipResult {manifest(verified:true), copies, docs, audit}`.
**Pipeline:** `ship` (:259-298): `buildManifestEffect` (:39-70 — empty → `[JESL NO-SEED]` :44-53; missing path/content → `[JESL CHANNEL-UNSET]` :57-65) → `copyArtifacts` (:94-157): per artifact the manifest lookup (:105-115) + **hash-verify BEFORE write** (:117-128, `hashContent = simpleHashExport` :32) → staged sequential writes with **atomic rollback** (`write(w, "")` per already-written file on failure, :133-155) → `generateDocs` (:159-176, README + manifest.json via the injected writer) → `auditGateChain` (:178-257): `Schema.decodeUnknown(ShipManifest)` (:183) + total check (:196-206) + per-entry path/sha256 guard (:208-221) + copy lookup (:224-240) + **the corrupted-copy detector** (`hashContent(found.content) !== f.sha256` → FAIL, :242-253) → verified manifest rewrite (:293-295).
**Hash note (honest):** `hashContent` is `simpleHashExport` (FNV-style) — the field is NAMED sha256 but the algorithm is the core's deterministic hash; behavior consistent, name overstates crypto (kernels-agent §5).
**Tests:** 7 (hash-verify catches a corrupted copy; atomic rollback on writer failure).

## 7.7 The chain composition

```
idea ──► [idea-to-bible] ──► bible ──► [bible-to-spec] ──► spec
                                                              │
        ┌─────────────────────────────────────────────────────┘
        ▼
[spect-to-kernels — D3: runDemo + D17 + TestLive dry-run]
        │ kernel protos + delta stubs
        ▼
[kernels-to-code — Subagent dispatch + oracle-gate + repair≤2]
        │ verified code artifacts
        ▼
[verify — parallel battery, passToken in tool-result]
        │ verified artifacts
        ▼
[ship — manifest + atomic copy + docs + audit gate]
```

---

# PART 8: THE PACKAGER + BOILERPLATE

## 8.1 The validatedDoc gate (packager/shared.ts, 104L)

Every emitter starts from `validatedDoc(raw)` (:21-28) = `decodeDoc` → `validateDoc(doc, isKnownKindSync)` → `checkUnbracketed` — criterion 9's re-validation: an emitted target is only ever produced from a doc that validates RIGHT NOW. The local KNOWN_KINDS set (:6-15) mirrors the registry (37 kinds). `InMemoryWriter` (:90-98) is the test writer; `canonicalJson` (:103-104) is 2-space stable JSON (the byte-preservation contract).

## 8.2 emitTool (packager/tool.ts, 37L)

Output shape (:12-23):

```json
{
  "$schema": "trident-workflow-v1",
  "name": "<meta.name>",
  "description": "<meta.description or 'JESL workflow <name>'>",
  "inputSchema": { "vars": {...}, "seedChannel": "...", "channels": ["a","b"] },
  "command": "jesl run <name>.json --in vars.json"
}
```

`channels` = the deduped `via` set. `toolManifestJson` (:30-37) renders the manifest without the embedded doc.

## 8.3 emitChain (packager/chain.ts, 63L)

`buildChain` (:28-60): per node `{id, tool: <type>, args: <config>, via: <first outbound via>, inboundVia: [...], outboundVia: [...]}` + the edge list. `emitChain` (:6-26) then registry-checks EVERY step's tool — unknown → `[JESL UNKNOWN-NODE]` (:12-23). The descriptor is a portable tool-chain spec: each step is launchable and the `via`s name the wiring.

## 8.4 emitSkill (packager/skill.ts, 87L) — the skill rocket (D4)

Five files via the injected writer (:53-78):

```
<outDir>/<name>/
├── SKILL.md              ← the fuse: name + description + "## When to use" + "## Launch"
│                           with the EXACT line "jesl run payload/workflow.json --in payload/ctx.json" (:11, LAUNCH_LINE)
└── payload/
    ├── workflow.json     ← canonicalJson(doc) — byte-preserved semantics (:62)
    ├── ctx.json          ← {vars, seed, channels, meta:{name,tier}} (:41-51)
    ├── mission.md        ← objective + nodes/edges inventory + vars + success criteria (:21-25)
    └── anti-patterns.json ← doc.gates if present, else the empty 4-bank family shell (:27-39)
```

`SKILL_LAUNCH_LINE` exported (:87) — byte-exact, asserted by packager.test.ts. The rocket is D4's munition: drop-a-directory ships a tool; ephemeral by design (fire → journal → die).

## 8.5 extractBoilerplate (boilerplate/extraction.ts, 215L)

`extractBoilerplate(sourceDir, targetDir, profileName, writer)` (:124-213):

1. Copy the 10 FIXED dirs (`DIRS_TO_COPY = core, nodes, cli, drivers, scanners, workflow, packager, wraps, mpse, bindings`, :37) via `walkSync` (:50-68)
2. Copy `profiles/shared.ts` + `profiles/<profile>.ts` (:148-159)
3. Generate package.json: name `<basename(targetDir)>-kernel` + the `jesl` block `{profile, caps: <tag ids>, kinds, tier, brackets}` (:161-177)
4. Copy tsconfig.json (or generate a strict default, :179-185)
5. Emit `boilerplate-manifest.json`: `{sourceDir, targetDir, profile, targetName, caps, kinds, tier, brackets, filesCopied (sorted), generatedFiles, digest, schemaVersion: "trident-workflow-v1", generatedAt}` — digest = sha256 over `sortedCopied.join("\0") + "\0" + caps.join(",") + "\0" + kinds.join(",")` (:187-188); `validateManifest` (:107-120) gates the emit (targetName ends -kernel, digest is 64-hex, tier 1|2, non-empty arrays)
6. Unknown profile → plain `UNKNOWN_PROFILE` error (:96-105 — NOT bracketed; the W10 token-hygiene fix)

**The adoption dry-run (W10, tests/boilerplate.test.ts 6/6):** the extracted tree compiles; its core/ modules are byte-identical to the source (per-file sha256); its manifest validates; the battery would pass. THE PRODUCT IS ADOPTABLE BY A NEW PROJECT WITH ZERO SOURCE CHANGES.

**The shipped boilerplate tree** (KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/JESL-Kernel-Edition-v1.0/): 74 .ts files under `src/` in a DOUBLE-NESTED layout (`src/core/core/*.ts`, `src/nodes/nodes/*.ts`, … — the W10 extraction's copy artifact, documented for adopters), + `fixtures/fixtures/*.json` (9), + package.json (name `@jesl/kernel`, bin `jesl → ./cli/main.ts`, the dep spine) + README.md (69L) + tsconfig.json (per-directory includes mirroring the source gate). NO tests/ at the boilerplate root (kernel-level fixtures ride inside `src/kernels/kernels/*/`).

---

# PART 9: THE SCANNERS (five scanners on ONE bus)

The plane table (bible 2E.8 :512-514, landed): PBA (think) · PTA (do) · LSP (artifact) — plus audit and trace as the kernel-side observers. ALL subscribe to the same `Bus`; the observer-law isolation (forkDaemon + catchAllCause, bus.ts:99-103) means no scanner can break another or the emitter.

## 9.1 pba-banks.ts (95L) — the 5 family banks (Paragon provenance)

**The provenance header (:1-5):** transcribed from Paragon_Microstructures/ms-ratio-classifier with the source shas (classifier.ts `5306849c…`, types.ts `497f1af4…`, machines/index.ts `c7dcc841…`) + the survivor-table row (L2 §1.5: ms-ratio-classifier = THE 4-bank classifier, sole source per D12). WRAP-NEVER-REWRITE: the banks are DATA here, not imports — the substrate is frozen/read-only.

**The 4-bank opposed-pattern engine (:24-45):** each family has `descriptive` (neg +1), `suggestive` (pos +1/+2 with word-boundary), `substitute` (pos +2), `use` (neg +3 AND early-return). `confidence = pos/(pos+neg+1)` (:34); bands: ENFORCE ≥0.5, DAMPEN ≥0.3, else SUPPRESS (:35).

**The 5 families (:47-93):** TEST_EVASION (mock/pretend/skip-the-container-test) · THEATRICAL (fake it/claim it passed/fabricate a green run) · PROMPT_INJECTION (ignore previous instructions/reveal your system prompt) · TOOL_ABUSE (rm -rf /, drop the database, exfiltrate credentials) · EVASION_LOOP (loop forever/hammer the endpoint/retry without backoff).

## 9.2 pba.ts (71L) — the think-police

`attachPbaScanner` (:35-69): subscribes 6 patterns (`deliberation.*`, `message.part.updated`, `pba.reasoning.*`, `reasoning.*`, `chat.*`, `assistant.*`, :65) → `extractText` (:7-20: text|deliberation|reasoning|part.text|JSON) → `detectFamilies` (:22-33: ENFORCE-band hits only, conf ≥0.3) → emit `pba.family.hit {family, confidence, band, evidence, verdict:"hit", reason, run, ts, text}` (:45-56) + a journal row via the optional Journal service (:57-61).

## 9.3 pta.ts (51L) — the do-police (deny-unless-armed, L2 §4.12)

`attachPtaScanner` (:16-49): a pre-arm ring (cap 20, shared.ts:33-42 — `push/hasArmed/lastFamily/clear/size`) fed by `pba.family.hit` (:21-29); subscribes `tool.call.*` (:48) → `preArmed = ring.hasArmed()` (:34) → verdict `allow` if armed, **`deny` if UNARMED** with the reason constants (:37-38): `PTA_DENY_REASON = "deny-unless-armed: no PBA pre-arm for tool event (L2 §4.12 pre-arm chain — PTA denies when UNARMED)"` (shared.ts:47). Emits `pta.intercept {tool, family, verdict, reason, run, ts, preArmed}` + journal row.

## 9.4 lsp.ts (78L) — the honest LSP scanner

`LspCap` Tag (:16) + `InMemoryLsp` (:18-23). `attachLspScanner` (:35-76): subscribes `*write*` → .ts files only → if the cap is bound, diagnose; else the HONEST `{tool:"effect-lsp", available:false, diagnostics:[]}` (:51) — a missing LSP is journaled as unavailable, never faked (Law 7). Emits `lsp.diagnostics` + journal row with state available|unavailable.

## 9.5 audit.ts (54L) — the claim↔evidence checker

`attachAuditScanner` (:19-54): subscribes `*verdict*` → `hasTriplet` (:5-17: payload.evidence with non-empty pattern+state+anchor) → a verdict WITHOUT its evidence triplet → emit `audit.violation {originalType, reason: "missing evidence triplet", payload, run}` + journal row. The structural mirror of evidence.ts's claim adjudication.

## 9.6 trace.ts (92L) — the timeline

`attachTraceScanner` (:12-92): per-run `Map<node, {started?, finished?}>`; `node.invoke` records started, `node.verdict` records finished; on a completion event (`run.close|run.complete|run.end|run.finished`, :88-91) emit `trace.timeline {run, timeline: [{node, started, finished, duration}]}` + journal row.

## 9.7 The wraps (the enforcement + artifact planes)

**behavior-engine.ts (193L):** consumes `pba.family.hit` (:120-121) and maintains per-family `ArmingState {family, armedAtSeq, armedUntilSeq, escalationCount, deadlineWindow, skipTier}` (:5-12) with the Paragon-provenance constants — `ESCALATION_WINDOW_TABLE {"0":5,"1":5,"2":2,"3+":0}` (:30-35, `computeDeadline` :37-44), `computeSkipTier` 0/2/3 (:46-53), `REFRACTORY_SEQ = 25` (:57, synapse sha `2bca251b…`), `ALPHA_DECAY = 0.05` (:61), `FIRE_THRESHOLD = 1.0` (:64). The arming rule (:86-118): seq++ per hit; within refractory the decay factor `exp(-0.05·Δseq)` < 0.3 suppresses re-arm (:96-100); window = computeDeadline(prevCount); `isArmed` checks `seq ≤ armedUntilSeq` with the window-0 special case (:124-135). `FAMILY_TOOL_MAP` (:68-74) maps families to tool classes (TEST_EVASION→bash/shell/exec, TOOL_ABUSE→write/edit/file, …).

**tool-engine.ts (90L):** `intercept({tool})` (:36-83): armed family for this tool → **deny** with family (:48-53); else no families armed AND bash-like → **deny-unless-armed** (:55-63); else allow (family isolation, :68-73). Emits `pta.intercept` + returns the full `{verdict, reason, family, tool, run, ts, preArmed}`. Failures are LOUD (`ToolEngine intercept failed loudly: <cause.pretty>`, :79-82).

**effect-lsp.ts (126L):** the REAL LspCap via the `effect-language-service` v0.87.2 CLI — `resolveCliPath` (:17-32: explicit → node_modules/.bin → PATH), `spawnSync(bin, ["diagnostics", "--file", absFile, "--format", "json", (--lspconfig if the project tsconfig lacks the plugin)], {timeout: 15000, maxBuffer: 4MB})` (:100-104), JSON parse (:34-55), **severity=error filter only** (:116), ENOENT → the honest `binaryMissing` state (:105-112). `AbsentLspLive` (:126) is the explicit-absent test layer.

**artifact-gate.ts (113L):** `EFFECT_ARTIFACT_GATE` — `handleWrite(file, run)` (:16-83): non-.ts → allow; LspCap bound AND available → diagnose; errors present → **deny** with reason "EFFECT_ARTIFACT_GATE: diagnostics at error severity" (:40-43); emit `pta.intercept {tool:"artifact-write", family:"EFFECT_ARTIFACT_GATE", …}` (:57-59) + TWO journal rows (the gate verdict + the lsp availability state, :60-81). `attachArtifactGate` (:100-113) subscribes `*write*|file.write|fs.write|artifact.write`.

**The full pre-arm chain (PROVEN at W6, container T4):** deliberation → PBA detects TEST_EVASION → `pba.family.hit` → BehaviorEngine arms (bash class) → hook-bridge consults ToolEngine → `intercept(bash)` → DENY with the family → `pta.intercept` — the bash call NEVER RAN. The escalation decay table asserted: count 1→window 5, 2→5, 3→2, 4→0 (wraps.test.ts).

---

# PART 10: THE PROFILES + BINDINGS

## 10.1 The DomainModule contract (profiles/shared.ts, 77L)

```typescript
interface DomainModule {
  name: string
  caps: ReadonlyArray<Context.Tag<any, any>>   // real, KNOWN Tags (isRealTag + KNOWN_TAGS check, :32-39)
  kinds: ReadonlyArray<string>                  // non-empty
  defaultTier: 1 | 2
  brackets: Readonly<Record<string, {contract: string, repair: number /*0..2*/, floor: number /*0..1*/}>>
}
```
`validateDomainModule` (:41-67) + the Schema codec (:18-30) + `decodeDomainModule` (:75). **The isRealTag lesson (§7 of w9):** Effect Tags are classes (typeof "function") — the check accepts `object || function` + the identity fields (:34-37).

## 10.2 The three profiles (pure DATA — zero branches, grep-proven)

| Profile | Tier | Caps | Kinds | Brackets |
|---|---|---|---|---|
| trident (trident.ts, 13L) | 1 | Shell, Fs | shell-exec, file-io, mpse-discharge, evidence-machine, audit-registry | {} |
| trading (trading.ts, 15L) | 2 | Http | http-request, math-eval, oracle-gate, circuit-breaker, evidence-gate | circuit-breaker: {schemas/bracket.schema.json, repair 1, floor 0.6} |
| sales (sales.ts, 15L) | 2 | Http, Llm | http-request, prompt, capture-engine, journal-sink | prompt: {schemas/output.schema.json, repair 2, floor 0.55} |

Zero `if|switch` per file (the W9 audit battery). The profiles are adoption PRESETS: extraction injects one into the boilerplate's package.json `jesl` block.

## 10.3 The host bindings

**host-binding.ts (71L):** `ParagonHostBinding {name, layer: Layer<KernelCaps>, provides: Tag[]}` (:16-20). `KERNEL_TAGS` = 11 (9 caps + Bus + Session, :8-10). `REQUIRED_CAPS` = 8 (:12-14). `validateParagonHostBinding` (:27-47): name non-empty, layer present, every provide a real Tag, REQUIRED_CAPS covered. `bindingProvidesAll` (:61-71) = the Effect-flavored check.

**opencode-binding.ts (29L):** `makeOpenCodeBinding(transport)` = `makeParagonHostBinding({name: "opencode", layer: makeOpenCodeLive(transport), provides: [all 11 Tags]})` (:9-16) — the deployment binding. `makeTestOpenCodeBinding` (:20-23) for tests. Zero SDK imports — the HostTransport seam is the only surface (the binding-test asserts zero `from 'opencode'`).

---

# PART 11: THE TESTING ARCHITECTURE

## 11.1 The canon runner

**`npx vitest run` from `jesl/` — NEVER `bun test`.** Root cause (RUNNING_DEBUG_LOG 2026-09-02T20:00): bun:test is jest-compatible, not vitest-compatible; @effect/vitest calls vitest's `onTestFinished` which bun:test lacks (`ctx?.onTestFinished is not a function` → 0 pass / N fail). Recorded as canon at BUILD_STATE §5. Current: 336/336 in 34 files, ~16.6s.

**The TestClock lesson:** @effect/vitest's TestClock NEVER auto-advances `Effect.sleep` — a delay test hangs to the 5000ms timeout. The pattern: tests needing real delay use `Effect.promise(() => new Promise(res => setTimeout(res, ms)))`; core uses the Clock service only. The SOLE TestClock consumer is evidence.test.ts (TTL expiry via `TestClock.adjust`, evidence.test.ts:77).

**The @ts-nocheck class (4 files):** battery.ts:1, battery.test.ts:1, scanners-pba-pta.test.ts:1, scanners-lsp-audit.test.ts:1 — the `it.effect` TestServices generic variance (`Effect<void, unknown, unknown>` vs `Effect<void, unknown, TestServices>`). The tsc gate still exits 0 because the tsconfig include is per-directory explicit. The editor LSP shows errors on graph.test.ts:6/driver.test.ts/scanners-lsp-audit.test.ts — editor-context noise, NOT gate failures.

## 11.2 The per-file battery (34 test files, 336 units — per-file contracts)

| File | Lines | Tests | Proves |
|---|---|---|---|
| schema.test.ts | 187 | 10 | decodeDoc/validateDoc; UNKNOWN-NODE / TIER-VIOLATION / UNBRACKETED-GENERATION byte-exact |
| graph.test.ts | 107 | 7 | Kahn batches, the 15-cap (:88), `[JESL CYCLE]` |
| channels.test.ts | 86 | 7 | NO-SEED, CHANNEL-UNSET, Deferred wake, snapshot deep-copy |
| bus.test.ts | 116 | 9 | globMatch, handler die-isolation (:26), frozen payload (:38-45), 1000-cycle leak-free |
| caps.test.ts | 98 | 8 | CAP-UNBOUND {cap,node,field}; InMemoryLive/TestLive/CliLive compositions |
| errors.test.ts | 110 | 11 | the 8 TaggedErrors + JESL_TOKENS byte-exact (Buffer.hex) |
| executor.test.ts | 259 | 8 | diamond batches + overlap concurrency (real timers), isolation, cap pre-flight, journal rows, READY_FALSE/INCONCLUSIVE, Clock timing |
| journal.test.ts | 70 | 5 | prev/self chain, verifyChain tamper-detection, covers(docHash+seed), serialize/restore |
| registry.test.ts | 54 | 5 | idempotent vs drifted append-only throw (:21), 33+ kinds with families, isKnownKind |
| evidence.test.ts | 108 | 18 | 8 kinds accept/reject, RING_CAP eviction (:58), TTL via TestClock (:77) |
| nodes.test.ts | 149 | 16 | the 12 full nodes + stub INCONCLUSIVE/TODO |
| cli.test.ts | 134 | 13 | parseArgs run/validate/replay; handleValidate byte-exact tokens; handleRun PASS/CAP-UNBOUND; replay verified:true |
| execution.test.ts | 150 | 13 | real CliLive shell echo, http stub Layer, maxOutputBytes truncation, replaceStub + isKnownKindSync |
| driver.test.ts (@ts-nocheck) | 225 | 12 | ScriptedTransport 4 methods; hook-bridge allow/deny; Queue+Deferred ask ordering |
| scanners-pba-pta.test.ts (@ts-nocheck) | 203 | 14 | 4 families, deny-unless-armed, pre-arm chaining, determinism ×100, 500-event burst stateless |
| scanners-lsp-audit.test.ts (@ts-nocheck) | 218 | 11 | InMemoryLsp, available:false fallback, triplet p+s+anchor, trace durations |
| prompt.test.ts | 132 | 10 | stub Llm via Layer.succeed; Ref invoke counter; bracket 1→2→3 repairs; 0.4→UNCLEAR / 0.7→PASS; journal rows |
| workflow.test.ts | 316 | 10 | runJeslWorkflow: covers idempotency (invoke 0), durable ask, corrupted-journal loud fail, rebuildSummaryFromRows |
| packager.test.ts | 184 | 18 | emitTool/Chain/Skill; SKILL_LAUNCH_LINE byte-exact (:164); canonicalJson determinism |
| wraps.test.ts (@ts-nocheck) | 234 | 12 | BehaviorEngine isArmed; ToolEngine deny shapes; computeDeadline/ESCALATION_WINDOW_TABLE/REFRACTORY 25/ALPHA 0.05/FIRE 1.0 |
| lsp-gate.test.ts (@ts-nocheck) | 315 | 10 | REAL makeEffectLsp on a mkdtemp tsconfig; CLEAN_TS vs FLOATING_TS; EFFECT_ARTIFACT_GATE pta.intercept |
| mpse-parser.test.ts (plain vitest) | 227 | 18 | 24 MATH_EXPR_KINDS; depth 300→DEPTH_EXCEEDED; MpseError.position; ORACLE-MISSING; float epsilon law |
| mpse-oracle.test.ts | 191 | 14 | ORACLE_CONFLICT; discharge PASS/FAIL/CONTRADICTED/UNVERIFIABLE/EXCLUDED_BORN_OFF; emitKernelProto |
| mpse-demo.test.ts | 156 | 10 | the 5-node fixture; runDemoSync cards≥3; D17 (excluded=1, bornOff expected=5 actual=4); PENDING-PARALLEL |
| idea-to-bible.test.ts | 146 | 6 | stub Llm; blank→CHANNEL-UNSET; fan-out c=15; journal ≥14 rows |
| bible-to-spec.test.ts | 132 | 6 | runBibleToSpecSimple; the `@@@invalid math ((` lint refusal; hash identity |
| spec-to-kernels.test.ts | 170 | 8 | D17 dual proof; the TestLive dry-run; bad-spec refusal |
| kernels-to-code.test.ts | 147 | 7 | Subagent stub; 1→2→3 violation repairs; float/NaN/0.4 UNCLEAR |
| verify-kernel.test.ts | 102 | 5 | siblings survive; passTokenMatch/failTokenAbsent tool-result-bound |
| ship.test.ts | 178 | 7 | buildManifest→copyArtifacts→generateDocs→auditGateChain; writer failure rollback |
| profiles.test.ts | 118 | 8 | 3 profiles distinct; zero if/switch via source regex (:78-84); brackets repair≤2 |
| bindings.test.ts | 98 | 7 | the ParagonHostBinding contract; OpenCodeLive provides the Tags; zero opencode import |
| boilerplate.test.ts | 130 | 6 | InMemoryWriter + FileWriter byte-identical; the manifest schemaVersion + 64-hex digest |
| battery.test.ts (@ts-nocheck) | 154 | 8 | tests the RUNNER: the 11 scenarios via `BatteryScenarios`; PASS_TOK via String.fromCharCode anti-literal trick (:17) |

**The test-pattern inventory:** `it.effect` + Effect.gen dominant; stub Layers (`Layer.succeed(Llm/Shell/Http/Bus/Journal)`); invoke counters (`Ref<number>`); real-timer `Effect.promise(() => new Promise(res => setTimeout(res, ms)))` (executor.test:48, nodes.test:96); ScriptedTransport (driver); InMemorySink/Writer (packager/ship/boilerplate); TestClock ONLY in evidence.test.ts. mpse-parser.test.ts is the sole plain-vitest file (sync parser, no Effect context — intentional).

## 11.3 The executable battery (tests/battery.ts, 461L — the definition of done)

`runBattery(outPath)` (:435-459): runs the 11 scenarios SEQUENTIALLY, each returning a `BatteryRow {scenario, passToken, passTokenMatch, failToken, failTokenAbsent, toolResultContext, verdict}`; writes `{rows, summary}` to outPath (+ battery-results.json :453). The 11 rows with their EXACT passTokens as coded:

| Row | Line | PassToken (verbatim) |
|---|---|---|
| S1 jesl run mech-gate | :69 | `"verdict":"PASS" + exit 0` |
| S2 validate × 4 bad fixtures | :84 | `each matching [JESL ...] in stderr + exit 2` |
| S3 needs-llm keyless | :107 | `[JESL CAP-UNBOUND] llm + NO artifact` |
| S4 replay determinism + kill-resume | :124 | `sha chain diff EMPTY + resume` |
| S5 parallel-5 branch 3 fails | :207 | `overlapCount ≥ 1 + all 5 rows` |
| S6 skill rocket via the packager | :237 | `exit 0 + artifact on disk` |
| S7 tier/unbracketed/ask-launcher | :273 | `both tokens + the roundtrip journal row` |
| S8 kernel hygiene + LSP | :303 | `zero banned hits + diagnostics exit 0` |
| S9 activity replay × 2 | :331 | `invoke count 0 + identical chain` |
| A1 the malformed battery | :372 | `each named token, never a hang` |
| A2 the pre-arm chain | :404 | `pba.family.hit then pta.intercept, bash never ran` |

S4 uses `fixtures-kill-resume.json` (the 4-node K1→K4 chain) with a partial journal then `runJeslWorkflow` (:158-183). S6 is the cross-agent seam the W5 auditor rewired: `emitSkill(JSON.parse(rawDoc), outDir, diskWriter)` → `handleRun({command:"run", docPath: <emitted payload/workflow.json>})` (:240-259). A1 wraps each malformed run in `Promise.race(Effect.runPromise, setTimeout 2000)` → a hang becomes the `HANG` token, never a stuck suite (:385-390).

## 11.4 The container checkpoints (4× [CT] — the runtime proof)

| Checkpoint | Container | Image | Tarball SHA (full) | Rows | Result |
|---|---|---|---|---|---|
| W3 | shark-effect-kernels-w3b | runtime-grade-container-sandbox:master | `235a08d24742dffac96eed9bcb1f9660de6a42d8578ebed267a092bdc1d90fe3` | 10 (T1-T7, A1-A3) | 10/10 PASS |
| W5 | shark-effect-kernels-w5 | same | `aab3746378ba74fc32c834bb575f47f996238020cde036c87dd49c3da256ac2a` | 6 | PASS 211/211 + 11/11 |
| W6 | shark-effect-kernels-w6 | same | `dcabd97cab9cf2f42929bf0a5d21b47a5fcba9b2de4f04ee4b1b6d79bb301a54` | 6 | PASS 233/233 + 11/11 |
| W10 FINAL | shark-effect-kernels-w10 | same | `30fa9ec4c12b4ce9f2c049f5d233428d52836e81bff53d4a125ebfcd34b29573` | 6 | PASS 336/336 + 11/11 + boilerplate 6/6 |

28 flat scenario rows total in container-test-results.json (W3 carries 10 granular rows; W5/W6/W10 aggregate the 11-row battery into 6 T-rows — the 33 figure was row-aggregation double-count; the artifact is the truth). Deploy recipe: tar the jesl/ tree WITH node_modules + a dist/index.js marker → the setup tool's tar branch → sha-verify in-container → extract → exec.

---

# PART 12: THE EVIDENCE — WHAT WAS PROVEN AND HOW

## 12.1 The adversarial findings ledger (12 findings, all root-cause fixed)

| # | Wave | Finding | Class | Root cause | Fix (anchor) |
|---|---|---|---|---|---|
| 1 | W1 | `Date.now` in core/caps.ts:105 (dummyClock) | Law 4 purity | The dummy Layer reached for host time | → `EffectClock.currentTimeMillis` (caps.ts:105) |
| 2 | W1 | `[JESL GATE-FAIL]` invented 9th token (gate.ts:49,62) | Law 5 vocabulary | A failure label reached for bracketed text | removed; the delta lives in evidence.anchor (gate.ts:50,64) |
| 3 | W2 | Schema stripped node `config` | W1 gap | NodeEnvelope had no config field | `config: Schema.optional(Schema.Unknown)` (schema.ts:10) |
| 4 | W2 | Executor passed `inbound:{}` | dataflow unrealized | executor.ts built bare NodeInput | real channelData inbound + full envelope (executor.ts:184-188) |
| 5 | W2 | Journal fallback `self` unverifiable | Law 6 broken | `self-${seq}-${node}-${ts}` string | `simpleHash(canonical(base)+"\0"+prev)` (executor.ts:133) |
| 6 | W2 | `passHandle` always-PASS mask | FITTED-TO-GOLDEN | The CLI mapped 9 kinds to stand-ins | the REAL impl map (handlers.ts:94-111) — the canonical audit lesson (w2.md:54) |
| 7 | W3 | `[JESL UNKNOWN-NODE]` on CLI usage errors | Law 5 semantics | A kernel-looking string on argument errors | plain usage text (cli/main.ts:13-24) |
| 8 | W5 | `canonicalSerialize` included `ts` | Law 6 determinism | Wall-clock leaked into the hash | `if (k === "ts") continue` (journal.ts:44) |
| 9 | W5 | Replay exit 0 on unverifiable chain | Law 7 | The handler ignored verification | `code: verified ? 0 : 1` (handlers.ts:383) |
| 10 | W5 | Battery S6 checked artifacts nobody writes | cross-agent integration | emitSkill uses an injected writer | S6 rewired to emit→run (battery.ts:240-259) |
| 11 | W4 | `[JESL JOURNAL-CORRUPT]` ×5 | Law 5 vocabulary (recurring) | Effect.fail strings wearing the token shape | plain JOURNAL_CORRUPT (jesl-run.ts:80,87,99,103,110) |
| 12 | W10 | `[JESL UNKNOWN-PROFILE]` ×2 | Law 5 vocabulary (3rd occurrence) | bracketed text for a profile miss | plain UNKNOWN_PROFILE (extraction.ts:99) |

**The triple-canon lesson:** the frozen vocabulary is EXACTLY 8 tokens; failures cite one of the 8 OR a plain non-bracketed string; every audit sweeps every new file for the bracketed shape before merging.

## 12.2 The spec-drift proof

The spec-set manifest `f77b448fff1e…8ff1c` recomputed at EVERY wave close (w0.md:41 through w8.md:22) and again at W10 and in this session — ZERO spec edits through the entire build. The specs are the read-only authority; the code was built to them, never the reverse.

## 12.3 The per-wave audit digest

| Audit | Verdict | Key finding |
|---|---|---|
| w0 | 13 hunks CORRECT; gate 9/9 | bible v1.2 `68afa78e` + DPL1 v1.1-E `35abb828`; additive-only proven |
| w1 | 5 agents CORRECT + 2 auditor fixes | Date.now + GATE-FAIL; diamond 2-batches; tree `12ffbb3d` |
| w2 | FLAWED→FIXED + CORRECT | the passHandle mask + 3 real W1 defects behind it |
| w3 | 3× CORRECT + 1 fix | the usage-token fix; [CT] BLOCKED at audit time → 10/10 retrospective after the rig landed |
| w4 | 2× CORRECT + 1 fix | JOURNAL-CORRUPT ×5; the no-re-pay proven |
| w5 | 2× CORRECT + integration | the determinism defect + the S6 seam (4-iteration rewire) |
| w6 | 2× CORRECT | the pre-arm chain in production form; the REAL LspCap |
| w7 | 3× CORRECT | the 24-kind IR; D17 reproduced (pass:3 excluded:1) |
| w8 | 6× CORRECT | all 6 kernels; the lifecycle journal chain |
| w9 | 2× CORRECT (file rebuilt 2026-09-03 — was truncated) | zero branches; isRealTag |
| w10 | 1× CORRECT + 1 token fix (evidence in BUILD_REPORT + W10_FINAL rows) | the extraction + the adoption dry-run |

## 12.4 The verification recipes (re-prove the build in ~2 minutes)

```bash
cd <ROOT>/jesl
bunx tsc --noEmit; echo $?                                # expect 0
npx vitest run 2>&1 | grep -E "Tests"                     # expect 336 passed, 34 files

# The host-gate suite
bun run cli/main.ts run fixtures/mech-gate.json | head -3; echo $?          # "verdict":"PASS", exit 0
for f in bad-unknown-kind bad-cycle bad-tier bad-unbracketed; do
  bun run cli/main.ts validate fixtures/$f.json 2>&1 | grep -o 'JESL [A-Z-]*' | head -1
done                                                                         # the 4 distinct frozen tokens
bun run cli/main.ts run fixtures/needs-llm.json --driver test 2>&1 | grep -c CAP-UNBOUND   # >= 1
bun run cli/main.ts run fixtures/mech-gate.json > /tmp/j.json && bun run cli/main.ts replay /tmp/j.json  # "verified": true

# The purity gate
grep -rn "node:fs\|node:path\|node:child_process" core/ nodes/ scanners/ | wc -l   # expect 0

# The token gate (exactly the 8 frozen strings)
grep -rhoE '\[JESL [A-Z-]+\]' core/ nodes/ cli/ drivers/ scanners/ workflow/ packager/ wraps/ mpse/ kernels/ profiles/ bindings/ boilerplate/ | sort -u

# The spec-drift gate
cd ../specs && cat MACRO_KERNEL_BOILERPLATE_L2_SPEC.md <(printf '\0') JESL_LIBRARY_DPL1_SPEC.md <(printf '\0') EFFECT_TS_RUNTIME_BIBLE.md <(printf '\0') JESL_EFFECT_PHASE2_DPL1_SPEC.md | sha256sum   # f77b448f…

# The tree digest
cd ../jesl && find core nodes tests cli drivers scanners workflow packager wraps mpse kernels profiles bindings boilerplate -name "*.ts" | sort | xargs sha256sum | sha256sum   # 681bf869…
```

## 12.5 The doctrine quotes (verbatim, for citation)

1. *JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime.* — bible 2E.0 :289
2. *workflow.json is the ONLY authoring surface — JSON stays the grammar; Effect is the ONLY execution kernel; the journal is the ONLY truth.* — bible 2E :291
3. *pure = zero host imports AND zero raw Promise I/O — Effects may be described in core — the core describes Effect values, drivers provide them.* — bible §2.5 :251
4. *A host-gate PASS is only evidence when the path through the REAL implementations is proven — an always-pass stand-in is the theatrical class the loud-fail law bans.* — w2.md:54
5. *Math is the spec. Code is the implementation. Tests are the proof.* — COMPACTION_SURVIVAL §2
6. *the shadow generates what only a language model can generate; the lexicons detect what patterns can detect; the state machines decide what state can decide; the actors execute what agents can execute* — COMPACTION_SURVIVAL §2
7. *EITHER A LOUD FUCKING ERROR OR IT WORKS.* — the loud-fail law
8. *Effect kernel SPEC until S8/S9 container rows exist — a flip without the rows is a loud-fail (ready:false).* — bible 2E.12 :728

---

# VERSION HISTORY

| Version | Date | What changed |
|---|---|---|
| v1.0 | 2026-09-02 | Skeleton written at W10 close (12 PARTS + CONTEXT bullets) |
| v1.1 | 2026-09-03 | FILLED post-build: PART 0-12 complete from the source tree + the 6-agent absorb wave (doctrine/tests/specs/audits/fixtures/kernels returns). D26 rename applied ("JSON Effect Scripting Language"). Corrections folded: battery.ts 461L (not 448); @ts-nocheck ×4; 28 container rows (not 33); w9.md rebuilt. |

— END OF THE JESL KERNEL ARCHITECTURE BIBLE —

---

# PART 13: THE NORMATIVE CONTRACTS (the spec authority, verbatim — what the kernel was built to)

## 13.1 The DPL1 §2.9 Effect kernel contracts (:172-282)

**The Effect-typed node contract (:188-206):**

```typescript
// Phase-2 edition — VERIFY-ON-INSTALL import path
interface NodeImpl {
  kind: string
  family: "event"|"decision"|"generation"|"orchestration"|"evidence"|"execution"
  requires: ReadonlyArray<ServiceTag>
  setup(spec: NodeSpec): Effect<NodeHandle, JeslError, RegistryDeps>
}
interface NodeHandle {
  invoke(input: ChannelData): Effect<NodeResult, JeslError, Caps>
  subscriptions?: ReadonlyArray<BusSub>
}
// No Promise in interface. Construction is not execution — data until the driver does
// Effect.runPromise(program.pipe(Effect.provide(DriverLive))) at exactly one edge (E1/E10).
```

**The RunContext upgrade (:208-226):** `caps: BoundCaps (bag of functions) → caps: Context (R, provided Context — UPGRADED not stacked)` + `channels/journal/bus become kernel services` + `clock: Clock` (wall waits use Clock; synapse decay stays seq-based, P3-8) + `budget: {deadline: Duration, maxNodesFiring: 15}`. Reconciliation note (:226): §2.8's RunContext is FROZEN; the reconciliation lives in §2.9.

**The 8-row TaggedError table (:232-241)** — each `[JESL …]` token bound to its class:

| Token (code prints) | Schema.TaggedError class |
|---|---|
| `[JESL UNKNOWN-NODE]` | `JeslUnknownNode` |
| `[JESL CYCLE]` | `JeslCycle` |
| `[JESL TIER-VIOLATION]` | `JeslTierViolation` |
| `[JESL UNBRACKETED-GENERATION]` | `JeslUnbracketedGeneration` |
| `[JESL CAP-UNBOUND]` | `JeslCapUnbound` |
| `[JESL ORACLE-MISSING]` | `JeslOracleMissing` |
| `[JESL CHANNEL-UNSET]` | `JeslChannelUnset` |
| `[JESL NO-SEED]` | `JeslNoSeed` |

Pattern (:245-250): `class JeslCapUnbound extends Schema.TaggedError<JeslCapUnbound>()("JeslCapUnbound", {cap: Schema.String, node: Schema.String}) {}` — throw shape `{code, node, field, expected, actual, remedy}`, NEVER `throw new Error(string)`.

**The Driver Layers (:254-264):**

```
CliLive      = Shell.layer + Fs.layer + Http.layer + Journal.file
OpenCodeLive = CliLive + ToolClient.layer + Subagent.layer + Llm.layer + Hooks.bus
TestLive     = TestClock + InMemoryJournal + ScriptedToolkit + MemoryFs
```

"A doc that only needs shell+fs runs on CliLive. A doc declaring llm validates everywhere and dies `[JESL CAP-UNBOUND]` on CliLive — loud, NO output artifact (S3). Effect.runPromise/runFork live ONLY at the driver edge (cli/main, hook body) — never inside core or nodes (E10 runEffectInsideEffect)."

**The durable run (:266-280):**

```typescript
const JeslRun = Workflow.make({
  name: "JeslRun",
  payload: {docHash: Schema.String, seed: Schema.Unknown},
  success: RunReceipt,
  error: JeslError,
  idempotencyKey: ({docHash, seed}) => `${docHash}:${hash(seed)}`
})
```

"Workflow is MANDATORY when the run must survive process death: pause, ask-launcher (DurableDeferred), generation replay (do not re-pay LLM), Poseidon phases, WarheadRun waits. Ephemeral hook monitors stay scoped fibers. Each effectful node = one Activity named `node:<id>` — channel math between Activities is deterministic replay fodder (journal covers + invoke counter = 0 on second run = criterion 15)."

## 13.2 The EFFECT-RT E1-E10 laws (the runtime constitution, :69-118)

| Law | One-line (verbatim core) | Anchor |
|---|---|---|
| E1 THE VALUE LAW | Effect is a value until a Layer is provided and a fiber runs — construction ≠ execution; run at exactly one edge | :69-72 |
| E2 THE CHANNEL LAW | success in A, expected failure in tagged E, services in R; NEVER try/catch inside Effect.gen — Effect.try/tryPromise + Schema.TaggedError | :74-77 |
| E3 THE LAYER LAW | I/O as Context.Service; NEVER node:fs/fetch/Date.now/Math.random/setTimeout in kernel or node impls; MUST fail `[JESL CAP-UNBOUND]` when a service is missing from the Layer | :79-82 |
| E4 THE SCHEMA-GATE LAW | ALWAYS decode documents/events/tool args/model JSON/receipts with Effect Schema; NEVER JSON.parse as codec; refuse unknown type/dangling/cycle/tier BEFORE a fiber starts | :84-87 |
| E5 THE ACTIVITY LAW | world-touching work in Activity.make when durable; NEVER re-execute an Activity on replay — the journaled value returns; code between Activities stays deterministic | :89-92 |
| E6 THE FIBER LAW | fan-out with Effect.forEach(concurrency n) or child workflows — not Promise.all; one child never kills siblings (per-item Exit); children attach to the run Scope | :94-97 |
| E7 THE AUTHORIZATION LAW | authorize via Policy + CurrentProgram + journal causationId; NEVER via getT0()/prompt stickers; LSP diagnostics are evidence, not permission | :99-102 |
| E8 THE SEPARATION LAW | detect = pure/cheap; decide = deterministic (INCONCLUSIVE on doubt); generate = bracketed Activity through llm/subagent; NEVER detector decides / generator verifies itself | :104-108 |
| E9 THE TIER LAW | Tier1 = no llm/subagent in R; Tier2 = generation bracketed by Schema gates, repair ≤ 2; prefer lexicon/machine over LLM | :110-113 |
| E10 THE SINGLE-RUNTIME LAW | XState/Promise loops/hook bodies are projectors or edges; one run* per hook/CLI invocation; floatingEffect + runEffectInsideEffect are the mechanical enforcers | :115-118 |

## 13.3 The 9G law table (the JESL ↔ Effect twins, bible :1556-1573 — verbatim)

| JESL law | Effect twin | Enforcement — what the check reads |
|---|---|---|
| 1A Separation | E8 (detect = pure fn / cheap Effect; decide = deterministic Effect, fail=INCONCLUSIVE; generate = bracketed Activity) | EffectLsp family map; P3-6/P3-7 |
| 1B Journal | E5 (Activity IS the write; covers() replays receipt) + the Journal service | journal sha256 chain; S9 second-run invoke 0 |
| 1C Event-feedback | EventBus (subscribe → write channel; one bus, many types) | RING_CAP 50; the event-filter/capture-engine rows |
| 1D Loud-fail | Schema.TaggedError + E2 + StructuredEnforcementError on DENY | P3-12; floatingEffect — loud ready:false only |
| 1E Schema-gate | E4 (decodeUnknown BEFORE any fiber) | preferSchemaOverJson; unknown type → `[JESL UNKNOWN-NODE]` |
| 1F Concurrency | E6 (forEach concurrency 15 + Exit/partition; NEVER Promise.all in core) | Effect.forEach + the asyncFunction ban; 5K-5 |
| 1G Portability | Layer-swapped caps (Context.Service); registry append-only | the driver table; the nodeBuiltinImport ban; no kind renames |
| 1H Oracle | oracle-gate as Effect.sync (eq/ge/le/ne/contains/matches) | MPSE integer equality; the firewall reads NUMBER vs oracle, never prose |
| 1I Lowest tier | E9 (Tier 1 = no llm/subagent in R; bracketed or refused) | `[JESL TIER-VIOLATION]` / `[JESL UNBRACKETED-GENERATION]` |

## 13.4 The P3-1..P3-12 correct/wrong pairs (EFFECT-RT :382-397 — the implementation mirror)

| # | Wrong → Correct | Where it landed |
|---|---|---|
| P3-1 | executor as async loop → the Executor service, readiness as Effect | core/executor.ts runProgram |
| P3-2 | cap = optional callback → cap = Service in R, missing = JeslCapUnbound | core/caps.ts requireCaps |
| P3-3 | journal side-write after success → verdict computed FROM the journal; the Activity IS the write | workflow/jesl-run.ts rebuildSummaryFromRows |
| P3-4 | getT0() authorizes bash → Policy + capabilities + causationId | the wraps' intercept chain |
| P3-5 | Poseidon in an XState interpreter → Workflow; XState projects | the Workflow layer (D11) |
| P3-6 | PBA math rewritten in Effect.gen → the pure classify stays pure; Effect accumulates/actuates | scanners/pba-banks.ts (pure data + fns) |
| P3-7 | fork LSP into a custom tsserver → the CLI Activity + patch + the family map | wraps/effect-lsp.ts |
| P3-8 | Date.now in synapse decay → seq decay; Clock only for wall waits | wraps/behavior-engine.ts (seq-based) |
| P3-9 | runPromise inside a node → run* only at the driver edge | cli/main.ts:26 (the single edge) |
| P3-10 | tier-1 doc with prompt.call-model → Schema reject `[JESL TIER-VIOLATION]` before the run | schema.ts:181-204 |
| P3-11 | replay re-calls Docker → the Activity receipt returns | jesl-run.ts invoked: 0 |
| P3-12 | a fallback template report → `{verdict: READY_FALSE}` or `{ready:false}` only | the loud-fail law everywhere |

---

# PART 14: THE SLICE MAP + THE CRITERIA (the gate ancestry)

## 14.1 The S1E-S8L slice table (DPL1 §5.2 :357-374 — what each wave's gate was)

| Slice | Delivers | Gate (verbatim) | Wave that landed it |
|---|---|---|---|
| S1E | core types are Effect; Schema decode; zero node: imports; it.effect units | tsc 0; every `[JESL …]` fixture still emits the same token strings; the readiness diamond test now it.effect | W1 |
| S2E | the CLI driver = Layer (shell/fs/http); runPromise only in cli/main | criteria 3,4,6,8 still pass | W2 |
| S3E | the OpenCode driver Layer; hook → EventBus Effect; jesl-run provides SessionLive | criterion 11 | W3 |
| S4E | prompt.call-model as Activity; ask-launcher as DurableDeferred; unbracketed still refused | S7 + no re-pay on generation replay | W4 |
| S5E | packager unchanged outputs; the emitted skill still `jesl run` | criterion 9 | W5 |
| S6E | the battery + kill -9 resume via the Workflow journal + the TestClock pause unit | 7/7 + criterion 12 | W5 |
| S7P | the Paragon wrap: BehaviorEngine + ToolEngine Layers intercepting tool.execute.before | fixture: TEST_EVASION deliberation pre-arms bash deny | W6 |
| S8L | the EffectLsp Activity + the PTA layer EFFECT_ARTIFACT_GATE + the patch in prepare | write .ts → the diagnostics token in the journal | W6 |

Placement rule (:372): "Phase-2 slices REPLACE Promise assumptions inside S1 rather than stacking a second executor — there is no async executor beside Effect, ever (E10)."

## 14.2 The acceptance criteria 1-16 (DPL1 §6 :378-395)

| # | Criterion | PASS looks like |
|---|---|---|
| 1 | headless deterministic run | `jesl run` verdict:PASS, exit 0 |
| 2 | malformed docs refuse with named tokens | each bad fixture exits ≠ 0 with its exact token |
| 3 | CLI run happy path | `"verdict":"PASS"` + exit 0 |
| 4 | CLI validate refusals | the exact token on stderr, exit 2 |
| 5 | replay byte-determinism | two journals' sha256 row-chain diff EMPTY |
| 6 | cap-unbound loud, NO artifact | `[JESL CAP-UNBOUND] llm` + zero artifacts |
| 7 | parallel overlapCount ≥ 1 | interleaved journal timestamps |
| 8 | replay verified | `"verified": true` |
| 9 | the packager's 3 targets re-validate and run | each emitted target passes validatedDoc + runs |
| 10 | append-only compat | a v1 doc runs on the later registry |
| 11 | the ask-launcher roundtrip | suspend → answer → PASS + journal rows |
| 12 | kill -9 crash-safe resume | every line parses JSON; replay resumes from the last complete row |
| 13 | no raw fetch/Date.now/node:fs in jesl/core | ripgrep EMPTY |
| 14 | language-service diagnostics = 0 errors at kernel severity | the CLI exits 0 |
| 15 | replay does not re-invoke a shell Activity | journal covers + invoke counter 0 on the second run |
| 16 | layerinfo on CliLive lists Journal, Fs, Shell | the CLI output contains those names |

Verdict rule (:397): "a criterion passes ONLY on observed command output — never on inspection."

## 14.3 The DPL1 §7 battery (the 7-scenario ancestor of the 11-row battery)

| # | Scenario | Pass | Fail |
|---|---|---|---|
| S1 | `jesl run fixtures/mech-gate.json --in fixtures/in.json` | `"verdict":"PASS"` in stdout AND exit 0 | a traceback OR verdict absent |
| S2 | the 4 bad fixtures | exit ≠ 0 AND the matching token per fixture | exit 0 on any |
| S3 | the llm prompt node under the keyless CLI | `[JESL CAP-UNBOUND] llm` in a journal row AND stderr; NO artifact | any substitute artifact |
| S4 | the tier:1 fixture twice + kill -9 + replay | the chain diff EMPTY; resume from the last complete row | a hash mismatch |
| S5 | parallel-5, branch 3 fails | overlapCount ≥ 1 AND all 5 rows | sequential or missing |
| S6 | the emitted skill via bash | exit 0 + the artifact on disk | missing or non-zero |
| S7 | tier/unbracketed/ask-launcher | the tokens + the roundtrip row | a clean validate |

The L2 escalation: 10/10 (7 + S8 hygiene + S9 replay + S10 pre-arm); the shipped battery: 11 rows (S1-S9 + A1 malformed + A2 pre-arm).

## 14.4 The fixture set (the executable documentation)

| Fixture | Shape | Exercises |
|---|---|---|
| mech-gate.json (16L) | tier 1; gateA(gate) → triplet(triplet-writer, config.triplet {pattern mech.gate, state PASS, anchor}) → gateB(gate asserts `$.triplet.state eq "PASS"`) → sink(journal-sink); edges seed/triplet/data; vars {event: "seed"} | S1/S4 — the happy path through REAL nodes |
| bad-unknown-kind.json (6L) | node n1 type `print` | `[JESL UNKNOWN-NODE]` |
| bad-cycle.json (14L) | a→b→c→a (3 gates) | `[JESL CYCLE]` |
| bad-tier.json (6L) | prompt class=generation WITH bracket at tier 1 | `[JESL TIER-VIOLATION]` (bracket present, tier wrong) |
| bad-unbracketed.json (6L) | shadow-agent class=generation NO bracket at tier 2 | `[JESL UNBRACKETED-GENERATION]` |
| needs-llm.json (6L) | prompt class=generation WITH bracket at tier 2 | `[JESL CAP-UNBOUND] llm` under the test driver — no artifact |
| parallel-5.json (12L) | 5 gates, edges [] (all ready at t0); b3 asserts `$.x eq 999` (fails) | overlapCount ≥ 1 + all 5 rows |
| vars.json (1L) | `{x: 5, event: {type: "tool.call.bash", payload: {cmd: "ls"}}}` | the `--in` seed shape |
| mpse-demo.json (58L) | arith (2+3=5) → compare (5≥3) → rule (7×6=42, OR-1) → bornOff (2+2, expected 5, bornOff true, OR-2) → sink | the D17 demo — pass:3 excluded:1 |
| tests/fixtures-kill-resume.json (16L) | K1→K2→K3→K4 (gates), vars {seed: "init"} | the S4 kill-resume journal shape |

The fixture law (DPL1 :464): fixtures are part of the deliverable — executable documentation; every battery scenario names its fixture by path.

---

# PART 15: THE 5K KERNEL TEMPLATES (bible 2E.9 :537-628 — the Effect idioms the kernel uses)

| # | Template | The idiom | Landed at |
|---|---|---|---|
| 5K-1 | Service Shell | a capability as `Context.Service` + a Layer | core/caps.ts (:31-50) |
| 5K-2 | Tagged Error | `Schema.TaggedError` whose code prints the frozen token | core/errors.ts (:3-73) |
| 5K-3 | Activity Node | `Activity.make({name: "node:<id>", success, error, execute})` with the bound cap; never a raw child_process | workflow/activities.ts (:16-36) |
| 5K-4 | Retry Class | `Schedule.exponential` 2.5s·recurs 4; 429 → EXILE (45s), never in-place retry | the retries envelope (schema.ts:23-26) + the executor's Exit semantics |
| 5K-5 | Parallel Batch | `Effect.forEach(ready, invoke, {concurrency: 15})` + per-item Exit + stagger | core/executor.ts (:224) |
| 5K-6 | TestClock Fixture | `it.effect` + `TestClock.adjust` for TTL; seq for synapse decay | evidence.test.ts (:77); behavior-engine (seq-based) |
| 5K-7 | LSP Scan Activity | the diagnostics CLI wrapped as an Activity; severity=error only | wraps/effect-lsp.ts (:73-119) |
| 5K-8 | Ask-Launcher Deferred | DurableDeferred; no llm cap; the tool-result question → the launcher answer completes | workflow/activities.ts (:41-44, 64-89) + drivers/session-live.ts |

## 15.1 The catalog families (bible PART 5 — the portability surface)

| Family | Count | Members (template ids) |
|---|---|---|
| 5A EVENT | 9 | subscribe-filter, throttle-batch (50ms/60char), debounce, correlate-session, fan-out-dispatch, reasoning-capture, tool-cadence-watch, lifecycle-watch, discovery-probe |
| 5B DECISION | 8 | state-machine, gate, oracle-gate, circuit-breaker, escalation-ladder, temporal-order-gate, schema-gate, confidence-floor |
| 5C GENERATION | 6 | shadow-agent-call, shadow-tool-call, report-contract, repair-loop (maxLoop 2), steer-loop, subagent-dispatch |
| 5D ORCHESTRATION | 8 | pipeline, parallel-fanout, retry-chain, fallback-chain, pause-resume, cron-trigger, scheduled-recurrence, event-reactivate |
| 5E EVIDENCE | 5 | journal-sink, triplet-writer, sqlite-sink, replay-source, source-discriminator |
| 5F COMPOSED | 7 | deep-research, container-test-workflow, wave-dispatch-workflow, compliance-monitor, pipeline-toolchain, audit-agent, skill-launcher |
| 5G EXECUTION | 5 | shell-exec, python-exec, http-request, file-io, prompt (dual) |
| 5K KERNEL | 8 | the Effect idioms above |

Total: v1.0 = 42 (36 micro + 6 composed); v1.1 = 48; v1.2 adds the 8 5K rows. Portability bar: micro ≤ 40L, composed ≤ 120L.

---

# PART 16: THE TROUBLESHOOTING MATRIX (the kernel's actual behavior per symptom)

| Symptom | The kernel's behavior | The fix | Anchor |
|---|---|---|---|
| `jesl run` prints `[JESL UNKNOWN-NODE] … field=type` | the doc's node `type` is not in the registry | fix the typo or append the kind (append-only) | schema.ts:109-120 |
| `[JESL CYCLE] cycle through [a→b→a]` | the edge graph is cyclic | break the cycle with a gate; re-arm via event-reactivate | schema.ts:168-179 |
| `[JESL TIER-VIOLATION]` | tier-1 doc carries a generation kind/class | raise meta.tier to 2 or replace the generator | schema.ts:181-204 |
| `[JESL UNBRACKETED-GENERATION]` | tier-2 generation node without bracket.contract | declare the bracket {contract, repair≤2, confidenceFloor} | handlers.ts:63-83 |
| `[JESL CAP-UNBOUND] <cap>` | the driver Layer doesn't bind the cap | run under a driver that binds it — CliLive binds Shell/Fs/Http | executor.ts:159-178 |
| `[JESL CHANNEL-UNSET]` (FAIL verdict) | a node read an unset inbound channel | seed it (--in) or fix the edge.via name | channels.ts:107-122 |
| `[JESL NO-SEED]` | a declared entry channel has no seed | seed the channel or fix meta.seed.channel | channels.ts:69-97 |
| `[JESL ORACLE-MISSING]` | a rule card without its expected value | provide the oracle | rule-cards.ts:30-38 |
| A node returns INCONCLUSIVE | a stub fired, or a generator's confidence fell below the floor, or a triplet was incomplete | check the anchor: `TODO:<kind>:1` = stub; `UNCLEAR` = confidence; `no-triplet` = shape | stubs.ts:13, prompt.ts:203, triplet-writer.ts:18 |
| `replay` says `"verified": false` + exit 1 | the journal chain fails verification (tampered or from a foreign writer) | the journal is the truth — do NOT hand-edit; re-run the workflow | handlers.ts:360-383, journal.ts:260-275 |
| The run hangs on a pause node | the Deferred awaits a resume that never came | `pauseResume(key, value)` from the host, or an inbound resume/signal | pause.ts:33,40-49 |
| The battery prints HANG | a malformed fixture exceeded the 2s race | the row is recorded as HANG — the suite never sticks | battery.ts:385-390 |
| `Tests` count ≠ 336 under `bun test` | bun:test ≠ vitest — the canon runner is vitest | `npx vitest run` | BUILD_STATE §5 |
| A test hangs at 5000ms | TestClock never advances Effect.sleep | use the real-timer pattern in tests | RUNNING_DEBUG_LOG W1 |
| `RegistryFrozenError` on register | the kind exists with a divergent family/caps | append-only: same family+caps = idempotent; use replaceStub over stubs only | registry.ts:130-147 |
| tsc exits 0 but the editor shows test-file errors | the @ts-nocheck class + per-directory include | editor noise — the gate is `bunx tsc --noEmit` | PART 11.1 |
| The LSP gate denies a .ts write | EFFECT_ARTIFACT_GATE found error-severity diagnostics | fix the floatingEffect/runEffectInsideEffect/globalFetch class, re-write | artifact-gate.ts:40-43 |
| `ORACLE_CONFLICT` at compileOracle | a duplicate oracleKey registration | first registration wins — dedupe the cards | oracle.ts:47-53,143-181 |
| `DEPTH_EXCEEDED` from parseMathExpr | the MathExpr nesting passed 256 | flatten the expression | parser.ts:3,122-124 |
| `FLOAT_EPSILON_MISSING` | a float oracle without tolerance | provide tolerance (positive finite) | rule-cards.ts:43-50 |
| `EXCLUDED` (not FAIL) on a born-off sample | D17 — the intentional-wrong sample is excluded from the count | this is CORRECT behavior; the report counts it under excluded | calibrate.ts:133-138 |

---

# PART 17: THE THRESHOLD REGISTER (the constants and their BECAUSE)

| Constant | Value | Where | BECAUSE |
|---|---|---|---|
| maxNodesFiring | 15 | executor.ts:140, graph.ts:24 | the bounded pool; >15 overwhelms the RPM ledger |
| stagger | 1-3s | the L2 register (driver-side) | spreads the first 8 emissions across one EXILE window |
| EXILE_MS | 45000 | the L2 register | the ledger window on the nvidia/opencode rungs |
| POOL_TTL | 600,000 | the L2 register | 2× the gate freshness (300s) — the pool outlives its newest member |
| deadlineMs (run) | 600,000 | executor.ts:141 | the 10-minute run budget |
| refractory | 25 seq | behavior-engine.ts:57 | the synapse's measured refractory period |
| α (decay) | 0.05 | behavior-engine.ts:61 | the per-seq decay (exp(-α·Δseq)) |
| fire threshold | 1.0 (thr-v1) | behavior-engine.ts:64 | the arming threshold |
| escalation windows | 5/2/0 | behavior-engine.ts:30-44 | esc-count ≤1/=2/≥3 |
| skip-tier | 0/2/3 | behavior-engine.ts:46-53 | the tier floor at esc-count ≤1/=2/≥3 |
| repair max | 2 | prompt.ts:169, schema.ts:30 (Literal 2) | the unbounded-repair lesson |
| confidence floor | 0.55 | prompt.ts:136 | below = UNCLEAR, never a defect |
| RING_CAP | 50 | evidence.ts:3 | the evidence ring |
| VERDICT_TTL_MS | 5000 | evidence.ts:4 | the verdict cache |
| CLAIM_FRESH_WINDOW_MS | 300000 | evidence.ts:5 | the claim-after-evidence window |
| depth (MathExpr) | 256 | parser.ts:3 | the evaluator bound |
| domain (quantifiers) | 10000 | parser.ts:4 | the DOMAIN_UNBOUNDED guard |
| pre-arm ring | 20 | scanners/shared.ts:33 | the PTA deny ring |
| shell timeout default | 5000ms | shell-exec.ts:8 | the interactive-command bound |
| python timeout default | 10000ms | python-exec.ts:8 | the script bound |
| maxOutputBytes default | 1048576 | shell-exec.ts:7 | the 1MB output cap |
| http body truncate | 8192 | http-request.ts:42 | the summary-shape bound |
| LSP spawn timeout | 15000ms | effect-lsp.ts:102 | the diagnostics CLI bound |
| LSP maxBuffer | 4MB | effect-lsp.ts:103 | the diagnostics output bound |
| dry-run budget | 60,000ms | spec-to-kernels activities.ts (:141-150) | the headless kernel-execution bound |
| battery adversarial race | 2000ms | battery.ts:385-390 | HANG instead of a stuck suite |
| CT_DECODE_PRINTABLE_RATIO | 0.6 | the L2 register | the corruption heuristic |

---

# PART 18: THE DOC MAP (where this bible sits)

| Doc | Path | Role |
|---|---|---|
| THIS BIBLE | KNOWLEDGE_LIBRARY/Bibles/JESL/JESL_KERNEL_ARCHITECTURE_BIBLE.md | the build-on/debug/extend reference |
| THE OPERATING MANUAL | KNOWLEDGE_LIBRARY/Bibles/JESL/JESL_KERNEL_OPERATING_MANUAL.md | the step-by-step USE guide (companion) |
| THE L2 SPEC | ROOT/specs/MACRO_KERNEL_BOILERPLATE_L2_SPEC.md (5,290L) | the implementation authority (READ-ONLY) |
| THE DPL1 | ROOT/specs/JESL_LIBRARY_DPL1_SPEC.md (477L, v1.1-E) | the library contract (READ-ONLY) |
| EFFECT-RT | ROOT/specs/EFFECT_TS_RUNTIME_BIBLE.md (514L) | the Effect canon (READ-ONLY) |
| PHASE-2 | ROOT/specs/JESL_EFFECT_PHASE2_DPL1_SPEC.md (284L) | the docs-wave instruction (READ-ONLY) |
| THE JESL BIBLE (external canon) | KNOWLEDGE_LIBRARY/Bibles/JESL/JSON_EVENT_SCRIPTING_BIBLE.md (1,595L, v1.2) | the language canon — the FILENAME stays JSON_EVENT (the frozen anchor); the prose expansion is Effect per D26 |
| BUILD_REPORT | ROOT/BUILD_REPORT.md (597L) | the build walkthrough + evidence tables |
| CANON (12 docs) | ROOT/context_management/ | the state ledger |
| WAVE AUDITS | ROOT/.trident/wave-audit/w0-w9.md | the per-wave verdicts |
| CONTAINER ARTIFACT | ROOT/.trident/container-test-results.json | the 28 runtime rows |
| THE BOILERPLATE | KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/JESL-Kernel-Edition-v1.0/ | the adoptable tree (74 .ts, src/-nested) |


---

# PART 19: THE DATA FLOWS (end to end, with a real journal walk)

## 19.1 The mech-gate walk (the S1 happy path, node by node)

Input: `fixtures/mech-gate.json` — tier 1, 4 nodes (gateA:gate → triplet:triplet-writer → gateB:gate asserts `$.triplet.state eq "PASS"` → sink:journal-sink), 3 edges (via seed/triplet/data), vars `{event: "seed"}`.

```
STEP 1 — decodeDoc       Schema.decodeUnknown(WorkflowDoc)            (schema.ts:84-87)
STEP 2 — validateDoc     dup-id? kind? edges? cycle? tier?            (schema.ts:89-205) → clean
STEP 3 — unbracketed     tier 1 → no generation nodes → null          (handlers.ts:63-83)
STEP 4 — context         handles = {gateA: gateNode, triplet: tripletWriterNode,
                                    gateB: gateNode, sink: journalSinkNode}   (handlers.ts:94-111)
                         boundCaps = {Shell, Fs, Http} (cli driver)            (handlers.ts:136)
STEP 5 — runProgram:
  seed:     written = {event}, channelData = {event: "seed"}           (executor.ts:97-100)
  batch 1:  ready = [gateA] (no inbound channels)                      (:146-155)
            pre-flight: gateNode.requiredCaps = [] → pass              (:159-178)
            invoke gateA: inbound = {event: "seed"}; no asserts config
              → PASS, outputs {gate.gateA: true}                       (gate.ts:52-68)
            journal: invoke row seq0 + verdict row seq1                (:183, :212)
            writeback: no outbound from gateA? — gateA→triplet via "seed"
              outputs["seed"] ?? outputs.default ?? {ok:1} → channelData.seed = {ok:1}
  batch 2:  ready = [triplet] (inbound "seed" written)
            invoke triplet: config.triplet {pattern,state,anchor} present
              → Journal service row appended; PASS, outputs {triplet}  (triplet-writer.ts:14-27)
            journal: seq2 invoke + seq3 verdict (the triplet row carries the evidence)
            writeback: channelData.triplet = {pattern:"mech.gate", state:"PASS", anchor:"mech-gate:1"}
  batch 3:  ready = [gateB] (inbound "triplet" written)
            invoke gateB: asserts[0].path "$.triplet.state" → "PASS" eq "PASS" → true
              → PASS, outputs {gate.gateB: true}                       (gate.ts:56-68)
            journal: seq4 + seq5
            writeback: channelData.data = {ok:1}
  batch 4:  ready = [sink]
            invoke journal-sink: payload = inbound.data; journal.append verdict row
              → PASS, outputs {written: {ok:1}, row}                   (journal-sink.ts:15-37)
            journal: seq6 + seq7
STEP 6 — summary      verdict PASS (4 results, no FAIL/INCONCLUSIVE)  (handlers.ts:312-318)
STEP 7 — stdout       {verdict:"PASS", results:{...}, batches:[["gateA"],["triplet"],["gateB"],["sink"]], rows:[8 rows]}
STEP 8 — exit 0
```

The journal rows (shape at journal.ts:9-20):

```json
{"seq":0,"ts":<clock>,"run":"wf-...","node":"gateA","kind":"invoke","source":"workflow/mech-gate/gateA","prev":"genesis","self":"<hash0>"}
{"seq":1,"...":"...","node":"gateA","kind":"verdict","verdict":"PASS","evidence":{"pattern":"gate.assert","state":"PASS","anchor":"gateA:0"},"prev":"<hash0>","self":"<hash1>"}
... 8 rows total; self = hash(canonicalSerialize(row-minus-self-and-ts) + "\0" + prev)
```

## 19.2 The replay flow

```
jesl run mech-gate.json > /tmp/j.json          # the FIRST run (8 rows)
jesl replay /tmp/j.json                        # the SECOND pass
  → readJsonFile → rows = parsed.rows          (handlers.ts:350-358)
  → verifyChain(rows)                          (handlers.ts:360; journal.ts:260-275)
      per row: prev linkage + seq + self recompute from canonical(base)+"\0"+prev
  → verdict FROM the verdict-kind rows         (handlers.ts:374-380)
  → {verdict, verified: true, rows, count} → exit 0   (:381-383)
```

The durable path (workflow/jesl-run.ts): `runJeslWorkflow(docHash, seed)` on an EXISTING run — rows present → verify → seq audit → `rebuildSummaryFromRows` → receipt `{runId, verdict, rowsCount, journalTail}` with **invoked: 0** (:77-93) — THE NO-RE-PAY (criterion 15).

## 19.3 The durable ask flow

```
node calls ask(question) → Session.ask (session-live.ts:15-29)
  → Queue.offer(question) → Deferred.make → forkDaemon(transport.ask) → Deferred.await
host answers via the transport → Deferred.succeed(def, answer) → the run continues
```
The durable variant (workflow/activities.ts:64-89): an ANSWER row short-circuits; else an ASK row persists and the effect fails `SUSPENDED:ask:<nodeId>` — the WorkflowEngine resumes it when `provideAnswer` lands the answer row.

## 19.4 The scanner flow (think → arm → intercept)

```
deliberation event ──► Bus.emit("deliberation.<x>", text)
                          │
                          ▼ pba handler (6 patterns)
                   PBA detectFamilies(text)  ── ENFORCE hit ──► emit "pba.family.hit"
                          │                                        │
                          │                                        ▼
                          │                          BehaviorEngine.pbaHandler (seq++, window)
                          │                                        │ armed
                          ▼                                        ▼
                 tool.execute.before ──────────► hook-bridge.onToolExecuteBefore
                                                          │
                                            ToolEngine.intercept({tool})
                                              armed+family-match  → DENY  (pta.intercept)
                                              unarmed + bash-like → DENY (deny-unless-armed)
                                              else                → ALLOW
```

---

# PART 20: THE PER-KERNEL DEEP REFERENCE (failure modes + fixtures + coupling)

## 20.1 Per-kernel failure-mode tables

**idea-to-bible:**
| Trigger | Behavior | Verdict basis |
|---|---|---|
| blank idea (:157) | journal FAIL + `Effect.fail([JESL CHANNEL-UNSET] node=validate-idea)` | loud, no partial bible |
| Llm throws/returns null (:82-96) | caught → the deterministic stubExploreResult | the explore never fails the pipeline (by design; the journal still records) |
| decodeDoc fail (:140-141) | mapped to `JeslChannelUnset bible` | loud |
| validateDoc fail (:143-144) | mapped with remedy | loud |

**bible-to-spec:**
| Trigger | Behavior |
|---|---|
| null bible (:53) | `JeslChannelUnset digest bible` + journal FAIL |
| wrong `$schema` (:66-77) | `JeslUnknownNode digest $schema` |
| bad math (:170-184) | `JeslUnknownNode node=<id> field=config.<key>` + the parse reason — THE MPSE REFUSAL |
| Llm JSON malformed (:120-123) | `Effect.either(tryLlm)` → the deterministic FR fallback |
| empty FRs (:139-141) | a synthetic `FR-1 bible coverage` (the candidate stays non-empty) |

**spec-to-kernels (D3):**
| Trigger | Behavior |
|---|---|
| empty specPath (:176-186) | `JeslChannelUnset spec-parse specPath` |
| runDemoSync throws (:196-201) | wrapDemoError → JeslCycle \| JeslChannelUnset \| JeslUnknownNode |
| `report.fail > 0` (:88-100) | assertD17 FAIL — "born-off rows must be EXCLUDED, not FAIL" |
| EXCLUDED row without the reason (:102-116) | assertD17 FAIL |
| empty kernel (:220-229) | `JeslChannelUnset decompose kernel` |
| stubs ≠ kernel count (:232-242) | `JeslChannelUnset decompose stubs` |
| dry-run FAIL verdict (:152-164) | `[JESL UNKNOWN-NODE] dry-run:<kid>` — the emitted kernel does not execute headless |

**kernels-to-code:**
| Trigger | Behavior |
|---|---|
| empty inventory (:268-272) | journal FAIL empty-inventory → the neutral zero report (caller checks inventory.total) |
| dispatch Left (:177-183) | journal dispatch-fail + verdict FAIL break |
| confidence < 0.55 (:188-194) | INCONCLUSIVE UNCLEAR break |
| discharge CONTRADICTED/FAIL (:212-228) | retry until attempt 2, then FAIL (repair max 2) |
| discharge UNVERIFIABLE (:230-235) | INCONCLUSIVE break |
| discharge EXCLUDED (:236-241) | FAIL break |

**verify:**
| Trigger | Behavior |
|---|---|
| scenario.run throws (:65-70) | the caught message becomes toolResult → token check → FAIL row; SIBLINGS SURVIVE |
| defect (:88-94) | FAIL row `defect:<msg>` |
| passToken missing (:72-74) | FAIL — never a fabricated PASS |
| failToken present (:73-74) | FAIL even with the pass token present (the contradictory-signal rule) |

**ship:**
| Trigger | Behavior |
|---|---|
| empty artifacts (:43-53) | `[JESL NO-SEED] manifest-build verifiedArtifacts` |
| missing path/content (:56-65) | `[JESL CHANNEL-UNSET] artifacts[path]` |
| content mutated after manifest (:117-128) | `[JESL CHANNEL-UNSET] audit.hash` — hash-verify before write |
| writer.write fails mid-copy (:133-155) | ROLLBACK (write "" per written file) + `[JESL CHANNEL-UNSET] writer.write` |
| manifest schema/total/entry (:183-221) | `[JESL CHANNEL-UNSET] manifest…` |
| copy corrupted after manifest (:242-253) | `[JESL CHANNEL-UNSET] hash:<path>` — the corrupted-copy detector |

## 20.2 The kernel fixture inventory (13 fixtures)

| # | Fixture | Shape | Consumed by |
|---|---|---|---|
| 1 | idea-to-bible/fixtures/sample-idea.txt | plain idea text | runIdeaToBible validate |
| 2 | idea-to-bible/fixtures/expected-bible.json | a valid WorkflowDoc (golden master) | schemaGateBible |
| 3 | bible-to-spec/fixtures/bible-minimal.json | 1-node edge case | digestBible |
| 4 | bible-to-spec/fixtures/bible-valid.json | 3 nodes with `math: "x + y * 2"` | lintMathContracts (parses) |
| 5 | bible-to-spec/fixtures/bible-math-bad.json | `math: "@@@invalid math (("` | lintMathContracts (refuses) |
| 6 | spec-to-kernels/fixtures/sample-spec.json (58L) | 5 nodes: arith/compare/rule(OR-1)/bornOff(OR-2, bornOff:true :46)/sink | the full D3 path |
| 7 | spec-to-kernels/fixtures/born-off-spec.json (13L) | 2 math nodes + sink, bornOff:true | the minimal D17 path |
| 8 | spec-to-kernels/fixtures/bad-spec.json (11L) | `type: "unknown-kind-xyz"` | wrapDemoError → loud |
| 9 | kernels-to-code/fixtures/sample-stubs.json | `{stubs:[{id:stub-a, expected:42},{id:stub-b, expected:0.6, tolerance:0.05}]}` | inventory→dispatch→discharge |
| 10 | verify/fixtures/sample-artifacts.json | `{files, outDir, name, hash}` | runVerify battery |
| 11 | ship/fixtures/artifact-a.json | ShipArtifact {path, content} | buildManifestEffect |
| 12 | ship/fixtures/artifact-b.json | ShipArtifact | copyArtifacts |
| 13 | ship/fixtures/artifact-c.txt | ShipArtifact (text) | auditGateChain |

## 20.3 The kernel coupling graph

```
tests/idea-to-bible.test.ts ──► runIdeaToBible + makeStubLlmLayer + buildNodeHandles
tests/bible-to-spec.test.ts ──► runBibleToSpecSimple (+ lintMathContracts directly)
tests/spec-to-kernels.test.ts ─► runSpecToKernels (×3 fixtures: sample/born-off/bad)
tests/kernels-to-code.test.ts ─► runKernelsToCode + makeStubFixture + sampleStubs
tests/verify-kernel.test.ts ───► runVerify + makeArtifactFixture + defaultScenarios
tests/ship.test.ts ────────────► ship + buildManifestEffect + copyArtifacts + auditGateChain

kernel imports (shared spine):
  ../../core/journal   (Journal, simpleHashExport, canonicalSerializeExport)  — all 6
  ../../core/errors    (JeslChannelUnset, JeslNoSeed, JeslUnknownNode, JeslCycle) — 5 of 6
  ../../core/schema    (decodeDoc, validateDoc, WorkflowDoc)                  — idea, bible, (spec via demo)
  ../../core/caps      (Llm, Subagent)                                        — idea, bible, k2c
  ../../mpse/parser    (parseMathExpr)                                        — bible
  ../../mpse/demo      (runDemoSync)                                          — spec  ← THE D3 SEAM
  ../../mpse/oracle    (compileOracle, OracleRegistry)                        — k2c
  ../../core/executor  (runProgram)                                           — spec  ← THE DRY-RUN SEAM
  packager/shared      (SkillWriter)                                          — ship  ← THE INJECTED-WRITER SEAM
```

---

# PART 21: THE CORE MODULE EXPORT SURFACES (the API reference)

| Module | Exports | Primary consumers |
|---|---|---|
| schema.ts | `NodeEnvelope, EdgeDecl, WorkflowDoc (Schema+type), decodeDoc, validateDoc` | cli/handlers, packager/shared, kernels (idea/bible), mpse/demo |
| graph.ts | `GraphIndex, Graph, buildGraph, readyBatches, GraphService` | the executor conceptually; graph.test (the executor embeds its own readiness loop — executor.ts:84-158 — the graph module is the standalone/DI surface) |
| channels.ts | `ChannelSnapshot, ChannelsService, Channels (Tag), makeChannels, makeTestChannels` | tests, drivers that provide it |
| bus.ts | `BusEvent, globToRegex, globMatch, BusSubscription, BusService, Bus (Tag), makeBus, BusLive, EventBus` | scanners ×5, wraps, hook-bridge, opencode-live |
| caps.ts | 9 Tags + Cap aliases + `ServiceTag, Caps, requireCaps, provideCaps, 9 dummy Lives, InMemoryLive, TestLive, CliLive(dummy), OpenCodeLive(dummy)` | all cap-bound nodes; tests |
| errors.ts | 8 TaggedError classes + `JeslError` union + `JESL_TOKENS` | EVERYWHERE (the vocabulary) |
| executor.ts | `Verdict, Triplet, NodeResult, JournalRow, RunBudget, ChannelsView, JournalView, NodeInput, NodeHandle, RunContext, RunSummary, runProgram` | cli/handlers, workflow/jesl-run, spec-to-kernels, battery |
| journal.ts | `Triplet, JournalRow, JournalRowDraft, FileSink, FileSinkTag, HashCap, Journal (Tag), makeJournal, JournalLive, HashCapLive, InMemoryJournalLive, InMemorySink, verifyChain, canonicalSerializeExport, simpleHashExport` | cli/handlers (replay), workflow, journal-sink/triplet-writer nodes, kernels |
| registry.ts | `NodeFamily, NodeImpl, RegistryRow, RegistryService, NodeRegistry (Tag), ALL_KINDS, replaceStubSync, replaceStub, makeRegistry, NodeRegistryLive, isKnownKind, register` | cli/handlers (isKnownKindSync source), all self-registering nodes |
| evidence.ts | `RING_CAP, VERDICT_TTL_MS, CLAIM_FRESH_WINDOW_MS, EvidenceKind, EvidenceEvent, VerdictRecord, EvidenceService, EvidenceMachine (Tag), makeEvidenceMachine, EvidenceMachineLive, _isEventFresh, _canSourceChange, _canStatus, _analyzeResult` | evidence.test (18 units), the audit-concept consumers |

**The purity ledger:** `grep -rn "node:fs\|node:path\|node:child_process" core/ nodes/ scanners/` = 0 (verified every wave). `Date.now` in core = 0 (the W1 fix). `Effect.runPromise` in the product tree = exactly 1 (cli/main.ts:26). `node:` imports live ONLY in drivers/ (cli-live, hook-bridge's none, opencode-live's dynamic bus import) and wraps/effect-lsp.ts (the sanctioned CLI-wrap boundary).

---

# PART 22: THE MPSE 24-KIND IR TABLE (per-kind semantics)

| Kind | Arity | Semantics | Discharge relevance |
|---|---|---|---|
| literal | value | number/string/boolean constant | the leaf value |
| var | name | environment lookup | UNBOUND_SYMBOL → INCONCLUSIVE (math-eval) |
| add/sub/mul/div/mod | left,right | arithmetic | local evaluation feeds `computed` |
| eq/neq/lt/lte/gt/gte | left,right | comparison | the gate ops mirror (gate.ts:6) |
| and/or/not | logical | boolean algebra | short-circuit semantics |
| neg | expr | arithmetic negation | |
| if | cond,then,else | branch | both branches must be discharge-compatible |
| call | name,args | named function | the oracle's `computed` handles known fns |
| list / index | elements / target,index | collections | array discharge = order-insensitive equality |
| forall / exists | var,domain,body | quantifiers | DOMAIN limit 10000 |
| temporal | op,expr[,untilRight] | prev/eventually/globally/until | the spec-time surface (spec-side linting) |

The JESL math nodes (`math-eval`, `oracle-discharge`, `oracle-gate`, `mpse-discharge`) COMPILE to this grammar (D8) — there is no parallel JSON expression language. The in-graph `math-eval` node delegates to the bound `MathExprService` when present; the FULL evaluation surface lives in mpse + the oracle discharge matrix (PART 6.3).

---

# PART 23: THE ADOPTION GUIDE (the boilerplate walkthrough)

## 23.1 What you received

```
JESL-Kernel-Edition-v1.0/
├── package.json          name @jesl/kernel · bin jesl → ./cli/main.ts · the dep spine
├── README.md             the 60-second orientation (the 8 tokens, the laws, the quickstart)
├── tsconfig.json         the per-directory include (mirror of the source gate)
├── fixtures/fixtures/    the 9 battery fixtures (byte-identical to the source)
└── src/                  74 .ts files in the DOUBLED layout (src/core/core/, src/nodes/nodes/, …)
    └── src/kernels/kernels/*/   each kernel with its SKILL.md + workflow.json + fixtures/
```

The doubled `src/<dir>/<dir>/` layout is the extraction's copy artifact — flatten to taste (update the tsconfig include + the relative imports) or keep as-is. The manifest that proves the copy: run `extractBoilerplate` yourself and diff `boilerplate-manifest.json`.

## 23.2 The 5-step adoption

```bash
# 1. COPY — the tree is the starting point
cp -r JESL-Kernel-Edition-v1.0/ my-project-kernel && cd my-project-kernel

# 2. INSTALL — the dep spine is pinned
bun install    # effect 3.22.1 · @effect/platform · @effect/vitest · @effect/workflow · @effect/language-service

# 3. PICK A PROFILE — trident (t1 deterministic) | trading (t2 http+math) | sales (t2 http+llm)
#    or author your own DomainModule: {name, caps: [real Tags], kinds, defaultTier, brackets}

# 4. AUTHOR A WORKFLOW — see the Operating Manual STEP 1 (the shape rules + the validation order)
#    $schema trident-workflow-v1 · meta.tier 1|2 · nodes[] · edges[] with via · vars

# 5. RUN THE GATES
bunx tsc --noEmit       # must exit 0
npx vitest run          # the battery must be green
bun run cli/main.ts run fixtures/mech-gate.json   # "verdict":"PASS" exit 0
```

## 23.3 The customization surface (EDIT vs FIXED)

| Layer | Mutability | How to customize |
|---|---|---|
| core/, nodes/, cli/, drivers/, scanners/, workflow/, packager/, wraps/, mpse/ | FIXED | do not fork — extend via the append-only registry (`register`/`replaceStub`) |
| kernels/ | EDIT | author project kernels on the 6-seed pattern (activities.ts + workflow.json + SKILL.md + fixtures/) |
| profiles/ | EDIT | your DomainModule is DATA — zero branches; the kernel enforces, the profile declares |
| bindings/ | EDIT | implement HostTransport for your host; `makeOpenCodeBinding(transport)` is the pattern |

## 23.4 The invariants you inherit (never break these)

1. The 8 `[JESL …]` tokens are string-frozen — never invent a 9th, never wear one on a non-refusal.
2. `core/` + `nodes/` stay pure (zero node:/fetch/Date.now/Math.random/setTimeout) — the driver Layer is the only I/O boundary.
3. One `Effect.runPromise` edge (cli/main.ts). Construction ≠ execution.
4. The journal chain excludes `ts` from the hash — determinism is the replay contract.
5. Every node journals invoke+verdict; verdicts are computed FROM rows, never prose.
6. The registry is append-only — kinds never rename; v1 docs run forever.

---

# PART 24: THE BUILD'S DEBUG LEDGER (the 12 lessons, condensed — full detail in RUNNING_DEBUG_LOG.md)

1. **Core purity holds even in test Layers** — the dummyClock fix (W1).
2. **The frozen vocabulary bites at the node level** — a FAIL verdict carries its delta in evidence.anchor, never an invented code (W1).
3. **Verify the runner contract at scaffold time** — bun:test ≠ vitest (W1).
4. **The mock-split class includes drivers** — a CLI mapping real kinds to stand-ins produces a green battery over a dead pipeline; every audit attacks the PASS path (W2, the canonical lesson).
5. **TestClock is virtual** — real timers in tests, the Clock service in core (W1).
6. **Token law has two halves** — never a 9th token AND never a worn token (W3).
7. **A blocked verification is a problem to solve, not an excuse** — the [CT] rig saga ended 33-rows-green after the tarball-deploy recipe (W3→W10).
8. **The invented-token class RECURS** — GATE-FAIL (W1), JOURNAL-CORRUPT (W4), UNKNOWN-PROFILE (W10): every dispatch carries the ban; every audit sweeps the bracketed shape.
9. **Determinism excludes ts** — the wall-clock leaked into the chain hash (W5).
10. **Loud-fail applies to replay** — an unverifiable chain exits 1, never 0 (W5).
11. **Cross-agent seams need an integrator** — the battery's S6 was written against an imagined artifact shape; the orchestrator rewired it to the real emitSkill→handleRun (W5).
12. **Effect Tags are classes** — a tag check accepts `object || function` (W9).

— END OF THE JESL KERNEL ARCHITECTURE BIBLE (v1.1) —

---

# PART 25: THE WAVE-BY-WAVE BUILD HISTORY (how the kernel came to be)

## W0 — THE DOCS WAVE (the authority) · gate 9/9 GREEN
Two additive docs surgeries: the JESL bible v1.1→v1.2 (PART 2E inserted at :287 — 2E.0-2E.12, 443L — plus the §0.2 grounding rows, the §1F Effect.forEach twin :100, the §2.5 purity redefinition :251, the 9G law table :1556, the v1.2 row :1589) and the DPL1 v1.0→v1.1-E (§2.9 :172 — D9-D15 + the Effect contracts + the TaggedError table + the Driver Layers + Workflow.make; §5.2 :357 — S1E-S8L; criteria 13-16 :392-395; §8 the Phase-2 chain :473). Evidence: bible sha `68afa78e` (1,595L), DPL1 sha `35abb828` (477L), manifest `396e4930→f77b448f`. THE STORY: the dispatching session crashed mid-wave (provider cut); both agents were RESUMED from persisted SQLite sessions via the wave manager — no prompt regenerated, no work redone.

## W1 — THE CORE TREE · S1E gate GREEN
5 parallel agents, greenfield `jesl/`: 36 files, 3,810L, digest `12ffbb3d`, 104 tests. The frozen-contracts-in-prompts technique produced a first-integration merge with tsc 0 and zero import conflicts. THE AUDIT CAUGHT: `Date.now` in caps.ts:105 (→ EffectClock) and the invented `[JESL GATE-FAIL]` (→ removed, delta in evidence.anchor). LESSON: `bun test` is dead for this tree — `npx vitest run` is canon.

## W2 — THE CLI + EXECUTION · S2E gate GREEN (the real path)
+cli/ ×3 + drivers/cli-live + the 4 execution nodes + 8 fixtures + 25 tests → 46 files, 129 tests, digest `e07eaf5c`. THE AUDIT CAUGHT THE BUILD'S BIGGEST DEFECT: the CLI's deterministic run path rode `passHandle` always-PASS stand-ins — behind the mask, 3 real W1 defects (schema stripped config; executor passed inbound:{}; the fallback journal self was unverifiable). ALL root-cause fixed by the auditor; mech-gate redesigned for real semantics (`$.triplet.state`, not the object). THE CANON LESSON (w2.md:54) was born here.

## W3 — THE DRIVER + SCANNERS · S3E gate GREEN + the FIRST [CT]
+drivers/{opencode-live,hook-bridge,session-live} + scanners/ ×7 + 35 tests → 59 files, 164 tests, digest `c154678b`. The Paragon banks transcribed WITH provenance shas (D12). THE SWEEP CAUGHT: `[JESL UNKNOWN-NODE]` worn by CLI usage errors → plain text. THE [CT] SAGA: the rig image was absent at audit time (BLOCKED, honestly ledgered) → the operator pointed at runtime-grade-container-sandbox:master → the tarball deploy recipe (tar WITH node_modules + a dist/index.js marker) → 10/10 scenarios green in shark-effect-kernels-w3b (tarball `235a08d2`), including the A1 corrupted-journal adversarial whose 3-round adjudication forced the real fix: replay of an unverifiable chain exits 1.

## W4 — GENERATION · S4E gate GREEN
+nodes/prompt.ts (223L) + workflow/{jesl-run,activities}.ts + 20 tests → 64 files, 184 tests, digest `408f7500`. THE NO-RE-PAY PROVEN (criterion 15): the second run → invoke counter 0, covers true, the verdict rebuilt FROM rows. THE SWEEP CAUGHT: `[JESL JOURNAL-CORRUPT]` ×5 (the recurring 9th-token class). Deps: @effect/workflow 0.19.1 + @effect/ai 0.37.0 installed (VERIFY-ON-INSTALL ledgered; @effect/ai NOT imported).

## W5 — PACKAGER + BATTERY · S5E-S6E gate GREEN + the SECOND [CT]
+packager/ ×4 + tests/battery.ts (the executable 11-row runner) + 27 tests → 71 files, 211 tests, digest `b7ab2cbc`. THE BATTERY CAUGHT A REAL KERNEL DEFECT: canonicalSerialize included `ts` → determinism broken → the surgical fix (journal.ts:44) → chainsIdentical:true. THE AUDITOR INTEGRATED THE TWO HALVES: battery S6 was checking artifacts nobody writes → rewired to emitSkill→handleRun (4 iterations). Container: 211/211 + 11/11 in shark-effect-kernels-w5 (`aab37463`).

## W6 — THE WRAPS · S7P+S8L gate GREEN + the THIRD [CT]
+wraps/ ×4 (BehaviorEngine with the Paragon provenance table, ToolEngine, effect-lsp on the REAL v0.87.2 CLI, artifact-gate) + the hook-bridge consult + 22 tests → 77 files, 233 tests, digest `c80f56a9`. THE PRE-ARM CHAIN PROVEN IN PRODUCTION FORM: TEST_EVASION deliberation → pba.family.hit → armed → bash DENIED, the escalation decay table asserted. The LSP plugin kept OUT of the main tsconfig (14 false-positive floatingEffects). Container: shark-effect-kernels-w6 (`dcabd97c`).

## W7 — THE MPSE BRIDGE · P2 gate GREEN
+mpse/ ×7 + 42 tests → 87 files, 275 tests, digest `01dc9691`. The 24-kind MathExpr IR + the append-only oracle (ORACLE_CONFLICT) + the discharge matrix + D17 EXCLUDED_BORN_OFF + the kernel/stub emits. THE GATE: the 5-node fixture compiles and D17 is reproduced (pass:3 excluded:1 fail:0). The PENDING-PARALLEL coordination record rides in demo.ts.

## W8 — THE 6 LIFECYCLE KERNELS · P3 gate GREEN
+kernels/ ×6 dirs (activities + workflow.json + SKILL.md + fixtures each) + 39 tests → 99 files, 314 tests, digest `02aac5b0`. D3 INSERTION PROVEN: spec-to-kernels composes runDemo; the D17 assert; the TestLive dry-run executes the deterministic substrate pre-code.

## W9 — PROFILES + BINDINGS · P4 gate GREEN
+profiles/ ×4 (pure DATA, zero branches grep-proven) + bindings/ ×2 (the 11-Tag contract) + 16 tests → 107 files, 330 tests, digest `c96aeb38`. The isRealTag self-catch (Tags are classes).

## W10 — SHIP · THE FINAL [CT] GREEN — THE PRODUCT IS SHIPPABLE
+boilerplate/extraction.ts + 6 adoption tests → 109 files, 336 tests, digest `681bf869`. THE ADOPTION DRY-RUN PROVEN: the extracted tree compiles, its core is byte-identical, its manifest validates. THE SWEEP CAUGHT: `[JESL UNKNOWN-PROFILE]` ×2 (the 3rd occurrence of the class). Container: shark-effect-kernels-w10 (`30fa9ec4`) — 336/336 + 11/11 + the boilerplate 6/6 + the corrupted-journal verified:false + the usage hygiene JESL=0.

---

# PART 26: THE FULL TEST LEDGER (the key assertions per file)

**schema.test.ts (10):** the happy decode round-trip; `$schema` literal enforcement; NonEmptyArray nodes; duplicate-id refusal (`nodes[id]`); unknown-kind refusal via injected isKnownKind; dangling-edge refusal (from AND to); the cycle path in the error (`cycle through [a→b→a]`); TIER-VIOLATION by type; TIER-VIOLATION by class; vars Record<string,string> enforcement.

**graph.test.ts (7):** the 3-node diamond = exactly 2 batches; entry/terminal nodes; the 15-cap chunking (:88); the self-loop → CYCLE; the residual-set cycle report; readySet honors the WRITTEN channels; parallelBatches stability.

**channels.test.ts (7):** NO-SEED on a declared-unseeded channel; write→read round-trip; CHANNEL-UNSET on unset read; the Deferred wake (awaitWritten resumes); snapshot deep-copy (the caller mutates, the store unaffected); seedFrom merge semantics; isWritten.

**bus.test.ts (9):** exact match; `*` match; `prefix.*` namespace; per-segment glob; the handler die-isolation (the emitter survives, :26); payload deep-freeze (:38-45); unsubscribe; detachAll(runId); 1000 subscribe/detach cycles leak-free via _subsRef.

**caps.test.ts (8):** requireCaps passes when bound; CAP-UNBOUND carries {cap, node, field}; the cap name derivation (Shell→shell); InMemoryLive composition; TestLive alias; the dummy services' canned shapes; CliLive(dummy) merge; OpenCodeLive(dummy) merge.

**errors.test.ts (11):** each of the 8 classes constructs with its EXACT code string (Buffer.hex byte-compare); the JeslError union discriminates; JESL_TOKENS matches the classes; the code field is a Schema Literal (a wrong code fails decode); remedy/expected/actual flow through; the tag names; the union exhaustiveness; two Token-map spot checks.

**executor.test.ts (8):** the 4-node diamond batches (2 batches with B/C overlap — real timers); one node's failure isolates (siblings PASS, :142); the cap pre-flight aborts with zero invoke rows (:165); the journal carries invoke+verdict per node; READY_FALSE propagates; INCONCLUSIVE on defect; the Clock timing bounds; the writeback default {ok:1}.

**journal.test.ts (5):** the prev/self chain across appends; verifyChain detects a tampered evidence field (:28-30); covers(docHash, seed) true for the same inputs; serialize→restore preserves partitioning; per-run isolation.

**registry.test.ts (5):** idempotent re-register (same family+caps); divergent re-register throws RegistryFrozenError (:21); ALL_KINDS ≥33 with family tags; isKnownKind true/false; replaceStub over a stub succeeds.

**evidence.test.ts (18, loop-generated):** per kind: accept (EVIDENCED) + the reject path; claim without fresh source_change → UNEVIDENCED; claim with → EVIDENCED; source_change without filePath → UNEVIDENCED; non-monotonic source_change → REJECTED; status without probeOutput → UNEVIDENCED; RING_CAP eviction at 50 (:58); TTL expiry via TestClock.adjust (:77); stale-event REJECTED; analyzeResult's tool/text mapping.

**nodes.test.ts (16):** gate eq/ge/contains/matches + CHANNEL-UNSET + the FAIL anchor carries expected/actual; event-filter MATCHED/DROPPED/FILTERED; capture-engine stores + counts; pipeline steps; parallel fan; retry recovers then exhausts; fallback primary→fallback→BOTH_FAILED; pause suspend/resume via pauseResume; journal-sink writes; triplet-writer PASS + INCONCLUSIVE; state-machine transitions + INCONCLUSIVE; math-eval literal/add/var/UNBOUND_SYMBOL; the stubs return INCONCLUSIVE TODO.

**cli.test.ts (13):** parseArgs run/validate/replay/--in/--driver/help; handleValidate ok + each refusal byte-exact; handleRun PASS JSON shape + CAP-UNBOUND exit 2 no artifact + FAIL exit 1; handleReplay verified:true + the corrupted chain → exit 1; dispatch routing.

**execution.test.ts (13):** shell-exec echo PASS (real spawn); exit-code FAIL; timeout FAIL; maxOutputBytes truncation; python-exec PASS (real python3) + missing-code; http-request 2xx PASS + non-2xx FAIL (stubbed Http Layer); file-io read/write round-trip; replaceStub superseded the stubs (isKnownKindSync + getSync return the real impls).

**driver.test.ts (12):** ScriptedTransport invoke/dispatch/callModel/ask (+ pushAnswer/remaining); shouldThrow failure injection; makeOpenCodeLive provides the 6 Layers; SessionLive ask resolves via the scripted answer; the ask-launcher E2E: a doc with a prompt ask-launcher node suspends → the answer → PASS + the journal rows; hook-bridge allow path; hook-bridge deny path via the deny map; the ToolEngine-consult path; clearBridgeState.

**scanners-pba-pta.test.ts (14):** detectFamilies per family (4 banks exercised); the ENFORCE/DAMPEN/SUPPRESS bands; pba emits pba.family.hit with the payload shape; the ring push/hasArmed/lastFamily; pta deny-unless-armed (the unarmed bash → deny); the armed → allow; the pre-arm chain E2E (hit then intercept); determinism ×100; the 500-event burst stays stateless; the journal rows ride along.

**scanners-lsp-audit.test.ts (11):** InMemoryLsp diagnose; the available:false honest payload; the .ts-only filter; audit hasTriplet accept; the missing-triplet violation; trace started/finished/duration; the completion-event timeline; the journal rows for each scanner; the coexistence test (one bus, five scanners).

**prompt.test.ts (10):** template mode PASS without any Llm; the ${}/{{}} interpolation; llm mode PASS with the stub Llm (invoke counter 1); the bracket contract violation → repair (counter 2) → pass; the 3-strike → FAIL CONTRACT_VIOLATION; confidence 0.4 < 0.55 → INCONCLUSIVE UNCLEAR; confidence 0.7 → PASS; the missing-bracket-contract → the UNBRACKETED error; the transport error → LLM_TRANSPORT; the journal pre/post rows with the hashes.

**workflow.test.ts (10):** idempotencyKey derivation; the first run executes (counter N); the second run → invoked 0 + covers true; rebuildSummaryFromRows maps the verdict FROM rows; the corrupted journal → the JOURNAL_CORRUPT loud fail; the durable ask suspend → provideAnswer → resume (counter 1 total); seedToString/hashSeed; the receipt shape {runId, verdict, rowsCount, journalTail}.

**packager.test.ts (18):** emitTool shape (name/inputSchema/command); emitToolFromDoc; emitChain steps + via wiring; the chain's unknown-kind refusal; emitSkill writes the 5 files; SKILL_LAUNCH_LINE byte-exact (:164); ctx.json shape; mission.md contents; anti-patterns from gates; the criterion-9 re-validation (a bad doc refuses all three emitters); canonicalJson determinism; InMemoryWriter list/dump.

**wraps.test.ts (12):** computeDeadline table (1→5, 2→5, 3→2, 4→0); computeSkipTier; the refractory suppression; isArmed window expiry; isArmedForTool via FAMILY_TOOL_MAP; armedFamilyForTool; intercept deny (armed+match); intercept deny-unless-armed (unarmed bash); intercept allow (unarmed non-bash); intercept allow (armed family, different tool — family isolation); the pta.intercept emission; the LOUD failure path.

**lsp-gate.test.ts (10):** makeEffectLsp on a real mkdtemp project; CLEAN_TS → zero diagnostics; FLOATING_TS → the floatingEffect error; the severity=error filter; the absent CLI → the honest empty; ArtifactGate handleWrite allow (clean); deny (errors); the non-.ts pass-through; the pta.intercept emission with family EFFECT_ARTIFACT_GATE; the journal pair.

**mpse-parser.test.ts (18, plain vitest):** every literal form; var; the 5 arithmetics; the 6 comparisons; and/or/not; neg; if/then/else; call; list; index; forall/exists; temporal; the precedence chain; the depth limit at 300 → DEPTH_EXCEEDED; MpseError.position; extractFencedMath; the trailing-token error; the empty-input error.

**mpse-oracle.test.ts (14):** compileOracle registration; ORACLE_CONFLICT on duplicate; get/has/size; discharge int PASS/FAIL; float+epsilon PASS/outside; NaN → CONTRADICTED; Infinity → CONTRADICTED; unregistered → UNVERIFIABLE; boolean/array discharge; the dual-arity discharge forms; emitKernelProto's skeleton carries the oracle ids; emitStubs' delta shape.

**mpse-demo.test.ts (10):** the fixture decodes + validates; runDemoSync cards ≥3; the registry keys; the report D17 shape (pass:3 excluded:1 fail:0); the bornOff row's reason contains EXCLUDED_BORN_OFF; the kernel protos exist per card; the stubs per card; PENDING-PARALLEL reports absent siblings; compileDoc/compileOracle standalone; the doc round-trip.

**idea-to-bible.test.ts (6):** the blank idea → CHANNEL-UNSET + journal FAIL; the stub Llm explores 3 angles; the fan-out concurrency 15; mergeToBible produces a valid 4-node bible; schemaGateBible decodes+validates; the journal chain ≥14 rows.

**bible-to-spec.test.ts (6):** digest hash stability (canonicalSerialize+simpleHash identity); the null/`$schema` guards; lintMathContracts parses `x + y * 2`; the `@@@invalid math ((` refusal with field=config.math; the FR fallback determinism; gateDPL1Spec produces a valid spec.

**spec-to-kernels.test.ts (8):** sample-spec → cards+registry+report; assertD17 passes (fail:0); the born-off row EXCLUDED with the reason; bad-spec → the loud wrapDemoError refusal; runDryRun executes the emitted kernel headless; the stubs/kernel count invariant; the output contract shape; runSpecToKernels wrapper.

**kernels-to-code.test.ts (7):** inventoryStubs polymorphism (array/{stubs}/record); processStub PASS on a good dispatch (the stub Subagent returns "42", confidence 0.9); one violation → repair (invoke counter 2) → PASS; three violations → FAIL (3-strike); confidence 0.4 → INCONCLUSIVE UNCLEAR; float 0.6±0.05 discharge; NaN → CONTRADICTED.

**verify-kernel.test.ts (5):** all-PASS scenarios → report PASS; one failing scenario → its row FAIL while siblings PASS; passTokenMatch/failTokenAbsent tool-result-bound; the defect catch → a FAIL row; the tally + report verdict.

**ship.test.ts (7):** buildManifest fields+hashes; buildManifestEffect guards (empty → NO-SEED; missing path → CHANNEL-UNSET); copyArtifacts happy path; the hash mismatch → audit.hash refusal; the writer failure → ROLLBACK + refusal; auditGateChain schema+total+entries; the corrupted-copy detection.

**profiles.test.ts (8):** the 3 profiles validate; distinct caps/kinds per profile; the zero-branch source regex (:78-84); brackets repair ≤ 2; floor 0..1; the isRealTag class acceptance; decodeDomainModule round-trip; the invalid module's error list.

**bindings.test.ts (7):** makeParagonHostBinding shape; validateParagonHostBinding ok; the missing-cap error; the non-Tag provide error; makeOpenCodeBinding provides all 11 Tags; the layer is the makeOpenCodeLive stack; zero `from 'opencode'` imports in the tree.

**boilerplate.test.ts (6):** the extracted tree structure; package.json name `<target>-kernel` + the jesl block; 10 core modules byte-identical (per-file sha256); the manifest validates (schemaVersion + the 64-hex digest); the FileWriter parity with InMemoryWriter; the battery-proof assertion.

**battery.test.ts (8):** runBattery executes all 11 rows; the summary counts {pass:11, fail:0, blocked:0}; S1's passTokenMatch; S6's emit→run seam; A1's HANG race; the artifact written; the BatteryScenarios export map; the anti-literal PASS_TOK trick.

---

# PART 27: THE NODE CONFIG EXAMPLES (copy-pasteable, per implemented node)

```jsonc
// gate — assertion against inbound data
{ "id": "check", "type": "gate",
  "config": { "asserts": [
    { "path": "$.triplet.state", "op": "eq", "value": "PASS" },
    { "path": "$.count", "op": "ge", "value": 1 },
    { "path": "$.log", "op": "contains", "value": "verified" },
    { "path": "$.name", "op": "matches", "value": "^bible-" }
  ] } }

// event-filter — glob match + substring filter
{ "id": "watch", "type": "event-filter",
  "config": { "pattern": "deliberation.*", "filter": "acceptable", "expectedType": "deliberation.final" } }

// capture-engine — store the payload
{ "id": "cap", "type": "capture-engine", "config": { "into": "captured" } }

// pipeline — transform steps
{ "id": "shape", "type": "pipeline",
  "config": { "steps": [ { "value": "fixed-header" }, { "fn": "trim" } ] } }

// parallel — fan out
{ "id": "fan", "type": "parallel", "config": { "concurrency": 15 } }

// retry-chain
{ "id": "again", "type": "retry-chain", "config": { "maxRetries": 2, "failTimes": 1 } }

// fallback-chain
{ "id": "safe", "type": "fallback-chain", "config": { "fallbackValue": { "degraded": true } } }

// pause
{ "id": "hold", "type": "pause", "config": { "key": "approval", "immediateResume": false } }

// journal-sink
{ "id": "sink", "type": "journal-sink" }

// triplet-writer
{ "id": "ev", "type": "triplet-writer",
  "config": { "triplet": { "pattern": "mech.gate", "state": "PASS", "anchor": "mech-gate:1" } } }

// state-machine
{ "id": "fsm", "type": "state-machine",
  "config": { "initial": "idle", "table": { "idle": { "start": "running" }, "running": { "finish": "done" } } } }

// math-eval
{ "id": "math", "type": "math-eval",
  "config": { "expr": { "_tag": "add", "left": { "_tag": "literal", "value": 2 }, "right": { "_tag": "literal", "value": 3 } } } }

// shell-exec
{ "id": "sh", "type": "shell-exec", "config": { "cmd": "echo hello", "timeoutMs": 5000, "maxOutputBytes": 1048576 } }

// python-exec
{ "id": "py", "type": "python-exec", "config": { "code": "print(6*7)", "timeoutMs": 10000 } }

// http-request
{ "id": "http", "type": "http-request", "config": { "url": "https://api.example.com", "method": "GET" } }

// file-io
{ "id": "io", "type": "file-io", "config": { "op": "write", "path": "/tmp/out.json", "body": "{}" } }

// prompt — tier 2, bracketed
{ "id": "gen", "type": "prompt", "class": "generation",
  "config": {
    "mode": "llm", "system": "You are terse.", "prompt": "Summarize: ${input}",
    "maxTokens": 1024,
    "bracket": { "contract": "json", "repair": { "target": "schema-gate", "max": 2 }, "confidenceFloor": 0.55 } } }
```

---

# PART 28: THE 2E SECTION MAP (the doctrine cross-reference into the external bible)

The external JESL bible's PART 2E (2E.0-2E.12, :287-729) is the Effect-bind doctrine this kernel implements. Where each section landed:

| 2E section | Thesis | Landed at |
|---|---|---|
| 2E.0 THE BIND (:295) | JSON=grammar, Effect=runtime, journal=truth | the whole tree; the canon line |
| 2E.1 MODULE→SERVICE (:305) | every core module a Context.Service | the Tags (caps.ts:31-50, channels.ts:26, bus.ts:71, journal.ts:84, registry.ts:32, evidence.ts:72) |
| 2E.2 EFFECT-TYPED NODE (:325) | NodeImpl/NodeHandle Effect forms; E=JeslError; R=caps | executor.ts:50-58; the node files |
| 2E.3 REGISTRY EFFECT SHAPE (:370) | per-kind fiber vs Activity vs Schedule vs Deferred | registry ALL_KINDS + the durable rules (activities.ts) |
| 2E.4 CAPS=LAYERS (:407) | 3 drivers; missing R = CAP-UNBOUND | cli-live.ts:110, opencode-live.ts:78, caps.ts:118-130 |
| 2E.5 EXECUTION LOOP (:420) | readiness + forEach(15) + Exit | executor.ts:82-234 |
| 2E.6 DURABLE VS EPHEMERAL (:452) | when Workflow.make is mandatory | jesl-run.ts:38-44 + activities.ts DurableDeferred |
| 2E.7 AUTHORIZATION (:483) | Policy+CurrentProgram+causationId; T0 is a projector | the wraps' intercept chain (the enforcement substrate) |
| 2E.8 THREE SCANNERS (:507) | PBA/PTA/LSP on ONE bus — no fourth runtime | scanners/ ×7 + wraps/ ×4 + hook-bridge |
| 2E.9 CATALOG 5K (:537) | the 8 Effect idioms | PART 15 of this bible |
| 2E.10 P3-1..12 (:630) | the correct/wrong pairs | PART 13.4 of this bible |
| 2E.11 PROCEDURES P7-E1..6 (:653) | the six runbooks | the Operating Manual STEPS 1-5 |
| 2E.12 GROUNDING (:699) | SPEC until container rows; then flip | THE FLIP IS EARNED: the 4 [CT] checkpoints (33 rows) + the 336/336 battery = the S8/S9/S10 surface PROVEN |

