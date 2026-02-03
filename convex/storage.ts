import { v } from 'convex/values';
import { mutation, type MutationCtx } from './_generated/server';
import { authComponent } from './auth';

const requireAuth = async (ctx: MutationCtx) => {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) throw new Error('Unauthorized');
  return user;
};

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const deleteFile = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (user.image !== args.storageId) throw new Error('Forbidden: You do not own this file');
    await ctx.storage.delete(args.storageId);
  },
});
