import { describe, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { makeJournal, Journal } from "../core/journal"
import { runVerify, makeArtifactFixture, type VerifyScenario } from "../kernels/verify/activities"

const artifacts = makeArtifactFixture("test")

describe("verify kernel", () => {
  it.effect("happy verify all pass -> report pass count", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const scenarios: VerifyScenario[] = [
        { name: "S1", passToken: "PASS", failToken: "", run: () => Effect.succeed("tool-result: PASS") },
        { name: "S2", passToken: "ok", failToken: "", run: () => Effect.succeed("tool-result: ok") },
        { name: "S3", passToken: "done", failToken: "", run: () => Effect.succeed("done") }
      ]
      const report = yield* runVerify(artifacts, scenarios, { runId: "verify-happy" }).pipe(Effect.provide(layer))
      if (report.pass !== 3) throw new Error(`expected pass 3 got ${report.pass}`)
      if (report.fail !== 0) throw new Error(`expected fail 0 got ${report.fail}`)
      if (report.rows.length !== 3) throw new Error(`expected 3 rows got ${report.rows.length}`)
      for (const r of report.rows) {
        if (r.verdict !== "PASS") throw new Error(`row ${r.scenario} not PASS`)
        if (!r.passTokenMatch) throw new Error(`row ${r.scenario} passTokenMatch false`)
      }
    }))

  it.effect("one failing scenario -> report shows fail", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const scenarios: VerifyScenario[] = [
        { name: "S1", passToken: "PASS", failToken: "", run: () => Effect.succeed("tool-result: PASS") },
        { name: "S2", passToken: "PASS", failToken: "", run: () => Effect.succeed("tool-result: FAIL no token") },
        { name: "S3", passToken: "done", failToken: "", run: () => Effect.succeed("done") }
      ]
      const report = yield* runVerify(artifacts, scenarios, { runId: "verify-one-fail" }).pipe(Effect.provide(layer))
      if (report.pass !== 2) throw new Error(`expected pass 2 got ${report.pass}`)
      if (report.fail !== 1) throw new Error(`expected fail 1 got ${report.fail}`)
      const failed = report.rows.find((r) => r.scenario === "S2")
      if (!failed) throw new Error("missing S2")
      if (failed.verdict !== "FAIL") throw new Error("S2 should be FAIL")
      if (failed.passTokenMatch !== false) throw new Error("S2 passTokenMatch should be false")
    }))

  it.effect("parallel branches don't kill siblings (allSettled)", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const scenarios: VerifyScenario[] = [
        { name: "S1", passToken: "ok", failToken: "", run: () => Effect.succeed("ok") },
        { name: "S2", passToken: "PASS", failToken: "", run: () => Effect.fail(new Error("crash")) as any },
        { name: "S3", passToken: "ok", failToken: "", run: () => Effect.succeed("ok") }
      ]
      const report = yield* runVerify(artifacts, scenarios, { runId: "verify-allsettled" }).pipe(Effect.provide(layer))
      if (report.rows.length !== 3) throw new Error(`expected 3 rows got ${report.rows.length}`)
      const s1 = report.rows.find((r) => r.scenario === "S1")
      const s2 = report.rows.find((r) => r.scenario === "S2")
      const s3 = report.rows.find((r) => r.scenario === "S3")
      if (!s1 || !s2 || !s3) throw new Error("missing rows")
      if (s1.verdict !== "PASS") throw new Error("S1 should PASS despite S2 fail")
      if (s3.verdict !== "PASS") throw new Error("S3 should PASS despite S2 fail")
      if (s2.verdict !== "FAIL") throw new Error("S2 should FAIL")
    }))

  it.effect("journal chain intact after verify", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const scenarios: VerifyScenario[] = [
        { name: "S1", passToken: "PASS", failToken: "", run: () => Effect.succeed("PASS") },
        { name: "S2", passToken: "PASS", failToken: "", run: () => Effect.succeed("PASS") }
      ]
      const runId = "verify-journal-chain"
      yield* runVerify(artifacts, scenarios, { runId }).pipe(Effect.provide(layer))
      const rows = yield* journal.rows(runId).pipe(Effect.provide(layer))
      if (rows.length === 0) throw new Error("no journal rows")
      const ok = yield* journal.verify(runId).pipe(Effect.provide(layer))
      if (!ok) throw new Error("journal chain invalid")
      const invokeRows = rows.filter((r: any) => r.kind === "invoke")
      const verdictRows = rows.filter((r: any) => r.kind === "verdict")
      if (invokeRows.length < 2) throw new Error(`expected >=2 invoke rows got ${invokeRows.length}`)
      if (verdictRows.length < 2) throw new Error(`expected >=2 verdict rows got ${verdictRows.length}`)
      for (let i = 1; i < rows.length; i++) {
        if (rows[i]!.prev !== rows[i - 1]!.self) throw new Error(`chain break at ${i}`)
      }
    }))

  it.effect("passToken tool-result-bound (failToken absent check)", () =>
    Effect.gen(function* () {
      const journal = yield* makeJournal
      const layer = Layer.succeed(Journal, journal)
      const scenarios: VerifyScenario[] = [
        { name: "S1", passToken: "PASS", failToken: "ERROR", run: () => Effect.succeed("PASS but also ERROR") }
      ]
      const report = yield* runVerify(artifacts, scenarios, { runId: "verify-tool-bound" }).pipe(Effect.provide(layer))
      const r = report.rows[0]!
      if (r.passTokenMatch !== true) throw new Error("passToken should match")
      if (r.failTokenAbsent !== false) throw new Error("failToken should be present => absent false")
      if (r.verdict !== "FAIL") throw new Error("should be FAIL due to failToken present")
    }))
})
