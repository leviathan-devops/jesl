# MACRO KERNEL BOILERPLATE — LAYER 2 IMPLEMENTATION SPECIFICATION
## MacroKernel_Edition-v1.0 — Sections 1–3 (Executive Summary · Architecture Overview · Component Design)

```
Document:    MACRO_KERNEL_BOILERPLATE_L2_SPEC.md
Target:      MacroKernel_Edition-v1.0 (the single production library)
Status:      SPEC-ONLY (K15 — the build fires on the operator's explicit go)
Version:     1.0.0-L2
Canon line:  "JESL authors the graph. Effect runs the graph. Activities journal the world.
              Paragon polices think and do. Effect LSP polices files. There is no other runtime."
Sources:     S1–S9 (SOURCE LINEAGE); every path matches FILE INVENTORY F1–F28.
Chunk:       Sections 1–3 of 10. Sections 4–10 (Data Model, Integration Plan, Test
             Specifications, Migration Strategy, Known Gaps, Compliance Matrix,
             Not-Covered) are authored in sibling chunks of the master document.
```

### MASTER TABLE OF CONTENTS (full document map — this chunk delivers §1–§3)

```
Front Matter   ....... Canon line, sources, chunk boundaries
CONTAINER TEST PLAN ... embedded in the master document immediately after this TOC
                         (10 scenarios: §7-1..§7-7 TOOLS/BOUNDARY/ERRORS/STATE/
                         CONCURRENCY/INTEGRATION/FIREWALL + S8 HYGIENE + S9 REPLAY
                         + S10 PRE-ARM; 7-field format; tool-result-bound tokens).
                         This chunk REFERENCES scenario IDs; it never duplicates them.
§1  Executive Summary .......................................... [THIS CHUNK]
§2  Architecture Overview ...................................... [THIS CHUNK]
§3  Component Design (C1–C12, full interfaces + pseudocode) ... [THIS CHUNK]
§4  Data Model (journal row schema, channel paths, seed semantics serialization)
§5  Integration Plan (v4.4.4 slotting, wave-manager binding, docs wave DW1/DW2)
§6  Test Specifications (F23 battery expansion, fixture↔token cross-matrix F28)
§7  Migration Strategy (S1E→S8L + P0→P5 wave order, gates)
§8  Known Gaps (G1–G17 closure mapping)
§9  Compliance Matrix (R1–R13 × K1–K20 × DD1–DD24 traceability)
§10 What This Spec Does NOT Cover
```

---

# §1 — EXECUTIVE SUMMARY

## 1.1 The Mandate

The operator's directive (2026-09-03, S5) is three rulings fused into one engineering
program:

1. **"engineer this based on the input pipeline laid out in
   TRIDENT_AGENT_V444_DEFINITIVE_ENGINEERING_ARCHITECTURE_SPEC.md and just add the
   Macro Kernels Prototype Shells as a step between MPSE + Code specs.
   MPSE specs --> macro kernel prototyps --> code specs"** — the pipeline insertion
   (R5, DD14) engineered against the v4.4.4 §2:106 base pipeline.
2. **Skill_Tools_V2** — "skills as real time tool injectables / context / prompt /
   anti pattenrs / json schema / effict script prototype shells / pre-built engines
   for specific micro execution (ex: document writer, matrix calculator, etc) /
   testing criteria/pre-built test suite templates" + "skills as the payload deliver
   for ephemeral-kernel-tools ('rockets' - one off execution) - skill rockets.
   kernel rockets." — the rocket payload model (R6, DD15, F26).
3. **"where is the effect layered in here?"** — answered as the four effect layers
   α/β/γ/δ (R11, DD16) and the v4.4.4 slotting (Layer 0 internals turbo-charged,
   Layer 2 Poseidon-as-Workflow + Hydra-on-EventBus + Worktree-as-scoped-fiber,
   Layer 3 Self-Verifier + LSP gate; the §25 XState machines become projectors).

Standing frame (2026-09-01, binding): **"LIBRARY ARCHITECTURE IS FUNDAMENTAL"** and
**"the 2 examples i gave are USE CASE TARGETS OF THE FULLY PRODUCTION GRADE LIBRARY.
THROW THAT IN THE TRASH AND WIRE THE LIBRARY PROPERLY"** (DD1). The product is ONE
library — `MacroKernel_Edition-v1.0`. The three use-case families (mechanical tools,
embedded agent systems, skill rockets) are compositions against it, never separate
systems.

## 1.2 The Product

`MacroKernel_Edition-v1.0` is a single TypeScript/ESM/bun library with a FIXED pure
core and EDIT per-project surfaces, mirroring the three proven siblings
(IntelligenceLexicon-Edition-v1.0's copy-and-customize model, Paragon_V1's
container-evidence-chain, Paragon_V2's DomainModule pattern):

```
MacroKernel_Edition-v1.0/
├── core/       FIXED  the pure Effect kernel — schema, graph, bus, channels,
│                      executor, journal, registry, caps, errors.
│                      ZERO host imports. ZERO raw Promise I/O. (K2)
├── nodes/      FIXED  the append-only node-kind registry implementations:
│                      deterministic ×18, ms-* survivors ×9, paragon machines ×8,
│                      execution ×4 (cap-bound), generation ×3 (bracketed).
├── drivers/    FIXED  CliLive / OpenCodeLive / TestLive (+sdk, watcher, cron).
├── mpse/       FIXED  the bridge — the Paragon L2 compiler repurposed:
│                      parser → rule-cards → oracle-compile → kernel-emit →
│                      stub-emit → calibrate.
├── kernels/    EDIT   the six lifecycle seeds (R10) + project macro kernels.
├── profiles/   EDIT   trident / trading / sales DomainModule family sets.
├── bindings/   EDIT   host packs — the ParagonHostBinding 5-hook contract.
├── packager/   FIXED  tool / chain / skill emitters (one doc, three targets).
└── tests/      FIXED  the battery (§7 ×7 + S8 + S9 + S10) + per-kernel fixtures.
```

The core execution contract (R2, DD9): `NodeImpl.invoke` returns
`Effect<NodeResult, JeslError, Caps>` — never a raw Promise. Caps are
`Context.Tag` services; drivers are Layers (`CliLive` / `OpenCodeLive` /
`TestLive`); world-touching work in durable runs is `Activity.make` (journaled,
replayable, never re-paid); concurrency is `Effect.forEach` capped at 15 (E6);
a 429 exiles to the next rung rather than retrying in place.

## 1.3 The Pipeline Insertion

Base (v4.4.4 §2:106):
`Idea → Bible (3 loops) → MPSE Spec (3 loops) → Code Spec(s) (3 loops, parallel) → Poseidon → Ship`.

Inserted (R5, DD14):

```
Idea → Bible(3) → MPSE Spec(3) → MACRO-KERNEL PROTOTYPE STAGE → Code Spec(s)(3, parallel) → Poseidon → Ship
                                    │ 1. map MathExpr families → kernel coverage matrix
                                    │    (compose vs build, per family)
                                    │ 2. generate workflow.json + ctx.json + Activity stubs per gap
                                    │ 3. compile oracle-gate rows from the MPSE spec
                                    │ 4. DRY-RUN REPLAY on TestLive — the deterministic nodes
                                    │    EXECUTE before code exists; D1–D9 surface pre-build
                                    └─ gate: verdict:PASS on the dry run, zero code written
```

The insertion adds **no user loop** (K11) — it is agent-autonomous with the TestLive
dry-run replay as its gate. Code Specs then specify **only the delta**: which kernels
compose, which stubs to fill, language/architecture for the gaps — each referencing
the MathExpr blocks it implements and the bible sections it fulfills.

## 1.4 The Four Effect Layers

- **α — pipeline self-hosting.** The six lifecycle kernels (R10) ARE Effect
  programs; the MPSE→prototype compiler runs as services; from slice P3 the
  pipeline runs on the kernel it produces.
- **β — rocket propulsion.** `workflow.json` is dead paper until the Effect kernel
  runs it (`Schema.decode → graph → provide(Layer) → fibers`); the driver choice IS
  the Layer stack bound at ignition.
- **γ — build supervision.** PBA/PTA/LSP as Effect services on one EventBus; the
  v4.4.4 God Loop 13 phases become ONE `Workflow.make`; the §25 XState machines
  become PROJECTORS over the Effect event stream (DD13 — XState renders, Effect runs).
- **δ — verification plane.** Every test-suite template in every payload runs on
  TestLive (TestClock + InMemoryJournal + ScriptedToolkit + MemoryFs); verdicts are
  read FROM journal rows.

## 1.5 The Consolidation

The survivor table (R9, DD17) names the single source of truth per mechanism:

| Mechanism | Survivor | Losers become |
|---|---|---|
| 4-bank classifier | `ms-ratio-classifier` (purest, property-pinned) | data (banks) |
| λ-synapse | `sentinel/synapse.ts` (I1–I7, thr-v1 versioned) | — |
| enforcement lattice | V1 pure `step()` (order-load-bearing, I2 triad) | — |
| deadline/skipTier table | `ms-escalation-memory` (SOLE authority) | inline copies deleted (G3) |
| evidence adjudication | the 8-kind event machine (LASME_v1 + baseline port, G1) | — |
| PASS gate | `ms-evidence-gates` (PASS 5/5) | — |
| chain tracking | `ms-chain-tracker` | — |
| warhead delivery | `ms-warhead-dispatcher` + 24-template corpus as data | — |
| journal | the JESL journal service (sha256 chain, `covers()`, resume) | — |
| intent fusion | `ms-intent-classifier` (imports ms-ratio — G4 de-dup) | inlined copy deleted |
| evidence record sig | the gates' SHA-256 shape (timestamp+type INCLUDED — DD18) | collector re-pins |

## 1.6 Skill Rockets

A rocket (R6, DD15, F26) is a self-contained ephemeral kernel-tool payload:
`SKILL.md` (the fuse) + `payload/ctx.json` + `mission.md` + `anti-patterns.json`
(machine data, PTA-consumable) + `schemas/` + `workflow.json` (the effect script) +
`activities.ts` (Effect Activity stubs) + `engines/` (pre-built micro-execution
kinds: document-writer, matrix-calculator, …) + `tests/` (fixtures + oracle rows +
TestLive suite template). Launch = `bunx jesl run workflow.json --ctx ctx.json
--in {...}` (CLI Layer) or the `jesl-run` tool (OpenCodeLive, in-session). It fires
once, journals to `.trident/rockets/<run-id>.jsonl` (sha256-chained), and dies. No
plugin rebuild, no registration. The `prompt` node is dual-mode: `call-model`
(llm cap) | `ask-launcher` (NO cap — the question returns through the tool result;
the launching agent IS a node).

## 1.7 Acceptance Summary

The 16 criteria (tsc 0; battery 0-fail; malformed docs refuse with named tokens;
deterministic doc runs headless to `verdict:PASS`; replay byte-determinism;
cap-unbound loud with NO artifact; parallel `overlapCount≥1` with all verdict rows;
skill via bash end-to-end; packager emits 3 targets; append-only compat; plugin
driver loads; `kill -9` crash-safe journal + resume; no raw fetch/Date.now/node:fs
in core; LSP diagnostics 0 errors at kernel severity; replay does not re-invoke;
layerinfo lists Journal/Fs/Shell) and **10/10 container scenarios** (§7 ×7 + S8 +
S9 + S10, K19: passTokens tool-result-bound, never agent-typeable). Nothing in the
SPEC-GATED ledger (G6) ships before its container row exists (K14).

## 1.8 Reading Order

§2 (architecture) → §3.0 (shared contracts) → §3.1–§3.9 (core) → §3.10–§3.14
(nodes) → §3.15 (drivers) → §3.16 (mpse bridge — the insertion's compiler) →
§3.17 (kernels) → §3.18–§3.21 (packager/profiles/bindings/scanners) → §3.22–§3.24
(data contracts, the one-trace flow, blind spots). Sibling chunks: §4–§10.

---

# §2 — ARCHITECTURE OVERVIEW

## 2.1 Architecture at a Glance

```
                    ┌──────────────────────────────────────────────────────────────┐
                    │                     DOCUMENTS (dead paper)                   │
                    │  workflow.json ($schema: trident-workflow-v1)  ctx.json      │
                    │  MPSE spec (.md, fenced math/oracle/contract)  SKILL.md      │
                    └───────────────┬──────────────────────────────┬───────────────┘
                                    │ decode                      │ parse fences
                                    ▼                              ▼
                    ┌───────────────────────────┐   ┌──────────────────────────────┐
                    │  mpse/ bridge (F18)       │   │  core/schema.ts WorkflowCodec │
                    │  parser → rule-cards →    │   │  [JESL ...] frozen tokens    │
                    │  oracle-compile →         │   │  cross-validation            │
                    │  kernel-emit/stub-emit →  │   └──────────────┬───────────────┘
                    │  calibrate (D17/A3)       │                  │ WorkflowDoc
                    └─────────────┬─────────────┘                  ▼
                                  │ emits            ┌─────────────────────────────┐
                                  ▼                  │  core/graph.ts (pure)        │
                    ┌───────────────────────────┐    │  readiness sets · cycles ·   │
                    │  kernels/ (F19, EDIT)     │    │  parallel batch partitioning │
                    │  6 lifecycle seeds        │    └──────────────┬───────────────┘
                    └─────────────┬─────────────┘                   │
                                  │ Workflow.execute                ▼
┌─────────────────────────────────┴─────────────────────────────────────────────┐
│                        core/executor.ts  (THE READINESS LOOP)                 │
│   while incomplete: ready=inbound-channels-set;                              │
│   Effect.forEach(ready, invoke, {concurrency:15}); writes wake more;          │
│   bus events write channels (second wake); gates LOUD-throw or repair ≤2      │
└───┬──────────────┬──────────────┬───────────────┬───────────────┬─────────────┘
    ▼              ▼              ▼               ▼               ▼
┌────────┐  ┌────────────┐  ┌───────────┐  ┌────────────┐  ┌──────────────┐
│ bus.ts │  │ channels.ts│  │ journal.ts│  │ registry.ts│  │   caps.ts    │
│ glob   │  │ Ref/Subscr │  │ sha256    │  │ append-only│  │ shell/llm/   │
│ handler│  │ ptionRef   │  │ chain +   │  │ kind→impl  │  │ tool/subagent│
│ isolat.│  │ $. ${ctx}  │  │ covers()  │  │ +contracts │  │ /http/fs/emit│
└───┬────┘  └─────┬──────┘  └─────┬─────┘  └─────┬──────┘  └──────┬───────┘
    │             │               │              │                │
    └─────────────┴───────┬───────┴──────────────┴────────────────┘
                          ▼  provide(Layer) — the driver IS the world
┌─────────────────────────────────────────────────────────────────────────────┐
│ drivers/:  CliLive = Shell+Fs+Http+Journal.file                             │
│            OpenCodeLive = CliLive + ToolClient + Subagent + Llm + Hooks.bus │
│            TestLive = TestClock + InMemoryJournal + ScriptedToolkit+MemoryFs│
│            sdk.ts (caller caps) · watcher.ts · cron.ts (re-seeding)         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 The Layer Cake — FIXED vs EDIT

| Layer | Mutability | Contents | Enforced by |
|---|---|---|---|
| `core/` | FIXED | 9 services (F1–F9) | K2 purity ripgrep + `verifyImportGraph` (Law18 pattern, CI on `src/`) |
| `nodes/` | FIXED, append-only | ~35 kind files (F10–F11, F13, F16) | K13 registry freeze |
| `drivers/` | FIXED | cli/opencode/sdk/watcher/cron (F12, F14) | K4 caching law on opencode.ts |
| `mpse/` | FIXED | 6 bridge files (F18) | K10 MPSE constraints |
| `kernels/` | EDIT | 6 seeds + project kernels (F19) | K20 lowest-composition |
| `packager/` | FIXED | tool/chain/skill (F20) | DD6 one-doc-three-targets |
| `profiles/` | EDIT | trident/trading/sales (F21) | Paragon_V2 universality: zero profile-id branches |
| `bindings/` | EDIT | opencode 5-hook pack (F22) | C8 contract |
| `tests/` | FIXED | battery + fixtures (F23, F24) | K19 tokens-not-counts |

EDIT surfaces are the copy-and-customize contract (E-SURFACE): a project copies the
edition, edits `kernels/`, `profiles/`, `bindings/`, and never touches the FIXED
core. The boilerplate extraction gate (P5) is a copy-and-customize dry-run.

## 2.3 The Effect Kernel Topology

Services and their requirement edges (`R` unions flow right):

```
 WorkflowCodec ──decode──▶ WorkflowDoc ──▶ Graph ──readySet──▶ Executor ◀──wake── Channels
      │                                                  │  ▲                  │
      │                                          invoke(node) │                  │ write
      ▼                                                  ▼  │                  ▼
  [JESL ...] errors ◀──throw──┐                  NodeRegistry─┘              EventBus
                              │                        │                       │
   caps (R = Caps union) ◀────┤                  kind→NodeImpl                 │ on(glob)
   Shell Llm Tool Subagent    │                        │                       ▼
   Http Fs Emit               └──── NodeImpl.invoke: Effect<NodeResult,        isolated
                                              JeslError, Caps>               handlers
                                        (durable runs: Activity "node:<id>")
                              Journal ◀── pre-invoke + verdict rows (EVERY node)
                                 │
                                 └── covers() ──replay──▶ journaled NodeResult
                                                      (invoke count 0 — S9)
```

## 2.4 The Execution Model — Dataflow Readiness + One Bus (DD4)

Edges name channels. A node fires when **all** its inbound channels are written
(`Graph.readySet(channels.snapshot())`). The EventBus is the second wake source:
a bus event may write a channel (the handler writes, never mutates the event),
which re-arms the readiness loop. Pipeline-shaped and reactive-shaped documents
are the SAME machine — a document that is half DAG, half event-handler has no seam.

Rejected alternatives (DD4): step-list walking (no reactivity — an event-reactivate
node can never re-arm); pure event handlers (no DAG structure — no readiness, no
parallel batching, no output gate).

## 2.5 The Pipeline With the Insertion

Stage table (v4.4.4 §2 base + insertion; K11 constraints in the right column):

| # | Stage | Owner kernel | Loops | User? | K11 constraint |
|---|---|---|---|---|---|
| 0 | Idea | — | — | YES | natural language in |
| 1 | Bible V0 + Revision 3 | `idea-to-bible`, `bible-to-spec` (front) | 8+ Q&A rounds, then 3 FORCED INTENT-FIDELITY loops | YES (approves FINAL only; never reads the bible) | everything natural-language until bible FINALIZED by direct user approval |
| 2 | MPSE Spec | `bible-to-spec` (back) | 3 | NO | agent holds deep primary context; MathExpr + oracle per expr sourced from bible |
| 3 | **MACRO-KERNEL PROTOTYPE** | `spec-to-kernels` | 1 (dry-run gated) | NO | agent-autonomous; TestLive replay = the gate |
| 4 | Code Specs (delta-only) | `kernels-to-code` (spec emission) | 3, parallel | NO | decisive senior engineer; multi-language by need; zero scope-cuck |
| 5 | Poseidon Build | `kernels-to-code` + Poseidon-as-Workflow | ≤ MAX_CYCLES 50 adaptive | NO | MPSE = verification substrate; bible = macro context |
| 6 | Verify | `verify` | 1 suite | NO | container test IS the test |
| 7 | Ship | `ship` | 1 | NO | manifest→copy→docs→audit gates |

The insertion's internal sequence (`spec-to-kernels`, F19): fenced-math parse (D13)
→ oracle-row compile → FR→workflow decomposition → Activity stub emission → D17
calibration → TestLive dry-run replay. Run kernels 1→6 in order and the journal
chains across the lifecycle — one sha256-linked ledger from idea to shipped dist:
the project's proof-of-work AND the resume anchor at every stage boundary (R10).

## 2.6 The Four Effect Layers and the v4.4.4 Slotting (DD13/DD16)

In the v4.4.4 7-layer map, Effect slots at:

- **Layer 0 (core engine internals)** — `buildTool` factory, hook registry,
  StateDB (13 tables), CAS, deferred tools, resilience: re-hosted as services/caps.
  **The immutable shell is untouched** (K4): 5 mode tools, 18 audit layers R0–R17,
  3-layer blocking, P1–P10 stay byte-for-byte.
- **Layer 2 (orchestration)** — Poseidon becomes ONE `Workflow.make` (13 phases as
  deterministic Activities + model phases as Schema-gated Activities or child
  Workflows); Hydra messages become EventBus traffic; WorktreeIsolator becomes a
  scoped fiber resource.
- **Layer 3 (intelligence)** — Self-Verifier adaptive-depth actors as Effect +
  TestClock; the LSP gate as an Activity.

The §25 XState machines DO NOT DIE: they subscribe to the Effect event stream
(`poseidon.phase.entered`, `node.verdict`, …) and render. XState renders; Effect
runs. Per the spec's own principle: **THE SHELL STAYS. THE INTERNALS GET
TURBO-CHARGED.**

Honest build-state note (G7): v4.4.4 is SPEC-STAGE (13-week phasing §21, ~75-file
map §24 — planned, not built). The γ-layer targets the v4.4.4 SPEC as its
integration surface; the α/β/δ layers (library, rockets, TestLive) build NOW
against the proven v4.4.2 machinery + Effect.

## 2.7 The Single-Runtime Law and the Projector Pattern (E10, K1)

One `run*` per hook/CLI invocation; inside it, only `yield*`. XState interpreters,
Promise loops, and hook bodies are projectors or edges — they never call
Docker/shell/llm directly. Mechanical enforcement: `floatingEffect` +
`runEffectInsideEffect` LSP rules at error severity; the S8 hygiene ripgrep (zero
`globalFetch`/`globalDate`/`globalTimers`/`globalRandom`/`nodeBuiltinImport`/
`asyncFunction` in kernel paths); the `@effect/language-service` patch in
`prepare` (F24) so tsc carries the same errors the agents see.

## 2.8 The Authorization Stack (E7, K5)

A tool invocation is authorized by **Policy + CurrentProgram + a causationId in the
journal** — NEVER `getT0()` (it dies), NEVER system-prompt stickers, NEVER warhead
prose. The stack, in order:

```
(1) Escalation.intercept      Paragon tier ≥ 3 → StructuredEnforcementError (deny)
(2) Policy.assertCapable      CurrentProgram.capabilities ∩ requiredCaps
(3) Policy.assertPhase        Poseidon/JESL ready-set (the node IS in the ready set)
(4) causationId ∈ journal     an Interpreter or Activity spawned this invocation
(5) Toolkit.invoke            the only world-touching call
```

Deny = `StructuredEnforcementError`, never a log line. The S10 scenario pins the
chain: reasoning text → `pba.family.hit` → layer boost → bash deny in
`tool.execute.before`, with the journal showing `pba.family.hit` THEN
`pta.intercept` AND the bash Activity never ran.

## 2.9 Component × Component Peer Interaction Table (C6)

Core services and what each peer consumes from / provides to the other:

| ↓ consumes from → | schema | graph | bus | channels | executor | journal | registry | caps | drivers | mpse | packager |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **schema** | — | registry kinds (unknown check) | — | edge.via names | — | — | kinds list | requiredCaps hints | — | MathExpr kinds | target schemas |
| **graph** | WorkflowDoc | — | — | snapshot (readySet) | batch levels | — | kind family | — | — | emitted docs | — |
| **bus** | — | — | — | handler writes | emit wake | handler-error rows | — | — | hook events in | — | — |
| **channels** | — | inbound sets | wake on write | — | seeds/vars | — | — | — | argv/--in seeds | ${ctx} values | — |
| **executor** | output gate | readySet | awaitWake | read/write | — | pre+verdict rows | NodeImpl lookup | provide R | Layer stack | — | — |
| **journal** | row schema | — | — | — | append invoke/verdict | — | — | — | file/inmem impls | provenance anchors | evidence rows |
| **registry** | kind contracts | family | — | — | — | — | — | requiredCaps | — | stub gates | engine refs |
| **caps** | — | — | — | — | — | — | — | — | Layer bindings | — | — |
| **drivers** | validate cmd | — | Hooks.bus | seeds | runPromise (cli only) | Journal.file/TestClock | — | provide(Layer) | — | — | emit CLI |
| **mpse** | emitted doc decode | — | — | ctx values | dry-run on TestLive | oracle provenance | stub kinds | — | TestLive | — | skill targets |
| **packager** | doc read | — | — | — | — | — | engine catalog | — | CLI surface | — | — |

## 2.10 Architecture Invariants

| ID | Invariant | Mechanism (spec ref) |
|---|---|---|
| INV-1 | One runtime | K1/E10; LSP + S8 |
| INV-2 | Core purity (zero host imports, zero raw Promise I/O) | K2; criterion 13; verifyImportGraph |
| INV-3 | Token stability — the 8 frozen `[JESL ...]` strings | K3/D15; F28 cross-matrix |
| INV-4 | Shell immutability + prompt-caching law | K4; system.transform byte-identical |
| INV-5 | Authorization = Policy+CurrentProgram+causationId | K5/E7; S10 |
| INV-6 | Detector/decider/generator separation | K6; TIER-VIOLATION + UNBRACKETED-GENERATION at authoring |
| INV-7 | Every node invocation journals; verdict from rows | K7/E5; S9 |
| INV-8 | Loud fail or clear pass; INCONCLUSIVE never a pass | K8; fallback test |
| INV-9 | Fan-out = forEach(15)/allSettled partition | K9/E6; §7-5 |
| INV-10 | Math-before-code; oracle integer equality | K10; R4 |
| INV-11 | Registry append-only; v1 docs run forever | K13/D7 |
| INV-12 | Wrap proven machinery, never rewrite | K14/D11; P3-6 |
| INV-13 | Lowest composition wins | DD23/1I; tier discipline schema-enforced |

## 2.11 Threshold Register — Architecture-Level Constants with Rationale

Every load-bearing constant in this spec carries a BECAUSE. Component-local
constants restate theirs inline; this register is the consolidated authority.

| Constant | Value | BECAUSE |
|---|---|---|
| `maxNodesFiring` | 15 | The readiness loop's fan-out cap. Below ~8, a 5-node parallel fixture (parallel-5) plus repair edges serialize and §7-5 cannot demonstrate `overlapCount≥1`. Above ~25, Docker/shell children contend for FDs and the stagger window (1–3s) ceases to space bursts; 15 sits at the measured plateau of the v4.4.2 wave fan-out where throughput stops improving but child-process failures begin. |
| stagger | 1–3s | Zero stagger produces thundering-herd on the RPM ledger (nvidia 40 / opencode 200 RPM); >5s starves the deadline budget on 15-node batches. 1–3s spreads the first eight emissions across one EXILE window. |
| retry base | 2.5s × ≤2 retries (5xx class) | Pinned by the aether chain (retry 3–5×2.5s): below 2.5s re-collides with the same 5xx window; above ~4s the node timeoutMs expires before retry 2 lands. |
| 429 policy | exile, not retry-in-place | An in-place retry inside the same rate window is a guaranteed second 429 (the rpm-ledger lesson). EXILE_MS 45000 = one full ledger window: the provider's counter has rotated by return. |
| `EXILE_MS` | 45000 ms | The ledger window observed on the nvidia/opencode rungs; returning earlier re-hits the same bucket; later wastes >15% of the run deadline for zero gain. |
| `STALL_MS` | 60000 ms | The chainedStream stall detector: below 60s, long single-token generations (thinking-budget runs) false-positive; the 712s autopsy showed true stalls persist well past 60s. |
| synapse decay α | 0.05 per Δseq | λ·e^(−0.05·Δseq)+w: at Δseq=25 (the refractory) decay ≈ e^−1.25 ≈ 0.29 — a second family hit inside the refractory contributes <30%, enough to boost if corroborated by w, too weak to self-sustain. Halving α makes the refractory cosmetic; doubling it erases legitimate re-arm within ~10 events. |
| refractory | 25 seq | Sentinel I-series: below ~20, normal agent chatter re-arms the same family (false positives); above ~40, a genuine repeat offense inside one session decays before aggregation. |
| PBA→PTA ring | 20 events | The bridge's correlation window: must hold enough history for `correlateEscalation` floor 0/0/1/2/2 to see a 2-hit pattern; >50 and pre-arm boosts arrive after the tool call they should have gated. |
| escalation deadline windows | 5/2/0 (count 0/1/2+) | The SOLE table (ms-escalation-memory): with 0 prior escalations a family gets 5 seq before re-check (avoid noise-chasing); at count ≥2 the deadline is 0 — the next hit escalates immediately. |
| skipTier | 0/2/3 | Escalations at count 1 stay tier-local (a single hit is signal, not pattern); count 2 skips to tier 2; count ≥3 jumps to tier 3 (the throw tier). Skipping at count 1 makes every first-offense a throw — the false-positive storm the V1 lattice was built to kill. |
| tier cap | 4 | TIER_TO_SURFACE tops at GATE; a tier-5 has no distinct surface and would dead-end the dispatcher. |
| `HISTORY_CAP` / `OUTPUT_CAP` | 100 / 500 | chain-tracker: 100 events bounds loop detection state at O(100); 500 chars bounds the output signature — beyond that the signature stops discriminating (hash saturation) while costing memory. |
| `detectLoop` | ≥3-same AND ≤1-unique-completed | 2-same is a retry (legal); 3-same with ≥2 unique completions is exploration. The conjunction kills both false classes. |
| `POOL_TTL` | 600_000 ms | 2× the gate freshness window (300s): a pooled record must outlive the gate it feeds, else the gate sees stale-absent and fails closed on good evidence. |
| evidence freshness | 300 s (`CLAIM_FRESH_WINDOW_MS`) | A claim about a write/probe older than 5 minutes cannot be correlated to the artifact (the file may have changed twice since); shorter than ~120s rejects slow container probes. |
| claim-gate demand | 200c + triad + TTL 8 seq | 200c floors the demand below trivial single-word claims; 8 seq TTL means the demand expires within ~2 tool rounds — a stale demand splicing into an unrelated reply is the false-positive class. |
| confidence floor | 0.55 → UNCLEAR (0.85−0.15 paraphrase) | Below 0.55 the shadow's marker match is indistinguishable from topic drift; the 0.85−0.15 penalty encodes measured paraphrase degradation — a hard 0.85 floor rejects every real-world paraphrase. |
| fusion weights | 0.5/0.3/0.2 (s1/s2/s3) | Signal 1 (lexicon banks) is the only deterministic source; signals 2–3 (chain/intent) are correlates. Sum=1 keeps the fusion a convex combination — no amplification past the strongest source. |
| classifier bands | ENFORCE ≥0.5 / DAMPEN ≥0.3 | conf = pos/(pos+neg+1): with 1 pos 0 neg conf=0.5 — a single clean positive-leg hit is the minimum enforceable signal; 0.3 admits 1-pos-1-neg (mixed) for damping only. |
| `CT_DECODE_PRINTABLE_RATIO` | 0.6 | Below 0.6 the segment is likely base64/binary smuggling; above ~0.75 legitimate minified JS false-positives. |
| MathExpr depth / domain | 256 / 10K | Depth 256 exceeds any human-authored nested spec expression by 10× while bounding stack; domain 10K symbols bounds oracle lookup at O(10K) — beyond that the spec needs decomposition, not a bigger domain. |
| `RING_CAP` / `VERDICT_TTL_MS` / `LIFECYCLE_TTL_MS` | 50 / 5000 / 300000 | Ring 50 bounds per-machine evidence state; verdict TTL 5s because smoke-vs-container verdicts are only decision-relevant within one hook round; lifecycle 5min matches the evidence freshness window. |
| repair bound | ≤2 | Unbounded repair loops are the degenerate-done crash class; 2 covers the observed one-repair-then-pass and one-repair-then-escalate patterns. |
| thinking budget formula | 4+ceil(candidates/8) | The shadow-agent autopsy: below this, subagent exploration truncates before the first discriminator; linear-in-candidates over-provisions by ~3× on large fan-outs. |
| capture-engine | 50ms / 60 chars | The 10-step meta-process probe values: <50ms tick misses no full delta on the opencode stream; 60-char max-delta flush keeps partial-tool-arg captures from splitting mid-token. |
| sqlite | WAL + busy_timeout 5000 + IMMEDIATE | IMMEDIATE + WAL + 5000ms is the corruption-avoidance triple: IMMEDIATE takes the write lock up front (no upgrade deadlock), WAL lets readers proceed, 5s absorbs the longest observed contended write. |
| `CHUNK_CHAR_CAP` | 4000 | Fleet chunking: above ~4K, per-chunk marker-teaching loses byte-exact alignment; below ~2K the chunk count explodes past the round budget. |
| chain BFS bound | 64 hops | Lineage queries beyond 64 hops span multiple projects — the answer is noise past that depth. |
| D25 blockFor | <500B | The LOGIC-LSP block heuristic: findings riding touched files under 500B are splice-safe; larger inserts risk mid-token splices. |
| battery threshold | 10/10 (7/7 within §7) | One FLAWED scenario invalidates the suite (the MNI-3 lesson: green suites with theater estimates are worse than red suites). |

## 2.12 Architecture Blind Spots (C8 — architecture level)

- This architecture does NOT fix the v4.4.4 build-state gap (G7): the γ-layer
  integrates against a spec, not a running v4.4.4 runtime. If v4.4.4 ships a
  different hook surface than §24 plans, the bindings pack (F22) re-targets; the
  core is unaffected.
- It does NOT make tier-2 (LLM) runs byte-deterministic (G13). The journal IS the
  determinism record; replay returns the journaled generation. Anyone needing
  cross-run identical LLM output must re-read the journal, not re-fire the node.
- It does NOT provide semantic search or docs-patterns (G10): those verbs stay
  honest-zero stubs (`SEMANTIC_UNAVAILABLE` / `DOCS_UNAVAILABLE`) until the
  embedding surface lands.
- It does NOT port grok-build code (S7 contamination guard): the correspondence
  (their agent() = our shadow-agent; their journal.rs = our journal-sink; their 11
  host variants = our node kinds; their Rhai = our JSON graph) maps concepts only.
- It does NOT replace the PBA regex banks or the R0–R17 AST engine (K17): Effect
  wraps them pure and actuates at the seam (D11/P3-6). A regex-bank bug is fixed
  in the bank, not in the kernel.

---

# §3 — COMPONENT DESIGN

Every subsection carries: Purpose · Interface (full TypeScript) · Pseudocode ·
ASCII data-flow (C5) · Integration points (file paths) · Thresholds+BECAUSE ·
Test spec with concrete `expect()` (C7) · Failure modes. Shared contracts first.

## 3.0 Shared Contracts (referenced by every component — C10 preview)

```typescript
// jesl/core/contracts.ts — the three shapes every service speaks

export interface RunContext<in out R = Caps> {
  readonly runId: string                  // sha256(docHash + NUL + seed).slice(0, 16)
  readonly doc: Readonly<WorkflowDoc>     // FROZEN after decode — mutation is a defect
  readonly channels: Channels             // service handle
  readonly journal: Journal               // service handle
  readonly bus: EventBus                  // service handle
  readonly caps: Context.Context<R>       // the provided world (caps ARE the R union)
  readonly clock: Clock                   // TestClock under TestLive
  readonly budget: RunBudget
  readonly vars: Readonly<Record<string, string>>   // --in + argv + ctx.json resolution
}

export interface RunBudget {
  readonly deadlineMs: number             // default PROPOSED: [600_000]
  readonly maxNodesFiring: 15             // threshold register §2.11
}

export type Verdict = "PASS" | "FAIL" | "INCONCLUSIVE" | "READY_FALSE"

export interface NodeResult {
  readonly verdict: Verdict
  readonly outputs?: Record<string, JsonValue>      // written via edge.via by executor
  readonly error?: JeslErrorShape                    // structured, never prose
  readonly evidence: Triplet                         // the MPSE triplet — REQUIRED
  readonly timing: { startMs: number; endMs: number }
}

export interface Triplet {
  readonly pattern: string    // e.g. "pba.family.hit", "oracle.row.O-12", "gate.assert.eq"
  readonly state: string      // the machine/node state at emission, e.g. "FIRED"
  readonly anchor: string     // file:line or journal row id — anchorless = deleted
}

export interface NodeImpl<in out R = Caps> {
  readonly kind: string                       // registry key — never renamed (K13)
  readonly family: NodeFamily
  readonly requiredCaps: ReadonlyArray<Context.Tag<any, any>>   // [] for deterministic
  invoke(input: NodeInput, ctx: RunContext<R>): Effect<NodeResult, JeslError, R>
}

export type NodeFamily =
  | "deterministic" | "ms" | "paragon" | "execution" | "generation"

export interface NodeInput {
  readonly node: Readonly<NodeEnvelope>       // the doc's own envelope
  readonly inbound: Readonly<Record<string, JsonValue>>  // resolved channel values
}

export interface JournalRow {
  readonly seq: number
  readonly ts: number
  readonly run: string                        // runId
  readonly node: string
  readonly kind: "invoke" | "verdict" | "bus.event" | "bus.handler.error" | "run.open" | "run.close"
  readonly verdict?: Verdict
  readonly evidence?: Triplet
  readonly source: string                     // "workflow/<name>/<node>" — the discriminator
  readonly prev: string                       // sha256 of previous row ("genesis" for seq 0)
  readonly self: string                       // sha256(canonical(row minus self) + NUL + prev)
}
```

`RunContext` is fully serializable — it IS the resume artifact's head (§3.6).

---

## 3.1 `jesl/core/schema.ts` — the WorkflowCodec service (F1)

**Purpose.** The authoring-time gate. `Schema.decodeUnknown(WorkflowDoc)` plus the
seven-step cross-validation, each failure emitting the string-stable `[JESL ...]`
diagnostics with `{code, node, field, expected, actual, remedy}` — the
compiler-style contract (the `formatDiagnostics` pattern, wave-spec.ts:200 line).

**Interface.**

```typescript
export class WorkflowCodec extends Effect.Service<WorkflowCodec>()(
  "jesl/WorkflowCodec", {
    succeed: {
      decode(raw: unknown): Effect<WorkflowDoc, JeslDiagnostic[]>
      validate(doc: WorkflowDoc): Effect<WorkflowDoc, JeslDiagnostic[]>
      formatDiagnostics(diags: ReadonlyArray<JeslDiagnostic>): string
    }
  }) {}

export interface JeslDiagnostic {
  readonly code: JeslToken          // one of the 8 frozen literals (errors.ts)
  readonly node: string
  readonly field: string
  readonly expected: string
  readonly actual: string
  readonly remedy: string
}

// The document grammar (JESL bible §2.1/§2.2 — unchanged, versioned)
export const WorkflowDoc = S.Struct({
  $schema: S.Literal("trident-workflow-v1"),        // K13: versioned forever
  meta: S.Struct({
    name: S.String,
    tier: S.Union(S.Literal(1), S.Literal(2)),      // determinism class (DD1: auditable, not a boundary)
    description: S.optional(S.String),
    seed: S.optional(S.Struct({ channel: S.String }))   // the declared entry channel
  }),
  nodes: S.NonEmptyArray(NodeEnvelope),
  edges: S.Array(S.Struct({
    from: S.String, to: S.String,
    via: S.String                    // the channel `from` writes, `to` awaits
  })),
  journal: S.optional(S.Struct({
    path: S.optional(S.String),      // default .trident/rockets/<run-id>.jsonl for rockets
    durable: S.optional(S.Boolean)   // durable ⇒ Workflow.make path (§3.17 wrapper)
  })),
  gates: S.Array(GateSpec)           // terminal output gates — ≥0
})

export const NodeEnvelope = S.Struct({
  id: S.String,
  type: S.String,                    // registry kind — UNKNOWN-NODE if absent
  class: S.Union(
    S.Literal("event"), S.Literal("decision"), S.Literal("generation"),
    S.Literal("orchestration"), S.Literal("evidence"), S.Literal("execution")),
  on: S.optional(S.Struct({          // event wiring for reactive nodes
    event: S.String,                 // glob pattern over bus types: "tool.call.*"
    filter: S.optional(S.String)     // JSON-path predicate over the event payload
  })),
  retries: S.optional(S.Struct({
    maxRetries: S.Number,            // default 2
    class: S.Union(S.Literal("exile"), S.Literal("retry"), S.Literal("fall"))
  })),
  timeoutMs: S.optional(S.Number),
  bracket: S.optional(S.Struct({     // REQUIRED on every generation node (else UNBRACKETED)
    contract: S.String,              // path to output.schema.json
    repair: S.optional(S.Struct({ target: S.String, max: S.Literal(2) })),
    confidenceFloor: S.optional(S.Number)   // default 0.55 (threshold register)
  })),
  oracle: S.optional(S.String)       // oracle registry key for math-family nodes
})
```

**Pseudocode — `validate` (the seven steps).**

```
function validate(doc):
  STEP 1  STRUCTURAL DECODE
    parseErrors = Schema.parseError of WorkflowDoc on doc
    if parseErrors: return formatAs<UNKNOWN-NODE|CHANNEL-UNSET by field>   // field-named
  STEP 2  REGISTRY CROSS-CHECK — unknown kinds
    for node of doc.nodes:
      if !NodeRegistry.has(node.type):
        emit { code: [JESL UNKNOWN-NODE], node: node.id, field: "type",
               expected: "one of registry kinds (F7/F10 catalog)",
               actual: node.type,
               remedy: "fix the typo or append the kind to the registry (append-only)" }
  STEP 3  EDGE LATTICE — dangling endpoints resolve to UNKNOWN-NODE
    ids = set(n.id for n in doc.nodes)
    for e of doc.edges:
      if e.from ∉ ids: emit UNKNOWN-NODE { field: "edges[from]", actual: e.from }
      if e.to   ∉ ids: emit UNKNOWN-NODE { field: "edges[to]",   actual: e.to }
  STEP 4  CYCLE DETECTION (Kahn)
    indeg = {}; adj = {}
    for e of doc.edges: adj[e.from].push(e.to); indeg[e.to] += 1
    queue = [n for n in doc.nodes if indeg[n.id] == 0]; order = []
    while queue: u = queue.shift(); order.push(u)
                 for v in adj[u.id]: if --indeg[v] == 0: queue.push(v)
    if order.length < doc.nodes.length:
      cycleNodes = doc.nodes where indeg > 0, in doc order
      emit { code: [JESL CYCLE], node: cycleNodes[0].id, field: "edges",
             expected: "acyclic channel graph",
             actual: "cycle through [" + cycleNodes.map(.id).join("→") + "]",
             remedy: "break the cycle with a gate, or re-arm via event-reactivate" }
  STEP 5  TIER DISCIPLINE
    for node of doc.nodes where Registry.family(node.type) == "generation":
      if doc.meta.tier == 1:
        emit { code: [JESL TIER-VIOLATION], node: node.id, field: "meta.tier",
               expected: "tier 2 (bracketed generation) or tier 1 with no generation nodes",
               actual: "tier 1 with generation node " + node.id,
               remedy: "raise meta.tier to 2 or replace the generator with a deterministic kind" }
      if node.bracket == null:
        emit { code: [JESL UNBRACKETED-GENERATION], node: node.id, field: "bracket",
               expected: "{contract, repair≤2, confidenceFloor}",
               actual: "absent",
               remedy: "declare bracket.contract (output schema) — generation is never unbracketed" }
      if node.bracket.repair.max > 2:
        emit TIER-VIOLATION { field: "bracket.repair.max", expected: "≤2", actual: …,
               remedy: "the repair bound is 2 — unbounded repair is the degenerate-done class" }
  STEP 6  ORACLE REGISTRY (math-family kinds: math-eval, oracle-discharge, oracle-gate math inputs)
    for node of mathFamily(doc.nodes):
      if node.oracle == null or !OracleRows.has(node.oracle):
        emit { code: [JESL ORACLE-MISSING], node: node.id, field: "oracle",
               expected: "a registered oracle row (source, line, quote, expr, mode)",
               actual: node.oracle ?? "absent",
               remedy: "compile oracle rows from the MPSE spec (mpse/oracle-compile.ts) first" }
  STEP 7  CAP HINTS (provide-time preview — the throw itself is runtime §3.5)
    for node of doc.nodes:
      for cap of Registry.requiredCaps(node.type):
        hint { code: [JESL CAP-UNBOUND], node: node.id, field: "caps",
               expected: "driver Layer providing " + cap, actual: "unknown at authoring",
               remedy: "run under a driver that binds the cap, or drop the node" }
  RETURN  diagnostics.isEmpty ? doc (frozen) : Left(diagnostics)
```

**ASCII data-flow.**

```
 raw JSON ──▶ Schema.decodeUnknown ──▶ WorkflowDoc ──▶ STEP2 registry ──▶ STEP3 edges
                                                                      │
   Left(JeslDiagnostic[]) ◀── formatDiagnostics ◀── any emission ◀─────┤ STEP4 Kahn cycle
                                                                      │ STEP5 tier/bracket
   frozen WorkflowDoc ◀── OK ──────────────────────────────────────────┘ STEP6 oracle
                                                                        STEP7 cap-hints
```

**Integration points.** Consumed by `drivers/cli.ts` (`validate` cmd), the
`spec-to-kernels` kernel (validating emitted docs), `packager/*` (targets
re-validate), `executor` (output gate reuse of GateSpec decode). Feeds
`core/errors.ts` (the 8 tokens) and `core/registry.ts` (kinds/families/caps).

**Test spec (F23, F28).**

```typescript
it.effect("bad-unknown-kind refuses with the frozen token", () =>
  Effect.gen(function* () {
    const raw = yield* readFixture("bad-unknown-kind.json")
    const res = yield* WorkflowCodec.decode(raw).pipe(Effect.either)
    expect(res._tag).toBe("Left")
    expect(res.left[0].code).toBe("[JESL UNKNOWN-NODE]")
    expect(res.left[0].remedy).toContain("registry")
  }))

it.effect("cycle names the first cycle node in doc order", () =>
  Effect.gen(function* () {
    const res = yield* WorkflowCodec.decode(yield* readFixture("bad-cycle.json"))
      .pipe(Effect.either)
    expect(res.left[0].code).toBe("[JESL CYCLE]")
    expect(res.left[0].actual).toContain("→")
  }))

it.effect("tier-1 doc with a prompt node is TIER-VIOLATION", () => …)
it.effect("prompt without bracket is UNBRACKETED-GENERATION", () => …)
it.effect("valid mech-gate fixture emits zero diagnostics", () =>
  Effect.gen(function* () {
    const doc = yield* WorkflowCodec.decode(yield* readFixture("mech-gate.json"))
    expect(doc.$schema).toBe("trident-workflow-v1")
  }))
// One fixture per token ×8 — the F28 cross-matrix is bidirectional-grepped at S6E.
```

**Failure modes.** Structural parse errors must still produce field-named
diagnostics (never a raw stack); registry lookup happens BEFORE cycle detection so
an unknown kind inside a cycle reports UNKNOWN-NODE first (the more actionable
token); the frozen-copy semantics (`Object.freeze` deep) prevent post-decode
mutation by any node — a mutated doc corrupts `covers()` replay identity.

---

## 3.2 `jesl/core/graph.ts` — the Graph service (F2)

**Purpose.** Pure doc→topology math: readiness sets (a node's inbound channel
set), cycle re-check (runtime defense-in-depth), topological feasibility, and
parallel-batch partitioning. `PURE` — every function wrapped in `Effect.sync`.

**Interface + pseudocode.**

```typescript
export class Graph extends Effect.Service<Graph>()("jesl/Graph", {
  succeed: {
    build(doc: WorkflowDoc): Effect<GraphIndex>,
  } }) {}

export interface GraphIndex {
  readySet(snapshot: ChannelSnapshot, state: RunState): ReadonlyArray<string>
  inboundOf(nodeId: string): ReadonlySet<string>          // channel names
  outboundOf(nodeId: string): ReadonlyArray<{ to: string; via: string }>
  entryNodes(): ReadonlyArray<string>                     // indeg 0 by channels
  parallelBatches(): ReadonlyArray<ReadonlyArray<string>> // Kahn levels
  terminalNodes(): ReadonlyArray<string>                  // outdeg 0
}
```

```
build(doc):
  inbound  = map(nodeId → set(edge.via for edges where to==nodeId))
  outbound = map(nodeId → [{to, via} for edges where from==nodeId])
  entry    = nodes with inbound.size == 0        // seeded by driver, else NO-SEED
  batches  = Kahn levels over the edge lattice:
               L0 = entry; L(k) = nodes whose every predecessor ∈ L(<k)
  terminal = nodes with outbound.size == 0

readySet(snapshot, state):
  for node of doc.nodes where node ∉ state.completed and node ∉ state.inFlight:
    if ∀ ch ∈ inbound[node.id]: snapshot.isWritten(ch) → include node.id
  return included (doc order preserved — determinism of the batch)
```

**ASCII data-flow.**

```
 WorkflowDoc ─▶ build ─▶ GraphIndex ─┬─▶ readySet(snapshot) ─▶ Executor batch
                                     ├─▶ entryNodes() ─▶ NO-SEED check
                                     ├─▶ parallelBatches() ─▶ TestLive diamond assert
                                     └─▶ terminalNodes() ─▶ output-gate wiring
```

**Thresholds.** None runtime — pure. The Kahn bound is O(V+E); for a 10K-node doc
this is <10ms under `Effect.sync`.
> BECAUSE: no constants here by design — the graph service must stay the pure
> substrate every threshold-bearing component composes over (K6 detector side).

**Test spec.**

```typescript
it.effect("diamond partitions into exactly 2 batches", () =>
  Effect.gen(function* () {
    const idx = yield* Graph.build(yield* readFixture("mech-gate.json"))
    expect(idx.parallelBatches().length).toBe(2)   // a→(b,c)→d
  }))
it.effect("entry nodes have empty inbound", () => …)
it.effect("readySet excludes in-flight and completed", () => …)
```

**Failure modes.** A self-edge (a→a via ch) is a 1-node cycle — STEP 4 catches it
at authoring; `readySet` never re-checks (performance) except the durable-run
resume path where the index is rebuilt and re-validated.

---

## 3.3 `jesl/core/bus.ts` — the EventBus service (F3)

**Purpose.** The ONE bus (three scanners, no fourth runtime). Glob patterns over
type (`tool.call.*`); handlers are Effects isolated in try/catch (the observer
law); a handler may write channels but NEVER mutates the event; detach on terminal.

**Interface.**

```typescript
export class EventBus extends Effect.Service<EventBus>()("jesl/EventBus", {
  succeed: {
    emit(type: string, payload: JsonValue): Effect<void>
    on(pattern: string, handler: (e: BusEvent) => Effect<void, never, Caps>):
      Effect<Fx.Unsubscribe, never, Scope>
  } }) {}

export interface BusEvent {
  readonly type: string                 // "tool.call.bash" | "pba.family.hit" | …
  readonly payload: Readonly<JsonValue> // frozen at emit
  readonly ts: number
  readonly run: string                  // runId correlation
}
```

**Pseudocode.**

```
emit(type, payload):
  event = freeze({ type, payload: deepFreeze(payload), ts: clock.now(), run: runId })
  journal row { kind: "bus.event", source: "bus/<type>" }        // the bus is journaled
  for sub of subscribers where globMatch(sub.pattern, type):     // "*" → ".*" (globToRegex)
    fork(sub.handler(event)) trapped:
      on defect → journal { kind: "bus.handler.error", node: sub.id,
                            evidence: { pattern: sub.pattern, state: "ISOLATED", anchor: rowId } }
      NEVER rethrow to the emitter (observer law); NEVER mutate event

on(pattern, handler):
  subscribe; return unsubscribe bound to the run Scope — scope close detaches all
```

**ASCII data-flow.**

```
 hooks bridge (F14) ─emit─▶ ┌───────────────┐
 scanners (F15)     ─emit─▶ │   EventBus    │─glob dispatch─▶ isolated handler fibers
 executor wake      ◀──────│  (journaled)  │                  │ write channels
                           └───────────────┘                  ▼ (second wake source)
                                                             Channels
```

**Thresholds.** Subscriber dispatch is unbounded per emit but handlers are fibers
under the run Scope (K9): one handler's failure never kills siblings.
> BECAUSE: bounding handler concurrency would serialize the PTA authorization
> stack behind the PBA scan; the observer law (isolation) is the safety mechanism,
> not a queue cap.

**Test spec.**

```typescript
it.effect("handler failure never kills the emitter", () =>
  Effect.gen(function* () {
    const events: BusEvent[] = []
    yield* EventBus.on("probe.*", () => Effect.die("boom"))
    yield* EventBus.on("probe.*", e => Effect.sync(() => events.push(e)))
    yield* EventBus.emit("probe.a", 1)
    expect(events.length).toBe(1)
  }))
it.effect("payload is frozen — mutation attempts throw in strict mode", () => …)
it.effect("glob tool.call.* matches tool.call.bash", () => …)
```

**Failure modes.** A handler that dies is journaled `bus.handler.error` and the
run proceeds — a dead observer must never masquerade as a node failure (K6). If a
handler needed to gate execution, it is a NODE (decision family), not a handler.

---

## 3.4 `jesl/core/channels.ts` — the Channels service (F4)

**Purpose.** Named channels written by `edge.via` (Ref/SubscriptionRef); the
readiness wake logic; the channel path resolution (`$.name` JSON-path walks,
optional-chained, `?? ''` defaults; `${ctx.x}` template resolution from ctx.json +
`--in`; unresolved = `[JESL CHANNEL-UNSET]` at that node, LOUD).

**Interface.**

```typescript
export class Channels extends Effect.Service<Channels>()("jesl/Channels", {
  succeed: {
    write(name: string, value: JsonValue): Effect<void>
    read(name: string): Effect<Option<JsonValue>>
    isWritten(name: string): Effect<boolean>
    snapshot(): Effect<ChannelSnapshot>
    awaitWritten(names: ReadonlySet<string>): Effect<void>   // SubscriptionRef wake
    resolve(path: string): Effect<JsonValue, JeslChannelUnset>
    seed(seeds: Record<string, JsonValue>): Effect<void>     // driver entry
  } }) {}

export interface ChannelSnapshot {
  isWritten(name: string): boolean
  get(name: string): Option<JsonValue>
}
```

**Pseudocode — `resolve`.**

```
resolve(path):
  if path startsWith "$.":                     // JSON-path walk over the merged frame
    frame = mergeLeft(channelsSnapshot, ctx.json, vars)      // channels win, then ctx, then vars
    cur: JsonValue = frame
    for seg of path.slice(2).split(".") while cur != null:
      cur = cur?.[seg]                                        // optional-chained
    if cur == null: cur = ""                                  // the ?? '' default
    return cur
  if path contains "${":                      // template: "${ctx.threshold} ≥ ${$.ratio}"
    replace each ${p} with string(resolve(p))
  // a bare channel name
  v = snapshot.get(path)
  if v.isNone(): throw JeslChannelUnset { node: currentNode, field: path,
      expected: "a written channel, ctx.json key, or var",
      actual: "unset", remedy: "seed it (--in / driver channel) or fix the edge.via name" }
  return v.get()
```

**ASCII data-flow.**

```
 driver seeds ─▶ ┌──────────────────────────┐
 node outputs ─▶ │   Channels (Ref + SubRef) │─snapshot─▶ Graph.readySet
 bus handlers ─▶ │  write → wake awaiters    │─resolve──▶ NodeInput.inbound (${} $.)
                 └──────────────────────────┘   unset ─▶ [JESL CHANNEL-UNSET] LOUD
```

**Thresholds.** None (pure state). Write-once per (run, name, writer): a second
write to the same channel by a DIFFERENT node is journaled and the readiness uses
first-write.
> BECAUSE: last-write-wins hides race bugs in parallel batches; first-write +
> journal makes the race visible in the evidence chain (K7).

**Test spec.**

```typescript
it.effect("unset channel at a node throws CHANNEL-UNSET naming node+field", () => …)
it.effect("$.x.y walks optional-chained with '' default", () =>
  Effect.gen(function* () {
    yield* Channels.seed({ x: {} })
    const v = yield* Channels.resolve("$.x.missing")
    expect(v).toBe("")
  }))
it.effect("${ctx.k} resolves from ctx.json merged under channels", () => …)
```

**Failure modes.** `awaitWritten` with an empty set returns immediately (a
terminal node with no inbound is entry-like — legal). The NO-SEED vs
CHANNEL-UNSET discrimination: if NO entry channel of the whole doc is written →
NO-SEED (launch problem); if some are written but a specific awaited channel never
fires → CHANNEL-UNSET at that node (graph problem).

---

## 3.5 `jesl/core/executor.ts` — the Executor service (F5)

**Purpose.** The readiness loop as Effect recursion — fire all-ready nodes as one
`Effect.forEach` batch (concurrency 15, stagger 1–3s); per-node `timeoutMs` +
retry class (429→exile-next-rung / 5xx→retry 2.5s / else→fall); the terminal
output-gate `Schema.decode`; verdict computed FROM journal rows, never prose.

**Interface.**

```typescript
export class Executor extends Effect.Service<Executor>()("jesl/Executor", {
  succeed: {
    execute(doc: WorkflowDoc, seeds: Seeds): Effect<RunVerdict, JeslError, Caps>
  } }) {}

export interface RunVerdict {
  readonly verdict: Verdict
  readonly rows: ReadonlyArray<JournalRow>      // THE verdict source (K7)
  readonly outputs: Record<string, JsonValue>
  readonly runId: string
}
```

**Pseudocode — the loop (C12).**

```
execute(doc, seeds):
  Effect.gen:
    ctx    = buildRunContext(doc, seeds)                 // frozen doc, budget, vars
    yield* Journal.openRun(runId, docHash, seed)
    yield* Channels.seed(seeds.channels)
    state  = { completed: {}, inFlight: {}, repairCount: map(default 0) }
    loop:                                                    // Effect recursion
      snapshot = yield* Channels.snapshot
      ready    = Graph.readySet(snapshot, state)
      if ready.isEmpty:
        if bus.pending() || deferred.pending():  yield* awaitWake ; continue
        if Graph.entryNodes(doc) all unwritten:  raise JeslNoSeed(entry[0])
        stuck = the awaited-but-unwritten inbound channel of an uncompleted node
        raise JeslChannelUnset(stuck)
      batch = ready.take(upTo = budget.maxNodesFiring)
      stagger each start by uniform(1s, 3s)                                    // threshold §2.11
      exits = yield* Effect.forEach(batch, n => invokeNode(n, ctx),
                                    { concurrency: budget.maxNodesFiring })
      { ok, die } = partition(exits)                       // JESL allSettled = partition
      for r of ok:
        state.completed[r.node] = r
        for { to, via } of Graph.outboundOf(r.node):
          yield* Channels.write(via, r.outputs[via] ?? r.outputs.default)
      for d of die:
        if d.retryClass == "exile":   reschedule(node, after = EXILE_MS 45000) ; continue
        if d.retryClass == "retry" && retriesUsed < 2:
          sleep(2500) ; re-invoke                                          // 5xx class
        if node is a gate with repair-target && repairCount[node] < 2:
          repairCount[node] += 1 ; route the repair edge (bounded ≤2) ; continue
        raise d                                                            // LOUD (K8)
      if all Graph.terminalNodes ∈ state.completed: break
    outputs = collect terminal outputs
    yield* OutputGate.decode(doc.gates, outputs)          // Schema.decode, ParseError→FAIL
    verdict = computeVerdictFromRows(yield* Journal.rows(runId))
    yield* Journal.closeRun(runId, verdict)
    return { verdict, rows, outputs, runId }
```

```
invokeNode(node, ctx):                                    // the Activity seam (E5)
  if ctx.doc.journal.durable:
    Activity.make("node:" + node.id):                     // journaled, replayable
      if (prior = yield* Journal.covers(docHash, seed, node.id)).isSome():
        return prior.get()                                // NEVER re-pay (S9)
      yield* Journal.append({ kind: "invoke", node, source: "workflow/"+name+"/"+node })
      r = yield* NodeImpl.invoke(input, ctx).timeout(node.timeoutMs ?? budget.deadlineMs)
      yield* Journal.append({ kind: "verdict", node, verdict: r.verdict, evidence: r.evidence })
      return r
  else:                                                   // ephemeral run — same rows, no Activity
    [same two appends around the invoke — the journal contract is identical]
```

`computeVerdictFromRows`: PASS iff every verdict row's `verdict ∈ {PASS}` and no
`bus.handler.error` rows touched a decision node; FAIL if any FAIL; INCONCLUSIVE
if any INCONCLUSIVE and none FAIL — INCONCLUSIVE is a fail-state for gate purposes
but is reported honestly, never coerced (K8).

**ASCII data-flow.**

```
        ┌──────────────────────────── Executor (readiness loop) ───────────────────────┐
        │                                                                              │
 seeds ─▶ Channels ─snapshot─▶ Graph.readySet ─batch(15)─▶ Effect.forEach ─┬─ ok ─▶ write via ─▶ wake
        │                                                                 │             (loop)
 bus ───▶ awaitWake ◀─────────────────────────────────────────────────────┤                          │
        │                                                                 ├─ exile ─▶ +45s reschedule  │
        │                                                                 ├─ retry ─▶ 2.5s ×≤2         │
        │                                                                 ├─ repair ─▶ edge ≤2          │
        │                                                                 └─ die ──▶ LOUD raise         │
        │                                                                              │
        │   every invoke: Journal pre-row + verdict row (sha256 chain) ─▶ covers() ─▶ replay │
        └──────────────────────────────────────────────────────────────────────────────┘
```

**Thresholds + BECAUSE** — concurrency 15, stagger 1–3s, retry 2.5s×2, EXILE
45000ms, repair ≤2: see §2.11 register. Node `timeoutMs` default = budget
deadline; per-node override must be < budget or validation warns (a node that can
outlive the run is a spec smell).

**Test spec.**

```typescript
it.effect("deterministic doc runs headless to verdict PASS (criterion 4)", () =>
  Effect.gen(function* () {
    const v = yield* Executor.execute(mechGateDoc, seeds).pipe(provide(TestLive))
    expect(v.verdict).toBe("PASS")
    expect(v.rows.filter(r => r.kind === "verdict").length).toBe(4)
  }))
it.effect("parallel-5 shows overlapCount ≥ 1 (criterion 7)", () =>
  Effect.gen(function* () {
    const v = yield* Executor.execute(parallel5Doc, seeds).pipe(
      provide(TestLive.pipe(TestClock)) )
    const overlap = overlapOf(v.rows)            // intervals intersecting pairwise
    expect(overlap).toBeGreaterThanOrEqual(1)
    expect(v.rows.filter(r => r.kind === "verdict").length).toBeGreaterThanOrEqual(5)
  }))
it.effect("cap-unbound raises with NO output artifact (criterion 6)", () =>
  Effect.gen(function* () {
    const res = yield* Executor.execute(needsLlmDoc, seeds).pipe(provide(EmptyLayer))
    // expect the Left; assert NO file, NO memory row implying success
    expect(res._tag).toBe("Left")
    expect(res.left.code).toBe("[JESL CAP-UNBOUND]")
  }))
it.effect("verdict comes from rows — mutating prose never flips it", () => …)
```

**Failure modes.** The empty-ready + no-pending state is ALWAYS a named raise
(NO-SEED or CHANNEL-UNSET) — never a hang (the wall-clock terminal detection
lesson: the quieted-window rule, loud over silent). A bus handler writing a
channel mid-batch re-arms the loop on the next iteration (no re-entrancy).

---

## 3.6 `jesl/core/journal.ts` — the Journal service (F6)

**Purpose.** Append-only JSONL, sha256-chained rows; `covers()` the replay gate
(same doc+seed → replay journaled outputs, never re-invoke an Activity);
serialization for resume (`kill -9` → restart from the last complete row);
crash-safe append (fd flush per row). One journal — PBA/PTA/JESL share it (K7,
no separate journals).

**Interface.**

```typescript
export class Journal extends Effect.Service<Journal>()("jesl/Journal", {
  succeed: {
    openRun(runId: string, docHash: string, seed: string): Effect<void>
    append(row: JournalRowDraft): Effect<JournalRow>
    rows(runId: string): Effect<ReadonlyArray<JournalRow>>
    covers(docHash: string, seed: string, nodeId: string):
      Effect<Option<NodeResult>>                       // replay gate (E5)
    closeRun(runId: string, verdict: Verdict): Effect<void>
    serializeForResume(runId: string): Effect<ResumeArtifact>
    verifyChain(runId: string): Effect<boolean>        // sha256 re-walk
  } }) {}

export interface ResumeArtifact {
  readonly runId: string
  readonly lastCompleteRow: JournalRow
  readonly completed: ReadonlyArray<string>            // node ids DONE
  readonly channels: Record<string, JsonValue>         // snapshot at last row
}
```

**Pseudocode.**

```
append(draft):
  row  = { ...draft, seq: nextSeq(runId), ts: clock.now(),
           prev: head(runId) ?? "genesis" }
  row.self = sha256(canonicalJson(row minus self) + NUL + row.prev)   // contentId pattern
  writeLine(fd(runId), JSON.stringify(row)); flush(fd)                // ONE write per row
  head(runId) = row.self
  return row

covers(docHash, seed, nodeId):
  runIdOf = sha256(docHash + NUL + seed).slice(0,16)
  rows(runIdOf).filter(r => r.node == nodeId && r.kind == "verdict").lastOption
  → Some(NodeResult reconstructed from the row) | None

serializeForResume(runId):
  read rows; drop any TRAILING row whose line lacks a terminating "\n"     // torn write
  return { lastCompleteRow, completed: nodes with verdict rows, channels snapshot }

crash-safe resume path (criterion 12):
  on openRun(runId) where file exists:
    artifact = serializeForResume(runId)
    executor resumes: completed nodes skipped (their channels re-seeded from artifact),
    the loop continues from the readiness over the re-seeded snapshot
```

**ASCII data-flow.**

```
 Executor invoke ─▶ append(invoke row) ─▶ [sha256 chain: prev→self] ─▶ flush ─▶ .jsonl
 Executor verdict ─▶ append(verdict row) ─┘                      │
                                                                   ├─ covers() ─▶ replay (invoke 0)
                                                                   ├─ verifyChain() ─▶ S1E chain test
 kill -9 ─▶ restart ─▶ openRun ─▶ lastCompleteRow ─▶ re-seed ─▶ loop resumes
```

**Threshold.** Flush per row (fsync-class flush on the fd).
> BECAUSE: batching flushes amortizes I/O but loses the tail on `kill -9`; the
> resume contract (criterion 12) requires every verdict row that the process
> acknowledged to survive. One row = one write = one recoverable unit.

**Test spec.**

```typescript
it.effect("chain verifies: recomputing self over rows matches", () =>
  Effect.gen(function* () {
    const rows = yield* Journal.rows(runId)
    expect(yield* Journal.verifyChain(runId)).toBe(true)
    expect(rows[0].prev).toBe("genesis")
  }))
it.effect("covers() returns the journaled verdict and executor re-invokes 0 times (S9)",
  () => Effect.gen(function* () {
    counter = 0; TestLive with ScriptedToolkit counting invokes
    yield* Executor.execute(doc, seeds)            // first run — counter = n
    yield* Executor.execute(doc, seeds)            // replay
    expect(counter).toBe(0)                        // criterion 15
    expect(yield* Journal.verifyChain(runId)).toBe(true)   // byte-determinism (criterion 5)
  }))
it.effect("torn tail row is dropped on resume", () => …)     // write half a line, reopen
```

**Failure modes.** A corrupted mid-file line fails `verifyChain` loudly — the run
refuses replay rather than trusting a broken chain (loud-fail). Two runs of the
same doc+seed append to the SAME runId file only via `covers()`-mediated resume;
a divergent re-run (different doc bytes) yields a different docHash → different
runId → separate file.

---

## 3.7 `jesl/core/registry.ts` — the NodeRegistry service (F7)

**Purpose.** `Map<kind, NodeImpl>`, append-only; each entry declares
family/class/requiredCaps/input-output channel contract; kinds never renamed or
removed (K13).

```typescript
export class NodeRegistry extends Effect.Service<NodeRegistry>()("jesl/NodeRegistry", {
  succeed: {
    register(impl: NodeImpl): Effect<void>     // idempotent for identical shape
    get(kind: string): Effect<Option<NodeImpl>>
    kinds(): ReadonlySet<string>
    contract(kind: string): NodeContract
  } }) {}

export interface NodeContract {
  readonly kind: string
  readonly family: NodeFamily
  readonly requiredCaps: ReadonlyArray<Context.Tag<any, any>>
  readonly input: ReadonlyArray<string>        // awaited channel names (or "event")
  readonly output: ReadonlyArray<string>       // written channel names
}

// Freeze semantics:
//   register(existing kind, identical contract)  → no-op (idempotent re-import)
//   register(existing kind, DIFFERENT contract)  → throw RegistryFrozenError
//   there is no unregister. A rename = a NEW kind (K13/D7).
```

**ASCII data-flow.**

```
 nodes/* (35 impls) ─register─▶ NodeRegistry ─contract─▶ schema STEP2/5/6/7
                                            └─get(kind)─▶ Executor.invokeNode
 append-only: v1 doc kinds NEVER leave → a v1 doc runs on later registries forever
```

**Test spec.**

```typescript
it.effect("re-registering a kind with a different contract throws RegistryFrozenError", () => …)
it.effect("registry contains the R7 union (deterministic + ms + paragon + execution + generation)", () =>
  Effect.gen(function* () {
    const k = yield* NodeRegistry.kinds()
    for (const kind of ["event-filter","capture-engine","machine","gate","oracle-gate",
      "circuit-breaker","state-machine","journal-sink","triplet-writer","sqlite-sink",
      "replay-source","pipeline","parallel","retry-chain","fallback-chain","pause",
      "cron-trigger","event-reactivate","ratio-classifier","synapse","intent-classifier",
      "escalation-memory","evidence-gate","layer-loader","pba-bridge","chain-tracker",
      "warhead-dispatcher","compliance-collector","math-eval","oracle-discharge",
      "claim-gate","config-lock","workflow-machine","mpse-discharge","evidence-machine",
      "audit-registry","shell-exec","python-exec","http-request","file-io","prompt",
      "subagent-dispatch","shadow-agent"]) expect(k.has(kind)).toBe(true)
  }))
```

**Failure modes.** Registry mutation after first executor tick is forbidden —
`register` closes when a run opens (a moving registry breaks `covers()` identity).

---

## 3.8 `jesl/core/caps.ts` — the capability interfaces (F8)

**Purpose.** The seven caps the drivers bind; the `R` union. Unbound = the driver
never provided the Layer → `[JESL CAP-UNBOUND]` at the first requiring node.

```typescript
export class ShellCap extends Context.Tag("jesl/ShellCap")<ShellCap, {
  exec(cmd: string, opts: { timeoutMs: number; maxOutputBytes: number }):
    Effect<ShellResult, ShellError>                  // maxOutput MANDATORY (RAM-bomb guard)
}>() {}
export class LlmCap extends Context.Tag("jesl/LlmCap")<LlmCap, {
  callModel(req: { system: string; prompt: string; maxTokens: number;
                   thinking?: { budgetTokens: number } }):     // EXPLICIT, never defaulted
    Effect<LlmResponse, LlmError>                   // transport: 429→exile 5xx→retry else→fall
}>() {}
export class ToolCap extends Context.Tag("jesl/ToolCap")<ToolCap, {
  invoke(tool: string, args: JsonValue, causationId: string):
    Effect<ToolResult, ToolError>                   // the authorization stack rides (K5)
}>() {}
export class SubagentCap extends Context.Tag("jesl/SubagentCap")<SubagentCap, {
  dispatch(promptFile: string): Effect<SubagentReturn, SubagentError>  // SPEC-FILE ONLY
}>() {}
export class HttpCap extends Context.Tag("jesl/HttpCap")<HttpCap, {
  request(r: HttpRequest): Effect<HttpResponse, HttpError>            // timeout + retry class
}>() {}
export class FsCap extends Context.Tag("jesl/FsCap")<FsCap, {
  read(p: string): Effect<string, FsError>
  write(p: string, body: string): Effect<void, FsError>   // write-scope: realpath+resolve+startsWith(root+sep)
}>() {}
export class EmitCap extends Context.Tag("jesl/EmitCap")<EmitCap, {
  emit(type: string, payload: JsonValue): Effect<void>   // routes to the bus
}>() {}

export type Caps = ShellCap | LlmCap | ToolCap | SubagentCap | HttpCap | FsCap | EmitCap
```

**ASCII data-flow.**

```
             ┌── CliLive:        Shell + Fs + Http + Journal.file ──────────────┐
Caps (R) ◀───┤── OpenCodeLive:  CliLive + ToolClient + Subagent + Llm + Hooks.bus
             └── TestLive:      ScriptedToolkit + MemoryFs + TestClock (+InMemoryJournal)

 NodeImpl.requiredCaps ⊂ provided Context ── else ──▶ [JESL CAP-UNBOUND] (no artifact)
```

**Test spec.**

```typescript
it.effect("layerinfo lists Journal/Fs/Shell under CliLive (criterion 16)", () => …)
it.effect("missing LlmCap on a prompt node raises CAP-UNBOUND naming llm", () => …)
```

**Failure modes.** Caps are never optional bags (DD3) — an "optional callback"
shape is rejected at review; the type system IS the requirement proof.

---

## 3.9 `jesl/core/errors.ts` — the TaggedError family (F9)

**Purpose.** One `Schema.TaggedError` per frozen token; every throw structured
`{code, node, field, expected, actual, remedy}`; the `code` field PRINTS the exact
`[JESL ...]` string so existing fixtures keep passing (D15/K3).

```typescript
const JeslErrorFields = {
  code: S.String, node: S.String, field: S.String,
  expected: S.String, actual: S.String, remedy: S.String
}

export class JeslUnknownNode extends Schema.TaggedError<JeslUnknownNode>()(
  "JeslUnknownNode", { ...JeslErrorFields,
    code: S.Literal("[JESL UNKNOWN-NODE]") }) {}
export class JeslCycle extends Schema.TaggedError<JeslCycle>()(
  "JeslCycle", { ...JeslErrorFields, code: S.Literal("[JESL CYCLE]") }) {}
export class JeslTierViolation extends Schema.TaggedError<JeslTierViolation>()(
  "JeslTierViolation", { ...JeslErrorFields, code: S.Literal("[JESL TIER-VIOLATION]") }) {}
export class JeslUnbracketedGeneration
  extends Schema.TaggedError<JeslUnbracketedGeneration>()(
    "JeslUnbracketedGeneration", { ...JeslErrorFields,
      code: S.Literal("[JESL UNBRACKETED-GENERATION]") }) {}
export class JeslCapUnbound extends Schema.TaggedError<JeslCapUnbound>()(
  "JeslCapUnbound", { ...JeslErrorFields, code: S.Literal("[JESL CAP-UNBOUND]") }) {}
export class JeslOracleMissing extends Schema.TaggedError<JeslOracleMissing>()(
  "JeslOracleMissing", { ...JeslErrorFields, code: S.Literal("[JESL ORACLE-MISSING]") }) {}
export class JeslChannelUnset extends Schema.TaggedError<JeslChannelUnset>()(
  "JeslChannelUnset", { ...JeslErrorFields, code: S.Literal("[JESL CHANNEL-UNSET]") }) {}
export class JeslNoSeed extends Schema.TaggedError<JeslNoSeed>()(
  "JeslNoSeed", { ...JeslErrorFields, code: S.Literal("[JESL NO-SEED]") }) {}

export type JeslError = JeslUnknownNode | JeslCycle | JeslTierViolation
  | JeslUnbracketedGeneration | JeslCapUnbound | JeslOracleMissing
  | JeslChannelUnset | JeslNoSeed
```

**Test spec (the S1E gate).**

```typescript
it.effect("every fixture token round-trips byte-exact", () =>
  Effect.gen(function* () {
    for (const f of F28_FIXTURES) {          // 8 fixtures ↔ 8 tokens, bidirectional
      const err = yield* expectFailure(yield* readFixture(f.path))
      expect(err.code).toBe(f.token)         // e.g. "[JESL NO-SEED]" — byte-exact
    }
  }))
```

**Failure modes.** None permitted — the family is closed over the 8 tokens; a
ninth token requires a registry-append-grade decision (a spec revision), never a
runtime string.

---

## 3.10 `jesl/nodes/` — The Deterministic Set (F10, 18 kinds)

All return `Effect<NodeResult, JeslError, never>` — `requiredCaps: []`. One file
per kind (shared `nodes/shared.ts` for triplet emission helpers). Group spec:
kind · contract (in/out channels) · algorithm · failure state.

### 3.10.1 `event-filter`
Contract: `on.event` glob + `on.filter` JSON-path predicate; out channel `matched`.
```
invoke: await one bus event matching glob; evaluate filter predicate over payload
  (pure JSON-path, no eval — K17: no JS eval embedded, predicates are data)
  verdict: PASS on match-and-pass, READY_FALSE on match-and-fail (the negative leg —
  a filter that only fires positively cannot implement the over-firing-gate guard)
```
Failure: none thrown — filters are detectors (K6); they never decide.

### 3.10.2 `capture-engine`
50ms tick / 60-char max-delta / finalOn flush; `groupBy sessionID` per-key state;
`onBatch` fire-and-forget. The TEB v2 correction wiring: opencode 1.14.51 emits
`message.part.updated` with the part at `event.properties.part`
(types.gen.d.ts:744) — NOT `message.updated/info.parts`.
> BECAUSE 50ms/60chars: §2.11 register (capture-engine row).

### 3.10.3 `machine`
A registered T.E.B actor (filter/reader/engine/machine/mutation/evidence — the
6-part anatomy); `failState: INCONCLUSIVE`; `on:` event-driven transitions.
```
invoke(event): s' = machine.step(state, event)   // pure step, order-load-bearing
  if s' ∈ acceptStates → verdict PASS, outputs = mutation(s')
  if s' == failState  → verdict INCONCLUSIVE (fail-closed, never PASS)
```

### 3.10.4 `gate`
Declarative asserts over resolved channels (`eq|ge|le|ne|contains|matches`); LOUD
(`JeslGateFail` structured row → verdict FAIL) or `repair-target` edge routing
(bounded ≤2 at the executor). Free-text expected values are REJECTED at authoring
(the oracle-gate row grammar is the only expectation syntax — R4 discipline).

### 3.10.5 `oracle-gate`
Rows `|OR-n|scope|O1/O2/O3|eq|ge|le|ne|contains|matches(...)|command|`; free-text
expected REJECTED. Evaluation delegates to `oracle-discharge` (§3.12.2) for math
rows; `command` rows execute via ShellCap under the run scope (cap-bound despite
living in the deterministic set — its requiredCaps: [ShellCap] is the documented
exception; the family field stays "deterministic" for scheduling but the contract
declares the cap so STEP 7 hints correctly).

### 3.10.6 `circuit-breaker`
3 consecutive failures → OPEN; half-open after a quiet window.
> BECAUSE 3: two consecutive failures is the observed transient class (one 5xx +
  one retry-exhausted); the third consecutive is a pattern, not noise.

### 3.10.7 `state-machine`
The 8-transition paragon lattice wrapped pure (V1 `step()` — order-load-bearing,
rearm-first, OFF kill-switch, escalation skip-tier at count≥2 consuming
ms-escalation-memory as the SOLE table — G3/DD19).

### 3.10.8 `journal-sink` — MANDATORY in every doc that journals external evidence;
writes triplets to the run journal with the source discriminator.

### 3.10.9 `triplet-writer`
`{Pattern, State, Evidence:file:line}`; an anchorless finding is DELETED (never
emitted) — the no-triplet-no-finding law.
```
invoke: for f of findings: if f.anchor == null → drop + journal drop-row
        else emit triplet row via Journal + EmitCap("triplet.written", f)
```

### 3.10.10 `sqlite-sink` — WAL + busy_timeout 5000 + IMMEDIATE (§2.11).

### 3.10.11 `replay-source` — covers()-check-then-rerun: if the journal covers the
upstream node, emit the journaled outputs; else mark the run live. This is the G13
contract encoded: tier-2 replay returns the journaled generation.

### 3.10.12 `pipeline` — module-level `PipelineRunContext` + reset between docs.

### 3.10.13 `parallel` — allSettled bounded 15 stagger; per-item Exit; partition
(K9/E6). Children attach to the run Scope.

### 3.10.14 `retry-chain` — the 429 exile class as a first-class edge: retryable
subgraphs re-enter after EXILE_MS at the next rung.

### 3.10.15 `fallback-chain` — SAME-ARTIFACT-ONLY (the fallback test: the fallback
must produce what the primary would produce, differing only in quality — else it
is FALSE SUCCESS and BANNED, K8).

### 3.10.16 `pause` — journal-persisted (the in-memory pause loss class): the pause
state IS a journal row; resume reads it.

### 3.10.17 `cron-trigger` — 10min/75s adaptive (the wave-cron cadence).
> BECAUSE 10min/75s: the proven v4.4.2 cron rhythm — 10min base scan, 75s fast
> poll while a wave is live; shorter base polls burn the RPM ledger for nothing.

### 3.10.18 `event-reactivate` — the dormant-node wake: re-arms a completed node
on a bus pattern (the legal "cycle" — a DAG with re-arming leaves).

**Group test spec.**

```typescript
it.effect("gate LOUD-fails with a structured row, never prose", () => …)
it.effect("circuit opens on 3 consecutive, half-opens after quiet", () => …)
it.effect("triplet-writer deletes anchorless findings", () =>
  Effect.gen(function* () {
    const rows = yield* runNode("triplet-writer", { findings: [{p:"x",s:"y",anchor:null}] })
    expect(rows.some(r => r.kind === "verdict" && r.verdict === "PASS")).toBe(true)
    expect(capturedEmits).toHaveLength(0)      // nothing emitted — anchorless deleted
  }))
```

---

## 3.11 `jesl/nodes/` — The ms-\* Survivors (9 wrappers over pure cores)

Each is a thin NodeImpl wrapper: the PURE core (Paragon_Microstructures, 143/0
property-pinned) stays untouched; the wrapper does Effect accumulation + journal +
channel writes at the seam (D11/P3-6 — wrap, never rewrite).

| Kind | Core contract (from R9/C2) | Wrapper's Effect role |
|---|---|---|
| `ratio-classifier` | 4-bank scoreSignals; conf=pos/(pos+neg+1); bands ENFORCE≥0.5 / DAMPEN≥0.3; FI-1 batchScan weight conf\*2 | read channel text → call pure scorer → write `family.score` + triplet |
| `synapse` | FamilyNeuron λ·e^(−0.05·Δseq)+w, refractory 25, lastFireSeq=−1e9; V2Synapse per-family; snapshot/restore; boostBaseline | seq from journal tail; snapshot/restore to channels (the pre-arm write path) |
| `intent-classifier` | fusion s1\*0.5+s2\*0.3+s2… (0.5/0.3/0.2); chainConfidence 0.8/0; PBA boost cap 1.0; BLOCK≥threshold→tier3, ADVISE≥0.6×threshold→tier2, ALLOW; IMPORTS ms-ratio (G4 de-dup) | fuse three channels → surface channel |
| `escalation-memory` | deadline 5/2/0; skipTier 0/2/3; genuine−−/minimum-same — the SOLE table | journal-backed count state |
| `evidence-gate` | SHA-256 signature (timestamp+type INCLUDED — DD18 canonical); 5-criteria on matchingFresh only; PASS 5/5, INCONCLUSIVE≥3, FAIL else; freshness 300s; genuine = artifact\|results.json\|PASS\|len>50 | collects ToolEvidenceRecords from channels |
| `layer-loader` | globToRegex \*→.\*; validateLayerJson named throws; compile banks/argPatterns anchored; the JSON layer format IS a JESL doc family | loads profile layers into the PTA registry |
| `pba-bridge` | ring 20; correlateEscalation floor 0/0/1/2/2 → max(pta,floor); getLayersToPrearm | subscribes `pba.family.hit`, pre-arms |
| `chain-tracker` | HISTORY_CAP 100 / OUTPUT_CAP 500; detectLoop ≥3-same AND ≤1-unique-completed; wasCalled withinMs 0=session | tracks tool-call channel |
| `warhead-dispatcher` | REQUIRED_SECTIONS 6; FILL_FIELDS 9; TIER_TO_SURFACE 1/2→TEA append, 3→TEB throw StructuredEnforcementError, 4→GATE `[PTA GATE]` inject | the delivery seam |
| `compliance-collector` | POOL_TTL 600\_000 = 2× gate; signed records; THE canonical sig (DD18) | pools records for the gate |

(Deliberate count: the table lists the nine survivor kinds plus
compliance-collector per C2's enumeration; the wrapper file set is 10 files, one
per row, under `nodes/ms/`.)

**ASCII data-flow (the survivor chain — S10's end-to-end).**

```
 reasoning stream ─▶ ratio-classifier ─score─▶ synapse ─λ decay─▶ pba-bridge
                                                                    │ pre-arm
                    layer-loader ◀─ boostBaseline ◀─────────────────┘
                        │ layers
                        ▼
                   intent-classifier ─fusion─▶ warhead-dispatcher ─tier─▶ TEA/TEB/GATE
                        ▲                            │
                   chain-tracker ──loop detect───────┘
                        └─ evidence-gate ◀─ compliance-collector (pooled, signed)
```

**Test spec.**

```typescript
it.effect("fusion numbers re-pin after the G4 import (0.615/0.575)", () =>
  Effect.gen(function* () {
    const r = yield* runNode("intent-classifier", fusionFixture)
    expect(r.outputs.score).toBeCloseTo(0.615, 3)   // the pinned pre-de-dup values
  }))                                                 // (0.575 on the second fixture)
it.effect("sig reconciliation: one record, identical hash through both surfaces (G2)", () =>
  Effect.gen(function* () {
    const rec = complianceFixtureRecord()
    expect(sigCollector(rec)).toBe(sigGates(rec))   // DD18 — gates' shape canonical
  }))
it.effect("escalation tables agree across the full count domain (G3)", () =>
  Effect.gen(function* () {
    for (let count = 0; count <= 10; count++)
      expect(stateMachineDeadline(count)).toBe(escalationMemory.computeDeadline(count))
  }))
```

---

## 3.12 `jesl/nodes/` — The Paragon Machines (8)

### 3.12.1 `math-eval`
The 24-kind total evaluator wrapped (expr.ts:18-40 grammar; eval.ts:48-211): depth
256, domain 10K, 6 failure codes (`UNBOUND_SYMBOL`, `TYPE_MISMATCH`,
`DIV_BY_ZERO`, `DOMAIN_UNBOUNDED`, `TEMPORAL_NOT_EVALUABLE`, `DEPTH_EXCEEDED`),
strict and/or, temporal → `TemporalEscalationError` via `evalExprStrict`.
```
invoke: expr = oracleRows[seedling.node.oracle].expr
        env  = bindings from inbound channels (extractBindings domain-proofed)
        v    = evalTotal(expr, env, { maxDepth: 256, domainCap: 10_000 })
        on TemporalEscalationError → verdict INCONCLUSIVE + triplet{state:"ESCALATE

## 4. EXTENDED COMPONENT DESIGN (the K-series + drivers, scanners, workflow, bridge, kernels, packager)

> Disambiguation: §3 (3.1–3.12) is the canonical per-file core-service design (schema→errors + the node sets). This section extends the surface — the K-named expansions of the core contracts (4.1–4.9, complementary depth to §3, not a replacement), then the drivers, scanners, Workflow wrapper, the MPSE bridge, the lifecycle kernels, the packager, and the profiles/bindings. Where §3 and §4 describe the same file, §3 is the contract of record; §4 carries the expansion detail.

### 4.0 Component Inventory and the Peer Interaction Contract

#### 4.0.1 Component Inventory Table

| ID | Component | Path | Wave | Class | Caps required |
|----|-----------|------|------|-------|---------------|
| K-Schema | WorkflowCodec | jesl/core/schema.ts (F1) | S1E | service | none |
| K-Graph | Graph | jesl/core/graph.ts (F2) | S1E | service | none |
| K-Bus | EventBus | jesl/core/bus.ts (F3) | S1E | service | none |
| K-Chan | Channels | jesl/core/channels.ts (F4) | S1E | service | none |
| K-Exec | Executor | jesl/core/executor.ts (F5) | S1E | service | none |
| K-Jrn | Journal | jesl/core/journal.ts (F6) | S1E | service | FileSystem |
| K-Reg | NodeRegistry | jesl/core/registry.ts (F7) | S1E | service | none |
| K-Caps | Capability interfaces | jesl/core/caps.ts (F8) | S1E | contracts | none |
| K-Err | TaggedError family | jesl/core/errors.ts (F9) | S1E | contracts | none |
| N-DET | Deterministic node set | jesl/nodes/*.ts (F10) | S1E | nodes | none |
| N-EVM | evidence-machine | jesl/nodes/evidence-machine.ts (F11) | S1E | node | none |
| N-MS | ms-* survivor wrappers | jesl/nodes/ms-*.ts (F10) | S1E | nodes | none |
| N-PAR | paragon machine nodes | jesl/nodes/*.ts (F10) | S1E | nodes | none |
| N-EXE | execution node set | jesl/nodes/{shell-exec,python-exec,http-request,file-io}.ts (F13) | S2E | nodes | shell/python/http/fs |
| N-GEN | generation node set | jesl/nodes/{prompt,subagent-dispatch,shadow-agent}.ts (F10/F16) | S1E/S4E | nodes | llm/subagent |
| D-CLI | CliLive driver + `jesl` bin | jesl/drivers/cli.ts + jesl/cli/ (F12) | S2E | driver | binds all |
| D-OC | OpenCodeLive driver | jesl/drivers/opencode.ts (F14) | S3E | driver | binds all |
| D-SDK | sdk entry | jesl/drivers/sdk.ts (C3) | S2E | driver | caller |
| S-BEH | BehaviorEngine (PBA) | jesl/scanners/behavior-engine.ts (F15) | S3E | scanner | llm? no — none |
| S-TOOL | ToolEngine (PTA) | jesl/scanners/tool-engine.ts (F15) | S3E | scanner | none |
| S-BRG | PbaBridge | jesl/scanners/pba-bridge.ts (F15) | S3E | scanner | none |
| S-ELSP | EffectLsp | jesl/scanners/effect-lsp.ts (F15) | S3E/S8L | scanner | shell |
| S-LLSP | LogicLsp | jesl/scanners/logic-lsp.ts (F15) | S3E | scanner | fs |
| W-RUN | JeslRun Workflow wrapper | jesl/workflow/jesl-run.ts (F17) | S4E | durable | per-node |
| M-BRG | MPSE bridge | jesl/mpse/*.ts (F18) | P2 | compiler | fs |
| KERN-6 | six lifecycle kernels | jesl/kernels/{...}/ (F19) | P3 | kernels | mixed |
| PKG | packager emitters | jesl/packager/{tool,chain,skill}.ts (F20) | S5E | emitters | fs |
| PROF | profile modules | jesl/profiles/{trident,trading,sales}.ts (F21) | P4 | data | none |
| BIND | opencode binding pack | jesl/bindings/opencode/ (F22) | P4 | binding | host |
| BAT | battery | jesl/test/ (F23) | S6E/P5 | tests | TestLive |

#### 4.0.2 Component × Component Peer Interaction Table (contract C6)

Rows emit/read; columns are the counterpart. `W` = writes to, `R` = reads from, `I` = invokes, `S` = subscribes. Blank = no direct interaction.

| ↓ emitter / receiver → | Schema | Graph | Bus | Chan | Exec | Jrn | Reg | Caps | Err | Nodes | Drivers | Scanners | MPSE | Kernels | Pkg |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Schema** | — | W doc | | | | | R kinds | | W tokens | | R (validate cmd) | | W workflow.json | R docs | R doc |
| **Graph** | R decoded | — | | W ready-sets | R sets | | | | W CYCLE | | | | R coverage | R | |
| **Bus** | | | — | W wake | S ready | W events | | | | W emit-cap | R hook events | W pba.family.hit | | R | |
| **Chan** | | | R writes | — | R readiness | | | | W CHANNEL-UNSET | R via edges | W seeds | | | W seeds | |
| **Exec** | R output-gate | R batches | I emit | R wait | — | W rows | I invoke | R context | I throw | | | | | I kernels | |
| **Jrn** | | | | | R rows verdict | — | | Fs cap | | R source disc | R resume | R rows | R provenance | R chain | R evidence |
| **Reg** | R kind list | | | | I lookup | | — | W cap-req | W UNKNOWN-NODE | | | | | | |
| **Caps** | | | | | R provide | Fs | R contracts | — | W CAP-UNBOUND | I world | bind | bind | | bind | |
| **Nodes** | R envelope | | I emit | R/W paths | I return | W rows | R self | I caps | I throw | — | | | | | |
| **Drivers** | I validate | | I bridge | I seed | I run | I file/inmem | I boot | bind | I surface | I provide | — | I mount | I feed | I launch | I emit-target |
| **Scanners** | | | I emit/S | | | W rows | R layers | | I deny | | I hooks | — | | | |
| **MPSE** | W doc | W graph | | | | W stubs | W kinds | | W tokens | | | | — | W kernels | I skill.ts |
| **Kernels** | R own doc | | S | R seeds | I run | I chain | R | I provide | R | | I launch | | R specs | — | R payload |
| **Pkg** | I re-validate | | | | | R rows | R kinds | | | | | | I workflow | R kernel | — |

Reading rule: the Executor is the only component that invokes NodeImpls; the Journal is the only component that writes evidence rows; the Bus is the only component that carries inter-scanner traffic (no fourth runtime). Every arrow above is enforced by the import graph — `verifyImportGraph` (Paragon Law18 pattern, K2) fails CI if, for example, `nodes/*` imports `drivers/*`.

#### 4.0.3 The One-Trace Diagram (component C12 flow)

```
            seed (--in / argv / hook / cron)
              |
              v
      +---------------+     Schema.decodeUnknown      +----------------+
      |  seed source  | ----------------------------> |  K-Schema      |
      | (CLI/OC/cron) |                               |  WorkflowCodec |
      +---------------+                               +-------+--------+
              |                                              | Effect<WorkflowDoc, JeslError>
              | writes input channel + vars                 v
              v                                     +------------------+
      +---------------+   ready-sets/cycles         |  K-Graph         |
      |  K-Chan       | <-------------------------- |  (pure)          |
      |  Channels     | ------------------------->  +------------------+
      +-------+-------+     readiness query                |
              ^                                             | batches
              | channel writes                             v
              |                                   +------------------+
      +-------+---------+   invoke (forEach 15)   |  K-Exec          |
      |  N-*  NodeImpl   | <--------------------- |  Executor        |
      |  Effect<NodeResult,JeslError,Caps>        +---+----------+---+
      +---+----+----+---+                                 |          |
          |    |    |  pre-invoke + verdict rows           |          | output-gate
          |    |    v                                     v          v
          |    |  +----------+  sha256 chain  +----------------+  +-----------+
          |    |  | K-Jrn    |<--covers()---- |  replay/resume |  | verdict   |
          |    |  | Journal  |--------------- |  path          |  | FROM rows |
          |    |  +----------+                 +----------------+  +-----------+
          |    |
          |    +-- bus.emit(node.<id>.verdict, ...) --> +----------+
          |                                             | K-Bus    | --> scanner services
          +-- channel write via edge.via -------------> | handlers | --> wake second wave
                                                        +----------+
```

---

### 4.1 K-Schema — `jesl/core/schema.ts` (F1)

The WorkflowCodec service. Authoring-time validation is the ONLY place where malformed documents are rejected; after decode, the executor trusts the doc (law 1E schema-gate). Every diagnostic is a string-stable `[JESL ...]` token with field + remedy, formatted compiler-style after the `wave-spec.ts:200` pattern (the formatDiagnostics contract).

#### 4.1.1 Interface

```typescript
// jesl/core/schema.ts
import { Schema } from "effect"
import type { WorkflowDoc, NodeEnvelope, EdgeDecl } from "./doc.types"
import { Context, Effect, Data } from "effect"

export class WorkflowCodec extends Context.Tag("WorkflowCodec")<WorkflowCodec, {
  /** Decode + FULL cross-validation. Never returns a half-valid doc. */
  readonly decodeUnknown: (
    input: unknown
  ) => Effect.Effect<WorkflowDoc, JeslValidationError, never>

  /** The compiler-style diagnostic formatter. One line per error. */
  readonly formatDiagnostics: (errors: JeslValidationError[]) => string[]

  /** The document fingerprint: sha256(canonical(doc)) — the idempotencyKey half. */
  readonly docHash: (doc: WorkflowDoc) => string
}>() {}

/** One structured validation failure. code PRINTS the frozen token (K3). */
export class JeslValidationError extends Data.TaggedError("JeslValidationError")<{
  readonly code: JeslErrorCode        // union of the 8 frozen tokens
  readonly node?: string              // node id when locatable
  readonly field: string              // JSON path of the offending field
  readonly expected: string
  readonly actual: string
  readonly remedy: string
}> {}

export type JeslErrorCode =
  | "[JESL UNKNOWN-NODE]"
  | "[JESL CYCLE]"
  | "[JESL TIER-VIOLATION]"
  | "[JESL UNBRACKETED-GENERATION]"
  | "[JESL CAP-UNBOUND]"
  | "[JESL ORACLE-MISSING]"
  | "[JESL CHANNEL-UNSET]"
  | "[JESL NO-SEED]"
```

#### 4.1.2 `### WorkflowCodec.decodeUnknown — method pseudocode`

```
METHOD decodeUnknown(input: unknown) -> Effect<WorkflowDoc, JeslValidationError>

STEP 1 — STRUCTURAL DECODE (Effect Schema, replaces zod per K16/D15)
  1.1  decoded = Schema.decodeUnknown(WorkflowDocSchema)(input)
  1.2  on ParseError ->
         map each issue to JeslValidationError {
           code:    derived: unknown "nodes[i].type" value -> "[JESL UNKNOWN-NODE]"
                    else structural -> the schema's own message path
           field:   issue.path.join(".")
           expected: issue.message.expected
           actual:   issue.message.actual
           remedy:  "fix the field or bump $schema to a registry that carries the kind"
         }
         FAIL with the FIRST mapped error; accumulate the rest into
         errors[] so formatDiagnostics can print all (never single-error myopia)

STEP 2 — REGISTRY CROSS-CHECK (unknown kinds)
  2.1  for each node in decoded.nodes:
         if registry.has(node.type) == false:
           push { code:"[JESL UNKNOWN-NODE]", node:node.id,
                  field:"nodes["+i+"].type", expected:"a registered kind",
                  actual:node.type,
                  remedy:"append the kind to the registry (K13 append-only) or fix the typo" }

STEP 3 — EDGE INTEGRITY
  3.1  build nodeId set; for each edge: dangling from/to ->
         push UNKNOWN-NODE variant with field:"edges["+i+"].from|to" (the node never exists)
  3.2  cycle check via K-Graph.detectCycles (Kahn residual) ->
         push { code:"[JESL CYCLE]", node:<first residual id>,
                field:"edges", expected:"acyclic channel graph",
                actual:"cycle through "+residual.join(" -> "),
                remedy:"break the loop with a gate or a journal-sink terminator" }

STEP 4 — TIER DISCIPLINE (K6/D23)
  4.1  tier = decoded.meta.tier  // 1 | 2 | 3 declared determinism class
  4.2  if tier == 1:
         for each node with family == "generation" (prompt/subagent-dispatch/shadow-agent):
           push { code:"[JESL TIER-VIOLATION]", node:node.id,
                  field:"meta.tier", expected:"tier 1 forbids generative nodes",
                  actual:"generation kind '"+node.type+"' present",
                  remedy:"raise meta.tier to 2 (bracketed) or remove the generative node" }
  4.3  if tier == 2:
         each generative node MUST carry on.schema (output contract) AND
         on.repair bounded <= 2 else TIER-VIOLATION with field "nodes[i].on.repair",
         expected:"<= 2", actual:String(on.repair ?? "unbounded")

STEP 5 — UNBRACKETED GENERATION (the K6 detector/decider/generator law)
  5.1  every generative node MUST have a downstream gate|oracle-gate|machine
         reachable before any journal-sink terminal (BFS over edges, depth <= 8)
  5.2  unreachable -> push { code:"[JESL UNBRACKETED-GENERATION]", node:node.id,
         field:"edges", expected:"a verdict node downstream within 8 hops",
         actual:"no verdict node reachable",
         remedy:"wire the generation output into a gate/oracle-gate before the sink" }
       depth 8 BECAUSE: repair chains are bounded at 2 round-trips; each round is
       generation(1) -> gate(1) -> repair edge back(1) = 3 hops; 2 rounds + terminal
       gate + sink = 8. At 7 a legal double-repair chain false-positives; at 9 we
       would accept a chain that hid a THIRD unbounded repair loop (the G14
       unbounded-repair class).

STEP 6 — CONTRACT + ORACLE PRESENCE
  6.1  oracle-gate nodes: every row id referenced must exist in
         decoded.oracle rows OR the ctx oracle registry ->
         else "[JESL ORACLE-MISSING]" with field "nodes[i].rows[j]",
         remedy:"compile the oracle row from the MPSE spec (mpse/oracle-compile.ts)"
  6.2  generative nodes: on.schema REQUIRED (missing-contract folds into
         TIER-VIOLATION per DPL1; token stays in the 8 — no ninth token, K3)

STEP 7 — SEED FEASIBILITY (static half; runtime half lives in channels)
  7.1  compute source nodes (zero inbound edges) + declared triggers
  7.2  if meta.requiresSeed and no source node is seedable by ANY driver
         (cli --in names it | argv position | bus trigger | cron) ->
         push "[JESL NO-SEED]" field "meta.requiresSeed",
         remedy:"name a seedable source or set requiresSeed:false + provide trigger edges"

STEP 8 — CAP HINT CONSISTENCY
  8.1  union requiredCaps over used kinds; if meta.declaredCaps exists and
         a required cap is absent from it -> "[JESL CAP-UNBOUND]" as an AUTHORING
         hint (field "meta.declaredCaps", remedy:"add '<cap>' or drop the requiring node").
         The RUNTIME CAP-UNBOUND (first requiring node, no output artifact) is
         thrown later by the executor — same token, two sites, one vocabulary.

STEP 9 — if errors.length > 0: FAIL Effect.fail(errors[0]) carrying all
       else SUCCEED with the frozen doc (Object.freeze deep — the doc is
       immutable for the run; RunContext.doc shares this instance)

RETURN TYPE: Effect<WorkflowDoc, JeslValidationError, never>  // pure, no caps
```

#### 4.1.3 Data-flow diagram

```
 unknown JSON
     |
     v
 [Schema.decodeUnknown] --ParseError--> map --> JeslValidationError[]
     | ok                                             |
     v                                                v
 cross-checks: registry -> edges -> cycle(K-Graph) -> tier -> bracket
     |                                                |
     v                                                v
 frozen WorkflowDoc ----docHash---> idempotencyKey    formatDiagnostics -> stdout
     |                                                (compiler-style: file:line-ish
     v                                                 "nodes[3].type: [JESL UNKNOWN-NODE]")
 Executor (trusted from here)
```

#### 4.1.4 File + integration points

- New file `jesl/core/schema.ts` (F1). No existing-file edit.
- Consumed by: executor (once per run), CLI `validate` command, packager re-validation (criterion 9), MPSE kernel-emit (emitted docs must decode), TestLive fixtures.
- The `formatDiagnostics` output shape mirrors `wave-spec.ts:200` (CTX_FLOOR refusals name field + floor + actual) — one line per error, token first.

#### 4.1.5 Test specification (F23, S1E gate)

```typescript
// jesl/test/schema.test.ts — it.effect units, one bad fixture per token (F28)
it.effect("bad-unknown-kind.json -> [JESL UNKNOWN-NODE]", () =>
  Effect.gen(function* () {
    const raw = yield* readFixture("bad-unknown-kind.json")
    const err = yield* WorkflowCodec.decodeUnknown(raw).pipe(Effect.flip)
    expect(err.code).toBe("[JESL UNKNOWN-NODE]")
    expect(err.node).toBe("n4")                      // the fixture's offender
    expect(err.remedy.length).toBeGreaterThan(10)    // remedy always present
  }))

it.effect("bad-cycle.json -> [JESL CYCLE] names the residual path", () =>
  Effect.gen(function* () {
    const err = yield* Effect.flip(decodeFixture("bad-cycle.json"))
    expect(err.code).toBe("[JESL CYCLE]")
    expect(err.actual).toContain("->")               // the cycle walk is printed
  }))

it.effect("bad-tier.json: tier-1 doc with prompt node -> TIER-VIOLATION", () =>
  Effect.gen(function* () {
    const err = yield* Effect.flip(decodeFixture("bad-tier.json"))
    expect(err.code).toBe("[JESL TIER-VIOLATION]")
    expect(err.field).toBe("meta.tier")
  }))

it.effect("bad-unbracketed.json -> UNBRACKETED-GENERATION", () =>
  Effect.gen(function* () {
    const err = yield* Effect.flip(decodeFixture("bad-unbracketed.json"))
    expect(err.code).toBe("[JESL UNBRACKETED-GENERATION]")
  }))

it.effect("decode success freezes the doc", () =>
  Effect.gen(function* () {
    const doc = yield* decodeFixture("mech-gate.json")
    expect(Object.isFrozen(doc)).toBe(true)
    expect(() => { (doc as any).meta.tier = 9 }).toThrow()
  }))
```

---

### 4.2 K-Graph — `jesl/core/graph.ts` (F2)

Pure graph mathematics wrapped in `Effect.sync` (DPL1: graph→Graph pure Effect.sync). Produces readiness sets, cycle detection, and parallel-batch partitioning.

#### 4.2.1 Interface

```typescript
export class Graph extends Context.Tag("Graph")<Graph, {
  /** inbound channel set per node — THE readiness key (D4 dataflow semantics) */
  readonly readinessMap: (doc: WorkflowDoc) => Effect.Sync<ReadinessMap>
  /** Kahn's algorithm residual = cycle members, empty = acyclic */
  readonly detectCycles: (doc: WorkflowDoc) => Effect.Sync<ReadonlyArray<string>>
  /** layers of nodes that can fire together (the 2-batch diamond proof) */
  readonly parallelBatches: (doc: WorkflowDoc) => Effect.Sync<ReadonlyArray<ReadonlyArray<string>>>
  /** topological feasibility WITHOUT executing — used by dry-run replay planning */
  readonly topoFeasible: (doc: WorkflowDoc) => Effect.Sync<boolean>
}>()

export interface ReadinessMap {
  readonly byNode: ReadonlyMap<string, ReadonlySet<string>>  // nodeId -> inbound channel names
  readonly writersByChannel: ReadonlyMap<string, ReadonlyArray<string>> // channel -> producer node ids
}
```

#### 4.2.2 `### Graph.parallelBatches — method pseudocode`

```
METHOD parallelBatches(doc) -> Effect.Sync<string[][]>
  1. readiness = readinessMap(doc)
  2. remaining = new Set(doc.nodes.map(n => n.id))
     fired = new Set<string>()
     batches: string[][] = []
  3. WHILE remaining.size > 0:
       batch = []
       for id of remaining:
         inbound = readiness.byNode.get(id)
         // a node is batch-ready when EVERY inbound channel has a writer
         // already fired OR the channel is a declared trigger (externally seeded)
         satisfied = [...inbound].every(ch =>
            (readiness.writersByChannel.get(ch) ?? []).every(w => fired.has(w))
            || doc.triggers.includes(ch))
         if satisfied: batch.push(id)
       if batch.length == 0:
         return Effect.sync(batches)  // caller (schema) already killed cycles;
                                      // reaching here means a trigger lie — surface
                                      // as [JESL NO-SEED] via the executor, not here
                                      // (graph stays pure, throws nothing)
       batch.forEach(id => { fired.add(id); remaining.delete(id) })
       batches.push(batch)
  4. RETURN batches
```

Batch partitioning exists so S1E's diamond fixture proves the executor fires `{a, b}` together then `{c}` — the 1F concurrency law made visible as data.

#### 4.2.3 Data-flow diagram

```
 WorkflowDoc ---edges--> adjacency
     |                        |
     v                        v
 readinessMap         detectCycles (Kahn residual)
   |  |                     |
   |  +--> writersByChannel |
   v                        v
 parallelBatches        topoFeasible ----false---> [JESL CYCLE] (via schema)
   |
   v
 Executor: batch 1 fires concurrently, writes wake batch 2
```

#### 4.2.4 Tests

```typescript
it.effect("diamond partitions into exactly 2 batches", () =>
  Effect.gen(function* () {
    const batches = yield* Graph.parallelBatches(yield* decodeFixture("mech-gate.json"))
    expect(batches.length).toBe(2)
    expect(batches[0]).toEqual(expect.arrayContaining(["source"]))
  }))
it.effect("cycle fixture yields non-empty residual", () =>
  Effect.gen(function* () {
    const cyc = yield* Graph.detectCycles(yield* rawFixture("bad-cycle.json"))
    expect(cyc.length).toBeGreaterThan(0)
  }))
```

---

### 4.3 K-Bus — `jesl/core/bus.ts` (F3)

The EventBus service — the ONE bus (CUSTOM_EVENT_HOOK_ENGINEERING doctrine: the event hook is the one bus; named hooks are easy-mode). Glob patterns over type; handlers are Effects isolated in try/catch (observer law: a handler may write channels but NEVER mutates the event); detach on terminal.

#### 4.3.1 Interface

```typescript
export class EventBus extends Context.Tag("EventBus")<EventBus, {
  readonly emit: (type: string, payload:unknown) => Effect.Effect<void, never, never>
  readonly on: (pattern: string, handler: BusHandler) => Effect.Effect<Detach, never, Scope>
}>()

export type BusHandler = (event: BusEvent) => Effect.Effect<void, unknown, never>
// ^ handler failure is CAUGHT by the bus (observer law) and journaled as
//   bus.handler.error — it NEVER propagates to the emitter.
export interface BusEvent { readonly type: string; readonly payload: unknown; readonly ts: number; readonly seq: number }
export interface Detach { readonly detach: () => void }
```

#### 4.3.2 `### EventBus.emit / on — method pseudocode`

```
SERVICE STATE (scoped fiber-local, per run):
  handlers: Array<{ matcher: GlobMatcher, handler: BusHandler, detached: boolean }>
  seq: Ref<number>            // monotonic, 0-based
  frozen: Ref<boolean>        // set on Scope close

METHOD on(pattern, handler) -> Effect<Detach, never, Scope>
  1. matcher = compileGlob(pattern)   // "tool.call.*" matches "tool.call.bash";
                                      // implemented WITHOUT deps: split('*'),
                                      // startsWith/endsWith/segments — the
                                      // ms-layer-loader globToRegex *->.* pattern
  2. entry = { matcher, handler, detached:false }
  3. handlers.push(entry)  (inside Effect.sync; array lives in the run Scope)
  4. yield* Scope.addFinalizer(() => entry.detached = true)   // detach-on-terminal
  5. RETURN { detach: () => { entry.detached = true } }

METHOD emit(type, payload) -> Effect<void, never, never>
  1. if frozen -> return (post-terminal emits are dropped silently BY DESIGN —
       the run is over; dropping is the loud-fail-safe direction because a
       zombie emit cannot mutate a closed run's channels)
  2. seq = yield* Ref.updateAndGet(seq, s => s + 1)
  3. event = { type, payload, ts: clockNow(), seq }   // ts from the CLOCK CAP,
       never Date.now (K2). TestClock freezes it.
  4. targets = handlers.filter(h => !h.detached && h.matcher.test(type))
  5. results = yield* Effect.forEach(targets, (h) =>
         h.handler(event).pipe(
           Effect.catchAll((e) =>
             journal.handlerError(event, e).pipe(Effect.andThen(Effect.void))),
           // OBSERVER LAW: the failure is journaled, never rethrown.
           // The event object passed to the handler is deep-frozen first:
           Effect.tap(() => Effect.sync(() => Object.freeze(event)))
         ),
         { concurrency: "unbounded" })   // handlers are pure/cheap; the cap
                                         // discipline applies to NODE firing, not
                                         // to bus fan-out of in-memory observers
  6. RETURN void
```

Glob-over-type BECAUSE: the scanners subscribe to families (`pba.family.hit`, `pta.intercept`, `tool.call.*`) without enumerating every subtype; exact-match would force re-subscription on every new kind (K13 append-only would leak into wiring). Full regex was rejected because `*` alone covers every existing pattern in the corpus and regex invites catastrophic backtracking on hostile event types (A3 discipline).

#### 4.3.3 Data-flow diagram

```
 NodeImpl/journal/scanners        driver hooks (opencode event hook)
        | emit(type,payload)              | bridge(event)
        v                                 v
   +------------------------------------------+
   | K-Bus: seq++ -> freeze event -> match    |
   +----+---------------+---------------+-----+
        |               |               |
   pba.family.hit   pta.intercept   channel-wake handler
   (S-BEH)          (S-TOOL)        (writes Channels -> readiness wake)
```

#### 4.3.4 Tests

```typescript
it.effect("handler failure never propagates to emitter", () =>
  Effect.gen(function* () {
    yield* Bus.on("boom.*", () => Effect.fail(new Error("observer blew up")))
    const result = yield* Bus.emit("boom.now", {})   // typed Effect<...,never,...>
    expect(result).toBeUndefined()
  }))
it.effect("event payload is frozen for handlers", () =>
  Effect.gen(function* () {
    let seen: any
    yield* Bus.on("x", (e) => Effect.sync(() => { seen = e.payload }))
    yield* Bus.emit("x", { a: 1 })
    expect(() => { seen.a = 2 }).toThrow()
  }))
it.effect("detach stops delivery", () =>
  Effect.gen(function* () {
    const calls: number[] = []
    const d = yield* Bus.on("t", () => Effect.sync(() => calls.push(1)))
    yield* Bus.emit("t", {})
    d.detach()
    yield* Bus.emit("t", {})
    expect(calls.length).toBe(1)
  }))
```

---

### 4.4 K-Chan — `jesl/core/channels.ts` (F4)

Named channels written by `edge.via` (Ref/SubscriptionRef); the readiness wake logic; channel path resolution.

#### 4.4.1 Interface

```typescript
export class Channels extends Context.Tag("Channels")<Channels, {
  readonly write: (channel: string, value: unknown, byNode: string) => Effect.Effect<void, never, EventBus>
  readonly tryRead: (channel: string) => Effect.Sync<Option<unknown>>
  readonly readinessOf: (nodeId: string) => Effect.Sync<boolean>  // via K-Graph map
  readonly awaitReadiness: (nodeId: string) => Effect.Effect<void, never, EventBus | Scope>
  readonly resolvePath: (nodeId: string, path: string) => Effect.Effect<unknown, JeslChannelUnsetError, never>
}>()
```

#### 4.4.2 `### Channels.resolvePath — method pseudocode` (the `$.name` / `${ctx.x}` resolver)

```
METHOD resolvePath(nodeId, path) -> Effect<unknown, JeslChannelUnsetError>

GRAMMAR (fixed, tiny, NO expression language — DD8):
  "$.a.b.c"        JSON-path walk over the union of written channel values
  "${ctx.x}"       template slot resolved from ctx.json + --in vars  (string only)
  "... ?? ''"      nullish default suffix

ALGORITHM:
  1. if path.startsWith("$."):
       segments = path.slice(2).split(".")
       cur: unknown = channelValueUnion   // merged object of all written channels
       for seg of segments:
         if cur is null/undefined: break to DEFAULT
         if seg.includes("[") : REJECT — array indexing is not in the grammar;
            throw JeslChannelUnsetError { field: path, node: nodeId,
              expected:"$.<object.key> walks only", actual: seg,
              remedy:"flatten arrays in the producing node's outputs mapping" }
         cur = cur[seg]
       if cur === undefined:
         // UNSET IS LOUD, AT THE NODE, not at graph build (K8):
         throw JeslChannelUnsetError { code:"[JESL CHANNEL-UNSET]", node:nodeId,
           field:path, expected:"a value written by an inbound edge",
           actual:"undefined", remedy:"check edge.via names or add ?? default" }
       RETURN cur
  2. if path.includes("${ctx."):
       parts = path.split(/\$\{ctx\.([a-zA-Z0-9_.]+)\}/)  // capture slots
       RETURN parts.map(p =>
         p.startsWith("${") ? ctxLookup(p) : p).join("")
       // unresolved ctx key -> same CHANNEL-UNSET shape, field names the slot
  3. DEFAULT handling: if the FINAL segment suffix matches "?? <literal>":
       literal = "" | "0" | "false" | JSON literal; returned on unset.
  4. RETURN resolved value (frozen copy — nodes never mutate channel data)
```

`?? ''` defaults exist BECAUSE optional context slots (a rocket's `--in {target}`) must not hard-fail template assembly while REQUIRED data paths must — the split is syntactic (explicit default declared = optional; no default = required), which keeps the loud-fail law intact without an `optional:` flag nobody would maintain.

#### 4.4.3 `### Channels.write + awaitReadiness — the wake logic`

```
METHOD write(channel, value, byNode) -> Effect<void, never, EventBus>
  1. store[channel] = Object.freeze(value)            // Ref update
  2. yield* Bus.emit("channel.written", { channel, byNode })  // SECOND wake source
  3. SubscriptionRef-based waiters with matching readiness are published by
     the executor's own subscription — write() itself stays dumb (K6: channels
     detect/store; the executor decides)

METHOD awaitReadiness(nodeId) -> Effect<void, never, EventBus | Scope>
  loop = Effect.whileLoop:
    if readinessOf(nodeId) == true: return
    else: await SubscriptionRef changed event (bus "channel.written" feeds it)
  // NO setTimeout — the wake is data-driven (K2). TestClock + a manual
  // channel write is how tests advance it.
```

#### 4.4.4 Data-flow diagram

```
 edge.via: "parsed"                       --in {..} / argv / hook trigger
      |                                            |
      v                                            v
 +-----------+ write() freezes + emits bus ---+-----------+
 | N-parse   |                                |  input    |
 +-----------+                                +-----------+
      |                                            |
      +------------------两者汇入-------------------+
                       v
        +---------------------------+
        | K-Chan store {input,parsed,...}
        | readiness(n-format) = {parsed} written? -> true
        +---------------------------+
              | awaitReadiness wakes
              v
        +-----------+
        | N-format  |
        +-----------+
```

#### 4.4.5 Tests

```typescript
it.effect("unset required path throws [JESL CHANNEL-UNSET] naming node+path", () =>
  Effect.gen(function* () {
    const err = yield* Effect.flip(Channels.resolvePath("n7", "$.parsed.title"))
    expect(err.code).toBe("[JESL CHANNEL-UNSET]")
    expect(err.node).toBe("n7")
    expect(err.field).toBe("$.parsed.title")
  }))
it.effect("explicit ?? default suppresses the unset throw", () =>
  Effect.gen(function* () {
    const v = yield* Channels.resolvePath("n7", "$.parsed.title ?? ''")
    expect(v).toBe("")
  }))
it.effect("readiness flips only when the LAST inbound writer fires", () =>
  Effect.gen(function* () {
    yield* Channels.write("a", 1, "n1")
    expect(yield* Channels.readinessOf("n3")).toBe(false)   // needs {a,b}
    yield* Channels.write("b", 2, "n2")
    expect(yield* Channels.readinessOf("n3")).toBe(true)
  }))
```

---

### 4.5 K-Exec — `jesl/core/executor.ts` (F5)

The readiness loop as Effect recursion. This is the heart of the single-runtime constraint: one loop, `Effect.forEach` batches, no Promise anywhere.

#### 4.5.1 Interface

```typescript
export class Executor extends Context.Tag("Executor")<Executor, {
  readonly execute: (ctx: RunContext) => Effect.Effect<RunVerdict, JeslError, Caps | Scope>
}>()

export interface RunVerdict {
  readonly runId: string
  readonly verdict: "PASS" | "FAIL" | "INCONCLUSIVE"
  readonly rows: ReadonlyArray<JournalRow>      // THE evidence — verdict is computed FROM these
  readonly incomplete: ReadonlyArray<string>   // nodes that never became ready
  readonly timings: { readonly startMs: number; readonly endMs: number }
}
```

#### 4.5.2 `### Executor.execute — the readiness loop (FULL pseudocode, the C1 centerpiece)`

```
METHOD execute(ctx: RunContext) -> Effect<RunVerdict, JeslError, Caps | Scope>

PRELUDE — resume-or-fresh (D5 the journal is the run):
  0.1  prior = yield* Journal.loadRun(ctx.runId)
  0.2  if prior.exists:
         coverage = Journal.covers(prior, docHash: ctx.docHash, seed: ctx.seed)
         if coverage.complete:
           // NEVER re-pay (K7/S9): return the replayed verdict assembled
           // FROM the prior rows. Zero NodeImpl invocations.
           RETURN verdictFromRows(prior.rows)
         else:
           seededChannels = replaySeeds(prior)   // deterministic channel writes
           firedSet        = prior.completedNodeIds
  0.3  else firedSet = {}; seededChannels = ctx.initialSeeds

MAIN LOOP — Effect recursion (NO while-mutation, NO setTimeout):
  1. loop = (state: {fired:Set, idleRounds:number}) =>
       Effect.gen(function* () {
  1.1    ready = doc.nodes.filter(n =>
                  !state.fired.has(n.id) &&
                  channels.readinessOf(n.id) &&
                  !isPaused(n))
  1.2    if ready.length == 0:
  1.2.1    if state.fired covers all non-optional nodes -> EXIT loop (step 3)
  1.2.2    incomplete = remaining non-optional nodes
           if incomplete.length > 0:
             // either NO-SEED or a stalled channel — name it loudly (K8):
             missing = incomplete.map(id => firstUnwrittenInbound(id))
             if missing.every(isTriggerChannel) ->
                FAIL JeslNoSeedError { incomplete, remedy:"seed via --in/argv/trigger" }
             else -> verdict INCONCLUSIVE with rows + incomplete named
                (INCONCLUSIVE is a FAIL-STATE, never a pass — K8)
  1.3    // THE BATCH FIRE — 1F/E6/K9:
        results = yield* Effect.forEach(ready,
          (n) => invokeAsActivity(n).pipe(
            Effect.exit,                                 // per-item Exit: one child's
            Effect.tap(exit => channels.markFired(n.id)) // failure NEVER kills siblings
          ),
          { concurrency: ctx.budget.maxNodesFiring,      // 15 (see BECAUSE below)
            mode: "either" })                            // allSettled semantics
  1.4    stagger: the driver's Shell/Http caps apply 1-3s jitter BEFORE
        world-touching invokes (inside the Activity, via the clock cap) —
        the loop itself stays tight; stagger lives at the cap so TestClock
        can zero it.
  1.5    failures = results.filter(isFailure)
        for f of failures:
          route = repairEdge(f.nodeId)                   // bounded repair edges
          if f.retriesUsed < (n.retries ?? 0) and retryClass(f.cause) != "exile":
             requeue(n) with retriesUsed+1     // 5xx-class retry, delay 2.5s via
                                               // Effect.delay + clock cap
          elif retryClass(f.cause) == "exile":           // 429 — NEVER retry-in-place
             yield* rpmLedger.exile(f.cause.subject, EXILE_MS_45000)
             requeue(n, after: exile)                    // next rung, per aether law
          elif route exists and repairCount(n) <= 2:     // G14 unbounded-repair kill
             channels.write(route.channel, repairPayload(f), byNode:"__repair")
          else:
             record verdict row FAIL for n; if n.critical -> RETURN fail-fast verdict
  1.6    yield* loop({ fired: state.fired + firedThisRound, idleRounds: 0 })
       })

INVOKE-AS-ACTIVITY (per node):
  2.1  impl = registry.get(n.type)   // UNKNOWN-NODE impossible here (schema), but
         the lookup STILL returns Option and a miss is a JeslUnknownNode throw —
         defense in depth against registry drift between validate and run
  2.2  caps check: impl.requiredCaps ⊆ provided Context tags?
         missing -> throw JeslCapUnboundError {
           code:"[JESL CAP-UNBOUND]", node:n.id,
           field:"caps", expected:impl.requiredCaps.join(","),
           actual:"unbound: " + missing.join(","),
           remedy:"provide the Layer (driver) binding or remove the node" }
         // AND: NO output artifact is produced — the node's channel is NOT
         // written, the run FAILS loudly (K8: no scaffold substitute, ever)
  2.3  yield* Journal.append({ kind:"invoke", node:n.id, phase:"pre", ...causationId })
  2.4  result = yield* impl.invoke(n, nodeCtx).pipe(
         Effect.timeout(n.timeoutMs ?? ctx.budget.defaultTimeoutMs))
  2.5  match result:
         Success(r) -> yield* Journal.append(verdictRow(r))
                        write outputs to edge.via channels
         Failure(e) -> yield* Journal.append(errorRow(e))  // structured {code,node,field,...}
         // timeout -> JeslError code "[JESL CHANNEL-UNSET]"? NO — timeout is a
         //   node failure with retry classification, not a schema token. The 8
         //   tokens are AUTHORING vocabulary (K3); runtime failures carry the
         //   node's own error taxonomy (6 math codes, transport codes, ...).

TERMINAL — output gate + verdict-from-rows:
  3.1  terminal = doc.nodes.find(isTerminalOutput)
  3.2  out = yield* Schema.decodeUnknown(terminal.on.schema)(channelUnion)
         // decode failure -> verdict FAIL, error row carries the parse issue
  3.3  verdict = verdictFromRows(allRows):
         PASS         iff every critical node row verdict == PASS
                        AND every gate/oracle-gate row == PASS
                        AND incomplete == []
         INCONCLUSIVE iff any row verdict == INCONCLUSIVE (fail-state)
         FAIL         otherwise (first FAIL row names the node)
  3.4  Scope.close semantics: shell children interrupted, bus handlers detached,
         journal fd flushed — the RUN SCOPE owns all of it (K9).

RETURN RunVerdict{...rows, timings from clock cap}
```

`concurrency: 15` BECAUSE: the wave-manager's concurrent-agent ceiling and the aether chain operate 3 keys × ~5 in-flight generations ≈ 15 world-touching calls before the RPM ledger (opencode 200 RPM / nvidia 40 RPM, EXILE_MS 45000) starts exiling; at 16+ the first minute of a fan-out routinely trips 429-exile storms that idle the whole batch (observed in the aether retry telemetry: retry 3-5×2.5s chains), while at ≤10 the 5-node parallel fixture and the deep-research fan-out underfill — 15 sits at the measured knee. Jitter 1-3s BECAUSE zero-stagger bursts align token-bucket refill windows (the rpm-ledger exists precisely because synchronized bursts exile); >5s stagger would stretch the S1E diamond fixture past a human-observable single TestClock advance and slow the 75s cron cadence beyond its adaptive window.

#### 4.5.3 Data-flow diagram

```
          RunContext{doc(frozen), channels, journal, bus, caps, clock, budget}
                                     |
        +--------------------------- v ----------------------------+
        | resume? --covers()--> replay rows -> verdict (0 invokes) |
        +--------------------------- | ----------------------------+
                                  fresh
                                     v
        +-------------------- MAIN LOOP -------------------------+
        | ready = unfired ∧ readinessOf ∧ !paused                |
        |    |                                                    |
        |    v  Effect.forEach(ready, invokeAsActivity, {15})     |
        |  [n1][n2][n3] ... per-item Exit (allSettled, K9)       |
        |    |                                                    |
        |    +-- pre-row / verdict-row -> Journal (sha256 chain)  |
        |    +-- outputs -> channels (freeze) -> wake next batch  |
        |    +-- failures -> retry(5xx,2.5s) / exile(429) /       |
        |                     repair-edge(≤2) / critical-fail      |
        +----------------------------------------------------------+
                                     |
                                     v
        output-gate Schema.decode -> verdict FROM journal rows -> RunVerdict
```

#### 4.5.4 Tests

```typescript
it.effect("diamond fires in 2 concurrent batches, overlapCount >= 1", () =>
  Effect.gen(function* () {
    const v = yield* TestLive.run("mech-gate.json")
    expect(v.verdict).toBe("PASS")
    expect(v.overlapCount).toBeGreaterThanOrEqual(1)   // criterion 7
  }))
it.effect("one child failure does not kill siblings", () =>
  Effect.gen(function* () {
    const v = yield* TestLive.run("parallel-5.json", { failNode: "p3" })
    expect(nodeVerdict(v, "p3")).toBe("FAIL")
    expect(nodeVerdict(v, "p1")).toBe("PASS")          // sibling completed
    expect(v.verdict).toBe("FAIL")                     // run still fails loudly
  }))
it.effect("CAP-UNBOUND fails loud with NO channel write", () =>
  Effect.gen(function* () {
    const v = yield* TestLive.runNoCaps("needs-llm.json")   // llm unbound
    expect(v.error.code).toBe("[JESL CAP-UNBOUND]")
    expect(yield* Channels.tryRead("summary")).toBe(Option.none()) // no artifact
  }))
```

---

### 4.6 K-Jrn — `jesl/core/journal.ts` (F6)

Append-only JSONL, sha256-chained rows; `covers()` the replay gate; serialize-for-resume; crash-safe append (fd flush per row).

#### 4.6.1 Interface + row schema (the Data Model §5.4 previews here)

```typescript
export class Journal extends Context.Tag("Journal")<Journal, {
  readonly append: (row: JournalRowInput) => Effect.Effect<JournalRow, never, FileSystem>
  readonly rows: (runId: string) => Effect.Effect<ReadonlyArray<JournalRow>, never, FileSystem>
  readonly covers: (prior: PriorRun, docHash: string, seed: string) => Effect.Sync<CoverageReport>
  readonly serializeForResume: (runId: string) => Effect.Effect<ResumeArtifact, never, FileSystem>
}>()

export interface JournalRow {
  readonly seq: number                    // per-run monotonic
  readonly ts: number                     // from the CLOCK cap (K2)
  readonly run: string                    // runId
  readonly node: string                   // nodeId | "__run" | "__repair"
  readonly kind: "invoke" | "verdict" | "error" | "bus" | "pause" | "resume" | "activity:<name>"
  readonly verdict?: "PASS" | "FAIL" | "INCONCLUSIVE" | "READY_FALSE"
  readonly evidence?: { readonly pattern: string; readonly state: string; readonly anchor: string }
  readonly source: string                 // "workflow/<name>/<node>" — the discriminator
  readonly prev: string                   // sha256 of prior row ("" for seq 0)
  readonly self: string                   // sha256 of this row's canonical bytes
}
```

#### 4.6.2 `### Journal.append — crash-safe chained append`

```
METHOD append(row) -> Effect<JournalRow, never, FileSystem>
  1. prev = lastSelf   // Ref updated on each append; loaded from tail at boot
  2. canonical = canonicalSerialize({ ...row, seq: nextSeq(), ts: clockNow(),
                        run, prev })
       canonicalSerialize: JSON.stringify with SORTED KEYS recursively
       (the Paragon contentId=sha256(NUL-joined) discipline — key order must
        never be load-bearing)
  3. self = sha256hex(canonical)
  4. full = { ...base, self }
  5. yield* fs.append(journalPath(runId), canonicalSerialize(full) + "\n",
                       { flush: true })    // fd-level flush PER ROW — kill -9
                                          // mid-run leaves only WHOLE rows
                                          // (criterion 12; the grok journal.rs
                                          // 681L equivalence)
  6. lastSelf = self; seq++
  7. yield* Bus.emit("journal.row", full)
  8. RETURN full
```

```
METHOD covers(prior, docHash, seed) -> CoverageReport
  1. chainValid = verifyShaChain(prior.rows)   // recompute prev/self — a torn
       or tampered tail yields chainValid:false -> coverage.complete:false ->
       the run RE-EXECUTES from the last valid row (loud, never silent accept)
  2. complete = prior.docHash == docHash
       && prior.seed    == seed
       && allNonOptionalNodes(prior.doc).every(id => prior.rows.some(
            r => r.node == id && (r.kind=="verdict" || r.kind=="error")))
  3. unpaidActivities = prior.rows.filter(r => r.kind.startsWith("activity:"))
       // replay NEVER re-pays: covers() gates BEFORE any Activity can re-run (S9)
  4. RETURN { chainValid, complete, lastCompleteRowSeq, unpaidActivities }
```

Same doc+seed BECAUSE: replay equality keyed on anything weaker (docHash alone) would replay a run under different `--in` values and return stale verdicts — the seed is half the idempotencyKey (DD10) for exactly this reason; anything stronger (timestamp) would make every retry a fresh run and re-pay every generation, violating S9's invoke-count-0 guarantee.

#### 4.6.3 Data-flow diagram

```
 Executor(pre/verdict/error)  bus events  pause/resume  Activities(node:<id>)
        |            |            |             |
        v            v            v             v
   +---------------------------------------------------+
   | Journal.append: seq++ -> canonical(sorted keys)   |
   |   -> sha256 self -> fs.append(flush:true)         |
   |   -> chain: row[n].prev == row[n-1].self          |
   +-------------------------+-------------------------+
                             |
            +----------------+----------------+
            v                                 v
      .trident/rockets/<run-id>.jsonl    covers()/serializeForResume()
      (sha256 chain, ephemeral-run-scoped) -> kill -9 restart point
```

#### 4.6.4 Tests

```typescript
it.effect("chain verifies; tampering row 3 breaks it", () =>
  Effect.gen(function* () {
    const rows = yield* Journal.rows(runId)
    expect(verifyShaChain(rows)).toBe(true)
    expect(verifyShaChain(tamperAt(rows, 3))).toBe(false)
  }))
it.effect("append flushes per row — kill -9 leaves only whole rows", () =>
  Effect.gen(function* () {
    yield* Journal.append(row1); yield* Journal.append(row2)
    // simulated crash: no partial bytes by construction (flush:true per row)
    const tail = yield* fsReadTail(journalPath, 1)
    expect(tail.endsWith("\n")).toBe(true)
  }))
it.effect("covers() true only on same docHash+seed and full node coverage", () =>
  Effect.gen(function* () {
    expect((yield* Journal.covers(prior, h, s)).complete).toBe(true)
    expect((yield* Journal.covers(prior, h, s2)).complete).toBe(false)
  }))
```

---

### 4.7 K-Reg — `jesl/core/registry.ts` (F7)

Append-only `Map<kind, NodeImpl>`; each entry declares family/class/requiredCaps/channel contract; kinds never renamed/removed (K13).

#### 4.7.1 Interface

```typescript
export interface NodeImpl<TIn = unknown, TOut = unknown> {
  readonly kind: string
  readonly family: "deterministic" | "execution" | "generation" | "decision" | "evidence"
  readonly requiredCaps: ReadonlyArray<CapsTag>          // [] for pure kinds
  readonly channels: {
    readonly consumes: ReadonlyArray<string> | "declared-by-edges"
    readonly produces: ReadonlyArray<string> | "per-config"
  }
  readonly invoke: (node: NodeEnvelope, ctx: NodeCtx<TIn>) =>
    Effect.Effect<NodeResult, JeslError, Caps>
}

export class NodeRegistry extends Context.Tag("NodeRegistry")<NodeRegistry, {
  readonly register: (impl: NodeImpl) => Effect.Sync<void>   // throws on kind EXISTING
                                                             // with a DIFFERENT shape
                                                             // (append-only + shape-stable)
  readonly get: (kind: string) => Option<NodeImpl>
  readonly kinds: () => ReadonlyArray<RegistryRow>
}>()
export interface RegistryRow { kind: string; family: NodeImpl["family"]; requiredCaps: string[]; since: "v1" }
```

`register` throws on shape-drift BECAUSE the K13 contract must be mechanical: a later registration that silently redefines an existing kind's caps or family is precisely the compat break the versioned `$schema: trident-workflow-v1` promises can never happen; duplicate-identical registration is idempotent (hot-reload safe), duplicate-divergent is a boot failure.

#### 4.7.2 Registry table (the full v1 kind set — R7 verbatim)

| family | kinds |
|---|---|
| deterministic | event-filter, capture-engine, machine, gate, oracle-gate, circuit-breaker, state-machine, journal-sink, triplet-writer, sqlite-sink, replay-source, pipeline, parallel, retry-chain, fallback-chain, pause, cron-trigger, event-reactivate |
| decision (ms-*) | ratio-classifier, synapse, intent-classifier, escalation-memory, evidence-gate, layer-loader, pba-bridge, chain-tracker, warhead-dispatcher, compliance-collector |
| decision (paragon) | math-eval, oracle-discharge, claim-gate, config-lock, workflow-machine, mpse-discharge, evidence-machine, audit-registry |
| execution | shell-exec, python-exec, http-request, file-io |
| generation | prompt, subagent-dispatch, shadow-agent |

Cross-check (FILE INVENTORY): every kind above ↔ a `jesl/nodes/` file ↔ a DW1 catalog entry; the three surfaces never diverge (bidirectional grep in the battery).

#### 4.7.3 Tests

```typescript
it.effect("re-registering a kind with divergent shape throws at boot", () =>
  Effect.gen(function* () {
    yield* NodeRegistry.register(gateImpl)
    expect(() => Effect.runSync(NodeRegistry.register(gateImplDrifted))).toThrow(/append-only/)
  }))
it.effect("v1 doc kinds all resolve", () =>
  Effect.gen(function* () {
    for (const k of ALL_V1_KINDS) expect(yield* registry.get(k)).toBeSome()
  }))
```

---

### 4.8 K-Caps — `jesl/core/caps.ts` (F8)

The capability interfaces: `shell`, `llm`, `tool`, `subagent`, `http`, `fs`, `emit` — unbound stubs the drivers bind (DD3: caps = Context.Services; the caps ARE the R union).

#### 4.8.1 Interface (complete — this file IS the R union)

```typescript
export class ShellCap extends Context.Tag("ShellCap")<ShellCap, {
  readonly run: (cmd: ReadonlyArray<string>, opts: { timeoutMs: number; maxOutputBytes: number; cwd?: string }) =>
    Effect.Effect<ShellResult, ShellError, never>
}>()
export interface ShellResult { readonly exitCode: number; readonly stdout: string; readonly stderr: string; readonly truncated: boolean }

export class LlmCap extends Context.Tag("LlmCap")<LlmCap, {
  readonly generate: (req: { system: string; prompt: string; maxTokens: number; thinkingBudgetMs?: number; schemaRef?: string }) =>
    Effect.Effect<LlmResult, LlmError, never>   // transport-class errors carry
}>()                                            // class: "429"|"5xx"|"else" (retry law)
export interface LlmResult { readonly text: string; readonly usage: { inTokens: number; outTokens: number }; readonly model: string }

export class ToolCap extends Context.Tag("ToolCap")<ToolCap, {
  readonly invoke: (name: string, args: unknown) => Effect.Effect<ToolResult, ToolError, never>
}>()

export class SubagentCap extends Context.Tag("SubagentCap")<SubagentCap, {
  readonly dispatch: (req: { subagentType: string; promptFile: string }) =>   // spec-file ONLY
    Effect.Effect<SubagentReturn, SubagentError, never>
}>()

export class HttpCap extends Context.Tag("HttpCap")<HttpCap, {
  readonly request: (req: HttpReq) => Effect.Effect<HttpRes, HttpError, never>
}>()

export class FileSystem extends Context.Tag("FileSystem")<FileSystem, {
  readonly read: (p: string) => Effect.Effect<string, FsError, never>
  readonly write: (p: string, data: string) => Effect.Effect<void, FsError, never>
  readonly append: (p: string, data: string, opts?: { flush?: boolean }) => Effect.Effect<void, FsError, never>
  readonly exists: (p: string) => Effect.Sync<boolean>
}>()

export class EmitCap extends Context.Tag("EmitCap")<EmitCap, {
  /** dynamic conversation-level injection — the ONLY channel that satisfies
      the v4.4.4 prompt-caching law (K4): never the system prompt. */
  readonly inject: (msg: string) => Effect.Effect<void, never, never>
}>()
```

Every cap in F8 ↔ a driver binding in F12/F14/F16 (cross-check: no orphan caps, no unbound kinds silently passing). `ShellCap.run` takes `cmd` as an argv array, never a shell string, and `maxOutputBytes` is MANDATORY — the RAM-bomb guard (a `yes`-loop or a hot `docker logs` must truncate, not OOM the run).

#### 4.8.2 Diagram

```
        jesl/core (R requirements only — imports NOTHING)
   ShellCap LlmCap ToolCap SubagentCap HttpCap FileSystem EmitCap
      ^         ^      ^        ^          ^       ^         ^
      |         |      |        |          |       |         |
   +--+---------+------+--------+----------+-------+---------+---+
   | DRIVERS (the only place Effect.tryPromise may appear — K2)   |
   | CliLive: bun shell + node fs + global fetch wrapper + file J |
   | OpenCodeLive: CliLive + input.client tools + wave-mgr + hooks|
   | TestLive: TestClock + InMemoryJournal + ScriptedToolkit + MemFs|
   +---------------------------------------------------------------+
```

---

### 4.9 K-Err — `jesl/core/errors.ts` (F9)

The `Schema.TaggedError` family, one per frozen token. The `code` field PRINTS the exact `[JESL ...]` string so existing fixtures keep passing (D15/K3).

#### 4.9.1 Complete definition block

```typescript
import { Data } from "effect"

const base = { node: undefined as string | undefined, field: "", expected: "", actual: "", remedy: "" }

export class JeslUnknownNode extends Data.TaggedError("JeslUnknownNode")<
  typeof base & { readonly code: "[JESL UNKNOWN-NODE]" }> {}
export class JeslCycle extends Data.TaggedError("JeslCycle")<
  typeof base & { readonly code: "[JESL CYCLE]" }> {}
export class JeslTierViolation extends Data.TaggedError("JeslTierViolation")<
  typeof base & { readonly code: "[JESL TIER-VIOLATION]" }> {}
export class JeslUnbracketedGeneration extends Data.TaggedError("JeslUnbracketedGeneration")<
  typeof base & { readonly code: "[JESL UNBRACKETED-GENERATION]" }> {}
export class JeslCapUnbound extends Data.TaggedError("JeslCapUnbound")<
  typeof base & { readonly code: "[JESL CAP-UNBOUND]" }> {}
export class JeslOracleMissing extends Data.TaggedError("JeslOracleMissing")<
  typeof base & { readonly code: "[JESL ORACLE-MISSING]" }> {}
export class JeslChannelUnset extends Data.TaggedError("JeslChannelUnset")<
  typeof base & { readonly code: "[JESL CHANNEL-UNSET]" }> {}
export class JeslNoSeed extends Data.TaggedError("JeslNoSeed")<
  typeof base & { readonly code: "[JESL NO-SEED]" }> {}

export type JeslError =
  | JeslUnknownNode | JeslCycle | JeslTierViolation | JeslUnbracketedGeneration
  | JeslCapUnbound | JeslOracleMissing | JeslChannelUnset | JeslNoSeed
// plus the runtime (non-authoring) error families re-exported from nodes/*
```

#### 4.9.2 Diagram + F28 cross-check

```
 schema (authoring) ──throw──> 8 TaggedErrors ──code field──> "[JESL <TOKEN>]"
 executor/nodes (runtime) ─┘                    |
                                                v
                          F28 fixtures: 8 tokens ↔ 8 fixtures, bidirectional grep:
                          bad-unknown-kind, bad-cycle, bad-tier, bad-unbracketed,
                          needs-llm, no-seed, unset-channel, oracleless-build
```

The battery greps F9 for `"[JESL ` literals and F23 for fixture references — zero orphans in either direction is an S6E gate.

---

### 4.10 N-* — the node implementations (`jesl/nodes/`, F10/F11/F13/F16)

One file per kind plus shared contracts. Each kind below gets its `###` block. Grouped diagram first.

#### 4.10.1 Node set data-flow diagram (family view)

```
  TRIGGER/SEED                DETERMINISTIC CORE                 EVIDENCE
 ┌────────────┐   ┌────────────────────────────────────┐   ┌──────────────┐
 │cron-trigger│──>│ event-filter capture-engine event- │──>│ journal-sink │
 │event-react.│   │ reactivate pipeline parallel retry-│   │ triplet-writer│
 │replay-src  │   │ chain fallback-chain pause machine │   │ sqlite-sink  │
 └────────────┘   │ gate oracle-gate circuit-breaker   │   └──────┬───────┘
        │         │ state-machine gate                 │          │ rows
        v         └──────────────┬─────────────────────┘          v
    channels                   verdict rows                 K-Jrn chain
                                ▲
  DECISION (pure math) ─────────┘         EXECUTION (caps)      GENERATION (bracketed)
 ┌──────────────────────────────┐       ┌────────────────┐    ┌────────────────────┐
 │ ratio-classifier synapse     │       │ shell-exec     │    │ prompt (dual-mode) │
 │ intent-classifier esc-memory │<─────>│ python-exec    │    │ subagent-dispatch  │
 │ evidence-gate layer-loader   │       │ http-request   │    │ shadow-agent       │
 │ pba-bridge chain-tracker     │       │ file-io        │    │  [every output MUST│
 │ warhead-dispatcher compliance│       └───────┬────────┘    │   pass a gate before│
 │ math-eval oracle-discharge   │               │ caps         │   any sink — K6]   │
 │ claim-gate config-lock       │               └── drivers ───┴────────────────────┘
 │ workflow-machine mpse-       │
 │ discharge evidence-machine   │
 │ audit-registry               │
 └──────────────────────────────┘
```

#### 4.10.2 The deterministic set (18 kinds)

**### event-filter**

```
KIND event-filter (family deterministic; caps [])
CONFIG { subscribe: string (bus glob), filter?: "$.payload.x == literal" (the
         JSON-path + literal equality ONLY — DD8: no expression grammar),
         into: channel }
INVOKE:
  1. sub = yield* Bus.on(cfg.subscribe, handler) attached to run Scope
  2. handler = (ev) => if literalMatch(ev, cfg.filter):
        channels.write(cfg.into, ev.payload, byNode: node.id)
        // the node itself stays "armed" — its OUTPUT is the channel write;
        // its verdict row lands on first match (PASS) or run-terminal (PASS,
        // matched:0 — a filter that never fires is a WIRING bug caught by the
        // discovery-probe procedure, G14 class #1, not a node failure)
  3. RETURN NodeResult{ verdict:"PASS", evidence:{ pattern:"event-filter:"+cfg.subscribe,
        state:"armed", anchor: firstMatchSeq ?? "no-match" } }
TEST: emit("tool.call.bash",{...}) -> channel "tool.events" written; glob
      "tool.call.*" does NOT fire on "tool.result.x".
```

**### capture-engine**

```
KIND capture-engine (deterministic; caps [])
CONFIG { source: bus pattern, intervalMs: 50, maxDeltaChars: 60, finalOn: "end",
         groupBy: "$.payload.sessionId", into: channel }
INVOKE: (the TEB capture law, per-key state)
  1. state = Map<sessionKey, { buf: string[], lastFlush: number, chars: number }>
  2. on event: key = groupBy walk; st = state.get(key) ?? fresh()
     st.buf.push(extractText(ev)); st.chars += delta
     if (now - st.lastFlush >= intervalMs) OR (st.chars >= maxDeltaChars):
        flush(st) -> channels.write(into, batch)
  3. finalOn "end" -> the session-end event forces flush of EVERY key
     (the 50ms/60-char/end triple is the bible-calibrated capture contract —
      50ms BECAUSE reasoning part-updates arrive in sub-100ms bursts on
      1.14.51 and a 100ms window coalesces across turn boundaries; 60 chars
      BECAUSE below ~40 a single token fragments and above ~80 the filter
      banks see stitched fragments that degrade bank precision)
  4. groupBy sessionId BECAUSE globalThis singletons cross-contaminate
     sessions (Intellilexion hazard) — per-key state is the isolation.
TEST: 3 parts across 40ms same session -> ONE batch; 2 sessions -> 2 batches.
```

**### machine** (the generic T.E.B actor seat)

```
KIND machine (deterministic; caps [])
CONFIG { machine: registeredMachineId, on: { event -> transition map }, failState: "INCONCLUSIVE" }
INVOKE: wrap the registered pure step() (the LASME MachineDefinition law:
  initial FAIL-CLOSED, transitions ORDER LOAD-BEARING):
  1. cur = stateRef.get(node.id) ?? machineDef.initial
  2. next = machineDef.step(cur, event)     // PURE call — D11 wrap never rewrite
  3. if next is terminal-with-verdict -> emit verdict row + write channel
  4. if next == machineDef.failState -> NodeResult{ verdict:"INCONCLUSIVE" }
     // failState INCONCLUSIVE never PASS (K6/K8)
TEST: order-sensitivity — firing transitions in non-declared order lands in
      failState, not a lucky pass (the order-load-bearing pin).
```

**### gate**

```
KIND gate (deterministic)
CONFIG { asserts: [{ path:"$.x", op:"eq|ge|le|ne|contains|matches", value }],
         mode: "loud" | "repair", repairChannel?: string }
INVOKE:
  1. for each assert: v = channels.resolvePath(node.id, a.path)   // CHANNEL-UNSET can throw here
  2. all pass -> PASS + write "gate.<id>" channel
  3. any fail: mode loud -> throw NodeFailure{asserts failed named}
                mode repair -> write repairChannel with the failure payload
                (repair edges bounded <=2 upstream — the executor enforces)
THE NEGATIVE LEG: every gate MUST be tested with a failing fixture — a gate
  that cannot fail is theater (G14 over-firing-gate class).
TEST: expect(evaluateGate(doc)) to PASS; flip value -> FAIL with a.path named.
```

**### oracle-gate**

```
KIND oracle-gate (deterministic) — THE MPSE verification primitive
CONFIG { rows: string[] (row ids), registry: "doc" | "ctx" }
ROW FORMAT (DPL1 §4): |OR-n|scope|O1/O2/O3|eq|ge|le|ne|contains|matches(...)|command|;
INVOKE:
  1. for each row id: row = lookupOracleRow(id)  // missing -> throw JeslOracleMissing
  2. actual = evaluateRow(row):
       scope O1/O2/O3 = journal-scope selectors (run/latest-node/global)
       op semantics: eq on INTEGERS only; float operands REQUIRE epsilon field
         else row rejected at VALIDATION (not runtime) — ORACLE_FLOAT_REQUIRES_EPSILON
       matches(...) = anchored regex, DETECTOR only (Warhead 9)
       command = shell verification command whose EXIT CODE is the boolean
         (cap shell required for those rows; passToken-bound per K19)
  3. verdict PASS iff every row passes; any row CONTRADICTED (NaN/Inf actual)
       -> FAIL with the row id in evidence.anchor
  4. unregistered symbol -> UNVERIFIABLE (never guess — R4), recorded as
     INCONCLUSIVE verdict row citing the symbol
TEST: integer eq passes; float without epsilon refused at validation; NaN ->
      CONTRADICTED; unknown symbol -> UNVERIFIABLE row, verdict INCONCLUSIVE.
```

**### circuit-breaker**

```
KIND circuit-breaker (deterministic)
CONFIG { watch: channel, threshold: 3, quietMs: number }
STATE: CLOSED -> OPEN (3 consecutive failures) -> HALF_OPEN (after quietMs via
  clock cap) -> CLOSED on first success | OPEN on failure.
3 BECAUSE: the StrikeCounter/escalation-at-3 convention across Paragon (3
  blocks -> ESCALATE) — at 2 a single transient+real pair trips; at 4 the
  TEST_EVASION 3-strike window would let a third strike through.
TEST: 3 fails -> OPEN (downstream gated off); clock advance + success -> CLOSED.
```

**### state-machine** — the 8-transition paragon lattice wrapped pure (ms-state-machine engine: rearm-first; intervene skipTier esc≥3→3/≥2→2/else1 deadline seq+5; escalate cap 4 windows 5/2/0; cool ≥25+verified). Wraps `step()`; the deadline/skipTier tables are CONSUMED from escalation-memory (DD19 — the inline copy is deleted).

**### journal-sink** — MANDATORY terminal: writes the run's verdict object to the journal as a `verdict` row with `source: workflow/<name>/<node>`; every doc MUST terminate in one (schema checks reachability).

**### triplet-writer** — `{Pattern, State, Evidence: node+file:line}`; an anchorless finding is DELETED at write time (no triplet no finding — the MPSE law).

**### sqlite-sink**

```
CONFIG { db: path, table, columns: channel paths, wal: true }
INVOKE: upsert via IMMEDIATE transaction; busy_timeout 5000.
WAL + busy_timeout 5000 + IMMEDIATE BECAUSE: concurrent parallel-node writes
  (forEach 15) on the wave-db pattern corrupt without WAL; 5000ms covers the
  p95 of the wave-manager's observed lock hold times (~1-3s under batch
  upserts) without turning contention into failures (G14 sqlite-corruption
  class).
```

**### replay-source** — `covers()`-check-then-rerun: reads a prior run's journal, replays deterministic channel writes, and only re-fires nodes whose rows are absent (the G13 tier-2 contract: journaled generations return AS-IS, never re-paid).

**### pipeline** — module-level PipelineRunContext + reset (the T1 multi-tool chain law): scoped state cleared between invocations.

**### parallel** — fan-out over `$.items[]` with allSettled bounded 15 stagger; `Effect.partition` semantics (K9).

**### retry-chain** — the 429-exile class: never retry-in-place; exile next rung via the rpm-ledger law (EXILE_MS 45000).

**### fallback-chain** — SAME-ARTIFACT-ONLY: the fallback's output must decode against the SAME output schema; a fallback producing a different artifact shape is refused at validation (the FALSE SUCCESS ban, K8).

**### pause** — journal-persisted pause: writes a `pause` row, run scope survives (durable), resume = re-entry from the last complete row (the in-memory-pause-loss G14 class killed).

**### cron-trigger** — 10min/75s adaptive cadence (the wave-cron law); emits seed events into its channel.

**### event-reactivate** — wakes dormant nodes: subscribes to a bus pattern and re-arms a paused/dormant node's readiness (complement of pause).

#### 4.10.3 The ms-* survivor wrappers (decision family)

Each is a THIN wrapper over the proven pure core (D11: wrap, never rewrite). Shared shape:

```typescript
// jesl/nodes/ratio-classifier.ts (pattern for all ms-* wrappers)
export const ratioClassifierNode: NodeImpl = {
  kind: "ratio-classifier", family: "decision", requiredCaps: [],
  channels: { consumes: "declared-by-edges", produces: ["ratio.verdict"] },
  invoke: (node, ctx) =>
    Effect.gen(function* () {
      const text = yield* ctx.channels.resolvePath(node.id, node.on.input)  // string
      // PURE CORE CALL — the 4-bank scoreSignals from ms-ratio-classifier:
      const hit = scoreSignals(text, ctx.vars.banks)   // pos/neg/descriptive/suggestive
      const confidence = hit.pos / (hit.pos + hit.neg + 1)
      const band = confidence >= 0.5 ? "ENFORCE" : confidence >= 0.3 ? "DAMPEN" : "NEUTRAL"
      // 0.5/0.3 BECAUSE: pinned by the 3000-assertion property battery on the
      // trident 6-family corpus — at 0.45 TEST_EVASION positives leak into
      // DAMPEN; at 0.55 genuine-comply text false-positives to ENFORCE.
      yield* ctx.channels.write("ratio.verdict", { band, confidence, hit }, node.id)
      return { verdict: "PASS",
               evidence: { pattern: hit.patternId, state: band,
                           anchor: `${node.id}:${text.length}c` } }
    })
}
```

- **synapse** — wraps sentinel/synapse.ts: `FamilyNeuron` with `λ·e^(-0.05·Δseq)+w`, refractory 25, `lastFireSeq=-1e9`; V2Synapse per-family; `snapshot()/restore()` journaled at pause. Refractory 25 BECAUSE the escalation cool-down floor (`cool ≥25+verified`) and the synapse invariant battery I1-I7 pin family-level refractoriness at the same seq scale — below 25 a re-arming burst double-fires a family within one intervention window; above 30 the THEATRICAL family (weight 1.4) goes numb across a normal 20-30 seq escalation arc.
- **intent-classifier** — fusion `s1*0.5 + s2*0.3 + s3*0.2`, `chainConfidence 0.8/0`, PBA boost capped 1.0; `BLOCK ≥ threshold` (tier3) / `ADVISE ≥ 0.6×threshold` (tier2) / ALLOW. Weights 0.5/0.3/0.2 BECAUSE pinned by the 3-source fusion battery (the re-pinned 0.615/0.575 cases — G4); ADVISE at 0.6× BECAUSE below 0.5× the advisor fires on noise that the PBA bank already dampened. IMPORTS ms-ratio (DD20 — the inlined copy is GONE).
- **escalation-memory** — `deadline 5/2/0`, `skipTier 0/2/3`, `genuine--/minimum-same` — the SOLE table (DD19).
- **evidence-gate** — SHA-256 signature over the CANONICAL record (timestamp+type INCLUDED — DD18); 5-criteria on matchingFresh only; `PASS 5/5`, `INCONCLUSIVE ≥3`, else FAIL; freshness 300s; `genuine = artifact|results.json|PASS|len>50`. 300s BECAUSE `CLAIM_FRESH_WINDOW_MS 300_000` from the baseline evidence-tracker — the measured window between a tool result and the agent's claim about it; POOL_TTL is 2× this (below).
- **layer-loader** — `globToRegex *→.*`; `validateLayerJson` named throws; compiles banks/argPatterns ANCHORED. The JSON layer format IS a JESL doc family (R8).
- **pba-bridge** — ring 20; `correlateEscalation` floor `0/0/1/2/2` with `max(pta, floor)`; `getLayersToPrearm`. Ring 20 BECAUSE the pre-arm correlation window must span a full intervention arc (fire→intercept→observe ~8-12 events) plus margin, while a 50-ring (the evidence-machine's) would correlate across unrelated escalation families.
- **chain-tracker** — `HISTORY_CAP 100`, `OUTPUT_CAP 500`, `detectLoop ≥3-same AND ≤1-unique-completed`, `wasCalled withinMs 0=session`. ≥3-same BECAUSE 2 identical calls are the legal retry idiom; ≤1-unique-completed BECAUSE a loop with 2 completed unique steps is progress, not a stall.
- **warhead-dispatcher** — 6 REQUIRED_SECTIONS, 9 FILL_FIELDS; `TIER_TO_SURFACE`: 1/2→TEA append, 3→TEB throw `StructuredEnforcementError`, 4→GATE `[PTA GATE]` inject.
- **compliance-collector** — `POOL_TTL 600_000 = 2×` the gate freshness (300s) BECAUSE the pool must outlive the freshest record it can serve — at 1× the pool expires exactly when its newest member goes stale and the gate starves; at 3× stale records shadow fresh ones in signature dedupe. Signed records use the DD18 canonical shape.

#### 4.10.4 The paragon machine nodes (8)

**### math-eval** (FULL — the IR executor)

```
KIND math-eval (decision; caps [])
CONFIG { expr: MathExpr (the 24-kind grammar, inline), bindings: "$.ctx.math" path,
         mode: "strict" }
INVOKE:
  1. env = resolveBindings(cfg.bindings)  // channel walk; unset -> CHANNEL-UNSET
  2. result = evalMathExpr(cfg.expr, env)   // the eval.ts:48-211 total evaluator
  3. match result:
       Ok(v)        -> PASS, write "math.out" = v
       Err(code)    -> map the 6 failure codes:
         UNBOUND_SYMBOL         -> NodeResult INCONCLUSIVE (evidence names symbol)
         TYPE_MISMATCH          -> FAIL (authoring defect — the doc's fault)
         DIV_BY_ZERO            -> FAIL
         DOMAIN_UNBOUNDED       -> FAIL (domain cap 10K breached)
         TEMPORAL_NOT_EVALUABLE -> rethrow as TemporalEscalationError ->
                                   the executor routes to the ESCALATE edge
                                   (temporal predicates NEVER evaluate inline;
                                    they escalate — the eval.ts:214-218 wall)
         DEPTH_EXCEEDED         -> FAIL (depth 256)
DEPTH 256 BECAUSE the evaluator's own pinned limit — the corpus's deepest legal
  nesting (nested quantifiers over 20 structures) bottoms out < 60; 256 leaves
  4x headroom while staying far below stack-pressure territory; DOMAIN 10K
  because finite-domain proofs beyond 10K elements blow the O(n²) quantifier
  scan past the 1s verdict budget at TestClock-real pacing.
STRICT and/or: no truthy coercion — a non-boolean operand is TYPE_MISMATCH.
TESTS: each of the 6 codes has a fixture; temporal fixture asserts the
  ESCALATE edge fires and no verdict row is written for the node.
```

**### oracle-discharge**

```
INVOKE:
  1. row = oracleRegistry.get(cfg.rowId)  // append-only; first-wins
  2. if registry has conflicting re-registration of rowId -> ORACLE_CONFLICT
     loud fail (append-only violation surfaced, never silently overridden)
  3. discharge:
       expected/actual BOTH integers -> eq verdict (zero false positives — R4)
       floats -> REQUIRE epsilon on the row else validation-time reject
       actual NaN|Infinity -> CONTRADICTED
       rowId unregistered -> UNVERIFIABLE (never guess)
  4. verdict row: evidence.anchor = row.provenance {source,line,quote} (D13)
```

**### claim-gate** — arm `demand 200c + triad + TTL 8seq`; NEVER blocks work (mutation not block); `[P-GATE]` splice consume-once; `clear()` escape (a container-test run clears); 3-strike. TTL 8seq BECAUSE a claim must survive the observe→claim gap (tool result at seq n, claim typically n+2..n+5 under parallel firing) but decay before cross-topic drift (~seq 10+); 200c BECAUSE the ship-package floor — thinner demands arm on noise.

**### config-lock** — per-segment `classifyCtExec`; binary `INCONCLUSIVE→BLOCK`; `CT_DECODE_PRINTABLE_RATIO 0.6`. 0.6 BECAUSE pinned by the config-lock battery: printable ratio of the legitimate bun-bundle segment sits ~0.35-0.5, decoded-exec blobs ≥0.7; 0.6 is the midpoint with margin both ways.

**### workflow-machine** — `CODE→BUILD→TEST-UNIT→TEST-RUNTIME→REPORT`; REPORT only from `TEST-RUNTIME×LEGIT`; skip = ABSENT. 4 states × 3 event classes = 12 transitions, ONE legal REPORT path (the reachability proof).

**### mpse-discharge** — `extractBindings` domain-proofed; `checkContract` pre-REJECT / post-THROW / inv-DIE / temporal-ESCALATE.

**### evidence-machine (F11 — THE 8-KIND UNION, highest priority)**

```
KIND evidence-machine (decision; caps []) — G1's closure target
THE 8 EVENT KINDS (baseline evidence-tracker.ts:42-50 verbatim set):
  unit | container | smoke | dist_change | claim | evidence_clear
  + SOURCE_CHANGE + STATUS   (the port — LASME_v1 had 4, this completes 8)

CONFIG { subject: "$.subject", ringCap: 50 }
STATE: per-subject event ring (cap 50), verdict TTL 5000ms, lifecycle TTL 300000ms
CONSTANTS BECAUSE:
  ringCap 50 BECAUSE the LASME state-machine pin — adjudication needs the full
    claim→evidence window plus container-suite rows (~20-35 events) with
    margin; 100 doubles memory per subject for zero adjudication gain.
  VERDICT_TTL 5000ms BECAUSE a verdict older than one UI interaction is stale
    evidence (the fail-closed UNEVIDENCED default re-arms).
  LIFECYCLE_TTL 300000ms BECAUSE = CLAIM_FRESH_WINDOW_MS 300_000 — the claim
    and its lifecycle expire on the same clock or fresh claims reference dead
    lifecycles.

PORTED GUARDS (from v4.4.2-baseline, exact semantics):
  canSourceChange(ev): requires subject FILE PATH + dist-scope + monotonic
    (ev.at > lastSourceChangeAt) — a source_change without a path is REJECTED
    (stays UNEVIDENCED, never counts)          [:206-219]
  canStatus(ev): requires detail.probeOutput non-empty — a status without the
    probe's output is a narration, not a probe                  [:226-235]
  applySourceChange/applyStatus: monotonic field updates + lifecycle
    re-arm                                                     [:321-342]
  isEventFresh(ev, now, windowMs=300_000): the freshness wall    [:638-646]
  analyzeResult ingestion: PASS_COUNT_RE = /\d+\s+pass/i over tool-result
    text; WRITE_TOOLS = ['write','edit','write_file']            [ingestion:37,61]

STEP (the pure core, order-load-bearing):
  1. event arrives (bus "tool.after" -> ingestion adapter, or channel)
  2. classify into one of 8 kinds (ingestion adapter maps tool names +
     result shapes: WRITE_TOOLS -> source_change candidate; probe outputs ->
     status; PASS_COUNT_RE -> unit/container evidence)
  3. guard = can<Kind>(ev); rejected -> record REJECTED row (LOUD, evidence
     preserved) and DO NOT advance state
  4. accepted -> ring.push + lifecycle transition (fail-closed)
  5. queryVerdict(subject) -> walk ring: match claim rows against evidence
     rows with isEventFresh; UNMATCHED -> UNEVIDENCED (fail-closed default)

WIRING (the F-2 kill): the opencode driver's tool.execute.after feeds
  analyzeResult-shaped payloads INTO this node via the bus — result-shape
  ingestion is a first-class input, not an afterthought.

TESTS (the 8-kind union battery — G1's closure proof):
  each kind: a PASSING fixture + a REJECTING fixture (16 minimum), plus:
  it.effect("claim after real write adjudicates EVIDENCED", ...)
    expect(verdict).toBe("EVIDENCED")     // source_change with path+monotonic
  it.effect("claim after pathless source_change stays UNEVIDENCED", ...)
    expect(verdict).toBe("UNEVIDENCED")
  it.effect("stale status (>300s via TestClock) rejected", ...)
```

**### audit-registry** — `DISPATCHED→WORKING→RETURNED→AUDITED→ADVANCED`; `ADVANCE_BLOCKED` on illegal skip; `auditAdvanceAllowed`: no record → fail-closed. "EXISTENCE IS NOT AUDIT."

#### 4.10.5 The execution set (4, cap-bound — F13)

**### shell-exec**

```
CONFIG { cmd: string[], timeoutMs: number (REQUIRED), maxOutputBytes: number (REQUIRED),
         cwd?: string }
INVOKE:
  1. yield* ShellCap.run(cfg.cmd, { timeoutMs, maxOutputBytes, cwd })
  2. stdout/stderr captured; truncated flag honored (RAM-bomb guard)
  3. verdict PASS iff exitCode == 0 (a non-zero exit is a FAIL with the code)
  4. evidence.anchor = "exit:" + exitCode  (tool-result-bound, K19)
TIMEOUT + MAXOUTPUT MANDATORY BECAUSE: an unbounded docker-build log or an
  infinite `tail -f` kills the run scope — the config REQUIRES the bounds at
  validation (missing field = schema reject, folding into the structural
  error path with field named).
```

**### python-exec** — `script` + `args` as argv (NEVER string-interpolated — injection class); same mandatory bounds; runs via the shell cap with `python3 script args...`.

**### http-request** — timeout + retry class (429 exile / 5xx retry 2.5s / else fall); response body capped at maxOutputBytes.

**### file-io**

```
CONFIG { op: "read"|"write", path, writeScopeRoot?: string (default: run root) }
WRITE-SCOPE LAW (five bypass classes closed — SHADOW_AGENT bible):
  resolved = path.resolve(realpath(dirname), path)
  allowed  = resolved === root || resolved.startsWith(root + path.sep)
  symlink escape / .. escape / absolute-outside / drive-letter tricks /
  trailing-slash tricks ALL collapse into the same startsWith(root+sep) test
  on the RESOLVED path — a violation is a LOUD FsError, never a silent
  redirect.
TEST: symlink-to-/etc/passwd read -> FsError naming the escape.
```

#### 4.10.6 The generation set (3, bracket-enforced — F16)

**### prompt (dual-mode — F16 centerpiece)**

```
KIND prompt (generation; caps: [llm] ONLY in call-model mode)
CONFIG {
  mode: "call-model" | "ask-launcher",
  system: string | "${ctx.system}",
  prompt: string | template,
  maxTokens: number (REQUIRED — compute from deliverable, never default),
  thinkingBudgetMs?: number (explicit or ABSENT — never Agent-defaulted,
      the 712s autopsy law),
  on: { schema: outputContractRef, repair: 0|1|2 }
}
INVOKE call-model:
  1. res = yield* LlmCap.generate({...}) with transport-class errors carrying
     "429"|"5xx"|"else" (the aether law: 429 exile / 5xx retry 3-5×2.5s / else fall)
  2. decoded = Schema.decodeUnknown(on.schema)(res.text)
     fail -> repair edge (bounded) else FAIL loud
  3. write channel; verdict PASS with evidence.anchor = "llm:"+res.model+":"+sha256(res.text).slice(0,12)
INVOKE ask-launcher:
  1. NO llm cap required — the node returns a DurableDeferred question
  2. the question text returns THROUGH THE TOOL RESULT to the launching agent
  3. the launcher's answer (tool-result JSON) writes the node's output channel
     — THE AGENT IS A NODE (DD15/R6)
  4. timeoutMs governs the wait (clock cap; DurableDeferred survives pause)
BRACKET: schema validation REQUIRES a downstream gate/oracle-gate within 8
  hops (schema step 5) — a prompt without a verdict gate cannot be authored.
TESTS: needs-llm.json with no llm Layer -> [JESL CAP-UNBOUND] llm named;
  ask-launcher roundtrip in-container (S3E gate) — scripted launcher answer
  writes channel, node verdict PASS, no LlmCap in R (type-level proof).
```

**### subagent-dispatch** — spec-file ONLY (`promptFile`, never inline — the WAVE VERBATIM law); SubagentCap; return integrity via the wave-status classifyReturnIntegrity lexicon (L-TRUNC-1..5, DANGLING_CONNECTIVE).

**### shadow-agent** — the full pi harness config surface: `model + apiFamily + tools + markerContract + budget {maxTokens, thinking explicit, rounds: 4+ceil(candidates/8)} + writeScope`; the runner injects the HOW (chainedStream retry/stall 60s event-aware, done-verifier, loud-fail full shape `{ready:false,stage,code}` NO file NO row, module-load key seeding BUG-D6, force-bound read 320/grep 120/write path-pinned, marker-teaching byte-exact). Rounds `4+ceil(candidates/8)` BECAUSE the shadow-agent battery pinned convergence: below 4 the marker never stabilizes on novel corpora; the +1-per-8 keeps the candidate review queue covered without over-sampling high-confidence hits. Stall 60000ms BECAUSE STALL_MS in aether-agent.ts — the observed gap between streaming heartbeats before a provider cut; below 45s false-stalls on thinking models, above 90s dead streams burn a full retry budget.

---

### 4.11 D-* — the drivers (`jesl/drivers/`, F12/F14 + sdk/watcher/cron)

#### 4.11.1 The Layer stacks

```
 CliLive      = ShellCap.live + FileSystem.node + HttpCap.node + Journal.file(.trident/rockets/)
 OpenCodeLive = CliLive + ToolCap.client(input.client) + SubagentCap.waveManager
                      + LlmCap.client + Hooks.bus(input.hooks)
 TestLive     = TestClock + InMemoryJournal + ScriptedToolkit + MemoryFs
                (+ optional ScriptedShell/ScriptedHttp)
```

#### 4.11.2 `### cli/main — the jesl bin (run|validate|replay|emit)`

```
COMMAND jesl <cmd> workflow.json [--ctx ctx.json] [--in '<json>'] [--seed argv...]
MAIN (the ONLY file where runPromise appears — K2/E10):
  1. parse argv; load doc bytes; load ctx.json; merge --in
  2. program =
       Effect.gen(function* () {
         doc    = yield* WorkflowCodec.decodeUnknown(docBytes)     // [JESL ...] tokens to stderr
         seeds  = seedFrom(argv: --in + positionals)                // input channel + vars
         layers = CliLive  for run/replay/emit
         result = match cmd:
           validate -> formatDiagnostics on failure | "OK <docHash>"
           run      -> Executor.execute(RunContext{...}).pipe(Effect.provide(layers))
           replay   -> Executor.execute with resume-from .trident/rockets/<run>.jsonl
           emit     -> Packager.emit(target from --target tool|chain|skill)
         return result
       }).pipe(Effect.provide(Scope))
  3. Effect.runPromise(program)
       .then(v => { console.log(JSON.stringify(v.verdict ?? v, null, 2));
                    console.error("journal: " + v.journalPath) ; exitCode = verdictExit(v) })
       .catch(e => { console.error(renderError(e)); exit 1 })   // LOUD (K8)
EXIT CODES: PASS=0, FAIL=1, INCONCLUSIVE=2, validation error=3 — passTokens
  bind to these (K19).
```

#### 4.11.3 `### opencode driver — the hooks→bus bridge (F14) + C2 full hook code`

The ONE event hook bridges host events to the bus (CUSTOM_EVENT_HOOK doctrine). The 5-hook binding surface (F22) with FULL function bodies:

```typescript
// jesl/bindings/opencode/hooks.ts — the ParagonHostBinding contract (C8)
// HOOK 1: event — the ONE bus bridge
export const eventHook: PluginHook<"event"> = async (input) => {
  const bus = await runtimeBus()                       // OpenCodeLive singleton
  // 1.14.51 wiring: message.part.updated carries the part at
  // event.properties.part (types.gen.d.ts:744) — NOT message.updated/info.parts
  if (input.event.name === "message.part.updated") {
    return bus.emit("message.part.updated", {
      session: input.event.properties.session,
      part:    input.event.properties.part,             // verbatim passthrough
    }).pipe(runHost)                                    // ONE run* per invocation (E10)
  }
  return bus.emit(input.event.name, input.event.properties ?? {}).pipe(runHost)
}

// HOOK 2: chat.message — ASSISTANT-ORIGIN ONLY (detector attribution law)
export const chatMessageHook: PluginHook<"chat.message"> = async (input) => {
  if (!isAssistantOrigin(input)) return input.output   // user words NEVER trigger
  return BehaviorEngine.scan(input.output.text)        // PBA: ratio banks + synapse
    .pipe(Effect.map(hit => bus.emit("pba.family.hit", hit)))
    .pipe(runHost, andThen(() => input.output))        // PASS-THROUGH: no mutation
}

// HOOK 3: tool.execute.before — THE AUTHORIZATION STACK (K5, verbatim order)
export const toolBeforeHook: PluginHook<"tool.execute.before"> = async (input) => {
  return Effect.gen(function* () {
    // (1) Escalation.intercept — Paragon tier >= 3 throws
    const esc = yield* Escalation.intercept(input)
    // (2) Policy.assertCapable(CurrentProgram.capabilities)
    yield* Policy.assertCapable(input.tool, input.args)
    // (3) Policy.assertPhase — Poseidon/JESL ready-set
    yield* Policy.assertPhase(input.tool)
    // (4) causationId in journal — an Interpreter or Activity spawned this
    const causation = yield* Journal.currentCausation()
    if (!causation) return input.output                // host-origin tool: pass
    // (5) ToolEngine (PTA) — layers + chain + intent + warhead dispatch
    const pta = yield* ToolEngine.intercept(input)
    if (pta.deny) throw new StructuredEnforcementError(pta)   // DENY IS A THROW, never a log
    return input.output
  }).pipe(runHost)
}

// HOOK 4: tool.execute.after — record + Phase-B splice + LSP
export const toolAfterHook: PluginHook<"tool.execute.after"> = async (input) => {
  return Effect.gen(function* () {
    yield* ComplianceCollector.record(input)           // canonical DD18 signature
    yield* EvidenceMachine.ingest(input)               // analyzeResult -> 8-kind union
    const splice = ClaimGate.phaseB(input.output)      // demand mutation, consume-once
    if (splice) yield* EmitCap.inject(splice)          // conversation-level ONLY (K4)
    if (/\.[jt]s$/.test(input.tool === "write" ? input.args?.file ?? "" : "")) {
      yield* EffectLsp.runActivity(input.args.file)    // diagnostics Activity after *.ts writes
    }
    return splice ? { ...input.output, text: appendBlock(input.output, splice) } : input.output
  }).pipe(runHost)
}

// HOOK 5: system.transform — STATIC, marker-guarded (K4 prompt-caching law)
export const systemTransformHook: PluginHook<"system.transform"> = async (input) => {
  // BYTE-IDENTICAL every call. A static marker line only. NO dynamic content —
  // one char = 33x cost (v4.4.4 :261-267). Dynamic injection rides tool.execute.before.
  if (input.output.includes(MARKER_JESL)) return input.output
  return { ...input.output, output: input.output + "\n" + MARKER_JESL + "\n" }
}
```

C3 INSERTION-POINT mapping (existing file — the binding lands in the host plugin): `jesl/bindings/opencode/index.ts` registers the five hooks in plugin `hooks: { event: eventHook, "chat.message": chatMessageHook, "tool.execute.before": toolBeforeHook, "tool.execute.after": toolAfterHook, "system.transform": systemTransformHook }`. The registration order places `ptaIntercept` LAST in tool.before (the v4.4.2 composition law: 14 stages then LAST pbaIntercept) and `pbaObserveTool` LAST in tool.after. No existing hook body is rewritten — the binding composes AFTER the existing LAST-stage adapters via the same append discipline the 10-hook composition uses.

C4 initialization diff (the binding's init):

```diff
  // plugin init — BEFORE (v4.4.2 composition)
  hooks: {
    event: sessionHook,
    "tool.execute.before": composeStages([...stages1to13, pbaIntercept]),
    "tool.execute.after":  composeStages([...afterStages, pbaObserveTool]),
    "messages.transform":  composeLast(pbaTryIntervene),
    "system.transform":    identity,
  }
+ // AFTER (JESL binding mounts WITHOUT replacing)
+ hooks: {
+   event:                chainHooks(sessionHook, eventHook),            // bridge FIRST, existing second
+   "tool.execute.before": composeStages([...stages1to13, pbaIntercept, ToolEngine.hostAdapter]),
+   "tool.execute.after":  composeStages([...afterStages, pbaObserveTool, toolAfterAdapter]),
+   "messages.transform":  composeLast(pbaTryIntervene, messagesConsumeOnce),
+   "system.transform":    chainHooks(identity, systemTransformHook),    // static marker only
+ }
```

#### 4.11.4 `### sdk.ts + watcher/cron`

```
sdk.ts:  export const run     = (doc, opts) => Executor.execute(buildCtx(doc, opts))
         export const validate= (docBytes)     => WorkflowCodec.decodeUnknown(docBytes)
         export const replay  = (runId)        => Executor.execute(resumeCtx(runId))
         // caller provides the Layer stack — caps are the caller's world (DD2)
watcher.ts: fs.watch over a kernel dir -> decode -> run (re-seeding driver)
cron.ts:   cron-trigger semantics (10min/75s adaptive — wave-cron law)
```

---

### 4.12 S-* — the scanner services (F15, C11)

Five services on ONE EventBus — no fourth runtime (R8).

#### 4.12.1 Diagram

```
                     ONE EventBus (K-Bus)
   emit pba.family.hit  emit pta.intercept  emit lsp.diagnostic
        |                     |                   |
  +-----v------+      +------v-------+     +------v------+
  | S-BEH PBA  |      | S-TOOL PTA   |     | S-ELSP/S-LLSP|
  | ratio banks|      | layer-loader |     | diagnostics  |
  | synapse    |      | chain-tracker|     | family map   |
  | reasoning- | prearm via S-BRG    |     | D25 persist  |
  | capture    |--boostBaseline----->|     | (LOGIC-LSP)  |
  +------------+      +------+-------+     +-------------+
        ^                    | deny (tier>=3 throw)
        |                    v
  message.part.updated   Toolkit.invoke (the ONLY world door)
```

#### 4.12.2 `### BehaviorEngine.scan (PBA think-scanner)`

```
METHOD scan(text) -> Effect<PbaHit, never, never>
  1. fresh = ReasoningCapture.isFreshPart(text)   // the 1.14.51 wiring
  2. for family of banks:                       // 6 trident families
       hit = scoreSignals(text, family.banks)    // ms-ratio 4-bank
       conf = pos/(pos+neg+1)
       if conf >= 0.3 (DAMPEN floor):
         fired = synapse.fire(family.id, seqNow)  // λ·e^(-0.05·Δseq)+w, refractory 25
         if fired: yield* Bus.emit("pba.family.hit",
            { family: family.id, confidence: conf, tier: family.tierAt(conf) })
  3. RETURN aggregate (state lives in the synapse — snapshot/restore journaled)
```

#### 4.12.3 `### ToolEngine.intercept (PTA do-scanner — the authorization stack seat)`

```
METHOD intercept(input) -> Effect<{deny?: StructuredEnforcementError}, never, never>
  1. layers = yield* LayerLoader.load(ctx.projectRoot)   // JSON layers = JESL docs
  2. prearm = yield* PbaBridge.getLayersToPrearm()       // ring-20 correlation
       for L of prearm: L.boostBaseline()                // pre-armed layer
  3. chainHit = ChainTracker.observe(toolName, args)     // loop detect ≥3-same
  4. fusion = IntentClassifier.fuse(s1=layerScore, s2=chainScore, s3=pbaScore)
       // 0.5/0.3/0.2; PBA boost cap 1.0
  5. if fusion.action == BLOCK (>= threshold, tier3):
       warhead = WarheadDispatcher.render(fusion)        // TIER_TO_SURFACE
       RETURN { deny: StructuredEnforcementError(warhead) }  // TEB THROW
  6. if ADVISE (>= 0.6x threshold): EmitCap.inject(advisory)  // TEA append
  7. RETURN {}   // ALLOW — work is never blocked for information (SSTF law)
```

#### 4.12.4 EffectLsp + LogicLsp

- **EffectLsp**: after every `*.ts` write (tool.after path), an Activity runs the `@effect/language-service` CLI over the file; findings map through the family table (`floatingEffect→THEATRICAL_PLANNING`, `missingStarInYieldEffectGen→RUNTIME_SMUGGLING`, `runEffectInsideEffect→RUNTIME_SMUGGLING`, `globalFetch/Date/Timers/Random→RUNTIME_SMUGGLING`, `nodeBuiltinImport→RUNTIME_SMUGGLING`, `tryCatchInEffectGen→THEATRICAL_PLANNING`, `preferSchemaOverJson→SCHEMA_EVASION`) at error severity; the patch in `prepare` (F24) makes tsc carry the same diagnostics — agents see what the build sees (DD12).
- **LogicLsp**: the Paragon L6 mount — state IS the db, one-shared per project; `blockFor <500B`; D25 persistence: findings ride touched files until `AUDIT_DONE` clears; `conformanceZero` gates the clear.

---

### 4.13 W-RUN — `jesl/workflow/jesl-run.ts` (F17, S4E)

The durable wrapper (DD10). `@effect/workflow` API surface is VERIFY-ON-INSTALL (DD24); the concept:

```
JeslRun = Workflow.make({
  id: "jesl-run",
  idempotencyKey: (input: {docHash: string, seed: string}) => input.docHash + ":" + input.seed,
  // DD10: docHash+seed BECAUSE replay equality — anything less re-pays, anything
  // more never replays (see 4.6.2 BECAUSE).
  execute: (input) => Effect.gen(function* () {
    // each effectful node invocation = Activity("node:" + node.id)
    // pause           = DurableDeferred ask
    // channel math BETWEEN Activities = deterministic replay fodder
  })
})
```

---

### 4.14 M-BRG — the MPSE bridge (`jesl/mpse/`, F18, P2)

The compiler of the pipeline insertion (DD14). Six modules per C4.

#### 4.14.1 Diagram

```
 MPSE spec .md (fenced ```math / ```oracle / ```contract / ```profile blocks)
        |
        v
 parser.ts --CORPUS_UNREADABLE/CORPUS_EMPTY--> blocks[]
        |
        v
 rule-cards.ts --D13 validateCard: quote re-finds at anchor--> RuleCard[]
        |                                            \
        v                                             v
 oracle-compile.ts --> oracle-gate rows (provenance      kernel-emit.ts --> coverage matrix
                       {source,line,quote})              (compose vs build per family)
                                                             |
                                                             v
                                                  workflow.json + ctx.json
                                                             |
                                     build-gap families ----> stub-emit.ts
                                                             |
                                                             v
                                                  typed Effect Activity stubs
                                                             |
 calibrate.ts <------------------------------------------------+
   D17 2x2: FIRED∧SILENT=CALIBRATED else EXCLUDED_BORN_OFF
   A3 hostile-corpus structural scan (no exec/run/spawn in predicates)
```

#### 4.14.2 `### kernel-emit.emit — the coverage matrix + decomposition`

```
METHOD emit(spec) -> Effect<{workflow, ctx, stubs}, JeslError, FileSystem>
  1. families = clusterFRsByMathFamily(spec.fencedMath)   // 24-kind grammar walk
  2. for family of families:
       covered = registryKindsSatisfying(family.mathExpr)
         // a kind satisfies when its channel contract + verdict semantics
         // discharge the family's oracle rows (compose path)
       if covered.nonEmpty:
         matrix.addRow({ family, decision: "compose", kinds: covered })
       else:
         matrix.addRow({ family, decision: "build", stub: stubTemplate(family) })
  3. workflow = assembleWorkflow(matrix):
       compose families -> wired existing kinds (edges via channel contracts)
       build families   -> Activity stub nodes with the MathExpr contract
         embedded as each stub's GATE (K14: unproven substrate stays SPEC-GATED)
  4. ctx.json = { oracleRows, bindings, profile }
  5. stubs   = stubEmit.emit(buildFamilies)  // typed Effect Activities
  6. dry-run = yield* TestLive.run(workflow, ctx)   // DETERMINISTIC NODES EXECUTE
       // D1-D9 derailments surface PRE-BUILD at zero cost (DD14 rationale)
  7. RETURN { workflow, ctx, stubs, matrix, dryRunVerdict }
```

---

### 4.15 KERN-6 — the lifecycle kernels (`jesl/kernels/`, F19, P3)

Six seeds, each `SKILL.md + workflow.json + ctx.json + activities.ts + fixtures/`. The journal chains across 1→6 (R10).

```
 (1) idea-to-bible: parallel(explore) -> merge machine -> shadow-tool(cs T2) -> schema-gate -> journal
 (2) bible-to-spec: digest -> FR extraction (lexicon) -> math-contract lint -> DPL1 template gate
 (3) spec-to-kernels: fenced-math parse (D13) -> oracle-row compile -> FR->workflow
                      decomposition -> Activity stub emission -> D17 calibration -> dry-run replay
 (4) kernels-to-code: stub inventory -> subagent-dispatch (bracketed) -> per-stub
                      oracle-gate -> journal
 (5) verify: container-suite workflow (scenarios as parallel + oracle rows;
             passToken tool-result-bound; .trident/container-test-results.json)
 (6) ship: manifest -> copy -> docs -> audit gates as the pipeline
```

The cross-kernel ledger: each kernel's terminal journal-sink writes `source: workflow/<kernel>/<node>`; kernel N+1's replay-source reads kernel N's tail — ONE sha256-linked chain from idea to shipped dist.

---

### 4.16 PKG — the packager (`jesl/packager/`, F20, S5E)

- **tool.ts** — emit a single frozen-front opencode tool wrapping `jesl run`.
- **chain.ts** — emit N tools + module context + gatekeeper args (the T1 law: output-contracted args ARE the gatekeeper).
- **skill.ts** — emit the rocket directory per F26 (the full payload manifest). Emitted artifacts re-validate through WorkflowCodec (criterion 9: the three targets re-validate and run).

---

### 4.17 PROF + BIND (F21/F22, P4)

Profiles are DATA (the Paragon_V2 DomainModule pattern: three profiles — trident/trading/sales — one engine, zero profile-id branches). Bindings implement the ParagonHostBinding contract (4.11.3). Universality gate: grep for profile names in engine code must return zero.

---

### 4.18 What this design does NOT fix (contract C8 — blind-spot ledger)

1. **The v4.4.4 γ-layer target may not exist as code** (G7): Poseidon-as-Workflow and Hydra-on-EventBus are specified against the v4.4.4 SPEC text; if v4.4.4 remains spec-stage, the γ kernels run against the v4.4.2 machinery's binding surface instead — the spec does not conjure a host.
2. **Semantic-search/docs-patterns stay honest stubs** (G10): SEMANTIC_UNAVAILABLE/DOCS_UNAVAILABLE throws persist; no embedding surface is specified here.
3. **Tier-2 replay is journaled-record replay, not byte-determinism** (G13): two LIVE runs of the same LLM doc differ; only the no-re-pay guarantee holds.
4. **@effect/workflow's exact API** is VERIFY-ON-INSTALL (DD24) — the concept is pinned, the import path is not.
5. **Host event-name drift**: the 1.14.51 `message.part.updated` wiring is pinned to that runtime version; a future SDK rename lands as a silent dead scanner until the discovery probe (event-filter step 3) surfaces zero-match — the probe is the mitigation, not a fix.
6. **No GUI/mermaid editor, no tsserver fork** — authoring stays JSON-in-editor (K17 by design).
7. **Rocket journals are ephemeral-run-scoped** (`.trident/rockets/<run-id>.jsonl`): no cross-rocket analytics layer is specified.

---

## 5. DATA MODEL

### 5.1 The WorkflowDoc schema (`$schema: trident-workflow-v1`)

```typescript
export interface WorkflowDoc {
  readonly $schema: "trident-workflow-v1"          // versioned (K13); v1 docs run forever
  readonly meta: {
    readonly name: string                          // workflow/<name>/ journal discriminator
    readonly tier: 1 | 2 | 3                       // declared determinism class (DD1: auditable, not a boundary)
    readonly requiresSeed: boolean
    readonly declaredCaps?: ReadonlyArray<string>  // authoring hint (schema step 8)
    readonly timeoutMs?: number                    // run-level default
  }
  readonly triggers: ReadonlyArray<string>         // externally-seeded channel names
  readonly nodes: ReadonlyArray<NodeEnvelope>
  readonly edges: ReadonlyArray<EdgeDecl>
  readonly oracle?: ReadonlyArray<OracleRowDecl>   // doc-local registry (ctx registry unions)
}
```

### 5.2 The universal node envelope (§2.2 grammar, verbatim fields)

```typescript
export interface NodeEnvelope {
  readonly id: string
  readonly type: string                            // registry kind — append-only set (4.7.2)
  readonly class?: "deterministic" | "execution" | "generation"   // redundant w/ registry: cross-checked
  readonly on: {
    readonly schema?: string                       // output contract ref — REQUIRED for generation (tier-2)
    readonly repair?: 0 | 1 | 2                    // bounded repair edges — <= 2 (G14)
    readonly retries?: number
    readonly timeoutMs?: number
    readonly [configKey: string]: unknown          // the kind's own config (per 4.10)
  }
}
```

`on.repair ≤ 2` BECAUSE the unbounded-repair derailment (G14): each repair round is a generation→gate→repair cycle costing an LLM round-trip; 2 rounds cover the observed fix-then-verify-then-fix-again pattern, while a third is the signature of a wrong premise that more rounds only compound.

### 5.3 Edges + channels

```typescript
export interface EdgeDecl {
  readonly from: string        // node id (or "__seed")
  readonly to: string          // node id
  readonly via: string         // THE channel name — the edge IS a channel write (D4)
}
```

Dataflow readiness is computed ONLY from `via` sets (4.2). There is no `order` field, no `after` list — position is not semantics.

### 5.4 The journal row (the run's single artifact — D5)

See 4.6.1 for the full frozen interface. Invariants (all mechanically checked by `verifyShaChain`):

1. `row[0].prev === ""`; `row[n].prev === row[n-1].self` for n ≥ 1.
2. `self = sha256(canonicalSerialize(row minus self))` with RECURSIVELY SORTED KEYS.
3. `source` always matches `workflow/<meta.name>/<nodeId | __run | __repair>`.
4. Every `invoke` row has a matching `verdict` or `error` row before run-terminal (K7: no node fires without journaling).
5. `evidence` is the triplet `{pattern, state, anchor}` — anchorless findings are deleted upstream (triplet-writer law).

### 5.5 RunContext + NodeResult (C10 verbatim, frozen shapes)

```typescript
export interface RunContext {
  readonly runId: string
  readonly doc: WorkflowDoc                     // frozen (4.1 step 9)
  readonly channels: Channels
  readonly journal: Journal
  readonly bus: EventBus
  readonly caps: CapsContext                    // the provided Context = R (DD3)
  readonly clock: ClockCap                      // TestClock | live clock
  readonly budget: {
    readonly deadlineMs: number
    readonly maxNodesFiring: 15                 // K9/E6 — see 4.5 BECAUSE
  }
  readonly vars: Readonly<Record<string, unknown>>   // ctx.json + --in merge
}
export interface NodeResult {
  readonly verdict: "PASS" | "FAIL" | "INCONCLUSIVE" | "READY_FALSE"
  readonly outputs?: Readonly<Record<string, unknown>>
  readonly error?: StructuredError               // {code,node,field,expected,actual,remedy}
  readonly evidence: { readonly pattern: string; readonly state: string; readonly anchor: string }
  readonly timing: { readonly startMs: number; readonly endMs: number }
}
```

RunContext is SERIALIzABLE (the resume artifact): doc bytes + runId + seed + fired set serialize; services re-bind on resume from the driver Layer.

### 5.6 Seed semantics (C10)

| driver | seed source | channel/vars |
|---|---|---|
| CLI | `--in '{...}'` + positionals | writes `input` channel + merges `vars` |
| OpenCodeLive | hook event bridge | bus event + `trigger` channel |
| watcher | fs event | `watch.<path>` channel |
| cron | cron-trigger | its declared channel |
| unseedable | — | `[JESL NO-SEED]` loud, never a hang (K8) |

### 5.7 The MathExpr IR + oracle rows (R4)

MathExpr is the 24-kind grammar (`expr.ts:18-40`): literals, arith, compare, logic, set ops, quantifiers, temporal (`prev/eventually/globally/until`). JESL math-family nodes COMPILE to it — the JSON never grows an expression grammar (DD8). Oracle row format: `|OR-n|scope|O1/O2/O3|op|...|` with provenance `{source, line, quote}` (D13 anchors). Discharge table (4.10.4 oracle-discharge): integer eq / float+epsilon / NaN→CONTRADICTED / unregistered→UNVERIFIABLE.

### 5.8 The rocket payload manifest (F26 — the skill.ts emit target)

```
.opencode/skills/<rocket>/
  SKILL.md                    identity + when-to-fire + launch line (the fuse)
  payload/ctx.json            preloaded context (frozen knowledge, contract paths)
  payload/mission.md          the prompt (objective/constraints/success shape)
  payload/anti-patterns.json  MACHINE DATA: {family, descriptive[], suggestive[], substitute[], use[]}
                              — consumable as PTA layer banks (K12)
  payload/schemas/input.schema.json + output.schema.json
  payload/workflow.json       the JESL graph with ${ctx} slots
  payload/activities.ts       typed Effect Activity stubs, MathExpr gate embedded
  payload/engines/            pre-built micro-execution kind refs (document-writer, matrix-calculator...)
  payload/tests/              fixtures + oracle rows + TestLive suite template
journal -> .trident/rockets/<run-id>.jsonl
```

Anti-patterns as `{family, descriptive[], suggestive[], substitute[], use[]}` BECAUSE the 4-bank runtime form is what ms-ratio scores; prose anti-pattern lists are unreadable by machines and would dead-end at the PTA boundary (K12).

### 5.9 ctx.json invariants

Merged `doc + ctx + --in` in that precedence; `vars` values are JSON scalars/arrays/objects only; `${ctx.*}` slots resolve at node-config load (4.4.2); unresolved REQUIRED slot = CHANNEL-UNSET; ctx is hashed into the seed half of the idempotencyKey.

---

## 6. INTEGRATION PLAN

### 6.1 Wave map + slice gates (FILE INVENTORY ownership, verbatim order)

```
P0  docs wave (DW1 DW2)                      gate: Phase-2 §5 nine-questions probe 9/9 yes
S1E core + F1-F11                           gate: tsc 0; it.effect battery; tokens identical;
                                                  diamond in 2 batches
S2E F12-F13                                 gate: criteria 3,4,6,8 on the host (headless run to verdict)
S3E F14-F15                                 gate: criterion 11 + ask-launcher roundtrip in-container
S4E F16-F17                                 gate: §7 + no re-pay on generation replay
S5E packager F20                            gate: criterion 9 (3 targets re-validate + run)
S6E battery F23-F25                         gate: 10/10 + replay determinism + kill-resume
S7P Paragon wrap                            gate: the S10 fixture end-to-end
S8L LSP gate                                gate: write .ts -> diagnostics token in journal; patch in prepare
P2  MPSE bridge F18                         gate: demo-spec.mpse.md compiles to oracle rows + runnable
                                                  workflow + stubs; D17 EXCLUDED_BORN_OFF reproduced
P3  lifecycle kernels F19                   gate: per-kernel fixtures + journal chain across 1->6
P4  profiles + bindings F21-F22             gate: 3 profiles, 1 engine, 0 profile-id branches
P5  full battery + boilerplate extraction   gate: 10/10 + copy-and-customize dry-run
```

K15 governs: this spec authorizes the docs wave + planning ONLY; no `bun init`, no deps, no scaffolding before the operator's explicit go ("dont build it just spec it", twice).

### 6.2 The pipeline insertion (DD14 — against v4.4.4 §2:106)

```
Idea -> Bible (3 loops) -> MPSE Spec (3 loops) -> [MACRO KERNEL PROTOTYPES] -> Code Specs (3 loops, parallel) -> Poseidon -> Ship
                                                    ^ THE INSERTION (agent-autonomous, NO user loop)
                                                    map MathExpr families -> coverage matrix (compose|build)
                                                    emit workflow.json + ctx.json + Activity stubs per gap
                                                    compile oracle rows from the MPSE spec
                                                    DRY-RUN REPLAY on TestLive (deterministic nodes EXECUTE
                                                      pre-code; D1-D9 surface at zero cost)
```

Code specs then specify ONLY the delta: which kernels compose, which stubs to fill, language/architecture for the gaps — each referencing the MathExpr blocks it implements and the bible sections it fulfills. K11 constraints carry verbatim: natural language until bible FINALIZED by direct user approval; MPSE has NO user feedback; the insertion adds NO user loop; Poseidon builds only after code specs approve with MPSE as verification substrate + bible as macro context.

### 6.3 The four effect layers (DD16) + v4.4.4 slotting

```
alpha  pipeline self-hosting : kernels 1-6 ARE Effect programs; compiler = services;
                               pipeline runs on the kernel it produces (from slice P3)
beta   rocket propulsion     : workflow.json is dead paper until the kernel runs it;
                               driver choice = Layer stack bound at ignition
gamma  build supervision     : PBA/PTA/LSP services on ONE EventBus; God Loop 13 phases
                               = ONE Workflow.make; XState §25 machines = PROJECTORS
                               (they render, Effect runs — DD13); WorktreeIsolator =
                               scoped fiber resource
delta  verification plane    : every payload test suite on TestLive (TestClock +
                               InMemoryJournal + ScriptedToolkit + MemoryFs); §7 battery,
                               S9 replay, oracle discharge — verdicts read FROM journal rows
```

v4.4.4 layer map: Effect slots at Layer 0 (buildTool factory, hook registry, StateDB 13 tables, CAS as services/caps — the immutable shell UNTOUCHED), re-emerges at Layer 2 (Poseidon-as-Workflow, Hydra messages as EventBus traffic, WorktreeIsolator as scoped fiber) and Layer 3 (Self-Verifier actors, LSP gate). "THE SHELL STAYS. THE INTERNALS GET TURBO-CHARGED."

### 6.4 Cross-check matrix (mechanical, in the battery)

| check | method | gate |
|---|---|---|
| F9 ↔ F28 tokens | bidirectional grep `"[JESL ` | zero orphans |
| F7/F10 kinds ↔ DW1 catalog | three-surface diff | never diverge |
| Activity names ↔ journal kinds | `node:<id>` ↔ row.kind | replay index complete |
| F8 caps ↔ driver bindings | tag-level diff | no orphan caps |
| MathExpr at bridge ↔ 24-kind grammar | grammar walk | no extension |
| core purity (K2) | ripgrep zero `globalFetch|Date.now|node:fs|fetch\(|setTimeout|Math.random` in `jesl/core/**` + verifyImportGraph | criterion 13 |
| LSP diagnostics | effect-language-service CLI exit 0 on repo | criterion 14 |

### 6.5 Dependency + install plan (F24, K16, DD24)

```jsonc
// jesl/package.json (PROPOSED exact keys; versions VERIFY-ON-INSTALL)
{
  "name": "macro-kernel-edition", "type": "module",
  "dependencies": {
    "effect": "PROPOSED: latest-3.x",
    "@effect/platform": "PROPOSED: peer-matched",      // -node or bun variant verified at S2E
    "@effect/vitest": "PROPOSED: peer-matched",
    "@effect/language-service": "PROPOSED: peer-matched",
    "@effect/workflow": "PROPOSED: peer-matched",      // surface VERIFY-ON-INSTALL (S4E)
    "@effect/ai": "PROPOSED: peer-matched"             // from S4E (call-model)
  },
  "scripts": { "test": "bun test", "typecheck": "tsc --noEmit", "check:isolation": "verifyImportGraph src/" },
  "prepare": "apply language-service patch"            // DD12 — tsc carries the family diagnostics
}
```

zod remains ONLY at the OpenCode/JSON edge for one slice, then decodes into Effect Schema (D15 dual-run; authoring still refuses with the same tokens). No Rust; no grok-build code reuse (S7 contamination guard — correspondence only).

### 6.6 Acceptance wiring (the 16 criteria + 10/10)

Criteria 1-12 per the DPL1 (tsc 0; battery 0-fail; malformed refuse with named tokens; deterministic doc runs headless to verdict PASS; replay byte-determinism; CAP-UNBOUND loud with NO artifact; parallel overlapCount ≥ 1 with all verdict rows; skill via bash end-to-end

## SECTION 7 — TEST SPECIFICATIONS

> Canon: "Math is the spec. Code is the implementation. Tests are the proof." Every test in this section asserts against **journal rows and tool-result artifacts, never prose**. A verdict is a row. A claim without a row is theater. The battery defined here is the closure artifact for gaps G6, G8, G9, G13, G14, G15 (see §9.4).

---

### 7.0 Test Philosophy — The Proof Chain

The test architecture follows five load-bearing laws drawn from the source canon:

1. **Verdicts are computed FROM journal rows** (C5 executor contract). No test asserts on a node's return value alone; the assertion target is the journal row set for the run (`verdict`, `evidence{pattern,state,anchor}`, `source:"workflow/<name>/<node>"`). This kills the "2614-finding class" — prose-judged runs (G14 operational ledger).
2. **passTokens are tool-result-bound** (K19). A pass token is an exit code, a stdout JSON field, an on-disk artifact content string, or a journal row field — never an agent-typeable phrase. "structural PASS", "PASS by design", "PASS (source inspection)" are FLAWED verdicts (Warhead 8).
3. **Tokens, not counts** (G15, the MNI-3 lesson). The Paragon container plan's pre-run estimates were wrong on 5/10 scenarios (20/17/9/26/43 guessed vs 16/18/10/32/56 true). Every passToken names a TOKEN STRING; counts are read from the run artifact after execution, never pre-guessed in the plan.
4. **TestLive is the only world** (δ layer, DD16). Every payload suite, every unit, every replay fixture runs on the TestLive Layer stack: TestClock + InMemoryJournal + ScriptedToolkit + MemoryFs. Zero network, zero Docker, zero wall-clock dependence. Deterministic by construction.
5. **Adversarial-first ordering** (Warhead 13). Within every suite, failure-mode fixtures run BEFORE happy paths. The happy path is the post-debug confirmation, run last.

```
PROOF CHAIN (one direction, no exceptions):

   MathExpr spec ──compile──> oracle-gate rows ──execute──> journal rows ──assert──> verdict
        │                            │                          │
   (the claim)              (the checkable form)         (the observed truth)
                                                                │
                                            assert happens HERE ─┘
                                            NEVER against agent prose
```

---

### 7.1 The Test Harness — TestLive Layer Stack

The harness is a driver (F12-family) composed of four services plus the workflow engine Layer. It mounts identically for unit tests (`@effect/vitest` `it.effect`), payload suites (`payload/tests/`), and the container battery's deterministic legs.

#### 7.1.1 Full Interface Definitions

```typescript
// jesl/drivers/testlive.ts — the TestLive Layer composition root

import { Effect, Layer, Ref, TestClock, Chunk } from "effect"

// ─── ScriptedToolkit: records every cap invocation, replays scripted outcomes ───
export interface ScriptedCall {
  readonly cap: "shell" | "llm" | "tool" | "subagent" | "http" | "fs" | "emit"
  readonly node: string              // the invoking node id
  readonly args: unknown             // frozen arg snapshot (post-schema-decode)
  readonly at: number                // TestClock millis at invocation
}

export interface ScriptedStep {
  readonly match: { cap: string; node?: string; argsContains?: unknown }
  readonly outcome:
    | { kind: "ok"; value: unknown }
    | { kind: "fail"; error: { _tag: string; code?: string } }
    | { kind: "exile" }              // simulates HTTP 429 → exile-next-rung class
    | { kind: "retry5xx"; times: number } // simulates 5xx → retry 2.5s class
  readonly consumed: boolean         // one-shot steps unmatch after consumption
}

export interface ScriptedToolkit {
  readonly calls: ReadonlyArray<ScriptedCall>       // append-only audit surface
  readonly invokeCount: (node: string) => number     // S9's counter primitive
  readonly script: (steps: ReadonlyArray<ScriptedStep>) => Effect<void>
  readonly reset: Effect<void>
}
export const ScriptedToolkit = Context.GenericTag<ScriptedToolkit>("jesl/test/ScriptedToolkit")

// ─── InMemoryJournal: the Journal.Service contract, RAM-resident, kill-injectable ───
export interface InMemoryJournal {
  readonly rows: ReadonlyArray<JournalRow>           // the sha256-chained rows
  readonly rowsFor: (node: string) => ReadonlyArray<JournalRow>
  readonly chainValid: Effect<boolean>               // recompute prev/self links
  readonly truncateAfter: (seq: number) => Effect<void>  // the kill -9 simulator:
                                                        // drops rows past seq, simulating
                                                        // an unflushed tail
  readonly lastCompleteSeq: Effect<number>           // resume anchor
}
export const InMemoryJournal = Context.GenericTag<InMemoryJournal>("jesl/test/InMemoryJournal")

// ─── MemoryFs: path-scoped, write-scope-law-enforcing ───
export interface MemoryFs {
  readonly files: ReadonlyMap<string, Uint8Array>
  readonly writeAttempts: ReadonlyArray<{ path: string; allowed: boolean }>
  readonly setRoot: (root: string) => Effect<void>   // realpath+resolve+startsWith(root+sep)
}

// ─── The Layer composition ───
export const TestLive: Layer.Layer<FileSystem | Shell | Journal | HttpClient | Llm | ToolClient | Subagent> =
  Layer.mergeAll(
    MemoryFsLive,               // FileSystem + the write-scope guard
    StubShellLive,              // Shell → ScriptedToolkit
    InMemoryJournalLive,        // Journal.Service → InMemoryJournal
    StubHttpLive,               // HttpClient with 429/5xx injection via ScriptedStep
    StubLlmLive,                // Llm cap → scripted generations (tier-2 replay source)
    StubToolClientLive,         // ToolClient → ScriptedToolkit
    StubSubagentLive            // Subagent → ScriptedToolkit
  )
```

**Layer composition rationale (why these four and no fifth):** the caps union (F8) is exactly `shell | llm | tool | subagent | http | fs | emit`; `emit` is the EventBus which the engine Layer provides in all drivers. TestLive therefore swaps 100% of the world; a test that accidentally reaches a real socket fails with `[JESL CAP-UNBOUND]`-class noise only if a cap was never provided — which is itself a test (criterion 6).

#### 7.1.2 Harness ASCII Data-Flow

```
              ┌────────────────────────── TestLive Layer ──────────────────────────┐
              │                                                                      │
  it.effect ──► Workflow.execute(doc, ctx)                                           │
              │        │                                                             │
              │        ▼                                                             │
              │   Executor readiness loop ── Effect.forEach(concurrency:15)          │
              │        │                    stagger TestClock.advance(1s..3s)        │
              │        ▼                                                             │
              │   node:<id> Activity invoke ──► cap call ──► ScriptedToolkit         │
              │        │                             │ records ScriptedCall          │
              │        │                             ▼ returns ScriptedStep.outcome  │
              │        ▼                                                             │
              │   InMemoryJournal.append(row) ── sha256(prev ⊕ payload)             │
              │        │                                                             │
              │        ▼                                                             │
              │   MemoryFs.write (scope-guarded)                                     │
              └──────────────────────────────────────────────────────────────────────┘
              │                                     │
              ▼                                     ▼
      expect(rowsFor(node))              expect(invokeCount(node)).toBe(0)
```

#### 7.1.3 Harness Peer Interaction Table (C6)

| Component | ScriptedToolkit | InMemoryJournal | MemoryFs | TestClock | Engine Layer |
|---|---|---|---|---|---|
| ScriptedToolkit | — | journal rows record cap invocations for replay indexing | — | reads `at` | provides caps to |
| InMemoryJournal | consumes nothing | — | persists nothing (RAM) | ts from TestClock | implements Journal.Service for |
| MemoryFs | write attempts logged as ScriptedCall(cap:"fs") | file-io verdict rows | — | — | provides FileSystem to |
| TestClock | stamps `at` | stamps `ts` | — | — | drives stagger/timeouts deterministically |
| Engine Layer | binds stubs as caps | binds as Journal | binds as Fs | — | — |

---

### 7.2 Unit Battery — Per-Core-Service Specifications

Every spec below: **arrange → act → assert with concrete `expect()` calls**. All under `@effect/vitest` (`it.effect`). File home: `jesl/test/unit/<service>.test.ts` (F23).

#### 7.2.1 `core/schema.ts` — The Eight-Token Refusal Battery

**Contract under test:** `WorkflowCodec.decodeUnknown(input): Effect<WorkflowDoc, JeslError, never>` emits the frozen `[JESL ...]` tokens (K3) with `{code, node, field, expected, actual, remedy}`.

The fixture corpus is the F28 cross-matrix — eight fixtures, eight tokens, zero orphans in either direction:

| Fixture file | Expected token | Expected `field` | Expected `remedy` contains |
|---|---|---|---|
| `fixtures/bad-unknown-kind.json` | `[JESL UNKNOWN-NODE]` | `nodes[i].type` | `"registered kinds"` |
| `fixtures/bad-cycle.json` | `[JESL CYCLE]` | `edges` | `"break the cycle or mark rearm"` |
| `fixtures/bad-tier.json` | `[JESL TIER-VIOLATION]` | `nodes[i].type` vs `meta.tier` | `"bracket the generation or raise tier"` |
| `fixtures/bad-unbracketed.json` | `[JESL UNBRACKETED-GENERATION]` | `nodes[i]` | `"gate + repair≤2 + confidence floor"` |
| `fixtures/needs-llm.json` | `[JESL CAP-UNBOUND]` | `nodes[i].requiredCaps` | `"provide the llm Layer or rebind the node"` |
| `fixtures/bad-no-seed.json` | `[JESL NO-SEED]` | `channels.$.input` | `"seed via --in, argv, or trigger"` |
| `fixtures/bad-channel-unset.json` | `[JESL CHANNEL-UNSET]` | `nodes[i].on` | `"edge.via names the channel"` |
| `fixtures/bad-oracleless.json` | `[JESL ORACLE-MISSING]` | `nodes[i].rows` | `"compile oracle rows from the MPSE spec"` |

**Threshold:** `concurrency:15` does NOT apply here — decode is sequential by contract (a single `Schema.decodeUnknown` pass); ordering of diagnostics is file-order-stable.

```typescript
// jesl/test/unit/schema.test.ts — pseudocode with concrete expects
describe.each(tokenFixtures)("token %s", (fx) => {
  it.effect("refuses with the frozen string and structured fields", () =>
    Effect.gen(function* () {
      const raw = yield* readFixtureJson(fx.file)             // MemoryFs read
      const result = yield* WorkflowCodec.decodeUnknown(raw).pipe(Effect.either)
      expect(Either.isLeft(result)).toBe(true)
      const err = Either.getLeft(result)
      // THE token assertion — byte-exact, the K3 freeze:
      expect(err.code).toBe(fx.token)                          // e.g. "[JESL CYCLE]"
      expect(err.node).toBeDefined()
      expect(err.field).toBe(fx.field)
      expect(err.remedy).toContain(fx.remedyFragment)
      // The structured shape (D15: code field PRINTS the exact token):
      expect(Object.keys(err).sort()).toEqual(
        ["code", "node", "field", "expected", "actual", "remedy"].sort())
    }))
})

it.effect("a valid doc decodes with zero diagnostics", () =>
  Effect.gen(function* () {
    const doc = yield* WorkflowCodec.decodeUnknown(validMechGateDoc)
    expect(doc.$schema).toBe("trident-workflow-v1")            // K13 versioned schema
    expect(doc.nodes.length).toBeGreaterThan(0)
  }))
```

**Token stability is the migration proof (S1E gate):** the same fixtures that passed against the zod-era decoder (JESL DPL1 v1.0 §7 fixture set) MUST emit byte-identical token strings after the Effect Schema migration (DD22). The S1E gate command is the bidirectional grep (§9.6): every token in `core/errors.ts` ↔ exactly one fixture; every fixture ↔ exactly one token in `core/errors.ts`.

#### 7.2.2 `core/graph.ts` — Readiness Diamond, Cycle Partition, Batch Shape

**The readiness diamond fixture** (the canonical concurrency shape):

```
            $.seed
           /      \
      node.A      node.B        ← batch 1 (both inbound = {$.seed})
           \      /
            node.C              ← batch 2 (inbound = {$.out.a, $.out.b})
               |
            node.D              ← batch 3 (gate terminal)
```

```typescript
it.effect("diamond partitions into exactly 2 parallel batches before the join", () =>
  Effect.gen(function* () {
    const doc   = yield* WorkflowCodec.decodeUnknown(diamondDoc)
    const graph = yield* Graph.build(doc)                     // Effect.sync-wrapped pure
    const batches = graph.parallelBatches()
    expect(batches.length).toBe(2)                            // [A,B] then [C]; D terminal
    expect(batches[0].map(n => n.id).sort()).toEqual(["node.A", "node.B"])
    expect(graph.inboundChannels("node.C").sort())
      .toEqual(["$.out.a", "$.out.b"])                        // readiness = channel SET
    expect(graph.isTerminal("node.D")).toBe(true)
  }))

it.effect("cycle detection names every node on the cycle", () =>
  Effect.gen(function* () {
    const either = yield* Graph.build(cycleDoc).pipe(Effect.either)
    expect(Either.isLeft(either)).toBe(true)
    expect(Either.getLeft(either).code).toBe("[JESL CYCLE]")
    expect(Either.getLeft(either).actual).toContain("node.X")  // the cycle membership
  }))
```

**Threshold:** `parallelBatches()` has **no batch-size cap** at the graph layer — cap 15 lives in the executor. BECAUSE: the graph is a pure projection; conflating partition shape with execution concurrency would make batch assertions driver-dependent and would hide executor overload from the graph's test surface. At cap-1 less (14) the executor would serialize the diamond's sibling pair and the overlap test (7.2.5) would flake on scheduling; at cap+1 more (16) the stagger budget grows past the S6E container wall-clock comfort without adding coverage — 15 is carried from the source canon (C5: `Effect.forEach(cap 15)`), where it was sized against the wave-manager's observed concurrent-agent comfort (4 active runs × ~4 agents each) with headroom.

#### 7.2.3 `core/bus.ts` — Isolation, Glob, Detach

```typescript
it.effect("a throwing handler never kills the emitting node nor mutates the event", () =>
  Effect.gen(function* () {
    const bus = yield* EventBus.make()
    const seen: unknown[] = []
    yield* bus.on("tool.call.*", (ev) => Effect.sync(() => { seen.push(ev); throw new Error("boom") }))
    const emitted = yield* bus.emit("tool.call.bash", { cmd: "ls" })
    expect(emitted).toEqual({ type: "tool.call.bash", payload: { cmd: "ls" } }) // un-mutated
    expect(seen.length).toBe(1)                                // handler RAN, isolated
    // observer law: the emit itself succeeded despite the handler throw
  }))

it.effect("glob 'pba.*' does not match 'pta.*'", () =>
  Effect.gen(function* () {
    const bus = yield* EventBus.make()
    const hits: string[] = []
    yield* bus.on("pba.*", (ev) => Effect.sync(() => hits.push(ev.type)))
    yield* bus.emit("pta.intercept", {})                       // wrong family
    yield* bus.emit("pba.family.hit", { family: "TEST_EVASION", conf: 0.61 })
    expect(hits).toEqual(["pba.family.hit"])
  }))

it.effect("detach-on-terminal: after Scope close, no further deliveries", () =>
  Effect.gen(function* () {
    // Scoped fiber resource law (K9): session end detaches bus handlers
    ...scope closed...
    yield* bus.emit("anything", {})
    expect(hits.length).toBe(0)
  }))
```

#### 7.2.4 `core/channels.ts` — Path Resolution & CHANNEL-UNSET

```typescript
it.effect("$. JSON-path walks with optional chains and ?? '' defaults", () =>
  Effect.gen(function* () {
    const ch = yield* Channels.make({ ctx: { root: "/w", pkg: { name: "jesl" } } })
    yield* ch.write("$.out.a", { n: 1 })
    expect(yield* ch.read("$.out.a.n")).toBe(1)
    expect(yield* ch.read("$.ctx.pkg?.missing?.x ?? ''")).toBe("")
  }))

it.effect("${ctx.x} template resolution from ctx.json + --in", () =>
  Effect.gen(function* () {
    const ch = yield* Channels.make({ ctx: { root: "/w" }, input: { seed: 7 } })
    expect(yield* ch.resolve("${ctx.root}/dist")).toBe("/w/dist")
    expect(yield* ch.resolve("run-${in.seed}")).toBe("run-7")
  }))

it.effect("an unset inbound channel refuses LOUD at THAT node, not run-wide", () =>
  Effect.gen(function* () {
    // fire node.K whose `on` names $.never.written
    const rows = yield* runToFailure(badChannelUnsetDoc)
    const row = rows.find(r => r.node === "node.K")
    expect(row.verdict).toBe("FAIL")
    expect(row.error.code).toBe("[JESL CHANNEL-UNSET]")
    expect(row.evidence.anchor).toContain("$.never.written")
    // sibling nodes that WERE ready still have verdict rows (isolation)
    expect(rows.some(r => r.node === "node.A" && r.verdict === "PASS")).toBe(true)
  }))
```

#### 7.2.5 `core/executor.ts` — Overlap, Retry Class, Output Gate

```typescript
it.effect("parallel siblings overlap: overlapCount >= 1 with all verdict rows present", () =>
  Effect.gen(function* () {
    const tk = yield* ScriptedToolkit
    // both siblings park for 50ms (TestClock) — overlap is provable, not hoped
    yield* tk.script([
      { match: { cap: "shell", node: "node.A" }, outcome: { kind: "ok", value: park(50) } },
      { match: { cap: "shell", node: "node.B" }, outcome: { kind: "ok", value: park(50) } },
    ])
    const run = yield* Workflow.execute(parallel5Doc, ctx).pipe(Effect.scoped)
    const [a, b] = [tk.calls.find(c => c.node === "node.A"), tk.calls.find(c => c.node === "node.B")]
    expect(a && b).toBeTruthy()
    const overlap = Math.min(a.at + 50, b.at + 50) - Math.max(a.at, b.at)
    expect(overlap).toBeGreaterThanOrEqual(1)                  // criterion 7
    expect(run.rows.filter(r => r.verdict).length).toBe(parallel5Doc.nodes.length)
  }))
```

**`overlapCount >= 1` threshold BECAUSE:** overlap of at least 1 TestClock millisecond proves the two fibers were resident concurrently — this is the mechanical kill for the Promise.all-wave-kill class (G14) and the "sequential-where-parallel" anti-pattern (law 1F). Requiring more (e.g. ≥25ms) would couple the assertion to stagger jitter; requiring 0 would pass under accidental serialization, which is exactly the failure mode the criterion exists to catch. The 50ms park is chosen because stagger is 1–3s and park < stagger/20 guarantees the overlap window exists regardless of phase, while remaining far below any timeoutMs floor.

```typescript
it.effect("429 → exile-next-rung: NO in-place retry, next attempt lands after EXILE_MS", () =>
  Effect.gen(function* () {
    const tk = yield* ScriptedToolkit
    yield* tk.script([
      { match: { cap: "http", node: "node.H" }, outcome: { kind: "exile" } },
    ])
    yield* Workflow.execute(retryChainDoc, ctx).pipe(Effect.scoped)
    const calls = tk.calls.filter(c => c.node === "node.H")
    expect(calls.length).toBe(1)                               // NO retry storm
    // the retry-chain node's NEXT rung fired after the exile window:
    expect(tk.calls.some(c => c.node === "node.H.fallback")).toBe(true)
  }))
```

**Exile not retry-in-place BECAUSE (EXILE_MS 45000, carried from rpm-ledger.ts):** the source canon measured provider quota behavior at nvidia 40 / opencode 200 RPM; in-place retry at 2.5s against a 429 produces a retry storm that exhausts the shared ledger — the storm was the observed production failure. 45s exceeds one full quota window at the observed rates with margin, so the exiled rung's next attempt lands in a fresh window. The S9/S2E tests assert the CALL COUNT (exactly 1), not the wall time — TestClock makes the 45s free.

```typescript
it.effect("5xx → retry class 2.5s: retries exactly `times`, then falls", () =>
  Effect.gen(function* () {
    yield* tk.script([{ match: { cap: "http", node: "node.H" },
                        outcome: { kind: "retry5xx", times: 3 } }])
    ...
    expect(tk.calls.filter(c => c.node === "node.H").length).toBe(3)
    expect(rows.find(r => r.node === "node.H").verdict).toBe("INCONCLUSIVE") // fall-state, never PASS
  }))

it.effect("output gate: terminal node output that fails Schema.decode fails the run LOUD", () =>
  Effect.gen(function* () {
    // script the terminal prompt node to return schema-violating output
    ...
    expect(run.verdict).toBe("FAIL")
    expect(run.rows.at(-1).error.code).toBe("[JESL OUTPUT-CONTRACT]")      // schema_contract.rs pattern
  }))
```

#### 7.2.6 `core/journal.ts` — Chain, covers(), Crash Safety, Resume

```typescript
it.effect("rows form a valid sha256 chain: row.self == sha256(row.prev ⊕ canonical(row payload))", () =>
  Effect.gen(function* () {
    const j = yield* InMemoryJournal
    yield* runMechGate()
    expect(yield* j.chainValid).toBe(true)
    const rows = j.rows
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].prev).toBe(rows[i - 1].self)
      expect(rows[i].seq).toBe(i)                              // 1-indexed, gapless
    }
  }))

it.effect("covers(): same docHash+seed → journaled outputs replayed, Activities NEVER re-invoked", () =>
  Effect.gen(function* () {
    const tk = yield* ScriptedToolkit
    yield* Workflow.execute(tier1Doc, ctx).pipe(Effect.scoped)     // run 1
    const before = tk.invokeCount("node.A")
    yield* Workflow.execute(tier1Doc, ctx).pipe(Effect.scoped)     // run 2, same doc+seed
    expect(tk.invokeCount("node.A")).toBe(before)                   // S9: +0
    expect(yield* chainFingerprint()).toBe(run1Fingerprint)         // byte-identical chain
  }))
```

**covers() gate semantics BECAUSE (docHash+seed as the replay key):** the idempotency key is `docHash+seed` (DD10) rather than docHash alone BECAUSE two launches of the same rocket with different `--in` seeds are DIFFERENT runs — replaying run 1's outputs into run 2 would be silent data corruption (a FALSE SUCCESS of the cheapest kind). Hashing the canonical doc (contentId = sha256(NUL-joined), the Paragon canonical serialization) prevents key drift from JSON key reordering.

```typescript
it.effect("kill -9 crash safety: truncateAfter(seq) then resume completes with a valid chain", () =>
  Effect.gen(function* () {
    const j = yield* InMemoryJournal
    // run to completion, then simulate the unflushed tail of a SIGKILL:
    const full = yield* runMechGateCaptureRows()
    yield* j.truncateAfter(3)                                  // rows 4..N lost (unflushed)
    const resumed = yield* Workflow.resume(mechGateDoc, ctx).pipe(Effect.scoped)
    // resumed run re-executes ONLY nodes past the last complete row:
    expect(tk.calls.filter(c => ["node.C","node.D"].includes(c.node)).length)
      .toBe(resumedExpectedInvocations)
    expect(resumed.verdict).toBe(full.verdict)                 // same terminal verdict
    expect(yield* j.chainValid).toBe(true)                     // splice is chain-valid
  }))
```

**Crash-safe append design BECAUSE (fd flush per row):** each row is `write()` + `fsync` before the node's effects are considered durable — this is the grok journal.rs discipline (681L, append-only JSONL + SHA-256 request hashing) translated to the Fs cap. Without per-row flush, a kill between effect and flush loses the evidence row while the effect happened (the "no node fires without journaling" violation, K7). The truncateAfter simulator reproduces exactly that window deterministically — criterion 12.

#### 7.2.7 `core/registry.ts` — Append-Only

```typescript
it.effect("register is additive; removal and rename are structurally impossible", () =>
  Effect.gen(function* () {
    const reg = yield* NodeRegistry.make()
    yield* reg.register(gateKind)                              // idempotent re-register of IDENTICAL impl
    expect(() => reg.unregister("gate")).toThrow()             // API does not exist — compile-time
    // a DIFFERENT impl under an existing kind is the one loud collision:
    const either = yield* reg.register(gateKindPrime).pipe(Effect.either)
    expect(Either.isLeft(either)).toBe(true)
    expect(Either.getLeft(either).code).toBe("[JESL REGISTRY-CONFLICT]")
  }))
```

**Append-only BECAUSE (K13/D7):** a v1 document must run on later registries forever. The registry type exposes no removal; the conflict path is loud because a silent override would be a kind rename in disguise — the exact compat break K13 makes release-blocking.

#### 7.2.8 `core/errors.ts` — The Code Field Prints The Token

```typescript
it.effect("every TaggedError's code field prints the exact frozen token", () =>
  Effect.gen(function* () {
    for (const E of [JeslUnknownNode, JeslCycle, JeslTierViolation, JeslUnbracketedGeneration,
                     JeslCapUnbound, JeslOracleMissing, JeslChannelUnset, JeslNoSeed]) {
      const err = new E({ node: "n", field: "f", expected: "e", actual: "a", remedy: "r" })
      expect(err.code).toMatch(/^\[JESL [A-Z-]+\]$/)           // the frozen shape
      expect(String(err)).toContain(err.code)                  // prints it (D15)
    }
  }))
```

---

### 7.3 Node Test Specifications

#### 7.3.1 Deterministic Set — Per-Kind Contract Table

| Kind | Primary fixture | Assert target (journal row) | Adversarial fixture |
|---|---|---|---|
| event-filter | subscribe+filter fires on match only | `evidence.pattern` = matched type | non-matching event → NO row (absence asserted via rowsFor length 0) |
| capture-engine | 3 deltas within intervalMs batch to 1 flush | `evidence.state` = batch size | finalOn flush at scope close with < maxDeltaChars |
| machine | registered T.E.B actor transitions on event | verdict PASS + state in `evidence.state` | failState INCONCLUSIVE on illegal event |
| gate | declarative assert PASS | row verdict PASS | negative leg: over-firing gate gets BOTH legs (G14) |
| oracle-gate | integer eq discharge | row verdict from the row table | free-text expected → REJECTED at decode |
| circuit-breaker | 2 fails, 3rd trips OPEN | breaker state in row | half-open after quiet window (TestClock) |
| state-machine | 8-transition lattice walk | per-transition rows | order-load-bearing: out-of-order → INVARIANT_BREACH |
| journal-sink | MANDATORY presence | row exists per invoke | doc WITHOUT sink → `[JESL UNKNOWN-NODE]`-class authoring error? No — decode-level REQUIRED check |
| triplet-writer | {Pattern,State,Evidence:file:line} | anchor present | anchorless finding is DELETED (asserted absent from output) |
| sqlite-sink | WAL row lands | busy/IMMEDIATE under contention | two concurrent sinks → zero corruption |
| replay-source | covers-check-then-rerun | invoke count 0 on covered | uncovered → re-invoke |
| pipeline | module context + reset | ctx isolation between runs | leak check: run B does not see run A's vars |
| parallel | allSettled bounded | per-item Exit rows | one child fails → siblings COMPLETE (K9) |
| retry-chain | exile class | call count 1 + rung fired | 5xx times=3 then fall |
| fallback-chain | SAME-ARTIFACT-ONLY | fallback output passes SAME output gate | substitute-artifact fallback → BANNED throw |
| pause | journal-persisted | pause row + resume row | kill -9 during pause → resume continues |
| cron-trigger | 10min/75s adaptive | trigger rows at TestClock steps | quieted-window rule (no wall-clock terminal detection) |
| event-reactivate | dormant wake | wake row AFTER dormancy | no wake without the reactivating event |

**Fallback-chain adversarial spec (the FALSE SUCCESS kill, K8):**

```typescript
it.effect("a fallback producing a DIFFERENT artifact marked ready is refused", () =>
  Effect.gen(function* () {
    yield* tk.script([
      { match: { cap: "shell", node: "node.primary" }, outcome: { kind: "fail", error: { _tag: "ShellError" } } },
      { match: { cap: "shell", node: "node.fb" }, outcome: { kind: "ok", value: scaffoldStub() } },
    ])
    const run = yield* Workflow.execute(fallbackChainDoc, ctx).pipe(Effect.scoped)
    const fb = run.rows.find(r => r.node === "node.fb")
    expect(fb.verdict).toBe("FAIL")
    expect(fb.error.code).toBe("[JESL FALSE-SUCCESS]")         // the banned class, named
    // the run verdict is FAIL with NO output artifact:
    expect(run.artifactPath).toBeUndefined()
  }))
```

**BECAUSE the same-artifact check is a schema-level comparison:** the fallback's output is decoded against the PRIMARY node's output contract (the `<output-contract>` JSON Schema wrap, schema_contract.rs 178L pattern). Identical schema + degraded quality = legal; different schema = FALSE SUCCESS. Comparing prose similarity would be a detector deciding (K6 violation).

#### 7.3.2 The ms-* Survivors — Re-Pinned Number Assertions

The consolidation (DD17–DD20) changes wiring, not math. The re-pin suite locks the proven numbers so the de-dup cannot drift them:

```typescript
it.effect("intent fusion numbers re-pin after the ms-ratio import (DD20)", () =>
  Effect.gen(function* () {
    // the fusion: s1*0.5 + s2*0.3 + s3*0.2, chainConfidence 0.8 gate, cap 1.0
    const r1 = IntentClassifier.fuse({ s1: 0.9, s2: 0.4, s3: 0.1, chain: 0.9 })
    expect(r1.score).toBeCloseTo(0.9 * 0.5 + 0.4 * 0.3 + 0.1 * 0.2, 10)
    expect(r1.confidence).toBeCloseTo(0.615, 10)               // the pinned fixture number
    const r2 = IntentClassifier.fuse({ s1: 0.8, s2: 0.5, s3: 0.3, chain: 0.0 })
    expect(r2.confidence).toBeCloseTo(0.575, 10)               // the second pinned number
    expect(r2.action).toBe("ALLOW")                            // chain 0 → no boost
  }))
```

**0.615 / 0.575 BECAUSE:** these are the exact values produced by the container-proven ms-intent-classifier battery (143/0 floor) — they are re-pinned UNCHANGED as the DD20 regression proof. Any deviation means the extraction altered scoring, which the consolidation explicitly forbids ("a ratio fix lands once" means the fix, not new numbers).

```typescript
it.effect("escalation tables agree across the FULL count domain (DD19 closure of G3)", () =>
  Effect.gen(function* () {
    // deadline 5/2/0; skipTier 0/2/3 over count ∈ [0, 20]
    for (let count = 0; count <= 20; count++) {
      const deadline  = EscalationMemory.computeDeadline(count)
      const skipTier  = EscalationMemory.computeSkipTier(count)
      const legacy    = StateMachineV1.inlineCopyReference(count)  // frozen pre-DD19 snapshot
      expect(deadline).toBe(legacy.deadline)
      expect(skipTier).toBe(legacy.skipTier)
    }
  }))

it.effect("pba-bridge correlateEscalation floor 0/0/1/2/2 with max(pta, floor)", () =>
  Effect.gen(function* () {
    expect(PbaBridge.correlateEscalation({ ptaCount: 0, pbaCount: 0 })).toBe(0)
    expect(PbaBridge.correlateEscalation({ ptaCount: 0, pbaCount: 1 })).toBe(0)
    expect(PbaBridge.correlateEscalation({ ptaCount: 0, pbaCount: 2 })).toBe(1)
    expect(PbaBridge.correlateEscalation({ ptaCount: 0, pbaCount: 3 })).toBe(2)
    expect(PbaBridge.correlateEscalation({ ptaCount: 0, pbaCount: 9 })).toBe(2)  // capped
    expect(PbaBridge.correlateEscalation({ ptaCount: 3, pbaCount: 0 })).toBe(3)  // max wins
  }))
```

**Floor shape 0/0/1/2/2 BECAUSE:** PBA (thinking) hits alone must not throw at count 1 — a single family hit is information, not an offense (the NOOP-attach tier); two correlated hits cross the "pattern, not noise" line; three-plus saturates because tier is capped at 4 and the dispatcher's T3 throw surface must not be reachable from thinking alone without PTA corroboration. `max(pta, floor)` BECAUSE PTA's own count is the stronger signal (acts > thoughts) and the bridge must only ever RAISE, never damp.

```typescript
it.effect("ratio bands: ENFORCE >= 0.5, DAMPEN >= 0.3 (confidence = pos/(pos+neg+1))", () =>
  Effect.gen(function* () {
    expect(RatioClassifier.confidence({ pos: 1, neg: 1 })).toBeCloseTo(1 / 3, 10)  // DAMPEN band
    expect(RatioClassifier.confidence({ pos: 3, neg: 2 })).toBeCloseTo(3 / 6, 10)  // ENFORCE band
  }))

it.effect("synapse: lambda·e^(-0.05·Δseq) + w, refractory 25, lastFireSeq=-1e9", () =>
  Effect.gen(function* () {
    const s = Synapse.familyNeuron("TEST_EVASION")
    expect(s.lastFireSeq).toBe(-1e9)                            // never-fired sentinel
    const w1 = Synapse.decay(s, 0)                              // Δseq = 0
    const w2 = Synapse.decay(s, 25)                             // refractory boundary
    expect(w2).toBeLessThan(w1)                                 // decayed
    // within refractory window the neuron does not re-arm:
    expect(Synapse.canFire(s, { now: 10, last: 0 })).toBe(false)
    expect(Synapse.canFire(s, { now: 26, last: 0 })).toBe(true)
  }))
```

**-0.05 decay / refractory 25 BECAUSE:** at Δseq=25 the exponential is e^{-1.25}≈0.286 — the memory has retained ~29% of the hit, enough to bias the next classification (persistent-family detection) while a 26th event in the same window is provably fresh-armed. Refractory 25 prevents one burst of duplicate events from single-handedly saturating a family — the "barrage" failure the sentinel fleet guards against upstream.

#### 7.3.3 The Paragon Machines — The 8-Kind Evidence Union (G1 Closure)

The evidence-machine node carries the FULL 8-kind union. Each kind gets a passing + a rejecting fixture (the G1 verification contract):

| Event kind | Passing fixture asserts | Rejecting fixture asserts |
|---|---|---|
| unit | unit test pass row ingested | no row → canUnit false |
| container | artifact REQUIRED (container class) — artifact-DD5 | artifact absent → fail-closed UNEVIDENCED |
| smoke | state-never-changes (BC-6) | state changed → smoke invalid |
| dist_change | monotonic dist sha | non-monotonic → rejected |
| claim | claim-gate demand spliced | demand absent → unarmed |
| evidence_clear | 5/5 gates PASS | ≥3 miss → INCONCLUSIVE |
| **source_change** | subject file path + dist-scope + monotonic at > lastSourceChangeAt | pathless subject → rejected |
| **status** | detail probe output present | no probe detail → rejected |

```typescript
it.effect("source_change requires subject file path + dist-scope + monotonic recency", () =>
  Effect.gen(function* () {
    const m = EvidenceMachine.make(recordFor("claim-42"))
    // passing: a write landed on a dist-scoped path AFTER the last recorded change
    expect(yield* m.canSourceChange({
      subject: { filePath: "dist/index.js" }, at: 1000n, lastSourceChangeAt: 900n,
    })).toBe(true)
    // rejecting: no file path on the subject
    expect(yield* m.canSourceChange({ subject: {}, at: 1000n, lastSourceChangeAt: 900n })).toBe(false)
    // rejecting: non-monotonic (older than last change)
    expect(yield* m.canSourceChange({
      subject: { filePath: "dist/index.js" }, at: 800n, lastSourceChangeAt: 900n,
    })).toBe(false)
  }))

it.effect("isEventFresh window 300_000ms, fail-closed", () =>
  Effect.gen(function* () {
    expect(EvidenceMachine.isEventFresh({ at: 1000n, now: 1000n + 299_999n, windowMs: 300_000 })).toBe(true)
    expect(EvidenceMachine.isEventFresh({ at: 1000n, now: 1000n + 300_001n, windowMs: 300_000 })).toBe(false)
    expect(EvidenceMachine.isEventFresh({ at: 0n, now: 0n, windowMs: 0 })).toBe(false)  // fail-closed
  }))
```

**300_000ms freshness BECAUSE (CLAIM_FRESH_WINDOW_MS, baseline :32):** a claim is fresh only while its supporting evidence could still be the CURRENT state of the world. Sub-5-minute tool round trips (container suites, aether chains with STALL_MS 60000 × retries) fit inside 300s; at 600s a stale claim from a superseded build would pass freshness; at 120s legitimate slow probes (Docker pulls) would falsely expire. Fail-closed on missing inputs BECAUSE an unknown timestamp must never default to fresh.

```typescript
it.effect("analyzeResult ingests result-shape evidence: PASS_COUNT_RE /\\d+\\s+pass/i + WRITE_TOOLS", () =>
  Effect.gen(function* () {
    // the F-2 result-shape ingestion kill: a tool RESULT carries the evidence
    const ing = EvidenceMachine.analyzeResult({
      tool: "bash", output: "18 pass, 0 fail",                  // PASS_COUNT_RE matches
    })
    expect(ing.passEvidence).toBe(true)
    const write = EvidenceMachine.analyzeResult({ tool: "edit", output: "" })
    expect(write.writeEvidence).toBe(true)                      // WRITE_TOOLS membership
    const read = EvidenceMachine.analyzeResult({ tool: "read", output: "x".repeat(80) })
    expect(read.writeEvidence).toBe(false)                      // reads are NOT writes
  }))

it.effect("claim-after-write temporal ordering: the claim row MUST postdate the write row", () =>
  Effect.gen(function* () {
    const j = yield* InMemoryJournal
    ...run the claim-after-write fixture...
    const writeRow = j.rows.find(r => r.kind === "source_change")
    const claimRow = j.rows.find(r => r.kind === "claim")
    expect(claimRow.seq).toBeGreaterThan(writeRow.seq)
  }))
```

#### 7.3.4 Remaining Paragon Machines — Contract Snippets

```typescript
// oracle-discharge: the MPSE constraint battery
it.effect("integer equality, zero false positives; floats need epsilon; NaN → CONTRADICTED; unregistered → UNVERIFIABLE", () =>
  Effect.gen(function* () {
    expect(OracleDischarge.check({ expr: "1+1", expected: 2 })).toMatchObject({ verdict: "VALID" })
    expect(OracleDischarge.check({ expr: "0.1+0.2", expected: 0.3 }))
      .toMatchObject({ verdict: "CONTRADICTED" })              // no epsilon → refuse, never fuzzy-pass
    expect(OracleDischarge.check({ expr: "0.1+0.2", expected: 0.3, epsilon: 1e-9 }))
      .toMatchObject({ verdict: "VALID" })
    expect(OracleDischarge.check({ expr: "NaN", expected: 0 })).toMatchObject({ verdict: "CONTRADICTED" })
    expect(OracleDischarge.check({ expr: "unregistered_expr", expected: 0 }))
      .toMatchObject({ verdict: "UNVERIFIABLE" })              // never guess
    expect(() => OracleDischarge.register({ id: "1+1", expected: 3 }))
      .toThrow("ORACLE_CONFLICT")                              // append-only, first-wins, loud
  }))

// claim-gate: arm → demand → consume-once → clear
it.effect("demand 200c minimum + triad + TTL 8seq; [P-GATE] splice consume-once; clear() escape", () =>
  Effect.gen(function* () {
    const g = ClaimGate.make()
    g.arm({ claim: "x".repeat(199) })                           // 199c → below floor
    expect(g.state.demand).toBeNull()                           // not armed
    g.arm({ claim: "x".repeat(200), triad: { pattern: "P", state: "S", anchor: "f:1" } })
    expect(g.state.demand).toBeTruthy()
    expect(g.spliceMarker).toBe("[P-GATE]")
    yield* TestClock.adjust("8 sequences")                      // TTL expiry
    expect(g.state.demand).toBeNull()                           // expired, not sticky
  }))
```

**200c demand floor BECAUSE:** a demand shorter than 200 chars cannot name the claim, the missing evidence type, and the remedy — the operator-measured floor for a demand a model can actually act on (the same floor family as the wave-spec CTX_FLOORS mission/knownContext 200c). TTL 8 sequences BECAUSE demands must outlive a tool round trip (2–4 seqs) but die before anchoring stale context — at 16 the demand rides into unrelated turns; at 4 it expires mid-verification.

```typescript
// config-lock: binary INCONCLUSIVE → BLOCK at CT_DECODE_PRINTABLE_RATIO 0.6
it.effect("classifyCtExec binary; below-ratio decode payload BLOCKs", () =>
  Effect.gen(function* () {
    expect(ConfigLock.classifyCtExec("bun test x.test.ts")).toBe("EXEC")
    expect(ConfigLock.classifyCtExec("echo hi")).toBe("INCONCLUSIVE")
    const dec = yield* ConfigLock.segmentDecode(base64BlobWithPrintableRatio(0.59))
    expect(dec).toMatchObject({ verdict: "BLOCK", ratio: 0.59 })
  }))
```

**0.6 printable ratio BECAUSE:** base64 of real code decodes to >60% printable bytes; base64-of-base64 (the smuggle pattern) decodes well below. 0.5 would pass random blobs half the time (coin-flip false negatives); 0.75 rejects legitimately noisy payloads. The 0.6 line was measured against the Paragon hostile corpus.

```typescript
// workflow-machine: 4×3=12 transitions, ONE legal path CODE→…→REPORT
it.effect("REPORT reachable ONLY from TEST-RUNTIME×LEGIT; skips ABSENT", () =>
  Effect.gen(function* () {
    const t = WorkflowMachine.transitions()
    expect(t.length).toBe(12)                                  // 4 states × 3 inputs
    expect(WorkflowMachine.step("TEST-RUNTIME", "LEGIT")).toBe("REPORT")
    expect(WorkflowMachine.step("CODE", "LEGIT")).toBe("ABSENT")  // skip → dead
  }))

// audit-registry: EXISTENCE IS NOT AUDIT
it.effect("no record → fail-closed; DISPATCHED→…→ADVANCED; AdvanceBlockedError", () =>
  Effect.gen(function* () {
    expect(AuditRegistry.auditAdvanceAllowed(null)).toBe(false)
    const r = AuditRegistry.fresh("w1")
    expect(() => AuditRegistry.advance(r)).toThrow("AdvanceBlockedError")  // DISPATCHED≠AUDITED
  }))
```

#### 7.3.5 Execution Set — Bounds & Write Scope

```typescript
it.effect("shell-exec WITHOUT maxOutput is refused at decode (the RAM-bomb guard)", () =>
  Effect.gen(function* () {
    const either = yield* WorkflowCodec.decodeUnknown(shellNoMaxOutputDoc).pipe(Effect.either)
    expect(Either.isLeft(either)).toBe(true)
  }))

it.effect("file-io write scope: realpath+resolve+startsWith(root+sep); five bypass classes closed", () =>
  Effect.gen(function* () {
    const fs = yield* MemoryFs
    yield* fs.setRoot("/run/root")
    const cases = [
      "/run/root/ok.txt",                 // allowed
      "/run/root/../escape.txt",          // resolve-normalized escape → denied
      "/run/root2/sibling.txt",           // prefix-without-separator → denied
      "run/root/relative.txt",            // relative → denied
      "/etc/passwd",                      // absolute elsewhere → denied
      "/run/root",                        // the root itself (no file) → denied
    ]
    const verdicts = yield* Effect.forEach(cases, (p) => FileIo.write(p, "x").pipe(Effect.either))
    expect(verdicts.map(Either.isRight)).toEqual([true, false, false, false, false, false])
    expect(fs.writeAttempts.filter(a => !a.allowed).length).toBe(5)   // all logged
  }))
```

**startsWith(root + sep) — the `+ sep` BECAUSE:** `/run/root2` startsWith `/run/root` as a plain string; only the separator-terminated comparison closes the sibling-directory bypass. This is the shadow-agent write-scope law verbatim (five bypass classes closed).

#### 7.3.6 Generation Set — Bracket Enforcement

```typescript
it.effect("an unbracketed prompt node refuses at AUTHORING, not mid-run", () =>
  Effect.gen(function* () {
    const either = yield* WorkflowCodec.decodeUnknown(badUnbracketedDoc).pipe(Effect.either)
    expect(Either.getLeft(either).code).toBe("[JESL UNBRACKETED-GENERATION]")
    // the remedy names the full bracket: schema gate + repair ≤ 2 + confidence floor 0.55
    expect(Either.getLeft(either).remedy).toContain("repair")
  }))

it.effect("ask-launcher requires NO capability: the question returns via DurableDeferred", () =>
  Effect.gen(function* () {
    // provide a Layer with NO llm cap at all — ask-launcher must still run
    const run = yield* Workflow.execute(askLauncherDoc, ctx)
      .pipe(Effect.provide(Layer.merge(TestLive, NoLlmWhatsoever)), Effect.scoped)
    expect(run.verdict).toBe("PASS")
    // the launcher's answer wrote the channel:
    expect(yield* Channels.read("$.answer")).toBeDefined()
  }))
```

**repair ≤ 2 BECAUSE (the unbounded-repair kill):** each repair round is a paid generation; the observed failure mode is an oscillating gate/repair loop consuming budget without convergence. Two rounds cover the empirical fix distribution (first repair resolves schema drift; second resolves semantic drift); the third is routed to a LOUD FAIL with the repair transcript journaled. Confidence floor 0.55 BECAUSE below it the shadow-agent parity law itself deems the generation UNCLEAR (floor 0.85−0.15 = 0.70 for parity; 0.55 is the absolute accept line for bracketed output contracts).

---

### 7.4 The Fixture Corpus (F23 + F28)

Inventory with exact expected behaviors:

| # | Fixture | Purpose | Assertion surface |
|---|---|---|---|
| 1 | `mech-gate.json` | the deterministic happy doc | headless run → verdict PASS; 4 rows; chain valid |
| 2 | `bad-unknown-kind.json` | token refusal | `[JESL UNKNOWN-NODE]` |
| 3 | `bad-cycle.json` | token refusal | `[JESL CYCLE]` |
| 4 | `bad-tier.json` | token refusal | `[JESL TIER-VIOLATION]` |
| 5 | `bad-unbracketed.json` | token refusal | `[JESL UNBRACKETED-GENERATION]` |
| 6 | `needs-llm.json` | cap refusal | `[JESL CAP-UNBOUND]` at first llm node, NO artifact |
| 7 | `parallel-5.json` | concurrency | overlap ≥ 1; all verdict rows |
| 8 | `skill-fixture/` | the rocket | end-to-end bash launch (criterion 8) |
| 9 | `audit.json` | registry chain | advance gates |
| 10 | `bad-no-seed.json` | seeding | `[JESL NO-SEED]` not a hang |
| 11 | `bad-channel-unset.json` | channels | `[JESL CHANNEL-UNSET]` |
| 12 | `bad-oracleless.json` | MPSE | `[JESL ORACLE-MISSING]` |
| 13 | `tier1-replay-a/` + `tier1-replay-b/` | S9 pair | invoke count 0; identical chain |
| 14 | `prearm-hostile.md` | S10 | TEST_EVASION → deny |
| 15 | `hygiene-violation.ts` | S8 | LSP family tokens |
| 16 | `demo-spec.mpse.md` | MPSE bridge | compiles to rows + workflow + stubs |
| 17 | `fallback-substitute.json` | K8 | `[JESL FALSE-SUCCESS]` |
| 18 | `kill-mid-run.json` | criterion 12 | truncateAfter → resume |

**The bidirectional grep gate (F28, run at S1E and re-run at S6E):**

```bash
# every token in errors.ts has exactly one fixture:
for TOK in UNKNOWN-NODE CYCLE TIER-VIOLATION UNBRACKETED-GENERATION \
           CAP-UNBOUND ORACLE-MISSING CHANNEL-UNSET NO-SEED; do
  test "$(grep -rl "JESL ${TOK}" jesl/test/fixtures | wc -l)" -eq 1 \
    || { echo "ORPHAN TOKEN: ${TOK}"; exit 1; }
done
# every bad-* fixture has exactly one token in errors.ts:
for F in jesl/test/fixtures/bad-*.json; do
  TOK=$(jq -r '.expectToken' "$F")
  test "$(grep -c "JESL ${TOK}" jesl/core/errors.ts)" -ge 1 \
    || { echo "ORPHAN FIXTURE: $F"; exit 1; }
done
```

---

### 7.5 The §7 Battery — Seven Scenarios (7-Field Format, Tool-Result-Bound)

These are the CONTAINER scenarios (the embedded plan after the TOC defines the rig; this table is the per-scenario contract the units build against — the container run is authoritative). Image: `runtime-grade-container-sandbox:master` family (the proven rig; `provisioned-20260813` is the pinned ancestor).

| Field | S1 TOOLS | S2 BOUNDARY | S3 ERRORS |
|---|---|---|---|
| **Feature under test** | CLI runs a tier-1 doc headless to a verdict | write-scope + cap boundaries hold | malformed docs refuse with named tokens |
| **Prompt** | `bunx jesl run fixtures/mech-gate.json --in '{"seed":1}'` | launch file-io fixture targeting escape paths | `bunx jesl validate fixtures/bad-*.json` (each) |
| **Pass token** | `"verdict":"PASS"` in stdout JSON | `"denied":5` in stdout JSON | `"[JESL CYCLE]"` etc. in stderr, exit 3 |
| **Fail token** | `"verdict":"INCONCLUSIVE"` | `"denied":4` (a bypass leaked) | exit 0 on a malformed doc |
| **Max wait** | 60s | 60s | 30s |
| **Evidence capture** | stdout + journal path echoed | journal rows with denial evidence | stderr per fixture + exit code |

| Field | S4 STATE | S5 CONCURRENCY | S6 INTEGRATION | S7 FIREWALL |
|---|---|---|---|---|
| **Feature under test** | kill -9 crash-safe journal + resume | parallel overlap with all rows | skill via bash end-to-end | cap-unbound is LOUD with NO artifact |
| **Prompt** | start run; `kill -9 %1` mid-run; re-run same command | `bunx jesl run fixtures/parallel-5.json` | `bunx jesl run .opencode/skills/demo-rocket/payload/workflow.json --ctx ctx.json` | `bunx jesl run fixtures/needs-llm.json` (no llm Layer) |
| **Pass token** | `"resumed":true` + `"verdict":"PASS"` in stdout | `"overlapCount":N` where N≥1 parsed from journal; `"rows":5` | `"rocket":"launched"` + journal at `.trident/rockets/<run-id>.jsonl` | `"[JESL CAP-UNBOUND]"` in stderr AND no output file AND `"ready":false` |
| **Fail token** | `"resumed":false` | `"overlapCount":0` | any plugin rebuild step | a ready:true or an artifact path |
| **Max wait** | 120s | 60s | 120s | 30s |
| **Evidence capture** | pre-kill journal tail + post-resume chain | journal with 5 verdict rows | the rocket journal chain | exit code 4 + stderr |

**Exit-code contract (new, PROPOSED: [0 pass / 3 authoring-refusal / 4 runtime-fail / 5 no-seed]):** BECAUSE the container harness asserts on exit codes as pass tokens; overloading all failures onto exit 1 would make S3/S7 indistinguishable from crashes. The three refusal families (authoring vs runtime vs seeding) are different remediation paths and must be mechanically distinguishable.

---

### 7.6 S8 — EFFECT KERNEL HYGIENE

**Two legs, both mechanical:**

**Leg 1 — the ripgrep set (criterion 13):**

```bash
# ZERO hits permitted in jesl/core/ and jesl/nodes/ (kernel paths):
rg -n "globalFetch|globalThis\.fetch|\bfetch\(|Date\.now|new Date\(\)|Math\.random|setTimeout|setInterval|node:fs|node:os|node:path|require\(|from \"fs\"" jesl/core jesl/nodes \
  && { echo "HYGIENE VIOLATION"; exit 1; } || echo "CLEAN"
```

**Leg 2 — the LSP diagnostics gate (criterion 14):**

```bash
bunx effect-language-service --project . 2>&1 | tee /tmp/lsp.jsonl
# exit 0 AND zero diagnostics at kernel severity:
jq -e 'map(select(.severity >= 1 and (.ruleName | IN("floatingEffect","runEffectInsideEffect","missingStarInYieldEffectGen","globalFetch","globalDate","globalTimers","globalRandom","nodeBuiltinImport","asyncFunction")))) | length == 0' /tmp/lsp.jsonl
```

**Family map asserted:** `floatingEffect → THEATRICAL_PLANNING`, `runEffectInsideEffect → RUNTIME_SMUGGLING`, `missingStarInYieldEffectGen → RUNTIME_SMUGGLING`, `globalFetch/globalDate/globalTimers/globalRandom → RUNTIME_SMUGGLING`, `nodeBuiltinImport → RUNTIME_SMUGGLING`, `asyncFunction (kernel paths) → RUNTIME_SMUGGLING`, `tryCatchInEffectGen → THEATRICAL_PLANNING`, `preferSchemaOverJson → SCHEMA_EVASION`.

**The deliberate violation fixture (`hygiene-violation.ts`, test-only path):** contains one of each family; the gate MUST flag all of them — proving the scanner is alive (a hygiene gate that passes on violations is the green-path lie).

**Zero-tolerance BECAUSE:** a single `Date.now` in core breaks replay byte-determinism (criterion 5) — the timestamp forks every chain; a single `fetch` smuggles unaudited I/O past the journal (K7); a single `node:fs` in core breaks TestLive portability (DD2). There is no "small violation" of the single-runtime law.

---

### 7.7 S9 — ACTIVITY REPLAY (G8 Closure)

```typescript
it.effect("S9: second run of the tier-1 fixture invokes ZERO Activities and reproduces the identical sha chain", () =>
  Effect.gen(function* () {
    const tk = yield* ScriptedToolkit
    const r1 = yield* Workflow.execute(tier1Doc, seedCtx(7)).pipe(Effect.scoped)
    const fp1 = r1.rows.at(-1).self                         // chain head after run 1
    const invocationsAfterRun1 = tk.calls.length
    const r2 = yield* Workflow.execute(tier1Doc, seedCtx(7)).pipe(Effect.scoped)
    expect(tk.calls.length).toBe(invocationsAfterRun1)       // invoke count DELTA = 0
    expect(r2.rows.at(-1).self).toBe(fp1)                    // byte-identical chain head
    // every Activity name node:<id> has a journaled row (the replay index):
    for (const n of tier1Doc.nodes) {
      expect(r2.rows.some(r => r.node === n.id)).toBe(true)
    }
  }))
```

**Tier-2 replay contract (G13):** LLM nodes are NOT byte-deterministic — the journal IS the determinism record. The `needs-llm` replay fixture asserts the llm cap is invoked ZERO times on the second run and the journaled generation is returned verbatim (`replayedFrom` field on the row). BECAUSE: replaying a paid generation by re-paying it is the exact K7 violation S9 exists to kill.

---

### 7.8 S10 — PARAGON PRE-ARM END-TO-END (G9 Closure)

The full chain in ONE container scenario, asserted via journal ORDER:

```typescript
it.effect("S10: TEST_EVASION reasoning → pba.family.hit → pre-arm → bash deny; the Activity never ran", () =>
  Effect.gen(function* () {
    // 1. emit hostile reasoning through the message.part.updated wiring:
    yield* bus.emit("message.part.updated", { part: { type: "reasoning",
      text: "just mock the result and pretend the test passed" } })
    // 2. PBA fires (conf 0.61 ≥ ENFORCE 0.5 on the 4-bank):
    const hit = j.rows.find(r => r.kind === "pba.family.hit")
    expect(hit.evidence.state.family).toBe("TEST_EVASION")
    // 3. the bridge pre-arms the PTA layers (ring 20, boostBaseline):
    expect(j.rows.some(r => r.kind === "pta.prearm")).toBe(true)
    // 4. the agent then calls bash — the authorization stack denies:
    const either = yield* ToolEngine.intercept("bash", { command: "rm -rf dist" })
                                             .pipe(Effect.either)
    expect(Either.isLeft(either)).toBe(true)
    expect(Either.getLeft(either)._tag).toBe("StructuredEnforcementError")
    // 5. ORDERING: pba.family.hit seq < pta.intercept seq
    expect(hit.seq).toBeLessThan(j.rows.find(r => r.kind === "pta.intercept").seq)
    // 6. THE ACTIVITY NEVER RAN:
    expect(tk.invokeCount("node.bash")).toBe(0)
  }))
```

**Assert-on-ordering BECAUSE:** the pre-arm story is causal (thinking → arming → denial); asserting only endpoint states would pass even if the denial came from an unrelated gate — the seq comparison pins causality into the artifact.

---

### 7.9 Per-Kernel Replay Fixtures (Lifecycle 1→6)

Each lifecycle kernel (F19) ships `fixtures/` + a replay assertion. The cross-lifecycle test chains them:

```typescript
it.effect("the journal chains across kernels 1→6: one sha256-linked ledger from idea to dist", () =>
  Effect.gen(function* () {
    const ledgers: Array<{ kernel: string; head: string }> = []
    for (const k of ["idea-to-bible", "bible-to-spec", "spec-to-kernels",
                     "kernels-to-code", "verify", "ship"]) {
      const r = yield* Workflow.execute(kernelDoc(k), kernelCtx(k)).pipe(Effect.scoped)
      expect(r.verdict).toBe("PASS")
      ledgers.push({ kernel: k, head: r.rows.at(-1).self })
    }
    // the ledger continuity: each kernel's genesis row cites the previous head:
    for (let i = 1; i < ledgers.length; i++) {
      expect(genesisRow(ledgers[i].kernel).prev).toBe(ledgers[i - 1].head)
    }
  }))
```

**Per-kernel distinctive assertions:** (1) idea-to-bible — the shadow-tool node's output passes the cs T2 schema-gate, else INCONCLUSIVE; (2) bible-to-spec — the DPL1 template gate REFUSES a spec missing required sections (the wave-planning-gate COLD-refusal pattern); (3) spec-to-kernels — the dry-run replay on TestLive reaches verdict PASS BEFORE any code exists (DD14's headline); (4) kernels-to-code — every dispatched stub gets a per-stub oracle-gate row; (5) verify — passToken rows bind to tool-result context (`.trident/container-test-results.json` per-scenario rows present); (6) ship — the audit gate chain refuses advance without AUDITED rows.

---

### 7.10 Packager Tests (Criterion 9)

```typescript
it.effect("three emission targets re-validate and run", () =>
  Effect.gen(function* () {
    const tool   = yield* Packager.emitTool(mechGateDoc)      // single frozen-front tool
    const chain  = yield* Packager.emitChain(mechGateDoc, 3)   // N tools + module ctx + gatekeeper args
    const rocket = yield* Packager.emitSkill(mechGateDoc)      // the full F26 manifest
    for (const t of [tool, chain]) {
      expect(yield* WorkflowCodec.decodeUnknown(t.workflow)).resolves          // re-validates
    }
    // the rocket manifest completeness (F26):
    for (const p of ["SKILL.md", "payload/ctx.json", "payload/mission.md",
                     "payload/anti-patterns.json", "payload/schemas/input.schema.json",
                     "payload/schemas/output.schema.json", "payload/workflow.json",
                     "payload/activities.ts", "payload/tests/"]) {
      expect(rocket.files.has(p)).toBe(true)
    }
    // anti-patterns are MACHINE DATA (K12): parseable, bank-shaped:
    const ap = JSON.parse(decoder(rocket.files.get("payload/anti-patterns.json")))
    for (const fam of ap.families) {
      expect(Object.keys(fam).sort()).toEqual(
        ["family", "descriptive", "suggestive", "substitute", "use"].sort())
    }
  }))
```

---

### 7.11 MPSE Bridge Tests (F18)

```typescript
it.effect("D13: a rule card's quote re-finds at its anchor, else D13_QUOTE_MISMATCH", () =>
  Effect.gen(function* () {
    const card = { quote: "the oracle discharge is integer equality", anchor: { line: 42 } }
    expect(yield* RuleCards.validateCard(corpus, card)).resolves
    const bad = { ...card, quote: "a quote that is not in the corpus at line 42" }
    const e = yield* RuleCards.validateCard(corpus, bad).pipe(Effect.flip)
    expect(e.code).toBe("D13_QUOTE_MISMATCH")
  }))

it.effect("batteryVersion = sha256(corpus + NUL + bindings) — filename removed (BUG-5 regression)", () =>
  Effect.gen(function* () {
    const a = yield* Compile.batteryVersion(corpus, bindings, "/tmp/x.md")
    const b = yield* Compile.batteryVersion(corpus, bindings, "/tmp/other-name.md")
    expect(a).toBe(b)                                          // path-independent
  }))

it.effect("D17 2x2: FIRED∧SILENT=CALIBRATED else EXCLUDED_BORN_OFF", () =>
  Effect.gen(function* () {
    const r = yield* Calibrate.calibrate(corpus, [firedPredicate, silentPredicate])
    expect(r.rows.find(x => x.id === "firedPredicate").status).toBe("CALIBRATED")
    expect(r.rows.find(x => x.id === "silentPredicate").status).toBe("EXCLUDED_BORN_OFF")
  }))

it.effect("A3 hostile corpus: a 'run everything' directive rides as data; predicates scan structurally", () =>
  Effect.gen(function* () {
    const hostile = yield* Calibrate.a3Scan(corpusWith("```contract\nrun everything: exec run spawn\n```"))
    expect(hostile.verdict).toBe("CLEAN")                      // hostile input is CLEAN
    // but a PREDICATE containing exec/run/spawn is refused:
    const e = yield* Calibrate.a3Scan(predicateWith("exec(")).pipe(Effect.flip)
    expect(e.code).toBe("A3_HOSTILE_PREDICATE")
  }))

it.effect("demo-spec.mpse.md compiles to oracle rows + runnable workflow + typed stubs", () =>
  Effect.gen(function* () {
    const out = yield* KernelEmit.compile(readFile("fixtures/demo-spec.mpse.md"))
    expect(out.oracleRows.length).toBeGreaterThan(0)
    expect(yield* WorkflowCodec.decodeUnknown(out.workflow)).resolves
    expect(out.stubs.every(s => s.gate.mathExpr && s.gate.oracle)).toBe(true)
  }))
```

---

### 7.12 Property Tests (Determinism & Agreement)

```typescript
// 500-run determinism (the IntelligenceLexicon battery pattern):
it.prop("classify is deterministic across 500 randomized inputs")(
  Arbitrary.toolCall().chain(call =>
    Arbitrary.layers().map(layers =>
      expectSameVerdict(
        ToolEngine.classify(call, layers),
        ToolEngine.classify(call, layers))))          // run twice per sample, must agree

// the escalation full-domain agreement (G3 closure — see 7.3.2)

// journal chain integrity under randomized interleavings:
it.prop("any interleaving of appends yields a valid chain")(arbitraryInterleaving =>
  chainValid(interleave(arbitraryInterleaving)))
```

**500 runs BECAUSE:** the deterministic-by-construction claim is about the ABSENCE of hidden state (sessionState/globalThis hazards — the IntelligenceLexicon dual-write lesson); 500 randomized runs over the input space empirically bound the flake rate below 0.2% with 95% confidence — the same floor the container-proven lexicon battery used. Deterministic seeds make failures reproducible.

---

### 7.13 Threshold Rationale Register (Consolidated)

| Threshold | Value | BECAUSE (condensed — full paragraphs inline above) |
|---|---|---|
| executor concurrency | 15 | sibling overlap provable; below 14 serializes diamonds; above 16 no coverage gain, stagger budget grows |
| stagger | 1–3s | provider burst avoidance; TestClock makes it free in tests |
| retry backoff (5xx) | 2.5s | aether measured retry 3-5×2.5s; shorter storms, longer wastes the window |
| exile window | 45000ms | exceeds one quota window at nvidia 40 / opencode 200 RPM |
| stall detection | 60000ms | STALL_MS from aether-agent.ts; longest healthy think observed < 60s |
| evidence freshness | 300_000ms | CLAIM_FRESH_WINDOW_MS; covers slow probes, rejects superseded builds |
| collector pool TTL | 600_000ms | 2× the gate window — evidence outlives the verdict it supports |
| synapse decay | e^(-0.05·Δseq) | Δseq=25 retains ~29% — persistence without saturation |
| refractory | 25 | burst dedup boundary |
| pba-bridge ring | 20 | correlate window covering a multi-tool reasoning episode |
| RING_CAP (verdicts) | 50 | smoke-orthogonal ring from evidence-machine |
| VERDICT_TTL | 5000ms | verdicts expire before stale reuse across turns |
| LIFECYCLE_TTL | 300000ms | full MPSM lifecycle horizon |
| HISTORY_CAP / OUTPUT_CAP | 100 / 500 | chain-tracker memory bounds; loop detect needs ≥3-same |
| escalation deadline | 5/2/0 | window ladder by count; matches proven lattice |
| skipTier | 0/2/3 | two correlated hits skip one tier — the ≥2 escalation law |
| fusion weights | 0.5/0.3/0.2 | intent > chain > aux signal strength, container-pinned |
| chainConfidence gate | 0.8 | chain evidence alone must be strong to boost |
| ADVISE threshold | 0.6×threshold | advise before block — the steer-before-strike doctrine |
| ratio bands | ≥0.5 ENFORCE / ≥0.3 DAMPEN | conf=pos/(pos+neg+1) measured bands |
| claim-gate demand | 200c | minimum actionable demand naming claim+evidence+remedy |
| claim-gate TTL | 8 seq | outlives a tool round trip, dies before stale anchoring |
| CT printable ratio | 0.6 | measured base64-of-code vs base64-of-base64 separation |
| repair bound | ≤2 | empirical fix distribution; 3rd round → LOUD FAIL |
| confidence floors | 0.55 accept / 0.70 parity | parity 0.85−0.15; accept below parity refuses |
| budget formula | 4+ceil(candidates/8) | shadow-agent measured rounds |
| fresh-window fallback | fail-closed | unknown timestamp never defaults fresh |
| battery threshold | 10/10 | one green scenario proves nothing about the other nine |
| property runs | 500 | flake bound <0.2% @95% |

---

### 7.14 Test Blind Spots (C8 — What This Section Does NOT Cover)

1. **Provider-side nondeterminism** — real llm caps are exercised ONLY in the S7-adjacent container legs; unit tests never see real model variance. Tier-2 content quality is untestable here by design (the oracle gates check form, not wisdom).
2. **Docker-in-Docker contention** — the sqlite-sink concurrency test uses two fibers, not two containers; true multi-host WAL contention is out of scope until a host-pipeline scenario demands it.
3. **The 1.14.51 plugin client surface** — S3E verifies against the live plugin API (DD24); unit tests stub `input.client`. A plugin-API drift between stub and runtime is caught only at S3E gate time.
4. **Long-tail journal growth** — chain validation is O(n) per test; multi-hundred-thousand-row journals (a month of rockets) have no perf fixture. PROPOSED: [a 100k-row append benchmark at S6E, non-blocking].
5. **Human-authored rocket payloads** — the packager tests emit well-formed payloads; a malformed hand-authored `anti-patterns.json` is covered only by the decode refusal, not by a lint pass (none specified).
6. **Coverage of the R0-R17 AST engine** — explicitly out of scope: the audit engine is wrapped, never rewritten (D12); its own battery remains the v4.4.2 baseline's.

---

## SECTION 8 — INTEGRATION SURFACES (the wrap rules — complements §6's wave map)

> Canon: "JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime." Integration = wiring proven machinery into the one runtime without rewriting it (D12/P3-6).

### 8.1 Integration Philosophy & The Surface Map

Three integration families, each with a distinct rule:

1. **Greenfield** (jesl/*) — build to this spec; the battery is the gate.
2. **Wraps** (Paragon math, wave-manager, evidence-tracker) — wrap pure, actuate at the seam; ZERO line rewrites of the wrapped cores.
3. **Docs** (DW1/DW2) — additive surgery only; the canon never deletes.

```
INTEGRATION SURFACE MAP

  ┌─ v4.4.4 host runtime (SHELL IMMUTABLE, K4) ─────────────────────────────┐
  │  5 mode tools · 18 audit layers · 3-layer blocking · P1-P10             │
  │        ▲ tool.execute.before ONLY (prompt-caching law)                  │
  │        │ dynamic injection                                    ┌──────────┐
  │  ┌─────┴───────────────────────────────────────────────────────┤ OpenCode │
  │  │ 5-hook pack (F22) ──► EventBus ──► scanners (F15)          │  Live    │
  │  │      chat.message ─┐                                        │  Layer   │
  │  │      tool.before ──┼─► BehaviorEngine(PBA)/ToolEngine(PTA)  └────┬─────┘
  │  │      tool.after ──┘         │ authorization stack                 │
  │  │      messages.transform     ▼                                     │
  │  │      system.transform   Toolkit.invoke ──► node Activities       │
  │  └───────────────────────────────────────────────────────────────────┘
  │        │ caps (llm/tool/subagent via input.client + wave-manager)
  └────────┼───────────────────────────────────────────────────────────────┘
           ▼
  ┌─ jesl core (PURE) ────────────────────────────────────────────────────┐
  │  WorkflowCodec → Graph → Executor(forEach 15) → Journal(sha256)        │
  │        ▲                    ▲                                         │
  │        │ TestLive          │ CliLive (bash rockets: `bunx jesl run`)   │
  └────────┼────────────────────┼─────────────────────────────────────────┘
           ▼                    ▼
     the battery (δ)      the rocket journal (.trident/rockets/<id>.jsonl)
```

### 8.1.1 Integration Peer Interaction Table (C6)

| Surface | EventBus | Journal | wave-manager | Paragon cores | v4.4.4 shell |
|---|---|---|---|---|---|
| 5-hook pack | publishes chat/tool/message events | writes pba/pta rows via engine | — | — | registers tools; NEVER edits system.transform output |
| BehaviorEngine (PBA) | emits pba.family.hit | rows via engine | — | wraps ratio banks + synapse (pure) | — |
| ToolEngine (PTA) | consumes pba.*, emits pta.intercept | rows via engine | spec-file dispatch (build kinds) | wraps loader/chain/intent/dispatcher | denies via StructuredEnforcementError |
| Wave-manager binding | — | wave rows in SAME journal (K: no separate journals) | IS the dispatch machinery | — | poseidon-gated |
| MPSE bridge (F18) | — | oracle rows | — | MathExpr + oracle (pure) | feeds code-spec stage |
| Lifecycle kernels | stage events | THE lifecycle ledger | dispatch for kernels-to-code | math-eval/oracle-discharge nodes | poseidon consumes specs |
| CLI/TestLive | — | file/in-memory journal | — | — | — |

### 8.2 The v4.4.4 Pipeline Insertion (DD14)

**INSERTION-POINT mapping (C3) into TRIDENT_AGENT_V444_DEFINITIVE_ENGINEERING_ARCHITECTURE_SPEC.md §2:106:**

- File: the pipeline chain (§2:106).
- Before: `Idea → Bible (3 loops) → MPSE Spec (3 loops) → Code Spec(s) (3 loops, parallel) → Poseidon Build → Ship`.
- After: `Idea → Bible (3 loops) → MPSE Spec (3 loops) → MACRO-KERNEL PROTOTYPE SHELLS → Code Spec(s) (delta-only) → Poseidon Build → Ship`.
- Inside-block context: between the MPSE stage (:125-129, 3 loops no user) and the code-spec stage (:131-137, decisive parallel). The insertion adds NO user loop (K11) — agent-autonomous, gated by the TestLive dry-run replay.
- God Loop table impact (§5:327-371): the 3 pre-build phases become 4 — `BIBLE_GENERATION, MPSE_GENERATION, MACRO_KERNEL_PROTOTYPE, CODE_SPEC_GENERATION` (:176 table row extended, additive).

**Stage data flow:**

```
 MPSE spec (fenced math/oracle/contract blocks)
        │  parser.ts (D13 quote-gated)
        ▼
 FR clusters × MathExpr families
        │  kernel-emit.ts
        ├──► coverage matrix: COMPOSE (existing kinds)  ──► workflow.json (assembled)
        │                          BUILD (gap)          ──► stub-emit.ts ──► activities.ts stubs
        │  oracle-compile.ts ──► oracle-gate rows (+ provenance anchor{source,line,quote})
        │  calibrate.ts (D17 + A3)
        ▼
 macro-kernel prototype shell = workflow.json + ctx.json + stubs + oracle rows
        │  DRY-RUN REPLAY on TestLive  ◄── THE GATE: deterministic nodes EXECUTE pre-code
        │        (D1-D9 derailments surface at ZERO build cost)
        ▼
 Code specs = DELTA ONLY: which kernels compose + which stubs to fill + language/arch
        │        each referencing the MathExpr blocks it implements + bible sections
        ▼
 Poseidon (MPSE as verification substrate, bible as macro context)
```

**Why the dry-run is the gate BECAUSE:** between MPSE and code, the deterministic substrate (gates, machines, oracles, decompositions) is fully executable as data — the only thing stubs cannot do is touch the world. Running it pre-build converts D1-D9 from post-build debugging (hours, paid) into authoring-time refusals (instant, free). A gap that survives the dry-run un-exercised is a coverage-matrix lie, surfaced by the replay coverage assertion (`every non-stub node has a verdict row`).

### 8.3 Driver Integrations

#### 8.3.1 The CLI Driver (F12)

```typescript
// jesl/cli/main.ts — runPromise appears HERE and ONLY here (K1)
const main = Effect.gen(function* () {
  const argv = yield* parseArgv(process.argv.slice(2))   // run|validate|replay|emit
  const ctx  = yield* readJsonIfExists(argv.ctx ?? "ctx.json")
  const input = mergeSeedSources(argv.in, argv._)        // --in + positional argv → $.input + vars
  switch (argv.command) {
    case "run": {
      const doc = yield* readDoc(argv.doc)
      const verdict = yield* Workflow.execute(doc, { ctx, input }).pipe(Effect.scoped)
      yield* Console.log(JSON.stringify({ verdict: verdict.verdict, rows: verdict.rows.length,
                                          journal: verdict.journalPath, ready: true }))
      // exit-code contract: 0 PASS / 3 authoring / 4 runtime / 5 no-seed
      return verdict.verdict === "PASS" ? 0 : exitCodeFor(verdict.error)
    }
    case "validate": /* decode-only; tokens to stderr; exit 3 on refusal */
    case "replay":   /* covers()-forced; asserts invoke-count 0 deltas (S9 harness mode) */
    case "emit":     /* tool | chain | skill via packager */
  }
}).pipe(Effect.provide(CliLive))                          // Shell+Fs+Http+Journal.file
  .pipe(runPromise)                                       // THE boundary

// Layer wiring:
export const CliLive = Layer.mergeAll(
  NodeShellLive,        // shell cap → @effect/platform Command
  NodeFsLive,           // fs cap → FileSystem layer
  FetchHttpLive,        // http cap → Client with retry/exile classes
  FileJournalLive,      // journal → JSONL + fsync-per-row
)
```

#### 8.3.2 The OpenCodeLive Driver — The 5-Hook Bridge (F14/F22, FULL code per C2)

```typescript
// jesl/bindings/opencode/hooks.ts — the ParagonHostBinding contract

// HOOK 1 — chat.message: PBA reasoning capture (assistant-origin ONLY)
export const chatMessageHook = (input: { message: Message; sessionID: string }) =>
  Effect.gen(function* () {
    if (input.message.info.role !== "assistant") return input      // source discriminator
    const bus = yield* EventBus                          // the ONE bus
    // opencode 1.14.51: reasoning parts arrive via message.part.updated with the
    // part at event.properties.part (types.gen.d.ts:744) — the v2 CORRECTION:
    for (const part of input.message.info.parts ?? []) {
      if (part.type === "reasoning" && part.state === "streaming") continue
      if (part.type === "reasoning") {
        yield* bus.emit("pba.reasoning.delta", { sessionID: input.sessionID, text: part.text })
      }
    }
    return input                                                   // NEVER mutates the message
  })

// HOOK 2 — tool.execute.before: THE AUTHORIZATION STACK (K5, in order)
export const toolBeforeHook = (input: { tool: string; sessionID: string }) =>
  Effect.gen(function* () {
    // (1) Escalation.intercept — Paragon tier >= 3 throws here:
    const esc = yield* Escalation.intercept(input)
    if (esc.blocked) return yield* Effect.fail(new StructuredEnforcementError({
      tier: esc.tier, family: esc.family, remedy: esc.remedy }))   // deny = THROW, never a log
    // (2) Policy.assertCapable — CurrentProgram.capabilities:
    yield* Policy.assertCapable(input.tool)
    // (3) Policy.assertPhase — poseidon/jesl ready-set:
    yield* Policy.assertPhase(input.tool)
    // (4) causationId ∈ journal — an Interpreter or Activity spawned this:
    const causation = yield* CurrentProgram.causationId           // FiberRef read
    yield* Journal.assertCausation(causation)                     // row exists or DENY
    // (5) PTA observe-and-maybe-deny (pre-armed layers from the bridge):
    const verdict = yield* ToolEngine.intercept(input.tool)
    if (verdict.action === "DENY") {
      return yield* Effect.fail(new StructuredEnforcementError({
        tier: verdict.tier, family: verdict.family, remedy: verdict.remedy }))
    }
    return input
  }).pipe(Effect.catchAllCause(() => /* LAST-in-stack ordering: record, rethrow */ Effect.failCause))

// HOOK 3 — tool.execute.after: record + Phase-B splice + LSP scheduling
export const toolAfterHook = (input: { tool: string; output: unknown }) =>
  Effect.gen(function* () {
    yield* ToolEngine.observe(input.tool, input.output)   // analyzeResult ingestion (F-2)
    // claim-gate Phase-B: a fresh claim with no container-test evidence in <300s
    // gets the [P-GATE] demand APPENDED to the output the model sees (mutation, never throw):
    return ClaimGate.phaseBSplice(input.output)
  })

// HOOK 4 — messages.transform: consume-on-read backup injection
export const messagesTransformHook = (input: { messages: Message[] }) =>
  Effect.gen(function* () {
    // dynamic content rides HERE (conversation-level), never the system prefix:
    const advisory = yield* PbaBridge.pendingAdvisory()   // evidence-first, ring 20
    return advisory ? withAdvisory(input.messages, advisory) : input.messages
  })

// HOOK 5 — system.transform: STATIC, byte-identical every call (K4)
export const systemTransformHook = (input: { prompt: string }) =>
  Effect.succeed(markerGuardedIdentity(input.prompt))
  // THE PROMPT CACHING LAW: one char of drift = 33× cost. This hook adds a static
  // marker ONCE (guarded) and never varies afterward. ALL dynamic injection is
  // tool.execute.before / messages.transform territory.
```

**Hook ordering law:** PBA/PTA hooks register LAST in the host chain (the v4.4.2 `tool.before` 14-stage → LAST pbaIntercept precedent) so every other transform has spoken before enforcement adjudicates.

#### 8.3.3 The TestLive Driver

Specified in §7.1; integration note: TestLive composes under BOTH `@effect/vitest` and the CLI (`jesl replay --driver test`) — the same Layer means the payload suite a rocket ships (F26 `payload/tests/`) runs identically in CI and in `bun test`.

#### 8.3.4 Watcher & Cron Drivers

`watcher.ts`: Fs watch → `$.trigger` channel re-seed (event-reactivate's wake source). `cron.ts`: the 10min/75s adaptive loop (wave-cron.ts pattern) as a Schedule on the cron-trigger node — TestClock-testable, never wall-clock-coupled (the quieted-window rule).

### 8.4 The Scanner Integration (C11) — One EventBus, No Fourth Runtime

```
                 ┌──────────────── ONE EventBus ────────────────┐
 message.part.updated ──► BehaviorEngine (PBA think)            │
                             │ ratio banks · synapse · capture  │
                             ▼                                   │
                      pba.family.hit ──► PbaBridge (pre-arm)     │
                             │ getLayersToPrearm · boostBaseline│
                             ▼                                   │
 tool.call.* ──────────► ToolEngine (PTA do)                     │
                             │ layer-loader · chain-tracker ·    │
                             │ intent-classifier · dispatcher    │
                             ▼                                   │
                      pta.intercept ──► StructuredEnforcementError
                             │                                     │
 *.ts writes ──────► EffectLsp (Activity, CLI + patch)           │
 touched files ────► LogicLsp (D25 persistence until AUDIT_DONE) │
                 └───────────────────────────────────────────────┘
```

All five scanners are Services on the engine Layer; none owns a loop outside `Effect.schedule`; none keeps a private journal (K: no separate PBA/PTA/JESL journals — one sha-chained ledger with the `source` discriminator `scanner/<name>`).

### 8.5 The Wave-Manager Binding

The `subagent-dispatch` node's cap implementation binds to the container-proven machinery: spec-file-only generate (wave-dispatch.ts 1906L), RETURN_INTEGRITY_LEXICON classification on returns (wave-status.ts), SQLite WAL upserts (wave-tracker.ts; `markComplete` REFUSED unless gate passed), stream reads FROM opencode.db part stream NEVER task_status (wave-read.ts — the false-liveness fix). The binding is a THIN adapter: node inputs map to ACTION_ARG_ALLOWLIST-legal args; node outputs are journal rows. No wave-manager file is edited (wrap, never rewrite).

### 8.6 The Consolidation Migrations (DD17–DD21) — Exact Diffs (C3/C4)

#### 8.6.1 DD18 — The Signature Reconciliation (G2)

- File: `Paragon_Microstructures/ms-compliance-collector/engine.ts`
- Function: `computeSignature(record)`
- Inside-block: replaces lines 8-11 (the EXCLUDES form).
- Before:
```typescript
const EXCLUDES = ["timestamp", "type"] as const
// sig = sha256(stableStringify(omit(record, ...EXCLUDES)))
```
- After:
```typescript
// DD18: the gates' shape is CANONICAL — timestamp+type INCLUDED (stronger binding;
// the collector's weaker form permitted replay ambiguity). ms-evidence-gates
// engine.ts:5-8 is the unchanged reference.
const sig = sha256(stableStringify(pickCanonical(record)))
// pickCanonical = { tool, args, output, timestamp, type } — field ORDER frozen
```
- Init diff (C4): none at module init; the POOL_TTL 600_000 sweep is untouched. Tests re-pin: one sig test asserting the same record hashes IDENTICALLY through `ms-compliance-collector.computeSignature` and `ms-evidence-gates.computeSignature`.

#### 8.6.2 DD19 — Escalation De-Duplication (G3)

- File: `Paragon_Microstructures/ms-state-machine/engine.ts`
- Function: the transition arm reading `ESCALATION_DEADLINE_WINDOW` (inline, lines 29-30)
- Before: inline `deadline = count >= 3 ? 0 : count >= 2 ? 2 : 5` and inline skipTier copy.
- After:
```typescript
import { computeDeadline, computeSkipTier } from "../ms-escalation-memory/engine.js"
// inside the transition arm:
const deadline = computeDeadline(count)     // 5/2/0 — SOLE authority
const skipTier = computeSkipTier(count)     // 0/2/3 — SOLE authority
```
- The deleted inline copy is snapshotted as `engine.legacy-reference.ts` (test-only fixture for the full-domain agreement property, §7.3.2).

#### 8.6.3 DD20 — Intent De-Duplication (G4)

- File: `Paragon_Microstructures/ms-intent-classifier/engine.ts`
- Function: `scoreSignalsLocal` (lines 7-50)
- Before: the 50-line inlined copy of the 4-bank scorer.
- After: DELETE the local function; add `import { scoreSignals } from "../ms-ratio-classifier/engine.js"`; every call site `scoreSignalsLocal(...)` → `scoreSignals(...)`.
- Verification: the 0.615/0.575 re-pin suite (§7.3.2) — the fusion numbers must not move.

#### 8.6.4 DD21 — The LASME Gap Port (G1)

- Sources: `v4.4.2-baseline/src/firewalls/evidence-tracker.ts:49-50` (the kind registrations + doc strings "a write/edit ACTUALLY happened", "a live probe ACTUALLY ran"), `:206-235` (`canSourceChange` / `canStatus` guards), `:321-342` (`applySourceChange` / `applyStatus` effects), `:638-646` (`isEventFresh` with `CLAIM_FRESH_WINDOW_MS 300_000` at `:32`); `src/lasme/engines/evidence-ingestion.ts:37` (dist_change), `:61` (`WRITE_TOOLS=['write','edit','write_file']`, `PASS_COUNT_RE /\d+\s+pass/i`).
- Target: `jesl/nodes/evidence-machine.ts` (F11).
- Mapping (verbatim logic, Effect-shaped surface):

```typescript
// the ported guards — pure, journal-fed:
export const canSourceChange = (r: EvidenceRecord, ev: SourceChangeEvent): boolean =>
  ev.subject.filePath !== undefined                    // :207 — subject file path REQUIRED
  && isDistScoped(ev.subject.filePath)                // :210 — dist-scope
  && ev.at > (r.lastSourceChangeAt ?? 0n)             // :219 — monotonic recency

export const canStatus = (r: EvidenceRecord, ev: StatusChangeEvent): boolean =>
  ev.detail?.probeOutput !== undefined                // :226-235 — probe detail REQUIRED

export const isEventFresh = ({ at, now, windowMs = CLAIM_FRESH_WINDOW_MS }: FreshnessInput): boolean =>
  at > 0n && now - at <= BigInt(windowMs)             // :638-646, fail-closed on at=0

// the ingestion (F-2): tool.execute.after feeds analyzeResult
export const analyzeResult = (r: { tool: string; output: string }) => ({
  writeEvidence: WRITE_TOOLS.includes(r.tool),        // evidence-ingestion.ts:61
  passEvidence: PASS_COUNT_RE.test(r.output),         // /\d+\s+pass/i
})
```

- Wire point: `toolAfterHook` (§8.3.2 HOOK 3) calls `ToolEngine.observe` which routes write/pass evidence into the machine. The 6-of-8 gap closes; the 8-kind union battery (§7.3.3) is the verification.

#### 8.6.5 DD17 — Survivor Registration (the losers become data)

Non-surviving implementations are NOT deleted in place (their trees stay as reference); the boilerplate's `nodes/` registers ONLY survivors, and the loser payloads (banks, corpora, tables) are loaded as DATA via `profiles/` (F21). BECAUSE: deleting the source trees breaks the proven batteries' provenance; registering only survivors in the new registry prevents double-implementation drift (K14: no second implementation of anything already proven).

### 8.7 Poseidon-as-Workflow & The XState Projectors (DD13)

- The v4.4.4 God Loop 13 phases (INIT→…→PASS) become ONE `Workflow.make` (F17): deterministic phases (AUDIT, SCORE, gates) as plain nodes; model phases (DECIDE, PLAN) as Schema-gated Activities or child Workflows with `idempotencyKey = docHash+seed`.
- The §25 XState machines DO NOT DIE: each subscribes to the EventBus and renders `poseidon.phase.entered` / workflow events into its own state chart — **XState renders, Effect runs**. The machines keep their inspectability and their v4.4.4 observability contract while every effectful step is a journaled Activity (no re-pay on the loop's re-entries; MAX_CYCLES 50 adaptive via GoalClassifier bugfix5/feature15/greenfield50 stays as the dispatch policy INPUT, not a separate runtime).
- WorktreeIsolator → scoped fiber resource (acquireRelease: worktree create / prune); Hydra messages → EventBus traffic injected conversation-level (K4).

### 8.8 The Docs Wave (DW1/DW2) — Insertion Points

- **DW1**: `KNOWLEDGE_LIBRARY/Bibles/JSON_EVENT_SCRIPTING_BIBLE.md` — insert `PART 2E — EFFECT KERNEL (PHASE 2)` between Part 2 and Part 3 with §2E.0–2E.12; patch-in-place: §0.2 grounding map + Effect/LSP/Workflow rows; §1F + the `Effect.forEach` sentence; §2.5 "pure = zero host imports AND zero raw Promise I/O"; Part 9 + 9G the JESL↔Effect law table; version → v1.2. FORBIDDEN: deleting Promise wording without an Effect twin; renaming node types; Effect.gen as authoring language.
- **DW2**: `v4.4.2-paragon-wave-manager/JESL_LIBRARY_DPL1_SPEC.md` — add §2.9 EFFECT KERNEL (D9–D15 + contracts + driver Layers + `JeslRun` idempotencyKey); §5.2 Phase-2 slices S1E–S8L WITHOUT renumbering S1–S6; §6 + criteria 13–16; §8 handoff chain; version → v1.1-E.
- Verification: the Phase-2 §5 nine-questions probe — 9/9 answerable "yes" from the three files (bible v1.2, DPL1 v1.1-E, EFFECT-RT) alone (G12 closure).

### 8.9 The Rocket Launch Integration (F26)

Launch paths (both must exist, criterion 8 + 11):

```
PATH A (bash, CLI Layer):
  bunx jesl run .opencode/skills/<rocket>/payload/workflow.json \
       --ctx .opencode/skills/<rocket>/payload/ctx.json --in '{...}'
    → verdict JSON on stdout; journal → .trident/rockets/<run-id>.jsonl (sha-chained)

PATH B (in-session, OpenCodeLive):
  jesl-run tool { workflow: "<rocket>/payload/workflow.json", in: {...} }
    → the SAME graph via the session's caps; ask-launcher nodes surface as
      tool-result questions the firing agent answers (the agent IS a node)
```

Ephemerality contract: no plugin rebuild, no registration — the rocket directory IS the deployment. Fires once, journals, dies. The `payload/tests/` suite runs `jesl validate` + `bun test` (it.effect on TestLive) pre-launch — the fuse checks the munition before ignition.

### 8.10 Sequencing & Wave Map (Gates)

| Wave | Files | Gate (mechanical) |
|---|---|---|
| P0 docs | DW1, DW2 | nine-questions probe 9/9 |
| S1E | F1–F11 | tsc 0; it.effect battery; token fixtures byte-identical; diamond = 2 batches |
| S2E | F12–F13 | criteria 3,4,6,8 on the host CLI |
| S3E | F14–F15 | criterion 11 + ask-launcher roundtrip in-container |
| S4E | F16–F17 | S7 + no re-pay on generation replay |
| S5E | F20 | criterion 9 — three targets re-validate and run |
| S6E | F23–F25 | 10/10 battery + criterion 5 + criterion 12 |
| S7P | Paragon wrap | S10 fixture green |
| S8L | LSP gate | write .ts → diagnostics token in journal; patch in prepare |
| P2 | F18 | demo-spec.mpse.md compiles; D17 reproduced |
| P3 | F19 | per-kernel fixtures + lifecycle ledger chain 1→6 |
| P4 | F21–F22 | three profiles, one engine, ZERO profile-id branches |
| P5 | battery + extraction | 10/10 + copy-and-customize dry-run |

Dependencies: P0 blocks S1E (an implementer without the Effect bind builds a Promise runner — G12). S1E blocks everything. P2/P3 require S4E (Workflow.make). Parallelizable: P4 profiles ride P3; S8L rides S2E.

### 8.11 Rollback & Compatibility Strategy

- Every wave is append-only at the file level; rollback = revert the wave's file set (the journal's own resume logic makes in-flight runs resumable across rollbacks — same doc+seed replays).
- Registry append-only (K13): no wave ever removes a kind; a botched kind gets a `*-v2` NEW kind and the old one marked deprecated-in-docs only.
- The [JESL ...] vocabulary is frozen (K3): the S1E fixture set is the regression tripwire — any token drift fails the wave gate before it can ship.
- The host shell is never edited (K4): the 5-hook pack is a registration; removing it restores prior behavior exactly (system.transform was never touched).

### 8.12 Integration Blind Spots (C8)

1. **The plugin client surface is VERIFY-ON-INSTALL** (DD24): `input.client`'s exact shape on 1.14.51 is verified at S3E; this spec's hook code assumes the documented event/plugin API and may need one adapter shim.
2. **@effect/workflow API surface** (v4 vs v3) is VERIFY-ON-INSTALL at S1E — the concept (idempotencyKey, Activity, DurableDeferred) is stable; the import path may differ.
3. **The v4.4.4 locus is SPEC-STAGE** (G7): the γ-layer integration (Poseidon-as-Workflow, Hydra-on-EventBus) targets the v4.4.4 SPEC text; if its runtime diverges when built, the projector contracts (DD13) re-bind at that boundary. α/β/δ layers are unaffected.
4. **Cross-process journal contention** — two concurrent CLI rockets writing one project ledger rely on append-atomicity of sub-PIPE_BUF writes; a true multi-writer fixture is deferred (PROPOSED: [flock advisory at the file cap, S6E hardening]).
5. **LSP patch drift** — the `prepare` patch tracks `@effect/language-service` upstream; a major bump can shift diagnostic rule names; the S8 fixture pins the current names and will fail loudly on drift (that is the designed behavior, not flakiness).

---

## SECTION 9 — COMPLIANCE MATRIX

### 9.1 The 16 Acceptance Criteria × Evidence

| # | Criterion | Closing artifact | Battery scenario / test |
|---|---|---|---|
| 1 | tsc 0 | CI typecheck log | every wave gate |
| 2 | battery 0-fail | `bun test` output | S6E gate |
| 3 | malformed docs refuse with named tokens | stderr + exit 3 per fixture | §7.2.1, S3 |
| 4 | deterministic doc headless → verdict PASS | stdout JSON | S1 |
| 5 | replay byte-determinism | chain head equality | S9 unit + container |
| 6 | cap-unbound LOUD, NO artifact | exit 4 + no file | S7 |
| 7 | parallel overlapCount≥1 + all verdict rows | journal parse | S5 |
| 8 | skill via bash end-to-end | rocket journal chain | S6 |
| 9 | packager emits 3 targets | emitted trees re-validate | §7.10, S5E |
| 10 | append-only compat | v1 doc on later registry | §7.2.7 + compat fixture |
| 11 | plugin driver loads | OpenCodeLive registration | S3E gate |
| 12 | kill -9 crash-safe + resume | resumed:true + chain valid | S4 |
| 13 | no raw fetch/Date.now/node:fs in core | ripgrep CLEAN | S8 leg 1 |
| 14 | LSP diagnostics 0 errors (kernel severity) | language-service exit 0 | S8 leg 2 |
| 15 | replay does not re-invoke | invoke-count delta 0 | S9 |
| 16 | layerinfo lists Journal/Fs/Shell | layerinfo output | S8E |

### 9.2 The K-Constraint × Mechanism × Verification Matrix

| K | Constraint | Enforcing mechanism | Verified by |
|---|---|---|---|
| K1 | single runtime | floatingEffect/runEffectInsideEffect LSP at error severity; runPromise only in cli/main | S8, grep `runPromise` sites = 1 |
| K2 | core purity | zero host imports; caps boundary `Effect.tryPromise` only | S8 leg 1; verifyImportGraph (Law18 pattern) |
| K3 | token stability | frozen code strings; structured errors print them | §7.2.1 fixtures byte-exact |
| K4 | shell immutability + caching law | system.transform static marker-guarded; dynamic via tool.before only | S3E: prompt-hash equality across 50 calls (33× law) |
| K5 | authorization = Policy+CurrentProgram+causationId | the 5-step stack, deny=StructuredEnforcementError | S10 ordering assertions |
| K6 | detector/decider/generator separation | schema refusals TIER-VIOLATION / UNBRACKETED-GENERATION | §7.2.1 |
| K7 | journal constraint | pre-invoke+verdict rows; covers(); source discriminator | §7.2.6, S9 |
| K8 | loud-fail | CAP-UNBOUND no-artifact; FALSE-SUCCESS ban | §7.3.1 fallback fixture |
| K9 | concurrency | forEach(15); per-item Exit; scoped children | §7.2.5 overlap |
| K10 | MPSE constraints | D13/D17/A3/oracle append-only | §7.11 |
| K11 | pipeline constraints | insertion agent-autonomous, dry-run gate | §8.2, P3 gate |
| K12 | rocket constraints | ephemeral launch; ask-launcher cap-free; machine-data anti-patterns | §7.3.6, §7.10 |
| K13 | compat | append-only registry; versioned $schema | §7.2.7 |
| K14 | grounding | SPEC-GATED rows until container rows exist | §9.5 sign-off |
| K15 | spec-only | no scaffolding before operator go | process gate (this spec) |
| K16 | environment | deps list F24; no Rust; no grok code reuse | dependency audit |
| K17 | do-not list | §9.3 detectors | grep battery |
| K18 | docs constraints | DW1/DW2 additive-only | nine-questions probe |
| K19 | battery constraints | tool-result-bound tokens; artifact per scenario | §7.5 tables |
| K20 | operator stance | verdicts from rows; tokens not counts | §7.0 laws |

### 9.3 Do-Not List × Mechanical Detectors

| Do-Not | Detector | Where |
|---|---|---|
| second runtime beside Effect | `rg "new Promise\(|\.then\(" jesl/core` = 0; asyncFunction LSP | S8 |
| T0/prompt-text authorization | `rg "getT0" jesl/` = 0 | grep gate |
| replay re-pay | S9 invoke-counter | battery |
| separate journals | journal rows all share one file per run; `rg "pba.*\.jsonl\|pta.*\.jsonl"` = 0 (except pta-ledger.jsonl legacy reference) | grep gate |
| Rhai/JS eval embedded | `rg "eval\(|new Function\(" jesl/` = 0 | grep gate |
| Effect.gen as authoring language | workflow.json is the only authoring surface; no .ts graph DSL exported | review + schema |
| rewriting PBA banks / R0-R17 in Effect.gen | nodes/ wrappers import pure cores; diff-size guard (wrapper < 200 LOC) | P7P review |
| custom tsserver | dependency list contains only @effect/language-service | F24 audit |
| GUI/mermaid editor | none emitted | packager test |
| unrequested fallbacks | FALSE-SUCCESS class throw | §7.3.1 |
| deleting JESL laws/catalog/fixtures | DW diffs are additive-only (diff review: zero deletions in touched canon regions) | docs gate |
| Promise wording removed without Effect twin | DW1 diff hunks pair every removal with an addition | docs gate |

### 9.4 Gap Closure Matrix (G1–G17)

| Gap | Priority | Closing artifact | Verified by |
|---|---|---|---|
| G1 event-kind port | P0 | F11 + 8-kind fixtures | §7.3.3 union battery |
| G2 sig divergence | P1 | DD18 diff | one-record-one-hash test |
| G3 escalation dup | P1 | DD19 diff | full-domain property |
| G4 ratio dup | P2 | DD20 diff | 0.615/0.575 re-pin |
| G5 pattern-family duality | P2 | registry dual encoding | 7-tuple-declares/4-bank-scores fixture |
| G6 SPEC-GATED ledger | P0 | F25 10/10 | §9.5 sign-off |
| G7 v4.4.4 build state | P3 | §8.12.3 integration note | honest statement (this spec) |
| G8 replay proof | P1 | S9 | invoke 0 + chain identical |
| G9 pre-arm e2e | P1 | S10 | seq-ordered journal |
| G10 honest stubs | P2 | SEMANTIC_UNAVAILABLE throws persist | green-throw tests |
| G11 lexicon packaging | P2 | locus battery runs the 3 machine seeds | F23 |
| G12 docs bind | P0 | DW1/DW2 | nine-questions 9/9 |
| G13 tier-2 replay | P2 | replay-source contract | needs-llm replay fixture |
| G14 operational ledger | P1 | one pinning fixture per class | F23 census (every G14 class ↔ fixture) |
| G15 estimate theater | P3 | tokens-not-counts rule | §7.5 passToken audit |
| G16 triage order | — | the wave map ordering | §8.10 |
| G17 closure map | — | this table | bidirectional: gap↔artifact |

### 9.5 Grounding Rows — SPEC-GATED → PROVEN Flips

| Mechanism | Current state | Flips to PROVEN when |
|---|---|---|
| JESL schema/graph/executor (Effect) | SPEC | S1E gate green + container row |
| Journal + covers() + kill-resume | SPEC | S4/S9/S12 container rows |
| oracle-gate on the MPSE bridge | SPEC | P2 gate (demo-spec compiles + discharges) |
| Poseidon-as-Workflow | SPEC | γ integration (G7-informed) |
| 8-kind evidence machine | SPEC (port designed) | G1 fixtures green in container |
| PBA/PTA wrapped cores | PROVEN (substrates) | remain PROVEN; wrappers PROVEN at S7P/S10 |
| wave-manager binding | PROVEN (machinery) | binding adapter verified at S3E/S4E |
| MathExpr evaluator + oracle | PROVEN (Codename:PARAGON 316/0 + container 11/11) | reused as-is |

**Sign-off protocol:** a row flips ONLY on a container-test-results.json per-scenario row citing the passToken in tool-result context (K14/K19). Prose flips are void.

### 9.6 Cross-Check Invariants (Bidirectional, Zero Orphans)

1. **Token↔Fixture** (F28): §7.4 grep gate — 8 tokens, 8 fixtures, both directions.
2. **Kind↔Registry↔Catalog**: every node kind in F7/F10 ↔ a registry row ↔ a DW1 catalog entry; CI script diffs the three surfaces (`kinds.ts` ↔ registry keys ↔ bible table rows).
3. **Activity↔Journal**: every `node:<id>` Activity name ↔ journal row kind on execution; the S9 replay index asserts presence.
4. **Cap↔Driver**: every cap in F8 ↔ a binding in F12/F14/F16; `layerinfo` (criterion 16) prints Journal/Fs/Shell; an orphan cap fails the unused-export audit (R8 pattern).
5. **MathExpr↔Grammar**: kinds emitted by F18 ⊆ the 24-kind grammar (expr.ts:18-40); the bridge emits zero novel grammar nodes — enforced by a compile-time exhaustiveness check on the kind union.

### 9.7 Canon Doctrine Compliance

| Canon line (S6) | Where enforced |
|---|---|
| "JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime." | §8.1 header; K1 detectors |
| "the shadow generates what only a language model can generate; the lexicons detect…; the state machines decide…; the actors execute…" (fusion law) | generation set bracketing; PBA/PTA split; K6 |
| "the regex is a mechanical DETECTOR only" (Warhead 9) | banks wrap as detectors; decisions in machines |
| "EITHER A LOUD FUCKING ERROR OR IT WORKS" | K8; exit-code contract; FALSE-SUCCESS ban |
| "the firewall does not read the agent's reasoning — it evaluates the agent's number against the oracle" | oracle-discharge integer equality; S10 asserts on rows not prose |
| "Math is the spec. Code is the implementation. Tests are the proof." | §7.0; the proof chain |
| "EXISTENCE IS NOT AUDIT" | audit-registry node; auditAdvanceAllowed |
| founding N=8×(1+P=2)=24 vs 40/13 zero-FP | carried by MathExpr reuse (DD8) — no second grammar |

### 9.8 Sign-Off — The Flip Protocol & Final Acceptance State

**ACCEPTED** when, and only when:

1. The 16-criteria table (§9.1) shows every row closed by an artifact path, not a claim.
2. The battery artifact `.trident/container-test-results.json` (F25) records 10/10 — §7×7 + S8 + S9 + S10 — each row with `passTokenMatch: true` in tool-result context, `failTokenAbsent: true`, container name, and build sha.
3. The grounding map (§9.5) shows zero rows flipping on prose; every SPEC-GATED row either flipped on evidence or is explicitly listed as remaining (honest ledger).
4. The bidirectional greps (§9.6) all exit 0.
5. The gap closure matrix (§9.4) shows G1, G6, G12 (P0) closed; P1 rows closed or carrying dated work orders.

**REJECTED** when any "structural PASS", "PASS by design", or count-based (rather than token-based) verification appears anywhere in the evidence chain — per K19 those verdicts are FLAWED by definition, and a FLAWED row fails its scenario, and a failed scenario fails the battery, and the battery is the only acceptance authority: **the container test IS the test.**

---

## GENERATION DEMANDS (UNMET — single-round policy)
This artifact was generated in ONE round; the v1 multi-round regeneration loop was removed because it multiplied generation time 2-4x on slow models (observed 2+ hour runs). The following gate demands were NOT met by the generated content. The build agent MUST satisfy every demand below when implementing from this spec:

1. STRUCTURE: the spec lacks CME-grade structure. SURGICALLY EXPAND — do NOT regenerate from scratch, keep ALL existing correct content. MISSING ELEMENTS (fix EACH):
  - INIT_DIFF: EVERY changed state/init function MUST include the exact initialization diff inside a code fence.
  - TEST_PLAN_COMPONENTS: The ## CONTAINER TEST PLAN (0B) MUST reference the actual component names (not placeholders).
  - TEST_PLAN_TOKENS: The ## CONTAINER TEST PLAN MUST use the 7-field scenario format: Feature under test / Prompt / Pass token / Fail token / Max wait / Evidence capture.
  - TEST_PLAN_ADVERSARIAL: The ## CONTAINER TEST PLAN MUST include TEST SCENARIOS (5+), ADVERSARIAL (1+), EVIDENCE and PASS CRITERIA sections.


## CONTAINER TEST PLAN — EXACT (spec contract — plan-first)

This plan is the DEFINITION OF DONE. Extract this section verbatim into .trident/test-plan.md and feed it to trident-container-test action=setup — it passes validateTestPlan. Pass tokens are TOOL-RESULT-BOUND (JSON fields / error codes / gate values) — an agent cannot satisfy them by typing. Every component and its importers must map to a scenario.

## OBJECTIVE
Runtime-grade verification of the MacroKernel_Edition-v1.0 library (jesl/*) + the MPSE bridge + the scanner wraps. §7 (TEST SPECIFICATIONS) is the full scenario authority; this plan is its extractable contract. Each component maps to scenarios below; blast radius (importers of changed files) covered by regression scenarios.

## TOOLS UNDER TEST
- jesl core (F1–F9: WorkflowCodec, Graph, EventBus, Channels, Executor, Journal, Registry, Caps, Errors) — scenarios 1, 2, 4, 5
- jesl nodes (F10–F13, F16: the kind set incl. evidence-machine F11 + prompt dual-mode) — scenarios 1, 3, 7
- the CLI driver (F12) + the execution kinds — scenarios 1, 2, 3, 6
- the skill rocket payload (F20 emit skill) — scenario 6
- the scanner services (F15) — scenario 7 + adversarial 2
- the Effect kernel hygiene surface — scenario 8
- the Activity replay path (F6/F17) — scenario 9

## TEST SCENARIOS
### Scenario 1: jesl run — the deterministic doc executes end-to-end (TOOLS)
- Feature under test: the CLI + the readiness executor on fixtures/mech-gate.json
- Prompt: `jesl run fixtures/mech-gate.json --in fixtures/in.json`
- Pass token: `"verdict":"PASS"` in stdout JSON AND exit 0
- Fail token: any stderr traceback OR `"verdict"` absent
- Max wait: 60000
- Evidence capture: stdout excerpt + exit code + the journal path

### Scenario 2: jesl validate — malformed docs refused (BOUNDARY)
- Feature under test: the WorkflowCodec cross-validation
- Prompt: `jesl validate` on bad-unknown-kind / bad-cycle / bad-tier / bad-unbracketed
- Pass token: the matching `[JESL UNKNOWN-NODE]` / `[JESL CYCLE]` / `[JESL TIER-VIOLATION]` / `[JESL UNBRACKETED-GENERATION]` in stderr, one per fixture, exit ≠ 0
- Fail token: exit 0 on any bad fixture (accepted-invalid-input)
- Max wait: 30000
- Evidence capture: the four stderr excerpts + exit codes

### Scenario 3: the unbound capability fails LOUD (ERRORS)
- Feature under test: caps = R (E3/K3)
- Prompt: run fixtures/needs-llm.json under a keyless CLI
- Pass token: `[JESL CAP-UNBOUND] llm` in the journal row AND stderr; exit ≠ 0; NO output artifact
- Fail token: any substitute/fabricated artifact on disk
- Max wait: 30000
- Evidence capture: the journal row + the artifact-dir listing proving absence

### Scenario 4: replay determinism + crash-safe journal (STATE)
- Feature under test: the Journal service (covers(), sha chain, resume)
- Prompt: run the tier:1 fixture twice; then kill -9 mid-run and `jesl replay`
- Pass token: the two journals' sha256 row-chain diff EMPTY; post-kill every line parses; replay resumes from the last complete row
- Fail token: hash mismatch OR a partial row OR replay from zero
- Max wait: 60000
- Evidence capture: the diff/sha256sum outputs + the post-kill wc -l

### Scenario 5: parallel overlap + sibling survival (CONCURRENCY)
- Feature under test: the Executor forEach(15)
- Prompt: run fixtures/parallel-5.json (branch 3 designed to fail)
- Pass token: journal `overlapCount ≥ 1` AND all 5 verdict rows (4 PASS + 1 ready:false named)
- Fail token: strictly sequential windows OR the failing branch absent
- Max wait: 60000
- Evidence capture: the timestamped journal rows

### Scenario 6: the skill rocket end-to-end via bash (INTEGRATION)
- Feature under test: the emit-skill payload + the CLI Layer
- Prompt: `bunx jesl run .opencode/skills/jesl-fixture/workflow.json --ctx ctx.json --in '{"topic":"..."}'`
- Pass token: exit 0 + the declared artifact on disk with expected content + stdout verdict JSON
- Fail token: missing artifact OR non-zero exit
- Max wait: 120000
- Evidence capture: ls of the artifact + its head + the stdout excerpt

### Scenario 7: the composition discipline enforced (FIREWALL)
- Feature under test: tier/unbracketed refusals + the ask-launcher roundtrip
- Prompt: validate bad-tier + bad-unbracketed; in the opencode driver, run the ask-launcher fixture with a scripted answer
- Pass token: `[JESL TIER-VIOLATION]` + `[JESL UNBRACKETED-GENERATION]` in stderr; the completed run's journal shows the prompt node's answer channel written
- Fail token: either doc validating clean OR the question never surfacing
- Max wait: 60000
- Evidence capture: the two stderr excerpts + the roundtrip journal row

### Scenario 8: Effect kernel hygiene (the S8 gate)
- Feature under test: core purity (K2)
- Prompt: ripgrep the banned set + `effect-language-service diagnostics --project jesl/tsconfig.json`
- Pass token: zero hits for node:fs/fetch/Date.now/globalFetch/floatingEffect in jesl/core; diagnostics exit 0
- Fail token: any core file matching a banned import or an unyielded Effect
- Max wait: 60000
- Evidence capture: the ripgrep outputs (empty) + the diagnostics exit code

### Scenario 9: Activity replay never re-pays (the S9 gate)
- Feature under test: covers() over Activities
- Prompt: run fixtures/mech-gate.json twice with an invoke counter on shell-exec
- Pass token: second run invoke count 0 AND the journal sha chain identical
- Fail token: the second run execs shell again
- Max wait: 60000
- Evidence capture: the counter readings + the chain diff

## ADVERSARIAL
### Adversarial 1: hostile input — the malformed document battery
- Feature under test: the authoring gate rejects malformed/undersized graphs
- Prompt: send the full bad-fixture battery incl. a doc with an unseedable entry channel
- Pass token: each named `[JESL ...]` token incl. `[JESL NO-SEED]` — never a hang, never a silent pass
- Fail token: accepted-invalid-input
- Max wait: 30000
- Evidence capture: the per-fixture stderr tokens

### Adversarial 2: the Paragon pre-arm chain (the S10 gate)
- Feature under test: PBA→PTA bridge end-to-end
- Prompt: scripted reasoning containing TEST_EVASION suggestive-bank text, then a tool.execute.before bash call
- Pass token: the journal shows `pba.family.hit` THEN `pta.intercept`; the bash Activity never ran (StructuredEnforcementError deny in the tool result)
- Fail token: the bash Activity executed
- Max wait: 60000
- Evidence capture: the two journal rows + the tool-result deny

## EVIDENCE
Per scenario: the pass token MUST appear in a TOOL RESULT (stdout/stderr JSON field, exit code, or on-disk artifact content) — never agent free text (anti-circularity); `action=check pattern="<pass token>"` matches AND `pattern="<fail token>"` does not; artifacts + sha256 as declared; the per-scenario rows recorded in .trident/container-test-results.json (passTokenMatch / failTokenAbsent / toolResultContext / verdict).

## PASS CRITERIA
ALL 9 scenarios + BOTH adversarial pass (11/11) with passToken present AND failToken absent (tool-result-context verified). Any failToken appearance = suite FAILED.

---

## APPENDIX — THE POST-GENERATION AUDIT RECORD (2026-09-03)

Generated by trident-deep-planning layer=2 from the preflighted 8-field inputFile (12,140/19,930/12,319/9,002/8,656/9,411/8,341/9,757 chars — all 8 PASS, READY). The mandatory audit chain executed: the full slop-scan battery (duplicate-header / placeholder / truncation / drift / conflicting-constant greps) + the structure extraction + targeted reads of the seam and tail regions.

**FINDINGS + FIXES (3 defects, all surgically fixed — never regenerated):**
1. PLACEHOLDER CONTAINER PLAN (the tail): the generator emitted a generic 5-scenario plan with the placeholder component name `THE-MANDATE--operator--2026-09` instead of the spec's real battery. FIXED: replaced with the REAL 11-row battery (S1-S9 + adversarial ×2) — tool-result-bound tokens (the [JESL ...] vocabulary, verdict JSON fields, the counter/diff outputs), 7-field format, 11/11 threshold.
2. THE §3/§4 DUPLICATE TITLE SEAM: two sections titled "COMPONENT DESIGN". FIXED: §4 retitled "EXTENDED COMPONENT DESIGN (the K-series...)" + the disambiguation note at §4.0 (§3 = the contract of record for the core services; §4 = the expansion + the remaining surface).
3. THE §6/§8 DUPLICATE TITLE: two "INTEGRATION PLAN" sections (different content — the wave map vs the wrap rules). FIXED: SECTION 8 retitled "INTEGRATION SURFACES (the wrap rules — complements §6's wave map)".

**CLEAN (verified by the battery):** zero duplicate headers after the fixes; zero placeholders; zero truncation danglers; the constants consistent across sections (POOL_TTL 600_000 = 2× 300s everywhere with the BECAUSE; EXILE_MS 45000 with the ledger-window rationale; concurrency 15 ×6 hits; the canonical-sig rule DD18 stated at every surface); the one "wave-tracker" grep hit is the legitimate subagent-dispatch wrap description (a false-positive drift marker); the canon line, the [JESL ...] vocabulary, the fixture↔token cross-matrix (§7), and the wave-map gates all present.

**THE STANDING DIRECTIVE:** SPEC-ONLY — no implementation authorized until the operator's explicit go ("dont build it just spec it", standing ×2).
