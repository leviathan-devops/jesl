import { describe, it as itOrig, expect } from "@effect/vitest"
const it: any = itOrig
import { Effect, Clock } from "effect"
import { sqliteSinkNode, _dbCache } from "../nodes/sqlite-sink"
import { machineNode, _machineStore } from "../nodes/machine"
import { stateMachineNode, _stateStore } from "../nodes/state-machine"
import { workflowMachineNode } from "../nodes/workflow-machine"
import { replaySourceNode } from "../nodes/replay-source"
import { makeJournal, Journal } from "../core/journal"
import type { WorkflowDoc } from "../core/schema"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

const runNode = (impl: any, input: any, ctx: any = {}) => impl.invoke(input, ctx)

const mkDbPath = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "jesl-sqlite-"))
  return path.join(dir, "test.db")
}

const rmDb = (dbPath: string) => {
  try {
    fs.rmSync(path.dirname(dbPath), { recursive: true, force: true })
  } catch (e) {
    console.error(`rmDb cleanup failed for ${dbPath}: ${String((e as any)?.message ?? e)}`)
  }
  _dbCache.delete(dbPath)
}

describe("infra-nodes — 4 stubs replaced", () => {
  it.effect("sqlite-sink write+query real db via better-sqlite3", () =>
    Effect.gen(function* () {
      const dbPath = mkDbPath()
      const w: any = yield* runNode(sqliteSinkNode, { node: { id: "sq1", config: { op: "write", db: dbPath, table: "events" } }, inbound: { data: { name: "alice", score: "42" } } })
      expect(w.verdict).toBe("PASS")
      expect(w.outputs.lastInsertRowid).toBeDefined()
      const q: any = yield* runNode(sqliteSinkNode, { node: { id: "sq2", config: { op: "query", db: dbPath, table: "events" } }, inbound: {} })
      expect(q.verdict).toBe("PASS")
      expect(q.outputs.count).toBe(1)
      expect(q.outputs.rows[0].name).toBe("alice")
      const q2: any = yield* runNode(sqliteSinkNode, { node: { id: "sq3", config: { op: "query", db: dbPath, table: "events", sql: "SELECT * FROM events WHERE name='alice'" } }, inbound: {} })
      expect(q2.outputs.count).toBe(1)
      rmDb(dbPath)
    }))

  it.effect("sqlite-sink adversarial: missing db fails", () =>
    Effect.gen(function* () {
      const r: any = yield* runNode(sqliteSinkNode, { node: { id: "sq1", config: { op: "write", table: "t" } }, inbound: { data: { x: 1 } } })
      expect(r.verdict).toBe("FAIL")
      expect(r.evidence.state).toBe("MISSING_DB")
    }))

  it.effect("sqlite-sink adversarial: empty payload fails", () =>
    Effect.gen(function* () {
      const dbPath = mkDbPath()
      const r: any = yield* runNode(sqliteSinkNode, { node: { id: "sq1", config: { op: "write", db: dbPath, table: "t" } }, inbound: {} })
      expect(r.verdict).toBe("FAIL")
      expect(r.evidence.state).toBe("EMPTY_PAYLOAD")
      rmDb(dbPath)
    }))

  it.effect("sqlite-sink adversarial: invalid sql query fails", () =>
    Effect.gen(function* () {
      const dbPath = mkDbPath()
      const w: any = yield* runNode(sqliteSinkNode, { node: { id: "sq1", config: { op: "write", db: dbPath, table: "t" } }, inbound: { data: { x: "1" } } })
      expect(w.verdict).toBe("PASS")
      const q: any = yield* runNode(sqliteSinkNode, { node: { id: "sq2", config: { op: "query", db: dbPath, table: "t", sql: "SELECT * FROM nonexistent_xyz" } }, inbound: {} })
      expect(q.verdict).toBe("FAIL")
      expect(q.evidence.state).toBe("QUERY_FAIL")
      rmDb(dbPath)
    }))

  it.effect("sqlite-sink concurrent writes then query", () =>
    Effect.gen(function* () {
      const dbPath = mkDbPath()
      const writes = (yield* Effect.all(
        [1, 2, 3].map((n) => runNode(sqliteSinkNode, { node: { id: `sq${n}`, config: { op: "write", db: dbPath, table: "conc" } }, inbound: { data: { val: String(n) } } })),
        { concurrency: 3 }
      ) as any)
      for (const w of writes as any[]) expect(w.verdict).toBe("PASS")
      const q: any = yield* runNode(sqliteSinkNode, { node: { id: "sqQ", config: { op: "query", db: dbPath, table: "conc" } }, inbound: {} })
      expect(q.outputs.count).toBe(3)
      rmDb(dbPath)
    }))

  it.effect("machine same transition table as state-machine, module-level persistence", () =>
    Effect.gen(function* () {
      _machineStore.clear()
      _stateStore.clear()
      const r1: any = yield* runNode(machineNode, { node: { id: "m1", config: { initial: "idle", event: "start" } }, inbound: {} })
      expect(r1.outputs.state).toBe("running")
      const r2: any = yield* runNode(machineNode, { node: { id: "m1", config: { event: "finish" } }, inbound: {} })
      expect(r2.outputs.state).toBe("done")
      expect(r2.verdict).toBe("PASS")
      _machineStore.clear()
      const r3: any = yield* runNode(machineNode, { node: { id: "m1", config: { event: "finish" } }, inbound: {} })
      expect(r3.verdict).toBe("INCONCLUSIVE")
      const r4: any = yield* runNode(machineNode, { node: { id: "m1", config: { initial: "idle", event: "start" } }, inbound: {} })
      expect(r4.outputs.state).toBe("running")
      const r5: any = yield* runNode(machineNode, { node: { id: "m1", config: { event: "finish" } }, inbound: {} })
      expect(r5.outputs.state).toBe("done")
      expect(r5.verdict).toBe("PASS")
      const r6: any = yield* runNode(stateMachineNode, { node: { id: "sm-m1", config: { initial: "idle", event: "start" } }, inbound: {} })
      expect(r6.outputs.state).toBe("running")
    }))

  it.effect("machine adversarial: missing event fails, invalid transition inconclusive", () =>
    Effect.gen(function* () {
      _machineStore.clear()
      const r1: any = yield* runNode(machineNode, { node: { id: "mx", config: { initial: "idle" } }, inbound: {} })
      expect(r1.verdict).toBe("FAIL")
      expect(r1.evidence.state).toBe("idle")
      const r2: any = yield* runNode(machineNode, { node: { id: "mx2", config: { initial: "idle", event: "bogus" } }, inbound: {} })
      expect(r2.verdict).toBe("INCONCLUSIVE")
    }))

  it.effect("machine adversarial: failed state maps to FAIL verdict", () =>
    Effect.gen(function* () {
      _machineStore.clear()
      yield* runNode(machineNode, { node: { id: "mf", config: { initial: "idle", event: "start" } }, inbound: {} })
      const r: any = yield* runNode(machineNode, { node: { id: "mf", config: { event: "fail" } }, inbound: {} })
      expect(r.outputs.state).toBe("failed")
      expect(r.verdict).toBe("FAIL")
    }))

  it.effect("workflow-machine composes sub-workflow via runProgram depth 1", () =>
    Effect.gen(function* () {
      const subDoc: WorkflowDoc = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "sub", tier: 1 as const },
        nodes: [{ id: "A", type: "x" }] as any,
        edges: [] as any
      }
      const ctx: any = {
        runId: "run-wm-1",
        doc: { meta: { name: "parent" } },
        vars: {},
        nodeHandles: {},
        caps: { _tag: "empty" },
        clock: Clock as any,
        budget: { startedAt: 0, deadlineMs: 600000, maxNodesFiring: 15 }
      }
      const res: any = yield* runNode(workflowMachineNode, { node: { id: "wm1", config: { workflow: subDoc } }, inbound: {} }, ctx)
      expect(res.verdict).toBe("PASS")
      expect(res.outputs.summary).toBeDefined()
      expect(res.outputs.depth).toBe(1)
    }))

  it.effect("workflow-machine adversarial: missing workflow fails", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(workflowMachineNode, { node: { id: "wm1", config: {} }, inbound: {} }, { runId: "r", vars: {} })
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.state).toBe("MISSING_WORKFLOW")
    }))

  it.effect("workflow-machine adversarial: depth limit 3 enforced via ctx", () =>
    Effect.gen(function* () {
      const subDoc: WorkflowDoc = {
        $schema: "trident-workflow-v1" as const,
        meta: { name: "sub", tier: 1 as const },
        nodes: [{ id: "A", type: "x" }] as any,
        edges: [] as any
      }
      const ctx: any = { runId: "r", vars: { _workflowDepth: 3 }, _workflowDepth: 3, nodeHandles: {}, budget: { startedAt: 0, deadlineMs: 600000, maxNodesFiring: 15 } }
      const res: any = yield* runNode(workflowMachineNode, { node: { id: "wm1", config: { workflow: subDoc } }, inbound: {} }, ctx)
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.state).toBe("DEPTH_EXCEEDED")
    }))

  it.effect("workflow-machine adversarial: invalid doc decode fails", () =>
    Effect.gen(function* () {
      const badDoc = { $schema: "wrong", meta: { name: "bad", tier: 1 }, nodes: [], edges: [] }
      const res: any = yield* runNode(workflowMachineNode, { node: { id: "wm1", config: { workflow: badDoc } }, inbound: {} }, { runId: "r", vars: {}, nodeHandles: {}, budget: { startedAt: 0, deadlineMs: 600000, maxNodesFiring: 15 } })
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.state).toBe("DECODE_FAIL")
    }))

  it.effect("replay-source reads journal rows and rebuilds summary", () =>
    Effect.gen(function* () {
      const j = yield* makeJournal
      const runId = "replay-run-1"
      yield* j.append({ run: runId, node: "A", kind: "verdict" as any, verdict: "PASS" as any, evidence: { pattern: "test", state: "PASS", anchor: "A:1" }, source: "workflow/wf/A" } as any)
      yield* j.append({ run: runId, node: "B", kind: "verdict" as any, verdict: "FAIL" as any, evidence: { pattern: "test", state: "FAIL", anchor: "B:1" }, source: "workflow/wf/B" } as any)
      const res: any = yield* runNode(replaySourceNode, { node: { id: "rs1", config: { runId } }, inbound: {} }, { journal: j } as any).pipe(Effect.provideService(Journal, j))
      expect(res.verdict).toBe("FAIL")
      expect(res.outputs.count).toBe(2)
      expect(res.outputs.summary).toBeDefined()
    }))

  it.effect("replay-source adversarial: missing runId fails", () =>
    Effect.gen(function* () {
      const res: any = yield* runNode(replaySourceNode, { node: { id: "rs1", config: {} }, inbound: {} }, { journal: { rows: () => Effect.succeed([]) } } as any)
      expect(res.verdict).toBe("FAIL")
      expect(res.evidence.state).toBe("MISSING_RUNID")
    }))

  it.effect("replay-source adversarial: empty rows returns INCONCLUSIVE", () =>
    Effect.gen(function* () {
      const j = yield* makeJournal
      const res: any = yield* runNode(replaySourceNode, { node: { id: "rs1", config: { runId: "no-such-run" } }, inbound: {} }, { journal: j } as any).pipe(Effect.provideService(Journal, j))
      expect(res.verdict).toBe("INCONCLUSIVE")
      expect(res.outputs.count).toBe(0)
    }))

  it.effect("replay-source adversarial: null config handled via inbound", () =>
    Effect.gen(function* () {
      const j = yield* makeJournal
      const res: any = yield* runNode(replaySourceNode, { node: { id: "rs1" } as any, inbound: { runId: "no-such" } }, { journal: j } as any).pipe(Effect.provideService(Journal, j))
      expect(res.verdict).toBe("INCONCLUSIVE")
    }))
})
