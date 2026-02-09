/**
 * Dream suggestion utility tests.
 *
 * Tests REAL functions from constants/dream-suggestions.ts:
 * - formatDuration: singular/plural unit formatting
 * - durationToEpoch: date arithmetic for all 4 timeline units
 */
import { formatDuration, durationToEpoch, type TimelineDuration } from '../constants/dream-suggestions';

// ── formatDuration ──────────────────────────────────────────────────────────

describe('formatDuration', () => {
  it('uses singular unit when amount is 1', () => {
    expect(formatDuration({ amount: 1, unit: 'days' })).toBe('1 day');
    expect(formatDuration({ amount: 1, unit: 'weeks' })).toBe('1 week');
    expect(formatDuration({ amount: 1, unit: 'months' })).toBe('1 month');
    expect(formatDuration({ amount: 1, unit: 'years' })).toBe('1 year');
  });

  it('uses plural unit when amount > 1', () => {
    expect(formatDuration({ amount: 2, unit: 'days' })).toBe('2 days');
    expect(formatDuration({ amount: 3, unit: 'weeks' })).toBe('3 weeks');
    expect(formatDuration({ amount: 6, unit: 'months' })).toBe('6 months');
    expect(formatDuration({ amount: 5, unit: 'years' })).toBe('5 years');
  });

  it('handles large amounts', () => {
    expect(formatDuration({ amount: 100, unit: 'days' })).toBe('100 days');
    expect(formatDuration({ amount: 52, unit: 'weeks' })).toBe('52 weeks');
  });
});

// ── durationToEpoch ─────────────────────────────────────────────────────────

describe('durationToEpoch', () => {
  // Freeze time so tests are deterministic
  const FIXED_NOW = new Date('2025-06-15T12:00:00Z').getTime();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('adds days correctly', () => {
    const result = durationToEpoch({ amount: 7, unit: 'days' });
    const expected = new Date('2025-06-22T12:00:00Z').getTime();
    expect(result).toBe(expected);
  });

  it('adds 1 day correctly', () => {
    const result = durationToEpoch({ amount: 1, unit: 'days' });
    const expected = new Date('2025-06-16T12:00:00Z').getTime();
    expect(result).toBe(expected);
  });

  it('adds weeks correctly (amount * 7 days)', () => {
    const result = durationToEpoch({ amount: 2, unit: 'weeks' });
    const expected = new Date('2025-06-29T12:00:00Z').getTime();
    expect(result).toBe(expected);
  });

  it('adds 1 week correctly', () => {
    const result = durationToEpoch({ amount: 1, unit: 'weeks' });
    const expected = new Date('2025-06-22T12:00:00Z').getTime();
    expect(result).toBe(expected);
  });

  it('adds months correctly', () => {
    const result = durationToEpoch({ amount: 3, unit: 'months' });
    const expected = new Date('2025-09-15T12:00:00Z').getTime();
    expect(result).toBe(expected);
  });

  it('adds 1 month correctly', () => {
    const result = durationToEpoch({ amount: 1, unit: 'months' });
    const expected = new Date('2025-07-15T12:00:00Z').getTime();
    expect(result).toBe(expected);
  });

  it('handles month overflow (Jan 31 + 1 month)', () => {
    jest.setSystemTime(new Date('2025-01-31T12:00:00Z').getTime());
    const result = durationToEpoch({ amount: 1, unit: 'months' });
    // JS Date rolls Jan 31 + 1 month → Mar 3 (Feb has 28 days in 2025)
    const resultDate = new Date(result);
    expect(resultDate.getMonth()).toBe(2); // March (0-indexed)
  });

  it('adds years correctly', () => {
    const result = durationToEpoch({ amount: 1, unit: 'years' });
    const expected = new Date('2026-06-15T12:00:00Z').getTime();
    expect(result).toBe(expected);
  });

  it('adds multiple years correctly', () => {
    const result = durationToEpoch({ amount: 5, unit: 'years' });
    const expected = new Date('2030-06-15T12:00:00Z').getTime();
    expect(result).toBe(expected);
  });

  it('returns a future timestamp', () => {
    const units: TimelineDuration['unit'][] = ['days', 'weeks', 'months', 'years'];
    for (const unit of units) {
      const result = durationToEpoch({ amount: 1, unit });
      expect(result).toBeGreaterThan(FIXED_NOW);
    }
  });
});
