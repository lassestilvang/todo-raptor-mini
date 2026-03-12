import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db';
import { labels } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function createLabel(payload: { name: string; color?: string; icon?: string }) {
  const id = uuidv4();
  const row = { id, name: payload.name, color: payload.color ?? null, icon: payload.icon ?? null };
  // If running with SQL.js raw connection available, perform a direct insert as a fallback
  // @ts-ignore - runtime global
  const conn: any = globalThis.__SQL_JS_CONN__ || null;
  if (conn) {
    const name = payload.name.replace(/'/g, "''");
    const color = payload.color ? `'${payload.color.replace(/'/g, "''")}'` : 'NULL';
    const icon = payload.icon ? `'${payload.icon.replace(/'/g, "''")}'` : 'NULL';
    conn.exec(
      `INSERT INTO labels (id, name, color, icon) VALUES ('${id}', '${name}', ${color}, ${icon})`
    );
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
    try {
      const t = conn.exec('SELECT id,name,color,icon FROM labels');
      const rows = (t && t[0] && t[0].values) || [];
      const cols: string[] = (t && t[0] && t[0].columns) || [];
      return rows.map((vals: any[]) => {
        const r: any = {};
        cols.forEach((c, i) => (r[c] = vals[i]));
        return { id: r.id, name: r.name, color: r.color, icon: r.icon };
      });
    } catch {
      return [];
    }
  }

  const _db = getDb();
  if (!_db) return [];
  const rows = await _db.select().from(labels).all();
  return rows.map((r: any) => ({ id: r.id, name: r.name, color: r.color, icon: r.icon }));
}

export async function getLabelById(id: string) {
  // @ts-ignore - runtime global
  const conn: any = globalThis.__SQL_JS_CONN__ || null;
  if (conn) {
    try {
      // Use prepared statement to prevent SQL injection
      const stmt = conn.prepare('SELECT id,name,color,icon FROM labels WHERE id = ? LIMIT 1');
      stmt.bind([id]);
      const result = stmt.get();
      if (!result) return null;
      const cols: string[] = (conn.prepare('SELECT * FROM labels').columns) || ['id', 'name', 'color', 'icon'];
      const r: any = {};
      cols.forEach((c: string, i: number) => (r[c] = result[i]));
      return { id: r.id, name: r.name, color: r.color, icon: r.icon };
    } catch (e) {
      console.error('Error in getLabelById:', e);
      return null;
    }
  }

  const _db = getDb();
  const rows = await _db.select().from(labels).where(eq(labels.id, id)).limit(1);
  return rows[0] ?? null;
}
