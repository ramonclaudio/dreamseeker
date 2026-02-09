import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireAuth, getOwnedDream, assertDreamLimit, deductXp, deductDreamXp, restoreDreamXp } from './helpers';
import { XP_REWARDS } from './constants';
import { canArchive, canRestore, canReopen, getRestoreStatus } from './dreamGuards';

// Archive a dream (soft delete) - reverses XP and stats
// Note: Streaks are intentionally not affected by archive/restore.
// They represent historical engagement regardless of current archive state.
export const archive = mutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
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
export const restore = mutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
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
export const reopen = mutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
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
export const remove = mutation({
  args: { id: v.id('dreams') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const dream = await ctx.db.get(args.id);
    if (!dream) return; // Idempotent: already deleted
    if (dream.userId !== userId) throw new Error('Forbidden');

    // Get all actions for this dream
    const actions = await ctx.db
      .query('actions')
      .withIndex('by_dream', (q) => q.eq('dreamId', args.id))
      .collect();

    if (dream.status !== 'archived') {
      await deductDreamXp(ctx, userId, dream, actions);
    }

    // Delete all associated actions
    await Promise.all(actions.map((action) => ctx.db.delete(action._id)));

    await ctx.db.delete(args.id);
  },
});
