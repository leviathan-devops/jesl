import { Effect } from "effect"
import type { WorkflowDoc } from "./schema"
import { JeslCycle, JeslUnknownNode } from "./errors"

export interface GraphIndex {
  readonly doc: WorkflowDoc
  readonly inbound: ReadonlyMap<string, ReadonlySet<string>>
  readonly outbound: ReadonlyMap<string, ReadonlyArray<{ to: string; via: string }>>
  readonly nodeIds: ReadonlyArray<string>
  inboundOf(nodeId: string): ReadonlySet<string>
  outboundOf(nodeId: string): ReadonlyArray<{ to: string; via: string }>
  entryNodes(): ReadonlyArray<string>
  parallelBatches(): ReadonlyArray<ReadonlyArray<string>>
  terminalNodes(): ReadonlyArray<string>
  readySet(snapshot: { isWritten(name: string): boolean }, state: { completed: ReadonlySet<string>; inFlight: ReadonlySet<string> }): ReadonlyArray<string>
}

export interface Graph {
  readonly index: GraphIndex
  parallelBatches(): ReadonlyArray<ReadonlyArray<string>>
  readyBatches(snapshot: { isWritten(name: string): boolean }, state: { completed: ReadonlySet<string>; inFlight: ReadonlySet<string> }): ReadonlyArray<ReadonlyArray<string>>
}

const MAX_NODES_FIRING = 15

function chunk15(arr: ReadonlyArray<string>): ReadonlyArray<ReadonlyArray<string>> {
  if (arr.length <= MAX_NODES_FIRING) return [arr]
  const out: Array<ReadonlyArray<string>> = []
  for (let i = 0; i < arr.length; i += MAX_NODES_FIRING) out.push(arr.slice(i, i + MAX_NODES_FIRING))
  return out
}

function buildIndex(doc: WorkflowDoc): GraphIndex {
  const ids = doc.nodes.map((n) => n.id)
  const idSet = new Set(ids)
  const inbound = new Map<string, Set<string>>()
  const outbound = new Map<string, Array<{ to: string; via: string }>>()
  for (const id of ids) {
    inbound.set(id, new Set())
    outbound.set(id, [])
  }
  for (const e of doc.edges) {
    inbound.get(e.to)?.add(e.via)
    outbound.get(e.from)?.push({ to: e.to, via: e.via })
  }
  const inboundRo = inbound as unknown as ReadonlyMap<string, ReadonlySet<string>>
  const outboundRo = outbound as unknown as ReadonlyMap<string, ReadonlyArray<{ to: string; via: string }>>

  const kahnLevels = (): ReadonlyArray<ReadonlyArray<string>> => {
    const indeg = new Map<string, number>()
    const adj = new Map<string, string[]>()
    for (const id of ids) {
      indeg.set(id, 0)
      adj.set(id, [])
    }
    for (const e of doc.edges) {
      adj.get(e.from)?.push(e.to)
      indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1)
    }
    const levels: string[][] = []
    let current: string[] = [...ids.filter((id) => (indeg.get(id) ?? 0) === 0)]
    const visited = new Set<string>()
    while (current.length > 0) {
      levels.push([...current])
      const next: string[] = []
      for (const u of current) {
        visited.add(u)
        for (const v of adj.get(u) ?? []) {
          const d = (indeg.get(v) ?? 0) - 1
          indeg.set(v, d)
          if (d === 0) next.push(v)
        }
      }
      current = next
    }
    return levels
  }

  const index: GraphIndex = {
    doc,
    inbound: inboundRo,
    outbound: outboundRo,
    nodeIds: ids,
    inboundOf(nodeId: string): ReadonlySet<string> {
      return inbound.get(nodeId) ?? new Set()
    },
    outboundOf(nodeId: string): ReadonlyArray<{ to: string; via: string }> {
      return outbound.get(nodeId) ?? []
    },
    entryNodes(): ReadonlyArray<string> {
      return ids.filter((id) => (inbound.get(id)?.size ?? 0) === 0)
    },
    terminalNodes(): ReadonlyArray<string> {
      return ids.filter((id) => (outbound.get(id)?.length ?? 0) === 0)
    },
    parallelBatches(): ReadonlyArray<ReadonlyArray<string>> {
      const levels = kahnLevels()
      const flat: string[] = levels.flat()
      if (flat.length !== ids.length) return levels
      const capped: string[][] = []
      for (const lvl of levels) {
        if (lvl.length <= MAX_NODES_FIRING) capped.push([...lvl])
        else {
          for (let i = 0; i < lvl.length; i += MAX_NODES_FIRING) capped.push([...lvl.slice(i, i + MAX_NODES_FIRING)])
        }
      }
      return capped
    },
    readySet(snapshot: { isWritten(name: string): boolean }, state: { completed: ReadonlySet<string>; inFlight: ReadonlySet<string> }): ReadonlyArray<string> {
      const out: string[] = []
      for (const n of doc.nodes) {
        if (state.completed.has(n.id) || state.inFlight.has(n.id)) continue
        const req = inbound.get(n.id) ?? new Set()
        let ok = true
        for (const ch of req) {
          if (!snapshot.isWritten(ch)) { ok = false; break }
        }
        if (ok) out.push(n.id)
      }
      return out
    }
  }
  return index
}

export const buildGraph = (doc: WorkflowDoc): Effect.Effect<Graph, JeslUnknownNode | JeslCycle> =>
  Effect.gen(function* () {
    const ids = new Set(doc.nodes.map((n) => n.id))
    for (const e of doc.edges) {
      if (!ids.has(e.from)) {
        return yield* Effect.fail(new JeslUnknownNode({
          code: "[JESL UNKNOWN-NODE]",
          node: e.from,
          field: "edges[from]",
          expected: "existing node id",
          actual: e.from,
          remedy: "fix the edge endpoint"
        }))
      }
      if (!ids.has(e.to)) {
        return yield* Effect.fail(new JeslUnknownNode({
          code: "[JESL UNKNOWN-NODE]",
          node: e.to,
          field: "edges[to]",
          expected: "existing node id",
          actual: e.to,
          remedy: "fix the edge endpoint"
        }))
      }
      if (e.from === e.to) {
        return yield* Effect.fail(new JeslCycle({
          code: "[JESL CYCLE]",
          node: e.from,
          field: "edges",
          expected: "acyclic channel graph",
          actual: `cycle through [${e.from}→${e.from}]`,
          remedy: "break the cycle"
        }))
      }
    }

    const indeg = new Map<string, number>()
    const adj = new Map<string, string[]>()
    for (const n of doc.nodes) {
      indeg.set(n.id, 0)
      adj.set(n.id, [])
    }
    for (const e of doc.edges) {
      adj.get(e.from)!.push(e.to)
      indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1)
    }
    const queue: string[] = doc.nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0).map((n) => n.id)
    const order: string[] = []
    let qi = 0
    while (qi < queue.length) {
      const u = queue[qi++]!
      order.push(u)
      for (const v of adj.get(u) ?? []) {
        const d = (indeg.get(v) ?? 0) - 1
        indeg.set(v, d)
        if (d === 0) queue.push(v)
      }
    }
    if (order.length < doc.nodes.length) {
      const cycleNodes = doc.nodes.filter((n) => (indeg.get(n.id) ?? 0) > 0).map((n) => n.id)
      const path = cycleNodes.join("→")
      return yield* Effect.fail(new JeslCycle({
        code: "[JESL CYCLE]",
        node: cycleNodes[0] ?? doc.nodes[0]!.id,
        field: "edges",
        expected: "acyclic channel graph",
        actual: `cycle through [${path}]`,
        remedy: "break the cycle with a gate, or re-arm via event-reactivate"
      }))
    }

    const index = buildIndex(doc)
    const graph: Graph = {
      index,
      parallelBatches(): ReadonlyArray<ReadonlyArray<string>> {
        return index.parallelBatches()
      },
      readyBatches(snapshot: { isWritten(name: string): boolean }, state: { completed: ReadonlySet<string>; inFlight: ReadonlySet<string> }): ReadonlyArray<ReadonlyArray<string>> {
        const ready = index.readySet(snapshot, state)
        if (ready.length === 0) return []
        return chunk15(ready)
      }
    }
    return graph
  })

export const readyBatches = (
  graph: Graph,
  snapshot: { isWritten(name: string): boolean },
  state: { completed: ReadonlySet<string>; inFlight: ReadonlySet<string> }
): ReadonlyArray<ReadonlyArray<string>> => graph.readyBatches(snapshot, state)

export class GraphService extends Effect.Service<GraphService>()("jesl/Graph", {
  succeed: {
    build: buildGraph
  }
}) {}
