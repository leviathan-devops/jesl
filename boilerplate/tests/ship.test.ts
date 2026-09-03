import { describe, it, expect } from "@effect/vitest"
import { Effect, Schema } from "effect"
import * as Fs from "node:fs"
import * as Path from "node:path"
import { makeJournal, Journal, simpleHashExport } from "../core/journal"
import { InMemoryWriter } from "../packager/shared"
import { decodeDoc, validateDoc } from "../core/schema"
import { isKnownKindSync } from "../packager/shared"
import {
  ship,
  buildManifest,
  buildManifestEffect,
  auditGateChain,
  copyArtifacts,
  generateDocs,
  ShipManifest,
  hashContent
} from "../kernels/ship/activities"

const fixturesDir = Path.join(import.meta.dirname ?? Path.dirname(new URL(import.meta.url).pathname), "..", "kernels/ship/fixtures")

const loadArtifacts = (): Array<{ path: string; content: string }> => {
  const files = Fs.readdirSync(fixturesDir)
  return files.sort().map((f) => ({
    path: f,
    content: Fs.readFileSync(Path.join(fixturesDir, f), "utf-8")
  }))
}

describe("ship kernel — K15 manifest → copy → docs → audit gate chain", () => {
  it.effect("happy ship: manifest + copies verified + docs + audit pass", () =>
    Effect.gen(function* () {
      const artifacts = loadArtifacts()
      expect(artifacts.length).toBeGreaterThanOrEqual(2)
      const writer = new InMemoryWriter()
      const journal = yield* makeJournal
      const runId = "ship-happy-001"
      const result = yield* ship(artifacts, writer as any, { outputDir: "dist/ship", runId }).pipe(
        Effect.provideService(Journal, journal)
      )
      expect(result.manifest.total).toBe(artifacts.length)
      expect(result.manifest.verified).toBe(true)
      expect(result.manifest.files.length).toBe(artifacts.length)
      for (const f of result.manifest.files) {
        expect(typeof f.path).toBe("string")
        expect(typeof f.sha256).toBe("string")
        expect(f.sha256.length).toBeGreaterThan(10)
      }
      expect(result.copies.length).toBe(artifacts.length)
      expect(result.docs.length).toBe(2)
      expect(result.audit.schemaOk).toBe(true)
      expect(result.audit.hashOk).toBe(true)
      const manifestContent = writer.get("dist/ship/manifest.json")!
      expect(manifestContent).toBeTruthy()
      const parsed = JSON.parse(manifestContent)
      expect(parsed.verified).toBe(true)
      expect(parsed.total).toBe(artifacts.length)
      const readme = writer.get("dist/ship/README.md")!
      expect(readme).toContain("Ship Artifact")
      expect(readme).toContain(String(artifacts.length))
      for (const a of artifacts) {
        const copy = writer.get(`dist/ship/${a.path}`)!
        expect(copy).toBe(a.content)
        const entry = result.manifest.files.find((f) => f.path === a.path)!
        expect(hashContent(a.content)).toBe(entry.sha256)
      }
      const decoded = yield* Schema.decodeUnknown(ShipManifest)(result.manifest)
      expect(decoded.total).toBe(artifacts.length)
    }))

  it.effect("missing artifact (empty input) → structured [JESL NO-SEED] error, no ship declared", () =>
    Effect.gen(function* () {
      const writer = new InMemoryWriter()
      const journal = yield* makeJournal
      const res = yield* ship([], writer as any, { outputDir: "dist/ship", runId: "ship-empty-001" }).pipe(
        Effect.provideService(Journal, journal),
        Effect.either
      )
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(String(err.code)).toContain("[JESL NO-SEED]")
        expect(err.node).toBe("manifest-build")
      }
      expect(writer.list().length).toBe(0)
    }))

  it.effect("hash-verify catches corrupted copy → audit gate fails with structured error", () =>
    Effect.gen(function* () {
      const artifacts = loadArtifacts()
      const manifest = buildManifest(artifacts)
      const corruptedCopies = artifacts.map((a, i) =>
        i === 0 ? { path: `dist/ship/${a.path}`, content: a.content + "CORRUPTED" } : { path: `dist/ship/${a.path}`, content: a.content }
      )
      const res = yield* auditGateChain(manifest, corruptedCopies as any).pipe(Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(String(err.code)).toContain("[JESL CHANNEL-UNSET]")
        expect(err.field).toContain("hash:")
        expect(err.node).toBe("audit-gate")
      }
    }))

  it.effect("journal chain intact: every ship step journals + verify passes", () =>
    Effect.gen(function* () {
      const artifacts = loadArtifacts()
      const writer = new InMemoryWriter()
      const journal = yield* makeJournal
      const runId = "ship-journal-001"
      yield* ship(artifacts, writer as any, { outputDir: "dist/ship", runId }).pipe(
        Effect.provideService(Journal, journal)
      )
      const rows = yield* journal.rows(runId).pipe(Effect.provideService(Journal, journal))
      expect(rows.length).toBeGreaterThanOrEqual(6)
      const nodes = rows.map((r) => r.node)
      expect(nodes).toContain("manifest-build")
      expect(nodes).toContain("copy")
      expect(nodes).toContain("docs-generate")
      expect(nodes).toContain("audit-gate")
      expect(nodes).toContain("journal-sink")
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i]!.prev).toBe(rows[i - 1]!.self)
        expect(rows[i]!.seq).toBe(i)
      }
      expect(rows[0]!.prev).toBe("genesis")
      expect(rows[0]!.seq).toBe(0)
      const ok = yield* journal.verify(runId).pipe(Effect.provideService(Journal, journal))
      expect(ok).toBe(true)
    }))

  it.effect("workflow.json decodes and validates as WorkflowDoc", () =>
    Effect.gen(function* () {
      const wfRaw = JSON.parse(Fs.readFileSync(Path.join(import.meta.dirname ?? Path.dirname(new URL(import.meta.url).pathname), "..", "kernels/ship/workflow.json"), "utf-8"))
      const doc = yield* decodeDoc(wfRaw)
      expect(doc.$schema).toBe("trident-workflow-v1")
      expect(doc.meta.name).toBe("ship")
      expect(doc.nodes.length).toBe(5)
      expect(doc.edges.length).toBe(4)
      const v = yield* validateDoc(doc, isKnownKindSync).pipe(Effect.either)
      expect(v._tag).toBe("Right")
    }))

  it.effect("manifest IS compat surface: Schema roundtrip + total === files.length", () =>
    Effect.gen(function* () {
      const artifacts = loadArtifacts()
      const manifest = buildManifest(artifacts)
      const encoded = yield* Schema.encode(ShipManifest)(manifest)
      const decoded = yield* Schema.decodeUnknown(ShipManifest)(encoded)
      expect(decoded.total).toBe(decoded.files.length)
      expect(decoded.verified).toBe(false)
      const verified = { ...decoded, verified: true }
      const reDecoded = yield* Schema.decodeUnknown(ShipManifest)(verified)
      expect(reDecoded.verified).toBe(true)
    }))

  it.effect("copy is atomic: writer failure → no partial ship + structured error", () =>
    Effect.gen(function* () {
      const artifacts = loadArtifacts()
      const manifest = buildManifest(artifacts)
      let callCount = 0
      const failingWriter: any = {
        write: (path: string, content: string) =>
          Effect.gen(function* () {
            callCount++
            if (callCount === 2) return yield* Effect.fail(new Error("disk full"))
            return undefined
          })
      }
      const res = yield* copyArtifacts(artifacts, manifest, failingWriter, "dist/ship").pipe(Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(String(err.code)).toContain("[JESL CHANNEL-UNSET]")
        expect(err.node).toBe("copy")
      }
    }))
})
