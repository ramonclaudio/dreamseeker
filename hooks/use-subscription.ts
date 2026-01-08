import { useQuery, useAction } from 'convex/react';
import { useRouter, type Href } from 'expo-router';
import { useState, useCallback, useRef, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';

import { api } from '@/convex/_generated/api';
import { type TierKey, TIER_ORDER } from '@/constants/subscriptions';
import { TIER_FEATURES, meetsMinTier, hasFeature, type FeatureKey } from '@/convex/schema/tiers';
import { shootConfetti } from '@/lib/confetti';
import { haptics } from '@/lib/haptics';

export type { TierKey, FeatureKey };

export function useSubscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Single query for all subscription state
  const status = useQuery(api.subscriptions.getSubscriptionStatus);

  // Watch for tier upgrades and celebrate
  const previousTierRef = useRef<TierKey | null>(null);
  useEffect(() => {
    if (status === undefined) return;

    const currentTier = status.tier as TierKey;
    const previousTier = previousTierRef.current;

    if (previousTier !== null) {
      const previousIndex = TIER_ORDER.indexOf(previousTier);
      const currentIndex = TIER_ORDER.indexOf(currentTier);

      if (currentIndex > previousIndex) {
        haptics.success();
        shootConfetti();
      }
    }

    previousTierRef.current = currentTier;
  }, [status?.tier]);

  // Convex actions
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const cancelSub = useAction(api.stripe.cancelSubscription);
  const reactivateSub = useAction(api.stripe.reactivateSubscription);
  const getPortalUrl = useAction(api.stripe.getCustomerPortalUrl);

  // Derived state
  const subscription = status?.subscription;
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isTrialing = subscription?.status === 'trialing';
  const isCanceled = subscription?.cancelAtPeriodEnd === true;

  const showUpgrade = useCallback(() => {
    router.push('/subscribe' as Href);
  }, [router]);

  const subscribe = useCallback(
    async (priceId: string) => {
      setLoading(true);
      try {
        const result = await createCheckout({
          priceId,
          successUrl: 'expostarterapp://settings?subscription=success',
          cancelUrl: 'expostarterapp://settings?subscription=canceled',
        });

        if (result.url) {
          await WebBrowser.openBrowserAsync(result.url);
        }

        return { success: true };
      } catch (error) {
        return { error };
      } finally {
        setLoading(false);
      }
    },
    [createCheckout]
  );

  const manageBilling = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPortalUrl({
        returnUrl: 'expostarterapp://settings',
      });

      if (result?.url) {
        await WebBrowser.openBrowserAsync(result.url);
      }
    } finally {
      setLoading(false);
    }
  }, [getPortalUrl]);

  const cancel = useCallback(async () => {
    if (!subscription?.id) return { error: 'No subscription' };

    setLoading(true);
    try {
      await cancelSub({ subscriptionId: subscription.id });
      return { success: true };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  }, [cancelSub, subscription?.id]);

  const restore = useCallback(async () => {
    if (!subscription?.id) return { error: 'No subscription' };

    setLoading(true);
    try {
      await reactivateSub({ subscriptionId: subscription.id });
      return { success: true };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  }, [reactivateSub, subscription?.id]);

  const tier = (status?.tier ?? 'free') as TierKey;

  return {
    // Tier status
    tier,
    tierName: status?.tierName ?? 'Free',

    // Task limits
    taskCount: status?.taskCount ?? 0,
    taskLimit: status?.taskLimit ?? 10,
    canCreateTask: status?.canCreateTask ?? true,
    tasksRemaining: status?.tasksRemaining ?? null,

    // Feature access (like Better Auth's limits)
    features: TIER_FEATURES[tier],
    canAccess: (minTier: TierKey) => meetsMinTier(tier, minTier),
    hasFeature: (feature: FeatureKey) => hasFeature(tier, feature),

    // Subscription state
    subscription,
    isActive,
    isTrialing,
    isCanceled,

    // Loading states
    isLoading: status === undefined,
    loading,

    // Actions
    showUpgrade,
    subscribe,
    manageBilling,
    cancel,
    restore,
  };
}
