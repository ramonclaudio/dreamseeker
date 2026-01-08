/**
 * Shared tier configuration
 * Single source of truth for tier keys, names, limits, and features
 * Imported by both backend (convex/) and frontend (constants/)
 */

export const TIER_KEYS = ['free', 'starter', 'plus', 'pro'] as const;
export type TierKey = (typeof TIER_KEYS)[number];

// Task limits per tier
export const TIER_LIMITS: Record<TierKey, number | null> = {
  free: 10,
  starter: 50,
  plus: 200,
  pro: null, // unlimited
};

export const TIER_NAMES: Record<TierKey, string> = {
  free: 'Free',
  starter: 'Starter',
  plus: 'Plus',
  pro: 'Pro',
};

// Tier order for comparison (index = rank)
export const TIER_ORDER = TIER_KEYS;

// Next tier for upgrade prompts
export const NEXT_TIER: Record<TierKey, TierKey | null> = {
  free: 'starter',
  starter: 'plus',
  plus: 'pro',
  pro: null,
};

/**
 * Feature access by tier (like Better Auth's `limits`)
 * Use for gating access to features/pages
 */
export const TIER_FEATURES = {
  free: {
    tasks: 10,
    history: false,
    sync: false,
    customThemes: false,
    dataExport: false,
    prioritySupport: false,
    earlyAccess: false,
  },
  starter: {
    tasks: 50,
    history: true,
    sync: true,
    customThemes: false,
    dataExport: false,
    prioritySupport: false,
    earlyAccess: false,
  },
  plus: {
    tasks: 200,
    history: true,
    sync: true,
    customThemes: true,
    dataExport: true,
    prioritySupport: false,
    earlyAccess: false,
  },
  pro: {
    tasks: Infinity,
    history: true,
    sync: true,
    customThemes: true,
    dataExport: true,
    prioritySupport: true,
    earlyAccess: true,
  },
} as const;

export type TierFeatures = (typeof TIER_FEATURES)[TierKey];
export type FeatureKey = keyof TierFeatures;

/**
 * Check if a tier has access to a specific feature
 */
export function hasFeature(tier: TierKey, feature: FeatureKey): boolean {
  return Boolean(TIER_FEATURES[tier][feature]);
}

/**
 * Check if a tier meets or exceeds a minimum tier requirement
 */
export function meetsMinTier(currentTier: TierKey, minTier: TierKey): boolean {
  return TIER_ORDER.indexOf(currentTier) >= TIER_ORDER.indexOf(minTier);
}

/**
 * Get the minimum tier required for a feature
 */
export function getMinTierForFeature(feature: FeatureKey): TierKey {
  for (const tier of TIER_KEYS) {
    if (TIER_FEATURES[tier][feature]) {
      return tier;
    }
  }
  return 'pro'; // Default to highest tier if not found
}
