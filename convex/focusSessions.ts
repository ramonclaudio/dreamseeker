import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireAuth, awardXp } from './helpers';
import { XP_REWARDS } from './constants';
import { validateFocusDuration } from './validation';

export const complete = mutation({
  args: {
    dreamId: v.optional(v.id('dreams')),
    actionId: v.optional(v.id('actions')),
    duration: v.number(), // seconds
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const durationCheck = validateFocusDuration(args.duration);
    if (!durationCheck.valid) throw new Error(durationCheck.error!);

    // Validate dream ownership if provided
    if (args.dreamId) {
      const dream = await ctx.db.get(args.dreamId);
      if (!dream || dream.userId !== userId) throw new Error('Dream not found');
    }

    // Validate action ownership if provided
    if (args.actionId) {
      const action = await ctx.db.get(args.actionId);
      if (!action || action.userId !== userId) throw new Error('Action not found');
    }

    await ctx.db.insert('focusSessions', {
      userId,
      dreamId: args.dreamId,
      actionId: args.actionId,
      duration: args.duration,
      completedAt: Date.now(),
    });

    // Award XP and update streak
    const xpReward = XP_REWARDS.focusSession;
    const { streakMilestone } = await awardXp(ctx, userId, xpReward, {
      timezone: args.timezone ?? 'UTC',
    });

    return { xpAwarded: xpReward, streakMilestone };
  },
});
