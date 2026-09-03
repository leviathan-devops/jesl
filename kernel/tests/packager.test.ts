import { describe, it, expect } from "@effect/vitest"
import { Effect } from "effect"
import { decodeDoc, validateDoc } from "../core/schema"
import { isKnownKindSync, InMemoryWriter, canonicalJson } from "../packager/shared"
import { emitTool } from "../packager/tool"
import { emitChain } from "../packager/chain"
import { emitSkill, SKILL_LAUNCH_LINE } from "../packager/skill"
import * as Fs from "node:fs"
import * as Path from "node:path"

const fixturesDir = Path.join(import.meta.dirname ?? Path.dirname(new URL(import.meta.url).pathname), "..", "fixtures")
const mechGateRaw = JSON.parse(Fs.readFileSync(Path.join(fixturesDir, "mech-gate.json"), "utf-8"))
const badUnknownRaw = JSON.parse(Fs.readFileSync(Path.join(fixturesDir, "bad-unknown-kind.json"), "utf-8"))

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))
const outBase = Path.join(Fs.mkdtempSync(Path.join(Path.sep + "tmp", "jesl-pack-")), "out")

describe("packager — emitTool", () => {
  it.effect("manifest names the workflow", () =>
    Effect.gen(function* () {
      const m = yield* emitTool(mechGateRaw)
      expect(m.name).toBe("mech-gate")
      expect(m.$schema).toBe("trident-workflow-v1")
    }))

  it.effect("launch command contains jesl run", () =>
    Effect.gen(function* () {
      const m = yield* emitTool(mechGateRaw)
      expect(m.command).toContain("jesl run")
      expect(m.command).toContain("mech-gate")
    }))

  it.effect("inputSchema carries vars", () =>
    Effect.gen(function* () {
      const m = yield* emitTool(mechGateRaw)
      expect(m.inputSchema.vars).toEqual({ event: "seed" })
    }))

  it.effect("re-validation: decodeDoc on preserved doc passes", () =>
    Effect.gen(function* () {
      const m = yield* emitTool(mechGateRaw)
      const decoded = yield* decodeDoc(m.doc as unknown)
      expect(decoded.meta.name).toBe("mech-gate")
      const v = yield* validateDoc(decoded, isKnownKindSync).pipe(Effect.either)
      expect(v._tag).toBe("Right")
    }))

  it.effect("schema refusal BEFORE artifact on invalid doc", () =>
    Effect.gen(function* () {
      const res = yield* emitTool(badUnknownRaw).pipe(Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") {
        const err: any = res.left
        expect(String(err.code)).toContain("[JESL UNKNOWN-NODE]")
      }
    }))

  it.effect("determinism: emitTool twice deep-equal", () =>
    Effect.gen(function* () {
      const a = yield* emitTool(mechGateRaw)
      const b = yield* emitTool(clone(mechGateRaw))
      expect(canonicalJson(a)).toBe(canonicalJson(b))
    }))
})

describe("packager — emitChain", () => {
  it.effect("every node kind isKnownKindSync true", () =>
    Effect.gen(function* () {
      const c = yield* emitChain(mechGateRaw)
      for (const s of c.steps) {
        expect(isKnownKindSync(s.tool)).toBe(true)
      }
    }))

  it.effect("via names match edges", () =>
    Effect.gen(function* () {
      const c = yield* emitChain(mechGateRaw)
      const edgeVias = new Set(mechGateRaw.edges.map((e: any) => e.via))
      for (const s of c.steps) {
        if (s.via) expect(edgeVias.has(s.via)).toBe(true)
      }
      const stepVias = c.steps.map((s) => s.via).filter(Boolean)
      expect(stepVias.length).toBeGreaterThan(0)
    }))

  it.effect("covers EVERY doc node — no silent drops", () =>
    Effect.gen(function* () {
      const c = yield* emitChain(mechGateRaw)
      expect(c.steps.length).toBe(mechGateRaw.nodes.length)
      const ids = new Set(c.steps.map((s) => s.id))
      for (const n of mechGateRaw.nodes) expect(ids.has(n.id)).toBe(true)
    }))

  it.effect("each step has tool=node.type and args=node.config", () =>
    Effect.gen(function* () {
      const c = yield* emitChain(mechGateRaw)
      const triplet = c.steps.find((s) => s.id === "triplet")!
      expect(triplet.tool).toBe("triplet-writer")
      expect(triplet.args).toEqual({ triplet: { pattern: "mech.gate", state: "PASS", anchor: "mech-gate:1" } })
    }))

  it.effect("determinism: emitChain twice deep-equal", () =>
    Effect.gen(function* () {
      const a = yield* emitChain(mechGateRaw)
      const b = yield* emitChain(clone(mechGateRaw))
      expect(canonicalJson(a)).toBe(canonicalJson(b))
    }))

  it.effect("refusal on invalid doc before artifact", () =>
    Effect.gen(function* () {
      const res = yield* emitChain(badUnknownRaw).pipe(Effect.either)
      expect(res._tag).toBe("Left")
      if (res._tag === "Left") expect(String((res.left as any).code)).toContain("[JESL UNKNOWN-NODE]")
    }))
})

describe("packager — emitSkill", () => {
  it.effect("directory structure exists in-memory", () =>
    Effect.gen(function* () {
      const w = new InMemoryWriter()
      const r = yield* emitSkill(mechGateRaw, outBase, w)
      expect(r.skillDir).toBe(Path.join(outBase, "mech-gate"))
      expect(w.has(Path.join(outBase, "mech-gate", "SKILL.md"))).toBe(true)
      expect(w.has(Path.join(outBase, "mech-gate", "payload", "workflow.json"))).toBe(true)
      expect(w.has(Path.join(outBase, "mech-gate", "payload", "ctx.json"))).toBe(true)
      expect(w.has(Path.join(outBase, "mech-gate", "payload", "mission.md"))).toBe(true)
      expect(w.has(Path.join(outBase, "mech-gate", "payload", "anti-patterns.json"))).toBe(true)
    }))

  it.effect("payload/workflow.json byte-equal to source doc", () =>
    Effect.gen(function* () {
      const w = new InMemoryWriter()
      yield* emitSkill(mechGateRaw, outBase, w)
      const stored = w.get(Path.join(outBase, "mech-gate", "payload", "workflow.json"))!
      expect(stored).toBe(canonicalJson(mechGateRaw))
      const reparsed = JSON.parse(stored)
      expect(reparsed).toEqual(mechGateRaw)
    }))

  it.effect("ctx.json carries vars", () =>
    Effect.gen(function* () {
      const w = new InMemoryWriter()
      yield* emitSkill(mechGateRaw, outBase, w)
      const ctx = JSON.parse(w.get(Path.join(outBase, "mech-gate", "payload", "ctx.json"))!)
      expect(ctx.vars).toEqual({ event: "seed" })
    }))

  it.effect("RE-VALIDATION: decodeDoc payload/workflow.json + validateDoc passes", () =>
    Effect.gen(function* () {
      const w = new InMemoryWriter()
      yield* emitSkill(mechGateRaw, outBase, w)
      const raw = JSON.parse(w.get(Path.join(outBase, "mech-gate", "payload", "workflow.json"))!)
      const doc = yield* decodeDoc(raw)
      const v = yield* validateDoc(doc, isKnownKindSync).pipe(Effect.either)
      expect(v._tag).toBe("Right")
    }))

  it.effect("SKILL.md launch line exactly jesl run payload/workflow.json --in payload/ctx.json", () =>
    Effect.gen(function* () {
      const w = new InMemoryWriter()
      yield* emitSkill(mechGateRaw, outBase, w)
      const md = w.get(Path.join(outBase, "mech-gate", "SKILL.md"))!
      expect(md).toContain(SKILL_LAUNCH_LINE)
      expect(SKILL_LAUNCH_LINE).toBe("jesl run payload/workflow.json --in payload/ctx.json")
      const lines = md.split("\n").filter((l) => l.includes("jesl run"))
      expect(lines.some((l) => l.trim() === SKILL_LAUNCH_LINE)).toBe(true)
    }))

  it.effect("writer receives files atomically — no partial writes on refusal", () =>
    Effect.gen(function* () {
      const w = new InMemoryWriter()
      const res = yield* emitSkill(badUnknownRaw, outBase, w).pipe(Effect.either)
      expect(res._tag).toBe("Left")
      expect(w.list().length).toBe(0)
    }))

  it.effect("outDir variations handled", () =>
    Effect.gen(function* () {
      const w = new InMemoryWriter()
      const base2 = outBase + Path.sep
      const r = yield* emitSkill(mechGateRaw, base2, w)
      expect(r.skillDir).toBe(Path.join(outBase, "mech-gate"))
    }))
})
