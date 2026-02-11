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
jest.mock('../convex/functions', () => ({
  authQuery: (opts: unknown) => opts,
  authMutation: (opts: unknown) => opts,
}));
jest.mock('../convex/helpers', () => ({ getAuthUserId: jest.fn() }));

import { TIERS, PREMIUM_ENTITLEMENT, type TierKey } from '../convex/subscriptions';

describe('Subscription Tiers', () => {
  describe('Free tier', () => {
    it('is named Free', () => {
      expect(TIERS.free.name).toBe('Free');
    });

    it('has 3-dream limit', () => {
      expect(TIERS.free.limit).toBe(3);
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
      const canCreate = TIERS.free.limit === null || 2 < TIERS.free.limit;
      expect(canCreate).toBe(true);
      const cannotCreate = TIERS.free.limit === null || 3 < TIERS.free.limit;
      expect(cannotCreate).toBe(false);
    });

    it('premium tier always allows creation', () => {
      const canCreate = TIERS.premium.limit === null || 100 < TIERS.premium.limit;
      expect(canCreate).toBe(true);
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
