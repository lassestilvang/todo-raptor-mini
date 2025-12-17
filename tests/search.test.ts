import { describe, it, expect, beforeEach } from 'bun:test'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { initDb } from '../lib/db'
import { createTask, clearTasks } from '../lib/task-service.server'

let conn: Database

beforeEach(() => {
  conn = new Database(':memory:')
  const migrationsSql = fs.readFileSync(path.join(process.cwd(), 'db', 'migrations', '001_initial.sql'), 'utf8')
  conn.exec(migrationsSql)
  initDb(conn)
})

describe('search API', () => {
  it('returns matching tasks for a query', async () => {
    await clearTasks()
    await createTask({ title: 'Buy milk' })
    await createTask({ title: 'Write report' })

    const { GET } = await import('../app/api/search/route')
    const res = await GET(new Request('http://localhost/api/search?q=milk'))
    const data = await res.json()
    expect(data.results.length).toBe(1)
    expect(data.results[0].title).toBe('Buy milk')
  })
})
