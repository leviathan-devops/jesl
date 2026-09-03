import { Effect, Clock, Context, Layer } from "effect"
import { Journal, simpleHashExport, canonicalSerializeExport } from "../../core/journal"
import { decodeDoc, validateDoc } from "../../core/schema"
import type { WorkflowDoc } from "../../core/schema"
import { parseMathExpr } from "../../mpse/parser"
import { JeslChannelUnset, JeslUnknownNode } from "../../core/errors"
import type { JeslError } from "../../core/errors"
import { Llm } from "../../core/caps"
import { ALL_KINDS } from "../../core/registry"

export interface Inventory {
  readonly nodeCount: number
  readonly edgeCount: number
  readonly nodeIds: ReadonlyArray<string>
  readonly tier: number
  readonly name: string
  readonly via: ReadonlyArray<string>
}

export interface DigestResult {
  readonly hash: string
  readonly inventory: Inventory
}

export interface FR {
  readonly id: string
  readonly title: string
  readonly sourceNode: string
  readonly description: string
  readonly kind: string
}

const knownKindSet = new Set(ALL_KINDS.map((k) => k.kind))

const isKnownKind = (k: string) => knownKindSet.has(k)

const journalAppend = (run: string, node: string, kind: string, evidence: { pattern: string; state: string; anchor: string }, verdict?: string) =>
  Effect.gen(function* () {
    const ts = yield* Clock.currentTimeMillis
    const maybeJournal: any = yield* (Effect.serviceOption(Journal) as any).pipe(Effect.catchAll((e: unknown) => Effect.succeed({ _tag: "None" } as const)) as any) as any
    if ((maybeJournal as any)._tag === "Some") {
      const svc = (maybeJournal as any).value
      yield* svc.append({ run, node, kind: kind as any, verdict: verdict as any, evidence, source: `workflow/bible-to-spec/${node}`, ts } as any).pipe(Effect.catchAll((e: unknown) => Effect.void))
    }
  })

export const digestBible = (bible: unknown, runId = "bible-to-spec"): Effect.Effect<DigestResult, JeslError, Journal> =>
  Effect.gen(function* () {
    const start = yield* Clock.currentTimeMillis
    yield* journalAppend(runId, "digest", "invoke", { pattern: "bible.digest", state: "INVOKE", anchor: "digest:0" })
    if (bible == null || typeof bible !== "object") {
      const err = new JeslChannelUnset({
        code: "[JESL CHANNEL-UNSET]",
        node: "digest",
        field: "bible",
        expected: "bible-shaped doc with $schema trident-workflow-v1",
        actual: String(bible),
        remedy: "provide a bible document — WorkflowDoc with $schema trident-workflow-v1"
      } as any)
      yield* journalAppend(runId, "digest", "verdict", { pattern: "bible.digest", state: "FAIL", anchor: "digest:missing" }, "FAIL")
      return yield* Effect.fail(err as unknown as JeslError)
    }
    const raw = bible as Record<string, unknown>
    if (raw["$schema"] !== "trident-workflow-v1") {
      const err = new JeslUnknownNode({
        code: "[JESL UNKNOWN-NODE]",
        node: "digest",
        field: "$schema",
        expected: "trident-workflow-v1",
        actual: String(raw["$schema"]),
        remedy: "fix $schema to trident-workflow-v1"
      } as any)
      yield* journalAppend(runId, "digest", "verdict", { pattern: "bible.digest", state: "FAIL", anchor: "digest:schema" }, "FAIL")
      return yield* Effect.fail(err as unknown as JeslError)
    }
    const canonical = canonicalSerializeExport(bible as any)
    const hash = simpleHashExport(canonical)
    const doc = bible as any
    const nodes: ReadonlyArray<any> = Array.isArray(doc.nodes) ? doc.nodes : []
    const edges: ReadonlyArray<any> = Array.isArray(doc.edges) ? doc.edges : []
    const inventory: Inventory = {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodeIds: nodes.map((n: any) => String(n.id)),
      tier: Number(doc.meta?.tier ?? 1),
      name: String(doc.meta?.name ?? "bible"),
      via: edges.map((e: any) => String(e.via))
    }
    const end = yield* Clock.currentTimeMillis
    yield* journalAppend(runId, "digest", "verdict", { pattern: "bible.digest", state: "PASS", anchor: `digest:${hash.slice(0, 8)}:${inventory.nodeCount}` }, "PASS")
    void start
    void end
    return { hash, inventory }
  }) as unknown as Effect.Effect<DigestResult, JeslError, Journal>

export const extractFRs = (bible: WorkflowDoc, digest: DigestResult, runId = "bible-to-spec"): Effect.Effect<ReadonlyArray<FR>, JeslError, Journal | Llm> =>
  Effect.gen(function* () {
    const start = yield* Clock.currentTimeMillis
    yield* journalAppend(runId, "fr-extract", "invoke", { pattern: "bible.fr-extract", state: "INVOKE", anchor: `fr-extract:${digest.hash.slice(0, 6)}` })
    const nodes: ReadonlyArray<any> = (bible as any).nodes ?? []
    const tryLlm: Effect.Effect<ReadonlyArray<FR>, unknown, Llm> = Effect.gen(function* (): any {
      const llm: any = yield* Llm
      const prompt = `Extract FRs from bible nodes: ${JSON.stringify(nodes.map((n: any) => ({ id: n.id, type: n.type, config: n.config })))}`
      const res: any = yield* llm.callModel({ system: "You are FR extractor. Return JSON array of FRs with id,title,sourceNode,description,kind.", prompt, maxTokens: 512 })
      const text = typeof res === "string" ? res : typeof res?.text === "string" ? res.text : JSON.stringify(res)
      try {
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) {
          const frs: FR[] = parsed.map((p: any, idx: number) => ({
            id: String(p.id ?? `FR-${idx + 1}`),
            title: String(p.title ?? p.id ?? `FR-${idx + 1}`),
            sourceNode: String(p.sourceNode ?? nodes[idx]?.id ?? `node-${idx}`),
            description: String(p.description ?? p.title ?? ""),
            kind: String(p.kind ?? nodes[idx]?.type ?? "gate")
          }))
          if (frs.length > 0) return frs
        }
      } catch (e: unknown) {
        void e
      }
      return yield* Effect.fail(new Error("llm parse failed") as any)
    }) as unknown as Effect.Effect<ReadonlyArray<FR>, unknown, Llm>
    const maybeFrs: any = yield* Effect.either(tryLlm).pipe(
      Effect.catchAll((e: unknown) => Effect.succeed({ _tag: "Left", left: new Error("no llm") } as any))
    )
    let frs: FR[]
    if ((maybeFrs as any)._tag === "Right") {
      frs = (maybeFrs as any).right as FR[]
    } else {
      frs = nodes.map((n: any, idx: number) => ({
        id: `FR-${idx + 1}`,
        title: String(n.config?.title ?? n.config?.description ?? `${n.type} requirement for ${n.id}`),
        sourceNode: String(n.id),
        description: String(n.config?.description ?? n.config?.title ?? `Functional requirement derived from node ${n.id} of type ${n.type}`),
        kind: String(n.type)
      }))
      if (frs.length === 0) {
        frs = [{ id: "FR-1", title: "bible coverage", sourceNode: digest.inventory.nodeIds[0] ?? "bible", description: `Cover bible ${digest.inventory.name} with ${digest.inventory.nodeCount} nodes`, kind: "gate" }]
      }
    }
    const end = yield* Clock.currentTimeMillis
    yield* journalAppend(runId, "fr-extract", "verdict", { pattern: "bible.fr-extract", state: "PASS", anchor: `fr-extract:${frs.length}` }, "PASS")
    void start
    void end
    return frs
  }) as unknown as Effect.Effect<ReadonlyArray<FR>, JeslError, Journal | Llm>

export const lintMathContracts = (bible: WorkflowDoc, runId = "bible-to-spec"): Effect.Effect<void, JeslError, Journal> =>
  Effect.gen(function* () {
    const start = yield* Clock.currentTimeMillis
    yield* journalAppend(runId, "math-lint", "invoke", { pattern: "bible.math-lint", state: "INVOKE", anchor: "math-lint:0" })
    const nodes: ReadonlyArray<any> = (bible as any).nodes ?? []
    let checked = 0
    for (const n of nodes) {
      const cfg: Record<string, unknown> = (n.config ?? {}) as any
      const mathKeys = ["math", "expression", "expr", "formula", "contract"]
      let mathVal: string | undefined
      let mathField: string | undefined
      for (const k of mathKeys) {
        if (typeof cfg[k] === "string" && String(cfg[k]).trim() !== "") {
          mathVal = String(cfg[k])
          mathField = `config.${k}`
          break
        }
      }
      if (mathVal === undefined) continue
      checked++
      const res: any = yield* parseMathExpr(mathVal).pipe(Effect.either)
      if ((res as any)._tag === "Left") {
        const mpErr: any = (res as any).left
        const reason = mpErr?.reason ?? mpErr?.message ?? String(mpErr)
        const err = new JeslUnknownNode({
          code: "[JESL UNKNOWN-NODE]",
          node: String(n.id),
          field: mathField ?? "config.math",
          expected: "valid MathExpr per mpse/parser.ts parseMathExpr",
          actual: mathVal,
          remedy: `fix the math expression — parse failed: ${reason}`
        } as any)
        yield* journalAppend(runId, "math-lint", "verdict", { pattern: "bible.math-lint", state: "FAIL", anchor: `math-lint:${n.id}:parse-fail` }, "FAIL")
        void start
        return yield* Effect.fail(err as unknown as JeslError)
      }
    }
    const end = yield* Clock.currentTimeMillis
    yield* journalAppend(runId, "math-lint", "verdict", { pattern: "bible.math-lint", state: "PASS", anchor: `math-lint:${checked}` }, "PASS")
    void start
    void end
  }) as unknown as Effect.Effect<void, JeslError, Journal>

export const gateDPL1Spec = (candidate: unknown, runId = "bible-to-spec"): Effect.Effect<WorkflowDoc, JeslError, Journal> =>
  Effect.gen(function* () {
    const start = yield* Clock.currentTimeMillis
    yield* journalAppend(runId, "template-gate", "invoke", { pattern: "bible.template-gate", state: "INVOKE", anchor: "template-gate:0" })
    const decoded: any = yield* decodeDoc(candidate).pipe(
      Effect.mapError((e: any) => e as JeslError)
    )
    yield* validateDoc(decoded, isKnownKind).pipe(
      Effect.mapError((e: any) => e as JeslError)
    )
    const end = yield* Clock.currentTimeMillis
    yield* journalAppend(runId, "template-gate", "verdict", { pattern: "bible.template-gate", state: "PASS", anchor: `template-gate:${decoded.meta.name}` }, "PASS")
    void start
    void end
    return decoded as WorkflowDoc
  }) as unknown as Effect.Effect<WorkflowDoc, JeslError, Journal>

const buildSpecCandidate = (bible: WorkflowDoc, frs: ReadonlyArray<FR>, digest: DigestResult): unknown => {
  const baseName = String((bible as any).meta?.name ?? "bible")
  const frNodes = frs.map((fr) => ({
    id: fr.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    type: knownKindSet.has(fr.kind) ? fr.kind : "gate",
    config: { title: fr.title, description: fr.description, sourceNode: fr.sourceNode, frId: fr.id }
  }))
  const nodes = frNodes.length > 0 ? frNodes : [{ id: "spec-gate", type: "gate", config: { title: "spec gate" } }]
  const edges = nodes.length > 1 ? nodes.slice(0, -1).map((n, i) => ({ from: n.id, to: nodes[i + 1]!.id, via: `ch-${i}` })) : []
  return {
    $schema: "trident-workflow-v1",
    meta: { name: `${baseName}-spec`, tier: 1 as const, description: `DPL1 spec derived from bible ${baseName} hash ${digest.hash.slice(0, 8)} with ${frs.length} FRs` },
    nodes,
    edges,
    vars: { bibleHash: digest.hash.slice(0, 16), frCount: String(frs.length) }
  }
}

export const runBibleToSpecSimple = (bible: unknown): Effect.Effect<WorkflowDoc, JeslError, Journal> =>
  Effect.gen(function* () {
    const journal: any = yield* Journal
    const runId = simpleHashExport(canonicalSerializeExport(bible as any) ?? String(bible)).slice(0, 16)
    yield* journal.append({ run: runId, node: "__run", kind: "invoke" as any, source: "workflow/bible-to-spec/__run", evidence: { pattern: "bible-to-spec.run", state: "INVOKE", anchor: runId }, ts: yield* Clock.currentTimeMillis } as any).pipe(Effect.catchAll((e: unknown) => Effect.void))
    const digest = yield* digestBible(bible, runId)
    const decodedBible: any = yield* (decodeDoc(bible).pipe(Effect.mapError((e: any) => e as JeslError)) as any)
    yield* journal.append({ run: runId, node: "fr-extract", kind: "invoke" as any, source: "workflow/bible-to-spec/fr-extract", evidence: { pattern: "bible.fr-extract", state: "INVOKE", anchor: `fr-extract:${digest.hash.slice(0,6)}` }, ts: yield* Clock.currentTimeMillis } as any).pipe(Effect.catchAll((e: unknown) => Effect.void))
    const frs: ReadonlyArray<FR> = yield* (Effect.gen(function* () {
      const nodes: any[] = (decodedBible as any).nodes ?? []
      const maybeLlm: any = yield* (Effect.serviceOption(Llm) as any).pipe(Effect.catchAll((e: unknown) => Effect.succeed({ _tag: "None" } as const)) as any) as any
      if ((maybeLlm as any)._tag === "Some") {
        const llm: any = (maybeLlm as any).value
        const prompt = `Extract FRs from bible nodes: ${JSON.stringify(nodes.map((n: any) => ({ id: n.id, type: n.type })))}`
        const res: any = yield* Effect.either(llm.callModel({ system: "Extract FRs as JSON array", prompt, maxTokens: 256 }))
        if ((res as any)._tag === "Right") {
          const text = typeof (res as any).right === "string" ? (res as any).right : JSON.stringify((res as any).right)
          try {
            const parsed = JSON.parse(typeof (res as any).right?.text === "string" ? (res as any).right.text : text)
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.map((p: any, idx: number) => ({
                id: String(p.id ?? `FR-${idx + 1}`),
                title: String(p.title ?? `FR-${idx + 1}`),
                sourceNode: String(p.sourceNode ?? nodes[idx]?.id ?? "bible"),
                description: String(p.description ?? p.title ?? ""),
                kind: String(p.kind ?? "gate")
              })) as FR[]
            }
          } catch (e: unknown) {
            void e
          }
        }
      }
      return (nodes as any[]).map((n: any, idx: number) => ({
        id: `FR-${idx + 1}`,
        title: String(n.config?.title ?? `${n.type} requirement for ${n.id}`),
        sourceNode: String(n.id),
        description: String(n.config?.description ?? `FR from ${n.id}`),
        kind: String(n.type)
      })) as FR[]
    }).pipe(Effect.catchAll((e: unknown) => Effect.succeed([] as FR[]))) as any)
    yield* journal.append({ run: runId, node: "fr-extract", kind: "verdict" as any, verdict: "PASS" as any, source: "workflow/bible-to-spec/fr-extract", evidence: { pattern: "bible.fr-extract", state: "PASS", anchor: `fr-extract:${frs.length}` }, ts: yield* Clock.currentTimeMillis } as any).pipe(Effect.catchAll((e: unknown) => Effect.void))
    const frs2 = (frs.length > 0 ? frs : [{ id: "FR-1", title: "bible coverage", sourceNode: digest.inventory.nodeIds[0] ?? "bible", description: `Cover ${digest.inventory.name}`, kind: "gate" } as FR]) as ReadonlyArray<FR>
    yield* lintMathContracts(decodedBible, runId)
    const candidate: unknown = buildSpecCandidate(decodedBible, frs2, digest)
    const spec: any = yield* (gateDPL1Spec(candidate, runId) as any)
    yield* journal.append({ run: runId, node: "__run", kind: "verdict" as any, verdict: "PASS" as any, source: "workflow/bible-to-spec/__run", evidence: { pattern: "bible-to-spec.run", state: "PASS", anchor: `${spec.meta.name}:${frs2.length}` }, ts: yield* Clock.currentTimeMillis } as any).pipe(Effect.catchAll((e: unknown) => Effect.void))
    return spec as WorkflowDoc
  }) as unknown as Effect.Effect<WorkflowDoc, JeslError, Journal>

export const activities = {
  digestBible,
  extractFRs,
  lintMathContracts,
  gateDPL1Spec,
  runBibleToSpec: runBibleToSpecSimple
}
