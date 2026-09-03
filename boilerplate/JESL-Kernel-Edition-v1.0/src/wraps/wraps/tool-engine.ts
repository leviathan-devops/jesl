import { Context, Effect, Clock, Layer, Cause, Option } from "effect"
import { Bus } from "../core/bus"
import { PTA_INTERCEPT_EVENT, PTA_DENY_REASON, PTA_ALLOW_REASON } from "../scanners/shared"
import { BehaviorEngine } from "./behavior-engine"

export interface InterceptInput {
  readonly tool: string
  readonly args?: unknown
  readonly run?: string
}

export interface InterceptResult {
  readonly verdict: "allow" | "deny"
  readonly reason: string
  readonly family: string | null
  readonly tool: string
  readonly run: string
  readonly ts: number
  readonly preArmed: boolean
}

export interface ToolEngineService {
  readonly intercept: (input: InterceptInput) => Effect.Effect<InterceptResult, unknown>
}

export class ToolEngine extends Context.Tag("jesl/ToolEngine")<ToolEngine, ToolEngineService>() {}

export const PTA_DENY_UNLESS_ARMED_REASON = PTA_DENY_REASON
export const PTA_ARMED_DENY_REASON = "deny: PBA pre-arm active — family armed for tool class (L2 §4.12 pre-arm chain — BehaviorEngine armed → ToolEngine deny)"

export const makeToolEngine = Effect.gen(function* () {
  const bus = yield* Bus
  const behaviorEngine = yield* BehaviorEngine

  const svc: ToolEngineService = {
    intercept: (input: InterceptInput) =>
      Effect.gen(function* () {
        const tool = input.tool
        const run = input.run ?? "default"
        const ts = yield* Clock.currentTimeMillis
        const armedFamily = yield* behaviorEngine.armedFamilyForTool(tool).pipe(Effect.catchAllCause(() => Effect.succeed(null as string | null)))
        const isArmedForTool = armedFamily !== null
        let verdict: "allow" | "deny"
        let reason: string
        let family: string | null
        let preArmed: boolean

        if (isArmedForTool) {
          verdict = "deny"
          reason = `${PTA_ARMED_DENY_REASON} family=${armedFamily} tool=${tool}`
          family = armedFamily
          preArmed = true
        } else {
          const allArmed = yield* behaviorEngine.getAllArmed().pipe(Effect.catchAllCause(() => Effect.succeed([] as ReadonlyArray<string>)))
          if (allArmed.length === 0) {
            const isBashLike = ["bash", "shell", "shell-exec", "exec"].includes(tool)
            if (isBashLike) {
              verdict = "deny"
              reason = PTA_DENY_UNLESS_ARMED_REASON
              family = null
              preArmed = false
            } else {
              verdict = "allow"
              reason = "allow: no PBA arming for tool class — clean deliberation path (negative leg)"
              family = null
              preArmed = false
            }
          } else {
            verdict = "allow"
            reason = `allow: tool ${tool} not in armed family set [${allArmed.join(",")}] — family isolation`
            family = null
            preArmed = false
          }
        }

        const payload = { tool, family, verdict, reason, run, ts, preArmed }
        yield* bus.emit(PTA_INTERCEPT_EVENT, payload, run).pipe(Effect.catchAllCause(() => Effect.void))
        return { verdict, reason, family, tool, run, ts, preArmed }
      }).pipe(Effect.catchAllCause((cause) => {
        const defect = Cause.pretty(cause)
        return Effect.fail(new Error(`ToolEngine intercept failed loudly: ${defect}`)) as Effect.Effect<InterceptResult, unknown>
      })) as Effect.Effect<InterceptResult, unknown>,
  }
  return svc
})

export const ToolEngineLive = Layer.effect(ToolEngine, makeToolEngine)

export const makeToolEngineWithBehavior = (behaviorLayer: Layer.Layer<BehaviorEngine>) =>
  Layer.provide(ToolEngineLive, behaviorLayer)
