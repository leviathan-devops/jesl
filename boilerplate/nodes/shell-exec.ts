import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { Shell, requireCaps } from "../core/caps"
import { replaceStubSync } from "../core/registry"

const MAX_OUTPUT_DEFAULT = 1048576
const TIMEOUT_DEFAULT = 5000

function truncate(s: string, cap: number): string {
  if (s.length <= cap) return s
  return s.slice(0, cap)
}

export const shellExecNode: NodeImpl = {
  kind: "shell-exec",
  family: "execution",
  requiredCaps: ["Shell"],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const nodeId = inp.node.id
      yield* requireCaps([Shell] as any, nodeId)
      const cfg = (inp.node.config ?? {}) as { cmd?: string; command?: string; timeoutMs?: number; maxOutputBytes?: number }
      const inboundCmd = (inp.inbound as any)?.cmd ?? (inp.inbound as any)?.command ?? (inp.inbound as any)?.input
      const cmd = cfg.cmd ?? cfg.command ?? (typeof inboundCmd === "string" ? inboundCmd : undefined)
      if (!cmd || typeof cmd !== "string" || cmd.trim() === "") {
        const t = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "shell-exec.exec", state: "FAIL", anchor: `${nodeId}:missing-cmd` }, timing: { startMs: t, endMs: t }, error: { code: "[JESL CAP-UNBOUND]", node: nodeId } } as NodeResult
      }
      const timeoutMs = typeof cfg.timeoutMs === "number" ? cfg.timeoutMs : TIMEOUT_DEFAULT
      const maxOutputBytes = typeof cfg.maxOutputBytes === "number" ? cfg.maxOutputBytes : MAX_OUTPUT_DEFAULT
      const shell = yield* Shell
      const startMs = yield* Clock.currentTimeMillis
      const raw = yield* Effect.either(shell.exec(cmd, { timeoutMs, maxOutputBytes }))
      const endMs = yield* Clock.currentTimeMillis
      if (raw._tag === "Left") {
        const err: any = raw.left
        const msg = err?.message ?? String(err)
        const isTimeout = /timeout/i.test(msg) || err?.code === "TIMEOUT" || err?.cause === "timeout"
        const stderr = truncate(msg, maxOutputBytes)
        if (isTimeout) {
          return { verdict: "FAIL" as const, evidence: { pattern: "shell-exec.timeout", state: "FAIL", anchor: `${nodeId}:timeout:${timeoutMs}ms` }, timing: { startMs, endMs }, error: { code: "timeout", message: stderr } } as NodeResult
        }
        return { verdict: "FAIL" as const, evidence: { pattern: "shell-exec.exec", state: "FAIL", anchor: `${nodeId}:error` }, timing: { startMs, endMs }, error: { message: stderr } } as NodeResult
      }
      const res: any = raw.right as any
      const stdout = typeof res?.stdout === "string" ? truncate(res.stdout, maxOutputBytes) : typeof res === "string" ? truncate(res, maxOutputBytes) : ""
      const stderr = typeof res?.stderr === "string" ? truncate(res.stderr, maxOutputBytes) : ""
      const exitCode = typeof res?.exitCode === "number" ? res.exitCode : typeof res?.code === "number" ? res.code : 0
      if (exitCode === 0) {
        return { verdict: "PASS" as const, evidence: { pattern: "shell-exec.exec", state: "PASS", anchor: `${nodeId}:${cmd.slice(0, 30)}` }, timing: { startMs, endMs }, outputs: { stdout, stderr, exitCode, output: stdout } } as NodeResult
      }
      return { verdict: "FAIL" as const, evidence: { pattern: "shell-exec.exec", state: "FAIL", anchor: `${nodeId}:exit-${exitCode}` }, timing: { startMs, endMs }, outputs: { stdout, stderr, exitCode }, error: { exitCode, stderr: truncate(stderr, 500) } } as NodeResult
    })
}

const doReplace = () => {
  try { replaceStubSync("shell-exec", shellExecNode as any) } catch (e) { void e }
}
doReplace()
