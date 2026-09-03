import { Effect, Schema } from "effect"
import { JeslCycle, JeslTierViolation, JeslUnknownNode } from "./errors"
import type { JeslError } from "./errors"

const GENERATION_KINDS = new Set(["prompt", "shadow-agent", "subagent-dispatch", "generation"])

export const NodeEnvelope = Schema.Struct({
  id: Schema.String,
  type: Schema.String,
  config: Schema.optional(Schema.Unknown),
  class: Schema.optional(Schema.Union(
    Schema.Literal("event"),
    Schema.Literal("decision"),
    Schema.Literal("generation"),
    Schema.Literal("orchestration"),
    Schema.Literal("evidence"),
    Schema.Literal("execution")
  )),
  on: Schema.optional(Schema.Struct({
    event: Schema.String,
    filter: Schema.optional(Schema.String)
  })),
  retries: Schema.optional(Schema.Struct({
    maxRetries: Schema.Number,
    class: Schema.Union(Schema.Literal("exile"), Schema.Literal("retry"), Schema.Literal("fall"))
  })),
  timeoutMs: Schema.optional(Schema.Number),
  bracket: Schema.optional(Schema.Struct({
    contract: Schema.String,
    repair: Schema.optional(Schema.Struct({ target: Schema.String, max: Schema.Literal(2) })),
    confidenceFloor: Schema.optional(Schema.Number)
  })),
  oracle: Schema.optional(Schema.String)
})

export const EdgeDecl = Schema.Struct({
  from: Schema.String,
  to: Schema.String,
  via: Schema.String
})

export const WorkflowDoc = Schema.Struct({
  $schema: Schema.Literal("trident-workflow-v1"),
  meta: Schema.Struct({
    name: Schema.String,
    tier: Schema.Union(Schema.Literal(1), Schema.Literal(2)),
    description: Schema.optional(Schema.String),
    seed: Schema.optional(Schema.Struct({ channel: Schema.String }))
  }),
  nodes: Schema.NonEmptyArray(NodeEnvelope),
  edges: Schema.Array(EdgeDecl),
  vars: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  journal: Schema.optional(Schema.Unknown),
  gates: Schema.optional(Schema.Array(Schema.Unknown))
})

export type WorkflowDoc = typeof WorkflowDoc.Type
export type NodeEnvelope = typeof NodeEnvelope.Type
export type EdgeDecl = typeof EdgeDecl.Type

const mapParseError = (cause: unknown): JeslError => {
  const raw = cause as { message?: string } | string
  const msg = typeof raw === "string" ? raw : (raw?.message ?? String(raw))
  const field = msg.includes('["nodes"]') ? "nodes"
    : msg.includes('["vars"]') ? "vars"
    : msg.includes('["edges"]') ? "edges"
    : msg.includes('["meta"]') ? "meta"
    : msg.includes("$schema") ? "$schema"
    : msg.includes("nodes") ? "nodes"
    : msg.includes("vars") ? "vars"
    : msg.includes("meta") ? "meta"
    : msg.includes("edges") ? "edges"
    : "workflow"
  return new JeslUnknownNode({
    code: "[JESL UNKNOWN-NODE]",
    node: "workflow",
    field,
    expected: "valid WorkflowDoc per L2 §3.1",
    actual: msg.slice(0, 500),
    remedy: "fix the document to match the schema: $schema='trident-workflow-v1', meta{name,tier}, nodes[] non-empty unique ids, edges[] from/to/via, vars record<string,string>"
  })
}

export const decodeDoc = (input: unknown): Effect.Effect<WorkflowDoc, JeslError> =>
  Schema.decodeUnknown(WorkflowDoc)(input).pipe(
    Effect.mapError(mapParseError)
  )

export const validateDoc = (
  doc: WorkflowDoc,
  isKnownKind: (kind: string) => boolean
): Effect.Effect<void, JeslError> =>
  Effect.gen(function* () {
    const seen = new Set<string>()
    for (const n of doc.nodes) {
      if (seen.has(n.id)) {
        return yield* Effect.fail(new JeslUnknownNode({
          code: "[JESL UNKNOWN-NODE]",
          node: n.id,
          field: "nodes[id]",
          expected: "unique node ids",
          actual: `duplicate id '${n.id}'`,
          remedy: "rename the duplicate node id"
        }))
      }
      seen.add(n.id)
    }

    for (const n of doc.nodes) {
      if (!isKnownKind(n.type)) {
        return yield* Effect.fail(new JeslUnknownNode({
          code: "[JESL UNKNOWN-NODE]",
          node: n.id,
          field: "type",
          expected: "one of registry kinds (F7/F10 catalog)",
          actual: n.type,
          remedy: "fix the typo or append the kind to the registry (append-only)"
        }))
      }
    }

    const ids = new Set(doc.nodes.map((n) => n.id))
    for (const e of doc.edges) {
      if (!ids.has(e.from)) {
        return yield* Effect.fail(new JeslUnknownNode({
          code: "[JESL UNKNOWN-NODE]",
          node: e.from,
          field: "edges[from]",
          expected: "existing node id",
          actual: e.from,
          remedy: "fix the edge endpoint to a real node id"
        }))
      }
      if (!ids.has(e.to)) {
        return yield* Effect.fail(new JeslUnknownNode({
          code: "[JESL UNKNOWN-NODE]",
          node: e.to,
          field: "edges[to]",
          expected: "existing node id",
          actual: e.to,
          remedy: "fix the edge endpoint to a real node id"
        }))
      }
    }

    const indeg = new Map<string, number>()
    const adj = new Map<string, string[]>()
    for (const n of doc.nodes) {
      indeg.set(n.id, 0)
      adj.set(n.id, [])
    }
    for (const e of doc.edges) {
      adj.get(e.from)!.push(e.to)
      indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1)
    }
    const queue: string[] = doc.nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0).map((n) => n.id)
    const order: string[] = []
    let qi = 0
    while (qi < queue.length) {
      const u = queue[qi++]!
      order.push(u)
      for (const v of adj.get(u) ?? []) {
        const d = (indeg.get(v) ?? 0) - 1
        indeg.set(v, d)
        if (d === 0) queue.push(v)
      }
    }
    if (order.length < doc.nodes.length) {
      const cycleNodes = doc.nodes.filter((n) => (indeg.get(n.id) ?? 0) > 0).map((n) => n.id)
      const path = cycleNodes.join("→")
      return yield* Effect.fail(new JeslCycle({
        code: "[JESL CYCLE]",
        node: cycleNodes[0] ?? doc.nodes[0]!.id,
        field: "edges",
        expected: "acyclic channel graph",
        actual: `cycle through [${path}]`,
        remedy: "break the cycle with a gate, or re-arm via event-reactivate"
      }))
    }

    if (doc.meta.tier === 1) {
      for (const n of doc.nodes) {
        if (GENERATION_KINDS.has(n.type)) {
          return yield* Effect.fail(new JeslTierViolation({
            code: "[JESL TIER-VIOLATION]",
            node: n.id,
            field: "meta.tier",
            expected: "tier 2 (bracketed generation) or tier 1 with no generation nodes",
            actual: `tier 1 with generation node ${n.id} (type=${n.type})`,
            remedy: "raise meta.tier to 2 or replace the generator with a deterministic kind"
          }))
        }
        if (n.class === "generation") {
          return yield* Effect.fail(new JeslTierViolation({
            code: "[JESL TIER-VIOLATION]",
            node: n.id,
            field: "meta.tier",
            expected: "tier 2 (bracketed generation) or tier 1 with no generation nodes",
            actual: `tier 1 with generation node ${n.id} (class=generation)`,
            remedy: "raise meta.tier to 2 or replace the generator with a deterministic kind"
          }))
        }
      }
    }
  })

// VERIFY-ON-INSTALL ledger:
// - Schema.Struct / Schema.Literal / Schema.String / Schema.Number / Schema.Union / Schema.Array / Schema.NonEmptyArray / Schema.optional / Schema.Record / Schema.Unknown / Schema.decodeUnknown are VERIFIED via effect@3.22.1 Schema export.
// - Schema.TaggedError is VERIFIED via core/errors.ts usage.
// - Effect.gen / Effect.fail / Effect.mapError are VERIFIED effect core.
// - GENERATION_KINDS set is derived from DPL1 §2.4 (prompt, shadow-agent, subagent-dispatch) + class=generation fallback; L2 §3.1 family check is registry-owned, this approximates for F1 tier discipline.
// - vars as Record<string,string> enforces vars type violation per DONE-WHEN.
