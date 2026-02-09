import { authMutation } from './functions';
import { v } from 'convex/values';
import { awardXp } from './helpers';
import { XP_REWARDS } from './constants';
import { validateFocusDuration } from './validation';

export const complete = authMutation({
  args: {
    dreamId: v.optional(v.id('dreams')),
    actionId: v.optional(v.id('actions')),
    duration: v.number(), // seconds
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const durationCheck = validateFocusDuration(args.duration);
    if (!durationCheck.valid) throw new Error(durationCheck.error!);

    // Validate dream ownership if provided
    if (args.dreamId) {
      const dream = await ctx.db.get('dreams', args.dreamId);
      if (!dream || dream.userId !== ctx.user) throw new Error('Dream not found');
    }

    // Validate action ownership if provided
    if (args.actionId) {
      const action = await ctx.db.get('actions', args.actionId);
      if (!action || action.userId !== ctx.user) throw new Error('Action not found');
    }

    await ctx.db.insert('focusSessions', {
      userId: ctx.user,
      dreamId: args.dreamId,
      actionId: args.actionId,
      duration: args.duration,
      completedAt: Date.now(),
    });

    // Award XP and update streak
    const xpReward = XP_REWARDS.focusSession;
    const { streakMilestone } = await awardXp(ctx, ctx.user, xpReward, {
      timezone: args.timezone ?? 'UTC',
    });

    return { xpAwarded: xpReward, streakMilestone };
  },
});
