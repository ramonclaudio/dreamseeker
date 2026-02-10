/**
 * Tests for getRelativeTime — the timestamp formatter used in feed items.
 *
 * Mirrors the pure function from components/community/feed-item.tsx.
 */

function getRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

describe('getRelativeTime', () => {
  const NOW = 1700000000000;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns "just now" for timestamps less than 60 seconds ago', () => {
    expect(getRelativeTime(NOW)).toBe('just now');
    expect(getRelativeTime(NOW - 1000)).toBe('just now');
    expect(getRelativeTime(NOW - 59_000)).toBe('just now');
  });

  it('returns minutes for timestamps 1-59 minutes ago', () => {
    expect(getRelativeTime(NOW - 60_000)).toBe('1m');
    expect(getRelativeTime(NOW - 5 * 60_000)).toBe('5m');
    expect(getRelativeTime(NOW - 59 * 60_000)).toBe('59m');
  });

  it('returns hours for timestamps 1-23 hours ago', () => {
    expect(getRelativeTime(NOW - 60 * 60_000)).toBe('1h');
    expect(getRelativeTime(NOW - 12 * 60 * 60_000)).toBe('12h');
    expect(getRelativeTime(NOW - 23 * 60 * 60_000)).toBe('23h');
  });

  it('returns days for timestamps 24+ hours ago', () => {
    expect(getRelativeTime(NOW - 24 * 60 * 60_000)).toBe('1d');
    expect(getRelativeTime(NOW - 7 * 24 * 60 * 60_000)).toBe('7d');
    expect(getRelativeTime(NOW - 30 * 24 * 60 * 60_000)).toBe('30d');
  });

  it('handles boundary between minutes and hours', () => {
    // 59 minutes 59 seconds = still minutes
    expect(getRelativeTime(NOW - (59 * 60_000 + 59_000))).toBe('59m');
    // 60 minutes = 1 hour
    expect(getRelativeTime(NOW - 60 * 60_000)).toBe('1h');
  });

  it('handles boundary between hours and days', () => {
    // 23 hours 59 minutes = still hours
    expect(getRelativeTime(NOW - (23 * 60 * 60_000 + 59 * 60_000))).toBe('23h');
    // 24 hours = 1 day
    expect(getRelativeTime(NOW - 24 * 60 * 60_000)).toBe('1d');
  });

  it('handles future timestamps (negative diff) as "just now"', () => {
    // Future timestamps produce negative seconds, Math.floor makes them < 60
    expect(getRelativeTime(NOW + 10_000)).toBe('just now');
  });
});
