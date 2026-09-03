import { Http } from "../core/caps"
import type { DomainModule } from "./shared"

export const tradingProfile: DomainModule = {
  name: "trading",
  caps: [Http],
  kinds: ["http-request", "math-eval", "oracle-gate", "circuit-breaker", "evidence-gate"],
  defaultTier: 2,
  brackets: {
    "circuit-breaker": { contract: "schemas/bracket.schema.json", repair: 1, floor: 0.6 }
  }
}

export const profile = tradingProfile
export default tradingProfile
