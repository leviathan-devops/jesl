# JESL-Kernel-Edition-v1.0

**JSON Effect Scripting Language** — a workflow engine where you define pipelines as JSON documents and execute them on the Effect-TS runtime.

## What it is

JESL lets you describe a pipeline of nodes as a JSON document. The kernel validates the document, builds the dependency graph, executes the nodes in dataflow-readiness order on Effect fibers (capped at 15 concurrent), journals every step to a sha256-chained evidence log, and returns a verdict.

The JSON document IS the program. The kernel IS the runtime. The journal IS the proof.

## Quick start

```bash
bun install
npx vitest run  # 336 tests green
bun src/cli/main.ts run fixtures/mech-gate.json  # "verdict": "PASS", exit 0
```

## Define a workflow

```json
{
  "$schema": "trident-workflow-v1",
  "meta": { "name": "my-pipeline", "tier": 1 },
  "nodes": [
    { "id": "check", "type": "gate",
      "config": { "asserts": [{ "path": "$.value", "op": "gt", "value": 10 }] } },
    { "id": "log", "type": "journal-sink" }
  ],
  "edges": [
    { "from": "check", "to": "log", "via": "result" }
  ],
  "vars": { "value": 15 }
}
```

## The 8 frozen error tokens

These strings NEVER change (D15 — the token register is string-frozen):

| Token | Fires when |
|---|---|
| `[JESL UNKNOWN-NODE]` | Node kind not in the registry |
| `[JESL CYCLE]` | Dependency graph has a cycle |
| `[JESL TIER-VIOLATION]` | Tier-1 doc uses a generation kind |
| `[JESL UNBRACKETED-GENERATION]` | Tier-2 generation missing its bracket |
| `[JESL CAP-UNBOUND]` | Required capability not in the driver Layer |
| `[JESL ORACLE-MISSING]` | Rule card has no expected value |
| `[JESL CHANNEL-UNSET]` | Node reads an unset channel |
| `[JESL NO-SEED]` | Declared entry channel has no seed |

## The laws (there are 13 — see COMPACTION_SURVIVAL.md for the full set)

1. **THE LIBRARY IS THE PRODUCT** — one library; use-cases are compositions
2. **THE SINGLE-RUNTIME LAW** — Effect is the only kernel; one runPromise per invocation
3. **THE PURITY LAW** — zero host imports in core/nodes
4. **THE TOKEN-STABILITY LAW** — the 8 tokens are string-frozen
5. **THE JOURNAL LAW** — every node journals; verdicts FROM rows
6. **THE LOUD-FAIL LAW** — CAP-UNBOUND with NO artifact
7. **THE SEPARATION LAW** — detect/decide/generate never merge
8. **THE LOWEST-COMPOSITION LAW** — the fewest generative nodes

## The architecture

See `Bibles/JESL_KERNEL_ARCHITECTURE_BIBLE.md` for the full 12-part reference.

## License

Private — internal engineering use only.
