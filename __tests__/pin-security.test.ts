/**
 * Pin, pinReports, and blockedUsers RLS tests.
 *
 * Extends the existing RLS test coverage to the tables added
 * with the community boards feature.
 */

import type { Id } from '../convex/_generated/dataModel';
import { rules } from '../convex/security';

const USER_A = 'user-alice';
const USER_B = 'user-bob';

// ── pins ────────────────────────────────────────────────────────────────────

describe('pins RLS', () => {
  const pin = {
    userId: USER_A,
    type: 'image' as const,
    isPersonalOnly: false,
    createdAt: Date.now(),
    _id: 'pin-1' as never,
    _creationTime: Date.now(),
  };

  it('allows anyone to read any pin (public visibility)', async () => {
    expect(await rules.pins!.read!({ user: USER_A }, pin)).toBe(true);
    expect(await rules.pins!.read!({ user: USER_B }, pin)).toBe(true);
    expect(await rules.pins!.read!({ user: '' }, pin)).toBe(true);
  });

  it('allows owner to modify own pin', async () => {
    expect(await rules.pins!.modify!({ user: USER_A }, pin)).toBe(true);
  });

  it('denies non-owner from modifying pin', async () => {
    expect(await rules.pins!.modify!({ user: USER_B }, pin)).toBe(false);
  });

  it('allows owner to insert pin', async () => {
    expect(await rules.pins!.insert!({ user: USER_A }, pin)).toBe(true);
  });

  it('denies non-owner from inserting pin for another user', async () => {
    expect(await rules.pins!.insert!({ user: USER_B }, pin)).toBe(false);
  });
});

// ── pinReports ──────────────────────────────────────────────────────────────

describe('pinReports RLS', () => {
  const report = {
    pinId: 'pin-1' as Id<'pins'>,
    reporterId: USER_A,
    createdAt: Date.now(),
    _id: 'report-1' as never,
    _creationTime: Date.now(),
  };

  it('allows reporter to read own report', async () => {
    expect(await rules.pinReports!.read!({ user: USER_A }, report)).toBe(true);
  });

  it('denies non-reporter from reading report', async () => {
    expect(await rules.pinReports!.read!({ user: USER_B }, report)).toBe(false);
  });

  it('allows reporter to insert own report', async () => {
    expect(await rules.pinReports!.insert!({ user: USER_A }, report)).toBe(true);
  });

  it('denies inserting report as another user', async () => {
    expect(await rules.pinReports!.insert!({ user: USER_B }, report)).toBe(false);
  });

  it('allows reporter to modify own report', async () => {
    expect(await rules.pinReports!.modify!({ user: USER_A }, report)).toBe(true);
  });

  it('denies non-reporter from modifying report', async () => {
    expect(await rules.pinReports!.modify!({ user: USER_B }, report)).toBe(false);
  });
});

// ── blockedUsers ────────────────────────────────────────────────────────────

describe('blockedUsers RLS', () => {
  const block = {
    blockerId: USER_A,
    blockedId: USER_B,
    createdAt: Date.now(),
    _id: 'block-1' as never,
    _creationTime: Date.now(),
  };

  it('allows blocker to read own block record', async () => {
    expect(await rules.blockedUsers!.read!({ user: USER_A }, block)).toBe(true);
  });

  it('denies blocked user from reading block record', async () => {
    expect(await rules.blockedUsers!.read!({ user: USER_B }, block)).toBe(false);
  });

  it('allows blocker to insert block', async () => {
    expect(await rules.blockedUsers!.insert!({ user: USER_A }, block)).toBe(true);
  });

  it('denies inserting block as another user', async () => {
    expect(await rules.blockedUsers!.insert!({ user: USER_B }, block)).toBe(false);
  });

  it('allows blocker to modify own block', async () => {
    expect(await rules.blockedUsers!.modify!({ user: USER_A }, block)).toBe(true);
  });

  it('denies non-blocker from modifying block', async () => {
    expect(await rules.blockedUsers!.modify!({ user: USER_B }, block)).toBe(false);
  });
});

// ── visionBoards ────────────────────────────────────────────────────────────

describe('visionBoards RLS', () => {
  const board = {
    userId: USER_A,
    name: 'Travel Goals',
    order: 0,
    createdAt: Date.now(),
    _id: 'board-1' as never,
    _creationTime: Date.now(),
  };

  it('allows owner to read own board', async () => {
    expect(await rules.visionBoards!.read!({ user: USER_A }, board)).toBe(true);
  });

  it('denies non-owner from reading board', async () => {
    expect(await rules.visionBoards!.read!({ user: USER_B }, board)).toBe(false);
  });

  it('allows owner to modify own board', async () => {
    expect(await rules.visionBoards!.modify!({ user: USER_A }, board)).toBe(true);
  });

  it('denies non-owner from modifying board', async () => {
    expect(await rules.visionBoards!.modify!({ user: USER_B }, board)).toBe(false);
  });
});
