import { authQuery } from './functions';
import { hasEntitlement, getActiveSubscriptions, getAllSubscriptions } from './revenuecat';
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
        pinLimit: TIERS.free.pinLimit,
        pinCount: 0,
        canCreatePin: false,
        isTrialActive: false,
        trialExpiresAt: null,
        hasTrialExpired: false,
      };
    }

    const isPremium = await hasEntitlement(ctx, {
      appUserId: ctx.user,
      entitlementId: PREMIUM_ENTITLEMENT,
    });

    // Trial state detection
    let isTrialActive = false;
    let trialExpiresAt: number | null = null;
    let hasTrialExpired = false;

    const activeSubs = await getActiveSubscriptions(ctx, { appUserId: ctx.user });
    const trialSub = activeSubs.find((s) => s.periodType === 'TRIAL');

    if (trialSub) {
      isTrialActive = true;
      trialExpiresAt = trialSub.expirationAtMs ?? null;
    } else if (!isPremium) {
      const allSubs = await getAllSubscriptions(ctx, { appUserId: ctx.user });
      hasTrialExpired = allSubs.some((s) => s.periodType === 'TRIAL');
    }

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

    // Pin limits
    const pinLimit = TIERS[tier].pinLimit;
    const pins = await ctx.db
      .query('pins')
      .withIndex('by_user_created', (q) => q.eq('userId', ctx.user!))
      .take(pinLimit !== null ? pinLimit + 1 : 1);
    const pinCount = pins.length;
    const canCreatePin = pinLimit === null || pinCount < pinLimit;

    return {
      tier,
      isPremium,
      dreamLimit,
      dreamCount,
      canCreateDream,
      dreamsRemaining,
      pinLimit,
      pinCount,
      canCreatePin,
      isTrialActive,
      trialExpiresAt,
      hasTrialExpired,
    };
  },
});
