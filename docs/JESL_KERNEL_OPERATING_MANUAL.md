# THE JESL KERNEL OPERATING MANUAL

> **WHAT THIS IS:** A step-by-step operating guide for the MacroKernel_Edition-v1.0 — the JESL (JSON Effect Scripting Language, per D26) kernel that runs Effect-TS workflow pipelines from JSON documents. Read this to USE the kernel. Read the ARCHITECTURE BIBLE to BUILD on it.
> **Status:** v1.0 — filled post-W10 from the source tree (every claim carries a file:line anchor into `jesl/`).

---

## THE ONE-LINE MODEL

Write a JSON file with your pipeline steps. The kernel validates it, runs each step on Effect-TS in dependency order, logs every result to a tamper-proof journal, and returns PASS or FAIL.



The canon line (bible 2E.0 :289): *JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime.*

---

## STEP 1 — AUTHOR A WORKFLOW DOCUMENT

A JESL workflow is a JSON document with this shape:

```json
{
  "$schema": "trident-workflow-v1",
  "meta": { "name": "my-pipeline", "tier": 1 },
  "nodes": [
    { "id": "check", "type": "gate",
      "config": { "asserts": [{ "path": "$.value", "op": "ge", "value": 10 }] }
    },
    { "id": "fetch", "type": "http-request",
      "config": { "url": "https://api.example.com/data", "method": "GET" }
    },
    { "id": "save", "type": "file-io",
      "config": { "path": "/tmp/output.json", "op": "write" }
    }
  ],
  "edges": [
    { "from": "check", "to": "fetch", "via": "approved" },
    { "from": "fetch", "to": "save", "via": "response" }
  ],
  "vars": { "value": 15 }
}
```

### THE SHAPE RULES (schema.ts:42-55)

- `$schema` MUST be `"trident-workflow-v1"` — the version lock (D7: v1 docs run on later registries forever)
- `meta.tier` MUST be `1` or `2` — tier 1 forbids generation nodes (prompt, shadow-agent, subagent-dispatch); tier 2 requires the `bracket` on generation nodes
- `meta.seed.channel?` — the declared entry channel; unseeded → `[JESL NO-SEED]`
- `nodes` MUST be a non-empty array (`Schema.NonEmptyArray`, schema.ts:50) — each node has `id` (unique), `type` (a registry-known kind), optional `config`, optional `class` (event|decision|generation|orchestration|evidence|execution), optional `on`, `retries` (class exile|retry|fall), `timeoutMs`, `bracket` (contract + repair.max≤2 + confidenceFloor), `oracle`
- `edges` connect nodes with `from`, `to`, `via` (the channel name — `via` is REQUIRED, EdgeDecl schema.ts:36-40)
- `vars` seed the channels with initial values (Record<string,string> — schema.ts:52)

### THE VALIDATION ORDER (validateDoc, schema.ts:89-205)

1. duplicate node id → `[JESL UNKNOWN-NODE]` field=nodes[id] (schema.ts:96-106)
2. unknown kind (via the injected `isKnownKind`) → `[JESL UNKNOWN-NODE]` field=type (schema.ts:109-120)
3. dangling edge endpoint (from/to) → `[JESL UNKNOWN-NODE]` field=edges[from]|edges[to] (schema.ts:122-144)
4. Kahn cycle detection → `[JESL CYCLE]` with the cycle path (schema.ts:146-179)
5. tier-1 + generation kind OR class=generation → `[JESL TIER-VIOLATION]` (schema.ts:181-204)

The CLI additionally enforces the unbracketed check (handlers.ts:63-83 + packager/shared.ts:30-54): tier-2 generation node without `bracket.contract` → `[JESL UNBRACKETED-GENERATION]`.

### THE NODE KINDS (what you can put in `type`)

**Deterministic (tier 1, no caps needed):**
`event-filter`, `capture-engine`, `machine`, `gate`, `oracle-gate`, `circuit-breaker`, `state-machine`, `journal-sink`, `triplet-writer`, `sqlite-sink`, `replay-source`, `pipeline`, `parallel`, `retry-chain`, `fallback-chain`, `pause`, `cron-trigger`, `event-reactivate`, `ratio-classifier`, `synapse`, `intent-classifier`, `escalation-memory`, `evidence-gate`, `layer-loader`, `math-eval`, `oracle-discharge`, `claim-gate`, `config-lock`, `workflow-machine`, `mpse-discharge`, `evidence-machine`, `audit-registry`

**Execution (cap-bound — needs the right driver):**
`shell-exec` (Shell), `python-exec` (Shell), `http-request` (Http), `file-io` (Fs)

**Generation (tier 2 only, bracketed):**
`prompt` (dual-mode), `shadow-agent`, `subagent-dispatch`

The full registry is `ALL_KINDS` at core/registry.ts:34-72 (37 entries incl. prompt). APPEND-ONLY: kinds are never renamed or removed (D7).

---

### NODE-KIND-DETAIL — the 16 implemented nodes

Every node returns a `NodeResult {verdict, outputs?, error?, evidence:{pattern,state,anchor}, timing}` (nodes/shared.ts:5-11). Verdicts: PASS · FAIL · INCONCLUSIVE · READY_FALSE. The 8 `[JESL ...]` tokens are REFUSALS only — a failed assertion is a FAIL verdict whose delta lives in `evidence.anchor`, never an invented 9th token (Law 5, gate.ts:49,63).

#### gate (nodes/gate.ts:33-69) — deterministic
- **What:** asserts conditions against inbound channel data.
- **Config:** `{ asserts?: [{ path: "$.x.y", op: "eq|ge|le|ne|contains|matches", value }], predicate?: (v) => boolean }` (gate.ts:6-7,40)
- **Reads:** each assert's `path` resolved against the inbound record via dot-path (`$.` prefix stripped, gate.ts:9-19).
- **Writes:** `{ "gate.<id>": true }` on PASS (gate.ts:68).
- **Failure modes:** path resolves to undefined → `Effect.fail([JESL CHANNEL-UNSET])` (gate.ts:59); assert false → FAIL, anchor `<id>:<path> expected=X actual=Y` (gate.ts:64); predicate false → FAIL, anchor `predicate expected=true actual=false` (gate.ts:50); no asserts → PASS with anchor `<id>:0` (gate.ts:54).

#### event-filter (nodes/event-filter.ts:12-47) — deterministic
- **What:** matches an inbound event against a glob pattern.
- **Config:** `{ pattern?|subscribe? (default "*"), filter? (substring), event?, expectedType? }` (event-filter.ts:19)
- **Reads:** the event from `config.event` or `inbound["event"]`.
- **Writes:** `{ matched: <event> }` on PASS (event-filter.ts:45).
- **Failure modes:** all mismatches are READY_FALSE (never FAIL): no event → `no-event`; glob miss → `DROPPED`; filter miss → `FILTERED`; expectedType mismatch → `MISMATCH` (event-filter.ts:25-43). Glob: `*` matches all; `prefix.*` matches the namespace (event-filter.ts:5-10).

#### capture-engine (nodes/capture-engine.ts:7-29) — deterministic
- **What:** captures the inbound payload into a module-level store.
- **Config:** `{ into?: "captured", key? }` (capture-engine.ts:14)
- **Reads:** payload = `inbound.event | inbound.input | inbound.data | first inbound value` (capture-engine.ts:16).
- **Writes:** `{ [<into>]: payload, count: n }` (capture-engine.ts:27). Store key = `<nodeId>:<into>` (capture-engine.ts:22) — persists across runs in-process (test access via `_captureStore`, capture-engine.ts:31).
- **Failure modes:** no payload → READY_FALSE `EMPTY` (capture-engine.ts:20).

#### pipeline (nodes/pipeline.ts:5-33) — deterministic
- **What:** threads the inbound value through transform steps.
- **Config:** `{ steps?: [{ fn?|value? }], fnA?, fnB? }` (pipeline.ts:12)
- **Reads:** `inbound.input | first inbound value`.
- **Writes:** `{ output: v, result: v }` (pipeline.ts:31).
- **Failure modes:** no input → READY_FALSE `NO_INPUT` (pipeline.ts:17). No steps/fns → value passes through unchanged (pipeline.ts:28).

#### parallel (nodes/parallel.ts:5-28) — deterministic
- **What:** fans items out through `Effect.forEach` at a bounded concurrency.
- **Config:** `{ items?, concurrency? = 15, delayMs? }` (parallel.ts:12)
- **Reads:** items from config or `inbound.items`.
- **Writes:** `{ results: [...], count: n }` (parallel.ts:26).
- **Failure modes:** empty items → PASS `EMPTY` with `results: []` (parallel.ts:18). NOTE: the per-item effect is identity (+ optional `Effect.sleep(delayMs)`) — real work arrives via subgraphs feeding each item; this node is the fan skeleton.

#### retry-chain (nodes/retry-chain.ts:5-46) — deterministic
- **What:** retries an effectful function up to maxRetries.
- **Config:** `{ maxRetries? = 2, failTimes? = 2, fn?: (attempt) => Effect, shouldFail?: (attempt) => boolean }` (retry-chain.ts:12)
- **Reads:** nothing from inbound — the fn carries the work.
- **Writes:** `{ result?, attempts: n }` (retry-chain.ts:24,38).
- **Failure modes:** exhausted (attempt > maxRetries) → FAIL `EXHAUSTED`, error `RETRY_EXHAUSTED` or the last fn error (retry-chain.ts:44).

#### fallback-chain (nodes/fallback-chain.ts:5-36) — deterministic
- **What:** tries primary, falls back on failure (SAME-ARTIFACT class, Law 7).
- **Config:** `{ primary?|primaryShouldFail?|primaryValue?, fallback?|fallbackValue? }` (fallback-chain.ts:12)
- **Reads:** `inbound.primary | inbound.fallback` as the default effects.
- **Writes:** `{ result, which: "primary"|"fallback" }` (fallback-chain.ts:22,31).
- **Failure modes:** both fail → FAIL `BOTH_FAILED` with the fallback error (fallback-chain.ts:34). No primary and no inbound → primary fails → fallback path.

#### pause (nodes/pause.ts:7-51) — deterministic
- **What:** suspends the run until resumed — the Deferred-based gate.
- **Config:** `{ key? = <id>, resumeValue?, immediateResume? }` (pause.ts:14)
- **Reads:** resume signal from `inbound.resume | inbound.signal`.
- **Writes:** `{ resumed: <value> }` (pause.ts:19,36).
- **Failure modes:** none — it SUSPENDS on `Deferred.await` until `pauseResume(key, value)` (exported, pause.ts:40-49) or an inbound signal completes the Deferred. `immediateResume: true` skips the wait (pause.ts:17-20). Module-level `_pauseMap` for test access (pause.ts:51).

#### journal-sink (nodes/journal-sink.ts:6-39) — deterministic
- **What:** writes the inbound payload as a journal verdict row.
- **Config:** none — payload from `inbound.data | payload | input | first` (journal-sink.ts:15).
- **Writes:** appends via `ctx.journal.append` when present, else the `Journal` Context.Tag via `Effect.serviceOption` (journal-sink.ts:17-35); outputs `{ written: payload, row }` (journal-sink.ts:37).
- **Failure modes:** none — append errors are caught and the row is `undefined` (journal-sink.ts:27,33). Always PASS.

#### triplet-writer (nodes/triplet-writer.ts:6-29) — deterministic
- **What:** persists an evidence triplet {pattern, state, anchor} to the journal.
- **Config:** `{ triplet?: {pattern,state,anchor} } | { pattern?, state?, anchor? }` or an inbound triplet (triplet-writer.ts:13-14).
- **Writes:** appends a verdict row carrying the triplet via the Journal service (triplet-writer.ts:20-25); outputs `{ triplet }` (triplet-writer.ts:27).
- **Failure modes:** missing any of the 3 fields → INCONCLUSIVE `no-triplet` (triplet-writer.ts:16-19).

#### state-machine (nodes/state-machine.ts:17-44) — deterministic
- **What:** advances a per-node-id state through a transition table.
- **Config:** `{ table?: Record<state, Record<event, next>>, initial? = "idle", event? }` (state-machine.ts:24); default table idle/running/paused/done/failed (state-machine.ts:7-13).
- **Reads:** event from config or `inbound.event | first inbound` (state-machine.ts:27).
- **Writes:** `{ state: next, prev: cur }` (state-machine.ts:39).
- **Failure modes:** no transition for (cur, event) → INCONCLUSIVE with anchor `<id>:<cur>--<event>` (state-machine.ts:32-35). `done` → PASS, `failed` → FAIL, other transitions → PASS (state-machine.ts:37).

#### math-eval (nodes/math-eval.ts:17-66) — decision
- **What:** evaluates a MathExpr IR — the JESL math contract (D8: JESL math nodes COMPILE to the 24-kind grammar).
- **Config:** `{ expr?: MathExpr, env? }` or inbound `expr|math` + `env` (math-eval.ts:24-26).
- **Service:** optional `MathExprService` (Context.Tag `jesl/MathExprService`, math-eval.ts:13-15) — when bound, evaluation delegates to it; `UNBOUND_SYMBOL` errors → INCONCLUSIVE (math-eval.ts:40).
- **Local fallback:** literal → value; add → left+right; var → env lookup (unbound → INCONCLUSIVE `UNBOUND_SYMBOL`); any other tag → 42 (math-eval.ts:46-58).
- **Writes:** `{ result, value }` (math-eval.ts:61).
- **Failure modes:** no expr → INCONCLUSIVE `NO_EXPR` (math-eval.ts:30). Full 24-kind evaluation lives in mpse/parser.ts + the oracle path — this node is the in-graph hook.

#### shell-exec (nodes/shell-exec.ts:15-61) — execution, requires `Shell`
- **What:** runs a shell command through the Shell cap.
- **Config:** `{ cmd?|command?, timeoutMs? = 5000, maxOutputBytes? = 1048576 }` (shell-exec.ts:7-8,24); cmd also from `inbound.cmd|command|input` (shell-exec.ts:25-26).
- **Writes (PASS):** `{ stdout, stderr, exitCode, output: stdout }` — stdout truncated to maxOutputBytes (shell-exec.ts:48,52).
- **Failure modes:** missing cmd → FAIL `missing-cmd` (shell-exec.ts:29); transport timeout → FAIL anchor `timeout:<ms>` (shell-exec.ts:43); non-zero exit → FAIL anchor `exit-<code>` with `{exitCode, stderr}` (shell-exec.ts:54).

#### python-exec (nodes/python-exec.ts:19-68) — execution, requires `Shell`
- **What:** runs Python code via `python3 -c '...'` through the Shell cap.
- **Config:** `{ code? | script? + args?, timeoutMs? = 10000, maxOutputBytes? }` (python-exec.ts:7-8,28); quotes escaped via `'\\''` (python-exec.ts:15-17).
- **Writes (PASS):** `{ stdout, stderr, exitCode, output }` (python-exec.ts:60).
- **Failure modes:** missing code/script/cmd → FAIL `missing-code` (python-exec.ts:40); timeout → FAIL `timeout` (python-exec.ts:53); non-zero → FAIL `exit-<code>` (python-exec.ts:61).

#### http-request (nodes/http-request.ts:12-52) — execution, requires `Http`
- **What:** performs an HTTP request through the Http cap.
- **Config:** `{ method? = "GET", url?, headers?, body? }` (http-request.ts:21); url also from `inbound.url` (http-request.ts:22-23).
- **Writes (PASS, 2xx):** `{ status, body }` — body truncated to 8192 chars if a string (http-request.ts:42,44).
- **Failure modes:** missing url → FAIL `missing-url` (http-request.ts:26); transport error → FAIL with truncated message (http-request.ts:37); non-2xx → FAIL with `{status, body}` (http-request.ts:45).

#### file-io (nodes/file-io.ts:7-54) — execution, requires `Fs`
- **What:** reads or writes a file through the Fs cap.
- **Config:** `{ op? = "read"|"write", path?, body?|content? }` (file-io.ts:16); path from `inbound.path`, body from `inbound.body|content` (file-io.ts:17-20).
- **Writes (PASS):** write → `{ path, bytesWritten }` (file-io.ts:37); read → `{ path, content, output }` (file-io.ts:47).
- **Failure modes:** missing path → FAIL `missing-path` (file-io.ts:23); cap errors → FAIL with the message (file-io.ts:34,44).

#### prompt (nodes/prompt.ts:87-223) — generation, requires `Llm` (llm mode only)
- **What:** the ONLY generation node — dual-mode (template = pure, llm = cap-bound).
- **Config:** `{ mode?: "llm"|"template" (aliases: call-model→llm, ask-launcher→template, prompt.ts:96-97), template?|prompt?|text?, system?, maxTokens? = 1024, thinking?, bracket?: { contract, repair?: {max ≤ 2}, confidenceFloor? = 0.55 } }` (prompt.ts:122-137)
- **Template mode:** interpolates `${key}` and `{{key}}` from inbound+vars (prompt.ts:17-37) → PASS `{output, text, result}`. No Llm cap needed (prompt.ts:101-119).
- **LLM mode:** `requireCaps([Llm])` first (prompt.ts:121); bracket declared with empty contract → FAIL carrying error code `[JESL UNBRACKETED-GENERATION]` (prompt.ts:127); up to 3 attempts (initial + 2 repairs, prompt.ts:169) — each contract violation appends `[Repair] Previous output violated contract: ...` to the prompt (prompt.ts:195); confidence below floor → INCONCLUSIVE `UNCLEAR` (prompt.ts:200-204); transport error → FAIL `LLM_TRANSPORT` (prompt.ts:176-183).
- **Journaling:** a pre-invoke row (8-char prompt hash) + a verdict row (12-char output hash + confidence) per attempt, via `ctx.journal` or the Journal service (prompt.ts:145-168).
- **Registration:** self-registers via `replaceStubSync("prompt", ...)` at module load (prompt.ts:220-223) — same pattern in all 4 execution nodes (shell-exec.ts:58-61 etc.).

#### THE STRUCTURAL STUBS (nodes/stubs.ts:18-43)
Kinds registered but not yet implemented return `INCONCLUSIVE` with anchor `TODO:<kind>:1` (stubs.ts:5-16): machine, oracle-gate, circuit-breaker, sqlite-sink, replay-source, cron-trigger, event-reactivate, ratio-classifier, synapse, intent-classifier, escalation-memory, evidence-gate, layer-loader, oracle-discharge, claim-gate, config-lock, workflow-machine, mpse-discharge, evidence-machine, audit-registry (+ the 4 execution kinds whose stubs are superseded at import time by `replaceStubSync`). The stubs keep `isKnownKindSync` true for the whole catalog — the registry is append-only (D7), impls land kind-by-kind via `replaceStub` (core/registry.ts:103-109,148-163).

---

## STEP 2 — RUN THE WORKFLOW

### Via the CLI

```bash
# Run a workflow (reads the doc, validates, executes, prints the summary)
jesl run my-pipeline.json

# Run with input variables (seeds the channels)
jesl run my-pipeline.json --in vars.json

# Run with a specific driver (default: cli)
jesl run my-pipeline.json --driver test

# Validate only (no execution — checks structure + kinds + tier + cycles + brackets)
jesl validate my-pipeline.json

# Replay from a journal (verify the sha256 chain + rebuild the verdict FROM rows)
jesl replay /path/to/journal.json
```

Arg parsing: cli/args.ts:11-49. The single `Effect.runPromise` edge: cli/main.ts:26 (Law 3 — construction ≠ execution; this is the ONLY runPromise in the product tree).

### Exit codes

| Code | Meaning |
|---|---|
| 0 | PASS — all nodes completed successfully (or replay verified) |
| 1 | FAIL — one or more nodes FAIL/INCONCLUSIVE, OR a replay whose chain does not verify (handlers.ts:383: `code: verified ? 0 : 1` — Law 7) |
| 2 | REFUSAL — the document was rejected (validation error, unknown kind, tier violation, unbracketed generation, CAP-UNBOUND) |

### What you see on stdout

The run summary is a JSON object (handlers.ts:319-326):

```json
{
  "verdict": "PASS",
  "results": {
    "node-a": { "verdict": "PASS", "evidence": {}, "timing": {} },
    "node-b": { "verdict": "FAIL", "error": {}, "evidence": {} }
  },
  "batches": [["a"], ["b", "c"]],
  "rows": [],
  "journal": []
}
```

The overall verdict is computed FROM the per-node results: any FAIL → FAIL; else any INCONCLUSIVE → INCONCLUSIVE; else PASS (handlers.ts:312-318).

### What you see on stderr (refusals only)

```
[JESL UNKNOWN-NODE] node=n1 field=type actual=print remedy=fix the typo or append the kind to the registry (append-only)
```

Format: `${code} node=${node} field=${field} actual=${actual} remedy=${remedy}` (handlers.ts:35-42).

The 8 frozen tokens (and ONLY these — errors.ts:85-94 `JESL_TOKENS` is the single source):
`[JESL UNKNOWN-NODE]` `[JESL CYCLE]` `[JESL TIER-VIOLATION]` `[JESL UNBRACKETED-GENERATION]` `[JESL CAP-UNBOUND]` `[JESL ORACLE-MISSING]` `[JESL CHANNEL-UNSET]` `[JESL NO-SEED]`

Usage errors (missing args) are PLAIN TEXT, never token-shaped (cli/main.ts:13-24 — Law 5's second half: never wear a token on a non-refusal).

### RUNTIME-DRIVERS — the three Layer stacks

A driver is an Effect `Layer` that binds the capability `Context.Tag`s (core/caps.ts:31-50). The same doc runs identically under any driver — the driver choice IS the Layer stack.

#### CliLive — production (drivers/cli-live.ts:110)
`Layer.mergeAll(ShellLiveReal, FsLiveReal, HttpLiveReal, JournalLive, HashCapLiveReal)`:
- **Shell** — `node:child_process.spawn` with `shell:true`, SIGKILL timeout timer, maxOutputBytes truncation on both streams (cli-live.ts:15-66)
- **Fs** — `node:fs/promises` readFile + mkdir -p/writeFile (cli-live.ts:68-82)
- **Http** — global `fetch` (cli-live.ts:84-106)
- **Journal** — the real sha256 chain via `HashCapLiveReal` (`node:crypto` createHash, cli-live.ts:9-13)
- The `node:` imports are LEGAL here — this is the driver/wrap boundary (Law 4). The design ledger is recorded in `VerifyLedger` (cli-live.ts:118-124): @effect/platform was probed and the node: bindings chosen for Shell timeout control.

#### OpenCodeLive — the host driver (drivers/opencode-live.ts:78-94)
`makeOpenCodeLive(transport)` = CliLive + ToolClient (`transport.invokeTool`) + Subagent (`transport.dispatchSubagent`) + Llm (`transport.callModel`) + SessionLive (`transport.ask`) + Bus. The `HostTransport` interface (opencode-live.ts:7-12) is the injection seam — the library NEVER imports an opencode SDK; `ScriptedTransport` (opencode-live.ts:16-76) scripts answers/impls for tests (`pushAnswer`, `remaining` accessors).

#### TestLive — in-memory (core/caps.ts:118-130)
`InMemoryLive` = 9 dummy Layers (Shell/Fs/Http/ToolClient/Subagent/Llm/Journal/Clock/Emit) returning canned successes. The dummy Clock uses `EffectClock.currentTimeMillis` — NOT `Date.now` (caps.ts:105; the W1 purity fix). TestLive ≡ InMemoryLive (caps.ts:130).

#### SessionLive — the ask-launcher (drivers/session-live.ts:10-33)
`Session` Tag: `ask(question)` → `Queue.unbounded` preserves order → per-ask `Deferred` → `forkDaemon` transport call → `Deferred.await`. The roundtrip: a node suspends, the host answers, the run continues — zero sleeps.

#### hook-bridge — the event seam (drivers/hook-bridge.ts:42-79)
`onToolExecuteBefore({tool, args, runId})` → installs a per-Bus `pta.*` deny subscription (WeakMap-keyed, hook-bridge.ts:13-40) → if a `ToolEngine` is bound in context, consult `intercept` FIRST (armed → deny); else emit `tool.execute.before` onto the Bus and consult the deny map. Returns `{allow:true} | {allow:false, reason}`. Observer-law isolation: every scanner effect is `catchAllCause(() => Effect.void)` — a scanner crash never breaks the hook.

**How to choose:** production CLI → CliLive · unit tests → TestLive/InMemoryLive · opencode plugin → `makeOpenCodeBinding(transport)` (bindings/opencode-binding.ts:9-16).

---

## STEP 3 — USE THE PROGRAMMATIC API

```typescript
import { Effect } from "effect"
import { decodeDoc, validateDoc } from "./core/schema"
import { runProgram, type RunContext } from "./core/executor"
```

### The full RunContext (core/executor.ts:60-73)

```typescript
interface RunContext {
  runId: string                                   // e.g. wf-<ts>-<rand> (handlers.ts:145)
  doc: WorkflowDoc                                // the validated document (frozen for the run)
  channels?: ChannelsView                         // { write(name, value) } — the executor writeback target
  journal?: JournalView                           // { append(draft) } — omit for the built-in fallback chain
  bus?: unknown                                   // the Bus service (scanners subscribe here)
  caps: Context.Context<any>                      // the driver's bound capability Context
  clock: Clock.Clock                              // Effect Clock (TestClock in tests, real in drivers)
  budget: { startedAt: number; deadlineMs: number; maxNodesFiring: number }  // defaults 0/600000/15
  vars: Readonly<Record<string, unknown>>         // --in + doc.vars merged, seeds the channels
  nodeHandles: Record<string, NodeHandle>         // nodeId → implementation
  boundCaps?: ReadonlySet<string>                 // e.g. {"Shell","Fs","Http"} for the CLI driver
  capsRequirements?: Record<string, ReadonlyArray<string>>  // nodeId → required cap names
}
```

### The NodeHandle contract (core/executor.ts:55-58)

```typescript
interface NodeHandle {
  invoke: (input: NodeInput, ctx: RunContext) => Effect.Effect<NodeResult, JeslError>
  requiredCaps?: ReadonlyArray<string>            // pre-flighted BEFORE invoke (CAP-UNBOUND, no invoke row)
}
interface NodeInput {                             // core/executor.ts:50-53
  node: Readonly<{ id: string; type: string }>    // the FULL envelope (config included — the W2 fix)
  inbound: Readonly<Record<string, unknown>>      // channel name → written value (executor.ts:184-188)
}
```

### The Effect-only law (D9/E3/E10)

Core describes Effects; drivers provide them; `Effect.runPromise` appears at exactly ONE edge (cli/main.ts:26). `core/` and `nodes/` never import `node:*`, `fetch`, `Date.now`, `Math.random`, or `setTimeout` (Law 4 — grep-verified at every wave). Concurrency is `Effect.forEach(..., {concurrency: maxFiring})` — never `Promise.all` (executor.ts:224).

### THE RUN LOOP (runProgram, core/executor.ts:82-234)

1. Build inbound/outbound maps from `doc.edges` (executor.ts:84-93)
2. Seed the channels: `ctx.vars` first, then `doc.vars` (executor.ts:97-100)
3. Loop while nodes remain: compute the ready set (all inbound channels written), take up to `maxNodesFiring` (executor.ts:143-158)
4. Cap pre-flight per node: any required cap not in `boundCaps` → `Effect.fail([JESL CAP-UNBOUND])` with NO invoke row (executor.ts:159-178)
5. Per node via `Effect.forEach(batch, perNode, {concurrency: maxFiring})` (executor.ts:224):
   journal invoke row → build REAL inbound from channelData (node outputs + seeded vars, executor.ts:184-188) → `handle.invoke` → `Effect.exit` capture → verdict mapping: success→PASS, tagged failure→FAIL, defect→INCONCLUSIVE (executor.ts:195-211) → journal verdict row → writeback: each outbound edge's channel gets `outputs[via] ?? outputs.default ?? {ok:1}` (executor.ts:213-221)
6. Return `RunSummary {results, batches, rows}` (executor.ts:231-233)

### The journal fallback (executor.ts:107-139)

Without an injected journal, the executor builds its OWN chain: `self = simpleHash(canonicalSerialize(base) + "\0" + prev)` — the SAME algorithm `verifyChain` checks (journal.ts:260-275). The canonical serialization EXCLUDES `self` and `ts` (journal.ts:43-44 — the W5 determinism fix: two runs on the same doc+seed produce identical chains).

### The other core services you will touch

- `decodeDoc(raw)` / `validateDoc(doc, isKnownKind)` — schema.ts:84-205
- `makeRegistry()` / `isKnownKindSync` / `replaceStubSync` — registry.ts:103-247 (append-only: same family+caps = idempotent, divergent = RegistryFrozenError)
- `makeJournal()` — journal.ts:86-239: `append/rows/allRows/covers(docHash,seed)/serialize/restore/verify/verifyChain/clear`; `covers` derives the runId as `hash(docHash + "\0" + seed).slice(0,16)` (journal.ts:166)
- `makeChannels()` — channels.ts:28-156: `seedFrom` ([JESL NO-SEED]), `write` (deep-copy + Deferred wake), `read` ([JESL CHANNEL-UNSET]), `snapshot` (the observer law: readers get deep copies)
- `makeBus()` — bus.ts:75-185: `emit/subscribe/on/detach/detachAll`; payloads deep-frozen (bus.ts:80-88); handlers run on `forkDaemon` with `catchAllCause` isolation (bus.ts:99-103)
- `makeEvidenceMachine()` — evidence.ts:74-152: the 8-kind G1 port (RING_CAP 50, VERDICT_TTL_MS 5000, claim adjudication = fresh source_change exists)

---

## STEP 4 — PACKAGE IT

One document emits three targets. ALL THREE re-validate the doc first (criterion 9): `validatedDoc = decodeDoc → validateDoc → checkUnbracketed` (packager/shared.ts:21-28).

### emitTool — the plugin-tool manifest (packager/tool.ts:6-25)

```json
{
  "$schema": "trident-workflow-v1",
  "name": "my-pipeline",
  "description": "...",
  "inputSchema": { "vars": {}, "seedChannel": "...", "channels": ["approved","response"] },
  "command": "jesl run my-pipeline.json --in vars.json"
}
```

### emitChain — the tool-chain descriptor (packager/chain.ts:6-60)

Per node: `{ id, tool: <type>, args: <config>, via: <first outbound channel>, inboundVia: [...], outboundVia: [...] }` + the edge list. Each step's `tool` is registry-checked — an unknown kind → `[JESL UNKNOWN-NODE]` (chain.ts:10-24).

### emitSkill — the skill rocket (packager/skill.ts:53-78)

Five files written through the injected `SkillWriter` (zero host imports in the emit core):

```
<outDir>/<name>/
├── SKILL.md              ← the fuse (launch line: "jesl run payload/workflow.json --in payload/ctx.json", skill.ts:11)
└── payload/
    ├── workflow.json     ← the doc via canonicalJson (2-space stable ordering)
    ├── ctx.json          ← {vars, seed, channels, meta{name,tier}}
    ├── mission.md        ← objective + node/edge inventory + success criteria
    └── anti-patterns.json ← doc.gates if present, else an empty 4-bank family shell
```

The launch line is exported as `SKILL_LAUNCH_LINE` (skill.ts:87) — byte-exact, asserted by packager.test.ts.

### extractBoilerplate — the adoption extraction (boilerplate/extraction.ts:124-213)

`extractBoilerplate(sourceDir, targetDir, profileName, writer)`:
1. Copy the 10 FIXED dirs (core, nodes, cli, drivers, scanners, workflow, packager, wraps, mpse, bindings — extraction.ts:37)
2. Copy `profiles/shared.ts` + `profiles/<profile>.ts` (extraction.ts:148-159)
3. Generate `package.json` (name `<basename>-kernel` + the `jesl` block: profile/caps/kinds/tier/brackets, extraction.ts:161-177)
4. Copy tsconfig.json (extraction.ts:179-185)
5. Emit `boilerplate-manifest.json` — sha256 digest over the sorted copied files + caps + kinds, `schemaVersion: "trident-workflow-v1"` (extraction.ts:187-210); `validateManifest` gates the emit (extraction.ts:107-120)
Unknown profile → plain `UNKNOWN_PROFILE` error (extraction.ts:96-105 — NOT a bracketed token; the triple-canon lesson).

---

## STEP 5 — THE LIFECYCLE (the 6 kernels)

For the full idea→ship pipeline, use the 6 lifecycle kernels at `jesl/kernels/<name>/` (each: activities.ts + workflow.json + SKILL.md + fixtures/):

| # | Kernel | In → Out | Pipeline (anchors into activities.ts) | Tests |
|---|---|---|---|---|
| 1 | idea-to-bible | raw idea text → `BibleDoc` (a valid WorkflowDoc) | validate (blank → `[JESL CHANNEL-UNSET]`, :157-159) → parallel explore over 3 angles via `Effect.forEach(..., {concurrency:15})` (:163) with a stub-able Llm (`makeStubLlmLayer`, :171-186) → `mergeToBible` (:102-131) → `schemaGateBible` (`decodeDoc`+`validateDoc`, :140-143) | 6 |
| 2 | bible-to-spec | bible doc → DPL1 spec candidate | `digestBible` (canonicalSerialize+simpleHash → Inventory, :49-96) → `extractFRs` (Llm optional, deterministic fallback, :98-148) → **`lintMathContracts` — THE MPSE ENTRY** (`parseMathExpr` per math-bearing node, :150-191) → `buildSpecCandidate` (:210-226) → `gateDPL1Spec` (`decodeDoc`+`validateDoc`, :193-208) | 6 |
| 3 | spec-to-kernels | spec JSON file → kernel prototypes + delta stubs + dry-run proofs | **D3 THE INSERTION**: `runDemoSync` from mpse/demo (import :9; call sites :197,:199) → **`assertD17`** (`report.fail===0` + every EXCLUDED row carries EXCLUDED_BORN_OFF, :86-117; composed :212) → `decompose` guards (:220-243) → **`runDryRun`** (`runProgram` under an empty/TestLive context — the deterministic substrate executes pre-code, :119-169, composed :246) | 8 |
| 4 | kernels-to-code | stub inventory → verified code artifacts | `inventoryStubs` (polymorphic shapes, :113-141) → `processStub` per stub: Subagent.dispatch (:176) → confidence floor 0.55 → INCONCLUSIVE UNCLEAR (:188-194) → `registry.discharge` (:199) → repair loop max 2 (3 attempts, :172; 3-strike → FAIL) | 7 |
| 5 | verify | artifacts + scenarios → report | `runScenario` (`passTokenMatch = toolResult.includes(passToken)` + `failTokenAbsent`, :72-74) → `Effect.forEach(..., {concurrency:15})` parallel battery (:122) — one failing scenario FAILs its row while siblings survive | 5 |
| 6 | ship | verified artifacts → manifest + copies + docs | `buildManifestEffect` (Schema-gated, empty → `[JESL NO-SEED]`, :39-70) → `copyArtifacts` (hash-verify before write, :117-128; atomic rollback on writer failure, :133-155) → `generateDocs` (:159-176) → `auditGateChain` (Schema decode + total + per-entry hash-verify — the corrupted-copy detector, :178-257) | 7 |

The kernels are Effect Workflow compositions (never raw Promise chains). spec-to-kernels composes `runDemo` from mpse/demo.ts — the operator's D3 insertion: prototype shells land BETWEEN the MPSE specs and the artifact specs. 39 it.effect units across 6 runner files (W8: 314/314 at close).

---

## THE FIVE INVARIANTS OF USE

1. **THE SCHEMA-GATE MUST PASS** before anything is returned. A gate failure = the structured error (`[JESL ...]`), never a partial dressed as a result.
2. **THE JOURNAL IS THE RUN.** Every node invocation gets invoke+verdict rows. The sha256 chain proves what happened. `covers(docHash, seed)` enables replay; replay rebuilds the verdict FROM rows — invoke counter 0 (no-re-pay, criterion 15).
3. **CONSTRUCTION ≠ EXECUTION.** `runProgram` returns an Effect — data, not a running computation. The driver runs it via `Effect.runPromise` at exactly ONE edge (cli/main.ts:26).
4. **ZERO HOST IMPORTS IN CORE.** `core/` and `nodes/` never import `node:fs`, `fetch`, `Date.now`, `Math.random`, or `setTimeout`. The driver Layer is the ONLY boundary where host I/O lives.
5. **ONE EXECUTION SEMANTIC.** Dataflow readiness over named channels + the Bus. No second executor, no `Promise.allSettled` beside `Effect.forEach`, no raw `async/await` in core.

---

## THE QUICK REFERENCE CARD

### The 8 frozen tokens

| Token | Fires when | Exit code |
|---|---|---|
| `[JESL UNKNOWN-NODE]` | Node kind not in the registry / duplicate id / dangling edge | 2 (validate) |
| `[JESL CYCLE]` | The dependency graph has a cycle | 2 |
| `[JESL TIER-VIOLATION]` | Tier-1 doc uses a generation kind or class | 2 |
| `[JESL UNBRACKETED-GENERATION]` | Tier-2 generation missing bracket.contract | 2 |
| `[JESL CAP-UNBOUND]` | Required cap not bound in the driver Layer | 2 (pre-flight, no invoke row) |
| `[JESL ORACLE-MISSING]` | Rule card has no expected value | 2 (compile) |
| `[JESL CHANNEL-UNSET]` | Node reads an unset channel | FAIL verdict |
| `[JESL NO-SEED]` | Declared entry channel has no seed | FAIL verdict |

### The constants

| Constant | Value | Where | Why |
|---|---|---|---|
| Concurrency cap | 15 | executor.ts:140 (default), graph.ts:24 | The bounded pool; >15 overwhelms the RPM ledger |
| Depth (MathExpr) | 256 | mpse/parser.ts:3 | The evaluator bound (DEPTH_EXCEEDED) |
| RING_CAP | 50 | core/evidence.ts:3 | The evidence ring (oldest evicted) |
| VERDICT_TTL_MS | 5,000 | core/evidence.ts:4 | The verdict cache |
| CLAIM_FRESH_WINDOW_MS | 300,000 | core/evidence.ts:5 | The claim-after-evidence window |
| Repair max | 2 | prompt.ts:169 (`attempt <= 2`) | The unbounded-repair lesson |
| Confidence floor | 0.55 | prompt.ts:136 | Below = UNCLEAR, never a defect |
| deadlineMs default | 600,000 | executor.ts:141 | The 10-minute run budget |
| Escalation windows | 5/2/0 | wraps/behavior-engine.ts:30-44 | esc-count ≤1/=2/≥3 (Paragon provenance) |
| Refractory | 25 seq | wraps/behavior-engine.ts:57 | The synapse refractory period |
| Alpha decay | 0.05 | wraps/behavior-engine.ts:61 | Per-seq decay (decayAlphaFactor) |
| Fire threshold | 1.0 thr-v1 | wraps/behavior-engine.ts:64 | The arming threshold |
| Pre-arm ring cap | 20 | scanners/shared.ts:33 | The PTA deny-unless-armed ring |
| MPSE domain limit | 10,000 | mpse/parser.ts:4 | The DOMAIN_UNBOUNDED guard |
| LSP spawn timeout | 15,000ms | wraps/effect-lsp.ts:102 | The diagnostics CLI bound |

### The file tree

```
jesl/
├── core/          10 modules (schema, graph, channels, bus, caps, errors, executor, journal, registry, evidence)
├── nodes/         19 files — 16 implemented kinds + stub entries + shared + index
├── cli/           main.ts (the single runPromise edge) + args.ts + handlers.ts
├── drivers/       cli-live, opencode-live, hook-bridge, session-live
├── scanners/      pba, pta, pba-banks (Paragon provenance), lsp, audit, trace, shared
├── workflow/      jesl-run.ts (Workflow.make JeslRun) + activities.ts (Activity.make + durableAsk)
├── packager/      tool.ts, chain.ts, skill.ts, shared.ts
├── wraps/         behavior-engine, tool-engine, effect-lsp, artifact-gate
├── mpse/          parser (24-kind IR), rule-cards, oracle, calibrate, kernel-emit, stub-emit, demo
├── kernels/       idea-to-bible, bible-to-spec, spec-to-kernels, kernels-to-code, verify, ship
├── profiles/      trident (t1), trading (t2), sales (t2), shared
├── bindings/      host-binding, opencode-binding
├── boilerplate/   extraction.ts
├── fixtures/      mech-gate.json, bad-*.json ×4, needs-llm.json, parallel-5.json, vars.json, mpse-demo.json
└── tests/         34 test files (336 it.effect units) + battery.ts (the 11-row runner)
```

### The commands

```bash
cd jesl
bunx tsc --noEmit          # type-check (must exit 0)
npx vitest run              # the full test battery (336 passed, 34 files — NEVER `bun test`, BUILD_STATE §5)
bun run cli/main.ts run fixtures/mech-gate.json    # the happy-path demo → "verdict":"PASS" exit 0
bun run cli/main.ts validate fixtures/bad-unknown-kind.json  # → [JESL UNKNOWN-NODE] exit 2
bun run cli/main.ts run fixtures/needs-llm.json --driver test  # → [JESL CAP-UNBOUND] llm, no artifact, exit 2
bun run cli/main.ts run fixtures/mech-gate.json > /tmp/j.json && bun run cli/main.ts replay /tmp/j.json  # → "verified": true
```
