import { describe, it, expect } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { Shell, Fs, Http, ToolClient, Subagent, Llm, Journal, requireCaps } from "../core/caps"
import { Bus } from "../core/bus"
import { Session } from "../drivers/session-live"
import { ScriptedTransport, makeOpenCodeLive } from "../drivers/opencode-live"
import { makeParagonHostBinding, validateParagonHostBinding, isValidParagonHostBinding, KERNEL_TAGS, REQUIRED_CAPS } from "../bindings/host-binding"
import { makeOpenCodeBinding, OpenCodeBindingLive, makeTestOpenCodeBinding } from "../bindings/opencode-binding"

describe("bindings", () => {
  it.effect("ParagonHostBinding contract validates — valid binding passes", () =>
    Effect.gen(function* () {
      const binding = makeTestOpenCodeBinding()
      const errs = validateParagonHostBinding(binding)
      expect(errs).toEqual([])
      expect(isValidParagonHostBinding(binding)).toBe(true)
      expect(binding.name).toBe("opencode")
      expect(binding.provides.length).toBeGreaterThanOrEqual(REQUIRED_CAPS.length)
    }))

  it.effect("ParagonHostBinding contract rejects missing caps", () =>
    Effect.gen(function* () {
      const bad = makeParagonHostBinding({ name: "bad", layer: Layer.empty as any, provides: [Shell] as any })
      const errs = validateParagonHostBinding(bad)
      expect(errs.length).toBeGreaterThan(0)
      expect(errs.join(" ")).toContain("missing required cap")
      expect(isValidParagonHostBinding(bad)).toBe(false)
      const badName: any = makeParagonHostBinding({ name: "", layer: Layer.empty as any, provides: REQUIRED_CAPS as any })
      expect(validateParagonHostBinding(badName).length).toBeGreaterThan(0)
    }))

  it.effect("OpenCode binding provides ALL Tags — requireCaps passes for every kernel cap", () =>
    Effect.gen(function* () {
      const transport = new ScriptedTransport({ answers: [] })
      const layer = makeOpenCodeLive(transport)
      const allCaps: any[] = [Shell, Fs, Http, ToolClient, Subagent, Llm, Journal, Bus, Session]
      const res = yield* requireCaps(allCaps as any, "executorNode").pipe(Effect.provide(layer), Effect.either)
      expect(res._tag).toBe("Right")
      const binding = makeOpenCodeBinding(transport)
      const res2 = yield* requireCaps(allCaps as any, "executorNode2").pipe(Effect.provide(binding.layer), Effect.either)
      expect(res2._tag).toBe("Right")
    }))

  it.effect("requireCaps still fails when cap absent — loud [JESL CAP-UNBOUND] under empty", () =>
    Effect.gen(function* () {
      const emptyRes = yield* requireCaps([Llm], "needsLlm").pipe(Effect.provide(Layer.empty), Effect.either)
      expect(emptyRes._tag).toBe("Left")
      if (emptyRes._tag === "Left") expect((emptyRes.left as any).code).toBe("[JESL CAP-UNBOUND]")
      const transport = new ScriptedTransport({ answers: ["a"] })
      const binding = makeOpenCodeBinding(transport)
      const ok = yield* requireCaps([Llm], "needsLlm2").pipe(Effect.provide(binding.layer), Effect.either)
      expect(ok._tag).toBe("Right")
    }))

  it.effect("binding is composable via Layer.mergeAll — merged layer still provides", () =>
    Effect.gen(function* () {
      const t1 = new ScriptedTransport({ answers: ["x"] })
      const t2 = new ScriptedTransport({ answers: ["y"] })
      const b1 = makeOpenCodeBinding(t1)
      const b2 = makeOpenCodeBinding(t2)
      const merged = Layer.mergeAll(b1.layer, b2.layer) as Layer.Layer<any>
      const res = yield* requireCaps([Shell, ToolClient, Llm] as any, "mergedNode").pipe(Effect.provide(merged), Effect.either)
      expect(res._tag).toBe("Right")
      const busProvided = yield* requireCaps([Bus] as any, "busNode").pipe(Effect.provide(merged), Effect.either)
      expect(busProvided._tag).toBe("Right")
    }))

  it.effect("OpenCodeBindingLive + ScriptedTransport: ToolClient/Subagent/Llm invoke through transport", () =>
    Effect.gen(function* () {
      const transport = new ScriptedTransport({ answers: [] })
      const layer = OpenCodeBindingLive(transport)
      const toolRes = yield* Effect.flatMap(ToolClient, (c) => c.invoke("bash", { cmd: "echo hi" }, "cid-1")).pipe(Effect.provide(layer))
      expect((toolRes as any).tool).toBe("bash")
      const subRes = yield* Effect.flatMap(Subagent, (c) => c.dispatch("prompt.md")).pipe(Effect.provide(layer))
      expect((subRes as any).promptFile).toBe("prompt.md")
      const llmRes = yield* Effect.flatMap(Llm, (c) => c.callModel({ system: "s", prompt: "p", maxTokens: 10 })).pipe(Effect.provide(layer))
      expect((llmRes as any).text).toBeTruthy()
    }))

  it.effect("zero host imports in binding interface — host-binding re-exports only Effect kernel types", () =>
    Effect.gen(function* () {
      const binding = makeTestOpenCodeBinding()
      expect(binding.name).toBe("opencode")
      expect(KERNEL_TAGS.length).toBeGreaterThanOrEqual(8)
      for (const t of REQUIRED_CAPS) {
        expect(binding.provides.includes(t as any)).toBe(true)
      }
      const fsMod: any = yield* Effect.promise(() => import("node:fs"))
      const pathMod: any = yield* Effect.promise(() => import("node:path"))
      const urlMod: any = yield* Effect.promise(() => import("node:url"))
      const bindingsDir = pathMod.resolve(pathMod.dirname(urlMod.fileURLToPath(import.meta.url)), "../bindings")
      const hostBindingSrc = fsMod.readFileSync(pathMod.join(bindingsDir, "host-binding.ts"), "utf-8")
      expect(hostBindingSrc).not.toMatch(/from ["']opencode["']|from ["']@opencode["']/)
      const opencodeSrc = fsMod.readFileSync(pathMod.join(bindingsDir, "opencode-binding.ts"), "utf-8")
      expect(opencodeSrc).toContain("HostTransport")
      expect(opencodeSrc).toContain("makeOpenCodeLive")
    }))
})
