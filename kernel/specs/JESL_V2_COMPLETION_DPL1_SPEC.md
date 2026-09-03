# BUILD SPEC ARTIFACT — JESL V2: THE COMPLETION WAVE
**Target:** `Effect_Runtime_Kernels/jesl/` (109 .ts files, 336 tests, digest `681bf869`)
**Generated:** 2026-09-03
**Trident Version:** v4.4.3
**Status:** PLANNING
**Artifact Type:** BUILD_SPEC (Layer 1 Prompt)
**Discovery:** ENABLED — 109 .ts files, ~7,800L source, 34 test files, 4 profiles, 6 kernels

---

## §1 PROBLEM STATEMENT

The JESL kernel (MacroKernel_Edition-v1.0) completed W0→W10 with 336/336 tests green, 4 container checkpoints passed, and zero spec drift (`f77b448f`). However, the kernel ships with **21 of 37 node kinds returning INCONCLUSIVE stubs** — 58% of the catalog does nothing when cast. The Llm capability interface has **no real model binding** (the `@effect/ai` package is pinned but never imported). The tsconfig uses **per-directory explicit includes** with `@ts-nocheck` on 8 files. The boilerplate extraction produces a **double-nested `src/<dir>/<dir>/` layout** that will confuse every adopter. The spellcasting intelligence layer (card rolodex, algorithm packager, L4 feedback loop) is **documented but not implemented**.

**The gap:** the kernel is production-grade as an execution engine (the journal, the schema gate, the pricing model, the packaging pipeline are all battle-tested) but the node coverage (42%), the intelligence layer (20%), and the adoption surface (60%) are below the 1.0 bar. A v2 completion wave must close these gaps without breaking the existing 336 tests, the frozen token vocabulary, or the append-only registry contract.

## §2 ARCHITECTURE

The kernel architecture is FIXED (L2 §2.5): core/ is pure (zero host imports), nodes/ is append-only, drivers/ bind capabilities as Layers, the executor is the sole runtime. The v2 wave operates WITHIN this architecture:
- **Stubs become real** via `replaceStub` (the append-only seam — same family + same caps = idempotent, divergent = RegistryFrozenError)
- **New modules** are added as new directories (the card-lexicon module, the algorithm packager)
- **Existing modules** are patched surgically (tsconfig consolidation, LlmLive binding)
- **The registry grows** (new kinds only, never renamed — D7)

## §3 DISCOVERY INTELLIGENCE

| Metric | Measured | Source |
|---|---|---|
| .ts files | 109 | `find . -name '*.ts' -not -path '*/node_modules/*' \| wc -l` |
| tests | 336 passed (34 files) | `npx vitest run` — 16.12s |
| tree digest | `681bf8696924a040` | `find ... \| sort \| xargs sha256sum \| sha256sum` |
| spec manifest | `f77b448fff1e…8ff1c` | NUL-join of 4 specs |
| stub kinds | 21 (20 unique + 4 execution superseded at import) | `grep stub( nodes/stubs.ts` |
| @ts-nocheck files | 8 (4 tests + battery.ts + battery.test.ts + 2 others) | `grep -rl '@ts-nocheck'` |
| tsconfig includes | 53 lines (per-directory explicit) | `grep -c '"' tsconfig.json` |
| profiles | 4 files (shared + trident + trading + sales) | `ls profiles/*.ts` |
| kernels | 6 dirs (idea-to-bible … ship) | `ls -d kernels/*/` |
| node kinds implemented | 16 (+prompt) | nodes/ listing vs registry |
| node kinds stubbed | 21 | nodes/stubs.ts |
| container checkpoints | 4/4 GREEN | .trident/container-test-results.json |
| boilerplate files | 74 .ts (double-nested src/) | glob of the boilerplate tree |
| @effect/ai | pinned 0.37.0, NOT imported | package.json + grep |

## §4 CORE INSIGHT

**The kernel must complete its node coverage and wire its intelligence layer to become a real spellcasting runtime — not just a well-tested execution engine.**

The governing non-negotiables:
1. **Error handling on every path**: every stub implementation must fail LOUD (a frozen token or a FAIL verdict), never silently return wrong data.
2. **Boundary validation**: every new node validates its config before firing — a malformed config is a refusal, not a runtime error.
3. **Resource cleanup**: long-running machines (persistent, context-aware) MUST close their scopes — kill shell children, detach bus subscriptions, flush the journal.
4. **Side-effects-before-claims**: the experienced effect is computed FROM journal rows, never narrated — every stub implementation must produce real journal rows.
5. **The registry is append-only**: stubs become real via `replaceStub`; kinds are never renamed; v1 cards run forever.
6. **The 8 frozen tokens are the ONLY refusal vocabulary**: inventing a 9th is the recurring triple-canon violation.

## §5 SCOPE

| # | Requirement | ≤200 chars |
|---|---|---|
| R1 | Flatten the boilerplate src/ double-nesting to single-level dirs | mv src/core/core/ → src/core/ etc.; fix tsconfig includes; fix imports; verify tsc 0 + vitest green |
| R2 | Consolidate tsconfig to a single unified include; remove @ts-nocheck from 8 files | fix the TestServices generic variance (type the it.effect wrappers); verify tsc 0 |
| R3 | Wire a real LlmLive Layer calling @effect/ai | the prompt node's llm mode becomes functional; scripted-model tests pass; real-model integration test (manual) |
| R4 | Implement 4 evidence-plane stubs: evidence-gate, evidence-machine, claim-gate, audit-registry | delegate to core/evidence.ts (the G1 port); each produces journal rows; each has accept/reject tests |
| R5 | Implement 3 MPSE stubs: oracle-gate, mpse-discharge, oracle-discharge | wire mpse/parser.ts + mpse/oracle.ts; discharge = integer equality; NaN→CONTRADICTED |
| R6 | Implement 5 Paragon stubs: ratio-classifier, synapse, intent-classifier, escalation-memory, circuit-breaker | wire scanners/pba-banks.ts + wraps/behavior-engine.ts; the math is proven; the node binding is the work |
| R7 | Implement 9 infrastructure stubs: machine, sqlite-sink, replay-source, cron-trigger, event-reactivate, layer-loader, config-lock, workflow-machine, audit-registry | the OS-level kinds; sqlite via better-sqlite3; cron via Schedule |
| R8 | Build the card rolodex module: indexed card collection, search by family/kind/effect, composition preview | a new jesl/rolodex/ module; reads the registry + authored cards; outputs the lexicon |
| R9 | Build the algorithm packager: 10 named chains as parameterized modules | a new jesl/algorithms/ module; each algorithm = a card-chain template + config schema |
| R10 | Build the L4 feedback loop: post-cast journal analysis → framework effectiveness → lexicon update | reads the journal after a run; scores which frameworks worked; updates rolodex recommendations |
| R11 | Dynamic profile authoring: DomainModules as installable packages | profiles become loadable configs, not hardcoded imports; the kernel reads the active profile at startup |
| R12 | Re-extract the boilerplate post-completion; verify the adoption dry-run | extractBoilerplate → the extracted tree compiles → core byte-identical → manifest validates → battery passes |

## §6 SUCCESS CRITERIA

| # | Criterion | Verification command | Expected |
|---|---|---|---|
| SC1 | TypeScript compiles with ZERO errors and ZERO @ts-nocheck | `cd jesl && bunx tsc --noEmit; echo $?` | exit 0 · `grep -rl '@ts-nocheck' \| wc -l` = 0 |
| SC2 | ALL tests pass — zero regressions | `cd jesl && npx vitest run 2>&1 \| grep Tests` | 336+ passed (0 failed) |
| SC3 | The tree digest CHANGES (proof of work) but the spec manifest does NOT | recompute both digests | tree ≠ 681bf869 · spec = f77b448f |
| SC4 | Node coverage ≥ 90% (≥33 of 37 kinds real) | `grep -c 'INCONCLUSIVE' nodes/stubs.ts` = 0 · `grep -c 'stub(' nodes/stubs.ts` ≤ 4 (superseded only) |
| SC5 | Every new node has accept + reject tests | `npx vitest run --reporter=verbose \| grep -c '✓'` ≥ 336 + (new stubs × ~2 tests each) |
| SC6 | The Llm cap has a real binding | `grep -c 'LlmLive' drivers/` ≥ 1 · a prompt-llm test passes with the scripted model |
| SC7 | The card rolodex exists and indexes the registry | `ls jesl/rolodex/` ≥ 3 files · a rolodex test returns 37 kinds |
| SC8 | The algorithm packager exists with ≥10 chains | `ls jesl/algorithms/` ≥ 10 files · each compiles a valid card |
| SC9 | The L4 feedback module exists and produces effectiveness scores | `ls jesl/feedback/` ≥ 1 file · a test produces `{framework: score}` from a journal |
| SC10 | Profiles are loadable, not hardcoded | `grep -c 'import.*trident' jesl/profiles/index.ts` = 0 (dynamic loading) |
| SC11 | The boilerplate is single-nested | `find boilerplate/src -mindepth 2 -name '*.ts' -path '*/*/*' \| wc -l` = 0 |
| SC12 | The adoption dry-run passes post-completion | boilerplate tests 6/6 green |
| SC13 | The 8 frozen tokens are UNCHANGED | `grep -rhoE '\[JESL [A-Z-]+\]' \| sort -u` = the same 8 strings |
| SC14 | The purity law holds | `grep -rn 'node:fs\|node:path\|node:child_process' core/ nodes/ scanners/ \| wc -l` = 0 |
| SC15 | The container checkpoint passes | `.trident/container-test-results.json` gains a V2 row · battery 11/11 · boilerplate 6/6 |

## §7 CONTAINER TEST PLAN

**Evidence requirement:** every scenario's pass token must appear IN a tool result (stdout, stderr, exit code, or a JSON artifact field) — never in agent prose.

**Pass threshold: 15/15 scenarios PASS.** One FLAWED scenario invalidates the suite.

| # | Angle | Scenario | Pass token (tool-result) | Fail token |
|---|---|---|---|---|
| S1 | IDENTITY | the kernel identifies itself: `tsc 0` + `vitest 336+ passed` | `Tests 336 passed` OR higher · exit 0 | `failed` · exit ≠ 0 |
| S2 | TOOLS | cast a tier-1 spell through the CLI: mech-gate + the new nodes | `"verdict":"PASS"` + exit 0 per spell | exit ≠ 0 on any happy-path |
| S3 | FIREWALL | cast a tier-1 spell that tries generation | `[JESL TIER-VIOLATION]` in stderr + exit 2 | exit 0 on the bad card |
| S4 | BOUNDARY | cast a card with: empty nodes, missing vars, unknown kind, cyclic edges | the matching `[JESL ...]` token per fixture + exit 2 | exit 0 on any malformed card |
| S5 | ERRORS | a shell-exec node with a command that times out + a http-request to an unreachable host | FAIL verdict with `timeout` or `error` in the anchor | INCONCLUSIVE (a defect, not a failure) |
| S6 | STATE | corrupt a journal row → replay → verify | `"verified": false` + exit 1 | `"verified": true` on a tampered chain |
| S7 | CONFIG | cast a cap-bound card under the TestLive driver (no Shell) | `[JESL CAP-UNBOUND] shell` + NO artifact | a silent skip or a fabricated artifact |
| S8 | CONCURRENCY | cast parallel-5 with branch 3 failing | `overlapCount ≥ 1` + all 5 rows present | strictly sequential or missing rows |
| S9 | INTEGRATION | the full lifecycle: idea → bible → spec → kernels → code → verify → ship | per-kernel journal chain linked (prev/self) | a broken chain link |
| S10 | AUDIT | the evidence-plane stubs: cast an evidence-gate card with a claim + a fresh source_change | verdict EVIDENCED + journal row `evidence.gate` | UNEVIDENCED on valid evidence |
| S11 | PERMISSIONS | dispatch a Subagent without an oracle gate | FAIL or UNBRACKETED-GENERATION | silent dispatch success |
| S12 | LIFECYCLE | the DYNAMIC machine: runDemo on the 5-node fixture → D17 EXCLUDED_BORN_OFF | `pass:3 excluded:1 fail:0` | `fail > 0` (born-off counted as FAIL) |
| S13 | INTEGRATION | the card rolodex: index all kinds → search by family → compose a chain | the rolodex returns 37 kinds · a composed chain validates | an empty index or an invalid chain |
| S14 | STATE | the L4 feedback: run a spell → read the journal → produce framework scores | `{framework: score}` with numeric values | empty or non-numeric scores |
| S15 | INTEGRATION | the adoption dry-run post-completion: extractBoilerplate → compile → battery | boilerplate tests 6/6 · tsc 0 · the battery 11/11 | any test failure in the extracted tree |

**Adversarial angles covered:** IDENTITY, TOOLS, FIREWALL, BOUNDARY, ERRORS, STATE, CONFIG, CONCURRENCY, INTEGRATION, AUDIT, PERMISSIONS, LIFECYCLE — 12 of 12.

**Evidence capture:** per scenario, the tool-result context (stdout/stderr excerpt or JSON field) is captured in `.trident/container-test-results.json` under the V2 section, with `passTokenMatch` and `failTokenAbsent` per row.

---

## THE WAVE MAP (the execution order)

```
 ┌─── WAVE V2a: SHIP-BLOCKERS (P0, ~3 days) ─────────────────────┐
 │                                                                │
 │  agent-1: FLATTEN the boilerplate (R1)                         │
 │           mv src/core/core/ → src/core/ etc.                   │
 │           fix tsconfig includes + relative imports             │
 │           verify: extracted tree compiles + battery green      │
 │                                                                │
 │  agent-2: CONSOLIDATE tsconfig + kill @ts-nocheck (R2)         │
 │           type the it.effect wrappers (the TestServices fix)   │
 │           single include covering src/ + tests/ + mpse/        │
 │           verify: tsc 0 with 0 @ts-nocheck                     │
 │                                                                │
 │  agent-3: WIRE THE REAL LLM (R3)                               │
 │           write LlmLive in drivers/ using @effect/ai           │
 │           scripted-model tests pass (the existing prompt tests)│
 │           a real-model integration test (manual, no CI)        │
 │                                                                │
 └────────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌─── WAVE V2b: THE STUB IMPLEMENTATIONS (P1, ~2 weeks) ────────┐
 │                                                                │
 │  agent-4: THE EVIDENCE PLANE (R4)                              │
 │           evidence-gate → core/evidence.ts ingest + adjudicate │
 │           evidence-machine → the 8-kind ring buffer            │
 │           claim-gate → claim + fresh source_change = EVIDENCED │
 │           audit-registry → the finding ledger                  │
 │           each: accept + reject tests + journal rows           │
 │                                                                │
 │  agent-5: THE MPSE PLANE (R5)                                  │
 │           oracle-gate → compileRule + discharge check           │
 │           mpse-discharge → the full calibrate pipeline          │
 │           oracle-discharge → the discharge matrix               │
 │           each: integer equality · NaN→CONTRADICTED · D17      │
 │                                                                │
 │  agent-6: THE PARAGON PLANE (R6)                               │
 │           ratio-classifier → the 4-bank scoreSignals            │
 │           synapse → the λ-decay + refractory model              │
 │           intent-classifier → the fusion (0.5/0.3/0.2 weights)  │
 │           escalation-memory → the 5/2/0 windows + skipTier      │
 │           circuit-breaker → 3 failures → OPEN → timeout         │
 │           each: the math is PROVEN in scanners/wraps — the      │
 │           node binding wraps it (D12: wrap never rewrite)       │
 │                                                                │
 │  agent-7: THE INFRASTRUCTURE PLANE (R7)                         │
 │           machine → the state snapshot if cross-process         │
 │           sqlite-sink → better-sqlite3 WAL + IMMEDIATE          │
 │           replay-source → covers() check → resume or re-run     │
 │           cron-trigger → Schedule + Clock (the driver fiber)    │
 │           event-reactivate → dormant → wake via EventBus        │
 │           layer-loader → load a DomainModule at runtime         │
 │           config-lock → freeze the config (Object.freeze)       │
 │           workflow-machine → the Workflow.make wrapper          │
 │           audit-registry → the finding ledger (triplet store)   │
 │                                                                │
 │  GATE: tsc 0 · vitest 336+ · node coverage ≥ 90% · tokens 8/8  │
 └────────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌─── WAVE V2c: THE INTELLIGENCE LAYER (P2, ~3 weeks) ──────────┐
 │                                                                │
 │  agent-8: THE CARD ROLODEX (R8)                                │
 │           jesl/rolodex/{index,search,compose}.ts               │
 │           index: reads the registry + authored cards → the     │
 │             lexicon {kind, family, tier, caps, bracket}        │
 │           search: by family / by kind / by effect / by tier    │
 │           compose: chain cards → preview the graph → validate  │
 │           tests: index returns 37 · search returns matches ·   │
 │             a composed chain passes validateDoc                │
 │                                                                │
 │  agent-9: THE ALGORITHM PACKAGER (R9)                          │
 │           jesl/algorithms/{guard,retry,fan,oracle,bracket,     │
 │             ask,chain,pre-arm,verify,ship}.ts                  │
 │           each: a card-chain template + a config schema +       │
 │             a compile(cfg) → WorkflowDoc function              │
 │           tests: each compiles a valid card · validateDoc passes│
│                                                                │
 │  agent-10: THE L4 FEEDBACK LOOP (R10)                           │
 │           jesl/feedback/{analyze,score,update}.ts               │
 │           analyze: read the journal rows after a run             │
│           score: which frameworks contributed to the verdict?    │
│           update: update the rolodex recommendations              │
│           tests: a journal → numeric scores → the rolodex reflects│
│                                                                   │
│  agent-11: DYNAMIC PROFILE AUTHORING (R11)                        │
│           profiles become loadable configs (JSON, not imports)     │
│           the kernel reads the active profile at startup           │
│           profiles can be added/removed without recompiling        │
│           tests: load trident → the same behavior; load sales →   │
│             the Llm cap becomes available; load an unknown →      │
│             a loud profile error                                   │
│                                                                   │
│  agent-12: RE-EXTRACT + VERIFY (R12)                               │
│           re-run extractBoilerplate on the completed kernel        │
│           the extracted tree: single-nested · compiles ·           │
│             the battery passes · the manifest validates            │
│           THE CONTAINER CHECKPOINT: the full battery + the         │
│             adoption dry-run in the clean room                     │
│                                                                   │
│  FINAL GATE: SC1-SC15 all GREEN · the container row V2 in the     │
│              results artifact · the tree digest recomputed         │
└───────────────────────────────────────────────────────────────────┘
```

## THE DEPENDENCY SPINE

```
 V2a (ship-blockers) ──► V2b (stubs) ──► V2c (intelligence)
      R1,R2,R3               R4-R7            R8-R12

 R1 (flatten) is independent of R2 (tsconfig) and R3 (Llm).
 R4-R7 are independent of each other (disjoint stub sets).
 R8 (rolodex) depends on R4-R7 (the registry must be complete).
 R9 (algorithms) depends on R8 (composes from the lexicon).
 R10 (feedback) depends on R8 + R9 (scores against the lexicon).
 R11 (profiles) is independent of R8-R10.
 R12 (re-extract) depends on ALL prior.

 PARALLEL WITHIN WAVES: V2a agents 1-3 run in parallel.
 V2b agents 4-7 run in parallel. V2c agents 8-11 run in
 parallel (R12 is the FINAL gate — runs alone after all).
```

## THE DO-NOTS

- DO NOT break the 336 existing tests — every new node is ADDITIVE
- DO NOT rename any existing kind — the registry is append-only (D7)
- DO NOT invent a 9th `[JESL ...]` token — the vocabulary is frozen at 8 (D15)
- DO NOT import `node:fs/fetch/Date.now/Math.random/setTimeout` in core/ — the purity law (Law 4)
- DO NOT put `Effect.runPromise` anywhere except the driver edge (Law 3)
- DO NOT modify the 4 pinned spec files — the manifest is the drift tripwire
- DO NOT use `bun test` — `npx vitest run` is the canon runner
- DO NOT skip the container checkpoint — the V2 row is the definition of done

<!-- DPL1-END -->
