import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db';
import { activity_log } from '../db/schema';
import { runPrepared, safeQuery } from './sqljs-utils.server';
import type { SqlJsConn } from './sqljs-utils.server';

export async function logActivity(
  entityType: string,
  entityId: string,
  action: string,
  payload: Record<string, unknown> | null = null,
  performedBy: string | null = null
) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const row = {
    id,
    entity_type: entityType,
    entity_id: entityId,
    action,
    payload: payload ? JSON.stringify(payload) : null,
    performed_by: performedBy,
    created_at: now,
  };
  // @ts-ignore - runtime global
  const conn = (globalThis as Record<string, unknown>).__SQL_JS_CONN__ as SqlJsConn | undefined;
  if (conn) {
    runPrepared(
      conn,
      `INSERT INTO activity_log (id, entity_type, entity_id, action, payload, performed_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, entityType, entityId, action, payload ? JSON.stringify(payload) : null, performedBy, now]
    );
    return row;
  }

  const _db = getDb();
  const insertQuery: any = _db.insert(activity_log).values(row);
  if (insertQuery && typeof insertQuery.run === 'function') {
    await insertQuery.run();
  } else {
    await insertQuery;
  }
  return row;
}

export async function getActivityForEntity(entityType: string, entityId: string) {
  const _db = getDb();
  try {
    const rows = await _db
      .select()
      .from(activity_log)
      .where(activity_log.entity_type.eq(entityType))
      .where(activity_log.entity_id.eq(entityId))
      .all();
    return rows.map((r: any) => ({
      id: r.id,
      action: r.action,
      payload: (() => {
        try {
          return r.payload ? JSON.parse(r.payload) : null;
        } catch {
          return null;
        }
      })(),
      createdAt: r.created_at,
    }));
  } catch (e) {
    const conn = (globalThis as Record<string, unknown>).__SQL_JS_CONN__ as SqlJsConn | undefined;
    if (!conn) throw e;
    try {
      const rows = safeQuery(
        conn,
        'SELECT id, action, payload, created_at FROM activity_log WHERE entity_type = ? AND entity_id = ?',
        [entityType, entityId]
      );
      return rows.map((obj: any) => ({
        id: obj.id,
        action: obj.action,
        payload: (() => {
          try {
            return obj.payload ? JSON.parse(obj.payload) : null;
          } catch {
            return null;
          }
        })(),
        createdAt: obj.created_at,
      }));
    } catch (stmtErr) {
      console.error(
        'SQL.js fallback failed for activity log:',
        (stmtErr as any)?.message ?? stmtErr
      );
      return [];
    }
  }
}
