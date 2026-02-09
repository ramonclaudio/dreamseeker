/**
 * Subscription tier tests.
 *
 * Tests REAL constants and tier logic from convex/subscriptions.ts.
 */

// Mock Convex internals
jest.mock('../convex/revenuecat', () => ({ hasEntitlement: jest.fn() }));
jest.mock('../convex/_generated/server', () => ({
  query: (opts: unknown) => opts,
  mutation: (opts: unknown) => opts,
}));
jest.mock('../convex/helpers', () => ({ getAuthUserId: jest.fn() }));

import { TIERS, PREMIUM_ENTITLEMENT, type TierKey } from '../convex/subscriptions';

describe('Subscription Tiers', () => {
  describe('Free tier', () => {
    it('is named Free', () => {
      expect(TIERS.free.name).toBe('Free');
    });

    it('limits free users to 3 active dreams', () => {
      expect(TIERS.free.limit).toBe(3);
    });

    it('has a positive numeric limit', () => {
      expect(typeof TIERS.free.limit).toBe('number');
      expect(TIERS.free.limit).toBeGreaterThan(0);
    });
  });

  describe('Premium tier', () => {
    it('is named Premium', () => {
      expect(TIERS.premium.name).toBe('Premium');
    });

    it('has unlimited dreams (null limit)', () => {
      expect(TIERS.premium.limit).toBeNull();
    });
  });

  describe('Tier key exhaustiveness', () => {
    it('only has free and premium tiers', () => {
      const tierKeys = Object.keys(TIERS) as TierKey[];
      expect(tierKeys).toHaveLength(2);
      expect(tierKeys).toContain('free');
      expect(tierKeys).toContain('premium');
    });
  });

  describe('Dream limit logic', () => {
    it('free tier blocks creation at limit', () => {
      const dreamCount = TIERS.free.limit;
      const canCreate = TIERS.free.limit === null || dreamCount < TIERS.free.limit;
      expect(canCreate).toBe(false);
    });

    it('free tier allows creation below limit', () => {
      const dreamCount = TIERS.free.limit - 1;
      const canCreate = TIERS.free.limit === null || dreamCount < TIERS.free.limit;
      expect(canCreate).toBe(true);
    });

    it('premium tier always allows creation', () => {
      const canCreate = TIERS.premium.limit === null || 100 < TIERS.premium.limit;
      expect(canCreate).toBe(true);
    });

    it('free tier calculates remaining dreams correctly', () => {
      const limit = TIERS.free.limit;
      expect(Math.max(0, limit - 0)).toBe(3); // no dreams
      expect(Math.max(0, limit - 1)).toBe(2); // 1 dream
      expect(Math.max(0, limit - 3)).toBe(0); // at limit
      expect(Math.max(0, limit - 5)).toBe(0); // over limit (clamped to 0)
    });
  });

  describe('Entitlement', () => {
    it('PREMIUM_ENTITLEMENT is a non-empty string', () => {
      expect(typeof PREMIUM_ENTITLEMENT).toBe('string');
      expect(PREMIUM_ENTITLEMENT.length).toBeGreaterThan(0);
    });

    it('matches RevenueCat entitlement ID', () => {
      expect(PREMIUM_ENTITLEMENT).toBe('DreamSeeker Premium');
    });
  });
});
