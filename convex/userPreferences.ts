import { authQuery, authMutation } from './functions';
import type { MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { assertDreamLimit, awardXp } from './helpers';
import {
  dreamCategoryValidator,
  XP_REWARDS,
  MAX_TITLE_LENGTH,
  MAX_WHY_LENGTH,
} from './constants';
import type { DreamCategory } from './constants';

export const getOnboardingStatus = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return { completed: false };

    const prefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user!))
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

export const completeOnboarding = authMutation({
  args: {
    displayName: v.optional(v.string()),
    selectedCategories: v.optional(v.array(dreamCategoryValidator)),
    firstDream: v.optional(
      v.object({
        title: v.string(),
        category: dreamCategoryValidator,
        whyItMatters: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const categories = args.selectedCategories?.length
      ? [...new Set(args.selectedCategories)]
      : args.firstDream
        ? [args.firstDream.category]
        : ['growth' as DreamCategory];

    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user))
      .first();

    // Guard against double onboarding XP award
    if (existing?.onboardingCompleted) return { success: true };

    if (existing) {
      await ctx.db.patch(existing._id, {
        onboardingCompleted: true,
        selectedCategories: categories,
        pace: 'steady',
      });
    } else {
      await ctx.db.insert('userPreferences', {
        userId: ctx.user,
        onboardingCompleted: true,
        selectedCategories: categories,
        pace: 'steady',
        createdAt: Date.now(),
      });
    }

    // Upsert display name into userProfiles
    if (args.displayName?.trim()) {
      const trimmedName = args.displayName.trim();
      const profile = await ctx.db
        .query('userProfiles')
        .withIndex('by_user', (q) => q.eq('userId', ctx.user))
        .first();

      if (profile) {
        await ctx.db.patch(profile._id, { displayName: trimmedName });
      } else {
        const username = `user_${Date.now().toString(36)}`;
        await ctx.db.insert('userProfiles', {
          userId: ctx.user,
          username,
          displayName: trimmedName,
          isPublic: false,
          createdAt: Date.now(),
        });
      }
    }

    if (args.firstDream) {
      await createInitialDream(ctx, ctx.user, args.firstDream);
    }

    await awardXp(ctx, ctx.user, XP_REWARDS.onboardingComplete, { skipStreak: true });

    return { success: true };
  },
});

export const skipOnboarding = authMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user))
      .first();

    // Guard against double calls
    if (existing?.onboardingCompleted) return { success: true };

    if (existing) {
      await ctx.db.patch(existing._id, {
        onboardingCompleted: true,
        selectedCategories: ['growth'],
        pace: 'steady',
      });
    } else {
      await ctx.db.insert('userPreferences', {
        userId: ctx.user,
        onboardingCompleted: true,
        selectedCategories: ['growth'],
        pace: 'steady',
        createdAt: Date.now(),
      });
    }

    // No XP award for skipping

    return { success: true };
  },
});

export const resetOnboarding = authMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { onboardingCompleted: false });
    }

    return { success: true };
  },
});
