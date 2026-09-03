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

export const oracleGateNode: NodeImpl = {
  kind: "oracle-gate",
  family: "deterministic",
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
      const tolerance = cfg["tolerance"] as number | undefined ?? cfg["epsilon"] as number | undefined
      const actual = resolveActual(inbound)
      if (!ruleId || expected === undefined) {
        const endMs = yield* Clock.currentTimeMillis
        return {
          verdict: "INCONCLUSIVE" as const,
          evidence: { pattern: "oracle-gate.discharge", state: "MISSING_CONFIG", anchor: `${inp.node.id}:missing-config` },
          timing: { startMs, endMs },
          outputs: { ruleId: ruleId ?? "unknown", expected, actual }
        } as NodeResult
      }
      if (actual === undefined) {
        const endMs = yield* Clock.currentTimeMillis
        return {
          verdict: "INCONCLUSIVE" as const,
          evidence: { pattern: "oracle-gate.discharge", state: "MISSING_ACTUAL", anchor: `${inp.node.id}:${ruleId}:no-actual` },
          timing: { startMs, endMs },
          outputs: { ruleId, expected, actual }
        } as NodeResult
      }
      let registry: ReturnType<typeof compileOracle>
      try {
        const card: Record<string, unknown> = { id: ruleId, expected, tolerance, oracleKey: ruleId }
        if (cfg["expr"] !== undefined) card["expr"] = cfg["expr"]
        registry = compileOracle([card as any], "oracle-gate")
      } catch (e: unknown) {
        const endMs = yield* Clock.currentTimeMillis
        const msg = e instanceof Error ? e.message : String(e)
        return {
          verdict: "FAIL" as const,
          evidence: { pattern: "oracle-gate.discharge", state: "ORACLE_CONFLICT", anchor: `${inp.node.id}:${ruleId}:conflict` },
          timing: { startMs, endMs },
          outputs: { ruleId, expected, actual, error: msg }
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
          evidence: { pattern: "oracle-gate.discharge", state: "DISCHARGE_ERROR", anchor: `${inp.node.id}:${ruleId}:error` },
          timing: { startMs, endMs },
          outputs: { ruleId, expected, actual, error: msg }
        } as NodeResult
      }
      const verdict = mapStatusToVerdict(result.status)
      const endMs = yield* Clock.currentTimeMillis
      return {
        verdict,
        evidence: { pattern: "oracle-gate.discharge", state: result.status, anchor: `${inp.node.id}:${ruleId}:${result.status}` },
        timing: { startMs, endMs },
        outputs: { ruleId, expected: result.expected, actual: result.actual, status: result.status, reason: result.reason }
      } as NodeResult
    })
}

replaceStubSync("oracle-gate", oracleGateNode)
