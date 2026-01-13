import { v } from 'convex/values';
import { mutation, query, type QueryCtx, type MutationCtx } from './_generated/server';
import { authComponent } from './auth';

const getAuthUserId = async (ctx: QueryCtx | MutationCtx) => (await authComponent.safeGetAuthUser(ctx))?._id ?? null;

const requireAuth = async (ctx: QueryCtx | MutationCtx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error('Unauthorized');
  return userId;
};

const verifyFileOwnership = async (ctx: QueryCtx | MutationCtx, storageId: string, userId: string): Promise<boolean> => {
  const fileRecord = await ctx.db.query('userFiles').withIndex('by_storage_id', (q) => q.eq('storageId', storageId)).first();
  return fileRecord?.userId === userId;
};

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const registerUpload = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db.query('userFiles').withIndex('by_storage_id', (q) => q.eq('storageId', args.storageId)).first();
    if (existing) {
      if (existing.userId !== userId) throw new Error('File already owned by another user');
      return existing._id;
    }
    return await ctx.db.insert('userFiles', { userId, storageId: args.storageId, createdAt: Date.now() });
  },
});

export const getUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const isOwner = await verifyFileOwnership(ctx, args.storageId, userId);
    if (!isOwner) return null;
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const deleteFile = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const isOwner = await verifyFileOwnership(ctx, args.storageId, userId);
    if (!isOwner) throw new Error('Forbidden: You do not own this file');
    const fileRecord = await ctx.db.query('userFiles').withIndex('by_storage_id', (q) => q.eq('storageId', args.storageId)).first();
    if (fileRecord) await ctx.db.delete(fileRecord._id);
    await ctx.storage.delete(args.storageId);
  },
});
