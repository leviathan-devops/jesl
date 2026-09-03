import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect, TestClock } from "effect"
import { circuitBreakerNode, _resetCircuit } from "../nodes/circuit-breaker"
import { cronTriggerNode, _resetCron } from "../nodes/cron-trigger"
import { eventReactivateNode, _resetReactivate, _reactivateLog, reactivateWait } from "../nodes/event-reactivate"
import { configLockNode, _resetConfigLock } from "../nodes/config-lock"
import { layerLoaderNode, _resetLayers } from "../nodes/layer-loader"

const run = (impl: any, input: any, ctx: any = {}) => impl.invoke(input, ctx) as Effect.Effect<any, any>

describe("pattern nodes — 5 stubs", () => {
  it.effect("circuit-breaker: CLOSED initially PASS", () =>
    Effect.gen(function* () {
      _resetCircuit("cb1")
      const r: any = yield* run(circuitBreakerNode, { node: { id: "cb1", config: { cooldownMs: 100 } }, inbound: { success: true } })
      expect(r.verdict).toBe("PASS")
      expect(r.evidence.pattern).toBe("circuit-breaker")
    }))

  it.effect("circuit-breaker: 3 failures → OPEN and FAIL when OPEN", () =>
    Effect.gen(function* () {
      _resetCircuit("cb2")
      yield* run(circuitBreakerNode, { node: { id: "cb2", config: { cooldownMs: 5000 } }, inbound: { failure: true } })
      yield* run(circuitBreakerNode, { node: { id: "cb2", config: { cooldownMs: 5000 } }, inbound: { failure: true } })
      const r3: any = yield* run(circuitBreakerNode, { node: { id: "cb2", config: { cooldownMs: 5000 } }, inbound: { failure: true } })
      expect(r3.verdict).toBe("FAIL")
      expect(r3.evidence.state).toBe("OPEN")
      const r4: any = yield* run(circuitBreakerNode, { node: { id: "cb2", config: { cooldownMs: 5000 } }, inbound: { success: true } })
      expect(r4.verdict).toBe("FAIL")
      expect(r4.evidence.state).toBe("OPEN")
    }))

  it.effect("circuit-breaker: HALF_OPEN after cooldown then success → CLOSED", () =>
    Effect.gen(function* () {
      _resetCircuit("cb3")
      yield* run(circuitBreakerNode, { node: { id: "cb3", config: { cooldownMs: 10 } }, inbound: { failure: true } })
      yield* run(circuitBreakerNode, { node: { id: "cb3", config: { cooldownMs: 10 } }, inbound: { failure: true } })
      yield* run(circuitBreakerNode, { node: { id: "cb3", config: { cooldownMs: 10 } }, inbound: { failure: true } })
      yield* TestClock.adjust(20)
      const r: any = yield* run(circuitBreakerNode, { node: { id: "cb3", config: { cooldownMs: 10 } }, inbound: { success: true } })
      expect(r.verdict).toBe("PASS")
      expect(r.evidence.state).toBe("CLOSED")
    }))

  it.effect("circuit-breaker: empty inbound does not trip", () =>
    Effect.gen(function* () {
      _resetCircuit("cb4")
      const r: any = yield* run(circuitBreakerNode, { node: { id: "cb4" }, inbound: {} })
      expect(r.verdict).toBe("PASS")
    }))

  it.effect("cron-trigger: first fire PASS", () =>
    Effect.gen(function* () {
      _resetCron("cron1")
      const r: any = yield* run(cronTriggerNode, { node: { id: "cron1", config: { everyMs: 1000 } }, inbound: {} })
      expect(r.verdict).toBe("PASS")
      expect(r.evidence.state).toBe("FIRED")
      expect(r.outputs.firedAt).toBeDefined()
    }))

  it.effect("cron-trigger: not yet elapsed → INCONCLUSIVE", () =>
    Effect.gen(function* () {
      _resetCron("cron2")
      yield* run(cronTriggerNode, { node: { id: "cron2", config: { everyMs: 1000 } }, inbound: {} })
      const r: any = yield* run(cronTriggerNode, { node: { id: "cron2", config: { everyMs: 1000 } }, inbound: {} })
      expect(r.verdict).toBe("INCONCLUSIVE")
      expect(r.evidence.state).toBe("WAIT")
    }))

  it.effect("cron-trigger: after elapsed → PASS again", () =>
    Effect.gen(function* () {
      _resetCron("cron3")
      yield* run(cronTriggerNode, { node: { id: "cron3", config: { everyMs: 50 } }, inbound: {} })
      yield* TestClock.adjust(60)
      const r: any = yield* run(cronTriggerNode, { node: { id: "cron3", config: { everyMs: 50 } }, inbound: {} })
      expect(r.verdict).toBe("PASS")
    }))

  it.effect("cron-trigger: null everyMs → READY_FALSE", () =>
    Effect.gen(function* () {
      const r: any = yield* run(cronTriggerNode, { node: { id: "cron4", config: {} }, inbound: {} })
      expect(r.verdict).toBe("READY_FALSE")
    }))

  it.effect("cron-trigger: boundary everyMs 0 → FAIL", () =>
    Effect.gen(function* () {
      const r: any = yield* run(cronTriggerNode, { node: { id: "cron5", config: { everyMs: 0 } }, inbound: {} })
      expect(r.verdict).toBe("FAIL")
    }))

  it.effect("event-reactivate: PASS and wakes waiter", () =>
    Effect.gen(function* () {
      _resetReactivate("ch1")
      const fiber = yield* Effect.fork(reactivateWait("ch1"))
      yield* Effect.yieldNow()
      const r: any = yield* run(eventReactivateNode, { node: { id: "er1", config: { channel: "ch1", signal: "wake" } }, inbound: {} })
      expect(r.verdict).toBe("PASS")
      expect(r.outputs.channel).toBe("ch1")
      const v = yield* fiber.await
      const val = (v as any)._tag === "Success" ? (v as any).value : v
      expect(val).toBe("wake")
    }))

  it.effect("event-reactivate: empty inbound uses true signal", () =>
    Effect.gen(function* () {
      _resetReactivate("ch2")
      const r: any = yield* run(eventReactivateNode, { node: { id: "er2", config: { channel: "ch2" } }, inbound: {} })
      expect(r.verdict).toBe("PASS")
      expect(_reactivateLog.get("ch2")![0]).toBe(true)
    }))

  it.effect("event-reactivate: concurrent writes both PASS", () =>
    Effect.gen(function* () {
      _resetReactivate("ch3")
      const [a, b]: any = yield* Effect.all([run(eventReactivateNode, { node: { id: "er3", config: { channel: "ch3", signal: 1 } }, inbound: {} }), run(eventReactivateNode, { node: { id: "er3", config: { channel: "ch3", signal: 2 } }, inbound: {} })], { concurrency: 2 })
      expect(a.verdict).toBe("PASS")
      expect(b.verdict).toBe("PASS")
      expect(_reactivateLog.get("ch3")!.length).toBe(2)
    }))

  it.effect("config-lock: first set PASS", () =>
    Effect.gen(function* () {
      _resetConfigLock("lk1")
      const r: any = yield* run(configLockNode, { node: { id: "cl1", config: { key: "lk1", value: { a: 1 } } }, inbound: {} })
      expect(r.verdict).toBe("PASS")
      expect(r.evidence.state).toBe("LOCKED")
    }))

  it.effect("config-lock: same value PASS", () =>
    Effect.gen(function* () {
      _resetConfigLock("lk2")
      yield* run(configLockNode, { node: { id: "cl2", config: { key: "lk2", value: "v1" } }, inbound: {} })
      const r: any = yield* run(configLockNode, { node: { id: "cl2", config: { key: "lk2", value: "v1" } }, inbound: {} })
      expect(r.verdict).toBe("PASS")
      expect(r.evidence.state).toBe("LOCKED_MATCH")
    }))

  it.effect("config-lock: mutation FAIL", () =>
    Effect.gen(function* () {
      _resetConfigLock("lk3")
      yield* run(configLockNode, { node: { id: "cl3", config: { key: "lk3", value: "orig" } }, inbound: {} })
      const r: any = yield* run(configLockNode, { node: { id: "cl3", config: { key: "lk3", value: "mutated" } }, inbound: {} })
      expect(r.verdict).toBe("FAIL")
      expect(r.evidence.state).toBe("MUTATION")
    }))

  it.effect("config-lock: null inbound → READY_FALSE", () =>
    Effect.gen(function* () {
      _resetConfigLock("lk4")
      const r: any = yield* run(configLockNode, { node: { id: "lk4", config: { key: "lk4" } }, inbound: {} })
      expect(r.verdict).toBe("READY_FALSE")
    }))

  it.effect("config-lock: concurrent same-vs-different", () =>
    Effect.gen(function* () {
      _resetConfigLock("lk5")
      yield* run(configLockNode, { node: { id: "cl5", config: { key: "lk5", value: 1 } }, inbound: {} })
      const r: any = yield* run(configLockNode, { node: { id: "cl5", config: { key: "lk5", value: 1 } }, inbound: {} })
      expect(r.verdict).toBe("PASS")
      const r2: any = yield* run(configLockNode, { node: { id: "cl5", config: { key: "lk5", value: 2 } }, inbound: {} })
      expect(r2.verdict).toBe("FAIL")
    }))

  it.effect("layer-loader: PASS with known layer", () =>
    Effect.gen(function* () {
      _resetLayers("dummy")
      const r: any = yield* run(layerLoaderNode, { node: { id: "ll1", config: { layerName: "dummy" } }, inbound: {} })
      expect(r.verdict).toBe("PASS")
      expect(r.outputs.provided).toBe(true)
      expect(r.outputs.layerName).toBe("dummy")
    }))

  it.effect("layer-loader: dynamic name creates layer and PASS", () =>
    Effect.gen(function* () {
      const r: any = yield* run(layerLoaderNode, { node: { id: "ll2", config: { layerName: "myCustomLayer" } }, inbound: {} })
      expect(r.verdict).toBe("PASS")
    }))

  it.effect("layer-loader: missing name → READY_FALSE", () =>
    Effect.gen(function* () {
      const r: any = yield* run(layerLoaderNode, { node: { id: "ll3", config: {} }, inbound: {} })
      expect(r.verdict).toBe("READY_FALSE")
    }))

  it.effect("layer-loader: slash name → FAIL", () =>
    Effect.gen(function* () {
      const r: any = yield* run(layerLoaderNode, { node: { id: "ll4", config: { layerName: "bad/path/layer" } }, inbound: {} })
      expect(r.verdict).toBe("FAIL")
    }))
})
