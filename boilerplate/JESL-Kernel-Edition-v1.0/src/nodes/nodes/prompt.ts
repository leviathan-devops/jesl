import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { Llm, requireCaps } from "../core/caps"
import { Journal } from "../core/journal"
import { replaceStubSync } from "../core/registry"

function simpleHash(s: string): string {
  let h1 = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i)
    h1 = Math.imul(h1, 0x01000193) >>> 0
  }
  return h1.toString(16).padStart(8, "0")
}

function interpolateTemplate(tpl: string, vars: Record<string, unknown>): string {
  let out = tpl
  out = out.replace(/\$\{([^}]+)\}/g, (_: string, k: string) => {
    const key = k.trim()
    const v = vars[key]
    if (v !== undefined) return String(v)
    const dotParts = key.split(".")
    let cur: any = vars
    for (const p of dotParts) {
      if (cur == null) break
      cur = cur[p]
    }
    return cur !== undefined ? String(cur) : ""
  })
  out = out.replace(/\{\{([^}]+)\}\}/g, (_: string, k: string) => {
    const key = k.trim()
    const v = vars[key]
    return v !== undefined ? String(v) : ""
  })
  return out
}

function extractText(res: unknown): string {
  if (res == null) return ""
  if (typeof res === "string") return res
  const anyRes = res as any
  if (typeof anyRes.text === "string") return anyRes.text
  if (typeof anyRes.output === "string") return anyRes.output
  if (typeof anyRes.content === "string") return anyRes.content
  if (typeof anyRes.message === "string") return anyRes.message
  if (typeof anyRes.result === "string") return anyRes.result
  if (typeof anyRes.body === "string") return anyRes.body
  try { return JSON.stringify(anyRes) } catch { return String(anyRes) }
}

function extractConfidence(res: unknown): number | undefined {
  if (res == null || typeof res !== "object") return undefined
  const anyRes = res as any
  if (typeof anyRes.confidence === "number") return anyRes.confidence
  if (typeof anyRes.score === "number") return anyRes.score
  if (typeof anyRes.confidenceScore === "number") return anyRes.confidenceScore
  return undefined
}

function extractModel(res: unknown): string {
  if (res == null || typeof res !== "object") return "unknown"
  const anyRes = res as any
  if (typeof anyRes.model === "string") return anyRes.model
  if (typeof anyRes.modelId === "string") return anyRes.modelId
  return "llm"
}

function checkContractViolation(text: string, contract: string): string | null {
  if (!contract || contract.trim() === "") return null
  const c = contract.trim()
  const isPathLike = c.includes("/") || c.endsWith(".json") || c.includes(".schema") || c.startsWith("schema:")
  if (isPathLike) {
    try { JSON.parse(text); return null } catch { return `contract violation: output is not valid JSON (contract: ${c})` }
  }
  if (c === "json") {
    try { JSON.parse(text); return null } catch { return `contract violation: output is not valid JSON (contract: json)` }
  }
  if (text.includes(c)) return null
  try {
    const obj = JSON.parse(text)
    if (JSON.stringify(obj).includes(c)) return null
  } catch {}
  return `contract violation: output does not satisfy contract '${c}' — got: ${text.slice(0, 120)}`
}

export const promptNode: NodeImpl = {
  kind: "prompt",
  family: "generation",
  requiredCaps: ["Llm"],
  invoke: (input: unknown, ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const c = ctx as any
      const cfg = (inp.node.config ?? {}) as Record<string, unknown>
      const rawMode = (cfg.mode as string) ?? (cfg.callMode as string) ?? (inp.inbound as any)?.mode ?? "llm"
      const mode = rawMode === "call-model" ? "llm" : rawMode === "ask-launcher" ? "template" : rawMode
      const nodeId = inp.node.id
      const startMs = yield* Clock.currentTimeMillis
      const inboundVars: Record<string, unknown> = { ...(inp.inbound as Record<string, unknown>), ...(c?.vars as Record<string, unknown> ?? {}) }
      if (mode === "template") {
        const tpl = (cfg.template as string) ?? (cfg.prompt as string) ?? (cfg.text as string) ?? (inp.inbound as any)?.template ?? (inp.inbound as any)?.prompt ?? ""
        const filled = interpolateTemplate(String(tpl), inboundVars)
        const endMs = yield* Clock.currentTimeMillis
        const runId = c?.runId ?? "test-run"
        const docName = c?.doc?.meta?.name ?? "wf"
        const journalAppend = (draft: any) => {
          if (c?.journal?.append) return c.journal.append(draft).pipe(Effect.catchAll(() => Effect.void))
          return Effect.gen(function* () {
            const maybeJournal: any = yield* Effect.serviceOption(Journal).pipe(Effect.catchAll(() => Effect.succeed({ _tag: "None" })))
            if (maybeJournal._tag === "Some") {
              const svc = maybeJournal.value
              yield* svc.append(draft).pipe(Effect.catchAll(() => Effect.void))
            }
          })
        }
        yield* journalAppend({ run: runId, node: nodeId, kind: "invoke" as const, source: `workflow/${docName}/${nodeId}`, evidence: { pattern: "prompt.template.invoke", state: "INVOKE", anchor: `${nodeId}:template` } })
        yield* journalAppend({ run: runId, node: nodeId, kind: "verdict" as const, verdict: "PASS" as const, source: `workflow/${docName}/${nodeId}`, evidence: { pattern: "prompt.template", state: "PASS", anchor: `${nodeId}:template` } })
        return { verdict: "PASS" as const, evidence: { pattern: "prompt.template", state: "PASS", anchor: `${nodeId}:template` }, timing: { startMs, endMs }, outputs: { output: filled, text: filled, result: filled } } as NodeResult
      }
      yield* requireCaps([Llm] as any, nodeId)
      const bracket = (cfg.bracket as any) ?? undefined
      if (bracket != null) {
        const contract = (bracket as any).contract
        if (typeof contract !== "string" || contract.trim() === "") {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "prompt.bracket", state: "FAIL", anchor: `${nodeId}:bracket-missing-contract` }, timing: { startMs, endMs }, error: { code: "[JESL UNBRACKETED-GENERATION]", node: nodeId, field: "bracket.contract", expected: "a contract string", actual: String(contract), remedy: "declare bracket.contract" } } as unknown as NodeResult
        }
      }
      const systemTpl = (cfg.system as string) ?? ""
      const promptTpl = (cfg.prompt as string) ?? (cfg.template as string) ?? (inp.inbound as any)?.prompt ?? (inp.inbound as any)?.input ?? ""
      const system = interpolateTemplate(String(systemTpl), inboundVars)
      let currentPrompt = interpolateTemplate(String(promptTpl), inboundVars)
      const maxTokens = typeof cfg.maxTokens === "number" ? cfg.maxTokens : typeof (cfg as any).max_tokens === "number" ? (cfg as any).max_tokens : 1024
      const thinking = (cfg as any).thinking as { budgetTokens?: number } | undefined
      const confidenceFloor = typeof (bracket as any)?.confidenceFloor === "number" ? (bracket as any).confidenceFloor : typeof cfg.confidenceFloor === "number" ? cfg.confidenceFloor as number : 0.55
      const contractStr: string | undefined = bracket?.contract as string | undefined
      const llm = yield* Llm
      const runId = c?.runId ?? "test-run"
      const docName = c?.doc?.meta?.name ?? "wf"
      let lastText = ""
      let lastConfidence: number | undefined = undefined
      let lastModel = "llm"
      let lastViolation: string | null = null
      const journalPre = (promptHash: string, modelHint: string) =>
        Effect.gen(function* () {
          if (c?.journal?.append) {
            yield* c.journal.append({ run: runId, node: nodeId, kind: "invoke" as const, source: `workflow/${docName}/${nodeId}`, evidence: { pattern: "prompt.call-model", state: "INVOKE", anchor: `${nodeId}:${modelHint}:${promptHash}` } }).pipe(Effect.catchAll(() => Effect.void))
            return
          }
          const maybeJournal: any = yield* Effect.serviceOption(Journal).pipe(Effect.catchAll(() => Effect.succeed({ _tag: "None" })))
          if (maybeJournal._tag === "Some") {
            const svc = maybeJournal.value
            yield* svc.append({ run: runId, node: nodeId, kind: "invoke" as const, source: `workflow/${docName}/${nodeId}`, evidence: { pattern: "prompt.call-model", state: "INVOKE", anchor: `${nodeId}:${modelHint}:${promptHash}` } }).pipe(Effect.catchAll(() => Effect.void))
          }
        })
      const journalVerdict = (verdict: string, outputHash: string, confidence?: number) =>
        Effect.gen(function* () {
          if (c?.journal?.append) {
            yield* c.journal.append({ run: runId, node: nodeId, kind: "verdict" as const, verdict: verdict as any, source: `workflow/${docName}/${nodeId}`, evidence: { pattern: "prompt.call-model", state: verdict, anchor: `${nodeId}:${outputHash}${confidence !== undefined ? ":" + confidence : ""}` } }).pipe(Effect.catchAll(() => Effect.void))
            return
          }
          const maybeJournal: any = yield* Effect.serviceOption(Journal).pipe(Effect.catchAll(() => Effect.succeed({ _tag: "None" })))
          if (maybeJournal._tag === "Some") {
            const svc = maybeJournal.value
            yield* svc.append({ run: runId, node: nodeId, kind: "verdict" as const, verdict: verdict as any, source: `workflow/${docName}/${nodeId}`, evidence: { pattern: "prompt.call-model", state: verdict, anchor: `${nodeId}:${outputHash}${confidence !== undefined ? ":" + confidence : ""}` } }).pipe(Effect.catchAll(() => Effect.void))
          }
        })
      for (let attempt = 0; attempt <= 2; attempt++) {
        const promptHash = simpleHash(currentPrompt).slice(0, 8)
        const preModel = attempt === 0 ? "llm" : `llm-repair-${attempt}`
        yield* journalPre(promptHash, preModel)
        const req: any = { system, prompt: currentPrompt, maxTokens }
        if (thinking) req.thinking = thinking
        const rawRes = yield* Effect.either(llm.callModel(req))
        if (rawRes._tag === "Left") {
          const err: any = rawRes.left
          const msg = err?.message ?? err?.code ?? String(err)
          const endMs = yield* Clock.currentTimeMillis
          const outputHash = simpleHash(String(msg)).slice(0, 8)
          yield* journalVerdict("FAIL", outputHash)
          return { verdict: "FAIL" as const, evidence: { pattern: "prompt.call-model", state: "FAIL", anchor: `${nodeId}:transport:${msg.slice(0, 40)}` }, timing: { startMs, endMs }, error: { code: "LLM_TRANSPORT", message: msg, cause: err } } as NodeResult
        }
        const res: any = rawRes.right
        const text = extractText(res)
        const conf = extractConfidence(res)
        const model = extractModel(res)
        lastText = text
        lastConfidence = conf
        lastModel = model
        const violation = contractStr ? checkContractViolation(text, contractStr) : null
        lastViolation = violation
        if (violation) {
          if (attempt === 2) break
          currentPrompt = currentPrompt + `\n\n[Repair] Previous output violated contract: ${violation}\nPlease correct the output to satisfy the contract.`
          continue
        }
        const outputHash = simpleHash(text).slice(0, 12)
        const effConf = conf ?? 1
        if (effConf < confidenceFloor) {
          const endMs = yield* Clock.currentTimeMillis
          yield* journalVerdict("INCONCLUSIVE", outputHash, effConf)
          return { verdict: "INCONCLUSIVE" as const, evidence: { pattern: "prompt.call-model", state: "UNCLEAR", anchor: `${nodeId}:llm:${model}:${outputHash}` }, timing: { startMs, endMs }, outputs: { output: text, text, confidence: effConf, model } } as unknown as NodeResult
        }
        {
          const endMs = yield* Clock.currentTimeMillis
          yield* journalVerdict("PASS", outputHash, effConf)
          return { verdict: "PASS" as const, evidence: { pattern: "prompt.call-model", state: "PASS", anchor: `${nodeId}:llm:${model}:${outputHash}` }, timing: { startMs, endMs }, outputs: { output: text, text, confidence: effConf, model } } as NodeResult
        }
      }
      {
        const endMs = yield* Clock.currentTimeMillis
        const outputHash = simpleHash(lastText).slice(0, 12)
        yield* journalVerdict("FAIL", outputHash, lastConfidence)
        return { verdict: "FAIL" as const, evidence: { pattern: "prompt.call-model", state: "FAIL", anchor: `${nodeId}:contract:${String(lastViolation).slice(0, 80)}` }, timing: { startMs, endMs }, outputs: { output: lastText, text: lastText, confidence: lastConfidence, model: lastModel }, error: { code: "CONTRACT_VIOLATION", message: lastViolation ?? "contract violation", contract: contractStr, output: lastText } } as unknown as NodeResult
      }
    })
}

const doReplace = () => {
  try { replaceStubSync("prompt", promptNode as any) } catch (e) { void e }
}
doReplace()
