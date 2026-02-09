/**
 * Default progress builder tests.
 *
 * Tests the REAL createDefaultProgress function from convex/helpers.ts —
 * the same function used by getOrCreateProgress when initializing a new user.
 */

// Mock Convex internals that helpers.ts transitively imports
jest.mock('../convex/_generated/server', () => ({
  query: (opts: unknown) => opts,
  mutation: (opts: unknown) => opts,
  action: (opts: unknown) => opts,
  internalMutation: (opts: unknown) => opts,
  internalQuery: (opts: unknown) => opts,
  internalAction: (opts: unknown) => opts,
}));
jest.mock('../convex/_generated/api', () => ({ internal: {} }));
jest.mock('../convex/auth', () => ({
  authComponent: { safeGetAuthUser: () => null },
}));
jest.mock('../convex/revenuecat', () => ({
  hasEntitlement: () => false,
}));
jest.mock('../convex/badgeChecks', () => ({
  checkAndAwardBadge: () => ({ xpAwarded: 0 }),
  applyBadgeXp: () => {},
}));
jest.mock('../convex/env', () => ({ env: {} }));

import { createDefaultProgress } from '../convex/helpers';
import { getTodayString } from '../convex/dates';

// ── createDefaultProgress ───────────────────────────────────────────────────

describe('createDefaultProgress', () => {
  it('returns correct defaults with no overrides', () => {
    const result = createDefaultProgress('user_123');
    expect(result).toEqual({
      userId: 'user_123',
      totalXp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: getTodayString('UTC'),
      dreamsCompleted: 0,
      actionsCompleted: 0,
    });
  });

  it('preserves userId regardless of overrides', () => {
    const result = createDefaultProgress('user_abc', { totalXp: 999 });
    expect(result.userId).toBe('user_abc');
  });

  it('applies totalXp override', () => {
    const result = createDefaultProgress('u1', { totalXp: 500 });
    expect(result.totalXp).toBe(500);
  });

  it('applies level override', () => {
    const result = createDefaultProgress('u1', { level: 5 });
    expect(result.level).toBe(5);
  });

  it('applies streak overrides', () => {
    const result = createDefaultProgress('u1', { currentStreak: 7, longestStreak: 14 });
    expect(result.currentStreak).toBe(7);
    expect(result.longestStreak).toBe(14);
  });

  it('applies counter overrides', () => {
    const result = createDefaultProgress('u1', { dreamsCompleted: 3, actionsCompleted: 42 });
    expect(result.dreamsCompleted).toBe(3);
    expect(result.actionsCompleted).toBe(42);
  });

  it('uses timezone override for lastActiveDate', () => {
    const utcResult = createDefaultProgress('u1', { timezone: 'UTC' });
    const tokyoResult = createDefaultProgress('u1', { timezone: 'Asia/Tokyo' });

    // Both should be valid YYYY-MM-DD strings
    expect(utcResult.lastActiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tokyoResult.lastActiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // They use getTodayString with the respective timezone
    expect(utcResult.lastActiveDate).toBe(getTodayString('UTC'));
    expect(tokyoResult.lastActiveDate).toBe(getTodayString('Asia/Tokyo'));
  });

  it('defaults to UTC when no timezone override given', () => {
    const result = createDefaultProgress('u1');
    expect(result.lastActiveDate).toBe(getTodayString('UTC'));
  });

  it('applies all overrides together', () => {
    const result = createDefaultProgress('user_full', {
      totalXp: 1200,
      level: 8,
      currentStreak: 10,
      longestStreak: 30,
      dreamsCompleted: 5,
      actionsCompleted: 100,
      timezone: 'America/New_York',
    });

    expect(result.userId).toBe('user_full');
    expect(result.totalXp).toBe(1200);
    expect(result.level).toBe(8);
    expect(result.currentStreak).toBe(10);
    expect(result.longestStreak).toBe(30);
    expect(result.dreamsCompleted).toBe(5);
    expect(result.actionsCompleted).toBe(100);
    expect(result.lastActiveDate).toBe(getTodayString('America/New_York'));
  });

  it('partial overrides leave other fields at defaults', () => {
    const result = createDefaultProgress('u1', { totalXp: 50 });
    expect(result.totalXp).toBe(50);
    expect(result.level).toBe(1);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.dreamsCompleted).toBe(0);
    expect(result.actionsCompleted).toBe(0);
  });
});
