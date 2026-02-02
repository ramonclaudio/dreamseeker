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
});
