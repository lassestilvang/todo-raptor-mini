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
      const res = conn.exec(
        `SELECT COUNT(*) as c FROM tasks WHERE due_date IS NOT NULL AND due_date < '${now}' AND completed_at IS NULL`
      );
      const count =
        res && res[0] && res[0].values && res[0].values[0] && res[0].values[0][0]
          ? res[0].values[0][0]
          : 0;
      return NextResponse.json({ overdueCount: count });
    } catch (_e) {
      // fallback to drizzle path below
      void _e;
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
