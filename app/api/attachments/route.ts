import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const taskId = url.searchParams.get('taskId');
  if (!taskId) return NextResponse.json({ attachments: [] });
  try {
    const _db = await import('../../../lib/db').then((m) => m.getDb());
    if (!_db) return NextResponse.json({ attachments: [] });
    const attachmentSchema = (await import('../../../db/schema')).attachments;
    let rows = [];
    try {
      rows = await _db
        .select()
        .from(attachmentSchema)
        .where(attachmentSchema.task_id.eq(taskId))
        .all();
    } catch (_err) {
      // some drivers may not support the builder eq in the same way; fallback occurs below
      void _err;
      rows = [];
    }

    // If no rows via Drizzle, try a raw SQL fallback for SQL.js
    // @ts-ignore - runtime global
    const conn: any = (globalThis as any).__SQL_JS_CONN__ || null;
    if ((!rows || rows.length === 0) && conn) {
      const res = conn.exec(
        `SELECT id, task_id, filename, size, mime, storage_key, created_at FROM attachments WHERE task_id = '${taskId}'`
      );
      const mapped =
        res && res[0] && res[0].values
          ? res[0].values.map((v: any[]) => ({
              id: v[0],
              task_id: v[1],
              filename: v[2],
              size: v[3],
              mime: v[4],
              storage_key: v[5],
              created_at: v[6],
            }))
          : [];
      return NextResponse.json({ attachments: mapped });
    }

    return NextResponse.json({ attachments: rows });
  } catch (_err) {
    void _err;
    return NextResponse.json({ attachments: [] });
  }
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as unknown as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }
  const storageDir = path.join(process.cwd(), 'storage', 'attachments');
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = (file as any).name || `upload-${Date.now()}`;
  const outPath = path.join(storageDir, `${Date.now()}-${filename}`);
  fs.writeFileSync(outPath, buffer);

  // If taskId provided, store metadata in DB
  const _taskId = (form.get('taskId') as string) || null;
  const row: any = {
    id: uuidv4(),
    task_id: _taskId,
    filename,
    size: buffer.length,
    mime: file.type,
    storage_key: outPath,
    created_at: new Date().toISOString(),
  };
  try {
    const _db = await import('../../../lib/db').then((m) => m.getDb());
    if (_db) {
      const insertQuery: any = _db
        .insert((await import('../../../db/schema')).attachments)
        .values(row);
      if (insertQuery && typeof insertQuery.run === 'function') {
        await insertQuery.run();
      } else {
        await insertQuery;
      }
    }
  } catch (_err) {
    // ignore DB errors in upload path
    void _err;
  }

  return NextResponse.json({ filename, size: buffer.length, storage_key: outPath });
}
