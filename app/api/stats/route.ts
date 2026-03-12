import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { tasks } from '../../../db/schema';
import { lt } from 'drizzle-orm';

export async function GET() {
  const _db = getDb();
  const now = new Date().toISOString();
  // @ts-ignore - runtime global
  const conn: any = (globalThis as any).__SQL_JS_CONN__ || null;
  if (conn) {
    try {
      // Use prepared statement to prevent SQL injection
      const stmt = conn.prepare(
        'SELECT COUNT(*) as c FROM tasks WHERE due_date IS NOT NULL AND due_date < ? AND completed_at IS NULL'
      );
      stmt.bind([now]);
      const res = stmt.get();
      const count = res && res[0] ? res[0] : 0;
      return NextResponse.json({ overdueCount: count });
    } catch (e) {
      console.error('Error in stats GET (SQL.js):', e);
      // fallback to drizzle path below
    }
  }

  if (!_db) return NextResponse.json({ overdueCount: 0 });

  const overdue = await _db
    .select()
    .from(tasks)
    .where(lt(tasks.due_date, now))
    .where(tasks.completed_at.isNull())
    .all();
  return NextResponse.json({ overdueCount: overdue.length });
}
