import { Layer } from "effect"
import { Shell, Fs, Http, ToolClient, Subagent, Llm, Journal, ClockTag, EmitCap } from "../core/caps"
import { Bus } from "../core/bus"
import { Session } from "../drivers/session-live"
import type { HostTransport } from "../drivers/opencode-live"
import { makeOpenCodeLive, ScriptedTransport } from "../drivers/opencode-live"
import { makeParagonHostBinding, REQUIRED_CAPS, type ParagonHostBinding } from "./host-binding"

export const makeOpenCodeBinding = (transport: HostTransport): ParagonHostBinding => {
  const layer = makeOpenCodeLive(transport) as Layer.Layer<any>
  return makeParagonHostBinding({
    name: "opencode",
    layer,
    provides: [Shell, Fs, Http, ToolClient, Subagent, Llm, Journal, ClockTag, EmitCap, Bus, Session] as any
  })
}

export const OpenCodeBindingLive = (transport: HostTransport): Layer.Layer<any> => makeOpenCodeLive(transport)

export const makeTestOpenCodeBinding = (): ParagonHostBinding => {
  const transport = new ScriptedTransport({ answers: [] })
  return makeOpenCodeBinding(transport)
}

export const opencodeBindingWith = (transport: HostTransport): Layer.Layer<any> => makeOpenCodeLive(transport) as Layer.Layer<any>

export { ScriptedTransport }
export type { HostTransport, ParagonHostBinding }
export { REQUIRED_CAPS }
