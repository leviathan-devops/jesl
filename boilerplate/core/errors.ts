import { Schema } from "effect"

export class JeslUnknownNode extends Schema.TaggedError<JeslUnknownNode>()("JeslUnknownNode", {
  code: Schema.Literal("[JESL UNKNOWN-NODE]"),
  node: Schema.String,
  field: Schema.String,
  expected: Schema.String,
  actual: Schema.String,
  remedy: Schema.String
}) {}

export class JeslCycle extends Schema.TaggedError<JeslCycle>()("JeslCycle", {
  code: Schema.Literal("[JESL CYCLE]"),
  node: Schema.String,
  field: Schema.String,
  expected: Schema.String,
  actual: Schema.String,
  remedy: Schema.String
}) {}

export class JeslTierViolation extends Schema.TaggedError<JeslTierViolation>()("JeslTierViolation", {
  code: Schema.Literal("[JESL TIER-VIOLATION]"),
  node: Schema.String,
  field: Schema.String,
  expected: Schema.String,
  actual: Schema.String,
  remedy: Schema.String
}) {}

export class JeslUnbracketedGeneration extends Schema.TaggedError<JeslUnbracketedGeneration>()("JeslUnbracketedGeneration", {
  code: Schema.Literal("[JESL UNBRACKETED-GENERATION]"),
  node: Schema.String,
  field: Schema.String,
  expected: Schema.String,
  actual: Schema.String,
  remedy: Schema.String
}) {}

export class JeslCapUnbound extends Schema.TaggedError<JeslCapUnbound>()("JeslCapUnbound", {
  code: Schema.Literal("[JESL CAP-UNBOUND]"),
  node: Schema.String,
  field: Schema.String,
  expected: Schema.String,
  actual: Schema.String,
  remedy: Schema.String
}) {}

export class JeslOracleMissing extends Schema.TaggedError<JeslOracleMissing>()("JeslOracleMissing", {
  code: Schema.Literal("[JESL ORACLE-MISSING]"),
  node: Schema.String,
  field: Schema.String,
  expected: Schema.String,
  actual: Schema.String,
  remedy: Schema.String
}) {}

export class JeslChannelUnset extends Schema.TaggedError<JeslChannelUnset>()("JeslChannelUnset", {
  code: Schema.Literal("[JESL CHANNEL-UNSET]"),
  node: Schema.String,
  field: Schema.String,
  expected: Schema.String,
  actual: Schema.String,
  remedy: Schema.String
}) {}

export class JeslNoSeed extends Schema.TaggedError<JeslNoSeed>()("JeslNoSeed", {
  code: Schema.Literal("[JESL NO-SEED]"),
  node: Schema.String,
  field: Schema.String,
  expected: Schema.String,
  actual: Schema.String,
  remedy: Schema.String
}) {}

export type JeslError =
  | JeslUnknownNode
  | JeslCycle
  | JeslTierViolation
  | JeslUnbracketedGeneration
  | JeslCapUnbound
  | JeslOracleMissing
  | JeslChannelUnset
  | JeslNoSeed

export const JESL_TOKENS = {
  UNKNOWN_NODE: "[JESL UNKNOWN-NODE]",
  CYCLE: "[JESL CYCLE]",
  TIER_VIOLATION: "[JESL TIER-VIOLATION]",
  UNBRACKETED_GENERATION: "[JESL UNBRACKETED-GENERATION]",
  CAP_UNBOUND: "[JESL CAP-UNBOUND]",
  ORACLE_MISSING: "[JESL ORACLE-MISSING]",
  CHANNEL_UNSET: "[JESL CHANNEL-UNSET]",
  NO_SEED: "[JESL NO-SEED]"
} as const
