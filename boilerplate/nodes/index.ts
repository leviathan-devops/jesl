export { gateNode } from "./gate"
export { eventFilterNode } from "./event-filter"
export { captureEngineNode } from "./capture-engine"
export { pipelineNode } from "./pipeline"
export { parallelNode } from "./parallel"
export { retryChainNode } from "./retry-chain"
export { fallbackChainNode } from "./fallback-chain"
export { pauseNode, pauseResume } from "./pause"
export { journalSinkNode } from "./journal-sink"
export { tripletWriterNode } from "./triplet-writer"
export { stateMachineNode } from "./state-machine"
export { mathEvalNode, MathExprService } from "./math-eval"
export { circuitBreakerNode, _circuitStore, _resetCircuit } from "./circuit-breaker"
export { cronTriggerNode, _cronStore, _resetCron } from "./cron-trigger"
export { eventReactivateNode, _reactivateMap, _reactivateLog, _resetReactivate, reactivateWait } from "./event-reactivate"
export { configLockNode, _configLockStore, _resetConfigLock } from "./config-lock"
export { layerLoaderNode, _layerStore, _knownLayers, _resetLayers } from "./layer-loader"
export { oracleGateNode } from "./oracle-gate"
export { oracleDischargeNode } from "./oracle-discharge"
export { mpseDischargeNode } from "./mpse-discharge"
export { evidenceGateNode } from "./evidence-gate"
export { evidenceMachineNode } from "./evidence-machine"
export { claimGateNode } from "./claim-gate"
export { auditRegistryNode } from "./audit-registry"
export { ratioClassifierNode } from "./ratio-classifier"
export { synapseNode } from "./synapse"
export { intentClassifierNode } from "./intent-classifier"
export { escalationMemoryNode } from "./escalation-memory"
export { sqliteSinkNode } from "./sqlite-sink"
export { machineNode } from "./machine"
export { workflowMachineNode } from "./workflow-machine"
export { replaySourceNode } from "./replay-source"
export { shellExecNode } from "./shell-exec"
export { pythonExecNode } from "./python-exec"
export { httpRequestNode } from "./http-request"
export { fileIoNode } from "./file-io"
export { promptNode } from "./prompt"
export { stubNodes } from "./stubs"
import { gateNode } from "./gate"
import { eventFilterNode } from "./event-filter"
import { captureEngineNode } from "./capture-engine"
import { pipelineNode } from "./pipeline"
import { parallelNode } from "./parallel"
import { retryChainNode } from "./retry-chain"
import { fallbackChainNode } from "./fallback-chain"
import { pauseNode } from "./pause"
import { journalSinkNode } from "./journal-sink"
import { tripletWriterNode } from "./triplet-writer"
import { stateMachineNode } from "./state-machine"
import { mathEvalNode } from "./math-eval"
import { circuitBreakerNode } from "./circuit-breaker"
import { cronTriggerNode } from "./cron-trigger"
import { eventReactivateNode } from "./event-reactivate"
import { configLockNode } from "./config-lock"
import { layerLoaderNode } from "./layer-loader"
import { oracleGateNode } from "./oracle-gate"
import { oracleDischargeNode } from "./oracle-discharge"
import { mpseDischargeNode } from "./mpse-discharge"
import { evidenceGateNode } from "./evidence-gate"
import { evidenceMachineNode } from "./evidence-machine"
import { claimGateNode } from "./claim-gate"
import { auditRegistryNode } from "./audit-registry"
import { ratioClassifierNode } from "./ratio-classifier"
import { synapseNode } from "./synapse"
import { intentClassifierNode } from "./intent-classifier"
import { escalationMemoryNode } from "./escalation-memory"
import { sqliteSinkNode } from "./sqlite-sink"
import { machineNode } from "./machine"
import { workflowMachineNode } from "./workflow-machine"
import { replaySourceNode } from "./replay-source"
import { shellExecNode } from "./shell-exec"
import { pythonExecNode } from "./python-exec"
import { httpRequestNode } from "./http-request"
import { fileIoNode } from "./file-io"
import { promptNode } from "./prompt"
import { stubNodes } from "./stubs"
import { replaceStubSync } from "../core/registry"
// The 11 mpse/evidence/paragon Wave-1 nodes + shell/python/http/file/prompt self-register
// at their own module bottoms. EVERY other full node registers HERE — the index is the
// single wiring authority so the registry holds real impls for all 37 kinds:
for (const [k, impl] of [
  ["gate", gateNode],
  ["event-filter", eventFilterNode],
  ["capture-engine", captureEngineNode],
  ["pipeline", pipelineNode],
  ["parallel", parallelNode],
  ["retry-chain", retryChainNode],
  ["fallback-chain", fallbackChainNode],
  ["pause", pauseNode],
  ["journal-sink", journalSinkNode],
  ["triplet-writer", tripletWriterNode],
  ["state-machine", stateMachineNode],
  ["math-eval", mathEvalNode],
  ["circuit-breaker", circuitBreakerNode],
  ["cron-trigger", cronTriggerNode],
  ["event-reactivate", eventReactivateNode],
  ["config-lock", configLockNode],
  ["layer-loader", layerLoaderNode],
  ["sqlite-sink", sqliteSinkNode],
  ["machine", machineNode],
  ["workflow-machine", workflowMachineNode],
  ["replay-source", replaySourceNode]
] as const) {
  try { replaceStubSync(k, impl as any) } catch (err) { const _ = err; void _ }
}
export const allFullNodes = [gateNode, eventFilterNode, captureEngineNode, pipelineNode, parallelNode, retryChainNode, fallbackChainNode, pauseNode, journalSinkNode, tripletWriterNode, stateMachineNode, mathEvalNode, circuitBreakerNode, cronTriggerNode, eventReactivateNode, configLockNode, layerLoaderNode, oracleGateNode, oracleDischargeNode, mpseDischargeNode, evidenceGateNode, evidenceMachineNode, claimGateNode, auditRegistryNode, ratioClassifierNode, synapseNode, intentClassifierNode, escalationMemoryNode, sqliteSinkNode, machineNode, workflowMachineNode, replaySourceNode, shellExecNode, pythonExecNode, httpRequestNode, fileIoNode, promptNode]
const _realKinds = new Set(allFullNodes.map(n => n.kind))
export const allNodes = [...allFullNodes, ...stubNodes.filter(s => !_realKinds.has(s.kind))]
