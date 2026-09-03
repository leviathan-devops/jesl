import { Effect, Schema } from "effect"
import { JeslOracleMissing } from "../core/errors"
import { MpseError, parseMathExpr, type MathExpr } from "./parser"
import type { WorkflowDoc } from "../core/schema"

export interface RuleCard {
  readonly id: string
  readonly expr: MathExpr
  readonly expected: unknown
  readonly tolerance?: number
  readonly severity?: string
  readonly provenance?: { source: string; line: number; quote: string }
  readonly math: string
}

export interface RuleInput {
  readonly id: string
  readonly math: string
  readonly expected?: unknown
  readonly tolerance?: number
  readonly severity?: string
  readonly source?: string
  readonly line?: number
  readonly quote?: string
}

export const compileRule = (input: RuleInput): Effect.Effect<RuleCard, MpseError | JeslOracleMissing> =>
  Effect.gen(function* () {
    if (input.expected === undefined) {
      return yield* Effect.fail(new JeslOracleMissing({
        code: "[JESL ORACLE-MISSING]",
        node: input.id,
        field: "expected",
        expected: "oracle value (expected)",
        actual: "absent",
        remedy: "provide the oracle expected value — a rule card without its oracle is [JESL ORACLE-MISSING]"
      }))
    }
    if (typeof input.expected === "number" && Number.isNaN(input.expected)) {
      const expr = yield* parseMathExpr(input.math)
      return { id: input.id, expr, expected: input.expected, tolerance: input.tolerance, severity: input.severity ?? "CONTRADICTED", provenance: { source: input.source ?? "spec", line: input.line ?? 1, quote: (input.quote ?? input.math).slice(0, 80) }, math: input.math } as RuleCard
    }
    if (typeof input.expected === "number" && !Number.isInteger(input.expected) && input.tolerance === undefined) {
      return yield* Effect.fail(new MpseError({
        source: input.math,
        position: 0,
        reason: "float oracle without epsilon — floats require explicit tolerance",
        code: "FLOAT_EPSILON_MISSING"
      }))
    }
    if (typeof input.expected === "number" && !Number.isInteger(input.expected) && input.tolerance !== undefined) {
      if (typeof input.tolerance !== "number" || input.tolerance <= 0 || Number.isNaN(input.tolerance)) {
        return yield* Effect.fail(new MpseError({
          source: input.math,
          position: 0,
          reason: "float tolerance must be positive finite number",
          code: "MPSE_PARSE_ERROR"
        }))
      }
    }
    const expr = yield* parseMathExpr(input.math)
    return {
      id: input.id,
      expr,
      expected: input.expected,
      tolerance: input.tolerance,
      severity: input.severity,
      provenance: { source: input.source ?? "spec", line: input.line ?? 1, quote: (input.quote ?? input.math).slice(0, 80) },
      math: input.math
    } as RuleCard
  })

export const compileDoc = (doc: WorkflowDoc): Effect.Effect<ReadonlyMap<string, ReadonlyArray<RuleCard>>, MpseError | JeslOracleMissing> =>
  Effect.gen(function* () {
    const out = new Map<string, RuleCard[]>()
    for (const node of doc.nodes) {
      const cfg = (node.config ?? {}) as Record<string, unknown>
      const mathRaw = (cfg["math"] as string | undefined) ?? (cfg["expr"] as string | undefined) ?? (cfg["expression"] as string | undefined)
      if (mathRaw === undefined) continue
      const expected = (cfg["expected"] as unknown) ?? (cfg["oracle"] as unknown) ?? (cfg["value"] as unknown)
      const hasExpected = "expected" in cfg || "oracle" in cfg || "value" in cfg
      const tolerance = cfg["tolerance"] as number | undefined ?? cfg["epsilon"] as number | undefined
      const severity = cfg["severity"] as string | undefined
      const quote = cfg["quote"] as string | undefined
      const source = (cfg["source"] as string | undefined) ?? doc.meta.name
      const line = cfg["line"] as number | undefined
      const input: RuleInput = {
        id: node.id,
        math: String(mathRaw),
        expected: hasExpected ? expected : undefined,
        tolerance,
        severity,
        source,
        line,
        quote
      }
      if (!hasExpected && expected === undefined) {
        return yield* Effect.fail(new JeslOracleMissing({
          code: "[JESL ORACLE-MISSING]",
          node: node.id,
          field: "expected",
          expected: "oracle value",
          actual: "absent",
          remedy: "compile oracle rows from the MPSE spec — a rule card without its oracle is [JESL ORACLE-MISSING]"
        }))
      }
      const card = yield* compileRule(input)
      const arr = out.get(node.id) ?? []
      arr.push(card)
      out.set(node.id, arr)
    }
    return out as ReadonlyMap<string, ReadonlyArray<RuleCard>>
  })
