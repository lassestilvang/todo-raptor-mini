import { Task } from './types';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db';
import { tasks } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logActivity } from './activity-service.server';
import { safeQuery, getPreparedOne } from './sqljs-utils.server';

// Helper to map priority numeric value back to string
function mapPriorityValue(value: number): 'high' | 'medium' | 'low' | 'none' {
  switch (value) {
    case 2:
      return 'high';
    case 1:
      return 'medium';
    case -1:
      return 'low';
    default:
      return 'none';
  }
}

function safeParse<T = any>(s: string | null | undefined): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch (err) {
    console.warn('safeParse: invalid JSON, returning null');
    return null;
  }
}

// DB-backed task service using Drizzle (falls back to in-memory for edge cases)

export async function createTask(payload: Partial<Task>): Promise<Task> {
  const id = payload.id ?? uuidv4();
  const now = new Date().toISOString();
  const priorityValue =
    payload.priority === 'high'
      ? 2
      : payload.priority === 'medium'
        ? 1
        : payload.priority === 'low'
          ? -1
          : 0;
  const row = {
    id,
    list_id: payload.listId ?? 'inbox',
    title: payload.title ?? 'Untitled task',
    notes: payload.notes ?? '',
    status: 'todo',
    priority: priorityValue,
    due_date: payload.dueDate ?? null,
    estimate_minutes: payload.estimateMinutes ?? 0,
    actual_minutes: payload.actualMinutes ?? 0,
    recurrence: payload.recurrence ? JSON.stringify(payload.recurrence) : null,
    created_at: now,
    updated_at: now,
    completed_at: payload.completedAt ?? null,
  };

  // If SQL.js raw conn available, insert using raw SQL for compatibility
  // @ts-ignore - runtime global
  const conn: any = (globalThis as any).__SQL_JS_CONN__ || null;
  if (conn) {
    // Use prepared statement to prevent SQL injection
    const stmt = conn.prepare(
      `INSERT INTO tasks (id, list_id, title, notes, status, priority, due_date, estimate_minutes, actual_minutes, recurrence, created_at, updated_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.bind([
      id,
      row.list_id,
      row.title,
      row.notes,
      row.status,
      row.priority,
      row.due_date,
      row.estimate_minutes,
      row.actual_minutes,
      row.recurrence,
      row.created_at,
      row.updated_at,
      row.completed_at,
    ]);
    stmt.step();
    stmt.free();

    await logActivity('task', id, 'created', { title: row.title });

    // Return the inserted row using the constructed `row` to avoid brittle re-selects in SQL.js
    return {
      id: row.id,
      listId: row.list_id,
      title: row.title,
      notes: row.notes,
      dueDate: row.due_date,
      estimateMinutes: row.estimate_minutes,
      actualMinutes: row.actual_minutes,
      recurrence: safeParse(row.recurrence),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
      priority: mapPriorityValue(row.priority),
    } as any;
  }

  const _db = getDb();
  const insertQuery: any = _db.insert(tasks).values(row);
  // Some drivers (sql-js) return a query object that needs `.run()` to execute
  if (insertQuery && typeof insertQuery.run === 'function') {
    await insertQuery.run();
  } else {
    await insertQuery;
  }

  await logActivity('task', id, 'created', { title: row.title });
  const t = await _db.select().from(tasks).where(eq(tasks.id, id));
  const result = t[0];
  return {
    id: result.id,
    listId: result.list_id,
    title: result.title,
    notes: result.notes,
    dueDate: result.due_date,
    estimateMinutes: result.estimate_minutes,
    actualMinutes: result.actual_minutes,
    recurrence: safeParse(result.recurrence),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
    completedAt: result.completed_at,
    priority: mapPriorityValue(result.priority),
  };
}

export async function getTasks(): Promise<Task[]> {
  // @ts-ignore - runtime global
  const conn: any = globalThis.__SQL_JS_CONN__ || null;
  if (conn) {
    try {
      const sql = 'SELECT id,list_id,title,notes,status,priority,due_date,estimate_minutes,actual_minutes,recurrence,created_at,updated_at,completed_at FROM tasks LIMIT 100';
      const raw = safeQuery(conn, sql);
      return raw.map((r: any) => ({
        id: r.id,
        listId: r.list_id,
        title: r.title,
        notes: r.notes,
        dueDate: r.due_date,
        estimateMinutes: r.estimate_minutes,
        actualMinutes: r.actual_minutes,
        recurrence: safeParse(r.recurrence),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        completedAt: r.created_at,
        priority: mapPriorityValue(r.priority),
      }));
    } catch (e) {
      console.error('Error in getTasks (SQL.js):', (e as any)?.message ?? e);
      return [];
    }
  }

  const _db = getDb();
  if (!_db) return [];
  const rows = await _db.select().from(tasks).limit(100).all();
  return rows.map((r: any) => ({
    id: r.id,
    listId: r.list_id,
    title: r.title,
    notes: r.notes,
    dueDate: r.due_date,
    estimateMinutes: r.estimate_minutes,
    actualMinutes: r.actual_minutes,
    recurrence: safeParse(r.recurrence),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    completedAt: r.completed_at,
    priority: mapPriorityValue(r.priority),
  }));
}

export async function getTaskById(id: string): Promise<Task | null> {
  // @ts-ignore - runtime global
  const conn: any = globalThis.__SQL_JS_CONN__ || null;
  if (conn) {
    try {
      // Use prepared statement to prevent SQL injection
      const sql = 'SELECT id,list_id,title,notes,status,priority,due_date,estimate_minutes,actual_minutes,recurrence,created_at,updated_at,completed_at FROM tasks WHERE id = ? LIMIT 1';
      const r = getPreparedOne(conn, sql, [id]);
      if (!r) return null;
      return {
        id: r.id,
        listId: r.list_id,
        title: r.title,
        notes: r.notes,
        dueDate: r.due_date,
        estimateMinutes: r.estimate_minutes,
        actualMinutes: r.actual_minutes,
        recurrence: safeParse(r.recurrence),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        completedAt: r.completed_at,
        priority: mapPriorityValue(r.priority),
      };
    } catch (e) {
      console.error('Error in getTaskById (SQL.js):', (e as any)?.message ?? e);
      return null;
    }
  }

  const _db = getDb();
  if (!_db) return null;
  const rows = await _db.select().from(tasks).where(eq(tasks.id, id)).limit(1).all();
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    listId: r.list_id,
    title: r.title,
    notes: r.notes,
    dueDate: r.due_date,
    estimateMinutes: r.estimate_minutes,
    actualMinutes: r.actual_minutes,
    recurrence: safeParse(r.recurrence),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    completedAt: r.completed_at,
    priority: mapPriorityValue(r.priority),
  };
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<Task | null> {
  const now = new Date().toISOString();
  const updates: any = { updated_at: now };
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.notes !== undefined) updates.notes = patch.notes;
  if (patch.dueDate !== undefined) updates.due_date = patch.dueDate;
  if (patch.estimateMinutes !== undefined) updates.estimate_minutes = patch.estimateMinutes;
  if (patch.actualMinutes !== undefined) updates.actual_minutes = patch.actualMinutes;
  if (patch.completedAt !== undefined) updates.completed_at = patch.completedAt;
  if (patch.recurrence !== undefined) updates.recurrence = JSON.stringify(patch.recurrence);

  const _db = getDb();
  if (!_db) throw new Error('Database not initialized');
  await _db.update(tasks).set(updates).where(eq(tasks.id, id));
  return getTaskById(id);
}

export async function deleteTask(id: string): Promise<void> {
  const _db = getDb();
  if (!_db) throw new Error('Database not initialized');
  await _db.delete(tasks).where(eq(tasks.id, id));
}

export async function clearTasks() {
  const _db = getDb();
  if (!_db) throw new Error('Database not initialized');
  await _db.delete(tasks).run();
}
