import { v4 as uuidv4 } from 'uuid'
import { getDb } from './db'
import { labels } from '../db/schema'
import { eq } from 'drizzle-orm'

export async function createLabel(payload: { name: string; color?: string; icon?: string }) {
  const id = uuidv4()
  const row = { id, name: payload.name, color: payload.color ?? null, icon: payload.icon ?? null }
  const _db = getDb()
  await _db.insert(labels).values(row)
  return row
}

export async function getLabels() {
  const _db = getDb()
  const rows = await _db.select().from(labels).all()
  return rows.map(r => ({ id: r.id, name: r.name, color: r.color, icon: r.icon }))
}

export async function getLabelById(id: string) {
  const _db = getDb()
  const rows = await _db.select().from(labels).where(eq(labels.id, id)).limit(1)
  return rows[0] ?? null
}
