import { Effect, Layer } from "effect"
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import * as path from "node:path"
import { LspCap } from "../scanners/lsp"

export interface LspDiagnostic {
  readonly file: string
  readonly line: number
  readonly column: number
  readonly severity: string
  readonly name: string
  readonly message: string
  readonly code: number
}

function resolveCliPath(cliPath: string | undefined): string | null {
  if (cliPath) {
    if (existsSync(cliPath)) return cliPath
    return null
  }
  const candidates = [
    path.resolve("node_modules/.bin/effect-language-service"),
    path.resolve("jesl/node_modules/.bin/effect-language-service"),
    "effect-language-service",
  ]
  for (const c of candidates) {
    if (c === "effect-language-service") return c
    if (existsSync(c)) return c
  }
  return "effect-language-service"
}

function parseOutput(raw: string): { diagnostics: LspDiagnostic[]; filesChecked: number } {
  try {
    const parsed = JSON.parse(raw) as { diagnostics?: unknown[]; summary?: { filesChecked?: number } }
    const diags: LspDiagnostic[] = []
    const list = parsed.diagnostics ?? []
    for (const d of list) {
      const dd = d as Record<string, unknown>
      diags.push({
        file: String(dd["file"] ?? ""),
        line: Number(dd["line"] ?? 0),
        column: Number(dd["column"] ?? 0),
        severity: String(dd["severity"] ?? "error"),
        name: String(dd["name"] ?? "unknown"),
        message: String(dd["message"] ?? ""),
        code: Number(dd["code"] ?? 0),
      })
    }
    return { diagnostics: diags, filesChecked: parsed.summary?.filesChecked ?? diags.length }
  } catch {
    return { diagnostics: [], filesChecked: 0 }
  }
}

function findTsConfig(startFile: string): string | null {
  let dir = path.dirname(path.resolve(startFile))
  const root = path.parse(dir).root
  while (true) {
    const candidate = path.join(dir, "tsconfig.json")
    if (existsSync(candidate)) return candidate
    const jeslCandidate = path.join(dir, "jesl", "tsconfig.json")
    if (existsSync(jeslCandidate)) return jeslCandidate
    if (dir === root) break
    dir = path.dirname(dir)
  }
  const jeslFallback = path.resolve("jesl/tsconfig.json")
  if (existsSync(jeslFallback)) return jeslFallback
  return null
}

export function makeEffectLsp(opts?: { cliPath?: string; projectPath?: string }): { diagnose: (file: string) => Effect.Effect<ReadonlyArray<LspDiagnostic>>; isAvailable: () => boolean } {
  const cli = resolveCliPath(opts?.cliPath)
  let binaryMissing = false
  if (cli !== null && cli !== "effect-language-service" && !existsSync(cli)) binaryMissing = true
  if (opts?.cliPath !== undefined && !existsSync(opts.cliPath)) binaryMissing = true
  if (cli === null) binaryMissing = true

  return {
    isAvailable: () => !binaryMissing,
    diagnose: (file: string) =>
      Effect.sync(() => {
        if (binaryMissing || cli === null) return [] as LspDiagnostic[]
        const absFile = path.resolve(file)
        const project = opts?.projectPath ?? findTsConfig(absFile)
        const bin = cli!
        const args = ["diagnostics", "--file", absFile, "--format", "json"]
        if (project && existsSync(project)) {
          const hasPlugin = (() => {
            try {
              const content = require("node:fs").readFileSync(project, "utf-8")
              return content.includes("@effect/language-service")
            } catch { return false }
          })()
          if (!hasPlugin) {
            args.push("--lspconfig", JSON.stringify({}))
          }
        }
        const result = spawnSync(bin, args, {
          encoding: "utf-8",
          timeout: 15000,
          maxBuffer: 4 * 1024 * 1024,
        })
        if (result.error) {
          const code = (result.error as NodeJS.ErrnoException).code
          if (code === "ENOENT") {
            binaryMissing = true
            return [] as LspDiagnostic[]
          }
          return [] as LspDiagnostic[]
        }
        const stdout = result.stdout ?? ""
        if (!stdout.trim()) return [] as LspDiagnostic[]
        const { diagnostics } = parseOutput(stdout)
        return diagnostics.filter((d) => d.severity === "error")
      }).pipe(Effect.catchAll(() => Effect.succeed([] as LspDiagnostic[]))),
  }
}

export const EffectLspLive = Layer.succeed(LspCap, makeEffectLsp())

export const makeEffectLspLayer = (opts?: { cliPath?: string; projectPath?: string }): Layer.Layer<LspCap> =>
  Layer.succeed(LspCap, makeEffectLsp(opts))

export const AbsentLspLive = Layer.succeed(LspCap, makeEffectLsp({ cliPath: "/nonexistent/effect-language-service-absent" }))
