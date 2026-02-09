import type { Rules } from 'convex-helpers/server/rowLevelSecurity';
import type { DataModel } from './_generated/dataModel';

/**
 * Row-Level Security rules.
 *
 * The `ctx` parameter is `{ user: string }` — the authenticated user's ID.
 * Default policy is "deny", so any table without explicit rules is locked.
 *
 * `pushReceipts` is excluded (no userId field, internal-only).
 */
export type RLSCtx = { user: string };

export const rules: Rules<RLSCtx, DataModel> = {
  // ── User-owned tables ──────────────────────────────────────────────────────
  dreams: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  actions: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  journalEntries: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  userProgress: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  userPreferences: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  userBadges: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  hiddenItems: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  uploadRateLimit: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  pushTokens: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  pushNotificationRateLimit: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  checkIns: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  focusSessions: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  challengeCompletions: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },

  // ── Community tables ───────────────────────────────────────────────────────
  userProfiles: {
    read: async ({ user }, doc) => doc.userId === user || doc.isPublic,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  friendships: {
    read: async ({ user }, doc) => doc.userId === user || doc.friendId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  friendRequests: {
    read: async ({ user }, doc) => doc.fromUserId === user || doc.toUserId === user,
    modify: async ({ user }, doc) => doc.fromUserId === user || doc.toUserId === user,
    insert: async ({ user }, doc) => doc.fromUserId === user,
  },
  activityFeed: {
    read: async ({ user }, doc) => doc.userId === user,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  feedReactions: {
    read: async () => true,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },

  // ── System tables (read-only for authed users) ─────────────────────────────
  dailyChallenges: {
    read: async () => true,
    // modify/insert: omitted → denied by default
  },
  mindsetMoments: {
    read: async () => true,
  },
  badgeDefinitions: {
    read: async () => true,
  },
};
