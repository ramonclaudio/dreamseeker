import { v } from 'convex/values';
import { authMutation } from './functions';
import { getOwnedDream, assertDreamLimit, deductXp, deductDreamXp, restoreDreamXp } from './helpers';
import { XP_REWARDS } from './constants';
import { canArchive, canRestore, canReopen, getRestoreStatus } from './dreamGuards';
import {
  deleteFeedEventsForItems,
  nullifyFocusSessionDream,
} from './cascadeDelete';
import { recalculateUserProgress } from './progress';

// Archive a dream (soft delete) - reverses XP and stats
// Note: Streaks are intentionally not affected by archive/restore.
// They represent historical engagement regardless of current archive state.
export const archive = authMutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = ctx.user;
    const dream = await getOwnedDream(ctx, args.id, userId);

    const archiveCheck = canArchive(dream);
    if (!archiveCheck.allowed) throw new Error(archiveCheck.error!);

    // Get all actions for this dream
    const actions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.id))
      .collect();

    const xpToDeduct = await deductDreamXp(ctx, userId, dream, actions);

    // Archive all actions for this dream
    await Promise.all(
      actions.map((action) => ctx.db.patch(action._id, { status: 'archived' as const }))
    );

    await ctx.db.patch(args.id, { status: 'archived' });

    return { xpDeducted: xpToDeduct, actionsArchived: actions.length };
  },
});

// Restore an archived dream - re-adds XP and stats
export const restore = authMutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = ctx.user;
    const dream = await getOwnedDream(ctx, args.id, userId);

    const restoreCheck = canRestore(dream);
    if (!restoreCheck.allowed) throw new Error(restoreCheck.error!);

    // Check tier limits before restoring (only if restoring to active)
    const restoreToStatus = getRestoreStatus(dream);

    if (restoreToStatus === 'active') {
      await assertDreamLimit(ctx, userId);
    }

    // Get all actions for this dream to restore XP
    const actions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.id))
      .collect();

    const xpToRestore = await restoreDreamXp(ctx, userId, dream, actions);

    // Restore all actions for this dream
    await Promise.all(
      actions.map((action) => ctx.db.patch(action._id, { status: 'active' as const }))
    );

    await ctx.db.patch(args.id, { status: restoreToStatus });

    return { xpRestored: xpToRestore };
  },
});

// Reopen a completed dream - reverses completion rewards
export const reopen = authMutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = ctx.user;
    const dream = await getOwnedDream(ctx, args.id, userId);

    const reopenCheck = canReopen(dream);
    if (!reopenCheck.allowed) throw new Error(reopenCheck.error!);

    await assertDreamLimit(ctx, userId);

    const xpReward = XP_REWARDS.dreamComplete;
    await deductXp(ctx, userId, xpReward, { decrementDreams: 1 });

    await ctx.db.patch(args.id, {
      status: 'active',
      completedAt: undefined,
    });

    return { xpDeducted: xpReward };
  },
});

// Permanently delete a dream
export const remove = authMutation({
  args: { id: v.id('dreams'), timezone: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = ctx.user;
    const dream = await ctx.db.get(args.id);
    if (!dream) return; // Idempotent: already deleted
    if (dream.userId !== userId) throw new Error('Forbidden');

    // Get all actions for this dream
    const actions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.id))
      .collect();

    const db = ctx.unsafeDb;
    const actionIds = new Set(actions.map((a) => String(a._id)));

    // Cascade-delete linked journal entries
    const journals = await db
      .query('journalEntries')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.id))
      .collect();

    for (const journal of journals) {
      await db.delete(journal._id);
    }

    // Nullify focus sessions referencing this dream or its actions
    await nullifyFocusSessionDream(db, userId, args.id, actionIds);

    // Batch-delete all feed events + hidden items for dream, its actions, and journals
    const allRefIds = new Set<string>([
      String(args.id),
      ...actions.map((a) => String(a._id)),
      ...journals.map((j) => String(j._id)),
    ]);
    await deleteFeedEventsForItems(db, userId, allRefIds);

    // Delete all associated actions
    await Promise.all(actions.map((action) => ctx.db.delete(action._id)));

    await ctx.db.delete(args.id);

    // Recalculate progress from source data to catch streak milestone XP drift
    await recalculateUserProgress(ctx, userId, args.timezone ?? 'UTC');
  },
});
