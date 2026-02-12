import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { v } from 'convex/values';
import { authQuery, authMutation } from './functions';
import { getTodayString, getYesterdayString, getStartOfDay, timestampToDateString } from './dates';
import { getLevelFromXp, getXpToNextLevel, XP_REWARDS, DREAM_CATEGORIES, STREAK_XP_REWARDS } from './constants';

// ── Shared Helpers ──────────────────────────────────────────────────────────

/** Compute date cutoffs for a given timezone and lookback window. */
function getDateRange(timezone: string, days: number) {
  const todayStr = getTodayString(timezone);
  const cutoffDate = new Date(todayStr);
  cutoffDate.setDate(cutoffDate.getDate() - days + 1);
  const cutoffStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(cutoffDate);
  const cutoffMs = getStartOfDay(timezone) - (days - 1) * 24 * 60 * 60 * 1000;
  return { todayStr, cutoffStr, cutoffMs };
}

/** Validate a streak against today/yesterday — returns 0 if broken. */
function validateCurrentStreak(
  progress: Pick<Doc<'userProgress'>, 'currentStreak' | 'lastActiveDate'> | null,
  timezone: string,
  todayStr?: string,
): number {
  if (!progress) return 0;
  const today = todayStr ?? getTodayString(timezone);
  const yesterday = getYesterdayString(timezone);
  if (progress.lastActiveDate !== today && progress.lastActiveDate !== yesterday) return 0;
  return progress.currentStreak;
}

/** Return the next calendar day as YYYY-MM-DD. */
function nextDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y!, m! - 1, d!);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Compute current and longest streak from actual activity dates. */
function computeStreaksFromActivity(
  activityData: Record<string, number>,
  timezone: string,
): { currentStreak: number; longestStreak: number } {
  const dates = Object.keys(activityData).sort();
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Find longest consecutive run
  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    if (nextDay(dates[i - 1]!) === dates[i]!) {
      run++;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 1;
    }
  }

  // Current streak: count backwards from last date, but only if it's today or yesterday
  const today = getTodayString(timezone);
  const yesterday = getYesterdayString(timezone);
  const lastDate = dates[dates.length - 1]!;
  let currentStreak = 0;
  if (lastDate === today || lastDate === yesterday) {
    currentStreak = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      if (nextDay(dates[i]!) === dates[i + 1]!) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

// ── Progress Utilities (moved from helpers.ts) ──────────────────────────────

export function createDefaultProgress(
  userId: string,
  overrides?: {
    totalXp?: number;
    level?: number;
    currentStreak?: number;
    longestStreak?: number;
    dreamsCompleted?: number;
    actionsCompleted?: number;
    timezone?: string;
  }
) {
  return {
    userId,
    totalXp: overrides?.totalXp ?? 0,
    level: overrides?.level ?? 1,
    currentStreak: overrides?.currentStreak ?? 0,
    longestStreak: overrides?.longestStreak ?? 0,
    lastActiveDate: getTodayString(overrides?.timezone ?? 'UTC'),
    dreamsCompleted: overrides?.dreamsCompleted ?? 0,
    actionsCompleted: overrides?.actionsCompleted ?? 0,
  };
}

// ── Queries ─────────────────────────────────────────────────────────────────

export const getProgress = authQuery({
  args: { timezone: v.string() },
  handler: async (ctx, args) => {
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

    if (!ctx.user) return defaultProgress;

    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user!))
      .first();

    if (!progress) return defaultProgress;

    const currentLevel = getLevelFromXp(progress.totalXp);
    const { current, needed, progress: xpProgress } = getXpToNextLevel(progress.totalXp);
    const xpToNextLevel = Math.max(0, needed - current);

    return {
      totalXp: progress.totalXp,
      level: currentLevel.level,
      levelTitle: currentLevel.title,
      currentStreak: validateCurrentStreak(progress, args.timezone),
      longestStreak: progress.longestStreak,
      dreamsCompleted: progress.dreamsCompleted,
      actionsCompleted: progress.actionsCompleted,
      xpToNextLevel,
      xpProgress,
      streakMilestones: progress.streakMilestones ?? [],
    };
  },
});

// ── Unified Activity Tally ──────────────────────────────────────────────────

function addToActivity(activity: Record<string, number>, date: string) {
  activity[date] = (activity[date] ?? 0) + 1;
}

/** Tally all activity types into a single date-keyed map. */
async function tallyActivity(
  ctx: { db: QueryCtx['db'] },
  userId: string,
  timezone: string,
  cutoffMs: number,
  cutoffStr: string,
) {
  const activity: Record<string, number> = {};

  // Completed actions (timestamp-based, exclude archived)
  const allCompleted = await ctx.db
    .query('actions')
    .withIndex('by_user_completed', (q) => q.eq('userId', userId).eq('isCompleted', true))
    .collect();
  for (const a of allCompleted) {
    if (a.completedAt && a.completedAt >= cutoffMs && a.status !== 'archived') {
      addToActivity(activity, timestampToDateString(a.completedAt, timezone));
    }
  }

  // Journal entries (date-indexed)
  const journals = await ctx.db
    .query('journalEntries')
    .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('date', cutoffStr))
    .collect();
  for (const j of journals) addToActivity(activity, j.date);

  // Focus sessions (timestamp-based)
  const sessions = await ctx.db
    .query('focusSessions')
    .withIndex('by_user_completedAt', (q) => q.eq('userId', userId).gte('completedAt', cutoffMs))
    .collect();
  for (const s of sessions) addToActivity(activity, timestampToDateString(s.completedAt, timezone));

  // Challenge completions (timestamp-based)
  const completions = await ctx.db
    .query('challengeCompletions')
    .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('completedAt', cutoffMs))
    .collect();
  for (const c of completions) addToActivity(activity, timestampToDateString(c.completedAt, timezone));

  // Dream creation
  const dreams = await ctx.db
    .query('dreams')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();
  for (const d of dreams) {
    if (d.createdAt >= cutoffMs) addToActivity(activity, timestampToDateString(d.createdAt, timezone));
    if (d.completedAt && d.completedAt >= cutoffMs) addToActivity(activity, timestampToDateString(d.completedAt, timezone));
  }

  // Check-ins (date-indexed)
  const checkIns = await ctx.db
    .query('checkIns')
    .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('date', cutoffStr))
    .collect();
  for (const c of checkIns) addToActivity(activity, c.date);

  // Pin creation
  const pins = await ctx.db
    .query('pins')
    .withIndex('by_user_created', (q) => q.eq('userId', userId).gte('createdAt', cutoffMs))
    .collect();
  for (const p of pins) addToActivity(activity, timestampToDateString(p.createdAt, timezone));

  return activity;
}

export const getWeeklyActivity = authQuery({
  args: { timezone: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.user) return {};
    const { cutoffMs, cutoffStr } = getDateRange(args.timezone, 7);
    return tallyActivity(ctx, ctx.user, args.timezone, cutoffMs, cutoffStr);
  },
});

export const initialize = authMutation({
  args: { timezone: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert('userProgress', createDefaultProgress(ctx.user, {
      timezone: args.timezone ?? 'UTC',
    }));
  },
});

// ── Weekly Summary ──────────────────────────────────────────────────────────

export const getWeeklySummary = authQuery({
  args: { timezone: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.user) return { actionsCompleted: 0, journalEntries: 0, currentStreak: 0, xpEarned: 0 };
    const userId = ctx.user;
    const { todayStr, cutoffStr, cutoffMs } = getDateRange(args.timezone, 7);

    // Count completed actions this week
    const allCompleted = await ctx.db
      .query('actions')
      .withIndex('by_user_completed', (q) => q.eq('userId', userId).eq('isCompleted', true))
      .collect();
    const actions = allCompleted.filter(
      (a) => a.completedAt && a.completedAt >= cutoffMs && a.status !== 'archived'
    );

    // Count journal entries this week
    const journals = await ctx.db
      .query('journalEntries')
      .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('date', cutoffStr))
      .collect();

    // Get current streak
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    // Calculate XP earned this week using constants
    const xpFromActions = actions.length * XP_REWARDS.actionComplete;
    const xpFromJournals = journals.length * XP_REWARDS.journalEntry;

    const checkIns = await ctx.db
      .query('checkIns')
      .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('date', cutoffStr))
      .collect();
    const xpFromCheckIns = checkIns.length * XP_REWARDS.checkIn;

    const focusSessions = await ctx.db
      .query('focusSessions')
      .withIndex('by_user_completedAt', (q) => q.eq('userId', userId).gte('completedAt', cutoffMs))
      .collect();
    const xpFromFocus = focusSessions.length * XP_REWARDS.focusSession;

    return {
      actionsCompleted: actions.length,
      journalEntries: journals.length,
      currentStreak: validateCurrentStreak(progress, args.timezone, todayStr),
      xpEarned: xpFromActions + xpFromJournals + xpFromCheckIns + xpFromFocus,
    };
  },
});

// ── Activity Heatmap ────────────────────────────────────────────────────────

export const getActivityHeatmap = authQuery({
  args: { timezone: v.string(), days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (!ctx.user) return { activityData: {}, currentStreak: 0, longestStreak: 0 };
    const userId = ctx.user;

    const daysToFetch = args.days ?? 120;
    const { todayStr, cutoffStr, cutoffMs } = getDateRange(args.timezone, daysToFetch);

    const activityData = await tallyActivity(ctx, userId, args.timezone, cutoffMs, cutoffStr);

    // Derive streaks from actual activity data so they always match the heatmap
    const streaks = computeStreaksFromActivity(activityData, args.timezone);

    return {
      activityData,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
    };
  },
});

// ── Recalculate Progress ────────────────────────────────────────────────────
// Recomputes totalXp, dreamsCompleted, actionsCompleted from actual source data.
// Call when counters drift (e.g. after deletion).

/** Count all activity and compute total XP from source data. */
async function countAndSumProgress(ctx: MutationCtx, userId: string) {
  const completedDreams = await ctx.db
    .query('dreams')
    .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'completed'))
    .collect();

  const allCompletedActions = await ctx.db
    .query('actions')
    .withIndex('by_user_completed', (q) => q.eq('userId', userId).eq('isCompleted', true))
    .collect();
  const activeCompletedActions = allCompletedActions.filter((a) => a.status !== 'archived');

  const journals = await ctx.db
    .query('journalEntries')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();

  const checkIns = await ctx.db
    .query('checkIns')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();

  const focusSessions = await ctx.db
    .query('focusSessions')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();

  // Batch-load challenge XP via collect() + Map instead of N+1 queries
  const challengeCompletions = await ctx.db
    .query('challengeCompletions')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();
  const challengeIds = [...new Set(challengeCompletions.map((c) => c.challengeId))];
  const challenges = await Promise.all(challengeIds.map((id) => ctx.db.get(id)));
  const challengeXpMap = new Map(
    challenges.filter(Boolean).map((c) => [c!._id, c!.xpReward])
  );
  let challengeXp = 0;
  for (const c of challengeCompletions) {
    challengeXp += challengeXpMap.get(c.challengeId) ?? 0;
  }

  // Batch-load badge XP via collect() + Map instead of N+1 queries
  const userBadges = await ctx.db
    .query('userBadges')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();
  const badgeKeys = [...new Set(userBadges.map((ub) => ub.badgeKey))];
  const badgeDefs = await Promise.all(
    badgeKeys.map((key) =>
      ctx.db.query('badgeDefinitions').withIndex('by_key', (q) => q.eq('key', key)).first()
    )
  );
  const badgeXpMap = new Map(
    badgeDefs.filter(Boolean).map((b) => [b!.key, b!.xpReward])
  );
  let badgeXp = 0;
  for (const ub of userBadges) {
    badgeXp += badgeXpMap.get(ub.badgeKey) ?? 0;
  }

  // Onboarding XP: check if user completed onboarding
  const prefs = await ctx.db
    .query('userPreferences')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();
  const onboardingXp = prefs?.onboardingCompleted ? XP_REWARDS.onboardingComplete : 0;

  // Streak milestone XP: sum XP from claimed milestones on the progress doc
  const progress = await ctx.db
    .query('userProgress')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();
  let streakMilestoneXp = 0;
  if (progress?.streakMilestones) {
    for (const milestone of progress.streakMilestones) {
      streakMilestoneXp += STREAK_XP_REWARDS[milestone] ?? 0;
    }
  }

  const totalXp =
    activeCompletedActions.length * XP_REWARDS.actionComplete +
    completedDreams.length * XP_REWARDS.dreamComplete +
    journals.length * XP_REWARDS.journalEntry +
    checkIns.length * XP_REWARDS.checkIn +
    focusSessions.length * XP_REWARDS.focusSession +
    challengeXp +
    badgeXp +
    onboardingXp +
    streakMilestoneXp;

  const counts = {
    completedDreams: completedDreams.length,
    activeCompletedActions: activeCompletedActions.length,
    journals: journals.length,
    checkIns: checkIns.length,
    focusSessions: focusSessions.length,
    challengeCompletions: challengeCompletions.length,
    userBadges: userBadges.length,
  };

  const hasAnyData = Object.values(counts).some((n) => n > 0);

  return { totalXp, counts, hasAnyData, userBadges };
}

/** Clean up orphaned feed events and badges when all activity is deleted. */
async function cleanupOrphans(
  ctx: MutationCtx,
  userId: string,
  userBadges: Doc<'userBadges'>[],
) {
  const orphanedEvents = await ctx.db
    .query('activityFeed')
    .withIndex('by_user_created', (q) => q.eq('userId', userId))
    .collect();

  for (const event of orphanedEvents) {
    await ctx.db.delete(event._id);
  }

  for (const ub of userBadges) {
    await ctx.db.delete(ub._id);
  }
}

export async function recalculateUserProgress(
  ctx: MutationCtx,
  userId: string,
  timezone: string
) {
  const progress = await ctx.db
    .query('userProgress')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();
  if (!progress) return null;

  const { totalXp, counts, hasAnyData, userBadges } = await countAndSumProgress(ctx, userId);

  // Recompute streaks from actual activity data instead of using stored values
  const allActivity = await tallyActivity(ctx, userId, timezone, 0, '1970-01-01');
  const { currentStreak, longestStreak } = computeStreaksFromActivity(allActivity, timezone);

  await ctx.db.patch(progress._id, {
    totalXp,
    level: getLevelFromXp(totalXp).level,
    dreamsCompleted: counts.completedDreams,
    actionsCompleted: counts.activeCompletedActions,
    currentStreak,
    longestStreak,
    ...(hasAnyData ? {} : { streakMilestones: [] }),
  });

  if (!hasAnyData) {
    await cleanupOrphans(ctx, userId, userBadges);
  }

  return { totalXp, dreamsCompleted: counts.completedDreams, actionsCompleted: counts.activeCompletedActions };
}

export const recalculate = authMutation({
  args: { timezone: v.string() },
  handler: async (ctx, args) => {
    return recalculateUserProgress(ctx, ctx.user, args.timezone);
  },
});

// ── Activity Feed ──────────────────────────────────────────────────────────

const MOOD_LABELS: Record<string, string> = {
  great: 'Feeling great',
  good: 'Feeling good',
  okay: 'Feeling okay',
  tough: 'Tough day',
};

export const getActivityFeed = authQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) return [];

    const limit = args.limit ?? 20;
    // Fetch more than needed from each source to improve merge quality
    const perSource = limit * 2;

    type FeedItem = {
      type: string;
      title: string;
      subtitle?: string;
      icon: string;
      timestamp: number;
      category?: string;
    };

    const events: FeedItem[] = [];

    // Dreams — created and completed
    const dreams = await ctx.db
      .query('dreams')
      .withIndex('by_user', (q) => q.eq('userId', user))
      .order('desc')
      .take(perSource);

    for (const dream of dreams) {
      const cat = DREAM_CATEGORIES[dream.category as keyof typeof DREAM_CATEGORIES];
      events.push({
        type: 'dream_created',
        title: dream.title,
        subtitle: cat?.label,
        icon: dream.category === 'custom'
          ? (dream.customCategoryIcon ?? cat?.icon ?? 'star.fill')
          : (cat?.icon ?? 'star.fill'),
        timestamp: dream.createdAt,
        category: dream.category,
      });
      if (dream.status === 'completed' && dream.completedAt) {
        events.push({
          type: 'dream_completed',
          title: dream.title,
          subtitle: 'Dream achieved!',
          icon: 'trophy.fill',
          timestamp: dream.completedAt,
          category: dream.category,
        });
      }
    }

    // Actions — completed only
    const completedActions = await ctx.db
      .query('actions')
      .withIndex('by_user_completed', (q) => q.eq('userId', user).eq('isCompleted', true))
      .order('desc')
      .take(perSource);

    // Batch-load dream titles for actions
    const actionDreamIds = [...new Set(completedActions.map((a) => a.dreamId))];
    const actionDreams = await Promise.all(actionDreamIds.map((id) => ctx.db.get(id)));
    const dreamTitleMap = new Map(
      actionDreams.filter(Boolean).map((d) => [d!._id, d!.title]),
    );

    for (const action of completedActions) {
      if (!action.completedAt || action.status === 'archived') continue;
      events.push({
        type: 'action_completed',
        title: action.text,
        subtitle: dreamTitleMap.get(action.dreamId),
        icon: 'checkmark.circle.fill',
        timestamp: action.completedAt,
      });
    }

    // Journal entries
    const journals = await ctx.db
      .query('journalEntries')
      .withIndex('by_user', (q) => q.eq('userId', user))
      .order('desc')
      .take(perSource);

    for (const entry of journals) {
      events.push({
        type: 'journal_created',
        title: entry.title,
        subtitle: entry.mood ? MOOD_LABELS[entry.mood] : undefined,
        icon: 'book.fill',
        timestamp: entry.createdAt,
      });
    }

    // Badges earned
    const badges = await ctx.db
      .query('userBadges')
      .withIndex('by_user', (q) => q.eq('userId', user))
      .order('desc')
      .take(perSource);

    // Batch-load badge definitions
    const badgeKeys = [...new Set(badges.map((b) => b.badgeKey))];
    const badgeDefs = await Promise.all(
      badgeKeys.map((key) =>
        ctx.db.query('badgeDefinitions').withIndex('by_key', (q) => q.eq('key', key)).first(),
      ),
    );
    const badgeDefMap = new Map(
      badgeDefs.filter(Boolean).map((b) => [b!.key, b!]),
    );

    for (const badge of badges) {
      const def = badgeDefMap.get(badge.badgeKey);
      if (!def) continue;
      events.push({
        type: 'badge_earned',
        title: def.title,
        subtitle: def.description,
        icon: def.icon,
        timestamp: badge.earnedAt,
      });
    }

    // Focus sessions
    const sessions = await ctx.db
      .query('focusSessions')
      .withIndex('by_user', (q) => q.eq('userId', user))
      .order('desc')
      .take(perSource);

    // Batch-load dream titles for focus sessions
    const sessionDreamIds = [...new Set(
      sessions.filter((s) => s.dreamId).map((s) => s.dreamId!),
    )];
    const sessionDreams = await Promise.all(sessionDreamIds.map((id) => ctx.db.get(id)));
    const sessionDreamMap = new Map(
      sessionDreams.filter(Boolean).map((d) => [d!._id, d!.title]),
    );

    for (const session of sessions) {
      const mins = Math.round(session.duration / 60);
      events.push({
        type: 'focus_completed',
        title: `${mins}min focus session`,
        subtitle: session.dreamId ? sessionDreamMap.get(session.dreamId) : undefined,
        icon: 'timer',
        timestamp: session.completedAt,
      });
    }

    // Sort by timestamp descending and take limit
    events.sort((a, b) => b.timestamp - a.timestamp);
    return events.slice(0, limit);
  },
});

