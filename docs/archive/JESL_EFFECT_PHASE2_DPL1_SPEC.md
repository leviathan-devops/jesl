# JESL × EFFECT — PHASE 2 DPL1 SPEC
## Improve both JESL canons by adding Effect-TS as first-class runtime (do not replace the grammar)
### Generated: 2026-09-02 · DPL1 · skill-authorable handoff
### Status: `PLANNING` · Artifact Type: `BUILD_SPEC (Layer 1 Prompt)`
### Discovery: ENABLED — grounded in JESL bible v1.1, JESL DPL1, EFFECT-RT bible v1.0, Effect LSP/SDK, Paragon PBA/PTA, Trident warhead/Poseidon surfaces

**Companion artifacts (read first, in this order):**
1. `JSON_EVENT_SCRIPTING_BIBLE.md` (JESL v1.1) — grammar, laws 1A–1I, registry, catalog, fixtures
2. `JESL_LIBRARY_DPL1_SPEC.md` — slices S1–S6, success criteria, container plan
3. `EFFECT_TS_RUNTIME_BIBLE.md` (EFFECT-RT v1.0) — laws E1–E10, service map, node→Activity map
4. Installed `node_modules/effect/AGENTS.md` when present — version-pin conventions
5. `@effect/language-service` README diagnostic table — rule catalog to copy, not rewrite

**Operator intent (verbatim spirit):** combine JESL + Effect into first-class machinery. JSON stays the authoring surface. Effect becomes the only execution kernel. Paragon remains real-time police on think/do. Effect LSP remains police on artifacts.

**SPEC-ONLY unless the operator green-lights a build wave.** This artifact authorizes *documentation surgery* and a later implementation wave. It does not authorize `bun init` of a second library.

---

## DISCOVERED INTELLIGENCE (locked)

**Languages:** TypeScript, bun, ESM. JESL DPL1 locked **zod** for v1 docs. Phase 2 adds **effect** + Effect Schema; Zod may remain at the OpenCode/JSON edge for one slice, then decode into Effect Schema. No Rust. No grok-build code reuse.

**What is already specified (do not reopen):**
- JESL is ONE library; A/B/C are use-case families (DPL1 D1)
- Core is pure; hosts are drivers; effects are capabilities (D2, D3)
- ONE execution semantic: dataflow readiness + bus (D4)
- Journal is evidence + replay + resume (D5)
- One document emits tool / chain / skill (D6)
- Append-only registry + versioned `$schema` (D7)
- JESL v1 implementation slices S1–S6 and §7 7/7 battery

**What Phase 2 adds (new locked decisions):**
- **D9** Effect is the kernel: `NodeImpl.invoke` returns `Effect<NodeResult, JeslError, Caps>`, never a raw Promise in core
- **D10** JESL caps ↔ Context.Service / Layer; `[JESL CAP-UNBOUND]` = missing `R`
- **D11** Durable runs (`pause`, `ask-launcher`, generation, Poseidon, WarheadRun) use Workflow + Activity; ephemeral hook monitors may stay scoped fibers
- **D12** Paragon PBA/PTA wrap existing math as services; do not rewrite classifiers in `Effect.gen`
- **D13** Effect LSP is the artifact plane — wrap CLI as an Activity + PTA chain rule; do not fork tsserver
- **D14** Documentation change is additive: new Part / § “EFFECT PHASE 2” in BOTH JESL docs; do not delete JESL laws, catalog, or fixtures
- **D15** Schema dual-run: authoring still refuses with `[JESL …]` tokens; codecs migrate to Effect Schema without renaming error codes

**Failures Phase 2 exists to prevent:**
- Second runtime (`async` executor beside Effect)
- Theatrical T0 authorization
- Replay that re-pays LLM / Docker
- PBA/PTA and JESL using different journals
- “We use Effect” while `Date.now` / `fetch` / `node:fs` remain in core
- Agents missing Effect diagnostics because `tsc` is unpatched

**Warheads in force:** W9 detectors≠deciders · W10 loud-fail · W11 allSettled · W13 evidence-before-claims · W18 no unrequested fallbacks / no compat shims that hide the kernel.

---

# §1 PROBLEM STATEMENT

JESL bible + DPL1 specify a production JSON library whose runner is described as Promise/`allSettled`/zod. That is enough to *author* graphs. It is not enough to *mandate* typed I/O, interruption, Layer-swapped tests, durable generation, or Effect-LSP-grade artifact police.

Trident warheads today are `init(): Promise` + `getT0()` prompt injection. Poseidon is an XState/custom FSM. Paragon is a parallel Promise engine. Those are the theatrical paths.

**THE GAP:** the two JESL documents do not contain an Effect phase, so an implementation agent will build a Promise runner and call it done. **THE PRODUCT OF THIS SPEC:** surgically improved canons such that an implementation agent *must* host JESL on Effect and wire Paragon + LSP as planes — without throwing away the JSON grammar or the S1–S6 slice plan.

---

# §2 WHAT THE AGENT MUST DO TO THE TWO DOCS

This is the primary deliverable of a *docs wave*. Implementation is a later wave gated on operator go.

## 2.1 `JSON_EVENT_SCRIPTING_BIBLE.md` — additive surgery

**Keep:** Parts 0–9, all laws 1A–1I, registry table, catalog 5A–5G, composed 5F, correct/wrong P2-*, procedures P7-*, troubleshooting Part 8, fixtures implied by DPL1.

**Add as new major part immediately after Part 2 (Grammar), shifting later parts only if needed — preferred: insert `PART 2E — EFFECT KERNEL (PHASE 2)` between Part 2 and Part 3**, plus a short pointer in 0.1/0.2/0.3.

Required sections inside PART 2E (use EFFECT-RT bible; do not paste it wholesale — *compose*):

| § | Content the agent must write |
|---|---|
| 2E.0 | Three-sentence bind: JSON = grammar, Effect = runtime, journal = truth |
| 2E.1 | Mapping table JESL module → Effect service (schema, graph, bus, channels, executor, journal, registry, caps, errors) |
| 2E.2 | `NodeImpl` / `NodeHandle` rewritten as Effect types (from EFFECT-RT 2.2) |
| 2E.3 | Node-kind registry extra column **Effect shape** (fiber vs Activity vs Schedule vs Deferred) — every existing kind gets a row |
| 2E.4 | Cap model = Layers; driver table CliLive / OpenCodeLive / TestLive |
| 2E.5 | Execution loop 2.6 restated as Effect readiness + `forEach` concurrency 15 |
| 2E.6 | Durable vs ephemeral rule (when Workflow.make is mandatory) |
| 2E.7 | Authorization law (Policy + CurrentProgram + causationId; T0 projector) |
| 2E.8 | Paragon/PTA/LSP as three scanners on EventBus (no fourth runtime) |
| 2E.9 | New catalog family **5K** (kernel templates) — at least: Service shell, TaggedError, Activity node, retry class, parallel batch, TestClock, LSP scan, ask-launcher Deferred |
| 2E.10 | New correct/wrong block **P3-1..P3-12** (from EFFECT-RT Part 6) |
| 2E.11 | New procedures **P7-E1..P7-E6** |
| 2E.12 | Grounding map + status ledger rows for Effect kernel (SPEC until container) |

**Also patch in-place (minimal):**
- 0.2 Grounding Map: add Effect SDK / LSP / Workflow rows
- 1F Concurrency Law: add sentence “implementation = Effect.forEach / Exit, not Promise.allSettled in core”
- 2.5 Library architecture diagram: core remains pure; “pure” now means *zero host imports AND zero raw Promise I/O* — Effects may be described in core
- Part 9 quick reference: add 9G JESL↔Effect law table
- Version history: v1.2 PHASE 2 EFFECT KERNEL (docs)

**Forbidden:**
- Deleting Promise wording from historical examples without an Effect twin
- Replacing node `"type"` names
- Introducing Rhai/JS eval
- Making Effect.gen the authoring language for workflows

## 2.2 `JESL_LIBRARY_DPL1_SPEC.md` — additive surgery

**Keep:** D1–D8, §3 measured discovery, S1–S6 slice gates, §6 criteria 1–12, §7 7/7 scenarios and fixture set.

**Add `§2.9 EFFECT KERNEL (PHASE 2)`** after 2.8 data contracts, containing:
- D9–D15
- Effect type contracts for NodeImpl / RunContext.caps
- TaggedError list = existing `[JESL …]` codes
- Driver Layers
- Workflow.make for JeslRun (idempotencyKey = docHash+seed)

**Add `§5.2 PHASE 2 SLICES`** (do not renumber S1–S6). New slices only start after S1 gate is conceptually honored — if JESL core is not yet built, Phase 2 slices *replace* Promise assumptions inside S1 rather than stacking a second executor.

| Slice | Delivers | Gate |
|---|---|---|
| **S1E** | core types are Effect; schema decode Effect Schema or Zod→Schema; zero `node:` imports; `it.effect` units | tsc 0; every `[JESL …]` fixture still emits the **same token strings**; readiness diamond test now `it.effect` |
| **S2E** | CLI driver = Layer (shell/fs/http); runPromise only in `cli/main` | criteria 3,4,6,8 still pass |
| **S3E** | OpenCode driver Layer; hook → EventBus Effect; jesl-run provides SessionLive | criterion 11 |
| **S4E** | `prompt.call-model` as Activity; ask-launcher as DurableDeferred; unbracketed still refused | S7 + no re-pay on replay of generation Activity |
| **S5E** | packager unchanged outputs; emitted skill still `jesl run` | criterion 9 |
| **S6E** | §7 battery + kill -9 resume via Workflow journal + TestClock unit for pause | 7/7 + criterion 12 |
| **S7P** | Paragon wrap: BehaviorEngine + ToolEngine Layers; intercept on tool.execute.before | fixture: TEST_EVASION deliberation pre-arms bash deny |
| **S8L** | EffectLsp Activity + PTA layer `EFFECT_ARTIFACT_GATE` + `patch` in prepare | write .ts → diagnostics token in journal |

**Patch §6** with new criteria 13–16 (mechanical):

| # | Criterion | PASS |
|---|---|---|
| 13 | No raw `fetch`/`Date.now`/`node:fs` in `jesl/core` | ripgrep empty |
| 14 | `effect-language-service diagnostics` on `jesl/core` = 0 errors at kernel severity | CLI exit 0 |
| 15 | Replay of tier:1 fixture does not re-invoke shell Activity | journal `covers` + invoke counter = 0 on second run |
| 16 | `layerinfo` on `CliLive` lists Journal, Fs, Shell | CLI output contains those names |

**Patch §8 handoff:** docs wave first (this spec’s §2.1–2.2) → operator go → implementation wave following S1E…S8L → flip EFFECT-RT status ledger + JESL grounding map from SPEC to PROVEN.

## 2.3 New sibling file (optional but recommended)

If the agent is allowed to add files: keep `EFFECT_TS_RUNTIME_BIBLE.md` as the Effect canon and **link it** from both JESL docs (0.x companion list). Do not duplicate the full Effect tutorial into JESL; JESL only carries the *bind*.

---

# §3 ARCHITECTURE THE IMPROVED DOCS MUST DESCRIBE

```
workflow.json + ctx.json
        │ Schema.decode (Effect Schema)
        ▼
JESL CORE as Effect services
        │ provide(DriverLive)
        ▼
JeslRun Workflow  OR  session Fiber
        │
        ├─ Activities (cap nodes)
        ├─ EventBus ← OpenCode hooks / PBA / PTA / LSP results
        ├─ Journal (sha256 + Activity receipts)
        └─ Policy / CurrentProgram / Escalation
```

**RunContext Phase 2:**

```ts
interface RunContext {
  runId: string
  doc: WorkflowDoc
  channels: Channels          // service
  journal: Journal            // service
  bus: EventBus               // service
  caps: Context               // R
  clock: Clock
  budget: { deadline: Duration; maxNodesFiring: 15 }
}
```

`vars` stay data. Caps are no longer a bag of functions — they are the provided Context.

**Error vocabulary stays string-token stable** so existing fixtures keep passing:

`[JESL UNKNOWN-NODE] [JESL CYCLE] [JESL TIER-VIOLATION] [JESL UNBRACKETED-GENERATION] [JESL CAP-UNBOUND] [JESL ORACLE-MISSING] [JESL CHANNEL-UNSET] [JESL NO-SEED]`

Each becomes a `Schema.TaggedError` whose `code` field *prints* that token.

---

# §4 SCOPE

**IN SCOPE (docs wave — authorized by this spec):**
- Edit JESL bible + JESL DPL1 per §2
- Cross-links to EFFECT-RT bible
- Family map LSP rule → Paragon family as a table in JESL 2E.8 or EFFECT-RT 3.2 (single source; other file links)
- Version history bumps

**IN SCOPE (implementation wave — NOT authorized until operator go):**
- S1E–S8L
- Dependencies: `effect`, `@effect/platform-node` (or bun), `@effect/vitest`, `@effect/language-service`, `@effect/workflow`, `@effect/ai` when S4E starts
- `prepare` script patch
- PTA layer JSON `EFFECT_ARTIFACT_GATE` / `EFFECT_RUNTIME_MANDATE`

**OUT OF SCOPE:**
- Rewriting PBA regex banks in Effect
- Rewriting R0–R17 AST engine in Effect.gen
- Custom tsserver
- GUI / mermaid editor
- Renaming JESL node kinds
- Making agents author Effect.gen instead of workflow.json
- Shadow-agent full pi-harness (still v2 per original DPL1)

---

# §5 SUCCESS CRITERIA (docs wave)

A docs wave PASSES when a fresh agent given only the three files can answer yes to all:

1. “What is the authoring language?” → JSON workflow doc (JESL)
2. “What executes it?” → Effect services + driver Layer + optional Workflow
3. “What is a cap?” → Context.Service; unbound = `[JESL CAP-UNBOUND]`
4. “When is Workflow mandatory?” → pause, ask-launcher, generation replay, Poseidon/Warhead durable
5. “Who authorizes bash?” → Policy + CurrentProgram + causation, not T0
6. “Where does Paragon sit?” → services on EventBus, PBA→PTA bridge
7. “Where does Effect LSP sit?” → Activity after write + patched tsc
8. Original S1–S6 / §7 tokens and fixture names still present
9. No sentence claims JESL core may import `node:fs` or call `fetch`

**Implementation wave PASSES** on original §6.1–12 PLUS new 13–16 and S7P/S8L fixtures.

---

# §6 CONTAINER / PROOF PLAN (implementation wave only)

Reuse JESL DPL1 §7 scenarios 1–7 unchanged (same tokens).

Add:

### S8 — EFFECT KERNEL HYGIENE
- Prompt: ripgrep + `effect-language-service diagnostics --project jesl/tsconfig.json`
- Pass token: zero `globalFetch`/`floatingEffect`/`nodeBuiltinImport` in `jesl/core`; diagnostics exit 0
- Fail token: any core file matching `from "node:fs"` or unyielded Effect

### S9 — ACTIVITY REPLAY
- Prompt: run `fixtures/mech-gate.json` twice with invoke counter on shell-exec
- Pass token: second run invoke count 0 AND journal sha chain identical
- Fail token: second run execs shell again

### S10 — PARAGON PRE-ARM
- Prompt: scripted reasoning text containing TEST_EVASION suggestive bank, then `tool.execute.before` bash
- Pass token: StructuredEnforcementError / deny in tool result; journal `pba.family.hit` then `pta.intercept`
- Fail token: bash Activity ran

---

# §7 AGENT AUTHORING RULES (for the docs wave)

1. Match JESL voice: laws, tables, RESOLVES-TO / WHEN / FAILURE-MODE / ANCHOR, CORRECT/WRONG, named tokens in backticks.
2. Prefer citation of existing anchors (`CUSTOM_EVENT_HOOK…`, Warhead 9, grok journal.rs) plus Effect anchors (`Effect.fn`, `Activity.make`, `layerinfo`).
3. Do not invent Effect APIs. If unsure v3 vs v4, write the *concept* (Workflow + Activity + Layer) and mark API import path `VERIFY-ON-INSTALL`.
4. Keep examples copy-pasteable and short.
5. Every new MUST/NEVER maps to a test or a diagnostic token.
6. After edits, add version rows:
   - JESL bible **v1.2 — 2026-09-02 — EFFECT PHASE 2 bind**
   - JESL DPL1 **v1.1-E — PHASE 2 slices S1E–S8L + criteria 13–16**
7. Status ledger: Effect kernel **SPEC** until S8/S9 container rows exist.

---

# §8 HANDOFF CHAIN

```
THIS DPL1
  → docs wave (edit the two JESL files + keep EFFECT-RT bible)
  → operator read of PART 2E / §2.9 / §5.2
  → operator go
  → implementation wave S1E…S8L
  → §7 + S8 + S9 (+ S10 if Paragon in-tree)
  → flip SPEC-GATED → PROVEN on JESL grounding map AND EFFECT-RT ledger
```

**THE CANON LINE TO COPY INTO BOTH IMPROVED DOCS:**

> JESL authors the graph. Effect runs the graph. Activities journal the world. Paragon polices think and do. Effect LSP polices files. There is no other runtime.

*— END OF THE PHASE 2 DPL1 —*
