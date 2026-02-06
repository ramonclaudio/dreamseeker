import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Id, Doc } from './_generated/dataModel';
import { authComponent } from './auth';
import { XP_REWARDS, getLevelFromXp } from './constants';
import { TIERS, PREMIUM_ENTITLEMENT } from './subscriptions';
import { hasEntitlement } from './revenuecat';

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

// ── Date Utilities ──────────────────────────────────────────────────────────

export const getTodayString = () => new Date().toISOString().split('T')[0];

export function getYesterdayString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// ── Streak Calculation ──────────────────────────────────────────────────────

export function calculateStreak(
  currentStreak: number,
  lastActiveDate: string,
  today: string,
  yesterday: string
): number {
  if (lastActiveDate === today) return currentStreak; // Already active today
  if (lastActiveDate === yesterday) return currentStreak + 1; // Consecutive day
  return 1; // Streak broken, start fresh
}

// ── Progress Utilities ──────────────────────────────────────────────────────

export function createDefaultProgress(
  userId: string,
  overrides?: {
    totalXp?: number;
    level?: number;
    currentStreak?: number;
    longestStreak?: number;
    dreamsCompleted?: number;
    actionsCompleted?: number;
  }
) {
  return {
    userId,
    totalXp: overrides?.totalXp ?? 0,
    level: overrides?.level ?? 1,
    currentStreak: overrides?.currentStreak ?? 0,
    longestStreak: overrides?.longestStreak ?? 0,
    lastActiveDate: getTodayString(),
    dreamsCompleted: overrides?.dreamsCompleted ?? 0,
    actionsCompleted: overrides?.actionsCompleted ?? 0,
  };
}

// ── Dream Helpers ──────────────────────────────────────────────────────────

/**
 * Check tier limits for active dreams. Throws 'LIMIT_REACHED' if limit exceeded.
 */
export async function assertDreamLimit(ctx: MutationCtx, userId: string) {
  const isPremium = await hasEntitlement(ctx, {
    appUserId: userId,
    entitlementId: PREMIUM_ENTITLEMENT,
  });

  if (!isPremium) {
    const limit = TIERS.free.limit;
    const activeDreams = await ctx.db
      .query('dreams')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
      .take(limit);
    if (activeDreams.length >= limit) {
      throw new Error('LIMIT_REACHED');
    }
  }
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

  let xpToDeduct = completedActionsCount * XP_REWARDS.actionComplete;
  let dreamsToDeduct = 0;

  if (dream.status === 'completed') {
    xpToDeduct += XP_REWARDS.dreamComplete;
    dreamsToDeduct = 1;
  }

  const progress = await ctx.db
    .query('userProgress')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();

  if (progress && xpToDeduct > 0) {
    const newXp = Math.max(0, progress.totalXp - xpToDeduct);
    await ctx.db.patch(progress._id, {
      totalXp: newXp,
      level: getLevelFromXp(newXp).level,
      actionsCompleted: Math.max(0, progress.actionsCompleted - completedActionsCount),
      dreamsCompleted: Math.max(0, progress.dreamsCompleted - dreamsToDeduct),
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

  let xpToRestore = completedActionsCount * XP_REWARDS.actionComplete;
  let dreamsToRestore = 0;

  if (dream.completedAt) {
    xpToRestore += XP_REWARDS.dreamComplete;
    dreamsToRestore = 1;
  }

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
