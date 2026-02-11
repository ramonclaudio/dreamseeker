/**
 * Pin and vision board constant tests.
 *
 * Validates the limits, validators, and rate-limit configs
 * introduced with the community boards feature.
 */

jest.mock('convex/values', () => {
  const stub = () => ({});
  return {
    v: {
      union: (...args: unknown[]) => ({ kind: 'union', members: args }),
      literal: (val: string) => ({ kind: 'literal', value: val }),
      string: stub,
      number: stub,
      boolean: stub,
      null_: stub,
      optional: stub,
      array: stub,
      object: stub,
      id: stub,
    },
  };
});

import {
  PIN_TITLE_MAX,
  PIN_DESC_MAX,
  PIN_URL_MAX,
  PIN_PAGE_SIZE,
  PIN_TAGS_MAX,
  PIN_TAG_LENGTH_MAX,
  BOARD_NAME_MAX,
  MAX_BOARDS,
  FREE_MAX_PINS,
  FREE_MAX_COMMUNITY_PINS,
  COMMUNITY_RATE_LIMITS,
  DREAM_CATEGORY_LIST,
} from '../convex/constants';

// ── Pin Limits ──────────────────────────────────────────────────────────────

describe('Pin constants', () => {
  it('PIN_TITLE_MAX is a reasonable title length', () => {
    expect(PIN_TITLE_MAX).toBe(200);
    expect(PIN_TITLE_MAX).toBeGreaterThan(0);
  });

  it('PIN_DESC_MAX accommodates meaningful descriptions', () => {
    expect(PIN_DESC_MAX).toBe(500);
    expect(PIN_DESC_MAX).toBeGreaterThan(PIN_TITLE_MAX);
  });

  it('PIN_URL_MAX accommodates long URLs without being excessive', () => {
    expect(PIN_URL_MAX).toBe(2000);
    expect(PIN_URL_MAX).toBeGreaterThanOrEqual(2000); // Common URL max
    expect(PIN_URL_MAX).toBeLessThanOrEqual(8000); // Not absurdly long
  });

  it('PIN_PAGE_SIZE is a reasonable page size', () => {
    expect(PIN_PAGE_SIZE).toBe(20);
    expect(PIN_PAGE_SIZE).toBeGreaterThan(0);
    expect(PIN_PAGE_SIZE).toBeLessThanOrEqual(100);
  });

  it('PIN_TAGS_MAX limits tags to a reasonable count', () => {
    expect(PIN_TAGS_MAX).toBe(5);
  });

  it('PIN_TAG_LENGTH_MAX limits individual tag length', () => {
    expect(PIN_TAG_LENGTH_MAX).toBe(30);
    expect(PIN_TAG_LENGTH_MAX).toBeGreaterThan(0);
  });
});

// ── Board Limits ────────────────────────────────────────────────────────────

describe('Board constants', () => {
  it('BOARD_NAME_MAX is a reasonable name length', () => {
    expect(BOARD_NAME_MAX).toBe(50);
    expect(BOARD_NAME_MAX).toBeGreaterThan(0);
  });

  it('MAX_BOARDS limits board count to prevent abuse', () => {
    expect(MAX_BOARDS).toBe(10);
    expect(MAX_BOARDS).toBeGreaterThan(0);
  });
});

// ── Free Tier Limits ────────────────────────────────────────────────────────

describe('Free tier pin limits', () => {
  it('FREE_MAX_PINS allows a reasonable number of pins', () => {
    expect(FREE_MAX_PINS).toBe(5);
    expect(FREE_MAX_PINS).toBeGreaterThan(0);
  });

  it('FREE_MAX_COMMUNITY_PINS is zero for free tier', () => {
    expect(FREE_MAX_COMMUNITY_PINS).toBe(0);
  });
});

// ── Rate Limits ─────────────────────────────────────────────────────────────

describe('Community rate limits', () => {
  it('defines rate limits for all community actions', () => {
    expect(COMMUNITY_RATE_LIMITS.profile_update).toBeDefined();
    expect(COMMUNITY_RATE_LIMITS.pin_create).toBeDefined();
    expect(COMMUNITY_RATE_LIMITS.report_pin).toBeDefined();
  });

  it('profile_update: 10 per minute', () => {
    expect(COMMUNITY_RATE_LIMITS.profile_update.max).toBe(10);
    expect(COMMUNITY_RATE_LIMITS.profile_update.windowMs).toBe(60 * 1000);
  });

  it('pin_create: 30 per hour', () => {
    expect(COMMUNITY_RATE_LIMITS.pin_create.max).toBe(30);
    expect(COMMUNITY_RATE_LIMITS.pin_create.windowMs).toBe(60 * 60 * 1000);
  });

  it('report_pin: 10 per hour', () => {
    expect(COMMUNITY_RATE_LIMITS.report_pin.max).toBe(10);
    expect(COMMUNITY_RATE_LIMITS.report_pin.windowMs).toBe(60 * 60 * 1000);
  });

  it('all windows are positive numbers', () => {
    for (const [, config] of Object.entries(COMMUNITY_RATE_LIMITS)) {
      expect(config.max).toBeGreaterThan(0);
      expect(config.windowMs).toBeGreaterThan(0);
    }
  });
});

// ── Category Validator ──────────────────────────────────────────────────────

describe('Dream category list', () => {
  it('includes all expected categories', () => {
    expect(DREAM_CATEGORY_LIST).toContain('travel');
    expect(DREAM_CATEGORY_LIST).toContain('money');
    expect(DREAM_CATEGORY_LIST).toContain('career');
    expect(DREAM_CATEGORY_LIST).toContain('lifestyle');
    expect(DREAM_CATEGORY_LIST).toContain('growth');
    expect(DREAM_CATEGORY_LIST).toContain('relationships');
    expect(DREAM_CATEGORY_LIST).toContain('custom');
  });

  it('has exactly 11 categories', () => {
    expect(DREAM_CATEGORY_LIST).toHaveLength(11);
  });

  it('has no duplicates', () => {
    const unique = new Set(DREAM_CATEGORY_LIST);
    expect(unique.size).toBe(DREAM_CATEGORY_LIST.length);
  });
});
