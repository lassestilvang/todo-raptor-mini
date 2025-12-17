import fs from 'fs'
import path from 'path'

// Returns true if better-sqlite3 can be required AND a memory connection can be opened successfully
export function canUseBetterSqlite3() {
  try {
    const Better = require('better-sqlite3')
    try {
      const testConn = new Better(':memory:')
      testConn.exec('SELECT 1')
      testConn.close()
      return true
    } catch (_err) {
      void _err
      return false
    }
  } catch (_err) {
    void _err
    return false
  }
}

// Initializes an in-memory better-sqlite3 DB, applies migrations, and calls `initDb(conn)`
export function initBetterSqliteMemoryDb() {
  const Better = require('better-sqlite3')
  const conn = new Better(':memory:')
  const migrationsSql = fs.readFileSync(path.join(process.cwd(), 'db', 'migrations', '001_initial.sql'), 'utf8')
  conn.exec(migrationsSql)
  const { initDb } = require('../lib/db')
  initDb(conn)
  return conn
}

// Initializes an in-memory SQL.js database and applies migrations, then sets the drizzle instance via setDb
export async function initSqlJsDb(setDb: (db: any) => void) {
  // dynamic import so environments without sql.js won't fail at load time
  const initSqlJs = require('sql.js')
  const SQL = await initSqlJs({ locateFile: (file: string) => path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file) })
  const conn = new SQL.Database()
  const migrationsSql = fs.readFileSync(path.join(process.cwd(), 'db', 'migrations', '001_initial.sql'), 'utf8')
  conn.exec(migrationsSql)
  const { drizzle } = require('drizzle-orm/sql-js')
  const dbInstance = drizzle(conn)
  // expose raw SQL.js connection to runtime for tests & fallbacks
  // @ts-ignore - attach debug global for tests
  globalThis.__SQL_JS_CONN__ = conn
  setDb(dbInstance)
  return dbInstance
}
