import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  dreamCategoryValidator,
  dreamStatusValidator,
  paceValidator,
  confidenceValidator,
  personalityValidator,
  motivationValidator,
  moodValidator,
} from './constants';

export default defineSchema({
  // Dreams - main goal items
  dreams: defineTable({
    userId: v.string(),
    title: v.string(),
    category: dreamCategoryValidator,
    whyItMatters: v.optional(v.string()),
    targetDate: v.optional(v.number()),
    status: dreamStatusValidator,
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    reflection: v.optional(v.string()),
    customCategoryName: v.optional(v.string()),
    customCategoryIcon: v.optional(v.string()),
    customCategoryColor: v.optional(v.string()),
  })
    .index('by_user', ['userId'])
    .index('by_user_status', ['userId', 'status'])
    .index('by_user_category', ['userId', 'category']),

  // Actions - micro-steps towards dreams
  actions: defineTable({
    userId: v.string(),
    dreamId: v.id('dreams'),
    text: v.string(),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    order: v.number(),
    status: v.optional(v.union(v.literal('active'), v.literal('archived'))),
    createdAt: v.number(),
  })
    .index('by_dream', ['dreamId'])
    .index('by_user', ['userId'])
    .index('by_user_completed', ['userId', 'isCompleted']),

  // User progress - gamification stats
  userProgress: defineTable({
    userId: v.string(),
    totalXp: v.number(),
    level: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastActiveDate: v.string(), // YYYY-MM-DD
    dreamsCompleted: v.number(),
    actionsCompleted: v.number(),
    streakMilestones: v.optional(v.array(v.number())),
  }).index('by_user', ['userId']),

  // Daily challenges - system-defined challenges
  dailyChallenges: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    xpReward: v.number(),
    isActive: v.boolean(),
    isComfortZone: v.optional(v.boolean()),
  }).index('by_category', ['category']),

  // Challenge completions - tracks user's completed challenges
  challengeCompletions: defineTable({
    userId: v.string(),
    challengeId: v.id('dailyChallenges'),
    completedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_date', ['userId', 'completedAt'])
    .index('by_user_challenge', ['userId', 'challengeId']),

  // Mindset moments - inspirational quotes
  mindsetMoments: defineTable({
    quote: v.string(),
    author: v.string(),
    category: v.optional(v.string()),
  }).index('by_category', ['category']),

  pushTokens: defineTable({
    userId: v.string(),
    token: v.string(),
    platform: v.union(v.literal('ios'), v.literal('android')),
    deviceId: v.optional(v.string()),
    lastUsed: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_token', ['token']),

  pushReceipts: defineTable({
    ticketId: v.string(),
    token: v.string(),
    status: v.union(v.literal('pending'), v.literal('ok'), v.literal('error')),
    error: v.optional(v.string()),
    createdAt: v.number(),
    checkedAt: v.optional(v.number()),
  })
    .index('by_ticket', ['ticketId'])
    .index('by_status', ['status'])
    .index('by_token', ['token']),

  userPreferences: defineTable({
    userId: v.string(),
    onboardingCompleted: v.boolean(),
    selectedCategories: v.array(dreamCategoryValidator),
    pace: paceValidator,
    confidence: v.optional(confidenceValidator),
    personality: v.optional(personalityValidator),
    motivations: v.optional(v.array(motivationValidator)),
    notificationTime: v.optional(v.string()), // "HH:mm" format
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  // Check-ins - morning/evening daily rituals
  checkIns: defineTable({
    userId: v.string(),
    type: v.union(v.literal('morning'), v.literal('evening')),
    date: v.string(), // YYYY-MM-DD
    mood: v.optional(moodValidator),
    intention: v.optional(v.string()),
    reflection: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_date', ['userId', 'date']),

  // Journal entries - reflections and notes
  journalEntries: defineTable({
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    mood: v.optional(moodValidator),
    dreamId: v.optional(v.id('dreams')),
    tags: v.optional(v.array(v.string())),
    date: v.string(), // YYYY-MM-DD
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_user_date', ['userId', 'date'])
    .index('by_dream', ['dreamId']),

  // Focus sessions - timed work sessions
  focusSessions: defineTable({
    userId: v.string(),
    dreamId: v.optional(v.id('dreams')),
    actionId: v.optional(v.id('actions')),
    duration: v.number(), // seconds
    completedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_completedAt', ['userId', 'completedAt']),

  // Badge definitions - system-defined badges
  badgeDefinitions: defineTable({
    key: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.string(),
    xpReward: v.number(),
  }).index('by_key', ['key']),

  // User badges - earned badges
  userBadges: defineTable({
    userId: v.string(),
    badgeKey: v.string(),
    earnedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_badge', ['userId', 'badgeKey']),

  // Upload rate limiting
  uploadRateLimit: defineTable({
    userId: v.string(),
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  // Push notification rate limiting
  pushNotificationRateLimit: defineTable({
    userId: v.string(),
    createdAt: v.number(),
  }).index('by_user', ['userId']),
});
