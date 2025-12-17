import { describe, it, expect } from 'bun:test';
import { nextOccurrencesAfter, applyExceptions } from '../lib/recurrence-service.server';

describe('recurrence exceptions', () => {
  it('applies skipped exceptions', () => {
    const start = new Date('2025-12-01T09:00:00Z');
    const occ = nextOccurrencesAfter(start, { type: 'daily' }, 3);
    const ex = [{ instanceDate: occ[1].toISOString().slice(0, 10), isSkipped: true }];
    const filtered = applyExceptions(occ, ex);
    expect(filtered.length).toBe(2);
  });
});
