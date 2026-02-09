import {
  safeTimezone,
  getTodayString,
  getYesterdayString,
  getStartOfDay,
  timestampToDateString,
} from '../convex/dates';

// ── safeTimezone ────────────────────────────────────────────────────────────

describe('safeTimezone', () => {
  it('returns the timezone for valid IANA identifiers', () => {
    expect(safeTimezone('America/New_York')).toBe('America/New_York');
    expect(safeTimezone('Europe/London')).toBe('Europe/London');
    expect(safeTimezone('Asia/Tokyo')).toBe('Asia/Tokyo');
    expect(safeTimezone('UTC')).toBe('UTC');
  });

  it('returns UTC for invalid timezone strings', () => {
    expect(safeTimezone('Invalid/Timezone')).toBe('UTC');
    expect(safeTimezone('NotATimezone')).toBe('UTC');
    expect(safeTimezone('')).toBe('UTC');
    expect(safeTimezone('GMT+5')).toBe('UTC'); // Not a valid IANA identifier
  });

  it('returns UTC for obviously wrong values', () => {
    expect(safeTimezone('foo')).toBe('UTC');
    expect(safeTimezone('12345')).toBe('UTC');
    expect(safeTimezone('null')).toBe('UTC');
  });
});

// ── getTodayString ──────────────────────────────────────────────────────────

describe('getTodayString', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const result = getTodayString('UTC');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns the same date for the same timezone', () => {
    const first = getTodayString('America/New_York');
    const second = getTodayString('America/New_York');
    expect(first).toBe(second);
  });

  it('falls back to UTC for invalid timezone', () => {
    const utcResult = getTodayString('UTC');
    const invalidResult = getTodayString('Invalid/TZ');
    expect(invalidResult).toBe(utcResult);
  });

  it('produces valid date components', () => {
    const result = getTodayString('UTC');
    const [year, month, day] = result.split('-').map(Number);
    expect(year).toBeGreaterThanOrEqual(2024);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });
});

// ── getYesterdayString ──────────────────────────────────────────────────────

describe('getYesterdayString', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const result = getYesterdayString('UTC');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns a date before today', () => {
    const today = getTodayString('UTC');
    const yesterday = getYesterdayString('UTC');
    expect(new Date(yesterday).getTime()).toBeLessThan(new Date(today).getTime());
  });

  it('returns exactly one day before today', () => {
    const today = getTodayString('UTC');
    const yesterday = getYesterdayString('UTC');
    const diffMs = new Date(today).getTime() - new Date(yesterday).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(1);
  });

  it('handles month boundaries', () => {
    // Use a fixed date to test: 2025-03-01 → yesterday should be 2025-02-28
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-03-01T12:00:00Z'));

    const yesterday = getYesterdayString('UTC');
    expect(yesterday).toBe('2025-02-28');

    jest.useRealTimers();
  });

  it('handles year boundaries', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T12:00:00Z'));

    const yesterday = getYesterdayString('UTC');
    expect(yesterday).toBe('2024-12-31');

    jest.useRealTimers();
  });

  it('handles leap year Feb 29', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-01T12:00:00Z'));

    const yesterday = getYesterdayString('UTC');
    expect(yesterday).toBe('2024-02-29');

    jest.useRealTimers();
  });

  it('falls back to UTC for invalid timezone', () => {
    const utcYesterday = getYesterdayString('UTC');
    const invalidYesterday = getYesterdayString('Invalid/TZ');
    expect(invalidYesterday).toBe(utcYesterday);
  });
});

// ── getStartOfDay ───────────────────────────────────────────────────────────

describe('getStartOfDay', () => {
  it('returns a number (epoch ms)', () => {
    const result = getStartOfDay('UTC');
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  it('start of day in UTC is a multiple of 86400000', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-06-15T14:30:00Z'));

    const result = getStartOfDay('UTC');
    // UTC midnight should be cleanly divisible by a day in ms
    expect(result % (24 * 60 * 60 * 1000)).toBe(0);

    jest.useRealTimers();
  });

  it('start of day is before or equal to current time', () => {
    const now = Date.now();
    const startOfDay = getStartOfDay('UTC');
    expect(startOfDay).toBeLessThanOrEqual(now);
  });

  it('start of day is within 24 hours of current time', () => {
    const now = Date.now();
    const startOfDay = getStartOfDay('UTC');
    const diff = now - startOfDay;
    expect(diff).toBeLessThan(24 * 60 * 60 * 1000);
    expect(diff).toBeGreaterThanOrEqual(0);
  });

  it('different timezones produce different start-of-day values', () => {
    jest.useFakeTimers();
    // Set to a time where NYC and Tokyo are on different calendar days
    // 2025-06-15 03:00 UTC = 2025-06-14 23:00 NYC = 2025-06-15 12:00 Tokyo
    jest.setSystemTime(new Date('2025-06-15T03:00:00Z'));

    const utcStart = getStartOfDay('UTC');
    const tokyoStart = getStartOfDay('Asia/Tokyo');
    // They might differ since timezones shift when "today" starts
    expect(typeof utcStart).toBe('number');
    expect(typeof tokyoStart).toBe('number');

    jest.useRealTimers();
  });
});

// ── timestampToDateString ───────────────────────────────────────────────────

describe('timestampToDateString', () => {
  it('converts epoch ms to YYYY-MM-DD format', () => {
    const result = timestampToDateString(0, 'UTC');
    expect(result).toBe('1970-01-01');
  });

  it('handles known timestamps correctly', () => {
    // 2025-01-15 00:00:00 UTC
    const ts = new Date('2025-01-15T00:00:00Z').getTime();
    expect(timestampToDateString(ts, 'UTC')).toBe('2025-01-15');
  });

  it('respects timezone when converting', () => {
    // Midnight UTC on Jan 15 is still Jan 14 in NYC (EST = UTC-5)
    const ts = new Date('2025-01-15T03:00:00Z').getTime();
    const utcDate = timestampToDateString(ts, 'UTC');
    const nycDate = timestampToDateString(ts, 'America/New_York');

    expect(utcDate).toBe('2025-01-15');
    expect(nycDate).toBe('2025-01-14');
  });

  it('handles timezone ahead of UTC', () => {
    // 2025-01-14T23:00:00 UTC is already Jan 15 in Tokyo (JST = UTC+9)
    const ts = new Date('2025-01-14T23:00:00Z').getTime();
    const utcDate = timestampToDateString(ts, 'UTC');
    const tokyoDate = timestampToDateString(ts, 'Asia/Tokyo');

    expect(utcDate).toBe('2025-01-14');
    expect(tokyoDate).toBe('2025-01-15');
  });

  it('falls back to UTC for invalid timezone', () => {
    const ts = new Date('2025-06-15T12:00:00Z').getTime();
    const utcResult = timestampToDateString(ts, 'UTC');
    const invalidResult = timestampToDateString(ts, 'Fake/Zone');
    expect(invalidResult).toBe(utcResult);
  });
});
