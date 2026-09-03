import { describe, it, expect } from "@effect/vitest"
import { Effect } from "effect"
import * as Fs from "node:fs"
import * as Path from "node:path"
import { fileURLToPath } from "node:url"
import { decodeDoc, validateDoc } from "../core/schema"
import { runDemoSync } from "../mpse/demo"

const __filename = fileURLToPath(import.meta.url)
const __dirname = Path.dirname(__filename)
const fixturesDir = Path.resolve(__dirname, "../fixtures")
const demoFixturePath = Path.join(fixturesDir, "mpse-demo.json")

function isKnownKind(kind: string): boolean {
  const known = new Set([
    "event-filter", "capture-engine", "machine", "gate", "oracle-gate", "circuit-breaker",
    "state-machine", "journal-sink", "triplet-writer", "sqlite-sink", "replay-source",
    "pipeline", "parallel", "retry-chain", "fallback-chain", "pause", "cron-trigger",
    "event-reactivate", "ratio-classifier", "synapse", "intent-classifier",
    "escalation-memory", "evidence-gate", "layer-loader", "math-eval", "oracle-discharge",
    "claim-gate", "config-lock", "workflow-machine", "mpse-discharge", "evidence-machine",
    "audit-registry", "shell-exec", "python-exec", "http-request", "file-io", "prompt"
  ])
  return known.has(kind)
}

describe("mpse-demo gate fixture — the demo compiles; D17 reproduced", () => {
  it.effect("fixture decodes clean via decodeDoc", () =>
    Effect.gen(function* () {
      const raw = JSON.parse(Fs.readFileSync(demoFixturePath, "utf-8"))
      const doc = yield* decodeDoc(raw)
      expect(doc.$schema).toBe("trident-workflow-v1")
      expect(doc.meta.tier).toBe(1)
      expect(doc.meta.name).toBe("mpse-demo")
    }))

  it.effect("fixture validates clean via validateDoc (tier-1, known kinds, acyclic)", () =>
    Effect.gen(function* () {
      const raw = JSON.parse(Fs.readFileSync(demoFixturePath, "utf-8"))
      const doc = yield* decodeDoc(raw)
      const res = yield* validateDoc(doc, isKnownKind).pipe(Effect.either)
      expect(res._tag).toBe("Right")
    }))

  it.effect("runDemo → cards compiled >=3 (arithmetic + comparison + rule + born-off)", () =>
    Effect.gen(function* () {
      const out = runDemoSync(demoFixturePath)
      expect(out.cards.length).toBeGreaterThanOrEqual(3)
      const kinds = out.cards.map((c) => c.kind)
      expect(kinds).toContain("arithmetic")
      expect(kinds).toContain("comparison")
      expect(kinds).toContain("rule")
    }))

  it.effect("oracle registry contains every card's rule", () =>
    Effect.gen(function* () {
      const out = runDemoSync(demoFixturePath)
      for (const card of out.cards) {
        const key = card.oracleKey ?? `OR-${card.id}`
        expect(out.registry[key]).toBeDefined()
        expect(out.registry[key]!.cardId).toBe(card.id)
        expect(out.registry[key]!.expected).toBe(card.expected)
      }
      expect(Object.keys(out.registry).length).toBe(out.cards.length)
    }))

  it.effect("calibrate report: pass >=2 AND exactly 1 EXCLUDED (D17 born-off reproduction)", () =>
    Effect.gen(function* () {
      const out = runDemoSync(demoFixturePath)
      expect(out.report.pass).toBeGreaterThanOrEqual(2)
      expect(out.report.excluded).toBe(1)
      expect(out.report.fail).toBe(0)
      const excluded = out.report.rows.filter((r) => r.status === "EXCLUDED")
      expect(excluded.length).toBe(1)
      expect(excluded[0]!.reason).toContain("EXCLUDED_BORN_OFF")
      expect(excluded[0]!.nodeId).toBe("bornOff")
      expect(excluded[0]!.expected).toBe(5)
      expect(excluded[0]!.actual).toBe(4)
    }))

  it.effect("kernel prototype exists per math node", () =>
    Effect.gen(function* () {
      const out = runDemoSync(demoFixturePath)
      for (const card of out.cards) {
        const proto = out.kernel[card.id]
        expect(proto).toBeDefined()
        expect(proto!.nodeId).toBe(card.id)
        expect(proto!.activity).toContain(card.id)
        expect(proto!.workflow).toBeDefined()
      }
      expect(Object.keys(out.kernel).length).toBe(out.cards.length)
    }))

  it.effect("stubs exist per math node", () =>
    Effect.gen(function* () {
      const out = runDemoSync(demoFixturePath)
      for (const card of out.cards) {
        const stub = out.stubs[card.id]
        expect(stub).toBeDefined()
        expect((stub as string).length).toBeGreaterThan(10)
        expect(stub).toContain(card.id)
      }
      expect(Object.keys(out.stubs).length).toBe(out.cards.length)
    }))

  it.effect("PENDING-PARALLEL rows exist with exact reasons when racing (Law 7)", () =>
    Effect.gen(function* () {
      const out = runDemoSync(demoFixturePath)
      const jeslRoot = Path.resolve(__dirname, "..")
      const checks: Array<[string, string]> = [
        [Path.join(jeslRoot, "mpse/parser.ts"), "mpse/parser.ts"],
        [Path.join(jeslRoot, "mpse/rule-cards.ts"), "mpse/rule-cards.ts"],
        [Path.join(jeslRoot, "mpse/oracle.ts"), "mpse/oracle.ts"],
        [Path.join(jeslRoot, "mpse/calibrate.ts"), "mpse/calibrate.ts"],
        [Path.join(jeslRoot, "mpse/kernel-emit.ts"), "mpse/kernel-emit.ts"],
        [Path.join(jeslRoot, "mpse/stub-emit.ts"), "mpse/stub-emit.ts"],
      ]
      const missing = checks.filter(([p]) => !Fs.existsSync(p))
      if (missing.length > 0) {
        expect(out.report.pendingParallel.length).toBeGreaterThanOrEqual(1)
        for (const [, label] of missing) {
          const row = out.report.pendingParallel.find((r) => r.includes(label))
          expect(row).toBeDefined()
          expect(row!).toContain("PENDING-PARALLEL")
          expect(row!).toContain("absent")
        }
      } else {
        expect(out.report.pendingParallel.length).toBe(0)
      }
    }))

  it.effect("fixture inventory — hand-verified integer math (MPSE law)", () =>
    Effect.gen(function* () {
      const raw = JSON.parse(Fs.readFileSync(demoFixturePath, "utf-8"))
      const out = runDemoSync(demoFixturePath)
      const inv = out.report.rows.map((r) => `${r.nodeId} → expected=${String(r.expected)} actual=${String(r.actual)} status=${r.status}`)
      expect(inv.join("\n")).toContain("arith → expected=5 actual=5 status=PASS")
      expect(inv.join("\n")).toContain("compare → expected=true actual=true status=PASS")
      expect(inv.join("\n")).toContain("rule → expected=42 actual=42 status=PASS")
      expect(inv.join("\n")).toContain("bornOff → expected=5 actual=4 status=EXCLUDED")
      expect(raw.nodes.length).toBe(5)
    }))

  it.effect("runDemo output shape complete — {cards, registry, report, kernel, stubs} all populated (Law 7: never silent)", () =>
    Effect.gen(function* () {
      const out = runDemoSync(demoFixturePath)
      expect(out.cards).toBeDefined()
      expect(out.registry).toBeDefined()
      expect(out.report).toBeDefined()
      expect(out.kernel).toBeDefined()
      expect(out.stubs).toBeDefined()
      expect(out.doc).toBeDefined()
      expect(Object.keys(out.registry).length).toBeGreaterThan(0)
      expect(out.report.rows.length).toBeGreaterThan(0)
    }))
})
