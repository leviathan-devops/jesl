import { Effect, Clock } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"
import { createRequire } from "module"

const dbCache = new Map<string, any>()

function getDb(dbPath: string): any {
  if (dbCache.has(dbPath)) return dbCache.get(dbPath)
  const Database = (() => {
    try {
      const req = createRequire(import.meta.url)
      const m: any = req("better-sqlite3")
      return m.default ?? m
    } catch (e) {
      throw new Error(`better-sqlite3 not installed: ${String((e as any)?.message ?? e)}`)
    }
  })()
  const db = new Database(dbPath)
  try {
    db.pragma("journal_mode = WAL")
  } catch (e) {
    Effect.logWarning(`sqlite-sink pragma WAL failed: ${String((e as any)?.message ?? e)}`)
  }
  try {
    db.pragma("busy_timeout = 5000")
  } catch (e) {
    Effect.logWarning(`sqlite-sink pragma busy_timeout failed: ${String((e as any)?.message ?? e)}`)
  }
  dbCache.set(dbPath, db)
  return db
}

function ensureTable(db: any, table: string, sample: Record<string, unknown>): void {
  const cols = Object.keys(sample)
  if (cols.length === 0) {
    db.exec(`CREATE TABLE IF NOT EXISTS "${table}" (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)`)
    return
  }
  const defs = cols.map((c) => `"${c.replace(/"/g, '""')}" TEXT`).join(", ")
  db.exec(`CREATE TABLE IF NOT EXISTS "${table}" (${defs})`)
  const existing = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(table) as any
  if (existing?.sql) {
    for (const c of cols) {
      if (!existing.sql.includes(`"${c}"`) && !existing.sql.includes(`'${c}'`) && !existing.sql.includes(c)) {
        try {
          db.exec(`ALTER TABLE "${table}" ADD COLUMN "${c.replace(/"/g, '""')}" TEXT`)
        } catch (e) {
          console.error(`sqlite-sink add column failed for ${c}: ${String((e as any)?.message ?? e)}`)
        }
      }
    }
  }
}

export const sqliteSinkNode: NodeImpl = {
  kind: "sqlite-sink",
  family: "deterministic",
  requiredCaps: [],
  invoke: (input: unknown, _ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { op?: string; db?: string; table?: string; sql?: string }
      const op = (cfg.op as string) ?? (inp.inbound["op"] as string) ?? "write"
      const dbPath = (cfg.db as string) ?? (inp.inbound["db"] as string) ?? ""
      const table = (cfg.table as string) ?? (inp.inbound["table"] as string) ?? ""
      const sql = (cfg.sql as string) ?? (inp.inbound["sql"] as string) ?? ""
      const startMs = yield* Clock.currentTimeMillis
      if (!dbPath) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "sqlite-sink", state: "MISSING_DB", anchor: `${inp.node.id}:missing-db` }, timing: { startMs, endMs }, outputs: { error: "missing db path" } } as NodeResult
      }
      if (!table && op !== "query") {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "sqlite-sink", state: "MISSING_TABLE", anchor: `${inp.node.id}:missing-table` }, timing: { startMs, endMs }, outputs: { error: "missing table" } } as NodeResult
      }
      if (op !== "write" && op !== "query") {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "sqlite-sink", state: "INVALID_OP", anchor: `${inp.node.id}:invalid-op:${op}` }, timing: { startMs, endMs }, outputs: { error: `invalid op ${op}` } } as NodeResult
      }
      let db: any
      try {
        db = getDb(dbPath)
      } catch (e: any) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "FAIL" as const, evidence: { pattern: "sqlite-sink", state: "DB_OPEN_FAIL", anchor: `${inp.node.id}:db-open-fail` }, timing: { startMs, endMs }, outputs: { error: String(e?.message ?? e) } } as NodeResult
      }
      if (op === "write") {
        const raw = inp.inbound["data"] ?? inp.inbound["row"] ?? inp.inbound["payload"] ?? Object.values(inp.inbound)[0] ?? inp.inbound
        let payload: Record<string, unknown>
        if (raw && typeof raw === "object" && !Array.isArray(raw)) payload = raw as Record<string, unknown>
        else if (typeof raw === "string") {
          try {
            payload = JSON.parse(raw)
          } catch {
            payload = { value: raw }
          }
        } else payload = { value: raw as unknown }
        if (payload === null || payload === undefined || (typeof payload === "object" && Object.keys(payload).length === 0 && Object.keys(inp.inbound).length === 0)) {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "sqlite-sink", state: "EMPTY_PAYLOAD", anchor: `${inp.node.id}:empty-payload` }, timing: { startMs, endMs }, outputs: { error: "empty payload" } } as NodeResult
        }
        try {
          ensureTable(db, table, payload)
          const cols = Object.keys(payload)
          const placeholders = cols.map(() => "?").join(", ")
          const colNames = cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(", ")
          const stmt = db.prepare(`INSERT INTO "${table.replace(/"/g, '""')}" (${colNames}) VALUES (${placeholders})`)
          const vals = cols.map((c) => {
            const v = (payload as any)[c]
            if (v === null || v === undefined) return null
            if (typeof v === "string") return v
            return JSON.stringify(v)
          })
          const info = stmt.run(...vals)
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "PASS" as const, evidence: { pattern: "sqlite-sink", state: "WRITTEN", anchor: `${inp.node.id}:written:${info.lastInsertRowid}` }, timing: { startMs, endMs }, outputs: { lastInsertRowid: info.lastInsertRowid, changes: info.changes, payload } } as NodeResult
        } catch (e: any) {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "sqlite-sink", state: "WRITE_FAIL", anchor: `${inp.node.id}:write-fail` }, timing: { startMs, endMs }, outputs: { error: String(e?.message ?? e) } } as NodeResult
        }
      } else {
        const querySql = sql || `SELECT * FROM "${table.replace(/"/g, '""')}"`
        try {
          const stmt = db.prepare(querySql)
          const rows = stmt.all()
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "PASS" as const, evidence: { pattern: "sqlite-sink", state: "QUERIED", anchor: `${inp.node.id}:queried:${rows.length}` }, timing: { startMs, endMs }, outputs: { rows, count: rows.length } } as NodeResult
        } catch (e: any) {
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: "FAIL" as const, evidence: { pattern: "sqlite-sink", state: "QUERY_FAIL", anchor: `${inp.node.id}:query-fail` }, timing: { startMs, endMs }, outputs: { error: String(e?.message ?? e) } } as NodeResult
        }
      }
    })
}

export const _dbCache = dbCache
export const _getDb = getDb
