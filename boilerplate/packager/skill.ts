import { Effect } from "effect"
import type { JeslError } from "../core/errors"
import { validatedDoc, canonicalJson, type SkillWriter } from "./shared"
import type { WorkflowDoc } from "../core/schema"

export interface SkillEmitResult {
  skillDir: string
  files: string[]
}

const LAUNCH_LINE = "jesl run payload/workflow.json --in payload/ctx.json"

const buildSkillMd = (doc: WorkflowDoc): string => {
  const name = doc.meta.name
  const desc = (doc.meta as any).description ?? `JESL workflow ${name}`
  const enginesNote = "engines/ — pre-built micro-execution kinds (W8 kernel compositions — directories documented, created by W8)"
  const testsNote = "tests/ — fixtures + oracle rows + TestLive suite (W8)"
  return `# ${name}\n\n${desc}\n\n## When to use\n\nInvoke when you need to run the ${name} workflow as an ephemeral skill rocket.\n\n## Launch\n\n\`\`\`sh\n${LAUNCH_LINE}\n\`\`\`\n\n## Payload\n\n- payload/workflow.json — the JESL graph (byte-preserved)\n- payload/ctx.json — vars + entry channel contracts\n- payload/mission.md — objective + constraints\n- payload/anti-patterns.json — machine data from gates\n- payload/schemas/ — reserved (W8)\n- payload/activities.ts — reserved (W8)\n- ${enginesNote}\n- ${testsNote}\n`
}

const buildMissionMd = (doc: WorkflowDoc): string => {
  const desc = (doc.meta as any).description ?? `Execute workflow ${doc.meta.name}`
  const vars = doc.vars ? JSON.stringify(doc.vars, null, 2) : "{}"
  return `# Mission — ${doc.meta.name}\n\n## Objective\n\n${desc}\n\n## Workflow\n\n- Nodes: ${doc.nodes.map((n: any) => `${n.id}(${n.type})`).join(", ")}\n- Edges: ${doc.edges.map((e: any) => `${e.from} --${e.via}--> ${e.to}`).join(", ")}\n\n## Context vars\n\n\`\`\`json\n${vars}\n\`\`\`\n\n## Success\n\nRun completes with verdict PASS; journal verified.\n`
}

const buildAntiPatternsJson = (doc: WorkflowDoc): string => {
  const gates = (doc as any).gates
  if (Array.isArray(gates) && gates.length > 0) {
    return canonicalJson(gates)
  }
  return canonicalJson({
    family: doc.meta.name,
    descriptive: [],
    suggestive: [],
    substitute: [],
    use: []
  })
}

const buildCtxJson = (doc: WorkflowDoc): string => {
  const vars = (doc.vars ?? {}) as Record<string, string>
  const seed = (doc.meta as any).seed
  const channels = doc.edges.map((e: any) => e.via)
  return canonicalJson({
    vars,
    seed: seed ?? null,
    channels: [...new Set(channels)],
    meta: { name: doc.meta.name, tier: doc.meta.tier }
  })
}

export const emitSkill = (
  raw: unknown,
  outDir: string,
  writer: SkillWriter
): Effect.Effect<SkillEmitResult, JeslError | unknown> =>
  Effect.gen(function* () {
    const doc = yield* validatedDoc(raw)
    const name = doc.meta.name
    const base = outDir.endsWith("/") ? `${outDir}${name}` : `${outDir}/${name}`
    const workflowJson = canonicalJson(doc)
    const ctxJson = buildCtxJson(doc)
    const missionMd = buildMissionMd(doc)
    const antiPatternsJson = buildAntiPatternsJson(doc)
    const skillMd = buildSkillMd(doc)
    const files: Array<{ path: string; content: string }> = [
      { path: `${base}/SKILL.md`, content: skillMd },
      { path: `${base}/payload/workflow.json`, content: workflowJson },
      { path: `${base}/payload/ctx.json`, content: ctxJson },
      { path: `${base}/payload/mission.md`, content: missionMd },
      { path: `${base}/payload/anti-patterns.json`, content: antiPatternsJson }
    ]
    for (const f of files) {
      yield* writer.write(f.path, f.content)
    }
    return { skillDir: base, files: files.map((f) => f.path) }
  })

export const emitSkillFromDoc = (
  doc: WorkflowDoc,
  outDir: string,
  writer: SkillWriter
): Effect.Effect<SkillEmitResult, JeslError | unknown> =>
  emitSkill(doc as unknown, outDir, writer)

export const SKILL_LAUNCH_LINE = LAUNCH_LINE
