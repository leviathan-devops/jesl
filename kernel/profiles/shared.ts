import { Schema, Effect, Context } from "effect"
import { Shell, Fs, Http, ToolClient, Subagent, Llm, Journal, ClockTag, EmitCap } from "../core/caps"

export interface BracketSpec {
  readonly contract: string
  readonly repair: number
  readonly floor: number
}

export interface DomainModule {
  readonly name: string
  readonly caps: ReadonlyArray<Context.Tag<any, any>>
  readonly kinds: ReadonlyArray<string>
  readonly defaultTier: 1 | 2
  readonly brackets: Readonly<Record<string, BracketSpec>>
}

export const BracketSpecSchema = Schema.Struct({
  contract: Schema.String,
  repair: Schema.Number,
  floor: Schema.Number
})

export const DomainModuleSchema = Schema.Struct({
  name: Schema.String,
  caps: Schema.Array(Schema.Unknown),
  kinds: Schema.Array(Schema.String),
  defaultTier: Schema.Union(Schema.Literal(1), Schema.Literal(2)),
  brackets: Schema.Record({ key: Schema.String, value: BracketSpecSchema })
})

const KNOWN_TAGS: ReadonlyArray<Context.Tag<any, any>> = [Shell, Fs, Http, ToolClient, Subagent, Llm, Journal, ClockTag, EmitCap] as const

const isRealTag = (v: unknown): boolean => {
  const t = v as any
  return t !== null && (typeof t === "object" || typeof t === "function") && (typeof t.key === "string" || typeof t.identifier === "string" || typeof t._id === "string")
}

const isKnownTag = (v: unknown): boolean => KNOWN_TAGS.includes(v as any)

export const validateDomainModule = (m: DomainModule): ReadonlyArray<string> => {
  const errs: string[] = []
  if (typeof m.name !== "string" || m.name.length === 0) errs.push("name must be non-empty string")
  if (!Array.isArray(m.caps)) errs.push("caps must be array")
  else {
    for (const c of m.caps) {
      if (!isRealTag(c)) errs.push(`cap is not a Context.Tag: ${String(c)}`)
      else if (!isKnownTag(c)) errs.push(`cap is not a known ServiceTag: ${String((c as any).key ?? (c as any).identifier ?? c)}`)
    }
  }
  if (!Array.isArray(m.kinds) || m.kinds.length === 0) errs.push("kinds must be non-empty array")
  else {
    for (const k of m.kinds) {
      if (typeof k !== "string" || k.length === 0) errs.push(`kind must be non-empty string: ${String(k)}`)
    }
  }
  if (m.defaultTier !== 1 && m.defaultTier !== 2) errs.push("defaultTier must be 1 or 2")
  if (typeof m.brackets !== "object" || m.brackets === null) errs.push("brackets must be record")
  else {
    for (const [key, b] of Object.entries(m.brackets as Record<string, BracketSpec>)) {
      if (typeof b.contract !== "string" || b.contract.length === 0) errs.push(`bracket ${key}.contract must be non-empty string`)
      if (typeof b.repair !== "number" || b.repair < 0 || b.repair > 2) errs.push(`bracket ${key}.repair must be 0..2`)
      if (typeof b.floor !== "number" || b.floor < 0 || b.floor > 1) errs.push(`bracket ${key}.floor must be 0..1`)
    }
  }
  return errs
}

export const validateDomainModuleEffect = (m: DomainModule): Effect.Effect<void, Error> =>
  Effect.gen(function* () {
    const e = validateDomainModule(m)
    if (e.length > 0) return yield* Effect.fail(new Error(e.join("; ")))
  })

export const isValidDomainModule = (m: DomainModule): boolean => validateDomainModule(m).length === 0

export const decodeDomainModule = Schema.decodeUnknown(DomainModuleSchema)
