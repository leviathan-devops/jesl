import { Effect, Ref, Deferred, Context } from "effect"
import { JeslChannelUnset, JeslNoSeed } from "./errors"

export interface ChannelSnapshot {
  isWritten(name: string): boolean
  get(name: string): unknown | undefined
  entries(): Readonly<Record<string, unknown>>
}

function deepCopy<T>(v: T): T {
  if (v === null || typeof v !== "object") return v
  return JSON.parse(JSON.stringify(v)) as T
}

export interface ChannelsService {
  readonly seedFrom: (vars: Record<string, unknown>) => Effect.Effect<void, JeslNoSeed>
  readonly write: (channel: string, value: unknown) => Effect.Effect<void>
  readonly read: (channel: string, nodeId: string) => Effect.Effect<unknown, JeslChannelUnset>
  readonly isWritten: (channel: string) => Effect.Effect<boolean>
  readonly snapshot: () => Effect.Effect<ChannelSnapshot>
  readonly awaitWritten: (names: ReadonlySet<string>) => Effect.Effect<void>
  readonly declareEntry: (channels: ReadonlyArray<string>) => Effect.Effect<void>
  readonly _storeRef: Ref.Ref<Map<string, unknown>>
}

export class Channels extends Context.Tag("jesl/Channels")<Channels, ChannelsService>() {}

export const makeChannels = Effect.gen(function* () {
  const store = yield* Ref.make(new Map<string, unknown>())
  const waiters = yield* Ref.make(new Map<string, Array<Deferred.Deferred<void, never>>>())
  const declared = yield* Ref.make(new Set<string>())

  const snapshotFrom = (m: Map<string, unknown>): ChannelSnapshot => {
    const copy = new Map(m)
    return {
      isWritten(name: string): boolean { return copy.has(name) },
      get(name: string): unknown | undefined {
        const v = copy.get(name)
        return v === undefined ? undefined : deepCopy(v)
      },
      entries(): Readonly<Record<string, unknown>> {
        const rec: Record<string, unknown> = {}
        for (const [k, v] of copy) rec[k] = deepCopy(v)
        return rec
      }
    }
  }

  const wake = (channel: string): Effect.Effect<void> =>
    Effect.gen(function* () {
      const w = yield* Ref.get(waiters)
      const list = w.get(channel)
      if (list && list.length > 0) {
        for (const d of list) yield* Deferred.succeed(d, undefined)
        w.delete(channel)
        yield* Ref.set(waiters, w)
      }
    })

  const svc: ChannelsService = {
    _storeRef: store,
    declareEntry(channels: ReadonlyArray<string>): Effect.Effect<void> {
      return Ref.update(declared, (s) => {
        const n = new Set(s)
        for (const c of channels) n.add(c)
        return n
      })
    },
    seedFrom(vars: Record<string, unknown>): Effect.Effect<void, JeslNoSeed> {
      return Effect.gen(function* () {
        const dec = yield* Ref.get(declared)
        if (dec.size > 0) {
          let seeded = false
          for (const ch of dec) if (Object.prototype.hasOwnProperty.call(vars, ch)) { seeded = true; break }
          if (!seeded) {
            const hasAnyVar = Object.keys(vars).length > 0
            const stillEmpty = hasAnyVar ? false : true
            if (stillEmpty || !seeded) {
              const first = [...dec][0]!
              return yield* Effect.fail(new JeslNoSeed({
                code: "[JESL NO-SEED]",
                node: first,
                field: "vars",
                expected: `seed for channel ${first}`,
                actual: "unset",
                remedy: "seed it (--in / driver channel) or fix the channel name"
              }))
            }
          }
        }
        const m = yield* Ref.get(store)
        const next = new Map(m)
        for (const [k, v] of Object.entries(vars)) next.set(k, deepCopy(v))
        yield* Ref.set(store, next)
        for (const k of Object.keys(vars)) yield* wake(k)
      })
    },
    write(channel: string, value: unknown): Effect.Effect<void> {
      return Effect.gen(function* () {
        const m = yield* Ref.get(store)
        const next = new Map(m)
        next.set(channel, deepCopy(value))
        yield* Ref.set(store, next)
        yield* wake(channel)
      })
    },
    read(channel: string, nodeId: string): Effect.Effect<unknown, JeslChannelUnset> {
      return Effect.gen(function* () {
        const m = yield* Ref.get(store)
        if (!m.has(channel)) {
          return yield* Effect.fail(new JeslChannelUnset({
            code: "[JESL CHANNEL-UNSET]",
            node: nodeId,
            field: channel,
            expected: "a written channel",
            actual: "unset",
            remedy: "seed it (--in / driver channel) or fix the edge.via name"
          }))
        }
        return deepCopy(m.get(channel))
      })
    },
    isWritten(channel: string): Effect.Effect<boolean> {
      return Effect.map(Ref.get(store), (m) => m.has(channel))
    },
    snapshot(): Effect.Effect<ChannelSnapshot> {
      return Effect.map(Ref.get(store), snapshotFrom)
    },
    awaitWritten(names: ReadonlySet<string>): Effect.Effect<void> {
      return Effect.gen(function* () {
        if (names.size === 0) return
        while (true) {
          const m = yield* Ref.get(store)
          const pending = [...names].filter((n) => !m.has(n))
          if (pending.length === 0) return
          const d = yield* Deferred.make<void, never>()
          const w = yield* Ref.get(waiters)
          for (const ch of pending) {
            const list = w.get(ch) ?? []
            list.push(d)
            w.set(ch, list)
          }
          yield* Ref.set(waiters, w)
          const m2 = yield* Ref.get(store)
          const still = pending.some((c) => !m2.has(c))
          if (!still) {
            yield* Deferred.succeed(d, undefined)
            return
          }
          yield* Deferred.await(d)
        }
      })
    }
  }
  return svc
})

export const makeTestChannels = makeChannels
