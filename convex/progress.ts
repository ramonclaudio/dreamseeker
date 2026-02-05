import { query, mutation, type QueryCtx, type MutationCtx } from './_generated/server';
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

// Level progression thresholds
const LEVELS = [
  { level: 1, xp: 0, title: 'Dreamer' },
  { level: 2, xp: 100, title: 'Seeker' },
  { level: 3, xp: 300, title: 'Achiever' },
  { level: 4, xp: 600, title: 'Go-Getter' },
  { level: 5, xp: 1000, title: 'Trailblazer' },
];

function getLevelFromXp(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

// Get user's progress stats
export const getProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        totalXp: 0,
        level: 1,
        levelTitle: 'Dreamer',
        currentStreak: 0,
        longestStreak: 0,
        dreamsCompleted: 0,
        actionsCompleted: 0,
        xpToNextLevel: 100,
        xpProgress: 0,
      };
    }

    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!progress) {
      return {
        totalXp: 0,
        level: 1,
        levelTitle: 'Dreamer',
        currentStreak: 0,
        longestStreak: 0,
        dreamsCompleted: 0,
        actionsCompleted: 0,
        xpToNextLevel: 100,
        xpProgress: 0,
      };
    }

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
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    let currentStreak = progress.currentStreak;
    if (progress.lastActiveDate !== today && progress.lastActiveDate !== yesterdayString) {
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

// Initialize user progress (called on first action/dream)
export const initialize = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    // Check if progress already exists
    const existing = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert('userProgress', {
      userId,
      totalXp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: getTodayString(),
      dreamsCompleted: 0,
      actionsCompleted: 0,
    });
  },
});

// Recalculate progress from actual data (fixes any drift)
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

    // Only count completed actions that are active and belong to non-archived dreams
    const completedActions = allActions.filter(
      (a) =>
        a.isCompleted &&
        a.status !== 'archived' &&
        activeDreamIds.has(a.dreamId)
    );

    // Calculate XP
    const actionsXp = completedActions.length * 10;
    const dreamsXp = completedDreams.length * 100;
    const totalXp = actionsXp + dreamsXp;

    // Get or create progress
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    const today = getTodayString();

    if (progress) {
      await ctx.db.patch(progress._id, {
        totalXp,
        actionsCompleted: completedActions.length,
        dreamsCompleted: completedDreams.length,
      });
    } else {
      await ctx.db.insert('userProgress', {
        userId,
        totalXp,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: today,
        dreamsCompleted: completedDreams.length,
        actionsCompleted: completedActions.length,
      });
    }

    return {
      totalXp,
      actionsCompleted: completedActions.length,
      dreamsCompleted: completedDreams.length,
    };
  },
});

// Internal: Award XP and update streak (called from other mutations)
export const awardXp = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const today = getTodayString();

    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!progress) {
      // Initialize progress
      await ctx.db.insert('userProgress', {
        userId,
        totalXp: 0,
        level: 1,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        dreamsCompleted: 0,
        actionsCompleted: 0,
      });
      return;
    }

    // Update streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    let newStreak = progress.currentStreak;
    if (progress.lastActiveDate === yesterdayString) {
      newStreak = progress.currentStreak + 1;
    } else if (progress.lastActiveDate !== today) {
      newStreak = 1; // Reset streak
    }

    await ctx.db.patch(progress._id, {
      currentStreak: newStreak,
      longestStreak: Math.max(progress.longestStreak, newStreak),
      lastActiveDate: today,
    });
  },
});
