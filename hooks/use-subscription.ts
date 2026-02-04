import { useState, useCallback } from 'react';
import { useQuery } from 'convex/react';
import Purchases, {
  type PurchasesPackage,
  type CustomerInfo,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
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
  loading: boolean;
  subscribe: (pkg: PurchasesPackage) => Promise<SubscribeResult>;
  restore: () => Promise<RestoreResult>;
  manageBilling: () => Promise<void>;
  showUpgrade: () => Promise<boolean>;
}

interface SubscribeResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
}

interface RestoreResult {
  success: boolean;
  hasPremium: boolean;
  error?: string;
}

export function useSubscription(): UseSubscriptionResult {
  const status = useQuery(api.subscriptions.getSubscriptionStatus);
  const [loading, setLoading] = useState(false);

  const subscribe = useCallback(
    async (pkg: PurchasesPackage): Promise<SubscribeResult> => {
      setLoading(true);
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const hasPremium = checkPremiumEntitlement(customerInfo);

        if (__DEV__) {
          console.log('[Subscription] Purchase complete, premium:', hasPremium);
        }

        return { success: hasPremium };
      } catch (error: unknown) {
        if (isPurchaseError(error)) {
          if (error.userCancelled) {
            return { success: false, cancelled: true };
          }
          return { success: false, error: error.message };
        }
        return { success: false, error: 'Purchase failed' };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const restore = useCallback(async (): Promise<RestoreResult> => {
    setLoading(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasPremium = checkPremiumEntitlement(customerInfo);

      if (__DEV__) {
        console.log('[Subscription] Restore complete, premium:', hasPremium);
      }

      return { success: true, hasPremium };
    } catch (error: unknown) {
      if (isPurchaseError(error)) {
        return { success: false, hasPremium: false, error: error.message };
      }
      return { success: false, hasPremium: false, error: 'Restore failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const manageBilling = useCallback(async (): Promise<void> => {
    try {
      const info = await Purchases.getCustomerInfo();
      const managementUrl = info.managementURL;
      if (managementUrl) {
        // Open subscription management in system settings
        const { openURL } = await import('expo-linking');
        await openURL(managementUrl);
      }
    } catch (error) {
      if (__DEV__) console.error('[Subscription] Manage billing failed:', error);
    }
  }, []);

  const showUpgrade = useCallback(async (): Promise<boolean> => {
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: 'premium',
      });

      if (__DEV__) {
        console.log('[Subscription] Paywall result:', PAYWALL_RESULT[result]);
      }

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          return true;
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.CANCELLED:
        default:
          return false;
      }
    } catch (error) {
      if (__DEV__) console.error('[Subscription] Paywall error:', error);
      return false;
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
    loading,
    subscribe,
    restore,
    manageBilling,
    showUpgrade,
  };
}

function checkPremiumEntitlement(customerInfo: CustomerInfo): boolean {
  return 'premium' in customerInfo.entitlements.active;
}

interface PurchaseError {
  code: PURCHASES_ERROR_CODE;
  message: string;
  userCancelled: boolean;
}

function isPurchaseError(error: unknown): error is PurchaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}
