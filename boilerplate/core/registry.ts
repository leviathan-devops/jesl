import { Context, Effect, Ref, Layer } from "effect"

export type NodeFamily = "deterministic" | "ms" | "paragon" | "execution" | "generation" | "decision" | "evidence" | "orchestration"

export interface NodeImpl {
  readonly kind: string
  readonly family: NodeFamily
  readonly requiredCaps?: ReadonlyArray<string>
  readonly invoke: (input: unknown, ctx: unknown) => Effect.Effect<unknown, unknown, any>
}

export interface RegistryRow {
  readonly kind: string
  readonly family: NodeFamily
  readonly requiredCaps: ReadonlyArray<string>
  readonly since: string
}

export interface RegistryService {
  readonly register: (impl: NodeImpl) => Effect.Effect<void, Error>
  readonly replaceStub: (kind: string, impl: NodeImpl) => Effect.Effect<void, Error>
  readonly get: (kind: string) => Effect.Effect<NodeImpl | undefined>
  readonly getSync: (kind: string) => NodeImpl | undefined
  readonly isKnownKind: (kind: string) => Effect.Effect<boolean>
  readonly isKnownKindSync: (kind: string) => boolean
  readonly kinds: () => Effect.Effect<ReadonlyArray<string>>
  readonly kindsSync: () => ReadonlyArray<string>
  readonly entries: () => Effect.Effect<ReadonlyArray<RegistryRow>>
  readonly contract: (kind: string) => RegistryRow | undefined
}

export class NodeRegistry extends Context.Tag("jesl/NodeRegistry")<NodeRegistry, RegistryService>() {}

export const ALL_KINDS: ReadonlyArray<{ kind: string; family: NodeFamily }> = [
  { kind: "event-filter", family: "deterministic" },
  { kind: "capture-engine", family: "deterministic" },
  { kind: "machine", family: "deterministic" },
  { kind: "gate", family: "deterministic" },
  { kind: "oracle-gate", family: "deterministic" },
  { kind: "circuit-breaker", family: "deterministic" },
  { kind: "state-machine", family: "deterministic" },
  { kind: "journal-sink", family: "deterministic" },
  { kind: "triplet-writer", family: "deterministic" },
  { kind: "sqlite-sink", family: "deterministic" },
  { kind: "replay-source", family: "deterministic" },
  { kind: "pipeline", family: "deterministic" },
  { kind: "parallel", family: "deterministic" },
  { kind: "retry-chain", family: "deterministic" },
  { kind: "fallback-chain", family: "deterministic" },
  { kind: "pause", family: "deterministic" },
  { kind: "cron-trigger", family: "deterministic" },
  { kind: "event-reactivate", family: "deterministic" },
  { kind: "ratio-classifier", family: "decision" },
  { kind: "synapse", family: "decision" },
  { kind: "intent-classifier", family: "decision" },
  { kind: "escalation-memory", family: "decision" },
  { kind: "evidence-gate", family: "decision" },
  { kind: "layer-loader", family: "decision" },
  { kind: "math-eval", family: "decision" },
  { kind: "oracle-discharge", family: "decision" },
  { kind: "claim-gate", family: "decision" },
  { kind: "config-lock", family: "decision" },
  { kind: "workflow-machine", family: "decision" },
  { kind: "mpse-discharge", family: "decision" },
  { kind: "evidence-machine", family: "evidence" },
  { kind: "audit-registry", family: "evidence" },
  { kind: "shell-exec", family: "execution" },
  { kind: "python-exec", family: "execution" },
  { kind: "http-request", family: "execution" },
  { kind: "file-io", family: "execution" },
  { kind: "prompt", family: "generation" },
] as const

function stubImpl(kind: string, family: NodeFamily): NodeImpl {
  return {
    kind,
    family,
    requiredCaps: [],
    invoke: () =>
      Effect.succeed({
        verdict: "INCONCLUSIVE" as const,
        evidence: { pattern: `${kind}.stub`, state: "INCONCLUSIVE", anchor: `TODO:${kind}:1` },
        timing: { startMs: 0, endMs: 0 }
      })
  }
}

const globalRegistryStore = new Map<string, NodeImpl>()
for (const { kind, family } of ALL_KINDS) {
  globalRegistryStore.set(kind, stubImpl(kind, family))
}

const isStubImpl = (impl: NodeImpl): boolean => {
  try {
    const s = String((impl as any).invoke)
    if (s.includes("TODO")) return true
  } catch {}
  const caps = (impl as any).requiredCaps
  if (Array.isArray(caps) && caps.length === 0) return true
  return false
}

export const replaceStubSync = (kind: string, impl: NodeImpl): void => {
  const existing = globalRegistryStore.get(kind)
  if (!existing) throw new Error(`RegistryFrozenError: unknown kind ${kind}`)
  if (!isStubImpl(existing)) throw new Error(`RegistryFrozenError: append-only violation for kind ${kind} — real impl already registered`)
  if (existing.family !== impl.family) throw new Error(`RegistryFrozenError: family mismatch for kind ${kind}`)
  globalRegistryStore.set(kind, impl)
}

export const replaceStub = (kind: string, impl: NodeImpl): Effect.Effect<void, Error, NodeRegistry> =>
  Effect.flatMap(NodeRegistry, (r) => (r as any).replaceStub(kind, impl))

/** Sync accessor over the global registry store — the SINGLE SOURCE OF TRUTH for kind→impl
 *  resolution (the CLI handle-builder consumes this; a hardcoded kind map here would fork the
 *  registry and silently PASS-stub kinds that have real implementations — the mock-split class).
 *  Returns the registered impl (real or seeded stub) or undefined for unknown kinds. */
export const getRegisteredImplSync = (kind: string): NodeImpl | undefined => globalRegistryStore.get(kind)

export const makeRegistry = Effect.gen(function* () {
  const map = yield* Ref.make(new Map<string, NodeImpl>())
  const meta = yield* Ref.make(new Map<string, RegistryRow>())

  for (const [kind, impl] of globalRegistryStore) {
    const m = yield* Ref.get(map)
    const nm = new Map(m)
    nm.set(kind, impl)
    yield* Ref.set(map, nm)
    const mm = yield* Ref.get(meta)
    const nmm = new Map(mm)
    nmm.set(kind, { kind, family: impl.family, requiredCaps: (impl.requiredCaps ?? []) as string[], since: "v1" })
    yield* Ref.set(meta, nmm)
  }

  const svc: RegistryService = {
    register: (impl: NodeImpl) =>
      Effect.gen(function* () {
        const m = yield* Ref.get(map)
        const existing = m.get(impl.kind)
        if (existing) {
          const sameFamily = existing.family === impl.family
          const sameCaps = JSON.stringify(existing.requiredCaps ?? []) === JSON.stringify(impl.requiredCaps ?? [])
          if (sameFamily && sameCaps) return
          return yield* Effect.fail(new Error(`RegistryFrozenError: append-only violation for kind ${impl.kind}`))
        }
        const nm = new Map(m)
        nm.set(impl.kind, impl)
        yield* Ref.set(map, nm)
        const mm = yield* Ref.get(meta)
        const nmm = new Map(mm)
        nmm.set(impl.kind, { kind: impl.kind, family: impl.family, requiredCaps: (impl.requiredCaps ?? []) as string[], since: "v1" })
        yield* Ref.set(meta, nmm)
      }),
    replaceStub: (kind: string, impl: NodeImpl) =>
      Effect.gen(function* () {
        const m = yield* Ref.get(map)
        const existing = m.get(kind)
        if (!existing) return yield* Effect.fail(new Error(`RegistryFrozenError: unknown kind ${kind}`))
        if (!isStubImpl(existing)) return yield* Effect.fail(new Error(`RegistryFrozenError: append-only violation for kind ${kind} — real impl already registered`))
        if (existing.family !== impl.family) return yield* Effect.fail(new Error(`RegistryFrozenError: family mismatch for kind ${kind}`))
        const nm = new Map(m)
        nm.set(kind, impl)
        yield* Ref.set(map, nm)
        const mm = yield* Ref.get(meta)
        const nmm = new Map(mm)
        nmm.set(kind, { kind, family: impl.family, requiredCaps: (impl.requiredCaps ?? []) as string[], since: "v1" })
        yield* Ref.set(meta, nmm)
        globalRegistryStore.set(kind, impl)
      }),
    get: (kind: string) =>
      Effect.gen(function* () {
        const m = yield* Ref.get(map)
        return m.get(kind)
      }),
    getSync: (kind: string) => {
      return undefined as any
    },
    isKnownKind: (kind: string) =>
      Effect.gen(function* () {
        const m = yield* Ref.get(map)
        return m.has(kind)
      }),
    isKnownKindSync: (kind: string) => false,
    kinds: () =>
      Effect.gen(function* () {
        const m = yield* Ref.get(map)
        return [...m.keys()]
      }),
    kindsSync: () => [] as any,
    entries: () =>
      Effect.gen(function* () {
        const mm = yield* Ref.get(meta)
        return [...mm.values()]
      }),
    contract: (kind: string) => undefined
  }

  const syncCache = new Map<string, NodeImpl>()
  const syncMeta = new Map<string, RegistryRow>()
  for (const [kind, impl] of globalRegistryStore) {
    syncCache.set(kind, impl)
    syncMeta.set(kind, { kind, family: impl.family, requiredCaps: (impl.requiredCaps ?? []) as string[], since: "v1" })
  }

  const svcWithSync: RegistryService = {
    ...svc,
    getSync: (kind: string) => syncCache.get(kind),
    isKnownKindSync: (kind: string) => syncCache.has(kind),
    kindsSync: () => [...syncCache.keys()],
    contract: (kind: string) => syncMeta.get(kind),
    register: (impl: NodeImpl) =>
      Effect.gen(function* () {
        const existing = syncCache.get(impl.kind)
        if (existing) {
          const sameFamily = existing.family === impl.family
          const sameCaps = JSON.stringify(existing.requiredCaps ?? []) === JSON.stringify(impl.requiredCaps ?? [])
          if (sameFamily && sameCaps) return
          return yield* Effect.fail(new Error(`RegistryFrozenError: append-only violation for kind ${impl.kind}`))
        }
        const m = yield* Ref.get(map)
        const nm = new Map(m)
        nm.set(impl.kind, impl)
        yield* Ref.set(map, nm)
        syncCache.set(impl.kind, impl)
        globalRegistryStore.set(impl.kind, impl)
        const mm = yield* Ref.get(meta)
        const nmm = new Map(mm)
        nmm.set(impl.kind, { kind: impl.kind, family: impl.family, requiredCaps: (impl.requiredCaps ?? []) as string[], since: "v1" })
        yield* Ref.set(meta, nmm)
        syncMeta.set(impl.kind, { kind: impl.kind, family: impl.family, requiredCaps: (impl.requiredCaps ?? []) as string[], since: "v1" })
      }),
    replaceStub: (kind: string, impl: NodeImpl) =>
      Effect.gen(function* () {
        const existing = syncCache.get(kind)
        if (!existing) return yield* Effect.fail(new Error(`RegistryFrozenError: unknown kind ${kind}`))
        if (!isStubImpl(existing)) return yield* Effect.fail(new Error(`RegistryFrozenError: append-only violation for kind ${kind} — real impl already registered`))
        if (existing.family !== impl.family) return yield* Effect.fail(new Error(`RegistryFrozenError: family mismatch for kind ${kind}`))
        syncCache.set(kind, impl)
        syncMeta.set(kind, { kind, family: impl.family, requiredCaps: (impl.requiredCaps ?? []) as string[], since: "v1" })
        globalRegistryStore.set(kind, impl)
        const m = yield* Ref.get(map)
        const nm = new Map(m)
        nm.set(kind, impl)
        yield* Ref.set(map, nm)
        const mm = yield* Ref.get(meta)
        const nmm = new Map(mm)
        nmm.set(kind, { kind, family: impl.family, requiredCaps: (impl.requiredCaps ?? []) as string[], since: "v1" })
        yield* Ref.set(meta, nmm)
      })
  }

  return svcWithSync
})

export const NodeRegistryLive = Layer.effect(NodeRegistry, makeRegistry)

export const isKnownKind = (kind: string): Effect.Effect<boolean, never, NodeRegistry> =>
  Effect.flatMap(NodeRegistry, (r) => r.isKnownKind(kind))

export const register = (impl: NodeImpl): Effect.Effect<void, Error, NodeRegistry> =>
  Effect.flatMap(NodeRegistry, (r) => r.register(impl))
