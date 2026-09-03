import { Effect, Clock, Layer, Context } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

const loadedLayers = new Map<string, Layer.Layer<any>>()

const knownLayers: Record<string, Layer.Layer<any>> = {}

function ensureKnown() {
  if (Object.keys(knownLayers).length > 0) return
  const DummyTag = Context.GenericTag<{ v: string }>("jesl/DummyLayer")
  knownLayers["dummy"] = Layer.succeed(DummyTag, { v: "dummy" })
  knownLayers["clock"] = Layer.succeed(DummyTag, { v: "clock" })
  knownLayers["inMemory"] = Layer.succeed(DummyTag, { v: "inMemory" })
  knownLayers["test"] = Layer.succeed(DummyTag, { v: "test" })
}

export const layerLoaderNode: NodeImpl = {
  kind: "layer-loader",
  family: "decision",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { layerName?: string; layer?: string; name?: string }
      const layerName = cfg.layerName ?? cfg.layer ?? cfg.name ?? (inp.inbound["layerName"] as string | undefined) ?? (inp.inbound["layer"] as string | undefined)
      const startMs = yield* Clock.currentTimeMillis
      if (!layerName) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "READY_FALSE" as const, evidence: { pattern: "layer-loader", state: "NO_NAME", anchor: `${inp.node.id}:no-layerName` }, timing: { startMs, endMs } } as NodeResult
      }
      ensureKnown()
      let layer = knownLayers[layerName]
      if (!layer) {
        if (layerName.includes("/") || layerName.includes(".")) {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "layer-loader", state: "NOT_FOUND", anchor: `${inp.node.id}:not-found:${layerName}` }, timing: { startMs, endMs } } as NodeResult
        }
        const Tag = Context.GenericTag<unknown>(`jesl/Dyn:${layerName}`)
        layer = Layer.succeed(Tag as any, { layer: layerName, loadedAt: startMs } as any)
        knownLayers[layerName] = layer
      }
      const merged = Layer.mergeAll(layer)
      void merged
      loadedLayers.set(layerName, layer)
      loadedLayers.set(inp.node.id, layer)
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: "layer-loader", state: "PROVIDED", anchor: `${inp.node.id}:${layerName}` }, timing: { startMs, endMs }, outputs: { layerName, provided: true, layer } } as NodeResult
    })
}

export const _layerStore = loadedLayers
export const _knownLayers = knownLayers
export const _resetLayers = (key?: string) => {
  if (key) loadedLayers.delete(key)
  else loadedLayers.clear()
}
