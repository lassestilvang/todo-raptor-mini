import { describe, it, expect, beforeEach } from 'bun:test'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { initDb } from '../lib/db'
import { createTask, getTasks, clearTasks, getTaskById } from '../lib/task-service.server'

let conn: Database

beforeEach(() => {
  // create an in-memory sqlite and apply migrations in the same connection
  conn = new Database(':memory:')
  const migrationsSql = fs.readFileSync(path.join(process.cwd(), 'db', 'migrations', '001_initial.sql'), 'utf8')
  conn.exec(migrationsSql)
  initDb(conn)
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
