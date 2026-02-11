export const TIERS = {
  free: { name: 'Free', limit: null }, // Unlimited dreams — premium gates community only
  premium: { name: 'Premium', limit: null }, // Unlimited dreams + community access
} as const;

export type TierKey = keyof typeof TIERS;

export const PREMIUM_ENTITLEMENT = 'DreamSeeker Premium';
