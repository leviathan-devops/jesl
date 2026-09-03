import { Effect, Option } from "effect"
import { Bus, type BusEvent } from "../core/bus"
import { Journal } from "../core/journal"

export interface TimelineEntry {
  readonly node: string
  readonly started: number
  readonly finished: number
  readonly duration: number
}

export const attachTraceScanner = Effect.gen(function* () {
  const bus: any = yield* Bus as any
  const timelines = new Map<string, Map<string, { started?: number; finished?: number }>>()

  const getMap = (run: string) => {
    let m = timelines.get(run)
    if (!m) {
      m = new Map<string, { started?: number; finished?: number }>()
      timelines.set(run, m)
    }
    return m
  }

  const extractNode = (e: BusEvent): string => {
    const p: any = e.payload
    if (p !== null && typeof p === "object") {
      const cand = p["node"] ?? p["id"] ?? p["name"]
      if (typeof cand === "string" && cand.length > 0) return cand
    }
    if (typeof e.node === "string" && e.node.length > 0) return e.node
    return "unknown"
  }

  const invokeHandler = (e: BusEvent): Effect.Effect<void> =>
    (Effect.gen(function* () {
      const run = e.run
      const node = extractNode(e)
      const m = getMap(run)
      const prev = m.get(node) ?? {}
      m.set(node, { ...prev, started: e.ts })
    }) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)

  const verdictHandler = (e: BusEvent): Effect.Effect<void> =>
    (Effect.gen(function* () {
      const run = e.run
      const node = extractNode(e)
      const m = getMap(run)
      const prev = m.get(node) ?? {}
      const started = prev.started ?? e.ts
      m.set(node, { started, finished: e.ts })
    }) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)

  const completeHandler = (e: BusEvent): Effect.Effect<void> =>
    (Effect.gen(function* () {
      const run = e.run
      const m = timelines.get(run)
      if (!m || m.size === 0) return
      const entries: TimelineEntry[] = []
      for (const [node, v] of m.entries()) {
        const started = v.started ?? e.ts
        const finished = v.finished ?? e.ts
        const duration = Math.max(0, finished - started)
        entries.push({ node, started, finished, duration })
      }
      const payload = { run, timeline: entries }
      yield* (bus.emit("trace.timeline", payload, run) as any).pipe(
        Effect.catchAllCause(() => Effect.void) as any
      )
      const journalOpt: any = yield* (Effect.serviceOption(Journal) as any)
      if (Option.isSome(journalOpt as any)) {
        const j: any = (journalOpt as any).value
        yield* (j
          .append({
            run,
            node: "__trace",
            kind: "trace.timeline",
            source: "scanner/trace",
            evidence: { pattern: "trace.timeline", state: "complete", anchor: `${run}:${entries.length}` }
          }) as any
        ).pipe(Effect.catchAllCause(() => Effect.void) as any)
      }
    }) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)

  yield* (bus.subscribe("node.invoke", invokeHandler) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
  yield* (bus.subscribe("node.verdict", verdictHandler) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)

  const completions = ["run.close", "run.complete", "run.end", "run.finished"]
  for (const p of completions) {
    yield* (bus.subscribe(p, completeHandler) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
  }
})
