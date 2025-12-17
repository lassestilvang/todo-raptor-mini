import { NextResponse } from 'next/server'
import { getDb } from '../../../lib/db'
import { tasks } from '../../../db/schema'
import { lt } from 'drizzle-orm'

export async function GET() {
  const _db = getDb()
  const now = new Date().toISOString()
  const overdue = await _db.select().from(tasks).where(lt(tasks.due_date, now)).where(tasks.completed_at.isNull()).all()
  return NextResponse.json({ overdueCount: overdue.length })
}
