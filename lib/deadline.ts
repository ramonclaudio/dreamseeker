const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatDeadline(
  deadlineMs: number | undefined,
): { label: string; isOverdue: boolean } | null {
  if (deadlineMs === undefined) return null;

  const diff = deadlineMs - Date.now();

  if (diff < 0) {
    const elapsed = -diff;
    if (elapsed < HOUR) return { label: `Overdue ${Math.ceil(elapsed / MINUTE)}m`, isOverdue: true };
    if (elapsed < DAY) return { label: `Overdue ${Math.round(elapsed / HOUR)}h`, isOverdue: true };
    return { label: `Overdue ${Math.round(elapsed / DAY)}d`, isOverdue: true };
  }

  if (diff < HOUR) return { label: `Due in ${Math.ceil(diff / MINUTE)}m`, isOverdue: false };
  if (diff < DAY) return { label: `Due in ${Math.round(diff / HOUR)}h`, isOverdue: false };
  if (diff < 2 * DAY) return { label: 'Due tomorrow', isOverdue: false };
  return { label: `Due in ${Math.round(diff / DAY)}d`, isOverdue: false };
}

/**
 * Compute ms until the formatted label would change.
 * Returns a capped value so we never sleep longer than needed.
 */
export function getNextTickMs(deadlineMs: number): number {
  const diff = deadlineMs - Date.now();
  const abs = Math.abs(diff);

  // Within the ±1 hour zone → label changes every minute
  if (abs < HOUR) return MINUTE;

  // Within ±1 day zone → label changes every ~30 min (half-hour precision for rounding)
  if (abs < DAY) return 30 * MINUTE;

  // If we're about to cross the deadline boundary, tick exactly at that moment
  if (diff > 0 && diff < MINUTE) return diff + 100; // +100ms buffer past the boundary

  // Far out (days) → check every hour
  return HOUR;
}
