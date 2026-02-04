const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const optional = (key: string): string | undefined => process.env[key];

export const env = {
  convexUrl: required('EXPO_PUBLIC_CONVEX_URL'),
  convexSiteUrl: required('EXPO_PUBLIC_CONVEX_SITE_URL'),
  siteUrl: required('EXPO_PUBLIC_SITE_URL'),
  revenuecatAppleApiKey: optional('EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY'),
  revenuecatGoogleApiKey: optional('EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY'),
} as const;
