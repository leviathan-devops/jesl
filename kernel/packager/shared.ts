import { Effect } from "effect"
import { decodeDoc, validateDoc } from "../core/schema"
import type { WorkflowDoc } from "../core/schema"
import type { JeslError } from "../core/errors"

const KNOWN_KINDS = new Set<string>([
  "event-filter","capture-engine","machine","gate","oracle-gate","circuit-breaker",
  "state-machine","journal-sink","triplet-writer","sqlite-sink","replay-source",
  "pipeline","parallel","retry-chain","fallback-chain","pause","cron-trigger",
  "event-reactivate","ratio-classifier","synapse","intent-classifier","escalation-memory",
  "evidence-gate","layer-loader","math-eval","oracle-discharge","claim-gate","config-lock",
  "workflow-machine","mpse-discharge","evidence-machine","audit-registry",
  "shell-exec","python-exec","http-request","file-io",
  "prompt","shadow-agent","subagent-dispatch","generation"
])

export const isKnownKindSync = (kind: string): boolean => KNOWN_KINDS.has(kind)

export type ValidatedDoc = WorkflowDoc

export const validatedDoc = (raw: unknown): Effect.Effect<ValidatedDoc, JeslError> =>
  Effect.gen(function* () {
    const doc = yield* decodeDoc(raw)
    yield* validateDoc(doc, isKnownKindSync)
    const ub = checkUnbracketed(doc as any)
    if (ub) return yield* Effect.fail(ub as JeslError)
    return doc
  })

function checkUnbracketed(doc: any): unknown | null {
  const GENERATION_KINDS = new Set(["prompt","shadow-agent","subagent-dispatch","generation"])
  if (doc.meta?.tier !== 2) return null
  for (const n of doc.nodes ?? []) {
    const isGen = GENERATION_KINDS.has(n.type) || n.class === "generation"
    if (isGen) {
      const hasBracket = n.bracket != null && typeof (n.bracket as any).contract === "string"
      if (!hasBracket) {
        const err: any = {
          _tag: "JeslUnbracketedGeneration",
          code: "[JESL UNBRACKETED-GENERATION]" as const,
          node: n.id as string,
          field: "bracket",
          expected: "{contract, repair≤2, confidenceFloor}",
          actual: "absent",
          remedy: "declare bracket.contract (output schema) — generation is never unbracketed"
        }
        err.message = String(err.code)
        err.toString = () => String(err.code)
        return err
      }
    }
  }
  return null
}

export interface ToolManifest {
  $schema: "trident-workflow-v1"
  name: string
  description: string
  inputSchema: {
    vars: Record<string, string>
    seedChannel?: string
    channels: string[]
  }
  command: string
  doc: ValidatedDoc
}

export interface ChainStep {
  id: string
  tool: string
  args: unknown
  via?: string
  inboundVia?: string[]
  outboundVia?: string[]
}

export interface ChainDescriptor {
  $schema: "trident-workflow-v1"
  name: string
  description: string
  steps: ChainStep[]
  edges: ReadonlyArray<{ from: string; to: string; via: string }>
}

export interface SkillWriter {
  write: (path: string, content: string) => Effect.Effect<void, unknown>
}

export class InMemoryWriter implements SkillWriter {
  readonly files = new Map<string, string>()
  write = (path: string, content: string): Effect.Effect<void, unknown> =>
    Effect.sync(() => { this.files.set(path, content) })
  has = (path: string) => this.files.has(path)
  get = (path: string) => this.files.get(path)
  list = () => [...this.files.keys()].sort()
  dump = () => new Map(this.files)
}

export const revalidateDoc = (raw: unknown): Effect.Effect<ValidatedDoc, JeslError> =>
  validatedDoc(raw)

export const canonicalJson = (value: unknown): string =>
  JSON.stringify(value, null, 2)
