import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { authQuery, authMutation } from './functions';
import { authComponent } from './auth';
import { MAX_BIO_LENGTH, MAX_DISPLAY_NAME_LENGTH, SEARCH_RESULTS_LIMIT } from './constants';
import { checkLength } from './validation';
import { hasEntitlement } from './revenuecat';
import { PREMIUM_ENTITLEMENT } from './subscriptions';

// ── Search & Discovery ──────────────────────────────────────────────────────

export const searchUsers = authQuery({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.user) return [];

    const isPremium = await hasEntitlement(ctx, { appUserId: ctx.user, entitlementId: PREMIUM_ENTITLEMENT });
    if (!isPremium) return [];

    const prefix = args.query.trim().toLowerCase();
    if (prefix.length === 0) return [];
    if (prefix.length > 50) return [];

    const profiles = await ctx.db
      .query('userProfiles')
      .withIndex('by_public_username', (q) => q.eq('isPublic', true))
      .take(500);

    const matched = profiles
      .filter((p) => p.username.toLowerCase().startsWith(prefix) && p.userId !== ctx.user)
      .slice(0, SEARCH_RESULTS_LIMIT);

    return await Promise.all(
      matched.map(async (profile) => {
        const friendship = await ctx.db
          .query('friendships')
          .withIndex('by_pair', (q) => q.eq('userId', ctx.user!).eq('friendId', profile.userId))
          .first();

        if (friendship) {
          return { ...profile, friendshipStatus: 'friends' as const };
        }

        const sentRequest = await ctx.db
          .query('friendRequests')
          .withIndex('by_pair', (q) => q.eq('fromUserId', ctx.user!).eq('toUserId', profile.userId))
          .first();

        if (sentRequest && sentRequest.status === 'pending') {
          return { ...profile, friendshipStatus: 'pending' as const };
        }

        const receivedRequest = await ctx.db
          .query('friendRequests')
          .withIndex('by_pair', (q) => q.eq('fromUserId', profile.userId).eq('toUserId', ctx.user!))
          .first();

        if (receivedRequest && receivedRequest.status === 'pending') {
          return { ...profile, friendshipStatus: 'pending' as const };
        }

        return { ...profile, friendshipStatus: 'none' as const };
      })
    );
  },
});

// ── Profile Viewing ─────────────────────────────────────────────────────────

export const getPublicProfile = authQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.user) return null;

    if (args.userId !== ctx.user) {
      const isPremium = await hasEntitlement(ctx, { appUserId: ctx.user!, entitlementId: PREMIUM_ENTITLEMENT });
      if (!isPremium) return null;
    }

    const profile = await ctx.unsafeDb
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!profile) return null;

    // Allow self-viewing; otherwise require public profile or friendship
    if (args.userId !== ctx.user && !profile.isPublic) {
      const friendship = await ctx.unsafeDb
        .query('friendships')
        .withIndex('by_pair', (q) => q.eq('userId', ctx.user!).eq('friendId', args.userId))
        .first();

      if (!friendship) return null;
    }

    const progress = await ctx.unsafeDb
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    const friendships = await ctx.unsafeDb
      .query('friendships')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    const bannerUrl = profile.bannerStorageId
      ? await ctx.storage.getUrl(profile.bannerStorageId)
      : null;

    return {
      ...profile,
      bannerUrl,
      friendCount: friendships.length,
      stats: {
        level: progress?.level ?? 1,
        totalXp: progress?.totalXp ?? 0,
        currentStreak: progress?.currentStreak ?? 0,
        dreamsCompleted: progress?.dreamsCompleted ?? 0,
      },
    };
  },
});

export const getFriendProfile = authQuery({
  args: { friendId: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.user) return null;

    const isPremium = await hasEntitlement(ctx, { appUserId: ctx.user!, entitlementId: PREMIUM_ENTITLEMENT });
    if (!isPremium) return null;

    const friendship = await ctx.unsafeDb
      .query('friendships')
      .withIndex('by_pair', (q) => q.eq('userId', ctx.user!).eq('friendId', args.friendId))
      .first();

    if (!friendship) return null;

    const profile = await ctx.unsafeDb
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', args.friendId))
      .first();

    if (!profile) return null;

    const progress = await ctx.unsafeDb
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', args.friendId))
      .first();

    const stats = {
      level: progress?.level ?? 1,
      totalXp: progress?.totalXp ?? 0,
      currentStreak: progress?.currentStreak ?? 0,
      dreamsCompleted: progress?.dreamsCompleted ?? 0,
    };

    const bannerUrl = profile.bannerStorageId
      ? await ctx.storage.getUrl(profile.bannerStorageId)
      : null;

    const profileWithBanner = { ...profile, bannerUrl };

    // If user hides all activity, return profile + stats only
    if (profile.hideAll) {
      return { profile: profileWithBanner, stats, dreams: [], journals: [] };
    }

    // Respect profile-level default hide settings
    const showDreams = !profile.defaultHideDreams;
    const showJournals = !profile.defaultHideJournals;

    let dreams: Doc<'dreams'>[] = [];
    let visibleJournals: Doc<'journalEntries'>[] = [];

    if (showDreams || showJournals) {
      // Filter out hidden items (per-item and per-category)
      const hiddenItems = await ctx.unsafeDb
        .query('hiddenItems')
        .withIndex('by_user', (q) => q.eq('userId', args.friendId))
        .collect();

      const hiddenIds = new Set<string>();
      const hiddenCategories = new Set<string>();

      for (const item of hiddenItems) {
        if (item.itemId.startsWith('category:')) {
          hiddenCategories.add(item.itemId.replace('category:', ''));
        } else {
          hiddenIds.add(item.itemId);
        }
      }

      if (showDreams) {
        const [activeDreams, completedDreams] = await Promise.all([
          ctx.unsafeDb.query('dreams').withIndex('by_user_status', (q) => q.eq('userId', args.friendId).eq('status', 'active')).collect(),
          ctx.unsafeDb.query('dreams').withIndex('by_user_status', (q) => q.eq('userId', args.friendId).eq('status', 'completed')).collect(),
        ]);
        dreams = [...activeDreams, ...completedDreams].filter(
          (d) => !hiddenIds.has(d._id) && !hiddenCategories.has(d.category)
        );
      }

      if (showJournals) {
        const journals = await ctx.unsafeDb
          .query('journalEntries')
          .withIndex('by_user', (q) => q.eq('userId', args.friendId))
          .order('desc')
          .take(10);
        visibleJournals = hiddenCategories.has('journal')
          ? []
          : journals.filter((j) => !hiddenIds.has(j._id));
      }
    }

    return { profile: profileWithBanner, stats, dreams, journals: visibleJournals };
  },
});

// ── Profile Management ──────────────────────────────────────────────────────

export const getOrCreateProfile = authMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user))
      .first();

    if (existing) return existing;

    const user = await authComponent.safeGetAuthUser(ctx);
    const username = (user as { username?: string } | null)?.username ?? ctx.user;

    const profileId = await ctx.db.insert('userProfiles', {
      userId: ctx.user,
      username,
      isPublic: false,
      createdAt: Date.now(),
    });

    return await ctx.db.get('userProfiles', profileId);
  },
});

export const updateProfile = authMutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    hideAll: v.optional(v.boolean()),
    defaultHideDreams: v.optional(v.boolean()),
    defaultHideJournals: v.optional(v.boolean()),
    defaultHideActions: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user))
      .first();

    if (!profile) throw new Error('Profile not found');

    checkLength(args.displayName, MAX_DISPLAY_NAME_LENGTH, 'Display name');
    checkLength(args.bio, MAX_BIO_LENGTH, 'Bio');

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.displayName !== undefined) updates.displayName = args.displayName;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;
    if (args.hideAll !== undefined) updates.hideAll = args.hideAll;
    if (args.defaultHideDreams !== undefined) updates.defaultHideDreams = args.defaultHideDreams;
    if (args.defaultHideJournals !== undefined) updates.defaultHideJournals = args.defaultHideJournals;
    if (args.defaultHideActions !== undefined) updates.defaultHideActions = args.defaultHideActions;

    await ctx.db.patch(profile._id, updates);
  },
});

export const getMyProfile = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return null;
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user!))
      .first();
    if (!profile) return null;
    const bannerUrl = profile.bannerStorageId
      ? await ctx.storage.getUrl(profile.bannerStorageId)
      : null;
    return { ...profile, bannerUrl };
  },
});

export const updateBanner = authMutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user))
      .first();
    if (!profile) throw new Error('Profile not found');

    // Delete old banner from storage
    if (profile.bannerStorageId) {
      try { await ctx.storage.delete(profile.bannerStorageId); } catch {}
    }

    await ctx.db.patch(profile._id, {
      bannerStorageId: args.storageId,
      updatedAt: Date.now(),
    });
  },
});

export const removeBanner = authMutation({
  args: {},
  handler: async (ctx) => {
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user))
      .first();
    if (!profile) throw new Error('Profile not found');

    if (profile.bannerStorageId) {
      try { await ctx.storage.delete(profile.bannerStorageId); } catch {}
    }

    await ctx.db.patch(profile._id, {
      bannerStorageId: undefined,
      updatedAt: Date.now(),
    });
  },
});
