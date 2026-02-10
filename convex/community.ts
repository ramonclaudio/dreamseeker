import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { components } from './_generated/api';
import { authQuery, authMutation } from './functions';
import { authComponent } from './auth';
import { MAX_BIO_LENGTH, MAX_DISPLAY_NAME_LENGTH } from './constants';
import { checkLength, sanitizeDisplayText } from './validation';
import { checkCommunityRateLimit } from './communityRateLimit';

// ── Profile Viewing ─────────────────────────────────────────────────────────

export const getPublicProfile = authQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.user) return null;

    const profile = await ctx.unsafeDb
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!profile) return null;

    // Private profile: return minimal info so frontend can show "private" state
    if (args.userId !== ctx.user && !profile.isPublic) {
      return {
        username: profile.username,
        displayName: profile.displayName,
        isPrivate: true as const,
      };
    }

    const bannerUrl = profile.bannerStorageId
      ? await ctx.storage.getUrl(profile.bannerStorageId)
      : (profile.bannerUrl ?? null);

    // Resolve avatar from auth user table, fall back to profile URL (seed users)
    let avatarUrl: string | null = null;
    try {
      const authUser = await ctx.runQuery(
        components.betterAuth.adapter.findOne,
        { model: 'user', where: [{ field: '_id', value: args.userId }] },
      ) as { image?: string | null } | null;
      if (authUser?.image) {
        const isStorageId = !authUser.image.includes('/') && !authUser.image.startsWith('http');
        if (isStorageId) {
          avatarUrl = await ctx.storage.getUrl(authUser.image as Id<'_storage'>) ?? null;
        } else {
          avatarUrl = authUser.image;
        }
      }
    } catch {
      // Avatar resolution failed, continue with null
    }
    if (!avatarUrl && profile.avatarUrl) {
      avatarUrl = profile.avatarUrl;
    }

    return {
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      bannerUrl,
      avatarUrl,
      createdAt: profile.createdAt,
      isPrivate: false as const,
    };
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

    // Check username uniqueness
    const existingUsername = await ctx.db
      .query('userProfiles')
      .withIndex('by_username', (q) => q.eq('username', username))
      .first();

    const finalUsername = existingUsername
      ? `${username}_${Date.now().toString(36)}`
      : username;

    const profileId = await ctx.db.insert('userProfiles', {
      userId: ctx.user,
      username: finalUsername,
      isPublic: false,
      createdAt: Date.now(),
    });

    return await ctx.db.get(profileId);
  },
});

export const updateProfile = authMutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user))
      .first();

    if (!profile) throw new Error('Profile not found');

    await checkCommunityRateLimit(ctx.unsafeDb, ctx.user, 'profile_update');

    checkLength(args.displayName, MAX_DISPLAY_NAME_LENGTH, 'Display name');
    checkLength(args.bio, MAX_BIO_LENGTH, 'Bio');

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.displayName !== undefined) updates.displayName = sanitizeDisplayText(args.displayName);
    if (args.bio !== undefined) updates.bio = sanitizeDisplayText(args.bio);
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

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
