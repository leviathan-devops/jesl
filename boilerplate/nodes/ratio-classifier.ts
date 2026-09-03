import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import { replaceStubSync } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { ALL_FAMILIES, scoreSignals, confidence, classifyBand } from "../scanners/pba-banks"
import type { ConfidenceBand } from "../scanners/pba-banks"

export const ratioClassifierNode: NodeImpl = {
  kind: "ratio-classifier",
  family: "decision",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const startMs = yield* Clock.currentTimeMillis
      try {
        const inp = input as NodeInput
        if (!inp || typeof inp !== "object") {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "ratio-classifier.error", state: "FAIL", anchor: "ratio-classifier:invalid-input:1" }, timing: { startMs, endMs }, outputs: { error: "invalid input" } } as NodeResult
        }
        const rawText = (inp.inbound as any)?.text ?? (inp.inbound as any)?.input ?? (inp.node.config as any)?.text ?? ""
        const text = rawText == null ? "" : String(rawText)
        let best: { family: string; confidence: number; band: ConfidenceBand; pos: number; neg: number; evidence: string } | null = null
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
          const candidate = { family: fam.id, confidence: conf, band, pos: scored.pos, neg: scored.neg, evidence: scored.evidence }
          if (!best || candidate.confidence > best.confidence || (candidate.confidence === best.confidence && candidate.pos > best.pos)) {
            best = candidate
          }
        }
        const endMs = yield* Clock.currentTimeMillis
        if (!best || best.pos === 0) {
          return {
            verdict: "PASS" as const,
            evidence: { pattern: "ratio-classifier.suppress", state: "SUPPRESS", anchor: `${inp.node.id}:suppress:1` },
            timing: { startMs, endMs },
            outputs: { family: null, confidence: 0, band: "SUPPRESS" as ConfidenceBand, pos: 0, neg: 0, evidence: "" },
          } as NodeResult
        }
        return {
          verdict: "PASS" as const,
          evidence: { pattern: "ratio-classifier.classify", state: best.band, anchor: `${inp.node.id}:${best.family}:${best.band}:1` },
          timing: { startMs, endMs },
          outputs: { family: best.family, confidence: best.confidence, band: best.band, pos: best.pos, neg: best.neg, evidence: best.evidence },
        } as NodeResult
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e)
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "ratio-classifier.error", state: "FAIL", anchor: `ratio-classifier:error:1` }, timing: { startMs, endMs }, outputs: {}, error: errMsg } as NodeResult
      }
    }),
}

try {
  replaceStubSync("ratio-classifier", ratioClassifierNode)
} catch (e) {
  const _m = e instanceof Error ? e.message : String(e)
  void _m
}
