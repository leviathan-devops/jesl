import { Context, Effect, Layer, Option, Clock } from "effect"
import { Bus, type BusEvent } from "../core/bus"
import { Journal } from "../core/journal"
import { LspCap } from "../scanners/lsp"
import { PTA_INTERCEPT_EVENT } from "../scanners/shared"

export interface ArtifactGateService {
  readonly handleWrite: (file: string, run: string) => Effect.Effect<{ verdict: "allow" | "deny"; diagnostics: ReadonlyArray<unknown> }, unknown, unknown>
}

export class ArtifactGate extends Context.Tag("jesl/ArtifactGate")<ArtifactGate, ArtifactGateService>() {}

export const makeArtifactGate = Effect.gen(function* () {
  const bus: any = yield* Bus as any
  const svc: ArtifactGateService = {
    handleWrite: (file: string, run: string) =>
      Effect.gen(function* () {
        if (!file.endsWith(".ts")) {
          return { verdict: "allow" as const, diagnostics: [] as ReadonlyArray<unknown> }
        }
        const capOpt: any = yield* (Effect.serviceOption(LspCap) as any)
        let diagnostics: ReadonlyArray<unknown> = []
        let available = false
        if (Option.isSome(capOpt as any)) {
          const cap: any = (capOpt as any).value
          if (cap.isAvailable && !cap.isAvailable()) {
            available = false
            diagnostics = []
          } else {
            available = true
            diagnostics = (yield* (cap.diagnose(file) as any).pipe(
              Effect.catchAll(() => Effect.succeed([] as ReadonlyArray<unknown>)) as any
            )) as ReadonlyArray<unknown>
          }
        } else {
          available = false
          diagnostics = []
        }
        const hasErrors = diagnostics.length > 0
        const verdict: "allow" | "deny" = hasErrors ? "deny" : "allow"
        const reason = hasErrors
          ? "EFFECT_ARTIFACT_GATE: diagnostics at error severity"
          : "EFFECT_ARTIFACT_GATE: clean"
        const ts = yield* Clock.currentTimeMillis
        const payload = {
          tool: "artifact-write",
          family: "EFFECT_ARTIFACT_GATE",
          verdict,
          reason,
          run,
          ts,
          preArmed: false,
          file,
          diagnostics,
          available,
        }
        yield* (bus.emit(PTA_INTERCEPT_EVENT, payload, run) as any).pipe(
          Effect.catchAllCause(() => Effect.void) as any
        )
        const journalOpt: any = yield* (Effect.serviceOption(Journal) as any)
        if (Option.isSome(journalOpt as any)) {
          const j: any = (journalOpt as any).value
          yield* (j
            .append({
              run,
              node: file,
              kind: PTA_INTERCEPT_EVENT,
              source: "wraps/artifact-gate",
              evidence: { pattern: "lsp.diagnostics", state: verdict, anchor: `${file}:${diagnostics.length}` },
            }) as any
          ).pipe(Effect.catchAllCause(() => Effect.void) as any)
          yield* (j
            .append({
              run,
              node: file,
              kind: "lsp.diagnostics",
              source: "wraps/artifact-gate",
              evidence: { pattern: "lsp.diagnostics", state: available ? "available" : "unavailable", anchor: file },
            }) as any
          ).pipe(Effect.catchAllCause(() => Effect.void) as any)
        }
        return { verdict, diagnostics }
      }),
  }
  return svc
})

export const ArtifactGateLive = Layer.effect(ArtifactGate, makeArtifactGate)

function extractFile(payload: unknown): string {
  if (typeof payload === "string") return payload
  if (payload !== null && typeof payload === "object") {
    const p = payload as Record<string, unknown>
    const cand = p["file"] ?? p["path"] ?? p["filename"] ?? p["name"]
    if (typeof cand === "string") return cand
  }
  return ""
}

export const attachArtifactGate = Effect.gen(function* () {
  const bus: any = yield* Bus as any
  const gate: any = yield* ArtifactGate as any
  const handler = (e: BusEvent): Effect.Effect<void> =>
    (Effect.gen(function* () {
      const file = extractFile(e.payload)
      if (!file) return
      yield* (gate.handleWrite(file, e.run) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
    }) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
  yield* (bus.subscribe("*write*", handler) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
  yield* (bus.subscribe("file.write", handler) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
  yield* (bus.subscribe("fs.write", handler) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
  yield* (bus.subscribe("artifact.write", handler) as any).pipe(Effect.catchAllCause(() => Effect.void) as any)
})
