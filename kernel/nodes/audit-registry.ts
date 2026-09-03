import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import { replaceStubSync } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

export interface AuditFinding {
  readonly rule: string
  readonly level: "error" | "warn" | "info"
  readonly message: string
  readonly file?: string
  readonly line?: number
  readonly anchor?: string
}

const registry: Map<string, AuditFinding[]> = new Map()
let globalCount = 0

export const _auditRegistry = registry
export const _auditRegistryClear = (): void => { registry.clear(); globalCount = 0 }
export const _auditRegistryCount = (): number => globalCount
export const _auditRegistryGet = (subject: string): AuditFinding[] => registry.get(subject) ?? []

export const auditRegistryNode: NodeImpl = {
  kind: "audit-registry",
  family: "evidence",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const inbound = (inp.inbound ?? {}) as Record<string, unknown>
      const cfg = (inp.node.config ?? {}) as Record<string, unknown>
      const startMs = yield* Clock.currentTimeMillis
      const subject = (inbound["subject"] as string) ?? (cfg["subject"] as string) ?? inp.node.id
      const rawFindings: unknown = (inbound["findings"] as unknown) ?? (inbound["events"] as unknown) ?? (inbound["violations"] as unknown) ?? (cfg["findings"] as unknown) ?? (inbound["finding"] as unknown) ?? null

      if (rawFindings === null || rawFindings === undefined) {
        const hasAnyInbound = Object.keys(inbound).length > 0
        if (!hasAnyInbound && Object.keys(cfg).length === 0) {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "audit-registry", state: "FAIL", anchor: `${inp.node.id}:no-findings` }, timing: { startMs, endMs }, outputs: { count: globalCount, registered: 0, reason: "no findings provided" } } as NodeResult
        }
        const singleFinding: AuditFinding = {
          rule: (inbound["rule"] as string) ?? (cfg["rule"] as string) ?? "audit.generic",
          level: ((inbound["level"] as string) ?? (cfg["level"] as string) ?? "info") as AuditFinding["level"],
          message: (inbound["message"] as string) ?? (cfg["message"] as string) ?? JSON.stringify(inbound).slice(0, 200),
          file: inbound["file"] as string | undefined,
          line: inbound["line"] as number | undefined,
          anchor: `${subject}:1`
        }
        const list = registry.get(subject) ?? []
        const next = [...list, singleFinding]
        registry.set(subject, next)
        globalCount += 1
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "PASS" as const, evidence: { pattern: "audit-registry", state: "REGISTERED", anchor: `${subject}:${next.length}` }, timing: { startMs, endMs }, outputs: { count: next.length, globalCount, registered: 1, findings: next } } as NodeResult
      }

      const arr: AuditFinding[] = Array.isArray(rawFindings) ? (rawFindings as AuditFinding[]) : [rawFindings as AuditFinding]
      if (arr.length === 0) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "PASS" as const, evidence: { pattern: "audit-registry", state: "REGISTERED", anchor: `${subject}:0` }, timing: { startMs, endMs }, outputs: { count: registry.get(subject)?.length ?? 0, globalCount, registered: 0, findings: registry.get(subject) ?? [] } } as NodeResult
      }

      const normalized: AuditFinding[] = arr.map((f, i) => {
        if (f !== null && typeof f === "object" && "rule" in (f as any) && "message" in (f as any)) {
          const ff = f as AuditFinding
          return { rule: ff.rule, level: ff.level ?? "info", message: ff.message, file: ff.file, line: ff.line, anchor: ff.anchor ?? `${subject}:${i + 1}` }
        }
        if (typeof f === "string") return { rule: "audit.generic", level: "info" as const, message: f, anchor: `${subject}:${i + 1}` }
        if (f !== null && typeof f === "object") {
          const fo = f as unknown as Record<string, unknown>
          return { rule: (fo["rule"] as string) ?? "audit.generic", level: ((fo["level"] as string) ?? "info") as AuditFinding["level"], message: (fo["message"] as string) ?? JSON.stringify(fo).slice(0, 200), file: fo["file"] as string | undefined, line: fo["line"] as number | undefined, anchor: (fo["anchor"] as string) ?? `${subject}:${i + 1}` }
        }
        return { rule: "audit.generic", level: "info" as const, message: String(f), anchor: `${subject}:${i + 1}` }
      })

      const existing = registry.get(subject) ?? []
      const merged = [...existing, ...normalized]
      registry.set(subject, merged)
      globalCount += normalized.length
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: "audit-registry", state: "REGISTERED", anchor: `${subject}:${merged.length}` }, timing: { startMs, endMs }, outputs: { count: merged.length, globalCount, registered: normalized.length, findings: merged } } as NodeResult
    }).pipe(Effect.catchAll((e) => Effect.gen(function* () {
      const inp2 = input as NodeInput
      const t = yield* Clock.currentTimeMillis
      return { verdict: "FAIL" as const, evidence: { pattern: "audit-registry", state: "FAIL", anchor: `${inp2.node.id}:error` }, timing: { startMs: t, endMs: t }, outputs: { error: String(e), count: globalCount }, error: e } as NodeResult
    })))
}

replaceStubSync("audit-registry", auditRegistryNode)
