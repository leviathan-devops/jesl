import type { OracleRegistry, OracleRule } from "./oracle"

export interface DocNodeLite {
  readonly id: string
  readonly type: string
  readonly config?: Record<string, unknown> & { expr?: unknown; math?: unknown; oracle?: string }
  readonly oracle?: string
}

export interface WorkflowDocLite {
  readonly nodes: ReadonlyArray<DocNodeLite>
  readonly edges?: ReadonlyArray<unknown>
  readonly meta?: { name?: string }
}

export interface CodeStub {
  readonly id: string
  readonly kind: string
  readonly expr: unknown
  readonly exprSource: string
  readonly oracleRef?: string
  readonly oracleRule?: OracleRule
  readonly delta: string
  readonly template: string
  readonly codeSpec: string
}

function buildStub(node: DocNodeLite, registry: OracleRegistry | Record<string, OracleRule> | undefined): CodeStub {
  const cfg = node.config ?? {}
  const expr: unknown = (cfg["expr"] ?? cfg["math"] ?? null) as unknown
  const exprSource = expr === null || expr === undefined ? "null" : (() => { try { return JSON.stringify(expr) } catch { return String(expr) } })()
  const oracleRef = node.oracle ?? (cfg as Record<string, unknown>)["oracle"] as string | undefined ?? (cfg as Record<string, unknown>)["oracleKey"] as string | undefined
  let oracleRule: OracleRule | undefined
  if (registry) {
    if ((registry as OracleRegistry).rules instanceof Map) {
      const reg = registry as OracleRegistry
      if (oracleRef) oracleRule = reg.get(oracleRef)
      if (!oracleRule) oracleRule = reg.get(node.id)
      if (!oracleRule) {
        for (const [, v] of reg.rules) if ((v as OracleRule).cardId === node.id) { oracleRule = v as OracleRule; break }
      }
    } else {
      const rec = registry as Record<string, OracleRule>
      if (oracleRef && rec[oracleRef]) oracleRule = rec[oracleRef]
      else if (rec[node.id]) oracleRule = rec[node.id]
      else {
        for (const v of Object.values(rec)) if ((v as OracleRule).cardId === node.id) { oracleRule = v as OracleRule; break }
      }
    }
  }
  const provenance = oracleRule?.provenance ?? { source: "spec", line: 1, quote: "" }
  const delta = `implement ${node.type} kernel for ${node.id} — math contract ${exprSource.slice(0, 80)} — provenance ${provenance.source}:${provenance.line}`
  const template = [
    `// Code-spec stub — ${node.id} (${node.type}) — delta specification`,
    `// What the implementation wave must build vs what the kernel already proves`,
    `// MathExpr: ${exprSource.slice(0, 120)}`,
    `// Oracle: ${oracleRef ?? node.id} — expected ${JSON.stringify(oracleRule?.expected ?? "unknown")}`,
    `// Provenance: ${provenance.source}:${provenance.line} — "${provenance.quote.slice(0, 60)}"`,
    `export interface ${node.id}Contract {`,
    `  readonly expr: unknown // ${exprSource.slice(0, 60)}`,
    `  readonly expected: unknown // oracle ${oracleRef ?? node.id}`,
    `}`,
    `export const ${node.id}Stub: ${node.id}Contract = {`,
    `  expr: ${exprSource},`,
    `  expected: ${JSON.stringify(oracleRule?.expected ?? null)}`,
    `}`,
    `// Kernel proves: Effect Activity skeleton in kernel-emit; this stub is the delta.`,
    ``
  ].join("\n")
  return {
    id: node.id,
    kind: node.type,
    expr,
    exprSource,
    oracleRef: oracleRef ?? node.id,
    oracleRule,
    delta,
    template,
    codeSpec: template
  }
}

export function emitStubs(docOrCards: WorkflowDocLite | ReadonlyArray<Record<string, unknown>>, registry?: OracleRegistry | Record<string, OracleRule>): ReadonlyArray<CodeStub> | Record<string, string> {
  if (Array.isArray(docOrCards)) {
    const cards = docOrCards as ReadonlyArray<Record<string, unknown>>
    const out: Record<string, string> = {}
    const reg = registry as OracleRegistry | Record<string, OracleRule> | undefined
    for (const c of cards) {
      const id = String(c["id"] ?? c["nodeId"] ?? c["cardId"] ?? "")
      if (!id) continue
      const kind = String(c["kind"] ?? c["type"] ?? "math-eval")
      const node: DocNodeLite = { id, type: kind, config: { expr: (c["expr"] as unknown) ?? (c["math"] as unknown), oracle: (c["oracleKey"] as string) ?? (c["oracle"] as string) } }
      const stub = buildStub(node, reg)
      out[id] = stub.template
    }
    return out
  }
  const doc = docOrCards as WorkflowDocLite
  const nodes = doc.nodes ?? []
  const out: CodeStub[] = []
  for (const n of nodes) {
    out.push(buildStub(n, registry))
  }
  return out
}
