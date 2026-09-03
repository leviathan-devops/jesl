import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import { replaceStubSync } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { makeEvidenceMachine } from "../core/evidence"
import type { EvidenceEvent, VerdictRecord } from "../core/evidence"

function extractEvent(inbound: Record<string, unknown>, cfg: Record<string, unknown>): EvidenceEvent | null {
  const raw = (inbound["event"] as unknown) ?? (inbound["evidenceEvent"] as unknown) ?? inbound
  if (raw !== null && typeof raw === "object") {
    const r = raw as Record<string, unknown>
    if (r["kind"] !== undefined && r["subject"] !== undefined && r["at"] !== undefined) return r as unknown as EvidenceEvent
    if (r["kind"] !== undefined && r["subject"] !== undefined) {
      const at = (r["at"] as number | undefined) ?? (cfg["at"] as number | undefined) ?? 0
      return { kind: r["kind"] as any, subject: r["subject"] as string, at, payload: r["payload"], probeOutput: r["probeOutput"] as string | undefined, filePath: r["filePath"] as string | undefined, detail: r["detail"] as any }
    }
  }
  const kind = (cfg["kind"] as string | undefined) ?? (inbound["kind"] as string | undefined)
  const subject = (cfg["subject"] as string | undefined) ?? (inbound["subject"] as string | undefined)
  if (kind !== undefined && subject !== undefined) {
    const at = (inbound["at"] as number | undefined) ?? (cfg["at"] as number | undefined) ?? 0
    return { kind: kind as any, subject, at, payload: (inbound["payload"] as unknown) ?? (cfg["payload"] as unknown), probeOutput: (inbound["probeOutput"] as string | undefined) ?? (cfg["probeOutput"] as string | undefined), filePath: (inbound["filePath"] as string | undefined) ?? (cfg["filePath"] as string | undefined), detail: (inbound["detail"] as any) ?? (cfg["detail"] as any) }
  }
  return null
}

export const evidenceMachineNode: NodeImpl = {
  kind: "evidence-machine",
  family: "evidence",
  requiredCaps: [],
  invoke: (input: unknown, ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const inbound = (inp.inbound ?? {}) as Record<string, unknown>
      const cfg = (inp.node.config ?? {}) as Record<string, unknown>
      const startMs = yield* Clock.currentTimeMillis
      let ev = extractEvent(inbound, cfg)
      if (!ev) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "evidence-machine", state: "FAIL", anchor: `${inp.node.id}:missing-event` }, timing: { startMs, endMs }, outputs: { reason: "missing EvidenceEvent: need kind+subject" } } as NodeResult
      }
      if (ev.at === 0) ev = { ...ev, at: startMs }
      const maybeCtx = ctx as any
      const svc = maybeCtx && maybeCtx.evidenceMachine ? maybeCtx.evidenceMachine : yield* makeEvidenceMachine
      let verdict: VerdictRecord
      try {
        verdict = yield* (svc.ingest(ev) as Effect.Effect<VerdictRecord>)
      } catch (e) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "evidence-machine", state: "FAIL", anchor: `${inp.node.id}:ingest-error` }, timing: { startMs, endMs }, outputs: { error: String(e), event: ev }, error: e } as NodeResult
      }
      const endMs = yield* Clock.currentTimeMillis
      const pass = verdict.verdict === "EVIDENCED"
      return {
        verdict: pass ? "PASS" as const : "FAIL" as const,
        evidence: { pattern: "evidence-machine", state: verdict.verdict, anchor: `${inp.node.id}:${ev.kind}:${ev.subject}:1` },
        timing: { startMs, endMs },
        outputs: { verdict, event: ev, ringKind: ev.kind }
      } as NodeResult
    }).pipe(Effect.catchAll((e) => Effect.gen(function* () {
      const inp2 = input as NodeInput
      const t = yield* Clock.currentTimeMillis
      return { verdict: "FAIL" as const, evidence: { pattern: "evidence-machine", state: "FAIL", anchor: `${inp2.node.id}:error` }, timing: { startMs: t, endMs: t }, outputs: { error: String(e) }, error: e } as NodeResult
    })))
}

replaceStubSync("evidence-machine", evidenceMachineNode)
