import { Effect, Clock, Ref } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

const store = new Map<string, unknown[]>()

export const captureEngineNode: NodeImpl = {
  kind: "capture-engine",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { into?: string; key?: string }
      const into = cfg.into ?? "captured"
      const payload = inp.inbound["event"] ?? inp.inbound["input"] ?? inp.inbound["data"] ?? Object.values(inp.inbound)[0]
      const startMs = yield* Clock.currentTimeMillis
      if (payload === undefined) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "READY_FALSE" as const, evidence: { pattern: "capture-engine", state: "EMPTY", anchor: `${inp.node.id}:empty` }, timing: { startMs, endMs } } as NodeResult
      }
      const key = (inp.node.id ?? "capture") + ":" + into
      const list = store.get(key) ?? []
      list.push(payload)
      store.set(key, list)
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: "capture-engine", state: "STORED", anchor: `${inp.node.id}:${list.length}` }, timing: { startMs, endMs }, outputs: { [into]: payload, count: list.length } } as NodeResult
    })
}

export const _captureStore = store
