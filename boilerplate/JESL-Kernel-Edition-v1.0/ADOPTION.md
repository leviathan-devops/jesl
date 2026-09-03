# ADOPTION GUIDE — JESL-Kernel-Edition-v1.0

> **JESL — JSON Effect Scripting Language.** A workflow engine where you define pipelines as JSON documents and execute them on the Effect-TS runtime. This guide walks a NEW project from zero to a running kernel. Full reference: `Bibles/JESL_KERNEL_ARCHITECTURE_BIBLE.md`. Quick usage: `Bibles/JESL_KERNEL_OPERATING_MANUAL.md`.

---

## WHAT YOU RECEIVED

```
JESL-Kernel-Edition-v1.0/
├── package.json          name @jesl/kernel · bin: jesl → ./cli/main.ts · the pinned dep spine
├── README.md             the 60-second orientation
├── tsconfig.json         the per-directory include (the tsc gate)
├── fixtures/fixtures/    the 9 battery fixtures (byte-identical to the source kernel)
└── src/                  74 .ts files — the full kernel
    ├── src/core/core/         10 modules (schema, graph, channels, bus, caps, errors, executor, journal, registry, evidence)
    ├── src/nodes/nodes/       the node kinds (16 implemented + the registry stubs)
    ├── src/cli/cli/           the jesl bin (run/validate/replay) — THE single runPromise edge
    ├── src/drivers/drivers/   CliLive (real I/O) · OpenCodeLive (HostTransport) · SessionLive · hook-bridge
    ├── src/scanners/scanners/ PBA · PTA · LSP · audit · trace (+ the Paragon-provenance banks)
    ├── src/workflow/workflow/ the durable layer (Workflow.make JeslRun + Activities)
    ├── src/packager/packager/ the 3 emitters (tool / chain / skill rocket)
    ├── src/wraps/wraps/       BehaviorEngine · ToolEngine · effect-lsp · artifact-gate
    ├── src/mpse/mpse/         the math bridge (24-kind IR → oracle → D17 → kernel/stub emits)
    ├── src/kernels/kernels/   the 6 lifecycle kernels (idea→bible→spec→kernels→verify→ship)
    ├── src/profiles/profiles/ trident (t1) · trading (t2) · sales (t2) · shared
    ├── src/bindings/bindings/ the ParagonHostBinding contract + the OpenCode binding
    └── src/boilerplate/boilerplate/  extractBoilerplate (emit YOUR adoptable tree)
```

**The doubled `src/<dir>/<dir>/` layout** is the extraction's copy artifact. Either keep it (adjust nothing — the internal imports are relative and already correct) or flatten one level (then update the tsconfig include paths).

---

## THE 5-STEP ADOPTION

### Step 1 — COPY

```bash
cp -r JESL-Kernel-Edition-v1.0/ my-project-kernel
cd my-project-kernel
```

### Step 2 — INSTALL

```bash
bun install
# the spine: effect 3.22.1 · @effect/platform · @effect/platform-node · @effect/vitest
#            @effect/workflow · @effect/ai (pinned, not imported) · @effect/language-service
```

### Step 3 — VERIFY THE BASELINE (never trust a copy — prove it)

```bash
bunx tsc --noEmit                                  # expect exit 0
npx vitest run                                     # expect all green (NEVER `bun test` — see below)
bun run cli/main.ts run fixtures/mech-gate.json    # expect "verdict":"PASS", exit 0
```

> **THE TEST RUNNER IS `npx vitest run`.** `bun test` does NOT work with @effect/vitest (`ctx?.onTestFinished is not a function` — bun:test ≠ vitest).

### Step 4 — PICK OR AUTHOR A PROFILE

The profiles are pure DATA — the adoption preset declaring which caps and kinds your domain uses:

```typescript
// src/profiles/profiles/my-domain.ts
import { Http, Llm } from "../core/caps"
import type { DomainModule } from "./shared"

export const myDomainProfile: DomainModule = {
  name: "my-domain",
  caps: [Http, Llm],                                   // REAL Context.Tags only
  kinds: ["http-request", "prompt", "journal-sink"],   // from the registry
  defaultTier: 2,
  brackets: {
    prompt: { contract: "schemas/output.schema.json", repair: 2, floor: 0.55 }
  }
}
```

Rules: zero branches (no if/switch — the profile is a lookup table); caps must be REAL Tags; brackets `repair ≤ 2`, `floor` 0..1. Register it in `src/boilerplate/boilerplate/extraction.ts` PROFILES if you want it extractable.

### Step 5 — AUTHOR A WORKFLOW AND RUN IT

```json
{
  "$schema": "trident-workflow-v1",
  "meta": { "name": "my-first-pipeline", "tier": 1 },
  "nodes": [
    { "id": "check", "type": "gate",
      "config": { "asserts": [{ "path": "$.value", "op": "ge", "value": 10 }] } },
    { "id": "sink", "type": "journal-sink" }
  ],
  "edges": [ { "from": "check", "to": "sink", "via": "data" } ],
  "vars": { "value": 15 }
}
```

```bash
bun run cli/main.ts run my-first-pipeline.json          # → {"verdict":"PASS", ...} exit 0
bun run cli/main.ts validate my-first-pipeline.json     # → ok
```

---

## THE CUSTOMIZATION SURFACE

| Layer | Mutability | How |
|---|---|---|
| `core/`, `nodes/`, `cli/`, `drivers/`, `scanners/`, `workflow/`, `packager/`, `wraps/`, `mpse/` | **FIXED** — do not fork | extend via the append-only registry: `register(impl)` for NEW kinds, `replaceStub(kind, impl)` to implement a stub |
| `kernels/` | **EDIT** | author project kernels on the 6-seed pattern (activities.ts + workflow.json + SKILL.md + fixtures/) |
| `profiles/` | **EDIT** | your DomainModule (data, zero branches) |
| `bindings/` | **EDIT** | implement `HostTransport` for your host; `makeOpenCodeBinding(transport)` is the pattern |

### Adding a new node kind (the append-only way)

```typescript
import { Effect, Clock } from "effect"
import { register } from "./core/registry"

const myKindNode = {
  kind: "my-kind",                    // NEW name — never rename an existing kind
  family: "deterministic" as const,
  requiredCaps: [],
  invoke: (input: any, _ctx: unknown) =>
    Effect.gen(function* () {
      const startMs = yield* Clock.currentTimeMillis
      const endMs = yield* Clock.currentTimeMillis
      return {
        verdict: "PASS" as const,
        outputs: { result: "done" },
        evidence: { pattern: "my-kind", state: "PASS", anchor: `${input.node.id}:1` },
        timing: { startMs, endMs }
      }
    })
}
// register(myKindNode) — append-only: same family+caps re-register is idempotent, divergence throws
```

---

## THE INVARIANTS YOU INHERIT (never break these)

1. **The 8 `[JESL ...]` tokens are string-frozen.** Never invent a 9th bracketed token; never wear one on a non-refusal. Plain strings for everything else.
2. **Core purity.** `core/` and `nodes/` never import `node:*`, `fetch`, `Date.now`, `Math.random`, or `setTimeout`. Host I/O lives ONLY in the driver Layer.
3. **One `Effect.runPromise` edge** — `cli/main.ts`. Construction ≠ execution.
4. **The journal is the run.** Every node journals invoke+verdict; the sha chain excludes `ts` (determinism); replay rebuilds verdicts FROM rows with invoke counter 0.
5. **Loud-fail.** A refusal is a structured `[JESL ...]` error; a failed assertion is a FAIL verdict with the delta in `evidence.anchor`; INCONCLUSIVE is a fail-state.
6. **The registry is append-only.** Kinds never rename; v1 docs run on later registries forever.
7. **Tier discipline.** Tier 1 forbids generation; tier-2 generation is bracketed (`contract` + `repair ≤ 2` + `confidenceFloor`).

---

## THE 8 FROZEN TOKENS (your refusals — grep-stable)

| Token | Fires when |
|---|---|
| `[JESL UNKNOWN-NODE]` | unregistered kind / duplicate id / dangling edge |
| `[JESL CYCLE]` | the dependency graph has a cycle |
| `[JESL TIER-VIOLATION]` | tier-1 doc uses a generation kind/class |
| `[JESL UNBRACKETED-GENERATION]` | tier-2 generation without bracket.contract |
| `[JESL CAP-UNBOUND]` | a required cap is not bound in the driver Layer (no artifact) |
| `[JESL ORACLE-MISSING]` | a rule card without its expected value |
| `[JESL CHANNEL-UNSET]` | a node reads an unset channel (FAIL verdict) |
| `[JESL NO-SEED]` | a declared entry channel has no seed (FAIL verdict) |

---

## GOING DURABLE

Wrap your run in the Workflow layer when it must survive process death (pause, ask-launcher, generation replay):

```typescript
import { runJeslWorkflow } from "./workflow/jesl-run"
// runJeslWorkflow(docHash, seed, doc, baseCtx)
//  → first run: executes; journal rows written
//  → second run: covers() true → the verdict rebuilt FROM rows, invoked: 0 (no-re-pay)
```

## THE LIFECYCLE (idea → ship)

The 6 kernels compose the full pipeline. Each carries its own SKILL.md with the launch snippet:

```
idea → [idea-to-bible] → bible → [bible-to-spec] → spec
     → [spec-to-kernels] → kernels+stubs   (D3: runDemo + D17 + TestLive dry-run)
     → [kernels-to-code] → artifacts       (Subagent dispatch + oracle-gate + repair ≤ 2)
     → [verify]          → report          (parallel battery, passToken in tool-result)
     → [ship]            → manifest+copies (hash-verify + atomic rollback)
```

## PROVENANCE

This edition is the MacroKernel_Edition-v1.0 extraction of the Effect_Runtime_Kernels build: 109 .ts source files, 336 it.effect tests, 4 green container checkpoints, zero spec drift (`f77b448f`). The Paragon enforcement constants (escalation 5/2/0, refractory 25, α 0.05, fire 1.0) carry their source shas in `src/wraps/wraps/behavior-engine.ts` and `src/scanners/scanners/pba-banks.ts`.
