import { query, type QueryCtx } from './_generated/server';
import { authComponent } from './auth';
import { hasEntitlement } from './revenuecat';

export const TIERS = {
  free: { name: 'Free', limit: 10 },
  premium: { name: 'Premium', limit: null },
} as const;

export type TierKey = keyof typeof TIERS;

export const PREMIUM_ENTITLEMENT = 'premium';

const getAuthUserId = async (ctx: QueryCtx) =>
  (await authComponent.safeGetAuthUser(ctx))?._id ?? null;

export const getSubscriptionStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        tier: 'free' as TierKey,
        isPremium: false,
        taskLimit: TIERS.free.limit,
        taskCount: 0,
        canCreateTask: false,
        tasksRemaining: 0,
      };
    }

    const isPremium = await hasEntitlement(ctx, {
      appUserId: userId,
      entitlementId: PREMIUM_ENTITLEMENT,
    });

    const tier: TierKey = isPremium ? 'premium' : 'free';
    const taskLimit = TIERS[tier].limit;

    // O(limit+1) instead of O(n) - only fetch what we need for display
    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .take(taskLimit !== null ? taskLimit + 1 : 1);
    const taskCount = tasks.length;

    const canCreateTask = taskLimit === null || taskCount < taskLimit;
    const tasksRemaining = taskLimit === null ? null : Math.max(0, taskLimit - taskCount);

    return {
      tier,
      isPremium,
      taskLimit,
      taskCount,
      canCreateTask,
      tasksRemaining,
    };
  },
});

