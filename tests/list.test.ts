import { describe, it, expect, beforeEach } from 'bun:test'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { initDb } from '../lib/db'
import { createList, getLists } from '../lib/list-service.server'

let conn: Database

beforeEach(() => {
  conn = new Database(':memory:')
  const migrationsSql = fs.readFileSync(path.join(process.cwd(), 'db', 'migrations', '001_initial.sql'), 'utf8')
  conn.exec(migrationsSql)
  initDb(conn)
})

describe('lists', () => {
  it('can create and fetch lists', async () => {
    const l = await createList({ title: 'Work', color: '#ff0000', emoji: '💼' })
    expect(l.id).toBeTruthy()
    const list = await getLists()
    expect(list.length).toBe(1)
    expect(list[0].title).toBe('Work')
  })
})
