import { useCallback } from 'react';
import { useQuery } from 'convex/react';
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { api } from '@/convex/_generated/api';
import { PREMIUM_ENTITLEMENT, type TierKey } from '@/convex/subscriptionConstants';

interface UseSubscriptionResult {
  tier: TierKey;
  isPremium: boolean;
  dreamLimit: number | null;
  dreamCount: number;
  canCreateDream: boolean;
  dreamsRemaining: number | null;
  isLoading: boolean;
  showUpgrade: () => Promise<boolean>;
  showCustomerCenter: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
}

export function useSubscription(): UseSubscriptionResult {
  const status = useQuery(api.subscriptions.getSubscriptionStatus);

  const showUpgrade = useCallback(async (): Promise<boolean> => {
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: PREMIUM_ENTITLEMENT,
      });

      if (__DEV__) {
        console.log('[Subscription] Paywall result:', PAYWALL_RESULT[result]);
      }

      return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
    } catch (error) {
      if (__DEV__) console.error('[Subscription] Paywall error:', error);
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasPremium = PREMIUM_ENTITLEMENT in customerInfo.entitlements.active;

      if (__DEV__) {
        console.log('[Subscription] Restore complete, premium:', hasPremium);
      }

      return hasPremium;
    } catch (error) {
      if (__DEV__) console.error('[Subscription] Restore failed:', error);
      return false;
    }
  }, []);

  const showCustomerCenter = useCallback(async (): Promise<void> => {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (error) {
      if (__DEV__) console.error('[Subscription] Customer center error:', error);
    }
  }, []);

  return {
    tier: status?.tier ?? 'free',
    isPremium: status?.isPremium ?? false,
    dreamLimit: status?.dreamLimit ?? null,
    dreamCount: status?.dreamCount ?? 0,
    canCreateDream: status?.canCreateDream ?? true,
    dreamsRemaining: status?.dreamsRemaining ?? null,
    isLoading: status === undefined,
    showUpgrade,
    showCustomerCenter,
    restorePurchases,
  };
}
