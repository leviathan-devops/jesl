import { ALL_KINDS } from "./core/registry"
import fs from "node:fs"
import path from "node:path"
const root = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname))
const kindMap = new Map<string, { kind: string; family: string; cards: string[] }>()
for (const { kind, family } of ALL_KINDS) kindMap.set(kind, { kind, family, cards: [] })
const cards: { name: string; path: string; kinds: string[] }[] = []
for (const dir of ["fixtures", "algorithms"]) {
  const abs = path.join(root, dir)
  let files: string[] = []
  try { files = fs.readdirSync(abs).filter(f => f.endsWith(".json")).sort() } catch { continue }
  for (const f of files) {
    const p = path.join(abs, f)
    let j: any
    try { j = JSON.parse(fs.readFileSync(p, "utf8")) } catch { continue }
    const nodes: any[] = Array.isArray(j.nodes) ? j.nodes : []
    const kinds: string[] = [...new Set(nodes.map(n => String(n.type ?? n.kind ?? "")).filter(Boolean))].sort()
    const name = j.meta?.name ?? path.basename(f, ".json")
    cards.push({ name, path: `${dir}/${f}`, kinds })
    for (const k of kinds) { const e = kindMap.get(k); if (e && !e.cards.includes(name)) e.cards.push(name) }
  }
}
for (const e of kindMap.values()) e.cards.sort()
const out = { kinds: [...kindMap.values()].sort((a,b)=>a.kind.localeCompare(b.kind)), cards: cards.sort((a,b)=>a.name.localeCompare(b.name)), generatedAt: new Date().toISOString().slice(0,10) }
fs.writeFileSync(path.join(root, "lexicon.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`lexicon: ${out.kinds.length} kinds, ${cards.length} cards -> lexicon.json`)
