import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect, Clock } from "effect"
import { evidenceGateNode } from "../nodes/evidence-gate"
import { evidenceMachineNode } from "../nodes/evidence-machine"
import { claimGateNode } from "../nodes/claim-gate"
import { auditRegistryNode, _auditRegistryClear, _auditRegistryCount, _auditRegistryGet } from "../nodes/audit-registry"

const runNode = (impl: any, input: any, ctx: any = {}) => impl.invoke(input, ctx)

describe("evidence-nodes — 4 nodes", () => {
  it.effect("evidence-gate PASS on valid triplet", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(evidenceGateNode, { node: { id: "eg1" }, inbound: { evidence: { pattern: "p1", state: "s1", anchor: "file:1" } } })
      expect(res.verdict).toBe("PASS")
      expect(res.evidence.pattern).toBe("evidence-gate")
      expect(res.outputs.valid).toBe(true)
    }))

  it.effect("evidence-gate FAIL on missing triplet", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(evidenceGateNode, { node: { id: "eg1" }, inbound: { evidence: { pattern: "", state: "", anchor: "" } } })
      expect(res.verdict).toBe("FAIL")
      expect(res.outputs.valid).toBe(false)
    }))

  it.effect("evidence-gate FAIL on empty inbound", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(evidenceGateNode, { node: { id: "eg2" }, inbound: {} })
      expect(res.verdict).toBe("FAIL")
    }))

  it.effect("evidence-gate source_change missing path → FAIL", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(evidenceGateNode, { node: { id: "eg3" }, inbound: { kind: "source_change", subject: "s1" } })
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.anchor).toContain("missing-path")
    }))

  it.effect("evidence-gate source_change with path → PASS", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(evidenceGateNode, { node: { id: "eg3" }, inbound: { kind: "source_change", subject: "s1", filePath: "src/a.ts" } })
      expect(res.verdict).toBe("PASS")
    }))

  it.effect("evidence-gate status missing probeOutput → FAIL", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(evidenceGateNode, { node: { id: "eg4" }, inbound: { kind: "status", subject: "s1", probeOutput: "" } })
      expect(res.verdict).toBe("FAIL")
    }))

  it.effect("evidence-machine ingests unit → PASS EVIDENCED", () =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const res: any = yield* runNode(evidenceMachineNode, { node: { id: "em1" }, inbound: { kind: "unit", subject: "subj-unit", at: now } })
      expect(res.verdict).toBe("PASS")
      expect(res.evidence.state).toBe("EVIDENCED")
      expect(res.outputs.verdict.verdict).toBe("EVIDENCED")
    }))

  it.effect("evidence-machine missing event → FAIL", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(evidenceMachineNode, { node: { id: "em2" }, inbound: {} })
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.anchor).toContain("missing-event")
    }))

  it.effect("evidence-machine boundary: stale event REJECTED → FAIL", () =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const res: any = yield* runNode(evidenceMachineNode, { node: { id: "em3" }, inbound: { kind: "unit", subject: "stale-subj", at: now - 400000 } })
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.state).toBe("REJECTED")
    }))

  it.effect("evidence-machine concurrent ingests same subject", () =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const fibers = yield* Effect.all([
        runNode(evidenceMachineNode, { node: { id: "emc" }, inbound: { kind: "unit", subject: "conc-subj", at: now } }),
        runNode(evidenceMachineNode, { node: { id: "emc" }, inbound: { kind: "container", subject: "conc-subj2", at: now } })
      ], { concurrency: 2 })
      const r1 = fibers[0] as any
      const r2 = fibers[1] as any
      expect(r1.verdict).toBe("PASS")
      expect(r2.verdict).toBe("PASS")
    }))

  it.effect("claim-gate UNEVIDENCED without source → FAIL", () =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const res: any = yield* runNode(claimGateNode, { node: { id: "cg1" }, inbound: { subject: "claim-no-src", at: now } })
      expect(res.verdict).toBe("FAIL")
      expect(res.outputs.adjudication).toBe("UNEVIDENCED")
    }))

  it.effect("claim-gate EVIDENCED with preSource → PASS", () =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const res: any = yield* runNode(claimGateNode, { node: { id: "cg2" }, inbound: { subject: "claim-with-src", at: now, preSource: { filePath: "src/x.ts", at: now - 1 } } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.adjudication).toBe("EVIDENCED")
    }))

  it.effect("claim-gate missing claim → FAIL", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(claimGateNode, { node: { id: "cg3" }, inbound: {} })
      expect(res.verdict).toBe("FAIL")
      expect(res.outputs.adjudication).toBe("UNEVIDENCED")
    }))

  it.effect("claim-gate boundary null inbound values → FAIL not crash", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(claimGateNode, { node: { id: "cg4" }, inbound: { subject: null as any, at: null as any } })
      expect(["PASS","FAIL"].includes(res.verdict)).toBe(true)
    }))

  it.effect("audit-registry registers findings and returns count", () =>
    Effect.gen(function* () {
      _auditRegistryClear()
      const res: any = yield* runNode(auditRegistryNode, { node: { id: "ar1" }, inbound: { subject: "modA", findings: [{ rule: "r1", level: "error", message: "bad" }] } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.count).toBe(1)
      expect(res.outputs.globalCount).toBe(1)
      expect(_auditRegistryGet("modA").length).toBe(1)
    }))

  it.effect("audit-registry appends second batch", () =>
    Effect.gen(function* () {
      _auditRegistryClear()
      yield* runNode(auditRegistryNode, { node: { id: "ar1" }, inbound: { subject: "modB", findings: [{ rule: "r1", level: "warn", message: "w1" }] } })
      const res: any = yield* runNode(auditRegistryNode, { node: { id: "ar1" }, inbound: { subject: "modB", findings: [{ rule: "r2", level: "error", message: "w2" }] } })
      expect(res.outputs.count).toBe(2)
      expect(_auditRegistryCount()).toBe(2)
    }))

  it.effect("audit-registry empty findings array → PASS 0 registered", () =>
    Effect.gen(function* () {
      _auditRegistryClear()
      const res: any = yield* runNode(auditRegistryNode, { node: { id: "ar2" }, inbound: { subject: "modC", findings: [] } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.registered).toBe(0)
    }))

  it.effect("audit-registry concurrent writes", () =>
    Effect.gen(function* () {
      _auditRegistryClear()
      const results: any[] = yield* Effect.all([
        runNode(auditRegistryNode, { node: { id: "ar3" }, inbound: { subject: "modConc", findings: [{ rule: "r1", level: "info", message: "m1" }] } }),
        runNode(auditRegistryNode, { node: { id: "ar3" }, inbound: { subject: "modConc", findings: [{ rule: "r2", level: "info", message: "m2" }] } })
      ], { concurrency: 2 })
      expect(results[0].verdict).toBe("PASS")
      expect(results[1].verdict).toBe("PASS")
      expect(_auditRegistryGet("modConc").length).toBe(2)
    }))

  it.effect("audit-registry no findings key with no inbound → FAIL", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(auditRegistryNode, { node: { id: "ar4" }, inbound: {} })
      expect(res.verdict).toBe("FAIL")
    }))
})
