/**
 * Centralized env var validation for Convex backend.
 *
 * Component-managed env vars (validated by their respective packages):
 * - BETTER_AUTH_SECRET (@convex-dev/better-auth)
 * - RESEND_API_KEY (@convex-dev/resend)
 */

/* eslint-disable expo/no-dynamic-env-var -- Server-side env validation, not client-side Expo code */
const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;
/* eslint-enable expo/no-dynamic-env-var */

export const env = {
  convexSiteUrl: optional('CONVEX_SITE_URL', ''),
  siteUrl: required('SITE_URL'),
  supportEmail: required('SUPPORT_EMAIL'),
  expo: {
    accessToken: optional('EXPO_ACCESS_TOKEN', ''),
  },
  resend: {
    fromEmail: required('RESEND_FROM_EMAIL'),
    webhookSecret: required('RESEND_WEBHOOK_SECRET'),
    testMode: optional('RESEND_TEST_MODE', 'false') !== 'false',
  },
  revenuecat: {
    webhookBearerToken: required('REVENUECAT_WEBHOOK_BEARER_TOKEN'),
  },
} as const;
