import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db';
import { activity_log } from '../db/schema';

export async function logActivity(
  entityType: string,
  entityId: string,
  action: string,
  payload: any = null,
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
  // If SQL.js raw conn available, use raw insert to ensure compatibility
  // @ts-ignore - runtime global
  const conn: any = (globalThis as any).__SQL_JS_CONN__ || null;
  if (conn) {
    const payloadSql = payload ? `'${JSON.stringify(payload).replace(/'/g, "''")}'` : 'NULL';
    const performedBySql = performedBy ? `'${performedBy.replace(/'/g, "''")}'` : 'NULL';
    conn.exec(
      `INSERT INTO activity_log (id, entity_type, entity_id, action, payload, performed_by, created_at) VALUES ('${id}', '${entityType}', '${entityId}', '${action}', ${payloadSql}, ${performedBySql}, '${now}')`
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
      payload: r.payload ? JSON.parse(r.payload) : null,
      createdAt: r.created_at,
    }));
  } catch (e) {
    // Fallback to raw SQL for SQL.js driver
    // @ts-ignore - runtime global
    const conn: any = (globalThis as any).__SQL_JS_CONN__ || null;
    if (!conn) throw e;
    const res = conn.exec(
      `SELECT id, action, payload, created_at FROM activity_log WHERE entity_type = '${entityType}' AND entity_id = '${entityId}'`
    );
    const mapped =
      res && res[0] && res[0].values
        ? res[0].values.map((v: any[]) => ({
            id: v[0],
            action: v[1],
            payload: v[2] ? JSON.parse(v[2]) : null,
            createdAt: v[3],
          }))
        : [];
    return mapped;
  }
}
