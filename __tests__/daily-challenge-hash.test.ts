/**
 * Daily challenge/mindset hash selection tests.
 *
 * Tests the REAL dateToDailyIndex function exported from convex/dates.ts,
 * which is used by both challenges.ts and mindset.ts.
 */
import { dateToDailyIndex } from '../convex/dates';

describe('dateToDailyIndex', () => {
  it('returns a valid index for any date', () => {
    const poolSize = 5;
    for (let day = 1; day <= 31; day++) {
      const date = `2025-06-${String(day).padStart(2, '0')}`;
      const index = dateToDailyIndex(date, poolSize);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(poolSize);
    }
  });

  it('returns same index for same date (deterministic)', () => {
    expect(dateToDailyIndex('2025-06-15', 10)).toBe(dateToDailyIndex('2025-06-15', 10));
  });

  it('returns different indices for different dates (usually)', () => {
    const indices = new Set([
      dateToDailyIndex('2025-06-15', 5),
      dateToDailyIndex('2025-06-16', 5),
      dateToDailyIndex('2025-06-17', 5),
    ]);
    expect(indices.size).toBeGreaterThanOrEqual(2);
  });

  it('distributes across all indices over a year', () => {
    const poolSize = 5;
    const seen = new Set<number>();
    for (let d = 0; d < 365; d++) {
      const date = new Date(2025, 0, 1 + d);
      const dateStr = date.toISOString().slice(0, 10);
      seen.add(dateToDailyIndex(dateStr, poolSize));
    }
    expect(seen.size).toBe(poolSize);
  });

  it('wraps correctly with modulo', () => {
    // dateHash('2025-06-15') = 20250615, 20250615 % 5 = 0
    expect(dateToDailyIndex('2025-06-15', 5)).toBe(20250615 % 5);
  });

  it('works with pool size 1', () => {
    expect(dateToDailyIndex('2025-06-15', 1)).toBe(0);
  });

  it('handles leap day', () => {
    const index = dateToDailyIndex('2024-02-29', 7);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(7);
  });

  it('handles year boundary without crashing', () => {
    const dec31 = dateToDailyIndex('2024-12-31', 7);
    const jan1 = dateToDailyIndex('2025-01-01', 7);
    expect(dec31).toBeGreaterThanOrEqual(0);
    expect(dec31).toBeLessThan(7);
    expect(jan1).toBeGreaterThanOrEqual(0);
    expect(jan1).toBeLessThan(7);
  });
});
