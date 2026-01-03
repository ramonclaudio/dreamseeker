import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Generate a short-lived upload URL for client-side file uploads.
 * The URL expires in 1 hour.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a serving URL for a stored file.
 * Returns null if the file doesn't exist.
 */
export const getUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete a file from storage.
 * Used when replacing an avatar or removing a profile image.
 */
export const deleteFile = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});
