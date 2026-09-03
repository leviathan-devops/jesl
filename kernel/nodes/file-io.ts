import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { Fs, requireCaps } from "../core/caps"
import { replaceStubSync } from "../core/registry"

export const fileIoNode: NodeImpl = {
  kind: "file-io",
  family: "execution",
  requiredCaps: ["Fs"],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const nodeId = inp.node.id
      yield* requireCaps([Fs] as any, nodeId)
      const cfg = (inp.node.config ?? {}) as { op?: string; path?: string; body?: string; content?: string; encoding?: string }
      const inboundPath = (inp.inbound as any)?.path
      const inboundBody = (inp.inbound as any)?.body ?? (inp.inbound as any)?.content
      const op = (cfg.op ?? "read") as string
      const path = cfg.path ?? (typeof inboundPath === "string" ? inboundPath : undefined)
      if (!path) {
        const t = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "file-io." + op, state: "FAIL", anchor: `${nodeId}:missing-path` }, timing: { startMs: t, endMs: t }, error: { message: "missing path" } } as NodeResult
      }
      const fs = yield* Fs
      const startMs = yield* Clock.currentTimeMillis
      if (op === "write") {
        const body = cfg.body ?? cfg.content ?? (typeof inboundBody === "string" ? inboundBody : "")
        const raw = yield* Effect.either(fs.write(path, String(body)))
        const endMs = yield* Clock.currentTimeMillis
        if (raw._tag === "Left") {
          const err: any = raw.left
          const msg = err?.message ?? String(err)
          return { verdict: "FAIL" as const, evidence: { pattern: "file-io.write", state: "FAIL", anchor: `${nodeId}:${path}` }, timing: { startMs, endMs }, error: { message: msg } } as NodeResult
        }
        const bytesWritten = String(body).length
        return { verdict: "PASS" as const, evidence: { pattern: "file-io.write", state: "PASS", anchor: `${nodeId}:${path}` }, timing: { startMs, endMs }, outputs: { path, bytesWritten, bytes: bytesWritten } } as NodeResult
      }
      const raw = yield* Effect.either(fs.read(path))
      const endMs = yield* Clock.currentTimeMillis
      if (raw._tag === "Left") {
        const err: any = raw.left
        const msg = err?.message ?? String(err)
        return { verdict: "FAIL" as const, evidence: { pattern: "file-io.read", state: "FAIL", anchor: `${nodeId}:${path}` }, timing: { startMs, endMs }, error: { message: msg } } as NodeResult
      }
      const content = raw.right as string
      return { verdict: "PASS" as const, evidence: { pattern: "file-io.read", state: "PASS", anchor: `${nodeId}:${path}` }, timing: { startMs, endMs }, outputs: { path, content, output: content } } as NodeResult
    })
}

const doReplace = () => {
  try { replaceStubSync("file-io", fileIoNode as any) } catch (e) { void e }
}
doReplace()
