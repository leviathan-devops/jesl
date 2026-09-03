import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import { replaceStubSync } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { ALL_FAMILIES, scoreSignals, confidence, classifyBand } from "../scanners/pba-banks"

export const intentClassifierNode: NodeImpl = {
  kind: "intent-classifier",
  family: "decision",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const startMs = yield* Clock.currentTimeMillis
      try {
        const inp = input as NodeInput
        if (!inp || typeof inp !== "object") {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "intent-classifier.error", state: "FAIL", anchor: "intent-classifier:invalid-input:1" }, timing: { startMs, endMs }, outputs: { error: "invalid input" } } as NodeResult
        }
        const rawText = (inp.inbound as any)?.text ?? (inp.inbound as any)?.input ?? (inp.node.config as any)?.text ?? ""
        const text = rawText == null ? "" : String(rawText)
        const hits: Array<{ family: string; confidence: number; band: string; pos: number; neg: number; evidence: string }> = []
        for (const fam of ALL_FAMILIES) {
          let scored: ReturnType<typeof scoreSignals>
          try {
            scored = scoreSignals(text, fam)
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e)
            throw new Error(`scoreSignals failed for ${fam.id}: ${msg}`)
          }
          const conf = confidence(scored.pos, scored.neg)
          const band = classifyBand(conf)
          if (scored.pos > 0) {
            hits.push({ family: fam.id, confidence: conf, band, pos: scored.pos, neg: scored.neg, evidence: scored.evidence })
          }
        }
        hits.sort((a, b) => b.confidence - a.confidence || b.pos - a.pos)
        const endMs = yield* Clock.currentTimeMillis
        return {
          verdict: "PASS" as const,
          evidence: { pattern: "intent-classifier.classify", state: hits.length > 0 ? "HIT" : "MISS", anchor: `${inp.node.id}:hits=${hits.length}:1` },
          timing: { startMs, endMs },
          outputs: { hits, count: hits.length, text },
        } as NodeResult
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e)
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "intent-classifier.error", state: "FAIL", anchor: `intent-classifier:error:1` }, timing: { startMs, endMs }, outputs: {}, error: errMsg } as NodeResult
      }
    }),
}

try {
  replaceStubSync("intent-classifier", intentClassifierNode)
} catch (e) {
  const _m = e instanceof Error ? e.message : String(e)
  void _m
}
