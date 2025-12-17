import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

export type Recurrence = {
  type: 'none' | 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly';
  interval?: number;
};

export function nextOccurrence(fromDate: Date, rule: Recurrence): Date | null {
  const interval = rule.interval ?? 1;
  if (rule.type === 'none') return null;
  if (rule.type === 'daily') return addDays(fromDate, interval);
  if (rule.type === 'weekly') return addWeeks(fromDate, interval);
  if (rule.type === 'weekday') {
    // move to next weekday
    let next = addDays(fromDate, 1);
    while (next.getDay() === 0 || next.getDay() === 6) {
      next = addDays(next, 1);
    }
    return next;
  }
  if (rule.type === 'monthly') return addMonths(fromDate, interval);
  if (rule.type === 'yearly') return addYears(fromDate, interval);
  return null;
}

export function nextOccurrencesAfter(start: Date, rule: Recurrence, count = 3) {
  const out: Date[] = [];
  let cur = start;
  for (let i = 0; i < count; i++) {
    const next = nextOccurrence(cur, rule);
    if (!next) break;
    out.push(next);
    cur = next;
  }
  return out;
}

// Recurrence exceptions handling (store exceptions as YYYY-MM-DD strings for instances)
export function applyExceptions(
  instances: Date[],
  exceptions: Array<{ instanceDate: string; isSkipped?: boolean; overrides?: any }> = []
) {
  const exceptionMap: Record<string, any> = {};
  exceptions.forEach((e) => {
    exceptionMap[e.instanceDate] = e;
  });
  const out: Date[] = [];
  for (const inst of instances) {
    const key = inst.toISOString().slice(0, 10);
    const ex = exceptionMap[key];
    if (ex && ex.isSkipped) continue;
    out.push(inst);
  }
  return out;
}
