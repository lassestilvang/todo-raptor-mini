import { describe, it, expect, beforeEach } from 'bun:test'
import { canUseBetterSqlite3, initBetterSqliteMemoryDb, initSqlJsDb } from './setup-db'
import { createList, getLists } from '../lib/list-service.server'

if (canUseBetterSqlite3()) {
  beforeEach(() => {
    initBetterSqliteMemoryDb()
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
} else {
  describe('lists (sql.js)', () => {
    beforeEach(async () => {
      const { setDb } = await import('../lib/db')
      await initSqlJsDb(setDb)
    })

    it('can create and fetch lists (sql.js)', async () => {
      const l = await createList({ title: 'Work', color: '#ff0000', emoji: '💼' })
      expect(l.id).toBeTruthy()
      const list = await getLists()
      expect(list.length).toBe(1)
      expect(list[0].title).toBe('Work')
    })
  })
}
