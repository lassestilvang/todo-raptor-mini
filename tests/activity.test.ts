import { describe, it, expect, beforeEach } from 'bun:test'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { initDb } from '../lib/db'
import { createTask } from '../lib/task-service.server'
import { getActivityForEntity } from '../lib/activity-service.server'

let conn: Database

beforeEach(() => {
  conn = new Database(':memory:')
  const migrationsSql = fs.readFileSync(path.join(process.cwd(), 'db', 'migrations', '001_initial.sql'), 'utf8')
  conn.exec(migrationsSql)
  initDb(conn)
})

describe('activity log', () => {
  it('logs creation when creating a task', async () => {
    const t = await createTask({ title: 'Activity task' })
    const activities = await getActivityForEntity('task', t.id)
    expect(activities.length).toBeGreaterThan(0)
    expect(activities[0].action).toBe('created')
  })
})
