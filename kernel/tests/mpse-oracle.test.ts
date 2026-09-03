import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect } from "effect"
import { compileOracle, discharge, OracleConflictError } from "../mpse/oracle"
import { calibrate } from "../mpse/calibrate"
import { emitKernelProto } from "../mpse/kernel-emit"
import { emitStubs } from "../mpse/stub-emit"

describe("mpse-oracle — W7 F18 bridge", () => {
  it.effect("compileOracle append-only: conflicting re-registration same id → ORACLE_CONFLICT", () =>
    Effect.gen(function* () {
      const cards: any[] = [
        { id: "R1", expr: { _tag: "literal", value: 1 }, expected: 24 },
        { id: "R1", expr: { _tag: "literal", value: 2 }, expected: 99 }
      ]
      let threw = false
      let code = ""
      try { compileOracle(cards) } catch (e: any) { threw = true; code = e.code ?? e.message ?? String(e) }
      expect(threw).toBe(true)
      expect(code).toContain("ORACLE_CONFLICT")
    }))

  it.effect("discharge integer-equality exact match → PASS (zero false positives)", () =>
    Effect.gen(function* () {
      const reg = compileOracle([{ id: "setup_count", expr: { _tag: "literal", value: 24 }, expected: 24 } as any])
      const r = discharge(reg, "setup_count", 24)
      expect(r.status).toBe("PASS")
      expect(r.expected).toBe(24)
      expect(r.actual).toBe(24)
    }))

  it.effect("discharge integer mismatch → FAIL (zero false positives)", () =>
    Effect.gen(function* () {
      const reg = compileOracle([{ id: "setup_count", expr: { _tag: "literal", value: 24 }, expected: 24 } as any])
      const r = discharge(reg, "setup_count", 25)
      expect(r.status).toBe("FAIL")
      expect(r.expected).toBe(24)
      expect(r.actual).toBe(25)
    }))

  it.effect("discharge float within epsilon → PASS", () =>
    Effect.gen(function* () {
      const reg = compileOracle([{ id: "ratio", expr: { _tag: "literal", value: 0.6 }, expected: 0.6, tolerance: 0.05 } as any])
      const r = discharge(reg, "ratio", 0.62)
      expect(r.status).toBe("PASS")
    }))

  it.effect("discharge float outside epsilon → FAIL", () =>
    Effect.gen(function* () {
      const reg = compileOracle([{ id: "ratio", expr: { _tag: "literal", value: 0.6 }, expected: 0.6, tolerance: 0.05 } as any])
      const r = discharge(reg, "ratio", 0.9)
      expect(r.status).toBe("FAIL")
    }))

  it.effect("discharge NaN actual → CONTRADICTED", () =>
    Effect.gen(function* () {
      const reg = compileOracle([{ id: "setup_count", expr: { _tag: "literal", value: 24 }, expected: 24 } as any])
      const r = discharge(reg, "setup_count", Number.NaN)
      expect(r.status).toBe("CONTRADICTED")
      expect(r.reason).toContain("NaN")
    }))

  it.effect("discharge unregistered rule → UNVERIFIABLE", () =>
    Effect.gen(function* () {
      const reg = compileOracle([{ id: "exists", expr: { _tag: "literal", value: 1 }, expected: 1 } as any])
      const r = discharge(reg, "never_registered", 1)
      expect(r.status).toBe("UNVERIFIABLE")
      expect(r.reason).toContain("no oracle")
    }))

  it.effect("born-off exclusion → EXCLUDED (D17 status, not FAIL)", () =>
    Effect.gen(function* () {
      const reg = compileOracle([
        { id: "R-pass", expr: { _tag: "literal", value: 10 }, expected: 10 } as any,
        { id: "R-born", expr: { _tag: "literal", value: 5 }, expected: 5 } as any
      ])
      const samples: any[] = [
        { ruleId: "R-born", actual: 999, bornOff: true, isExclusion: true },
      ]
      const report = calibrate(reg, samples)
      expect(report.excluded).toBe(1)
      expect(report.rows[0]!.status).toBe("EXCLUDED")
      expect(report.rows[0]!.reason).toContain("EXCLUDED_BORN_OFF")
    }))

  it.effect("calibrate report counts correct on mixed sample", () =>
    Effect.gen(function* () {
      const reg = compileOracle([
        { id: "R-pass", expr: { _tag: "literal", value: 10 }, expected: 10 } as any,
        { id: "R-fail", expr: { _tag: "literal", value: 20 }, expected: 20 } as any,
        { id: "R-born", expr: { _tag: "literal", value: 30 }, expected: 30 } as any
      ])
      const samples: any[] = [
        { ruleId: "R-pass", actual: 10 },
        { ruleId: "R-fail", actual: 999 },
        { ruleId: "never", actual: 1 },
        { ruleId: "R-born", actual: 0, bornOff: true }
      ]
      const report = calibrate(reg, samples)
      expect(report.pass).toBe(1)
      expect(report.contradict).toBe(1)
      expect(report.unverifiable).toBe(1)
      expect(report.excluded).toBe(1)
      expect(report.total).toBe(4)
      expect(report.rows.length).toBe(4)
    }))

  it.effect("emitKernelProto produces per-node prototype stubs with oracle linkage + Activity skeleton", () =>
    Effect.gen(function* () {
      const cards: any[] = [
        { id: "n1", expr: { _tag: "literal", value: 24 }, expected: 24 },
        { id: "n2", expr: { _tag: "literal", value: 0.6 }, expected: 0.6, tolerance: 0.05 }
      ]
      const reg = compileOracle(cards)
      const doc: any = {
        nodes: [
          { id: "n1", type: "math-eval", config: { expr: cards[0]!.expr }, oracle: "n1" },
          { id: "n2", type: "oracle-discharge", config: { expr: cards[1]!.expr }, oracle: "n2" }
        ],
        edges: [],
        meta: { name: "test-doc", tier: 1 }
      }
      const protos: any = emitKernelProto(doc, reg)
      const arr = Array.isArray(protos) ? protos : Object.values(protos)
      expect(arr.length).toBe(2)
      const p1 = arr.find((p: any) => p.id === "n1")!
      expect(p1.kind).toBe("math-eval")
      expect(p1.exprSource).toContain("literal")
      expect(p1.oracleRules.length).toBe(1)
      expect(p1.oracleRules[0]!.oracleKey).toBe("n1")
      expect(p1.activitySkeleton).toContain("Activity.make")
      expect(p1.activitySkeleton).toContain("Effect")
      expect(p1.workflow).toBeDefined()
    }))

  it.effect("emitStubs produces delta code-spec stubs", () =>
    Effect.gen(function* () {
      const cards: any[] = [
        { id: "n1", expr: { _tag: "literal", value: 24 }, expected: 24 },
        { id: "n2", expr: { _tag: "literal", value: 0.6 }, expected: 0.6, tolerance: 0.05 }
      ]
      const reg = compileOracle(cards)
      const doc: any = {
        nodes: [
          { id: "n1", type: "math-eval", config: { expr: cards[0]!.expr } },
          { id: "n2", type: "gate", config: { expr: cards[1]!.expr } }
        ],
        edges: [],
        meta: { name: "test-doc", tier: 1 }
      }
      const stubs: any = emitStubs(doc, reg)
      const arr = Array.isArray(stubs) ? stubs : Object.values(stubs).map((s: any) => typeof s === "string" ? { template: s, id: "x" } : s)
      expect(arr.length).toBe(2)
      const s1 = arr.find((s: any) => (s.id ?? s.template?.includes("n1")) )!
      const tpl = (s1 as any).template ?? (s1 as any).codeSpec ?? String(s1)
      expect(tpl.length).toBeGreaterThan(20)
      expect(tpl).toContain("n1")
    }))

  it.effect("registry is appendOnly true and discharge via registry method matches standalone", () =>
    Effect.gen(function* () {
      const reg = compileOracle([{ id: "X", expr: { _tag: "literal", value: 1 }, expected: 1 } as any])
      expect(reg.appendOnly).toBe(true)
      expect(reg.rules instanceof Map).toBe(true)
      const a = reg.discharge("X", 1)
      const b = discharge(reg, "X", 1)
      expect(a.status).toBe(b.status)
      expect(a.status).toBe("PASS")
    }))

  it.effect("discharge Infinity actual → CONTRADICTED (non-finite)", () =>
    Effect.gen(function* () {
      const reg = compileOracle([{ id: "cnt", expr: { _tag: "literal", value: 5 }, expected: 5 } as any])
      const r = discharge(reg, "cnt", Number.POSITIVE_INFINITY)
      expect(r.status).toBe("CONTRADICTED")
    }))

  it.effect("calibrate excluded born-off never counted as contradict even when value mismatches", () =>
    Effect.gen(function* () {
      const reg = compileOracle([{ id: "E", expr: { _tag: "literal", value: 100 }, expected: 100 } as any])
      const samples: any[] = [
        { ruleId: "E", actual: 999, bornOff: true },
        { ruleId: "E", actual: 999 }
      ]
      const report = calibrate(reg, samples)
      expect(report.excluded).toBe(1)
      expect(report.contradict).toBe(1)
      expect(report.rows[0]!.status).toBe("EXCLUDED")
      expect(report.rows[1]!.status).toBe("CONTRADICTED")
    }))
})
