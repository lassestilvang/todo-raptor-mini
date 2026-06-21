import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db';
import { lists } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getPreparedOne, runPrepared } from './sqljs-utils.server';
import type { SqlJsConn } from './sqljs-utils.server';

export async function createList(payload: { title: string; color?: string; emoji?: string }) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const row = {
    id,
    title: payload.title,
    color: payload.color ?? null,
    emoji: payload.emoji ?? null,
    created_at: now,
    updated_at: now,
  };
  const conn = (globalThis as Record<string, unknown>).__SQL_JS_CONN__ as SqlJsConn | undefined;
  if (conn) {
    runPrepared(
      conn,
      `INSERT INTO lists (id, title, color, emoji, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, payload.title, payload.color ?? null, payload.emoji ?? null, now, now]
    );
    return row;
  }

  const _db = getDb();
  if (!_db) {
    throw new Error('Database not initialized');
  }

  const insertQuery: any = _db.insert(lists).values(row);
  if (insertQuery && typeof insertQuery.run === 'function') {
    await insertQuery.run();
  } else {
    await insertQuery;
  }
  return row;
}

export async function getLists() {
  const conn = (globalThis as Record<string, unknown>).__SQL_JS_CONN__ as SqlJsConn | undefined;
  if (conn) {
    return runPrepared(conn, 'SELECT id,title,color,emoji FROM lists');
  }

  const _db = getDb();
  if (!_db) return [];
  const rows = await _db.select().from(lists).all();
  return rows.map(
    (r: { id: string; title: string; color: string | null; emoji: string | null }) => ({
      id: r.id,
      title: r.title,
      color: r.color,
      emoji: r.emoji,
    })
  );
}

export async function getListById(id: string) {
  const conn = (globalThis as Record<string, unknown>).__SQL_JS_CONN__ as SqlJsConn | undefined;
  if (conn) {
    const row = getPreparedOne(
      conn,
      'SELECT id,title,color,emoji FROM lists WHERE id = ? LIMIT 1',
      [id]
    );
    if (!row) return null;
    return { id: row.id, title: row.title, color: row.color, emoji: row.emoji };
  }

  const _db = getDb();
  if (!_db) return null;
  const rows = await _db.select().from(lists).where(eq(lists.id, id)).limit(1);
  return rows[0] ?? null;
}
