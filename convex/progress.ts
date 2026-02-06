import { query, mutation } from './_generated/server';
import {
  getAuthUserId,
  requireAuth,
  getTodayString,
  getYesterdayString,
  createDefaultProgress,
} from './helpers';
import { LEVELS, XP_REWARDS, getLevelFromXp } from './constants';

export const getProgress = query({
  args: {},
  handler: async (ctx) => {
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
    };

    if (!userId) return defaultProgress;

    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!progress) return defaultProgress;

    const currentLevel = getLevelFromXp(progress.totalXp);
    const nextLevel = LEVELS[LEVELS.findIndex((l) => l.level === currentLevel.level) + 1];

    let xpToNextLevel = 0;
    let xpProgress = 1;

    if (nextLevel) {
      const xpIntoLevel = progress.totalXp - currentLevel.xp;
      const xpNeeded = nextLevel.xp - currentLevel.xp;
      xpToNextLevel = xpNeeded - xpIntoLevel;
      xpProgress = xpIntoLevel / xpNeeded;
    }

    // Check if streak is still valid (user was active yesterday or today)
    const today = getTodayString();
    const yesterday = getYesterdayString();

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
    };
  },
});

export const initialize = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const existing = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert('userProgress', createDefaultProgress(userId));
  },
});

// Recalculate progress from actual data (fixes any drift)
// XP sources that must be accounted for:
// - Actions: 10 XP per completed action (XP_REWARDS.actionComplete)
// - Dreams: 100 XP per completed dream (XP_REWARDS.dreamComplete)
// - Challenges: variable XP per challenge (challenge.xpReward)
// - Onboarding: 50 XP (XP_REWARDS.onboardingComplete)
// When adding new XP sources, update this function.
export const recalculate = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    // Count completed dreams (not archived)
    const completedDreams = await ctx.db
      .query('dreams')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'completed'))
      .collect();

    // Count completed actions from active/completed dreams only
    const activeDreams = await ctx.db
      .query('dreams')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.neq(q.field('status'), 'archived'))
      .collect();

    const activeDreamIds = new Set(activeDreams.map((d) => d._id));

    const allActions = await ctx.db
      .query('actions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const completedActions = allActions.filter(
      (a) =>
        a.isCompleted &&
        a.status !== 'archived' &&
        activeDreamIds.has(a.dreamId)
    );

    // Calculate XP: actions + dreams + challenges + onboarding bonus
    const actionsXp = completedActions.length * XP_REWARDS.actionComplete;
    const dreamsXp = completedDreams.length * XP_REWARDS.dreamComplete;

    // Sum XP from challenge completions (each challenge stores its own xpReward)
    const challengeCompletions = await ctx.db
      .query('challengeCompletions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const challenges = await Promise.all(
      challengeCompletions.map((c) => ctx.db.get(c.challengeId))
    );
    const challengesXp = challenges.reduce((sum, c) => sum + (c?.xpReward ?? 0), 0);

    // Check if user completed onboarding (they get a one-time XP bonus)
    const prefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();
    const onboardingXp = prefs?.onboardingCompleted ? XP_REWARDS.onboardingComplete : 0;

    const totalXp = actionsXp + dreamsXp + challengesXp + onboardingXp;

    // Get or create progress
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (progress) {
      await ctx.db.patch(progress._id, {
        totalXp,
        level: getLevelFromXp(totalXp).level,
        actionsCompleted: completedActions.length,
        dreamsCompleted: completedDreams.length,
      });
    } else {
      await ctx.db.insert(
        'userProgress',
        createDefaultProgress(userId, {
          totalXp,
          level: getLevelFromXp(totalXp).level,
          dreamsCompleted: completedDreams.length,
          actionsCompleted: completedActions.length,
        })
      );
    }

    return {
      totalXp,
      actionsCompleted: completedActions.length,
      dreamsCompleted: completedDreams.length,
    };
  },
});

