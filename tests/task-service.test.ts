import { describe, it, expect, beforeEach } from 'bun:test'
import { createTask, getTasks, clearTasks } from '../lib/task-service.server'

beforeEach(async () => {
  await clearTasks()
})

describe('task service', () => {
  it('creates and returns tasks', async () => {
    const t = await createTask({ title: 'Test task' })
    expect(t.id).toBeTruthy()
    expect(t.title).toBe('Test task')

    const tasks = await getTasks()
    expect(tasks.length).toBe(1)
    expect(tasks[0].id).toBe(t.id)
  })
})
