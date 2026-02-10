import type { QueryCtx } from './_generated/server';
import type { Id, Doc } from './_generated/dataModel';
import { v } from 'convex/values';
import { authQuery, authMutation } from './functions';
import { awardXp, deductXp } from './helpers';
import { recalculateUserProgress } from './progress';
import { getStartOfDay, getLocalHour } from './dates';
import { requireText } from './validation';
import { MAX_ACTION_TEXT_LENGTH, XP_REWARDS, isEarlyBird, isNightOwl, PERMISSION_GRANTED_WINDOW_MS, LASER_FOCUSED_THRESHOLD, FREE_MAX_ACTIONS_PER_DREAM } from './constants';
import { hasEntitlement } from './revenuecat';
import { PREMIUM_ENTITLEMENT } from './subscriptions';
import { checkAndAwardBadge, applyBadgeXp } from './badgeChecks';
import { createFeedEvent } from './feed';
import { deleteFeedEventsForItem, nullifyFocusSessionAction } from './cascadeDelete';

async function checkActionBadges(
  ctx: Parameters<typeof checkAndAwardBadge>[0] & { db: QueryCtx['db'] },
  userId: string,
  dreamId: Id<'dreams'>,
  dream: Doc<'dreams'> | null,
  timezoneOffsetMinutes: number,
) {
  let newBadge = null;
  let badgeXp = 0;
  const now = Date.now();

  // Check early bird / night owl
  const localHour = getLocalHour(now, timezoneOffsetMinutes);
  if (isEarlyBird(localHour)) {
    const result = await checkAndAwardBadge(ctx, userId, 'early_bird');
    badgeXp += result.xpAwarded;
    if (result.awarded) newBadge = result.badge;
  }
  if (isNightOwl(localHour)) {
    const result = await checkAndAwardBadge(ctx, userId, 'night_owl');
    badgeXp += result.xpAwarded;
    if (result.awarded) newBadge = result.badge;
  }

  // Check permission granted (first action within 24h of dream creation)
  if (dream && now - dream.createdAt < PERMISSION_GRANTED_WINDOW_MS) {
    const result = await checkAndAwardBadge(ctx, userId, 'permission_granted');
    badgeXp += result.xpAwarded;
    if (result.awarded) newBadge = result.badge;
  }

  // Check laser focused (10 actions on one dream in 7 days)
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const dreamActions = await ctx.db
    .query('actions')
    .withIndex('by_dream', (q) => q.eq('dreamId', dreamId))
    .collect();
  const recentDreamActions = dreamActions.filter(
    (a) => a.isCompleted && a.completedAt && a.completedAt >= sevenDaysAgo
  );
  if (recentDreamActions.length >= LASER_FOCUSED_THRESHOLD) {
    const result = await checkAndAwardBadge(ctx, userId, 'laser_focused');
    badgeXp += result.xpAwarded;
    if (result.awarded) newBadge = result.badge;
  }

  await applyBadgeXp(ctx, userId, badgeXp);

  return { newBadge, badgeXp };
}

async function getDreamMap(ctx: QueryCtx, dreamIds: Id<'dreams'>[]) {
  const dreams = await Promise.all(dreamIds.map((id) => ctx.db.get(id)));
  return new Map(
    dreams.filter((d): d is Doc<'dreams'> => d !== null).map((d) => [d._id, d])
  );
}

// List actions for a dream
export const list = authQuery({
  args: { dreamId: v.id('dreams') },
  handler: async (ctx, args) => {
    if (!ctx.user) return [];

    // Verify dream ownership
    const dream = await ctx.db.get(args.dreamId);
    if (!dream || dream.userId !== ctx.user) return [];

    const allActions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.dreamId))
      .collect();
    const actions = allActions.filter((a) => a.status !== 'archived');

    return actions.sort((a, b) => a.order - b.order);
  },
});

// List all pending actions for the user (for Today tab)
export const listPending = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return [];

    const pendingActions = await ctx.db
      .query('actions')
      .withIndex('by_user_completed', (q) => q.eq('userId', ctx.user!).eq('isCompleted', false))
      .collect();
    const actions = pendingActions.filter((a) => a.status !== 'archived');

    // Get dream titles for context, filtering out archived dreams
    const dreamIds = Array.from(new Set(actions.map((a) => a.dreamId)));
    const dreamMap = await getDreamMap(ctx, dreamIds);

    // Only return actions for active dreams
    return actions
      .filter((action) => {
        const dream = dreamMap.get(action.dreamId);
        return dream && dream.status !== 'archived';
      })
      .map((action) => ({
        ...action,
        dreamTitle: dreamMap.get(action.dreamId)?.title ?? 'Unknown Dream',
        dreamCategory: dreamMap.get(action.dreamId)?.category,
      }));
  },
});

// List actions completed today (for daily review)
export const listCompletedToday = authQuery({
  args: { timezone: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.user) return [];

    const startOfToday = getStartOfDay(args.timezone);

    const completedActions = await ctx.db
      .query('actions')
      .withIndex('by_user_completed', (q) => q.eq('userId', ctx.user!).eq('isCompleted', true))
      .collect();
    const actions = completedActions.filter(
      (a) => a.completedAt && a.completedAt >= startOfToday && a.status !== 'archived'
    );

    // Get dream titles
    const dreamIds = Array.from(new Set(actions.map((a) => a.dreamId)));
    const dreamMap = await getDreamMap(ctx, dreamIds);

    return actions.map((action) => ({
      ...action,
      dreamTitle: dreamMap.get(action.dreamId)?.title ?? 'Unknown Dream',
    }));
  },
});

// Create a new action
export const create = authMutation({
  args: {
    dreamId: v.id('dreams'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.user;

    // Verify dream ownership
    const dream = await ctx.db.get(args.dreamId);
    if (!dream) throw new Error('Dream not found');
    if (dream.userId !== userId) throw new Error('Forbidden');
    if (dream.status !== 'active') throw new Error('Cannot add actions to a non-active dream');

    const trimmedText = requireText(args.text, MAX_ACTION_TEXT_LENGTH, 'Action text');

    // Get the highest order number for this dream
    const existingActions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.dreamId))
      .collect();

    // Free tier: max 10 active actions per dream
    const activeActions = existingActions.filter((a) => a.status !== 'archived');
    const isPremium = await hasEntitlement(ctx, {
      appUserId: userId,
      entitlementId: PREMIUM_ENTITLEMENT,
    });
    if (!isPremium && activeActions.length >= FREE_MAX_ACTIONS_PER_DREAM) {
      throw new Error('FREE_ACTION_LIMIT');
    }

    const maxOrder = existingActions.reduce((max, a) => Math.max(max, a.order), -1);

    const actionId = await ctx.db.insert('actions', {
      userId,
      dreamId: args.dreamId,
      text: trimmedText,
      isCompleted: false,
      order: maxOrder + 1,
      status: 'active',
      createdAt: Date.now(),
    });

    return actionId;
  },
});

// Toggle action completion
export const toggle = authMutation({
  args: {
    id: v.id('actions'),
    timezoneOffsetMinutes: v.optional(v.number()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.user;

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

    const xpReward = XP_REWARDS.actionComplete;

    if (newIsCompleted) {
      const { streakMilestone } = await awardXp(ctx, userId, xpReward, {
        incrementActions: 1,
        timezone: args.timezone ?? 'UTC',
      });

      const { newBadge, badgeXp } = await checkActionBadges(
        ctx, userId, action.dreamId, dream, args.timezoneOffsetMinutes ?? 0,
      );

      await createFeedEvent(ctx, userId, 'action_completed', action._id, {
        text: action.text,
        dreamTitle: dream?.title ?? 'Unknown Dream',
      });

      // Check if this is the user's first ever action completion
      const userProgress = await ctx.db
        .query('userProgress')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .first();
      const isFirstAction = userProgress?.actionsCompleted === 1;

      return { xpAwarded: xpReward + badgeXp, completed: true, newBadge, streakMilestone, isFirstAction };
    } else {
      // Deduct XP if uncompleting (minimum 0, don't update streak)
      await deductXp(ctx, userId, xpReward, { decrementActions: 1 });

      return { xpAwarded: -xpReward, completed: false };
    }
  },
});

// Update action text
export const update = authMutation({
  args: {
    id: v.id('actions'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.user;

    const action = await ctx.db.get(args.id);
    if (!action) throw new Error('Action not found');
    if (action.userId !== userId) throw new Error('Forbidden');

    const trimmedText = requireText(args.text, MAX_ACTION_TEXT_LENGTH, 'Action text');

    await ctx.db.patch(args.id, { text: trimmedText });
  },
});

// Delete an action
export const remove = authMutation({
  args: { id: v.id('actions'), timezone: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = ctx.user;

    const action = await ctx.db.get(args.id);
    if (!action) return; // Idempotent: already deleted
    if (action.userId !== userId) throw new Error('Forbidden');

    // Cascade-delete feed events and nullify focus sessions
    const db = ctx.unsafeDb;
    await deleteFeedEventsForItem(db, userId, args.id);
    await nullifyFocusSessionAction(db, userId, args.id);

    await ctx.db.delete(args.id);

    // Recalculate progress from source data
    await recalculateUserProgress(ctx, userId, args.timezone ?? 'UTC');
  },
});
