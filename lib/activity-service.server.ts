import { v4 as uuidv4 } from 'uuid'
import { getDb } from './db'
import { activity_log } from '../db/schema'

export async function logActivity(entityType: string, entityId: string, action: string, payload: any = null, performedBy: string | null = null) {
  const id = uuidv4()
  const now = new Date().toISOString()
  const row = { id, entity_type: entityType, entity_id: entityId, action, payload: payload ? JSON.stringify(payload) : null, performed_by: performedBy, created_at: now }
  const _db = getDb()
  await _db.insert(activity_log).values(row)
  return row
}

export async function getActivityForEntity(entityType: string, entityId: string) {
  const _db = getDb()
  const rows = await _db.select().from(activity_log).where(activity_log.entity_type.eq(entityType)).where(activity_log.entity_id.eq(entityId)).all()
  return rows.map(r => ({ id: r.id, action: r.action, payload: r.payload ? JSON.parse(r.payload) : null, createdAt: r.created_at }))
}
