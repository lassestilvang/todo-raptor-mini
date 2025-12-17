import { describe, it, expect, beforeEach } from 'bun:test'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { initDb } from '../lib/db'
import { createLabel, getLabels } from '../lib/label-service.server'

let conn: Database

beforeEach(() => {
  conn = new Database(':memory:')
  const migrationsSql = fs.readFileSync(path.join(process.cwd(), 'db', 'migrations', '001_initial.sql'), 'utf8')
  conn.exec(migrationsSql)
  initDb(conn)
})

describe('labels', () => {
  it('can create and fetch labels', async () => {
    const l = await createLabel({ name: 'Urgent', color: '#ff8800' })
    expect(l.id).toBeTruthy()
    const labels = await getLabels()
    expect(labels.length).toBe(1)
    expect(labels[0].name).toBe('Urgent')
  })
})
