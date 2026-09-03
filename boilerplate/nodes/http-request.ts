import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { Http, requireCaps } from "../core/caps"
import { replaceStubSync } from "../core/registry"

function truncate(s: string, cap: number): string {
  if (s.length <= cap) return s
  return s.slice(0, cap)
}

export const httpRequestNode: NodeImpl = {
  kind: "http-request",
  family: "execution",
  requiredCaps: ["Http"],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const nodeId = inp.node.id
      yield* requireCaps([Http] as any, nodeId)
      const cfg = (inp.node.config ?? {}) as { method?: string; url?: string; headers?: Record<string,string>; body?: unknown }
      const inboundUrl = (inp.inbound as any)?.url
      const url = cfg.url ?? (typeof inboundUrl === "string" ? inboundUrl : undefined)
      if (!url) {
        const t = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "http-request.fetch", state: "FAIL", anchor: `${nodeId}:missing-url` }, timing: { startMs: t, endMs: t }, error: { message: "missing url" } } as NodeResult
      }
      const method = (cfg.method ?? "GET").toUpperCase()
      const http = yield* Http
      const startMs = yield* Clock.currentTimeMillis
      const req: any = { method, url, headers: cfg.headers, body: cfg.body }
      const raw = yield* Effect.either(http.request(req))
      const endMs = yield* Clock.currentTimeMillis
      if (raw._tag === "Left") {
        const err: any = raw.left
        const msg = err?.message ?? String(err)
        return { verdict: "FAIL" as const, evidence: { pattern: "http-request.fetch", state: "FAIL", anchor: `${nodeId}:${url.slice(0,30)}` }, timing: { startMs, endMs }, error: { message: truncate(msg, 2000) } } as NodeResult
      }
      const res: any = raw.right as any
      const status = typeof res?.status === "number" ? res.status : typeof res?.statusCode === "number" ? res.statusCode : 0
      const body = res?.body ?? res?.data ?? res
      const bodyStr = typeof body === "string" ? truncate(body, 8192) : body
      const pass = status >= 200 && status < 300
      if (pass) return { verdict: "PASS" as const, evidence: { pattern: "http-request.fetch", state: "PASS", anchor: `${nodeId}:${status}` }, timing: { startMs, endMs }, outputs: { status, body: bodyStr } } as NodeResult
      return { verdict: "FAIL" as const, evidence: { pattern: "http-request.fetch", state: "FAIL", anchor: `${nodeId}:${status}` }, timing: { startMs, endMs }, outputs: { status, body: bodyStr }, error: { status, body: bodyStr } } as NodeResult
    })
}

const doReplace = () => {
  try { replaceStubSync("http-request", httpRequestNode as any) } catch (e) { void e }
}
doReplace()
