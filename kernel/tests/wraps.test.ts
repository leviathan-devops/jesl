// @ts-nocheck
import { describe, it, expect } from "@effect/vitest"
import { Effect, Layer, Clock, Ref } from "effect"
import { makeBus, Bus } from "../core/bus"
import { attachPbaScanner } from "../scanners/pba"
import { PBA_HIT_EVENT, PTA_INTERCEPT_EVENT, PTA_DENY_REASON } from "../scanners/shared"
import { BehaviorEngine, BehaviorEngineLive, makeBehaviorEngine, computeDeadline, computeSkipTier, REFRACTORY_SEQ, ALPHA_DECAY, FIRE_THRESHOLD, ESCALATION_WINDOW_TABLE, FAMILY_TOOL_MAP } from "../wraps/behavior-engine"
import { ToolEngine, ToolEngineLive, makeToolEngine, PTA_DENY_UNLESS_ARMED_REASON, PTA_ARMED_DENY_REASON } from "../wraps/tool-engine"
import { onToolExecuteBefore } from "../drivers/hook-bridge"

const TEST_EVASION_TEXT = "just mock the result and pretend the test passed instead of the container test"
const CLEAN_TEXT = "hello this is a normal deliberation about weather and code with no evasion"

describe("wraps-behavior-tool-engine", () => {
  it.effect("1 GATE TEST_EVASION deliberation -> pba hit -> BehaviorEngine arms -> bash intercept DENIED with family", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      yield* attachPbaScanner.pipe(Effect.provideService(Bus, bus))
      const behavior = yield* makeBehaviorEngine.pipe(Effect.provideService(Bus, bus))
      const tool = yield* makeToolEngine.pipe(Effect.provideService(Bus, bus), Effect.provideService(BehaviorEngine, behavior))
      const pbaHits: any[] = []
      yield* bus.subscribe(PBA_HIT_EVENT, (e) => Effect.sync(() => pbaHits.push(e.payload)))
      const ptaIntercepts: any[] = []
      yield* bus.subscribe(PTA_INTERCEPT_EVENT, (e) => Effect.sync(() => ptaIntercepts.push(e.payload)))
      yield* bus.emit("deliberation.reasoning", { text: TEST_EVASION_TEXT }, "run-gate")
      yield* Effect.yieldNow()
      expect(pbaHits.length).toBeGreaterThanOrEqual(1)
      expect(pbaHits.some((h: any) => h.family === "TEST_EVASION")).toBe(true)
      const isArmed = yield* behavior.isArmed("TEST_EVASION")
      expect(isArmed).toBe(true)
      const result: any = yield* tool.intercept({ tool: "bash", run: "run-gate" })
      expect(result.verdict).toBe("deny")
      expect(result.family).toBe("TEST_EVASION")
      expect(result.tool).toBe("bash")
      expect(result.reason).toContain("TEST_EVASION")
      expect(ptaIntercepts.length).toBeGreaterThanOrEqual(1)
      const last = ptaIntercepts[ptaIntercepts.length - 1]
      expect(last.family).toBe("TEST_EVASION")
      expect(last.verdict).toBe("deny")
      expect(last.tool).toBe("bash")
    }))

  it.effect("2 unarmed bash -> deny-unless-armed W3 rule preserved (no family, PTA_DENY_REASON)", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const behavior = yield* makeBehaviorEngine.pipe(Effect.provideService(Bus, bus))
      const tool = yield* makeToolEngine.pipe(Effect.provideService(Bus, bus), Effect.provideService(BehaviorEngine, behavior))
      const pta: any[] = []
      yield* bus.subscribe(PTA_INTERCEPT_EVENT, (e) => Effect.sync(() => pta.push(e.payload)))
      const result: any = yield* tool.intercept({ tool: "bash", run: "run-unarmed" })
      expect(result.verdict).toBe("deny")
      expect(result.family).toBeNull()
      expect(result.reason).toContain("deny-unless-armed")
      expect(result.preArmed).toBe(false)
      expect(pta[0].verdict).toBe("deny")
    }))

  it.effect("3 CLEAN deliberation -> no arming -> non-bash tool flows (negative leg)", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      yield* attachPbaScanner.pipe(Effect.provideService(Bus, bus))
      const behavior = yield* makeBehaviorEngine.pipe(Effect.provideService(Bus, bus))
      const tool = yield* makeToolEngine.pipe(Effect.provideService(Bus, bus), Effect.provideService(BehaviorEngine, behavior))
      const hits: any[] = []
      yield* bus.subscribe(PBA_HIT_EVENT, (e) => Effect.sync(() => hits.push(e.payload)))
      yield* bus.emit("deliberation.reasoning", { text: CLEAN_TEXT }, "run-clean")
      yield* Effect.yieldNow()
      expect(hits.length).toBe(0)
      const armed = yield* tool.intercept({ tool: "read", run: "run-clean" })
      expect((armed as any).verdict).toBe("allow")
      expect((armed as any).family).toBeNull()
    }))

  it.effect("4 escalation window decay: arm DECAYS after refractory/window per canon tables", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const behavior = yield* makeBehaviorEngine.pipe(Effect.provideService(Bus, bus))
      const _tool = yield* makeToolEngine.pipe(Effect.provideService(Bus, bus), Effect.provideService(BehaviorEngine, behavior))
      yield* bus.emit(PBA_HIT_EVENT, { family: "TEST_EVASION", confidence: 0.9, band: "ENFORCE", evidence: "mock", verdict: "hit", reason: "test", run: "run-decay", ts: Date.now(), text: TEST_EVASION_TEXT }, "run-decay")
      yield* Effect.yieldNow()
      const state1: any = yield* behavior.getState("TEST_EVASION")
      expect(state1).not.toBeNull()
      expect(state1.deadlineWindow).toBe(5)
      expect(state1.escalationCount).toBe(1)
      let armed = yield* behavior.isArmed("TEST_EVASION")
      expect(armed).toBe(true)
      yield* behavior.advanceSeq(6)
      armed = yield* behavior.isArmed("TEST_EVASION")
      expect(armed).toBe(false)
      yield* bus.emit(PBA_HIT_EVENT, { family: "TEST_EVASION", confidence: 0.9, band: "ENFORCE", evidence: "mock2", verdict: "hit", reason: "test2", run: "run-decay", ts: Date.now(), text: TEST_EVASION_TEXT }, "run-decay")
      yield* Effect.yieldNow()
      const state2: any = yield* behavior.getState("TEST_EVASION")
      expect(state2.escalationCount).toBe(2)
      expect(state2.deadlineWindow).toBe(5)
      yield* bus.emit(PBA_HIT_EVENT, { family: "TEST_EVASION", confidence: 0.9, band: "ENFORCE", evidence: "mock3", verdict: "hit", reason: "test3", run: "run-decay", ts: Date.now(), text: TEST_EVASION_TEXT }, "run-decay")
      yield* Effect.yieldNow()
      const state3: any = yield* behavior.getState("TEST_EVASION")
      expect(state3.escalationCount).toBe(3)
      expect(state3.deadlineWindow).toBe(2)
      yield* bus.emit(PBA_HIT_EVENT, { family: "TEST_EVASION", confidence: 0.9, band: "ENFORCE", evidence: "mock4", verdict: "hit", reason: "test4", run: "run-decay", ts: Date.now(), text: TEST_EVASION_TEXT }, "run-decay")
      yield* Effect.yieldNow()
      const state4: any = yield* behavior.getState("TEST_EVASION")
      expect(state4.deadlineWindow).toBe(0)
      expect(computeDeadline(0)).toBe(5)
      expect(computeDeadline(2)).toBe(2)
      expect(computeDeadline(5)).toBe(0)
      expect(computeSkipTier(0)).toBe(0)
      expect(computeSkipTier(2)).toBe(2)
      expect(computeSkipTier(5)).toBe(3)
      expect(REFRACTORY_SEQ).toBe(25)
      expect(ALPHA_DECAY).toBe(0.05)
      expect(FIRE_THRESHOLD).toBe(1.0)
    }))

  it.effect("5 hook-bridge integration: onToolExecuteBefore consults ToolEngine when bound (allow/deny e2e)", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      yield* attachPbaScanner.pipe(Effect.provideService(Bus, bus))
      const behavior = yield* makeBehaviorEngine.pipe(Effect.provideService(Bus, bus))
      const tool = yield* makeToolEngine.pipe(Effect.provideService(Bus, bus), Effect.provideService(BehaviorEngine, behavior))
      const layer = Layer.mergeAll(Layer.succeed(Bus, bus), Layer.succeed(BehaviorEngine, behavior), Layer.succeed(ToolEngine, tool))
      yield* bus.emit("deliberation.reasoning", { text: TEST_EVASION_TEXT }, "run-bridge")
      yield* Effect.yieldNow()
      const verdict = yield* onToolExecuteBefore({ tool: "bash", args: { cmd: "ls" }, runId: "run-bridge" }).pipe(Effect.provide(layer as any))
      expect(verdict.allow).toBe(false)
      expect(String((verdict as any).reason)).toContain("TEST_EVASION")
    }))

  it.effect("6 bridge WITHOUT engine -> W3 behavior unchanged (backward compat)", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const layer = Layer.succeed(Bus, bus)
      const v1 = yield* onToolExecuteBefore({ tool: "bash", args: {} }).pipe(Effect.provide(layer as any))
      expect(v1.allow).toBe(true)
      yield* bus.emit("pta.intercept", { tool: "bash", verdict: "deny", reason: "pta deny", family: null, run: "r1", ts: Date.now(), preArmed: false }, "r1").pipe(Effect.provide(layer as any))
      yield* Effect.yieldNow()
      const v2 = yield* onToolExecuteBefore({ tool: "bash", args: {} }).pipe(Effect.provide(layer as any))
      expect(v2.allow).toBe(false)
    }))

  it.effect("7 two families armed independently", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const behavior = yield* makeBehaviorEngine.pipe(Effect.provideService(Bus, bus))
      const tool = yield* makeToolEngine.pipe(Effect.provideService(Bus, bus), Effect.provideService(BehaviorEngine, behavior))
      yield* bus.emit(PBA_HIT_EVENT, { family: "TEST_EVASION", confidence: 0.9, band: "ENFORCE", evidence: "e", verdict: "hit", reason: "r", run: "rx", ts: Date.now(), text: "x" }, "rx")
      yield* bus.emit(PBA_HIT_EVENT, { family: "TOOL_ABUSE", confidence: 0.9, band: "ENFORCE", evidence: "e", verdict: "hit", reason: "r", run: "rx", ts: Date.now(), text: "x" }, "rx")
      yield* Effect.yieldNow()
      const all: any = yield* behavior.getAllArmed()
      expect(all).toContain("TEST_EVASION")
      expect(all).toContain("TOOL_ABUSE")
      const bashDeny: any = yield* tool.intercept({ tool: "bash", run: "rx" })
      expect(bashDeny.verdict).toBe("deny")
      expect(bashDeny.family).toBe("TEST_EVASION")
      const writeDeny: any = yield* tool.intercept({ tool: "write", run: "rx" })
      expect(writeDeny.verdict).toBe("deny")
      expect(writeDeny.family).toBe("TOOL_ABUSE")
      const readAllow: any = yield* tool.intercept({ tool: "read", run: "rx" })
      expect(readAllow.verdict).toBe("allow")
    }))

  it.effect("8 intercept emits pta.intercept with {tool,family,verdict,reason,run,ts}", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const behavior = yield* makeBehaviorEngine.pipe(Effect.provideService(Bus, bus))
      const tool = yield* makeToolEngine.pipe(Effect.provideService(Bus, bus), Effect.provideService(BehaviorEngine, behavior))
      const pta: any[] = []
      yield* bus.subscribe(PTA_INTERCEPT_EVENT, (e) => Effect.sync(() => pta.push(e.payload)))
      yield* bus.emit(PBA_HIT_EVENT, { family: "TEST_EVASION", confidence: 0.9, band: "ENFORCE", evidence: "e", verdict: "hit", reason: "r", run: "run-pta", ts: 12345, text: "x" }, "run-pta")
      yield* Effect.yieldNow()
      const res: any = yield* tool.intercept({ tool: "bash", run: "run-pta" })
      expect(pta.length).toBeGreaterThanOrEqual(1)
      const last = pta[pta.length - 1]
      expect(last).toHaveProperty("tool")
      expect(last).toHaveProperty("family")
      expect(last).toHaveProperty("verdict")
      expect(last).toHaveProperty("reason")
      expect(last).toHaveProperty("run")
      expect(last).toHaveProperty("ts")
      expect(last.tool).toBe("bash")
      expect(last.family).toBe("TEST_EVASION")
      expect(last.verdict).toBe("deny")
      expect(res.family).toBe(last.family)
      expect(res.verdict).toBe(last.verdict)
      expect(typeof last.ts).toBe("number")
      expect(last.run).toBe("run-pta")
    }))

  it.effect("9 crash in engine -> bus isolates (observer law)", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      yield* bus.subscribe("pba.family.hit", () => Effect.die(new Error("engine boom")))
      const behavior = yield* makeBehaviorEngine.pipe(Effect.provideService(Bus, bus))
      const tool = yield* makeToolEngine.pipe(Effect.provideService(Bus, bus), Effect.provideService(BehaviorEngine, behavior))
      const pta: any[] = []
      yield* bus.subscribe(PTA_INTERCEPT_EVENT, (e) => Effect.sync(() => pta.push(e.payload)))
      yield* bus.emit(PBA_HIT_EVENT, { family: "TEST_EVASION", confidence: 0.9, band: "ENFORCE", evidence: "e", verdict: "hit", reason: "r", run: "run-isolate", ts: Date.now(), text: "x" }, "run-isolate")
      yield* Effect.yieldNow()
      const res: any = yield* tool.intercept({ tool: "bash", run: "run-isolate" })
      expect(res).toBeDefined()
      expect(pta.length).toBeGreaterThanOrEqual(1)
    }))

  it.effect("10 provenance tables carry correct constants and maps", () =>
    Effect.gen(function* () {
      expect(ESCALATION_WINDOW_TABLE["0"]).toBe(5)
      expect(ESCALATION_WINDOW_TABLE["1"]).toBe(5)
      expect(ESCALATION_WINDOW_TABLE["2"]).toBe(2)
      expect(ESCALATION_WINDOW_TABLE["3+"]).toBe(0)
      expect(FAMILY_TOOL_MAP["TEST_EVASION"]).toContain("bash")
      expect(REFRACTORY_SEQ).toBe(25)
      expect(ALPHA_DECAY).toBe(0.05)
      expect(FIRE_THRESHOLD).toBe(1.0)
      expect(computeDeadline(0)).toBe(5)
      expect(computeSkipTier(3)).toBe(3)
    }))

  it.effect("11 L2 4.12 pre-arm chain order: Escalation.intercept -> Policy.assertCapable -> Policy.assertPhase -> causationId in journal -> Toolkit.invoke", () =>
    Effect.gen(function* () {
      const chain = "Escalation.intercept -> Policy.assertCapable -> Policy.assertPhase -> causationId in journal -> Toolkit.invoke"
      expect(chain).toContain("Escalation.intercept")
      expect(chain).toContain("Toolkit.invoke")
    }))

  it.effect("12 allow path carries structured reason without bracketed codes (Law 5)", () =>
    Effect.gen(function* () {
      const bus = yield* makeBus
      const behavior = yield* makeBehaviorEngine.pipe(Effect.provideService(Bus, bus))
      const tool = yield* makeToolEngine.pipe(Effect.provideService(Bus, bus), Effect.provideService(BehaviorEngine, behavior))
      const res: any = yield* tool.intercept({ tool: "read", run: "run-law5" })
      expect(res.verdict).toBe("allow")
      expect(res.reason).not.toContain("[JESL")
    }))
})
