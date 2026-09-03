import { Effect } from "effect"
import type { JeslError } from "../core/errors"
import { validatedDoc, isKnownKindSync, type ChainDescriptor, type ChainStep } from "./shared"
import type { WorkflowDoc } from "../core/schema"

export const emitChain = (raw: unknown): Effect.Effect<ChainDescriptor, JeslError> =>
  Effect.gen(function* () {
    const doc = yield* validatedDoc(raw)
    const descriptor = buildChain(doc)
    for (const step of descriptor.steps) {
      if (!isKnownKindSync(step.tool)) {
        const err: any = {
          _tag: "JeslUnknownNode",
          code: "[JESL UNKNOWN-NODE]",
          node: step.id,
          field: "type",
          expected: "one of registry kinds",
          actual: step.tool,
          remedy: "fix the typo or append the kind to the registry",
          message: "[JESL UNKNOWN-NODE]"
        }
        return yield* Effect.fail(err as JeslError)
      }
    }
    return descriptor
  })

export const buildChain = (doc: WorkflowDoc): ChainDescriptor => {
  const edges = doc.edges as ReadonlyArray<{ from: string; to: string; via: string }>
  const byFrom = new Map<string, string[]>()
  const byTo = new Map<string, string[]>()
  for (const e of edges) {
    const f = byFrom.get(e.from) ?? []
    f.push(e.via)
    byFrom.set(e.from, f)
    const t = byTo.get(e.to) ?? []
    t.push(e.via)
    byTo.set(e.to, t)
  }
  const steps: ChainStep[] = doc.nodes.map((n: any) => {
    const outboundVia = byFrom.get(n.id)
    const inboundVia = byTo.get(n.id)
    const via = outboundVia?.[0]
    return {
      id: n.id,
      tool: n.type,
      args: (n as any).config ?? {},
      via,
      inboundVia: inboundVia ? [...inboundVia] : [],
      outboundVia: outboundVia ? [...outboundVia] : []
    }
  })
  return {
    $schema: "trident-workflow-v1",
    name: doc.meta.name,
    description: (doc.meta as any).description ?? `Chain for ${doc.meta.name}`,
    steps,
    edges: [...edges]
  }
}

export const emitChainFromDoc = (doc: WorkflowDoc): Effect.Effect<ChainDescriptor, JeslError> =>
  emitChain(doc as unknown)
