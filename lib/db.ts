import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'path'

let _db: any = null

export function initDb(connection?: string | any) {
  if (typeof connection === 'string' || connection === undefined) {
    const dbPath = (connection as string) || process.env.DATABASE_URL || path.join(process.cwd(), 'db', 'data.db')
    let Database: any
    try {
      // require inside function to avoid loading native bindings at module import time
      Database = require('better-sqlite3')
    } catch (e) {
      throw e
    }
    const conn = new Database(dbPath)
    _db = drizzle(conn)
  } else {
    // connection is a Database instance
    _db = drizzle(connection as any)
  }
  return _db
}

// initialize default DB on import. Wrap in try/catch to avoid throwing when native bindings are missing
try {
  initDb()
} catch (_err) {
  // If better-sqlite3 native bindings are missing, we skip default DB initialization.
  // Tests can (and should) call `initDb(conn)` with a connection when needed.
  // This prevents top-level crashes when native bindings cannot be loaded.

  void _err
  const isBun = typeof process !== 'undefined' && process.versions && process.versions.bun
  const warnedKey = '__todo_db_init_warning_shown__'
  if (!(globalThis as any)[warnedKey]) {
    console.warn('Warning: default DB initialization skipped (better-sqlite3 not available).')
    if (isBun) {
      console.warn('Detected Bun runtime — better-sqlite3 native bindings are unsupported in Bun. To initialize the DB:')
      console.warn("  - run 'node scripts/init-db.ts' on a Node.js runtime, or")
      console.warn("  - install 'sql.js' to enable the script to initialize the DB when running under Bun (optional fallback).")
    } else {
      console.warn('If you expect a DB, run scripts/init-db.ts with Node or install a compatible sqlite3 driver for your environment.')
    }
    ;(globalThis as any)[warnedKey] = true
  }
}

export const db = () => _db

export function getDb() {
  return _db
}

// Allow tests (or other environments) to directly set the underlying drizzle instance
export function setDb(dbInstance: any) {
  _db = dbInstance
}
