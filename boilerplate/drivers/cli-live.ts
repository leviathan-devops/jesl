import { Effect, Layer, Context } from "effect"
import { Shell, Fs, Http, Journal } from "../core/caps"
import { HashCap } from "../core/journal"
import { createHash } from "node:crypto"
import * as NodeFs from "node:fs"
import * as NodePath from "node:path"
import { spawn } from "node:child_process"

function realHash(input: string): string {
  return createHash("sha256").update(input).digest("hex")
}

const HashCapLiveReal = Layer.succeed(HashCap, { hash: realHash })

const ShellLiveReal = Layer.succeed(Shell, {
  exec: (cmd: string, opts: { timeoutMs: number; maxOutputBytes: number }) =>
    Effect.tryPromise({
      try: () =>
        new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve, reject) => {
          const child = spawn(cmd, { shell: true, stdio: ["ignore", "pipe", "pipe"] })
          let stdout = ""
          let stderr = ""
          let timedOut = false
          let settled = false
          let killTimer: ReturnType<typeof setTimeout> | undefined
          if (opts.timeoutMs > 0) {
            killTimer = setTimeout(() => {
              if (settled) return
              timedOut = true
              settled = true
              try { child.kill("SIGKILL") } catch {}
              const err: any = new Error("timeout after " + opts.timeoutMs + "ms")
              err.code = "TIMEOUT"
              reject(err)
            }, opts.timeoutMs)
          }
          child.stdout?.on("data", (d: Buffer) => {
            stdout += d.toString()
            if (stdout.length > opts.maxOutputBytes) stdout = stdout.slice(0, opts.maxOutputBytes)
          })
          child.stderr?.on("data", (d: Buffer) => {
            stderr += d.toString()
            if (stderr.length > opts.maxOutputBytes) stderr = stderr.slice(0, opts.maxOutputBytes)
          })
          child.on("error", (e) => {
            if (settled) return
            settled = true
            if (killTimer) clearTimeout(killTimer)
            reject(e)
          })
          child.on("close", (code) => {
            if (settled) return
            settled = true
            if (killTimer) clearTimeout(killTimer)
            if (timedOut) {
              const err: any = new Error("timeout after " + opts.timeoutMs + "ms")
              err.code = "TIMEOUT"
              reject(err)
              return
            }
            resolve({ stdout: stdout.slice(0, opts.maxOutputBytes), stderr: stderr.slice(0, opts.maxOutputBytes), exitCode: code ?? 0 })
          })
        }),
      catch: (e) => e
    })
})

const FsLiveReal = Layer.succeed(Fs, {
  read: (path: string) =>
    Effect.tryPromise({
      try: () => NodeFs.promises.readFile(path, "utf-8"),
      catch: (e) => e
    }),
  write: (path: string, body: string) =>
    Effect.tryPromise({
      try: async () => {
        await NodeFs.promises.mkdir(NodePath.dirname(path), { recursive: true })
        await NodeFs.promises.writeFile(path, body, "utf-8")
      },
      catch: (e) => e
    })
})

const HttpLiveReal = Layer.succeed(Http, {
  request: (r: unknown) =>
    Effect.tryPromise({
      try: async () => {
        const req: any = r as any
        const method = (req.method ?? "GET") as string
        const url = req.url as string
        const headers = req.headers as Record<string,string> | undefined
        const body = req.body
        const init: RequestInit = { method, headers }
        if (body !== undefined && method !== "GET" && method !== "HEAD") {
          init.body = typeof body === "string" ? body : JSON.stringify(body)
          if (!headers?.["content-type"] && typeof body !== "string") {
            init.headers = { ...(headers ?? {}), "content-type": "application/json" }
          }
        }
        const res = await fetch(url, init)
        const text = await res.text()
        return { status: res.status, body: text, headers: Object.fromEntries(res.headers.entries()) }
      },
      catch: (e) => e
    })
})

import { JournalLive } from "../core/journal"

export const CliLive = Layer.mergeAll(ShellLiveReal, FsLiveReal, HttpLiveReal, JournalLive, HashCapLiveReal) as Layer.Layer<never>

export const ShellLive = ShellLiveReal
export const FsLive = FsLiveReal
export const HttpLive = HttpLiveReal
export const JournalLiveReal = JournalLive
export const HashReal = HashCapLiveReal

export const VerifyLedger = {
  shell: "node:child_process spawn wrapped in Effect.tryPromise with timeout/maxOutputBytes",
  fs: "node:fs/promises via Effect.tryPromise (mkdir -p + readFile/writeFile)",
  http: "global fetch wrapped in Effect.tryPromise",
  hash: "node:crypto createHash sha256",
  platformProbed: "@effect/platform Command/FileSystem/HttpClient available but driver uses node: bindings for determinism (VERIFY-ON-INSTALL: @effect/platform 0.84.11 + platform-node 0.108.1 present, fallback to node: chosen for Shell timeout control)"
}
