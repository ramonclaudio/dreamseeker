import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  tasks: defineTable({
    userId: v.string(),
    text: v.string(),
    isCompleted: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_completed', ['userId', 'isCompleted']),

  pushTokens: defineTable({
    userId: v.string(),
    token: v.string(),
    platform: v.union(v.literal('ios'), v.literal('android')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_token', ['token']),
});
