/**
 * Tier gating utilities
 * Similar to Better Auth's subscription gating pattern
 */

import { useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';

import { useSubscription } from './use-subscription';
import {
  type TierKey,
  type FeatureKey,
  TIER_FEATURES,
  meetsMinTier,
  hasFeature,
  getMinTierForFeature,
} from '@/convex/schema/tiers';

export type { TierKey, FeatureKey };
export { TIER_FEATURES, meetsMinTier, hasFeature, getMinTierForFeature };

type TierGateOptions = {
  /** Redirect to this path if access denied (default: /subscribe) */
  redirectTo?: Href;
  /** If true, don't auto-redirect, just return access status */
  noRedirect?: boolean;
};

/**
 * Hook to require a minimum tier for a page/component
 * Redirects to subscribe page if tier requirement not met
 *
 * @example
 * ```tsx
 * function ProFeaturePage() {
 *   const { hasAccess, isLoading } = useRequireTier('pro');
 *   if (isLoading) return <Loading />;
 *   if (!hasAccess) return null; // Will redirect
 *   return <ProContent />;
 * }
 * ```
 */
export function useRequireTier(minTier: TierKey, options: TierGateOptions = {}) {
  const { redirectTo = '/subscribe' as Href, noRedirect = false } = options;
  const router = useRouter();
  const { tier, isLoading } = useSubscription();

  const hasAccess = !isLoading && meetsMinTier(tier, minTier);

  useEffect(() => {
    if (!isLoading && !hasAccess && !noRedirect) {
      router.replace(redirectTo);
    }
  }, [isLoading, hasAccess, noRedirect, router, redirectTo]);

  return {
    hasAccess,
    isLoading,
    currentTier: tier,
    requiredTier: minTier,
  };
}

/**
 * Hook to require a specific feature
 * Redirects if current tier doesn't have the feature
 *
 * @example
 * ```tsx
 * function DataExportPage() {
 *   const { hasAccess, isLoading, requiredTier } = useRequireFeature('dataExport');
 *   if (isLoading) return <Loading />;
 *   if (!hasAccess) return null; // Will redirect
 *   return <ExportUI />;
 * }
 * ```
 */
export function useRequireFeature(feature: FeatureKey, options: TierGateOptions = {}) {
  const { redirectTo = '/subscribe' as Href, noRedirect = false } = options;
  const router = useRouter();
  const { tier, isLoading } = useSubscription();

  const hasAccess = !isLoading && hasFeature(tier, feature);
  const requiredTier = getMinTierForFeature(feature);

  useEffect(() => {
    if (!isLoading && !hasAccess && !noRedirect) {
      router.replace(redirectTo);
    }
  }, [isLoading, hasAccess, noRedirect, router, redirectTo]);

  return {
    hasAccess,
    isLoading,
    currentTier: tier,
    requiredTier,
    feature,
  };
}

/**
 * Hook to check tier access without redirecting
 * Useful for conditional rendering within a page
 *
 * @example
 * ```tsx
 * function SettingsPage() {
 *   const { canAccess } = useTierAccess();
 *
 *   return (
 *     <View>
 *       <BasicSettings />
 *       {canAccess('plus') && <AdvancedSettings />}
 *       {canAccess('pro') && <ProSettings />}
 *     </View>
 *   );
 * }
 * ```
 */
export function useTierAccess() {
  const { tier, isLoading } = useSubscription();

  return {
    tier,
    isLoading,
    /** Check if user meets minimum tier */
    canAccess: (minTier: TierKey) => meetsMinTier(tier, minTier),
    /** Check if user has a specific feature */
    hasFeature: (feature: FeatureKey) => hasFeature(tier, feature),
    /** Get all features for current tier */
    features: TIER_FEATURES[tier],
  };
}
