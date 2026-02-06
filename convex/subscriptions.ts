import { query } from './_generated/server';
import { hasEntitlement } from './revenuecat';
import { getAuthUserId } from './helpers';

export const TIERS = {
  free: { name: 'Free', limit: 3 }, // 3 free dreams
  premium: { name: 'Premium', limit: null }, // Unlimited dreams
} as const;

export type TierKey = keyof typeof TIERS;

export const PREMIUM_ENTITLEMENT = 'premium';

export const getSubscriptionStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        tier: 'free' as TierKey,
        isPremium: false,
        dreamLimit: TIERS.free.limit,
        dreamCount: 0,
        canCreateDream: false,
        dreamsRemaining: 0,
      };
    }

    const isPremium = await hasEntitlement(ctx, {
      appUserId: userId,
      entitlementId: PREMIUM_ENTITLEMENT,
    });

    const tier: TierKey = isPremium ? 'premium' : 'free';
    const dreamLimit = TIERS[tier].limit;

    // For free: O(limit+1). For premium: fetch up to 100 for display count.
    const dreams = await ctx.db
      .query('dreams')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
      .take(dreamLimit !== null ? dreamLimit + 1 : 100);
    const dreamCount = dreams.length;

    const canCreateDream = dreamLimit === null || dreamCount < dreamLimit;
    const dreamsRemaining = dreamLimit === null ? null : Math.max(0, dreamLimit - dreamCount);

    return {
      tier,
      isPremium,
      dreamLimit,
      dreamCount,
      canCreateDream,
      dreamsRemaining,
    };
  },
});

