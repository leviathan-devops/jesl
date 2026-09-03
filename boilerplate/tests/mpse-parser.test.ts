import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import { parseMathExpr, MATH_EXPR_KINDS, MPSE_DEPTH_LIMIT, type MathExpr } from "../mpse/parser"
import { compileRule, compileDoc } from "../mpse/rule-cards"
import { compileOracle, dischargeRule } from "../mpse/oracle"
import type { WorkflowDoc } from "../core/schema"

function evalExpr(expr: MathExpr, env: Record<string, unknown> = {}): unknown {
  switch (expr._tag) {
    case "literal": return expr.value
    case "var": return env[expr.name]
    case "add": return (evalExpr(expr.left, env) as number) + (evalExpr(expr.right, env) as number)
    case "sub": return (evalExpr(expr.left, env) as number) - (evalExpr(expr.right, env) as number)
    case "mul": return (evalExpr(expr.left, env) as number) * (evalExpr(expr.right, env) as number)
    case "div": return (evalExpr(expr.left, env) as number) / (evalExpr(expr.right, env) as number)
    case "mod": return (evalExpr(expr.left, env) as number) % (evalExpr(expr.right, env) as number)
    case "eq": return evalExpr(expr.left, env) === evalExpr(expr.right, env)
    case "neq": return evalExpr(expr.left, env) !== evalExpr(expr.right, env)
    case "lt": return (evalExpr(expr.left, env) as number) < (evalExpr(expr.right, env) as number)
    case "lte": return (evalExpr(expr.left, env) as number) <= (evalExpr(expr.right, env) as number)
    case "gt": return (evalExpr(expr.left, env) as number) > (evalExpr(expr.right, env) as number)
    case "gte": return (evalExpr(expr.left, env) as number) >= (evalExpr(expr.right, env) as number)
    case "and": return (evalExpr(expr.left, env) as boolean) && (evalExpr(expr.right, env) as boolean)
    case "or": return (evalExpr(expr.left, env) as boolean) || (evalExpr(expr.right, env) as boolean)
    case "not": return !evalExpr(expr.expr, env)
    case "neg": return -(evalExpr(expr.expr, env) as number)
    case "if": return evalExpr(expr.condition, env) ? evalExpr(expr.thenBranch, env) : evalExpr(expr.elseBranch, env)
    case "call": {
      const fn = env[expr.name] as (...a: unknown[]) => unknown
      if (typeof fn === "function") return fn(...expr.args.map(a => evalExpr(a, env)))
      if (expr.name === "max") return Math.max(...expr.args.map(a => evalExpr(a, env) as number))
      if (expr.name === "min") return Math.min(...expr.args.map(a => evalExpr(a, env) as number))
      return 42
    }
    case "list": return expr.elements.map(e => evalExpr(e, env))
    case "index": {
      const tgt = evalExpr(expr.target, env) as unknown[]
      const idx = evalExpr(expr.index, env) as number
      return tgt[idx]
    }
    case "forall": return true
    case "exists": return true
    case "temporal": return evalExpr(expr.expr, env)
    default: return 42
  }
}

describe("mpse parser + rule-cards — F18 bridge", () => {
  it("parses literals (number, boolean, string)", async () => {
    const n = await Effect.runPromise(parseMathExpr("42"))
    expect(n._tag).toBe("literal"); expect((n as any).value).toBe(42)
    const b = await Effect.runPromise(parseMathExpr("true"))
    expect(b._tag).toBe("literal"); expect((b as any).value).toBe(true)
    const s = await Effect.runPromise(parseMathExpr('"hello"'))
    expect(s._tag).toBe("literal"); expect((s as any).value).toBe("hello")
  })

  it("parses arithmetic + - * / %", async () => {
    const add = await Effect.runPromise(parseMathExpr("1 + 2")) as any
    expect(add._tag).toBe("add")
    const sub = await Effect.runPromise(parseMathExpr("5 - 3")) as any
    expect(sub._tag).toBe("sub")
    const mul = await Effect.runPromise(parseMathExpr("3 * 4")) as any
    expect(mul._tag).toBe("mul")
    const div = await Effect.runPromise(parseMathExpr("10 / 2")) as any
    expect(div._tag).toBe("div")
    const mod = await Effect.runPromise(parseMathExpr("10 % 3")) as any
    expect(mod._tag).toBe("mod")
  })

  it("parses comparisons = != < <= > >=", async () => {
    const eq = await Effect.runPromise(parseMathExpr("a = b")) as any
    expect(eq._tag).toBe("eq")
    const neq = await Effect.runPromise(parseMathExpr("a != b")) as any
    expect(neq._tag).toBe("neq")
    const lt = await Effect.runPromise(parseMathExpr("a < b")) as any
    expect(lt._tag).toBe("lt")
    const lte = await Effect.runPromise(parseMathExpr("a <= b")) as any
    expect(lte._tag).toBe("lte")
    const gt = await Effect.runPromise(parseMathExpr("a > b")) as any
    expect(gt._tag).toBe("gt")
    const gte = await Effect.runPromise(parseMathExpr("a >= b")) as any
    expect(gte._tag).toBe("gte")
  })

  it("parses logical and/or/not", async () => {
    const and = await Effect.runPromise(parseMathExpr("a and b")) as any
    expect(and._tag).toBe("and")
    const or = await Effect.runPromise(parseMathExpr("a or b")) as any
    expect(or._tag).toBe("or")
    const not = await Effect.runPromise(parseMathExpr("not a")) as any
    expect(not._tag).toBe("not")
  })

  it("parses if-then-else", async () => {
    const expr = await Effect.runPromise(parseMathExpr("if x > 0 then 1 else 0")) as any
    expect(expr._tag).toBe("if")
    expect(expr.condition._tag).toBe("gt")
    expect(evalExpr(expr, { x: 5 })).toBe(1)
    expect(evalExpr(expr, { x: -1 })).toBe(0)
  })

  it("parses lists, calls, index", async () => {
    const list = await Effect.runPromise(parseMathExpr("[1, 2, 3]")) as any
    expect(list._tag).toBe("list"); expect(list.elements.length).toBe(3)
    const call = await Effect.runPromise(parseMathExpr("max(1, 5, 3)")) as any
    expect(call._tag).toBe("call"); expect(call.name).toBe("max")
    const idx = await Effect.runPromise(parseMathExpr("xs[0]")) as any
    expect(idx._tag).toBe("index")
    expect(evalExpr(idx, { xs: [10, 20] })).toBe(10)
  })

  it("parses variables and fenced math blocks", async () => {
    const v = await Effect.runPromise(parseMathExpr("myVar")) as any
    expect(v._tag).toBe("var"); expect(v.name).toBe("myVar")
    const fenced = await Effect.runPromise(parseMathExpr("```math\n1 + 2\n```")) as any
    expect(fenced._tag).toBe("add")
  })

  it("depth overflow 300-deep nesting → DEPTH_EXCEEDED MpseError", async () => {
    let deep = "1"
    for (let i = 0; i < 300; i++) deep = `(${deep} + 1)`
    const res = await Effect.runPromise(Effect.either(parseMathExpr(deep)))
    expect(res._tag).toBe("Left")
    const err: any = (res as any).left
    expect(err.reason).toContain("DEPTH_EXCEEDED")
    expect(err.position).toBeGreaterThanOrEqual(0)
    expect(err.source).toBe(deep)
  })

  it("malformed expression → position-carrying MpseError", async () => {
    const res = await Effect.runPromise(Effect.either(parseMathExpr("1 + * 2")))
    expect(res._tag).toBe("Left")
    const err: any = (res as any).left
    expect(err.position).toBeGreaterThanOrEqual(0)
    expect(err.source).toBe("1 + * 2")
    expect(err.reason.length).toBeGreaterThan(0)
  })

  it("compileRule without expected → [JESL ORACLE-MISSING]", async () => {
    const res = await Effect.runPromise(Effect.either(compileRule({ id: "n1", math: "1 + 1" })))
    expect(res._tag).toBe("Left")
    const err: any = (res as any).left
    expect(err.code).toBe("[JESL ORACLE-MISSING]")
    expect(String(err.code)).toContain("[JESL ORACLE-MISSING]")
  })

  it("float without epsilon → refused", async () => {
    const res = await Effect.runPromise(Effect.either(compileRule({ id: "r1", math: "3.14", expected: 3.14 })))
    expect(res._tag).toBe("Left")
    const err: any = (res as any).left
    expect(err.reason).toMatch(/epsilon/i)
  })

  it("float WITH epsilon → accepted", async () => {
    const res = await Effect.runPromise(compileRule({ id: "r1", math: "3.14", expected: 3.14, tolerance: 0.01 }))
    expect(res.id).toBe("r1")
    expect(res.expected).toBe(3.14)
    expect(res.tolerance).toBe(0.01)
    expect(res.expr._tag).toBe("literal")
  })

  it("compileDoc on mech-gate-like doc → per-node cards", async () => {
    const doc: WorkflowDoc = {
      $schema: "trident-workflow-v1",
      meta: { name: "mech-gate-like", tier: 1 },
      nodes: [
        { id: "n1", type: "gate", config: { math: "a + b", expected: 5 } as any },
        { id: "n2", type: "gate", config: { math: "x > 0", expected: true } as any },
        { id: "n3", type: "gate" } as any
      ],
      edges: []
    }
    const m = await Effect.runPromise(compileDoc(doc))
    expect(m.size).toBe(2)
    expect(m.get("n1")!.length).toBe(1)
    expect(m.get("n1")![0]!.expr._tag).toBe("add")
    expect(m.get("n2")![0]!.expr._tag).toBe("gt")
    expect(m.has("n3")).toBe(false)
  })

  it("round-trip: parse → eval → expected value", async () => {
    const card = await Effect.runPromise(compileRule({ id: "rt", math: "2 * (3 + 4)", expected: 14 }))
    const actual = evalExpr(card.expr)
    expect(actual).toBe(14)
    expect(actual).toBe(card.expected)
    const card2 = await Effect.runPromise(compileRule({ id: "rt2", math: "if score > 0.5 then 1 else 0", expected: 1 }))
    const actual2 = evalExpr(card2.expr, { score: 0.9 })
    expect(actual2).toBe(1)
  })

  it("NaN handling → CONTRADICTED per MPSE law", async () => {
    const card = await Effect.runPromise(compileRule({ id: "nan1", math: "1 + 1", expected: NaN }))
    const reg = compileOracle([card as any], "spec")
    const result = reg.discharge(card.id, NaN)
    expect(result.status).toBe("CONTRADICTED")
    const result2 = dischargeRule(reg, card.id, NaN)
    expect(result2.status).toBe("CONTRADICTED")
  })

  it("MathExpr kind inventory is 24 and all parser categories covered", () => {
    expect(MATH_EXPR_KINDS.length).toBe(24)
    const kinds = new Set(MATH_EXPR_KINDS)
    expect(kinds.has("literal")).toBe(true)
    expect(kinds.has("var")).toBe(true)
    expect(kinds.has("add")).toBe(true)
    expect(kinds.has("if")).toBe(true)
    expect(kinds.has("list")).toBe(true)
    expect(kinds.has("call")).toBe(true)
    expect(kinds.has("index")).toBe(true)
    expect(kinds.has("temporal")).toBe(true)
  })

  it("integer equality default discharge via oracle", async () => {
    const card = await Effect.runPromise(compileRule({ id: "int1", math: "2 + 3", expected: 5 }))
    const reg = compileOracle([card as any], "spec")
    expect(reg.discharge(card.id, 5).status).toBe("PASS")
    expect(reg.discharge(card.id, 6).status).toBe("FAIL")
  })

  it("float with epsilon discharge", async () => {
    const card = await Effect.runPromise(compileRule({ id: "flt", math: "x / 3", expected: 0.333, tolerance: 0.01 }))
    const reg = compileOracle([card as any], "spec")
    expect(reg.discharge(card.id, 0.334).status).toBe("PASS")
    expect(reg.discharge(card.id, 0.5).status).toBe("FAIL")
  })
})
