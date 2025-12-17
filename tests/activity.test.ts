import { describe, it, expect, beforeEach } from 'bun:test'
import { canUseBetterSqlite3, initBetterSqliteMemoryDb, initSqlJsDb } from './setup-db'
import { createTask } from '../lib/task-service.server'
import { getActivityForEntity } from '../lib/activity-service.server'

if (canUseBetterSqlite3()) {
  beforeEach(() => {
    initBetterSqliteMemoryDb()
  })

  describe('activity log', () => {
    it('logs creation when creating a task', async () => {
      const t = await createTask({ title: 'Activity task' })
      const activities = await getActivityForEntity('task', t.id)
      expect(activities.length).toBeGreaterThan(0)
      expect(activities[0].action).toBe('created')
    })
  })
} else {
  describe('activity log (sql.js)', () => {
    beforeEach(async () => {
      const { setDb } = await import('../lib/db')
      await initSqlJsDb(setDb)
    })

    it('logs creation when creating a task (sql.js)', async () => {
      const t = await createTask({ title: 'Activity task' })
      const activities = await getActivityForEntity('task', t.id)
      expect(activities.length).toBeGreaterThan(0)
      expect(activities[0].action).toBe('created')
    })
  })
}
