import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { JeslChannelUnset } from "../core/errors"

type AssertOp = "eq" | "ge" | "le" | "ne" | "contains" | "matches"
interface Assert { path: string; op: AssertOp; value: unknown }

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  let p = path
  if (p.startsWith("$.")) p = p.slice(2)
  const segs = p.split(".")
  let cur: any = obj
  for (const s of segs) {
    if (cur == null) return undefined
    cur = cur[s]
  }
  return cur
}

function evalAssert(v: unknown, op: AssertOp, expected: unknown): boolean {
  switch (op) {
    case "eq": return v === expected
    case "ne": return v !== expected
    case "ge": return typeof v === "number" && typeof expected === "number" && v >= expected
    case "le": return typeof v === "number" && typeof expected === "number" && v <= expected
    case "contains": return typeof v === "string" && typeof expected === "string" && v.includes(expected)
    case "matches": return typeof v === "string" && new RegExp(expected as string).test(v)
    default: return false
  }
}

export const gateNode: NodeImpl = {
  kind: "gate",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { asserts?: Assert[]; predicate?: (v: unknown) => boolean }
      const startMs = yield* Clock.currentTimeMillis
      let asserts = cfg.asserts
      if (!asserts && cfg.predicate) {
        const inboundVals = Object.values(inp.inbound)
        const val = inboundVals[0]
        const ok = cfg.predicate(val)
        const endMs = yield* Clock.currentTimeMillis
        if (ok) return { verdict: "PASS" as const, evidence: { pattern: "gate.assert", state: "PASS", anchor: `${inp.node.id}:1` }, timing: { startMs, endMs } } as NodeResult
        // Law 5: the [JESL ...] vocabulary is the 8 frozen tokens — a predicate FAIL is a verdict, not a refusal; the delta lives in the evidence anchor.
        return { verdict: "FAIL" as const, evidence: { pattern: "gate.assert", state: "FAIL", anchor: `${inp.node.id}:predicate expected=true actual=false` }, timing: { startMs, endMs } } as NodeResult
      }
      if (!asserts || asserts.length === 0) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "PASS" as const, evidence: { pattern: "gate.assert", state: "PASS", anchor: `${inp.node.id}:0` }, timing: { startMs, endMs } } as NodeResult
      }
      for (const a of asserts) {
        const v = getByPath(inp.inbound as Record<string, unknown>, a.path)
        if (v === undefined) {
          return yield* Effect.fail(new JeslChannelUnset({ code: "[JESL CHANNEL-UNSET]", node: inp.node.id, field: a.path, expected: "a value written by an inbound edge", actual: "undefined", remedy: "check edge.via names" } as any))
        }
        if (!evalAssert(v, a.op, a.value)) {
          const endMs = yield* Clock.currentTimeMillis
          // Law 5: no invented 9th token — the assert delta is carried in the evidence anchor (the 8 tokens are refusals, not assertion failures).
          return { verdict: "FAIL" as const, evidence: { pattern: "gate.assert", state: "FAIL", anchor: `${inp.node.id}:${a.path} expected=${String(a.value)} actual=${String(v)}` }, timing: { startMs, endMs } } as NodeResult
        }
      }
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: "gate.assert", state: "PASS", anchor: `${inp.node.id}:${asserts.length}` }, timing: { startMs, endMs }, outputs: { ["gate." + inp.node.id]: true } } as NodeResult
    })
}
