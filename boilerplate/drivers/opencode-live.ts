import { Context, Effect, Layer } from "effect"
import { ToolClient, Subagent, Llm, Shell, Fs, Http, Journal } from "../core/caps"
import { Bus } from "../core/bus"
import { CliLive } from "./cli-live"
import { Session, makeSessionLive } from "./session-live"

export interface HostTransport {
  readonly invokeTool: (tool: string, args: unknown, causationId: string) => Effect.Effect<unknown, unknown>
  readonly dispatchSubagent: (promptFile: string) => Effect.Effect<unknown, unknown>
  readonly callModel: (req: { system: string; prompt: string; maxTokens: number; thinking?: { budgetTokens: number } }) => Effect.Effect<unknown, unknown>
  readonly ask: (question: string, opts?: { timeoutMs?: number }) => Effect.Effect<string, unknown>
}

export class HostTransportTag extends Context.Tag("jesl/HostTransport")<HostTransportTag, HostTransport>() {}

export class ScriptedTransport implements HostTransport {
  private askAnswers: string[]
  private shouldThrow: boolean
  private invokeImpl?: (tool: string, args: unknown, causationId: string) => unknown
  private dispatchImpl?: (promptFile: string) => unknown
  private callModelImpl?: (req: unknown) => unknown
  constructor(opts: {
    answers?: string[]
    shouldThrow?: boolean
    invokeImpl?: (tool: string, args: unknown, causationId: string) => unknown
    dispatchImpl?: (promptFile: string) => unknown
    callModelImpl?: (req: unknown) => unknown
  } = {}) {
    this.askAnswers = [...(opts.answers ?? [])]
    this.shouldThrow = opts.shouldThrow ?? false
    this.invokeImpl = opts.invokeImpl
    this.dispatchImpl = opts.dispatchImpl
    this.callModelImpl = opts.callModelImpl
  }
  invokeTool(tool: string, args: unknown, causationId: string): Effect.Effect<unknown, unknown> {
    if (this.shouldThrow) return Effect.fail(new Error("transport failure: invokeTool"))
    if (this.invokeImpl) {
      try {
        const v = this.invokeImpl(tool, args, causationId)
        if (v && typeof (v as any).pipe === "function") return v as Effect.Effect<unknown, unknown>
        return Effect.succeed(v)
      } catch (e) { return Effect.fail(e) }
    }
    return Effect.succeed({ ok: true, tool, args, causationId })
  }
  dispatchSubagent(promptFile: string): Effect.Effect<unknown, unknown> {
    if (this.shouldThrow) return Effect.fail(new Error("transport failure: dispatchSubagent"))
    if (this.dispatchImpl) {
      try {
        const v = this.dispatchImpl(promptFile)
        if (v && typeof (v as any).pipe === "function") return v as Effect.Effect<unknown, unknown>
        return Effect.succeed(v)
      } catch (e) { return Effect.fail(e) }
    }
    return Effect.succeed({ ok: true, promptFile })
  }
  callModel(req: { system: string; prompt: string; maxTokens: number; thinking?: { budgetTokens: number } }): Effect.Effect<unknown, unknown> {
    if (this.shouldThrow) return Effect.fail(new Error("transport failure: callModel"))
    if (this.callModelImpl) {
      try {
        const v = this.callModelImpl(req)
        if (v && typeof (v as any).pipe === "function") return v as Effect.Effect<unknown, unknown>
        return Effect.succeed(v)
      } catch (e) { return Effect.fail(e) }
    }
    return Effect.succeed({ text: "scripted-model-output", req })
  }
  ask(question: string, _opts?: { timeoutMs?: number }): Effect.Effect<string, unknown> {
    if (this.shouldThrow) return Effect.fail(new Error("transport failure: ask"))
    const ans = this.askAnswers.shift()
    if (ans === undefined) return Effect.fail(new Error("no scripted answer for: " + question))
    return Effect.succeed(ans)
  }
  pushAnswer(a: string) { this.askAnswers.push(a) }
  get remaining() { return [...this.askAnswers] }
}

export const makeOpenCodeLive = (transport: HostTransport): Layer.Layer<ToolClient | Subagent | Llm | Session | Shell | Fs | Http | Journal | Bus> => {
  const ToolClientLive = Layer.succeed(ToolClient, {
    invoke: (tool: string, args: unknown, causationId: string) => transport.invokeTool(tool, args, causationId)
  })
  const SubagentLive = Layer.succeed(Subagent, {
    dispatch: (promptFile: string) => transport.dispatchSubagent(promptFile)
  })
  const LlmLive2 = Layer.succeed(Llm, {
    callModel: (req: { system: string; prompt: string; maxTokens: number; thinking?: { budgetTokens: number } }) => transport.callModel(req)
  })
  const SessionLiveLayer = makeSessionLive(transport)
  const BusLiveInner = Layer.effect(Bus, Effect.gen(function* () {
    const { makeBus } = yield* Effect.promise(() => import("../core/bus"))
    return yield* makeBus
  }))
  return Layer.mergeAll(CliLive as Layer.Layer<any>, ToolClientLive, SubagentLive, LlmLive2, SessionLiveLayer, BusLiveInner) as Layer.Layer<any>
}

export const OpenCodeLive = (transport: HostTransport) => makeOpenCodeLive(transport)
