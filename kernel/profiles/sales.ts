import { Http, Llm } from "../core/caps"
import type { DomainModule } from "./shared"

export const salesProfile: DomainModule = {
  name: "sales",
  caps: [Http, Llm],
  kinds: ["http-request", "prompt", "capture-engine", "journal-sink"],
  defaultTier: 2,
  brackets: {
    prompt: { contract: "schemas/output.schema.json", repair: 2, floor: 0.55 }
  }
}

export const profile = salesProfile
export default salesProfile
