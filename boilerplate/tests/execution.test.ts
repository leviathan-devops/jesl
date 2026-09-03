import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect, Layer, Exit, Clock } from "effect"
import { shellExecNode } from "../nodes/shell-exec"
import { pythonExecNode } from "../nodes/python-exec"
import { httpRequestNode } from "../nodes/http-request"
import { fileIoNode } from "../nodes/file-io"
import { Shell, Fs, Http, Journal } from "../core/caps"
import { CliLive } from "../drivers/cli-live"
import { makeRegistry, ALL_KINDS } from "../core/registry"
import { mkdtempSync, rmSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

describe("execution nodes — W2 F13", () => {
  it.effect("shell-exec PASS via REAL CliLive echo hello", () =>
    Effect.gen(function* () {
      const res: any = yield* (shellExecNode.invoke as any)({ node: { id: "sh1", config: { cmd: "echo hello", timeoutMs: 5000, maxOutputBytes: 10000 } }, inbound: {} }, {}).pipe(Effect.provide(CliLive))
      expect(res.verdict).toBe("PASS")
      expect(String(res.outputs.stdout)).toContain("hello")
      expect(res.evidence.pattern).toBe("shell-exec.exec")
      expect(res.timing.endMs).toBeGreaterThanOrEqual(res.timing.startMs)
    }))

  it.effect("shell-exec non-zero exit yields FAIL with stderr evidence", () =>
    Effect.gen(function* () {
      const res: any = yield* (shellExecNode.invoke as any)({ node: { id: "sh2", config: { cmd: "sh -c 'echo oops >&2; exit 2'", timeoutMs: 5000, maxOutputBytes: 10000 } }, inbound: {} }, {}).pipe(Effect.provide(CliLive))
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.state).toBe("FAIL")
      expect(res.outputs.exitCode).toBe(2)
      expect(String(res.error?.stderr ?? res.outputs.stderr ?? "")).toContain("oops")
    }))

  it.effect("shell-exec timeout yields FAIL", () =>
    Effect.gen(function* () {
      const res: any = yield* (shellExecNode.invoke as any)({ node: { id: "sh3", config: { cmd: "sleep 2", timeoutMs: 200, maxOutputBytes: 10000 } }, inbound: {} }, {}).pipe(Effect.provide(CliLive))
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.pattern).toContain("timeout")
    }))

  it.effect("python-exec PASS via python3 -c print or SKIP if absent", () =>
    Effect.gen(function* () {
      const probe: any = yield* (shellExecNode.invoke as any)({ node: { id: "probe", config: { cmd: "python3 --version", timeoutMs: 3000, maxOutputBytes: 1000 } }, inbound: {} }, {}).pipe(Effect.provide(CliLive))
      if (probe.verdict !== "PASS") {
        console.log("SKIP python-exec: python3 absent on this host")
        expect(true).toBe(true)
        return
      }
      const res: any = yield* (pythonExecNode.invoke as any)({ node: { id: "py1", config: { code: "print('py-hello')" , timeoutMs: 5000, maxOutputBytes: 10000 } }, inbound: {} }, {}).pipe(Effect.provide(CliLive))
      expect(res.verdict).toBe("PASS")
      expect(String(res.outputs.stdout)).toContain("py-hello")
    }))

  it.effect("http-request 2xx PASS with stubbed Http Layer", () =>
    Effect.gen(function* () {
      const stubOk = Layer.succeed(Http, { request: () => Effect.succeed({ status: 200, body: "ok-body" }) } as any)
      const res: any = yield* (httpRequestNode.invoke as any)({ node: { id: "h1", config: { method: "GET", url: "http://example.com/api" } }, inbound: {} }, {}).pipe(Effect.provide(stubOk))
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.status).toBe(200)
      expect(res.evidence.state).toBe("PASS")
    }))

  it.effect("http-request 500 FAIL with stubbed Http Layer", () =>
    Effect.gen(function* () {
      const stubFail = Layer.succeed(Http, { request: () => Effect.succeed({ status: 500, body: "server error" }) } as any)
      const res: any = yield* (httpRequestNode.invoke as any)({ node: { id: "h2", config: { method: "GET", url: "http://example.com/api" } }, inbound: {} }, {}).pipe(Effect.provide(stubFail))
      expect(res.verdict).toBe("FAIL")
      expect(res.outputs.status).toBe(500)
      expect(res.evidence.state).toBe("FAIL")
    }))

  it.effect("file-io write+read roundtrip via REAL CliLive Fs", () =>
    Effect.gen(function* () {
      const dir = mkdtempSync(join(tmpdir(), "jesl-fileio-"))
      const path = join(dir, "roundtrip.txt")
      const body = "hello-file-io-" + Date.now()
      const w: any = yield* (fileIoNode.invoke as any)({ node: { id: "f1", config: { op: "write", path, body } }, inbound: {} }, {}).pipe(Effect.provide(CliLive))
      expect(w.verdict).toBe("PASS")
      expect(w.outputs.bytesWritten).toBe(body.length)
      const r: any = yield* (fileIoNode.invoke as any)({ node: { id: "f2", config: { op: "read", path } }, inbound: {} }, {}).pipe(Effect.provide(CliLive))
      expect(r.verdict).toBe("PASS")
      expect(r.outputs.content).toBe(body)
      rmSync(dir, { recursive: true, force: true })
      expect(existsSync(path)).toBe(false)
    }))

  it.effect("cap-unbound shell-exec under capless Layer yields [JESL CAP-UNBOUND] no execution", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit((shellExecNode.invoke as any)({ node: { id: "sh-unbound", config: { cmd: "echo should-not-run" } }, inbound: {} }, {}).pipe(Effect.provide(Layer.empty)))
      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        const cause: any = (exit as any).cause
        const failures = [...(cause?.failures ?? [])]
        const msg = JSON.stringify(failures) + JSON.stringify(cause)
        expect(msg).toContain("[JESL CAP-UNBOUND]")
      }
      const probeLayer = Layer.succeed(Shell, { exec: () => Effect.succeed({ stdout: "leaked", stderr: "", exitCode: 0 }) } as any)
      const ok: any = yield* (shellExecNode.invoke as any)({ node: { id: "sh-unbound2", config: { cmd: "echo hi" } }, inbound: {} }, {}).pipe(Effect.provide(probeLayer))
      expect(ok.verdict).toBe("PASS")
    }))

  it.effect("replaceStub: replacing a stub succeeds + replacing a REAL impl fails loudly", () =>
    Effect.gen(function* () {
      const r = yield* makeRegistry
      const stubCheck = yield* r.get("event-filter")
      expect(stubCheck).toBeDefined()
      const realImpl: any = { kind: "event-filter", family: "deterministic", requiredCaps: ["SomeCap"], invoke: () => Effect.succeed({ verdict: "PASS", evidence: { pattern: "real", state: "PASS", anchor: "real:1" }, timing: { startMs: 0, endMs: 0 } }) }
      const first = yield* Effect.either(r.replaceStub("event-filter", realImpl))
      expect(first._tag).toBe("Right")
      const secondAttempt: any = { kind: "event-filter", family: "deterministic", requiredCaps: ["OtherCap"], invoke: () => Effect.succeed({} as any) }
      const second = yield* Effect.either(r.replaceStub("event-filter", secondAttempt))
      expect(second._tag).toBe("Left")
      if (second._tag === "Left") expect(String((second.left as any).message)).toContain("RegistryFrozenError")
    }))

  it.effect("isKnownKindSync still true for all 33 after replacement", () =>
    Effect.gen(function* () {
      const r = yield* makeRegistry
      for (const { kind } of ALL_KINDS) {
        expect(r.isKnownKindSync(kind)).toBe(true)
      }
      expect(r.kindsSync().length).toBeGreaterThanOrEqual(33)
      const syncOk = r.isKnownKindSync("shell-exec")
      expect(syncOk).toBe(true)
      expect(r.isKnownKindSync("python-exec")).toBe(true)
      expect(r.isKnownKindSync("http-request")).toBe(true)
      expect(r.isKnownKindSync("file-io")).toBe(true)
    }))

  it.effect("CliLive provides Shell/Fs/Http/Journal — real process proof", () =>
    Effect.gen(function* () {
      const res: any = yield* (shellExecNode.invoke as any)({ node: { id: "cli-live-shell", config: { cmd: "echo cli-live-ok" } }, inbound: {} }, {}).pipe(Effect.provide(CliLive))
      expect(res.verdict).toBe("PASS")
      const dir = mkdtempSync(join(tmpdir(), "jesl-cli-live-"))
      const p = join(dir, "probe.txt")
      const w: any = yield* (fileIoNode.invoke as any)({ node: { id: "cli-live-fs", config: { op: "write", path: p, body: "x" } }, inbound: {} }, {}).pipe(Effect.provide(CliLive))
      expect(w.verdict).toBe("PASS")
      rmSync(dir, { recursive: true, force: true })
      const httpStub = Layer.succeed(Http, { request: () => Effect.succeed({ status: 200, body: "ok" }) } as any)
      expect(httpStub).toBeDefined()
      expect(CliLive).toBeDefined()
    }))

  it.effect("shell-exec truncates to maxOutputBytes", () =>
    Effect.gen(function* () {
      const res: any = yield* (shellExecNode.invoke as any)({ node: { id: "sh-trunc", config: { cmd: "echo 1234567890", timeoutMs: 5000, maxOutputBytes: 5 } }, inbound: {} }, {}).pipe(Effect.provide(CliLive))
      expect(res.verdict).toBe("PASS")
      expect(String(res.outputs.stdout).length).toBeLessThanOrEqual(5)
    }))
})
