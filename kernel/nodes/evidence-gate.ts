import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import { replaceStubSync } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { _canSourceChange, _canStatus } from "../core/evidence"

function hasTriplet(payload: unknown): boolean {
  if (payload === null || typeof payload !== "object") return false
  const p = payload as Record<string, unknown>
  const ev = (p["evidence"] as unknown) ?? (p["triplet"] as unknown) ?? (p["pattern"] ? p : null)
  if (ev === null || typeof ev !== "object") return false
  const e = ev as Record<string, unknown>
  const pattern = e["pattern"]
  const state = e["state"]
  const anchor = e["anchor"]
  return typeof pattern === "string" && pattern.length > 0 && typeof state === "string" && state.length > 0 && typeof anchor === "string" && anchor.length > 0
}

function extractEvidence(inbound: Record<string, unknown>): unknown {
  if (inbound["evidence"] !== undefined) return inbound["evidence"]
  if (inbound["triplet"] !== undefined) return inbound["triplet"]
  const v = Object.values(inbound)[0]
  if (v !== null && typeof v === "object" && "pattern" in (v as any) && "state" in (v as any) && "anchor" in (v as any)) return v
  if ("pattern" in inbound && "state" in inbound && "anchor" in inbound) return inbound
  return inbound
}

export const evidenceGateNode: NodeImpl = {
  kind: "evidence-gate",
  family: "decision",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const startMs = yield* Clock.currentTimeMillis
      const inbound = (inp.inbound ?? {}) as Record<string, unknown>
      const cfg = (inp.node.config ?? {}) as Record<string, unknown>

      const kindFromInbound = (inbound["kind"] as string | undefined) ?? (cfg["kind"] as string | undefined)
      const subjectFromInbound = (inbound["subject"] as string | undefined) ?? (cfg["subject"] as string | undefined)

      if (kindFromInbound === "source_change") {
        const ev: any = {
          kind: "source_change",
          subject: subjectFromInbound ?? (inbound["subject"] as string) ?? "unknown",
          at: startMs,
          filePath: (inbound["filePath"] as string) ?? (inbound["detail"] as any)?.filePath ?? (cfg["filePath"] as string),
          payload: inbound["payload"],
          detail: inbound["detail"]
        }
        const ok = _canSourceChange(ev)
        const endMs = yield* Clock.currentTimeMillis
        if (ok) return { verdict: "PASS" as const, evidence: { pattern: "evidence-gate", state: "PASS", anchor: `${inp.node.id}:source_change:valid` }, timing: { startMs, endMs }, outputs: { valid: true, kind: "source_change" } } as NodeResult
        return { verdict: "FAIL" as const, evidence: { pattern: "evidence-gate", state: "FAIL", anchor: `${inp.node.id}:source_change:missing-path` }, timing: { startMs, endMs }, outputs: { valid: false, reason: "source_change without path" } } as NodeResult
      }

      if (kindFromInbound === "status") {
        const ev: any = {
          kind: "status",
          subject: subjectFromInbound ?? (inbound["subject"] as string) ?? "unknown",
          at: startMs,
          probeOutput: (inbound["probeOutput"] as string) ?? (inbound["detail"] as any)?.probeOutput ?? (cfg["probeOutput"] as string),
          payload: inbound["payload"],
          detail: inbound["detail"]
        }
        const ok = _canStatus(ev)
        const endMs = yield* Clock.currentTimeMillis
        if (ok) return { verdict: "PASS" as const, evidence: { pattern: "evidence-gate", state: "PASS", anchor: `${inp.node.id}:status:valid` }, timing: { startMs, endMs }, outputs: { valid: true, kind: "status" } } as NodeResult
        return { verdict: "FAIL" as const, evidence: { pattern: "evidence-gate", state: "FAIL", anchor: `${inp.node.id}:status:missing-probeOutput` }, timing: { startMs, endMs }, outputs: { valid: false, reason: "status without probeOutput" } } as NodeResult
      }

      const hasInboundData = Object.keys(inbound).length > 0
      if (!hasInboundData && Object.keys(cfg).length === 0) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "evidence-gate", state: "FAIL", anchor: `${inp.node.id}:missing-triplet` }, timing: { startMs, endMs }, outputs: { valid: false, reason: "missing triplet" } } as NodeResult
      }

      const evidencePayload = hasTriplet(inbound) ? extractEvidence(inbound) : (hasTriplet({ evidence: inbound }) ? inbound : null)
      const hasValid = evidencePayload !== null ? hasTriplet({ evidence: evidencePayload }) || hasTriplet(inbound) : hasTriplet(inbound)

      const broadCheck = hasTriplet(inbound) || hasTriplet({ evidence: inbound }) || (() => {
        const vals = Object.values(inbound)
        for (const v of vals) if (hasTriplet({ evidence: v }) || hasTriplet(v)) return true
        return false
      })()

      const endMs = yield* Clock.currentTimeMillis
      if (broadCheck) return { verdict: "PASS" as const, evidence: { pattern: "evidence-gate", state: "PASS", anchor: `${inp.node.id}:triplet:valid` }, timing: { startMs, endMs }, outputs: { valid: true } } as NodeResult
      return { verdict: "FAIL" as const, evidence: { pattern: "evidence-gate", state: "FAIL", anchor: `${inp.node.id}:missing-triplet` }, timing: { startMs, endMs }, outputs: { valid: false, reason: "missing evidence triplet" } } as NodeResult
    }).pipe(Effect.catchAll((e) => Effect.gen(function* () {
      const startMs = yield* Clock.currentTimeMillis
      const inp2 = input as NodeInput
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "FAIL" as const, evidence: { pattern: "evidence-gate", state: "FAIL", anchor: `${inp2.node.id}:error` }, timing: { startMs, endMs }, outputs: { valid: false, reason: String(e) }, error: e } as NodeResult
    })))
}

replaceStubSync("evidence-gate", evidenceGateNode)
