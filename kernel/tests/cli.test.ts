import { describe, it, expect } from "@effect/vitest"
import { Effect } from "effect"
import { parseArgs } from "../cli/args"
import { handleValidate, handleRun, handleReplay, dispatch } from "../cli/handlers"
import * as Fs from "node:fs"
import * as Path from "node:path"
import * as Os from "node:os"

const fixturesDir = Path.join(import.meta.dirname ?? Path.dirname(new URL(import.meta.url).pathname), "..", "fixtures")

function fixturePath(name: string): string {
  return Path.join(fixturesDir, name)
}

describe("cli — args + handlers", () => {
  it.effect("parseArgs run with --in and --driver", () =>
    Effect.gen(function* () {
      const p = parseArgs(["bun", "jesl", "run", "doc.json", "--in", "vars.json", "--driver", "test"])
      expect(p.command).toBe("run")
      expect(p.docPath).toBe("doc.json")
      expect(p.varsPath).toBe("vars.json")
      expect(p.driver).toBe("test")
    }))

  it.effect("parseArgs validate", () =>
    Effect.gen(function* () {
      const p = parseArgs(["bun", "jesl", "validate", "doc.json"])
      expect(p.command).toBe("validate")
      expect(p.docPath).toBe("doc.json")
    }))

  it.effect("parseArgs replay", () =>
    Effect.gen(function* () {
      const p = parseArgs(["bun", "jesl", "replay", "journal.json"])
      expect(p.command).toBe("replay")
      expect(p.journalPath).toBe("journal.json")
    }))

  it.effect("validate PASS for mech-gate", () =>
    Effect.gen(function* () {
      const res = yield* handleValidate({ command: "validate", docPath: fixturePath("mech-gate.json"), raw: [] })
      expect(res.code).toBe(0)
      expect(res.stdout).toContain("ok")
      expect(res.stderr).toBe("")
    }))

  it.effect("validate refuses UNKNOWN-NODE byte-exact", () =>
    Effect.gen(function* () {
      const res = yield* handleValidate({ command: "validate", docPath: fixturePath("bad-unknown-kind.json"), raw: [] })
      expect(res.code).toBe(2)
      expect(res.stderr).toContain("[JESL UNKNOWN-NODE]")
      expect(Buffer.from("[JESL UNKNOWN-NODE]").toString("hex")).toBe(Buffer.from("[JESL UNKNOWN-NODE]").toString("hex"))
      expect(res.stdout).toBe("")
    }))

  it.effect("validate refuses CYCLE byte-exact", () =>
    Effect.gen(function* () {
      const res = yield* handleValidate({ command: "validate", docPath: fixturePath("bad-cycle.json"), raw: [] })
      expect(res.code).toBe(2)
      expect(res.stderr).toContain("[JESL CYCLE]")
      expect(res.stdout).toBe("")
    }))

  it.effect("validate refuses TIER-VIOLATION byte-exact", () =>
    Effect.gen(function* () {
      const res = yield* handleValidate({ command: "validate", docPath: fixturePath("bad-tier.json"), raw: [] })
      expect(res.code).toBe(2)
      expect(res.stderr).toContain("[JESL TIER-VIOLATION]")
      expect(res.stdout).toBe("")
    }))

  it.effect("validate refuses UNBRACKETED-GENERATION byte-exact", () =>
    Effect.gen(function* () {
      const res = yield* handleValidate({ command: "validate", docPath: fixturePath("bad-unbracketed.json"), raw: [] })
      expect(res.code).toBe(2)
      expect(res.stderr).toContain("[JESL UNBRACKETED-GENERATION]")
      expect(res.stdout).toBe("")
    }))

  it.effect("run PASS for mech-gate via test driver", () =>
    Effect.gen(function* () {
      const res = yield* handleRun({ command: "run", docPath: fixturePath("mech-gate.json"), driver: "test", raw: [] })
      expect(res.code).toBe(0)
      expect(res.stderr).toBe("")
      expect(res.stdout).toContain('"verdict"')
      expect(res.stdout).toContain('"PASS"')
      const parsed = JSON.parse(res.stdout)
      expect(parsed.verdict).toBe("PASS")
      expect(Object.keys(parsed.results).length).toBeGreaterThanOrEqual(4)
    }))

  it.effect("run CAP-UNBOUND loud fail no artifact", () =>
    Effect.gen(function* () {
      const res = yield* handleRun({ command: "run", docPath: fixturePath("needs-llm.json"), driver: "test", raw: [] })
      expect(res.code).toBe(2)
      expect(res.stderr).toContain("[JESL CAP-UNBOUND]")
      expect(res.stdout).toBe("")
    }))

  it.effect("run with --in vars seeding", () =>
    Effect.gen(function* () {
      const res = yield* handleRun({ command: "run", docPath: fixturePath("mech-gate.json"), varsPath: fixturePath("vars.json"), driver: "test", raw: [] })
      expect(res.code).toBe(0)
      expect(res.stdout).toContain('"PASS"')
    }))

  it.effect("replay restores and verifies chain", () =>
    Effect.gen(function* () {
      const runRes = yield* handleRun({ command: "run", docPath: fixturePath("mech-gate.json"), driver: "test", raw: [] })
      expect(runRes.code).toBe(0)
      const parsed = JSON.parse(runRes.stdout)
      const rows = parsed.rows ?? parsed.journal ?? []
      expect(rows.length).toBeGreaterThan(0)
      const tmp = Path.join(Os.tmpdir(), `jesl-replay-${Date.now()}.json`)
      yield* Effect.promise(() => Fs.promises.writeFile(tmp, JSON.stringify(rows), "utf-8"))
      const rep = yield* handleReplay({ command: "replay", journalPath: tmp, raw: [] })
      expect(rep.code).toBe(0)
      expect(rep.stdout).toContain('"verified"')
      expect(rep.stdout).toContain('"PASS"')
      const repParsed = JSON.parse(rep.stdout)
      expect(repParsed.verified).toBe(true)
      yield* Effect.promise(() => Fs.promises.unlink(tmp).catch(() => {}))
    }))

  it.effect("dispatch routes correctly and exit codes map", () =>
    Effect.gen(function* () {
      const v = yield* dispatch({ command: "validate", docPath: fixturePath("mech-gate.json"), raw: [] })
      expect(v.code).toBe(0)
      const r = yield* dispatch({ command: "run", docPath: fixturePath("mech-gate.json"), driver: "test", raw: [] })
      expect(r.code).toBe(0)
      const bad = yield* dispatch({ command: "validate", docPath: fixturePath("bad-unknown-kind.json"), raw: [] })
      expect(bad.code).toBe(2)
    }))
})
