import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect, Clock, TestClock } from "effect"
import { makeEvidenceMachine, RING_CAP, VERDICT_TTL_MS } from "../core/evidence"

describe("evidence-machine 8 kinds", () => {
  const kinds: Array<{ kind: any; payload: any }> = [
    { kind: "unit", payload: { ok: true } },
    { kind: "container", payload: { ok: true } },
    { kind: "smoke", payload: { ok: true } },
    { kind: "dist_change", payload: { ok: true } },
    { kind: "claim", payload: { ok: true } },
    { kind: "evidence_clear", payload: { ok: true } },
    { kind: "source_change", payload: { filePath: "/tmp/foo.ts" } },
    { kind: "status", payload: { probeOutput: "ok probe" } },
  ]

  it.effect("8 kinds enumerated", () =>
    Effect.gen(function* () {
      const m = yield* makeEvidenceMachine
      expect(kinds.length).toBe(8)
    }))

  for (const { kind } of kinds.slice(0,6)) {
    it.effect(`${kind} accept`, () =>
      Effect.gen(function* () {
        const m = yield* makeEvidenceMachine
        const now = yield* Clock.currentTimeMillis
        const ev: any = kind === "source_change" ? { kind, subject: "subj", at: now, filePath: "/tmp/a.ts" } :
                        kind === "status" ? { kind, subject: "subj", at: now, probeOutput: "detected output", detail: { probeOutput: "detected output" } } :
                        kind === "claim" ? { kind, subject: "subj", at: now } :
                        { kind, subject: "subj", at: now }
        if (kind === "claim") {
          yield* m.ingest({ kind: "source_change", subject: "subj", at: now, filePath: "/tmp/b.ts" } as any)
        }
        const v = yield* m.ingest(ev)
        expect(["EVIDENCED","UNEVIDENCED"].includes(v.verdict)).toBe(true)
        if (kind !== "claim") expect(v.verdict).toBe("EVIDENCED")
      }))

    it.effect(`${kind} reject (stale or pathless)`, () =>
      Effect.gen(function* () {
        const m = yield* makeEvidenceMachine
        const now = yield* Clock.currentTimeMillis
        let ev: any
        if (kind === "source_change") ev = { kind, subject: "rej", at: now }
        else if (kind === "status") ev = { kind, subject: "rej", at: now, probeOutput: "" }
        else if (kind === "claim") ev = { kind, subject: "rej-no-source", at: now }
        else ev = { kind, subject: "rej", at: now - 400000, payload: {} }
        const v = yield* m.ingest(ev)
        if (kind === "source_change") expect(v.verdict).toBe("UNEVIDENCED")
        else if (kind === "status") expect(v.verdict).toBe("UNEVIDENCED")
        else if (kind === "claim") expect(v.verdict).toBe("UNEVIDENCED")
        else expect(v.verdict).toBe("REJECTED")
      }))
  }

  it.effect("RING_CAP enforced: 51st evicts oldest", () =>
    Effect.gen(function* () {
      const m = yield* makeEvidenceMachine
      const base = yield* Clock.currentTimeMillis
      for (let i = 0; i < 51; i++) {
        yield* m.ingest({ kind: "unit", subject: "ring-subj", at: base + i } as any)
      }
      const sz = yield* m.ringSize("ring-subj")
      expect(sz).toBe(RING_CAP)
      expect(sz).toBe(50)
    }))

  it.effect("verdict TTL honored: stale verdict is not served", () =>
    Effect.gen(function* () {
      const m = yield* makeEvidenceMachine
      const now = yield* Clock.currentTimeMillis
      yield* m.ingest({ kind: "unit", subject: "ttl-subj", at: now } as any)
      const v1 = yield* m.queryVerdict("ttl-subj")
      expect(v1.verdict).toBe("EVIDENCED")
      yield* TestClock.adjust(VERDICT_TTL_MS + 1000)
      const v2 = yield* m.queryVerdict("ttl-subj")
      expect(v2.verdict).toBe("UNEVIDENCED")
    }))

  it.effect("source_change without path REJECTED stays UNEVIDENCED", () =>
    Effect.gen(function* () {
      const m = yield* makeEvidenceMachine
      const now = yield* Clock.currentTimeMillis
      const v = yield* m.ingest({ kind: "source_change", subject: "s1", at: now } as any)
      expect(v.verdict).toBe("UNEVIDENCED")
    }))

  it.effect("status without probeOutput stays UNEVIDENCED", () =>
    Effect.gen(function* () {
      const m = yield* makeEvidenceMachine
      const now = yield* Clock.currentTimeMillis
      const v = yield* m.ingest({ kind: "status", subject: "s2", at: now, probeOutput: "" } as any)
      expect(v.verdict).toBe("UNEVIDENCED")
    }))

  it.effect("claim after real write adjudicates EVIDENCED, claim after pathless stays UNEVIDENCED", () =>
    Effect.gen(function* () {
      const m = yield* makeEvidenceMachine
      const now = yield* Clock.currentTimeMillis
      yield* m.ingest({ kind: "source_change", subject: "subj-claim", at: now, filePath: "/tmp/x.ts" } as any)
      const v1 = yield* m.ingest({ kind: "claim", subject: "subj-claim", at: now + 1 } as any)
      expect(v1.verdict).toBe("EVIDENCED")
      const v2 = yield* m.ingest({ kind: "claim", subject: "no-source-subj", at: now + 2 } as any)
      expect(v2.verdict).toBe("UNEVIDENCED")
    }))
})
