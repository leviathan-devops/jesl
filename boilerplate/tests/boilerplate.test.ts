import { describe, it, expect } from "@effect/vitest"
import { Effect } from "effect"
import * as Fs from "node:fs"
import * as Path from "node:path"
import * as Crypto from "node:crypto"
import { InMemoryWriter, extractBoilerplate, validateManifest, isValidManifest, type ExtractionManifest } from "../boilerplate/extraction"
import { tridentProfile } from "../profiles/trident"

const SOURCE_DIR = Path.resolve(Path.join(import.meta.dirname ?? ".", ".."))
const PROFILE = "trident"

const sha256 = (s: string) => Crypto.createHash("sha256").update(s, "utf-8").digest("hex")

const fileSha256 = (p: string) => sha256(Fs.readFileSync(p, "utf-8"))

describe("boilerplate — extraction", () => {
  it.effect("extractBoilerplate produces target tree with core/nodes/cli/drivers", () =>
    Effect.gen(function* () {
      const writer = new InMemoryWriter()
      const targetDir = `/tmp/jesl-adopt-${Date.now()}-a`
      const res = yield* extractBoilerplate(SOURCE_DIR, targetDir, PROFILE, writer)
      expect(res.filesCopied.length).toBeGreaterThan(10)
      expect(res.filesCopied.some((f) => f.startsWith("core/"))).toBe(true)
      expect(res.filesCopied.some((f) => f.startsWith("nodes/"))).toBe(true)
      expect(res.filesCopied.some((f) => f.startsWith("cli/"))).toBe(true)
      expect(res.filesCopied.some((f) => f.startsWith("drivers/"))).toBe(true)
      expect(res.filesCopied.some((f) => f.startsWith("scanners/"))).toBe(true)
      expect(res.filesCopied.some((f) => f.startsWith("workflow/"))).toBe(true)
      expect(res.filesCopied.some((f) => f.startsWith("packager/"))).toBe(true)
      expect(res.filesCopied.some((f) => f.startsWith("wraps/"))).toBe(true)
      expect(res.filesCopied.some((f) => f.startsWith("mpse/"))).toBe(true)
      expect(res.filesCopied.some((f) => f.startsWith("bindings/"))).toBe(true)
      expect(res.filesCopied.includes("profiles/trident.ts")).toBe(true)
      expect(res.filesCopied.includes("profiles/shared.ts")).toBe(true)
      expect(writer.has(Path.join(targetDir, "package.json"))).toBe(true)
      expect(writer.has(Path.join(targetDir, "tsconfig.json"))).toBe(true)
      expect(writer.has(Path.join(targetDir, "boilerplate-manifest.json"))).toBe(true)
    }))

  it.effect("target package.json has correct name and profile caps/kinds/tier", () =>
    Effect.gen(function* () {
      const writer = new InMemoryWriter()
      const targetDir = `/tmp/jesl-adopt-${Date.now()}-b`
      yield* extractBoilerplate(SOURCE_DIR, targetDir, PROFILE, writer)
      const pkgRaw = writer.get(Path.join(targetDir, "package.json"))!
      const pkg = JSON.parse(pkgRaw)
      const base = Path.basename(targetDir)
      expect(pkg.name).toBe(`${base}-kernel`)
      expect(pkg.jesl.profile).toBe(PROFILE)
      expect(pkg.jesl.caps).toEqual(expect.arrayContaining(["jesl/Shell", "jesl/Fs"]))
      expect(pkg.jesl.kinds).toEqual(expect.arrayContaining([...tridentProfile.kinds] as string[]))
      expect(pkg.jesl.tier).toBe(tridentProfile.defaultTier)
      expect(pkg.jesl.brackets).toBeDefined()
    }))

  it.effect("extracted core modules are byte-identical to source", () =>
    Effect.gen(function* () {
      const writer = new InMemoryWriter()
      const targetDir = `/tmp/jesl-adopt-${Date.now()}-c`
      yield* extractBoilerplate(SOURCE_DIR, targetDir, PROFILE, writer)
      const coreFiles = writer.list().filter((p) => p.includes("/core/"))
      expect(coreFiles.length).toBe(10)
      for (const dest of coreFiles) {
        const rel = Path.relative(targetDir, dest)
        const srcPath = Path.join(SOURCE_DIR, rel)
        const srcContent = Fs.readFileSync(srcPath, "utf-8")
        const destContent = writer.get(dest)!
        expect(destContent).toBe(srcContent)
        expect(sha256(destContent)).toBe(sha256(srcContent))
      }
    }))

  it.effect("adoption manifest validates and carries schemaVersion", () =>
    Effect.gen(function* () {
      const writer = new InMemoryWriter()
      const targetDir = `/tmp/jesl-adopt-${Date.now()}-d`
      const res = yield* extractBoilerplate(SOURCE_DIR, targetDir, PROFILE, writer)
      const mRaw = writer.get(Path.join(targetDir, "boilerplate-manifest.json"))!
      const m: ExtractionManifest = JSON.parse(mRaw)
      const errs = validateManifest(m)
      expect(errs).toEqual([])
      expect(isValidManifest(m)).toBe(true)
      expect(m.schemaVersion).toBe("trident-workflow-v1")
      expect(m.profile).toBe(PROFILE)
      expect(m.targetName).toBe(`${Path.basename(targetDir)}-kernel`)
      expect(m.digest.length).toBe(64)
      expect(m.filesCopied.length).toBe(res.filesCopied.length)
      expect(res.manifest.digest).toBe(m.digest)
    }))

  it.effect("battery manifest proof — extraction proves adoption would pass gate", () =>
    Effect.gen(function* () {
      const writer = new InMemoryWriter()
      const targetDir = `/tmp/jesl-adopt-${Date.now()}-e`
      const res = yield* extractBoilerplate(SOURCE_DIR, targetDir, PROFILE, writer)
      expect(res.manifest.filesCopied.some((f) => f === "core/schema.ts")).toBe(true)
      expect(res.manifest.filesCopied.some((f) => f === "core/journal.ts")).toBe(true)
      expect(res.manifest.generatedFiles).toEqual(expect.arrayContaining(["package.json", "tsconfig.json", "boilerplate-manifest.json"]))
      const tsRaw = writer.get(Path.join(targetDir, "tsconfig.json"))!
      const tsJson = JSON.parse(tsRaw)
      expect(tsJson.compilerOptions.moduleResolution).toBe("bundler")
      expect(tsJson.compilerOptions.strict).toBe(true)
      const pkgRaw = writer.get(Path.join(targetDir, "package.json"))!
      const pkg = JSON.parse(pkgRaw)
      expect(pkg.jesl.caps.length).toBeGreaterThan(0)
      expect(pkg.jesl.kinds.length).toBeGreaterThan(0)
    }))

  it.effect("real filesystem extraction with FileWriter byte-identical check", () =>
    Effect.gen(function* () {
      const { FileWriter } = yield* Effect.promise(async () => await import("../boilerplate/extraction"))
      const writer = new FileWriter()
      const targetDir = Fs.mkdtempSync(Path.join(Fs.realpathSync("/tmp"), "jesl-real-"))
      const res = yield* extractBoilerplate(SOURCE_DIR, targetDir, PROFILE, writer)
      const pkgPath = Path.join(targetDir, "package.json")
      expect(Fs.existsSync(pkgPath)).toBe(true)
      const pkg = JSON.parse(Fs.readFileSync(pkgPath, "utf-8"))
      expect(pkg.name.endsWith("-kernel")).toBe(true)
      const coreFile = Path.join(targetDir, "core", "journal.ts")
      expect(Fs.existsSync(coreFile)).toBe(true)
      const srcHash = fileSha256(Path.join(SOURCE_DIR, "core", "journal.ts"))
      const destHash = fileSha256(coreFile)
      expect(destHash).toBe(srcHash)
      const manifestPath = Path.join(targetDir, "boilerplate-manifest.json")
      const m: ExtractionManifest = JSON.parse(Fs.readFileSync(manifestPath, "utf-8"))
      expect(isValidManifest(m)).toBe(true)
      Fs.rmSync(targetDir, { recursive: true, force: true })
      expect(res.filesCopied.length).toBeGreaterThan(10)
    }))
})
