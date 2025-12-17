import { v4 as uuidv4 } from 'uuid'
import { getDb } from './db'
import { lists } from '../db/schema'
import { eq } from 'drizzle-orm'

export async function createList(payload: { title: string; color?: string; emoji?: string }) {
  const id = uuidv4()
  const now = new Date().toISOString()
  const row = { id, title: payload.title, color: payload.color ?? null, emoji: payload.emoji ?? null, created_at: now, updated_at: now }
  // @ts-ignore - runtime global
  const conn: any = globalThis.__SQL_JS_CONN__ || null
  if (conn) {
    const title = payload.title.replace(/'/g, "''")
    const color = payload.color ? `'${payload.color.replace(/'/g, "''")}'` : 'NULL'
    const emoji = payload.emoji ? `'${payload.emoji.replace(/'/g, "''")}'` : 'NULL'
    conn.exec(`INSERT INTO lists (id, title, color, emoji, created_at, updated_at) VALUES ('${id}', '${title}', ${color}, ${emoji}, '${now}', '${now}')`)
    return row
  }

  const _db = getDb()
  const insertQuery: any = _db.insert(lists).values(row)
  if (insertQuery && typeof insertQuery.run === 'function') {
    await insertQuery.run()
  } else {
    await insertQuery
  }
  return row
}

export async function getLists() {
  const _db = getDb()
  const rows = await _db.select().from(lists).all()
  return rows.map((r: any) => ({ id: r.id, title: r.title, color: r.color, emoji: r.emoji }))
}

export async function getListById(id: string) {
  const _db = getDb()
  const rows = await _db.select().from(lists).where(eq(lists.id, id)).limit(1)
  return rows[0] ?? null
}
