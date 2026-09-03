import { Effect, Schema, Clock } from "effect"
import { Journal, simpleHashExport } from "../../core/journal"
import { JeslChannelUnset, JeslNoSeed } from "../../core/errors"
import type { SkillWriter } from "../../packager/shared"

export type ShipWriter = SkillWriter

export interface ShipArtifact {
  readonly path: string
  readonly content: string
}

export const ShipManifestEntry = Schema.Struct({
  path: Schema.String,
  sha256: Schema.String
})

export const ShipManifest = Schema.Struct({
  files: Schema.Array(ShipManifestEntry),
  total: Schema.Number,
  verified: Schema.Boolean
})
export type ShipManifest = typeof ShipManifest.Type

export interface ShipResult {
  readonly manifest: ShipManifest
  readonly copies: ReadonlyArray<{ path: string; content: string }>
  readonly docs: ReadonlyArray<{ path: string; content: string }>
  readonly audit: { schemaOk: boolean; hashOk: boolean }
}

export const hashContent = (content: string): string => simpleHashExport(content)

export const buildManifest = (artifacts: ReadonlyArray<ShipArtifact>): ShipManifest => {
  const files = artifacts.map((a) => ({ path: a.path, sha256: hashContent(a.content) }))
  return { files, total: files.length, verified: false }
}

export const buildManifestEffect = (
  artifacts: ReadonlyArray<ShipArtifact>
): Effect.Effect<ShipManifest, JeslNoSeed> =>
  Effect.gen(function* () {
    if (artifacts.length === 0) {
      return yield* Effect.fail(
        new JeslNoSeed({
          code: "[JESL NO-SEED]",
          node: "manifest-build",
          field: "verifiedArtifacts",
          expected: "one or more verified artifacts",
          actual: "empty artifact list",
          remedy: "provide at least one verified artifact from the verify kernel"
        })
      )
    }
    for (const a of artifacts) {
      if (!a.path || a.content === undefined || a.content === null) {
        return yield* Effect.fail(
          new JeslChannelUnset({
            code: "[JESL CHANNEL-UNSET]",
            node: "manifest-build",
            field: "artifacts[path]",
            expected: "artifact with {path, content}",
            actual: `missing ${!a.path ? "path" : "content"} in artifact`,
            remedy: "ensure every artifact has a non-empty path and content"
          }) as unknown as JeslNoSeed
        )
      }
    }
    return buildManifest(artifacts)
  })

const journalAppend = (
  runId: string,
  node: string,
  kind: string,
  verdict: string,
  pattern: string,
  anchor: string
): Effect.Effect<void, never, Journal> =>
  Effect.gen(function* () {
    const journal = yield* Journal
    const ts = yield* Clock.currentTimeMillis
    yield* journal.append({
      run: runId,
      node,
      kind: kind as any,
      verdict: verdict as any,
      evidence: { pattern, state: verdict, anchor },
      source: `workflow/ship/${node}`,
      ts
    } as any)
  })

export const copyArtifacts = (
  artifacts: ReadonlyArray<ShipArtifact>,
  manifest: ShipManifest,
  writer: ShipWriter,
  outputDir: string
): Effect.Effect<ReadonlyArray<{ path: string; content: string }>, JeslChannelUnset> =>
  Effect.gen(function* () {
    const dir = outputDir.endsWith("/") ? outputDir.slice(0, -1) : outputDir
    const staged: Array<{ path: string; content: string }> = []
    for (const a of artifacts) {
      const expected = manifest.files.find((f) => f.path === a.path)
      if (!expected) {
        return yield* Effect.fail(
          new JeslChannelUnset({
            code: "[JESL CHANNEL-UNSET]",
            node: "copy",
            field: "manifest.files",
            expected: `manifest entry for ${a.path}`,
            actual: "missing manifest entry",
            remedy: "rebuild manifest before copy — the manifest is the compat surface (D6)"
          })
        )
      }
      const actual = hashContent(a.content)
      if (actual !== expected.sha256) {
        return yield* Effect.fail(
          new JeslChannelUnset({
            code: "[JESL CHANNEL-UNSET]",
            node: "copy",
            field: "audit.hash",
            expected: expected.sha256,
            actual,
            remedy: "artifact content changed after manifest — rebuild manifest"
          })
        )
      }
      staged.push({ path: `${dir}/${a.path}`, content: a.content })
    }
    const written: string[] = []
    for (const s of staged) {
      const res = yield* writer.write(s.path, s.content).pipe(
        Effect.map(() => null),
        Effect.catchAll((e) =>
          Effect.gen(function* () {
            for (const w of written) {
              yield* writer.write(w, "").pipe(Effect.catchAll(() => Effect.void))
            }
            return yield* Effect.fail(
              new JeslChannelUnset({
                code: "[JESL CHANNEL-UNSET]",
                node: "copy",
                field: "writer.write",
                expected: `write ${s.path}`,
                actual: String((e as any)?.message ?? e),
                remedy: "ensure the writer output dir is writable — copy is atomic (Law 11)"
              })
            )
          })
        )
      )
      if (res === null) written.push(s.path)
    }
    return staged
  })

export const generateDocs = (
  manifest: ShipManifest,
  writer: ShipWriter,
  outputDir: string
): Effect.Effect<ReadonlyArray<{ path: string; content: string }>, never> =>
  Effect.gen(function* () {
    const dir = outputDir.endsWith("/") ? outputDir.slice(0, -1) : outputDir
    const readme = `# Ship Artifact\n\nShippable artifact produced by the ship lifecycle kernel (K15).\n\n## Manifest\n\nTotal files: ${manifest.total}\nVerified: ${manifest.verified}\n\n## Files\n\n${manifest.files.map((f) => `- ${f.path} \`${f.sha256.slice(0, 12)}\``).join("\n")}\n\n## Audit\n\nRun the audit gate chain: schema-gate the manifest, hash-verify the copies.\n`
    const manifestJson = JSON.stringify(manifest, null, 2)
    const docs = [
      { path: `${dir}/README.md`, content: readme },
      { path: `${dir}/manifest.json`, content: manifestJson }
    ]
    for (const d of docs) {
      yield* writer.write(d.path, d.content).pipe(Effect.catchAll(() => Effect.void))
    }
    return docs
  })

export const auditGateChain = (
  manifest: ShipManifest,
  copies: ReadonlyArray<{ path: string; content: string }>
): Effect.Effect<{ schemaOk: boolean; hashOk: boolean }, JeslChannelUnset> =>
  Effect.gen(function* () {
    const decoded = yield* Schema.decodeUnknown(ShipManifest)(manifest).pipe(
      Effect.mapError(
        (e) =>
          new JeslChannelUnset({
            code: "[JESL CHANNEL-UNSET]",
            node: "audit-gate",
            field: "manifest",
            expected: "{files: [{path, sha256}], total, verified}",
            actual: String((e as any)?.message ?? e),
            remedy: "manifest failed schema-gate — rebuild manifest per D6"
          })
      )
    )
    if (decoded.files.length !== decoded.total) {
      return yield* Effect.fail(
        new JeslChannelUnset({
          code: "[JESL CHANNEL-UNSET]",
          node: "audit-gate",
          field: "manifest.total",
          expected: `total === files.length (${decoded.files.length})`,
          actual: String(decoded.total),
          remedy: "total must equal files.length — the compat surface (D6)"
        })
      )
    }
    for (const f of decoded.files) {
      if (!f.path || !f.sha256) {
        return yield* Effect.fail(
          new JeslChannelUnset({
            code: "[JESL CHANNEL-UNSET]",
            node: "audit-gate",
            field: "manifest.files[]",
            expected: "{path, sha256}",
            actual: `missing ${!f.path ? "path" : "sha256"}`,
            remedy: "every manifest entry must have path and sha256"
          })
        )
      }
    }
    const copyMap = new Map(copies.map((c) => [c.path.split("/").pop()!, c] as const))
    const byPath = new Map(copies.map((c) => [c.path, c] as const))
    for (const f of decoded.files) {
      let found: { path: string; content: string } | undefined
      for (const [p, c] of byPath) {
        if (p.endsWith(f.path) || p === f.path) { found = c; break }
      }
      if (!found) found = copyMap.get(f.path)
      if (!found) {
        return yield* Effect.fail(
          new JeslChannelUnset({
            code: "[JESL CHANNEL-UNSET]",
            node: "audit-gate",
            field: "copies",
            expected: `copy for ${f.path}`,
            actual: "missing copy",
            remedy: "copy is atomic — every manifest file must have a copy (Law 11)"
          })
        )
      }
      const actual = hashContent(found.content)
      if (actual !== f.sha256) {
        return yield* Effect.fail(
          new JeslChannelUnset({
            code: "[JESL CHANNEL-UNSET]",
            node: "audit-gate",
            field: `hash:${f.path}`,
            expected: f.sha256,
            actual,
            remedy: "hash-verify failed — copy corrupted after manifest (D6)"
          })
        )
      }
    }
    return { schemaOk: true, hashOk: true }
  })

export const ship = (
  artifacts: ReadonlyArray<ShipArtifact>,
  writer: ShipWriter,
  opts: { outputDir: string; runId: string }
): Effect.Effect<ShipResult, JeslChannelUnset | JeslNoSeed, Journal> =>
  Effect.gen(function* () {
    const runId = opts.runId
    const outputDir = opts.outputDir
    yield* journalAppend(runId, "manifest-build", "invoke", "PASS", "ship.manifest.build", `ship:${runId}:manifest`)
    const manifest0 = yield* buildManifestEffect(artifacts)
    yield* journalAppend(runId, "manifest-build", "verdict", "PASS", "ship.manifest.built", `ship:${runId}:manifest:${manifest0.total}`)
    yield* journalAppend(runId, "copy", "invoke", "PASS", "ship.copy.start", `ship:${runId}:copy`)
    const copies = yield* copyArtifacts(artifacts, manifest0, writer, outputDir).pipe(
      Effect.catchAll((e) =>
        Effect.gen(function* () {
          yield* journalAppend(runId, "copy", "verdict", "FAIL", "ship.copy.fail", `ship:${runId}:copy:fail:${(e as any).field ?? "unknown"}`)
          return yield* Effect.fail(e)
        })
      )
    )
    yield* journalAppend(runId, "copy", "verdict", "PASS", "ship.copy.done", `ship:${runId}:copy:${copies.length}`)
    yield* journalAppend(runId, "docs-generate", "invoke", "PASS", "ship.docs.start", `ship:${runId}:docs`)
    const docs = yield* generateDocs(manifest0, writer, outputDir)
    yield* journalAppend(runId, "docs-generate", "verdict", "PASS", "ship.docs.done", `ship:${runId}:docs:${docs.length}`)
    yield* journalAppend(runId, "audit-gate", "invoke", "PASS", "ship.audit.start", `ship:${runId}:audit`)
    const audit = yield* auditGateChain(manifest0, copies).pipe(
      Effect.catchAll((e) =>
        Effect.gen(function* () {
          yield* journalAppend(runId, "audit-gate", "verdict", "FAIL", "ship.audit.fail", `ship:${runId}:audit:fail:${(e as any).field ?? "unknown"}`)
          return yield* Effect.fail(e)
        })
      )
    )
    yield* journalAppend(runId, "audit-gate", "verdict", "PASS", "ship.audit.pass", `ship:${runId}:audit:pass`)
    const verifiedManifest: ShipManifest = { ...manifest0, verified: true }
    const manifestJson = JSON.stringify(verifiedManifest, null, 2)
    yield* writer.write(`${outputDir.replace(/\/$/, "")}/manifest.json`, manifestJson).pipe(Effect.catchAll(() => Effect.void))
    yield* journalAppend(runId, "journal-sink", "verdict", "PASS", "ship.journal.done", `ship:${runId}:done:${verifiedManifest.total}`)
    return { manifest: verifiedManifest, copies, docs, audit }
  })
