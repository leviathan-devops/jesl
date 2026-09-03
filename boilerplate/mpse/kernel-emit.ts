import type { OracleRegistry, OracleRule } from "./oracle"

export interface DocNode {
  readonly id: string
  readonly type: string
  readonly config?: Record<string, unknown> & { expr?: unknown; math?: unknown; expected?: unknown; oracle?: string }
  readonly oracle?: string
}

export interface WorkflowDocLite {
  readonly nodes: ReadonlyArray<DocNode>
  readonly edges?: ReadonlyArray<unknown>
  readonly meta?: { name?: string; tier?: number }
}

export interface KernelProto {
  readonly id: string
  readonly kind: string
  readonly expr: unknown
  readonly exprSource: string
  readonly oracleRules: ReadonlyArray<OracleRule>
  readonly activitySkeleton: string
  readonly workflow: unknown
  readonly nodeId: string
}

function hasMathContract(node: DocNode): boolean {
  const cfg = node.config ?? {}
  if (cfg["expr"] !== undefined && cfg["expr"] !== null) return true
  if (cfg["math"] !== undefined && cfg["math"] !== null && String(cfg["math"]).length > 0) return true
  if (node.oracle !== undefined && String(node.oracle).length > 0) return true
  if ((cfg as Record<string, unknown>)["oracle"] !== undefined) return true
  if (node.type === "math-eval" || node.type === "oracle-discharge" || node.type === "oracle-gate" || node.type === "mpse-discharge") return true
  return false
}

function exprSourceOf(expr: unknown): string {
  if (expr === null || expr === undefined) return "null"
  try { return JSON.stringify(expr) } catch { return String(expr) }
}

function activitySkeletonFor(node: DocNode, expr: unknown, exprSource: string, oracleRules: ReadonlyArray<OracleRule>): string {
  const oracleIds = oracleRules.map(r => r.oracleKey).join(", ") || "none"
  return [
    `// Macro kernel prototype — ${node.id} (${node.type})`,
    `// MathExpr: ${exprSource.slice(0, 120)}`,
    `// Oracle rules: ${oracleIds}`,
    `// Provenance: ${oracleRules[0]?.provenance.source ?? "spec"}:${oracleRules[0]?.provenance.line ?? 1}`,
    `import { Effect } from "effect"`,
    `import { Activity } from "@effect/workflow"`,
    ``,
    `export const ${node.id}Activity = Activity.make({`,
    `  name: "node:${node.id}",`,
    `  success: "NodeResult",`,
    `  error: "JeslError",`,
    `  execute: Effect.gen(function* () {`,
    `    // Effect Activity skeleton — ${node.type} kernel`,
    `    // expr source: ${exprSource.slice(0, 80)}`,
    `    // oracle linkage: ${oracleIds}`,
    `    const result = yield* Effect.succeed({ verdict: "PASS", evidence: { pattern: "${node.type}", state: "FIRED", anchor: "${node.id}:1" } })`,
    `    return result`,
    `  })`,
    `})`,
    ``
  ].join("\n")
}

function buildProto(node: DocNode, registry: OracleRegistry | Record<string, OracleRule> | undefined): KernelProto {
  const cfg = node.config ?? {}
  const expr: unknown = (cfg["expr"] ?? cfg["math"] ?? null) as unknown
  const exprSource = exprSourceOf(expr)
  const oracleKey = node.oracle ?? (cfg as Record<string, unknown>)["oracle"] as string | undefined
  let oracleRules: OracleRule[] = []
  if (registry) {
    if ((registry as OracleRegistry).rules instanceof Map) {
      const reg = registry as OracleRegistry
      if (oracleKey) {
        const r = reg.get(oracleKey)
        if (r) oracleRules = [r]
        else {
          const alt = reg.get(node.id)
          if (alt) oracleRules = [alt]
        }
      } else {
        const r = reg.get(node.id)
        if (r) oracleRules = [r]
      }
      if (oracleRules.length === 0) {
        for (const [, v] of reg.rules) {
          if ((v as OracleRule).cardId === node.id) { oracleRules = [v as OracleRule]; break }
        }
      }
    } else {
      const rec = registry as Record<string, OracleRule>
      if (oracleKey && rec[oracleKey]) oracleRules = [rec[oracleKey]!]
      else if (rec[node.id]) oracleRules = [rec[node.id]!]
      else {
        for (const v of Object.values(rec)) {
          if ((v as OracleRule).cardId === node.id) { oracleRules = [v as OracleRule]; break }
        }
      }
    }
  }
  const skeleton = activitySkeletonFor(node, expr, exprSource, oracleRules)
  const workflow = {
    $schema: "trident-workflow-v1" as const,
    meta: { name: `kernel-${node.id}`, tier: 1 as const },
    nodes: [{ id: node.id, type: node.type }],
    edges: []
  }
  return {
    id: node.id,
    kind: node.type,
    expr,
    exprSource,
    oracleRules,
    activitySkeleton: skeleton,
    workflow,
    nodeId: node.id
  }
}

export function emitKernelProto(docOrCards: WorkflowDocLite | ReadonlyArray<Record<string, unknown>>, registry?: OracleRegistry | Record<string, OracleRule>): ReadonlyArray<KernelProto> | Record<string, KernelProto> {
  if (Array.isArray(docOrCards)) {
    const cards = docOrCards as ReadonlyArray<Record<string, unknown>>
    const out: Record<string, KernelProto> = {}
    const reg = registry as OracleRegistry | Record<string, OracleRule> | undefined
    for (const c of cards) {
      const id = String(c["id"] ?? c["nodeId"] ?? c["cardId"] ?? "")
      if (!id) continue
      const kind = String(c["kind"] ?? c["type"] ?? "math-eval")
      const node: DocNode = { id, type: kind, config: { expr: (c["expr"] as unknown) ?? (c["math"] as unknown), oracle: (c["oracleKey"] as string) ?? (c["oracle"] as string) } }
      const proto = buildProto(node, reg)
      out[id] = proto
    }
    return out
  }
  const doc = docOrCards as WorkflowDocLite
  const nodes = doc.nodes ?? []
  const out: KernelProto[] = []
  for (const n of nodes) {
    if (!hasMathContract(n)) continue
    out.push(buildProto(n, registry))
  }
  if (out.length === 0 && nodes.length > 0) {
    for (const n of nodes) out.push(buildProto(n, registry))
  }
  return out
}
