import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Id, Doc } from './_generated/dataModel';
import { authComponent } from './auth';
import { XP_REWARDS, getLevelFromXp, FREE_MAX_DREAMS } from './constants';
import { computeStreakUpdate } from './streak';
import { TIERS, PREMIUM_ENTITLEMENT } from './subscriptions';
import { hasEntitlement } from './revenuecat';
import { checkAndAwardBadge, applyBadgeXp } from './badgeChecks';
import { getTodayString, getYesterdayString } from './dates';
import { calculateArchiveXpDeduction, calculateRestoreXpGain } from './dreamGuards';
import { createFeedEvent } from './feed';
import { createDefaultProgress } from './progress';

// ── Auth Guards ─────────────────────────────────────────────────────────────

export const getAuthUserId = async (ctx: QueryCtx | MutationCtx) =>
  (await authComponent.safeGetAuthUser(ctx))?._id ?? null;

export const requireAuth = async (ctx: QueryCtx | MutationCtx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error('Unauthorized');
  return userId;
};

export const getOwnedDream = async (ctx: MutationCtx, id: Id<'dreams'>, userId: string) => {
  const dream = await ctx.db.get(id);
  if (!dream) throw new Error('Dream not found');
  if (dream.userId !== userId) throw new Error('Forbidden');
  return dream;
};

// ── XP Award ────────────────────────────────────────────────────────────────

const ON_FIRE_STREAK_THRESHOLD = 7;

async function getOrCreateProgress(
  ctx: MutationCtx,
  userId: string,
  opts: {
    xpReward: number;
    skipStreak?: boolean;
    incrementActions?: number;
    incrementDreams?: number;
    timezone: string;
  }
): Promise<{ existing: Doc<'userProgress'>; today: string; yesterday: string } | { created: true; newStreak: number; xpAwarded: number }> {
  const progress = await ctx.db
    .query('userProgress')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();

  if (progress) {
    return {
      existing: progress,
      today: getTodayString(opts.timezone),
      yesterday: getYesterdayString(opts.timezone),
    };
  }

  const newStreak = opts.skipStreak ? 0 : 1;
  await ctx.db.insert('userProgress', {
    ...createDefaultProgress(userId, {
      totalXp: opts.xpReward,
      level: getLevelFromXp(opts.xpReward).level,
      currentStreak: newStreak,
      longestStreak: newStreak,
      actionsCompleted: opts.incrementActions ?? 0,
      dreamsCompleted: opts.incrementDreams ?? 0,
      timezone: opts.timezone,
    }),
  });

  return { created: true, newStreak, xpAwarded: opts.xpReward };
}

/**
 * Consolidated XP/streak/progress handler. All XP-granting mutations
 * should use this instead of duplicating get-or-create + streak + milestone logic.
 */
export async function awardXp(
  ctx: MutationCtx,
  userId: string,
  xpReward: number,
  opts?: {
    skipStreak?: boolean;
    incrementActions?: number;
    incrementDreams?: number;
    timezone?: string;
  }
): Promise<{
  xpAwarded: number;
  newStreak: number;
  streakMilestone: { streak: number; xpReward: number } | null;
}> {
  const tz = opts?.timezone ?? 'UTC';
  const result = await getOrCreateProgress(ctx, userId, {
    xpReward,
    skipStreak: opts?.skipStreak,
    incrementActions: opts?.incrementActions,
    incrementDreams: opts?.incrementDreams,
    timezone: tz,
  });

  if ('created' in result) {
    return { xpAwarded: result.xpAwarded, newStreak: result.newStreak, streakMilestone: null };
  }

  const { existing: progress, today, yesterday } = result;
  const skipStreak = opts?.skipStreak ?? false;

  const streak = computeStreakUpdate(progress, today, yesterday, skipStreak);
  const newXp = progress.totalXp + xpReward + streak.milestoneXp;

  const patch: Record<string, unknown> = {
    ...streak.patch,
    totalXp: newXp,
    level: getLevelFromXp(newXp).level,
    lastActiveDate: today,
  };

  if (opts?.incrementActions) {
    patch.actionsCompleted = progress.actionsCompleted + opts.incrementActions;
  }
  if (opts?.incrementDreams) {
    patch.dreamsCompleted = progress.dreamsCompleted + opts.incrementDreams;
  }

  const oldLevel = progress.level;
  await ctx.db.patch(progress._id, patch);

  const newLevel = getLevelFromXp(newXp).level;
  if (newLevel > oldLevel) {
    await createFeedEvent(ctx, userId, 'level_up', undefined, {
      level: newLevel,
      title: getLevelFromXp(newXp).title,
    });
  }

  if (streak.streakMilestone) {
    await createFeedEvent(ctx, userId, 'streak_milestone', undefined, {
      streak: streak.streakMilestone.streak,
    });
  }

  // Centralized on_fire badge check
  let badgeXp = 0;
  if (!skipStreak && streak.newStreak >= ON_FIRE_STREAK_THRESHOLD) {
    const badgeResult = await checkAndAwardBadge(ctx, userId, 'on_fire');
    badgeXp += badgeResult.xpAwarded;
  }
  await applyBadgeXp(ctx, userId, badgeXp);

  return {
    xpAwarded: xpReward + streak.milestoneXp + badgeXp,
    newStreak: streak.newStreak,
    streakMilestone: streak.streakMilestone,
  };
}

// ── Dream Helpers ───────────────────────────────────────────────────────────

/**
 * Check tier limits for active dreams. Free users: max 25 active dreams.
 * Premium users: unlimited.
 */
export async function assertDreamLimit(ctx: MutationCtx, userId: string) {
  const isPremium = await hasEntitlement(ctx, {
    appUserId: userId,
    entitlementId: PREMIUM_ENTITLEMENT,
  });
  if (isPremium) return;

  const activeDreams = await ctx.db
    .query('dreams')
    .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
    .take(FREE_MAX_DREAMS + 1);

  if (activeDreams.length >= FREE_MAX_DREAMS) {
    throw new Error('FREE_DREAM_LIMIT');
  }
}

// ── XP Deduction ────────────────────────────────────────────────────────────

/**
 * Deduct XP from a user's progress. Clamps to 0.
 */
export async function deductXp(
  ctx: MutationCtx,
  userId: string,
  amount: number,
  opts?: { decrementActions?: number; decrementDreams?: number }
) {
  const progress = await ctx.db
    .query('userProgress')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();
  if (!progress || amount <= 0) return;

  const newXp = Math.max(0, progress.totalXp - amount);
  const patch: Record<string, unknown> = {
    totalXp: newXp,
    level: getLevelFromXp(newXp).level,
  };
  if (opts?.decrementActions) {
    patch.actionsCompleted = Math.max(0, progress.actionsCompleted - opts.decrementActions);
  }
  if (opts?.decrementDreams) {
    patch.dreamsCompleted = Math.max(0, progress.dreamsCompleted - opts.decrementDreams);
  }
  await ctx.db.patch(progress._id, patch);
}

/**
 * Deduct XP for a dream and its completed actions.
 */
export async function deductDreamXp(
  ctx: MutationCtx,
  userId: string,
  dream: Doc<'dreams'>,
  actions: Doc<'actions'>[]
) {
  const completedActionsCount = actions.filter((a) => a.isCompleted).length;
  const xpToDeduct = calculateArchiveXpDeduction(completedActionsCount, dream.status as 'active' | 'completed' | 'archived');
  const dreamsToDeduct = dream.status === 'completed' ? 1 : 0;

  if (xpToDeduct > 0) {
    await deductXp(ctx, userId, xpToDeduct, {
      decrementActions: completedActionsCount,
      decrementDreams: dreamsToDeduct,
    });
  }

  return xpToDeduct;
}

/**
 * Restore XP for a dream and its completed actions.
 */
export async function restoreDreamXp(
  ctx: MutationCtx,
  userId: string,
  dream: Doc<'dreams'>,
  actions: Doc<'actions'>[]
) {
  const completedActionsCount = actions.filter((a) => a.isCompleted).length;
  const xpToRestore = calculateRestoreXpGain(completedActionsCount, !!dream.completedAt);
  const dreamsToRestore = dream.completedAt ? 1 : 0;

  const progress = await ctx.db
    .query('userProgress')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();

  if (progress && xpToRestore > 0) {
    const newXp = progress.totalXp + xpToRestore;
    await ctx.db.patch(progress._id, {
      totalXp: newXp,
      level: getLevelFromXp(newXp).level,
      actionsCompleted: progress.actionsCompleted + completedActionsCount,
      dreamsCompleted: progress.dreamsCompleted + dreamsToRestore,
    });
  }

  return xpToRestore;
}

// Re-export for backward compatibility with existing imports
export { createDefaultProgress } from './progress';
