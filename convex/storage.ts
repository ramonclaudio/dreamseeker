import { v } from 'convex/values';
import { authMutation } from './functions';
import { authComponent } from './auth';

const UPLOAD_RATE_LIMIT = 10; // max uploads per window
const UPLOAD_RATE_WINDOW_MS = 60 * 1000; // 1 minute

export const generateUploadUrl = authMutation({
  args: {},
  handler: async (ctx) => {
    // Simple rate limit: count recent upload URL generations
    const cutoff = Date.now() - UPLOAD_RATE_WINDOW_MS;
    const uploads = await ctx.db
      .query('uploadRateLimit')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user))
      .collect();
    const recentUploads = uploads.filter((u) => u.createdAt >= cutoff);

    if (recentUploads.length >= UPLOAD_RATE_LIMIT) {
      throw new Error('Too many uploads. Please try again later.');
    }

    await ctx.db.insert('uploadRateLimit', {
      userId: ctx.user,
      createdAt: Date.now(),
    });

    return await ctx.storage.generateUploadUrl();
  },
});

export const deleteFile = authMutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (user?.image !== args.storageId) throw new Error('Forbidden: You do not own this file');
    await ctx.storage.delete(args.storageId);
  },
});
