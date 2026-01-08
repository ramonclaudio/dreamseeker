import { useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';

import { useSubscription } from './use-subscription';
import { type TierKey, type FeatureKey, meetsMinTier, hasFeature, getMinTierForFeature } from '@/convex/schema/tiers';

type Options = {
  redirectTo?: Href;
  noRedirect?: boolean;
};

export function useRequireTier(minTier: TierKey, options: Options = {}) {
  const { redirectTo = '/subscribe' as Href, noRedirect = false } = options;
  const router = useRouter();
  const { tier, isLoading } = useSubscription();

  const hasAccess = !isLoading && meetsMinTier(tier, minTier);

  useEffect(() => {
    if (!isLoading && !hasAccess && !noRedirect) {
      router.replace(redirectTo);
    }
  }, [isLoading, hasAccess, noRedirect, router, redirectTo]);

  return { hasAccess, isLoading, tier };
}

export function useRequireFeature(feature: FeatureKey, options: Options = {}) {
  const { redirectTo = '/subscribe' as Href, noRedirect = false } = options;
  const router = useRouter();
  const { tier, isLoading } = useSubscription();

  const hasAccess = !isLoading && hasFeature(tier, feature);

  useEffect(() => {
    if (!isLoading && !hasAccess && !noRedirect) {
      router.replace(redirectTo);
    }
  }, [isLoading, hasAccess, noRedirect, router, redirectTo]);

  return { hasAccess, isLoading, tier, requiredTier: getMinTierForFeature(feature) };
}
