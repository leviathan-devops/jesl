import { Context, Effect, Ref, Clock, Layer } from "effect"
import { Bus, type BusEvent, type BusService } from "../core/bus"
import { PBA_HIT_EVENT } from "../scanners/shared"

export interface ArmingState {
  readonly family: string
  readonly armedAtSeq: number
  readonly armedUntilSeq: number
  readonly escalationCount: number
  readonly deadlineWindow: number
  readonly skipTier: number
}

export interface BehaviorEngineService {
  readonly isArmed: (family: string) => Effect.Effect<boolean>
  readonly isArmedForTool: (tool: string) => Effect.Effect<boolean>
  readonly armedFamilyForTool: (tool: string) => Effect.Effect<string | null>
  readonly getState: (family: string) => Effect.Effect<ArmingState | null>
  readonly getAllArmed: () => Effect.Effect<ReadonlyArray<string>>
  readonly getSeq: () => Effect.Effect<number>
  readonly advanceSeq: (by?: number) => Effect.Effect<void>
  readonly _seqRef: Ref.Ref<number>
  readonly _stateRef: Ref.Ref<Map<string, ArmingState>>
}

export class BehaviorEngine extends Context.Tag("jesl/BehaviorEngine")<BehaviorEngine, BehaviorEngineService>() {}

// Provenance: Paragon_Microstructures/ms-escalation-memory/src/core/engine.ts sha 036479f9a32d7b26e6a8d1ca6965599507f2b312ccdbd225c3c8707f2ab91b43
// COMPACTION_SURVIVAL §15 — escalation windows 5/2/0
export const ESCALATION_WINDOW_TABLE: Readonly<Record<string, number>> = {
  "0": 5,
  "1": 5,
  "2": 2,
  "3+": 0,
} as const

export function computeDeadline(escalationCount: number): number {
  if (!Number.isFinite(escalationCount)) throw new Error("computeDeadline: escalationCount must be finite")
  if (escalationCount < 0) throw new Error("computeDeadline: escalationCount must be >=0")
  const c = Math.floor(escalationCount)
  if (c <= 1) return 5
  if (c === 2) return 2
  return 0
}

export function computeSkipTier(escalationCount: number): number {
  if (!Number.isFinite(escalationCount)) throw new Error("computeSkipTier: escalationCount must be finite")
  if (escalationCount < 0) throw new Error("computeSkipTier: escalationCount must be >=0")
  const c = Math.floor(escalationCount)
  if (c <= 1) return 0
  if (c === 2) return 2
  return 3
}

// Provenance: Codename:PARAGON/src/sentinel/synapse.ts sha 2bca251b0a16f2f78470cc9af0392acf3cb4ac17bfaa1723995eb3c191b9d707
// COMPACTION_SURVIVAL §15 — refractory 25 seq
export const REFRACTORY_SEQ = 25

// Provenance: same synapse.ts sha 2bca251b0a16f2f78470cc9af0392acf3cb4ac17bfaa1723995eb3c191b9d707
// COMPACTION_SURVIVAL §15 — alpha 0.05 per seq, SEED_THRESHOLD_REGISTER.decayAlpha
export const ALPHA_DECAY = 0.05

// Provenance: same synapse.ts — fireThreshold 1.0 thr-v1
export const FIRE_THRESHOLD = 1.0

// Provenance: pba-banks.ts — 5 families from ms-ratio-classifier sha 5306849c6df347fa4f27b17ad5f90e779e2a5b5a37f10b9ab7ea013078c1976e
// Family → tool-class map — thin state-holder around W3 scanner verdicts (D12 WRAP-NEVER-REWRITE)
export const FAMILY_TOOL_MAP: Readonly<Record<string, ReadonlyArray<string>>> = {
  TEST_EVASION: ["bash", "shell", "shell-exec", "exec"],
  THEATRICAL: ["bash", "shell"],
  PROMPT_INJECTION: ["subagent", "dispatch"],
  TOOL_ABUSE: ["write", "write_file", "edit", "file"],
  EVASION_LOOP: ["bash", "exec"],
} as const

export const ALL_KNOWN_FAMILIES = ["TEST_EVASION", "THEATRICAL", "PROMPT_INJECTION", "TOOL_ABUSE", "EVASION_LOOP"] as const

function decayAlphaFactor(deltaSeq: number): number {
  return Math.exp(-ALPHA_DECAY * deltaSeq)
}

export const makeBehaviorEngine = Effect.gen(function* () {
  const seqRef = yield* Ref.make(0)
  const stateRef = yield* Ref.make(new Map<string, ArmingState>())

  const pbaHandler = (e: BusEvent): Effect.Effect<void> =>
    Effect.gen(function* () {
      const p: any = e.payload
      const family = typeof p?.family === "string" ? p.family : null
      if (!family) return
      const seq = yield* Ref.get(seqRef)
      const nextSeq = seq + 1
      yield* Ref.set(seqRef, nextSeq)
      const existing = (yield* Ref.get(stateRef)).get(family)
      const prevCount = existing?.escalationCount ?? 0
      const withinRefractory = existing !== null && existing !== undefined && (nextSeq - existing.armedAtSeq) < REFRACTORY_SEQ
      if (withinRefractory && existing) {
        const decay = decayAlphaFactor(nextSeq - existing.armedAtSeq)
        if (decay < 0.3) return
      }
      const nextCount = prevCount + 1
      const window = computeDeadline(prevCount)
      const armedUntil = nextSeq + window
      const skipTier = computeSkipTier(prevCount)
      const state: ArmingState = {
        family,
        armedAtSeq: nextSeq,
        armedUntilSeq: armedUntil,
        escalationCount: nextCount,
        deadlineWindow: window,
        skipTier,
      }
      yield* Ref.update(stateRef, (m) => {
        const n = new Map(m)
        n.set(family, state)
        return n
      })
    }).pipe(Effect.catchAllCause(() => Effect.void))

  const bus = yield* Bus
  yield* bus.subscribe(PBA_HIT_EVENT, pbaHandler).pipe(Effect.catchAllCause(() => Effect.void))

  const svc: BehaviorEngineService = {
    isArmed: (family: string) =>
      Effect.gen(function* () {
        const m = yield* Ref.get(stateRef)
        const s = m.get(family)
        if (!s) return false
        const seq = yield* Ref.get(seqRef)
        if (seq > s.armedUntilSeq) return false
        if (s.deadlineWindow === 0 && seq > s.armedAtSeq) {
          return seq === s.armedAtSeq
        }
        return true
      }),
    isArmedForTool: (tool: string) =>
      Effect.gen(function* () {
        const m = yield* Ref.get(stateRef)
        const seq = yield* Ref.get(seqRef)
        for (const [family, state] of m) {
          if (seq > state.armedUntilSeq) continue
          if (state.deadlineWindow === 0 && seq > state.armedAtSeq) {
            if (seq !== state.armedAtSeq) continue
          }
          const tools = (FAMILY_TOOL_MAP as any)[family] as ReadonlyArray<string> | undefined
          if (tools && tools.includes(tool)) return true
        }
        return false
      }),
    armedFamilyForTool: (tool: string) =>
      Effect.gen(function* () {
        const m = yield* Ref.get(stateRef)
        const seq = yield* Ref.get(seqRef)
        for (const [family, state] of m) {
          if (seq > state.armedUntilSeq) continue
          if (state.deadlineWindow === 0 && seq > state.armedAtSeq) {
            if (seq !== state.armedAtSeq) continue
          }
          const tools = (FAMILY_TOOL_MAP as any)[family] as ReadonlyArray<string> | undefined
          if (tools && tools.includes(tool)) return family
        }
        return null
      }),
    getState: (family: string) =>
      Effect.gen(function* () {
        const m = yield* Ref.get(stateRef)
        return m.get(family) ?? null
      }),
    getAllArmed: () =>
      Effect.gen(function* () {
        const m = yield* Ref.get(stateRef)
        const seq = yield* Ref.get(seqRef)
        const out: string[] = []
        for (const [family, state] of m) {
          if (seq > state.armedUntilSeq) continue
          if (state.deadlineWindow === 0 && seq > state.armedAtSeq) {
            if (seq !== state.armedAtSeq) continue
          }
          out.push(family)
        }
        return out
      }),
    getSeq: () => Ref.get(seqRef),
    advanceSeq: (by = 1) => Ref.update(seqRef, (n) => n + by),
    _seqRef: seqRef,
    _stateRef: stateRef,
  }
  return svc
})

export const BehaviorEngineLive = Layer.effect(BehaviorEngine, makeBehaviorEngine)

export const BehaviorEngineTestLive = Layer.effect(BehaviorEngine, makeBehaviorEngine)
