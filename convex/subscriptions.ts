import { query } from './_generated/server';
import { components } from './_generated/api';
import { TierKey, TIER_LIMITS, TIER_NAMES } from './schema/tiers';

export type { TierKey } from './schema/tiers';

const PRICE_TO_TIER: Record<string, TierKey> = {
  [process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? '']: 'starter',
  [process.env.STRIPE_STARTER_ANNUAL_PRICE_ID ?? '']: 'starter',
  [process.env.STRIPE_PLUS_MONTHLY_PRICE_ID ?? '']: 'plus',
  [process.env.STRIPE_PLUS_ANNUAL_PRICE_ID ?? '']: 'plus',
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '']: 'pro',
  [process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? '']: 'pro',
};

export const getTierFromPriceId = (priceId: string | undefined): TierKey =>
  priceId ? (PRICE_TO_TIER[priceId] ?? 'free') : 'free';

export const getSubscriptionStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        tier: 'free' as TierKey,
        tierName: TIER_NAMES.free,
        taskLimit: TIER_LIMITS.free,
        taskCount: 0,
        canCreateTask: true,
        tasksRemaining: TIER_LIMITS.free,
        subscription: null,
      };
    }

    const subscriptions = await ctx.runQuery(components.stripe.public.listSubscriptionsByUserId, { userId: identity.subject });
    const activeSubscription = subscriptions.find((sub) => sub.status === 'active' || sub.status === 'trialing');

    const tierKey = getTierFromPriceId(activeSubscription?.priceId);
    const taskLimit = TIER_LIMITS[tierKey];

    const tasks = await ctx.db.query('tasks').withIndex('by_user', (q) => q.eq('userId', identity.subject)).collect();
    const taskCount = tasks.length;

    return {
      tier: tierKey,
      tierName: TIER_NAMES[tierKey],
      taskLimit,
      taskCount,
      canCreateTask: taskLimit === null || taskCount < taskLimit,
      tasksRemaining: taskLimit === null ? null : Math.max(0, taskLimit - taskCount),
      subscription: activeSubscription ? {
        id: activeSubscription.stripeSubscriptionId,
        status: activeSubscription.status,
        cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
        currentPeriodEnd: activeSubscription.currentPeriodEnd,
      } : null,
    };
  },
});
