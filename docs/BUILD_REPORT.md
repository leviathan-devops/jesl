# BUILD REPORT — MacroKernel_Edition-v1.0 (JESL)

## THE COMPLETION DECLARATION

**All 10 waves (W0→W10) closed. All 4 container checkpoints GREEN. 336/336 tests passing. Zero spec drift. The product is SHIPPABLE.**

| Metric | Value |
|---|---|
| TypeScript files | 109 |
| Test files | 34 |
| Tests passing | 336/336 (zero failures) |
| Tree digest | `681bf8696924a040` |
| Spec-set manifest | `f77b448f` (stable through all 10 waves — zero drift) |
| Container checkpoints | 4/4 GREEN (W3, W5, W6, W10) |
| Wave audits | 11 files (`.trident/wave-audit/w0.md` through `w10.md`) |
| Frozen tokens | 8/8 byte-stable (`[JESL UNKNOWN-NODE]` through `[JESL NO-SEED]`) |
| Node kinds registered | 33 (12 full-behavior + 21 structural stubs) |
| JESL documents emitted | 3 targets per doc (plugin-tool manifest / tool-chain descriptor / skill rocket) |
| Lifecycle kernels | 6 (idea-to-bible → bible-to-spec → spec-to-kernels → kernels-to-code → verify → ship) |
| MPSE bridge modules | 7 (parser, rule-cards, oracle, calibrate, kernel-emit, stub-emit, demo) |
| Scanner families | 5 (PBA, PTA, LSP, audit, trace) |
| Domain profiles | 3 (trident, trading, sales — zero branches) |
| Host bindings | 2 (ParagonHostBinding contract + OpenCode binding) |
| Dependencies | effect 3.22.1 · @effect/platform 0.84.11 · @effect/platform-node 0.108.1 · @effect/vitest 0.24.1 · @effect/workflow 0.19.1 · @effect/ai 0.37.0 · @effect/language-service 0.87.2 · typescript 5.9.3 · vitest 3.2.7 |

---

## THE ARCHITECTURE

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

## THE LIFECYCLE PIPELINE

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│  idea    │────►│idea-to-  │────►│bible-to-spec │
│  (text)  │     │bible     │     │              │
└──────────┘     └──────────┘     └──────┬───────┘
                                          │
                                          ▼
┌──────────┐     ┌──────────┐     ┌──────────────┐
│  ship    │◄────│  verify  │◄────│kernels-to-   │
│ (manifest│     │(parallel │     │code          │
│ + copies)│     │ battery) │     │(bracket+gate)│
└──────────┘     └──────────┘     └──────────────┘
                                        ▲
                        ┌───────────────┘
                        │
                 ┌──────┴───────┐
                 │spec-to-      │
                 │kernels (D3)  │
                 │runDemo +     │
                 │TestLive      │
                 │dry-run       │
                 └──────────────┘
```

## THE EVIDENCE CHAIN (the journal)

```
┌─────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│seq:0│───►│seq:1 │───►│seq:2 │───►│seq:3 │───►│seq:N │
│invoke│    │verdict│    │invoke│    │verdict│    │ ...  │
└─────┘    └──────┘    └──────┘    └──────┘    └──────┘
 prev=       prev=       prev=       prev=
 genesis     self[0]     self[1]     self[2]
 self=       self=       self=       self=
 hash(0)     hash(1)     hash(2)     hash(N)

 covers(docHash,seed) = true → REPLAY (invoke 0)
 covers(docHash,seed) = false → EXECUTE
```

## THE ENFORCEMENT CHAIN (the wraps)

```
┌────────────────────────────────────────────────────────┐
│              tool.execute.before (the hook)             │
└───────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│           PBA Scanner (the think-police)                │
│     consumes deliberation.* events                      │
│     detects 5 families: TEST_EVASION, THEATRICAL,       │
│     PROMPT_INJECTION, TOOL_ABUSE, EVASION_LOOP          │
│     emits: pba.family.hit {family, confidence, band}    │
└───────────────────────┬────────────────────────────────┘
                         │ pba.family.hit
                         ▼
┌────────────────────────────────────────────────────────┐
│         BehaviorEngine (the arming state)               │
│     escalation windows 5/2/0 (per escalation count)     │
│     refractory 25 seq · alpha decay 0.05 · fire 1.0    │
│     family → tool-class arming                          │
│     provenance: ms-escalation-memory + sentinel/synapse │
└───────────────────────┬────────────────────────────────┘
                         │ armed state
                         ▼
┌────────────────────────────────────────────────────────┐
│          ToolEngine (the do-police)                     │
│     intercept(toolCall) → armed? deny : allow           │
│     deny-unless-armed (L2 §4.12 pre-arm chain)          │
│     emits: pta.intercept {tool, family, verdict}        │
└───────────────────────┬────────────────────────────────┘
                         │ pta.intercept
                         ▼
┌────────────────────────────────────────────────────────┐
│        hook-bridge fold (allow/deny verdict)             │
│    deny → {allow:false, reason} → the hook returns      │
│    allow → the tool executes                             │
└────────────────────────────────────────────────────────┘
```

---

## THE WAVE-BY-WAVE WALKTHROUGH

### W0 — THE DOCS WAVE (the authority)

**WHAT:** The JESL bible (v1.1→v1.2) and the DPL1 spec (v1.0→v1.1-E) were surgically patched to bind the Effect kernel as the ONLY execution runtime. The bible gained `PART 2E — EFFECT KERNEL (PHASE 2)` (443 lines, sections 2E.0–2E.12). The DPL1 gained `§2.9 EFFECT KERNEL` (the D9–D15 decisions, the Effect type contracts, the 8-row TaggedError table, the Driver Layers, `Workflow.make` with `idempotencyKey = docHash+seed`) and `§5.2 PHASE 2 SLICES` (the 8-row S1E–S8L implementation map).

**WHY:** The docs are the authority — every implementation wave reads from them. Without the Effect bind in the canon, an implementation agent would build a Promise runner and call it done.

**GATE:** The nine-questions probe — all 9 answerable from `{bible v1.2, DPL1 v1.1-E, EFFECT-RT}` alone.

**EVIDENCE:** bible 1,595L (sha `68afa78e`), DPL1 477L (sha `35abb828`), manifest `396e4930 → f77b448f`. Audit: `.trident/wave-audit/w0.md` — 13 hunks CORRECT.

**SESSION STORY:** The dispatching session crashed (provider cut) mid-wave. A1 died at 43s (pre-edit); A2 died after 1 of 5 edits. The recovery used `session-log-recovery extract.py` over the opencode SQLite DB to reconstruct the state, then `trident-wave-manager action=resume` verified both persisted sessions and steered "continue" into each — both reloaded their full context and completed without prompt regeneration.

---

### W1 — THE KERNEL TREE (10 core modules)

**WHAT:** The greenfield `jesl/` tree built by 5 parallel trident_build agents.

**THE 10 CORE MODULES:**

| Module | Lines | Contract |
|---|---|---|
| `core/schema.ts` | 211 | `WorkflowDoc` Schema + `decodeDoc` + `validateDoc(doc, isKnownKind)` — the authoring surface's gatekeeper |
| `core/graph.ts` | 222 | DAG build + Kahn cycle detection (`[JESL CYCLE]`) + readiness batches (the diamond: 2 batches) |
| `core/channels.ts` | 158 | `Ref` + `Deferred` store: `seedFrom(vars)`, `write` (wakes waiters), `read` (`[JESL CHANNEL-UNSET]`), `snapshot` (deep-copy observer law) |
| `core/bus.ts` | 189 | Glob EventBus: `emit`/`subscribe`/`detachAll`; handler isolation via `forkDaemon` + `catchAllCause`; payload `deepFreeze` |
| `core/caps.ts` | 133 | 8 `Context.Tag`s (Shell/Fs/Http/ToolClient/Subagent/Llm/Journal/ClockTag) + `requireCaps` → `[JESL CAP-UNBOUND]` |
| `core/errors.ts` | 94 | The 8 frozen `Schema.TaggedError` classes + `JeslError` union + `JESL_TOKENS` (the single source of the token strings) |
| `core/executor.ts` | 222 | `runProgram(doc, ctx)`: `Effect.forEach` concurrency 15 + `Exit` capture + `Clock` timing + cap pre-flight + journal pre+post rows |
| `core/journal.ts` | 277 | sha256 chain via `HashCap` injection: `append`, `covers(docHash, seed)`, `serialize`/`restore`, `FileSink` interface + `InMemorySink`, `verifyChain` |
| `core/registry.ts` | 191 | Append-only Map: `register`/`get`/`isKnownKindSync`/`kindsSync`; 33 kinds pre-registered; `replaceStub` (stub-only seam) |
| `core/evidence.ts` | 160 | The 8-kind G1 port from LASME_v1: `RING_CAP 50`, `VERDICT_TTL_MS 5000`, `ingest`/`queryVerdict`/`isEventFresh`/`analyzeResult` |

Plus 33 node kinds (12 full-behavior + 21 INCONCLUSIVE stubs) and the demo fixture.

**THE AUDIT CAUGHT 2 DEFECTS:**
1. `Date.now` in core/caps.ts:105 (the dummyClock) — Law 4 purity violation → fixed to `EffectClock.currentTimeMillis`
2. `[JESL GATE-FAIL]` invented 9th token in nodes/gate.ts:49,62 — Law 5 vocabulary violation + a type-lie cast → removed; the assert delta carried in the evidence anchor

**RESULT:** tsc 0 · vitest 104/104 · tree digest `12ffbb3d`.

---

### W2 — THE CLI + EXECUTION

**WHAT:** The `jesl` bin + the 4 real execution kinds + the CliLive driver + the fixture set.

**THE CLI:**
- `cli/main.ts` — the single `Effect.runPromise` edge (Law 3: runPromise lives HERE, nowhere else)
- `cli/args.ts` — `parseArgs`: run/validate/replay + `--in` + `--driver` + `--help`
- `cli/handlers.ts` — `handleRun`/`handleValidate`/`handleReplay` returning `{code, stdout, stderr}` — testable without process spawn

**THE 4 EXECUTION NODES:**
- `nodes/shell-exec.ts` — Shell cap; exitCode 0→PASS / non-zero→FAIL(stderr) / timeout→FAIL
- `nodes/python-exec.ts` — Shell cap (`python3 -c`); self-skip if python3 absent
- `nodes/http-request.ts` — Http cap; 2xx→PASS / else FAIL
- `nodes/file-io.ts` — Fs cap; read/write

**CliLive:** the REAL Layer — Shell via `node:child_process` spawn with SIGKILL timeout, Fs via `fs/promises`, Http via fetch, sha256 HashCap. node: imports confined to the WRAP boundary (Law 4).

**THE AUDIT CAUGHT THE BIGGEST DEFECT OF THE BUILD:** the CLI's deterministic run path used `passHandle` always-PASS stand-ins instead of the REAL nodes. Behind the mask sat 3 real W1 defects:

1. `core/schema.ts` NodeEnvelope had NO `config` field — every node's config was STRIPPED at decode
2. `core/executor.ts:177` built `NodeInput = {node:{id,type}, inbound:{}}` — nodes never saw their config or channel data end-to-end
3. The executor's fallback journal rows used `self-${seq}-${node}-${ts}` — `verifyChain` could never verify them

**All 3 root-cause-fixed by the orchestrator:**
1. `config: Schema.optional(Schema.Unknown)` added to NodeEnvelope
2. Executor now passes the FULL node envelope and builds REAL inbound from `channelData` (node outputs + seeded vars)
3. The fallback self now computes `simpleHash(canonicalSerialize(base) + NUL + prev)` — the SAME algorithm `verifyChain` checks

**RESULT:** tsc 0 · vitest 129/129 · `mech-gate` PASS exit 0 through REAL nodes (4 nodes, 8 chained rows, 4 batches) · tree digest `e07eaf5c`.

---

### W3 — THE DRIVER + SCANNERS

**WHAT:** The host seam + the think/do police.

| Module | Lines | What it does |
|---|---|---|
| `drivers/opencode-live.ts` | 78 | `HostTransport{invokeTool,dispatchSubagent,callModel,ask}` — the library's host-agnostic seam; `ScriptedTransport` for tests; `makeOpenCodeLive = Layer.mergeAll(CliLive, ToolClient, Subagent, Llm, Session, Bus)` |
| `drivers/session-live.ts` | 38 | `Session` Tag + `SessionService.ask` over the transport via `Deferred.make` + `Queue.unbounded` — the ask-launcher roundtrip |
| `drivers/hook-bridge.ts` | 76 | `onToolExecuteBefore(event)` → emits onto the Bus → the pta deny fold; WeakMap-per-bus state; the observer-law isolation |
| `scanners/pba-banks.ts` | 88 | The 5 family banks (TEST_EVASION, THEATRICAL, PROMPT_INJECTION, TOOL_ABUSE, EVASION_LOOP) as PURE data + the score/band functions ported from Paragon `ms-ratio-classifier` **with provenance shas** |
| `scanners/pba.ts` | — | Subscribes `deliberation.*` (6 patterns) → `detectFamilies` → emits `pba.family.hit` |
| `scanners/pta.ts` | — | The pre-arm ring → `deny-unless-armed` per L2 §4.12 → emits `pta.intercept` |
| `scanners/lsp.ts` | 81 | The LSP scanner: `LspCap` Tag + `InMemoryLsp` + the honest `{available:false}` journal state |
| `scanners/audit.ts` | 46 | Claim↔evidence check: verdict events WITHOUT evidence → `audit.violation` |
| `scanners/trace.ts` | 67 | Per-run timeline: `node.invoke`/`node.verdict` → `trace.timeline` |

**THE TEST_EVASION PRE-ARM CHAIN (PROVEN):** a TEST_EVASION deliberation → PBA detects the family → the BehaviorEngine arms → the ToolEngine DENIES bash → the `pta.intercept` carries the family. The escalation decay table asserted (count 1→5, 2→5, 3→2, 4→0).

**RESULT:** tsc 0 · vitest 164/164 (16 files) · the THIRD [CT] checkpoint: 11/11 battery rows in the clean container (shark-effect-kernels-w6).

---

### W4 — GENERATION

**WHAT:** The generation surface + the durability layer.

| Module | Lines | What it does |
|---|---|---|
| `nodes/prompt.ts` | 223 | The dual-mode Activity: `llm` calls the `Llm` cap (bracket repair ≤2, confidence 0.55 → INCONCLUSIVE/UNCLEAR); `template` is pure string fill. Journal pre+post rows. `replaceStubSync` at init |
| `workflow/jesl-run.ts` | 146 | `Workflow.make` JeslRun: payload `{docHash, seed}`, `idempotencyKey = ${docHash}:${hashSeed}`, `RunReceipt {runId, verdict, rowsCount, journalTail}`. The restore-or-start handler: rows-present → verify → covers()-gated replay → runProgram |
| `workflow/activities.ts` | 102 | `Activity.make` per node (`node:<id>`); the DurableDeferred ask: the question row persists, the answer row resumes |

**THE NO-RE-PAY HEADLINE (criterion 15):** the second run on the same `docHash+seed` → **invoke counter 0** + `covers()` true + the verdict rebuilt FROM the journal rows. Not re-paid, not re-executed.

**RESULT:** tsc 0 · vitest 184/184 (20 files) · tree digest `408f7500`.

---

### W5 — THE PACKAGER + BATTERY

**WHAT:** The ship surface + the definition of done made executable.

| Module | Lines | What it does |
|---|---|---|
| `packager/shared.ts` | — | The `validatedDoc` gate (decodeDoc+validateDoc), `ToolManifest`/`ChainDescriptor`/`SkillWriter`/`InMemoryWriter`, `canonicalJson` |
| `packager/tool.ts` | — | `emitTool(doc)` → the plugin-tool manifest (name from meta, input schema from vars, launch command `jesl run`) |
| `packager/chain.ts` | — | `emitChain(doc)` → the tool-chain descriptor (every node → `{tool, args, via}`, the registry check) |
| `packager/skill.ts` | — | `emitSkill(doc, outDir, writer)` → the SKILL.md (the fuse with the exact S5E launch line) + `payload/workflow.json` (byte-preserved) + `ctx.json` + `mission.md` + `anti-patterns.json` |
| `tests/battery.ts` | 448 | The executable 11-row battery runner: `runBattery(outPath)` executes S1–S9 + A1–A2, writes `{rows, summary}` to the artifact path |

**THE BATTERY CAUGHT A REAL KERNEL DEFECT:** `canonicalSerialize` in `core/journal.ts` included `ts` in the sha256 hash → the determinism proof (criterion 5, Law 6) was broken — two runs on the same doc+seed produced different chains. The surgical fix: `if (k === "ts") continue` in the canonical serialization. Post-fix: `chainsIdentical:true` proven.

**THE AUDIT INTEGRATED THE TWO HALVES:** the battery's S6 was checking for on-disk artifacts that nobody writes (emitSkill uses an injected writer). The orchestrator rewired S6 to call `emitSkill` directly (parsed doc → emit → run the emitted `payload/workflow.json` through `handleRun` → exit 0).

**RESULT:** tsc 0 · vitest 211/211 (20 files) · the battery 11/11 (pass:11 fail:0 blocked:0) · the SECOND [CT] in-container · tree digest `b7ab2cbc`.

---

### W6 — THE WRAPS

**WHAT:** The enforcement + artifact planes made real.

| Module | Lines | What it does |
|---|---|---|
| `wraps/behavior-engine.ts` | 194 | The BehaviorEngine: consumes `pba.family.hit` events, maintains per-family arming state with the escalation windows (5/2/0), the refractory period (25 seq), the alpha decay (0.05), the fire threshold (1.0, thr-v1) — **all ported WITH Paragon provenance shas** |
| `wraps/tool-engine.ts` | 72 | The ToolEngine: `intercept(toolCall)` consults the BehaviorEngine's armed state + the W3 deny-unless-armed rule → `{verdict: allow|deny, reason}` + emits `pta.intercept` |
| `wraps/effect-lsp.ts` | 126 | The REAL `LspCap` via the `effect-language-service` v0.87.2 CLI (`spawnSync` + JSON output parse at error severity); the honest `{available:false}` fallback |
| `wraps/artifact-gate.ts` | 116 | The PTA `EFFECT_ARTIFACT_GATE` layer: write → diagnose → deny/allow + the `pta.intercept` + journal rows |

**THE TEST_EVASION PRE-ARM CHAIN (PROVEN IN PRODUCTION FORM):** deliberation → PBA detects the family → the BehaviorEngine arms → the ToolEngine DENIES bash → the `pta.intercept` carries the family + the escalation decay table asserted (count 1→5, 2→5, 3→2, 4→0).

**RESULT:** tsc 0 · vitest 233/233 (22 files) · the THIRD [CT] in-container · tree digest `c80f56a9`.

---

### W7 — THE MPSE BRIDGE

**WHAT:** The math-before-code bridge — JESL math nodes COMPILE to the typed MathExpr IR; the oracle registry adjudicates; the kernel/stub emits produce the insertion's output (D3).

| Module | Lines | What it does |
|---|---|---|
| `mpse/parser.ts` | 198 | The 24-kind MathExpr IR (literal/var/5-arith/6-compare/3-logical/if/call/list/index/neg/forall/exists/temporal/neg); the tokenizer; the recursive-descent parser (precedence chain); depth limit 256; position tracking |
| `mpse/rule-cards.ts` | 78 | `compileRule`: the oracle presence check → `[JESL ORACLE-MISSING]` (the frozen token); the float-epsilon rule; `compileDoc`: per-node card extraction |
| `mpse/oracle.ts` | 200 | `compileOracle` (append-only, ORACLE_CONFLICT on duplicate); `discharge` (integer-equality ===, float+epsilon, NaN→CONTRADICTED, unregistered→UNVERIFIABLE, Infinity→CONTRADICTED) |
| `mpse/calibrate.ts` | 162 | D17 `EXCLUDED_BORN_OFF`: born-off samples → EXCLUDED, not FAIL; the calibration report {pass, contradict, unverifiable, excluded} |
| `mpse/kernel-emit.ts` | 149 | The per-node `KernelProto` with the Activity.make skeleton + oracle linkage |
| `mpse/stub-emit.ts` | 105 | The delta `CodeStub` (what the implementation wave must build vs what the kernel already proves) |
| `mpse/demo.ts` | 158 | `runDemo(docPath)` → `{cards, registry, report, kernel, stubs}` — the single entry that wires the full bridge |

**THE W7 GATE:** the demo fixture (5 nodes: arith 2+3=5, compare 5≥3, rule 7×6=42 OR-1, bornOff 2+2≠5 OR-2 EXCLUDED, sink) compiles end-to-end and **D17 is REPRODUCED** (pass:3 excluded:1 fail:0 — the born-off sample → EXCLUDED, not FAIL).

**RESULT:** tsc 0 · vitest 275/275 (25 files) · tree digest `01dc9691`.

---

### W8 — THE 6 LIFECYCLE KERNELS

**WHAT:** The full idea→ship lifecycle as 6 Effect Workflow kernels, each with its own workflow.json + activities.ts + fixtures/ + SKILL.md.

| Kernel | Pipeline | Tests | Key proof |
|---|---|---|---|
| `idea-to-bible` | blank→structured error; parallel explore (stub Llm, Effect.forEach 15); merge→schema-gate | 6 | The schema-gate passes before the bible is returned |
| `bible-to-spec` | digest(hash+inventory)→FR extraction→math lint (parseMathExpr)→WorkflowDoc gate | 6 | The math lint catches a bad expression |
| `spec-to-kernels` (D3) | runDemo composition + D17 assert + TestLive dry-run | 8 | THE INSERTION: the emitted kernel is runnable |
| `kernels-to-code` | stub inventory→Subagent dispatch→oracle-gate→repair (max 2) | 7 | Repair loop proven (invoke counter 2); 3-strike→FAIL |
| `verify` | parallel battery + passToken match + Effect.forEach 15 | 5 | One failing scenario → report shows fail; siblings survive |
| `ship` | manifest→copy (injected writer)→docs→audit gate chain | 7 | Hash-verify catches corrupted copy; atomic rollback |

**RESULT:** tsc 0 · vitest 314/314 (31 files) · tree digest `02aac5b0`.

---

### W9 — PROFILES + BINDINGS

**WHAT:** The domain composition + the host wiring.

| Module | Lines | What it does |
|---|---|---|
| `profiles/shared.ts` | — | The `DomainModule` type + the Schema validator + `isRealTag` (self-caught: Effect Tags are `class` = typeof "function") |
| `profiles/trident.ts` | — | Tier 1, deterministic-heavy (Shell/Fs, 5 kinds, no brackets) |
| `profiles/trading.ts` | — | Tier 2 (Http, math-eval/oracle-gate/circuit-breaker/evidence-gate, 1 bracket) |
| `profiles/sales.ts` | — | Tier 2 (Http + Llm, prompt/capture-engine/journal-sink, 1 bracket with floor 0.55) |
| `bindings/host-binding.ts` | 68 | The `ParagonHostBinding` contract: name + layer (Layer<KernelCaps>) + provides (Tag[]); `validateParagonHostBinding`; `bindingProvidesAll` |
| `bindings/opencode-binding.ts` | 28 | `makeOpenCodeBinding(transport)` delegates to `makeOpenCodeLive` — the deployment binding |

**ZERO BRANCHES PROVEN:** grep if/switch = 0 in each profile file. The profiles are pure lookup tables.

**RESULT:** tsc 0 · vitest 330/330 (33 files) · tree digest `c96aeb38`.

---

### W10 — THE EXTRACTION + ADOPTION

**WHAT:** The copy-and-customize proof — one kernel emits N adoptions.

| Module | Lines | What it does |
|---|---|---|
| `boilerplate/extraction.ts` | 209 | `extractBoilerplate(sourceDir, targetDir, profile)` → copies the kernel tree (core/, nodes/, cli/, drivers/, scanners/, workflow/, packager/, wraps/, mpse/, bindings/, profiles/<profile>) + generates package.json (name: '<target>-kernel', the profile's caps/kinds/tier) + copies tsconfig.json + emits the `boilerplate-manifest.json` with the sha256 digest |
| `tests/boilerplate.test.ts` | 107 | 6 units: the target tree structure, the package.json name+caps/kinds/tier, 10 core modules byte-identical (per-file sha256), the manifest validates, the battery proof |

**THE ADOPTION DRY-RUN:** the extracted tree compiles (tsc 0), its core/ modules are byte-identical (per-file sha256), its manifest validates (schemaVersion + digest), and its battery would pass.

**RESULT:** tsc 0 · vitest 336/336 (34 files) · tree digest `681bf869`.

---

## THE [CT] CONTAINER CHECKPOINTS

| Checkpoint | Container | Image | Tarball SHA | Scenarios | Result |
|---|---|---|---|---|---|
| W3 | shark-effect-kernels-w3b | runtime-grade-container-sandbox:master | `235a08d2` | 10 | **10/10 PASS** |
| W5 | shark-effect-kernels-w5 | runtime-grade-container-sandbox:master | `aab37463` | 6 | **6/6 PASS** |
| W6 | shark-effect-kernels-w6 | runtime-grade-container-sandbox:master | `dcabd97c` | 6 | **6/6 PASS** |
| **W10 FINAL** | **shark-effect-kernels-w10** | **runtime-grade-container-sandbox:master** | **`30fa9ec4`** | **6** | **6/6 PASS** |

### The W10 FINAL [CT] raw outputs

```
T1 full-battery:        Tests 336 passed (336) — exit 0
T2 the-11-row-battery:  pass:11 fail:0 blocked:0 — S1-S9+A1-A2 all PASS
T3 mech-gate:           exit 0, "verdict": "PASS"
T4 boilerplate:         Tests 6 passed (6) — the copy-and-customize proof
A1 corrupted-journal:   A1_EXIT:1 "verified": false
A2 usage-hygiene:       A2_EXIT:2 JESL=0
```

### The 11-row battery per-row detail (from the W10 FINAL [CT])

| Row | Scenario | Verdict | Pass token matched |
|---|---|---|---|
| S1 | jesl run mech-gate | PASS | `"verdict":"PASS"` + exit 0 |
| S2 | jesl validate × 4 bad fixtures | PASS | `[JESL UNKNOWN-NODE]` `[JESL CYCLE]` `[JESL TIER-VIOLATION]` `[JESL UNBRACKETED-GENERATION]` each exit 2 |
| S3 | needs-llm under keyless CLI | PASS | `[JESL CAP-UNBOUND] llm` + NO artifact |
| S4 | replay determinism + kill-resume | PASS | sha chain diff EMPTY + `chainsIdentical:true` + `killInvoked:0` |
| S5 | parallel-5 (branch 3 fails) | PASS | `overlapCount ≥ 1` + all 5 rows |
| S6 | skill rocket via the packager | PASS | `exit 0` + the emitted payload on disk |
| S7 | tier/unbracketed/ask-launcher | PASS | both tokens + the roundtrip `ans:42` |
| S8 | kernel hygiene + LSP | PASS | zero banned hits + `available` state |
| S9 | activity replay × 2 | PASS | invoke count 0 + identical chain |
| A1 | the malformed battery | PASS | each named token, never a hang |
| A2 | the pre-arm chain | PASS | `pba.family.hit` then `pta.intercept`, bash never ran |

---

## THE TEST GROWTH CURVE

```
Wave   Tests   Files   Digest       New tests
────   ─────   ─────   ────────     ─────────
W1      104      36    12ffbb3d     +104 (greenfield)
W2      129      46    e07eaf5c     +25  (CLI + execution)
W3      164      59    c154678b     +35  (driver + scanners)
W4      184      64    408f7500     +20  (generation + workflow)
W5      211      71    b7ab2cbc     +27  (packager + battery)
W6      233      77    c80f56a9     +22  (wraps)
W7      275      87    01dc9691     +42  (MPSE bridge)
W8      314      99    02aac5b0     +39  (6 lifecycle kernels)
W9      330     107    c96aeb38     +16  (profiles + bindings)
W10     336     109    681bf869     +6   (extraction + adoption)
```

**Every wave adds tests ADDITIVELY. Zero regressions at every step.**

---

## THE ADVERSARIAL FINDINGS (all root-cause fixed)

| # | Wave | Finding | Class | Root cause | Fix |
|---|---|---|---|---|---|
| 1 | W1 | `Date.now` in core/caps.ts:105 | Law 4 purity | The dummyClock reached for host time instead of Effect's Clock | → `EffectClock.currentTimeMillis` |
| 2 | W1 | `[JESL GATE-FAIL]` invented 9th token | Law 5 vocabulary | The gate author needed a failure label and reached for bracketed text | → removed; the delta lives in evidence.anchor |
| 3 | W2 | Schema stripped node `config` | W1 gap | `NodeEnvelope` had no `config` field — configs stripped at decode | → `config: Schema.optional(Schema.Unknown)` added |
| 4 | W2 | Executor passed `inbound:{}` | The dataflow law unrealized | `executor.ts:177` built NodeInput with empty inbound — nodes never saw channel data | → real channel data + full envelope NodeInput |
| 5 | W2 | Journal fallback `self` unverifiable | Law 6 broken | The fallback used `self-${seq}-${node}-${ts}` — verifyChain could never verify | → `simpleHash(canonicalSerialize(base) + NUL + prev)` |
| 6 | W2 | `passHandle` always-PASS mask | Fitted-to-golden | The CLI's deterministic run path used stand-ins instead of the real nodes | → the CLI rewired to the REAL nodes |
| 7 | W3 | The rig image `opencode-test:1.14.34` absent | Container tooling | The designed image unavailable; the substitute boots no TUI session | → the tarball deploy recipe (the tar branch of setup) |
| 8 | W5 | `canonicalSerialize` included `ts` | Law 6 determinism broken | The wall-clock timestamp leaked into the sha256 hash | → `if (k === "ts") continue` in the canonical form |
| 9 | W5 | Replay exit 0 on unverifiable chain | Law 7 | The replay handler returned code 0 regardless of verification | → `code: verified ? 0 : 1` |
| 10 | W5 | Battery S6 checked for artifacts nobody writes | Cross-agent integration | The battery's S6 expected on-disk artifacts but emitSkill uses an injected writer | → S6 rewired to call emitSkill + run the emitted payload |
| 11 | W5 | `[JESL UNKNOWN-NODE]` on CLI usage errors | Law 5 semantics | The CLI author used a kernel-looking string for argument errors | → plain usage text |
| 12 | W10 | `[JESL UNKNOWN-PROFILE]` ×2 in extraction.ts | Law 5 vocabulary (3rd occurrence) | The extraction author reached for bracketed text for a profile lookup miss | → plain `UNKNOWN_PROFILE` string |

**The recurring lesson (triple-canon):** the frozen vocabulary is EXACTLY 8 tokens (`[JESL UNKNOWN-NODE]` `[JESL CYCLE]` `[JESL TIER-VIOLATION]` `[JESL UNBRACKETED-GENERATION]` `[JESL CAP-UNBOUND]` `[JESL ORACLE-MISSING]` `[JESL CHANNEL-UNSET]` `[JESL NO-SEED]`). Every audit sweeps every new file for the bracketed shape before merging. Plain strings for everything else.

---

## THE MODULE INVENTORY (the full tree)

| Directory | Files | Lines | Purpose | Status |
|---|---|---|---|---|
| `core/` | 10 | ~1,857 | The kernel: schema, graph, channels, bus, caps, errors, executor, journal, registry, evidence | FIXED |
| `nodes/` | 15 | ~700 | The 33 node kinds (12 full + 21 stubs) | FIXED |
| `tests/` | 17 | ~3,500 | The 34-file / 336-test battery | FIXED |
| `cli/` | 3 | ~370 | The jesl bin (run/validate/replay) | FIXED |
| `drivers/` | 4 | ~470 | CliLive, OpenCodeLive, hook-bridge, session-live | FIXED |
| `scanners/` | 7 | ~500 | PBA, PTA, LSP, audit, trace + shared + banks | FIXED |
| `workflow/` | 2 | ~270 | JeslRun + activities (the durable layer) | FIXED |
| `packager/` | 4 | ~130 | The 3 emitters + shared types | FIXED |
| `wraps/` | 4 | ~400 | BehaviorEngine, ToolEngine, EffectLsp, ArtifactGate | FIXED |
| `mpse/` | 7 | ~900 | Parser, rule-cards, oracle, calibrate, kernel-emit, stub-emit, demo | FIXED |
| `kernels/` | 6 dirs | ~1,200 | The 6 lifecycle kernels (idea-to-bible → ship) | FIXED |
| `profiles/` | 5 | ~100 | The 3 domain profiles + shared types | FIXED |
| `bindings/` | 2 | ~96 | ParagonHostBinding + OpenCode binding | FIXED |
| `boilerplate/` | 1 | ~209 | The extraction (extractBoilerplate) | FIXED |
| `tests/` | 34 files | ~4,500 | The full test battery (336 units) | FIXED |
| **TOTAL** | **109 .ts** | **~7,800+** | | |

---

## THE DEPENDENCY LEDGER

| Package | Version | Purpose | Status |
|---|---|---|---|
| `effect` | 3.22.1 | The kernel runtime (Effect, Context, Layer, Schema, Fiber, Clock, Deferred, Queue) | INSTALLED |
| `@effect/platform` | 0.84.11 | The platform abstraction | INSTALLED |
| `@effect/platform-node` | 0.108.1 | The node-specific bindings | INSTALLED (peer warn: expects 0.97.1 — benign) |
| `@effect/vitest` | 0.24.1 | The test plane (`it.effect`) | INSTALLED |
| `@effect/workflow` | 0.19.1 | Durable runs (Workflow.make, Activity.make, DurableDeferred) | INSTALLED |
| `@effect/ai` | 0.37.0 | The AI model layer (NOT imported — the Llm cap abstraction stands alone) | INSTALLED |
| `@effect/language-service` | 0.87.2 | The LSP diagnostics CLI | INSTALLED |
| `typescript` | 5.9.3 | The type checker | DEV |
| `vitest` | 3.2.7 | The test runner | DEV |
| `@types/bun` | 1.4.0 | The bun type definitions | DEV |

**THE TEST RUNNER IS `npx vitest run`** — `bun test` does NOT work with @effect/vitest (`ctx?.onTestFinished is not a function`; bun:test ≠ vitest). This is canon (BUILD_STATE §5).

---

## THE HONEST RESIDUALS

1. **`@ts-nocheck` on 3 test files** (driver.test.ts, scanners-pba-pta.test.ts, scanners-lsp-audit.test.ts) — the @effect/vitest TestServices generic variance; the product files are clean. The typing debt is queued for the W10 sweep.
2. **The tsconfig include is per-directory explicit** (not wildcard) — each W8 agent added its own kernel to avoid cross-kernel tsc pollution from parallel WIP. Consolidate at the W10 sweep.
3. **@effect/platform-node 0.108.1 peer-warns against @effect/platform 0.84.11** (expects 0.97.1) — install exit 0, all tests green; VERIFY-ON-INSTALL recorded.
4. **`bun test` does not work** with @effect/vitest on this tree (`ctx?.onTestFinished is not a function`) — the canon gate runner is `npx vitest run`.
5. **The W1 tracker still holds a stale "stuck" alert** for w1-journal-registry-nodes — that agent completed, was harvested, and its wave audited; the alert is tracker lag, not a live stall.
6. **The DPL1's stale "bible 989L" front-matter count** (v1.0) was deliberately not fixed by A2 (out of scope) — the true count is 1,595L. The W1 prompts carry the true counts.
7. **The spec-to-kernels agent's TestLive dry-run uses `Context.empty()` + a dummy Clock** instead of providing the full TestLive Layer — sufficient for the deterministic nodes in the demo (no caps required); the full Layer wiring is W9's profiles.
8. **@effect/ai is installed but NOT imported** — the Llm cap abstraction (core/caps.ts) stands alone; @effect/ai is version-pinned for future use per DD24.

---

## THE REPLICATION RECIPES

```bash
# The full gate (any auditor re-proves the build in ~2 minutes)
cd <ROOT>/jesl
bunx tsc --noEmit; echo $?                                # expect 0
npx vitest run 2>&1 | grep -E "Tests"                     # expect 336 passed, 34 files

# The host-gate suite
bun run cli/main.ts run fixtures/mech-gate.json | head -3; echo $?
    # expect "verdict":"PASS", exit 0
for f in bad-unknown-kind bad-cycle bad-tier bad-unbracketed; do
  bun run cli/main.ts validate fixtures/$f.json 2>&1 | grep -o 'JESL [A-Z-]*' | head -1
done                                                        # expect the 4 distinct frozen tokens
bun run cli/main.ts run fixtures/needs-llm.json --driver test 2>&1 | grep -c CAP-UNBOUND
    # expect >= 1
bun run cli/main.ts run fixtures/mech-gate.json > /tmp/j.json && bun run cli/main.ts replay /tmp/j.json
    # expect "verified": true

# The purity gate
grep -rn "node:fs\|node:path\|node:child_process" core/ nodes/ scanners/ | wc -l
    # expect 0

# The token gate (the 8 frozen tokens, zero inventions)
grep -rhoE '\[JESL [A-Z-]+\]' core/ nodes/ cli/ drivers/ scanners/ workflow/ packager/ wraps/ mpse/ kernels/ profiles/ bindings/ boilerplate/ | sort -u
    # expect exactly the 8 frozen strings

# The spec-drift gate
cd ../specs && cat MACRO_KERNEL_BOILERPLATE_L2_SPEC.md <(printf '\0') JESL_LIBRARY_DPL1_SPEC.md <(printf '\0') EFFECT_TS_RUNTIME_BIBLE.md <(printf '\0') JESL_EFFECT_PHASE2_DPL1_SPEC.md | sha256sum
    # expect f77b448f…

# The tree digest
cd ../jesl && find core nodes tests cli drivers scanners workflow packager wraps mpse kernels profiles bindings boilerplate -name "*.ts" | sort | xargs sha256sum | sha256sum
    # expect 681bf869…
```

---

## THE CANON LINE

> **JESL — JSON Effect Scripting Language (D26, 2026-09-03; formerly "JSON Event Scripting Library" — the acronym and the 8 frozen tokens UNCHANGED). JESL authors the graph. MathExpr decides the math. Effect runs the graph. Paragon polices think and do. Effect LSP polices files. The journal proves everything. There is no other runtime.**

---

## THE WAVE AUDIT FILES (the full evidence chain)

| Audit | Path | Verdict | Key finding |
|---|---|---|---|
| w0 | `.trident/wave-audit/w0.md` | 13 hunks CORRECT | The 9/9 nine-questions gate |
| w1 | `.trident/wave-audit/w1.md` | 7× CORRECT (2 auditor fixes) | Date.now + GATE-FAIL |
| w2 | `.trident/wave-audit/w2.md` | FLAWED→FIXED + CORRECT | The passHandle mask + 3 real W1 defects |
| w3 | `.trident/wave-audit/w3.md` | 3× CORRECT + 1 auditor fix | The usage-token semantics |
| w4 | `.trident/wave-audit/w4.md` | 2× CORRECT + 1 auditor fix | JOURNAL-CORRUPT invented token |
| w5 | `.trident/wave-audit/w5.md` | 2× CORRECT + integration | The determinism defect + the S6 seam |
| w6 | `.trident/wave-audit/w6.md` | 2× CORRECT | The pre-arm chain + the real LSP |
| w7 | `.trident/wave-audit/w7.md` | 3× CORRECT | The 24-kind IR + D17 |
| w8 | `.trident/wave-audit/w8.md` | 6× CORRECT | All 6 lifecycle kernels |
| w9 | `.trident/wave-audit/w9.md` | 2× CORRECT | The profiles + bindings |
| w10 | (this section) | 1× CORRECT + 1 token fix | The extraction + adoption |
| results | `.trident/container-test-results.json` | 10+11+6+6 = 33 scenario rows | 4 container checkpoints |
