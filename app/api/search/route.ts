import { NextResponse } from 'next/server'
import Fuse from 'fuse.js'
import { getDb } from '../../../lib/db'
import { tasks } from '../../../db/schema'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q') || ''
  if (!q) return NextResponse.json({ results: [] })
  const _db = getDb()
  const rows = await _db.select().from(tasks).all()
  const items = rows.map(r => ({ id: r.id, title: r.title, notes: r.notes }))
  const fuse = new Fuse(items, { keys: ['title', 'notes'], threshold: 0.3 })
  const results = fuse.search(q).map(r => r.item)
  return NextResponse.json({ results })
}
