import { Effect, Schema } from "effect"

export const MPSE_DEPTH_LIMIT = 256
export const MPSE_DOMAIN_LIMIT = 10000

export type MathExpr =
  | { readonly _tag: "literal"; readonly value: number | string | boolean }
  | { readonly _tag: "var"; readonly name: string }
  | { readonly _tag: "add"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "sub"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "mul"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "div"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "mod"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "eq"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "neq"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "lt"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "lte"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "gt"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "gte"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "and"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "or"; readonly left: MathExpr; readonly right: MathExpr }
  | { readonly _tag: "not"; readonly expr: MathExpr }
  | { readonly _tag: "neg"; readonly expr: MathExpr }
  | { readonly _tag: "if"; readonly condition: MathExpr; readonly thenBranch: MathExpr; readonly elseBranch: MathExpr }
  | { readonly _tag: "call"; readonly name: string; readonly args: ReadonlyArray<MathExpr> }
  | { readonly _tag: "list"; readonly elements: ReadonlyArray<MathExpr> }
  | { readonly _tag: "index"; readonly target: MathExpr; readonly index: MathExpr }
  | { readonly _tag: "forall"; readonly variable: string; readonly domain: MathExpr; readonly body: MathExpr }
  | { readonly _tag: "exists"; readonly variable: string; readonly domain: MathExpr; readonly body: MathExpr }
  | { readonly _tag: "temporal"; readonly op: "prev" | "eventually" | "globally" | "until"; readonly expr: MathExpr; readonly untilRight?: MathExpr }

export const MATH_EXPR_KINDS = [
  "literal", "var", "add", "sub", "mul", "div", "mod",
  "eq", "neq", "lt", "lte", "gt", "gte",
  "and", "or", "not", "neg",
  "if", "call", "list", "index",
  "forall", "exists", "temporal"
] as const

export class MpseError extends Schema.TaggedError<MpseError>()("MpseError", {
  source: Schema.String,
  position: Schema.Number,
  reason: Schema.String,
  code: Schema.String
}) {}

interface Token {
  readonly type: string
  readonly value: string
  readonly pos: number
}

function extractFencedMath(source: string): string {
  const re = /```math\s*\n([\s\S]*?)\n```/g
  const blocks: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    blocks.push(m[1]!.trim())
  }
  if (blocks.length > 0) return blocks.join("\n")
  return source
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const len = source.length
  while (i < len) {
    const ch = source[i]!
    if (/\s/.test(ch)) { i++; continue }
    const start = i
    if (ch === '"' || ch === "'") {
      const quote = ch
      i++
      let val = ""
      while (i < len && source[i] !== quote) {
        if (source[i] === "\\" && i + 1 < len) { val += source[i + 1]; i += 2 } else { val += source[i]; i++ }
      }
      if (i < len && source[i] === quote) { i++; tokens.push({ type: "string", value: val, pos: start }) } else { tokens.push({ type: "string", value: val, pos: start }) }
      continue
    }
    if (/[0-9]/.test(ch) || (ch === "." && i + 1 < len && /[0-9]/.test(source[i + 1]!))) {
      let num = ""
      while (i < len && /[0-9.]/.test(source[i]!)) { num += source[i]; i++ }
      if (num === ".") { tokens.push({ type: "op", value: ".", pos: start }); continue }
      tokens.push({ type: "number", value: num, pos: start })
      continue
    }
    if (/[A-Za-z_]/.test(ch)) {
      let id = ""
      while (i < len && /[A-Za-z0-9_]/.test(source[i]!)) { id += source[i]; i++ }
      if (id === "true" || id === "false") tokens.push({ type: "boolean", value: id, pos: start })
      else if (id === "and" || id === "or" || id === "not" || id === "if" || id === "then" || id === "else" || id === "forall" || id === "exists" || id === "prev" || id === "eventually" || id === "globally" || id === "until") tokens.push({ type: "keyword", value: id, pos: start })
      else tokens.push({ type: "ident", value: id, pos: start })
      continue
    }
    if (ch === "<" || ch === ">" || ch === "=" || ch === "!") {
      if (i + 1 < len && source[i + 1] === "=") { tokens.push({ type: "op", value: ch + "=", pos: start }); i += 2; continue }
      if (ch === "!" && i + 1 < len && source[i + 1] === "=") { tokens.push({ type: "op", value: "!=", pos: start }); i += 2; continue }
      tokens.push({ type: "op", value: ch, pos: start }); i++; continue
    }
    if ("+-*/%(),[]".includes(ch)) {
      tokens.push({ type: "op", value: ch, pos: start }); i++; continue
    }
    if (ch === "&" && i + 1 < len && source[i + 1] === "&") { tokens.push({ type: "keyword", value: "and", pos: start }); i += 2; continue }
    if (ch === "|" && i + 1 < len && source[i + 1] === "|") { tokens.push({ type: "keyword", value: "or", pos: start }); i += 2; continue }
    tokens.push({ type: "op", value: ch, pos: start }); i++
  }
  return tokens
}

class Parser {
  constructor(readonly tokens: Token[], readonly source: string, readonly depth: number = 0) {}
  pos = 0
  peek(): Token | undefined { return this.tokens[this.pos] }
  consume(): Token | undefined { return this.tokens[this.pos++] }
  expectValue(value: string): Token {
    const t = this.peek()
    if (!t || t.value !== value) throw new MpseError({ source: this.source, position: t?.pos ?? this.source.length, reason: `expected '${value}' but got '${t?.value ?? "EOF"}'`, code: "MPSE_PARSE_ERROR" })
    return this.consume()!
  }
  checkDepth(nextDepth: number, pos: number): void {
    if (nextDepth > MPSE_DEPTH_LIMIT) throw new MpseError({ source: this.source, position: pos, reason: `DEPTH_EXCEEDED depth ${nextDepth} > ${MPSE_DEPTH_LIMIT}`, code: "DEPTH_EXCEEDED" })
  }
  parseExpr(depth: number): MathExpr {
    this.checkDepth(depth, this.peek()?.pos ?? 0)
    return this.parseOr(depth)
  }
  parseOr(depth: number): MathExpr {
    let left = this.parseAnd(depth + 1)
    while (this.peek()?.value === "or") {
      this.consume()
      const right = this.parseAnd(depth + 1)
      left = { _tag: "or", left, right }
    }
    return left
  }
  parseAnd(depth: number): MathExpr {
    let left = this.parseComparison(depth + 1)
    while (this.peek()?.value === "and") {
      this.consume()
      const right = this.parseComparison(depth + 1)
      left = { _tag: "and", left, right }
    }
    return left
  }
  parseComparison(depth: number): MathExpr {
    let left = this.parseAdd(depth + 1)
    const op = this.peek()?.value
    if (op === "=" || op === "==" || op === "!=" || op === "<" || op === "<=" || op === ">" || op === ">=") {
      this.consume()
      const right = this.parseAdd(depth + 1)
      const tag = op === "=" || op === "==" ? "eq" : op === "!=" ? "neq" : op === "<" ? "lt" : op === "<=" ? "lte" : op === ">" ? "gt" : "gte"
      return { _tag: tag as any, left, right }
    }
    return left
  }
  parseAdd(depth: number): MathExpr {
    let left = this.parseMul(depth + 1)
    while (this.peek()?.value === "+" || this.peek()?.value === "-") {
      const op = this.consume()!.value
      const right = this.parseMul(depth + 1)
      left = op === "+" ? { _tag: "add", left, right } : { _tag: "sub", left, right }
    }
    return left
  }
  parseMul(depth: number): MathExpr {
    let left = this.parseUnary(depth + 1)
    while (this.peek()?.value === "*" || this.peek()?.value === "/" || this.peek()?.value === "%") {
      const op = this.consume()!.value
      const right = this.parseUnary(depth + 1)
      left = op === "*" ? { _tag: "mul", left, right } : op === "/" ? { _tag: "div", left, right } : { _tag: "mod", left, right }
    }
    return left
  }
  parseUnary(depth: number): MathExpr {
    const p = this.peek()
    if (p?.value === "not" || p?.value === "!") { this.consume(); const expr = this.parseUnary(depth + 1); return { _tag: "not", expr } }
    if (p?.value === "-") { this.consume(); const expr = this.parseUnary(depth + 1); return { _tag: "neg", expr } }
    if (p?.value === "prev" || p?.value === "eventually" || p?.value === "globally") {
      const op = this.consume()!.value as "prev" | "eventually" | "globally"
      this.checkDepth(depth + 1, p!.pos)
      const inner = this.parseUnary(depth + 1)
      return { _tag: "temporal", op, expr: inner }
    }
    if (p?.value === "until") {
      const op = this.consume()!.value as "until"
      this.checkDepth(depth + 1, p!.pos)
      const left = this.parseUnary(depth + 1)
      return { _tag: "temporal", op, expr: left }
    }
    return this.parsePostfix(depth)
  }
  parsePostfix(depth: number): MathExpr {
    let expr = this.parsePrimary(depth + 1)
    while (this.peek()?.value === "[") {
      this.consume()
      const idx = this.parseExpr(depth + 1)
      this.expectValue("]")
      expr = { _tag: "index", target: expr, index: idx }
    }
    return expr
  }
  parsePrimary(depth: number): MathExpr {
    const t = this.peek()
    if (!t) throw new MpseError({ source: this.source, position: this.source.length, reason: "unexpected end of input", code: "MPSE_PARSE_ERROR" })
    if (t.type === "number") {
      this.consume()
      const n = Number(t.value)
      if (Number.isNaN(n)) throw new MpseError({ source: this.source, position: t.pos, reason: `invalid number '${t.value}'`, code: "MPSE_PARSE_ERROR" })
      return { _tag: "literal", value: n }
    }
    if (t.type === "boolean") { this.consume(); return { _tag: "literal", value: t.value === "true" } }
    if (t.type === "string") { this.consume(); return { _tag: "literal", value: t.value } }
    if (t.value === "if") {
      this.consume()
      const condition = this.parseExpr(depth + 1)
      const thenTok = this.peek()
      if (thenTok?.value !== "then") throw new MpseError({ source: this.source, position: thenTok?.pos ?? this.source.length, reason: "expected 'then' after if condition", code: "MPSE_PARSE_ERROR" })
      this.consume()
      const thenBranch = this.parseExpr(depth + 1)
      const elseTok = this.peek()
      if (elseTok?.value !== "else") throw new MpseError({ source: this.source, position: elseTok?.pos ?? this.source.length, reason: "expected 'else' after then branch", code: "MPSE_PARSE_ERROR" })
      this.consume()
      const elseBranch = this.parseExpr(depth + 1)
      return { _tag: "if", condition, thenBranch, elseBranch }
    }
    if (t.value === "forall" || t.value === "exists") {
      const quant = this.consume()!.value as "forall" | "exists"
      const vTok = this.peek()
      if (!vTok || vTok.type !== "ident") throw new MpseError({ source: this.source, position: vTok?.pos ?? this.source.length, reason: `expected variable after ${quant}`, code: "MPSE_PARSE_ERROR" })
      const variable = this.consume()!.value
      if (this.peek()?.value !== "in") throw new MpseError({ source: this.source, position: this.peek()?.pos ?? this.source.length, reason: "expected 'in' after quantifier variable", code: "MPSE_PARSE_ERROR" })
      this.consume()
      const domain = this.parseExpr(depth + 1)
      if (this.peek()?.value !== ":") {
        const body = this.parseExpr(depth + 1)
        return quant === "forall" ? { _tag: "forall", variable, domain, body } : { _tag: "exists", variable, domain, body }
      }
      this.consume()
      const body = this.parseExpr(depth + 1)
      return quant === "forall" ? { _tag: "forall", variable, domain, body } : { _tag: "exists", variable, domain, body }
    }
    if (t.type === "ident") {
      const name = this.consume()!.value
      if (this.peek()?.value === "(") {
        this.consume()
        const args: MathExpr[] = []
        if (this.peek()?.value !== ")") {
          while (true) {
            args.push(this.parseExpr(depth + 1))
            if (this.peek()?.value === ",") { this.consume(); continue }
            break
          }
        }
        this.expectValue(")")
        return { _tag: "call", name, args }
      }
      return { _tag: "var", name }
    }
    if (t.value === "(") {
      this.consume()
      const inner = this.parseExpr(depth + 1)
      this.expectValue(")")
      return inner
    }
    if (t.value === "[") {
      this.consume()
      const elements: MathExpr[] = []
      if (this.peek()?.value !== "]") {
        while (true) {
          elements.push(this.parseExpr(depth + 1))
          if (this.peek()?.value === ",") { this.consume(); continue }
          break
        }
      }
      this.expectValue("]")
      return { _tag: "list", elements }
    }
    throw new MpseError({ source: this.source, position: t.pos, reason: `unexpected token '${t.value}'`, code: "MPSE_PARSE_ERROR" })
  }
}

export const parseMathExpr = (source: string): Effect.Effect<MathExpr, MpseError> =>
  Effect.try({
    try: () => {
      if (source.trim().length === 0) throw new MpseError({ source, position: 0, reason: "empty expression", code: "MPSE_PARSE_ERROR" })
      const extracted = extractFencedMath(source)
      const tokens = tokenize(extracted)
      if (tokens.length === 0) throw new MpseError({ source, position: 0, reason: "empty expression after tokenization", code: "MPSE_PARSE_ERROR" })
      const parser = new Parser(tokens, source)
      const expr = parser.parseExpr(0)
      if (parser.pos < tokens.length) {
        const extra = tokens[parser.pos]!
        throw new MpseError({ source, position: extra.pos, reason: `unexpected trailing token '${extra.value}'`, code: "MPSE_PARSE_ERROR" })
      }
      return expr
    },
    catch: (e) => {
      if (e instanceof MpseError) return e
      return new MpseError({ source, position: 0, reason: String((e as any)?.message ?? e), code: "MPSE_PARSE_ERROR" })
    }
  })
