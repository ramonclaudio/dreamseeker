import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import {
  getAuthUserId,
  requireAuth,
  getOwnedDream,
  getTodayString,
  assertDreamLimit,
  deductDreamXp,
  restoreDreamXp,
} from './helpers';
import { dreamCategoryValidator, MAX_TITLE_LENGTH, MAX_WHY_LENGTH, XP_REWARDS, getLevelFromXp } from './constants';

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

// List all dreams (including completed) for the current user
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query('dreams')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();
  },
});

// List completed dreams
export const listCompleted = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query('dreams')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'completed'))
      .order('desc')
      .collect();
  },
});

// List archived dreams
export const listArchived = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query('dreams')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'archived'))
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

// Get dream counts by category
export const getCategoryCounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      return {
        travel: 0,
        money: 0,
        career: 0,
        lifestyle: 0,
        growth: 0,
        relationships: 0,
      };

    const dreams = await ctx.db
      .query('dreams')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
      .collect();

    const counts = {
      travel: 0,
      money: 0,
      career: 0,
      lifestyle: 0,
      growth: 0,
      relationships: 0,
    };

    for (const dream of dreams) {
      counts[dream.category]++;
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
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const trimmedTitle = args.title.trim();
    if (trimmedTitle.length === 0) throw new Error('Dream title cannot be empty');
    if (trimmedTitle.length > MAX_TITLE_LENGTH)
      throw new Error(`Dream title cannot exceed ${MAX_TITLE_LENGTH} characters`);

    if (args.whyItMatters && args.whyItMatters.length > MAX_WHY_LENGTH) {
      throw new Error(`"Why it matters" cannot exceed ${MAX_WHY_LENGTH} characters`);
    }

    await assertDreamLimit(ctx, userId);

    return await ctx.db.insert('dreams', {
      userId,
      title: trimmedTitle,
      category: args.category,
      whyItMatters: args.whyItMatters?.trim(),
      targetDate: args.targetDate,
      status: 'active',
      createdAt: Date.now(),
    });
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
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    await getOwnedDream(ctx, args.id, userId);

    const updates: Partial<Doc<'dreams'>> = {};

    if (args.title !== undefined) {
      const trimmedTitle = args.title.trim();
      if (trimmedTitle.length === 0) throw new Error('Dream title cannot be empty');
      if (trimmedTitle.length > MAX_TITLE_LENGTH)
        throw new Error(`Dream title cannot exceed ${MAX_TITLE_LENGTH} characters`);
      updates.title = trimmedTitle;
    }

    if (args.whyItMatters !== undefined) {
      if (args.whyItMatters.length > MAX_WHY_LENGTH) {
        throw new Error(`"Why it matters" cannot exceed ${MAX_WHY_LENGTH} characters`);
      }
      updates.whyItMatters = args.whyItMatters.trim();
    }

    if (args.targetDate !== undefined) {
      updates.targetDate = args.targetDate;
    }

    if (args.category !== undefined) {
      updates.category = args.category;
    }

    await ctx.db.patch(args.id, updates);
  },
});

// Complete a dream
export const complete = mutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const dream = await getOwnedDream(ctx, args.id, userId);

    if (dream.status === 'completed') {
      throw new Error('Dream is already completed');
    }

    await ctx.db.patch(args.id, {
      status: 'completed',
      completedAt: Date.now(),
    });

    const xpReward = XP_REWARDS.dreamComplete;
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (progress) {
      const newXp = progress.totalXp + xpReward;
      await ctx.db.patch(progress._id, {
        totalXp: newXp,
        level: getLevelFromXp(newXp).level,
        dreamsCompleted: progress.dreamsCompleted + 1,
      });
    } else {
      await ctx.db.insert('userProgress', {
        userId,
        totalXp: xpReward,
        level: getLevelFromXp(xpReward).level,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: getTodayString(),
        dreamsCompleted: 1,
        actionsCompleted: 0,
      });
    }

    return { xpAwarded: xpReward };
  },
});

// Archive a dream (soft delete) - reverses XP and stats
// Note: Streaks are intentionally not affected by archive/restore.
// They represent historical engagement regardless of current archive state.
export const archive = mutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const dream = await getOwnedDream(ctx, args.id, userId);

    // Get all actions for this dream
    const actions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.id))
      .collect();

    const xpToDeduct = await deductDreamXp(ctx, userId, dream, actions);

    // Archive all actions for this dream
    await Promise.all(
      actions.map((action) => ctx.db.patch(action._id, { status: 'archived' as const }))
    );

    await ctx.db.patch(args.id, { status: 'archived' });

    return { xpDeducted: xpToDeduct, actionsArchived: actions.length };
  },
});

// Restore an archived dream - re-adds XP and stats
export const restore = mutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const dream = await getOwnedDream(ctx, args.id, userId);

    if (dream.status !== 'archived') {
      throw new Error('Dream is not archived');
    }

    // Check tier limits before restoring (only if restoring to active)
    const restoreToStatus = dream.completedAt ? 'completed' : 'active';

    if (restoreToStatus === 'active') {
      await assertDreamLimit(ctx, userId);
    }

    // Get all actions for this dream to restore XP
    const actions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.id))
      .collect();

    const xpToRestore = await restoreDreamXp(ctx, userId, dream, actions);

    // Restore all actions for this dream
    await Promise.all(
      actions.map((action) => ctx.db.patch(action._id, { status: 'active' as const }))
    );

    await ctx.db.patch(args.id, { status: restoreToStatus });

    return { xpRestored: xpToRestore };
  },
});

// Reopen a completed dream - reverses completion rewards
export const reopen = mutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const dream = await getOwnedDream(ctx, args.id, userId);

    if (dream.status !== 'completed') {
      throw new Error('Dream is not completed');
    }

    await assertDreamLimit(ctx, userId);

    const xpReward = XP_REWARDS.dreamComplete;
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (progress) {
      const newXp = Math.max(0, progress.totalXp - xpReward);
      await ctx.db.patch(progress._id, {
        totalXp: newXp,
        level: getLevelFromXp(newXp).level,
        dreamsCompleted: Math.max(0, progress.dreamsCompleted - 1),
      });
    }

    await ctx.db.patch(args.id, {
      status: 'active',
      completedAt: undefined,
    });

    return { xpDeducted: xpReward };
  },
});

// Permanently delete a dream
export const remove = mutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const dream = await ctx.db.get(args.id);
    if (!dream) return; // Idempotent: already deleted
    if (dream.userId !== userId) throw new Error('Forbidden');

    // Get all actions for this dream
    const actions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.id))
      .collect();

    await deductDreamXp(ctx, userId, dream, actions);

    // Delete all associated actions
    await Promise.all(actions.map((action) => ctx.db.delete(action._id)));

    await ctx.db.delete(args.id);
  },
});
