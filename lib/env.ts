/* eslint-disable expo/no-dynamic-env-var -- Env vars are validated at startup, keys are hardcoded below */
const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const optional = (key: string): string | undefined => process.env[key];
/* eslint-enable expo/no-dynamic-env-var */

export const env = {
  convexUrl: required('EXPO_PUBLIC_CONVEX_URL'),
  convexSiteUrl: required('EXPO_PUBLIC_CONVEX_SITE_URL'),
  siteUrl: required('EXPO_PUBLIC_SITE_URL'),
  revenuecatAppleApiKey: optional('EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY'),
} as const;
