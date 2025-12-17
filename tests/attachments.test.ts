import { describe, it, expect, beforeEach } from 'bun:test'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { initDb } from '../lib/db'

let conn: Database

beforeEach(() => {
  conn = new Database(':memory:')
  const migrationsSql = fs.readFileSync(path.join(process.cwd(), 'db', 'migrations', '001_initial.sql'), 'utf8')
  conn.exec(migrationsSql)
  initDb(conn)
})

describe('attachments', () => {
  it('returns attachments for task via GET handler', async () => {
    const _db = await import('../lib/db').then(m => m.getDb())
    const id = 'a1'
    await _db.insert((await import('../db/schema')).attachments).values({ id, task_id: 't1', filename: 'f.txt', size: 10, mime: 'text/plain', storage_key: 'k', created_at: new Date().toISOString() })

    const { GET } = await import('../app/api/attachments/route')
    const res = await GET(new Request('http://localhost/api/attachments?taskId=t1'))
    const data = await res.json()
    expect(data.attachments.length).toBe(1)
    expect(data.attachments[0].filename).toBe('f.txt')
  })
})
