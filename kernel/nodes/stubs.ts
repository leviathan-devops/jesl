import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeResult } from "./shared"

function stub(kind: string, family: any): NodeImpl {
  return {
    kind,
    family,
    requiredCaps: [],
    invoke: () =>
      Effect.gen(function* () {
        const t = yield* Clock.currentTimeMillis
        return { verdict: "INCONCLUSIVE" as const, evidence: { pattern: `${kind}.stub`, state: "INCONCLUSIVE", anchor: `TODO:${kind}:1` }, timing: { startMs: t, endMs: t } } as NodeResult
      })
  }
}

export const stubNodes: NodeImpl[] = [
  stub("machine", "deterministic"),
  stub("oracle-gate", "deterministic"),
  stub("circuit-breaker", "deterministic"),
  stub("sqlite-sink", "deterministic"),
  stub("replay-source", "deterministic"),
  stub("cron-trigger", "deterministic"),
  stub("event-reactivate", "deterministic"),
  stub("ratio-classifier", "decision"),
  stub("synapse", "decision"),
  stub("intent-classifier", "decision"),
  stub("escalation-memory", "decision"),
  stub("evidence-gate", "decision"),
  stub("layer-loader", "decision"),
  stub("oracle-discharge", "decision"),
  stub("claim-gate", "decision"),
  stub("config-lock", "decision"),
  stub("workflow-machine", "decision"),
  stub("mpse-discharge", "decision"),
  stub("evidence-machine", "evidence"),
  stub("audit-registry", "evidence"),
  stub("shell-exec", "execution"),
  stub("python-exec", "execution"),
  stub("http-request", "execution"),
  stub("file-io", "execution"),
]

export const allStubs = stubNodes
