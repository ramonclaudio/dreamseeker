import { query, mutation } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId, requireAuth, assertDreamLimit, awardXp } from './helpers';
import {
  dreamCategoryValidator,
  paceValidator,
  confidenceValidator,
  personalityValidator,
  motivationValidator,
  XP_REWARDS,
  MAX_TITLE_LENGTH,
  MAX_WHY_LENGTH,
} from './constants';
import type { DreamCategory } from './constants';
import { checkAndAwardBadge, applyBadgeXp } from './badgeChecks';

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

// ── Onboarding Helpers ──────────────────────────────────────────────────────

/** Validate and create the user's first dream during onboarding. */
async function createInitialDream(
  ctx: MutationCtx,
  userId: string,
  dreamData: { title: string; category: DreamCategory; whyItMatters?: string }
) {
  const trimmedTitle = dreamData.title.trim();
  if (!trimmedTitle) return;

  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    throw new Error('Title too long');
  }

  if (dreamData.whyItMatters && dreamData.whyItMatters.trim().length > MAX_WHY_LENGTH) {
    throw new Error('Description too long');
  }

  await assertDreamLimit(ctx, userId);

  await ctx.db.insert('dreams', {
    userId,
    title: trimmedTitle,
    category: dreamData.category,
    whyItMatters: dreamData.whyItMatters?.trim(),
    status: 'active',
    createdAt: Date.now(),
  });
}

export const completeOnboarding = mutation({
  args: {
    selectedCategories: v.array(dreamCategoryValidator),
    pace: paceValidator,
    confidence: v.optional(confidenceValidator),
    personality: v.optional(personalityValidator),
    motivations: v.optional(v.array(motivationValidator)),
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
    const uniqueCategories = [...new Set(args.selectedCategories)];

    if (args.notificationTime && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(args.notificationTime)) {
      throw new Error('Invalid notification time format');
    }

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
        personality: args.personality,
        motivations: args.motivations,
        notificationTime: args.notificationTime,
      });
    } else {
      await ctx.db.insert('userPreferences', {
        userId,
        onboardingCompleted: true,
        selectedCategories: uniqueCategories,
        pace: args.pace,
        confidence: args.confidence,
        personality: args.personality,
        motivations: args.motivations,
        notificationTime: args.notificationTime,
        createdAt: Date.now(),
      });
    }

    if (args.firstDream) {
      await createInitialDream(ctx, userId, args.firstDream);
    }

    await awardXp(ctx, userId, XP_REWARDS.onboardingComplete, { skipStreak: true });

    // Check delusionally_confident badge
    let badgeXp = 0;
    if (args.confidence === 'not-confident') {
      const result = await checkAndAwardBadge(ctx, userId, 'delusionally_confident');
      badgeXp += result.xpAwarded;
    }
    await applyBadgeXp(ctx, userId, badgeXp);

    return { success: true };
  },
});
