// Date utility functions for timezone-aware operations

/** Validates an IANA timezone string, returning 'UTC' on failure. */
export function safeTimezone(tz: string): string {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

/** Returns YYYY-MM-DD for "today" in the given IANA timezone. */
export function getTodayString(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: safeTimezone(timezone) }).format(new Date());
}

/** Returns YYYY-MM-DD for "yesterday" in the given IANA timezone. */
export function getYesterdayString(timezone: string): string {
  const tz = safeTimezone(timezone);
  // Derive yesterday from the timezone-aware "today" to avoid DST bugs.
  // Subtracting a day from a Date() in server timezone can land on the wrong
  // calendar date when the server and user timezones straddle a DST boundary.
  const todayStr = getTodayString(tz);
  const [year, month, day] = todayStr.split('-').map(Number);
  const yesterday = new Date(year, month - 1, day);
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}

/** Returns epoch-ms for the start of today in the given IANA timezone. */
export function getStartOfDay(timezone: string): number {
  const tz = safeTimezone(timezone);
  const todayStr = getTodayString(tz);
  // Parse YYYY-MM-DD into components and build a Date in the target timezone
  const [year, month, day] = todayStr.split('-').map(Number);
  // Create a date string that Intl can anchor to the timezone
  const utcGuess = new Date(Date.UTC(year, month - 1, day));
  // Adjust by computing the offset between UTC midnight and local midnight
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(utcGuess);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const localAtUtcMidnight = new Date(
    Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  );
  // The offset is: UTC midnight minus what the local clock shows at UTC midnight
  const offsetMs = utcGuess.getTime() - localAtUtcMidnight.getTime();
  return utcGuess.getTime() + offsetMs;
}

/** Converts an epoch-ms timestamp to YYYY-MM-DD in the given IANA timezone. */
export function timestampToDateString(timestamp: number, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: safeTimezone(timezone) }).format(new Date(timestamp));
}

/**
 * Compute the local hour from a UTC timestamp and a timezone offset.
 * timezoneOffsetMinutes uses the same sign convention as Date.getTimezoneOffset():
 * positive = west of UTC (e.g. +300 for EST), negative = east (e.g. -540 for JST).
 */
export function getLocalHour(nowMs: number, timezoneOffsetMinutes: number): number {
  const offsetMs = timezoneOffsetMinutes * 60 * 1000;
  return new Date(nowMs - offsetMs).getUTCHours();
}

/** Deterministic daily index from a YYYY-MM-DD string and pool size. */
export function dateToDailyIndex(dateString: string, poolSize: number): number {
  return parseInt(dateString.replace(/-/g, ''), 10) % poolSize;
}
