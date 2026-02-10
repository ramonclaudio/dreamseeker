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

/** Factory for the standard owner-based RLS rule: read/modify/insert all check `doc[field] === user`. */
function ownerRules(field = 'userId') {
  return {
    read: async ({ user }: RLSCtx, doc: Record<string, unknown>) => doc[field] === user,
    modify: async ({ user }: RLSCtx, doc: Record<string, unknown>) => doc[field] === user,
    insert: async ({ user }: RLSCtx, doc: Record<string, unknown>) => doc[field] === user,
  };
}

export const rules: Rules<RLSCtx, DataModel> = {
  // ── User-owned tables (standard owner rules) ──────────────────────────────
  dreams: ownerRules(),
  actions: ownerRules(),
  journalEntries: ownerRules(),
  userProgress: ownerRules(),
  userPreferences: ownerRules(),
  userBadges: ownerRules(),
  uploadRateLimit: ownerRules(),
  pushTokens: ownerRules(),
  pushNotificationRateLimit: ownerRules(),
  checkIns: ownerRules(),
  focusSessions: ownerRules(),
  challengeCompletions: ownerRules(),
  activityFeed: ownerRules(),
  communityRateLimit: ownerRules(),

  // ── Community tables (custom rules) ────────────────────────────────────────
  userProfiles: {
    read: async ({ user }, doc) => doc.userId === user || doc.isPublic,
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },

  // ── Vision Boards ──────────────────────────────────────────────────────────
  visionBoards: ownerRules(),

  // ── Pin tables ──────────────────────────────────────────────────────────────
  pins: {
    read: async () => true, // Visibility filtering done in query logic (blocked users, privacy, etc.)
    modify: async ({ user }, doc) => doc.userId === user,
    insert: async ({ user }, doc) => doc.userId === user,
  },
  // ── Pin Reports ───────────────────────────────────────────────────────────
  pinReports: ownerRules('reporterId'),
  // ── Blocked Users ────────────────────────────────────────────────────────
  blockedUsers: ownerRules('blockerId'),

  // ── System tables (read-only for authed users) ─────────────────────────────
  dailyChallenges: {
    read: async () => true,
  },
  mindsetMoments: {
    read: async () => true,
  },
  badgeDefinitions: {
    read: async () => true,
  },
};
