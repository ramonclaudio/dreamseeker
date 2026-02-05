import { query, mutation, type QueryCtx, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';

const getAuthUserId = async (ctx: QueryCtx | MutationCtx) =>
  (await authComponent.safeGetAuthUser(ctx))?._id ?? null;

const requireAuth = async (ctx: QueryCtx | MutationCtx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error('Unauthorized');
  return userId;
};

// Get today's date string in YYYY-MM-DD format
const getTodayString = () => new Date().toISOString().split('T')[0];

// Get start of today in milliseconds
const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
};

// Get a consistent daily challenge (based on date)
export const getDaily = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    // Get all active challenges
    const challenges = await ctx.db
      .query('dailyChallenges')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    if (challenges.length === 0) {
      return null;
    }

    // Use the date to pick a consistent challenge for the day
    const today = getTodayString();
    const dateHash = today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
    const todaysChallenge = challenges[dateHash % challenges.length];

    // Check if user has completed this challenge today
    let isCompleted = false;
    if (userId) {
      const startOfToday = getStartOfToday();
      const completions = await ctx.db
        .query('challengeCompletions')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .filter((q) => q.gte(q.field('completedAt'), startOfToday))
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
  args: { challengeId: v.id('dailyChallenges') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Verify challenge exists
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) throw new Error('Challenge not found');

    // Check if already completed today
    const startOfToday = getStartOfToday();
    const existingCompletion = await ctx.db
      .query('challengeCompletions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('challengeId'), args.challengeId),
          q.gte(q.field('completedAt'), startOfToday)
        )
      )
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
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    const today = getTodayString();

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
        totalXp: progress.totalXp + challenge.xpReward,
        currentStreak: newStreak,
        longestStreak: Math.max(progress.longestStreak, newStreak),
        lastActiveDate: today,
      });
    } else {
      await ctx.db.insert('userProgress', {
        userId,
        totalXp: challenge.xpReward,
        level: 1,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        dreamsCompleted: 0,
        actionsCompleted: 0,
      });
    }

    return { xpAwarded: challenge.xpReward };
  },
});

// Get challenge completion history
export const getHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit ?? 10;
    const completions = await ctx.db
      .query('challengeCompletions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .take(limit);

    // Get challenge details
    const results = [];
    for (const completion of completions) {
      const challenge = await ctx.db.get(completion.challengeId);
      if (challenge) {
        results.push({
          ...completion,
          challenge,
        });
      }
    }

    return results;
  },
});
