import { describe, it, expect, beforeEach } from 'bun:test';
import { canUseBetterSqlite3, initBetterSqliteMemoryDb, initSqlJsDb } from './setup-db';
import { createTask, clearTasks } from '../lib/task-service.server';

if (canUseBetterSqlite3()) {
  beforeEach(() => {
    initBetterSqliteMemoryDb();
  });

  describe('search API', () => {
    it('returns matching tasks for a query', async () => {
      await clearTasks();
      await createTask({ title: 'Buy milk' });
      await createTask({ title: 'Write report' });

      const { GET } = await import('../app/api/search/route');
      const res = await GET(new Request('http://localhost/api/search?q=milk'));
      const data = await res.json();
      expect(data.results.length).toBe(1);
      expect(data.results[0].title).toBe('Buy milk');
    });
  });
} else {
  describe('search API (sql.js)', () => {
    beforeEach(async () => {
      const { setDb } = await import('../lib/db');
      await initSqlJsDb(setDb);
    });

    it('returns matching tasks for a query (sql.js)', async () => {
      await clearTasks();
      await createTask({ title: 'Buy milk' });
      await createTask({ title: 'Write report' });

      const { GET } = await import('../app/api/search/route');
      const res = await GET(new Request('http://localhost/api/search?q=milk'));
      const data = await res.json();
      expect(data.results.length).toBe(1);
      expect(data.results[0].title).toBe('Buy milk');
    });
  });
}
