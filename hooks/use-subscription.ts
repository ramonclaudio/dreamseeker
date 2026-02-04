import { useCallback } from 'react';
import { useQuery } from 'convex/react';
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { api } from '@/convex/_generated/api';
import type { TierKey } from '@/convex/subscriptions';

export interface UseSubscriptionResult {
  tier: TierKey;
  isPremium: boolean;
  taskLimit: number | null;
  taskCount: number;
  canCreateTask: boolean;
  tasksRemaining: number | null;
  isLoading: boolean;
  showUpgrade: () => Promise<boolean>;
  restore: () => Promise<boolean>;
  manageBilling: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionResult {
  const status = useQuery(api.subscriptions.getSubscriptionStatus);

  const showUpgrade = useCallback(async (): Promise<boolean> => {
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: 'premium',
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

  const restore = useCallback(async (): Promise<boolean> => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasPremium = 'premium' in customerInfo.entitlements.active;

      if (__DEV__) {
        console.log('[Subscription] Restore complete, premium:', hasPremium);
      }

      return hasPremium;
    } catch (error) {
      if (__DEV__) console.error('[Subscription] Restore failed:', error);
      return false;
    }
  }, []);

  const manageBilling = useCallback(async (): Promise<void> => {
    try {
      const info = await Purchases.getCustomerInfo();
      if (info.managementURL) {
        const { openURL } = await import('expo-linking');
        await openURL(info.managementURL);
      }
    } catch (error) {
      if (__DEV__) console.error('[Subscription] Manage billing failed:', error);
    }
  }, []);

  return {
    tier: status?.tier ?? 'free',
    isPremium: status?.isPremium ?? false,
    taskLimit: status?.taskLimit ?? 10,
    taskCount: status?.taskCount ?? 0,
    canCreateTask: status?.canCreateTask ?? false,
    tasksRemaining: status?.tasksRemaining ?? null,
    isLoading: status === undefined,
    showUpgrade,
    restore,
    manageBilling,
  };
}
