import { useQuery, useAction } from 'convex/react';
import { useRouter, type Href } from 'expo-router';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import * as WebBrowser from 'expo-web-browser';

import { api } from '@/convex/_generated/api';
import { type TierKey, TIER_KEYS } from '@/constants/subscriptions';
import { TIER_FEATURES, meetsMinTier, hasFeature, type FeatureKey } from '@/convex/schema/tiers';
import { shootConfetti } from '@/lib/confetti';
import { haptics } from '@/lib/haptics';

export type { TierKey, FeatureKey };

export function useSubscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const status = useQuery(api.subscriptions.getSubscriptionStatus);
  const tier = (status?.tier ?? 'free') as TierKey;

  const previousTierRef = useRef<TierKey | null>(null);
  useEffect(() => {
    if (status === undefined) return;
    const currentTier = status.tier as TierKey;
    const prev = previousTierRef.current;
    if (prev !== null && TIER_KEYS.indexOf(currentTier) > TIER_KEYS.indexOf(prev)) {
      haptics.success();
      shootConfetti();
    }
    previousTierRef.current = currentTier;
  }, [status?.tier]);

  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const cancelSub = useAction(api.stripe.cancelSubscription);
  const reactivateSub = useAction(api.stripe.reactivateSubscription);
  const getPortalUrl = useAction(api.stripe.getCustomerPortalUrl);

  const subscription = status?.subscription;

  const showUpgrade = useCallback(() => router.push('/subscribe' as Href), [router]);

  const subscribe = useCallback(async (priceId: string) => {
    setLoading(true);
    try {
      const result = await createCheckout({
        priceId,
        successUrl: 'expostarterapp://settings?subscription=success',
        cancelUrl: 'expostarterapp://settings?subscription=canceled',
      });
      if (result.url) await WebBrowser.openBrowserAsync(result.url);
      return { success: true };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  }, [createCheckout]);

  const manageBilling = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPortalUrl({ returnUrl: 'expostarterapp://settings' });
      if (result?.url) await WebBrowser.openBrowserAsync(result.url);
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

  const canAccess = useCallback((minTier: TierKey) => meetsMinTier(tier, minTier), [tier]);
  const hasFeatureFn = useCallback((feature: FeatureKey) => hasFeature(tier, feature), [tier]);

  return useMemo(() => ({
    tier,
    tierName: status?.tierName ?? 'Free',
    taskCount: status?.taskCount ?? 0,
    taskLimit: status?.taskLimit ?? 10,
    canCreateTask: status?.canCreateTask ?? true,
    tasksRemaining: status?.tasksRemaining ?? null,
    features: TIER_FEATURES[tier],
    canAccess,
    hasFeature: hasFeatureFn,
    subscription,
    isActive: subscription?.status === 'active' || subscription?.status === 'trialing',
    isTrialing: subscription?.status === 'trialing',
    isCanceled: subscription?.cancelAtPeriodEnd === true,
    isLoading: status === undefined,
    loading,
    showUpgrade,
    subscribe,
    manageBilling,
    cancel,
    restore,
  }), [tier, status, subscription, loading, showUpgrade, subscribe, manageBilling, cancel, restore, canAccess, hasFeatureFn]);
}
