import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId, requireAuth, awardXp } from './helpers';
import { getTodayString, getStartOfDay, dateToDailyIndex } from './dates';
import { checkAndAwardBadge, applyBadgeXp } from './badgeChecks';

// Get a consistent daily challenge (based on date)
export const getDaily = query({
  args: { timezone: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Get all active challenges
    const challenges = await ctx.db
      .query('dailyChallenges')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    if (challenges.length === 0) {
      return null;
    }

    // Use the date to pick a consistent challenge for the day
    const today = getTodayString(args.timezone);
    const todaysChallenge = challenges[dateToDailyIndex(today, challenges.length)];

    // Check if user has completed this challenge today
    let isCompleted = false;
    if (userId) {
      const startOfToday = getStartOfDay(args.timezone);
      const completions = await ctx.db
        .query('challengeCompletions')
        .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('completedAt', startOfToday))
        .collect();

      isCompleted = completions.some((c) => c.challengeId === todaysChallenge._id);
    }

    return {
      ...todaysChallenge,
      isCompleted,
    };
  },
});

// Complete today's challenge
export const complete = mutation({
  args: { challengeId: v.id('dailyChallenges'), timezone: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Verify challenge exists
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) throw new Error('Challenge not found');
    if (!challenge.isActive) throw new Error('Challenge is not active');

    // Check if already completed today
    const startOfToday = getStartOfDay(args.timezone);
    const existingCompletion = await ctx.db
      .query('challengeCompletions')
      .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('completedAt', startOfToday))
      .filter((q) => q.eq(q.field('challengeId'), args.challengeId))
      .first();

    if (existingCompletion) {
      throw new Error('Challenge already completed today');
    }

    // Record completion
    await ctx.db.insert('challengeCompletions', {
      userId,
      challengeId: args.challengeId,
      completedAt: Date.now(),
    });

    // Award XP
    const { streakMilestone } = await awardXp(ctx, userId, challenge.xpReward, {
      timezone: args.timezone,
    });

    // Badge checks — accumulate XP, apply in a single patch at the end
    let newBadge = null;
    let badgeXp = 0;

    // Check risk_seeker if comfort zone challenge
    if (challenge.isComfortZone) {
      const comfortZoneChallenges = await ctx.db
        .query('dailyChallenges')
        .filter((q) => q.eq(q.field('isComfortZone'), true))
        .collect();

      // Use by_user_challenge index to check each comfort zone challenge individually
      let czCount = 0;
      for (const cz of comfortZoneChallenges) {
        const completion = await ctx.db
          .query('challengeCompletions')
          .withIndex('by_user_challenge', (q) => q.eq('userId', userId).eq('challengeId', cz._id))
          .first();
        if (completion) czCount++;
        if (czCount >= 5) break;
      }

      if (czCount >= 5) {
        const result = await checkAndAwardBadge(ctx, userId, 'risk_seeker');
        badgeXp += result.xpAwarded;
        if (result.awarded) newBadge = result.badge;
      }
    }

    // Single patch for all badge XP
    await applyBadgeXp(ctx, userId, badgeXp);

    return { xpAwarded: challenge.xpReward + badgeXp, newBadge, streakMilestone };
  },
});

