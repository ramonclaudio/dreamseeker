import type { DatabaseWriter, MutationCtx } from './_generated/server';
import type { Id, Doc } from './_generated/dataModel';

// ── Per-item cascades ────────────────────────────────────────────────────────

/** Delete all feed events referencing `referenceId` for `userId`, plus their reactions. */
export async function deleteFeedEventsForItem(
  db: DatabaseWriter,
  userId: string,
  referenceId: string
) {
  await deleteFeedEventsForItems(db, userId, new Set([referenceId]));
}

/**
 * Batch-delete feed events + reactions for multiple referenceIds in one pass.
 * Loads the user's feed events once instead of N times.
 */
export async function deleteFeedEventsForItems(
  db: DatabaseWriter,
  userId: string,
  referenceIds: Set<string>
) {
  if (referenceIds.size === 0) return;

  const events = await db
    .query('activityFeed')
    .withIndex('by_user_created', (q) => q.eq('userId', userId))
    .collect();

  const matching = events.filter((e) => e.referenceId && referenceIds.has(e.referenceId));

  await Promise.all(matching.map((event) => db.delete(event._id)));
}

/** Nullify a field on focus sessions matching a predicate. */
async function nullifyFocusSessionField(
  db: DatabaseWriter,
  userId: string,
  filter: (s: { dreamId?: Id<'dreams'>; actionId?: Id<'actions'> }) => boolean,
  patch: { dreamId?: undefined; actionId?: undefined },
) {
  const sessions = await db
    .query('focusSessions')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();

  await Promise.all(
    sessions.filter(filter).map((s) => db.patch(s._id, patch))
  );
}

/** Nullify `dreamId` (and optionally `actionId`) on focus sessions referencing a deleted dream. */
export async function nullifyFocusSessionDream(
  db: DatabaseWriter,
  userId: string,
  dreamId: Id<'dreams'>,
  actionIds: Set<string>
) {
  const sessions = await db
    .query('focusSessions')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();

  await Promise.all(
    sessions
      .filter((s) => s.dreamId === dreamId)
      .map((s) => {
        const patch: { dreamId?: undefined; actionId?: undefined } = { dreamId: undefined };
        if (s.actionId && actionIds.has(s.actionId)) patch.actionId = undefined;
        return db.patch(s._id, patch);
      })
  );
}

/** Nullify `actionId` on focus sessions referencing a deleted action. */
export async function nullifyFocusSessionAction(
  db: DatabaseWriter,
  userId: string,
  actionId: Id<'actions'>
) {
  await nullifyFocusSessionField(
    db,
    userId,
    (s) => s.actionId === actionId,
    { actionId: undefined },
  );
}

// ── Account-level cascades ───────────────────────────────────────────────────

/** Delete all feed events for a user. */
export async function deleteAllFeedForUser(db: DatabaseWriter, userId: string) {
  const events = await db
    .query('activityFeed')
    .withIndex('by_user_created', (q) => q.eq('userId', userId))
    .collect();

  await Promise.all(events.map((event) => db.delete(event._id)));
}

/** Delete user profile and its banner image from storage. */
export async function deleteUserProfile(
  db: DatabaseWriter,
  storage: MutationCtx['storage'],
  userId: string
) {
  const profile = await db
    .query('userProfiles')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();
  if (!profile) return;

  if (profile.bannerStorageId) {
    try {
      await storage.delete(profile.bannerStorageId);
    } catch (error) {
      console.error('[Cascade] Failed to delete banner storage:', error instanceof Error ? error.message : error);
    }
  }

  await db.delete(profile._id);
}

/** Delete all community rate limit records for the user. */
export async function deleteCommunityRateLimitsForUser(db: DatabaseWriter, userId: string) {
  const records = await db
    .query('communityRateLimit')
    .withIndex('by_user_action', (q) => q.eq('userId', userId))
    .collect();
  await Promise.all(records.map((r) => db.delete(r._id)));
}

// ── Pin cascades ───────────────────────────────────────────────────────────

/** Delete all pins for a user, their reactions, and storage images. */
export async function deletePinsForUser(
  db: DatabaseWriter,
  storage: MutationCtx['storage'],
  userId: string
) {
  const pins = await db
    .query('pins')
    .withIndex('by_user_created', (q) => q.eq('userId', userId))
    .collect();

  await Promise.all(
    pins.map(async (pin) => {
      // Delete storage image if exists (skip for saved pins referencing original's storage)
      if (pin.imageStorageId && !pin.originalPinId) {
        try {
          await storage.delete(pin.imageStorageId);
        } catch (error) {
          console.error('[Cascade] Failed to delete pin image:', error instanceof Error ? error.message : error);
        }
      }

      await db.delete(pin._id);
    })
  );
}


