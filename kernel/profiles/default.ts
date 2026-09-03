import { Shell, Fs, Http } from "../core/caps"
import type { DomainModule } from "./shared"
import { validateDomainModule } from "./shared"
import { ALL_KINDS } from "../core/registry"
export const defaultProfile: DomainModule = {
  name: "default",
  caps: [Shell, Fs, Http],
  kinds: ALL_KINDS.map(k => k.kind),
  defaultTier: 1,
  brackets: {}
}
const errs = validateDomainModule(defaultProfile)
if (errs.length) throw new Error(`defaultProfile invalid: ${errs.join("; ")}`)
export default defaultProfile
