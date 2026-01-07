import { useQuery, useAction } from 'convex/react';
import { useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';

import { api } from '@/convex/_generated/api';

export function useSubscription() {
  const [loading, setLoading] = useState(false);

  // Real-time subscription status (auto-updates via webhooks)
  const subscription = useQuery(api.stripe.getActiveSubscription);

  // Convex actions
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const cancelSub = useAction(api.stripe.cancelSubscription);
  const reactivateSub = useAction(api.stripe.reactivateSubscription);
  const getPortalUrl = useAction(api.stripe.getCustomerPortalUrl);

  // Derived state
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isTrialing = subscription?.status === 'trialing';
  const isPastDue = subscription?.status === 'past_due';
  const isCanceled = subscription?.cancelAtPeriodEnd === true;

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
    if (!subscription?.stripeSubscriptionId) return { error: 'No subscription' };

    setLoading(true);
    try {
      await cancelSub({ subscriptionId: subscription.stripeSubscriptionId });
      return { success: true };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  }, [cancelSub, subscription?.stripeSubscriptionId]);

  const restore = useCallback(async () => {
    if (!subscription?.stripeSubscriptionId) return { error: 'No subscription' };

    setLoading(true);
    try {
      await reactivateSub({ subscriptionId: subscription.stripeSubscriptionId });
      return { success: true };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  }, [reactivateSub, subscription?.stripeSubscriptionId]);

  return {
    subscription,
    isActive,
    isTrialing,
    isPastDue,
    isCanceled,
    isLoading: subscription === undefined,
    loading,
    subscribe,
    manageBilling,
    cancel,
    restore,
  };
}
