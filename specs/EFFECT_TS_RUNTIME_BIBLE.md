# EFFECT — THE RUNTIME BIBLE
## The Execution Kernel for JESL Documents, Warheads, God Loops, and Paragon Planes
### Codename: EFFECT-RT v1.0 — 2026-09-02

**TRIGGER:** you are authoring or running JESL workflows, Trident warheads, Poseidon phases, or Paragon PBA/PTA planes — and the live path must be typed, interruptible, journaled, and deaf to theatrical prose.
**DUTY:** the one canon for *how work executes*. JESL is the document grammar. This bible is the machine that is allowed to touch the world.
**PROTOCOL:** Read fully. Compose from the catalog (Part 5). NEVER open a second runtime (`async`/`fetch`/`Date.now`/`XState.execute`) beside Effect.

**Companion canon:**
- `JSON_EVENT_SCRIPTING_BIBLE.md` (JESL v1.1) — the document grammar this runtime interprets
- `JESL_LIBRARY_DPL1_SPEC.md` — the library slices; this bible is Phase 2 of that spec
- `TEB_MACHINES_FOR_BEHAVIOR_ENGINEERING_T1.md` — machines stay deciders; Effect runs them
- `REASONING_TOKEN_CAPTURE_WIRING.md` — PBA input plane
- Official Effect: `node_modules/effect/AGENTS.md`, `@effect/language-service`, `@effect/workflow`

**THE THREE SENTENCES OF DISCIPLINE:**
1. **JSON is not a programming language — Effect is the runtime; JSON is the control-flow-by-composition grammar over Effect services.**
2. **An Effect is a value (`Effect<A,E,R>`) until a Layer is provided and a fiber runs it — construction is not execution.**
3. **Every side effect is an Activity or a bound capability — the journal is the truth; T0 / prompt text never authorizes I/O.**

---

## 0.1 THE THESIS

JESL proved the *document* shape: schema-gated JSON graph, node-kind registry, channels, journal, loud-fail, lowest-tier wins. grok-build proved the *host* shape: sandboxed script + engine + host IPC + sha256 journal. Effect is the missing *kernel*: typed errors, dependency injection as `R`, structured concurrency as fibers, Schema as the codec, Workflow+Activity as crash-safe replay.

A JESL node `invoke` is an `Effect<NodeResult, JeslError, Caps>`. A JESL capability is a `Context.Service`. A JESL driver is a `Layer`. A JESL run is a durable `Workflow` when it must survive process death; a scoped fiber when it is session-ephemeral. Paragon (think) and PTA (do) and Effect LSP (artifact) are three scanners on the same bus — they are not a fourth runtime.

## 0.2 THE GROUNDING MAP

| Element | Status | Anchor |
|---|---|---|
| `Effect<A,E,R>` / `Effect.fn` / `Effect.gen` | **REAL** | `effect` package |
| Context + Layer + Scope | **REAL** | `effect` |
| Schema decode/encode | **REAL** | `effect/Schema` |
| Fiber / structured concurrency | **REAL** | `effect` |
| Clock, Random, Schedule, TestClock | **REAL** | `effect` |
| `@effect/platform` FileSystem/Http/Command/Path | **REAL** | platform packages |
| `@effect/ai` LanguageModel + Tool | **REAL** | Effect AI |
| Workflow + Activity + DurableClock/Deferred | **REAL (v4 / `@effect/workflow`)** | durable execution |
| `@effect/language-service` + CLI + `patch` | **REAL** | artifact plane |
| `@effect/vitest` / `it.effect` | **REAL** | test plane |
| JESL schema + registry + runner | **SPEC** | JESL bible + DPL1 |
| Effect-hosted JESL executor | **THIS BIBLE'S SPEC** | Part 2 |
| PBA/PTA as Effect services | **SPEC-ON-PROVEN-MATH** | Paragon engines exist; wrap, don't rewrite |

**LAW OF THE GROUNDING MAP:** Effect wraps proven JESL/Paragon machinery. A node kind whose substrate is not container-proven stays `SPEC-GATED`. Effect does not invent a parallel orchestrator.

## 0.3 ONE KERNEL, FOUR PLANES

```
DOCUMENT     workflow.json + ctx.json          (JESL)
     │ Schema.decode
     ▼
KERNEL       Effect program + Layers           (THIS BIBLE)
     │
     ├── THINK     PBA  observeText → classify → synapse
     ├── DO        PTA  interceptTool / chain-tracker
     ├── ARTIFACT  Effect LSP diagnostics CLI
     └── RUN       Workflow / Fiber + Journal
```

The four planes share: EventBus, Escalation, CurrentProgram, EvidenceStore. They do not share: regex internals, AST walkers, tsserver.

---

# PART 1 — THE EFFECT LAWS (BIND TO JESL 1A–1I)

### E1 — THE VALUE LAW (construction ≠ execution)
1. ALWAYS treat `const p = Poseidon.execute(payload)` as data. Nothing has run.
2. NEVER start work at definition (`new Promise`, floating `fetch`, `init()` that talks to disk).
3. MUST run at exactly one edge: driver `Effect.runPromise` / `runFork` after `Effect.provide(Live)`.

### E2 — THE CHANNEL LAW (`A`, `E`, `R`)
1. ALWAYS let success live in `A`, expected failure in tagged `E`, services in `R`.
2. NEVER `try/catch` inside `Effect.gen`. Use `Effect.try` / `tryPromise` + `Schema.TaggedError`.
3. MUST `return yield* Effect.fail(...)` in branches so types narrow (JESL Loud-Fail = typed fail).

### E3 — THE LAYER LAW (capabilities are services)
1. ALWAYS declare I/O as `Context.Service`. JESL `caps.shell|llm|fs|http|tool|subagent` = service keys.
2. NEVER `import fs from "node:fs"` / global `fetch` / `Date.now` / `Math.random` / `setTimeout` in kernel or node impls.
3. MUST fail `[JESL CAP-UNBOUND]` when a node requires a service not in the provided Layer — same as unbound cap, now in `R`.

### E4 — THE SCHEMA-GATE LAW (JESL 1E, upgraded)
1. ALWAYS decode documents, events, tool args, model JSON, receipts with Effect Schema (Zod may exist at the OpenCode edge only; decode immediately).
2. NEVER `JSON.parse` as a codec. `preferSchemaOverJson` is an enforcement rule, not style.
3. MUST refuse unknown node `type`, dangling edges, cycles, tier violations *before* any fiber starts.

### E5 — THE ACTIVITY LAW (journaled I/O)
1. ALWAYS put world-touching work in `Activity.make({ name, success, error, execute })` when the run is durable.
2. NEVER re-execute an Activity on replay — the journaled value returns.
3. MUST keep code *between* Activities deterministic (interpreter, score, transition table, channel readiness). That is JESL graph math.

### E6 — THE FIBER LAW (JESL 1F, upgraded)
1. ALWAYS fan-out with `Effect.forEach(..., { concurrency: n })` or child workflows — not `Promise.all`.
2. NEVER let one child kill siblings — JESL `allSettled` = `Effect.partition` / per-item `Exit`.
3. MUST attach children to the run Scope; session end interrupts the tree (tmux, file locks, HTTP abort).

### E7 — THE AUTHORIZATION LAW (T0 is a projector)
1. ALWAYS authorize a tool via Policy + CurrentProgram + journal causationId.
2. NEVER authorize via `getT0()`, system-prompt stickers, or warhead prose.
3. MUST treat Effect LSP diagnostics as *evidence on the artifact plane*, not as permission.

### E8 — THE SEPARATION LAW (JESL 1A, preserved)
1. Detect = pure function or cheap Effect with no cap.
2. Decide = deterministic Effect (`gate`, `machine`) — INCONCLUSIVE on doubt.
3. Generate = Activity through `llm` / `subagent` cap, inbound + outbound gate required.
4. NEVER let a detector decide. NEVER let a generator verify itself.

### E9 — THE TIER LAW (JESL 1I + Effect cost)
1. Tier 1 = no `llm`/`subagent` in `R` for that run.
2. Tier 2 = generation Activities bracketed by Schema gates, repair≤2.
3. MUST prefer a lexicon/machine over an LLM for any verdict.

### E10 — THE SINGLE-RUNTIME LAW
1. XState, Promise loops, and hook bodies are projectors or edges — they do not call Docker.
2. One `run*` per hook / CLI invocation. Inside, only `yield*`.
3. `@effect/language-service` `floatingEffect` + `runEffectInsideEffect` are mechanical enforcers of this law.

---

# PART 2 — THE GRAMMAR (EFFECT STRUCTURE FOR JESL)

## 2.1 THE TYPE ALGEBRA

```
Effect<Success, Error, Requirements>
```

| Slot | JESL twin | Example |
|---|---|---|
| `A` | `NodeResult` / output-contract | `{ verdict, outputs, evidence }` |
| `E` | `[JESL …]` structured error | `JeslCapUnbound`, `JeslTierViolation` |
| `R` | bound caps + kernel services | `Shell \| Fs \| Journal \| Clock` |

A whole document run:

```
Effect<RunReceipt, JeslError, JESL_R>
```

`JESL_R` = union of every node's `requiresCaps` plus `Journal`, `Bus`, `Clock`, `Random`.

## 2.2 THE KERNEL SERVICES (JESL core as Context)

| JESL module | Effect service | Notes |
|---|---|---|
| `core/schema.ts` | `WorkflowCodec` | `Schema.decodeUnknown(WorkflowDoc)` |
| `core/graph.ts` | `Graph` | readiness sets — **pure**, wrap in `Effect.sync` |
| `core/bus.ts` | `EventBus` | pub/sub; handlers are Effects, isolated failures |
| `core/channels.ts` | `Channels` | `Ref`/`SubscriptionRef` of named values |
| `core/executor.ts` | `Executor` | readiness loop as `Effect` recursion + `forEach` |
| `core/journal.ts` | `Journal` + Workflow engine journal | sha256 chain; `covers()` = Activity replay |
| `core/registry.ts` | `NodeRegistry` | `Map<kind, NodeImpl>` where impl returns Effect |
| `core/caps.ts` | individual Services | driver Layers bind them |
| `core/errors.ts` | `Schema.TaggedError` family | one tag per `[JESL …]` code |

**NodeImpl (Effect edition):**

```ts
interface NodeImpl {
  kind: string
  family: "event" | "decision" | "generation" | "orchestration" | "evidence" | "execution"
  requires: ReadonlyArray<ServiceTag>
  setup: (spec: NodeSpec) => Effect<NodeHandle, JeslError, RegistryDeps>
}

interface NodeHandle {
  invoke: (input: ChannelData) => Effect<NodeResult, JeslError, Caps>
  subscriptions?: ReadonlyArray<BusSub>
}
```

No `Promise` in the interface. Drivers adapt Promises at the cap boundary only (`Effect.tryPromise`).

## 2.3 JESL NODE → EFFECT MAPPING

| `"type"` | Effect shape | Durable? |
|---|---|---|
| `event-filter` / `capture-engine` | `EventBus.subscribe` → write channel | no (session fiber) |
| `gate` / `oracle-gate` | `Effect.sync` + Schema / predicate | no |
| `machine` / `state-machine` / `circuit-breaker` | `Effect` over registered machine value | persist snapshot if cross-process |
| `tool-call` | Activity + `Toolkit.invoke` | yes if replay-sensitive |
| `pipeline` / `parallel` | `Effect.all` / `forEach` | inherited |
| `retry-chain` | `Effect.retry(Schedule)` + 429 exile | schedule is data |
| `pause` | `DurableDeferred` | **yes** |
| `cron-trigger` | `Schedule` + `Clock` | driver fiber |
| `journal-sink` / `triplet-writer` | `Journal.append` | the journal itself |
| `replay-source` | Workflow resume / `covers()` | **yes** |
| `shell-exec` / `python-exec` | `Command` Activity | yes |
| `http-request` | platform Http Activity | yes |
| `file-io` | `FileSystem` Activity, write-scope | yes |
| `prompt.call-model` | `@effect/ai` Activity + Schema | **yes** (do not re-pay) |
| `prompt.ask-launcher` | `DurableDeferred` (no llm cap) | **yes** |
| `shadow-agent` / `subagent-dispatch` | child Workflow (v2) | **yes** |

## 2.4 WORKFLOW VS FIBER (when durable)

Use **`Workflow.make`** when any of: process may die mid-run, generation must not be re-paid, pause/resume, Poseidon 13-phase, WarheadRun with waits.

Use a **scoped fiber** when: single hook, Tier-1 gate, in-memory session monitor, tests with TestClock.

```ts
const JeslRun = Workflow.make({
  name: "JeslRun",
  payload: { docHash: Schema.String, seed: Schema.Unknown },
  success: RunReceipt,
  error: JeslError,
  idempotencyKey: ({ docHash, seed }) => `${docHash}:${hash(seed)}`
})
```

Each effectful node = one Activity named `node:<id>`. Channel math between Activities is deterministic replay fodder.

## 2.5 DRIVER = LAYER

```
CliLive      = Shell.layer + Fs.layer + Http.layer + Journal.file
OpenCodeLive = CliLive + ToolClient.layer + Subagent.layer + Llm.layer + Hooks.bus
TestLive     = TestClock + InMemoryJournal + ScriptedToolkit + MemoryFs
```

A document that only needs `shell`+`fs` runs on `CliLive`. A document that declares `llm` validates everywhere and dies `[JESL CAP-UNBOUND]` on CliLive — loud, no artifact.

## 2.6 EXECUTION LOOP (JESL 2.6 as Effect)

```
seed (argv | hook | cron)
  → Schema.decode(WorkflowDoc)
  → provide(DriverLive)
  → Workflow.execute | Fiber
       while incomplete:
         ready = nodes whose inbound channels are set
         yield* Effect.forEach(ready, invokeAsActivity, { concurrency: 15 })
         writes wake more nodes
         bus events write channels (second wake)
       output-gate Schema.decode(output-contract)
       verdict FROM journal rows, never prose
```

Interruption: Scope close → kill shell children, detach bus, flush journal.

---

# PART 3 — PARAGON + LSP ON THE SAME KERNEL

## 3.1 THREE SCANNERS, ONE TIER

| Plane | Input | Engine | Effect wrapper |
|---|---|---|---|
| PBA (think) | reasoning / text-think tokens | 4-bank ratio + λ + lattice | `BehaviorEngine` service |
| PTA (do) | tool.execute.before/after + chains | JSON layers + chain-tracker | `ToolEngine` service |
| LSP (artifact) | written `.ts` | `@effect/language-service` CLI | `EffectLsp` service |

Bridge: **PBA → PTA only** (pre-arm). LSP hits map to families but do not rewrite thought λ.

## 3.2 LSP RULES AS FAMILY MAP (port, don't fork)

| Diagnostic | Family | Default kernel severity |
|---|---|---|
| `floatingEffect` | THEATRICAL_PLANNING | error |
| `missingStarInYieldEffectGen` | RUNTIME_SMUGGLING | error |
| `missingEffectContext` / `missingLayerContext` | incomplete program | error |
| `runEffectInsideEffect` | RUNTIME_SMUGGLING | error |
| `globalFetch*` `globalDate*` `globalTimers*` `globalRandom*` | RUNTIME_SMUGGLING | error |
| `asyncFunction` | RUNTIME_SMUGGLING | error (kernel paths) |
| `tryCatchInEffectGen` | THEATRICAL_PLANNING | error |
| `preferSchemaOverJson` | SCHEMA_EVASION | error |
| `nodeBuiltinImport` | RUNTIME_SMUGGLING | error |
| style (`unnecessaryPipe`, …) | — | off for DENY |

Instruments: `effect-language-service diagnostics --file`, `overview`, `layerinfo`, `patch` so `tsc` carries the same errors.

## 3.3 AUTHORIZATION STACK (tool.execute.before)

```
1. Escalation.intercept      (Paragon tier ≥ 3)
2. Policy.assertCapable      (CurrentProgram.capabilities)
3. Policy.assertPhase        (Poseidon / JESL ready-set)
4. causationId ∈ journal     (Interpreter or Activity spawned it)
5. Toolkit.invoke
```

All five are Effects. Deny is `StructuredEnforcementError`, not a log line.

---

# PART 4 — WARHEAD + GOD LOOP (EFFECT EDITION)

## 4.1 WARHEAD = JESL DOCUMENT + ACTIVITY MODULE

```
src/warheads/<id>/
  SKILL.md
  workflow.json      ← JESL doc
  ctx.json
  activities.ts      ← Effect Activities for this package only
```

`getT0()` / `getStatus()` become projectors over Journal + live fibers. Registration = `Layer.merge` of activity layers + registry metadata. `init(): Promise` is banned.

## 4.2 POSEIDON = ONE WORKFLOW

Phases INIT/AUDIT/SCORE/COLLECT/AUDIT_RECHECK = deterministic Activities.
Phases DECIDE/PLAN/DISPATCH/VERIFY/CONTAINER_TEST/PROBLEM_SOLVE = Schema-gated model Activities or child workflows (`BuildFile` per file).
Illegal transition = `PhaseActionError` (JESL loud-fail).
Snapshot-hash watch = bus event `repo.changed` → DurableDeferred → AUDIT_RECHECK.
XState FSM = projector of `poseidon.phase.entered`.

## 4.3 CURRENTPROGRAM

`FiberRef` set while a `JeslRun`/`WarheadRun` applies actions. Hooks read it. Scripts cannot set escalation tier; only Escalation service writes tier.

---

# PART 5 — CATALOG (EFFECT MICRO-TEMPLATES)

### 5K-1 — SERVICE SHELL
```ts
class Journal extends Context.Service<Journal>()("Journal", {
  make: Effect.gen(function* () { /* append, covers, serialize */ })
}) {}
```
**WHEN:** every cap and kernel module. **FAILURE:** leaking impl types into `R`.

### 5K-2 — TAGGED ERROR
```ts
class JeslCapUnbound extends Schema.TaggedError<JeslCapUnbound>()("JeslCapUnbound", {
  cap: Schema.String, node: Schema.String
}) {}
```
**WHEN:** every `[JESL …]` code. **FAILURE:** `throw new Error(string)`.

### 5K-3 — ACTIVITY NODE
```ts
Activity.make({
  name: "node:shell-exec",
  success: NodeResult,
  error: JeslError,
  execute: Shell.exec(spec)
})
```
**WHEN:** any cap-bound node in a durable run. **FAILURE:** raw exec outside Activity.

### 5K-4 — RETRY CLASS
```ts
Effect.retry(Schedule.exponential("2.5 seconds").pipe(Schedule.compose(Schedule.recurs(4))))
// 429 → exile Layer, not retry-in-place
```
**WHEN:** http / llm. **FAILURE:** retry 429 on same key.

### 5K-5 — PARALLEL BATCH
```ts
Effect.forEach(ready, invoke, { concurrency: 15 })
```
**WHEN:** JESL ready-set. **FAILURE:** `Promise.all`.

### 5K-6 — TESTCLOCK FIXTURE
```ts
it.effect("deadline", () => Effect.gen(function* () {
  yield* TestClock.adjust("24 hours")
}))
```
**WHEN:** pause, cron, synapse decay-by-seq still uses seq; wall waits use Clock.

### 5K-7 — LSP SCAN ACTIVITY
```ts
Activity.make({ name: "EffectLspScan", success: DiagnosticReport, execute: Lsp.diagnostics(path) })
```
**WHEN:** after edit/write of `*.ts`. **FAILURE:** trusting the model that "types pass".

### 5K-8 — ASK-LAUNCHER DEFERRED
```ts
DurableDeferred.await(AskSlot)
// tool result surfaces question; launcher answer completes deferred
```
**WHEN:** skill `prompt.mode=ask-launcher`. **FAILURE:** in-memory Promise across process death.

---

# PART 6 — CORRECT / WRONG

| # | Wrong | Correct |
|---|---|---|
| P3-1 | JESL executor as `async function loop()` | `Executor` service, readiness as Effect |
| P3-2 | Cap = optional callback | Cap = Service in `R`, missing = `JeslCapUnbound` |
| P3-3 | Journal is a side write after success | Verdict computed FROM journal; Activity *is* the write |
| P3-4 | `getT0()` authorizes bash | Policy + capabilities + causationId |
| P3-5 | Poseidon in XState interpreter | Workflow; XState projects events |
| P3-6 | PBA math rewritten in `Effect.gen` line-by-line | Pure `classify()`; Effect only accumulates / actuates |
| P3-7 | Fork Effect LSP into a custom tsserver | CLI Activity + `patch` + family map |
| P3-8 | `Date.now` in synapse decay | Keep **seq** decay; Clock only for wall waits |
| P3-9 | `Effect.runPromise` inside a node | `run*` only at driver edge (`runEffectInsideEffect`) |
| P3-10 | Tier-1 doc with `prompt.call-model` | Schema reject `[JESL TIER-VIOLATION]` before run |
| P3-11 | Replay re-calls Docker | Activity receipt returned |
| P3-12 | Fallback template report | `{ verdict: "READY_FALSE", error }` only |

---

# PART 7 — PROCEDURES

### P7-E1 — HOST JESL CORE ON EFFECT (S1*)
1. Replace `NodeImpl.invoke` Promise with Effect.
2. Schema-decode docs with Effect Schema (keep Zod only if packager still emits it; dual-write then drop).
3. Journal.append Effect; crash-safe as now.
4. Headless `it.effect` for every `[JESL …]` fixture.
5. No platform import in `core/`.

### P7-E2 — BIND A DRIVER LAYER
1. Implement cap interfaces with `@effect/platform`.
2. `Layer.mergeAll` per host.
3. Unbound cap test: needs-llm.json → tag + no artifact.
4. Hook edge: `runPromise(intercept.pipe(provide(SessionLive)))`.

### P7-E3 — LIFT A DOCUMENT TO WORKFLOW
1. Hash doc+seed → idempotencyKey.
2. Each cap node → Activity name `node:<id>`.
3. Pause / ask-launcher → DurableDeferred.
4. Kill -9 + resume = JESL criterion 12, now Workflow resume.

### P7-E4 — WIRE PARAGON
1. Wrap existing classify/synapse/machine as services.
2. PTA JSON layers Schema-decoded.
3. PBA hits emit `pba.family.hit` on EventBus.
4. Tool before: intercept stack §3.3.

### P7-E5 — WIRE LSP
1. Add `effect-lsp-scan` tool.
2. PTA chain: write/edit `*.ts` requires clean diagnostics.
3. `prepare`: `effect-language-service patch`.
4. Map rule ids → families (3.2). Do not DENY on style rules.

### P7-E6 — MIGRATE ONE WARHEAD
1. Keep behavior as `workflow.json`.
2. Move I/O functions to `activities.ts`.
3. Delete `getT0` as source of truth; keep formatter.
4. Fixture replay + container instrument.

---

# PART 8 — TROUBLESHOOTING

| Symptom | Cause | Fix |
|---|---|---|
| Floating work, no journal | Effect not yielded | LSP `floatingEffect`; E1 |
| Missing service at runtime | Layer not provided | `missingEffectContext`; bind driver |
| Double Docker after crash | I/O not an Activity | E5 |
| Sibling wave dies | Promise.all | E6 / `forEach` |
| Bash runs after DENY text | T0 authorized | E7 |
| Filter never fires | guessed event name | JESL 5A-9 probe |
| LLM 500 forever | wrong API family | keep JESL probe node |
| Decay wrong in tests | Date.now | TestClock or seq |
| Agent ignores Effect errors | no `patch` / no diagnostics CLI | P7-E5 |
| `yield` vs `yield*` | agent classic | `missingStarInYieldEffectGen` |

**Diagnostic order:** validate doc → journal rows → Layer graph (`layerinfo`) → LSP on changed files → node internals.

---

# PART 9 — QUICK REFERENCE

## 9A — JESL LAW → EFFECT LAW

| JESL | Effect |
|---|---|
| 1A Separation | E8 |
| 1B Journal | E5 + Journal service |
| 1C Event feedback | EventBus |
| 1D Loud-fail | TaggedError, no fallback artifact |
| 1E Schema-gate | Effect Schema + LSP |
| 1F Concurrency | Fiber / forEach |
| 1G Portability | Layer-swapped caps |
| 1H Oracle | oracle-gate Effect.sync |
| 1I Lowest tier | E9 |

## 9B — INSTALL SURFACE

```
effect
@effect/platform / platform-node (or bun)
@effect/vitest
@effect/language-service   (+ patch)
@effect/workflow           (durable runs)
@effect/ai                 (call-model)
```

CLI: `effect-language-service diagnostics|overview|layerinfo|patch`

## 9C — FILE MAP (target)

```
jesl/core/*          Effect services, zero host imports
jesl/nodes/*         NodeImpl returning Effect
jesl/drivers/*       Layers
paragon/*            BehaviorEngine, ToolEngine as services
kernel/effect-lsp.ts Activity wrapper
warheads/*/activities.ts
workflow/jesl-run.ts Workflow.make
```

## 9D — STATUS LEDGER

| Component | Status |
|---|---|
| Effect SDK / LSP / Workflow | **PROVEN** (upstream) |
| JESL document grammar | **SPEC** (bible v1.1) |
| JESL DPL1 library slices | **SPEC / PLANNING** |
| Effect-hosted executor + cap Layers | **THIS BIBLE — SPEC** |
| Paragon wrap | **SPEC-ON-PROVEN-MATH** |
| Poseidon as Workflow | **SPEC** |

**CANON LINE:** JESL authors *what* runs. Effect *runs* it. Paragon *polices* think/do. LSP *polices* files. No fourth runtime.

**— END OF THE EFFECT RUNTIME BIBLE —**
