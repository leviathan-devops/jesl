import { Context, Effect, Layer, Deferred, Queue } from "effect"
import type { HostTransport } from "./opencode-live"

export interface SessionService {
  readonly ask: (question: string, opts?: { timeoutMs?: number }) => Effect.Effect<string, unknown>
}

export class Session extends Context.Tag("jesl/Session")<Session, SessionService>() {}

export const makeSessionLive = (transport: HostTransport): Layer.Layer<Session> =>
  Layer.effect(Session,
    Effect.gen(function* () {
      const orderQueue = yield* Queue.unbounded<string>()
      const svc: SessionService = {
        ask: (question: string, opts?: { timeoutMs?: number }) =>
          Effect.gen(function* () {
            const def = yield* Deferred.make<string, unknown>()
            yield* Queue.offer(orderQueue, question).pipe(Effect.catchAll(() => Effect.void))
            const useTransport: Effect.Effect<string, unknown> = transport.ask(question, opts) as Effect.Effect<string, unknown>
            const fiber = yield* Effect.forkDaemon(
              Effect.gen(function* () {
                const ans = yield* useTransport
                yield* Deferred.succeed(def, ans)
              }).pipe(Effect.catchAll((e) => Deferred.fail(def, e)))
            )
            void fiber
            const result = yield* Deferred.await(def)
            return result
          })
      }
      return svc
    })
  )

export const SessionLive = makeSessionLive

export const SessionTestLive = (answers: string[]) =>
  Layer.succeed(Session, {
    ask: (q: string) => {
      const ans = answers.shift()
      if (ans === undefined) return Effect.fail(new Error("no scripted answer for: " + q))
      return Effect.succeed(ans)
    }
  })
