import { Context, Effect, Layer, Option, Clock as EffectClock } from "effect"
import { JeslCapUnbound } from "./errors"

export interface ShellService {
  readonly exec: (cmd: string, opts: { timeoutMs: number; maxOutputBytes: number }) => Effect.Effect<unknown, unknown>
}
export interface FsService {
  readonly read: (p: string) => Effect.Effect<string, unknown>
  readonly write: (p: string, body: string) => Effect.Effect<void, unknown>
}
export interface HttpService {
  readonly request: (r: unknown) => Effect.Effect<unknown, unknown>
}
export interface ToolClientService {
  readonly invoke: (tool: string, args: unknown, causationId: string) => Effect.Effect<unknown, unknown>
}
export interface SubagentService {
  readonly dispatch: (promptFile: string) => Effect.Effect<unknown, unknown>
}
export interface LlmService {
  readonly callModel: (req: { system: string; prompt: string; maxTokens: number; thinking?: { budgetTokens: number } }) => Effect.Effect<unknown, unknown>
}
export interface JournalService {
  readonly append: (row: unknown) => Effect.Effect<unknown>
  readonly rows: (runId: string) => Effect.Effect<ReadonlyArray<unknown>>
}
export interface ClockService {
  readonly now: () => Effect.Effect<number>
}

export class Shell extends Context.Tag("jesl/Shell")<Shell, ShellService>() {}
export class Fs extends Context.Tag("jesl/Fs")<Fs, FsService>() {}
export class Http extends Context.Tag("jesl/Http")<Http, HttpService>() {}
export class ToolClient extends Context.Tag("jesl/ToolClient")<ToolClient, ToolClientService>() {}
export class Subagent extends Context.Tag("jesl/Subagent")<Subagent, SubagentService>() {}
export class Llm extends Context.Tag("jesl/Llm")<Llm, LlmService>() {}
export class Journal extends Context.Tag("jesl/Journal")<Journal, JournalService>() {}
export class ClockTag extends Context.Tag("jesl/Clock")<ClockTag, ClockService>() {}

export const Clock = ClockTag

export class ShellCap extends Shell {}
export class FsCap extends Fs {}
export class HttpCap extends Http {}
export class ToolCap extends ToolClient {}
export class SubagentCap extends Subagent {}
export class LlmCap extends Llm {}
export class EmitCap extends Context.Tag("jesl/EmitCap")<EmitCap, { emit: (type: string, payload: unknown) => Effect.Effect<void> }>() {}
export class JournalCap extends Journal {}
export class ClockCap extends ClockTag {}

export type ServiceTag = Context.Tag<any, any>
export type Caps = Shell | Fs | Http | ToolClient | Subagent | Llm | Journal | ClockTag | EmitCap

const tagId = (tag: ServiceTag): string => {
  const anyTag = tag as any
  if (anyTag.key) return String(anyTag.key)
  if (anyTag.identifier) return String(anyTag.identifier)
  if (anyTag._id) return String(anyTag._id)
  return String(tag)
}

const capName = (tag: ServiceTag): string => {
  const id = tagId(tag)
  const parts = id.split("/")
  const last = parts[parts.length - 1] ?? id
  return last.replace(/Cap$/i, "").toLowerCase()
}

export const requireCaps = (
  requires: ReadonlyArray<ServiceTag>,
  nodeId: string
): Effect.Effect<void, JeslCapUnbound> =>
  Effect.gen(function* () {
    const ctx: Context.Context<any> = yield* Effect.context<any>()
    for (const tag of requires) {
      const opt = Context.getOption(ctx, tag as any)
      if (Option.isNone(opt)) {
        const name = capName(tag)
        const capLabel = name
        const err = new JeslCapUnbound({
          code: "[JESL CAP-UNBOUND]",
          node: nodeId,
          field: "caps",
          expected: `driver Layer providing ${capLabel}`,
          actual: capLabel,
          remedy: "run under a driver that binds the cap, or drop the node"
        } as any)
        ;(err as any).cap = capLabel
        ;(err as any).node = nodeId
        return yield* Effect.fail(err as JeslCapUnbound)
      }
    }
  }) as Effect.Effect<void, JeslCapUnbound>

export const provideCaps = <R>(layer: Layer.Layer<R>): Layer.Layer<R> => layer

const dummyShell: ShellService = { exec: () => Effect.succeed({ stdout: "", stderr: "", exitCode: 0 }) }
const dummyFs: FsService = { read: () => Effect.succeed(""), write: () => Effect.void }
const dummyHttp: HttpService = { request: () => Effect.succeed({ status: 200, body: "" }) }
const dummyToolClient: ToolClientService = { invoke: () => Effect.succeed({ ok: true }) }
const dummySubagent: SubagentService = { dispatch: () => Effect.succeed({ ok: true }) }
const dummyLlm: LlmService = { callModel: () => Effect.succeed({ text: "" }) }
const dummyJournal: JournalService = { append: () => Effect.succeed({}), rows: () => Effect.succeed([]) }
const dummyClock: ClockService = { now: () => EffectClock.currentTimeMillis }
const dummyEmit = { emit: () => Effect.void }

export const ShellLive = Layer.succeed(Shell, dummyShell)
export const FsLive = Layer.succeed(Fs, dummyFs)
export const HttpLive = Layer.succeed(Http, dummyHttp)
export const ToolClientLive = Layer.succeed(ToolClient, dummyToolClient)
export const SubagentLive = Layer.succeed(Subagent, dummySubagent)
export const LlmLive = Layer.succeed(Llm, dummyLlm)
export const JournalLive = Layer.succeed(Journal, dummyJournal)
export const ClockLive = Layer.succeed(ClockTag, dummyClock)
export const EmitLive = Layer.succeed(EmitCap, dummyEmit as any)

export const InMemoryLive = Layer.mergeAll(
  ShellLive,
  FsLive,
  HttpLive,
  ToolClientLive,
  SubagentLive,
  LlmLive,
  JournalLive,
  ClockLive,
  EmitLive
)

export const TestLive = InMemoryLive

export const CliLive = Layer.mergeAll(ShellLive, FsLive, HttpLive, JournalLive)
export const OpenCodeLive = Layer.mergeAll(CliLive, ToolClientLive, SubagentLive, LlmLive, EmitLive)
