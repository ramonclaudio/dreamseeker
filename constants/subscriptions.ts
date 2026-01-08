/**
 * Subscription tier configuration (UI)
 * Extends shared tier config with pricing, features, and Stripe IDs
 */

import {
  TierKey,
  TIER_KEYS,
  TIER_LIMITS,
  TIER_NAMES,
  TIER_ORDER,
  NEXT_TIER,
} from '../convex/schema/tiers';

export type { TierKey };
export { TIER_KEYS, TIER_LIMITS, TIER_NAMES, TIER_ORDER, NEXT_TIER };

// UI-specific tier configuration
export type TierConfig = {
  key: TierKey;
  name: string;
  description: string;
  taskLimit: number | null;
  taskLimitLabel: string;
  pricing: {
    monthly: { amount: string; priceId: string };
    annual: { amount: string; priceId: string; savings: string };
  } | null;
  features: string[];
  popular?: boolean;
};

// Helper to format task limit label
const formatLimit = (limit: number | null): string =>
  limit === null ? 'Unlimited' : `${limit} tasks`;

export const TIERS: Record<TierKey, TierConfig> = {
  free: {
    key: 'free',
    name: TIER_NAMES.free,
    description: 'Get started with the basics',
    taskLimit: TIER_LIMITS.free,
    taskLimitLabel: formatLimit(TIER_LIMITS.free),
    pricing: null,
    features: [`${TIER_LIMITS.free} tasks`, 'Basic task management'],
  },
  starter: {
    key: 'starter',
    name: TIER_NAMES.starter,
    description: 'For personal productivity',
    taskLimit: TIER_LIMITS.starter,
    taskLimitLabel: formatLimit(TIER_LIMITS.starter),
    pricing: {
      monthly: {
        amount: '$4.99',
        priceId: process.env.EXPO_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID ?? '',
      },
      annual: {
        amount: '$49.99',
        priceId: process.env.EXPO_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID ?? '',
        savings: 'Save 17%',
      },
    },
    features: [`${TIER_LIMITS.starter} tasks`, 'Task history', 'Cross-device sync', 'Email support'],
  },
  plus: {
    key: 'plus',
    name: TIER_NAMES.plus,
    description: 'For power users',
    taskLimit: TIER_LIMITS.plus,
    taskLimitLabel: formatLimit(TIER_LIMITS.plus),
    pricing: {
      monthly: {
        amount: '$9.99',
        priceId: process.env.EXPO_PUBLIC_STRIPE_PLUS_MONTHLY_PRICE_ID ?? '',
      },
      annual: {
        amount: '$99.99',
        priceId: process.env.EXPO_PUBLIC_STRIPE_PLUS_ANNUAL_PRICE_ID ?? '',
        savings: 'Save 17%',
      },
    },
    features: [
      `${TIER_LIMITS.plus} tasks`,
      'Everything in Starter',
      'Custom themes',
      'Data export',
    ],
    popular: true,
  },
  pro: {
    key: 'pro',
    name: TIER_NAMES.pro,
    description: 'For professionals',
    taskLimit: TIER_LIMITS.pro,
    taskLimitLabel: formatLimit(TIER_LIMITS.pro),
    pricing: {
      monthly: {
        amount: '$19.99',
        priceId: process.env.EXPO_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
      },
      annual: {
        amount: '$199.99',
        priceId: process.env.EXPO_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID ?? '',
        savings: 'Save 17%',
      },
    },
    features: [
      'Unlimited tasks',
      'Everything in Plus',
      'Priority support',
      'Early access to new features',
    ],
  },
};

// Paid tiers only (for upgrade UI)
export const PAID_TIERS = [TIERS.starter, TIERS.plus, TIERS.pro] as const;

// Helper to get price ID
export function getPriceId(
  tier: Exclude<TierKey, 'free'>,
  period: 'monthly' | 'annual'
): string {
  return TIERS[tier].pricing?.[period].priceId ?? '';
}
