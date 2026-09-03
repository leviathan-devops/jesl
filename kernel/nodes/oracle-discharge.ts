import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import { replaceStubSync } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { compileOracle } from "../mpse/oracle"

function resolveActual(inbound: Record<string, unknown>): unknown {
  if ("actual" in inbound) return inbound["actual"]
  if ("value" in inbound) return inbound["value"]
  if ("data" in inbound) return inbound["data"]
  if ("input" in inbound) return inbound["input"]
  const vals = Object.values(inbound)
  return vals.length > 0 ? vals[0] : undefined
}

function mapStatusToVerdict(status: string): NodeResult["verdict"] {
  if (status === "PASS") return "PASS"
  if (status === "FAIL") return "FAIL"
  if (status === "CONTRADICTED") return "FAIL"
  if (status === "UNVERIFIABLE") return "INCONCLUSIVE"
  if (status === "EXCLUDED") return "INCONCLUSIVE"
  return "INCONCLUSIVE"
}

export const oracleDischargeNode: NodeImpl = {
  kind: "oracle-discharge",
  family: "decision",
  requiredCaps: ["oracle:read"],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as Record<string, unknown>
      const inbound = (inp.inbound ?? {}) as Record<string, unknown>
      const startMs = yield* Clock.currentTimeMillis
      const ruleIdRaw = (cfg["ruleId"] ?? cfg["id"] ?? cfg["oracleKey"] ?? cfg["oracle"] ?? inbound["ruleId"]) as unknown
      const ruleId = typeof ruleIdRaw === "string" && ruleIdRaw.length > 0 ? ruleIdRaw : undefined
      const expected = cfg["expected"] ?? cfg["value"] ?? cfg["oracleExpected"]
      const tolerance = (cfg["tolerance"] as number | undefined) ?? (cfg["epsilon"] as number | undefined)
      const actual = resolveActual(inbound)
      if (!ruleId || expected === undefined) {
        const endMs = yield* Clock.currentTimeMillis
        return {
          verdict: "INCONCLUSIVE" as const,
          evidence: { pattern: "oracle-discharge.discharge", state: "MISSING_CONFIG", anchor: `${inp.node.id}:missing-config` },
          timing: { startMs, endMs },
          outputs: { ruleId: ruleId ?? "unknown", expected, actual, dischargeResult: { status: "UNVERIFIABLE", ruleId: ruleId ?? "unknown", expected, actual, reason: "missing config" } }
        } as NodeResult
      }
      if (actual === undefined) {
        const endMs = yield* Clock.currentTimeMillis
        return {
          verdict: "INCONCLUSIVE" as const,
          evidence: { pattern: "oracle-discharge.discharge", state: "MISSING_ACTUAL", anchor: `${inp.node.id}:${ruleId}:no-actual` },
          timing: { startMs, endMs },
          outputs: { ruleId, expected, actual, dischargeResult: { status: "UNVERIFIABLE", ruleId, expected, actual, reason: "missing actual" } }
        } as NodeResult
      }
      let registry: ReturnType<typeof compileOracle>
      try {
        const card: Record<string, unknown> = { id: ruleId, expected, tolerance, oracleKey: ruleId }
        if (cfg["expr"] !== undefined) card["expr"] = cfg["expr"]
        if (cfg["severity"] !== undefined) card["severity"] = cfg["severity"]
        registry = compileOracle([card as any], "oracle-discharge")
      } catch (e: unknown) {
        const endMs = yield* Clock.currentTimeMillis
        const msg = e instanceof Error ? e.message : String(e)
        return {
          verdict: "FAIL" as const,
          evidence: { pattern: "oracle-discharge.discharge", state: "ORACLE_CONFLICT", anchor: `${inp.node.id}:${ruleId}:conflict` },
          timing: { startMs, endMs },
          outputs: { ruleId, expected, actual, error: msg, dischargeResult: { status: "CONTRADICTED", ruleId, expected, actual, reason: msg } }
        } as NodeResult
      }
      let result: ReturnType<typeof registry.discharge>
      try {
        result = registry.discharge(ruleId, actual)
      } catch (e: unknown) {
        const endMs = yield* Clock.currentTimeMillis
        const msg = e instanceof Error ? e.message : String(e)
        return {
          verdict: "FAIL" as const,
          evidence: { pattern: "oracle-discharge.discharge", state: "DISCHARGE_ERROR", anchor: `${inp.node.id}:${ruleId}:error` },
          timing: { startMs, endMs },
          outputs: { ruleId, expected, actual, error: msg, dischargeResult: { status: "CONTRADICTED", ruleId, expected, actual, reason: msg } }
        } as NodeResult
      }
      const verdict = mapStatusToVerdict(result.status)
      const endMs = yield* Clock.currentTimeMillis
      return {
        verdict,
        evidence: { pattern: "oracle-discharge.discharge", state: result.status, anchor: `${inp.node.id}:${ruleId}:${result.status}` },
        timing: { startMs, endMs },
        outputs: { ruleId, expected: result.expected, actual: result.actual, status: result.status, reason: result.reason, dischargeResult: result }
      } as NodeResult
    })
}

replaceStubSync("oracle-discharge", oracleDischargeNode)
