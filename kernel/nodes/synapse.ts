import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import { replaceStubSync } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { ALPHA_DECAY, FIRE_THRESHOLD, REFRACTORY_SEQ } from "../wraps/behavior-engine"

const strengthMap = new Map<string, { strength: number; lastSeq: number }>()
let globalSeq = 0

export function _resetSynapseState(): void {
  strengthMap.clear()
  globalSeq = 0
}

export function _getSynapseState(): ReadonlyMap<string, { strength: number; lastSeq: number }> {
  return new Map(strengthMap)
}

export const synapseNode: NodeImpl = {
  kind: "synapse",
  family: "decision",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const startMs = yield* Clock.currentTimeMillis
      try {
        const inp = input as NodeInput
        if (!inp || typeof inp !== "object") {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "synapse.error", state: "FAIL", anchor: "synapse:invalid-input:1" }, timing: { startMs, endMs }, outputs: { error: "invalid input" } } as NodeResult
        }
        const cfg = (inp.node.config ?? {}) as Record<string, unknown>
        const inbound = (inp.inbound ?? {}) as Record<string, unknown>
        const family = (inbound.family as string) ?? (cfg.family as string) ?? "default"
        const incrementRaw = inbound.signal ?? inbound.increment ?? cfg.increment ?? 1
        let increment = Number(incrementRaw)
        if (!Number.isFinite(increment)) increment = 1
        if (increment < 0) increment = 0
        const seqRaw = inbound.seq ?? cfg.seq
        let curSeq: number
        if (seqRaw != null && Number.isFinite(Number(seqRaw))) {
          curSeq = Math.floor(Number(seqRaw))
        } else {
          globalSeq += 1
          curSeq = globalSeq
        }
        const prev = strengthMap.get(family)
        let decayed = 0
        if (prev) {
          const delta = curSeq - prev.lastSeq
          if (delta < 0) throw new Error(`synapse: seq regression for ${family}: cur=${curSeq} prev=${prev.lastSeq}`)
          const factor = Math.exp(-ALPHA_DECAY * delta)
          decayed = prev.strength * factor
        }
        const withinRefractory = prev ? (curSeq - prev.lastSeq) < REFRACTORY_SEQ : false
        let nextStrength = decayed + increment
        if (!Number.isFinite(nextStrength)) throw new Error(`synapse: non-finite strength for ${family}`)
        strengthMap.set(family, { strength: nextStrength, lastSeq: curSeq })
        const fired = nextStrength >= FIRE_THRESHOLD
        const endMs = yield* Clock.currentTimeMillis
        return {
          verdict: "PASS" as const,
          evidence: { pattern: "synapse.decay", state: fired ? "FIRED" : "DECAYED", anchor: `${inp.node.id}:${family}:${curSeq}:${nextStrength.toFixed(4)}` },
          timing: { startMs, endMs },
          outputs: { family, strength: nextStrength, decayed, increment, seq: curSeq, fired, withinRefractory, alphaDecay: ALPHA_DECAY, fireThreshold: FIRE_THRESHOLD },
        } as NodeResult
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e)
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "synapse.error", state: "FAIL", anchor: `synapse:error:1` }, timing: { startMs, endMs }, outputs: {}, error: errMsg } as NodeResult
      }
    }),
}

try { replaceStubSync("synapse", synapseNode) } catch (e) { const _m = e instanceof Error ? e.message : String(e); void _m }
