import { v } from 'convex/values';
import { authQuery, authMutation } from './functions';
import { awardXp, deductXp } from './helpers';
import { getTodayString } from './dates';
import { requireText, validateTags } from './validation';
import {
  moodValidator,
  XP_REWARDS,
  MAX_TITLE_LENGTH,
  MAX_JOURNAL_BODY_LENGTH,
  MAX_TAGS_COUNT,
  MAX_TAG_LENGTH,
  FREE_JOURNAL_DAILY_LIMIT,
} from './constants';
import { hasEntitlement } from './revenuecat';
import { PREMIUM_ENTITLEMENT } from './subscriptions';
import { createFeedEvent } from './feed';

export const list = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return [];

    return await ctx.db
      .query('journalEntries')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user!))
      .order('desc')
      .take(50);
  },
});

export const get = authQuery({
  args: { id: v.id('journalEntries') },
  handler: async (ctx, args) => {
    if (!ctx.user) return null;

    const entry = await ctx.db.get('journalEntries', args.id);
    if (!entry || entry.userId !== ctx.user) return null;

    return entry;
  },
});

export const listByDream = authQuery({
  args: { dreamId: v.id('dreams') },
  handler: async (ctx, args) => {
    if (!ctx.user) return [];

    return await ctx.db
      .query('journalEntries')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.dreamId))
      .filter((q) => q.eq(q.field('userId'), ctx.user!))
      .order('desc')
      .take(20);
  },
});

export const getTodayCount = authQuery({
  args: { timezone: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.user) return 0;

    const today = getTodayString(args.timezone);
    const entries = await ctx.db
      .query('journalEntries')
      .withIndex('by_user_date', (q) => q.eq('userId', ctx.user!).eq('date', today))
      .collect();

    return entries.length;
  },
});

export const create = authMutation({
  args: {
    title: v.string(),
    body: v.string(),
    mood: v.optional(moodValidator),
    dreamId: v.optional(v.id('dreams')),
    tags: v.optional(v.array(v.string())),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.user;
    const today = getTodayString(args.timezone);

    // Check daily limit for free users
    const isPremium = await hasEntitlement(ctx, {
      appUserId: userId,
      entitlementId: PREMIUM_ENTITLEMENT,
    });

    if (!isPremium) {
      const todayEntries = await ctx.db
        .query('journalEntries')
        .withIndex('by_user_date', (q) => q.eq('userId', userId).eq('date', today))
        .collect();

      if (todayEntries.length >= FREE_JOURNAL_DAILY_LIMIT) {
        throw new Error('JOURNAL_LIMIT_REACHED');
      }
    }

    // Validate lengths
    const trimmedTitle = requireText(args.title, MAX_TITLE_LENGTH, 'Title');
    const trimmedBody = requireText(args.body, MAX_JOURNAL_BODY_LENGTH, 'Body');
    const tags = args.tags ? validateTags(args.tags, MAX_TAGS_COUNT, MAX_TAG_LENGTH) : undefined;

    const entryId = await ctx.db.insert('journalEntries', {
      userId,
      title: trimmedTitle,
      body: trimmedBody,
      mood: args.mood,
      dreamId: args.dreamId,
      tags,
      date: today,
      createdAt: Date.now(),
    });

    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (profile?.defaultHideJournals) {
      await ctx.db.insert('hiddenItems', {
        userId,
        itemType: 'journal',
        itemId: entryId,
        createdAt: Date.now(),
      });
    }

    // Award XP and update streak
    const xpReward = XP_REWARDS.journalEntry;
    const { streakMilestone } = await awardXp(ctx, userId, xpReward, {
      timezone: args.timezone,
    });

    await createFeedEvent(ctx, userId, 'journal_entry', entryId, {
      title: trimmedTitle,
      mood: args.mood,
    });

    return { entryId, xpAwarded: xpReward, streakMilestone };
  },
});

export const update = authMutation({
  args: {
    id: v.id('journalEntries'),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    mood: v.optional(moodValidator),
    dreamId: v.optional(v.id('dreams')),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = ctx.user;

    const entry = await ctx.db.get('journalEntries', args.id);
    if (!entry) throw new Error('Entry not found');
    if (entry.userId !== userId) throw new Error('Forbidden');

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      updates.title = requireText(args.title, MAX_TITLE_LENGTH, 'Title');
    }

    if (args.body !== undefined) {
      updates.body = requireText(args.body, MAX_JOURNAL_BODY_LENGTH, 'Body');
    }

    if (args.mood !== undefined) updates.mood = args.mood;
    if (args.dreamId !== undefined) updates.dreamId = args.dreamId;
    if (args.tags !== undefined) {
      updates.tags = validateTags(args.tags, MAX_TAGS_COUNT, MAX_TAG_LENGTH);
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = authMutation({
  args: { id: v.id('journalEntries') },
  handler: async (ctx, args) => {
    const userId = ctx.user;

    const entry = await ctx.db.get('journalEntries', args.id);
    if (!entry) return;
    if (entry.userId !== userId) throw new Error('Forbidden');

    await ctx.db.delete(args.id);

    // Deduct XP
    await deductXp(ctx, userId, XP_REWARDS.journalEntry);
  },
});
