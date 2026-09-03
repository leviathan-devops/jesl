import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect, Layer } from "effect"
import { makeJournal, Journal } from "../core/journal"
import { Subagent } from "../core/caps"
import { runKernelsToCode, makeStubFixture } from "../kernels/kernels-to-code/activities"

const makeScriptedSubagent = (responses: Array<string | { text: string; confidence?: number } | { code: string; confidence?: number }>, counter?: { count: number }) => {
  let idx = 0
  const layer = Layer.succeed(Subagent, {
    dispatch: (_promptFile: string) => {
      if (counter) counter.count++
      const r = responses[idx] ?? responses[responses.length - 1]
      idx++
      if (typeof r === "string") return Effect.succeed(r)
      return Effect.succeed(r as any)
    }
  } as any)
  return { layer, getCount: () => idx }
}

const makePerStubSubagent = (map: Record<string, Array<string | { text: string; confidence?: number }>>, counter?: { count: number }) => {
  const perStubIdx: Record<string, number> = {}
  const layer = Layer.succeed(Subagent, {
    dispatch: (promptFile: string) => {
      if (counter) counter.count++
      const m = promptFile.match(/stub-([^.]+)\.prompt/)
      const stubId = m ? m[1]! : "unknown"
      const arr = map[stubId] ?? map["default"] ?? ["code"]
      const idx = perStubIdx[stubId] ?? 0
      perStubIdx[stubId] = idx + 1
      const r = arr[idx] ?? arr[arr.length - 1]
      if (typeof r === "string") return Effect.succeed(r)
      return Effect.succeed(r as any)
    }
  } as any)
  return layer
}

describe("kernels-to-code kernel — W8 K15 F19 #4", () => {
  it.effect("happy stub -> code -> oracle-gate PASS", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const stub = makeStubFixture("stub-a", 42)
      const { layer } = makeScriptedSubagent(["42"])
      const combined = Layer.merge(Layer.succeed(Journal, journal), layer)
      const report = yield* runKernelsToCode([stub], { runId: "k2c-happy" }).pipe(Effect.provide(combined as any)) as any
      expect(report.pass).toBe(1)
      expect(report.fail).toBe(0)
      expect(report.rows.length).toBe(1)
      expect(report.rows[0].verdict).toBe("PASS")
      expect(report.rows[0].attempts).toBe(1)
      expect(report.rows[0].code).toContain("42")
      expect(report.chainValid).toBe(true)
    }))

  it.effect("violation -> repair -> PASS (invoke counter 2)", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const stub = makeStubFixture("stub-a", 42)
      const counter = { count: 0 }
      const layer = makePerStubSubagent({ "stub-a": ["0", "42"] }, counter)
      const combined = Layer.merge(Layer.succeed(Journal, journal), layer)
      const report = yield* runKernelsToCode([stub], { runId: "k2c-repair-pass" }).pipe(Effect.provide(combined as any)) as any
      expect(report.pass).toBe(1)
      expect(report.rows[0].verdict).toBe("PASS")
      expect(report.rows[0].attempts).toBe(2)
      expect(counter.count).toBe(2)
      expect(report.chainValid).toBe(true)
    }))

  it.effect("3 violations -> FAIL", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const stub = makeStubFixture("stub-a", 42)
      const counter = { count: 0 }
      const layer = makePerStubSubagent({ "stub-a": ["0", "1", "2"] }, counter)
      const combined = Layer.merge(Layer.succeed(Journal, journal), layer)
      const report = yield* runKernelsToCode([stub], { runId: "k2c-3-violations" }).pipe(Effect.provide(combined as any)) as any
      expect(report.fail).toBe(1)
      expect(report.pass).toBe(0)
      expect(report.rows[0].verdict).toBe("FAIL")
      expect(report.rows[0].attempts).toBe(3)
      expect(counter.count).toBe(3)
      expect(report.chainValid).toBe(true)
    }))

  it.effect("journal chain intact after run", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const stubs = [makeStubFixture("stub-a", 42), makeStubFixture("stub-b", 0.6, 0.05)]
      const layer = makePerStubSubagent({ "stub-a": ["42"], "stub-b": ["0.62"] })
      const combined = Layer.merge(Layer.succeed(Journal, journal), layer)
      const runId = "k2c-journal-chain"
      const report = yield* runKernelsToCode(stubs, { runId }).pipe(Effect.provide(combined as any)) as any
      expect(report.pass).toBe(2)
      const rows = yield* journal.rows(runId).pipe(Effect.provide(Layer.succeed(Journal, journal)) as any) as any
      expect(rows.length).toBeGreaterThan(0)
      const ok = yield* journal.verify(runId).pipe(Effect.provide(Layer.succeed(Journal, journal)) as any) as any
      expect(ok).toBe(true)
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i].prev).toBe(rows[i - 1].self)
      }
      const invokeRows = rows.filter((r: any) => r.kind === "invoke")
      const verdictRows = rows.filter((r: any) => r.kind === "verdict")
      expect(invokeRows.length).toBeGreaterThanOrEqual(2)
      expect(verdictRows.length).toBeGreaterThanOrEqual(2)
    }))

  it.effect("float within epsilon -> PASS, outside -> FAIL", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const stub = makeStubFixture("stub-b", 0.6, 0.05)
      const layerPass = makeScriptedSubagent(["0.62"])
      const combinedPass = Layer.merge(Layer.succeed(Journal, journal), layerPass.layer)
      const reportPass = yield* runKernelsToCode([stub], { runId: "k2c-float-pass" }).pipe(Effect.provide(combinedPass as any)) as any
      expect(reportPass.rows[0].verdict).toBe("PASS")

      const journal2 = yield* makeJournal
      const layerFail = makeScriptedSubagent(["0.9"])
      const combinedFail = Layer.merge(Layer.succeed(Journal, journal2), layerFail.layer)
      const reportFail = yield* runKernelsToCode([stub], { runId: "k2c-float-fail" }).pipe(Effect.provide(combinedFail as any)) as any
      expect(reportFail.rows[0].verdict).toBe("FAIL")
    }))

  it.effect("NaN actual -> CONTRADICTED -> FAIL", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const stub = makeStubFixture("stub-a", 42)
      const layer = makeScriptedSubagent(["NaN"])
      const combined = Layer.merge(Layer.succeed(Journal, journal), layer.layer)
      const report = yield* runKernelsToCode([stub], { runId: "k2c-nan" }).pipe(Effect.provide(combined as any)) as any
      expect(report.rows[0].verdict).toBe("FAIL")
      expect(report.rows[0].discharges[0].status).toBe("CONTRADICTED")
    }))

  it.effect("confidence 0.4 -> INCONCLUSIVE UNCLEAR", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const stub = makeStubFixture("stub-a", 42)
      const layer = makeScriptedSubagent([{ text: "42", confidence: 0.4 }])
      const combined = Layer.merge(Layer.succeed(Journal, journal), layer.layer)
      const report = yield* runKernelsToCode([stub], { runId: "k2c-low-conf" }).pipe(Effect.provide(combined as any)) as any
      expect(report.rows[0].verdict).toBe("INCONCLUSIVE")
      expect(report.rows[0].evidence.state).toBe("UNCLEAR")
    }))
})
