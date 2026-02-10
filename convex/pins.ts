import { v } from 'convex/values';
import { authQuery, authMutation } from './functions';
import { internal } from './_generated/api';
import { hasEntitlement } from './revenuecat';
import { PREMIUM_ENTITLEMENT } from './subscriptions';
import { checkCommunityRateLimit } from './communityRateLimit';
import { requireText, checkLength, validateTags, validateUrl } from './validation';
import {
  PIN_TITLE_MAX,
  PIN_DESC_MAX,
  PIN_URL_MAX,
  PIN_PAGE_SIZE,
  PIN_TAGS_MAX,
  PIN_TAG_LENGTH_MAX,
  FREE_MAX_PINS,
  FREE_MAX_COMMUNITY_PINS,
  BOARD_NAME_MAX,
  MAX_BOARDS,
  dreamCategoryValidator,
  pinTypeValidator,
} from './constants';

// ── Board Queries ───────────────────────────────────────────────────────────

export const listMyBoards = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return [];
    return ctx.db
      .query('visionBoards')
      .withIndex('by_user_order', (q) => q.eq('userId', ctx.user!))
      .collect();
  },
});

export const getMyPinsByBoard = authQuery({
  args: { boardId: v.id('visionBoards') },
  handler: async (ctx, args) => {
    if (!ctx.user) return [];

    const board = await ctx.db.get(args.boardId);
    if (!board || board.userId !== ctx.user) return [];

    // Fetch pins assigned to this board
    const boardPins = await ctx.unsafeDb
      .query('pins')
      .withIndex('by_board', (q) => q.eq('boardId', args.boardId))
      .order('desc')
      .collect();

    // If this is the first board (order 0), also include legacy unassigned pins
    let pins = boardPins.filter((p) => p.userId === ctx.user);
    if (board.order === 0) {
      const userPins = await ctx.unsafeDb
        .query('pins')
        .withIndex('by_user_created', (q) => q.eq('userId', ctx.user!))
        .order('desc')
        .collect();
      const legacyPins = userPins.filter((p) => !p.boardId);
      pins = [...pins, ...legacyPins].sort((a, b) => b.createdAt - a.createdAt);
    }

    const profile = await ctx.unsafeDb
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user!))
      .first();
    const displayName = profile?.displayName ?? profile?.username ?? 'Me';

    return Promise.all(
      pins.map(async (pin) => ({
        ...pin,
        imageUrl: pin.imageStorageId
          ? await ctx.storage.getUrl(pin.imageStorageId)
          : (pin.linkImageUrl ?? null),
        username: profile?.username ?? 'me',
        displayName: profile?.displayName,
        avatarInitial: displayName.charAt(0).toUpperCase(),
      }))
    );
  },
});

// ── Board Mutations ─────────────────────────────────────────────────────────

export const createBoard = authMutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const name = requireText(args.name, BOARD_NAME_MAX, 'Board name');

    const existing = await ctx.db
      .query('visionBoards')
      .withIndex('by_user_order', (q) => q.eq('userId', ctx.user))
      .collect();

    if (existing.length >= MAX_BOARDS) {
      throw new Error('BOARD_LIMIT');
    }

    const maxOrder = existing.reduce((max, b) => Math.max(max, b.order), -1);

    return ctx.db.insert('visionBoards', {
      userId: ctx.user,
      name,
      order: maxOrder + 1,
      createdAt: Date.now(),
    });
  },
});

export const renameBoard = authMutation({
  args: { boardId: v.id('visionBoards'), name: v.string() },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error('Board not found');
    if (board.userId !== ctx.user) throw new Error('Not the board owner');

    const name = requireText(args.name, BOARD_NAME_MAX, 'Board name');
    await ctx.db.patch(args.boardId, { name });
  },
});

export const deleteBoard = authMutation({
  args: { boardId: v.id('visionBoards') },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error('Board not found');
    if (board.userId !== ctx.user) throw new Error('Not the board owner');

    const allBoards = await ctx.db
      .query('visionBoards')
      .withIndex('by_user_order', (q) => q.eq('userId', ctx.user))
      .collect();

    if (allBoards.length <= 1) {
      throw new Error('Cannot delete last board');
    }

    // Find first remaining board to move orphaned pins to
    const firstRemaining = allBoards
      .filter((b) => b._id !== args.boardId)
      .sort((a, b) => a.order - b.order)[0];

    // Move orphaned pins to first remaining board
    const orphanedPins = await ctx.unsafeDb
      .query('pins')
      .withIndex('by_board', (q) => q.eq('boardId', args.boardId))
      .collect();

    for (const pin of orphanedPins) {
      await ctx.unsafeDb.patch(pin._id, { boardId: firstRemaining._id });
    }

    await ctx.db.delete(args.boardId);
  },
});

// ── Queries ──────────────────────────────────────────────────────────────────

export const getCommunityPins = authQuery({
  args: {
    cursor: v.optional(v.number()),
    cursorId: v.optional(v.string()),
    limit: v.optional(v.number()),
    category: v.optional(dreamCategoryValidator),
    type: v.optional(pinTypeValidator),
  },
  handler: async (ctx, args) => {
    if (!ctx.user)
      return { pins: [], nextCursor: null, nextCursorId: null, isPreview: false };

    // Community is open for all to view — premium only gates contributions
    const isPremium = await hasEntitlement(ctx, {
      appUserId: ctx.user,
      entitlementId: PREMIUM_ENTITLEMENT,
    });

    // Query community pins (isPersonalOnly === false)
    let allPins;
    if (args.category) {
      allPins = await ctx.unsafeDb
        .query('pins')
        .withIndex('by_category_created', (q) => q.eq('category', args.category!))
        .order('desc')
        .take(200);
      // Category index doesn't filter isPersonalOnly, do it manually
      allPins = allPins.filter((p) => !p.isPersonalOnly);
    } else {
      allPins = await ctx.unsafeDb
        .query('pins')
        .withIndex('by_community_created', (q) => q.eq('isPersonalOnly', false))
        .order('desc')
        .take(200);
    }

    // Filter out hidden (reported) pins
    allPins = allPins.filter((p) => !p.isHidden);

    // Filter out pins from users the current user has blocked
    const blockedRows = await ctx.unsafeDb
      .query('blockedUsers')
      .withIndex('by_blocker', (q) => q.eq('blockerId', ctx.user!))
      .collect();
    if (blockedRows.length > 0) {
      const blockedIds = new Set(blockedRows.map((b) => b.blockedId));
      allPins = allPins.filter((p) => !blockedIds.has(p.userId));
    }

    // Filter by type if specified
    if (args.type) {
      allPins = allPins.filter((p) => p.type === args.type);
    }

    // Build author profile map for display
    const authorIds = Array.from(new Set(allPins.map((p) => p.userId)));
    const profiles = await Promise.all(
      authorIds.map((id) =>
        ctx.unsafeDb
          .query('userProfiles')
          .withIndex('by_user', (q) => q.eq('userId', id))
          .first()
      )
    );
    const profileMap = new Map<string, NonNullable<(typeof profiles)[number]>>();
    for (let i = 0; i < authorIds.length; i++) {
      const p = profiles[i];
      if (p) {
        profileMap.set(authorIds[i], p);
      }
    }

    // Apply cursor pagination
    if (args.cursor != null) {
      const cursorTime = args.cursor;
      const cursorId = args.cursorId;
      allPins = allPins.filter((p) => {
        if (p.createdAt < cursorTime) return true;
        if (p.createdAt === cursorTime && cursorId && (p._id as string) < cursorId)
          return true;
        return false;
      });
    }

    // Open for everyone to browse
    const pageSize = Math.min(args.limit ?? PIN_PAGE_SIZE, PIN_PAGE_SIZE);
    const page = allPins.slice(0, pageSize);

    // Attach author info and resolve image URLs
    // Obscure identity of private (non-public) authors
    const pins = await Promise.all(
      page.map(async (pin) => {
        const profile = profileMap.get(pin.userId);
        const isPublic = profile?.isPublic ?? false;
        const imageUrl = pin.imageStorageId
          ? await ctx.storage.getUrl(pin.imageStorageId)
          : (pin.linkImageUrl ?? null);

        // If author profile is private, anonymize their identity
        const username = isPublic ? (profile?.username ?? 'unknown') : 'anonymous';
        const displayName = isPublic ? profile?.displayName : 'Anonymous Dreamer';
        const resolvedName = displayName ?? username;
        const avatarInitial = isPublic ? resolvedName.charAt(0).toUpperCase() : '?';
        const avatarUrl = isPublic ? (profile?.avatarUrl ?? null) : null;

        return {
          _id: pin._id,
          userId: pin.userId,
          type: pin.type,
          title: pin.title,
          description: pin.description,
          category: pin.category,
          tags: pin.tags,
          imageUrl,
          linkUrl: pin.linkUrl,
          linkTitle: pin.linkTitle,
          linkDescription: pin.linkDescription,
          linkImageUrl: pin.linkImageUrl,
          linkDomain: pin.linkDomain,
          imageAspectRatio: pin.imageAspectRatio,
          isPersonalOnly: pin.isPersonalOnly,
          createdAt: pin.createdAt,
          username,
          displayName,
          avatarInitial,
          avatarUrl,
          authorIsPublic: isPublic,
        };
      })
    );

    const last = pins[pins.length - 1];
    return {
      pins,
      nextCursor: last?.createdAt ?? null,
      nextCursorId: last ? (last._id as string) : null,
      isPreview: false,
      isPremium,
    };
  },
});

export const getMyPins = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return [];

    const profile = await ctx.unsafeDb
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user!))
      .first();
    const displayName = profile?.displayName ?? profile?.username ?? 'Me';

    const pins = await ctx.db
      .query('pins')
      .withIndex('by_user_created', (q) => q.eq('userId', ctx.user!))
      .order('desc')
      .collect();

    return Promise.all(
      pins.map(async (pin) => ({
        ...pin,
        imageUrl: pin.imageStorageId
          ? await ctx.storage.getUrl(pin.imageStorageId)
          : (pin.linkImageUrl ?? null),
        username: profile?.username ?? 'me',
        displayName: profile?.displayName,
        avatarInitial: displayName.charAt(0).toUpperCase(),
      }))
    );
  },
});

export const getUserPins = authQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.user) return [];

    const pins = await ctx.unsafeDb
      .query('pins')
      .withIndex('by_user_created', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();

    // Profile page always shows community pins only (public-facing view)
    const visible = pins.filter((p) => !p.isPersonalOnly);

    // Fetch profile for author info
    const profile = await ctx.unsafeDb
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();
    const dn = profile?.displayName ?? profile?.username ?? 'unknown';

    return Promise.all(
      visible.map(async (pin) => ({
        _id: pin._id,
        userId: pin.userId,
        type: pin.type,
        title: pin.title,
        description: pin.description,
        category: pin.category,
        tags: pin.tags,
        imageUrl: pin.imageStorageId
          ? await ctx.storage.getUrl(pin.imageStorageId)
          : (pin.linkImageUrl ?? null),
        linkUrl: pin.linkUrl,
        linkTitle: pin.linkTitle,
        linkDescription: pin.linkDescription,
        linkDomain: pin.linkDomain,
        imageAspectRatio: pin.imageAspectRatio,
        isPersonalOnly: pin.isPersonalOnly,
        createdAt: pin.createdAt,
        username: profile?.username ?? 'unknown',
        displayName: profile?.displayName,
        avatarInitial: dn.charAt(0).toUpperCase(),
        customCategoryName: pin.customCategoryName,
        customCategoryIcon: pin.customCategoryIcon,
        customCategoryColor: pin.customCategoryColor,
      }))
    );
  },
});

// ── Mutations ────────────────────────────────────────────────────────────────

export const createPin = authMutation({
  args: {
    type: pinTypeValidator,
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(dreamCategoryValidator),
    tags: v.optional(v.array(v.string())),
    imageStorageId: v.optional(v.id('_storage')),
    linkUrl: v.optional(v.string()),
    imageAspectRatio: v.optional(v.number()),
    isPersonalOnly: v.boolean(),
    boardId: v.optional(v.id('visionBoards')),
    customCategoryName: v.optional(v.string()),
    customCategoryIcon: v.optional(v.string()),
    customCategoryColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isPremium = await hasEntitlement(ctx, {
      appUserId: ctx.user,
      entitlementId: PREMIUM_ENTITLEMENT,
    });

    if (!isPremium) {
      const totalPins = await ctx.db
        .query('pins')
        .withIndex('by_user_created', (q) => q.eq('userId', ctx.user))
        .take(FREE_MAX_PINS + 1);
      if (totalPins.length >= FREE_MAX_PINS) {
        throw new Error('FREE_PIN_LIMIT');
      }

      if (!args.isPersonalOnly) {
        const communityPins = totalPins.filter((p) => !p.isPersonalOnly);
        if (communityPins.length >= FREE_MAX_COMMUNITY_PINS) {
          throw new Error('FREE_COMMUNITY_PIN_LIMIT');
        }
      }
    }

    await checkCommunityRateLimit(ctx.unsafeDb, ctx.user, 'pin_create');

    // Validate fields
    const title = args.title ? requireText(args.title, PIN_TITLE_MAX, 'Pin title') : undefined;
    if (args.description) checkLength(args.description, PIN_DESC_MAX, 'Pin description');
    if (args.linkUrl && args.linkUrl.length > PIN_URL_MAX) {
      throw new Error(`Link URL cannot exceed ${PIN_URL_MAX} characters`);
    }
    if (args.linkUrl) validateUrl(args.linkUrl, 'Link URL');
    const tags = args.tags ? validateTags(args.tags, PIN_TAGS_MAX, PIN_TAG_LENGTH_MAX) : undefined;

    // Resolve boardId: use provided, or default to user's first board
    let boardId = args.boardId;
    if (!boardId) {
      const firstBoard = await ctx.db
        .query('visionBoards')
        .withIndex('by_user_order', (q) => q.eq('userId', ctx.user))
        .first();
      boardId = firstBoard?._id;
    }

    const pinId = await ctx.db.insert('pins', {
      userId: ctx.user,
      type: args.type,
      title,
      description: args.description?.trim(),
      category: args.category,
      tags,
      imageStorageId: args.imageStorageId,
      linkUrl: args.linkUrl?.trim(),
      imageAspectRatio: args.imageAspectRatio,
      boardId,
      isPersonalOnly: args.isPersonalOnly,
      customCategoryName: args.category === 'custom' ? args.customCategoryName : undefined,
      customCategoryIcon: args.category === 'custom' ? args.customCategoryIcon : undefined,
      customCategoryColor: args.category === 'custom' ? args.customCategoryColor : undefined,
      createdAt: Date.now(),
    });

    // For link type: schedule link preview fetch
    if (args.type === 'link' && args.linkUrl) {
      await ctx.scheduler.runAfter(0, internal.linkPreview.fetchLinkPreview, {
        pinId,
      });
    }

    return pinId;
  },
});

export const updatePin = authMutation({
  args: {
    pinId: v.id('pins'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(dreamCategoryValidator),
    tags: v.optional(v.array(v.string())),
    imageStorageId: v.optional(v.id('_storage')),
    linkUrl: v.optional(v.string()),
    imageAspectRatio: v.optional(v.number()),
    isPersonalOnly: v.boolean(),
    boardId: v.optional(v.id('visionBoards')),
    customCategoryName: v.optional(v.string()),
    customCategoryIcon: v.optional(v.string()),
    customCategoryColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const pin = await ctx.db.get(args.pinId);
    if (!pin) throw new Error('Pin not found');
    if (pin.userId !== ctx.user) throw new Error('Not the pin owner');

    await checkCommunityRateLimit(ctx.unsafeDb, ctx.user, 'pin_create');

    // Validate fields
    const title = args.title ? requireText(args.title, PIN_TITLE_MAX, 'Pin title') : undefined;
    if (args.description) checkLength(args.description, PIN_DESC_MAX, 'Pin description');
    if (args.linkUrl && args.linkUrl.length > PIN_URL_MAX) {
      throw new Error(`Link URL cannot exceed ${PIN_URL_MAX} characters`);
    }
    if (args.linkUrl) validateUrl(args.linkUrl, 'Link URL');
    const tags = args.tags ? validateTags(args.tags, PIN_TAGS_MAX, PIN_TAG_LENGTH_MAX) : undefined;

    // If image changed, delete old storage image
    if (args.imageStorageId && args.imageStorageId !== pin.imageStorageId && pin.imageStorageId) {
      try {
        await ctx.storage.delete(pin.imageStorageId);
      } catch {
        // Image may already be deleted
      }
    }

    await ctx.db.patch(args.pinId, {
      title,
      description: args.description?.trim(),
      category: args.category,
      tags,
      ...(args.imageStorageId !== undefined && { imageStorageId: args.imageStorageId }),
      linkUrl: args.linkUrl?.trim(),
      imageAspectRatio: pin.type === 'image' ? (args.imageAspectRatio ?? pin.imageAspectRatio) : undefined,
      ...(args.boardId !== undefined && { boardId: args.boardId }),
      isPersonalOnly: args.isPersonalOnly,
      customCategoryName: args.category === 'custom' ? args.customCategoryName : undefined,
      customCategoryIcon: args.category === 'custom' ? args.customCategoryIcon : undefined,
      customCategoryColor: args.category === 'custom' ? args.customCategoryColor : undefined,
      updatedAt: Date.now(),
    });

    // If link URL changed, re-fetch link preview
    if (pin.type === 'link' && args.linkUrl && args.linkUrl.trim() !== pin.linkUrl) {
      await ctx.scheduler.runAfter(0, internal.linkPreview.fetchLinkPreview, {
        pinId: args.pinId,
      });
    }
  },
});

export const deletePin = authMutation({
  args: { pinId: v.id('pins') },
  handler: async (ctx, args) => {
    const pin = await ctx.db.get(args.pinId);
    if (!pin) throw new Error('Pin not found');
    if (pin.userId !== ctx.user) throw new Error('Not the pin owner');

    if (pin.imageStorageId && !pin.originalPinId) {
      try {
        await ctx.storage.delete(pin.imageStorageId);
      } catch {
        // Image may already be deleted
      }
    }

    await ctx.db.delete(args.pinId);
  },
});

// ── Save / Unsave ─────────────────────────────────────────────────────────

export const savePin = authMutation({
  args: {
    pinId: v.id('pins'),
    boardId: v.id('visionBoards'),
  },
  handler: async (ctx, args) => {
    const original = await ctx.unsafeDb.get(args.pinId);
    if (!original) throw new Error('Pin not found');
    if (original.isPersonalOnly) throw new Error('Cannot save a personal pin');
    if (original.userId === ctx.user) throw new Error('Cannot save your own pin');

    // Verify board belongs to user
    const board = await ctx.db.get(args.boardId);
    if (!board || board.userId !== ctx.user) throw new Error('Board not found');

    // Duplicate check
    const userPins = await ctx.db
      .query('pins')
      .withIndex('by_user_created', (q) => q.eq('userId', ctx.user))
      .collect();
    if (userPins.some((p) => p.originalPinId === args.pinId)) {
      throw new Error('ALREADY_SAVED');
    }

    // Free tier limit
    const isPremium = await hasEntitlement(ctx, {
      appUserId: ctx.user,
      entitlementId: PREMIUM_ENTITLEMENT,
    });
    if (!isPremium && userPins.length >= FREE_MAX_PINS) {
      throw new Error('FREE_PIN_LIMIT');
    }

    await checkCommunityRateLimit(ctx.unsafeDb, ctx.user, 'pin_create');

    return ctx.db.insert('pins', {
      userId: ctx.user,
      type: original.type,
      title: original.title,
      description: original.description,
      category: original.category,
      tags: original.tags,
      imageStorageId: original.imageStorageId,
      linkUrl: original.linkUrl,
      linkTitle: original.linkTitle,
      linkDescription: original.linkDescription,
      linkImageUrl: original.linkImageUrl,
      linkDomain: original.linkDomain,
      imageAspectRatio: original.imageAspectRatio,
      boardId: args.boardId,
      isPersonalOnly: true,
      customCategoryName: original.customCategoryName,
      customCategoryIcon: original.customCategoryIcon,
      customCategoryColor: original.customCategoryColor,
      originalPinId: args.pinId,
      createdAt: Date.now(),
    });
  },
});

export const unsavePin = authMutation({
  args: { pinId: v.id('pins') },
  handler: async (ctx, args) => {
    const pin = await ctx.db.get(args.pinId);
    if (!pin) throw new Error('Pin not found');
    if (pin.userId !== ctx.user) throw new Error('Not the pin owner');
    if (!pin.originalPinId) throw new Error('Not a saved pin');

    // Skip image storage deletion — references original's storage
    await ctx.db.delete(args.pinId);
  },
});

export const getSavedPinIds = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return [];

    const userPins = await ctx.db
      .query('pins')
      .withIndex('by_user_created', (q) => q.eq('userId', ctx.user!))
      .collect();

    return userPins
      .filter((p) => p.originalPinId != null)
      .map((p) => p.originalPinId as string);
  },
});

// ── Reports ───────────────────────────────────────────────────────────────

const PIN_REPORT_THRESHOLD = 3;

export const reportPin = authMutation({
  args: {
    pinId: v.id('pins'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const pin = await ctx.unsafeDb.get(args.pinId);
    if (!pin) throw new Error('Pin not found');

    // Cannot report your own pin
    if (pin.userId === ctx.user) throw new Error('Cannot report your own pin');

    // Prevent duplicate reports
    const existing = await ctx.unsafeDb
      .query('pinReports')
      .withIndex('by_reporter_pin', (q) =>
        q.eq('reporterId', ctx.user).eq('pinId', args.pinId)
      )
      .first();
    if (existing) throw new Error('ALREADY_REPORTED');

    await checkCommunityRateLimit(ctx.unsafeDb, ctx.user, 'report_pin');

    // Insert the report
    await ctx.unsafeDb.insert('pinReports', {
      pinId: args.pinId,
      reporterId: ctx.user,
      reason: args.reason?.trim(),
      createdAt: Date.now(),
    });

    // Count total reports for this pin — hide if threshold reached
    const reports = await ctx.unsafeDb
      .query('pinReports')
      .withIndex('by_pin', (q) => q.eq('pinId', args.pinId))
      .collect();

    if (reports.length >= PIN_REPORT_THRESHOLD) {
      await ctx.unsafeDb.patch(args.pinId, { isHidden: true });
    }
  },
});

// ── Block User ───────────────────────────────────────────────────────────

export const blockUser = authMutation({
  args: {
    blockedUserId: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.blockedUserId === ctx.user) throw new Error('Cannot block yourself');

    // Prevent duplicate blocks
    const existing = await ctx.unsafeDb
      .query('blockedUsers')
      .withIndex('by_pair', (q) =>
        q.eq('blockerId', ctx.user).eq('blockedId', args.blockedUserId)
      )
      .first();
    if (existing) return; // Already blocked, no-op

    await ctx.unsafeDb.insert('blockedUsers', {
      blockerId: ctx.user,
      blockedId: args.blockedUserId,
      createdAt: Date.now(),
    });
  },
});

// Note: updateLinkPreview is in convex/linkPreview.ts (co-located with the fetch action)
