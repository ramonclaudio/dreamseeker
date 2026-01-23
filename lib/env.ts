const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const env = {
  convexUrl: required('EXPO_PUBLIC_CONVEX_URL'),
  convexSiteUrl: required('EXPO_PUBLIC_CONVEX_SITE_URL'),
  siteUrl: required('EXPO_PUBLIC_SITE_URL'),
} as const;
