# THE EFFECT ENGINEERING BIBLE v3.0 — IDEA → RUNTIME REALITY
**THE OPERATIONAL METHOD**: how to engineer any idea into a running JESL card + a production kernel — following the shared macro principles every canonical effect system computes.

**TRIGGER:** you have an idea for an effect — something that should HAPPEN in a runtime — and you want it running as code that provably produces exactly that idea.
**DUTY:** the idea → runtime compilation method: intent capture → effect decomposition → pipeline authoring → pricing → pre-flight → release → render → settle → record. Then permanence: the production kernel, then the skill rocket.
**PROTOCOL:** Read fully once. Then for every new effect: Part 2 (the method) → Part 4 (a worked example nearest your idea) → cast. The lore that VALIDATES this method is compressed in Part 8 — the canon systems are the evidence the method is universal, not the subject.

> **THE THESIS IN ONE LINE:** an effect is not a wish — it is a PRICED, VALIDATED, ORDERED PIPELINE of parameterized primitives, journaled end to end, whose experienced result is computed from what actually fired. JESL compiles exactly that. This bible teaches the compilation by hand.

**THE THREE SENTENCES OF DISCIPLINE:**
1. IDEA → EFFECT → EXPERIENCED EFFECT: three bound stages, never merged — the intent documents what should happen, the nodes encode what CAN happen, the journal proves what DID happen.
2. Every effect decomposes to the same primitive shape — `{effect-class, scale, duration, scope, targeting}` — mapped onto node kinds, configs, channels; every "named spell" is a saved composition.
3. The experienced effect is computed from execution evidence, never from the idea's claims — the journal is the render.

---

<!-- ═══════════ PART 0: THE PROOF (compressed — why this method is universal) ═══════════ -->

## PART 0 — THE PROOF

Four canonical effect systems — TES Oblivion/Skyrim, The Witcher, Eragon's Ancient Language — were decomposed node by node, and every one computes the SAME pipeline:

```
IDEA ──► ACQUIRE vocabulary ──► STRUCTURE (compile intent to a castable form)
     ──► PRICE (cost = f(shape); capacity check) ──► PRE-FLIGHT (refuse if unpayable)
     ──► RELEASE (the ordered pipeline runs) ──► RENDER (world-state changes)
     ──► SETTLE (costs land) ──► RECORD (the experienced effect, knowable + replayable)
```

The systems differ ONLY in syntax and cost curves. The shared invariants:

| shared mechanic | the proof in every system | the JESL compile |
|---|---|---|
| effects are parameterized primitives `{effect-class, scale, duration, scope, targeting}` — never atomic things | Oblivion altars compose `Fire Damage Npts` with range/area/duration; Witcher formulae; Eragon verb-phrases | node kinds + configs; the card IS the composition |
| composition is ordered — amplifiers precede what they amplify; same-identity recasts replace | Oblivion's measured stacking ladder (1→4→16→…→1089×) | the edge graph IS the order; runIds replace, seeds diverge |
| cost = f(shape), checked BEFORE release | magicka pools fizzle; Eragon's overrun kills; essence burns | the cap pre-flight refuses `[JESL CAP-UNBOUND]` before any fiber |
| unstructured intent is the catastrophe | Eragon's wordless casting redirects to whatever the mind drifts to | decodeDoc → validateDoc → the refusals: nothing runs outside the schema |
| the experienced effect is computed from execution, never narration | "the scar; the caster knows" | verdicts FROM journal rows (sha256-chained, replayable) |
| processes beat one-shots at the mastery tier | multi-step cancellable formulations | pause + durable asks + gate-bracketed generation |
| power = composition, not repertoire | bought spells are standardized and weak | cards are authored; the registry is the vocabulary; the rockets are the compositions |

**The engineering reading:** these are not stories — they are DESIGN REVIEWS of four independent implementations of the same compiler spec, run for decades. The failures they record (mis-focus, overrun death, unpriced effects, narration-as-proof) are exactly the failure modes the JESL refusals, journal, and cap pre-flight make STRUCTURALLY IMPOSSIBLE. When this bible says "price before release," it is repeating the one law no surviving system skipped.

---

<!-- ═══════════ PART 1: THE COMPILATION METHOD ═══════════ -->

## PART 1 — THE COMPILATION METHOD (idea → runtime, stage by stage)

### 1.1 — STAGE A: CAPTURE THE INTENT (idea → structured intent)

Take the idea — in whatever words it arrived — and answer five questions IN WRITING. These become the card's contract; everything later is mechanical.

| question | the answer's shape | example ("gate bad writes to the repo") |
|---|---|---|
| WHAT world-state change? | a verb + an object + a criterion | "deny any write containing secrets; allow the rest" |
| WHAT does done mean? | the EVIDENCE that would prove it fired | "a journal row per write: allowed/denied + the reason" |
| WHAT effect class? | instant / sustained / timed / process / reactive | reactive (fires on host write events) |
| WHAT does it touch? | the scope + the caps it needs | the repo tree; Fs (watch) — no network |
| WHAT breaks if it lies? | the failure you cannot tolerate | a secret slipping through silently |

Rule: if question 2 (the evidence) cannot be answered, the idea is not yet an effect — it is a wish. Effects are provable by construction; that is the whole point of the journal.

### 1.2 — STAGE B: DECOMPOSE INTO PRIMITIVES

Every effect decomposes to the shared shape; map each axis onto the kernel:

| primitive axis | ask | maps to |
|---|---|---|
| effect-class | detect / decide / generate / execute / orchestrate? | the node FAMILY (deterministic/decision/execution/generation) |
| scale | how much, how many, how far? | config values (thresholds, counts, sizes) + budget (`deadlineMs`, `maxNodesFiring`) |
| duration | instant / held / timed / recurring? | the effect class (Part 3) — instant nodes vs `pause`/`cron-trigger`/`retry` |
| scope | what does it touch? | `requiredCaps` + the driver binding + fan-out (`parallel` items) |
| targeting | what triggers it, on what input? | the seed (`vars`, events via `on:{event}`), the channels (via names) |

Write the decomposition as a comment in the card's `meta.description` — the intent travels with the artifact.

### 1.3 — STAGE C: AUTHOR THE PIPELINE (the 9 stages → the node graph)

| physics stage | the node you author |
|---|---|
| 1 INTENT | `meta{name, tier, description}` + `vars` |
| 2 ACQUISITION | nothing to author — the registry IS the vocabulary (37 kinds) |
| 3 STRUCTURING | the `nodes[]` graph: one node per primitive step |
| 4 PRICING | a `math-eval` node if the cost computes; else the caps + budget ARE the price |
| 5 PRE-FLIGHT | leading `gate` nodes (the target-lock pattern) — refuse before doing |
| 6 RELEASE | the execution/decision nodes, ordered by edges |
| 7 RENDER | outputs flowing through channels (`via`) to downstream nodes |
| 8 SETTLE | `retry`/`fallback` exhaust; budget consumed; failures land as FAIL verdicts |
| 9 RECORD | a `triplet-writer` + `journal-sink` — the provable claim + the chain |

The discipline: gates BRACKET the work (pre-flight before, verification after); every branch ends provable; nothing fires unjournaled.

### 1.4 — STAGE D: PRICE IT (declare the energy source)

1. List every node's `requiredCaps` (read the node file — never guess).
2. Choose the driver that binds them — or author one (the CLI binds Shell/Fs/Http/Journal/HashCap; your driver adds Llm/oracle/whatever YOUR effect needs).
3. Set the budget: `deadlineMs` (default 600s) + `maxNodesFiring` (15) — the pool. Exhaustion = a loud abort, by design (the fizzle).
4. NEVER route around a missing cap (P2-8). `[JESL CAP-UNBOUND]` with zero rows is the system saving you from an effect you could not pay for.

### 1.5 — STAGE E: PRE-FLIGHT (cast; read the refusals as compile errors)

`bun run cli/main.ts run my-effect.json` — the refusal vocabulary IS the compiler diagnostics:

| you see | it means | the fix |
|---|---|---|
| `[JESL CYCLE] node=a actual=cycle through [a→b→c]` | your graph loops | break with a gate or re-arm via `event-reactivate` |
| `[JESL CHANNEL-UNSET] field=$.x actual=undefined` | an assert reads a channel no edge wrote | rename the via to the upstream output key |
| `[JESL TIER-VIOLATION]` | generation in a tier-1 doc | tier 2 + bracket, or de-scope |
| `[JESL UNBRACKETED-GENERATION]` | tier-2 prompt without a contract | add `bracket{contract,…}` |
| `[JESL CAP-UNBOUND] actual=<cap>` | the driver doesn't bind it | bind it or drop the node |
| `[JESL UNKNOWN-NODE] actual=<type>` | a kind outside ALL_KINDS | fix the typo or register the kind |

Every refusal names `node`, `field`, `actual`, `remedy` and exits 2 with ZERO journal rows — nothing to clean up. Iterate until `"verdict":"PASS"` exit 0.

### 1.6 — STAGE F: RELEASE → RENDER → SETTLE → RECORD (the cast + the proof)

Cast. Read the run document top-down: `batches` (the order your decomposition produced), `results` (per-node verdict + `evidence{pattern,state,anchor}` + `outputs`), the journal tail (the chain). The experienced effect is THAT document — computed from what fired, not what you intended. If a node FAILed, its `outputs.reason` + `evidence.anchor` is the work order. If everything PASSed, the journal chain is your proof — replayable via `covers(docHash, seed)` forever, at zero cost.

Then permanence: if the effect will fire again — Part 5 (the production kernel). If others will fire it — Part 6 (the skill rocket).

---

<!-- ═══════════ PART 2: THE PRIMITIVE CATALOG ═══════════ -->

## PART 2 — THE PRIMITIVE CATALOG (effect-class → node pattern)

The decision table from idea-verb to node pattern. Find the VERB in your intent; the row is your skeleton.

| your idea says… | effect-class | the node skeleton | the reference card |
|---|---|---|---|
| "check / verify / assert X" | decide | `gate(asserts)` | mech-gate.json |
| "compute / derive a value" | decide | `math-eval` → `gate(assert result)` | oracle.json |
| "prove this happened" | evidence | `triplet-writer` → `journal-sink` | guard.json tail |
| "run this command" | execute | `shell-exec` (+ `timeoutMs`) inside gates | ship.json |
| "call an API" | execute | `http-request` (+ assert on response) | — |
| "read/write files" | execute | `file-io` inside gates | ship.json |
| "store structured results" | evidence | `sqlite-sink` | infra pattern |
| "do N independent things" | orchestrate | `parallel(items)` → `gate(count join)` | fan.json |
| "try, else fall back" | orchestrate | `retry-chain` → `fallback-chain` | retry.json |
| "wait for a human/event" | orchestrate | `pause` (durable) / `event-reactivate` | ask.json shape |
| "run on a schedule" | orchestrate | `cron-trigger` → work | — |
| "replay what happened" | evidence | `replay-source(runId)` → summary | chain.json swap |
| "classify / route / score" | decide | `ratio-classifier` / `intent-classifier` / `synapse` | pre-arm.json |
| "remember escalations" | decide | `escalation-memory` | pre-arm.json |
| "protect against cascades" | decide | `circuit-breaker` | — |
| "enforce config immutability" | decide | `config-lock` | — |
| "verify against expectations" | decide | `oracle-gate` / `oracle-discharge` / `claim-gate` | bracket.json (claim) |
| "produce text/JSON from a model" | generate (TIER 2) | `prompt(bracket.contract)` + Llm-bound driver | bracket.json slot |
| "watch and react" | reactive | `event-filter(on:{event})` → work | — |
| "accumulate a stream" | reactive | `capture-engine` → decision | — |
| "re-arm after completion" | reactive | `event-reactivate` | — |
| "load config/extensions" | decide | `layer-loader` | — |
| "lock validated config" | decide | `config-lock` | — |
| "persist structured rows" | execute+evidence | `sqlite-sink` | — |
| "orchestrate a sub-card" | orchestrate | `workflow-machine` | — |
| "discharge an MPSE verdict" | decide | `mpse-discharge` | — |

Composition chains (stack these patterns): guard→work→prove (the default) · fan-out→join · try→recover · hold→resume · compute→discharge · generate→verify. All six are in `algorithms/` as working cards — start from the nearest, never from a blank file.

---

<!-- ═══════════ PART 3: THE EFFECT CLASSES ═══════════ -->

## PART 3 — THE EFFECT CLASSES (how effects run over time — the card pattern per class)

Every effect runs over time in one of eight classes. Each has a card pattern; choose yours, copy the pattern.

| class | runs like | the JESL pattern | watch for |
|---|---|---|---|
| **INSTANT** | fire-and-forget; state change on completion | `gate → shell-exec/file-io → gate(exitCode) → triplet-writer` | assert the exit; silence is not success |
| **PROJECTILE** | spawn → travel → impact-resolution | `gate → http-request/shell-exec(async launcher) → gate(response) → record` | the impact assert is the resolution |
| **SUSTAINED** | held while a condition lasts; ends on break | `capture-engine`/`event-filter` feeding a `gate` per tick; ends on the break event | duration costs per tick — budget it |
| **TIMED** | apply state for N, then expire | `cron-trigger` or `pause` + downstream expiry gate | expiry is a node, not an assumption |
| **TAPERED** | magnitude decays by curve | `math-eval` recurrence feeding gates (`aₙ₊₁ = f(aₙ)`) | the curve is data — assert it |
| **PERSISTENT/ZONE** | placed; waits for trigger or expiry | `sqlite-sink`/`file-io` placement + `event-filter` trigger | the trigger must be journaled too |
| **SUMMONED** | spawn an autonomous helper for a duration | tier-2 `prompt`/subagent dispatch behind oracle gates, repair ≤ 2 | delegation needs gates (unbound = possession) |
| **PROCESS** | multi-step, cancellable, state carried between steps | the full grammar: `pause` + durable asks + journal checkpoints + gate brackets per step | THE mastery tier — every step journaled; cancellation leaves evidence |

The PROCESS class is why the kernel has a journal, a pause, and durable asks: a blocked one-shot effect is a catastrophe in every canon system; a checkpointed process is the master's formulation. Engineer long effects AS processes from day one.

---

<!-- ═══════════ PART 4: WORKED ENGINEERING EXAMPLES ═══════════ -->

## PART 4 — WORKED ENGINEERING WALKTHROUGHS (idea → card → cast → kernel)

### 4.1 — IDEA: "No write containing secrets may land in the repo — and every write decision must be provable."

**Stage A — intent:** reactive effect; evidence = a journal row per write (allowed/denied + reason); touches Fs (watch) — no network; the intolerable failure = a secret landing silently.

**Stage B — decomposition:** event-filter (detect the write) → evidence-machine (ingest + adjudicate) → artifact-gate wrap (DENY on violation) → journal (the receipt per decision). Class: REACTIVE.

**Stage C — the card:**

```jsonc
{ "$schema": "trident-workflow-v1",
  "meta": { "name": "secret-write-gate", "tier": 1,
            "description": "Detect writes; adjudicate; deny secrets; journal every decision" },
  "nodes": [
    { "id": "watch",  "type": "event-filter", "on": { "event": "fs.write" } },
    { "id": "scan",   "type": "evidence-machine", "config": { "ingest": "$.write" } },
    { "id": "decide", "type": "gate",
      "config": { "asserts": [{ "path": "$.verdict", "op": "eq", "value": "CLEAN" }] } },
    { "id": "record", "type": "triplet-writer",
      "config": { "triplet": { "pattern": "fs.write", "state": "ALLOWED", "anchor": "secret-gate:1" } } },
    { "id": "sink",   "type": "journal-sink" } ],
  "edges": [
    { "from": "watch", "to": "scan",   "via": "write" },
    { "from": "scan",  "to": "decide", "via": "verdict" },
    { "from": "decide","to": "record", "via": "decision" },
    { "from": "record","to": "sink",   "via": "data" } ],
  "vars": {} }
```
The violation path: in the LIVE host, the artifact-gate wrap subscribes to the same bus and DENIES the write when the adjudication is not CLEAN (`EFFECT_ARTIFACT_GATE` + `pta.intercept` rows) — the card above is the PROVABLE SHADOW of that enforcement: every decision, allowed or denied, journals.

**Stage D-E-F:** cast — `bun run cli/main.ts run secret-write-gate.json` (the seed write in vars demonstrates both paths). The journal now carries one row per decision. This card graduated into the kernel's `wraps/artifact-gate.ts` — the card was the spec; the wrap is the daemon.

### 4.2 — IDEA: "Ship only what the test battery proves — zero unverified artifacts."

**Stage A:** process effect; evidence = the battery's own counts + a verify receipt; touches Shell (tests) + Fs; the intolerable failure = shipping unverified code.

**Stage B:** shell-exec (run the battery) → gate (assert the counts) → triplet-writer (the receipt) → file-io (stamp the artifact) → audit-registry (the ship's row). Class: PROCESS (verify → stamp → ship, checkpoints between).

**Stage C — the card:**

```jsonc
{ "$schema": "trident-workflow-v1",
  "meta": { "name": "verified-ship", "tier": 1 },
  "nodes": [
    { "id": "clean-tree", "type": "gate",
      "config": { "asserts": [{ "path": "$.dirty", "op": "eq", "value": false }] } },
    { "id": "tests",  "type": "shell-exec",
      "config": { "cmd": "npx vitest run 2>&1 | tail -4", "timeoutMs": 120000 } },
    { "id": "prove",  "type": "gate",
      "config": { "asserts": [
        { "path": "$.stdout", "op": "contains", "value": "424 passed" },
        { "path": "$.exitCode", "op": "eq", "value": 0 } ] } },
    { "id": "receipt", "type": "triplet-writer",
      "config": { "triplet": { "pattern": "ship.verified", "state": "PASS", "anchor": "verified-ship:424" } } },
    { "id": "stamp",  "type": "file-io",
      "config": { "op": "write", "path": "payload/mission.md", "body": "verified 424/424" } },
    { "id": "audit",  "type": "audit-registry", "config": { "audit": "ship.verified" } },
    { "id": "sink",   "type": "journal-sink" } ],
  "edges": [
    { "from": "clean-tree", "to": "tests",   "via": "tree" },
    { "from": "tests",      "to": "prove",   "via": "stdout" },
    { "from": "prove",      "to": "receipt", "via": "proof" },
    { "from": "receipt",    "to": "stamp",   "via": "data" },
    { "from": "stamp",      "to": "audit",   "via": "written" },
    { "from": "audit",      "to": "sink",    "via": "data" } ],
  "vars": {} }
```
The MPSE law in the `prove` gate: the assert reads the COUNT (`424 passed`), never the prose. If the battery emits 421, the gate FAILs with the actual in evidence — the ship aborts at the checkpoint, nothing downstream runs.

### 4.3 — IDEA: "Watch an API endpoint; classify every change; escalate on drift; remember the escalations."

**Stage A:** sustained/reactive effect; evidence = a classification row per poll + escalation rows on drift; touches Http (poll) + Journal; the intolerable failure = drift landing unnoticed.

**Stage B:** cron-trigger (the tick) → http-request (poll) → math-eval (the drift metric) → ratio-classifier (classify) → escalation-memory (remember) → gate (the policy) → journal-sink. Class: TIMED + RECURRING.

**Stage C — the card:**

```jsonc
{ "$schema": "trident-workflow-v1",
  "meta": { "name": "api-drift-watch", "tier": 1 },
  "nodes": [
    { "id": "tick",   "type": "cron-trigger", "config": { "schedule": "*/15 * * * *" } },
    { "id": "poll",   "type": "http-request",
      "config": { "url": "https://api.example.com/health", "method": "GET", "timeoutMs": 8000 } },
    { "id": "metric", "type": "math-eval",
      "config": { "expr": { "_tag": "var", "name": "driftScore" } } },
    { "id": "classify", "type": "ratio-classifier",
      "config": { "ratio": 0.8, "suppressBelow": true } },
    { "id": "remember", "type": "escalation-memory", "config": { "window": 900000, "threshold": 2 } },
    { "id": "policy", "type": "gate",
      "config": { "asserts": [{ "path": "$.verdict", "op": "eq", "value": "STABLE" }] } },
    { "id": "sink",   "type": "journal-sink" } ],
  "edges": [
    { "from": "tick",   "to": "poll",     "via": "tick" },
    { "from": "poll",   "to": "metric",   "via": "response" },
    { "from": "metric", "to": "classify", "via": "score" },
    { "from": "classify","to": "remember","via": "class" },
    { "from": "remember","to": "policy",  "via": "memory" },
    { "from": "policy", "to": "sink",     "via": "data" } ],
  "vars": {} }
```
The FAIL path IS the alert: a drift verdict FAILs the policy gate, journals the reason + the score, exits 1 — the host's monitoring picks up the exit. The memory node means repeated suppressions escalate: the third drift in the window is a DIFFERENT verdict than the first.

### 4.4 — IDEA: "Ask the operator a question mid-run; continue with the answer — even across a restart."

**Stage A:** process effect with a human checkpoint; evidence = the question + the answer, journaled; class: PROCESS (durable).

**Stage B:** the durable-ask pattern — `prompt(mode:"ask-launcher")` (5K-8: `DurableDeferred`) in a Workflow-durable run. The question surfaces through the tool result; the launcher's answer completes the Deferred; a restart between question and answer loses NOTHING (the deferred + the journal are the resume anchor).

**Stage C — the shape (the durable form; the card ships the pipeline stand-in per the slot convention):**

```jsonc
{ "id": "ask", "type": "prompt", "tier": 2,
  "config": { "mode": "ask-launcher",
              "template": "Deploy target confirmed? [yes/no]",
              "bracket": { "contract": "json", "repair": 2, "confidenceFloor": 0.85 } } }
```
The lesson: the question SURVIVES the process. That is the difference between a pause node and a hope.

### 4.5 — IDEA: "Generate a config file from a template — and PROVE the output is valid JSON before anything consumes it."

**Stage A:** generate effect (tier 2); evidence = the bracket-validated output + the write receipt; needs Llm (the operator's seat); intolerable failure = an invalid config consumed downstream.

**Stage B:** the generate→verify bracket: `gate` (pre-conditions) → `prompt(bracket.contract:"json")` → `gate` (parse + schema assert) → repair ≤ 2 → `file-io` write → `triplet-writer` proof. Class: PROCESS (generate → verify → commit).

**Stage C — the card:**

```jsonc
{ "$schema": "trident-workflow-v1",
  "meta": { "name": "config-gen", "tier": 2 },
  "nodes": [
    { "id": "preflight", "type": "gate",
      "config": { "asserts": [{ "path": "$.spec", "op": "contains", "value": "services" }] } },
    { "id": "gen", "type": "prompt", "tier": 2,
      "config": { "mode": "llm", "template": "Emit the config JSON for: {{spec}}",
                  "bracket": { "contract": "json", "repair": 2, "confidenceFloor": 0.85 } } },
    { "id": "validate", "type": "gate",
      "config": { "asserts": [{ "path": "$.services", "op": "contains", "value": "api" }] } },
    { "id": "commit", "type": "file-io",
      "config": { "op": "write", "path": "config/generated.json" } },
    { "id": "proof", "type": "triplet-writer",
      "config": { "triplet": { "pattern": "config.gen", "state": "WRITTEN", "anchor": "config-gen:1" } } },
    { "id": "sink", "type": "journal-sink" } ],
  "edges": [
    { "from": "preflight", "to": "gen",     "via": "spec" },
    { "from": "gen",       "to": "validate","via": "output" },
    { "from": "validate",  "to": "commit",  "via": "valid" },
    { "from": "commit",    "to": "proof",   "via": "written" },
    { "from": "proof",     "to": "sink",    "via": "data" } ],
  "vars": { "spec": "api + worker + queue" } }
```
The bracket mechanics: `checkContractViolation` (nodes/prompt.ts:69-84) parses the model's output against `contract:"json"` — a violation consumes a repair (≤ 2), then fails LOUD. The model cannot lie past the bracket.

### 4.6 — THE PATTERN ACROSS ALL FIVE

Every walkthrough followed the same six moves:

```
1. INTENT in writing (what + evidence + class + scope + the intolerable failure)
2. DECOMPOSE into primitives (verb → node skeleton, Part 2 table)
3. AUTHOR the graph (gates bracket the work; unique vias; journal at the end)
4. PRICE (caps honest; budget set; never route around CAP-UNBOUND)
5. CAST until PASS (refusals are compile errors — fix the card, never the refusal)
6. PERMANENCE (kernel if it recurs — Part 5; rocket if it distributes — Part 6)
```

### 4.7 — IDEA: "Replay exactly what happened in run X — and prove nothing was tampered with."

**Stage A:** evidence effect; evidence = the rebuilt summary + the chain verification; class: EVIDENCE/REPLAY.

**Stage B:** `replay-source(runId)` pulls the journaled rows; `rebuildSummaryFromRows` reconstructs; `verifyChain` proves the chain; the rebuilt verdict IS the past verdict — recomputed, not remembered.

**Stage C — the card:**

```jsonc
{ "$schema": "trident-workflow-v1",
  "meta": { "name": "forensic-replay", "tier": 1 },
  "nodes": [
    { "id": "replay", "type": "replay-source",
      "config": { "runId": "wf-1788450759873-k3j2x1" } },
    { "id": "assert", "type": "gate",
      "config": { "asserts": [{ "path": "$.verdict", "op": "eq", "value": "PASS" }] } },
    { "id": "sink",   "type": "journal-sink" } ],
  "edges": [
    { "from": "replay", "to": "assert", "via": "replayed" },
    { "from": "assert", "to": "sink",   "via": "data" } ],
  "vars": {} }
```
The empty case: a runId with no rows returns INCONCLUSIVE/EMPTY — the honest answer. Never fabricate a PASS for missing history (P2-6).

### 4.8 — IDEA: "If the API fails three times in five minutes, stop calling it entirely."

**Stage A:** protective/reactive effect; evidence = the breaker state transitions; class: REACTIVE + STATEFUL.

**Stage B:** `circuit-breaker(threshold: 3)` wrapping the call site; the breaker's Ref state persists across nodes in the run; OPEN state refuses invocations without executing them.

**Stage C — the card:**

```jsonc
{ "id": "breaker", "type": "circuit-breaker", "config": { "threshold": 3, "window": 300000 } },
{ "id": "call",    "type": "http-request",
  "config": { "url": "https://api.example.com", "method": "GET", "timeoutMs": 8000 } }
```
Edge: `breaker → call`. After 3 failures in the window, the breaker OPENs: the call node is never invoked, the breaker emits a FAIL verdict with `outputs: {reason: "circuit OPEN"}` — the loud refusal that saves the upstream provider and your budget. The `_resetCircuit` export exists for test isolation only; production reset is a NEW RUN (the state is the point).

### 4.9 — IDEA: "Lock the deployment config after validation — any later mutation is a defect."

**Stage A:** protective/stateful effect; evidence = the lock state + the mutation rejection; class: STATEFUL.

**Stage B:** `config-lock(keys: [budget, caps, targets])` — the first validation writes the keys into the Ref store; any later write to a locked key is a FAIL verdict naming the key and the two values.

**Stage C — the lesson generalized:** the kernel's stateful nodes (circuit-breaker, config-lock, escalation-memory, evidence-machine) all share the same shape: a module-level Ref store, an admission path, and a LOUD rejection path. When you need "remember and refuse," compose these — do not build a side-channel store.

### 4.10 — IDEA: "Run this same effect every time a specific event fires — forever."

**Stage A:** reactive/perpetual effect; evidence = one journal chain per firing; class: REACTIVE/PERPETUAL.

**Stage B:** `event-filter(on:{event: "deploy.complete"})` → the work → `journal-sink`. The event-filter's subscription survives the first firing — each subsequent event re-wakes the node (the graph stays a DAG; the BUS does the looping).

**Stage C — the distinction that matters:** `cron-trigger` loops on TIME; `event-reactivate` loops on an EVENT after COMPLETION; `event-filter` never completes — it subscribes. Choosing wrong: cron for event-driven = missed firings between ticks; event-filter for scheduled = never fires without the event. Part 2's table maps the verb; this paragraph maps the TIME MODEL.

---

<!-- ═══════════ PART 5: PRODUCTION KERNELS ═══════════ -->

## PART 5 — PRODUCTION KERNELS (when a card graduates)

A card proves an effect ONCE. A production kernel makes it a PERMANENT, FIRST-CLASS citizen of the runtime — the effect others compose with.

### 5.1 — When a card graduates

Graduate when ALL of: (1) the card casts PASS repeatedly across real inputs; (2) the effect has a NAME others would use ("the secret gate", "verified ship"); (3) it needs domain logic a generic kind cannot express (custom thresholds, ingestion shapes); (4) its negative fixtures are known (what it must REFUSE).

### 5.2 — The graduation procedure

```bash
mkdir -p jesl/kernels/my-effect/fixtures
# 1. workflow.json  — the card, byte-preserved (the CONTRACT)
# 2. activities.ts  — the stage's DOMAIN nodes if generic kinds cannot express the logic;
#                     each: NodeImpl + replaceStubSync registration + ≥2 adversarial tests
# 3. fixtures/      — positive inputs + one negative per refusal the stage must produce
# 4. SKILL.md       — the operator card: what it takes in, what it produces, when to run
```
The stage joins the runtime by casting — `bun run cli/main.ts run kernels/my-effect/workflow.json` — no executor changes, no special cases (law 2O: rockets are ordinary nodes).

### 5.3 — The graduation gate

`bunx tsc --noEmit` → 0 · `npx vitest run` → green with the stage's new tests · the stage's negative fixtures refuse with the right tokens · the full battery still green (zero regressions). A kernel that cannot pass its own battery is a wish, not an effect.

---

<!-- ═══════════ PART 6: SKILL ROCKETS ═══════════ -->

## PART 6 — SKILL ROCKETS (the effect, packaged)

The skill rocket is the effect DISTRIBUTED: named, owned, packaged, castable by anyone with the kernel.

```ts
import { emitSkill } from "./packager/skill.ts"
await emitSkill(doc, outDir, writer)
```

Emits (packager/skill.ts:53-78):

| file | contents | role |
|---|---|---|
| `SKILL.md` | the fuse + the launch line `jesl run payload/workflow.json --in payload/ctx.json` | the operator card |
| `payload/workflow.json` | the spell, byte-preserved | THE artifact |
| `payload/ctx.json` | vars/seed | the input binding |
| `mission.md` | the objective | the intent, carried |
| `anti-patterns.json` | the misfire table | what NOT to do |

The rocket is DETERMINISTIC to produce (same doc + profile ⇒ byte-identical package) and DETERMINISTIC to run (journal `covers()` replays it exactly). Distribution without provenance is how effects lose their names — the manifest IS the name.

---

<!-- ═══════════ PART 7: THE ADVANCED DEGREES ═══════════ -->

## PART 7 — THE ADVANCED DEGREES (composition, processes, meta)

### 7.1 — Composition (cards within cards)

Three modes (§2E.4): CHAINING (A's outputs feed B's channels — the spell is the chain); NESTING (embed a proven card's graph as a phase — the lifecycle kernels do this); DISPATCH (spawn a sub-card at runtime behind oracle gates, repair ≤ 2, 3-strike FAIL — delegation with gates, never unbound).

### 7.2 — The stacking algebra (operational)

Distinct runIds stack; same docHash+seed REPLAYS (never accumulates); amplifier-before-amplified is enforced by the EDGE ORDER (the dataflow is the only order); budget loops are legal but journaled (cost is conserved-and-relocated). When nesting, re-derive order from channels — there is no implicit sequence.

### 7.3 — Durable processes (the meta tier, earned)

Any run containing `pause` or `ask-launcher` must be a Workflow-durable run (§2D.3): `Workflow.make` + per-node Activities + `DurableDeferred` for the asks. The payoff: kill -9 between steps, restart, and the run CONTINUES from the journal. The cost: every effectful node is an Activity (idempotency via docHash+seed). The rule: tier-2 generation and human checkpoints DEMAND durability; pure deterministic runs can stay ephemeral.

### 7.4 — The meta tier (changing the compiler itself)

Adding a node kind (P3-3), a scanner family, a driver, or a profile IS the meta tier — you are editing the vocabulary future effects compose from. The discipline: the registry is append-only; the 8 tokens are frozen; the purity boundary holds; every new kind carries ≥2 adversarial tests. The canon warning applies literally: the meta tier without discipline is where overrun kills and stray thoughts redirect. Earn it through the composed tier.

### 7.5 — Scaling the method itself

The method (Part 1) scales from one card to systems: the 6-stage rocket chain IS the method applied recursively (idea→bible, bible→spec, spec→kernels, kernels→code, verify, ship — each stage a castable card consuming the previous stage's outputs). When an idea is too big for one card, it is not too big for the method — it is a CHAIN of effects, and the chain is itself a card at the next scale.

---

<!-- ═══════════ PART 8: THE VALIDATION LAYER ═══════════ -->

## PART 8 — THE VALIDATION LAYER (the shared mechanics, compressed)

The method's universality is not asserted — it was EVIDENCED by decomposing four independent, decades-surviving effect systems and finding the same compiler underneath (the full analysis lives in `archive/EFFECT_ENGINEERING_BIBLE.md` v2.0 — retained as the reference):

- the effect primitive `{effect-class, scale, duration, scope, targeting}` appears identically in all four (Oblivion altars, Skyrim tomes, Witcher formulae, Eragon sentences);
- the pricing law holds everywhere (TES `cost = B·M^1.28·D·A`, Eragon `cost = mundane effort`, Witcher essence draw) with the capacity check BEFORE release — JESL's cap pre-flight is the same law;
- the stacking algebra (multiplicative, ordered, same-identity-replaces) is measured in Oblivion's ladder (1→4→…→1089×) and honored by JESL's runId/seed semantics;
- the interface-compiler (bounded vocabulary, total semantics, deterministic grammar) is Eragon's Ancient Language design — and IS the JESL schema + registry + token set;
- the 9-stage pipeline runs in all four, and every recorded catastrophe (mis-focus, overrun death, unpriced effects, narrated renders) is a SKIPPED STAGE.

**The one-line summary:** four teams, four syntaxes, one spec. JESL is that spec, compiled. The canon systems are its design reviews; the kernel is its implementation; this bible is its user manual.

---

## PART 9 — VERSION HISTORY

- v3.0 (2026-09-04): THE OPERATIONAL REWRITE (operator-directed). v2.0 analyzed the magic-system metaphor; v3.0 teaches the METHOD it proved: idea → intent capture → primitive decomposition → pipeline authoring → pricing → pre-flight → release → render → settle → record → production kernel → skill rocket. Seven complete worked walkthroughs (the secret-write gate, verified-ship, api-drift-watch, the durable ask, config-gen, forensic replay, circuit-breaker). The canon-systems material compressed into Part 0 (the proof) + Part 8 (the validation layer); the full v2.0 analysis retained in `archive/`.
- v2.0 (2026-08): the shared macro mechanics analysis (the lore-adjacent version this rewrite supersedes).
- Superseded by nothing; companion to `JESL_BIBLE.md` v3.0 (the master canon — architecture + reference). WHERE THEY OVERLAP, THE MASTER WINS on kernel facts; THIS document owns the engineering METHOD.
