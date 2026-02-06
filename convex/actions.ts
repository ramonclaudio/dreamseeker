import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId, requireAuth, getTodayString, getYesterdayString, calculateStreak } from './helpers';
import { MAX_ACTION_TEXT_LENGTH, XP_REWARDS, getLevelFromXp } from './constants';

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
        .filter((d): d is NonNullable<typeof d> => d !== null && d.status !== 'archived')
        .map((d) => [d._id, d])
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
    if (action.status === 'archived') throw new Error('Cannot toggle an archived action');

    // Verify parent dream is not archived
    const dream = await ctx.db.get(action.dreamId);
    if (dream?.status === 'archived') throw new Error('Cannot toggle actions in an archived dream');

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
    const yesterday = getYesterdayString();
    const xpReward = XP_REWARDS.actionComplete;

    if (newIsCompleted) {
      if (progress) {
        const newStreak = calculateStreak(
          progress.currentStreak,
          progress.lastActiveDate,
          today,
          yesterday
        );
        const newXp = progress.totalXp + xpReward;

        await ctx.db.patch(progress._id, {
          totalXp: newXp,
          level: getLevelFromXp(newXp).level,
          actionsCompleted: progress.actionsCompleted + 1,
          currentStreak: newStreak,
          longestStreak: Math.max(progress.longestStreak, newStreak),
          lastActiveDate: today,
        });
      } else {
        await ctx.db.insert('userProgress', {
          userId,
          totalXp: xpReward,
          level: getLevelFromXp(xpReward).level,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
          dreamsCompleted: 0,
          actionsCompleted: 1,
        });
      }

      return { xpAwarded: xpReward, completed: true };
    } else {
      // Deduct XP if uncompleting (minimum 0, don't update streak)
      if (progress && progress.totalXp > 0) {
        const newXp = Math.max(0, progress.totalXp - xpReward);
        await ctx.db.patch(progress._id, {
          totalXp: newXp,
          level: getLevelFromXp(newXp).level,
          actionsCompleted: Math.max(0, progress.actionsCompleted - 1),
        });
      }

      return { xpAwarded: -xpReward, completed: false };
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

    const dream = await ctx.db.get(args.dreamId);
    if (!dream) throw new Error('Dream not found');
    if (dream.userId !== userId) throw new Error('Forbidden');

    if (args.actionIds.length > 100) throw new Error('Too many actions');

    await Promise.all(
      args.actionIds.map(async (actionId, i) => {
        const action = await ctx.db.get(actionId);
        if (action && action.userId === userId && action.dreamId === args.dreamId) {
          await ctx.db.patch(actionId, { order: i });
        }
      })
    );
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

    // Deduct XP if the action was completed
    if (action.isCompleted) {
      const progress = await ctx.db
        .query('userProgress')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .first();

      if (progress) {
        const newXp = Math.max(0, progress.totalXp - XP_REWARDS.actionComplete);
        await ctx.db.patch(progress._id, {
          totalXp: newXp,
          level: getLevelFromXp(newXp).level,
          actionsCompleted: Math.max(0, progress.actionsCompleted - 1),
        });
      }
    }

    await ctx.db.delete(args.id);
  },
});
