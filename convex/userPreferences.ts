import { query, mutation, type QueryCtx, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';

const dreamCategory = v.union(
  v.literal('travel'),
  v.literal('money'),
  v.literal('career'),
  v.literal('lifestyle'),
  v.literal('growth'),
  v.literal('relationships')
);

const paceType = v.union(v.literal('gentle'), v.literal('steady'), v.literal('ambitious'));

const getAuthUserId = async (ctx: QueryCtx | MutationCtx) =>
  (await authComponent.safeGetAuthUser(ctx))?._id ?? null;

const requireAuth = async (ctx: QueryCtx | MutationCtx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error('Unauthorized');
  return userId;
};

export const getOnboardingStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { completed: false };

    const prefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    return { completed: prefs?.onboardingCompleted ?? false };
  },
});

export const completeOnboarding = mutation({
  args: {
    selectedCategories: v.array(dreamCategory),
    pace: paceType,
    notificationTime: v.optional(v.string()),
    firstDream: v.optional(
      v.object({
        title: v.string(),
        category: dreamCategory,
        whyItMatters: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Check if preferences already exist
    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existing) {
      // Update existing preferences
      await ctx.db.patch(existing._id, {
        onboardingCompleted: true,
        selectedCategories: args.selectedCategories,
        pace: args.pace,
        notificationTime: args.notificationTime,
      });
    } else {
      // Create new preferences
      await ctx.db.insert('userPreferences', {
        userId,
        onboardingCompleted: true,
        selectedCategories: args.selectedCategories,
        pace: args.pace,
        notificationTime: args.notificationTime,
        createdAt: Date.now(),
      });
    }

    // Create first dream if provided
    if (args.firstDream && args.firstDream.title.trim()) {
      await ctx.db.insert('dreams', {
        userId,
        title: args.firstDream.title.trim(),
        category: args.firstDream.category,
        whyItMatters: args.firstDream.whyItMatters?.trim(),
        status: 'active',
        createdAt: Date.now(),
      });
    }

    // Initialize user progress if it doesn't exist
    const existingProgress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!existingProgress) {
      await ctx.db.insert('userProgress', {
        userId,
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        dreamsCompleted: 0,
        actionsCompleted: 0,
      });
    }

    return { success: true };
  },
});
