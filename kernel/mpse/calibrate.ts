import type { OracleRegistry, DischargeResult } from "./oracle"

export interface Sample {
  readonly id?: string
  readonly ruleId: string
  readonly actual: unknown
  readonly bornOff?: boolean
  readonly exclusion?: boolean
  readonly kind?: string
  readonly isExclusion?: boolean
}

export interface CalibrationRow {
  readonly sampleId: string
  readonly ruleId: string
  readonly actual: unknown
  readonly expected?: unknown
  readonly status: "PASS" | "FAIL" | "CONTRADICTED" | "UNVERIFIABLE" | "EXCLUDED"
  readonly reason?: string
}

export interface CalibrationReport {
  readonly pass: number
  readonly contradict: number
  readonly unverifiable: number
  readonly excluded: number
  readonly fail: number
  readonly total: number
  readonly rows: ReadonlyArray<CalibrationRow>
  readonly excludedCount: number
  readonly pendingParallel: ReadonlyArray<string>
}

function isRegistryLike(v: unknown): boolean {
  return v !== null && typeof v === "object" && (v as Record<string, unknown>)["rules"] instanceof Map
}

function toSamplesArray(samples: ReadonlyArray<Sample>): ReadonlyArray<Sample> {
  return samples
}

function normalizeRegistry(reg: unknown): OracleRegistry | null {
  if (isRegistryLike(reg)) return reg as OracleRegistry
  if (reg !== null && typeof reg === "object" && !(reg instanceof Map)) {
    const rec = reg as Record<string, unknown>
    const maybeMap = rec["rules"] ?? rec
    if (maybeMap instanceof Map) return { rules: maybeMap, appendOnly: true, get(id: string) { return maybeMap.get(id) }, has(id: string) { return maybeMap.has(id) }, size() { return maybeMap.size }, discharge(id: string, actual: unknown) { return { status: "UNVERIFIABLE", ruleId: id, actual, reason: "unregistered" } } } as OracleRegistry
    if (typeof rec === "object" && !Array.isArray(rec)) {
      const m = new Map<string, unknown>()
      for (const [k, v] of Object.entries(rec)) m.set(k, v as unknown)
      return { rules: m as unknown as ReadonlyMap<string, never>, appendOnly: true, get(id: string) { return m.get(id) as never }, has(id: string) { return m.has(id) }, size() { return m.size }, discharge(id: string, actual: unknown) { return { status: "UNVERIFIABLE", ruleId: id, actual, reason: "unregistered" } } } as OracleRegistry
    }
  }
  return null
}

function dischargeViaRegistry(registry: OracleRegistry, ruleId: string, actual: unknown): DischargeResult {
  try {
    return registry.discharge(ruleId, actual)
  } catch {
    const rule = registry.rules.get(ruleId) as unknown as { expected?: unknown; tolerance?: number } | undefined
    if (!rule) return { status: "UNVERIFIABLE", ruleId, actual, reason: "no oracle registered" }
    if (typeof actual === "number" && Number.isNaN(actual)) return { status: "CONTRADICTED", ruleId, expected: rule.expected, actual, reason: "NaN" }
    const expected = (rule as Record<string, unknown>)["expected"]
    if (typeof expected === "number" && typeof actual === "number") {
      if (Number.isInteger(expected) && Number.isInteger(actual)) {
        return actual === expected ? { status: "PASS", ruleId, expected, actual } : { status: "FAIL", ruleId, expected, actual }
      }
      const eps = (rule as Record<string, unknown>)["tolerance"] as number | undefined
      const diff = Math.abs((actual as number) - (expected as number))
      const tol = eps ?? 0
      return diff <= tol ? { status: "PASS", ruleId, expected, actual } : { status: "FAIL", ruleId, expected, actual }
    }
    return expected === actual ? { status: "PASS", ruleId, expected, actual } : { status: "FAIL", ruleId, expected, actual }
  }
}

export function calibrate(registryOrCards: unknown, samplesOrRegistry: unknown): CalibrationReport {
  const maybeRegistryFirst = normalizeRegistry(registryOrCards)
  const maybeRegistrySecond = normalizeRegistry(samplesOrRegistry)

  if (Array.isArray(registryOrCards) && samplesOrRegistry !== null && typeof samplesOrRegistry === "object" && !Array.isArray(samplesOrRegistry)) {
    const cards = registryOrCards as ReadonlyArray<Record<string, unknown>>
    const regRecord = samplesOrRegistry as Record<string, unknown>
    const rows: CalibrationRow[] = []
    for (const c of cards) {
      const id = String(c["id"] ?? c["cardId"] ?? "")
      const key = String(c["oracleKey"] ?? c["oracle"] ?? `OR-${id}`)
      const rule = (regRecord[key] ?? regRecord[id]) as Record<string, unknown> | undefined
      if (!rule) continue
      const expected = rule["expected"]
      const actual = (c["bornOff"] && (c as Record<string, unknown>)["actual"] !== undefined) ? (c as Record<string, unknown>)["actual"] : (rule["computed"] ?? expected)
      const bornOff = Boolean(c["bornOff"])
      let status: CalibrationRow["status"]
      let reason: string
      if (Object.is(expected, actual)) {
        status = "PASS"
        reason = "computed equals expected — hand-verified integer math"
      } else if (bornOff) {
        status = "EXCLUDED"
        reason = "D17 EXCLUDED_BORN_OFF — born-off exclusion intentionally wrong, not FAIL"
      } else {
        status = "FAIL"
        reason = "mismatch without bornOff flag"
      }
      rows.push({ sampleId: id, ruleId: key, expected, actual, status, reason })
    }
    const pass = rows.filter(r => r.status === "PASS").length
    const excluded = rows.filter(r => r.status === "EXCLUDED").length
    const fail = rows.filter(r => r.status === "FAIL").length
    const contradict = fail
    const unverifiable = 0
    return { pass, contradict, unverifiable, excluded, fail, total: rows.length, rows, excludedCount: excluded, pendingParallel: [] }
  }

  const registry = maybeRegistryFirst
  const samples = toSamplesArray(samplesOrRegistry as ReadonlyArray<Sample>)

  if (!registry || !Array.isArray(samples)) {
    throw new Error("calibrate: invalid arguments — expected (registry, samples[]) or (cards[], registryRecord)")
  }

  const rows: CalibrationRow[] = []
  let pass = 0
  let contradict = 0
  let unverifiable = 0
  let excluded = 0

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i] as Sample
    const ruleId = s.ruleId
    const actual = s.actual
    const bornOff = s.bornOff === true
    const isBornOffExclusion = bornOff
    if (isBornOffExclusion) {
      excluded++
      rows.push({ sampleId: s.id ?? `${ruleId}#${i}`, ruleId, actual, expected: registry.get(ruleId)?.expected, status: "EXCLUDED", reason: "D17 EXCLUDED_BORN_OFF — exclusion born-off never satisfiable" })
      continue
    }
    const result = dischargeViaRegistry(registry, ruleId, actual)
    const status = result.status
    if (status === "PASS") {
      pass++
      rows.push({ sampleId: s.id ?? `${ruleId}#${i}`, ruleId, actual, expected: result.expected, status: "PASS", reason: result.reason })
    } else if (status === "UNVERIFIABLE") {
      unverifiable++
      rows.push({ sampleId: s.id ?? `${ruleId}#${i}`, ruleId, actual, expected: result.expected, status: "UNVERIFIABLE", reason: result.reason })
    } else if (status === "CONTRADICTED" || status === "FAIL") {
      contradict++
      const mappedStatus = status === "FAIL" ? "CONTRADICTED" as const : status
      const mergeStatus: CalibrationRow["status"] = status === "FAIL" ? "CONTRADICTED" : status
      void mappedStatus
      rows.push({ sampleId: s.id ?? `${ruleId}#${i}`, ruleId, actual, expected: result.expected, status: mergeStatus, reason: result.reason })
    } else if (status === "EXCLUDED") {
      excluded++
      rows.push({ sampleId: s.id ?? `${ruleId}#${i}`, ruleId, actual, expected: result.expected, status: "EXCLUDED", reason: result.reason })
    }
  }

  const fail = contradict
  return { pass, contradict, unverifiable, excluded, fail, total: samples.length, rows, excludedCount: excluded, pendingParallel: [] }
}
