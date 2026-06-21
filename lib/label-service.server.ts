import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db';
import { labels } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getPreparedOne, runPrepared } from './sqljs-utils.server';

export async function createLabel(payload: { name: string; color?: string; icon?: string }) {
  const id = uuidv4();
  const row = { id, name: payload.name, color: payload.color ?? null, icon: payload.icon ?? null };
  // @ts-ignore - runtime global
  const conn: any = globalThis.__SQL_JS_CONN__ || null;
  if (conn) {
    runPrepared(conn, `INSERT INTO labels (id, name, color, icon) VALUES (?, ?, ?, ?)`, [
      id,
      payload.name,
      payload.color ?? null,
      payload.icon ?? null,
    ]);
    return row;
  }

  const _db = getDb();
  const insertQuery: any = _db.insert(labels).values(row);
  if (insertQuery && typeof insertQuery.run === 'function') {
    await insertQuery.run();
  } else {
    await insertQuery;
  }
  return row;
}

export async function getLabels() {
  // @ts-ignore - runtime global
  const conn: any = globalThis.__SQL_JS_CONN__ || null;
  if (conn) {
    return runPrepared(conn, 'SELECT id,name,color,icon FROM labels');
  }

  const _db = getDb();
  if (!_db) return [];
  const rows = await _db.select().from(labels).all();
  return rows.map((r) => ({ id: r.id, name: r.name, color: r.color, icon: r.icon }));
}

export async function getLabelById(id: string) {
  // @ts-ignore - runtime global
  const conn: any = globalThis.__SQL_JS_CONN__ || null;
  if (conn) {
    const row = getPreparedOne(conn, 'SELECT id,name,color,icon FROM labels WHERE id = ? LIMIT 1', [
      id,
    ]);
    if (!row) return null;
    return { id: row.id, name: row.name, color: row.color, icon: row.icon };
  }

  const _db = getDb();
  const rows = await _db.select().from(labels).where(eq(labels.id, id)).limit(1);
  return rows[0] ?? null;
}
