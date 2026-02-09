import type { MutationCtx } from './_generated/server';
import { XP_REWARDS, getLevelFromXp } from './constants';

/**
 * Award a badge if not already earned. Idempotent.
 *
 * Returns the XP delta for the caller to accumulate into a single
 * `userProgress` patch — this avoids OCC conflicts when multiple
 * badge checks (or awardXp + badge checks) run in the same mutation.
 */
export async function checkAndAwardBadge(
  ctx: MutationCtx,
  userId: string,
  badgeKey: string
): Promise<{ awarded: boolean; xpAwarded: number; badge?: { key: string; title: string } }> {
  // Check if already earned
  const existing = await ctx.db
    .query('userBadges')
    .withIndex('by_user_badge', (q) => q.eq('userId', userId).eq('badgeKey', badgeKey))
    .first();

  if (existing) return { awarded: false, xpAwarded: 0 };

  // Look up badge definition
  const def = await ctx.db
    .query('badgeDefinitions')
    .withIndex('by_key', (q) => q.eq('key', badgeKey))
    .first();

  if (!def) return { awarded: false, xpAwarded: 0 };

  // Insert user badge
  await ctx.db.insert('userBadges', {
    userId,
    badgeKey,
    earnedAt: Date.now(),
  });

  // Return XP delta — caller is responsible for patching userProgress
  return { awarded: true, xpAwarded: XP_REWARDS.badgeEarned, badge: { key: def.key, title: def.title } };
}

/**
 * Apply accumulated badge XP to userProgress in a single patch.
 * Call this once after all badge checks in a mutation to avoid OCC conflicts.
 * No-op if badgeXp is 0 or no progress record exists.
 */
export async function applyBadgeXp(
  ctx: MutationCtx,
  userId: string,
  badgeXp: number
): Promise<void> {
  if (badgeXp <= 0) return;

  const progress = await ctx.db
    .query('userProgress')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();

  if (!progress) return;

  const newXp = progress.totalXp + badgeXp;
  await ctx.db.patch(progress._id, {
    totalXp: newXp,
    level: getLevelFromXp(newXp).level,
  });
}
