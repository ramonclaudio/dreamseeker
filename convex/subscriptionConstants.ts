export const TIERS = {
  free: { name: 'Free', limit: 3 },
  premium: { name: 'Premium', limit: null },
} as const;

export type TierKey = keyof typeof TIERS;

export const PREMIUM_ENTITLEMENT = 'DreamSeeker Premium';
