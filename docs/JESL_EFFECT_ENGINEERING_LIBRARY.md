# JESL ENGINEERING KNOWLEDGE LIBRARY — THE FULL MACRO
# Cards · Rolodex · Compiler Machines · Kernels · Rockets · TDM · Algorithms

> **TRIGGER:** Any agent authoring JESL Cards, building Kernel machines, packaging Skill Rockets, or casting spells against real systems.
> **DUTY:** Read fully. Then operate. This is the complete JESL knowledge library — the card system, the kernel mechanics, the Effect Engineering pipeline, the TDM frameworks, and the algorithm layer.
> **PROTOCOL:** One-shot read. Then execute P3-1..P3-6.

**THE SENTENCES OF DISCIPLINE:**
1. A JESL Card is one intended effect as a self-contained artifact: a JSON graph (nodes + edges) wrapped in a scripting shell (config + vars + evidence contract) — one card, one effect, always.
2. Cards feed Compiler Machines (kernels); kernels render them live; the journal proves the render; rockets package the proven spell for anyone to cast.
3. Everything is a card composition: a spell is a card chain, an algorithm is an active card chain, a kernel machine is a card-execution engine — master the card and you master the system.

---

## PART 1 — CRITICAL RULES

### 1A — THE CARD LAW
1. ALWAYS model one intended effect as ONE JESL Card: a JSON graph (nodes + edges) wrapped in a scripting shell (config + vars + evidence contract). One card, one effect — a card that does two things is two cards.
2. NEVER inline an effect's logic outside its card. The card IS the unit of authoring, pricing, journaling, and reuse — logic outside a card is unpriced, unjournaled, uncastleable.
3. MUST give every card its evidence contract: which node's verdict row proves the effect fired. A card without its proof row is a wish, not a spell.

### 1B — THE ROLODEX LAW
1. ALWAYS index authored cards in the rolodex (the registry + the lexicon families) — an unindexed card cannot be found, composed, or cast again.
2. NEVER rename a card's kinds — the registry is append-only (D7): a v1 card runs on every later kernel forever.
3. MUST organize cards into lexicon families (deterministic / decision / evidence / execution / generation / orchestration) — the family determines the tier and the bracket requirements.

### 1C — THE COMPILER LAW
1. ALWAYS feed cards through the compiler machine before execution: decodeDoc (the schema gate) → validateDoc (the 5 refusals) → graph build (the dataflow order) → runProgram (the priced release).
2. NEVER execute an unvalidated card — the 5 refusals exist to catch malformed cards BEFORE any fiber starts.
3. MUST treat the kernel as the compiler machine: it takes cards in, renders them live, and journals the experienced effect as evidence.

### 1D — THE KERNEL LAW
1. ALWAYS pick the machine type deliberately: EPHEMERAL (fire → journal → die), PERSISTENT (durable, resumable), DYNAMIC (composes new cards at runtime), CONTEXT-AWARE (profiles/bindings change behavior by domain).
2. NEVER let a persistent machine run without its journal — the journal IS the machine's memory.
3. MUST journal every card invocation (invoke + verdict rows) — the experienced effect is computed FROM rows, never narrated.

### 1E — THE ROCKET LAW
1. ALWAYS package proven spells as Skill Rockets: SKILL.md (the fuse) + payload/ (the byte-preserved card + ctx + mission + anti-patterns).
2. NEVER ship a rocket whose card has not passed the kernel gate (tsc 0 + vitest green + host-gate suite).
3. MUST keep the launch line byte-exact: `jesl run payload/workflow.json --in payload/ctx.json`.

### 1F — THE LEXICON LAW
1. ALWAYS grow the lexicon by composing existing cards before authoring new kinds — the registry is append-only; new kinds are the LAST resort.
2. NEVER mix lexicon families inside one tier boundary without a gate: deterministic cards need no caps; generation cards MUST be bracketed.
3. MUST let the lexicon drive kernel intelligence: a context-aware machine reads its domain profile's lexicon to decide which cards are legal, which are priced, and which are refused.

## PART 2 — JESL SCRIPTING: THE CARD SYSTEM (FULL MACRO)

### 2A — WHAT A JESL CARD IS

A **JESL Card** is one intended effect as a self-contained, executable artifact. It has exactly two faces:

```
┌─────────────────────── THE JESL CARD ─────────────────────────┐
│                                                               │
│  FACE 1: THE JSON GRAPH (the body)                            │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ nodes[]  — the operations (registry kinds)          │      │
│  │ edges[]  — the dataflow order (via channels)        │      │
│  │ vars     — the cast context (the seed)              │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                               │
│  FACE 2: THE SCRIPTING SHELL (the contract)                   │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ meta     — name + tier (the card's identity)        │      │
│  │ config   — per-node parameters (the pricing)        │      │
│  │ evidence — which verdict row proves it fired        │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                               │
│  ONE CARD = ONE EFFECT. No exceptions.                        │
└───────────────────────────────────────────────────────────────┘
```

The card is the atom of the entire system. A **spell** is a card (or a card chain). An **algorithm** is an active card chain. A **kernel machine** is an engine that executes cards. Master the card and the rest is composition.

The card inherits directly from the canon mechanics (EFFECT_ENGINEERING_BIBLE §2): its JSON graph is the altar composition (Oblivion — compose from known effects), its shell is the formula binding (Witcher — "The Power bound in spell formulae"), and its evidence contract is the journal law (Eragon — the process spell leaves evidence at every stop boundary).

### 2B — THE CARD ANATOMY (a real card, annotated)

```json
{
  "$schema": "trident-workflow-v1",
  "meta": {
    "name": "mech-gate",              // ← the card's NAME (the formula identity)
    "tier": 1                         // ← the TIER: 1 = deterministic (no caps),
  },                                  //   2 = generation allowed (must bracket)
  "vars": { "event": "seed" },        // ← the CAST CONTEXT (what the card is seeded with)
  "nodes": [
    { "id": "gateA",   "type": "gate" },
    { "id": "triplet", "type": "triplet-writer",
      "config": { "triplet": { "pattern": "mech.gate",
                               "state": "PASS",
                               "anchor": "mech-gate:1" } } },
    { "id": "gateB",   "type": "gate",
      "config": { "asserts": [{ "path": "$.triplet.state",
                                "op": "eq", "value": "PASS" }] } },
    { "id": "sink",    "type": "journal-sink" }
  ],
  "edges": [
    { "from": "gateA",   "to": "triplet", "via": "seed" },
    { "from": "triplet", "to": "gateB",   "via": "triplet" },
    { "from": "gateB",   "to": "sink",    "via": "data" }
  ]
}
```

Reading the anatomy: `meta.name` is the card's identity in the rolodex. `meta.tier` prices the card's power (1 = no caps needed; 2 = the bracket must be present on generation nodes). `vars` seeds the channels. Each node is one operation from the registry; each edge's `via` names the channel that carries data between them. The `triplet` node's config IS the evidence contract — the `{pattern, state, anchor}` that the journal will record.

### 2C — THE CARD ROLODEX

The **rolodex** is the indexed collection of all authored cards. It has two layers:

```
┌──────────────────── THE CARD ROLODEX ─────────────────────────┐
│                                                               │
│  LAYER 1: THE REGISTRY (the kernel's known kinds)             │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ 37 kinds · append-only · never renamed              │      │
│  │ deterministic: gate, event-filter, pipeline, ...    │      │
│  │ decision:      math-eval, state-machine, ...        │      │
│  │ evidence:      journal-sink, triplet-writer, ...    │      │
│  │ execution:     shell-exec, http-request, ...        │      │
│  │ generation:    prompt (bracketed, tier 2)           │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                               │
│  LAYER 2: THE LEXICON FAMILIES (the organizational layer)     │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ gates:        lock/assert/refuse cards              │      │
│  │ transforms:   pipeline/parallel/math cards          │      │
│  │ evidence:     journal/triplet/audit cards           │      │
│  │ execution:    shell/http/file cards (cap-bound)     │      │
│  │ generation:   prompt/shadow-agent (bracketed)       │      │
│  │ orchestration:retry/fallback/pause/replay cards     │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                               │
│  A card is LOOKED UP by name, COMPOSED by family,             │
│  PRICED by tier, and PROVEN by its evidence contract.         │
└───────────────────────────────────────────────────────────────┘
```

Layer 1 is mechanical (the kernel refuses unknown kinds). Layer 2 is organizational (the lexicon families tell the author which cards compose well and what tier they carry). Together they are the altar: you compose only from what you know, exactly as Oblivion's spellmaking altar demands.

### 2D — THE COMPILER MACHINE ANALOGY

The kernel IS a compiler machine. Cards go in; compiled pipelines come out; the render is live. The full pass:

```
┌──────────────────── THE COMPILER MACHINE ─────────────────────┐
│                                                               │
│  CARD IN (spell.json)                                         │
│      │                                                        │
│      ▼                                                        │
│  ┌──────────────┐  decodeDoc: the schema gate                 │
│  │ 1. PARSE     │  the card's JSON must match the shape      │
│  │    (lexical) │  $schema literal · nodes non-empty ·       │
│  │              │  edges well-formed · vars record           │
│  └──────┬───────┘                                            │
│         ▼                                                     │
│  ┌──────────────┐  validateDoc: the semantic gate             │
│  │ 2. VALIDATE  │  dup-id · unknown-kind · dangling-edge ·   │
│  │    (syntax)  │  cycle · tier — the 5 refusals             │
│  └──────┬───────┘                                            │
│         ▼                                                     │
│  ┌──────────────┐  buildGraph: the dataflow compiler          │
│  │ 3. COMPILE   │  readiness sets · Kahn batches · cycle     │
│  │    (codegen) │  detection · chunk at 15                   │
│  └──────┬───────┘                                            │
│         ▼                                                     │
│  ┌──────────────┐  runProgram: the priced release             │
│  │ 4. EXECUTE   │  cap pre-flight · forEach(15) ·            │
│  │    (runtime) │  journal INVOKE → invoke → VERDICT         │
│  └──────┬───────┘                                            │
│         ▼                                                     │
│  CARD RENDERED (the experienced effect, journaled)            │
└───────────────────────────────────────────────────────────────┘
```

The compiler phases map 1:1 to the canon stages: PARSE = the interface binding (nothing runs outside the language), VALIDATE = the altar checks (compose only known effects), COMPILE = the structural order (the dataflow IS the spell's order), EXECUTE = the priced release (cap pre-flight before any invoke).

### 2E — THE CARD LEXICON SYSTEMS

The **lexicon** is what turns a pile of cards into an intelligent machine. Three lexicon systems:

**SYSTEM 1 — THE FAMILY LEXICON** (what kind of card is this?)

| Family | Kinds | Tier | Caps | Bracket |
|---|---|---|---|---|
| gates | gate, oracle-gate, claim-gate, evidence-gate | 1 | none | no |
| transforms | pipeline, parallel, math-eval, state-machine | 1 | none | no |
| evidence | journal-sink, triplet-writer, evidence-machine | 1 | none | no |
| execution | shell-exec, python-exec, http-request, file-io | 1 | YES (Shell/Fs/Http) | no |
| orchestration | retry-chain, fallback-chain, pause, parallel | 1 | none | no |
| generation | prompt, shadow-agent, subagent-dispatch | 2 | Llm/Subagent | YES |

**SYSTEM 2 — THE COMPOSITION LEXICON** (which cards compose well?)

| Pattern | Card chain | Use |
|---|---|---|
| guard → work → prove | gate → [any work] → triplet-writer | the standard spell shape |
| try → fail → recover | retry-chain → fallback-chain | resilience spells |
| fan-out → join | parallel → gate (all-PASS assert) | parallel work with a join barrier |
| hold → resume | pause → [downstream] | durable waits (the ask-launcher) |
| compute → discharge | math-eval → oracle-discharge | MPSE discharge spells |
| generate → verify | prompt(bracketed) → schema-gate → repair≤2 | tier-2 generation |

**SYSTEM 3 — THE TIER LEXICON** (what may this card do?)

| Tier | May do | Requires |
|---|---|---|
| 1 | any deterministic / execution / evidence card | the right driver caps for execution |
| 2 | everything tier-1 does + generation cards | bracket{contract, repair≤2, floor} on every generation node |

### 2F — CARD COMPOSITION (cards within cards)

Cards compose in three ways:

```
┌──────────────────── CARD COMPOSITION ─────────────────────────┐
│                                                               │
│  1. CHAINING (card A's output feeds card B's input)           │
│     [card A]──via channel──►[card B]──via channel──►[card C]  │
│     the spell IS the chain — the edges are the composition    │
│                                                               │
│  2. NESTING (a card's graph embeds another card's graph)      │
│     ┌─ spell card ──────────────────────────┐                 │
│     │  node "phase1" = copy of card A's graph│                 │
│     │  node "phase2" = copy of card B's graph│                 │
│     └────────────────────────────────────────┘                 │
│     the lifecycle kernels do this: each kernel's nodes         │
│     embed the previous kernel's proven card shapes             │
│                                                               │
│  3. DISPATCH (a card spawns a sub-card at runtime)            │
│     subagent-dispatch / prompt nodes fire child cards          │
│     behind oracle gates — repair ≤ 2, 3-strike FAIL            │
│     (the delegation risk: unbound dispatch = possession)       │
└───────────────────────────────────────────────────────────────┘
```

The lifecycle pipeline (idea→bible→spec→kernels→code→verify→ship) is itself a card chain at the macro scale: each kernel is a card whose Effect consumes the previous kernel's output channels.

## PART 3 — JESL KERNELS: SPELL EXECUTION MECHANICS

### 3A — HOW CARDS GET FED INTO KERNELS

A kernel consumes cards through three ingestion paths:

```
┌────────────────── CARD INGESTION PATHS ───────────────────────┐
│                                                               │
│  PATH 1: CLI (the direct cast)                                │
│    jesl run card.json [--in vars.json] [--driver cli|test]    │
│    → validate → graph → execute → stdout summary + exit code  │
│                                                               │
│  PATH 2: PROGRAMMATIC (the embedded cast)                     │
│    import { runProgram } from "./core/executor"               │
│    const doc = yield* decodeDoc(cardJson)                     │
│    yield* validateDoc(doc, isKnownKind)                       │
│    const summary = yield* runProgram(doc, ctx)                │
│    → the host owns the edge (ONE runPromise at cli/main)      │
│                                                               │
│  PATH 3: WORKFLOW (the durable cast)                          │
│    Workflow.make JeslRun: payload{docHash, seed}              │
 │    idempotencyKey = docHash:hashSeed → covers() → replay     │
│    → survive process death · resume from journal · no-re-pay  │
│                                                               │
│  ALL THREE PATHS CONVERGE ON THE SAME COMPILER MACHINE:       │
│  decode → validate → graph → execute → journal                │
└───────────────────────────────────────────────────────────────┘
```

### 3B — THE FOUR MACHINE TYPES

```
┌──────────────────── THE MACHINE MATRIX ───────────────────────┐
│                                                               │
│  EPHEMERAL ──── fire → journal → die                          │
│  │  the skill rocket cast: one run, one artifact, done        │
│  │  mechanics: runProgram + journal rows + exit               │
│  │  canon: the one-shot spell (Fireball)                       │
│  │                                                             │
│  PERSISTENT ─── durable, resumable, survives death             │
│  │  the Workflow layer: JeslRun + DurableDeferred              │
│  │  mechanics: idempotencyKey(docHash:seed) + covers()         │
│  │  canon: Eragon's process spell (cancellable, checkpoints)   │
│  │                                                             │
│  DYNAMIC ────── composes NEW cards at runtime                  │
│  │  the MPSE bridge: spec → kernel-emit → stub-emit            │
│  │  mechanics: runDemo → emitKernelProto → emitStubs           │
│  │  canon: the meta-name (know the language's own name)        │
│  │                                                             │
│  CONTEXT-AWARE  behavior changes by domain profile             │
│  │  profiles + bindings: trident/trading/sales                 │
│  │  mechanics: DomainModule {caps, kinds, tier, brackets}      │
│  │  canon: the elemental draw (fire mages take on fire)        │
│  │                                                             │
│  ┌─────────────┬───────────┬───────────┬─────────────────┐    │
│  │ MACHINE     │ LAYER     │ LIVES ON  │ CARD SOURCE     │    │
│  ├─────────────┼───────────┼───────────┼─────────────────┤    │
│  │ EPHEMERAL   │ runProgram│ one run   │ a single card   │    │
│  │ PERSISTENT  │ Workflow  │ days      │ a card chain    │    │
│  │ DYNAMIC     │ MPSE emit │ compile   │ generates cards │    │
│  │ CTX-AWARE   │ profiles  │ domain    │ lexicon-filtered│    │
│  └─────────────┴───────────┴───────────┴─────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

### 3C — BUILDING PERSISTENT MACHINES

A persistent machine wraps cards in the Workflow layer: `JeslRun` (workflow/jesl-run.ts) takes `{docHash, seed}`, computes the idempotencyKey, checks `covers()` — if the journal already covers this exact cast, the verdict is rebuilt FROM rows with invoke counter 0. Otherwise `runProgram` executes and journals.

```
PERSISTENT MACHINE LIFECYCLE:

 cast(card, seed) ──► covers(docHash, seed)?
        │                    │
        │                    ├── true ──► REPLAY: verdict FROM rows
        │                    │            invoke counter 0 (no re-pay)
        │                    └── false ─► EXECUTE: runProgram
        │                                    journal INVOKE/VERDICT rows
        ▼                                    receipt{runId, verdict, rows}
 process death (kill -9)
        │
        ▼
 re-cast(card, seed) ──► covers finds the partial journal
        │                  → resume from the LAST COMPLETE row
        ▼                  → every line parses JSON (kill-safe)
 the run continues — the DurableDeferred ask persists across
 the death boundary (ask row → answer row → resume)
```

Build recipe: wrap the card in `makeJeslRunLayer(doc, makeCtx)` (jesl-run.ts:153-167). Provide the Journal layer. The kernel now survives `kill -9` mid-run and resumes from the journal.

### 3D — BUILDING EPHEMERAL MACHINES

An ephemeral machine is the default: `runProgram(doc, ctx)` fires, journals, exits. No Workflow wrapper, no covers check. This is the rocket-cast tier: the packager's `emitSkill` produces the card directory; the launch line runs it once; the journal is the receipt. Build recipe: any card + the CLI. Done.

### 3E — BUILDING DYNAMIC MACHINES

A dynamic machine GENERATES new cards at runtime. The MPSE bridge is the proof: `runDemo(spec.md)` parses math contracts → compiles oracle rows → emits kernel prototypes (`Activity.make` skeletons) and delta stubs — the deterministic substrate EXECUTES under TestLive before implementation code exists. Build recipe: compose `runDemoSync(specPath)` (mpse/demo.ts) + `assertD17` (born-off → EXCLUDED) + `runDryRun` (the emitted kernel executes headless).

### 3F — BUILDING CONTEXT-AWARE MACHINES

A context-aware machine reads its domain profile and filters the lexicon accordingly:

```
CONTEXT-AWARE MACHINE:

 DomainModule {name, caps, kinds, tier, brackets}
        │
        ▼
 ┌─ profile filter ─────────────────────────────────────────┐
 │ trident (t1): caps [Shell,Fs] · kinds [shell-exec,       │
 │   file-io, mpse-discharge, evidence-machine, audit-reg]  │
 │   brackets: {} — pure deterministic                      │
 │ trading (t2): caps [Http] · kinds [http-request,         │
 │   math-eval, oracle-gate, circuit-breaker, evidence-gate]│
 │   brackets: circuit-breaker → repair 1, floor 0.6        │
 │ sales (t2): caps [Http,Llm] · kinds [http-request,       │
 │   prompt, capture-engine, journal-sink]                  │
 │   brackets: prompt → repair 2, floor 0.55                │
 └──────────────────────────────────────────────────────────┘
        │
        ▼
 the SAME kernel, THREE behaviors — zero branches in the
 profile (pure data); the kernel reads the lexicon and
 refuses what the domain does not carry
```

Build recipe: author a `DomainModule` (zero if/switch — it is data), register it in the extraction PROFILES, bind it via `makeOpenCodeBinding(transport)`. The same kernel now refuses `prompt` under the trident profile but brackets it under sales.

### 3G — INTELLIGENT KERNEL MACHINES (lexicon-driven)

An intelligent kernel machine = kernel + lexicon + TDM. The composition:

```
┌──────────────── INTELLIGENT KERNEL MACHINE ───────────────────┐
│                                                               │
│   LEXICON (what cards exist, by family/tier/bracket)          │
│        │                                                      │
│        ▼                                                      │
│   TDM LENS (what the spell needs: frameworks, cascade,        │
│   velocity) ── selects cards + orders them + prices them      │
│        │                                                      │
│        ▼                                                      │
│   CARD CHAIN (the composed spell: nodes + edges + configs)    │
│        │                                                      │
│        ▼                                                      │
│   KERNEL (the compiler machine: validate → graph → run)       │
│        │                                                      │
│        ▼                                                      │
│   JOURNAL (the experienced effect: rows + verdicts)           │
│        │                                                      │
│        ▼                                                      │
│   FEEDBACK (framework effectiveness → the lexicon learns)     │
│        └──────────► back to LEXICON (L4 Completion)           │
│                                                               │
│  the machine INTELLIGENCE lives in the lexicon+TDM layer;     │
│  the kernel stays a dumb compiler — intelligence is DATA      │
└───────────────────────────────────────────────────────────────┘
```

## PART 4 — JESL SKILL ROCKETS: TARGETED SPELLS

A **Skill Rocket** is a targeted spell packaged as a drop-a-directory: the named formula (Witcher canon — "The Power bound in spell formulae... the most famous spells are named after their creators"). One mage authors it; every caster fires it.

```
┌────────────── THE SKILL ROCKET ANATOMY ───────────────────────┐
│                                                               │
│  emitSkill(doc, outDir, writer)  →  <outDir>/<name>/          │
│                                                               │
│  ┌── .opencode/skills/<spell-name>/ ─────────────────────┐    │
│  │                                                       │    │
│  │  SKILL.md            THE FUSE: identity + when +      │    │
│  │                      the launch line (byte-exact)     │    │
│  │ ┌── payload/ ──────────────────────────────────┐      │    │
│  │ │ workflow.json      the CARD, byte-preserved  │      │    │
│  │ │ ctx.json           vars + seed               │      │    │
│  │ │ mission.md         objective + constraints   │      │    │
│  │ │ anti-patterns.json the misfire table         │      │    │
│  │ └──────────────────────────────────────────────┘      │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                               │
│  LAUNCH: jesl run payload/workflow.json --in payload/ctx.json │
│  RESULT: journaled · verdict-FROM-rows · replayable           │
└───────────────────────────────────────────────────────────────┘
```

The rocket stages (the spell's lifecycle after packaging):

```
 AUTHOR ──► GATE ──► PACKAGE ──► SHIP ──► CAST ──► JOURNAL ──► (REPLAY)
   │          │         │         │        │         │
 compose   tsc+vitest emitSkill  drop    jesl run  rows prove   covers()
 the card  host-gate  (criterion  into    the fuse  the effect  → free
                                    .opencode/          fired       re-render
```

Rules: the launch line is `SKILL_LAUNCH_LINE` byte-exact (asserted by packager.test). All three emitters re-validate the doc first (criterion 9 — a rocket ships only valid cards). The card inside the rocket is byte-preserved via `canonicalJson` (stable 2-space ordering).

## PART 5 — JESL ENGINEERING A-Z: THE 5-STAGE PIPELINE

### 5A — THE MASTER PIPELINE

```
                THE FIVE-STAGE ENGINEERING PIPELINE

 ┌──────────────────────────────────────────────────────────┐
 │ STAGE 1 — WRITE THE SPELL                                │
 │  the triad bound into ONE document:                      │
 │  IDEA (meta+vars) · EFFECT (nodes+edges) ·               │
 │  EXPERIENCED (the journal/verdict contract)              │
 └──────────────────────────────────────────────────────────┘
                            │ spell.json
                            ▼
 ┌──────────────────────────────────────────────────────────┐
 │ STAGE 2 — CONVERT TO TDM                                 │
 │  the decision lens on the spell's shape:                 │
 │  L0 classify · L1 invariant+options · L2 ≤5 frameworks   │
 │  L3 velocity (tier-1 cast now / tier-2 deliberate)       │
 └──────────────────────────────────────────────────────────┘
                            │ framework set
                            ▼
 ┌──────────────────────────────────────────────────────────┐
 │ STAGE 3 — CONVERT TDM → JESL SCRIPTS                     │
 │  each framework compiles to graph structure:             │
 │  cascade→edges · audit→oracle cards · reversibility→pause│
 │  premortem→fallback · sniff→passToken check              │
 └──────────────────────────────────────────────────────────┘
                            │ compiled spell
                            ▼
 ┌──────────────────────────────────────────────────────────┐
 │ STAGE 4 — THE JESL KERNEL (the real-time renderer)       │
 │  runProgram executes LIVE · journal records the          │
 │  experience AS EVIDENCE · bus streams the render ·       │
 │  covers() replays at zero cost                           │
 └──────────────────────────────────────────────────────────┘
                            │ the living render
                            ▼
 ┌──────────────────────────────────────────────────────────┐
 │ STAGE 5 — THE SKILL ROCKET (the castable spell)          │
 │  emitSkill → SKILL.md (fuse) + payload/{workflow.json,   │
 │  ctx.json, mission.md, anti-patterns.json}               │
 │  drop-a-directory · castable by anyone with the kernel   │
 └──────────────────────────────────────────────────────────┘

 THE POINT OF STAGE 4: it is the INJECTION POINT — the place
 where a static script becomes a living run in a runtime space,
 and the run is OBSERVED (journaled) rather than narrated.
```

### 5B — STAGE 1: WRITE THE SPELL (what the research contributed)

Every structural element of the spell document is a canon mechanic, compiled:

| Canon mechanic | Doc feature it produced | What it buys |
|---|---|---|
| **Grey Folk: bind language to magic** (Eragon) | `$schema: "trident-workflow-v1"` — nothing runs outside it | Total semantics: the doc cannot lie; refusals are frozen |
| **Altar composition: only effects you know** (Oblivion) | `nodes[]` with registry kinds + per-node `config` | Bounded vocabulary: only the 37 registered kinds compose |
| **Order matters** (Oblivion: weakness before damage) | `edges[]` with `via` channels | Structural order: the sequence IS the dataflow graph |
| **Skill tiers** (Skyrim: Novice→Master) | `meta.tier 1|2` — tier-2 generation must be bracketed | The canned-vs-authored split |
| **Held-image targeting** (Eragon) | `vars` seed — the explicit cast context | The cast inputs are declared, never implicit |
| **Energy economics** (all three) | budget + `requiredCaps` per node | Overrun is loud (CAP-UNBOUND), never silent |
| **Process spells** (Eragon's master tier) | the graph itself — journal rows between nodes | Every node boundary is a cancellation point |
| **Named formulae** (Witcher: Alzur's Thunder) | the workflow.json FILE | A spell is an ownable artifact |

### 5C — STAGE 2: CONVERT TO TDM

Run the card's shape through the decision lens: L0 classify (problemType/complexity/tier), L1 chart the invariant + pathPhases + option space (≥3), L2 compose ≤5 frameworks per phase (cascade depth 3, premortem, blast radius, sniff 0.85), L3 velocity by tier (tier-1 → decide now; tier-2 → deliberate — the 120s/60s constants).

### 5D — STAGE 3: CONVERT TDM → JESL

Each framework compiles to graph structure (the full map is Part 6): cascade → the edge graph; assumption-audit → oracle cards; reversibility → pause + journal checkpoints; premortem → fallback-chain + anti-patterns.json; sniff → the verify kernel's passToken check; blast radius → evidence machine + audit scanner.

### 5E — STAGE 4: THE KERNEL (real-time renderer)

The kernel is the injection point: runProgram executes the Effect live on Effect fibers; the journal captures the Experienced Effect three ways (sha256 rows, bus events, RunSummary); `covers(docHash, seed)` makes every repeat cast FREE — the experience is already journaled, it re-renders identically forever.

### 5F — STAGE 5: THE SKILL ROCKET

`emitSkill` packages the proven spell as a named formula — see Part 4.

### 5G — THE FIREBALL TRACE

```
 S1 WRITE:   meta{fireball,tier1} + seed{target,power}
             5 nodes: target-lock(gate) → price(math-eval:
             0.75×power — THE COST FUNCTION AS A NODE)
             → release(shell-exec) → resolve(gate: exit=0)
             → record(triplet: spell.fireball=CAST)

 S2 TDM:     L0: design/trivial/tier-1 · L1: invariant "damage
             accrues at target zone" · L2: PREMORTEM + BLAST_
             RADIUS + SNIFF 0.85 · L3: tier-1 → cast now

 S3 COMPILE: premortem → fallback-chain fixture · sniff →
             resolve gate asserts exit=0 · cascade → the 4
             edges · blast → record triplet scoped to zone

 S4 KERNEL:  lock PASS → price=7.5 → release execs → resolve
             PASS → triplet WRITTEN → 10 rows sha256-chained ·
             verdict PASS exit 0 · replay: covers=true, invoke 0

 S5 ROCKET:  emitSkill → .opencode/skills/fireball/

 idea ("explode at that target")
   → effect (the 5-node pipeline fires on Effect fibers)
     → experienced effect (the journal chain PROVES it fired,
       and replays identically forever)
```

## PART 6 — JESL TDM FRAMEWORKS (the full map)

The Trident Decision-Making engine (v4.4.3, 5 layers, 20 frameworks) is the spellcaster's mental discipline made mechanical. Each framework compiles to JESL graph structure:

| TDM framework | Spell reading | JESL compile |
|---|---|---|
| F1 FIRST_PRINCIPLES | decompose to irreducible primitives | the primitive set `{type,M,D,A,target}`; math-eval cost terms |
| F2 REVERSIBILITY | is the cast one-way? | pause node / durable ask; the gate bracket |
| F3 CONSEQUENCE_CASCADE | 1st/2nd/3rd-order effects | the edge graph depth (`via` channels) |
| F4 OPTION_EXHAUSTION | ≥3 formulations before choosing | ≥3 candidate docs + fixtures |
| F5 ASSUMPTION_AUDIT | every claim carries its expected value | oracle-gate + rule-cards (mandatory) |
| F6 CRITICAL_PATH | the minimal node chain | readiness-batch order (graph.ts) |
| F7 ELIMINATION | fewest nodes that satisfy | tier-1 kinds before generation |
| F8 MINIMUM_VIABLE_PATH | shortest castable doc | the diamond fixture (2 batches) |
| F9 PARALLEL_TRACKS | independent sub-effects concurrent | parallel node / ready-set overlap |
| F10 MENTAL_SIMULATION | the held-image render check | TestLive dry-run before real cast |
| F11 INFLECTION_DETECTION | stall = approach invalidated | the run loop's ready=∅ break |
| F12 BLAST_RADIUS | what else does the Effect touch | evidence machine + audit scope |
| F13 PREMORTEM | the misfire table before casting | fallback-chain + anti-patterns.json |
| F14 COGNITIVE_MODEL | which thinking mode | thinkingMode → tier choice |
| F15 DEPTH_CALIBRATION | analysis depth before casting | CONSEQUENCE_CASCADE_DEPTH 3 |
| F16 DECISION_VELOCITY | canned tier: now; meta tier: deliberate | 120s reversible / 60s irreversible |
| F17 DERIVATION_ENGINE | derive new spells from working ones | spec-to-kernels from a proven spell |
| F18 ENHANCEMENT_PROTOCOL | the 10x version | the stacking algebra (amplifier prep) |
| F19 CONVERGENCE_DETECTOR | the run settles at its attractor | executor loop termination |
| F20 SNIFF_TEST | would an adversarial reviewer accept it? | passToken IN tool output; 0.85 bar |

The TDM constants as spell constants: `MAX_DECISION_TIME_REVERSIBLE 120s` (the canned tier — cast now), `MIN_DELIBERATION_IRREVERSIBLE 60s` (the binding tier — oaths hold), `CONSEQUENCE_CASCADE_DEPTH 3` (3rd-order foresight before an irreversible cast), `OPTION_EXHAUSTION_MINIMUM 3` (never a binary spell — Eragon's success-or-death law), `SNIFF_TEST_CONFIDENCE 0.85`, `FRAMEWORK_COMPOSITION_MAX 5` (working memory per decision).

The 5 TDM layers mapped to the Effect Engineering loop:

| TDM Layer | When | Spell equivalent |
|---|---|---|
| L0 Pre-Activation | before charting | the IDEA classification (what kind of spell is this?) |
| L1 Strategic Cognition | at activation | the STRUCTURING (path, options, assumptions) |
| L2 Decision Engine | at every phase gate | the PRICING + PRE-FLIGHT (consequences, reversibility, recommendation) |
| L3 Meta-Cognitive | continuously | the MIS-FOCUS detector (traps: premature success, symptom-as-disease) |
| L4 Post-Completion | after the cast | the LESSON LEDGER (framework effectiveness → the lexicon learns) |

## PART 7 — JESL ALGORITHMS: ACTIVE SPELLS

### 7A — WHAT AN ACTIVE SPELL IS

An **active spell** is a card chain that is currently executing (or resumable from its journal). Where a card is the *source code* and a rocket is the *packaged artifact*, the active spell is the *running process*: it has a runId, journal rows accruing in real time, a budget burning down, and a verdict pending.

```
┌──────────────────── THE ACTIVE SPELL ─────────────────────────┐
│                                                               │
│   card (the source)     rocket (the package)                  │
│       │                     │                                 │
│       └────────┬────────────┘                                 │
│                ▼                                              │
│   ┌── THE ACTIVE SPELL (the live run) ──────────────────┐     │
│   │  runId: wf-<ts>-<rand>                              │     │
│   │  budget: burning down (deadlineMs 600s)             │     │
│   │  journal: rows accruing (invoke+verdict per node)   │     │
│   │  bus: events streaming (trace.timeline)             │     │
│   │  state: READY → RUNNING → SETTLING → VERDICT        │     │
│   └─────────────────────────────────────────────────────┘     │
│                │                                              │
│                ▼                                              │
│   the journal (the completed experienced effect)              │
│   covers(docHash, seed) = the active spell's resurrection     │
│   contract: re-cast identical = free replay                   │
└───────────────────────────────────────────────────────────────┘
```

### 7B — ALGORITHM PATTERNS (the named chains)

An **algorithm** is a NAMED CARD CHAIN — a reusable composition pattern that solves a class of problems. The library:

| Algorithm | Card chain | Solves |
|---|---|---|
| THE GUARD | gate → [work] → triplet-writer | standard spell shape: prove before + prove after |
| THE RETRY | retry-chain → fallback-chain | resilience: try N times, then degrade |
| THE FAN | parallel → gate(all-PASS) | parallel work with a join barrier |
| THE ORACLE | math-eval → oracle-discharge | MPSE discharge: math before code |
| THE BRACKET | gate → prompt(bracketed) → schema-gate | safe generation (repair ≤ 2) |
| THE ASK | prompt(ask-launcher) → durable ask | human-in-the-loop: suspend → answer → resume |
| THE CHAIN | covers() → replay → next-kernel | the lifecycle: each kernel feeds the next |
| THE PRE-ARM | PBA detect → arm → intercept | enforcement: think-police → do-police |
| THE VERIFY | scenario × N → passToken match | the battery: prove IN tool output |
| THE SHIP | manifest → copy → docs → audit | release with hash-verify + rollback |

Each algorithm is itself a card composition — and can be saved as a card (nesting), making algorithms compose into higher algorithms. The lifecycle pipeline is the macro-algorithm: 6 kernels chained.

### 7C — THE ALGORITHM LIBRARY

Algorithms live at `jesl/kernels/` (the 6 lifecycle macro-algorithms) and as named chains in the lexicon (the 10 patterns above). An active spell instantiates an algorithm with a specific card + seed:

```
ALGORITHM (THE GUARD)  +  CARD (mech-gate)  +  SEED ({event: seed})
        │
        ▼
  THE ACTIVE SPELL:  wf-1788430000-a3f2
        journal: 10 rows · verdict: PASS · exit: 0
```

## PART 8 — BUILD SCENARIOS (real systems as spells)

### SCENARIO A — THE GOD LOOP AS A PROCESS-SPELL (the Eragon tier)

Eragon mechanic: a master formulates spells as CANCELLABLE PROCESSES with checkpoints — never one-shot irrevocable acts. The God Loop IS that formulation at build scale:

```
 SPELL: god-loop-build  (tier 2 — durable process)
 idea:  "take repo from score X to 96+, ship-ready"

  INIT ──► AUDIT ──► SCORE ──► DECIDE ──► PLAN ──► DISPATCH
    │        │         │          │          │         │
    ▼        ▼         ▼          ▼          ▼         ▼
  [row]   [rows]    [row]   [TDM L2 ctx]  [row]   [rows+ask]
                                                       │
  LOCKED ◄─ VERIFY ◄─ COLLECT ◄────────────────────────┘
    │        │          │        (agents journal back)
    ▼        ▼          ▼
  [rows]  [battery]  [rows]     every ▼ = journal rows
                                 = a CANCELLABLE checkpoint

 TDM INTEGRATION: DECIDE phase = TDM L2 DecisionContext
 (≤5 frameworks, cascade depth 3) · PASS vs LOOP = F19
 CONVERGENCE + F16 VELOCITY · STALL x2 = F11 INFLECTION

 JOURNAL AS EXPERIENCED EFFECT: a crashed DISPATCH resumes
 from its ask row — completed phases are never re-paid
 (covers = no-re-pay). "The build died mid-dispatch" is a
 READABLE row, not a mystery.

 ROCKET: god-loop skill = SKILL.md + the phase graph +
 fixtures for the stall/premature-success adversarials.
```

### SCENARIO B — THE CODE-AUDIT SPELL (the deterministic tier)

```
 SPELL: code-audit  (tier 1 — deterministic pipeline)
 idea: "findings with verdicts, evidence-backed, scored"

 ┌─ pre-flight ─┐   ┌─ SCAN (parallel ≤15) ─────────────┐
 │ repo exists? │──►│ R0..R16 detectors as gate/parallel│
 │ specs tall?  │   │ each finding = evidence TRIPLET   │
 └──────────────┘   │ {pattern,state,anchor file:line}  │
                    └──────────────┬────────────────────┘
                                   ▼
                    ┌─ ORACLE (the score math) ─────────┐
                    │ rule-cards: every finding's layer │
                    │ carries its expected weight       │
                    │ score = f(verdicts) — INTEGER math│
                    └──────────────┬────────────────────┘
                                   ▼
                    PASS only if 0 HIGH · else FAIL +
                    the finding rows ARE the experienced
                    effect (readable, replayable)

 TDM READ: ASSUMPTION_AUDIT (oracle cards per rule) +
 SNIFF_TEST (anchorless findings rejected — the 0.85
 bar) + BLAST_RADIUS (the scan reads, never writes)

 CANON MAPPING: detectors never decide (Law 1A = the
 Sign/formula split) · the oracle table is the discharge
 matrix (integer equality, zero false positives) · the
 journal rows are the experienced effect (Law 1F)
```

### SCENARIO C — THE FULL FLEET

| Spell | IDEA | EFFECT | EXPERIENCED EFFECT |
|---|---|---|---|
| container-test | prove the build in a CLEAN room | spawn → deploy tarball → 11 rows → passTokens IN output | results JSON — verified:false is a LOUD row |
| firewall-rule | bash denied unless armed | pba detect → arm → intercept | pba.family.hit + pta.intercept rows — bash NEVER RAN |
| ship-package | manifest + copies + docs, hash-verified, atomic | buildManifest → copyArtifacts → docs → auditGateChain | manifest.verified=true — corrupted copy = LOUD fail |
| spec-to-kernels | math contracts → runnable shells | runDemo → assertD17 → dry-run headless | pass:3 excluded:1 fail:0 — the prototype RAN pre-code |

**THE GENERAL RULE:** any build task that can state (a) a structured intent, (b) a pipeline of known operations, and (c) an evidence contract for "it happened" IS a spell. The canon research contributes the DISCIPLINE (interface, pricing, process, evidence); JESL + TDM contribute the RUNTIME.

## PART 9 — CORRECT / WRONG PAIRS

### P9-1 — THE MULTIEFFECT CARD
- **WRONG:** one card that "does validation AND transformation AND reporting" — unpriceable, unjournallable, uncomposable.
- **CORRECT:** three cards chained by edges — each priced, journaled, and reusable independently.
- **FIX:** split at the channel boundaries; the edges ARE the decomposition.

### P9-2 — THE UNINDEXED CARD
- **WRONG:** authoring a card and leaving it in /tmp — invisible to the rolodex, unfindable for composition.
- **CORRECT:** every authored card lands in a lexicon family with its evidence contract declared.
- **FIX:** name it (meta.name), tier it (meta.tier), file it by family, declare its proof row.

### P9-3 — THE RAW-INTENT CAST
- **WRONG:** bypassing the schema gate ("just this once run the JSON directly").
- **CORRECT:** decodeDoc → validateDoc → graph → execute — the Grey Folk binding is non-negotiable.
- **FIX:** run `jesl validate card.json` first; fix the refusals; then cast.

### P9-4 — THE PERSISTENT MACHINE WITHOUT A JOURNAL
- **WRONG:** a long-running Workflow with no rows — the machine has amnesia; process death loses everything.
- **CORRECT:** every node journals invoke+verdict; covers() derives the resume contract.
- **FIX:** provide the Journal layer; verify rows exist after each phase.

### P9-5 — THE UNGATED GENERATION
- **WRONG:** a tier-2 card firing prompt/shadow-agent without bracket{contract, repair≤2, floor}.
- **CORRECT:** the bracket is mandatory at tier 2 — generation is never unbracketed (UNBRACKETED-GENERATION refusal).
- **FIX:** declare the bracket; set confidenceFloor 0.55; test the repair path.

### P9-6 — THE CONTEXT-BLIND BINDING
- **WRONG:** binding the sales profile (Llm caps) and expecting deterministic-only kinds to refuse — or binding trident (Shell/Fs) and wondering why prompt fails.
- **CORRECT:** the profile IS the lexicon filter — the same kernel behaves differently BY DESIGN.
- **FIX:** read the DomainModule before casting; match the card's caps to the profile's caps.

### P9-7 — THE NARRATED ACTIVE SPELL
- **WRONG:** "the algorithm is working" while the journal has no rows.
- **CORRECT:** the active spell IS its rows — no rows, no run; verdict FROM rows only.
- **FIX:** `jesl replay run.json` → verified:true, then claim.

## PART 10 — PROCEDURES

### P3-1 — AUTHOR A CARD
```
1. Write card.json: $schema trident-workflow-v1 · meta{name,tier}
   · nodes[{id,type,config}] · edges[{from,to,via}] · vars
2. Compose from registry kinds only (37 known — the altar law)
3. Order by dataflow: a node fires when its inbound channels are written
4. Price: tier-1 deterministic = no caps; cap-bound = declare the driver;
   generation = bracket{contract, repair≤2, confidenceFloor}
5. Gate: cd jesl && bunx tsc --noEmit && npx vitest run  (NEVER bun test)
6. Dry-cast: bun run cli/main.ts validate card.json
```

### P3-2 — CAST (the ephemeral machine)
```
bun run cli/main.ts run card.json [--in vars.json] [--driver cli|test]
  → stdout: {"verdict": "PASS"|"FAIL"|"INCONCLUSIVE", results, batches, rows}
  → exit 0 pass · 1 fail/inconclusive · 2 refusal
```

### P3-3 — READ THE EXPERIENCED EFFECT
```
bun run cli/main.ts run card.json > run.json
bun run cli/main.ts replay run.json    # → {"verified": true} + exit 0
the rows ARE the experienced effect — per node, invoke+verdict, chained
```

### P3-4 — BUILD A PERSISTENT MACHINE
```
wrap the card in the Workflow layer (workflow/jesl-run.ts):
  makeJeslRunLayer(doc, makeCtx) — provides JeslRun + Journal
cast: runJeslWorkflow(docHash, seed, doc, baseCtx)
  → first run: executes, journals
  → re-cast: covers() true → verdict FROM rows, invoked 0
kill -9 mid-run → re-cast resumes from the last complete row
```

### P3-5 — BUILD A CONTEXT-AWARE MACHINE
```
1. Author the DomainModule (zero branches — pure data):
   {name, caps: [real Tags], kinds: [...], defaultTier, brackets}
2. Validate: validateDomainModule(m) — caps must be real Tags
3. Register in boilerplate PROFILES if extractable
4. Bind: makeOpenCodeBinding(transport) for host deployment
```

### P3-6 — PACKAGE THE ROCKET
```
import { emitSkill } from "./packager/skill"
yield* emitSkill(doc, ".opencode/skills/", writer)
→ <name>/SKILL.md + payload/{workflow.json, ctx.json,
  mission.md, anti-patterns.json}
launch: jesl run payload/workflow.json --in payload/ctx.json
```

## PART 11 — TROUBLESHOOTING MATRIX

| SYMPTOM | CAUSE (mechanic) | FIX |
|---|---|---|
| `[JESL UNKNOWN-NODE] field=type` | kind not in the registry | fix the kind or append (append-only) |
| `[JESL CYCLE]` | the edge graph is cyclic | break the cycle (gate/event-reactivate) |
| `[JESL TIER-VIOLATION]` | tier-1 doc uses generation | raise meta.tier or replace the node |
| `[JESL UNBRACKETED-GENERATION]` | tier-2 generation without bracket | declare bracket{contract,repair≤2,floor} |
| `[JESL CAP-UNBOUND] <cap>` | the driver lacks the bound | bind the Layer or drop the node |
| `[JESL CHANNEL-UNSET]` | read of an unwritten channel | seed it (--in) or fix edge.via |
| `[JESL NO-SEED]` | declared entry channel unseeded | seed vars or fix meta.seed |
| `[JESL ORACLE-MISSING]` | rule card without expected | provide the oracle value |
| replay `"verified": false` | chain tampered/foreign writer | re-run; never hand-edit rows |
| INCONCLUSIVE verdict | stub fired / confidence < floor / incomplete triplet | read evidence.anchor for which |
| run hangs on pause | Deferred awaits resume | pauseResume(key,value) or inbound signal |
| battery prints HANG | fixture exceeded the 2s race | the row is HANG — malformed fixture |
| vitest fails under `bun test` | bun:test ≠ vitest (`onTestFinished`) | `npx vitest run` — the canon runner |
| test hangs at 5000ms | TestClock never advances sleep | real-timer pattern in tests |
| RegistryFrozenError on register | divergent re-register of existing kind | append-only: same family+caps only |
| editor shows test-file errors | @ts-nocheck class + per-dir include | editor noise — the gate is tsc |
| LSP gate denies a .ts write | error-severity diagnostics | fix floatingEffect/runEffectInsideEffect |
| ORACLE_CONFLICT | duplicate oracleKey registration | dedupe the cards (first wins) |
| DEPTH_EXCEEDED in parser | MathExpr nesting > 256 | flatten the expression |
| FLOAT_EPSILON_MISSING | float oracle without tolerance | provide positive-finite tolerance |
| EXCLUDED not FAIL on a sample | D17 born-off exclusion | correct behavior — counted under excluded |
| dual-cast feels weaker | 2.2× effect for 2.8× cost | school-dependent; zero-cost builds aside |
| same spell recast "didn't stack" | same identity replaces | distinct names/ids stack |
| amplifier didn't boost same cast | same-cast amplification ignored | amplifier must precede (separate casts) |
| persistent machine lost state | journal layer missing | provide Journal; verify rows after each phase |
| context machine fires wrong kinds | wrong DomainModule bound | read the profile; match card caps to profile caps |

## PART 12 — QUICK REFERENCE

### 12A — THE CARD SHAPE (the atom)
```json
{ "$schema": "trident-workflow-v1",
  "meta": { "name": "card-name", "tier": 1 },
  "vars": { "seed": "value" },
  "nodes": [ { "id", "type", "config?" } ],
  "edges": [ { "from", "to", "via" } ] }
```

### 12B — THE MACHINE MATRIX
| Type | Layer | Lives | Card source | Build with |
|---|---|---|---|---|
| EPHEMERAL | runProgram | one run | a single card | the CLI |
| PERSISTENT | Workflow | days | a card chain | makeJeslRunLayer |
| DYNAMIC | MPSE emit | compile time | generates cards | runDemoSync |
| CTX-AWARE | profiles | domain | lexicon-filtered | DomainModule |

### 12C — THE LEXICON FAMILIES
| Family | Tier | Caps | Bracket | Kinds |
|---|---|---|---|---|
| gates | 1 | none | no | gate, oracle-gate, claim-gate, evidence-gate |
| transforms | 1 | none | no | pipeline, parallel, math-eval, state-machine |
| evidence | 1 | none | no | journal-sink, triplet-writer, evidence-machine |
| execution | 1 | YES | no | shell-exec, python-exec, http-request, file-io |
| orchestration | 1 | none | no | retry-chain, fallback-chain, pause |
| generation | 2 | Llm/Subagent | YES | prompt, shadow-agent, subagent-dispatch |

### 12D — THE ALGORITHM LIBRARY
| Algorithm | Chain | Solves |
|---|---|---|
| THE GUARD | gate → work → triplet | standard spell shape |
| THE RETRY | retry-chain → fallback | resilience |
| THE FAN | parallel → gate(all-PASS) | parallel + join |
| THE ORACLE | math-eval → discharge | math before code |
| THE BRACKET | gate → prompt → schema-gate | safe generation |
| THE ASK | ask-launcher → durable ask | human-in-the-loop |
| THE CHAIN | covers → replay → next | the lifecycle |
| THE PRE-ARM | detect → arm → intercept | enforcement |
| THE VERIFY | scenarios → passToken | the battery |
| THE SHIP | manifest → copy → audit | release |

### 12E — THE 8 FROZEN TOKENS
`[JESL UNKNOWN-NODE]` `[JESL CYCLE]` `[JESL TIER-VIOLATION]` `[JESL UNBRACKETED-GENERATION]` `[JESL CAP-UNBOUND]` `[JESL ORACLE-MISSING]` `[JESL CHANNEL-UNSET]` `[JESL NO-SEED]`

### 12F — REAL PATHS
```
JESL kernel    .../JESL/jesl/          (109 files; npx vitest run)
TDM spec       .../v4.4.3/TRIDENT_DECISION_MAKING_TOOL_SPEC.md (1,525L)
this bible     .../KNOWLEDGE_LIBRARY/Bibles/JESL/JESL_EFFECT_ENGINEERING_LIBRARY.md
canon bible    .../KNOWLEDGE_LIBRARY/Bibles/JESL/EFFECT_ENGINEERING_BIBLE.md (492L)
boilerplate    .../KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/JESL-Kernel-Edition-v1.0/
```

### 12G — DOCTRINE (verbatim)
- "JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime."
- "Casting a spell with magic costs as much energy as would be lost to do the task by mundane means." — Inheriwiki: Magic
- "formulat[e] spells as processes which could be cancelled at will" — Inheriwiki: Magic
- "The Power bound in spell formulae" — Witcher Wiki glossary
- "verdicts FROM journal rows, never prose" — the JESL canon line

## VERSION HISTORY
| v | date | change |
|---|---|---|
| 1.0 | 2026-09-03 | first authoring: the full JESL knowledge library — cards, rolodex, compiler machines, kernels, rockets, the 5-stage pipeline (verbatim), TDM map, algorithms, build scenarios |
