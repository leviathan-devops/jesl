import { Effect } from "effect"
import type { WorkflowDoc } from "../core/schema"
import type { JeslError } from "../core/errors"
import { validatedDoc, canonicalJson, type ToolManifest } from "./shared"

export const emitTool = (raw: unknown): Effect.Effect<ToolManifest, JeslError> =>
  Effect.gen(function* () {
    const doc = yield* validatedDoc(raw)
    const vars = (doc.vars ?? {}) as Record<string, string>
    const channels = doc.edges.map((e) => e.via)
    const seedChannel = (doc.meta as any).seed?.channel as string | undefined
    const manifest: ToolManifest = {
      $schema: "trident-workflow-v1",
      name: doc.meta.name,
      description: (doc.meta as any).description ?? `JESL workflow ${doc.meta.name}`,
      inputSchema: {
        vars,
        seedChannel,
        channels: [...new Set(channels)]
      },
      command: `jesl run ${doc.meta.name}.json --in vars.json`,
      doc
    }
    return manifest
  })

export const emitToolFromDoc = (doc: WorkflowDoc): Effect.Effect<ToolManifest, JeslError> =>
  emitTool(doc as unknown)

export const toolManifestJson = (manifest: ToolManifest): string =>
  canonicalJson({
    $schema: manifest.$schema,
    name: manifest.name,
    description: manifest.description,
    inputSchema: manifest.inputSchema,
    command: manifest.command
  })
