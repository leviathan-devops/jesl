# JESL — THE JSON EVENT SCRIPTING LIBRARY BIBLE
## The Macro Boilerplate Architecture for Mechanically Intelligent Tools, Embedded Agent Systems, and the Portable JSON Building-Block Library
### Codename: JESL v1.2 — 2026-09-02 — EFFECT PHASE 2

**TRIGGER:** you are building a tool, an agent system, an event-hook filter, a state machine, a pipeline, or ANY composed machinery where "the workflow is clear and algorithmic" — and you want it as a **declarative JSON artifact** instead of hardcoded TypeScript.
**DUTY:** the one canon reference for authoring JSON-scripted workflows that compose the proven substrates (the `event` hook, the T.E.B machine anatomy, the shadow-enhanced tool backend, the wave-manager/paragon state machines) into tools and tool-chains.
**PROTOCOL:** Read fully. Then compose from the catalog (Part 5). NEVER hand-write imperative orchestration code for what a template already expresses.

**Companion canon (the substrates JESL composes):**
- `CUSTOM_EVENT_HOOK_ENGINEERING_BIBLE.md` — the event-hook transport (the single bus, the filters, the 10-step meta-process)
- `TEB_MACHINES_FOR_BEHAVIOR_ENGINEERING_T1.md` — the 6-part machine anatomy (filter/reader/engine/machine/mutation/evidence)
- `SHADOW_ENHANCED_TOOLS_BIBLE.md` — the 7-stage silent LLM backend
- `SHADOW_AGENT_ENGINEERING_BIBLE.md` — the pi-SDK embedded agent (the api-family law, the transport chain, the write-scope law)
- `T1_MULTI_TOOL_CHAIN_PIPELINE.md` — the N-tool chain with mechanical firewalls + module-level context
- `REASONING_TOKEN_CAPTURE_WIRING.md` — the reasoning-stream capture pattern
- grok-build `xai-workflow` (xai-org/grok-build, engine.rs 1954L / host.rs / journal.rs / deep_research.rhai 585L) — the proof that scripted workflows + journal + host-IPC is the right macro shape

**THE THREE SENTENCES OF DISCIPLINE:**
1. **JSON is not a programming language — the tool machinery is the runtime; JSON is the control-flow-by-composition grammar over proven substrates.**
2. **A JSON workflow is schema-gated at authoring time — an imperative script is only runtime-validated; this is the decisive advantage over embedded DSLs like Rhai.**
3. **Every node journals its evidence — the workflow is replayable because the journal is the truth, never the prose.**

---

## 0.1 THE THESIS (the paradigm in one paragraph)

grok-build proved the macro shape: a **sandboxed scripting surface** (`deep_research.rhai`) invokes an **engine** across a **host IPC contract** (`WorkflowHostRequest` — SpawnAgent/Phase/BudgetQuery/RenderTemplate), with an append-only **journal** (JSONL + sha256) making every run deterministic and replayable. JESL keeps that skeleton and replaces the imperative DSL with a **JSON graph**: nodes are tool-invocations that resolve to already-proven machinery (T.E.B machines, event-hook filters, shadow agents, state machines, gates, subagents); edges are data-flow; the event hook closes the control loop by feeding every node's tool-calls back as `tool.call.*` events. **Rhai gives grok an imperative script; JESL gives us a machine-validatable graph over an already-runtime-grade substrate — strictly more powerful, because our nodes ARE the proven machines.**

> **PHASE-2 NOTE:** `PART 2E` binds this grammar to the Effect runtime — Effect is the kernel that runs the graph; `0.2` effect rows are the grounding; `2E.*` is the bind.

## 0.2 THE GROUNDING MAP (what is real vs what is spec)

| Element | Status | Anchor |
|---|---|---|
| The `event` hook surface (one bus, many event types) | **REAL — proven** | `REASONING_TOKEN_CAPTURE_WIRING.md:44` (the `event` hook IS in the plugin surface); `CUSTOM_EVENT_HOOK...md:41` |
| The T.E.B machine anatomy (6 parts) | **REAL — proven** | `TEB_MACHINES...md:143-149` (the six parts) |
| The shadow-enhanced tool backend (7 stages) | **REAL — proven 3×** | `SHADOW_ENHANCED_TOOLS_BIBLE.md:117-129` |
| The pi-SDK shadow agent (Agent loop, transport chain) | **REAL — proven** | `SHADOW_AGENT_ENGINEERING_BIBLE.md:9-33` |
| The multi-tool chain + mechanical firewalls | **REAL — proven** | `T1_MULTI_TOOL_CHAIN_PIPELINE.md:19-20` |
| The wave-manager (spec-file declarative + tracker + registry) | **REAL — proven** | v4.4.2 `wave-dispatch.ts:1906L`, `wave-tracker.ts:568L` |
| The paragon state machine (8 transitions, 6 families) | **REAL — proven** | `SPEC_PARAGON_WAVE_MERGE.md:56-58` |
| The MPSE oracle gate (eq/ge/le/ne/contains/matches) | **SPEC'D (DPL1)** | `MPSE_ENHANCED_WAVE_GENERATE_SPEC.md:117-125` |
| `Effect` SDK (`Effect<A,E,R>` / `Effect.fn` / `Effect.gen` / `Context` / `Layer` / `Schema`) | **REAL — proven** | `effect` package · `EFFECT_TS_RUNTIME_BIBLE.md:0.2` |
| `@effect/language-service` (diagnostics CLI + `patch` + `layerinfo`) | **REAL — proven** | `@effect/language-service` package |
| `@effect/workflow` (`Workflow` + `Activity` + `DurableClock` / `DurableDeferred`) | **REAL — proven** | `@effect/workflow` package |
| **The JESL JSON schema + node-kind registry + runner** | **THIS BIBLE'S SPEC** | Part 2 — the design deliverable |

**THE LAW OF THE GROUNDING MAP:** JESL composes only proven machinery. A template whose machinery is not yet real is marked `SPEC-GATED` in the catalog and MUST NOT be shipped before its substrate passes a container test.

> **PHASE-2 POINTER:** the Effect kernel bind lives in **PART 2E — EFFECT KERNEL (PHASE 2)** — Effect is the runtime that interprets the grammar. `§0.2` Effect rows are REAL; `PART 2E` is SPEC until `S8`/`S9` container rows (see `2E.12`).

## 0.3 THE LIBRARY IS THE PRODUCT (the use cases are consumers)

**THE v1.1 CORRECTION (the operator's ruling):** JESL is ONE production-grade library — a pure core + drivers + node modules (§2.5). The original three asks are USE-CASE FAMILIES of that one library, NOT three architectures. There are no "tiers of systems" — there is one library and the compositions authors write against it:

| Use case | What it composes | Determinism | Ships as |
|---|---|---|---|
| **A — the mechanically intelligent tool** | Event + Decision + Evidence families ONLY — zero LLM nodes | fully deterministic — same input, same verdict, forever | one tool (frozen front contract, silent backend) or a tool-chain |
| **B — the embedded agent system** | adds Generation + Orchestration (LLM nodes bracketed by gates) | hybrid — deterministic gates bracket nondeterministic generation | a shadow-agent/pi-SDK system authored as JSON + a tool chain |
| **C — the skill tool** | any families — the skill SELF-CONTAINS the doc + context | per composition | a skill directory = an ephemeral tool launcher (5F-7) |

> **PHASE-2 NOTE:** `PART 2E` is the Effect kernel — the composition above is hosted as `Effect` services; driver `Layer`s bind the caps; see `2E.4` + `2E.5`.

**THE LOWEST-COMPOSITION LAW:** choose the composition with the FEWEST generative nodes that satisfies the requirement — "the system must never DEPEND on the LLM for a decision the mechanical layer can make" (`SHADOW_ENHANCED_TOOLS_BIBLE.md:402`). The `[JESL TIER-VIOLATION]` and `[JESL UNBRACKETED-GENERATION]` validations enforce the discipline mechanically — the document's `meta.tier` remains a real schema field (the declared determinism class, audited at validation).


# PART 1 — THE CRITICAL RULES (THE JESL LAWS)

### 1A — THE SEPARATION LAW (detector / decider / generator)
1. ALWAYS assign each node EXACTLY ONE role: **detect** (event-filter, lexicon — deterministic), **decide** (gate, state-machine — deterministic), or **generate** (shadow-agent, shadow-tool — LLM). A node that blurs two roles is a slop signature.
2. NEVER let a detector decide. `CUSTOM_EVENT_HOOK...md:99` (the Filter Law) + Warhead 9: "the regex is a mechanical DETECTOR only (the detection layer, never the decision layer)."
3. NEVER let a generator gate its own output — the silent verifier (a Decision node) gates the Generation node's output. `SHADOW_ENHANCED_TOOLS_BIBLE.md:398` ("the verification must be mechanical to be trusted").
4. MUST wire the flow detect → decide → (generate) → decide — the gates bracket the generation.

### 1B — THE JOURNAL LAW (the evidence is the truth)
1. ALWAYS journal every node: one JSONL row per node execution, `{ts, run, node, kind, verdict, evidence}` — the workflow is replayable because the journal is the record.
2. NEVER judge a workflow by its prose output — assert against the journal rows (the memory-table law: `SHADOW_ENHANCED_TOOLS_BIBLE.md:172-173` "assert everything against the MEMORY TABLE, never the prose").
3. MUST carry a source discriminator on every row (`source: "workflow/<run>/<node>"`) — multiple workflows into one store stay distinguishable (`CUSTOM_EVENT_HOOK...md:262`).
4. NEVER ship a node that fires without journaling — that is the evidence-less machine anti-pattern (`TEB_MACHINES...md:678`).

### 1C — THE EVENT-FEEDBACK LAW (the closed control loop)
1. ALWAYS register the workflow's observation nodes on the ONE `event` hook — the workflow both drives (tool calls) and observes (`tool.call.*`, `message.updated`, `session.*`) its own execution.
2. NEVER poll where an event exists — "if the runtime emits it, the event hook can see it" (`CUSTOM_EVENT_HOOK...md:294`).
3. MUST discover event types empirically (the log-first probe), never guess from docs — the names drift (`TEB_MACHINES...md:238`).

### 1D — THE LOUD-FAIL LAW (no fabricated success)
1. ALWAYS fail loud: a node that cannot complete returns `{ready:false, errors:[named]}` — never a substitute artifact.
2. NEVER build a fallback that produces a DIFFERENT artifact dressed as success — that is FALSE SUCCESS, the most dangerous bug class (`SHADOW_ENHANCED_TOOLS_BIBLE.md:169` — the FALLBACK TEST).
3. MUST treat INCONCLUSIVE as a fail-state, never a pass (the state-machine law: `TEB_MACHINES...md` fail-state = INCONCLUSIVE).

### 1E — THE SCHEMA-GATE LAW (validate at authoring, not runtime)
1. ALWAYS schema-validate the workflow JSON at authoring time (the runner refuses malformed graphs BEFORE any node executes).
2. NEVER embed a general-purpose scripting language — the graph is machine-checkable; an embedded DSL (Rhai/JS) is only runtime-validated. This is the decisive JESL advantage.
3. MUST reject unknown node `"type"` values, dangling edge targets, and missing `output-contract`s at validation, with compiler-style diagnostics naming the field + the remedy (the `formatDiagnostics` pattern, `MPSE_ENHANCED_WAVE_GENERATE_SPEC.md:81`).

### 1F — THE CONCURRENCY LAW (parallel by default)
1. ALWAYS run independent nodes in parallel (`Promise.allSettled` — one rejection must not kill the wave).
2. NEVER sequentialize nodes that share no edge — N×T instead of ~T is the anti-pattern (`SHADOW_AGENT_ENGINEERING_BIBLE.md:292`).
3. MUST capture per-node failure in ITS journal row — never a silent skip (the intelligent-async requirement).
4. **THE EFFECT TWIN (Phase 2):** implementation = `Effect.forEach` / `Exit`, not `Promise.allSettled` in `core` — the `Promise.allSettled` wording in (1) stays as the historical JS surface; the kernel bind is `Effect.forEach` with per-item `Exit` (one rejection never kills siblings). `EFFECT-RT E6` / `5K-5` enforce.

### 1G — THE PORTABILITY LAW (the library contract)
1. ALWAYS resolve node `"type"` through the node-kind registry (Part 2.3) — the JSON artifact is portable because the registry is a stable contract, like a stdlib.
2. NEVER inline project-specific content in a template — the args carry all context; the template carries only structure (`SHADOW_ENHANCED_TOOLS_BIBLE.md:151`).
3. MUST keep templates copy-pasteable: a micro template is ≤40 lines of JSON, a composed boilerplate is ≤120.

### 1H — THE ORACLE LAW (pre-registered expected values)
1. ALWAYS gate a build-workflow with the oracle table — `| OR-n | scope | O1/O2/O3 | eq|ge|le|ne|contains|matches(...) | command |` — the firewall evaluates the agent's NUMBER against the oracle, never the prose (`MPSE_ENHANCED_WAVE_GENERATE_SPEC.md:22`).
2. NEVER let the subagent see the oracles — the plan carries them; the agents cannot conform to what they cannot read.
3. MUST refuse generate when the plan has no oracles (PLAN_NO_ORACLES) or an agent has no covering row (AGENT_WITHOUT_ORACLES).

### 1I — THE TIER LAW (lowest tier wins)
1. ALWAYS choose the lowest tier that satisfies the requirement — Tier 1 (deterministic) beats Tier 2 (LLM) for the same behavior.
2. NEVER add an LLM node where a lexicon/machine/gate suffices — "the system must never DEPEND on the LLM for a decision the mechanical layer can make" (`SHADOW_ENHANCED_TOOLS_BIBLE.md:402`).
3. MUST audit an existing workflow for Tier-1 reduction opportunities before shipping: any Generation node whose output is a verdict (not prose) is a mis-tier.


# PART 2 — THE GRAMMAR (THE JSON WORKFLOW SCHEMA + THE NODE-KIND REGISTRY)

## 2.1 THE WORKFLOW ARTIFACT (the full schema, annotated)

```jsonc
{
  "$schema": "trident-workflow-v1",
  "meta": {
    "name": "string",                     // REQUIRED — mirrors grok `let meta = #{ name: ... }`
    "description": "string",
    "version": "semver",
    "tier": 1 | 2,                        // the declared tier (audited by the runner)
    "output-contract": { /* JSON Schema of the final output */ },
    "packaging": "tool" | "tool-chain"    // how the workflow ships (Part 3.4 / Part 4.3)
  },
  "nodes": [ /* node objects — see 2.2 */ ],
  "edges": [
    { "from": "node-id", "to": "node-id", "via": "data-channel-name" }
  ],
  "journal": {
    "path": ".trident/workflows/{name}/{run-id}.jsonl",
    "sha256": true
  },
  "gates": {
    "input":  ["oracle-table"],           // pre-conditions checked BEFORE node 1
    "output": ["output-contract", "evidence-complete"]  // post-conditions after the last node
  }
}
```

**THE VALIDATION CHECKLIST (the runner's authoring-time gate):**
1. `meta.name` present + unique in the registry.
2. every node `id` unique; every edge `from`/`to` resolves to an existing node id.
3. every node `type` ∈ the node-kind registry (2.3); unknown type → `[JESL UNKNOWN-NODE] <id>: "<type>" is not registered. Registry: <list>`.
4. the graph is acyclic (topological order exists) — a cycle → `[JESL CYCLE]` naming the loop.
5. `meta.output-contract` is a valid JSON Schema; the terminal node's output binds to it.
6. `tier: 1` declared → NO generation-family node present (else `[JESL TIER-VIOLATION]`).
7. `gates.input` includes `oracle-table` when any node declares `class: "build"`.

## 2.2 THE NODE SHAPE (the universal envelope)

```jsonc
{
  "id": "unique-node-id",
  "type": "node-kind",                    // resolves via the registry (2.3)
  "class": "detect" | "decide" | "generate",   // the Separation Law role
  "on": { "EVENT-NAME": "target-node-id" },    // optional: event-driven transition
  "retries": { "attempts": 3, "backoffMs": 2500, "retryable": "429|5xx" },
  "timeoutMs": 60000,
  ...kind-specific fields
}
```

**THE ENVELOPE LAW:** `id/type/class` are mandatory on every node; `on` wires event-driven edges (a node may be BOTH in the topological graph AND event-reactive); `retries` carries the retryability classification (`429/rate-limit → exile; 5xx → retry; else → fall`, `SHADOW_AGENT_ENGINEERING_BIBLE.md:694-698`).

## 2.3 THE NODE-KIND REGISTRY (the portable contract)

| `"type"` | Family | Class | Resolves to (the machinery) | Deterministic |
|---|---|---|---|---|
| `event-filter` | Event | detect | the `event` hook filter + reader (`CUSTOM_EVENT_HOOK...md:86-95`) | **yes** |
| `capture-engine` | Event | detect | start/delta/end/flush accumulator (50ms/60-char/end rules) | **yes** |
| `machine` | Decision | decide | a registered T.E.B XState actor (`TEB_MACHINES...md:143-149`) | **yes** |
| `gate` | Decision | decide | validation floors / schema / oracle assertions — LOUD fail | **yes** |
| `oracle-gate` | Decision | decide | the MPSE oracle row evaluation (`MPSE...md:117-125`) | **yes** |
| `circuit-breaker` | Decision | decide | N consecutive failures → OPEN (threshold 3) | **yes** |
| `state-machine` | Decision | decide | the paragon 8-transition machine (`SPEC_PARAGON_WAVE_MERGE.md:56`) | **yes** |
| `tool-call` | Orchestration | detect/decide | any registered plugin tool invoked once | varies |
| `pipeline` | Orchestration | — | N nodes sequential (the T1 chain shape) | varies |
| `parallel` | Orchestration | — | fan-out + `Promise.allSettled` fan-in | varies |
| `retry-chain` | Orchestration | — | retry-on-transient re-running the PRIMARY | varies |
| `pause` | Orchestration | — | the pause/resume checkpoint (human-in-the-loop) | — |
| `cron-trigger` | Orchestration | — | the scheduled entry (interval + jitter) | **yes** |
| `subagent-dispatch` | Orchestration | generate | wave-manager spawn (`action=generate`, spec-file only) | no |
| `shadow-agent` | Generation | generate | pi-SDK Agent + transport chain (`SHADOW_AGENT_ENGINEERING_BIBLE.md`) | no |
| `shadow-tool` | Generation | generate | the 7-stage silent backend (`SHADOW_ENHANCED_TOOLS_BIBLE.md:117-129`) | no |
| `journal-sink` | Evidence | detect | the JSONL + sha256 writer | **yes** |
| `triplet-writer` | Evidence | detect | `{Pattern, State, Evidence}` row writer | **yes** |
| `sqlite-sink` | Evidence | detect | WAL row upsert (`wave-db.ts` pattern) | **yes** |
| `replay-source` | Evidence | detect | journal → re-run (the determinism proof) | **yes** |
| `shell-exec` | Execution | detect/act | bound `shell` cap — bash exec, bounded output, timeout | **yes** |
| `python-exec` | Execution | detect/act | bound `shell` cap — python script exec, bounded stdout | **yes** |
| `http-request` | Execution | detect/act | bound `http` cap — fetch with timeout + retry class | **yes** |
| `file-io` | Execution | detect/act | bound `fs` cap — read/write inside the run scope only | **yes** |
| `prompt` | Generation | generate | the DUAL-MODE LLM node: `call-model` \| `ask-launcher` | no |

**THE CAPABILITY LAW:** effectful kinds declare a required capability (`caps.shell`, `caps.llm`, `caps.http`, `caps.fs`, `caps.tool`, `caps.subagent`). The core defines the interface; the driver binds it; a run reaching an unbound node fails LOUD `[JESL CAP-UNBOUND] <cap>` — never a silent skip. The `prompt` node's `ask-launcher` mode requires NO capability at all: it returns the question through the tool result and the LAUNCHING AGENT's answer writes the channel — the agent becomes a node (the skill mechanic, 5F-7).

**THE REGISTRY LAW:** the registry is append-only — new kinds are added by registering a resolver `(node, ctx) => Promise<verdict>`; the JSON contract NEVER breaks (a v1 workflow runs on v2 registries).

## 2.4 THE RHAI↔JSON TRANSLATION TABLE (the grok-build correspondence)

| grok-build (Rhai, `deep_research.rhai`) | JESL (JSON) | The gain |
|---|---|---|
| `let meta = #{ name, description }` | `"meta"` block + `output-contract` | the contract is machine-checked, not runtime-discovered |
| `phase("name")` | node grouping (edges define order) | the DAG is explicit, not imperative |
| `agent({model, output_schema, tools})` | `{"type":"shadow-agent", model, contract, tools}` | the transport chain (retry/stall/done-verifier) rides for free |
| `parallel()` fan-out | `{"type":"parallel"}` + fan-in edges | `allSettled` semantics built in |
| `pause()` / `complete()` | `{"type":"pause"}` / terminal gate | the checkpoint is a node, inspectable |
| `WorkflowHostRequest::SpawnAgent` etc. (11 variants, `host.rs`) | the node-kind registry (20 kinds) | MORE kinds, all resolving to proven machinery |
| `journal.rs` (JSONL + sha256 request hashing, `covers()` replay gate) | the `journal` block + `replay-source` node | identical determinism, our evidence-triplet discipline |
| `validate.rs` (dry-run stub host) | the authoring-time schema gate (1E) | stronger: static validation vs dry-run |

**THE CORRESPONDENCE LAW:** every grok-workflow concept has a JESL node; where grok compiles Rhai, JESL validates JSON — the same expressive reach with authoring-time guarantees.


## 2.5 THE LIBRARY ARCHITECTURE (core / drivers / capabilities)

The library is a PACKAGE, not a plugin feature. The core is pure; hosts are drivers; effects are capabilities:

```
┌─────────────────────────────────────────────────────┐
│ THE DOCUMENT LAYER: workflow.json + ctx.json        │
│ (portable artifacts — no code, no host coupling)    │
└──────────────────────────┬──────────────────────────┘
                           │ load + validate
                           ▼
┌─────────────────────────────────────────────────────┐
│ JESL CORE — PURE (zero host imports)                │
│ schema · graph · bus · channels · executor          │
│ journal · registry · capability interfaces          │
└──────┬────────────────────────────────────┬─────────┘
       │ capabilities in                    │ docs run
       ▼                                    ▼
┌─────────────────────────────────────────────────────┐
│ DRIVERS (the hosts)                                 │
│  opencode: hooks→bus · tools/subagent caps          │
│  cli:      `jesl run|validate|replay|emit` bin      │
│  sdk/watcher/cron: programmatic + scheduled hosts   │
└─────────────────────────────────────────────────────┘
```

**THE CAPABILITY MODEL:** the core declares interfaces; drivers bind them. `caps: { shell?, llm?, tool?, subagent?, http?, fs?, emit? }`. A workflow whose nodes need only deterministic + shell capability runs anywhere bash runs. A workflow declaring `llm`/`subagent` nodes VALIDATES everywhere and EXECUTES only where the cap is bound — the first unbound node fails LOUD: `[JESL CAP-UNBOUND] <cap>`, never a silent skip.

**THE PURITY LAW (Phase 2):** pure = zero host imports AND zero raw Promise I/O — Effects may be described in `core` — the core describes `Effect` values (`Effect.sync` for `Graph`, `Effect` for `Executor` readiness), drivers `provide` them; `node:fs`, `fetch`, `Date.now`, `Math.random` NEVER appear in `core/` even as an `Effect` — host I/O lives behind `FileSystem`/`HttpClient`/`Clock` services bound by `CliLive`/`OpenCodeLive`/`TestLive` (2E.4). A core file that imports `node:fs` is not pure — it fails `E3` and `S8` (`nodeBuiltinImport` / `globalFetch`).

**THE PACKAGE LAYOUT (what the library physically is):**
```
jesl/
  core/     schema · graph · bus · channels · executor ·
            journal · registry · caps   (pure, ~800L target)
  nodes/    deterministic set (no caps) + effectful set (caps)
  drivers/  opencode · cli · sdk · watcher · cron
  cli/      the `jesl` bin: run | validate | replay | emit
  packager/ tool.ts · chain.ts · skill.ts (the 3 emitters)
  test/     headless battery + CLI e2e + driver container test
```

## 2.6 THE EXECUTION SEMANTICS (dataflow readiness — the ONE model)

Not "steps in a list", not "event handlers" — ONE semantic that is both. Every edge names a **channel** (`via: "claims"`); the context holds a channel store; a node becomes **ready** when ALL its inbound channels are written. The executor fires ready nodes as one `allSettled` batch (bounded, staggered); outputs write more channels, waking more nodes. Bus subscriptions are the second wake source — an event can write a channel too:

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

A pipeline (DAG) and a reactive script (event-driven) are the SAME machine under this model; one document can be half pipeline, half reactive, no seams. Terminal: the output gate validates the doc's `output-contract` → the run verdict + the journal path.

**THE JOURNAL'S THREE ROLES (one artifact, three subsystems killed):** evidence (what happened — the triplets) · replay (`covers-check`: same doc + same input → replay journaled outputs, never re-pay a generation) · resume (journal + serialized context = restart a paused run in a new process).

# PART 2E — EFFECT KERNEL (PHASE 2)

> JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime.

**THE PHASE-2 BIND LAW:** `workflow.json` is the ONLY authoring surface — JSON stays the grammar; Effect is the ONLY execution kernel; the journal is the ONLY truth. An implementation that builds a second `async`/`Promise` executor beside Effect is a second runtime and it is BANNED. This part binds Part 2's grammar (§2.1–§2.6) to the Effect runtime canon (`EFFECT_TS_RUNTIME_BIBLE.md` v1.0, 514 lines) — every row below carries an `EFFECT-RT:<anchor>` and a `JESL:<law>` so a fresh agent reading ONLY `{bible v1.2, DPL1 v1.1-E, EFFECT-RT}` answers the nine questions 9/9. Grounding pointer: §0.2 rows `Effect`, `@effect/language-service`, `@effect/workflow` are REAL; `§2E.*` is SPEC until S8/S9 container rows (see 2E.12). Import paths marked `VERIFY-ON-INSTALL` are concepts until the install pins the `effect` version.

---

## 2E.0 — THE BIND (JSON = grammar, Effect = runtime, journal = truth)

**The three sentences:** JSON is the grammar — the `workflow.json` graph plus `ctx.json` plus the node-kind registry IS the program. Effect is the runtime — every node resolves to an `Effect<NodeResult, JeslError, Caps>` hosted on a `Layer`-bound driver. The journal is the truth — every `Effect` that touches the world is an `Activity` receipt; `covers()` replays the receipt, never re-pays the world.

**The bind, read slowly:** JESL authors *what* runs (the graph, the channels, the gates, the tiers); Effect runs *how* it runs (typed errors, `R` as `Context`, fibers vs durable `Workflow`, `Schedule`, `TestClock`, `Layer` swaps); Paragon polices *think* and *do* (PBA on reasoning tokens, PTA on tool calls) as Effect services on the same `EventBus`; Effect LSP polices *files* (`@effect/language-service` diagnostics as an `Activity` after every `*.ts` write). There is no other runtime — `XState`, `Promise` chains, and hook callbacks are projectors or edges; they never `fetch`, never `node:fs`, never `Date.now` in core (Warhead 9 / E3). The historical `Promise.allSettled` surface in §1F stays as the JS idiom; the kernel twin is `Effect.forEach` / `Exit` — the doc carries BOTH until the runner ships, then the Promise wording is the gloss, the Effect wording is the law.

**ANCHOR:** `EFFECT_TS_RUNTIME_BIBLE.md:0.1` (the thesis) + `JESL §1A–§1I` → `EFFECT-RT E1–E10`; `§2E.0` is the answer to nine-questions 1/2.

---

## 2E.1 — THE MODULE→SERVICE MAP (JESL core as Effect services)

Every `jesl/core/*` module becomes a `Context.Service`; the core describes Effects, drivers `provide` them. `Effect.fn` and `Effect.gen` are the authoring forms; `Layer` is the wiring; `Schema.decode` is the codec. Import surface `VERIFY-ON-INSTALL` except `Effect.*`, `Context.*`, `Layer.*`, `Schema.*`, `Activity.make` which are safe anchors.

| JESL module | Effect service | Notes — what it does, what it never does |
|---|---|---|
| `core/schema.ts` | `WorkflowCodec` | `Schema.decodeUnknown(WorkflowDoc)` — Zod may remain at the OpenCode JSON edge for one slice, then decode into Effect Schema immediately (`EFFECT-RT E4`). NEVER `JSON.parse` as a codec. |
| `core/graph.ts` | `Graph` | readiness sets — the pure channel→ready computation. **Pure** — wrap in `Effect.sync` (`EFFECT-RT 2.2`). NEVER imports a cap. `depth` max 256 (`EFFECT-RT §2.5` constants). |
| `core/bus.ts` | `EventBus` | pub/sub; handlers are `Effect`s, isolated failures (`EFFECT-RT 2.2`). One bus, many event types (`CUSTOM_EVENT_HOOK:41`). `RING_CAP` 50. |
| `core/channels.ts` | `Channels` | `Ref`/`SubscriptionRef` of named values; `via: "claims"` channels are the dataflow (`JESL 2.6`). |
| `core/executor.ts` | `Executor` | readiness loop as `Effect` recursion + `Effect.forEach` (see 2E.5). No second runtime. |
| `core/journal.ts` | `Journal` + Workflow engine journal | `sha256` chain; `covers()` = Activity replay (`EFFECT-RT E5` / grok `journal.rs`). Verdict computed FROM journal rows, never prose (`§1B`). `VERDICT_TTL_MS` 5000 provenance. |
| `core/registry.ts` | `NodeRegistry` | `Map<kind, NodeImpl>` where `NodeImpl.invoke` returns `Effect` (see 2E.2). Append-only — a `v1` workflow runs on a `v2` registry (`JESL §2.3`). `RING_CAP` growth bounded. |
| `core/caps.ts` | individual Services (`Shell`, `Fs`, `Http`, `Llm`, `Tool`, `Subagent`, `Emit`) | driver `Layer`s bind them (see 2E.4). Unbound → `[JESL CAP-UNBOUND]` — the `R` slot missing (`D10`). |
| `core/errors.ts` | `Schema.TaggedError` family | one tag per `[JESL …]` code — `code` field prints the token string so existing fixtures keep passing (`D15` token-stability). Tagged errors, never `throw new Error(string)` (`E2`). |

**THE SERVICE LAW:** a core file that imports a host module or calls a raw Promise I/O is not pure — it fails `E3` / `9G` and `S8` (`nodeBuiltinImport`, `globalFetch`, `floatingEffect`). `VERIFY-ON-INSTALL` guards the `effect` import path.

---

## 2E.2 — THE EFFECT-TYPED NODE CONTRACT (NodeImpl / NodeHandle)

No `Promise` in the interface. Drivers adapt `Promise`s at the capability boundary only via `Effect.tryPromise` (`E2`). The `E` slot is ALWAYS a `JeslError` whose `code` prints one of the eight frozen tokens; the `R` slot is the intersection of the node's `requires` plus the kernel services (`Caps`).

```ts
// VERIFY-ON-INSTALL: `effect` + `@effect/platform` + `@effect/workflow` import paths
// Safe anchors: Effect.fn, Effect.gen, Context.Service, Layer, Schema.TaggedError, Activity.make

interface NodeImpl {
  kind: string                                         // ∈ registry (JESL 2.3)
  family: "event" | "decision" | "generation" | "orchestration" | "evidence" | "execution"
  requires: ReadonlyArray<ServiceTag>                  // caps this kind needs — becomes R
  setup: (spec: NodeSpec) => Effect<NodeHandle, JeslError, RegistryDeps>
}

interface NodeHandle {
  invoke: (input: ChannelData) => Effect<NodeResult, JeslError, Caps>
  subscriptions?: ReadonlyArray<BusSub>                // EventBus subscriptions this node owns
}

type Caps = Shell | Fs | Http | Llm | Tool | Subagent | Emit | Journal | EventBus | Clock | Random
type JeslError = JeslUnknownNode | JeslCycle | JeslTierViolation | JeslUnbracketedGeneration
               | JeslCapUnbound | JeslOracleMissing | JeslChannelUnset | JeslNoSeed | JeslSchemaGate
               // each: Schema.TaggedError whose `code` prints `[JESL …]` (D15)
               // Frozen token strings — byte-stable (D15): `[JESL UNKNOWN-NODE]` `[JESL CYCLE]` `[JESL TIER-VIOLATION]` `[JESL UNBRACKETED-GENERATION]` `[JESL CAP-UNBOUND]` `[JESL ORACLE-MISSING]` `[JESL CHANNEL-UNSET]` `[JESL NO-SEED]`
type NodeResult = { verdict: Verdict; outputs: Record<string, unknown>; evidence: Triplet[] }

interface RunContext {
  runId: string
  doc: WorkflowDoc
  channels: Channels          // service
  journal: Journal            // service
  bus: EventBus               // service
  caps: Context< Caps >       // R — provided by DriverLive (2E.4)
  clock: Clock
  budget: { deadline: Duration; maxNodesFiring: 15 }
}
```

`vars` stay data. Caps are no longer a bag of functions — they are the provided `Context` (`D10` / `E3`). A node that needs `llm` validates everywhere and dies `[JESL CAP-UNBOUND] llm` on `CliLive` — loud, no artifact (`§1D` / `E7`). `JESL_R` = union of every node's `requiresCaps` plus `Journal`, `Bus`, `Clock`, `Random` (`EFFECT-RT 2.1`).

**THE NODE LAW:** `id`/`type`/`class` remain mandatory on every node (`JESL 2.2` envelope); `on` still wires event-driven edges; `retries` still carries `429/5xx` classification — now as `Schedule` (`2E.5`/`5K-4`).

---

## 2E.3 — THE REGISTRY EFFECT SHAPE (fiber vs Activity vs Schedule vs Deferred)

Every registered kind gets a row. This table is the authoritative `Effect` shape for what the executor MUST do per kind. `Durable?` means journaled replay MUST return the recorded receipt and MUST NOT re-execute the world-touch.

| `"type"` | Family | Class | Effect shape | Durable? | Notes |
|---|---|---|---|---|---|
| `event-filter` | Event | detect | `EventBus.subscribe` → write channel | no — session fiber | `CUSTOM_EVENT_HOOK:86-95`; filter is the detector (Warhead 9) |
| `capture-engine` | Event | detect | `EventBus.subscribe` + accumulator `Ref` | no — session fiber | start/delta/end/flush; 50 ms/60-char/final rules |
| `machine` | Decision | decide | `Effect` over registered XState actor | snapshot if cross-process | `TEB_MACHINES:143-149`; fail-state = `INCONCLUSIVE` |
| `gate` | Decision | decide | `Effect.sync` + `Schema`/predicate | no | floors + LOUD + named remedy (`MPSE:81`) |
| `oracle-gate` | Decision | decide | `Effect.sync` oracle row evaluation (`eq/ge/le/ne/contains/matches`) | no | `MPSE:117-125`; firewall reads NUMBER vs oracle |
| `circuit-breaker` | Decision | decide | `Effect` over counter `Ref` + threshold 3 | persist snapshot if shared | paragon circuit; half-open recovery required |
| `state-machine` | Decision | decide | `Effect` over paragon 8-transition machine | snapshot if cross-process | `SPEC_PARAGON_WAVE_MERGE:56`; NEVER-LOCK (tier 4 escape) |
| `tool-call` | Orchestration | detect/decide | `Activity` + `Toolkit.invoke` | yes if replay-sensitive | wrap CLI `tool.execute.before` intercept (2E.7) |
| `pipeline` | Orchestration | — | `Effect.all` sequential (module context) | inherited | `T1:56-79`; `resetAfter` last node |
| `parallel` | Orchestration | — | `Effect.forEach(ready, invoke, { concurrency: 15 })` + `Exit` fan-in | inherited | `Effect.forEach` is the kernel twin of `Promise.allSettled` (1F) |
| `retry-chain` | Orchestration | — | `Effect.retry(Schedule)` + 429 exile | schedule is data | `429 → exile-next-rung` (5C pattern) |
| `pause` | Orchestration | — | `DurableDeferred` | **yes** | `Workflow` + journal is the resume anchor |
| `cron-trigger` | Orchestration | — | `Schedule` + `Clock` | driver fiber | `wave-cron:56-65`; 10 min idle / 75 s while waves live |
| `subagent-dispatch` | Orchestration | generate | child `Workflow` (or scoped fiber in tests) | **yes** | `action=generate` spec-file only; tracker is the registry |
| `shadow-agent` | Generation | generate | child `Workflow` wrapping pi-SDK harness | **yes** | provider probe 5 s; bracketed or refused |
| `shadow-tool` | Generation | generate | `Activity` wrapping 7-stage silent backend | **yes** — do not re-pay | `SHADOW_ENHANCED_TOOLS:117-129` |
| `journal-sink` | Evidence | detect | `Journal.append` | the journal itself | JSONL + `sha256`; `covers()` gates replay |
| `triplet-writer` | Evidence | detect | `Journal.append` triplet row | the journal itself | `{Pattern, State, Evidence:file:line}` — no triplet = no finding (W9) |
| `sqlite-sink` | Evidence | detect | `Activity` + WAL `withImmediateTx` | **yes** if replay-critical | `wave-db:13-129`; cross-process state |
| `replay-source` | Evidence | detect | `Workflow` resume / `covers()` | **yes** | grok `Journal::covers()` — replay receipt if covered |
| `shell-exec` | Execution | detect/act | `Command` `Activity` (bound `Shell`) | **yes** | `caps.shell`; `maxOutput` mandatory; stagger 1–3 s |
| `python-exec` | Execution | detect/act | `Command` `Activity` (bound `Shell`) | **yes** | `execFile` via `Shell`; args = `argv`, never interpolation |
| `http-request` | Execution | detect/act | platform `Http` `Activity` (bound `Http`) | **yes** | `caps.http`; `timeoutMs` + retry class per node |
| `file-io` | Execution | detect/act | `FileSystem` `Activity` (bound `Fs`) | **yes** | `caps.fs`; `scope: "run"` — `realpath+resolve+startsWith(root+sep)` |
| `prompt` (`call-model`) | Generation | generate | `@effect/ai` `Activity` + `Schema` | **yes** — do not re-pay LLM | `caps.llm`; `EFFECT-RT 2.3` |
| `prompt` (`ask-launcher`) | Generation | generate | `DurableDeferred` (no `llm` cap) | **yes** | question returns via tool result; launcher answer completes `Deferred` |

**THE EFFECT-SHAPE LAW:** a row marked **yes** MUST be an `Activity.make({ name: "node:<id>", success, error, execute })` when the run is a `Workflow` (2E.6); on a scoped fiber the `Activity` is still the journaled form but crash recovery is not promised. NEVER re-execute a covered `Activity` on replay (`E5`). Code *between* Activities is deterministic channel math — that is the replay fodder.

---

## 2E.4 — CAPS = LAYERS + THE THREE DRIVERS (CliLive / OpenCodeLive / TestLive)

**THE CAP LAW:** a JESL capability is a `Context.Service`; a driver is a `Layer`. `caps: { shell?, llm?, tool?, subagent?, http?, fs?, emit? }` (JESL §2.5) becomes `R = Shell | Fs | Http | Llm | Tool | Subagent | Journal | EventBus | Clock | Random …`. The core declares the interface; the driver binds it; a run reaching an unbound node fails LOUD `[JESL CAP-UNBOUND] <cap>` — never a silent skip. The `prompt` node's `ask-launcher` mode requires NO capability at all (`JESL 2.3`). Missing `R` is the Effect twin of `[JESL CAP-UNBOUND]` (`D10` → `E3`).

| Driver | Provides | When it is the correct `R` |
|---|---|---|
| `CliLive` | `Shell.layer` + `FileSystem.layer` + `HttpClient.layer` + `Journal.fileLayer` + `Clock` + `Random` | any workflow whose nodes need ONLY `shell`/`fs`/`http` + journal. Verbs: `jesl run` / `validate` / `replay` / `emit`. |
| `OpenCodeLive` | `CliLive` + `ToolClient.layer` + `Subagent.layer` + `Llm.layer` (`@effect/ai`) + `Hooks.busLayer` + `CurrentProgram` + `Policy` + `Escalation` | whole-system runs: hook monitors, generation, Paragon, LSP. One `run*` per hook / CLI invocation (E10). |
| `TestLive` | `TestClock` + `InMemoryJournal` + `ScriptedToolkit` + `MemoryFileSystem` + `TestRandom` | unit / headless / container scenarios; `TestClock.adjust("24 hours")` for deadlines; journal `covers` prove no re-pay (`EFFECT-RT 5K-6`). |

**THE LAYER LAW:** `Layer.mergeAll` per host; `CliLive` lists `Journal`, `FileSystem`, `Command` under `layerinfo` (`D15`/`S8`); unbound cap test: `needs-llm.json` on `CliLive` → tagged `[JESL CAP-UNBOUND]` + no artifact; hook edge is `Effect.runPromise(intercept.pipe(Effect.provide(SessionLive)))`. Import surface `VERIFY-ON-INSTALL`.

---

## 2E.5 — THE EXECUTION LOOP AS EFFECT (readiness + Effect.forEach concurrency 15)

JESL §2.6's ONE semantic — dataflow readiness + bus — stays. The executor's realization changes: ready sets fire as an `Effect.forEach` batch with bounded concurrency, per-item `Exit` fan-in, `Schedule`-governed retries, and `Scope`-bound interruption.

```
seed (argv | hook event | file | cron tick)
  → Schema.decode(WorkflowDoc)                       // Effect Schema
  → Effect.provide(DriverLive)                       // R bound
  → Workflow.execute("JeslRun") | Fiber.scoped       // 2E.6 decides
       loop while not terminal:
         ready = { n | ∀ inbound `via` channel written }
         yield* Effect.forEach(ready, invokeAsActivity, { concurrency: 15 })   // 1F twin + P3-5
         // per-item Exit — one child's failure never kills siblings (allSettled = partition/Exit)
         // writes wake more nodes: outputs → channels; gate LOUD-throw = TaggedError; repair edge re-invokes target (bounded, maxLoop 2)
         bus events → a subscription writes a channel → same loop
       output-gate: Schema.decode(output-contract)
       verdict FROM journal rows, never prose (1B)
```

**THE EFFECT LOOP LAW:**

1. ALWAYS `Effect.forEach` with `concurrency: 15` — the bounded-15 + `staggerMs` 1–3 s (`EFFECT-RT 2.6` / `5K-5`) — NEVER `Promise.all` / `Promise.allSettled` in `core/` (`1F` kernel twin). The historical `allSettled` wording in §1F/§2.6 stays as the JS gloss.
2. ALWAYS `Exit` / `Effect.partition` fan-in — one rejection lands in ITS journal row (`1F.3`), siblings continue (the intelligent-async requirement).
3. MUST stagger driver-bound Activities 1–3 s where the cap is rate-limited (LLM/HTTP) (`concurrency 15 · stagger 1-3s · EXILE_MS 45000 · POOL_TTL 600_000` — the canonical constants).
4. MUST keep code *between* Activities deterministic — channel readiness, score, transition tables — that is the replay fodder (`E5`).
5. MUST attach children to the run `Scope`; `Scope.close` kills shell children, detaches bus, flushes journal (session end / `tmux` / HTTP abort) (`E6`). `depth` 256, `RING_CAP` 50, `VERDICT_TTL_MS` 5000 bound the runtime (`EFFECT-RT §2.5`).

**Interruption:** `Scope.close` is the single interrupt — it is the `tmux` / file-lock / HTTP-abort semantic.

---

## 2E.6 — DURABLE vs EPHEMERAL (when Workflow.make is mandatory)

**THE DURABILITY LAW:** `Workflow` is the crash-safe, replay-safe, journaled execution; a scoped `Fiber` is the in-memory, session-ephemeral execution. Choosing wrong re-pays generation, loses pause positions, or double-calls Docker.

Use **`Workflow.make`** when ANY of these is true — otherwise a **scoped fiber** suffices:

| Condition | Workflow mandatory? | Why |
|---|---|---|
| node `type` is `pause` (human checkpoint) | **yes** | `DurableDeferred` + journal is the resume anchor — in-memory pause loses position on restart (`§1D` / `E5`) |
| node `type` is `prompt` `ask-launcher` | **yes** | `DurableDeferred` for the question; launcher answer completes `Deferred` across process death (`5K-8`) |
| node `type` is `prompt` `call-model` / `shadow-agent` / `shadow-tool` / `subagent-dispatch` | **yes** | generation must not be re-paid on replay; `Activity` receipt returns (`E5` / `P3-11`) |
| Poseidon 13-phase run / `WarheadRun` with waits | **yes** | `JeslRun` / `WarheadRun` durables survive `kill -9` + resume (`S6E` / `EFFECT-RT 4.2`) |
| any node marked `Durable? = yes` in 2E.3 is on the graph AND the run may outlive the process | **yes** | idempotency matters — same `docHash+seed` → same receipt via `covers()` |
| single hook monitor, Tier-1 gate, in-memory session `capture-engine`, unit tests with `TestClock` | no — **scoped fiber** | ephemeral, no replay cost, `TestClock` controls wall waits; `Clock` only for wall waits, `seq` for synapse decay (`EFFECT-RT P3-8` / `P7-E2`) |

```ts
// VERIFY-ON-INSTALL: @effect/workflow import path
const JeslRun = Workflow.make({
  name: "JeslRun",
  payload: { docHash: Schema.String, seed: Schema.Unknown },
  success: RunReceipt,
  error: JeslError,
  idempotencyKey: ({ docHash, seed }) => `${docHash}:${hash(seed)}`
})
// Each effectful node = one Activity named `node:<id>`. Channel math between Activities is deterministic.
```

**THE WORKFLOW IDENTITY:** `payload.idempotencyKey = docHash + seed`; a covered `docHash+seed` MUST replay journaled `Activity` outputs and MUST NOT re-invoke `shell-exec`/`python-exec`/`http-request`/`file-io`/`prompt.call-model` (`E5`).

---

## 2E.7 — THE AUTHORIZATION LAW (Policy + CurrentProgram + causationId; T0 is a projector)

**THE AUTHORIZATION LAW:** `getT0()` text NEVER authorizes I/O. The warhead's `T0` is a *projector* over `Journal` + live fibers — it formats what the EventBus already decided. Authority is `Policy` + `CurrentProgram` + `causationId ∈ journal`. The hook `tool.execute.before` is the enforcement point; deny is a `StructuredEnforcementError` (typed `E`), not a log line (`E7`).

```
1. Escalation.intercept      (Paragon tier ≥ 3 — pre-arm from PBA, see 2E.8)
2. Policy.assertCapable      (CurrentProgram.capabilities — what this Workflow is allowed to touch)
3. Policy.assertPhase        (Poseidon / JESL ready-set — phase gate)
4. causationId ∈ journal     (Interpreter or Activity spawned it — the provenance check)
5. Toolkit.invoke            (the bound cap executes)
```

All five are `Effect`s. A `DENY` short-circuits to `Effect.fail(new StructuredEnforcementError({ family, rule, evidence }))` — the journal records `pta.intercept` + `pba.family.hit` before the deny (`EFFECT-RT 3.3` / `S10`).

**The three NEVERs:**

1. NEVER `getT0()` / `getStatus()` / system-prompt sticker / warhead prose as the authorizer — the `T0` projector has no `R` and no `Policy` (`E7`).
2. NEVER treat Effect LSP diagnostics as permission — diagnostics are *evidence on the artifact plane* (2E.8), not a capability.
3. NEVER authorize `node:fs` / `fetch` / shell outside a bound `Fs`/`Http`/`Shell` `Activity` — that is `R` smuggling (`E3` → `[JESL CAP-UNBOUND]` on the cap).

Every new `MUST`/`NEVER` in this section maps to a diagnostic: `floatingEffect`, `missingEffectContext`, `runEffectInsideEffect`, `globalFetch`/`nodeBuiltinImport` (`EFFECT-RT 3.2`).

---

## 2E.8 — THREE SCANNERS ON ONE BUSBAR (Paragon PBA / PTA / Effect LSP)

Paragon (think), PTA (do), and Effect LSP (artifact) are three scanners on the SAME `EventBus` — they are not a fourth runtime. They share `EventBus`, `Escalation`, `CurrentProgram`, `EvidenceStore`; they do not share regex internals, AST walkers, or `tsserver` (`EFFECT-RT 0.3` / `3.1`).

| Plane | Input | Engine (Effect wrapper) | What it emits |
|---|---|---|---|
| PBA (think) | reasoning / `text-think` tokens (`REASONING_TOKEN_CAPTURE_WIRING:44`) | 4-bank ratio + λ + lattice → `BehaviorEngine` service (`EFFECT-RT 3.1`) | `pba.family.hit` on `EventBus` (pre-arm signal) |
| PTA (do) | `tool.execute.before` / `after` + chains | JSON layers + chain-tracker → `ToolEngine` service | `pta.intercept` + `StructuredEnforcementError` on `DENY` |
| LSP (artifact) | written `*.ts` (write/edit nodes) | `@effect/language-service` CLI `Activity` + `patch` → `EffectLsp` service | `DiagnosticReport` (family-mapped) as evidence |

Bridge: **PBA → PTA only** (pre-arm) — a `pba.family.hit` raises the PTA tier for the next `tool.execute.before`; LSP hits map to families but do NOT rewrite thought `λ`; a PTA `DENY` never fabricates a PBA hit (`EFFECT-RT 3.1`). Pure `classify()` stays pure; Effect only accumulates / actuates (`EFFECT-RT P3-6`).

### LSP rule → family map (port, don't fork)

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

Instruments: `effect-language-service diagnostics --file`, `overview`, `layerinfo`, `patch` so `tsc` carries the same errors (`EFFECT-RT 3.2`). CLI wrapper is `5K-7`. The `PTA` chain rule is `EFFECT_ARTIFACT_GATE` — `write`/`edit` `*.ts` requires a clean diagnostics `Activity` before `ToolEngine` permits the next effectful node (`EFFECT-RT P7-E5`).

---

## 2E.9 — THE KERNEL CATALOG FAMILY 5K (Effect micro-templates)

Every template is copy-pasteable; each carries **RESOLVES-TO / WHEN / FAILURE-MODE / ANCHOR**. Templates are `≤40` lines (micro) / `≤120` (composed) (`JESL 1G`). Import paths `VERIFY-ON-INSTALL` except safe anchors.

### 5K-1 — SERVICE SHELL

```ts
// VERIFY-ON-INSTALL: effect/Context, effect/Layer, effect/Effect
class Journal extends Context.Service<Journal>()("Journal", {
  make: Effect.gen(function* () { /* append, covers, serialize, sha256 chain */ })
}) {}
const JournalLive = Layer.effect(Journal, Journal.make)
```

**RESOLVES-TO:** `Context.Service` + `Layer` (`EFFECT-RT 5K-1`). **WHEN:** every cap and kernel module. **FAILURE-MODE:** leaking impl types into `R` instead of the service tag. **ANCHOR:** `EFFECT-RT 2.2` + `effect/AGENTS.md`.

### 5K-2 — TAGGED ERROR

```ts
class JeslCapUnbound extends Schema.TaggedError<JeslCapUnbound>()("JeslCapUnbound", {
  cap: Schema.String, node: Schema.String
}) {}
// code getter prints `[JESL CAP-UNBOUND] ${cap}` — token-stable (D15)
```

**RESOLVES-TO:** `Schema.TaggedError` (`EFFECT-RT 5K-2`). **WHEN:** every `[JESL …]` code (the eight frozen tokens). **FAILURE-MODE:** `throw new Error(string)` — untyped, uncoded. **ANCHOR:** `EFFECT-RT E2` + `JESL Part 8` diagnostics.

### 5K-3 — ACTIVITY NODE

```ts
// VERIFY-ON-INSTALL: @effect/workflow Activity
Activity.make({
  name: "node:shell-exec",
  success: NodeResult,
  error: JeslError,
  execute: (spec) => Shell.exec(spec)   // bound cap, never raw child_process
})
```

**RESOLVES-TO:** `Activity.make` (`EFFECT-RT 5K-3` / `E5`). **WHEN:** any cap-bound node in a durable run (2E.3 `Durable? = yes`). **FAILURE-MODE:** raw `exec` outside `Activity` — double Docker after crash. **ANCHOR:** `EFFECT-RT 2.4`.

### 5K-4 — RETRY CLASS

```ts
Effect.retry(Schedule.exponential("2.5 seconds").pipe(Schedule.compose(Schedule.recurs(4))))
// 429 → exile Layer (45 s), not retry-in-place — the ledger records the exile
```

**RESOLVES-TO:** `Schedule` + `Effect.retry` (`EFFECT-RT 5K-4`). **WHEN:** `http` / `llm` nodes. **FAILURE-MODE:** retrying `429` on the same key → the provider storm (`JESL P2-5`). **ANCHOR:** `SHADOW_AGENT_ENGINEERING_BIBLE:694-698`.

### 5K-5 — PARALLEL BATCH

```ts
yield* Effect.forEach(ready, invoke, { concurrency: 15 })
// per-item Exit — partitioned, siblings survive; stagger 1–3 s for rate-limited caps
```

**RESOLVES-TO:** `Effect.forEach` + `Exit` (`EFFECT-RT 5K-5` / `E6`). **WHEN:** JESL ready-set (2E.5). **FAILURE-MODE:** `Promise.all` — one rejection kills siblings (`JESL P2-4`). **ANCHOR:** `EFFECT-RT 2.6` + `1F`.

### 5K-6 — TESTCLOCK FIXTURE

```ts
it.effect("deadline", () => Effect.gen(function* () {
  yield* TestClock.adjust("24 hours")
  // wall waits use Clock; synapse decay uses seq (P3-8)
}))
```

**RESOLVES-TO:** `TestClock` (`EFFECT-RT 5K-6`). **WHEN:** `pause`, `cron`, any wall-clock wait; `seq` still drives synapse decay. **FAILURE-MODE:** `Date.now` in synapse decay. **ANCHOR:** `EFFECT-RT Part 8`.

### 5K-7 — LSP SCAN ACTIVITY

```ts
// VERIFY-ON-INSTALL: @effect/language-service CLI wrapper
Activity.make({ name: "EffectLspScan", success: DiagnosticReport, error: JeslError,
  execute: (path) => Lsp.diagnostics(path) })
```

**RESOLVES-TO:** `EffectLsp` service (`EFFECT-RT 5K-7` / `3.2`). **WHEN:** after `edit`/`write` of `*.ts`. **FAILURE-MODE:** trusting the model that "types pass". **ANCHOR:** `EFFECT-RT P7-E5`.

### 5K-8 — ASK-LAUNCHER DEFERRED

```ts
// VERIFY-ON-INSTALL: @effect/workflow DurableDeferred
const AskSlot = DurableDeferred.make<string, string>({ name: "ask-launcher" })
yield* DurableDeferred.await(AskSlot)
// tool result surfaces question; launcher answer completes deferred — no llm cap required
```

**RESOLVES-TO:** `DurableDeferred` (`EFFECT-RT 5K-8` / `2.3`). **WHEN:** skill `prompt.mode=ask-launcher` (5F-7). **FAILURE-MODE:** in-memory `Promise` across process death — loses the question. **ANCHOR:** `EFFECT-RT 2.3` + `JESL 2.3`.

---

## 2E.10 — THE CORRECT / WRONG PAIRS P3-1..P3-12 (Effect edition)

Effect twins of `P2-1..P2-10` plus the kernel-specific pairs. Each maps to a diagnostic or an `S8` ripgrep.

| # | WRONG | CORRECT |
|---|---|---|
| P3-1 | JESL executor as `async function loop()` with `await` and floating `fetch` | `Executor` service, readiness as `Effect` — construction ≠ execution (`E1`); `run*` only at driver edge (`E10` / `runEffectInsideEffect`) |
| P3-2 | Cap = optional callback / `if (caps.shell) caps.shell(cmd)` | Cap = Service in `R`, missing = `JeslCapUnbound` (`[JESL CAP-UNBOUND]`) — `E3` + `2E.4` |
| P3-3 | Journal is a side write after success | Verdict computed FROM journal; `Activity` *is* the write — `E5`; re-entry reads receipt, never re-executes |
| P3-4 | `getT0()` authorizes bash — the warhead's T0 text gates `tool.execute.before` | `Policy` + `CurrentProgram` + `causationId ∈ journal`; T0 is a projector only (`E7` / `2E.7`) |
| P3-5 | Poseidon in `XState` interpreter as the source of truth | Poseidon as `Workflow`; `XState` projects `poseidon.phase.entered` events (`EFFECT-RT 4.2`); illegal transition = `PhaseActionError` |
| P3-6 | PBA math rewritten line-by-line in `Effect.gen` | Pure `classify()` stays pure; Effect only accumulates / actuates; wrap existing math as services — never rewrite classifiers (`D12` / `EFFECT-RT P3-6`) |
| P3-7 | Fork Effect LSP into a custom `tsserver` | CLI `Activity` + `patch` + family map (2E.8) — never fork `tsserver` (`D13`) |
| P3-8 | `Date.now` in synapse decay | Keep **seq** decay; `Clock` only for wall waits (`EFFECT-RT P3-8`); `TestClock` in tests |
| P3-9 | `Effect.runPromise` inside a node / inside `Effect.gen` | `run*` only at driver edge — `floatingEffect` + `runEffectInsideEffect` enforce (`E10` / `E1`) |
| P3-10 | Tier-1 doc with `prompt.call-model` silently runs | `Schema` reject `[JESL TIER-VIOLATION]` before run — Tier 1 = no `llm`/`subagent` in `R` (`E9` / `1I`) |
| P3-11 | Replay re-calls `Docker` / re-pays LLM | `Activity` receipt returned — `covers()` gates re-execution (`E5`); second run invoke count `0` (`S9`) |
| P3-12 | Fallback template report `{ ready: true, … }` on generation stall | `{ ready: false, errors: [named] }` only — no fallback artifact; retry re-runs the PRIMARY (`1D` / `EFFECT-RT P3-12`) |

Every WRONG maps to `S8` ripgrep (`globalFetch`, `floatingEffect`, `nodeBuiltinImport`, `asyncFunction`) + `@effect/language-service diagnostics` — the kernel hygiene gate.

---

## 2E.11 — THE EFFECT PROCEDURES P7-E1..P7-E6

### P7-E1 — AUTHOR A DOC → VALIDATE (Effect-aware)

1. Write `workflow.json` + `ctx.json` (JSON stays the authoring surface — never `Effect.gen`).
2. `bunx jesl validate workflow.json` → `Schema.decode` — expect ZERO `[JESL …]` diagnostics (`P2-1`..`P2-10` + `P3-1`..`P3-12`); unknown `"type"` → `[JESL UNKNOWN-NODE]`.
3. Gate the doc through `E4` — dangling edges, cycles (`[JESL CYCLE]`), tier violations, unbracketed generation (`[JESL UNBRACKETED-GENERATION]`) all refuse BEFORE any fiber starts.
4. Pin the fixture that reproduces the doc's verdict byte-identically (the determinism proof, `1B`).

### P7-E2 — RUN ON TestLive (headless + TestClock)

1. `Effect.provide(TestLive)` — `TestClock` + `InMemoryJournal` + `MemoryFileSystem` + `ScriptedToolkit`.
2. `it.effect("my-doc", () => Effect.gen(function* () { yield* run(doc, seed) }))` — every headless unit is `it.effect`, never bare `it`.
3. Advance wall waits with `yield* TestClock.adjust("24 hours")` — synapse decay stays on `seq` (`P3-8`).
4. Assert journal rows carry `source: "workflow/<name>/<node>"` and the triplet for every decision node (`WRONG` without a triplet is deleted).

### P7-E3 — RUN ON CliLive (the CLI driver)

1. `Effect.provide(CliLive)` — `Shell` + `FileSystem` + `HttpClient` + `Journal.fileLayer`.
2. `bunx jesl run workflow.json --ctx ctx.json --in '{"seed":…}'` — the `jesl` bin's `run` is `Effect.runPromise` at the edge only (`E1`).
3. A doc needing `llm`/`subagent` on `CliLive` MUST die `[JESL CAP-UNBOUND] llm` at the first such node — loud, no artifact (the cap test, `2E.4`).
4. `layerinfo` on `CliLive` MUST list `Journal`, `FileSystem`, `Command` (`S8` / `criterion 16`).

### P7-E4 — PAUSE / RESUME A Workflow RUN (the durable checkpoint)

1. `pause` node → `DurableDeferred` — the workflow yields; journal records the pause receipt.
2. Resume contributors: `workflow resume --run <id>` OR `ask-launcher` answer channel OR `Workflow` engine's own `Deferred.complete`.
3. `kill -9` + `Workflow` resume → MUST reproduce the paused run's journal chain byte-identically (`criterion 12` / `S6E`).
4. NEVER in-memory `Promise` for the pause — it loses position on restart (`E5` / `P3-11`).

### P7-E5 — READ THE JOURNAL CHAIN (evidence before claims, W13)

1. `Journal` is `sha256` per row + `Activity` receipts — the chain IS the run truth (`1B` / `E5`).
2. `covers(docHash, seed)` → if covered, return recorded `NodeResult`s; else execute and append (`5E-4`).
3. Verdict comes FROM journal rows — `oracle-gate` rows + `triplet-writer` rows — never prose (`P2-3`).
4. `replay-source` node replays the chain; a second run of `fixtures/mech-gate.json` with invoke counter MUST show `0` on `shell-exec` (`S9`).

### P7-E6 — FLIP SPEC→PROVEN AFTER CONTAINER (the honesty ledger, 2E.12)

1. Run `S8` (kernel hygiene: ripgrep `node:fs`/`fetch`/`Date.now` in `jesl/core` = empty + `effect-language-service diagnostics` = 0 kernel errors) and `S9` (Activity replay: second run `0` invokes + identical `sha` chain).
2. On green, flip `STATUS LEDGER` + `§0.2` + `2E.12` rows for the Effect kernel from `SPEC` to `PROVEN` — never flip without the container rows (`§7` rule 6).
3. Flip also flips `EFFECT_TS_RUNTIME_BIBLE.md:9D` + JESL DPL1 `§2.9` together — single source per `§8` handoff.
4. A partial flip (one ledger green, one red) is a derailment — the handoff is atomic (`SPEC → PROVEN via S8/S9+S10`).

---

## 2E.12 — THE GROUNDING + STATUS LEDGER (SPEC until container)

Additive to `§0.2` and `VERSION HISTORY`. The bind is SPEC until the container proves it.

### The ergänzing grounding rows (§0.2 delta)

| Element | Status | Anchor |
|---|---|---|
| `Effect` SDK (`Effect<A,E,R>` / `Effect.fn` / `Effect.gen` / `Context` / `Layer` / `Schema` / `Fiber` / `Schedule` / `TestClock`) | **REAL — proven** | `effect` package · `EFFECT_TS_RUNTIME_BIBLE.md:0.2` |
| `@effect/language-service` (diagnostics CLI + `patch` + `layerinfo` + `overview`) | **REAL — proven** | `@effect/language-service` package · `EFFECT-RT 3.2` |
| `@effect/workflow` (`Workflow` + `Activity` + `DurableClock` + `DurableDeferred` + `Clock`) | **REAL (v4 / `@effect/workflow`)** | durable execution — `EFFECT-RT 0.2` |
| `@effect/platform` / `platform-node` (or `bun`) (`FileSystem` / `HttpClient` / `Command` / `Path`) | **REAL — proven** | platform packages |
| `@effect/vitest` / `it.effect` + `@effect/ai` (`LanguageModel` + `Tool`) | **REAL — proven** | test plane + `call-model` |
| `Effect`-hosted JESL executor (`Executor` as `Effect.forEach` + journal `Activity` + `EventBus`) | **THIS BIBLE'S SPEC — PART 2E** | THIS PART — `SPEC` until S8/S9 container rows |
| Paragon `BehaviorEngine` + `ToolEngine` as Effect services | **SPEC-ON-PROVEN-MATH** | Paragon engines exist; wrap, don't rewrite (`D12`) |
| Poseidon as `Workflow` (`WarheadRun` / `JeslRun` durables) | **SPEC** | `EFFECT-RT 4.2` |

### The status ledger delta

| Component | Status |
|---|---|
| `Effect` SDK / LSP / Workflow / Platform / Vitest / AI (upstream) | **PROVEN** (upstream) |
| JESL document grammar (`Part 2`) | **SPEC** (bible v1.1) — unchanged |
| JESL DPL1 library slices `S1–S6` / `§7` battery | **SPEC / PLANNING** — unchanged |
| Effect kernel `PART 2E` (`2E.0–2E.12`) | **SPEC** — flips to **PROVEN** only via `S8` + `S9` container rows (P7-E6) |
| `Effect`-hosted executor + `CliLive`/`OpenCodeLive`/`TestLive` + `Workflow` resume | **SPEC** — `JeslRun` `idempotencyKey = docHash+seed` (`2E.6`) |
| Paragon wrap (`BehaviorEngine`/`ToolEngine` on `EventBus`) | **SPEC-ON-PROVEN-MATH** (wraps existing math) |
| Effect LSP `EffectLsp` `Activity` + `PTA` layer `EFFECT_ARTIFACT_GATE` | **SPEC** — `patch` in `prepare` (`P7-E5`) |

**THE HONESTY RULE (§7 rule 6 / Warhead 10 / Warhead 13):** Effect kernel **SPEC** until `S8`/`S9` container rows exist — a flips without the rows is a loud-fail (`ready:false`) — a `SPEC`-marked template is not shippable before its substrate proves. The ledger lives here AND in `EFFECT-RT 9D` — the operator flips both atomically after reading `PART 2E` + `§2.9` + `§5.2` (`§8` handoff).


# PART 3 — USE CASE A: MECHANICALLY INTELLIGENT TOOLS (PURE JSON EVENT SCRIPTING + HOOK ENGINEERING)

**THE REFRAME (v1.1):** this part is a USAGE PATTERN of the one library (§2.5) — the composition constrained to deterministic node families. It is not a separate system.

## 3.1 WHAT A TIER-1 TOOL IS

A Tier-1 tool is a **frozen-front-contract tool whose entire backend is a JSON workflow composed ONLY of Event + Decision + Evidence nodes** — zero LLM, zero nondeterminism, zero marginal cost. The intelligence is the composition: filters select, machines decide, gates enforce, journals prove. Same input → same verdict, forever (`SHADOW_ENHANCED_TOOLS_BIBLE.md:359-364` — the algorithmic family's determinism/testability/auditability pros).

**THE TIER-1 INVARIANT:** grep the workflow JSON — if any node `type` is in the Generation family, it is NOT Tier 1. The runner's `[JESL TIER-VIOLATION]` enforces this mechanically.

## 3.2 THE TIER-1 CANONICAL SHAPE (the observer-decider-enforcer loop)

```jsonc
{
  "meta": { "name": "tool-cadence-guard", "tier": 1, "packaging": "tool",
            "output-contract": { "type":"object", "required":["verdict"] } },
  "nodes": [
    { "id": "watch",  "type": "event-filter", "class": "detect",
      "subscribe": ["tool.call.completed"],
      "reader": { "tool": "$.tool", "ts": "$.ts" } },
    { "id": "window", "type": "capture-engine", "class": "detect",
      "flush": { "intervalMs": 5000, "maxEvents": 50, "finalOn": "session.idle" } },
    { "id": "loop-machine", "type": "machine", "class": "decide",
      "machine": "cadence-loop-detector",
      "on": { "LOOP_DETECTED": "enforce" } },
    { "id": "enforce", "type": "gate", "class": "decide",
      "assert": { "maxSameToolCallsPerWindow": 5 },
      "on-fail": "LOUD" },
    { "id": "evidence", "type": "triplet-writer", "class": "detect",
      "source": "tool-cadence-guard" }
  ],
  "edges": [
    { "from": "watch", "to": "window", "via": "tool-events" },
    { "from": "window", "to": "loop-machine", "via": "window-batch" },
    { "from": "enforce", "to": "evidence", "via": "verdict" }
  ],
  "journal": { "path": ".trident/workflows/tool-cadence-guard/{run-id}.jsonl" }
}
```

**THE LOOP, READ SLOWLY:** `watch` filters the event stream (the Filter Law) → `window` batches (the streaming-batching pattern, `CUSTOM_EVENT_HOOK...md:535`) → `loop-machine` decides on the EVIDENCE (the Evidence-Decision Law, `TEB_MACHINES...md:159`) → `enforce` fires LOUD on violation → `evidence` journals the triplet. Five nodes, zero LLM, fully replayable.

## 3.3 THE TIER-1 PATTERN CATALOG (which composition answers which need)

| The need | The composition | The template(s) |
|---|---|---|
| observe a behavior and act | `event-filter` → `machine` → `gate` → `triplet-writer` | 5A-1, 5B-1, 5B-2, 5E-2 |
| gate a value against a threshold | `event-filter` → `oracle-gate` → `journal-sink` | 5A-1, 5B-3 |
| detect a stall and remediate | `event-filter` → `machine` (stuck patterns) → `tool-call` (kick) | 5A-7, 5B-1 |
| verify a claim against events | `event-filter` × 2 (claim + fact) → `machine` (temporal order) → `gate` | 5A-1, 5B-6 |
| break a runaway loop | `machine` → `circuit-breaker` → `gate` (block) | 5B-4 |
| escalate on repeat offenses | `machine` (escalation ladder) → `gate` (tier-proportional) | 5B-5 |
| watch the reasoning quality | `event-filter` (`message.updated`) → `capture-engine` → `machine` → `gate` | 5A-6 |
| enforce a contract on an output | `event-filter` (`tool.call.completed`) → `gate` (schema) | 5B-7 |
| reset state on session end | `event-filter` (`session.*`) → `machine` (reset) | 5A-8 |

## 3.4 PACKAGING A TIER-1 WORKFLOW AS A TOOL

**THE SINGLE-TOOL PACKAGING:** the workflow ships behind ONE frozen front contract — the caller sees `{"workflow":"tool-cadence-guard","args":{...}}`; the runner executes the graph silently; the output is the terminal gate's verdict + the journal path. This is the shadow-enhanced tool's shape MINUS the LLM stage — the interface is the product, the machinery is silent (`SHADOW_ENHANCED_TOOLS_BIBLE.md:14`).

**THE TOOL-CHAIN PACKAGING (when the agent must reason BETWEEN steps):** each node becomes a tool (`wf-<name>-<node>`), the edges become the module-level `PipelineRunContext` (`T1_MULTI_TOOL_CHAIN_PIPELINE.md:56-79`), and every step's args REQUIRE the previous step's output field (the output-contracted args gatekeeper, `T1...:552-566`). The mechanical firewall lives INSIDE each tool: validate the prior artifact exists on disk before executing (`T1...:139-153`).

**THE PACKAGING DECISION RULE:** internal orchestration (one tool) when the agent treats the workflow as atomic; external orchestration (tool-chain) when the agent must inspect/adjust between steps. The JSON is IDENTICAL — only the packaging field changes.

## 3.5 THE WORKED TIER-1 EXAMPLES (the reference set)

**EXAMPLE 1 — THE EVIDENCE-CLAIM VERIFIER** (the LASME shape as JSON): two `event-filter` nodes (one on `message.updated` for the claim, one on `tool.call.completed` for the fact), one `machine` asserting the fact-event FOLLOWS the claim-event (the temporal truth, `TEB_MACHINES...md:110`), one `gate` emitting CONTRADICTED/UNVERIFIABLE/VALID, one `triplet-writer`. The claim-vs-evidence firewall without a single line of imperative code.

**EXAMPLE 2 — THE MEMORY-SAFE READ GATE** (M2 as JSON): `event-filter` on `tool.call.completed` (tool=bash) → `gate` asserting `stdout.length <= BUDGET` → on-fail LOUD with the remedy. Three nodes.

**EXAMPLE 3 — THE DOC-DENSITY GATE** (the write firewall as JSON): `event-filter` on `tool.execute.before` (tool=write, path=*.md) → `gate` with the per-type floors (ARCHITECTURE 1000+, SPEC 3000+, GENERIC 200+ — the DOC-DENSITY LAW) → `triplet-writer`. The floors live in the JSON, adjustable per project WITHOUT touching the plugin.


# PART 4 — USE CASE B: EMBEDDED AGENT SYSTEMS (SHADOW AGENT / PI SDK VIA JSON + TOOL CHAINS)

**THE REFRAME (v1.1):** a usage pattern of the one library — the same composition plus generative nodes, always bracketed. The pi-SDK harness is bound by the opencode driver as the `llm`/`subagent` capabilities; the JSON author never writes it (the WHAT/HOW division, 4.4).

## 4.1 WHAT A TIER-2 SYSTEM IS

A Tier-2 system composes the FULL registry — the mechanical nodes (Tier 1) BRACKET the generation nodes. The pattern is the fusion law: **the shadow generates what only a language model can generate; the lexicons detect; the machines decide; the actors execute** (`SHADOW_ENHANCED_TOOLS_BIBLE.md:406`). The JSON makes the fusion EXPLICIT — every LLM node is visibly sandwiched between validate-before and verify-after gates.

**THE TIER-2 INVARIANT:** every `shadow-agent`/`shadow-tool` node MUST have at least one inbound `gate` (the input floors) and one outbound `gate`/`oracle-gate` (the silent verification). An unbracketed generation node is a validation failure (`[JESL UNBRACKETED-GENERATION]`).

## 4.2 THE TIER-2 CANONICAL SHAPE (the bracketed generation loop)

```jsonc
{
  "meta": { "name": "audit-agent", "tier": 2, "packaging": "tool",
            "output-contract": { "type":"object", "required":["report","verdicts"] } },
  "nodes": [
    { "id": "input-gate", "type": "gate", "class": "decide",
      "assert": { "minMissionChars": 200, "filepathsExist": true },
      "on-fail": "LOUD" },                                    // validate BEFORE
    { "id": "probe", "type": "tool-call", "class": "detect",
      "tool": "provider-probe", "timeoutMs": 5000 },           // the 5s lifeline
    { "id": "agent", "type": "shadow-agent", "class": "generate",
      "model": "opencode-go/muse-spark-1.2-contributor",
      "api": "openai-responses",                              // THE FAMILY LAW
      "tools": ["read","grep","graphify:query"],
      "contract": "report-8-heading",                         // byte-exact markers
      "budget": { "maxTokens": 131072, "thinkingLevel": "xhigh",
                  "thinkingBudgets": {"high":16384,"xhigh":131072},
                  "rounds": "4 + ceil(candidates/8)" },       // the budget formula
      "writeScope": "{ledgerRoot}" },                          // the write-scope law
    { "id": "verify", "type": "gate", "class": "decide",
      "assert": { "reportMarkers": "8/8-ordered",
                  "verdictsValid": "V0-V8",
                  "countsReconcile": true },
      "on-fail": { "repair": { "node": "agent", "maxLoop": 2 } } },   // the repair loop
    { "id": "confidence-floor", "type": "gate", "class": "decide",
      "assert": { "minConfidence": 0.55, "belowFloorIs": "UNCLEAR" } },
    { "id": "journal", "type": "journal-sink", "class": "detect" }
  ],
  "edges": [
    { "from": "input-gate", "to": "probe", "via": "validated-args" },
    { "from": "probe", "to": "agent", "via": "provider-ok" },
    { "from": "agent", "to": "verify", "via": "draft-report" },
    { "from": "verify", "to": "confidence-floor", "via": "valid-verdicts" },
    { "from": "confidence-floor", "to": "journal", "via": "final" }
  ],
  "journal": { "path": ".trident/workflows/audit-agent/{run-id}.jsonl" }
}
```

**EVERY LESSON FROM `SHADOW_AGENT_ENGINEERING_BIBLE` RIDES AS A NODE FIELD:** the api-family (`openai-responses` for muse — never hand-roll the wrong route), the module-load key seeding (the runner's boot sequence), the byte-exact report contract (marker-teaching), the thinking-budget injection (the 712s autopsy — budgets EXPLICIT, not inherited), the budget formula (`4 + ceil(candidates/8)`), the write-scope (all writes resolve under `{ledgerRoot}`), the repair loop (max 2, then `validator-reject` LOUD).

## 4.3 THE TIER-2 PATTERN CATALOG (the agent-system scenarios)

| The scenario | The composition | Templates |
|---|---|---|
| one LLM call with verification | `gate` → `shadow-agent` → `gate`(repair-loop) → `journal-sink` | 5C-1, 5B-7 |
| multi-agent fan-out research | `gate` → `parallel`(N × `shadow-agent`) → `machine`(merge/dedupe) → `shadow-agent`(synthesize) → `gate` | 5D-2, 5C-3 |
| the wave dispatch (subagents) | `gate`(spec+oracles) → `subagent-dispatch` → `machine`(tracker) → `oracle-gate` | 5D-6 |
| the self-improving loop | `shadow-agent` → `gate` → on-fail `steer` → `shadow-agent` (bounded) | 5C-4 |
| reasoning-governed generation | `event-filter`(reasoning) → `machine`(flow) → `gate` → (steer the live `shadow-agent`) | 5A-6, 5D-8 |
| scheduled autonomous run | `cron-trigger` → the whole graph | 5D-7 |
| the full test pipeline | `gate`(plan) → `parallel`(container scenarios) → `oracle-gate` → `journal-sink` | 5F-2 |

## 4.4 THE PI-SDK EMBEDDING CONTRACT (what the runner provides the shadow-agent node)

The `shadow-agent` node resolves to the pi-SDK machinery with these INJECTED defaults (the bible's lessons as runner behavior, `SHADOW_AGENT_ENGINEERING_BIBLE.md`):

1. **The transport chain** — `chainedStream`: retry 5×2.5s, stall guard 60s (EVENT-AWARE, every event resets the clock), the done-verifier (degenerate-done → error, not crash), the loud-fail full-shape message.
2. **The key seeding at module load** — the probe never runs keyless (BUG-D6).
3. **The force-bound tools** — read capped (320 lines), grep capped (120 results), write path-pinned to the node's declared scope.
4. **The thinking budgets explicit** — injected into `streamSimple` options, never inherited from the Agent defaults (the 712s lesson).
5. **The report contract taught byte-exact** — the node's `contract` field expands to the literal marker list in the system prompt (marker-teaching).

**THE EMBEDDING LAW:** the JSON author declares WHAT (model, tools, contract, budget, scope); the runner supplies HOW (transport, seeding, capping, injection, teaching). A JSON field never duplicates what the runner injects — the portability stays.

## 4.5 TOOL-CHAIN PACKAGING FOR AGENT SYSTEMS (the T1 marriage)

For agent systems where the PRIMARY agent reasons between stages, package the workflow as a tool-chain: the generation nodes become tools the agent calls with output-contracted args (the screenshot-gatekeeper pattern — the arg field that can ONLY be filled by doing the prior step, `T1_MULTI_TOOL_CHAIN_PIPELINE.md:552-566`), the mechanical firewalls live inside each tool, and the module-level context carries the phase outputs (`T1...:56-79`). The JSON workflow is the SOURCE OF TRUTH for the chain's shape; the packaging step generates the N tools + the context schema from it.

**THE HYBRID PACKAGING RULE:** human-in-the-loop steps force tool-chain packaging (the agent IS the reasoner between steps); fully-autonomous flows ship as one tool. A workflow may declare BOTH — `packaging: "tool-chain"` with `autoStages: ["scout","verify"]` marking which links the agent may chain automatically.


# PART 5 — TIER 3: THE PORTABLE MICRO-TEMPLATE CATALOG

**THE CATALOG LAW:** every template is a copy-pasteable JSON fragment with FOUR fields of documentation: **RESOLVES-TO** (the machinery), **WHEN** (the trigger condition), **FAILURE-MODE** (what breaks when misused), and **ANCHOR** (the proven substrate). A template never inlines project content (the Portability Law).

## 5A — THE EVENT TEMPLATES (the observation family)

### 5A-1 — SUBSCRIBE-FILTER (the noise gate)
```jsonc
{ "id": "<name>", "type": "event-filter", "class": "detect",
  "subscribe": ["tool.call.completed"],
  "filter": { "tool": "bash" },
  "reader": { "stdout": "$.output.stdout", "exit": "$.output.exitCode" } }
```
**RESOLVES-TO:** the `event` hook registration + the type filter + the defensive reader (`CUSTOM_EVENT_HOOK...md:86-95`). **WHEN:** every observation begins here. **FAILURE-MODE:** no `filter` → the handler runs on every event and drowns (anti-pattern #1, `TEB_MACHINES...md:674`). **ANCHOR:** the Filter Law — `if (event.type !== X) return` FIRST.

### 5A-2 — THROTTLE-BATCH (the streaming accumulator)
```jsonc
{ "id": "<name>", "type": "capture-engine", "class": "detect",
  "flush": { "intervalMs": 50, "maxDeltaChars": 60, "finalOn": "part.time.end" } }
```
**RESOLVES-TO:** the start/delta/end/flush engine — the 50ms/60-char/final-marker rules (`REASONING_TOKEN_CAPTURE_WIRING.md:112-115`). **WHEN:** any incremental stream (reasoning, logs, ticks). **FAILURE-MODE:** awaiting a slow consumer in `onBatch` → the stream stalls (anti-pattern #8) — the callback is fire-and-forget. **ANCHOR:** the ReasoningCaptureEngine.

### 5A-3 — DEBOUNCE (fire after quiet)
```jsonc
{ "id": "<name>", "type": "capture-engine", "class": "detect",
  "flush": { "quietMs": 2000, "maxWaitMs": 30000 } }
```
**RESOLVES-TO:** the accumulator with a quiet-window rule. **WHEN:** bursty streams where the batch boundary is silence (session idle, typing stops). **FAILURE-MODE:** no `maxWaitMs` → an unending stream never flushes.

### 5A-4 — CORRELATE-SESSION (group by identity)
```jsonc
{ "id": "<name>", "type": "capture-engine", "class": "detect",
  "groupBy": "$.sessionID", "perKeyState": true }
```
**RESOLVES-TO:** per-session keyed accumulation (the paragon per-session synapse pattern — concurrent sessions never share state, `SPEC_PARAGON_WAVE_MERGE.md:19`). **WHEN:** multi-session runtimes. **FAILURE-MODE:** global state → concurrent TUI sessions cross-contaminate.

### 5A-5 — FAN-OUT-DISPATCH (one event → N machines)
```jsonc
{ "id": "<name>", "type": "event-filter", "class": "detect",
  "subscribe": ["tool.call.completed"],
  "dispatch": ["machine-a", "machine-b", "machine-c"] }
```
**RESOLVES-TO:** the one-hook-many-machines law (`TEB_MACHINES...md:162` — E5). **WHEN:** one event feeds multiple observers (evidence + cadence + compliance). **FAILURE-MODE:** one slow consumer blocks the rest — dispatch is parallel, non-awaited.

### 5A-6 — REASONING-CAPTURE (the thinking stream)
```jsonc
{ "id": "<name>", "type": "event-filter", "class": "detect",
  "subscribe": ["message.part.updated"],
  "filter": { "part.type": "reasoning" },
  "reader": { "text": "$.part.text", "end": "$.part.time.end" },
  "next": "flow-machine" }
```
**RESOLVES-TO:** the proven reasoning wiring (`REASONING_TOKEN_CAPTURE_WIRING.md:51-71` — note the v2 correction: `message.part.updated` + `event.properties.part`, NOT `message.updated` + `info.parts`, on opencode 1.14.51). **WHEN:** governing the agent's OWN thinking. **FAILURE-MODE:** the single-shape assumption — the think-tag text fallback (`textDelta`) must ride as the second path. **ANCHOR:** the #1 unlock — the derailment caught at reasoning time.

### 5A-7 — TOOL-CADENCE-WATCH (the loop detector feed)
```jsonc
{ "id": "<name>", "type": "event-filter", "class": "detect",
  "subscribe": ["tool.call.started", "tool.call.completed"],
  "reader": { "tool": "$.tool", "ts": "$.ts", "exit": "$.output.exitCode" },
  "window": { "events": 25 } }
```
**RESOLVES-TO:** the cadence observation (`TEB_MACHINES...md:227`). **WHEN:** loop/stall detection, the stuck-detector feed (the STUCK_NO_ACTIVITY/PROVIDER_QUOTA/SESSION_CRASH/SLOW_LEGIT family). **FAILURE-MODE:** watching only `started` → in-flight calls invisible.

### 5A-8 — LIFECYCLE-WATCH (the session state resets)
```jsonc
{ "id": "<name>", "type": "event-filter", "class": "detect",
  "subscribe": ["session.created", "session.idle", "session.ended", "session.compacting"],
  "next": "lifecycle-machine" }
```
**RESOLVES-TO:** the M4 session-lifecycle machine (`TEB_MACHINES...md:496-511`). **WHEN:** state resets, freshness gates, evidence clears. **FAILURE-MODE:** no reset on `session.ended` → stale evidence poisons the next session.

### 5A-9 — DISCOVERY-PROBE (the log-first event finder)
```jsonc
{ "id": "probe", "type": "event-filter", "class": "detect",
  "subscribe": ["*"], "log": { "depth": 4, "maxString": 200, "maxKeys": 20 },
  "journal": { "source": "event-discovery" } }
```
**RESOLVES-TO:** the log-first probe (`CUSTOM_EVENT_HOOK...md:596-622`). **WHEN:** BEFORE authoring any filter — discover the real event types empirically. **FAILURE-MODE:** guessing event names from docs → the names drift, the filter never fires (anti-pattern #6). **ANCHOR:** the Never-Guess Law.


## 5B — THE DECISION TEMPLATES (the gating family)

### 5B-1 — STATE-MACHINE-NODE (the T.E.B. decider)
```jsonc
{ "id": "<name>", "type": "machine", "class": "decide",
  "machine": "<registered-machine-id>",
  "states": ["IDLE", "EVALUATING", "VERIFIED", "VIOLATION", "INCONCLUSIVE"],
  "failState": "INCONCLUSIVE",
  "on": { "VIOLATION": "<enforce-node>", "VERIFIED": "<next-node>" } }
```
**RESOLVES-TO:** a registered XState actor (the 6-part anatomy, `TEB_MACHINES...md:143-149`). **WHEN:** any multi-step decision with guards. **FAILURE-MODE:** a fail-state of PASS — the machine must fail INCONCLUSIVE, never silently pass (Warhead 9). **ANCHOR:** invalid transitions THROW (the no-silent-skip law, `SHADOW_AGENT_ENGINEERING_BIBLE.md:1000-1009`).

### 5B-2 — GATE-NODE (validate + LOUD)
```jsonc
{ "id": "<name>", "type": "gate", "class": "decide",
  "assert": { "<field>": { "min": 200, "message": "mission below 200c floor" } },
  "on-fail": "LOUD" }
```
**RESOLVES-TO:** the validation floors with named remedies (the `formatDiagnostics` pattern — `✗ agent.field: message → fix`, `MPSE...md:81`). **WHEN:** every input, every inter-stage boundary. **FAILURE-MODE:** silent degradation — `on-fail: "WARN"` is FORBIDDEN on input gates; only LOUD or a named repair target. **ANCHOR:** the wave-spec char floors.

### 5B-3 — ORACLE-GATE (the number vs the expectation)
```jsonc
{ "id": "<name>", "type": "oracle-gate", "class": "decide",
  "rows": [
    { "id": "OR-1", "scope": "<node>", "cls": "O2",
      "expected": "ge(900)", "command": "bun test | grep -c pass" } ] }
```
**RESOLVES-TO:** the MPSE oracle evaluation (`eq|ge|le|ne|contains|matches` operators, `MPSE...md:117-125`). **WHEN:** build workflows, test workflows, any numeric claim. **FAILURE-MODE:** free-text expected values — REJECTED at authoring; the firewall reads the NUMBER against the oracle, never the prose. **ANCHOR:** "the firewall does not read the agent's reasoning — it evaluates the agent's number against the oracle" (`MPSE...md:22`).

### 5B-4 — CIRCUIT-BREAKER (the runaway stop)
```jsonc
{ "id": "<name>", "type": "circuit-breaker", "class": "decide",
  "threshold": 3, "window": { "consecutiveFailures": true },
  "onOpen": "<block-node>", "halfOpenAfter": { "quietMs": 300000 } }
```
**RESOLVES-TO:** the paragon circuit (`SPEC_PARAGON_WAVE_MERGE.md` — opens at 3 consecutive tier-3+ failures; when OPEN only the escape hatch passes). **WHEN:** any retry loop, any provider chain, any escalation. **FAILURE-MODE:** no half-open recovery → the breaker latches forever. **ANCHOR:** the paragon circuit.

### 5B-5 — ESCALATION-LADDER (tier-proportional response)
```jsonc
{ "id": "<name>", "type": "state-machine", "class": "decide",
  "machine": "escalation-ladder",
  "tiers": [1, 2, 3, 4],
  "climb": { "onRepeat": 2, "deadlineSeq": 5, "cap": 4 },
  "tierActions": { "1": "steer", "2": "demand", "3": "deny", "4": "mandate" } }
```
**RESOLVES-TO:** the paragon tier machine (skip-tier at escalationCount≥2, deadline seq+5, tier++ cap 4 — `SPEC_PARAGON_WAVE_MERGE.md:56`). **WHEN:** repeat-offender behavior, compliance enforcement. **FAILURE-MODE:** hard-lock at tier 4 — the NEVER-LOCK law: the tier-4 SOLVE allowlists the escape hatches + the instrument. **ANCHOR:** the 24 warhead templates (6 macros × 4 tiers).

### 5B-6 — TEMPORAL-ORDER-GATE (the claim-after-proof assertion)
```jsonc
{ "id": "<name>", "type": "machine", "class": "decide",
  "machine": "temporal-order",
  "assertOrder": { "before": "<claim-event>", "after": "<fact-event>" } }
```
**RESOLVES-TO:** the event-stream temporal truth (`TEB_MACHINES...md:110` — the order is preserved; snapshot queries cannot see it). **WHEN:** evidence-claim verification ("the test ran BEFORE the claim of passing"). **FAILURE-MODE:** polling-based comparison → the order is reconstructed, not witnessed.

### 5B-7 — SCHEMA-GATE (the output contract)
```jsonc
{ "id": "<name>", "type": "gate", "class": "decide",
  "assert": { "jsonSchema": "$ref: meta.output-contract" },
  "on-fail": { "repair": { "node": "<generator>", "maxLoop": 2 } } }
```
**RESOLVES-TO:** the JSON-Schema validation + the repair loop (max 2, then `validator-reject` LOUD — `SHADOW_AGENT_ENGINEERING_BIBLE.md:937-948`). **WHEN:** bracketing every generation node. **FAILURE-MODE:** unbounded repair → the budget burns (the validator-reject lesson). **ANCHOR:** grok's `schema_contract.rs` (the `<output-contract>` wrapping — the same pattern, both sides of the fence).

### 5B-8 — CONFIDENCE-FLOOR (the emittable-verdict gate)
```jsonc
{ "id": "<name>", "type": "gate", "class": "decide",
  "assert": { "minConfidence": 0.55, "belowFloorIs": "UNCLEAR",
              "penalties": { "paraphrase": -0.15, "missingLeg": "floor" } } }
```
**RESOLVES-TO:** the confidence computation (base 0.85, paraphrase −0.15, floor 0.55 → UNCLEAR — `SHADOW_AGENT_ENGINEERING_BIBLE.md:1028-1039`). **WHEN:** any LLM-produced verdict. **FAILURE-MODE:** emitting TRUE_DEFECT below the floor — a low-confidence verdict is UNCLEAR, never a defect.


## 5C — THE GENERATION TEMPLATES (the LLM family)

### 5C-1 — SHADOW-AGENT-CALL (one bracketed LLM call)
```jsonc
{ "id": "<name>", "type": "shadow-agent", "class": "generate",
  "model": "opencode-go/muse-spark-1.2-contributor",
  "api": "openai-responses",
  "tools": ["read", "grep"],
  "budget": { "maxTokens": 131072, "thinkingLevel": "xhigh" },
  "systemPrompt": { "mission": "<from-args>", "contract": "<marker-id>" } }
```
**RESOLVES-TO:** the pi-SDK Agent + chainedStream (retry/stall/done-verifier/loud-fail — Part 4.4's injected defaults). **WHEN:** dense generation a machine cannot produce. **FAILURE-MODE:** (a) the wrong `api` family → the 500-forever trap (probe FIRST); (b) missing `tools` caps → context overflow; (c) budgets left to the Agent defaults → the 712s unbounded-thinking autopsy. **ANCHOR:** `SHADOW_AGENT_ENGINEERING_BIBLE.md` §1-3.

### 5C-2 — SHADOW-TOOL-CALL (the 7-stage silent backend)
```jsonc
{ "id": "<name>", "type": "shadow-tool", "class": "generate",
  "backend": "context-synthesis | deep-planning | problem-solving | code-audit",
  "memory": { "scope": "{project}/{sessionKey}", "chain": 5, "window": 30 },
  "supremacy": true }
```
**RESOLVES-TO:** the 7-stage pipeline (tether→sidecar→memory→reattach→validate→context→brief→brain→verify→persist — `SHADOW_ENHANCED_TOOLS_BIBLE.md:117-129`). **WHEN:** a frozen-front tool whose calls must COHERE across invocations (the memory chain). **FAILURE-MODE:** no supremacy contract → the model conforms to belief over data (M5 — the worst class). **ANCHOR:** the three proven references (Omni Vision v5 / task-preflight v7.3 / wave-manager v4.4.2).

### 5C-3 — REPORT-CONTRACT (the byte-exact marker enforcement)
```jsonc
{ "id": "<name>", "type": "gate", "class": "decide",
  "assert": { "markers": ["# REPORT", "## 0 METADATA", "## 1 VERDICTS", "..."],
              "ordered": true, "wordBoundary": true } }
```
**RESOLVES-TO:** the 8-heading marker checker (`\b`-tolerant, order-asserted — `SHADOW_AGENT_ENGINEERING_BIBLE.md:862-889`). **WHEN:** every generated report. **FAILURE-MODE:** teaching "follow §2.6" instead of the literal bytes → the model invents its own title, the checker rejects, the repair budget burns (marker-teaching). **ANCHOR:** grok's `schema_contract.rs` is the same pattern in the Rust world.

### 5C-4 — REPAIR-LOOP (the bounded re-prompt)
```jsonc
{ "id": "<name>", "type": "gate", "class": "decide",
  "assert": { "...": "..." },
  "on-fail": { "repair": { "node": "<generator>", "maxLoop": 2,
                            "demand": "validation errors verbatim" } } }
```
**RESOLVES-TO:** the validator repair loop (V0-V8 errors → the re-prompt carries the errors verbatim → max 2 → `validator-reject` — `SHADOW_AGENT_ENGINEERING_BIBLE.md:937-948`). **WHEN:** bracketing generation. **FAILURE-MODE:** unbounded loops; or a repair demand that summarizes instead of quoting the errors.

### 5C-5 — STEER-LOOP (the live-session correction)
```jsonc
{ "id": "<name>", "type": "tool-call", "class": "decide",
  "tool": "wave-steer", "args": { "sessionId": "${session}", "steerMode": "soft" } }
```
**RESOLVES-TO:** the wave-manager control plane (`steerMode` soft|hard, mode MANDATORY on steer, banned elsewhere — the v4.4.2 control plane). **WHEN:** correcting a live agent mid-run (the reasoning-governed pattern). **FAILURE-MODE:** hard-interrupting mid-generation when a queued soft steer would do — interrupt is for off-course, queue is for addition.

### 5C-6 — SUBAGENT-DISPATCH (the wave spawn)
```jsonc
{ "id": "<name>", "type": "subagent-dispatch", "class": "generate",
  "spec": ".trident/wave-spec.json", "plan": ".trident/wave-plan.md",
  "auto": true, "control": ["steer", "read", "kill", "resume"] }
```
**RESOLVES-TO:** `trident-wave-manager action=generate` (spec-file ONLY input, char floors, template-intent, auto-dispatch per completion — the v4.4.2 law). **WHEN:** parallel subagent waves. **FAILURE-MODE:** inline agent arrays — FORBIDDEN; the spec file is the only input (the manifest-fabrication firewall). **ANCHOR:** `wave-dispatch.ts:592 generateWave`.

## 5D — THE ORCHESTRATION TEMPLATES (the composition family)

### 5D-1 — PIPELINE (the sequential chain)
```jsonc
{ "id": "<name>", "type": "pipeline", "class": "detect",
  "steps": ["<node-1>", "<node-2>", "<node-3>"],
  "context": "module-level", "resetAfter": "<last-node>" }
```
**RESOLVES-TO:** the T1 multi-tool chain (module-level `PipelineRunContext`, `ensureContext(runId)`, `resetContext()` on the final step — `T1_MULTI_TOOL_CHAIN_PIPELINE.md:56-89`). **WHEN:** sequential stages with shared state. **FAILURE-MODE:** no reset → the next run inherits stale phase outputs.

### 5D-2 — PARALLEL-FANOUT (allSettled + fan-in)
```jsonc
{ "id": "<name>", "type": "parallel", "class": "detect",
  "fanOut": ["<agent-1>", "<agent-2>", "<agent-3>"],
  "fanIn": "<merge-node>", "semantics": "allSettled",
  "bounded": 15, "staggerMs": [1000, 3000] }
```
**RESOLVES-TO:** `Promise.allSettled` over the children (one rejection never kills the wave; per-unit failure lands in ITS row — `SHADOW_AGENT_ENGINEERING_BIBLE.md:292`). **WHEN:** concurrent scouts/generators. **FAILURE-MODE:** `Promise.all` — one rejection kills the siblings. **ANCHOR:** the wave-manager bounded-15 + 1-3s stagger.

### 5D-3 — RETRY-CHAIN (retry-on-transient only)
```jsonc
{ "id": "<name>", "type": "retry-chain", "class": "detect",
  "wrap": "<node>", "attempts": 5, "backoffMs": 2500,
  "retryable": ["429", "rate.?limit", "5\\d\\d"],
  "on429": "exile-next-rung" }
```
**RESOLVES-TO:** the transport retry classification (`429 → exile to the next rung immediately; 5xx → retry; else → fall` — `SHADOW_AGENT_ENGINEERING_BIBLE.md:694-698`). **WHEN:** any provider-facing node. **FAILURE-MODE:** retrying a 429 in-place → the rate-limit storm.

### 5D-4 — FALLBACK-CHAIN (the same-artifact rule)
```jsonc
{ "id": "<name>", "type": "retry-chain", "class": "detect",
  "chain": ["primary", "fallback-1"],
  "fallbackRule": "SAME_ARTIFACT_ONLY" }
```
**RESOLVES-TO:** the FALLBACK TEST — a fallback is legal ONLY when it produces what the primary would ALSO produce, differing only in quality (`SHADOW_ENHANCED_TOOLS_BIBLE.md:169`). **WHEN:** provider chains (same model, two endpoints). **FAILURE-MODE:** a "fallback" that produces a scaffold/template instead of the real artifact — FALSE SUCCESS, BANNED.

### 5D-5 — PAUSE-RESUME (the human checkpoint)
```jsonc
{ "id": "<name>", "type": "pause", "class": "decide",
  "resumeOn": ["user-input", "gate-pass"], "persist": "journal" }
```
**RESOLVES-TO:** grok's `PauseKind` semantics + the journal as the resume anchor (the file-on-disk is the resume point). **WHEN:** human-in-the-loop approval, budget checkpoints. **FAILURE-MODE:** in-memory-only pause → the restart loses the position.

### 5D-6 — CRON-TRIGGER (the scheduled entry)
```jsonc
{ "id": "<name>", "type": "cron-trigger", "class": "detect",
  "intervalMs": 600000, "activeTickMs": 75000,
  "entry": "<first-node>" }
```
**RESOLVES-TO:** the wave-cron adaptive clock (10min idle / 75s while waves live — `wave-cron.ts:56-65`). **WHEN:** watchdogs, schedulers, autonomous runs. **FAILURE-MODE:** a fixed fast tick → the idle burn.

### 5D-7 — SCHEDULED-RECURRENCE (the calendar form)
```jsonc
{ "id": "<name>", "type": "cron-trigger", "class": "detect",
  "schedule": { "kind": "interval", "everyMs": 3600000 },
  "occurrenceJournal": true }
```
**RESOLVES-TO:** the grok-build scheduler actor (occurrence journal — each firing recorded, missed-fire detection). **WHEN:** recurring prompts/tasks. **ANCHOR:** `grok_build/scheduler/` (actor/create/interval/occurrence_journal).

### 5D-8 — EVENT-REACTIVATE (the dormant node wake)
```jsonc
{ "id": "<name>", "type": "event-filter", "class": "detect",
  "subscribe": ["<event>"], "activates": "<dormant-node-id>" }
```
**RESOLVES-TO:** the `on` field's runtime semantics — a node outside the active topological frontier is woken by its declared event (the cron reminder-queue + completion-notification pattern). **WHEN:** completion handlers, deferred wipes, watchdog kicks. **FAILURE-MODE:** polling a dormant node's state instead of wiring its wake event.


## 5E — THE EVIDENCE TEMPLATES (the journal family)

### 5E-1 — JOURNAL-SINK (the JSONL + sha256 record)
```jsonc
{ "id": "<name>", "type": "journal-sink", "class": "detect",
  "path": ".trident/workflows/{name}/{run-id}.jsonl",
  "row": { "ts": true, "run": true, "node": true, "verdict": true, "evidence": true },
  "sha256": true }
```
**RESOLVES-TO:** the append-only JSONL with request hashing (grok `journal.rs` 681L — sha256 per entry, `covers()` gates replay vs live). **WHEN:** EVERY workflow — this is the mandatory sink. **FAILURE-MODE:** judging the run by the prose output instead of the rows (the memory-table law). **ANCHOR:** the wave-manager's `trident-waves.sqlite` + grok's journal — both sides of the fence converged on the same answer.

### 5E-2 — TRIPLET-WRITER (the finding's only legal form)
```jsonc
{ "id": "<name>", "type": "triplet-writer", "class": "detect",
  "triplet": { "pattern": true, "state": true, "evidence": "node+file:line" },
  "noTriplet": "no-finding" }
```
**RESOLVES-TO:** the ISE evidence triad ({Pattern, State, Evidence} — no triplet = no finding, Warhead 9). **WHEN:** every decision node's output. **FAILURE-MODE:** an anchorless finding — a claim without file:line is a hallucination and gets DELETED, not journaled.

### 5E-3 — SQLITE-SINK (the durable rows)
```jsonc
{ "id": "<name>", "type": "sqlite-sink", "class": "detect",
  "db": "{shared-db}.sqlite", "wal": true, "busyTimeoutMs": 5000,
  "tx": "IMMEDIATE" }
```
**RESOLVES-TO:** the WAL + busy_timeout + `withImmediateTx` pattern (`wave-db.ts:13-129`). **WHEN:** cross-process state (concurrent sessions), anything replay-critical. **FAILURE-MODE:** a global JSON file → concurrent TUI sessions collide (the D5 ruling).

### 5E-4 — REPLAY-SOURCE (the determinism proof)
```jsonc
{ "id": "<name>", "type": "replay-source", "class": "detect",
  "from": "{journal-path}", "mode": "covers-check-then-rerun" }
```
**RESOLVES-TO:** grok's `Journal::covers()` — if the journal already covers a request (same sha256), replay the recorded outcome instead of re-executing; else run live and append. **WHEN:** resume-after-crash, deterministic tests, cost avoidance. **FAILURE-MODE:** blind rerun without the covers-check → paid for the same generation twice.

### 5E-5 — SOURCE-DISCRIMINATOR (the multi-plane disambiguator)
```jsonc
{ "id": "<name>", "type": "triplet-writer", "class": "detect",
  "source": "workflow/<name>/<node>" }
```
**RESOLVES-TO:** the evidence-discriminator pattern (`CUSTOM_EVENT_HOOK...md:262` — every record carries `source: "<plane>"`). **WHEN:** ALWAYS — the mandatory field. **FAILURE-MODE:** two workflows writing indistinguishable rows → the audit cannot attribute the observation.

## 5F — THE COMPOSED BOILERPLATES (the full-scenario starters)

### 5F-1 — DEEP-RESEARCH (the grok port, ~60 lines)
```jsonc
{
  "meta": { "name": "deep-research", "tier": 2, "packaging": "tool",
    "output-contract": { "required": ["report", "citations"] } },
  "nodes": [
    { "id": "gate-in", "type": "gate", "class": "decide",
      "assert": { "question": "minChars:20" }, "on-fail": "LOUD" },
    { "id": "reasoning-feed", "type": "event-filter", "class": "detect",
      "subscribe": ["message.part.updated"], "filter": { "part.type": "reasoning" } },
    { "id": "flow-machine", "type": "machine", "class": "decide",
      "machine": "flow-verdict", "on": { "SHALLOW": "steer" } },
    { "id": "steer", "type": "tool-call", "class": "decide",
      "tool": "wave-steer", "args": { "steerMode": "soft" } },
    { "id": "scouts", "type": "parallel", "class": "generate",
      "fanOut": 3, "child": { "type": "shadow-agent", "tools": ["read","grep","web_fetch"] } },
    { "id": "verify-citations", "type": "machine", "class": "decide",
      "machine": "citation-verifier" },
    { "id": "synthesize", "type": "shadow-agent", "class": "generate",
      "contract": "report-8-heading", "budget": { "maxTokens": 131072 } },
    { "id": "gate-out", "type": "gate", "class": "decide",
      "assert": { "jsonSchema": "$ref: meta.output-contract" },
      "on-fail": { "repair": { "node": "synthesize", "maxLoop": 2 } } },
    { "id": "journal", "type": "journal-sink", "class": "detect" }
  ],
  "edges": [
    { "from": "gate-in", "to": "scouts", "via": "question" },
    { "from": "scouts", "to": "verify-citations", "via": "claims" },
    { "from": "verify-citations", "to": "synthesize", "via": "verified" },
    { "from": "synthesize", "to": "gate-out", "via": "report" },
    { "from": "gate-out", "to": "journal", "via": "final" }
  ],
  "journal": { "path": ".trident/workflows/deep-research/{run-id}.jsonl" }
}
```
**THE POINT:** the reasoning-feed + flow-machine + steer loop means the workflow GOVERNS its own scouts' thinking mid-run — the self-regulating research agent, declaratively.

### 5F-2 — CONTAINER-TEST-WORKFLOW (the runtime-grade suite as JSON)
```jsonc
{
  "meta": { "name": "container-suite", "tier": 1, "packaging": "tool",
    "output-contract": { "required": ["scenarios", "verdict"] } },
  "nodes": [
    { "id": "auth-probe", "type": "tool-call", "class": "decide",
      "tool": "trident-container-test", "args": { "action": "status" } },
    { "id": "scenarios", "type": "parallel", "class": "detect",
      "child": { "type": "tool-call", "tool": "trident-container-test",
                 "args": { "action": "send", "prompt": "${scenario.prompt}" } } },
    { "id": "token-check", "type": "oracle-gate", "class": "decide",
      "rows": [{ "id": "OR-1", "scope": "scenarios", "cls": "O2",
                 "expected": "contains(${scenario.passToken})",
                 "command": "check(pattern=passToken)" },
               { "id": "OR-2", "scope": "scenarios", "cls": "O3",
                 "expected": "ne(${scenario.failToken})",
                 "command": "check(pattern=failToken)" }] },
    { "id": "artifact", "type": "journal-sink", "class": "detect",
      "path": ".trident/container-test-results.json" }
  ],
  "edges": [
    { "from": "auth-probe", "to": "scenarios", "via": "auth-ok" },
    { "from": "scenarios", "to": "token-check", "via": "outputs" },
    { "from": "token-check", "to": "artifact", "via": "verdicts" } ]
}
```
**THE POINT:** the runtime-grade test law (passToken in tool-result context, failToken absent, artifact on disk) expressed as oracle rows — the suite IS a workflow.

### 5F-3 — WAVE-DISPATCH-WORKFLOW (the orchestrator as JSON)
The wave-manager's own pipeline — plan-gate → generate → auto-dispatch → tracker → completion-gate — expressed as a 6-node workflow (`gate`(plan+oracles) → `subagent-dispatch` → `event-filter`(completions) → `machine`(tracker stream/idle/complete/absent) → `gate`(T.E.B class evidence) → `journal-sink`). The wave manager becomes self-hosting: its workflow runs on the same runner it powers.

### 5F-4 — COMPLIANCE-MONITOR (the paragon behavior engine as JSON)
The collect→classify→machine→actuate loop — `event-filter`(reasoning+text) → `machine`(classifier conf bands) → `state-machine`(the 8-transition paragon machine) → `escalation-ladder` → `tool-call`(warhead dispatch) → `triplet-writer`. The dial (`OFF/STEER/FULL`) is a JSON field. **THE POINT:** the entire behavior engine is a config change, not a code change.

### 5F-5 — PIPELINE-TOOLCHAIN (the T1 form)
The Plutus-shape harvest→zones→shapes→charts→setups chain as `packaging: "tool-chain"`: five nodes, each tool's args REQUIRE the prior step's artifact field (the gatekeeper), the mechanical firewalls (file-exists → semantic-content → format) are the per-node gates, the module context carries the phase outputs, the final node resets. **THE POINT:** the proven trading pipeline re-authored in ~80 lines of JSON.

### 5F-6 — AUDIT-AGENT (Part 4.2's full example)
The bracketed shadow-audit loop — input-gate → probe → shadow-agent(budget formula + write-scope + marker contract) → verify(repair≤2) → confidence-floor → journal. The full `SHADOW_AGENT_ENGINEERING_BIBLE` lesson-set as one composable artifact.

### 5F-7 — THE SKILL-LAUNCHER (use case C — the ephemeral tool)
```
.opencode/skills/<skill-name>/
  SKILL.md        ← the doc the agent loads (identity + when + how)
  workflow.json   ← the JESL document (the script)
  ctx.json        ← PRELOADED context: prompts, contracts, paths,
  │                  domain constants — the skill's frozen knowledge
  assets/         ← static files the workflow reads
```
The skill becomes an **ephemeral tool launcher**: the agent reads SKILL.md, then runs ONE command — `bunx jesl run workflow.json --ctx ctx.json --in '{"...":"..."}'` — argv/`--in` seed the input channels, the executor runs to the output gate, stdout gets the verdict JSON + journal path. NO plugin rebuild, NO tool registration — drop a directory, you shipped a tool. The opencode driver's `jesl-run` tool also runs it in-process.
**THE KEY MECHANIC — the `prompt` node's `ask-launcher` mode:** the skill script can DEFER a generation step to the agent that invoked it — the node returns a question via the tool result, the agent's answer writes the channel. `call-model` runs the bound LLM instead. A skill is self-contained AND agent-collaborative.

## 5G — THE EXECUTION TEMPLATES (the hands — the capability-bound effect nodes)

### 5G-1 — SHELL-EXEC
```jsonc
{ "id": "<n>", "type": "shell-exec", "class": "detect",
  "cmd": "bun test ${ctx.testDir}", "timeoutMs": 120000,
  "maxOutput": 512000 } ]
```
**RESOLVES-TO:** the bound `shell` cap (child_process via the driver). **WHEN:** any command-shaped step (build/test/deploy). **FAILURE-MODE:** unbounded output → the RAM-bomb class; `maxOutput` is mandatory.

### 5G-2 — PYTHON-EXEC
```jsonc
{ "id": "<n>", "type": "python-exec", "class": "detect",
  "script": "${ctx.assets}/analyze.py", "args": ["--in", "$.claims"] }
```
**RESOLVES-TO:** the `shell` cap (python execFile). **WHEN:** the python-ecosystem step (parsing, math, OCR). **FAILURE-MODE:** heredoc interpolation quoting — args pass as argv, never string-interpolated.

### 5G-3 — HTTP-REQUEST
```jsonc
{ "id": "<n>", "type": "http-request", "class": "detect",
  "url": "${ctx.endpoint}", "timeoutMs": 30000,
  "retry": { "attempts": 3, "retryable": ["5\\d\\d"] } }
```
**RESOLVES-TO:** the `http` cap. **WHEN:** external services, webhooks. **FAILURE-MODE:** no timeout → the hanging run.

### 5G-4 — FILE-IO
```jsonc
{ "id": "<n>", "type": "file-io", "class": "detect",
  "op": "read|write", "path": "${ctx.runDir}/out.md", "scope": "run" }
```
**RESOLVES-TO:** the `fs` cap — paths resolve INSIDE the run scope (the write-scope law: realpath + resolve + startsWith(root+sep); the five bypass classes closed). **WHEN:** artifacts in/out. **FAILURE-MODE:** unscoped paths → the escape.

### 5G-5 — PROMPT (the dual-mode generation node)
```jsonc
{ "id": "<n>", "type": "prompt", "class": "generate",
  "mode": "call-model" | "ask-launcher",
  "template": "${ctx.prompts.synthesize}",
  "input": ["$.verified"], "output": "$.draft" }
```
**RESOLVES-TO:** `call-model` → the bound `llm` cap (the driver's provider chain); `ask-launcher` → NO cap — the question returns through the tool result and the launcher's answer writes the channel. **WHEN:** every generation step; `ask-launcher` for the skill case and the human/agent-in-the-loop. **FAILURE-MODE:** `call-model` with the cap unbound → `[JESL CAP-UNBOUND] llm` at that node, LOUD.

# PART 6 — THE CORRECT / WRONG PAIRS

### P2-1 — THE EVENT-TYPE GUESS
**WRONG:** `"subscribe": ["message-updated"]` — the name remembered from a doc; the runtime emits `message.part.updated` on opencode 1.14.51; the filter NEVER FIRES; the workflow journals zero rows and looks "quietly broken."
**CORRECT:** run the 5A-9 discovery probe FIRST, read the journaled `event-discovery` rows, THEN author the filter with the empirically-verified type. **FIX RULE:** the Never-Guess Law — a filter whose type was not probed is unshippable (`TEB_MACHINES...md:238`).

### P2-2 — THE UNBRACKETED GENERATOR
**WRONG:** `"shadow-agent"` node with edges straight in from the trigger and straight out to the sink — no input gate, no verify gate. The model's raw output enters the state as truth; a hallucinated report ships.
**CORRECT:** input `gate` (floors) → `probe` → `shadow-agent` → `gate`(schema + repair≤2) → `confidence-floor` → `journal-sink`. **FIX RULE:** `[JESL UNBRACKETED-GENERATION]` refuses the workflow at validation — every generate node MUST be bracketed (Part 4.1).

### P2-3 — THE PROSE-JUDGED RUN
**WRONG:** the workflow returns a beautiful report; the caller reads it and declares success. No journal check. (This is the 2,614-finding false-positive class — theatrical machinery-runs judged on prose, `MPSE...md:11-21`.)
**CORRECT:** the verdict comes ONLY from the oracle rows / journal rows — `ge(900)` on the measured count, the passToken in the tool-result context, the counts reconciling. **FIX RULE:** the Journal Law — assert against rows, never prose.

### P2-4 — THE PROMISE.ALL WAVE
**WRONG:** `"parallel"` with `Promise.all` semantics — one scout's provider failure rejects the whole wave; the siblings' completed work is lost.
**CORRECT:** `allSettled` + per-node failure in ITS journal row; the fan-in merges the settled results. **FIX RULE:** the Concurrency Law 1F — one rejection must never kill the wave.

### P2-5 — THE 429 RETRY STORM
**WRONG:** retry-chain with `"retryable": ["429"]` and in-place backoff — five agents all hammering the same rate-limited key, each backing off 2.5s, all re-firing in unison; the provider exile never happens.
**CORRECT:** `"on429": "exile-next-rung"` — the 429 class routes to the NEXT provider immediately + records the exile in the ledger (45s). **FIX RULE:** the rate-limit signal is a SWITCH, not a retry (`SHADOW_AGENT_ENGINEERING_BIBLE.md:694-698`).

### P2-6 — THE FALLBACK THAT FABRICATES
**WRONG:** the shadow-agent stalls; the workflow's fallback generates a template report marked `ready:true` — the consumer builds on a fake, the real failure is invisible (FALSE SUCCESS, the most dangerous class).
**CORRECT:** the failure produces `{ready:false, errors:[named]}` — NO artifact, NO fallback; the retry re-runs the PRIMARY only. **FIX RULE:** the Loud-Fail Law 1D + the FALLBACK TEST (same-artifact-only).

### P2-7 — THE REGEX THAT DECIDES
**WRONG:** an event-filter node whose `filter` regex leads straight to an enforcement gate — no machine between; the detector IS the decider. First-match bias + magic thresholds follow.
**CORRECT:** `event-filter` (detect) → `machine` (decide, with the evidence triad) → `gate` (enforce). **FIX RULE:** the Separation Law 1A — the regex detects; the machine decides; never merge them.

### P2-8 — THE GLOBAL-STATE WORKFLOW
**WRONG:** the capture-engine accumulates into one global buffer — two concurrent TUI sessions cross-contaminate; session A's reasoning fires session B's gate.
**CORRECT:** `"groupBy": "$.sessionID"` + per-key state; sqlite-sink with WAL for the cross-process pieces. **FIX RULE:** the D5 ruling — "proper session scoping so concurrent tui sessions dont have a single shared global file" (`SPEC_PARAGON_WAVE_MERGE.md:19`).

### P2-9 — THE UNBOUNDED REPAIR
**WRONG:** the schema gate's repair loop re-prompts the generator 10 times; the budget burns; the run ends exhausted having produced 10 near-misses.
**CORRECT:** `"maxLoop": 2` then `validator-reject` LOUD. **FIX RULE:** the repair cap is a law, not a suggestion (`SHADOW_AGENT_ENGINEERING_BIBLE.md:948`).

### P2-10 — THE WRONG API FAMILY
**WRONG:** `"model": "muse-spark..."` with `"api": "openai-completions"` — every call 500s forever; days lost blaming the provider/key/quota.
**CORRECT:** `"api": "openai-responses"` (muse's family) + the 5s family-aware probe before the first call. **FIX RULE:** the API-Family Law — probe the route discrimination matrix BEFORE the build (`SHADOW_AGENT_ENGINEERING_BIBLE.md:65-107`).

# PART 7 — THE STEP-BY-STEP PROCEDURES

### P7-1 — BUILD A TIER-1 MECHANICALLY INTELLIGENT TOOL
1. **NAME THE OBSERVABLE** — one sentence: what must the system SEE that it cannot? Fill the observable-template (`CUSTOM_EVENT_HOOK...md:569-576`).
2. **DISCOVER THE EVENT TYPES** — deploy the 5A-9 discovery probe, run the target behavior, read the journaled rows. Record: THE DISCOVERED EVENT TYPE / THE PAYLOAD PATH / THE OBSERVABLE FIELD / THE FINAL-MARKER.
3. **COMPOSE FROM THE CATALOG** — start from Part 3.2's canonical shape; swap the templates per the Part 3.3 table. Every node: `id/type/class` mandatory.
4. **DECLARE TIER 1** — `"meta.tier": 1`; the runner rejects any Generation-family node.
5. **VALIDATE** — `trident-workflow-validate <file>.json` — expect ZERO `[JESL *]` diagnostics (unknown-type / cycle / dangling-edge / missing-contract / tier-violation).
6. **JOURNAL-PROVE** — run once against a fixture input; assert the journal has one row per node with `source: workflow/<name>/<node>`.
7. **REPLAY-PROVE** — run the 5E-4 replay-source; the second run must reproduce the first run's verdicts byte-identically (the determinism proof).
8. **PIN THE BATTERY** — a deterministic test driving the graph (the engine contract + the machine transitions + the gate verdicts).
9. **CONTAINER-TEST** — deploy to a fresh container; run the real behavior; assert the journal rows appear with the real (non-mock) content. THE CONTAINER TEST IS THE TEST.

### P7-2 — BUILD A TIER-2 EMBEDDED AGENT SYSTEM
1. **CHOOSE THE SUBSTRATE** — `shadow-agent` (pi SDK: open-ended reading/generation) vs `shadow-tool` (the 7-stage backend: cross-call coherence needed) vs `subagent-dispatch` (a full wave).
2. **PROBE THE PROVIDER** — the 5s family-aware probe on the declared `api` route; a 500 → fix the family BEFORE anything else (P2-10).
3. **COMPOSE THE BRACKETS** — input gate (floors) → probe → the generator → schema gate (repair≤2) → confidence-floor → journal. UNBRACKETED IS REFUSED.
4. **DECLARE THE CONTRACT** — the `output-contract` JSON Schema + the byte-exact marker list (5C-3) — the system prompt carries the literal bytes.
5. **DECLARE THE BUDGET** — `maxTokens` LARGER than the deliverable (the 8192-cap lesson), thinking budgets EXPLICIT, rounds by `4 + ceil(candidates/8)`.
6. **DECLARE THE WRITE-SCOPE** — `"writeScope": "{ledgerRoot}"`; every write resolves under it; violations journal to `write-violations.log` (the five bypass classes are closed by the runner).
7. **VALIDATE + TIER-CHECK** — step 5 of P7-1 + `[JESL UNBRACKETED-GENERATION]` must not fire.
8. **LIVE-PROVE** — one real run; assert: the report markers 8/8 ordered, the verdicts V0-V8 valid, the counts reconcile, the confidence ≥0.55 or UNCLEAR.
9. **NEGATIVE-LEG** — a run WITHOUT adversarial input produces ZERO write-violations (enforcement that blocks everything is worse than none).

### P7-3 — PACKAGE AS TOOL vs TOOL-CHAIN
1. **DECIDE** — atomic for the agent → `"packaging": "tool"`; the agent must reason between steps → `"packaging": "tool-chain"`.
2. **TOOL** — one frozen front contract `{workflow, args}`; the runner executes silently; output = verdict + journal path.
3. **TOOL-CHAIN** — generate the N tools (`wf-<name>-<node>`) from the graph; each tool's args REQUIRE the prior node's output field (the gatekeeper arg); the firewalls ride inside; the module context carries phase outputs; the last node resets.
4. **HYBRID** — `packaging: "tool-chain"` + `autoStages` for the links the agent may auto-chain.

### P7-4 — EXTEND THE LIBRARY (add a template / node-kind)
1. **EXHAUST THE CATALOG FIRST** — grep Part 5 for the need; if a template covers 80%, COMPOSE + parameterize, never fork.
2. **NEW NODE-KIND** — register a resolver `(node, ctx) => Promise<verdict>` + add the registry row (determinism column REQUIRED) + the catalog entry with RESOLVES-TO / WHEN / FAILURE-MODE / ANCHOR.
3. **THE PORTABILITY BAR** — a new template carries ZERO project content; ≤40 lines (micro) / ≤120 (composed); anchors to a PROVEN substrate (a `SPEC-GATED` marker requires the substrate's container proof first — the Grounding Map law).
4. **BACKWARD COMPAT** — the registry is append-only; a v1 workflow MUST run unchanged on the new registry (rename = a NEW kind, never a mutation).

### P7-5 — VERIFY / AUDIT AN EXISTING WORKFLOW
1. `trident-workflow-validate <file>.json` — zero diagnostics.
2. Replay the journal (5E-4) — verdicts reproduce byte-identically.
3. Grep the journal for `ready:false` rows — every failure named, none silent.
4. Tier-audit: any Generation node whose output is a verdict (not prose) → mis-tiered, reduce to Tier 1.
5. Concurrency-audit: any sequential edge between nodes sharing no data → parallelize (1F).
6. The zero-trust read: a fresh agent reads ONLY the journal + this bible and reconstructs what ran, what passed, what failed, and why.

# PART 8 — THE TROUBLESHOOTING MATRIX

| # | ERROR / SYMPTOM | CAUSE | FIX |
|---|---|---|---|
| 1 | `[JESL UNKNOWN-NODE]` at validate | the `"type"` is not in the registry (typo, or an unregistered kind) | fix the type name; if genuinely new, register the resolver FIRST (P7-4) |
| 2 | `[JESL CYCLE]` at validate | the edges form a loop — no topological order exists | break the loop with an event-reactive `on` edge (the wake pattern 5D-8) instead of a data edge |
| 3 | `[JESL TIER-VIOLATION]` | a Generation-family node in a `tier:1` workflow | either remove the LLM node (Tier-1 reduce) or declare `tier:2` with the brackets |
| 4 | `[JESL UNBRACKETED-GENERATION]` | a shadow-agent/shadow-tool node without both an inbound gate and an outbound gate/repair | add the input floors gate + the schema/confidence output gate (Part 4.1) |
| 5 | the filter journals zero rows | the event type was guessed, not probed (P2-1); or the payload path drifted | run 5A-9; read the discovery rows; author from the empirical shape |
| 6 | the filter fires but the reader yields `undefined` | the SDK-type gap — the field exists at runtime, not in the types; or the path is wrong | optional-chain every read (`?? []`/`?? ''`); verify the path against the probe output |
| 7 | two sessions contaminate each other | global accumulation state (P2-8) | `"groupBy": "$.sessionID"` + per-key state; sqlite WAL for cross-process |
| 8 | one failed scout kills the wave | `Promise.all` semantics | `allSettled` + per-node failure rows (1F) |
| 9 | all agents 429 simultaneously | in-place 429 retry (P2-5) | `"on429": "exile-next-rung"` + the ledger record |
| 10 | the LLM call 500s forever | the wrong `api` family for the model (P2-10) | probe the family; muse→`openai-responses` |
| 11 | the report is perfect but rejected | the markers are invented, not byte-exact (the marker-teaching trap) | put the literal heading bytes in the system prompt contract (5C-3) |
| 12 | the repair loop burns the budget | unbounded repair (P2-9) | `"maxLoop": 2` → `validator-reject` LOUD |
| 13 | the verdict ships at confidence 0.4 | no confidence floor (5B-8) | `minConfidence: 0.55`, below-floor → UNCLEAR, never a defect |
| 14 | the generation truncates mid-bullet | `maxTokens` below the deliverable (the 8192-cap class) | compute maxTokens from the target output size; 384K for DeepSeek-class |
| 15 | the agent reasons for 700s+ | the thinking budgets not injected (the 712s autopsy) | declare `thinkingBudgets` explicitly — the runner injects into streamSimple |
| 16 | the "validated" output is fake | a fallback produced a substitute artifact (P2-6, FALSE SUCCESS) | remove the fallback; loud-fail `{ready:false}`; retry re-runs the primary only |
| 17 | the workflow "passes" but nothing happened | prose-judged run, no journal assertion (P2-3) | gate on the oracle rows / journal rows; the passToken must appear in a TOOL-RESULT context |
| 18 | the resumed run re-pays for generations | replay without the covers-check | 5E-4 `covers-check-then-rerun` — replay the recorded outcome for covered shas |
| 19 | the pause loses its position on restart | in-memory pause state | `"persist": "journal"` — the journal row IS the resume anchor |
| 20 | the watchdog fires mid-generation | the terminal detection is wall-clock, not event-aware | the quieted-window rule: terminal = finish-marker AND no growth AND age>90s (the wave-cron law) |
| 21 | the gate blocks everything | over-fire — no negative leg (P7-2 step 9) | the clean run must produce ZERO violations; tune the threshold on the negative leg |
| 22 | the journal rows are indistinguishable | missing source discriminator (5E-5) | `"source": "workflow/<name>/<node>"` on every row |
| 23 | findings without anchors ship | the triplet-writer absent or the triad incomplete | 5E-2 — {Pattern, State, Evidence:file:line}; an anchorless claim is DELETED |
| 24 | the same workflow behaves differently per run | nondeterministic node in a tier-1 declaration; or unseeded model | tier-audit (P7-5 step 4); for LLM nodes the JOURNAL is the determinism record, re-run via replay |
| 25 | the tool-chain step skips its manual predecessor | no gatekeeper arg (the fabrication hole) | the next tool's args REQUIRE the prior artifact's path; file-exists check inside the tool (T1 firewall layer 1) |
| 26 | concurrent runs corrupt the sqlite | no IMMEDIATE tx | `"tx": "IMMEDIATE"` + WAL + busy_timeout 5000 (5E-3) |

## 8.1 — THE DIAGNOSTIC ORDER (when anything breaks)
1. `validate` — is the graph legal? (mechanical, instant)
2. the journal — what actually ran? (rows, not prose)
3. the discovery rows — did the events fire at all? (the filter wiring)
4. the oracle rows — did the numbers meet the expectations? (the gates)
5. the failure rows — were the failures LOUD and named? (the loud-fail law)
6. ONLY THEN the node internals — the machinery is the last suspect, not the first (the proven-path law: check the arguments before the tool).

# PART 9 — THE QUICK REFERENCE

## 9A — THE TIER TABLE (what each tier can / cannot do)
| | TIER 1 (mechanical) | TIER 2 (hybrid) |
|---|---|---|
| CAN | detect, decide, gate, enforce, journal, replay, escalate, break circuits | everything Tier 1 + generate prose, research, synthesize, repair, self-govern reasoning |
| CANNOT | generate novel prose, understand open-ended semantics | be deterministic at the generation nodes (the journal compensates) |
| cost/latency | ~0 / instant | LLM cost / minutes |
| auditability | perfect (triplets, forever) | perfect on the brackets; the generation is filtered, not verified-in-itself |

## 9B — THE TEMPLATE INDEX (the scan table)
| ID | Template | Family | One-liner |
|---|---|---|---|
| 5A-1 | subscribe-filter | Event | the noise gate — `event.type` filter + defensive reader |
| 5A-2 | throttle-batch | Event | 50ms/60-char/final flush accumulator |
| 5A-3 | debounce | Event | flush after quiet |
| 5A-4 | correlate-session | Event | per-sessionID keyed state |
| 5A-5 | fan-out-dispatch | Event | one event → N machines, parallel |
| 5A-6 | reasoning-capture | Event | the thinking stream (`message.part.updated`) |
| 5A-7 | tool-cadence-watch | Event | the loop-detector feed |
| 5A-8 | lifecycle-watch | Event | session.* → resets |
| 5A-9 | discovery-probe | Event | log-first event finder — ALWAYS FIRST |
| 5B-1 | state-machine | Decision | the T.E.B. decider, fail=INCONCLUSIVE |
| 5B-2 | gate | Decision | floors + LOUD fail + named remedy |
| 5B-3 | oracle-gate | Decision | the number vs eq/ge/le/ne/contains/matches |
| 5B-4 | circuit-breaker | Decision | 3 consecutive → OPEN, half-open recovery |
| 5B-5 | escalation-ladder | Decision | tier 1-4, skip at repeat, NEVER-LOCK |
| 5B-6 | temporal-order-gate | Decision | the fact FOLLOWS the claim |
| 5B-7 | schema-gate | Decision | output contract + repair≤2 |
| 5B-8 | confidence-floor | Decision | 0.55 or UNCLEAR |
| 5C-1 | shadow-agent-call | Generation | one bracketed pi-SDK LLM call |
| 5C-2 | shadow-tool-call | Generation | the 7-stage memory-backed backend |
| 5C-3 | report-contract | Generation | byte-exact marker enforcement |
| 5C-4 | repair-loop | Generation | bounded re-prompt with errors verbatim |
| 5C-5 | steer-loop | Generation | soft|hard live-session correction |
| 5C-6 | subagent-dispatch | Generation | the wave spawn, spec-file only |
| 5D-1 | pipeline | Orchestration | sequential + module context + reset |
| 5D-2 | parallel-fanout | Orchestration | allSettled + bounded 15 + stagger |
| 5D-3 | retry-chain | Orchestration | 429→exile, 5xx→retry, else→fall |
| 5D-4 | fallback-chain | Orchestration | SAME-ARTIFACT-ONLY rule |
| 5D-5 | pause-resume | Orchestration | journal-persisted checkpoint |
| 5D-6 | cron-trigger | Orchestration | 10min/75s adaptive clock |
| 5D-7 | scheduled-recurrence | Orchestration | calendar + occurrence journal |
| 5D-8 | event-reactivate | Orchestration | the dormant-node wake |
| 5E-1 | journal-sink | Evidence | JSONL + sha256 — MANDATORY |
| 5E-2 | triplet-writer | Evidence | {Pattern, State, Evidence} or delete |
| 5E-3 | sqlite-sink | Evidence | WAL + IMMEDIATE |
| 5E-4 | replay-source | Evidence | covers-check-then-rerun |
| 5E-5 | source-discriminator | Evidence | `workflow/<name>/<node>` on every row |
| 5F-1..6 | composed boilerplates | — | deep-research / container-suite / wave-dispatch / compliance-monitor / pipeline-toolchain / audit-agent |

## 9C — THE MINIMAL WORKFLOW CONTRACT (the copy-paste envelope)
```jsonc
{ "meta": { "name": "", "tier": 1, "packaging": "tool",
            "output-contract": {} },
  "nodes": [ { "id": "", "type": "", "class": "" } ],
  "edges": [ { "from": "", "to": "", "via": "" } ],
  "journal": { "path": ".trident/workflows/{name}/{run-id}.jsonl", "sha256": true },
  "gates": { "input": [], "output": ["output-contract"] } }
```

## 9D — THE REAL PATHS (the substrates)
| Substrate | Path |
|---|---|
| This bible | `KNOWLEDGE_LIBRARY/Bibles/JSON_EVENT_SCRIPTING_BIBLE.md` |
| The event-hook canon | `KNOWLEDGE_LIBRARY/Bibles/CUSTOM_EVENT_HOOK_ENGINEERING_BIBLE.md` |
| The T.E.B. machine canon | `KNOWLEDGE_LIBRARY/Bibles/TEB_MACHINES_FOR_BEHAVIOR_ENGINEERING_T1.md` |
| The shadow-tool canon | `KNOWLEDGE_LIBRARY/Bibles/SHADOW_ENHANCED_TOOLS_BIBLE.md` |
| The pi-SDK agent canon | `KNOWLEDGE_LIBRARY/Bibles/SHADOW_AGENT_ENGINEERING_BIBLE.md` |
| The tool-chain canon | `KNOWLEDGE_LIBRARY/Bibles/T1_MULTI_TOOL_CHAIN_PIPELINE.md` |
| The reasoning wiring | `KNOWLEDGE_LIBRARY/Bibles/REASONING_TOKEN_CAPTURE_WIRING.md` |
| The wave-manager source (proven) | `Trident_Agent/Active_Projects/v4.4.2-paragon-wave-manager/src/tools/wave-*.ts` |
| The paragon engine (proven) | `.../src/paragon/` (core/ actuation/ capture/ config/) |
| The grok-build workflows (the shape-proof) | `github.com/xai-org/grok-build` → `crates/codegen/xai-workflow/` + `xai-grok-shell/src/session/workflow*/` |

## 9E — THE DOCTRINE QUOTES (verbatim, the law)
- "the regex is a mechanical DETECTOR only (the detection layer, never the decision layer)" — Warhead 9 / `TEB_MACHINES...md:36`
- "EITHER A LOUD FUCKING ERROR OR IT WORKS... DO NOT CREATE BULLSHIT FALLBACKS" — the operator, `SHADOW_ENHANCED_TOOLS_BIBLE.md` R-loud-fail
- "the firewall does not read the agent's reasoning — it evaluates the agent's number against the oracle" — `MPSE_ENHANCED_WAVE_GENERATE_SPEC.md:22`
- "the shadow generates what only a language model can generate; the lexicons detect what patterns can detect; the state machines decide what state can decide; the actors execute what agents can execute" — the fusion law, `SHADOW_ENHANCED_TOOLS_BIBLE.md:406`
- "yes and proper session scoping so concurrent tui sessions dont have a single shared global file. proper SQL dbs where relevant" — the operator, D5, `SPEC_PARAGON_WAVE_MERGE.md:19`
- "ALL of this data is in REASONING TOKENS... final messages has none of this" — the operator, the reasoning-stream ruling, `CUSTOM_EVENT_HOOK...md:116`
- "IF EXPLORE - ASSEMBLED BRIEF = PROMPTFILE --> DISPATCH IMMEDIATELY WITHOUT POLISH" — the operator, `SPEC_EXPLORE_MECHANICAL_DISPATCH.md:14` (the mechanical-first law: never pay the LLM for what composition derives)

## 9F — THE AUTHORING CHECKLIST (before any workflow ships)
- [ ] the discovery probe ran; every event type is empirical (never guessed)
- [ ] every node has id/type/class; every type is registered
- [ ] the tier is declared and TRUE (no generation in tier 1)
- [ ] every generation node is bracketed (in-gate + out-gate + repair≤2 + confidence-floor)
- [ ] every decision node fails INCONCLUSIVE, never silently passes
- [ ] parallelism is allSettled; 429 exiles; retries classified
- [ ] the journal path is declared; every node writes with a source discriminator
- [ ] the output-contract is a JSON Schema; the terminal node binds to it
- [ ] the oracle rows exist for every numeric claim; free-text expectations REJECTED
- [ ] the battery pins the deterministic nodes; the container test proves the wiring; the replay proves the determinism

## 9G — THE JESL ↔ EFFECT LAW TABLE

Every JESL law has an Effect twin — the twin is the `S8` ripgrep + `@effect/language-service diagnostics` target; a missing twin is a second runtime (Warhead 10).

| JESL law | Effect twin | Enforcement — what the check reads |
|---|---|---|
| 1A Separation (detector / decider / generator) | E8 Separation (`detect` = pure fn / cheap `Effect`; `decide` = deterministic `Effect` fail=`INCONCLUSIVE`; `generate` = `Activity` bracketed) | `EffectLsp` family map; `P3-6`/`P3-7`; `STTGF` — detector never decides |
| 1B Journal (evidence is truth) | E5 Activity (`Activity` *is* the write; `covers()` replays receipt) + `Journal` service | `journal` `sha256` chain; `S9` second-run invoke `0` |
| 1C Event-feedback (closed loop) | `EventBus` (`EventBus.subscribe` → write channel; one bus, many types) | `RING_CAP` 50; `2E.3` `event-filter`/`capture-engine` rows |
| 1D Loud-fail (no fabricated success) | `Schema.TaggedError` + `E2` (`A`/`E`/`R`) + `StructuredEnforcementError` on `DENY` | `P3-12`; `floatingEffect` — loud `ready:false` only |
| 1E Schema-gate (validate at authoring) | E4 Schema-gate (`Schema.decodeUnknown(WorkflowDoc)` BEFORE any fiber) | `preferSchemaOverJson`; unknown `"type"` → `[JESL UNKNOWN-NODE]` |
| 1F Concurrency (parallel by default) | E6 Fiber (`Effect.forEach` `concurrency: 15` + `Exit`/`partition`; NEVER `Promise.all` in `core`) | `Effect.forEach` + `S8` `asyncFunction` ban; `P3-5`/`5K-5` |
| 1G Portability (registry contract) | `Layer`-swapped caps (`Context.Service`); `NodeRegistry` append-only | `2E.4` drivers; `S8` `nodeBuiltinImport` ban; no `"type"` rename |
| 1H Oracle (pre-registered numbers) | `oracle-gate` as `Effect.sync` (operators `eq/ge/le/ne/contains/matches`) | `MPSE:117-125`; firewall reads NUMBER vs oracle, never prose |
| 1I Lowest tier (mechanical beats LLM) | E9 Tier + `E9` cost (`Tier 1` = no `llm`/`subagent` in `R`; bracketed or refused) | `[JESL TIER-VIOLATION]` / `[JESL UNBRACKETED-GENERATION]`; `P3-10` |

**THE LAW OF THE TABLE:** a row is green only when its Effect twin's ripgrep + diagnostics row is green (`S8`). The table is the `2E.5`/`2E.7`/`2E.8` shortcut for the nine-questions gate.

# VERSION HISTORY

| Version | Date | The delta |
|---|---|---|
| v1.0 | 2026-09-01 | The first canon. The three tiers formalized (mechanical tools / embedded agent systems / the portable library). The grammar (workflow schema + the 20-kind registry + the Rhai↔JSON correspondence). The 42-entry catalog (36 micro: 9 Event + 8 Decision + 6 Generation + 8 Orchestration + 5 Evidence; + 6 composed boilerplates). The 9 JESL laws. 10 correct/wrong pairs. 5 procedures. 26 troubleshooting rows. Grounded on: the grok-build workflows extraction (xai-workflow engine.rs 1954L / host.rs / journal.rs / deep_research.rhai 585L — cloned HEAD bb7f39d5), the v4.4.2 trio meta-context wave (5 explore returns: wave-manager architecture, paragon algorithms, the three projects' build histories), and the six sibling bibles. The schema/registry/runner are THIS BIBLE'S SPEC — `SPEC-GATED` until the runner passes its container test. |

## THE STATUS LEDGER (what is proven vs what this bible specifies)

| Component | Status |
|---|---|
| Every Event/Decision/Evidence template's substrate | **PROVEN** (the event hook, the T.E.B machines, the capture engines, the journals — all live in the wave-manager/paragon/Hive builds) |
| Every Generation template's substrate | **PROVEN** (the pi-SDK shadow agent, the 7-stage backend — 3 shipped references) |
| The JESL workflow schema + node-kind registry + `trident-workflow-run` | **SPEC** (this bible) — the build order: schema → registry resolvers → the runner → the three proving workflows (deep-research, container-suite, wave-dispatch) → the container test |
| The oracle-gate | **SPEC'D at DPL1** (`MPSE_ENHANCED_WAVE_GENERATE_SPEC.md` — the dedicated agent builds it; "DO NOT EDIT THE WAVE MANAGER CODE. WRITE THE SPEC AND I WILL HAND IT TO THE DEDICATED AGENT") |

| v1.2 | 2026-09-02 | EFFECT PHASE 2 — PART 2E EFFECT KERNEL bind (2E.0–2E.12). Adds: §0.2 `Effect`/`@effect/language-service`/`@effect/workflow` grounding rows + `PART 2E` pointer; §1F `Effect.forEach`/`Exit` twin; §2.5 purity = zero host imports AND zero raw Promise I/O; `PART 2E — EFFECT KERNEL (PHASE 2)` — the module→service map (2E.1), `NodeImpl`/`NodeHandle` as `Effect` (2E.2), registry `Effect` shape column covering every kind (2E.3), caps=`Layer` + `CliLive`/`OpenCodeLive`/`TestLive` (2E.4), `Effect` readiness loop `concurrency: 15` (2E.5), durable vs ephemeral `Workflow.make` rule (2E.6), `Policy`+`CurrentProgram`+`causationId` authorization (2E.7), PBA/PTA/LSP three scanners on one `EventBus` (2E.8), family `5K` kernel templates (8) (2E.9), `P3-1..12` correct/wrong (2E.10), `P7-E1..E6` procedures (2E.11), grounding + `SPEC`-until-container ledger (2E.12); `9G` JESL↔Effect law table. Canon line added: "JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime." Tokens stable — `[JESL CAP-UNBOUND]` = missing `R` (`D10`). `SPEC` until `S8`/`S9` container rows (`P7-E6`). |

| v1.1 | 2026-09-01 | THE LIBRARY REFRAME (the operator's correction): "the 2 examples are USE CASE TARGETS of the FULLY PRODUCTION GRADE LIBRARY — THROW THAT IN THE TRASH AND WIRE THE LIBRARY PROPERLY." The library IS the product; the tiers became use-case families A/B + C (the skill-launcher, new). Added §2.5 THE LIBRARY ARCHITECTURE (pure core / drivers / the capability model `[JESL CAP-UNBOUND]` / the package layout) and §2.6 THE EXECUTION SEMANTICS (dataflow readiness — channels + the bus as the ONE model unifying DAG pipelines and reactive scripts; the journal's three roles: evidence/replay/resume). Registry +5 execution kinds (shell-exec, python-exec, http-request, file-io, prompt). New 5F-7 skill-launcher boilerplate (SKILL.md + workflow.json + ctx.json = an ephemeral tool launcher; `prompt.ask-launcher` makes the launching agent a node). New 5G family — the execution templates (5). Catalog now 41 micro + 7 composed = 48 entries. |

**THE CANON LINE:** this bible composes ONLY proven machinery into a portable grammar. The grammar itself ships when its runner proves in the container — until then every template's provenance is the substrate, never the spec.

**— END OF THE JESL BIBLE —**
