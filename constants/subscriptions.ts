import { TierKey, TIER_KEYS, TIER_LIMITS, TIER_NAMES, NEXT_TIER } from '../convex/schema/tiers';
import { env, getPriceId, type PaidTier, type BillingPeriod } from '../lib/env';

export type { TierKey, PaidTier, BillingPeriod };
export { TIER_KEYS, NEXT_TIER, getPriceId };

const PRICING: Record<PaidTier, { monthly: number; annual: number }> = {
  starter: { monthly: 4.99, annual: 49.99 },
  plus: { monthly: 9.99, annual: 99.99 },
  pro: { monthly: 19.99, annual: 199.99 },
};

const calcSavings = (monthly: number, annual: number): number =>
  Math.round((1 - annual / (monthly * 12)) * 100);

const formatPrice = (amount: number): string => `$${amount.toFixed(2)}`;
const formatLimit = (limit: number | null): string => limit === null ? 'Unlimited' : `${limit} tasks`;

type TierPricing = {
  monthly: { amount: string; priceId: string };
  annual: { amount: string; priceId: string; savings: string };
};

export type TierConfig = {
  key: TierKey;
  name: string;
  description: string;
  limit: number | null;
  limitLabel: string;
  pricing: TierPricing | null;
  features: string[];
  popular?: boolean;
};

const makePricing = (tier: PaidTier): TierPricing => {
  const { monthly, annual } = PRICING[tier];
  return {
    monthly: { amount: formatPrice(monthly), priceId: env.stripe[tier].monthly },
    annual: { amount: formatPrice(annual), priceId: env.stripe[tier].annual, savings: `Save ${calcSavings(monthly, annual)}%` },
  };
};

export const TIERS: Record<TierKey, TierConfig> = {
  free: {
    key: 'free',
    name: TIER_NAMES.free,
    description: 'Get started with the basics',
    limit: TIER_LIMITS.free,
    limitLabel: formatLimit(TIER_LIMITS.free),
    pricing: null,
    features: [formatLimit(TIER_LIMITS.free), 'Basic task management'],
  },
  starter: {
    key: 'starter',
    name: TIER_NAMES.starter,
    description: 'For personal productivity',
    limit: TIER_LIMITS.starter,
    limitLabel: formatLimit(TIER_LIMITS.starter),
    pricing: makePricing('starter'),
    features: [formatLimit(TIER_LIMITS.starter), 'Task history', 'Email support'],
  },
  plus: {
    key: 'plus',
    name: TIER_NAMES.plus,
    description: 'For power users',
    limit: TIER_LIMITS.plus,
    limitLabel: formatLimit(TIER_LIMITS.plus),
    pricing: makePricing('plus'),
    features: [formatLimit(TIER_LIMITS.plus), 'Everything in Starter', 'Data export'],
    popular: true,
  },
  pro: {
    key: 'pro',
    name: TIER_NAMES.pro,
    description: 'For professionals',
    limit: TIER_LIMITS.pro,
    limitLabel: formatLimit(TIER_LIMITS.pro),
    pricing: makePricing('pro'),
    features: [formatLimit(TIER_LIMITS.pro), 'Everything in Plus', 'Early access to new features'],
  },
};

export const PAID_TIERS = [TIERS.starter, TIERS.plus, TIERS.pro] as const;
