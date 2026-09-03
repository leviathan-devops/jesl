import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect } from "effect"
import { oracleGateNode } from "../nodes/oracle-gate"
import { oracleDischargeNode } from "../nodes/oracle-discharge"
import { mpseDischargeNode } from "../nodes/mpse-discharge"

const run = (node: any, input: any) => node.invoke(input, {}) as Effect.Effect<any, any>

describe("oracle-gate / oracle-discharge / mpse-discharge", () => {
  it.effect("oracle-gate PASS on integer equality", () =>
    Effect.gen(function* () {
      const res: any = yield* run(oracleGateNode, { node: { id: "og1", config: { ruleId: "R1", expected: 24 } }, inbound: { actual: 24 } })
      expect(res.verdict).toBe("PASS")
      expect(res.evidence.pattern).toBe("oracle-gate.discharge")
      expect(res.evidence.state).toBe("PASS")
      expect(res.outputs.status).toBe("PASS")
    }))

  it.effect("oracle-gate FAIL on integer mismatch", () =>
    Effect.gen(function* () {
      const res: any = yield* run(oracleGateNode, { node: { id: "og1", config: { ruleId: "R1", expected: 24 } }, inbound: { actual: 25 } })
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.state).toBe("FAIL")
    }))

  it.effect("oracle-gate NaN actual → FAIL (CONTRADICTED maps to FAIL)", () =>
    Effect.gen(function* () {
      const res: any = yield* run(oracleGateNode, { node: { id: "og1", config: { ruleId: "R1", expected: 24 } }, inbound: { actual: Number.NaN } })
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.state).toBe("CONTRADICTED")
    }))

  it.effect("oracle-gate Infinity actual → FAIL CONTRADICTED", () =>
    Effect.gen(function* () {
      const res: any = yield* run(oracleGateNode, { node: { id: "og1", config: { ruleId: "R1", expected: 5 } }, inbound: { actual: Number.POSITIVE_INFINITY } })
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.state).toBe("CONTRADICTED")
    }))

  it.effect("oracle-gate missing config → INCONCLUSIVE with triplet", () =>
    Effect.gen(function* () {
      const res: any = yield* run(oracleGateNode, { node: { id: "og1", config: {} }, inbound: { actual: 1 } })
      expect(res.verdict).toBe("INCONCLUSIVE")
      expect(res.evidence.pattern).toBe("oracle-gate.discharge")
      expect(res.timing.startMs).toBeDefined()
    }))

  it.effect("oracle-gate float within epsilon → PASS", () =>
    Effect.gen(function* () {
      const res: any = yield* run(oracleGateNode, { node: { id: "og1", config: { ruleId: "R2", expected: 0.6, tolerance: 0.05 } }, inbound: { actual: 0.62 } })
      expect(res.verdict).toBe("PASS")
    }))

  it.effect("oracle-gate float outside epsilon → FAIL", () =>
    Effect.gen(function* () {
      const res: any = yield* run(oracleGateNode, { node: { id: "og1", config: { ruleId: "R2", expected: 0.6, tolerance: 0.05 } }, inbound: { actual: 0.9 } })
      expect(res.verdict).toBe("FAIL")
    }))

  it.effect("oracle-discharge PASS returns full dischargeResult in outputs", () =>
    Effect.gen(function* () {
      const res: any = yield* run(oracleDischargeNode, { node: { id: "od1", config: { ruleId: "R1", expected: 10 } }, inbound: { actual: 10 } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.dischargeResult).toBeDefined()
      expect(res.outputs.dischargeResult.status).toBe("PASS")
      expect(res.outputs.dischargeResult.expected).toBe(10)
      expect(res.outputs.dischargeResult.actual).toBe(10)
      expect(res.evidence.pattern).toBe("oracle-discharge.discharge")
    }))

  it.effect("oracle-discharge FAIL returns dischargeResult with reason", () =>
    Effect.gen(function* () {
      const res: any = yield* run(oracleDischargeNode, { node: { id: "od1", config: { ruleId: "R1", expected: 10 } }, inbound: { actual: 11 } })
      expect(res.verdict).toBe("FAIL")
      expect(res.outputs.dischargeResult.status).toBe("FAIL")
      expect(res.outputs.dischargeResult.reason).toContain("mismatch")
    }))

  it.effect("oracle-discharge empty inbound actual → INCONCLUSIVE", () =>
    Effect.gen(function* () {
      const res: any = yield* run(oracleDischargeNode, { node: { id: "od1", config: { ruleId: "R1", expected: 10 } }, inbound: {} })
      expect(res.verdict).toBe("INCONCLUSIVE")
    }))

  it.effect("oracle-discharge concurrent 3 discharges all correct", () =>
    Effect.gen(function* () {
      const results: any[] = yield* Effect.all([
        run(oracleDischargeNode, { node: { id: "od1", config: { ruleId: "R1", expected: 1 } }, inbound: { actual: 1 } }),
        run(oracleDischargeNode, { node: { id: "od2", config: { ruleId: "R1", expected: 1 } }, inbound: { actual: 2 } }),
        run(oracleDischargeNode, { node: { id: "od3", config: { ruleId: "R1", expected: 0.5, tolerance: 0.1 } }, inbound: { actual: 0.55 } })
      ], { concurrency: 3 })
      expect(results[0].verdict).toBe("PASS")
      expect(results[1].verdict).toBe("FAIL")
      expect(results[2].verdict).toBe("PASS")
    }))

  it.effect("mpse-discharge single card+sample PASS → report pass=1 fail=0", () =>
    Effect.gen(function* () {
      const cards = [{ id: "R1", expected: 10, oracleKey: "R1" }]
      const samples = [{ ruleId: "R1", actual: 10 }]
      const res: any = yield* run(mpseDischargeNode, { node: { id: "md1", config: { cards } }, inbound: { samples } })
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.report.pass).toBe(1)
      expect(res.outputs.report.fail).toBe(0)
      expect(res.outputs.report.total).toBe(1)
      expect(res.evidence.pattern).toBe("mpse-discharge.calibrate")
    }))

  it.effect("mpse-discharge mixed report: 1 PASS 1 FAIL → verdict FAIL", () =>
    Effect.gen(function* () {
      const cards = [{ id: "R1", expected: 10 }, { id: "R2", expected: 20 }]
      const samples = [{ ruleId: "R1", actual: 10 }, { ruleId: "R2", actual: 999 }]
      const res: any = yield* run(mpseDischargeNode, { node: { id: "md1", config: { cards } }, inbound: { samples } })
      expect(res.verdict).toBe("FAIL")
      expect(res.outputs.report.pass).toBe(1)
      expect(res.outputs.report.fail).toBe(1)
    }))

  it.effect("mpse-discharge bornOff exclusion → report excluded=1 verdict PASS when only exclusion", () =>
    Effect.gen(function* () {
      const cards = [{ id: "R-born", expected: 5 }]
      const samples = [{ ruleId: "R-born", actual: 999, bornOff: true }]
      const res: any = yield* run(mpseDischargeNode, { node: { id: "md1", config: { cards } }, inbound: { samples } })
      expect(res.outputs.report.excluded).toBe(1)
      expect(res.outputs.report.rows[0]!.status).toBe("EXCLUDED")
      expect(res.verdict).toBe("PASS")
    }))

  it.effect("mpse-discharge empty cards → INCONCLUSIVE", () =>
    Effect.gen(function* () {
      const res: any = yield* run(mpseDischargeNode, { node: { id: "md1", config: {} }, inbound: {} })
      expect(res.verdict).toBe("INCONCLUSIVE")
      expect(res.evidence.state).toBe("MISSING_CARDS")
    }))

  it.effect("mpse-discharge no samples → INCONCLUSIVE", () =>
    Effect.gen(function* () {
      const cards = [{ id: "R1", expected: 1 }]
      const res: any = yield* run(mpseDischargeNode, { node: { id: "md1", config: { cards } }, inbound: {} })
      expect(res.verdict).toBe("INCONCLUSIVE")
      expect(res.evidence.state).toBe("MISSING_SAMPLES")
    }))

  it.effect("mpse-discharge via inbound actual shorthand (single card)", () =>
    Effect.gen(function* () {
      const cards = [{ id: "R1", expected: 42 }]
      const res: any = yield* run(mpseDischargeNode, { node: { id: "md1", config: { cards } }, inbound: { actual: 42 } })
      expect(res.verdict).toBe("PASS")
    }))

  it.effect("oracle-gate evidence triplet always present and timing non-zero", () =>
    Effect.gen(function* () {
      const res: any = yield* run(oracleGateNode, { node: { id: "og1", config: { ruleId: "R1", expected: 7 } }, inbound: { actual: 7 } })
      expect(res.evidence.pattern).toBeDefined()
      expect(res.evidence.state).toBeDefined()
      expect(res.evidence.anchor).toContain("og1")
      expect(typeof res.timing.startMs).toBe("number")
      expect(typeof res.timing.endMs).toBe("number")
    }))
})
