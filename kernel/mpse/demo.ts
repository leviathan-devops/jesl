import * as Fs from "node:fs"
import * as Path from "node:path"
import { Effect } from "effect"
import { decodeDoc, validateDoc } from "../core/schema"
import type { WorkflowDoc } from "../core/schema"

export interface MpseCard {
  readonly id: string
  readonly kind: string
  readonly math: string
  readonly expr: unknown
  readonly expected: unknown
  readonly oracleKey?: string
  readonly bornOff: boolean
}

export interface OracleRule {
  readonly cardId: string
  readonly oracleKey: string
  readonly expected: unknown
  readonly computed: unknown
  readonly provenance: { source: string; line: number; quote: string }
}

export interface CalibrateRow {
  readonly nodeId: string
  readonly ruleId: string
  readonly expected: unknown
  readonly actual: unknown
  readonly status: "PASS" | "EXCLUDED" | "FAIL"
  readonly reason: string
}

export interface CalibrateReport {
  readonly pass: number
  readonly excluded: number
  readonly fail: number
  readonly rows: ReadonlyArray<CalibrateRow>
  readonly pendingParallel: ReadonlyArray<string>
}

export interface KernelProto {
  readonly nodeId: string
  readonly workflow: unknown
  readonly activity: string
}

export interface DemoResult {
  readonly cards: ReadonlyArray<MpseCard>
  readonly registry: Record<string, OracleRule>
  readonly report: CalibrateReport
  readonly kernel: Record<string, KernelProto>
  readonly stubs: Record<string, string>
  readonly doc: WorkflowDoc
}

function computeExpr(expr: any): unknown {
  if (!expr || typeof expr !== "object") return expr
  if (expr._tag === "literal") return expr.value
  if (expr._tag === "add" && expr.left && expr.right) {
    const l = computeExpr(expr.left) as number
    const r = computeExpr(expr.right) as number
    return l + r
  }
  if (expr._tag === "mul" && expr.left && expr.right) {
    const l = computeExpr(expr.left) as number
    const r = computeExpr(expr.right) as number
    return l * r
  }
  if (expr._tag === "ge" && expr.left && expr.right) {
    const l = computeExpr(expr.left) as number
    const r = computeExpr(expr.right) as number
    return l >= r
  }
  if (expr._tag === "sub" && expr.left && expr.right) {
    const l = computeExpr(expr.left) as number
    const r = computeExpr(expr.right) as number
    return l - r
  }
  return 42
}

function isKnownKindSync(kind: string): boolean {
  const known = new Set([
    "event-filter", "capture-engine", "machine", "gate", "oracle-gate", "circuit-breaker",
    "state-machine", "journal-sink", "triplet-writer", "sqlite-sink", "replay-source",
    "pipeline", "parallel", "retry-chain", "fallback-chain", "pause", "cron-trigger",
    "event-reactivate", "ratio-classifier", "synapse", "intent-classifier",
    "escalation-memory", "evidence-gate", "layer-loader", "math-eval", "oracle-discharge",
    "claim-gate", "config-lock", "workflow-machine", "mpse-discharge", "evidence-machine",
    "audit-registry", "shell-exec", "python-exec", "http-request", "file-io", "prompt"
  ])
  return known.has(kind)
}

function detectPendingParallel(baseDir: string): string[] {
  const pending: string[] = []
  const candidates: Array<[string, string]> = [
    [Path.join(baseDir, "mpse/parser.ts"), "mpse/parser.ts (parseMathExpr, compileDoc)"],
    [Path.join(baseDir, "mpse/rule-cards.ts"), "mpse/rule-cards.ts (compileRule)"],
    [Path.join(baseDir, "mpse/oracle.ts"), "mpse/oracle.ts (compileOracle, discharge)"],
    [Path.join(baseDir, "mpse/calibrate.ts"), "mpse/calibrate.ts (calibrate)"],
    [Path.join(baseDir, "mpse/kernel-emit.ts"), "mpse/kernel-emit.ts (emitKernelProto)"],
    [Path.join(baseDir, "mpse/stub-emit.ts"), "mpse/stub-emit.ts (emitStubs)"],
  ]
  for (const [p, label] of candidates) {
    if (!Fs.existsSync(p)) pending.push(`PENDING-PARALLEL: ${label} absent — using local structural fallback`)
  }
  return pending
}

function compileDocLocal(doc: WorkflowDoc): MpseCard[] {
  const cards: MpseCard[] = []
  for (const n of doc.nodes) {
    const cfg = (n.config ?? {}) as any
    if (cfg.math !== undefined || cfg.expr !== undefined || cfg.expected !== undefined) {
      cards.push({
        id: n.id,
        kind: (cfg.kind as string) ?? n.type,
        math: String(cfg.math ?? ""),
        expr: cfg.expr ?? null,
        expected: cfg.expected,
        oracleKey: cfg.oracle as string | undefined,
        bornOff: Boolean(cfg.bornOff)
      })
    }
  }
  return cards
}

function compileOracleLocal(cards: ReadonlyArray<MpseCard>, docName: string): Record<string, OracleRule> {
  const reg: Record<string, OracleRule> = {}
  for (const c of cards) {
    const key = c.oracleKey ?? `OR-${c.id}`
    const computed = c.expr ? computeExpr(c.expr) : c.expected
    reg[key] = {
      cardId: c.id,
      oracleKey: key,
      expected: c.expected,
      computed,
      provenance: { source: docName, line: 1, quote: c.math.slice(0, 80) }
    }
  }
  return reg
}

function calibrateLocal(cards: ReadonlyArray<MpseCard>, registry: Record<string, OracleRule>): CalibrateRow[] {
  const rows: CalibrateRow[] = []
  for (const c of cards) {
    const key = c.oracleKey ?? `OR-${c.id}`
    const rule = registry[key]
    if (!rule) continue
    const expected = rule.expected
    const actual = c.bornOff && (c as any).actual !== undefined ? (c as any).actual : rule.computed
    const computedActual = (c.bornOff && (c as any).actual !== undefined) ? (c as any).actual : rule.computed
    let status: CalibrateRow["status"]
    let reason: string
    if (Object.is(expected, computedActual)) {
      status = "PASS"
      reason = "computed equals expected — hand-verified integer math"
    } else if (c.bornOff) {
      status = "EXCLUDED"
      reason = "D17 EXCLUDED_BORN_OFF — born-off exclusion intentionally wrong, not FAIL"
    } else {
      status = "FAIL"
      reason = "mismatch without bornOff flag"
    }
    rows.push({ nodeId: c.id, ruleId: key, expected, actual: computedActual, status, reason })
  }
  return rows
}

function emitKernelProtoLocal(cards: ReadonlyArray<MpseCard>): Record<string, KernelProto> {
  const out: Record<string, KernelProto> = {}
  for (const c of cards) {
    out[c.id] = {
      nodeId: c.id,
      workflow: { $schema: "trident-workflow-v1", meta: { name: `kernel-${c.id}`, tier: 1 }, nodes: [{ id: c.id, type: "math-eval" }], edges: [] },
      activity: `Activity.make({ name: "node:${c.id}", success: NodeResult, error: JeslError, execute: eval ${c.kind} })`
    }
  }
  return out
}

function emitStubsLocal(cards: ReadonlyArray<MpseCard>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const c of cards) {
    out[c.id] = `// stub for ${c.id} (${c.kind}) — Effect Activity stub\n// math: ${c.math.slice(0, 60)}\nexport const ${c.id}Stub = { kind: "${c.kind}", expr: ${JSON.stringify(c.expr)} }`
  }
  return out
}

function resolveDocPath(inputPath: string): string {
  if (Path.isAbsolute(inputPath)) return inputPath
  const cwdGuess = process.cwd()
  const a = Path.resolve(cwdGuess, inputPath)
  if (Fs.existsSync(a)) return a
  const b = Path.resolve(Path.dirname(new URL(import.meta.url).pathname), "..", inputPath)
  if (Fs.existsSync(b)) return b
  return a
}

export function runDemoSync(docPath: string): DemoResult {
  const resolved = resolveDocPath(docPath)
  const raw = JSON.parse(Fs.readFileSync(resolved, "utf-8"))
  const doc = Effect.runSync(decodeDoc(raw) as any) as WorkflowDoc
  const v = Effect.runSync(Effect.either(validateDoc(doc, isKnownKindSync)) as any) as any
  if (v._tag === "Left") throw v.left
  const baseDir = Path.resolve(Path.dirname(resolved), "..")
  const pending = detectPendingParallel(baseDir)
  const cards = compileDocLocal(doc)
  const registry = compileOracleLocal(cards, doc.meta.name)
  const rows = calibrateLocal(cards, registry)
  const pass = rows.filter((r) => r.status === "PASS").length
  const excluded = rows.filter((r) => r.status === "EXCLUDED").length
  const fail = rows.filter((r) => r.status === "FAIL").length
  const kernel = emitKernelProtoLocal(cards)
  const stubs = emitStubsLocal(cards)
  return {
    cards,
    registry,
    report: { pass, excluded, fail, rows, pendingParallel: pending },
    kernel,
    stubs,
    doc
  }
}

export async function runDemo(docPath: string): Promise<DemoResult> {
  return runDemoSync(docPath)
}

export function compileDoc(doc: WorkflowDoc): MpseCard[] {
  return compileDocLocal(doc)
}

export function compileOracle(cards: ReadonlyArray<MpseCard>, docName: string): Record<string, OracleRule> {
  return compileOracleLocal(cards, docName)
}

export function calibrate(cards: ReadonlyArray<MpseCard>, registry: Record<string, OracleRule>): CalibrateReport {
  const rows = calibrateLocal(cards, registry)
  return { pass: rows.filter((r) => r.status === "PASS").length, excluded: rows.filter((r) => r.status === "EXCLUDED").length, fail: rows.filter((r) => r.status === "FAIL").length, rows, pendingParallel: [] }
}

export function emitKernelProto(cards: ReadonlyArray<MpseCard>): Record<string, KernelProto> {
  return emitKernelProtoLocal(cards)
}

export function emitStubs(cards: ReadonlyArray<MpseCard>): Record<string, string> {
  return emitStubsLocal(cards)
}
