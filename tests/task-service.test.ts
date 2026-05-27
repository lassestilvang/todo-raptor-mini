import { describe, it, expect, beforeEach } from 'bun:test';
import { canUseBetterSqlite3, initBetterSqliteMemoryDb, initSqlJsDb } from './setup-db';
import { createLabel } from '../lib/label-service.server';
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

    it('persists labels when creating a task', async () => {
      const label = await createLabel({ name: 'Urgent' });
      const t = await createTask({ title: 'Labeled task', labels: [label.id] });
      expect(t.labels).toEqual([label.id]);

      const tasks = await getTasks();
      expect(tasks[0]?.labels).toEqual(['Urgent']);
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

    it('persists labels when creating a task (sql.js)', async () => {
      const label = await createLabel({ name: 'Urgent' });
      const t = await createTask({ title: 'Labeled task', labels: [label.id] });
      expect(t.labels).toEqual([label.id]);

      const tasks = await getTasks();
      expect(tasks[0]?.labels).toEqual(['Urgent']);
    });
  });
}
