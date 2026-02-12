export const TIERS = {
  free: { name: 'Free', limit: 3, pinLimit: 5 },
  premium: { name: 'Premium', limit: null, pinLimit: null },
} as const;

export type TierKey = keyof typeof TIERS;

export const PREMIUM_ENTITLEMENT = 'DreamSeeker Premium';
