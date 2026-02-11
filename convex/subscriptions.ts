import { authQuery } from './functions';
import { hasEntitlement } from './revenuecat';
import { TIERS, PREMIUM_ENTITLEMENT, type TierKey } from './subscriptionConstants';

export { TIERS, PREMIUM_ENTITLEMENT, type TierKey } from './subscriptionConstants';

export const getSubscriptionStatus = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) {
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
      appUserId: ctx.user,
      entitlementId: PREMIUM_ENTITLEMENT,
    });

    const tier: TierKey = isPremium ? 'premium' : 'free';
    const dreamLimit = TIERS[tier].limit;

    // For free: O(limit+1). For premium: fetch up to 100 for display count.
    const dreams = await ctx.db
      .query('dreams')
      .withIndex('by_user_status', (q) => q.eq('userId', ctx.user!).eq('status', 'active'))
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
