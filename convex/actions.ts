import { query, mutation, type QueryCtx, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { authComponent } from './auth';

const MAX_ACTION_TEXT_LENGTH = 300;

const getAuthUserId = async (ctx: QueryCtx | MutationCtx) =>
  (await authComponent.safeGetAuthUser(ctx))?._id ?? null;

const requireAuth = async (ctx: QueryCtx | MutationCtx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error('Unauthorized');
  return userId;
};

// Get today's date string in YYYY-MM-DD format
const getTodayString = () => new Date().toISOString().split('T')[0];

// List actions for a dream
export const list = query({
  args: { dreamId: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify dream ownership
    const dream = await ctx.db.get(args.dreamId);
    if (!dream || dream.userId !== userId) return [];

    const actions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.dreamId))
      .filter((q) => q.neq(q.field('status'), 'archived'))
      .collect();

    // Sort by order
    return actions.sort((a, b) => a.order - b.order);
  },
});

// List all pending actions for the user (for Today tab)
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const actions = await ctx.db
      .query('actions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('isCompleted'), false),
          q.neq(q.field('status'), 'archived')
        )
      )
      .collect();

    // Get dream titles for context, filtering out archived dreams
    const dreamIds = [...new Set(actions.map((a) => a.dreamId))];
    const dreams = await Promise.all(dreamIds.map((id) => ctx.db.get(id)));
    const activeDreamMap = new Map(
      dreams
        .filter((d) => d && d.status !== 'archived')
        .map((d) => [d!._id, d!])
    );

    // Only return actions for active dreams
    return actions
      .filter((action) => activeDreamMap.has(action.dreamId))
      .map((action) => ({
        ...action,
        dreamTitle: activeDreamMap.get(action.dreamId)?.title ?? 'Unknown Dream',
        dreamCategory: activeDreamMap.get(action.dreamId)?.category,
      }));
  },
});

// Create a new action
export const create = mutation({
  args: {
    dreamId: v.id('dreams'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Verify dream ownership
    const dream = await ctx.db.get(args.dreamId);
    if (!dream) throw new Error('Dream not found');
    if (dream.userId !== userId) throw new Error('Forbidden');
    if (dream.status !== 'active') throw new Error('Cannot add actions to a non-active dream');

    const trimmedText = args.text.trim();
    if (trimmedText.length === 0) throw new Error('Action text cannot be empty');
    if (trimmedText.length > MAX_ACTION_TEXT_LENGTH)
      throw new Error(`Action text cannot exceed ${MAX_ACTION_TEXT_LENGTH} characters`);

    // Get the highest order number for this dream
    const existingActions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.dreamId))
      .collect();

    const maxOrder = existingActions.reduce((max, a) => Math.max(max, a.order), -1);

    return await ctx.db.insert('actions', {
      userId,
      dreamId: args.dreamId,
      text: trimmedText,
      isCompleted: false,
      order: maxOrder + 1,
      status: 'active',
      createdAt: Date.now(),
    });
  },
});

// Toggle action completion
export const toggle = mutation({
  args: { id: v.id('actions') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const action = await ctx.db.get(args.id);
    if (!action) throw new Error('Action not found');
    if (action.userId !== userId) throw new Error('Forbidden');

    const newIsCompleted = !action.isCompleted;

    await ctx.db.patch(args.id, {
      isCompleted: newIsCompleted,
      completedAt: newIsCompleted ? Date.now() : undefined,
    });

    // Update user progress
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    const today = getTodayString();

    if (newIsCompleted) {
      // Award XP for completing an action (10 XP)
      if (progress) {
        // Check if this updates the streak
        const lastActive = progress.lastActiveDate;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        let newStreak = progress.currentStreak;
        if (lastActive === yesterdayString) {
          newStreak = progress.currentStreak + 1;
        } else if (lastActive !== today) {
          newStreak = 1; // Reset streak
        }

        await ctx.db.patch(progress._id, {
          totalXp: progress.totalXp + 10,
          actionsCompleted: progress.actionsCompleted + 1,
          currentStreak: newStreak,
          longestStreak: Math.max(progress.longestStreak, newStreak),
          lastActiveDate: today,
        });
      } else {
        await ctx.db.insert('userProgress', {
          userId,
          totalXp: 10,
          level: 1,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
          dreamsCompleted: 0,
          actionsCompleted: 1,
        });
      }

      return { xpAwarded: 10, completed: true };
    } else {
      // Deduct XP if uncompleting (minimum 0)
      if (progress && progress.totalXp > 0) {
        await ctx.db.patch(progress._id, {
          totalXp: Math.max(0, progress.totalXp - 10),
          actionsCompleted: Math.max(0, progress.actionsCompleted - 1),
        });
      }

      return { xpAwarded: -10, completed: false };
    }
  },
});

// Update action text
export const update = mutation({
  args: {
    id: v.id('actions'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const action = await ctx.db.get(args.id);
    if (!action) throw new Error('Action not found');
    if (action.userId !== userId) throw new Error('Forbidden');

    const trimmedText = args.text.trim();
    if (trimmedText.length === 0) throw new Error('Action text cannot be empty');
    if (trimmedText.length > MAX_ACTION_TEXT_LENGTH)
      throw new Error(`Action text cannot exceed ${MAX_ACTION_TEXT_LENGTH} characters`);

    await ctx.db.patch(args.id, { text: trimmedText });
  },
});

// Reorder actions
export const reorder = mutation({
  args: {
    dreamId: v.id('dreams'),
    actionIds: v.array(v.id('actions')),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Verify dream ownership
    const dream = await ctx.db.get(args.dreamId);
    if (!dream) throw new Error('Dream not found');
    if (dream.userId !== userId) throw new Error('Forbidden');

    // Update order for each action
    for (let i = 0; i < args.actionIds.length; i++) {
      const action = await ctx.db.get(args.actionIds[i]);
      if (action && action.dreamId === args.dreamId) {
        await ctx.db.patch(args.actionIds[i], { order: i });
      }
    }
  },
});

// Delete an action
export const remove = mutation({
  args: { id: v.id('actions') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const action = await ctx.db.get(args.id);
    if (!action) return; // Idempotent: already deleted
    if (action.userId !== userId) throw new Error('Forbidden');

    await ctx.db.delete(args.id);
  },
});
