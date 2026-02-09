import { query, mutation } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import {
  getAuthUserId,
  requireAuth,
  createDefaultProgress,
} from './helpers';
import { getTodayString, getYesterdayString, getStartOfDay, timestampToDateString } from './dates';
import { getLevelFromXp, getXpToNextLevel } from './constants';

export const getProgress = query({
  args: { timezone: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const defaultProgress = {
      totalXp: 0,
      level: 1,
      levelTitle: 'Dreamer' as string,
      currentStreak: 0,
      longestStreak: 0,
      dreamsCompleted: 0,
      actionsCompleted: 0,
      xpToNextLevel: 100,
      xpProgress: 0,
      streakMilestones: [] as number[],
    };

    if (!userId) return defaultProgress;

    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!progress) return defaultProgress;

    const currentLevel = getLevelFromXp(progress.totalXp);
    const { current, needed, progress: xpProgress } = getXpToNextLevel(progress.totalXp);
    const xpToNextLevel = Math.max(0, needed - current);

    // Check if streak is still valid (user was active yesterday or today)
    const today = getTodayString(args.timezone);
    const yesterday = getYesterdayString(args.timezone);

    let currentStreak = progress.currentStreak;
    if (progress.lastActiveDate !== today && progress.lastActiveDate !== yesterday) {
      currentStreak = 0; // Streak broken
    }

    return {
      totalXp: progress.totalXp,
      level: currentLevel.level,
      levelTitle: currentLevel.title,
      currentStreak,
      longestStreak: progress.longestStreak,
      dreamsCompleted: progress.dreamsCompleted,
      actionsCompleted: progress.actionsCompleted,
      xpToNextLevel,
      xpProgress,
      streakMilestones: progress.streakMilestones ?? [],
    };
  },
});

// ── Weekly Activity Helpers ─────────────────────────────────────────────────

/** Tally completed (non-archived) actions within the cutoff window. */
async function tallyCompletedActions(
  ctx: QueryCtx,
  userId: string,
  cutoff: number,
  timezone: string,
  activity: Record<string, number>
) {
  const actions = await ctx.db
    .query('actions')
    .withIndex('by_user_completed', (q) => q.eq('userId', userId).eq('isCompleted', true))
    .filter((q) =>
      q.and(
        q.gte(q.field('completedAt'), cutoff),
        q.neq(q.field('status'), 'archived')
      )
    )
    .collect();

  for (const action of actions) {
    if (action.completedAt) {
      addToActivity(activity, timestampToDateString(action.completedAt, timezone));
    }
  }
}

/** Tally date-indexed records (checkIns, journalEntries) within the cutoff date. */
async function tallyDateIndexedRecords(
  ctx: QueryCtx,
  table: 'checkIns' | 'journalEntries',
  userId: string,
  cutoffDate: string,
  activity: Record<string, number>
) {
  const records = await ctx.db
    .query(table)
    .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('date', cutoffDate))
    .collect();

  for (const record of records) {
    addToActivity(activity, record.date);
  }
}

/** Tally focus sessions within the cutoff. */
async function tallyFocusSessions(
  ctx: QueryCtx,
  userId: string,
  cutoff: number,
  timezone: string,
  activity: Record<string, number>
) {
  const records = await ctx.db
    .query('focusSessions')
    .withIndex('by_user_completedAt', (q) => q.eq('userId', userId).gte('completedAt', cutoff))
    .collect();

  for (const record of records) {
    addToActivity(activity, timestampToDateString(record.completedAt, timezone));
  }
}

/** Tally challenge completions within the cutoff. */
async function tallyChallengeCompletions(
  ctx: QueryCtx,
  userId: string,
  cutoff: number,
  timezone: string,
  activity: Record<string, number>
) {
  const records = await ctx.db
    .query('challengeCompletions')
    .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('completedAt', cutoff))
    .collect();

  for (const record of records) {
    addToActivity(activity, timestampToDateString(record.completedAt, timezone));
  }
}

function addToActivity(activity: Record<string, number>, date: string) {
  activity[date] = (activity[date] ?? 0) + 1;
}

export const getWeeklyActivity = query({
  args: { timezone: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return {};

    const todayStr = getTodayString(args.timezone);
    const sevenDaysAgo = new Date(todayStr);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const cutoffDate = new Intl.DateTimeFormat('en-CA', { timeZone: args.timezone }).format(sevenDaysAgo);
    const cutoff = getStartOfDay(args.timezone) - 6 * 24 * 60 * 60 * 1000;

    const activity: Record<string, number> = {};

    await tallyCompletedActions(ctx, userId, cutoff, args.timezone, activity);
    await tallyDateIndexedRecords(ctx, 'checkIns', userId, cutoffDate, activity);
    await tallyDateIndexedRecords(ctx, 'journalEntries', userId, cutoffDate, activity);
    await tallyFocusSessions(ctx, userId, cutoff, args.timezone, activity);
    await tallyChallengeCompletions(ctx, userId, cutoff, args.timezone, activity);

    return activity;
  },
});

export const initialize = mutation({
  args: { timezone: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const existing = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert('userProgress', createDefaultProgress(userId, {
      timezone: args.timezone ?? 'UTC',
    }));
  },
});

// ── Weekly Summary ─────────────────────────────────────────────────

export const getWeeklySummary = query({
  args: { timezone: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { actionsCompleted: 0, journalEntries: 0, currentStreak: 0, xpEarned: 0 };

    const todayStr = getTodayString(args.timezone);
    const sevenDaysAgo = new Date(todayStr);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const cutoffDate = new Intl.DateTimeFormat('en-CA', { timeZone: args.timezone }).format(sevenDaysAgo);
    const cutoff = getStartOfDay(args.timezone) - 6 * 24 * 60 * 60 * 1000;

    // Count completed actions this week
    const actions = await ctx.db
      .query('actions')
      .withIndex('by_user_completed', (q) => q.eq('userId', userId).eq('isCompleted', true))
      .filter((q) =>
        q.and(
          q.gte(q.field('completedAt'), cutoff),
          q.neq(q.field('status'), 'archived')
        )
      )
      .collect();

    // Count journal entries this week
    const journals = await ctx.db
      .query('journalEntries')
      .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('date', cutoffDate))
      .collect();

    // Get current streak
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    const yesterday = getYesterdayString(args.timezone);
    let currentStreak = progress?.currentStreak ?? 0;

    // Validate streak (same as getProgress)
    if (progress && progress.lastActiveDate !== todayStr && progress.lastActiveDate !== yesterday) {
      currentStreak = 0;
    }

    // Calculate XP earned this week
    // Each action = 10 XP, each journal = 10 XP
    const xpFromActions = actions.length * 10;
    const xpFromJournals = journals.length * 10;

    // Count check-ins this week (5 XP each)
    const checkIns = await ctx.db
      .query('checkIns')
      .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('date', cutoffDate))
      .collect();
    const xpFromCheckIns = checkIns.length * 5;

    // Count focus sessions this week (15 XP each)
    const focusSessions = await ctx.db
      .query('focusSessions')
      .withIndex('by_user_completedAt', (q) => q.eq('userId', userId).gte('completedAt', cutoff))
      .collect();
    const xpFromFocus = focusSessions.length * 15;

    const xpEarned = xpFromActions + xpFromJournals + xpFromCheckIns + xpFromFocus;

    return {
      actionsCompleted: actions.length,
      journalEntries: journals.length,
      currentStreak,
      xpEarned,
    };
  },
});

// ── Activity Heatmap Data ─────────────────────────────────────────────────

export const getActivityHeatmap = query({
  args: { timezone: v.string(), days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { activityData: {}, currentStreak: 0, longestStreak: 0 };

    const daysToFetch = args.days ?? 120; // Default to ~4 months
    const todayStr = getTodayString(args.timezone);
    const cutoffDate = new Date(todayStr);
    cutoffDate.setDate(cutoffDate.getDate() - daysToFetch + 1);
    const cutoffDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: args.timezone }).format(cutoffDate);
    const cutoff = getStartOfDay(args.timezone) - (daysToFetch - 1) * 24 * 60 * 60 * 1000;

    const activity: Record<string, number> = {};

    // Tally all activity types
    await tallyCompletedActions(ctx, userId, cutoff, args.timezone, activity);
    await tallyDateIndexedRecords(ctx, 'checkIns', userId, cutoffDateStr, activity);
    await tallyDateIndexedRecords(ctx, 'journalEntries', userId, cutoffDateStr, activity);
    await tallyFocusSessions(ctx, userId, cutoff, args.timezone, activity);
    await tallyChallengeCompletions(ctx, userId, cutoff, args.timezone, activity);

    // Get streaks from userProgress
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    const yesterday = getYesterdayString(args.timezone);
    let currentStreak = progress?.currentStreak ?? 0;

    // Validate streak (same as getProgress)
    if (progress && progress.lastActiveDate !== todayStr && progress.lastActiveDate !== yesterday) {
      currentStreak = 0;
    }

    return {
      activityData: activity,
      currentStreak,
      longestStreak: progress?.longestStreak ?? 0,
    };
  },
});
