import { Ref } from "effect"

export interface PbaHitPayload {
  readonly family: string
  readonly confidence: number
  readonly band: "ENFORCE" | "DAMPEN" | "SUPPRESS"
  readonly evidence: string
  readonly verdict: "hit"
  readonly reason: string
  readonly run: string
  readonly ts: number
  readonly text: string
}

export interface PtaInterceptPayload {
  readonly tool: string
  readonly family: string | null
  readonly verdict: "allow" | "deny"
  readonly reason: string
  readonly run: string
  readonly ts: number
  readonly preArmed: boolean
}

export interface PreArmRing {
  push(hit: PbaHitPayload): void
  hasArmed(): boolean
  lastFamily(): string | null
  clear(): void
  size(): number
}

export const makePreArmRing = (cap = 20): PreArmRing => {
  const ring: PbaHitPayload[] = []
  return {
    push(hit) { ring.push(hit); if (ring.length > cap) ring.shift() },
    hasArmed() { return ring.length > 0 },
    lastFamily() { return ring.length === 0 ? null : ring[ring.length - 1]!.family },
    clear() { ring.length = 0 },
    size() { return ring.length }
  }
}

export const PBA_HIT_EVENT = "pba.family.hit" as const
export const PTA_INTERCEPT_EVENT = "pta.intercept" as const

export const PTA_DENY_REASON = "deny-unless-armed: no PBA pre-arm for tool event (L2 §4.12 pre-arm chain — PTA denies when UNARMED)"
export const PTA_ALLOW_REASON = "allow: PBA pre-arm present — pba.family.hit → pta.intercept chain"
