export const TIER_KEYS = ['free', 'starter', 'plus', 'pro'] as const;
export type TierKey = (typeof TIER_KEYS)[number];

export const TIER_LIMITS: Record<TierKey, number | null> = {
  free: 10,
  starter: 50,
  plus: 200,
  pro: null,
};

export const TIER_NAMES: Record<TierKey, string> = {
  free: 'Free',
  starter: 'Starter',
  plus: 'Plus',
  pro: 'Pro',
};

export const NEXT_TIER: Record<TierKey, TierKey | null> = {
  free: 'starter',
  starter: 'plus',
  plus: 'pro',
  pro: null,
};

export const TIER_FEATURES = {
  free: { tasks: 10, history: false, dataExport: false, earlyAccess: false },
  starter: { tasks: 50, history: true, dataExport: false, earlyAccess: false },
  plus: { tasks: 200, history: true, dataExport: true, earlyAccess: false },
  pro: { tasks: Infinity, history: true, dataExport: true, earlyAccess: true },
} as const;

export type TierFeatures = (typeof TIER_FEATURES)[TierKey];
export type FeatureKey = keyof TierFeatures;

export const meetsMinTier = (current: TierKey, min: TierKey) =>
  TIER_KEYS.indexOf(current) >= TIER_KEYS.indexOf(min);

export const hasFeature = (tier: TierKey, feature: FeatureKey) =>
  Boolean(TIER_FEATURES[tier][feature]);

export const getMinTierForFeature = (feature: FeatureKey): TierKey =>
  TIER_KEYS.find(tier => TIER_FEATURES[tier][feature]) ?? 'pro';
