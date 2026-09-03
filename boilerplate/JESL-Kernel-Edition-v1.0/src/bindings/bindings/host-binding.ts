import { Context, Effect, Layer } from "effect"
import { Shell, Fs, Http, ToolClient, Subagent, Llm, Journal, ClockTag, EmitCap } from "../core/caps"
import { Bus } from "../core/bus"
import { Session } from "../drivers/session-live"

export type KernelCaps = Shell | Fs | Http | ToolClient | Subagent | Llm | Journal | ClockTag | EmitCap | Bus | Session

export const KERNEL_TAGS: ReadonlyArray<Context.Tag<any, any>> = [
  Shell, Fs, Http, ToolClient, Subagent, Llm, Journal, ClockTag, EmitCap, Bus, Session
] as const

export const REQUIRED_CAPS: ReadonlyArray<Context.Tag<any, any>> = [
  Shell, Fs, Http, ToolClient, Subagent, Llm, Journal, Bus
] as const

export interface ParagonHostBinding {
  readonly name: string
  readonly layer: Layer.Layer<KernelCaps>
  readonly provides: ReadonlyArray<Context.Tag<any, any>>
}

export const isParagonHostBinding = (v: unknown): v is ParagonHostBinding => {
  const o = v as any
  return o !== null && typeof o === "object" && typeof o.name === "string" && o.layer !== undefined && Array.isArray(o.provides)
}

export const validateParagonHostBinding = (binding: ParagonHostBinding): ReadonlyArray<string> => {
  const errs: string[] = []
  if (typeof binding.name !== "string" || binding.name.length === 0) errs.push("name must be non-empty string")
  if (!binding.layer || typeof (binding.layer as any).pipe !== "function" && typeof binding.layer !== "object") errs.push("layer must be a Layer")
  if (!Array.isArray(binding.provides)) errs.push("provides must be array of Tags")
  else {
    for (const tag of binding.provides) {
      const t = tag as any
      const isTag = t !== null && (typeof t === "object" || typeof t === "function") && (typeof t.key === "string" || typeof t.identifier === "string" || typeof t._id === "string")
      if (!isTag) errs.push(`provides entry is not a Context.Tag: ${String(tag)}`)
    }
    for (const req of REQUIRED_CAPS) {
      const found = binding.provides.includes(req as any)
      if (!found) {
        const id = (req as any).key ?? (req as any).identifier ?? String(req)
        errs.push(`missing required cap: ${id}`)
      }
    }
  }
  return errs
}

export const isValidParagonHostBinding = (binding: ParagonHostBinding): boolean => validateParagonHostBinding(binding).length === 0

export const makeParagonHostBinding = (opts: {
  name: string
  layer: Layer.Layer<any>
  provides: ReadonlyArray<Context.Tag<any, any>>
}): ParagonHostBinding => ({
  name: opts.name,
  layer: opts.layer as Layer.Layer<KernelCaps>,
  provides: opts.provides
})

export const bindingProvidesAll = (
  binding: ParagonHostBinding,
  tags: ReadonlyArray<Context.Tag<any, any>>
): Effect.Effect<void, Error> =>
  Effect.gen(function* () {
    const errs = tags.filter((t) => !binding.provides.includes(t as any))
    if (errs.length > 0) {
      const ids = errs.map((t: any) => t.key ?? t.identifier ?? String(t)).join(", ")
      return yield* Effect.fail(new Error(`binding ${binding.name} missing caps: ${ids}`))
    }
  })
