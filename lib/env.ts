const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const env = {
  convexUrl: required('EXPO_PUBLIC_CONVEX_URL'),
  convexSiteUrl: required('EXPO_PUBLIC_CONVEX_SITE_URL'),
  siteUrl: required('EXPO_PUBLIC_SITE_URL'),
  stripePublishableKey: required('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  stripe: {
    starter: {
      monthly: required('EXPO_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID'),
      annual: required('EXPO_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID'),
    },
    plus: {
      monthly: required('EXPO_PUBLIC_STRIPE_PLUS_MONTHLY_PRICE_ID'),
      annual: required('EXPO_PUBLIC_STRIPE_PLUS_ANNUAL_PRICE_ID'),
    },
    pro: {
      monthly: required('EXPO_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID'),
      annual: required('EXPO_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID'),
    },
  },
} as const;

export type PaidTier = keyof typeof env.stripe;
export type BillingPeriod = 'monthly' | 'annual';

export const getPriceId = (tier: PaidTier, period: BillingPeriod): string =>
  env.stripe[tier][period];
