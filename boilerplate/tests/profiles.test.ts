import { describe, it, expect } from "@effect/vitest"
import { Effect } from "effect"
import * as fs from "node:fs"
import * as path from "node:path"
import { tridentProfile } from "../profiles/trident"
import { tradingProfile } from "../profiles/trading"
import { salesProfile } from "../profiles/sales"
import { validateDomainModule, isValidDomainModule } from "../profiles/shared"
import { Shell, Fs, Http, Llm } from "../core/caps"

const profiles = [
  { name: "trident", mod: tridentProfile },
  { name: "trading", mod: tradingProfile },
  { name: "sales", mod: salesProfile }
] as const

const knownKinds = new Set(["event-filter","capture-engine","machine","gate","oracle-gate","circuit-breaker","state-machine","journal-sink","triplet-writer","sqlite-sink","replay-source","pipeline","parallel","retry-chain","fallback-chain","pause","cron-trigger","event-reactivate","ratio-classifier","synapse","intent-classifier","escalation-memory","evidence-gate","layer-loader","math-eval","oracle-discharge","claim-gate","config-lock","workflow-machine","mpse-discharge","evidence-machine","audit-registry","shell-exec","python-exec","http-request","file-io","prompt"])

const capId = (c: any): string => String(c.key ?? c.identifier ?? c._id ?? c._tag ?? c)

describe("profiles", () => {
  it.effect("trident loads and validates against DomainModule shape", () =>
    Effect.gen(function* () {
      const errs = validateDomainModule(tridentProfile as any)
      expect(errs).toEqual([])
      expect(isValidDomainModule(tridentProfile as any)).toBe(true)
      expect(tridentProfile.name).toBe("trident")
      expect(tridentProfile.defaultTier).toBe(1)
    }))

  it.effect("trading loads and validates against DomainModule shape", () =>
    Effect.gen(function* () {
      const errs = validateDomainModule(tradingProfile as any)
      expect(errs).toEqual([])
      expect(isValidDomainModule(tradingProfile as any)).toBe(true)
      expect(tradingProfile.name).toBe("trading")
      expect(tradingProfile.defaultTier).toBe(2)
    }))

  it.effect("sales loads and validates against DomainModule shape", () =>
    Effect.gen(function* () {
      const errs = validateDomainModule(salesProfile as any)
      expect(errs).toEqual([])
      expect(isValidDomainModule(salesProfile as any)).toBe(true)
      expect(salesProfile.name).toBe("sales")
      expect(salesProfile.defaultTier).toBe(2)
    }))

  it("caps reference real Context.Tags", () => {
    for (const { name, mod } of profiles) {
      for (const c of mod.caps) {
        const id = capId(c)
        expect(id.length).toBeGreaterThan(0)
        expect(id).toMatch(/jesl|Shell|Fs|Http|Llm|Tool|Subagent|Journal|Clock|Emit/i)
      }
    }
    expect(capId(Shell)).toContain("Shell")
    expect(capId(Fs)).toContain("Fs")
    expect(capId(Http)).toContain("Http")
    expect(capId(Llm)).toContain("Llm")
  })

  it("kinds reference registry-known kinds", () => {
    for (const { name, mod } of profiles) {
      for (const k of mod.kinds) {
        expect(knownKinds.has(k), `${name} kind ${k} must be known`).toBe(true)
      }
    }
    expect(tridentProfile.kinds).toContain("shell-exec")
    expect(tradingProfile.kinds).toContain("http-request")
    expect(salesProfile.kinds).toContain("prompt")
  })

  it("zero branches proven — grep if/switch = 0 in the 3 profile files", () => {
    const base = path.resolve(import.meta.dirname ?? ".", "../profiles")
    const files = ["trident.ts", "trading.ts", "sales.ts"]
    for (const f of files) {
      const p = path.join(base, f)
      const txt = fs.readFileSync(p, "utf8")
      const withoutComments = txt.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
      const ifCount = (withoutComments.match(/\bif\b/g) ?? []).length
      const switchCount = (withoutComments.match(/\bswitch\b/g) ?? []).length
      expect(ifCount, `${f} must have 0 if branches`).toBe(0)
      expect(switchCount, `${f} must have 0 switch branches`).toBe(0)
    }
  })

  it("the 3 profiles are distinct — different cap sets", () => {
    const set = (caps: ReadonlyArray<any>) => new Set(caps.map(capId).sort())
    const tri = set(tridentProfile.caps as any)
    const tra = set(tradingProfile.caps as any)
    const sal = set(salesProfile.caps as any)
    const eq = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every(v => b.has(v))
    expect(eq(tri, tra)).toBe(false)
    expect(eq(tri, sal)).toBe(false)
    expect(eq(tra, sal)).toBe(false)
    expect(tri.has(capId(Shell))).toBe(true)
    expect(tra.has(capId(Http))).toBe(true)
    expect(sal.has(capId(Llm))).toBe(true)
  })

  it("brackets shape correct per tier", () => {
    expect(Object.keys(tridentProfile.brackets).length).toBe(0)
    expect(tradingProfile.brackets["circuit-breaker"]!.contract.length).toBeGreaterThan(0)
    expect(tradingProfile.brackets["circuit-breaker"]!.repair).toBeLessThanOrEqual(2)
    expect(salesProfile.brackets["prompt"]!.contract.length).toBeGreaterThan(0)
    expect(salesProfile.brackets["prompt"]!.repair).toBe(2)
    expect(salesProfile.brackets["prompt"]!.floor).toBeGreaterThan(0)
  })

  it.effect("validate rejects malformed profile via shared validator", () =>
    Effect.gen(function* () {
      const bad: any = { name: "", caps: [null], kinds: [], defaultTier: 3, brackets: { x: { contract: "", repair: 5, floor: 9 } } }
      const errs = validateDomainModule(bad)
      expect(errs.length).toBeGreaterThan(0)
      expect(isValidDomainModule(bad)).toBe(false)
    }))
})
