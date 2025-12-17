import { describe, it, expect } from 'bun:test';
import { nextOccurrence } from '../lib/recurrence-service.server';

describe('recurrence', () => {
  it('daily next occurrence', () => {
    const d = new Date('2025-12-01T10:00:00Z');
    const next = nextOccurrence(d, { type: 'daily' });
    expect(next?.toISOString()).toBe(new Date('2025-12-02T10:00:00Z').toISOString());
  });

  it('weekday skips weekend', () => {
    // Friday -> next Monday
    const d = new Date('2025-12-05T10:00:00Z'); // Friday
    const next = nextOccurrence(d, { type: 'weekday' });
    expect(next?.getDay()).toBeGreaterThan(0);
    expect(next?.getDay()).toBeLessThan(6);
  });
});
