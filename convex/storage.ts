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
    // Verify the caller owns the file by checking known references.
    const profile = await ctx.unsafeDb
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', ctx.user))
      .first();

    const ownsViaBanner = profile?.bannerStorageId === args.storageId;

    const ownsViaPin = !ownsViaBanner
      ? !!(await ctx.unsafeDb
          .query('pins')
          .withIndex('by_user_created', (q) => q.eq('userId', ctx.user))
          .collect()
          .then((pins) => pins.find((p) => p.imageStorageId === args.storageId)))
      : false;

    if (!ownsViaBanner && !ownsViaPin) {
      throw new Error('Not the file owner');
    }

    try {
      await ctx.storage.delete(args.storageId);
    } catch {
      // File already deleted or doesn't exist — safe to ignore
    }
  },
});
