# Ship Kernel — K15: manifest → copy → docs → audit gate chain

## Identity

The terminal lifecycle kernel (W8 6/6, F19 #6). Consumes the verify kernel's report (all green) and produces the shippable artifact: manifest + copies + docs, gated by the audit chain. The one that produces the shippable artifact — W10 composes all 6 with this as the terminal step.

## When to use

Invoke when the verify phase has passed (all green) and the project must be shipped: the manifest IS the compat surface (D6), the audit gate MUST pass before the ship declares (Law 7), the copy is atomic — no partial ships (Law 11).

## Launch

```sh
# via workflow
bunx jesl run jesl/kernels/ship/workflow.json --in verifiedArtifacts.json
# via code — the injected writer is the boundary (W5 SkillWriter pattern, E3 zero host imports in kernel core)
import { ship } from "./activities"
import { InMemoryWriter } from "../../packager/shared"
import { makeJournal, Journal } from "../../core/journal"
yield* ship(artifacts, writer, { outputDir: "dist/ship", runId: "ship-run-1" }).pipe(Effect.provide(JournalLive))
```

## Payload

- `workflow.json` — the JESL graph: manifest-build → copy → docs-generate → audit-gate → journal-sink (Law 7: gate failure = structured error; Law 11: copy atomic).
- `activities.ts` — Effect activities: `buildManifest` (sha256 per file, D6), `copyArtifacts` (injected SkillWriter, atomic), `generateDocs` (README stub + manifest.json doc), `auditGateChain` (schema-gate + hash-verify), `ship` (orchestrator + Journal chain per step).
- `fixtures/` — sample artifacts to ship: artifact-a.json, artifact-b.json, artifact-c.txt (the W8 verify output or test artifacts — loadable, minimal).
- Tests: `jesl/tests/ship.test.ts` — >=4 it.effect units: happy ship (manifest+copies verified), missing artifact → structured error, hash-verify catches corrupted copy, journal chain intact.

## Workflow Steps

1. **manifest-build** — sha256 per artifact file → `{files: [{path, sha256}], total, verified:false}` — D6 compat surface. Empty input → `[JESL NO-SEED]`.
2. **copy** — injected `SkillWriter.write` per file, staged then written atomically; hash-verify against manifest before write; on writer failure roll back partial writes → `[JESL CHANNEL-UNSET]` (Law 11).
3. **docs-generate** — `README.md` stub + `manifest.json` doc via the same writer (docs ARE the manifest as the doc per spec).
4. **audit-gate chain** — `Schema.decodeUnknown(ShipManifest)` (E4 schema-gate) + hash-verify copies against manifest (D6). Failure = structured `[JESL CHANNEL-UNSET]` — the ship is NOT declared (Law 7).
5. **journal** — every step journals through `core/journal.ts` append/rows/verify: manifest-build, copy, docs-generate, audit-gate. `verifyChain` proves the chain.

## Laws

- Law 7: audit gate MUST pass before ship declared — gate failure = structured error (never a silent skip).
- Law 11: copy is atomic — no partial ships (rollback on failure).
- D6: manifest IS the compat surface — `{files: [{path, sha256}], total, verified}`.
- E3: zero host imports in kernel core — the writer is the boundary (packager/shared.ts SkillWriter).
- E4: Schema-gated decode for the manifest gate.
- E5: `Activity.make` journaled I/O — each ship step is a journaled activity (replayable).

## Verification

```sh
bunx tsc --noEmit   # 0 errors
npx vitest run jesl/tests/ship.test.ts  # >=4 green, zero regressions
```
