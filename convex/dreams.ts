import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import {
  getAuthUserId,
  requireAuth,
  getOwnedDream,
  assertDreamLimit,
  awardXp,
} from './helpers';
import {
  dreamCategoryValidator,
  dreamStatusValidator,
  DREAM_CATEGORY_LIST,
  MAX_TITLE_LENGTH,
  MAX_WHY_LENGTH,
  MAX_ACTION_TEXT_LENGTH,
  MAX_CUSTOM_CATEGORY_NAME_LENGTH,
  MAX_CUSTOM_CATEGORY_COLOR_LENGTH,
  MAX_REFLECTION_LENGTH,
  XP_REWARDS,
} from './constants';
import { checkAndAwardBadge, applyBadgeXp } from './badgeChecks';
import { requireText, checkLength, sanitizeActions } from './validation';
import { canComplete } from './dreamGuards';

// List all active dreams for the current user
export const list = query({
  args: { category: v.optional(dreamCategoryValidator) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.category) {
      return await ctx.db
        .query('dreams')
        .withIndex('by_user_category', (q) => q.eq('userId', userId).eq('category', args.category!))
        .filter((q) => q.eq(q.field('status'), 'active'))
        .order('desc')
        .collect();
    }

    return await ctx.db
      .query('dreams')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
      .order('desc')
      .collect();
  },
});

// List dreams by status (completed, archived, or active)
export const listByStatus = query({
  args: { status: dreamStatusValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query('dreams')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', args.status))
      .order('desc')
      .collect();
  },
});

// Get a single dream with its actions
export const get = query({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const dream = await ctx.db.get(args.id);
    if (!dream || dream.userId !== userId) return null;

    const actions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.id))
      .filter((q) => q.neq(q.field('status'), 'archived'))
      .collect();

    actions.sort((a, b) => a.order - b.order);

    return { ...dream, actions };
  },
});

// List all active dreams with per-dream action progress
export const listWithActionCounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const dreams = await ctx.db
      .query('dreams')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
      .order('desc')
      .collect();

    return await Promise.all(
      dreams.map(async (dream) => {
        const actions = await ctx.db
          .query('actions')
          .withIndex('by_dream', (q) => q.eq('dreamId', dream._id))
          .filter((q) => q.neq(q.field('status'), 'archived'))
          .collect();

        return {
          ...dream,
          completedActions: actions.filter((a) => a.isCompleted).length,
          totalActions: actions.length,
        };
      })
    );
  },
});

// Get dream counts by category
export const getCategoryCounts = query({
  args: {},
  handler: async (ctx) => {
    const defaultCounts = Object.fromEntries(DREAM_CATEGORY_LIST.map((c) => [c, 0]));

    const userId = await getAuthUserId(ctx);
    if (!userId) return defaultCounts;

    const dreams = await ctx.db
      .query('dreams')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
      .collect();

    const counts: Record<string, number> = { ...defaultCounts };

    for (const dream of dreams) {
      counts[dream.category] = (counts[dream.category] ?? 0) + 1;
    }

    return counts;
  },
});

// Create a new dream
export const create = mutation({
  args: {
    title: v.string(),
    category: dreamCategoryValidator,
    whyItMatters: v.optional(v.string()),
    targetDate: v.optional(v.number()),
    initialActions: v.optional(v.array(v.string())),
    customCategoryName: v.optional(v.string()),
    customCategoryIcon: v.optional(v.string()),
    customCategoryColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const trimmedTitle = requireText(args.title, MAX_TITLE_LENGTH, 'Dream title');
    checkLength(args.whyItMatters, MAX_WHY_LENGTH, '"Why it matters"');
    checkLength(args.customCategoryName, MAX_CUSTOM_CATEGORY_NAME_LENGTH, 'Custom category name');
    checkLength(args.customCategoryColor, MAX_CUSTOM_CATEGORY_COLOR_LENGTH, 'Custom category color');

    await assertDreamLimit(ctx, userId);

    const dreamId = await ctx.db.insert('dreams', {
      userId,
      title: trimmedTitle,
      category: args.category,
      whyItMatters: args.whyItMatters?.trim(),
      targetDate: args.targetDate,
      status: 'active',
      createdAt: Date.now(),
      customCategoryName: args.customCategoryName?.trim(),
      customCategoryIcon: args.customCategoryIcon,
      customCategoryColor: args.customCategoryColor?.trim(),
    });

    // Batch-insert initial actions if provided
    if (args.initialActions && args.initialActions.length > 0) {
      const cleanedActions = sanitizeActions(args.initialActions, 20, MAX_ACTION_TEXT_LENGTH);
      const now = Date.now();
      await Promise.all(
        cleanedActions.map((text, index) =>
            ctx.db.insert('actions', {
              userId,
              dreamId,
              text,
              isCompleted: false,
              order: index,
              status: 'active',
              createdAt: now,
            })
          )
      );
    }

    return dreamId;
  },
});

// Update a dream
export const update = mutation({
  args: {
    id: v.id('dreams'),
    title: v.optional(v.string()),
    whyItMatters: v.optional(v.string()),
    targetDate: v.optional(v.number()),
    category: v.optional(dreamCategoryValidator),
    customCategoryName: v.optional(v.string()),
    customCategoryIcon: v.optional(v.string()),
    customCategoryColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    await getOwnedDream(ctx, args.id, userId);

    const updates: Partial<Doc<'dreams'>> = {};

    if (args.title !== undefined) {
      updates.title = requireText(args.title, MAX_TITLE_LENGTH, 'Dream title');
    }

    if (args.whyItMatters !== undefined) {
      checkLength(args.whyItMatters, MAX_WHY_LENGTH, '"Why it matters"');
      updates.whyItMatters = args.whyItMatters.trim();
    }

    checkLength(args.customCategoryName, MAX_CUSTOM_CATEGORY_NAME_LENGTH, 'Custom category name');
    checkLength(args.customCategoryColor, MAX_CUSTOM_CATEGORY_COLOR_LENGTH, 'Custom category color');

    // Pass-through optional fields
    for (const key of ['targetDate', 'category', 'customCategoryName', 'customCategoryIcon', 'customCategoryColor'] as const) {
      if (args[key] !== undefined) (updates as Record<string, unknown>)[key] = args[key];
    }

    await ctx.db.patch(args.id, updates);
  },
});

// Complete a dream
export const complete = mutation({
  args: { id: v.id('dreams'), timezone: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const dream = await getOwnedDream(ctx, args.id, userId);

    const check = canComplete(dream);
    if (!check.allowed) throw new Error(check.error!);

    await ctx.db.patch(args.id, {
      status: 'completed',
      completedAt: Date.now(),
    });

    const xpReward = XP_REWARDS.dreamComplete;
    await awardXp(ctx, userId, xpReward, {
      skipStreak: true,
      incrementDreams: 1,
      timezone: args.timezone ?? 'UTC',
    });

    // Check dream_achiever badge — accumulate XP, apply in a single patch
    let newBadge = null;
    let badgeXp = 0;
    const result = await checkAndAwardBadge(ctx, userId, 'dream_achiever');
    badgeXp += result.xpAwarded;
    if (result.awarded) newBadge = result.badge;

    await applyBadgeXp(ctx, userId, badgeXp);

    return { xpAwarded: xpReward + badgeXp, newBadge };
  },
});

// Save reflection on a completed dream
export const saveReflection = mutation({
  args: { id: v.id('dreams'), reflection: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const dream = await getOwnedDream(ctx, args.id, userId);
    if (dream.status !== 'completed') throw new Error('Dream must be completed to add reflection');

    const trimmed = requireText(args.reflection, MAX_REFLECTION_LENGTH, 'Reflection');

    await ctx.db.patch(args.id, { reflection: trimmed });
  },
});

