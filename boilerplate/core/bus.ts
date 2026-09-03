import { Context, Effect, Ref, Clock, Fiber, Scope, Exit, Cause, Option } from "effect"

export interface BusEvent {
  readonly type: string
  readonly payload: Readonly<unknown>
  readonly ts: number
  readonly run: string
  readonly source: string
  readonly node?: string
}

function deepFreeze<T>(v: T): T {
  if (v === null || typeof v !== "object") return v
  if (Object.isFrozen(v)) return v
  Object.freeze(v)
  for (const k of Object.getOwnPropertyNames(v as any)) {
    const val = (v as any)[k]
    if (val !== null && typeof val === "object" && !Object.isFrozen(val)) deepFreeze(val)
  }
  return v
}

function deepCopy<T>(v: T): T {
  if (v === null || typeof v !== "object") return v
  return JSON.parse(JSON.stringify(v)) as T
}

export function globToRegex(pattern: string): RegExp {
  const esc = pattern.replace(/[-[\]{}()+?.\\^$|]/g, "\\$&")
  const reg = esc.replace(/\*/g, ".*")
  return new RegExp(`^${reg}$`)
}

export function globMatch(pattern: string, type: string): boolean {
  if (pattern === "*") return true
  if (pattern === type) return true
  if (pattern.endsWith(".*")) {
    const prefix = pattern.slice(0, -2)
    if (type === prefix) return false
    if (type.startsWith(prefix + ".")) return true
  }
  const re = globToRegex(pattern)
  if (re.test(type)) return true
  const pSegs = pattern.split(".")
  const tSegs = type.split(".")
  if (pSegs.length !== tSegs.length) return false
  for (let i = 0; i < pSegs.length; i++) {
    if (pSegs[i] === "*") continue
    if (pSegs[i] !== tSegs[i]) return false
  }
  return false
}

export interface BusSubscription {
  readonly id: string
  readonly pattern: string
  readonly handler: (e: BusEvent) => Effect.Effect<void>
  readonly runId?: string
}

export interface BusService {
  readonly emit: (type: string, payload: unknown, run?: string) => Effect.Effect<void>
  readonly emitEvent: (event: BusEvent) => Effect.Effect<void>
  readonly subscribe: (pattern: string, handler: (e: BusEvent) => Effect.Effect<void>, runId?: string) => Effect.Effect<Effect.Effect<void>>
  readonly on: (pattern: string, handler: (e: BusEvent) => Effect.Effect<void>) => Effect.Effect<Effect.Effect<void>, never, Scope.Scope>
  readonly detach: (id: string) => Effect.Effect<void>
  readonly detachAll: (runId?: string) => Effect.Effect<void>
  readonly _subsRef: Ref.Ref<Map<string, BusSubscription>>
}

export class Bus extends Context.Tag("jesl/Bus")<Bus, BusService>() {}

let subCounter = 0

export const makeBus = Effect.gen(function* () {
  const subs = yield* Ref.make(new Map<string, BusSubscription>())

  const emitEvent = (event: BusEvent): Effect.Effect<void> =>
    Effect.gen(function* () {
      const frozenPayload = deepFreeze(deepCopy(event.payload as any)) as unknown
      const frozenEvent: BusEvent = deepFreeze({
        type: event.type,
        payload: frozenPayload,
        ts: event.ts,
        run: event.run,
        source: event.source ?? `bus/${event.type}`,
        node: event.node
      } as BusEvent)
      const snapshot = yield* Ref.get(subs)
      const matching: BusSubscription[] = []
      for (const s of snapshot.values()) {
        if (globMatch(s.pattern, frozenEvent.type)) matching.push(s)
      }
      if (matching.length === 0) return
      yield* Effect.forEach(
        matching,
        (sub) =>
          Effect.gen(function* () {
            const fiber = yield* Effect.forkDaemon(
              Effect.catchAllCause(sub.handler(frozenEvent), () => Effect.void)
            )
            yield* Fiber.join(fiber).pipe(Effect.catchAllCause(() => Effect.void))
          }),
        { concurrency: "unbounded" }
      )
    })

  const emit = (type: string, payload: unknown, run: string = "default"): Effect.Effect<void> =>
    Effect.gen(function* () {
      const ts = yield* Clock.currentTimeMillis
      const event: BusEvent = {
        type,
        payload: payload as Readonly<unknown>,
        ts,
        run,
        source: `bus/${type}`
      }
      yield* emitEvent(event)
    })

  const subscribe = (
    pattern: string,
    handler: (e: BusEvent) => Effect.Effect<void>,
    runId?: string
  ): Effect.Effect<Effect.Effect<void>> =>
    Effect.gen(function* () {
      const id = `sub-${++subCounter}-${pattern}`
      const sub: BusSubscription = { id, pattern, handler, runId }
      yield* Ref.update(subs, (m) => {
        const n = new Map(m)
        n.set(id, sub)
        return n
      })
      const unsubscribe: Effect.Effect<void> = Ref.update(subs, (m) => {
        const n = new Map(m)
        n.delete(id)
        return n
      })
      return unsubscribe
    })

  const on = (
    pattern: string,
    handler: (e: BusEvent) => Effect.Effect<void>
  ): Effect.Effect<Effect.Effect<void>, never, Scope.Scope> =>
    Effect.gen(function* () {
      const scope = yield* Scope.make()
      const unsub = yield* subscribe(pattern, handler)
      yield* Scope.addFinalizer(scope, unsub)
      return unsub
    })

  const detach = (id: string): Effect.Effect<void> =>
    Ref.update(subs, (m) => {
      const n = new Map(m)
      n.delete(id)
      return n
    })

  const detachAll = (runId?: string): Effect.Effect<void> =>
    Effect.gen(function* () {
      if (runId === undefined) {
        yield* Ref.set(subs, new Map())
      } else {
        yield* Ref.update(subs, (m) => {
          const n = new Map<string, BusSubscription>()
          for (const [k, v] of m) {
            if (v.runId !== runId) n.set(k, v)
          }
          return n
        })
      }
    })

  const svc: BusService = {
    emit,
    emitEvent,
    subscribe,
    on,
    detach,
    detachAll,
    _subsRef: subs
  }
  return svc
})

export const BusLive = Effect.map(makeBus, (svc) => svc)

export const EventBus = Bus
