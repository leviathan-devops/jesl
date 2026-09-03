// @ts-nocheck
import { Effect, Clock } from "effect"
import { Journal } from "../../core/journal"
import { Subagent, SubagentCap } from "../../core/caps"
import { compileOracle, type OracleRegistry, type DischargeResult, type OracleRule } from "../../mpse/oracle"

export interface CodeStub {
  readonly id: string
  readonly kind: string
  readonly expr?: unknown
  readonly exprSource?: string
  readonly oracleRef?: string
  readonly oracleRule?: OracleRule
  readonly expected: unknown
  readonly tolerance?: number
  readonly delta?: string
  readonly template?: string
}

export interface GeneratedCode {
  readonly code: string
  readonly confidence: number
  readonly model?: string
}

export interface StubInventory {
  readonly stubs: ReadonlyArray<CodeStub>
  readonly total: number
}

export interface StubResult {
  readonly stubId: string
  readonly code: string
  readonly verdict: "PASS" | "FAIL" | "INCONCLUSIVE"
  readonly attempts: number
  readonly confidence: number
  readonly discharges: ReadonlyArray<DischargeResult>
  readonly evidence: { readonly pattern: string; readonly state: string; readonly anchor: string }
}

export interface KernelsToCodeReport {
  readonly pass: number
  readonly fail: number
  readonly inconclusive: number
  readonly rows: ReadonlyArray<StubResult>
  readonly runId: string
  readonly inventory: StubInventory
  readonly chainValid: boolean
}

function extractCode(res: unknown): GeneratedCode {
  if (res == null) return { code: "", confidence: 1 }
  if (typeof res === "string") return { code: res, confidence: 1 }
  const anyRes = res as any
  if (typeof anyRes.text === "string") return { code: anyRes.text, confidence: typeof anyRes.confidence === "number" ? anyRes.confidence : typeof anyRes.score === "number" ? anyRes.score : 1, model: anyRes.model }
  if (typeof anyRes.code === "string") return { code: anyRes.code, confidence: typeof anyRes.confidence === "number" ? anyRes.confidence : 1, model: anyRes.model }
  if (typeof anyRes.output === "string") return { code: anyRes.output, confidence: typeof anyRes.confidence === "number" ? anyRes.confidence : 1 }
  if (typeof anyRes.content === "string") return { code: anyRes.content, confidence: typeof anyRes.confidence === "number" ? anyRes.confidence : 1 }
  if (typeof anyRes.result === "string") return { code: anyRes.result, confidence: typeof anyRes.confidence === "number" ? anyRes.confidence : 1 }
  try {
    const s = JSON.stringify(anyRes)
    return { code: s, confidence: 1 }
  } catch {
    return { code: String(anyRes), confidence: 1 }
  }
}

function actualFromCode(code: string, expected: unknown): unknown {
  if (typeof expected === "number") {
    const trimmed = code.trim()
    const direct = Number(trimmed)
    if (trimmed !== "" && !Number.isNaN(direct) && /^[+-]?\d+(\.\d+)?$/.test(trimmed)) return direct
    const m = code.match(/-?\d+(\.\d+)?/)
    if (m) {
      const n = Number(m[0])
      if (!Number.isNaN(n)) return n
    }
    if (code === "NaN") return Number.NaN
    if (code === "Infinity" || code === "+Infinity") return Number.POSITIVE_INFINITY
    if (code === "-Infinity") return Number.NEGATIVE_INFINITY
    return code
  }
  if (typeof expected === "boolean") {
    if (code.includes("true")) return true
    if (code.includes("false")) return false
    return code
  }
  return code
}

function toCodeStub(input: unknown, registryLookup?: (id: string) => OracleRule | undefined): CodeStub {
  const anyIn = input as any
  if (anyIn && typeof anyIn.id === "string" && (anyIn.expected !== undefined || anyIn.oracleRule !== undefined || anyIn.template !== undefined || anyIn.delta !== undefined)) {
    const id = anyIn.id as string
    const kind = (anyIn.kind as string) ?? "unknown"
    const expected = anyIn.expected ?? anyIn.oracleRule?.expected ?? null
    const tolerance = anyIn.tolerance ?? anyIn.oracleRule?.tolerance
    const oracleRef = anyIn.oracleRef ?? anyIn.oracleKey ?? id
    const oracleRule = anyIn.oracleRule ?? (registryLookup ? registryLookup(oracleRef) ?? registryLookup(id) : undefined)
    return { id, kind, expr: anyIn.expr, exprSource: anyIn.exprSource ?? (anyIn.expr ? JSON.stringify(anyIn.expr).slice(0, 120) : "null"), oracleRef, oracleRule, expected, tolerance, delta: anyIn.delta, template: anyIn.template }
  }
  const id = String(anyIn.id ?? anyIn.nodeId ?? anyIn.cardId ?? "unknown")
  const kind = String(anyIn.kind ?? anyIn.type ?? "unknown")
  const expr = (anyIn.expr ?? anyIn.math ?? null) as unknown
  const exprSource = expr != null ? (() => { try { return JSON.stringify(expr) } catch { return String(expr) } })() : "null"
  const oracleRef = (anyIn.oracleRef ?? anyIn.oracle ?? anyIn.oracleKey ?? id) as string
  const oracleRule = registryLookup ? registryLookup(oracleRef) ?? registryLookup(id) : undefined
  const expected = (anyIn.expected ?? oracleRule?.expected ?? null) as unknown
  const tolerance = (anyIn.tolerance as number | undefined) ?? oracleRule?.tolerance
  return { id, kind, expr, exprSource, oracleRef, oracleRule, expected, tolerance, delta: anyIn.delta, template: anyIn.template }
}

export function inventoryStubs(raw: unknown, registry?: OracleRegistry): StubInventory {
  let stubs: CodeStub[] = []
  const lookup = registry ? (id: string) => registry.get(id) : undefined
  if (Array.isArray(raw)) {
    for (const item of raw as unknown[]) stubs.push(toCodeStub(item, lookup))
  } else if (raw != null && typeof raw === "object") {
    const anyRaw = raw as any
    if (Array.isArray(anyRaw.stubs)) {
      for (const item of anyRaw.stubs as unknown[]) stubs.push(toCodeStub(item, lookup))
    } else if (anyRaw.nodes && Array.isArray(anyRaw.nodes)) {
      for (const item of anyRaw.nodes as unknown[]) stubs.push(toCodeStub(item, lookup))
    } else if (anyRaw instanceof Map) {
      for (const [, v] of anyRaw as Map<string, unknown>) stubs.push(toCodeStub(v, lookup))
    } else {
      const rec = anyRaw as Record<string, unknown>
      const vals = Object.values(rec)
      const hasStubShape = vals.some(v => v != null && typeof v === "object" && "id" in (v as any))
      if (hasStubShape) {
        for (const v of vals) stubs.push(toCodeStub(v, lookup))
      } else {
        stubs.push(toCodeStub(raw, lookup))
      }
    }
  }
  if (stubs.length === 1 && stubs[0]!.id === "unknown") {
    stubs = []
  }
  return { stubs, total: stubs.length }
}

function makeRegistry(stubs: ReadonlyArray<CodeStub>): OracleRegistry {
  const cards: any[] = stubs.map(s => ({ id: s.oracleRef ?? s.id, expr: s.expr ?? { _tag: "literal", value: s.expected }, expected: s.expected, tolerance: s.tolerance, oracleKey: s.oracleRef ?? s.id }))
  const reg = compileOracle(cards as any)
  return reg
}

const journalAppend = (runId: string, node: string, kind: string, verdict: string | undefined, pattern: string, state: string, anchor: string): Effect.Effect<void, never, any> =>
  Effect.gen(function* () {
    const journal: any = yield* Journal as any
    const ts: any = yield* Clock.currentTimeMillis as any
    const draft: any = { run: runId, node, kind: kind as any, source: `workflow/kernels-to-code/${node}`, evidence: { pattern, state, anchor }, ts }
    if (verdict) draft.verdict = verdict
    yield* (journal.append(draft) as any).pipe(Effect.catchAll(() => Effect.void as any)) as any
  }) as any

export const processStub = (
  stub: CodeStub,
  registry: OracleRegistry,
  runId: string
): Effect.Effect<StubResult, never, any> =>
  Effect.gen(function* () {
    const journal = yield* Journal
    const subagent = yield* Subagent
    let attempts = 0
    let lastCode = ""
    let lastConfidence = 1
    let discharges: DischargeResult[] = []
    let verdict: StubResult["verdict"] = "FAIL"
    let evidenceState = "FAIL"
    for (let attempt = 0; attempt < 3; attempt++) {
      attempts = attempt + 1
      yield* journalAppend(runId, stub.id, "invoke", undefined, `k2c.dispatch.${stub.id}`, "FIRED", `${stub.id}:dispatch:${attempt}`)
      const promptFile = `kernels-to-code/stub-${stub.id}.prompt`
      const dispatchEither = yield* Effect.either(subagent.dispatch(promptFile) as Effect.Effect<unknown, unknown, any>)
      if (dispatchEither._tag === "Left") {
        const err = dispatchEither.left as any
        const msg = err?.message ?? err?.code ?? String(err)
        yield* journalAppend(runId, stub.id, "verdict", "FAIL", `k2c.dispatch.${stub.id}`, "FAIL", `${stub.id}:dispatch-fail:${msg.slice(0, 40)}`)
        verdict = "FAIL"
        evidenceState = "FAIL"
        break
      }
      const extracted = extractCode(dispatchEither.right)
      lastCode = extracted.code
      lastConfidence = extracted.confidence
      if (lastConfidence < 0.55) {
        yield* journalAppend(runId, `k2c-oracle-${stub.id}`, "verdict", "INCONCLUSIVE", `k2c.oracle.${stub.id}`, "UNCLEAR", `${stub.id}:confidence:${lastConfidence}`)
        yield* journalAppend(runId, stub.id, "verdict", "INCONCLUSIVE", `k2c.dispatch.${stub.id}`, "UNCLEAR", `${stub.id}:UNCLEAR:${lastConfidence}`)
        verdict = "INCONCLUSIVE"
        evidenceState = "UNCLEAR"
        break
      }
      const actual = actualFromCode(lastCode, stub.expected)
      const ruleId = stub.oracleRef ?? stub.id
      let dr: DischargeResult
      try {
        dr = registry.discharge(ruleId, actual)
      } catch (e: any) {
        dr = { status: "UNVERIFIABLE", ruleId, actual, reason: e?.message ?? String(e) }
      }
      discharges = [...discharges, dr]
      const oracleVerdict = dr.status === "PASS" ? "PASS" : dr.status === "FAIL" || dr.status === "CONTRADICTED" ? "FAIL" : dr.status === "UNVERIFIABLE" ? "INCONCLUSIVE" : "INCONCLUSIVE"
      yield* journalAppend(runId, `k2c-oracle-${stub.id}`, "verdict", oracleVerdict, `k2c.oracle.${stub.id}`, dr.status, `${stub.id}:${dr.status}:${String(dr.expected ?? stub.expected)}`)
      if (dr.status === "PASS") {
        yield* journalAppend(runId, stub.id, "verdict", "PASS", `k2c.dispatch.${stub.id}`, "PASS", `${stub.id}:oracle:PASS`)
        verdict = "PASS"
        evidenceState = "PASS"
        break
      }
      if (dr.status === "CONTRADICTED") {
        evidenceState = "CONTRADICTED"
        if (attempt === 2) {
          yield* journalAppend(runId, stub.id, "verdict", "FAIL", `k2c.dispatch.${stub.id}`, "FAIL", `${stub.id}:CONTRADICTED:final`)
          verdict = "FAIL"
          break
        }
        continue
      }
      if (dr.status === "FAIL") {
        evidenceState = "FAIL"
        if (attempt === 2) {
          yield* journalAppend(runId, stub.id, "verdict", "FAIL", `k2c.dispatch.${stub.id}`, "FAIL", `${stub.id}:oracle:FAIL:final`)
          verdict = "FAIL"
          break
        }
        continue
      }
      if (dr.status === "UNVERIFIABLE") {
        yield* journalAppend(runId, stub.id, "verdict", "INCONCLUSIVE", `k2c.dispatch.${stub.id}`, "UNVERIFIABLE", `${stub.id}:UNVERIFIABLE`)
        verdict = "INCONCLUSIVE"
        evidenceState = "UNVERIFIABLE"
        break
      }
      if ((dr as any).status === "EXCLUDED") {
        yield* journalAppend(runId, stub.id, "verdict", "FAIL", `k2c.dispatch.${stub.id}`, "FAIL", `${stub.id}:EXCLUDED`)
        verdict = "FAIL"
        evidenceState = "EXCLUDED"
        break
      }
      verdict = "FAIL"
      evidenceState = dr.status
      if (attempt === 2) break
    }
    return {
      stubId: stub.id,
      code: lastCode,
      verdict,
      attempts,
      confidence: lastConfidence,
      discharges,
      evidence: { pattern: `k2c.stub.${stub.id}`, state: evidenceState, anchor: `${stub.id}:${verdict}:${attempts}` }
    } as StubResult
  })

export const runKernelsToCode = (
  input: unknown,
  opts?: { runId?: string; registry?: OracleRegistry; concurrency?: number }
): Effect.Effect<KernelsToCodeReport, never, any> =>
  (Effect.gen(function* () {
    const runId = opts?.runId ?? `k2c-${Date.now()}`
    const providedRegistry = opts?.registry
    const inventory = inventoryStubs(input, providedRegistry)
    const registry = providedRegistry ?? makeRegistry(inventory.stubs)
    yield* journalAppend(runId, "k2c-inventory", "invoke", undefined, "k2c.inventory", "FIRED", `k2c-inventory:invoke:${inventory.total}`)
    yield* journalAppend(runId, "k2c-inventory", "verdict", "PASS", "k2c.inventory", "PASS", `k2c-inventory:PASS:${inventory.total}`)
    if (inventory.stubs.length === 0) {
      yield* journalAppend(runId, "k2c-journal", "verdict", "FAIL", "k2c.journal", "FAIL", `${runId}:empty-inventory`)
      const journal: any = yield* Journal as any
      const chainValid = (yield* (journal.verify(runId) as any).pipe(Effect.catchAll(() => Effect.succeed(false as boolean))) as unknown) as boolean
      return { pass: 0, fail: 0, inconclusive: 0, rows: [], runId, inventory, chainValid } as KernelsToCodeReport
    }
    const concurrency = opts?.concurrency ?? 1
    const results = (yield* Effect.forEach(inventory.stubs, (stub) => processStub(stub, registry, runId), { concurrency }) as any) as ReadonlyArray<StubResult>
    const pass = results.filter(r => r.verdict === "PASS").length
    const fail = results.filter(r => r.verdict === "FAIL").length
    const inconclusive = results.filter(r => r.verdict === "INCONCLUSIVE").length
    const overallVerdict = fail === 0 && inconclusive === 0 ? "PASS" : fail > 0 ? "FAIL" : "INCONCLUSIVE"
    yield* journalAppend(runId, "k2c-journal", "verdict", overallVerdict, "k2c.journal", overallVerdict, `${runId}:journal:${pass}/${fail}/${inconclusive}`)
    const journal: any = yield* Journal as any
    const chainValid = (yield* (journal.verify(runId) as any).pipe(Effect.catchAll(() => Effect.succeed(false as boolean))) as unknown) as boolean
    return { pass, fail, inconclusive, rows: results, runId, inventory, chainValid } as KernelsToCodeReport
  }) as any)

export const runKernelsToCodeFromStubs = (
  stubs: ReadonlyArray<CodeStub>,
  opts?: { runId?: string; registry?: OracleRegistry }
): Effect.Effect<KernelsToCodeReport, never, any> =>
  (runKernelsToCode(stubs, opts) as any)

export function makeStubFixture(id: string, expected: unknown, tolerance?: number): CodeStub {
  return { id, kind: "math-eval", expr: { _tag: "literal", value: expected }, exprSource: JSON.stringify({ _tag: "literal", value: expected }), oracleRef: id, expected, tolerance, delta: `implement ${id}`, template: `export const ${id} = ${JSON.stringify(expected)}` }
}

export const sampleStubs = (count = 2): ReadonlyArray<CodeStub> => {
  const base: CodeStub[] = [
    makeStubFixture("stub-a", 42),
    makeStubFixture("stub-b", 0.6, 0.05),
  ]
  return base.slice(0, count)
}
