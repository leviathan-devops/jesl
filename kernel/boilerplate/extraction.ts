import { Effect, Context } from "effect"
import * as Fs from "node:fs"
import * as Path from "node:path"
import * as Crypto from "node:crypto"
import { tridentProfile } from "../profiles/trident"
import { tradingProfile } from "../profiles/trading"
import { salesProfile } from "../profiles/sales"
import type { DomainModule } from "../profiles/shared"

export interface SkillWriter {
  write: (path: string, content: string) => Effect.Effect<void, unknown>
}

export class InMemoryWriter implements SkillWriter {
  readonly files = new Map<string, string>()
  write = (path: string, content: string): Effect.Effect<void, unknown> =>
    Effect.sync(() => { this.files.set(path, content) })
  has = (path: string) => this.files.has(path)
  get = (path: string) => this.files.get(path)
  list = () => [...this.files.keys()].sort()
}

export class FileWriter implements SkillWriter {
  write = (path: string, content: string): Effect.Effect<void, unknown> =>
    Effect.tryPromise(async () => {
      await Fs.promises.mkdir(Path.dirname(path), { recursive: true })
      await Fs.promises.writeFile(path, content, "utf-8")
    })
}

const PROFILES: Record<string, DomainModule> = {
  trident: tridentProfile,
  trading: tradingProfile,
  sales: salesProfile
}

const DIRS_TO_COPY = ["core", "nodes", "cli", "drivers", "scanners", "workflow", "packager", "wraps", "mpse", "bindings"] as const

const tagId = (tag: Context.Tag<any, any>): string => {
  const t = tag as any
  if (t.key) return String(t.key)
  if (t.identifier) return String(t.identifier)
  if (t._id) return String(t._id)
  return String(tag)
}

const capsToStrings = (caps: ReadonlyArray<Context.Tag<any, any>>): string[] =>
  caps.map(tagId)

const walkSync = (base: string, dir: string): string[] => {
  const full = Path.join(base, dir)
  if (!Fs.existsSync(full)) return []
  const out: string[] = []
  const stack: string[] = [full]
  while (stack.length > 0) {
    const cur = stack.pop()!
    const entries = Fs.readdirSync(cur, { withFileTypes: true })
    for (const e of entries) {
      const p = Path.join(cur, e.name)
      if (e.isDirectory()) stack.push(p)
      else {
        const rel = Path.relative(base, p)
        out.push(rel)
      }
    }
  }
  return out
}

const readFileSyncUtf8 = (p: string): string => Fs.readFileSync(p, "utf-8")

const sha256 = (s: string): string => Crypto.createHash("sha256").update(s, "utf-8").digest("hex")

export interface ExtractionManifest {
  readonly sourceDir: string
  readonly targetDir: string
  readonly profile: string
  readonly targetName: string
  readonly caps: ReadonlyArray<string>
  readonly kinds: ReadonlyArray<string>
  readonly tier: 1 | 2
  readonly brackets: Readonly<Record<string, { contract: string; repair: number; floor: number }>>
  readonly filesCopied: ReadonlyArray<string>
  readonly generatedFiles: ReadonlyArray<string>
  readonly digest: string
  readonly schemaVersion: string
  readonly generatedAt: string
}

export interface ExtractionResult {
  readonly manifest: ExtractionManifest
  readonly filesCopied: ReadonlyArray<string>
  readonly generatedFiles: ReadonlyArray<string>
}

export const getProfile = (name: string): DomainModule => {
  const p = PROFILES[name]
  if (!p) {
    const err: any = new Error(`UNKNOWN_PROFILE profile=${name}`)
    err.code = "UNKNOWN_PROFILE"
    err.profile = name
    throw err
  }
  return p
}

export const validateManifest = (manifest: ExtractionManifest): ReadonlyArray<string> => {
  const errs: string[] = []
  if (!manifest.sourceDir) errs.push("sourceDir missing")
  if (!manifest.targetDir) errs.push("targetDir missing")
  if (!manifest.profile) errs.push("profile missing")
  if (!manifest.targetName || !manifest.targetName.endsWith("-kernel")) errs.push("targetName must end with -kernel")
  if (!Array.isArray(manifest.caps) || manifest.caps.length === 0) errs.push("caps must be non-empty array")
  if (!Array.isArray(manifest.kinds) || manifest.kinds.length === 0) errs.push("kinds must be non-empty array")
  if (manifest.tier !== 1 && manifest.tier !== 2) errs.push("tier must be 1 or 2")
  if (!Array.isArray(manifest.filesCopied) || manifest.filesCopied.length === 0) errs.push("filesCopied empty")
  if (!manifest.digest || manifest.digest.length !== 64) errs.push("digest must be sha256 hex")
  if (manifest.schemaVersion !== "trident-workflow-v1") errs.push("schemaVersion must be trident-workflow-v1")
  return errs
}

export const isValidManifest = (m: ExtractionManifest): boolean => validateManifest(m).length === 0

export const extractBoilerplate = (
  sourceDir: string,
  targetDir: string,
  profileName: string,
  writer: SkillWriter
): Effect.Effect<ExtractionResult, unknown> =>
  Effect.gen(function* () {
    const profile = getProfile(profileName)
    const targetName = `${Path.basename(Path.resolve(targetDir))}-kernel`
    const caps = capsToStrings(profile.caps as ReadonlyArray<Context.Tag<any, any>>)
    const filesCopied: string[] = []
    const generatedFiles: string[] = []

    for (const dir of DIRS_TO_COPY) {
      const rels = walkSync(sourceDir, dir)
      for (const rel of rels) {
        const srcPath = Path.join(sourceDir, rel)
        const content = readFileSyncUtf8(srcPath)
        const destPath = Path.join(targetDir, rel)
        yield* writer.write(destPath, content)
        filesCopied.push(rel)
      }
    }

    const profileFiles = [`profiles/shared.ts`, `profiles/${profileName}.ts`] as const
    for (const rel of profileFiles) {
      const srcPath = Path.join(sourceDir, rel)
      if (Fs.existsSync(srcPath)) {
        const content = readFileSyncUtf8(srcPath)
        const destPath = Path.join(targetDir, rel)
        if (!filesCopied.includes(rel)) {
          yield* writer.write(destPath, content)
          filesCopied.push(rel)
        }
      }
    }

    const pkgSrcPath = Path.join(sourceDir, "package.json")
    const pkgRaw = readFileSyncUtf8(pkgSrcPath)
    const pkgJson: any = JSON.parse(pkgRaw)
    const outPkg: any = {
      ...pkgJson,
      name: targetName,
      jesl: {
        profile: profileName,
        caps,
        kinds: [...profile.kinds],
        tier: profile.defaultTier,
        brackets: { ...profile.brackets }
      }
    }
    const pkgDest = Path.join(targetDir, "package.json")
    yield* writer.write(pkgDest, JSON.stringify(outPkg, null, 2))
    generatedFiles.push("package.json")

    const tsSrcPath = Path.join(sourceDir, "tsconfig.json")
    let tsContent: string
    if (Fs.existsSync(tsSrcPath)) tsContent = readFileSyncUtf8(tsSrcPath)
    else tsContent = JSON.stringify({ compilerOptions: { target: "ES2022", module: "ESNext", moduleResolution: "bundler", strict: true, skipLibCheck: true, noEmit: true, esModuleInterop: true }, include: [...DIRS_TO_COPY as any, "profiles"] }, null, 2)
    const tsDest = Path.join(targetDir, "tsconfig.json")
    yield* writer.write(tsDest, tsContent)
    generatedFiles.push("tsconfig.json")

    const sortedCopied = [...filesCopied].sort()
    const digest = sha256(sortedCopied.join("\0") + "\0" + caps.join(",") + "\0" + profile.kinds.join(","))

    const manifest: ExtractionManifest = {
      sourceDir: Path.resolve(sourceDir),
      targetDir: Path.resolve(targetDir),
      profile: profileName,
      targetName,
      caps,
      kinds: [...profile.kinds],
      tier: profile.defaultTier,
      brackets: { ...profile.brackets } as any,
      filesCopied: sortedCopied,
      generatedFiles: [...generatedFiles, "boilerplate-manifest.json"],
      digest,
      schemaVersion: "trident-workflow-v1",
      generatedAt: new Date().toISOString()
    }

    const errs = validateManifest(manifest)
    if (errs.length > 0) return yield* Effect.fail(new Error(`manifest invalid: ${errs.join("; ")}`))

    const manifestPath = Path.join(targetDir, "boilerplate-manifest.json")
    yield* writer.write(manifestPath, JSON.stringify(manifest, null, 2))

    return { manifest, filesCopied: sortedCopied, generatedFiles: [...generatedFiles, "boilerplate-manifest.json"] }
  })

export const extractionManifestJson = (m: ExtractionManifest): string => JSON.stringify(m, null, 2)
