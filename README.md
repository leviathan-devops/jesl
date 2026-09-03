# JESL — JSON Effect Scripting Language

**A workflow engine where you define pipelines as JSON documents and execute them on the Effect-TS runtime.**

## THE ONE-LINE MODEL

You write a JSON file describing a pipeline of operations (nodes connected by edges). The kernel validates it, computes the execution order from the dependencies, runs the operations on Effect-TS fibers (capped at 15 concurrent), journals every step to a sha256-chained tamper-proof log, and returns a verdict.

## QUICK START

```bash
cd kernel
bun install
bunx tsc --noEmit          # must exit 0
npx vitest run              # 336+ tests, must be all green
bun run cli/main.ts run fixtures/mech-gate.json    # → "verdict":"PASS" exit 0
```

> **Test runner:** `npx vitest run` — `bun test` does NOT work with @effect/vitest.

## REPO LAYOUT

```
kernel/           the JESL kernel source (109 .ts files, fully self-contained)
  core/           the 10-module engine (schema, graph, channels, bus, caps,
                  errors, executor, journal, registry, evidence)
  nodes/          the node implementations (37 registered kinds)
  cli/            the jesl bin (run/validate/replay)
  drivers/        CliLive (production) · TestLive (testing) · OpenCodeLive (host)
  scanners/       PBA · PTA · LSP · audit · trace (the observer plane)
  workflow/       the durable layer (Workflow.make + DurableDeferred)
  packager/       1 card → 3 targets (plugin tool / tool-chain / skill rocket)
  wraps/          BehaviorEngine · ToolEngine · EffectLsp · ArtifactGate
  mpse/           the math bridge (24-kind MathExpr IR → oracle → D17)
  kernels/        the 6 lifecycle kernels (idea→bible→spec→kernels→verify→ship)
  profiles/       domain modules (trident · trading · sales)
  bindings/       the ParagonHostBinding contract + the OpenCode binding
  fixtures/       the executable test cards
  tests/          the full test battery (34 files, 336 it.effect units)

docs/             the complete documentation library
specs/            the read-only authority specs (L2, DPL1, EFFECT-RT, Phase-2)
boilerplate/      the adoptable tree (copy-and-customize)
evidence/         the build proof (wave audits, container results)
canon/            the session state ledger (12 canon docs)
```

## THE 8 FROZEN ERROR TOKENS

```
[JESL UNKNOWN-NODE]           kind not in the registry / dup id / dangling edge
[JESL CYCLE]                  the dependency graph has a cycle
[JESL TIER-VIOLATION]         tier-1 doc uses a generation kind
[JESL UNBRACKETED-GENERATION] tier-2 generation missing bracket.contract
[JESL CAP-UNBOUND]            required cap not bound in the driver Layer
[JESL ORACLE-MISSING]         rule card without its expected value
[JESL CHANNEL-UNSET]          node reads an unwritten channel
[JESL NO-SEED]                declared entry channel has no seed
```

These are string-frozen. No 9th code may ever be invented. The fixtures are the tripwire.

## THE 5-STAGE SPELLCASTING PIPELINE

```
Stage 1: WRITE THE CARD (the JSON document — idea + effect + evidence contract)
Stage 2: THINK IT THROUGH (the TDM decision lens: classify, cascade, premortem)
Stage 3: COMPILE (each TDM framework → graph structure: nodes, edges, configs)
Stage 4: THE KERNEL RENDERS IT (runProgram executes live, journals as evidence)
Stage 5: PACKAGE THE ROCKET (emitSkill → a named, castable, self-contained formula)
```

## THE CORE MODULES

| Module | What it does |
|---|---|
| `schema.ts` | validates the card JSON — the 5 refusals before any fiber starts |
| `graph.ts` | builds the dependency graph, detects cycles, computes readiness batches |
| `channels.ts` | the named-channel dataflow store with deep-copy observer law |
| `bus.ts` | the glob-pattern EventBus with handler crash isolation |
| `caps.ts` | 9 Context.Tags — the capability interfaces the driver Layer binds |
| `errors.ts` | the 8 frozen Schema.TaggedError classes |
| `executor.ts` | the run loop: readiness → pre-flight → forEach(15) → journal |
| `journal.ts` | the sha256-chained evidence log with covers() replay |
| `registry.ts` | the append-only kind catalog with the replaceStub seam |
| `evidence.ts` | the 8-kind evidence adjudicator with RING_CAP 50 |

## THE GUARANTEES

1. Nothing runs outside the schema — the doc is the truth
2. One node's failure never kills its siblings — per-item Exit capture
3. Every step is journaled — INVOKE + VERDICT per node, sha256-chained
4. Replay is free — covers(docHash, seed) → verdict from rows, invoke 0
5. Pricing is pre-flight — missing caps → loud refusal before any work
6. The API never breaks — append-only registry, v1 cards run forever
7. The vocabulary is frozen — 8 tokens, the fixtures are the tripwire
8. Purity is enforced — core/ never imports node:*, the driver is the boundary

## THE DEPENDENCIES

```
effect                    3.22.1    the kernel runtime
@effect/platform          0.84.11   the platform abstraction
@effect/platform-node     0.108.1   the node bindings
@effect/vitest            0.24.1    the test plane
@effect/workflow          0.19.1    durable runs
@effect/ai                0.37.0    the Llm interface (NOT imported — cap-only)
@effect/language-service  0.87.2    the LSP diagnostics CLI
typescript                5.9.3
vitest                    3.2.7
```

## THE EVIDENCE

- **336/336 tests passing** (34 files, ~16s)
- **4/4 container checkpoints GREEN** (clean-room execution)
- **11/11 battery rows PASS** (S1-S9 + A1-A2 adversarials)
- **Zero spec drift** (manifest f77b448f stable through all 10 waves)
- **12 adversarial findings** — all root-cause fixed, all re-verified
- **Tree digest** `681bf869` — the verified fingerprint

## LICENSE

Private — all rights reserved.
