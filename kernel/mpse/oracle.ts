export interface RuleCard {
  readonly id: string
  readonly expr: unknown
  readonly expected: unknown
  readonly tolerance?: number
  readonly severity?: string
  readonly quote?: string
  readonly anchor?: { source: string; line: number; quote: string }
  readonly kind?: string
  readonly math?: string
  readonly oracleKey?: string
  readonly bornOff?: boolean
}

export interface MpseCard extends RuleCard {}

export interface OracleRule {
  readonly cardId: string
  readonly oracleKey: string
  readonly expected: unknown
  readonly expr: unknown
  readonly tolerance?: number
  readonly severity?: string
  readonly provenance: { source: string; line: number; quote: string }
  readonly computed?: unknown
}

export type DischargeStatus = "PASS" | "FAIL" | "CONTRADICTED" | "UNVERIFIABLE" | "EXCLUDED"

export interface DischargeResult {
  readonly status: DischargeStatus
  readonly ruleId: string
  readonly expected?: unknown
  readonly actual: unknown
  readonly reason?: string
}

export interface OracleRegistry {
  readonly rules: ReadonlyMap<string, OracleRule>
  readonly appendOnly: true
  get(ruleId: string): OracleRule | undefined
  has(ruleId: string): boolean
  size(): number
  discharge(ruleId: string, actual: unknown): DischargeResult
}

export class OracleConflictError extends Error {
  readonly code = "ORACLE_CONFLICT"
  constructor(public readonly ruleId: string) {
    super(`ORACLE_CONFLICT: oracle already registered for ${ruleId} — first registration wins, re-register is loud`)
    this.name = "OracleConflictError"
  }
}

function computeExprLocal(expr: unknown): unknown {
  if (!expr || typeof expr !== "object") return expr
  const e = expr as Record<string, unknown>
  if (e["_tag"] === "literal") return e["value"]
  if (e["_tag"] === "add" && e["left"] && e["right"]) {
    const l = computeExprLocal(e["left"]) as number
    const r = computeExprLocal(e["right"]) as number
    if (typeof l === "number" && typeof r === "number") return l + r
  }
  if (e["_tag"] === "mul" && e["left"] && e["right"]) {
    const l = computeExprLocal(e["left"]) as number
    const r = computeExprLocal(e["right"]) as number
    if (typeof l === "number" && typeof r === "number") return l * r
  }
  if (e["_tag"] === "sub" && e["left"] && e["right"]) {
    const l = computeExprLocal(e["left"]) as number
    const r = computeExprLocal(e["right"]) as number
    if (typeof l === "number" && typeof r === "number") return l - r
  }
  return undefined
}

function toOracleRule(card: RuleCard, docName: string): OracleRule {
  const cardRec = card as unknown as Record<string, unknown>
  const oracleKey = cardRec["oracleKey"] as string | undefined ?? cardRec["oracle"] as string | undefined ?? card.id
  const computed = card.expr !== undefined && card.expr !== null ? (computeExprLocal(card.expr) ?? card.expected) : card.expected
  const provenance = card.anchor ?? { source: docName || "spec", line: 1, quote: String(cardRec["quote"] ?? cardRec["math"] ?? "").slice(0, 80) }
  return {
    cardId: card.id,
    oracleKey,
    expected: card.expected,
    expr: card.expr,
    tolerance: card.tolerance,
    severity: card.severity,
    provenance,
    computed
  }
}

function dischargeInternal(rules: ReadonlyMap<string, OracleRule>, ruleId: string, actual: unknown): DischargeResult {
  const rule = rules.get(ruleId)
  if (!rule) {
    return { status: "UNVERIFIABLE", ruleId, actual, reason: `no oracle registered for ${ruleId}` }
  }
  if (typeof actual === "number" && Number.isNaN(actual)) {
    return { status: "CONTRADICTED", ruleId, expected: rule.expected, actual, reason: "NaN actual — non-finite observed" }
  }
  if (typeof actual === "number" && !Number.isFinite(actual)) {
    return { status: "CONTRADICTED", ruleId, expected: rule.expected, actual, reason: "non-finite actual" }
  }
  const expected = rule.expected
  if (typeof expected === "number" && typeof actual === "number") {
    const expIsInt = Number.isInteger(expected)
    const actIsInt = Number.isInteger(actual)
    if (expIsInt && actIsInt) {
      return actual === expected
        ? { status: "PASS", ruleId, expected, actual }
        : { status: "FAIL", ruleId, expected, actual, reason: "integer equality mismatch — zero false positives" }
    }
    const eps = rule.tolerance
    if (eps === undefined) {
      return actual === expected
        ? { status: "PASS", ruleId, expected, actual }
        : { status: "FAIL", ruleId, expected, actual, reason: "float oracle without epsilon — strict equality required" }
    }
    const diff = Math.abs(actual - expected)
    return diff <= eps
      ? { status: "PASS", ruleId, expected, actual }
      : { status: "FAIL", ruleId, expected, actual, reason: `float outside epsilon ${eps} diff ${diff}` }
  }
  if (typeof expected === "boolean" && typeof actual === "boolean") {
    return actual === expected
      ? { status: "PASS", ruleId, expected, actual }
      : { status: "FAIL", ruleId, expected, actual, reason: "boolean mismatch" }
  }
  if (Array.isArray(expected) && Array.isArray(actual)) {
    const a = [...(expected as unknown[])].sort()
    const b = [...(actual as unknown[])].sort()
    const equal = a.length === b.length && a.every((v, i) => v === b[i])
    return equal
      ? { status: "PASS", ruleId, expected, actual }
      : { status: "FAIL", ruleId, expected, actual, reason: "set/array mismatch" }
  }
  return expected === actual
    ? { status: "PASS", ruleId, expected, actual }
    : { status: "FAIL", ruleId, expected, actual, reason: "value mismatch" }
}

export function compileOracle(cards: ReadonlyArray<RuleCard>, docNameOrSecond?: string): OracleRegistry {
  const docName = typeof docNameOrSecond === "string" ? docNameOrSecond : "spec"
  const map = new Map<string, OracleRule>()
  for (const card of cards) {
    if (!card.id) throw new Error(`ORACLE_CONFLICT: card without id cannot be registered`)
    const rule = toOracleRule(card, docName)
    const key = rule.oracleKey
    const existing = map.get(key)
    if (existing !== undefined) {
      const sameExpected = Object.is(existing.expected, rule.expected)
      const sameTolerance = existing.tolerance === rule.tolerance
      const sameExpr = JSON.stringify(existing.expr) === JSON.stringify(rule.expr)
      if (!sameExpected || !sameTolerance || !sameExpr) {
        throw new OracleConflictError(key)
      }
      throw new OracleConflictError(key)
    }
    const altExisting = map.get(card.id)
    if (altExisting !== undefined && key !== card.id) {
      throw new OracleConflictError(card.id)
    }
    map.set(key, rule)
    if (key !== card.id) {
      if (map.has(card.id) && map.get(card.id) !== rule) throw new OracleConflictError(card.id)
    }
  }
  const rules: ReadonlyMap<string, OracleRule> = map
  const registry: OracleRegistry = {
    rules,
    appendOnly: true as const,
    get(ruleId: string) { return rules.get(ruleId) },
    has(ruleId: string) { return rules.has(ruleId) },
    size() { return rules.size },
    discharge(ruleId: string, actual: unknown): DischargeResult {
      return dischargeInternal(rules, ruleId, actual)
    }
  }
  return registry
}

export function discharge(registry: OracleRegistry, ruleId: string, actual: unknown): DischargeResult
export function discharge(ruleId: string, actual: unknown, registry: OracleRegistry): DischargeResult
export function discharge(a: unknown, b: unknown, c?: unknown): DischargeResult {
  if (c !== undefined && typeof a === "string") {
    return dischargeInternal((c as OracleRegistry).rules, a as string, b)
  }
  if (a !== null && typeof a === "object" && (a as OracleRegistry).rules !== undefined) {
    return dischargeInternal((a as OracleRegistry).rules, b as string, c)
  }
  if (typeof a === "string" && c !== undefined) {
    return dischargeInternal((c as OracleRegistry).rules, a, b)
  }
  throw new Error("discharge: invalid arguments — use discharge(registry, ruleId, actual) or discharge(ruleId, actual, registry)")
}

export function dischargeRule(registry: OracleRegistry, ruleId: string, actual: unknown): DischargeResult {
  return dischargeInternal(registry.rules, ruleId, actual)
}
