import { describe, it, expect, beforeEach } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { canUseBetterSqlite3, initBetterSqliteMemoryDb, initSqlJsDb } from './setup-db';
import { setDb, getDb } from '../lib/db';
import { attachments as attachmentsSchema } from '../db/schema';

const storageDir = path.join(process.cwd(), 'storage', 'attachments');

if (canUseBetterSqlite3()) {
  beforeEach(() => {
    initBetterSqliteMemoryDb();
  });

  describe('attachments route', () => {
    it('rejects unsupported file types', async () => {
      const form = new FormData();
      form.append('file', new File(['bad'], 'bad.exe', { type: 'application/x-msdownload' }));
      const { POST } = await import('../app/api/attachments/route');
      const res = await POST({ formData: async () => form } as any);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('File type not allowed');
    });

    it('stores attachments and returns metadata', async () => {
      const form = new FormData();
      form.append('taskId', 't1');
      form.append('file', new File(['hello world'], 'notes.txt', { type: 'text/plain' }));
      const { POST } = await import('../app/api/attachments/route');
      const res = await POST({ formData: async () => form } as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.filename).toContain('notes.txt');
      expect(data.size).toBeGreaterThan(0);
      expect(fs.existsSync(data.storage_key)).toBe(true);
      fs.unlinkSync(data.storage_key);

      const _db = await import('../lib/db').then((m) => m.getDb());
      const rows = await _db.select().from(attachmentsSchema).where(attachmentsSchema.task_id.eq('t1')).all();
      expect(rows.length).toBe(1);
      expect(rows[0].filename).toBe('notes.txt');
    });
  });
} else {
  describe('attachments route (sql.js)', () => {
    beforeEach(async () => {
      await initSqlJsDb(setDb);
    });

    it('rejects unsupported file types', async () => {
      const form = new FormData();
      form.append('file', new File(['bad'], 'bad.exe', { type: 'application/x-msdownload' }));
      const { POST } = await import('../app/api/attachments/route');
      const res = await POST({ formData: async () => form } as any);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('File type not allowed');
    });

    it('stores attachments and returns metadata (sql.js)', async () => {
      const form = new FormData();
      form.append('taskId', 't1');
      form.append('file', new File(['hello world'], 'notes.txt', { type: 'text/plain' }));
      const { POST } = await import('../app/api/attachments/route');
      const res = await POST({ formData: async () => form } as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.filename).toContain('notes.txt');
      expect(data.size).toBeGreaterThan(0);
      expect(fs.existsSync(data.storage_key)).toBe(true);
      fs.unlinkSync(data.storage_key);

      const _db = await import('../lib/db').then((m) => m.getDb());
      const rows = await _db.select().from(attachmentsSchema).where(attachmentsSchema.task_id.eq('t1')).all();
      expect(rows.length).toBe(1);
      expect(rows[0].filename).toBe('notes.txt');
    });
  });
}
