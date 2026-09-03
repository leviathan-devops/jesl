# JESL — JSON Effect Scripting Language
## Kernel Edition v1.0 — the adoptable boilerplate

JESL is a JSON Effect Scripting Language: you write a JSON file with your pipeline
steps. The kernel validates it, runs each step on Effect-TS in dependency order,
logs every result to a tamper-proof journal, and returns PASS or FAIL.

This tree is a COMPLETE, FUNCTIONAL kernel extracted from the production
Effect_Runtime_Kernels build. It is not a skeleton, not a tutorial, and not a
mock. All 37 node kinds return real verdicts. 424 tests pass out of the box.
Zero `@ts-nocheck`. One 20-line tsconfig. No LLM wiring anywhere — the `Llm`
capability is an interface; you plug in whatever model you want, or nothing.

---

## QUICK START

```bash
bun install                      # 93 packages, ~3s
bunx tsc --noEmit                # exit 0 — the whole tree type-checks
npx vitest run                   # 39 files, 424 tests, all green
bun run cli/main.ts run algorithms/guard.json     # cast your first card
```

The last command prints a workflow document: per-node verdicts, evidence
patterns, batch order, and a sha256-chained journal tail. `"verdict": "PASS"`
and exit code 0 mean every node did real work.

---

## THE SHAPE OF A CARD

A card (workflow document) is a JSON file:

```json
{
  "$schema": "trident-workflow-v1",
  "meta": { "name": "my-pipeline", "tier": 1 },
  "nodes": [
    { "id": "gateA",  "type": "gate" },
    { "id": "work",   "type": "math-eval", "config": { "expr": { "_tag": "literal", "value": 42 } } },
    { "id": "check",  "type": "gate", "config": { "asserts": [ { "path": "$.result", "op": "eq", "value": 42 } ] } },
    { "id": "sink",   "type": "journal-sink" }
  ],
  "edges": [
    { "from": "gateA", "to": "work",  "via": "seed" },
    { "from": "work",  "to": "check", "via": "result" },
    { "from": "check", "to": "sink",  "via": "oracleOut" }
  ],
  "vars": {}
}
```

Rules the executor enforces:

- `edges[].via` names a channel. A downstream node reads upstream outputs through
  that channel: `inbound[via] = upstreamOutputs[via]` (key-matched). An assert
  path `$.result` reads the channel named `result`.
- A gate's `asserts` run `getByPath` against its inbound channels: `eq`, `ne`,
  `ge`, `le`, `contains`, `matches`.
- Nodes fire in dependency order, batched when independent, on Effect fibers
  (concurrency 15). Every invocation writes INVOKE + VERDICT rows to a
  sha256-chained, append-only journal. `verifyChain` detects any tampering.
- Tier 1 documents may not contain generation nodes. Tier 2 generation nodes
  (`prompt`) MUST carry `bracket.contract` (the unbracketed are refused) and an
  Llm capability — which is YOURS to bind; this kernel ships none.

---

## THE 37 NODE KINDS

`core/registry.ts` is the single source of truth (append-only; unknown kinds are
refused loudly with `[JESL UNKNOWN-NODE]`).

Deterministic (18): event-filter, capture-engine, machine, gate, oracle-gate,
circuit-breaker, state-machine, journal-sink, triplet-writer, sqlite-sink,
replay-source, pipeline, parallel, retry-chain, fallback-chain, pause,
cron-trigger, event-reactivate.

Decision (12): ratio-classifier, synapse, intent-classifier, escalation-memory,
evidence-gate, layer-loader, math-eval, oracle-discharge, claim-gate,
config-lock, workflow-machine, mpse-discharge.

Evidence (2): evidence-machine, audit-registry.
Execution (4): shell-exec, python-exec, http-request, file-io.
Generation (1): prompt (tier 2, bracket required, Llm cap required — yours to bind).

Each kind's exact config contract lives in `nodes/<kind>.ts`. Read the file
before configuring — the configs are typed and validated at cast time, and a
misconfigured node fails loudly, never silently.

---

## THE 10 ALGORITHM CARDS (`algorithms/`)

Working pipeline templates. Every one casts PASS as shipped. Each carries a
`meta.slots` `[WORK SLOT]` annotation telling you where your domain logic plugs in.

| card | chain | plug your logic into |
|---|---|---|
| guard.json | gate → work-slot → triplet-writer | the slot node |
| retry.json | retry-chain → fallback-chain | retry/fallback configs |
| fan.json | parallel → gate(all-PASS) | the parallel items |
| oracle.json | math-eval → gate assert | the expr + expected value |
| bracket.json | gate → pipeline → claim-gate (preSource pre-armed) | the bracketed prompt swap (tier 2) |
| ask.json | gate → pipeline(ask-launcher) | the ask template |
| chain.json | gate → work-slot → journal-sink | replay-source swap (config.runId) |
| pre-arm.json | ratio-classifier → escalation-memory → gate | ratio/memory configs |
| verify.json | parallel(scenarios) → gate(passToken) | the scenario items |
| ship.json | gate → pipeline → file-io → audit-registry | the write path + audit fields |

## SEARCHING THE CATALOG

```bash
bun run lexicon.ts        # regenerates lexicon.json
```

`lexicon.json` indexes all 37 kinds by family, plus every card (fixtures +
algorithms) and which kinds each uses.

## PROFILES (`profiles/`)

A DomainModule binds capability Tags + a kind allowlist + tier + brackets.
`default.ts` is the zero-config entry (Shell/Fs/Http, all 37 kinds, tier 1).
`trident.ts`, `trading.ts`, `sales.ts` are domain examples. Validation is
`validateDomainModule` in `profiles/shared.ts` — a profile that does not
validate throws at import.

## THE FROZEN REFUSAL VOCABULARY

Exactly 8 tokens, string-frozen, never invented, never suppressed:

`[JESL UNKNOWN-NODE]` `[JESL CYCLE]` `[JESL TIER-VIOLATION]`
`[JESL UNBRACKETED-GENERATION]` `[JESL CAP-UNBOUND]` `[JESL ORACLE-MISSING]`
`[JESL CHANNEL-UNSET]` `[JESL NO-SEED]`

Every one is a loud failure with node/field/actual/remedy fields. The kernel
never guesses, never silently substitutes, never returns a placeholder dressed
as a verdict. The negative fixtures in `fixtures/bad-*.json` demonstrate all
refusal paths — `npx vitest run tests/cli.test.ts` proves them.

## LAYOUT

```
core/      schema, graph, channels, bus, caps, errors, executor, journal, registry, evidence
nodes/     37 kind implementations + registry wiring (index.ts) + stubs.ts (empty)
cli/       main + args + handlers (the run/validate/lexicon entry points)
drivers/   cli-live, opencode-live, hook-bridge, session-live (host I/O boundary)
scanners/  pba, pta, lsp, audit, trace
workflow/  jesl-run + per-kernel activities
packager/  tool/chain/skill packaging
kernels/   idea-to-bible, bible-to-spec, spec-to-kernels, kernels-to-code, verify, ship
mpse/      parser, rule-cards, oracle, calibrate, emitters
wraps/     behavior-engine, tool-engine, effect-lsp, artifact-gate
algorithms/  the 10 cards        fixtures/  positive + negative cast fixtures
profiles/  DomainModules         tests/     39 files, 424 tests
lexicon.ts + lexicon.json         dist/index.js  deploy marker
```

Purity law: `node:` imports are legal ONLY in `cli/` and `drivers/`. `core/` and
`nodes/` are pure Effect — the capability tags (Shell, Fs, Http, Llm, Journal,
Clock) are the ONLY door to the outside world, and you bind them per-driver.

## CAPABILITIES THE CLI DRIVER BINDS

Shell, Fs, Http, Journal, HashCap. That is all. `prompt` (Llm) casts only under
a driver you write that binds your model. This is deliberate: the kernel is
boilerplate machinery you plug data and capabilities INTO — it ships zero model
code, zero API keys, zero network calls you did not author in a card.

## MODIFYING IT

- Add a node kind: write `nodes/my-kind.ts` (a NodeImpl with real invoke logic +
  error paths), then register it in `nodes/index.ts` (import + the wiring loop or
  a module-bottom `replaceStubSync`). Add ≥2 adversarial tests. The registry is
  append-only — the executor, the lexicon, and the loud unknown-kind refusal all
  pick your kind up automatically. Never add a kind to a handler-side map; there
  is no handler-side map.
- Add a card: copy an `algorithms/*.json` shape, keep `via` channel names
  key-matched to upstream output names, cast it, iterate until PASS.
- Change tsconfig: it is 20 lines. `include: ["**/*.ts"]` — new files are
  type-checked with zero config changes.

## PROVENANCE

Extracted from the production kernel (Effect_Runtime_Kernels/jesl) via
`boilerplate/extraction.ts` — `boilerplate-manifest.json` records the source
digest. Kernel state at extraction: 37/37 kinds functional, 424/424 tests,
tsc 0, zero @ts-nocheck, spec manifest f77b448f (zero drift through 10 build
waves + 3 overhaul waves + 5 container checkpoints).

Live repo: https://github.com/leviathan-devops/jesl
