import { describe, it, expect, beforeEach } from 'bun:test';
import { canUseBetterSqlite3, initBetterSqliteMemoryDb, initSqlJsDb } from './setup-db';
import { createList, getLists, getListById } from '../lib/list-service.server';
import { createLabel, getLabels, getLabelById } from '../lib/label-service.server';
import { setDb } from '../lib/db';

if (canUseBetterSqlite3()) {
  beforeEach(() => {
    initBetterSqliteMemoryDb();
  });

  describe('list and label service helpers', () => {
    it('returns a list by id and handles missing ids', async () => {
      const list = await createList({ title: 'Personal', color: '#00ff00', emoji: '🏠' });
      const fetched = await getListById(list.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.title).toBe('Personal');
      expect(await getListById('does-not-exist')).toBeNull();
    });

    it('returns a label by id and handles missing ids', async () => {
      const label = await createLabel({ name: 'Follow Up', color: '#ff00ff', icon: '📌' });
      const fetched = await getLabelById(label.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.name).toBe('Follow Up');
      expect(await getLabelById('missing-id')).toBeNull();
    });
  });
} else {
  describe('list and label service helpers (sql.js)', () => {
    beforeEach(async () => {
      await initSqlJsDb(setDb);
    });

    it('returns a list by id and handles missing ids', async () => {
      const list = await createList({ title: 'Personal', color: '#00ff00', emoji: '🏠' });
      const fetched = await getListById(list.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.title).toBe('Personal');
      expect(await getListById('does-not-exist')).toBeNull();
    });

    it('returns a label by id and handles missing ids', async () => {
      const label = await createLabel({ name: 'Follow Up', color: '#ff00ff', icon: '📌' });
      const fetched = await getLabelById(label.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.name).toBe('Follow Up');
      expect(await getLabelById('missing-id')).toBeNull();
    });
  });
}
