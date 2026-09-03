import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import { replaceStubSync } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { compileOracle } from "../mpse/oracle"
import { calibrate } from "../mpse/calibrate"
import type { Sample } from "../mpse/calibrate"

function resolveCards(cfg: Record<string, unknown>, inbound: Record<string, unknown>): ReadonlyArray<Record<string, unknown>> {
  const fromCfg = (cfg["cards"] ?? cfg["rules"] ?? cfg["contracts"]) as unknown
  if (Array.isArray(fromCfg) && fromCfg.length > 0) return fromCfg as ReadonlyArray<Record<string, unknown>>
  const fromInbound = (inbound["cards"] ?? inbound["rules"] ?? inbound["contracts"]) as unknown
  if (Array.isArray(fromInbound) && fromInbound.length > 0) return fromInbound as ReadonlyArray<Record<string, unknown>>
  const docLike = (cfg["doc"] ?? inbound["doc"]) as Record<string, unknown> | undefined
  if (docLike && Array.isArray(docLike["nodes"])) {
    const nodes = docLike["nodes"] as Array<Record<string, unknown>>
    const cards: Record<string, unknown>[] = []
    for (const n of nodes) {
      const c = (n["config"] ?? {}) as Record<string, unknown>
      if (c["math"] !== undefined || c["expr"] !== undefined || c["expected"] !== undefined) {
        cards.push({ id: n["id"] as string, kind: (c["kind"] as string) ?? (n["type"] as string), math: String(c["math"] ?? ""), expr: c["expr"] ?? null, expected: c["expected"], oracleKey: c["oracle"] as string | undefined, bornOff: Boolean(c["bornOff"]) })
      }
    }
    if (cards.length > 0) return cards
  }
  const ruleId = (cfg["ruleId"] ?? cfg["id"] ?? inbound["ruleId"]) as string | undefined
  const expected = cfg["expected"] ?? cfg["value"]
  if (typeof ruleId === "string" && expected !== undefined) {
    return [{ id: ruleId, expected, tolerance: cfg["tolerance"] as number | undefined, oracleKey: ruleId, expr: cfg["expr"] as unknown }]
  }
  return []
}

function resolveSamples(cfg: Record<string, unknown>, inbound: Record<string, unknown>, cards: ReadonlyArray<Record<string, unknown>>): ReadonlyArray<Sample> {
  const fromCfg = (cfg["samples"] ?? cfg["actuals"]) as unknown
  if (Array.isArray(fromCfg) && fromCfg.length > 0) {
    return normalizeSamples(fromCfg as ReadonlyArray<Record<string, unknown>>)
  }
  const fromInbound = (inbound["samples"] ?? inbound["actuals"] ?? inbound["data"]) as unknown
  if (Array.isArray(fromInbound) && fromInbound.length > 0) {
    return normalizeSamples(fromInbound as ReadonlyArray<Record<string, unknown>>)
  }
  const directActual = inbound["actual"] ?? inbound["value"] ?? cfg["actual"] ?? cfg["value"]
  if (directActual !== undefined && cards.length === 1) {
    const ruleId = String(cards[0]!["id"] ?? cards[0]!["oracleKey"] ?? "rule")
    return [{ ruleId, actual: directActual }]
  }
  if (directActual !== undefined && cards.length > 1) {
    const ruleId = String(cards[0]!["id"] ?? "rule")
    return [{ ruleId, actual: directActual }]
  }
  const vals = Object.values(inbound)
  if (vals.length === 1 && vals[0] !== undefined && cards.length === 1) {
    const ruleId = String(cards[0]!["id"] ?? "rule")
    return [{ ruleId, actual: vals[0] }]
  }
  return []
}

function normalizeSamples(raw: ReadonlyArray<Record<string, unknown>>): ReadonlyArray<Sample> {
  return raw.map((r, i) => {
    const ruleId = String(r["ruleId"] ?? r["id"] ?? r["oracleKey"] ?? `rule#${i}`)
    const actual = r["actual"] ?? r["value"] ?? r["data"]
    const bornOff = Boolean(r["bornOff"] ?? r["isExclusion"] ?? r["exclusion"])
    const id = r["id"] as string | undefined ?? `${ruleId}#${i}`
    return { id, ruleId, actual, bornOff } as Sample
  })
}

export const mpseDischargeNode: NodeImpl = {
  kind: "mpse-discharge",
  family: "decision",
  requiredCaps: ["mpse:calibrate"],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as Record<string, unknown>
      const inbound = (inp.inbound ?? {}) as Record<string, unknown>
      const startMs = yield* Clock.currentTimeMillis
      const cards = resolveCards(cfg, inbound)
      if (cards.length === 0) {
        const endMs = yield* Clock.currentTimeMillis
        return {
          verdict: "INCONCLUSIVE" as const,
          evidence: { pattern: "mpse-discharge.calibrate", state: "MISSING_CARDS", anchor: `${inp.node.id}:no-cards` },
          timing: { startMs, endMs },
          outputs: { cards: [], report: { pass: 0, excluded: 0, fail: 0, total: 0, rows: [] } }
        } as NodeResult
      }
      let registry: ReturnType<typeof compileOracle>
      try {
        const normalized = cards.map((c) => ({
          id: String(c["id"] ?? c["cardId"] ?? c["oracleKey"] ?? ""),
          expected: c["expected"],
          tolerance: c["tolerance"] as number | undefined ?? c["epsilon"] as number | undefined,
          expr: c["expr"] as unknown,
          oracleKey: (c["oracleKey"] ?? c["oracle"] ?? c["id"]) as string | undefined,
          severity: c["severity"] as string | undefined
        }))
        for (const n of normalized) {
          if (!n.id) throw new Error(`card without id`)
        }
        registry = compileOracle(normalized as any, (cfg["docName"] as string | undefined) ?? "mpse-discharge")
      } catch (e: unknown) {
        const endMs = yield* Clock.currentTimeMillis
        const msg = e instanceof Error ? e.message : String(e)
        return {
          verdict: "FAIL" as const,
          evidence: { pattern: "mpse-discharge.calibrate", state: "ORACLE_CONFLICT", anchor: `${inp.node.id}:conflict` },
          timing: { startMs, endMs },
          outputs: { cards, error: msg, report: { pass: 0, excluded: 0, fail: 1, total: 1, rows: [] } }
        } as NodeResult
      }
      const samples = resolveSamples(cfg, inbound, cards)
      if (samples.length === 0) {
        const endMs = yield* Clock.currentTimeMillis
        return {
          verdict: "INCONCLUSIVE" as const,
          evidence: { pattern: "mpse-discharge.calibrate", state: "MISSING_SAMPLES", anchor: `${inp.node.id}:no-samples` },
          timing: { startMs, endMs },
          outputs: { cards, samples: [], report: { pass: 0, excluded: 0, fail: 0, total: 0, rows: [] }, registrySize: registry.size() }
        } as NodeResult
      }
      let report: ReturnType<typeof calibrate>
      try {
        report = calibrate(registry, samples as any)
      } catch (e: unknown) {
        const endMs = yield* Clock.currentTimeMillis
        const msg = e instanceof Error ? e.message : String(e)
        return {
          verdict: "FAIL" as const,
          evidence: { pattern: "mpse-discharge.calibrate", state: "CALIBRATE_ERROR", anchor: `${inp.node.id}:calibrate-error` },
          timing: { startMs, endMs },
          outputs: { cards, samples, error: msg }
        } as NodeResult
      }
      const verdict: NodeResult["verdict"] = report.fail > 0 || report.contradict > 0 ? "FAIL" : report.unverifiable > 0 ? "INCONCLUSIVE" : "PASS"
      const state = verdict === "PASS" ? "CALIBRATED" : verdict === "FAIL" ? "MISMATCH" : "UNVERIFIABLE"
      const endMs = yield* Clock.currentTimeMillis
      return {
        verdict,
        evidence: { pattern: "mpse-discharge.calibrate", state, anchor: `${inp.node.id}:pass=${report.pass}:fail=${report.fail}:excluded=${report.excluded}` },
        timing: { startMs, endMs },
        outputs: { cards, samples, report, pass: report.pass, excluded: report.excluded, fail: report.fail, total: report.total, rows: report.rows }
      } as NodeResult
    })
}

replaceStubSync("mpse-discharge", mpseDischargeNode)
