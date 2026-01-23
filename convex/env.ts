/**
 * Centralized env var validation for Convex backend.
 *
 * Component-managed env vars (validated by their respective packages):
 * - BETTER_AUTH_SECRET (@convex-dev/better-auth)
 * - RESEND_API_KEY (@convex-dev/resend)
 */

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

export const env = {
  siteUrl: required('SITE_URL'),
  supportEmail: required('SUPPORT_EMAIL'),
  expo: {
    accessToken: required('EXPO_ACCESS_TOKEN'),
  },
  apple: {
    clientId: optional('APPLE_CLIENT_ID', ''),
    clientSecret: optional('APPLE_CLIENT_SECRET', ''),
  },
  resend: {
    fromEmail: required('RESEND_FROM_EMAIL'),
    webhookSecret: required('RESEND_WEBHOOK_SECRET'),
    testMode: optional('RESEND_TEST_MODE', 'false') !== 'false',
  },
} as const;
