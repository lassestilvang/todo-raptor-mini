import fs from 'fs'
import os from 'os'
import path from 'path'
import { test, expect } from 'bun:test'
import { initDb } from '../scripts/init-db'

// Test that sql.js fallback applies migrations and writes a DB file when run under Bun-like environment.
// We simulate a migrations directory and run initDb with a temporary DB path.

test('initDb uses sql.js fallback to apply migrations', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-db-'))
  const migrationsDir = path.join(tmp, 'migrations')
  fs.mkdirSync(migrationsDir)

  // Create a simple migration that creates a table and inserts a row
  const migration = `CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT);
  INSERT INTO test_table (name) VALUES ('alice');`
  fs.writeFileSync(path.join(migrationsDir, '001_create_test.sql'), migration)

  const dbPath = path.join(tmp, 'data.db')

  // Call initDb pointing to our temp migrations and DB
  const res = await initDb({ dbPath, migrationsDir })
  expect(res.used === 'sql.js' || res.used === 'better-sqlite3').toBeTruthy()
  expect(fs.existsSync(dbPath)).toBeTruthy()

  // If sql.js was used, we can load the resulting DB file with sql.js and query it
  const initSqlJs = require('sql.js')
  const SQL = await initSqlJs({ locateFile: (file: string) => path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file) })
  const fileBuf = fs.readFileSync(dbPath)
  const db = new SQL.Database(new Uint8Array(fileBuf))
  const rows = db.exec("SELECT name FROM test_table WHERE id = 1")
  expect(rows.length).toBe(1)
  expect(rows[0].values[0][0]).toBe('alice')

  // cleanup
  fs.rmSync(tmp, { recursive: true, force: true })
})
