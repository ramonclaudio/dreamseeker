import { v } from 'convex/values';
import { authQuery, authMutation } from './functions';
import { hasEntitlement } from './revenuecat';
import { PREMIUM_ENTITLEMENT } from './subscriptions';

// ── Mutations ───────────────────────────────────────────────────────────────

export const sendRequest = authMutation({
  args: { toUserId: v.string() },
  handler: async (ctx, args) => {
    if (ctx.user === args.toUserId) throw new Error('Cannot send request to yourself');

    const isPremium = await hasEntitlement(ctx, { appUserId: ctx.user, entitlementId: PREMIUM_ENTITLEMENT });
    if (!isPremium) throw new Error('PREMIUM_REQUIRED');

    // Target must have a public profile
    const targetProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', args.toUserId))
      .first();
    if (!targetProfile?.isPublic) throw new Error('User not found');

    // No existing friendship in either direction
    const existingFriendship = await ctx.db
      .query('friendships')
      .withIndex('by_pair', (q) => q.eq('userId', ctx.user).eq('friendId', args.toUserId))
      .first();
    if (existingFriendship) throw new Error('Already friends');

    const reverseFriendship = await ctx.db
      .query('friendships')
      .withIndex('by_pair', (q) => q.eq('userId', args.toUserId).eq('friendId', ctx.user))
      .first();
    if (reverseFriendship) throw new Error('Already friends');

    // No pending request in either direction
    const outgoing = await ctx.db
      .query('friendRequests')
      .withIndex('by_pair', (q) => q.eq('fromUserId', ctx.user).eq('toUserId', args.toUserId))
      .first();
    if (outgoing?.status === 'pending') throw new Error('Request already sent');

    const incoming = await ctx.db
      .query('friendRequests')
      .withIndex('by_pair', (q) => q.eq('fromUserId', args.toUserId).eq('toUserId', ctx.user))
      .first();
    if (incoming?.status === 'pending') throw new Error('This user already sent you a request');

    await ctx.db.insert('friendRequests', {
      fromUserId: ctx.user,
      toUserId: args.toUserId,
      status: 'pending',
      createdAt: Date.now(),
    });
  },
});

export const respondToRequest = authMutation({
  args: { requestId: v.id('friendRequests'), accept: v.boolean() },
  handler: async (ctx, args) => {
    const request = await ctx.unsafeDb.get('friendRequests', args.requestId);
    if (!request) throw new Error('Request not found');
    if (request.toUserId !== ctx.user) throw new Error('Forbidden');
    if (request.status !== 'pending') throw new Error('Request is no longer pending');

    const now = Date.now();

    if (args.accept) {
      await ctx.unsafeDb.patch(args.requestId, { status: 'accepted', respondedAt: now });
      await ctx.unsafeDb.insert('friendships', {
        userId: request.fromUserId,
        friendId: request.toUserId,
        createdAt: now,
      });
      await ctx.unsafeDb.insert('friendships', {
        userId: request.toUserId,
        friendId: request.fromUserId,
        createdAt: now,
      });
    } else {
      await ctx.unsafeDb.patch(args.requestId, { status: 'rejected', respondedAt: now });
    }
  },
});

export const cancelRequest = authMutation({
  args: { requestId: v.id('friendRequests') },
  handler: async (ctx, args) => {
    const request = await ctx.db.get('friendRequests', args.requestId);
    if (!request) throw new Error('Request not found');
    if (request.fromUserId !== ctx.user) throw new Error('Forbidden');
    if (request.status !== 'pending') throw new Error('Request is no longer pending');

    await ctx.db.delete(args.requestId);
  },
});

export const unfriend = authMutation({
  args: { friendId: v.string() },
  handler: async (ctx, args) => {
    const forward = await ctx.unsafeDb
      .query('friendships')
      .withIndex('by_pair', (q) => q.eq('userId', ctx.user).eq('friendId', args.friendId))
      .first();
    if (forward) await ctx.unsafeDb.delete(forward._id);

    const reverse = await ctx.unsafeDb
      .query('friendships')
      .withIndex('by_pair', (q) => q.eq('userId', args.friendId).eq('friendId', ctx.user))
      .first();
    if (reverse) await ctx.unsafeDb.delete(reverse._id);
  },
});

// ── Queries ─────────────────────────────────────────────────────────────────

export const listFriends = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return [];

    const friendships = await ctx.db
      .query('friendships')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user!))
      .collect();

    return await Promise.all(
      friendships.map(async (f) => {
        const profile = await ctx.unsafeDb
          .query('userProfiles')
          .withIndex('by_user', (q) => q.eq('userId', f.friendId))
          .first();

        return {
          friendshipId: f._id,
          friendId: f.friendId,
          profile: profile
            ? {
                username: profile.username,
                displayName: profile.displayName,
                bio: profile.bio,
                isPublic: profile.isPublic,
              }
            : null,
          createdAt: f.createdAt,
        };
      })
    );
  },
});

export const listIncomingRequests = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return [];

    const requests = await ctx.db
      .query('friendRequests')
      .withIndex('by_to_status', (q) => q.eq('toUserId', ctx.user!).eq('status', 'pending'))
      .collect();

    return await Promise.all(
      requests.map(async (r) => {
        const profile = await ctx.unsafeDb
          .query('userProfiles')
          .withIndex('by_user', (q) => q.eq('userId', r.fromUserId))
          .first();

        return {
          requestId: r._id,
          fromUserId: r.fromUserId,
          profile: profile
            ? { username: profile.username, displayName: profile.displayName }
            : null,
          createdAt: r.createdAt,
        };
      })
    );
  },
});

export const listOutgoingRequests = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return [];

    const allRequests = await ctx.db
      .query('friendRequests')
      .withIndex('by_from', (q) => q.eq('fromUserId', ctx.user!))
      .collect();
    const requests = allRequests.filter((r) => r.status === 'pending');

    return await Promise.all(
      requests.map(async (r) => {
        const profile = await ctx.unsafeDb
          .query('userProfiles')
          .withIndex('by_user', (q) => q.eq('userId', r.toUserId))
          .first();

        return {
          requestId: r._id,
          toUserId: r.toUserId,
          profile: profile
            ? { username: profile.username, displayName: profile.displayName }
            : null,
          createdAt: r.createdAt,
        };
      })
    );
  },
});

export const getFriendCount = authQuery({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!ctx.user) return 0;

    const targetUserId = args.userId ?? ctx.user;
    const friendships = await ctx.unsafeDb
      .query('friendships')
      .withIndex('by_user', (q) => q.eq('userId', targetUserId))
      .collect();

    return friendships.length;
  },
});

export const getPendingCount = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return 0;

    const pending = await ctx.db
      .query('friendRequests')
      .withIndex('by_to_status', (q) => q.eq('toUserId', ctx.user!).eq('status', 'pending'))
      .collect();

    return pending.length;
  },
});
