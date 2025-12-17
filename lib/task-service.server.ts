import { Task } from './types'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from './db'
import { tasks } from '../db/schema'
import { eq } from 'drizzle-orm'
import { logActivity } from './activity-service.server'

// DB-backed task service using Drizzle (falls back to in-memory for edge cases)

export async function createTask(payload: Partial<Task>): Promise<Task> {
  const id = payload.id ?? uuidv4()
  const now = new Date().toISOString()
  const row = {
    id,
    list_id: payload.listId ?? 'inbox',
    title: payload.title ?? 'Untitled task',
    notes: payload.notes ?? '',
    status: 'todo',
    priority: payload.priority === 'high' ? 2 : payload.priority === 'medium' ? 1 : payload.priority === 'low' ? -1 : 0,
    due_date: payload.dueDate ?? null,
    estimate_minutes: payload.estimateMinutes ?? 0,
    actual_minutes: payload.actualMinutes ?? 0,
    recurrence: payload.recurrence ? JSON.stringify(payload.recurrence) : null,
    created_at: now,
    updated_at: now,
    completed_at: payload.completedAt ?? null
  }

  // If SQL.js raw conn available, insert using raw SQL for compatibility
  // @ts-ignore - runtime global
  const conn: any = (globalThis as any).__SQL_JS_CONN__ || null
  if (conn) {
    const title = row.title.replace(/'/g, "''")
    const notes = row.notes ? `'${row.notes.replace(/'/g, "''")}'` : 'NULL'
    const due = row.due_date ? `'${row.due_date}'` : 'NULL'
    const recurrence = row.recurrence ? `'${row.recurrence.replace(/'/g, "''")}'` : 'NULL'
    const completed = row.completed_at ? `'${row.completed_at}'` : 'NULL'
    conn.exec(`INSERT INTO tasks (id, list_id, title, notes, status, priority, due_date, estimate_minutes, actual_minutes, recurrence, created_at, updated_at, completed_at) VALUES ('${id}', '${row.list_id}', '${title}', ${notes}, '${row.status}', ${row.priority}, ${due}, ${row.estimate_minutes}, ${row.actual_minutes}, ${recurrence}, '${row.created_at}', '${row.updated_at}', ${completed})`)
    await logActivity('task', id, 'created', { title: row.title })
    const t = conn.exec(`SELECT * FROM tasks WHERE id = '${id}'`)
    const resultRow = t && t.length > 0 && t[0].values && t[0].values[0] ? t[0].values[0] : null
    const mapped = resultRow ? {
      id: resultRow[0],
      listId: resultRow[1],
      title: resultRow[2],
      notes: resultRow[3],
      dueDate: resultRow[6],
      estimateMinutes: resultRow[7],
      actualMinutes: resultRow[8],
      recurrence: resultRow[9] ? JSON.parse(resultRow[9]) : null,
      createdAt: resultRow[10],
      updatedAt: resultRow[11],
      completedAt: resultRow[12]
    } : null
    return mapped as any
  }

  const _db = getDb()
  const insertQuery: any = _db.insert(tasks).values(row)
  // Some drivers (sql-js) return a query object that needs `.run()` to execute
  if (insertQuery && typeof insertQuery.run === 'function') {
    await insertQuery.run()
  } else {
    await insertQuery
  }

  await logActivity('task', id, 'created', { title: row.title })
  const t = await _db.select().from(tasks).where(eq(tasks.id, id))
  const result = t[0]
  return {
    id: result.id,
    listId: result.list_id,
    title: result.title,
    notes: result.notes,
    dueDate: result.due_date,
    estimateMinutes: result.estimate_minutes,
    actualMinutes: result.actual_minutes,
    recurrence: result.recurrence ? JSON.parse(result.recurrence) : null,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
    completedAt: result.completed_at,
    priority: 'none'
  }
}

export async function getTasks(): Promise<Task[]> {
  const _db = getDb()
  const rows = await _db.select().from(tasks).limit(100).all()
  return rows.map((r: any) => ({
    id: r.id,
    listId: r.list_id,
    title: r.title,
    notes: r.notes,
    dueDate: r.due_date,
    estimateMinutes: r.estimate_minutes,
    actualMinutes: r.actual_minutes,
    recurrence: r.recurrence ? JSON.parse(r.recurrence) : null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    completedAt: r.completed_at,
    priority: 'none'
  }))
}

export async function getTaskById(id: string): Promise<Task | null> {
  const _db = getDb()
  const rows = await _db.select().from(tasks).where(eq(tasks.id, id)).limit(1).all()
  const r = rows[0]
  if (!r) return null
  return {
    id: r.id,
    listId: r.list_id,
    title: r.title,
    notes: r.notes,
    dueDate: r.due_date,
    estimateMinutes: r.estimate_minutes,
    actualMinutes: r.actual_minutes,
    recurrence: r.recurrence ? JSON.parse(r.recurrence) : null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    completedAt: r.completed_at,
    priority: 'none'
  }
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<Task | null> {
  const now = new Date().toISOString()
  const updates: any = { updated_at: now }
  if (patch.title !== undefined) updates.title = patch.title
  if (patch.notes !== undefined) updates.notes = patch.notes
  if (patch.dueDate !== undefined) updates.due_date = patch.dueDate
  if (patch.estimateMinutes !== undefined) updates.estimate_minutes = patch.estimateMinutes
  if (patch.actualMinutes !== undefined) updates.actual_minutes = patch.actualMinutes
  if (patch.completedAt !== undefined) updates.completed_at = patch.completedAt
  if (patch.recurrence !== undefined) updates.recurrence = JSON.stringify(patch.recurrence)

  const _db = getDb()
  await _db.update(tasks).set(updates).where(eq(tasks.id, id))
  return getTaskById(id)
}

export async function deleteTask(id: string): Promise<void> {
  const _db = getDb()
  await _db.delete(tasks).where(eq(tasks.id, id))
}

export async function clearTasks() {
  const _db = getDb()
  await _db.delete(tasks).run()
}
