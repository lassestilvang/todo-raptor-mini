import { describe, it, expect, beforeEach } from 'bun:test'
import { canUseBetterSqlite3, initBetterSqliteMemoryDb, initSqlJsDb } from './setup-db'

if (canUseBetterSqlite3()) {
  beforeEach(() => {
    initBetterSqliteMemoryDb()
  })

  describe('attachments', () => {
    it('returns attachments for task via GET handler', async () => {
      const _db = await import('../lib/db').then(m => m.getDb())
      const id = 'a1'
      const { runQuery } = await import('./_db-utils')
      const schema = await import('../db/schema')
      await runQuery(_db.insert(schema.attachments).values({ id, task_id: 't1', filename: 'f.txt', size: 10, mime: 'text/plain', storage_key: 'k', created_at: new Date().toISOString() }))

      const { GET } = await import('../app/api/attachments/route')
      const res = await GET(new Request('http://localhost/api/attachments?taskId=t1'))
      const data = await res.json()
      expect(data.attachments.length).toBe(1)
      expect(data.attachments[0].filename).toBe('f.txt')
    })
  })
} else {
  // fall back to SQL.js (pure JS) for environments without native better-sqlite3
  describe('attachments (sql.js)', () => {
    beforeEach(async () => {
      const { setDb } = await import('../lib/db')
      await initSqlJsDb(setDb)
    })

    it('returns attachments for task via GET handler (sql.js)', async () => {
      const _db = await import('../lib/db').then(m => m.getDb())
      const id = 'a1'
      // If SQL.js raw connection exists, use it to insert the row directly
      // @ts-ignore
      const conn: any = globalThis.__SQL_JS_CONN__ || null
      if (conn) {
        conn.exec(`INSERT INTO attachments (id, task_id, filename, size, mime, storage_key, created_at) VALUES ('${id}', 't1', 'f.txt', 10, 'text/plain', 'k', '${new Date().toISOString()}')`)
      } else {
        const { runQuery } = await import('./_db-utils')
        const schema = await import('../db/schema')
        await runQuery(_db.insert(schema.attachments).values({ id, task_id: 't1', filename: 'f.txt', size: 10, mime: 'text/plain', storage_key: 'k', created_at: new Date().toISOString() }))
      }

      const { GET } = await import('../app/api/attachments/route')
      const res = await GET(new Request('http://localhost/api/attachments?taskId=t1'))
      const data = await res.json()
      expect(data.attachments.length).toBe(1)
      expect(data.attachments[0].filename).toBe('f.txt')
    })
  })
}
