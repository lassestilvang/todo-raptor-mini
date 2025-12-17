import { describe, it, expect, beforeEach } from 'bun:test'
import { canUseBetterSqlite3, initBetterSqliteMemoryDb, initSqlJsDb } from './setup-db'
import { createTask, getTasks, clearTasks, getTaskById } from '../lib/task-service.server'

if (canUseBetterSqlite3()) {
  beforeEach(() => {
    // create an in-memory sqlite and apply migrations in the same connection
    initBetterSqliteMemoryDb()
  })

  describe('db task service', () => {
    it('creates a task and retrieves it', async () => {
      await clearTasks()
      const t = await createTask({ title: 'DB test task' })
      expect(t.id).toBeTruthy()
      expect(t.title).toBe('DB test task')

      const tasks = await getTasks()
      expect(tasks.length).toBe(1)
      expect(tasks[0].id).toBe(t.id)

      const fetched = await getTaskById(t.id)
      expect(fetched?.title).toBe('DB test task')
    })
  })
} else {
  describe('db task service (sql.js)', () => {
    beforeEach(async () => {
      const { setDb } = await import('../lib/db')
      await initSqlJsDb(setDb)
    })

    it('creates a task and retrieves it (sql.js)', async () => {
      await clearTasks()
      const t = await createTask({ title: 'DB test task' })
      expect(t.id).toBeTruthy()
      expect(t.title).toBe('DB test task')

      const tasks = await getTasks()
      expect(tasks.length).toBe(1)
      expect(tasks[0].id).toBe(t.id)

      const fetched = await getTaskById(t.id)
      expect(fetched?.title).toBe('DB test task')
    })
  })
}
