/**
 * Row-Level Security rule tests.
 *
 * These test the actual rule functions from convex/security.ts.
 * The rules are async functions that take a context ({user}) and a document,
 * returning true/false for access control.
 *
 * Critical for community features where access patterns vary by table:
 * - feedReactions: anyone can read, only owner can modify/insert
 * - userProfiles: public profiles readable by anyone, private only by owner
 * - friendships: readable by both sides, modifiable only by creator
 * - friendRequests: readable by both parties, insertable only by sender
 */
import { rules } from '../convex/security';

const USER_A = 'user-alice';
const USER_B = 'user-bob';

// ── feedReactions ─────────────────────────────────────────────────────────

describe('feedReactions RLS', () => {
  const reactionDoc = {
    feedEventId: 'event-1' as never,
    userId: USER_A,
    emoji: 'fire' as const,
    createdAt: Date.now(),
    _id: 'reaction-1' as never,
    _creationTime: Date.now(),
  };

  it('allows any authenticated user to read reactions', async () => {
    expect(await rules.feedReactions!.read!({ user: USER_A }, reactionDoc)).toBe(true);
    expect(await rules.feedReactions!.read!({ user: USER_B }, reactionDoc)).toBe(true);
  });

  it('allows owner to modify their reaction', async () => {
    expect(await rules.feedReactions!.modify!({ user: USER_A }, reactionDoc)).toBe(true);
  });

  it('denies non-owner from modifying reaction', async () => {
    expect(await rules.feedReactions!.modify!({ user: USER_B }, reactionDoc)).toBe(false);
  });

  it('allows owner to insert their reaction', async () => {
    expect(await rules.feedReactions!.insert!({ user: USER_A }, reactionDoc)).toBe(true);
  });

  it('denies inserting reaction for another user', async () => {
    expect(await rules.feedReactions!.insert!({ user: USER_B }, reactionDoc)).toBe(false);
  });
});

// ── userProfiles ──────────────────────────────────────────────────────────

describe('userProfiles RLS', () => {
  const publicProfile = {
    userId: USER_A,
    username: 'alice',
    isPublic: true,
    createdAt: Date.now(),
    _id: 'profile-1' as never,
    _creationTime: Date.now(),
  };

  const privateProfile = {
    ...publicProfile,
    isPublic: false,
  };

  it('allows owner to read own profile regardless of visibility', async () => {
    expect(await rules.userProfiles!.read!({ user: USER_A }, publicProfile)).toBe(true);
    expect(await rules.userProfiles!.read!({ user: USER_A }, privateProfile)).toBe(true);
  });

  it('allows anyone to read public profiles', async () => {
    expect(await rules.userProfiles!.read!({ user: USER_B }, publicProfile)).toBe(true);
  });

  it('denies non-owner from reading private profiles', async () => {
    expect(await rules.userProfiles!.read!({ user: USER_B }, privateProfile)).toBe(false);
  });

  it('allows owner to modify own profile', async () => {
    expect(await rules.userProfiles!.modify!({ user: USER_A }, publicProfile)).toBe(true);
  });

  it('denies non-owner from modifying profile', async () => {
    expect(await rules.userProfiles!.modify!({ user: USER_B }, publicProfile)).toBe(false);
  });
});

// ── friendships ───────────────────────────────────────────────────────────

describe('friendships RLS', () => {
  const friendship = {
    userId: USER_A,
    friendId: USER_B,
    createdAt: Date.now(),
    _id: 'friendship-1' as never,
    _creationTime: Date.now(),
  };

  it('allows the creator to read', async () => {
    expect(await rules.friendships!.read!({ user: USER_A }, friendship)).toBe(true);
  });

  it('allows the friend to read', async () => {
    expect(await rules.friendships!.read!({ user: USER_B }, friendship)).toBe(true);
  });

  it('denies unrelated user from reading', async () => {
    expect(await rules.friendships!.read!({ user: 'user-charlie' }, friendship)).toBe(false);
  });

  it('allows creator to modify', async () => {
    expect(await rules.friendships!.modify!({ user: USER_A }, friendship)).toBe(true);
  });

  it('denies friend from modifying (only creator can)', async () => {
    expect(await rules.friendships!.modify!({ user: USER_B }, friendship)).toBe(false);
  });
});

// ── friendRequests ────────────────────────────────────────────────────────

describe('friendRequests RLS', () => {
  const request = {
    fromUserId: USER_A,
    toUserId: USER_B,
    status: 'pending' as const,
    createdAt: Date.now(),
    _id: 'request-1' as never,
    _creationTime: Date.now(),
  };

  it('allows sender to read', async () => {
    expect(await rules.friendRequests!.read!({ user: USER_A }, request)).toBe(true);
  });

  it('allows recipient to read', async () => {
    expect(await rules.friendRequests!.read!({ user: USER_B }, request)).toBe(true);
  });

  it('denies unrelated user from reading', async () => {
    expect(await rules.friendRequests!.read!({ user: 'user-charlie' }, request)).toBe(false);
  });

  it('allows sender to modify (cancel)', async () => {
    expect(await rules.friendRequests!.modify!({ user: USER_A }, request)).toBe(true);
  });

  it('allows recipient to modify (accept/reject)', async () => {
    expect(await rules.friendRequests!.modify!({ user: USER_B }, request)).toBe(true);
  });

  it('denies unrelated user from modifying', async () => {
    expect(await rules.friendRequests!.modify!({ user: 'user-charlie' }, request)).toBe(false);
  });

  it('allows only sender to insert', async () => {
    expect(await rules.friendRequests!.insert!({ user: USER_A }, request)).toBe(true);
  });

  it('denies recipient from inserting (they didnt send it)', async () => {
    expect(await rules.friendRequests!.insert!({ user: USER_B }, request)).toBe(false);
  });
});

// ── activityFeed ──────────────────────────────────────────────────────────

describe('activityFeed RLS', () => {
  const event = {
    userId: USER_A,
    type: 'level_up' as const,
    createdAt: Date.now(),
    _id: 'event-1' as never,
    _creationTime: Date.now(),
  };

  it('allows owner to read own events', async () => {
    expect(await rules.activityFeed!.read!({ user: USER_A }, event)).toBe(true);
  });

  it('denies non-owner from reading events directly', async () => {
    // Feed query uses unsafeDb to aggregate friend events — RLS on the
    // raw table correctly restricts direct access to own events only
    expect(await rules.activityFeed!.read!({ user: USER_B }, event)).toBe(false);
  });

  it('allows owner to insert own events', async () => {
    expect(await rules.activityFeed!.insert!({ user: USER_A }, event)).toBe(true);
  });

  it('denies inserting events for another user', async () => {
    expect(await rules.activityFeed!.insert!({ user: USER_B }, event)).toBe(false);
  });
});

// ── System tables ─────────────────────────────────────────────────────────

describe('System table RLS', () => {
  it('allows anyone to read dailyChallenges', async () => {
    const doc = { _id: 'c1' as never, _creationTime: 0, title: '', description: '', category: '', xpReward: 0, isActive: true };
    expect(await rules.dailyChallenges!.read!({ user: '' }, doc)).toBe(true);
  });

  it('allows anyone to read mindsetMoments', async () => {
    const doc = { _id: 'm1' as never, _creationTime: 0, quote: '', author: '' };
    expect(await rules.mindsetMoments!.read!({ user: '' }, doc)).toBe(true);
  });

  it('allows anyone to read badgeDefinitions', async () => {
    const doc = { _id: 'b1' as never, _creationTime: 0, key: '', title: '', description: '', icon: '', category: '', xpReward: 0 };
    expect(await rules.badgeDefinitions!.read!({ user: '' }, doc)).toBe(true);
  });

  it('does not define modify/insert for system tables (deny by default)', () => {
    expect(rules.dailyChallenges!.modify).toBeUndefined();
    expect(rules.dailyChallenges!.insert).toBeUndefined();
    expect(rules.mindsetMoments!.modify).toBeUndefined();
    expect(rules.mindsetMoments!.insert).toBeUndefined();
    expect(rules.badgeDefinitions!.modify).toBeUndefined();
    expect(rules.badgeDefinitions!.insert).toBeUndefined();
  });
});
