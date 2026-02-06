import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId, requireAuth, getTodayString, assertDreamLimit } from './helpers';
import {
  dreamCategoryValidator,
  paceValidator,
  confidenceValidator,
  XP_REWARDS,
  getLevelFromXp,
  MAX_TITLE_LENGTH,
  MAX_WHY_LENGTH,
} from './constants';
import { hasEntitlement } from './revenuecat';
import { PREMIUM_ENTITLEMENT, TIERS } from './subscriptions';

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
    selectedCategories: v.array(dreamCategoryValidator),
    pace: paceValidator,
    confidence: v.optional(confidenceValidator),
    notificationTime: v.optional(v.string()),
    firstDream: v.optional(
      v.object({
        title: v.string(),
        category: dreamCategoryValidator,
        whyItMatters: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    if (args.selectedCategories.length === 0) throw new Error('At least one category is required');
    if (args.selectedCategories.length > 6) throw new Error('Too many categories');
    // Deduplicate
    const uniqueCategories = [...new Set(args.selectedCategories)];

    // Validate notification time format if provided
    if (args.notificationTime && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(args.notificationTime)) {
      throw new Error('Invalid notification time format');
    }

    // Check if preferences already exist
    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    // Guard against double onboarding XP award
    if (existing?.onboardingCompleted) return { success: true };

    if (existing) {
      await ctx.db.patch(existing._id, {
        onboardingCompleted: true,
        selectedCategories: uniqueCategories,
        pace: args.pace,
        confidence: args.confidence,
        notificationTime: args.notificationTime,
      });
    } else {
      await ctx.db.insert('userPreferences', {
        userId,
        onboardingCompleted: true,
        selectedCategories: uniqueCategories,
        pace: args.pace,
        confidence: args.confidence,
        notificationTime: args.notificationTime,
        createdAt: Date.now(),
      });
    }

    // Create first dream if provided
    if (args.firstDream && args.firstDream.title.trim()) {
      const trimmedTitle = args.firstDream.title.trim();

      // Validate title length
      if (trimmedTitle.length > MAX_TITLE_LENGTH) {
        throw new Error('Title too long');
      }

      // Validate whyItMatters length
      if (args.firstDream.whyItMatters && args.firstDream.whyItMatters.trim().length > MAX_WHY_LENGTH) {
        throw new Error('Description too long');
      }

      // Check dream tier limit
      await assertDreamLimit(ctx, userId);

      await ctx.db.insert('dreams', {
        userId,
        title: trimmedTitle,
        category: args.firstDream.category,
        whyItMatters: args.firstDream.whyItMatters?.trim(),
        status: 'active',
        createdAt: Date.now(),
      });
    }

    // Initialize or update user progress with onboarding XP
    const existingProgress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    const onboardingXp = XP_REWARDS.onboardingComplete;

    if (existingProgress) {
      const newXp = existingProgress.totalXp + onboardingXp;
      await ctx.db.patch(existingProgress._id, {
        totalXp: newXp,
        level: getLevelFromXp(newXp).level,
      });
    } else {
      await ctx.db.insert('userProgress', {
        userId,
        totalXp: onboardingXp,
        level: getLevelFromXp(onboardingXp).level,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: getTodayString(),
        dreamsCompleted: 0,
        actionsCompleted: 0,
      });
    }

    return { success: true };
  },
});
