import { Shell, Fs } from "../core/caps"
import type { DomainModule } from "./shared"

export const tridentProfile: DomainModule = {
  name: "trident",
  caps: [Shell, Fs],
  kinds: ["shell-exec", "file-io", "mpse-discharge", "evidence-machine", "audit-registry"],
  defaultTier: 1,
  brackets: {}
}

export const profile = tridentProfile
export default tridentProfile
