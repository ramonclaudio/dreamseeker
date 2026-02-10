describe('Environment validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('throws when EXPO_PUBLIC_CONVEX_URL is missing', () => {
    delete process.env.EXPO_PUBLIC_CONVEX_URL;
    process.env.EXPO_PUBLIC_CONVEX_SITE_URL = 'https://site.convex.cloud';
    process.env.EXPO_PUBLIC_SITE_URL = 'https://example.com';

    expect(() => require('@/lib/env')).toThrow('Missing required env var: EXPO_PUBLIC_CONVEX_URL');
  });

  it('throws when EXPO_PUBLIC_CONVEX_SITE_URL is missing', () => {
    process.env.EXPO_PUBLIC_CONVEX_URL = 'https://convex.cloud';
    delete process.env.EXPO_PUBLIC_CONVEX_SITE_URL;
    process.env.EXPO_PUBLIC_SITE_URL = 'https://example.com';

    expect(() => require('@/lib/env')).toThrow('Missing required env var: EXPO_PUBLIC_CONVEX_SITE_URL');
  });

  it('throws when EXPO_PUBLIC_SITE_URL is missing', () => {
    process.env.EXPO_PUBLIC_CONVEX_URL = 'https://convex.cloud';
    process.env.EXPO_PUBLIC_CONVEX_SITE_URL = 'https://site.convex.cloud';
    delete process.env.EXPO_PUBLIC_SITE_URL;

    expect(() => require('@/lib/env')).toThrow('Missing required env var: EXPO_PUBLIC_SITE_URL');
  });

  it('exports all required env vars when present', () => {
    process.env.EXPO_PUBLIC_CONVEX_URL = 'https://convex.cloud';
    process.env.EXPO_PUBLIC_CONVEX_SITE_URL = 'https://site.convex.cloud';
    process.env.EXPO_PUBLIC_SITE_URL = 'https://example.com';

    const { env } = require('@/lib/env');
    expect(env.convexUrl).toBe('https://convex.cloud');
    expect(env.convexSiteUrl).toBe('https://site.convex.cloud');
    expect(env.siteUrl).toBe('https://example.com');
  });

  it('optional env vars are undefined when not set', () => {
    process.env.EXPO_PUBLIC_CONVEX_URL = 'https://convex.cloud';
    process.env.EXPO_PUBLIC_CONVEX_SITE_URL = 'https://site.convex.cloud';
    process.env.EXPO_PUBLIC_SITE_URL = 'https://example.com';
    delete process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY;

    const { env } = require('@/lib/env');
    expect(env.revenuecatAppleApiKey).toBeUndefined();
  });

  it('optional env vars pass through when set', () => {
    process.env.EXPO_PUBLIC_CONVEX_URL = 'https://convex.cloud';
    process.env.EXPO_PUBLIC_CONVEX_SITE_URL = 'https://site.convex.cloud';
    process.env.EXPO_PUBLIC_SITE_URL = 'https://example.com';
    process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY = 'apple_key_123';

    const { env } = require('@/lib/env');
    expect(env.revenuecatAppleApiKey).toBe('apple_key_123');
  });

  it('treats empty string as missing for required vars', () => {
    process.env.EXPO_PUBLIC_CONVEX_URL = '';
    process.env.EXPO_PUBLIC_CONVEX_SITE_URL = 'https://site.convex.cloud';
    process.env.EXPO_PUBLIC_SITE_URL = 'https://example.com';

    expect(() => require('@/lib/env')).toThrow('Missing required env var: EXPO_PUBLIC_CONVEX_URL');
  });
});
