import { describe, it, expect, beforeEach } from 'bun:test';
import { canUseBetterSqlite3, initBetterSqliteMemoryDb, initSqlJsDb } from './setup-db';
import { createTask, getTasks, clearTasks } from '../lib/task-service.server';

if (canUseBetterSqlite3()) {
  beforeEach(async () => {
    initBetterSqliteMemoryDb();
    await clearTasks();
  });

  describe('task service', () => {
    it('creates and returns tasks', async () => {
      const t = await createTask({ title: 'Test task' });
      expect(t.id).toBeTruthy();
      expect(t.title).toBe('Test task');

      const tasks = await getTasks();
      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe(t.id);
    });
  });
} else {
  describe('task service (sql.js)', () => {
    beforeEach(async () => {
      const { setDb } = await import('../lib/db');
      await initSqlJsDb(setDb);
      await clearTasks();
    });

    it('creates and returns tasks (sql.js)', async () => {
      const t = await createTask({ title: 'Test task' });
      expect(t.id).toBeTruthy();
      expect(t.title).toBe('Test task');

      const tasks = await getTasks();
      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe(t.id);
    });
  });
}
