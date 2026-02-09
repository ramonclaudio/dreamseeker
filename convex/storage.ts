import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { authComponent } from './auth';
import { requireAuth } from './helpers';

const UPLOAD_RATE_LIMIT = 10; // max uploads per window
const UPLOAD_RATE_WINDOW_MS = 60 * 1000; // 1 minute

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    // Simple rate limit: count recent upload URL generations
    const cutoff = Date.now() - UPLOAD_RATE_WINDOW_MS;
    const recentUploads = await ctx.db
      .query('uploadRateLimit')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.gte(q.field('createdAt'), cutoff))
      .collect();

    if (recentUploads.length >= UPLOAD_RATE_LIMIT) {
      throw new Error('Too many uploads. Please try again later.');
    }

    await ctx.db.insert('uploadRateLimit', {
      userId,
      createdAt: Date.now(),
    });

    return await ctx.storage.generateUploadUrl();
  },
});

export const deleteFile = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const user = await authComponent.safeGetAuthUser(ctx);
    if (user?.image !== args.storageId) throw new Error('Forbidden: You do not own this file');
    await ctx.storage.delete(args.storageId);
  },
});
