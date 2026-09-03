**Target:** JESL — the JSON Event Scripting Library (pure core + node set + CLI + drivers + packager)
**Generated:** 2026-09-01 · DPL1, skill-authored (trident-deep-planning Layer 1 contract)
**Trident Version:** the v4.4.2-paragon-wave-manager lineage (source head `14e45a5e`, battery 911/2, tsc 0)
**Status:** `PLANNING`
**Version:** v1.1-E — PHASE 2 slices S1E–S8L + criteria 13–16 (additive Effect-kernel surgery per `JESL_EFFECT_PHASE2_DPL1_SPEC.md` §2.2, 2026-09-02)
**Artifact Type:** `BUILD_SPEC (Layer 1 Prompt)`
**Discovery:** `ENABLED` — grounded in the 2026-09-01 research wave: the xai-org/grok-build clone (HEAD `bb7f39d5`), the v4.4.2 trio meta-context (5 explore returns), and the 6 sibling bibles. Measured numbers in §3.
**Companion canon:** `KNOWLEDGE_LIBRARY/Bibles/JSON_EVENT_SCRIPTING_BIBLE.md` v1.1 (989L — the pattern library this spec implements)

## DISCOVERED INTELLIGENCE

**Languages:** TypeScript (bun runtime, ESM, zod) — matching the v4.4.2 plugin tree; the grok-build reference is Rust (architecture-only reference, no code reuse).

**Entry Points (the proven machinery the node set binds):**
- opencode 1.14.51 plugin surface: the `event` hook (the single bus), `tool.execute.before/after`, `chat.message`, session lifecycle
- `src/tools/wave-*.ts` (the wave manager, 13 modules) — the tracker/registry/journal/status patterns
- `src/paragon/` (the behavior engine, 9 core files) — the classifier/synapse/machine/actuation math
- the pi-SDK shadow agent harness (`@earendil-works/pi-agent-core` + `pi-ai`) — the embedded-agent substrate

**Patterns:** spec-file-only inputs validated by floors (`wave-spec.ts:82`) · append-only sha256 journals (grok `journal.rs` 681L, `Journal::covers()`) · state machines with fail-state INCONCLUSIVE · gates that throw structured named errors (`formatDiagnostics`) · `Promise.allSettled` bounded concurrency (15, 1-3s stagger) · retry classification (429→exile / 5xx→retry / else→fall) · capability-less dual-mode prompting (the ask-launcher mechanic, new in this spec).

**Failures (the traps this design exists to avoid):** the event-type guess (filter never fires) · the unbracketed generator (hallucination ships) · the prose-judged run (2,614-finding false-positive class) · `Promise.all` wave-kill · the 429 retry storm · the fabricating fallback (FALSE SUCCESS) · the wrong API family (muse 500-forever) · global state cross-session contamination · the unbounded repair loop · the 712s unbounded-thinking autopsy.

**Decisions (locked):** D1 the library is the product — the mechanical-tools/embedded-agents/skills asks are USE-CASE FAMILIES of it · D2 core is pure (zero host imports); hosts are drivers · D3 effects are capability interfaces bound by drivers (`[JESL CAP-UNBOUND]` loud) · D4 ONE execution semantic: dataflow readiness over named channels + the bus · D5 the journal is the run (evidence + replay + resume in one artifact) · D6 one document emits three targets (plugin tool / tool-chain / skill directory) · D7 append-only registry + versioned doc schema = the compat contract · D8 SPEC-ONLY: no implementation is authorized by this artifact.

**Warheads in force:** Warhead 9 (ISE — detectors never decide), Warhead 10 (loud-fail-or-clear-pass), Warhead 11 (allSettled intelligent-async), Warhead 13 (evidence before claims), Warhead 18 (basic-fucking-logic: no backward-compat layers, simplest implementation, no unrequested fallbacks).


# §1 PROBLEM STATEMENT

**FROM THE REAL REQUIREMENTS (the operator's verbatim asks, 2026-09-01):**

1. *"building mechanically intelligent tools purely w/ json event scripting + hook engineering"*
2. *"building simple implementations of complex embedded agent systems (shadow agnet/pi sdk) via json scripting + tool chains"*
3. *"json itself as building blocks for agent/event systems and tool machinery. like a portable library in a programming language for our engineering process of 'JSON Event Scripting Library' that has a full set of micro templates and boilerplates for all the cmmon scenarios in tool/system engineering and agent systems"*
4. *"skill tools - skills that can self contain JSON scripts so the skill itself becomes an ephemeral tool launcher pre loaded w/ context + prompt + script json to execute via bash/shell/python/etc"*
5. *"LIBRARY ARCHITECTURE IS FUNDAMENTAL"* — and the correction: *"the 2 examples i gave are USE CASE TARGETS OF THE FULLY PRODUCTION GRADE LIBRARY. THROW THAT IN THE TRASH AND WIRE THE LIBRARY PROPERLY"*
6. *"dont build it just spec it"* — **this artifact is the spec. No implementation is authorized by it.**

**THE PROBLEM, FROM FIRST PRINCIPLES:**

Every system in this workspace that has "a clear algorithmic workflow" is today HARDCODED TypeScript: the wave manager is 13 modules and `wave-dispatch.ts` alone is 1,906 lines; the container-test tool is 159,195 bytes; the paragon engine is 9 core files of state-machine math; the shadow-agent harness is ~1,200 lines of pi-SDK wiring. Each is proven — and each is UNREACHABLE to anyone who is not a TypeScript engineer writing a new plugin build. grok-build proved the alternative macro shape at xAI scale: workflows as SCRIPTS (their Rhai) + an engine + a host-IPC contract + a journal — a researcher authors a workflow without writing Rust.

**THE GAP:** this workspace has no production-grade equivalent. It has the patterns (six bibles), the proven machinery (the v4.4.2 tree), and the shape-proof (grok-build) — but no LIBRARY that turns tool/system/agent engineering into authoring declarative JSON documents that execute on proven machinery, portable across hosts (plugin, bash CLI, python-called SDK, cron, watcher), with authoring-time validation, deterministic replay, and a micro-template catalog.

**THE PRODUCT:** JESL — one library. Pure core (schema, graph, bus, channels, executor, journal, registry, capability interfaces) + node modules (the template catalog as code) + drivers (opencode, CLI, SDK, watcher, cron) + a packager (tool / tool-chain / skill emitters). The three use-case families (mechanical tools, embedded agents, skill tools) are compositions against it — NOT separate systems.


# §2 ARCHITECTURE

## 2.1 THE MACRO SHAPE (core / drivers / capabilities)

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

## 2.2 THE CORE MODULES (each one's contract)

| Module | The contract |
|---|---|
| `core/schema.ts` | the zod workflow-doc schema (`meta/nodes/edges/journal/gates`) + cross-validation: unknown-kind, dangling-edge, cycle, tier-mismatch, unbracketed-generation, missing-contract — each a named `[JESL ...]` diagnostic with field + remedy (the `formatDiagnostics` pattern) |
| `core/graph.ts` | doc → DAG: readiness sets (a node's inbound channel set), cycle detection, topological feasibility, parallel-batch partitioning |
| `core/bus.ts` | pub/sub: `emit(type, payload)` / `on(pattern, handler)` — the ONE event stream; drivers push into it; subscriptions write channels |
| `core/channels.ts` | the dataflow store: named channels written by edge `via`; the readiness wake logic |
| `core/executor.ts` | the readiness loop: fire all-ready nodes as one bounded `allSettled` batch (cap 15, stagger 1-3s); per-node timeout + retry class; the terminal output-gate check |
| `core/journal.ts` | append-only JSONL, sha256-chained rows (`{ts, run, node, kind, verdict, evidence, source}`); `covers()` replay gate; context serialization for resume |
| `core/registry.ts` | `Map<kind, NodeImpl>` — append-only; each entry declares family/class/required-capability/input-output channel contract |
| `core/caps.ts` | the capability INTERFACES: `shell`, `llm`, `tool`, `subagent`, `http`, `fs`, `emit` — unbound stubs; drivers bind implementations |
| `core/errors.ts` | the named vocabulary: `[JESL UNKNOWN-NODE]` `[JESL CYCLE]` `[JESL TIER-VIOLATION]` `[JESL UNBRACKETED-GENERATION]` `[JESL CAP-UNBOUND]` `[JESL ORACLE-MISSING]` — every throw structured `{code, node, field, expected, actual, remedy}` |

**THE NODE CONTRACT (every kind implements it):**
```ts
interface NodeImpl {
  kind: string
  family: 'event' | 'decision' | 'generation' | 'orchestration' | 'evidence' | 'execution'
  requiresCaps?: CapsKey[]
  setup(spec: NodeSpec, ctx: RunContext): Promise<NodeHandle>
}
interface NodeHandle {
  invoke(input: ChannelData): Promise<NodeResult>   // pull: graph executor calls
  subscriptions?(): BusSub[]                         // push: bus events wake it
}
```

## 2.3 THE EXECUTION SEMANTICS (dataflow readiness — the one model)

Not step-lists, not event-handlers — ONE semantic. Every edge names a channel; a node is READY when all inbound channels are written; the executor fires ready nodes as one `allSettled` batch; outputs write channels waking the next set; bus subscriptions are the second wake source. A DAG pipeline and a reactive script are the same machine; one document can be half each, no seams. Seeds: argv (`--in`), a hook event, a file, a cron tick. Terminal: the output gate validates `meta.output-contract` → verdict + journal path.

## 2.4 THE NODE SET (the catalog as code — v1 target 41 kinds → shipped in slices)

- **Deterministic (no caps):** `event-filter` `capture-engine` `machine` `gate` `oracle-gate` `circuit-breaker` `state-machine` `journal-sink` `triplet-writer` `sqlite-sink` `replay-source` `pipeline` `parallel` `retry-chain` `fallback-chain` `pause` `cron-trigger` `event-reactivate`
- **Execution (cap-bound):** `shell-exec` `python-exec` `http-request` `file-io`
- **Generation:** `prompt` (dual-mode: `call-model` via the `llm` cap \| `ask-launcher` — NO cap, the question returns through the tool result and the launcher's answer writes the channel) · `subagent-dispatch` (via the opencode driver's wave-manager cap) · `shadow-agent` (the full pi-harness, opencode driver only)

## 2.5 THE DRIVERS

| Driver | Binds | Surface |
|---|---|---|
| `opencode` | `tool` (plugin tools via `input.client`), `subagent` (wave-manager), `llm` (the provider chain), `fs` (scoped) | hooks→bus bridge; the `jesl-run`/`jesl-status` tools; runs docs in-process |
| `cli` | `shell`, `fs`, `http` (and `llm` if a key is present) | `jesl run|validate|replay|emit` — the bash/python surface; THE skill executor |
| `sdk` | caller-provided | `import { run, validate, replay } from 'jesl'` — node/python-via-bun callers |
| `watcher`/`cron` | any | long-running drivers re-seeding runs on file/clock events |

## 2.6 THE PACKAGER (one document, three emission targets)

`emit tool` → a single opencode tool wrapper (frozen front contract, silent execution) · `emit chain` → N generated tools + a module context + gatekeeper args between them (the T1 form) · `emit skill` → the skill directory (SKILL.md + workflow.json + ctx.json + assets/) = the ephemeral tool launcher; runs via `bunx jesl run ...` or the in-process `jesl-run` tool. The `prompt.ask-launcher` mode makes the skill collaborative: the launching agent IS a node.

## 2.7 THE COMPAT CONTRACT

Doc schema is versioned (`$schema: "trident-workflow-v1"`); the registry is append-only (kinds are never renamed or removed — new kinds only); a v1 document MUST run unchanged on later registries. Breaking the compat contract is a release-blocking defect.


## 2.8 THE DATA CONTRACTS (the shapes every module agrees on)

**THE RUN CONTEXT (serializable — the resume artifact):**
```ts
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
```

**THE NODE RESULT (every invoke returns exactly this):**
```ts
interface NodeResult {
  verdict: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'READY_FALSE'
  outputs?: Record<channelName, unknown>   // written to channels on PASS
  error?: JeslError                         // structured, on non-PASS
  evidence: { pattern: string; state: string; anchor: string } // the triplet
  timing: { startMs: number; endMs: number }
}
```

**THE JOURNAL ROW (one JSON line, sha256-chained to the previous):**
```json
{ "seq": 7, "ts": 1788299000000, "run": "wf-...", "node": "verify",
  "kind": "gate", "verdict": "PASS",
  "evidence": { "pattern": "...", "state": "...", "anchor": "file:line" },
  "source": "workflow/<name>/<node>", "prev": "<sha256>", "self": "<sha256>" }
```

**THE CHANNEL PATH RESOLUTION:** node inputs/outputs reference channels by `$.name`; template fields (`${ctx.x}`) resolve from `ctx.json` merged with `--in`; reader fields (`$.output.stdout`) are optional-chained walks with `?? ''` defaults. Unresolved = the named `[JESL CHANNEL-UNSET]` at that node, LOUD.

**THE SEED SEMANTICS:** the driver seeds before the loop — CLI: `--in` JSON + argv → the `input` channel + `ctx.vars`; opencode: the triggering hook event → the bus + the `trigger` channel; watcher/cron: the file path / the tick → their channels. A doc with an unseedable entry channel reports `[JESL NO-SEED]` rather than hanging.

**THE BUS PATTERNS:** subscriptions are glob patterns over `type` (`tool.call.*`); a handler runs in its own try/catch (the observer law); a handler may write channels (waking graph nodes) but NEVER mutates the event. Detach on terminal — no leaked subscriptions.

## 2.9 EFFECT KERNEL (PHASE 2)

*Added v1.1-E per `JESL_EFFECT_PHASE2_DPL1_SPEC.md` §2.2 — Effect-TS becomes the only execution kernel. JESL stays the authoring surface (JSON graph). Effect runs the graph. This section states the Phase-2 contracts the implementation wave (§5.2 S1E–S8L) enforces. Nothing in §2.1–§2.8 is rewritten — this section upgrades §2.2's `NodeImpl.invoke` Promise and §2.8's `caps: BoundCaps` to their Effect forms; see THE RUN CONTEXT UPGRADE below.*

**THE LOCKED DECISIONS (D9–D15 — new in Phase 2, D1–D8 untouched):**

| Decision | The lock — one line |
|---|---|
| **D9** | Effect is the kernel — `NodeImpl.invoke` returns `Effect<NodeResult, JeslError, Caps>`, never raw `Promise` in core |
| **D10** | JESL caps ↔ `Context.Service` / `Layer`; `[JESL CAP-UNBOUND]` = missing `R` (unprovided service) |
| **D11** | Durable runs (`pause`, `ask-launcher`, generation replay, Poseidon/Warhead) use Workflow + Activity; ephemeral hook monitors stay scoped fibers |
| **D12** | Paragon PBA/PTA wrap existing math as services — never rewritten in `Effect.gen` |
| **D13** | Effect LSP is the artifact plane via CLI wrap + `patch` — never a tsserver fork |
| **D14** | Documentation change is additive — no JESL law, catalog entry, or fixture is deleted |
| **D15** | Schema dual-run — codecs migrate to Effect Schema WITHOUT renaming the `[JESL …]` error codes |

**THE EFFECT TYPE CONTRACTS (Phase-2 replacements of the Promise signatures):**

The kernel contract from `EFFECT_TS_RUNTIME_BIBLE.md` Part 2.2 (NodeImpl Effect edition) — `VERIFY-ON-INSTALL` the exact import path from the installed `effect` / `@effect/workflow` packages; the concept + shape below is load-bearing, the path is not invented here.

```ts
// Phase-2 edition — replaces §2.2's Promise return; drivers adapt Promises at the cap boundary only (Effect.tryPromise)
interface NodeImpl {
  kind: string
  family: "event" | "decision" | "generation" | "orchestration" | "evidence" | "execution"
  requires: ReadonlyArray<ServiceTag>          // which caps must be in R
  setup(spec: NodeSpec): Effect<NodeHandle, JeslError, RegistryDeps>
}
interface NodeHandle {
  invoke(input: ChannelData): Effect<NodeResult, JeslError, Caps>  // D9: never Promise in core
  subscriptions?: ReadonlyArray<BusSub>        // bus wake source, unchanged semantics
}
```

No `Promise` in the interface. `Effect<A,E,R>` — success in `A` (`NodeResult`), expected failure in tagged `E` (`JeslError`), services in `R` (`Caps`). Construction is not execution — a `const program = node.invoke(data)` is data until a driver does `Effect.runPromise(program.pipe(Effect.provide(DriverLive)))` at exactly one edge (E1/E10).

**THE RUN CONTEXT UPGRADE (Phase-2 shape — supersedes §2.8's `caps: BoundCaps`):**

Phase-1 §2.8 declares `caps: BoundCaps` — "the driver's bound implementations" (a bag of functions). Phase 2 UPGRADES that field per `JESL_EFFECT_PHASE2_DPL1_SPEC.md` §3 (lines 165–178) — caps are no longer a bag of functions, they are the provided `Context` (`R`), bound by driver Layers. `vars` stay data. `channels`/`journal`/`bus` become kernel services.

```ts
// Phase-2 edition — cite: JESL_EFFECT_PHASE2_DPL1_SPEC.md §3 (165–178) + EFFECT_TS_RUNTIME_BIBLE.md 2.2 kernel services
interface RunContext {
  runId: string
  doc: WorkflowDoc
  channels: Channels          // service — Ref/SubscriptionRef of named values
  journal: Journal            // service — sha256 chain + covers()
  bus: EventBus               // service — emit/on/detach
  caps: Context               // R — the provided Context (D10); was BoundCaps in §2.8 — UPGRADED, not stacked
  clock: Clock                // Clock service — wall waits use Clock, synapse decay still uses seq (P3-8)
  budget: { deadline: Duration; maxNodesFiring: 15 }  // Duration, not deadlineMs — VERIFY-ON-INSTALL
}
```

RECONCILIATION NOTE: §2.8's `RunContext` is FROZEN (not edited). The reconciliation lives here: `caps: BoundCaps` → `caps: Context` is a Phase-2 replacement that S1E enforces when it replaces Promise assumptions inside S1 — there is no second executor (E10). A node whose required service is absent from the provided Layer fails `[JESL CAP-UNBOUND]` (D10) — LOUD, no artifact.

**THE ERROR VOCABULARY AS TaggedError (D15 — tokens NEVER renamed):**

Each `[JESL …]` code becomes a `Schema.TaggedError` whose `code` field PRINTS the token — existing fixtures keep passing byte-for-byte (authoring still refuses with `[JESL …]` tokens; codecs migrate to Effect Schema without renaming):

| Token (printed in `code`) | Schema.TaggedError class | `code` field prints |
|---|---|---|
| `[JESL UNKNOWN-NODE]` | `JeslUnknownNode` | `"[JESL UNKNOWN-NODE]"` |
| `[JESL CYCLE]` | `JeslCycle` | `"[JESL CYCLE]"` |
| `[JESL TIER-VIOLATION]` | `JeslTierViolation` | `"[JESL TIER-VIOLATION]"` |
| `[JESL UNBRACKETED-GENERATION]` | `JeslUnbracketedGeneration` | `"[JESL UNBRACKETED-GENERATION]"` |
| `[JESL CAP-UNBOUND]` | `JeslCapUnbound` | `"[JESL CAP-UNBOUND]"` |
| `[JESL ORACLE-MISSING]` | `JeslOracleMissing` | `"[JESL ORACLE-MISSING]"` |
| `[JESL CHANNEL-UNSET]` | `JeslChannelUnset` | `"[JESL CHANNEL-UNSET]"` |
| `[JESL NO-SEED]` | `JeslNoSeed` | `"[JESL NO-SEED]"` |

Pattern (EFFECT_TS_RUNTIME_BIBLE.md 5K-2 — `VERIFY-ON-INSTALL` the v3/v4 `Schema.TaggedError` surface):

```ts
class JeslCapUnbound extends Schema.TaggedError<JeslCapUnbound>()("JeslCapUnbound", {
  cap: Schema.String, node: Schema.String
}) {}
// throw shape: { code: "[JESL CAP-UNBOUND] llm", node, field, expected, actual, remedy } — never throw new Error(string)
```

Every throw is structured `{code, node, field, expected, actual, remedy}` per `core/errors.ts`'s contract. Each new MUST/NEVER maps to a diagnostic token — failure mode is LOUD.

**THE DRIVER LAYERS (D10 — a driver is a Layer composition):**

From `EFFECT_TS_RUNTIME_BIBLE.md` Part 2.5 — concept + names below are load-bearing; `Layer.mergeAll` / platform package paths `VERIFY-ON-INSTALL` against the installed `effect` + `@effect/platform-node` (or bun) packages.

```
CliLive      = Shell.layer + Fs.layer + Http.layer + Journal.file
OpenCodeLive = CliLive + ToolClient.layer + Subagent.layer + Llm.layer + Hooks.bus
TestLive     = TestClock + InMemoryJournal + ScriptedToolkit + MemoryFs
```

A doc that only needs `shell`+`fs` runs on `CliLive`. A doc declaring `llm` validates everywhere and dies `[JESL CAP-UNBOUND]` on `CliLive` — loud, NO output artifact (S3). `Effect.runPromise` / `runFork` live ONLY at the driver edge (`cli/main`, the hook body) — never inside core or nodes (E10 `runEffectInsideEffect`).

**THE DURABLE RUN (D11 — Workflow.make for JeslRun):**

```ts
// From EFFECT_TS_RUNTIME_BIBLE.md 2.4 — Workflow.make shape; VERIFY-ON-INSTALL against @effect/workflow (v4)
const JeslRun = Workflow.make({
  name: "JeslRun",
  payload: { docHash: Schema.String, seed: Schema.Unknown },
  success: RunReceipt,
  error: JeslError,
  idempotencyKey: ({ docHash, seed }) => `${docHash}:${hash(seed)}`  // docHash+seed
})
```

Workflow is MANDATORY when the run must survive process death: `pause`, `ask-launcher` (`DurableDeferred`), generation replay (do not re-pay the LLM), Poseidon phases, WarheadRun waits. Ephemeral hook monitors stay scoped fibers. Each effectful node = one Activity named `node:<id>` — channel math between Activities is deterministic replay fodder (`journal covers + invoke counter = 0` on second run = criterion 15). `Workflow.make` / `Activity.make` / `DurableDeferred` surfaces `VERIFY-ON-INSTALL`.

**THE CANON LINE:** JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime.

# §3 DISCOVERY INTELLIGENCE (measured — nothing estimated)

**The grok-build reference (cloned 2026-09-01, HEAD `bb7f39d5`, shallow):**
- `crates/codegen/xai-workflow/src/`: engine.rs (the Rhai sandbox executor), host.rs (the 11-variant `WorkflowHostRequest` IPC), journal.rs (681L — JSONL + sha256 request hashing, `covers()` replay gate), meta.rs (the `let meta` extractor), run.rs (49L — `PauseKind`/`WorkflowOutcome`), validate.rs (302L — dry-run validator)
- `deep_research.rhai`: 584L measured (`wc -l`) — the canonical scripted workflow (meta/phases/agents with output_schema/parallel/pause/complete)
- `xai-grok-shell/src/session/workflow/`: manager.rs (active runs, max 4 concurrent) · registry.rs (bundled+builtin+project+user `.rhai` discovery, dedupe by name) · store.rs (manifest+script+args persistence) · tracker.rs (run state) · host_service.rs (tokio dispatch to real agent backends) · schema_contract.rs (`<output-contract>` JSON-Schema wrapping)

**The proven v4.4.2 machinery (the node set binds these patterns; sizes from the explore wave's verified table):**
- `wave-dispatch.ts` 1,906L/120,894B · `wave-status.ts` 920L/47,992B · `wave-tracker.ts` 568L · `wave-registry.ts` 368L · `wave-db.ts` 195L · `wave-read.ts` 238L · `wave-spec.ts` 236L (the floors: mission/knownContext 200c, others 100c, position 50c) · `wave-pipeline.ts` 473L · `wave-planning-gate.ts` 181L · `wave-cron.ts` 553L (10min/75s adaptive)
- `aether/aether-agent.ts` 1,006L (chain v6: 3× go keys, STALL_MS 60s) · `aether-runner.ts` 935L (the 13-step pipeline) · `rpm-ledger.ts` (EXILE_MS 45s; nvidia 40/opencode 200/openrouter 20 RPM)
- `src/paragon/`: core/engine.ts 20,910B · core/machine.ts 10,466B · domain-trident.ts 34,846B · state.ts 15,483B (sizes from `ls -la` 2026-09-01)
- `container-test.ts` 159,195B; `ct-session-store.ts` 30,880B (the parts-derived read)
- Battery at head: 911 pass / 2 fail (2 pre-existing environmental wave-tracker tests) / 59 files, tsc 0 — measured in TESTING_LOG.md:84

**The canon (this spec's pattern source):** `JSON_EVENT_SCRIPTING_BIBLE.md` v1.1 = 989L + the v1.1 delta (~90L) — the 48-entry catalog (41 micro across 6 families + 7 composed). Siblings: CUSTOM_EVENT_HOOK_ENGINEERING_BIBLE (536L+ deep-dive), SHADOW_ENHANCED_TOOLS_BIBLE (3,000+L stated), TEB_MACHINES_FOR_BEHAVIOR_ENGINEERING_T1 (798L+), SHADOW_AGENT_ENGINEERING_BIBLE (1,170L+ read), T1_MULTI_TOOL_CHAIN_PIPELINE (844L measured), REASONING_TOKEN_CAPTURE_WIRING (243L measured).

**The runtime fact that forces the v2 event wiring:** opencode 1.14.51 emits `message.part.updated` with the part at `event.properties.part` (SDK `types.gen.d.ts:744`) — NOT the older `message.updated`/`info.parts` shape (the TEB v2 correction banner).

**Languages/stack locked:** TypeScript, bun, ESM, zod. No Rust. No grok code reuse — architecture correspondence only (§2 of the bible).


# §4 CORE INSIGHT

**The implementation must produce runtime-grade software that works correctly in a real runtime environment — not just code that compiles.** A workflow library that validates documents but jams mid-run, loses journal rows on crash, or silently skips unbound capabilities is worse than no library — it is a fabrication machine dressed as an orchestration engine.

**THE GOVERNING NON-NEGOTIABLES:**
1. **Error handling on every path** — every node invocation is wrapped; a node failure is a journaled `{ready:false}` row + the named error, NEVER a silent skip and NEVER a killed sibling (allSettled).
2. **Boundary validation at every edge** — the doc is validated at authoring (§2.2 schema), inputs are validated at seed (the `--in` JSON parses or LOUD), node outputs are validated against the node's declared channel contract, and the final output passes the output-contract gate before the run reports success.
3. **Resource cleanup** — timers cleared on run end (the cron/throttle nodes), child processes killed on timeout (shell-exec), the journal fd flushed per row (crash-safe append), the bus subscriptions detached on terminal.
4. **Side-effects-before-claims** — the run verdict is computed FROM the journal rows (the last gate reads the journal, counts node verdicts, and only then emits `"verdict":"PASS"`); prose never judges a run.
5. **The loud-fail law** — `[JESL CAP-UNBOUND]`, `[JESL TIER-VIOLATION]`, `[JESL UNBRACKETED-GENERATION]` are runtime refusals with structured payloads, and NO fallback ever produces a substitute artifact (the FALSE-SUCCESS ban).
6. **Determinism where declared** — a `tier:1` doc replayed on the same input reproduces byte-identical journal rows (sha256-chained); this is testable and therefore mandatory, not aspirational.

**WHY THIS SHAPE AND NOT ANOTHER:** the core is deliberately SMALL and BORING (~800L target: channels + readiness + journal) because every line of host-coupled intelligence in the core is a line that breaks portability; the nodes are THIN (one predicate or one capability call) because fat nodes are untestable; and ALL the intelligence lives in compositions — which is exactly why the same library serves a memory-safe read gate (3 nodes), an audit agent (6 nodes), and a skill launcher (a directory) without becoming three systems.


# §5 SCOPE (the loaded requirements)

**IN SCOPE (v1 — each slice independently shippable):**
1. Pure core: schema, graph, bus, channels, executor, journal, registry, caps, errors — zero host imports, headless-testable
2. The validation gate: all `[JESL ...]` diagnostics with field+remedy, exit non-zero on any
3. The dataflow executor: readiness sets, bounded allSettled batches (cap 15, stagger 1-3s), per-node timeout+retry-class
4. The journal: sha256-chained JSONL rows, `covers()` replay, context serialization for pause/resume
5. Deterministic node set (no caps): event-filter, capture-engine, machine, gate, oracle-gate, circuit-breaker, state-machine, journal-sink, triplet-writer, sqlite-sink, replay-source, pipeline, parallel, retry-chain, fallback-chain, pause, cron-trigger, event-reactivate
6. Execution node set (cap-bound): shell-exec, python-exec, http-request, file-io
7. The `prompt` node, dual-mode: `call-model` (llm cap) and `ask-launcher` (no cap — the launcher answers through the tool result)
8. The CLI: `jesl run|validate|replay|emit` with `--ctx` `--in` — the bash/python surface
9. The opencode driver: hooks→bus bridge, `tool`/`subagent`/`llm` cap bindings, the `jesl-run`/`jesl-status` tools
10. The packager: `emit tool` / `emit chain` / `emit skill` (the skill directory form: SKILL.md + workflow.json + ctx.json + assets/)
11. The fixture skills + fixture workflows (the three proving compositions: a mechanical gate, a bracketed audit, a skill launcher)
12. The headless battery (core, no container needed) + CLI e2e + the driver container test per §7
13. The compat contract: `$schema: trident-workflow-v1` versioned; append-only registry; v1 docs run on later registries

**OUT OF SCOPE (v1 — explicitly):**
- The `subagent-dispatch`/`shadow-agent` full pi-harness binding (driver stub + cap contract only; the harness integration is a v2 wave)
- The MPSE oracle-gate's full plan-parser (the node ships; the wave-plan integration rides MPSE's own spec)
- A GUI/graph editor; mermaid rendering of docs (the grok third_party trees stay unused)
- Any Rhai/JS embedded interpreter — the graph IS the language; embedded DSLs are banned by design (the Schema-Gate law)

**SLICE ORDER (each slice gates the next):** S1 core+validate headless → S2 CLI+execution nodes (skills work) → S3 opencode driver + deterministic plugin tools → S4 the prompt node + bracketed compositions → S5 packager emitters → S6 the §7 container battery + hardening.

## §5.1 THE SLICE GATES (each slice's done-when — mechanical, no slice skips its gate)

| Slice | Delivers | The gate (all mechanical) |
|---|---|---|
| **S1 — core headless** | schema/graph/bus/channels/executor/journal/registry/caps/errors + the unit battery | `tsc --noEmit` exit 0 · `bun test` 0 fail with unit coverage of: every `[JESL ...]` diagnostic (one bad-fixture unit each), the readiness loop (a 3-node diamond fires in 2 batches), the journal chain (rows hash-link; kill-safe append), `covers()` (a re-run replays, does not re-invoke) |
| **S2 — CLI + execution nodes** | the `jesl` bin + shell/python/http/file-io + the fixture set | criteria 3, 4, 8 pass on the host: the four bad fixtures refuse with their tokens; `mech-gate.json` runs to `"verdict":"PASS"`; the skill fixture runs via `bunx` |
| **S3 — opencode driver** | hooks→bus, `tool`/`fs` cap bindings, `jesl-run`/`jesl-status` tools | criterion 11 in the container: the tool surface lists `jesl-run`; a doc with a `tool-call` node executes against a real plugin tool; S7c's ask-launcher roundtrip completes |
| **S4 — the prompt node** | dual-mode prompt + the bracketed audit fixture | S3 + S6 scenarios pass; `needs-llm.json` under a keyless driver yields `[JESL CAP-UNBOUND] llm` with NO artifact |
| **S5 — the packager** | `emit tool/chain/skill` | criterion 9: the three emitted targets each re-validate (`jesl validate` exit 0) and the emitted skill RUNS (`bunx jesl run` exit 0) |
| **S6 — battery + hardening** | the §7 container run + crash/resume + the red-team pass | 7/7 §7 scenarios PASS with tokens in tool results · criterion 5 (replay determinism) · criterion 12 (kill -9 + replay) · the negative legs (clean runs produce ZERO spurious refusals) |

**THE SLICE LAW:** a slice that cannot demonstrate its gate does not merge — the next slice does not start on an unproven substrate (building on claims is banned; the wave-audit law).

## §5.2 PHASE 2 SLICES (the Effect-kernel namespace — S1E–S8L, appended; S1–S6 above are FROZEN)

*S1E–S8L are a SEPARATE namespace — S1–S6 above are load-bearing history and are never renumbered or rewritten. Phase-2 slices REPLACE Promise assumptions inside S1 rather than stacking a second executor — there is no async executor beside Effect, ever (E10). Per `JESL_EFFECT_PHASE2_DPL1_SPEC.md` §2.2 (lines 116–127).*

| Slice | Delivers | Gate (all mechanical) |
|---|---|---|
| **S1E** | core types are Effect; schema decode Effect Schema or Zod→Schema; zero `node:` imports; `it.effect` units | `tsc` 0; every `[JESL …]` fixture still emits the **same token strings**; readiness diamond test now `it.effect` |
| **S2E** | CLI driver = Layer (shell/fs/http); `runPromise` only in `cli/main` | criteria 3,4,6,8 still pass |
| **S3E** | OpenCode driver Layer; hook → EventBus Effect; `jesl-run` provides SessionLive | criterion 11 |
| **S4E** | `prompt.call-model` as Activity; ask-launcher as `DurableDeferred`; unbracketed still refused | S7 + no re-pay on replay of generation Activity |
| **S5E** | packager unchanged outputs; emitted skill still `jesl run` | criterion 9 |
| **S6E** | §7 battery + kill -9 resume via Workflow journal + `TestClock` unit for pause | 7/7 + criterion 12 |
| **S7P** | Paragon wrap: BehaviorEngine + ToolEngine Layers intercepting `tool.execute.before` | fixture: TEST_EVASION deliberation pre-arms bash deny |
| **S8L** | EffectLsp Activity + PTA layer `EFFECT_ARTIFACT_GATE` + `patch` in prepare | write `.ts` → diagnostics token in journal |

**THE PLACEMENT RULE:** Phase-2 slices REPLACE Promise assumptions inside S1 rather than stacking a second executor — there is no async executor beside Effect, ever (E10). If JESL core is not yet built, S1E's Effect replacement lands inside the S1 implementation rather than as a follow-on patch.

**THE SLICE LAW (Phase-2 namespace):** a slice that cannot demonstrate its gate does not merge — S1E–S8L start only after the S1 gate is conceptually honored; building on claims is banned (the wave-audit law).

# §6 SUCCESS CRITERIA (mechanical — every row command/ledger/eyes-checkable)

| # | Criterion | The verification command | PASS looks like |
|---|---|---|---|
| 1 | The core typechecks clean | `bunx tsc --noEmit` in `jesl/` | exit 0, zero errors |
| 2 | The headless battery is green | `cd jesl && bun test` | exit 0, 0 fail (deterministic core: schema/graph/executor/journal/replay units) |
| 3 | Validation refuses malformed docs | `jesl validate fixtures/bad-unknown-kind.json` etc. (one per diagnostic) | exit ≠ 0 AND the named `[JESL ...]` token in stderr, one per fixture |
| 4 | A valid deterministic doc runs headless | `jesl run fixtures/mech-gate.json --in fixtures/in.json` | exit 0; stdout JSON `"verdict":"PASS"`; journal row count == node count |
| 5 | Replay is byte-deterministic | run the tier:1 fixture twice; `sha256sum` both journals | the two row-hash chains IDENTICAL (`diff` empty) |
| 6 | The capability refusal is loud | run a doc with an `llm` node under a keyless CLI | `[JESL CAP-UNBOUND] llm` in the journal + stderr, exit ≠ 0, NO output artifact |
| 7 | Parallelism is real | run the 5-branch parallel fixture | journal shows overlapping execution windows (`overlapCount ≥ 1` field) AND all 5 verdict rows |
| 8 | The skill launcher works via bash | `bunx jesl run .opencode/skills/jesl-fixture/workflow.json --ctx ctx.json --in in.json` | exit 0 + the declared artifact on disk + stdout verdict JSON |
| 9 | The packager emits all three targets | `jesl emit skill|tool|chain fixtures/audit.json --out /tmp/out` | 3 directories, each containing the emitted artifact + the doc copy |
| 10 | The compat contract holds | validate a v1 fixture against the registry AFTER appending a new kind | still exit 0 (append-only proven) |
| 11 | The plugin driver loads | deploy to the container; `jesl-run` visible in the tool surface | the tool lists and executes the fixture doc in-process |
| 12 | The journal is crash-safe | kill -9 mid-run; restart via `jesl replay` | the journal has NO partial row (every line parses as JSON) and replay resumes from the last complete row |
| 13 | No raw `fetch`/`Date.now`/`node:fs` in `jesl/core` | ripgrep over `jesl/core` for the raw-runtime signatures | ripgrep empty |
| 14 | `effect-language-service diagnostics` on `jesl/core` = 0 errors at kernel severity | `effect-language-service diagnostics --project jesl/tsconfig.json` | CLI exit 0 |
| 15 | Replay of tier:1 fixture does not re-invoke shell Activity | run the tier:1 fixture twice with invoke counter on shell-exec | journal `covers` + invoke counter = 0 on second run |
| 16 | `layerinfo` on `CliLive` lists Journal, Fs, Shell | `effect-language-service layerinfo` on the CLI driver Layer | CLI output contains those names |

**THE VERDICT RULE:** a criterion passes ONLY on the observed command output — never on inspection, never on "should work". The §7 battery is the runtime proof of 4, 6, 7, 8, 11; criteria 1-3, 5, 9, 10, 12 are headless/CLI-checkable and MUST appear in the build's evidence ledger.


# §7 CONTAINER TEST PLAN (PLAN-FIRST — THE DEFINITION OF DONE)

**The evidence requirement:** every scenario's evidence = the journal file path + the CLI exit code + the stdout/stderr excerpt, recorded in `.trident/container-test-results.json` (per-scenario: passTokenMatch, failTokenAbsent, toolResultContext, verdict). A scenario is PASS only when the pass token appears IN A TOOL RESULT (exit code, stdout/stderr JSON field, or on-disk artifact content) — never in agent free text.

**The pass threshold: 7/7 scenarios PASS.** Extract this section verbatim into `.trident/test-plan.md` at build time.

### S1 — TOOLS (the CLI executes a valid document end-to-end)
- **Prompt:** `jesl run fixtures/mech-gate.json --in fixtures/in.json` in the test container.
- **Pass token:** `"verdict":"PASS"` present in the CLI stdout JSON AND exit code 0.
- **Fail token:** any stderr traceback OR `"verdict"` absent.
- **Evidence:** stdout excerpt + exit code + the journal path.

### S2 — BOUNDARY (malformed documents are refused at validation)
- **Prompt:** `jesl validate` on the four bad fixtures (unknown-kind / dangling-edge / cycle / tier-violation).
- **Pass token:** exit ≠ 0 AND the matching `[JESL UNKNOWN-NODE]` / `[JESL CYCLE]` / `[JESL TIER-VIOLATION]` token in stderr, one per fixture.
- **Fail token:** exit 0 on any bad fixture (`accepted-invalid-input`).
- **Evidence:** the four stderr excerpts + exit codes.

### S3 — ERRORS (an unbound capability fails LOUD, no fabrication)
- **Prompt:** run a doc containing an `llm`-requiring `prompt` node under the CLI with no key bound.
- **Pass token:** `[JESL CAP-UNBOUND] llm` in the journal row AND stderr; exit ≠ 0; NO output artifact written.
- **Fail token:** any substitute/fabricated output artifact on disk (FALSE SUCCESS).
- **Evidence:** the journal row + the artifact-dir listing proving absence.

### S4 — STATE (replay determinism + crash-safe journal)
- **Prompt:** run the tier:1 fixture twice; then `kill -9` a run mid-flight and `jesl replay` the journal.
- **Pass token:** the two journals' sha256 row-chain diff EMPTY; after kill -9, every journal line still parses as JSON and replay resumes from the last complete row.
- **Fail token:** hash mismatch OR a partial/unparseable row OR replay restarting from zero.
- **Evidence:** the `diff`/`sha256sum` outputs + the post-kill journal wc -l.

### S5 — CONCURRENCY (parallel nodes actually overlap; failures never kill siblings)
- **Prompt:** run the 5-branch parallel fixture where branch 3 is designed to fail (exit 1 shell node).
- **Pass token:** journal shows `overlapCount ≥ 1` (≥2 nodes with overlapping [start,end] windows) AND all 5 verdict rows present (4 PASS + 1 ready:false with the named error).
- **Fail token:** strictly sequential windows OR the failing branch's absence from the journal.
- **Evidence:** the journal rows with timestamps.

### S6 — INTEGRATION (the skill launcher, end-to-end via bash)
- **Prompt:** `bunx jesl run .opencode/skills/jesl-fixture/workflow.json --ctx .opencode/skills/jesl-fixture/ctx.json --in '{"topic":"..."}'`.
- **Pass token:** exit 0 + the skill's declared artifact exists on disk with the expected content + stdout carries the verdict JSON + the journal path.
- **Fail token:** missing artifact OR non-zero exit.
- **Evidence:** `ls` of the artifact + its head + the stdout excerpt.

### S7 — FIREWALL (the composition discipline is mechanically enforced)
- **Prompt:** `jesl validate` on (a) a tier:1 doc containing a `prompt` node; (b) a tier:2 doc whose `shadow-agent` node lacks both brackets; (c) inside the opencode driver, the `ask-launcher` roundtrip: the run pauses, the question surfaces in the tool result, a scripted answer completes the run.
- **Pass token:** (a) `[JESL TIER-VIOLATION]` in stderr; (b) `[JESL UNBRACKETED-GENERATION]` in stderr; (c) the completed run's journal shows the `prompt` node's row with the answer channel written.
- **Fail token:** either doc validating clean, OR the ask-launcher question never surfacing.
- **Evidence:** the two stderr excerpts + the roundtrip journal row.

**POST-BATTERY GATE:** all 7 PASS → the `SPEC-GATED` markers in the JESL bible's Status Ledger flip to `PROVEN` (the bible's canon-line law) and the library enters the workspace as the default authoring surface for tool/system/agent engineering.

## §7.1 THE FIXTURE SET (what the battery runs against — shipped with the build)

| Fixture | The doc | Exercises |
|---|---|---|
| `fixtures/mech-gate.json` | tier:1 — event-filter → gate(minChars) → triplet-writer → journal-sink; seed via `--in` | S1, S4 (the replay determinism target) |
| `fixtures/bad-unknown-kind.json` | a node with `"type": "print"` | S2 `[JESL UNKNOWN-NODE]` |
| `fixtures/bad-cycle.json` | a→b→c→a edges | S2 `[JESL CYCLE]` |
| `fixtures/bad-tier.json` | tier:1 + a `prompt` node | S2 `[JESL TIER-VIOLATION]` |
| `fixtures/bad-unbracketed.json` | tier:2 `shadow-agent` with no inbound gate | S2/S7 `[JESL UNBRACKETED-GENERATION]` |
| `fixtures/needs-llm.json` | a `prompt{mode:"call-model"}` node | S3 `[JESL CAP-UNBOUND] llm` |
| `fixtures/parallel-5.json` | 5 shell-exec branches, branch 3 exits 1 | S5 (overlap + the surviving siblings) |
| `.opencode/skills/jesl-fixture/` | SKILL.md + workflow.json (filter→shell→prompt{ask-launcher}→gate) + ctx.json | S6, S7c |
| `fixtures/audit.json` | the bracketed generator (input-gate→shell→prompt→schema-gate→floor→journal) | §6 rows 4/9; the `emit` target |

**THE FIXTURE LAW:** the fixtures are part of the deliverable (they are the executable documentation); they live in `jesl/test/fixtures/` and every §7 scenario names its fixture by path.


# §8 THE HANDOFF NOTE (SPEC-ONLY DIRECTIVE)

**The operator's directive (verbatim, 2026-09-01): "dont build it just spec it".**

This artifact is the SPEC. No implementation, no scaffolding, no `bun init`, no node modules, no container work is authorized by it. The build fires only when the operator explicitly green-lights it, at which point this DPL1 hands to the `trident-deep-planning` TOOL's L2/L3 or to a build wave as the mission source — per the skill's output protocol.

**The handoff chain (Phase 2 — supersedes the v1.0 chain):** this DPL1 → docs wave (Phase-2 §2.1–2.2) → operator read of PART 2E / §2.9 / §5.2 → operator go → implementation wave S1E…S8L → §7 + S8 + S9 (+ S10 if Paragon in-tree) → flip SPEC-GATED → PROVEN on the JESL grounding map AND the EFFECT-RT ledger.

**Companion artifacts:** `KNOWLEDGE_LIBRARY/Bibles/JSON_EVENT_SCRIPTING_BIBLE.md` v1.1 (the pattern library + the 48-entry catalog this spec implements) · the grok-build extraction (in the wave returns, /tmp/opencode/grok_repo) · the six sibling bibles (the substrate canon).

*— END OF THE DPL1 ARTIFACT —*
