import { NextResponse } from 'next/server';
import Fuse from 'fuse.js';
import { getDb } from '../../../lib/db';
import { tasks } from '../../../db/schema';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  if (!q) return NextResponse.json({ results: [] });
  const _db = getDb();
  // @ts-ignore - runtime global
  const conn: any = (globalThis as any).__SQL_JS_CONN__ || null;
  let rows: any[] = [];
  if (conn) {
    const t = conn.exec('SELECT id,title,notes FROM tasks');
    rows =
      t && t[0] && t[0].values
        ? t[0].values.map((v: any[]) => ({ id: v[0], title: v[1], notes: v[2] }))
        : [];
  } else {
    rows = await _db.select().from(tasks).all();
  }
  const items = rows.map((r: any) => ({ id: r.id, title: r.title, notes: r.notes }));
  const fuse = new Fuse(items, { keys: ['title', 'notes'], threshold: 0.3 });
  const results = fuse.search(q).map((r) => r.item);
  return NextResponse.json({ results });
}
