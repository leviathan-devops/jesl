import { Context, Effect, Layer, Option } from "effect"
import { Bus, type BusEvent } from "../core/bus"
import { Journal } from "../core/journal"

export interface LspDiagnosticsPayload {
  readonly tool: "effect-lsp"
  readonly available: boolean
  readonly file: string
  readonly diagnostics: ReadonlyArray<unknown>
}

export interface LspCapService {
  readonly diagnose: (file: string) => Effect.Effect<ReadonlyArray<unknown>, unknown>
}

export class LspCap extends Context.Tag("jesl/LspCap")<LspCap, LspCapService>() {}

export const InMemoryLsp = (findings: ReadonlyArray<unknown>) =>
  Layer.succeed(LspCap, {
    diagnose: (_file: string) => Effect.succeed(findings)
  })

export const makeInMemoryLsp = (findings: ReadonlyArray<unknown>) => InMemoryLsp(findings)

function extractFile(payload: unknown): string {
  if (typeof payload === "string") return payload
  if (payload !== null && typeof payload === "object") {
    const p = payload as Record<string, unknown>
    const cand = p["file"] ?? p["path"] ?? p["filename"] ?? p["name"]
    if (typeof cand === "string") return cand
  }
  return ""
}

export const attachLspScanner = Effect.gen(function* () {
  const bus: any = yield* Bus as any
  const handler = (e: BusEvent): Effect.Effect<void> =>
    (Effect.gen(function* () {
      const file = extractFile(e.payload)
      if (file !== "" && !file.endsWith(".ts")) {
        return
      }
      const capOpt: any = yield* (Effect.serviceOption(LspCap) as any)
      let payload: LspDiagnosticsPayload
      if (Option.isSome(capOpt as any)) {
        const findings: any = yield* ((capOpt as any).value.diagnose(file) as any).pipe(
          Effect.catchAll(() => Effect.succeed([] as ReadonlyArray<unknown>)) as any
        )
        payload = { tool: "effect-lsp", available: true, file, diagnostics: findings }
      } else {
        payload = { tool: "effect-lsp", available: false, file, diagnostics: [] }
      }
      yield* (bus.emit("lsp.diagnostics", payload, e.run) as any).pipe(
        Effect.catchAllCause(() => Effect.void) as any
      )
      const journalOpt: any = yield* (Effect.serviceOption(Journal) as any)
      if (Option.isSome(journalOpt as any)) {
        const j: any = (journalOpt as any).value
        yield* (j
          .append({
            run: e.run,
            node: file || "lsp",
            kind: "lsp.diagnostics",
            source: "scanner/lsp",
            evidence: {
              pattern: "lsp.diagnostics",
              state: payload.available ? "available" : "unavailable",
              anchor: file || "unknown"
            }
          }) as any
        ).pipe(Effect.catchAllCause(() => Effect.void) as any)
      }
    }) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)

  yield* (bus.subscribe("*write*", handler) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
})

export const LspScannerLive = Layer.scopedDiscard(attachLspScanner as any)
