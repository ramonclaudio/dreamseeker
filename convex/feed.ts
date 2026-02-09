import type { MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { authQuery, authMutation } from './functions';
import { FEED_PAGE_SIZE, FEED_FRIENDS_RECENT_LIMIT } from './constants';
import type { FeedEventType, FeedMetadata } from './constants';
import { hasEntitlement } from './revenuecat';
import { PREMIUM_ENTITLEMENT } from './subscriptions';

// ── Feed Query ──────────────────────────────────────────────────────────────

export const getFriendFeed = authQuery({
  args: {
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!ctx.user) return { events: [], nextCursor: null };

    const friendships = await ctx.db
      .query('friendships')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user!))
      .collect();

    if (friendships.length === 0) return { events: [], nextCursor: null };

    const friendIds = friendships.map((f) => f.friendId);

    // Check which friends have hideAll enabled
    const friendProfiles = await Promise.all(
      friendIds.map((id) =>
        ctx.unsafeDb.query('userProfiles').withIndex('by_user', (q) => q.eq('userId', id)).first()
      )
    );
    // Build per-friend profile map for visibility defaults
    const profileMap = new Map<string, NonNullable<typeof friendProfiles[number]>>();
    const visibleFriendIds: string[] = [];
    for (let i = 0; i < friendIds.length; i++) {
      const p = friendProfiles[i];
      if (p?.hideAll) continue;
      visibleFriendIds.push(friendIds[i]);
      if (p) profileMap.set(friendIds[i], p);
    }

    // Build per-friend hidden item/category sets
    const friendHiddenMap = new Map<string, { ids: Set<string>; categories: Set<string> }>();
    await Promise.all(
      visibleFriendIds.map(async (friendId) => {
        const items = await ctx.unsafeDb
          .query('hiddenItems')
          .withIndex('by_user', (q) => q.eq('userId', friendId))
          .collect();
        const ids = new Set<string>();
        const categories = new Set<string>();
        for (const item of items) {
          if (item.itemId.startsWith('category:')) {
            categories.add(item.itemId.replace('category:', ''));
          } else {
            ids.add(item.itemId);
          }
        }
        friendHiddenMap.set(friendId, { ids, categories });
      })
    );

    // Gather recent events from each visible friend
    const allEvents = (
      await Promise.all(
        visibleFriendIds.map(async (friendId) => {
          const events = await ctx.unsafeDb
            .query('activityFeed')
            .withIndex('by_user_created', (idx) => idx.eq('userId', friendId))
            .order('desc')
            .take(FEED_FRIENDS_RECENT_LIMIT);
          return events;
        })
      )
    ).flat();

    // Apply cursor filter
    const filtered = args.cursor
      ? allEvents.filter((e) => e.createdAt < args.cursor!)
      : allEvents;

    // Sort merged events descending by createdAt
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    const pageSize = args.limit ?? FEED_PAGE_SIZE;
    const page = filtered.slice(0, pageSize);

    const DREAM_TYPES = new Set(['dream_created', 'dream_completed']);
    const JOURNAL_TYPES = new Set(['journal_entry']);
    const ACTION_TYPES = new Set(['action_completed']);

    const visible = page.filter((e) => {
      // Respect profile-level default hide settings
      const profile = profileMap.get(e.userId);
      if (profile) {
        if (profile.defaultHideDreams && DREAM_TYPES.has(e.type)) return false;
        if (profile.defaultHideJournals && JOURNAL_TYPES.has(e.type)) return false;
        if (profile.defaultHideActions && ACTION_TYPES.has(e.type)) return false;
      }

      // Respect per-item/category hiding
      const hidden = friendHiddenMap.get(e.userId);
      if (!hidden) return true;
      if (e.referenceId && hidden.ids.has(e.referenceId)) return false;
      const meta = e.metadata as Record<string, unknown> | undefined;
      if (meta?.category && typeof meta.category === 'string' && hidden.categories.has(meta.category)) return false;
      return true;
    });

    // Attach profile info for each event
    const profileCache = new Map<string, { username: string; displayName?: string }>();

    const events = await Promise.all(
      visible.map(async (event) => {
        let profile = profileCache.get(event.userId);
        if (!profile) {
          const p = await ctx.unsafeDb
            .query('userProfiles')
            .withIndex('by_user', (q) => q.eq('userId', event.userId))
            .first();
          profile = p
            ? { username: p.username, displayName: p.displayName }
            : { username: 'unknown' };
          profileCache.set(event.userId, profile);
        }

        return {
          _id: event._id,
          userId: event.userId,
          type: event.type,
          referenceId: event.referenceId,
          metadata: event.metadata,
          createdAt: event.createdAt,
          username: profile.username,
          displayName: profile.displayName,
        };
      })
    );

    const nextCursor = events.length > 0 ? events[events.length - 1].createdAt : null;

    return { events, nextCursor };
  },
});

// ── Reactions ────────────────────────────────────────────────────────────────

export const toggleReaction = authMutation({
  args: {
    feedEventId: v.id('activityFeed'),
    emoji: v.union(v.literal('fire'), v.literal('heart'), v.literal('clap')),
  },
  handler: async (ctx, args) => {
    const isPremium = await hasEntitlement(ctx, {
      appUserId: ctx.user,
      entitlementId: PREMIUM_ENTITLEMENT,
    });
    if (!isPremium) throw new Error('PREMIUM_REQUIRED');

    const existing = await ctx.unsafeDb
      .query('feedReactions')
      .withIndex('by_user_event', (q) =>
        q.eq('userId', ctx.user).eq('feedEventId', args.feedEventId)
      )
      .collect();

    const match = existing.find((r) => r.emoji === args.emoji);
    if (match) {
      await ctx.unsafeDb.delete(match._id);
    } else {
      await ctx.unsafeDb.insert('feedReactions', {
        feedEventId: args.feedEventId,
        userId: ctx.user,
        emoji: args.emoji,
        createdAt: Date.now(),
      });
    }
  },
});

export const getReactionsForEvents = authQuery({
  args: {
    eventIds: v.array(v.id('activityFeed')),
  },
  handler: async (ctx, args) => {
    if (!ctx.user) return {};

    const result: Record<
      string,
      { fire: number; heart: number; clap: number; userReacted: string[] }
    > = {};

    await Promise.all(
      args.eventIds.map(async (eventId) => {
        const reactions = await ctx.unsafeDb
          .query('feedReactions')
          .withIndex('by_event', (q) => q.eq('feedEventId', eventId))
          .collect();

        const counts = { fire: 0, heart: 0, clap: 0 };
        const userReacted: string[] = [];

        for (const r of reactions) {
          counts[r.emoji]++;
          if (r.userId === ctx.user) userReacted.push(r.emoji);
        }

        result[eventId as string] = { ...counts, userReacted };
      })
    );

    return result;
  },
});

// ── Feed Event Helper ───────────────────────────────────────────────────────

export async function createFeedEvent(
  ctx: MutationCtx,
  userId: string,
  type: FeedEventType,
  referenceId?: string,
  metadata?: FeedMetadata
) {
  await ctx.db.insert('activityFeed', {
    userId,
    type,
    referenceId,
    metadata,
    createdAt: Date.now(),
  });
}
