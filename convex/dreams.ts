import { query, mutation, type QueryCtx, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id, Doc } from './_generated/dataModel';
import { authComponent } from './auth';
import { TIERS, PREMIUM_ENTITLEMENT } from './subscriptions';
import { hasEntitlement } from './revenuecat';

const MAX_TITLE_LENGTH = 200;
const MAX_WHY_LENGTH = 500;

const dreamCategory = v.union(
  v.literal('travel'),
  v.literal('money'),
  v.literal('career'),
  v.literal('lifestyle'),
  v.literal('growth'),
  v.literal('relationships')
);

const getAuthUserId = async (ctx: QueryCtx | MutationCtx) =>
  (await authComponent.safeGetAuthUser(ctx))?._id ?? null;

const requireAuth = async (ctx: QueryCtx | MutationCtx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error('Unauthorized');
  return userId;
};

const getOwnedDream = async (ctx: MutationCtx, id: Id<'dreams'>, userId: string) => {
  const dream = await ctx.db.get(id);
  if (!dream) throw new Error('Dream not found');
  if (dream.userId !== userId) throw new Error('Forbidden');
  return dream;
};

// List all active dreams for the current user
export const list = query({
  args: { category: v.optional(dreamCategory) },
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
      .collect();

    // Sort by order
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
    category: dreamCategory,
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

    // Check tier limits - O(limit) instead of O(n)
    const isPremium = await hasEntitlement(ctx, {
      appUserId: userId,
      entitlementId: PREMIUM_ENTITLEMENT,
    });

    if (!isPremium) {
      const limit = TIERS.free.limit;
      const dreams = await ctx.db
        .query('dreams')
        .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
        .take(limit);
      if (dreams.length >= limit) {
        throw new Error('LIMIT_REACHED');
      }
    }

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
    category: v.optional(dreamCategory),
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

    // Award XP for completing a dream (100 XP)
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (progress) {
      await ctx.db.patch(progress._id, {
        totalXp: progress.totalXp + 100,
        dreamsCompleted: progress.dreamsCompleted + 1,
      });
    } else {
      await ctx.db.insert('userProgress', {
        userId,
        totalXp: 100,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        dreamsCompleted: 1,
        actionsCompleted: 0,
      });
    }

    return { xpAwarded: 100 };
  },
});

// Archive a dream (soft delete) - reverses XP and stats
export const archive = mutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const dream = await getOwnedDream(ctx, args.id, userId);

    // Get all completed actions for this dream
    const actions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.id))
      .collect();

    const completedActionsCount = actions.filter((a) => a.isCompleted).length;

    // Calculate XP to deduct
    let xpToDeduct = completedActionsCount * 10; // 10 XP per completed action
    let dreamsToDeduct = 0;

    // If dream was completed, also deduct dream completion bonus
    if (dream.status === 'completed') {
      xpToDeduct += 100;
      dreamsToDeduct = 1;
    }

    // Update user progress
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (progress && xpToDeduct > 0) {
      await ctx.db.patch(progress._id, {
        totalXp: Math.max(0, progress.totalXp - xpToDeduct),
        actionsCompleted: Math.max(0, progress.actionsCompleted - completedActionsCount),
        dreamsCompleted: Math.max(0, progress.dreamsCompleted - dreamsToDeduct),
      });
    }

    // Archive all actions for this dream
    for (const action of actions) {
      await ctx.db.patch(action._id, { status: 'archived' });
    }

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
      const isPremium = await hasEntitlement(ctx, {
        appUserId: userId,
        entitlementId: PREMIUM_ENTITLEMENT,
      });

      if (!isPremium) {
        const limit = TIERS.free.limit;
        const activeDreams = await ctx.db
          .query('dreams')
          .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
          .take(limit);
        if (activeDreams.length >= limit) {
          throw new Error('LIMIT_REACHED');
        }
      }
    }

    // Get all completed actions for this dream to restore XP
    const actions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.id))
      .collect();

    const completedActionsCount = actions.filter((a) => a.isCompleted).length;

    // Calculate XP to restore
    let xpToRestore = completedActionsCount * 10;
    let dreamsToRestore = 0;

    // If dream was completed before archiving, restore dream completion bonus
    if (dream.completedAt) {
      xpToRestore += 100;
      dreamsToRestore = 1;
    }

    // Update user progress
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (progress && xpToRestore > 0) {
      await ctx.db.patch(progress._id, {
        totalXp: progress.totalXp + xpToRestore,
        actionsCompleted: progress.actionsCompleted + completedActionsCount,
        dreamsCompleted: progress.dreamsCompleted + dreamsToRestore,
      });
    }

    // Restore all actions for this dream
    for (const action of actions) {
      await ctx.db.patch(action._id, { status: 'active' });
    }

    await ctx.db.patch(args.id, { status: restoreToStatus });

    return { xpRestored: xpToRestore };
  },
});

// Reopen a completed dream - reverses all completion rewards
export const reopen = mutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const dream = await getOwnedDream(ctx, args.id, userId);

    if (dream.status !== 'completed') {
      throw new Error('Dream is not completed');
    }

    // Check tier limits before reopening
    const isPremium = await hasEntitlement(ctx, {
      appUserId: userId,
      entitlementId: PREMIUM_ENTITLEMENT,
    });

    if (!isPremium) {
      const limit = TIERS.free.limit;
      const activeDreams = await ctx.db
        .query('dreams')
        .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
        .take(limit);
      if (activeDreams.length >= limit) {
        throw new Error('LIMIT_REACHED');
      }
    }

    // Reverse the completion rewards (100 XP + dreamsCompleted count)
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (progress) {
      await ctx.db.patch(progress._id, {
        totalXp: Math.max(0, progress.totalXp - 100),
        dreamsCompleted: Math.max(0, progress.dreamsCompleted - 1),
      });
    }

    await ctx.db.patch(args.id, {
      status: 'active',
      completedAt: undefined,
    });

    return { xpDeducted: 100 };
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

    // Delete all associated actions
    const actions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.id))
      .collect();

    for (const action of actions) {
      await ctx.db.delete(action._id);
    }

    await ctx.db.delete(args.id);
  },
});
