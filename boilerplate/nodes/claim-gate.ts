import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import { replaceStubSync } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { makeEvidenceMachine } from "../core/evidence"
import type { EvidenceEvent, VerdictRecord } from "../core/evidence"

function extractClaimEvent(inbound: Record<string, unknown>, cfg: Record<string, unknown>): EvidenceEvent | null {
  const raw = (inbound["event"] as unknown) ?? (inbound["claim"] as unknown) ?? inbound
  if (raw !== null && typeof raw === "object") {
    const r = raw as Record<string, unknown>
    if (r["kind"] === "claim" && r["subject"] !== undefined) {
      const at = (r["at"] as number | undefined) ?? 0
      return { kind: "claim" as const, subject: r["subject"] as string, at, payload: r["payload"], probeOutput: r["probeOutput"] as string | undefined, filePath: r["filePath"] as string | undefined, detail: r["detail"] as any }
    }
    if (r["subject"] !== undefined && (r["claim"] !== undefined || cfg["claim"] !== undefined)) {
      return { kind: "claim" as const, subject: r["subject"] as string, at: (r["at"] as number | undefined) ?? 0, payload: r["payload"] }
    }
  }
  const subject = (cfg["subject"] as string | undefined) ?? (inbound["subject"] as string | undefined) ?? (inbound["claim"] as string | undefined)
  if (subject !== undefined) {
    const at = (inbound["at"] as number | undefined) ?? (cfg["at"] as number | undefined) ?? 0
    return { kind: "claim" as const, subject, at }
  }
  const vals = Object.values(inbound)
  for (const v of vals) {
    if (v !== null && typeof v === "object" && (v as any).subject) return { kind: "claim" as const, subject: (v as any).subject as string, at: ((v as any).at as number | undefined) ?? 0 }
  }
  return null
}

export const claimGateNode: NodeImpl = {
  kind: "claim-gate",
  family: "decision",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const inbound = (inp.inbound ?? {}) as Record<string, unknown>
      const cfg = (inp.node.config ?? {}) as Record<string, unknown>
      const startMs = yield* Clock.currentTimeMillis
      let claimEv = extractClaimEvent(inbound, cfg)
      if (!claimEv) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "claim-gate", state: "FAIL", anchor: `${inp.node.id}:missing-claim` }, timing: { startMs, endMs }, outputs: { reason: "missing claim subject", adjudication: "UNEVIDENCED" } } as NodeResult
      }
      if (claimEv.at === 0) claimEv = { ...claimEv, at: startMs }
      const maybeCtx = _ctx as any
      const svc = maybeCtx && maybeCtx.evidenceMachine ? maybeCtx.evidenceMachine : yield* makeEvidenceMachine
      const hasPreSource = (inbound["preSource"] as unknown) ?? (cfg["preSource"] as unknown)
      if (hasPreSource !== null && typeof hasPreSource === "object") {
        const ps = hasPreSource as Record<string, unknown>
        const srcAtRaw = (ps["at"] as number | undefined)
        const srcAt = srcAtRaw !== undefined && srcAtRaw > 0 ? srcAtRaw : claimEv.at
        const srcEv: EvidenceEvent = { kind: "source_change" as const, subject: claimEv.subject, at: srcAt, filePath: (ps["filePath"] as string) ?? "src/pre.ts", payload: ps["payload"] }
        yield* (svc.ingest(srcEv) as Effect.Effect<VerdictRecord>).pipe(Effect.catchAllCause((cause) => Effect.logWarning(`claim-gate preSource ingest failed: ${String(cause)}`).pipe(Effect.asVoid)))
      }
      const explicitSources = (inbound["sourceEvents"] as unknown) ?? (cfg["sourceEvents"] as unknown)
      if (Array.isArray(explicitSources)) {
        for (const se of explicitSources) {
          if (se !== null && typeof se === "object" && (se as any).kind === "source_change") {
            yield* (svc.ingest(se as EvidenceEvent) as Effect.Effect<VerdictRecord>).pipe(Effect.catchAllCause((cause) => Effect.logWarning(`claim-gate sourceEvents ingest failed: ${String(cause)}`).pipe(Effect.asVoid)))
          }
        }
      }
      let ingestVerdict: VerdictRecord
      try {
        ingestVerdict = yield* (svc.ingest(claimEv) as Effect.Effect<VerdictRecord>)
      } catch (e) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "claim-gate", state: "FAIL", anchor: `${inp.node.id}:ingest-error` }, timing: { startMs, endMs }, outputs: { error: String(e), claim: claimEv }, error: e } as NodeResult
      }
      let queryVerdict: VerdictRecord
      try {
        queryVerdict = yield* (svc.queryVerdict(claimEv.subject) as Effect.Effect<VerdictRecord>)
      } catch {
        queryVerdict = ingestVerdict
      }
      const adjudication = queryVerdict.verdict
      const endMs = yield* Clock.currentTimeMillis
      const isEv = adjudication === "EVIDENCED"
      return {
        verdict: isEv ? "PASS" as const : "FAIL" as const,
        evidence: { pattern: "claim-gate", state: adjudication, anchor: `${inp.node.id}:${claimEv.subject}:${adjudication}:1` },
        timing: { startMs, endMs },
        outputs: { adjudication, verdict: queryVerdict, ingestVerdict, claim: claimEv }
      } as NodeResult
    }).pipe(Effect.catchAll((e) => Effect.gen(function* () {
      const inp2 = input as NodeInput
      const t = yield* Clock.currentTimeMillis
      return { verdict: "FAIL" as const, evidence: { pattern: "claim-gate", state: "FAIL", anchor: `${inp2.node.id}:error` }, timing: { startMs: t, endMs: t }, outputs: { error: String(e), adjudication: "UNEVIDENCED" }, error: e } as NodeResult
    })))
}

replaceStubSync("claim-gate", claimGateNode)
