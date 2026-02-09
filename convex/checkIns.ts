import { query, mutation } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId, requireAuth, awardXp, deductXp } from './helpers';
import { getTodayString } from './dates';
import { moodValidator, XP_REWARDS, MAX_INTENTION_LENGTH, MAX_REFLECTION_LENGTH } from './constants';
import { checkLength } from './validation';
import type { Mood } from './constants';

export const getTodayCheckIns = query({
  args: { timezone: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const today = getTodayString(args.timezone);
    const checkIns = await ctx.db
      .query('checkIns')
      .withIndex('by_user_date', (q) => q.eq('userId', userId).eq('date', today))
      .collect();

    return {
      morning: checkIns.find((c) => c.type === 'morning') ?? null,
      evening: checkIns.find((c) => c.type === 'evening') ?? null,
    };
  },
});

/** Shared logic for morning/evening check-in submissions. */
async function submitCheckIn(
  ctx: MutationCtx,
  type: 'morning' | 'evening',
  timezone: string,
  fields: { mood?: Mood; intention?: string; reflection?: string }
) {
  const userId = await requireAuth(ctx);
  const today = getTodayString(timezone);

  // Check for duplicate
  const existing = await ctx.db
    .query('checkIns')
    .withIndex('by_user_date', (q) => q.eq('userId', userId).eq('date', today))
    .filter((q) => q.eq(q.field('type'), type))
    .first();

  if (existing) throw new Error(`${type === 'morning' ? 'Morning' : 'Evening'} check-in already submitted`);

  await ctx.db.insert('checkIns', {
    userId,
    type,
    date: today,
    ...fields,
    createdAt: Date.now(),
  });

  const xpReward = XP_REWARDS.checkIn;
  const { streakMilestone } = await awardXp(ctx, userId, xpReward, { timezone });

  return { xpAwarded: xpReward, streakMilestone };
}

export const submitMorning = mutation({
  args: {
    mood: moodValidator,
    intention: v.optional(v.string()),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const intention = args.intention?.trim();
    checkLength(intention, MAX_INTENTION_LENGTH, 'Intention');
    return submitCheckIn(ctx, 'morning', args.timezone, {
      mood: args.mood,
      intention,
    });
  },
});

export const remove = mutation({
  args: { id: v.id('checkIns') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const checkIn = await ctx.db.get(args.id);
    if (!checkIn) return;
    if (checkIn.userId !== userId) throw new Error('Forbidden');

    await ctx.db.delete(args.id);

    // Deduct XP
    await deductXp(ctx, userId, XP_REWARDS.checkIn);
  },
});

export const submitEvening = mutation({
  args: {
    reflection: v.optional(v.string()),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const reflection = args.reflection?.trim();
    checkLength(reflection, MAX_REFLECTION_LENGTH, 'Reflection');
    return submitCheckIn(ctx, 'evening', args.timezone, {
      reflection,
    });
  },
});
