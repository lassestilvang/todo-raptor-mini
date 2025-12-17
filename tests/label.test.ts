import { describe, it, expect, beforeEach } from 'bun:test';
import { canUseBetterSqlite3, initBetterSqliteMemoryDb, initSqlJsDb } from './setup-db';
import { createLabel, getLabels } from '../lib/label-service.server';

if (canUseBetterSqlite3()) {
  beforeEach(() => {
    initBetterSqliteMemoryDb();
  });

  describe('labels', () => {
    it('can create and fetch labels', async () => {
      const l = await createLabel({ name: 'Urgent', color: '#ff8800' });
      expect(l.id).toBeTruthy();
      const labels = await getLabels();
      expect(labels.length).toBe(1);
      expect(labels[0].name).toBe('Urgent');
    });
  });
} else {
  describe('labels (sql.js)', () => {
    beforeEach(async () => {
      const { setDb } = await import('../lib/db');
      await initSqlJsDb(setDb);
    });

    it('can create and fetch labels (sql.js)', async () => {
      const l = await createLabel({ name: 'Urgent', color: '#ff8800' });
      expect(l.id).toBeTruthy();
      const labels = await getLabels();
      expect(labels.length).toBe(1);
      expect(labels[0].name).toBe('Urgent');
    });
  });
}
