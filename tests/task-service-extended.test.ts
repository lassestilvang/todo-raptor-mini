import { describe, it, expect, beforeEach } from 'bun:test';
import { canUseBetterSqlite3, initBetterSqliteMemoryDb, initSqlJsDb } from './setup-db';
import { createTask, getTasks, getTaskById, updateTask, deleteTask, clearTasks } from '../lib/task-service.server';
import { createLabel } from '../lib/label-service.server';
import { setDb } from '../lib/db';

if (canUseBetterSqlite3()) {
  beforeEach(async () => {
    initBetterSqliteMemoryDb();
    await clearTasks();
  });

  describe('task service extended operations', () => {
    it('creates a task, updates it, and deletes it', async () => {
      const task = await createTask({
        title: 'Write tests',
        notes: 'Add service and route coverage',
        priority: 'high',
        recurrence: { rule: 'daily' },
      });

      expect(task.id).toBeTruthy();
      expect(task.priority).toBe('high');
      expect(task.recurrence).toEqual({ rule: 'daily' });

      const updated = await updateTask(task.id, {
        title: 'Write more tests',
        notes: 'Update and delete coverage',
        completedAt: new Date().toISOString(),
        recurrence: { rule: 'weekly' },
      });

      expect(updated).not.toBeNull();
      expect(updated?.title).toBe('Write more tests');
      expect(updated?.notes).toBe('Update and delete coverage');
      expect(updated?.recurrence).toEqual({ rule: 'weekly' });

      const fetched = await getTaskById(task.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.title).toBe('Write more tests');

      await deleteTask(task.id);
      expect(await getTaskById(task.id)).toBeNull();
      expect((await getTasks()).length).toBe(0);
    });

    it('updates task labels and priority', async () => {
      const label = await createLabel({ name: 'Release' });
      const task = await createTask({ title: 'Prepare release', priority: 'low', labels: [] });

      const updated = await updateTask(task.id, {
        priority: 'high',
        labels: [label.id],
      });

      expect(updated).not.toBeNull();
      expect(updated?.priority).toBe('high');
      expect(updated?.labels).toEqual(['Release']);

      const fetched = await getTaskById(task.id);
      expect(fetched?.labels).toEqual(['Release']);
      expect(fetched?.priority).toBe('high');
    });
  });
} else {
  describe('task service extended operations (sql.js)', () => {
    beforeEach(async () => {
      await initSqlJsDb(setDb);
      await clearTasks();
    });

    it('creates a task, updates it, and deletes it (sql.js)', async () => {
      const task = await createTask({
        title: 'Write tests',
        notes: 'Add service and route coverage',
        priority: 'high',
        recurrence: { rule: 'daily' },
      });

      expect(task.id).toBeTruthy();
      expect(task.priority).toBe('high');
      expect(task.recurrence).toEqual({ rule: 'daily' });

      const updated = await updateTask(task.id, {
        title: 'Write more tests',
        notes: 'Update and delete coverage',
        completedAt: new Date().toISOString(),
        recurrence: { rule: 'weekly' },
      });

      expect(updated).not.toBeNull();
      expect(updated?.title).toBe('Write more tests');
      expect(updated?.notes).toBe('Update and delete coverage');
      expect(updated?.recurrence).toEqual({ rule: 'weekly' });

      const fetched = await getTaskById(task.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.title).toBe('Write more tests');

      await deleteTask(task.id);
      expect(await getTaskById(task.id)).toBeNull();
      expect((await getTasks()).length).toBe(0);
    });

    it('updates task labels and priority (sql.js)', async () => {
      const label = await createLabel({ name: 'Release' });
      const task = await createTask({ title: 'Prepare release', priority: 'low', labels: [] });

      const updated = await updateTask(task.id, {
        priority: 'high',
        labels: [label.id],
      });

      expect(updated).not.toBeNull();
      expect(updated?.priority).toBe('high');
      expect(updated?.labels).toEqual(['Release']);

      const fetched = await getTaskById(task.id);
      expect(fetched?.labels).toEqual(['Release']);
      expect(fetched?.priority).toBe('high');
    });
  });
}
