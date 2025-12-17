import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const taskId = url.searchParams.get('taskId')
  if (!taskId) return NextResponse.json({ attachments: [] })
  try {
    const _db = await import('../../../lib/db').then(m => m.getDb())
    if (!_db) return NextResponse.json({ attachments: [] })
    const rows = await _db.select().from((await import('../../../db/schema')).attachments).where((await import('../../../db/schema')).attachments.task_id.eq(taskId)).all()
    return NextResponse.json({ attachments: rows })
  } catch (e) {
    return NextResponse.json({ attachments: [] })
  }
}

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file') as unknown as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }
  const storageDir = path.join(process.cwd(), 'storage', 'attachments')
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true })

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const filename = (file as any).name || `upload-${Date.now()}`
  const outPath = path.join(storageDir, `${Date.now()}-${filename}`)
  fs.writeFileSync(outPath, buffer)

  // If taskId provided, store metadata in DB
  const _taskId = (form.get('taskId') as string) || null
  const row: any = { id: uuidv4(), task_id: _taskId, filename, size: buffer.length, mime: file.type, storage_key: outPath, created_at: new Date().toISOString() }
  try {
    const _db = await import('../../../lib/db').then(m => m.getDb())
    if (_db) await _db.insert((await import('../../../db/schema')).attachments).values(row)
  } catch (e) {
    // ignore DB errors in upload path
  }

  return NextResponse.json({ filename, size: buffer.length, storage_key: outPath })
}
