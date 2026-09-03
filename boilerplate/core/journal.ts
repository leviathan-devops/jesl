import { Context, Effect, Ref, Clock, Layer } from "effect"

export interface Triplet {
  readonly pattern: string
  readonly state: string
  readonly anchor: string
}

export interface JournalRow {
  readonly seq: number
  readonly ts: number
  readonly run: string
  readonly node: string
  readonly kind: string
  readonly verdict?: string
  readonly evidence?: Triplet
  readonly source: string
  readonly prev: string
  readonly self: string
}

export type JournalRowDraft = Omit<JournalRow, "seq" | "prev" | "self" | "ts"> & { ts?: number }

export interface FileSink {
  readonly append: (path: string, line: string) => Effect.Effect<void, unknown>
  readonly read: (path: string) => Effect.Effect<string, unknown>
  readonly exists: (path: string) => Effect.Effect<boolean>
}

export class FileSinkTag extends Context.Tag("jesl/FileSink")<FileSinkTag, FileSink>() {}
export const FileSink = FileSinkTag

export class HashCap extends Context.Tag("jesl/HashCap")<HashCap, { hash: (input: string) => string }>() {}

function canonicalSerialize(value: unknown): string {
  if (value === null) return "null"
  if (typeof value !== "object") return JSON.stringify(value) as string
  if (Array.isArray(value)) return "[" + (value as unknown[]).map(canonicalSerialize).join(",") + "]"
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  const parts: string[] = []
  for (const k of keys) {
    if (k === "self") continue
    if (k === "ts") continue
    const v = obj[k]
    if (v === undefined) continue
    parts.push(JSON.stringify(k) + ":" + canonicalSerialize(v))
  }
  return "{" + parts.join(",") + "}"
}

function simpleHash(input: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0x1000193
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i)
    h1 ^= c
    h1 = Math.imul(h1, 0x01000193) >>> 0
    h2 ^= c
    h2 = Math.imul(h2, 0x5bd1e995) >>> 0
  }
  const hex = (n: number) => n.toString(16).padStart(8, "0")
  const extra = input.length.toString(16).padStart(8, "0")
  return hex(h1) + hex(h2) + extra + hex(input.length * 31 >>> 0)
}

function hashWithCap(s: string, cap?: { hash: (i: string) => string }): string {
  if (cap) return cap.hash(s)
  return simpleHash(s)
}

export interface JournalService {
  readonly append: (draft: JournalRowDraft) => Effect.Effect<JournalRow, never, any>
  readonly rows: (run?: string) => Effect.Effect<ReadonlyArray<JournalRow>>
  readonly allRows: () => Effect.Effect<ReadonlyArray<JournalRow>>
  readonly covers: (docHash: string, seed: string) => Effect.Effect<boolean, never, any>
  readonly serialize: () => Effect.Effect<string>
  readonly restore: (serialized: string) => Effect.Effect<void>
  readonly verify: (run?: string) => Effect.Effect<boolean, never, any>
  readonly verifyChain: (run?: string) => Effect.Effect<boolean, never, any>
  readonly clear: () => Effect.Effect<void>
}

export class Journal extends Context.Tag("jesl/Journal")<Journal, JournalService>() {}

export const makeJournal = Effect.gen(function* () {
  const store = yield* Ref.make(new Map<string, JournalRow[]>())
  const globalRows = yield* Ref.make<JournalRow[]>([])

  const getHashCap = Effect.gen(function* () {
    const ctx = yield* Effect.context<any>()
    const maybe = (ctx as any).unsafeMap
    if (maybe) {
      for (const [k, v] of maybe) {
        if (k && (k.key === "jesl/HashCap" || k.identifier === "jesl/HashCap" || String(k) === "jesl/HashCap")) return v as { hash: (s:string)=>string }
      }
    }
    return undefined
  }).pipe(Effect.catchAll(() => Effect.succeed(undefined)))

  const computeSelf = (rowWithoutSelf: Omit<JournalRow, "self">, cap?: { hash: (s:string)=>string }): string => {
    const canonical = canonicalSerialize(rowWithoutSelf as unknown)
    return hashWithCap(canonical + "\x00" + rowWithoutSelf.prev, cap)
  }

  const svc: JournalService = {
    append: (draft: JournalRowDraft) =>
      Effect.gen(function* () {
        const cap = (yield* Effect.context<any>()).pipe((ctx: any) => {
          try {
            const m = ctx.unsafeMap as Map<any, any>
            if (!m) return undefined
            for (const [k, v] of m) {
              const id = (k as any).key ?? (k as any).identifier ?? String(k)
              if (id === "jesl/HashCap") return v as { hash: (s:string)=>string }
            }
          } catch {}
          return undefined
        }) as { hash: (s:string)=>string } | undefined
        const now = draft.ts ?? (yield* Clock.currentTimeMillis)
        const run = draft.run
        const map = yield* Ref.get(store)
        const list = map.get(run) ?? []
        const seq = list.length
        const prev = seq === 0 ? "genesis" : list[list.length - 1]!.self
        const base: Omit<JournalRow, "self"> = {
          seq,
          ts: now,
          run: draft.run,
          node: draft.node,
          kind: draft.kind as any,
          verdict: draft.verdict as any,
          evidence: draft.evidence,
          source: draft.source,
          prev
        }
        const self = computeSelf(base, cap ?? undefined)
        const row: JournalRow = { ...base, self }
        const nextMap = new Map(map)
        nextMap.set(run, [...list, row])
        yield* Ref.set(store, nextMap)
        const g = yield* Ref.get(globalRows)
        yield* Ref.set(globalRows, [...g, row])
        return row
      }),
    rows: (run?: string) =>
      Effect.gen(function* () {
        if (run === undefined) return yield* Ref.get(globalRows)
        const m = yield* Ref.get(store)
        return m.get(run) ?? []
      }),
    allRows: () => Ref.get(globalRows),
    covers: (docHash: string, seed: string) =>
      Effect.gen(function* () {
        const cap = (yield* Effect.context<any>()).pipe((ctx: any) => {
          try {
            const mp = ctx.unsafeMap as Map<any, any>
            if (!mp) return undefined
            for (const [k, v] of mp) {
              const id = (k as any).key ?? (k as any).identifier ?? String(k)
              if (id === "jesl/HashCap") return v as { hash: (s:string)=>string }
            }
          } catch {}
          return undefined
        }) as any
        const runId = hashWithCap(docHash + "\x00" + seed, cap ?? undefined).slice(0, 16)
        const m = yield* Ref.get(store)
        const list = m.get(runId)
        if (!list || list.length === 0) return false
        const chainOk = yield* svc.verify(runId)
        if (!chainOk) return false
        return true
      }),
    serialize: () =>
      Effect.gen(function* () {
        const rows = yield* Ref.get(globalRows)
        return JSON.stringify(rows)
      }),
    restore: (serialized: string) =>
      Effect.gen(function* () {
        const parsed: JournalRow[] = JSON.parse(serialized)
        const map = new Map<string, JournalRow[]>()
        for (const r of parsed) {
          const list = map.get(r.run) ?? []
          list.push(r)
          map.set(r.run, list)
        }
        yield* Ref.set(store, map)
        yield* Ref.set(globalRows, parsed)
      }),
    verify: (run?: string) =>
      Effect.gen(function* () {
        const cap = (yield* Effect.context<any>()).pipe((ctx: any) => {
          try {
            const mp = ctx.unsafeMap as Map<any, any>
            if (!mp) return undefined
            for (const [k, v] of mp) {
              const id = (k as any).key ?? (k as any).identifier ?? String(k)
              if (id === "jesl/HashCap") return v as { hash: (s:string)=>string }
            }
          } catch {}
          return undefined
        }) as any
        const rows: JournalRow[] = run === undefined ? yield* Ref.get(globalRows) : (yield* Ref.get(store)).get(run) ?? []
        if (rows.length === 0) return true
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i]!
          const expectedPrev = i === 0 ? "genesis" : rows[i - 1]!.self
          if (r.prev !== expectedPrev) return false
          if (r.seq !== i) {
            const globalForRun = rows.filter(x => x.run === r.run)
            const idx = globalForRun.indexOf(r)
            if (r.seq !== idx) return false
          }
          const base: Omit<JournalRow, "self"> = {
            seq: r.seq,
            ts: r.ts,
            run: r.run,
            node: r.node,
            kind: r.kind as any,
            verdict: r.verdict as any,
            evidence: r.evidence,
            source: r.source,
            prev: r.prev
          }
          const recomputed = computeSelf(base, cap ?? undefined)
          if (recomputed !== r.self) return false
        }
        return true
      }),
    verifyChain: function (run?: string) { return (this as JournalService).verify(run) },
    clear: () =>
      Effect.gen(function* () {
        yield* Ref.set(store, new Map())
        yield* Ref.set(globalRows, [])
      })
  }
  return svc
})

export const JournalLive = Layer.effect(Journal, makeJournal)

export const HashCapLive = Layer.succeed(HashCap, { hash: simpleHash })

export const InMemoryJournalLive = Layer.provide(JournalLive, HashCapLive)

export class InMemorySink implements FileSink {
  private store = new Map<string, string>()
  append = (path: string, line: string): Effect.Effect<void, unknown> =>
    Effect.sync(() => { const cur = this.store.get(path) ?? ""; this.store.set(path, cur + line) })
  read = (path: string): Effect.Effect<string, unknown> =>
    Effect.sync(() => this.store.get(path) ?? "")
  exists = (path: string): Effect.Effect<boolean> =>
    Effect.sync(() => this.store.has(path))
  dump = () => new Map(this.store)
}

export const InMemorySinkLive = Layer.succeed(FileSinkTag, new InMemorySink())

export const verifyChain = (rows: ReadonlyArray<JournalRow>, hashFn?: (s:string)=>string): boolean => {
  const hf = hashFn ?? simpleHash
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!
    const expectedPrev = i === 0 ? "genesis" : rows[i - 1]!.self
    if (r.prev !== expectedPrev) return false
    const base: Omit<JournalRow, "self"> = {
      seq: r.seq, ts: r.ts, run: r.run, node: r.node, kind: r.kind as any,
      verdict: r.verdict as any, evidence: r.evidence, source: r.source, prev: r.prev
    }
    const canonical = canonicalSerialize(base as unknown)
    const recomputed = hf(canonical + "\x00" + r.prev)
    if (recomputed !== r.self) return false
  }
  return true
}

export const canonicalSerializeExport = canonicalSerialize
export const simpleHashExport = simpleHash
