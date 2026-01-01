import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Example table - replace with your actual schema
  // This demonstrates the basic patterns for Convex tables
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    createdAt: v.number(),
  }).index('by_completed', ['isCompleted']),
});
