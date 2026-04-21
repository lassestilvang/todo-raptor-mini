import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { safeQuery } from '../../../lib/sqljs-utils.server';

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

    // If no rows via Drizzle, try a SQL.js fallback (centralized helper)
    // @ts-ignore - runtime global
    const conn: any = (globalThis as any).__SQL_JS_CONN__ || null;
    if ((!rows || rows.length === 0) && conn) {
      try {
        const sql = 'SELECT id, task_id, filename, size, mime, storage_key, created_at FROM attachments WHERE task_id = ?';
        const mapped = safeQuery(conn, sql, [taskId]);
        return NextResponse.json({ attachments: mapped });
      } catch (e) {
        console.error('SQL.js fallback error in attachments GET:', (e as any)?.message ?? e);
      }
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

  // Validate file type (allow common safe types).
  // Some environments append charset values like text/plain;charset=utf-8.
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const fileType = file.type ? file.type.split(';')[0].trim() : '';
  if (fileType && !allowedMimeTypes.includes(fileType)) {
    return NextResponse.json(
      { error: 'File type not allowed' },
      { status: 400 }
    );
  }

  const storageDir = path.join(process.cwd(), 'storage', 'attachments');
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const originalFilename = (file as any).name || `upload-${Date.now()}`;

  // Sanitize filename to prevent path traversal
  const filename = originalFilename.replace(/\.\./g, '').replace(/[\\/]/g, '_');
  const outPath = path.join(storageDir, `${Date.now()}-${filename}`);

  try {
    fs.writeFileSync(outPath, buffer);
  } catch (writeErr) {
    console.error('Failed to write file:', writeErr);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }

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
  } catch (dbErr) {
    console.error('Failed to store attachment metadata:', dbErr);
    // Continue to return success for file upload even if DB fails
  }

  return NextResponse.json({ filename, size: buffer.length, storage_key: outPath });
}
