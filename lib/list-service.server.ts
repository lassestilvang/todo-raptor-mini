import { v4 as uuidv4 } from 'uuid'
import { getDb } from './db'
import { lists } from '../db/schema'
import { eq } from 'drizzle-orm'

export async function createList(payload: { title: string; color?: string; emoji?: string }) {
  const id = uuidv4()
  const now = new Date().toISOString()
  const row = { id, title: payload.title, color: payload.color ?? null, emoji: payload.emoji ?? null, created_at: now, updated_at: now }
  const _db = getDb()
  await _db.insert(lists).values(row)
  return row
}

export async function getLists() {
  const _db = getDb()
  const rows = await _db.select().from(lists).all()
  return rows.map(r => ({ id: r.id, title: r.title, color: r.color, emoji: r.emoji }))
}

export async function getListById(id: string) {
  const _db = getDb()
  const rows = await _db.select().from(lists).where(eq(lists.id, id)).limit(1)
  return rows[0] ?? null
}
