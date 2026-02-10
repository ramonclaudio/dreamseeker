import { internalMutation, internalQuery, internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { getAuthHeaders, fetchWithRetry } from './pushHelpers';

const EXPO_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts';

type PushReceipt = {
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: string };
};

export const storePushReceipts = internalMutation({
  args: {
    receipts: v.array(
      v.object({
        ticketId: v.string(),
        token: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const receipt of args.receipts) {
      await ctx.db.insert('pushReceipts', {
        ticketId: receipt.ticketId,
        token: receipt.token,
        status: 'pending',
        createdAt: now,
      });
    }
  },
});

export const updatePushReceipt = internalMutation({
  args: {
    ticketId: v.string(),
    status: v.union(v.literal('ok'), v.literal('error')),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db
      .query('pushReceipts')
      .withIndex('by_ticket', (q) => q.eq('ticketId', args.ticketId))
      .first();
    if (receipt) {
      await ctx.db.patch(receipt._id, {
        status: args.status,
        error: args.error,
        checkedAt: Date.now(),
      });
    }
  },
});

export const getPendingReceipts = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
    const receipts = await ctx.db
      .query('pushReceipts')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .collect();
    return receipts
      .filter((r) => r.createdAt < fifteenMinutesAgo)
      .slice(0, args.limit ?? 1000);
  },
});

export const cleanupOldReceipts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const allReceipts = await ctx.db
      .query('pushReceipts')
      .collect();
    const oldReceipts = allReceipts.filter((r) => r.createdAt < oneDayAgo);
    for (const receipt of oldReceipts) {
      await ctx.db.delete(receipt._id);
    }
    return oldReceipts.length;
  },
});

export const checkPushReceipts = internalAction({
  args: {},
  handler: async (ctx): Promise<{ checked: number; errors: number }> => {
    const headers = getAuthHeaders();
    if (!headers) return { checked: 0, errors: 0 };

    const pendingReceipts = await ctx.runQuery(internal.notificationsReceipts.getPendingReceipts, { limit: 1000 });
    if (pendingReceipts.length === 0) return { checked: 0, errors: 0 };

    const ticketIds = pendingReceipts.map((r: { ticketId: string }) => r.ticketId);
    const tokenMap = new Map(pendingReceipts.map((r: { ticketId: string; token: string }) => [r.ticketId, r.token]));

    let checked = 0;
    let errorCount = 0;

    for (let i = 0; i < ticketIds.length; i += 1000) {
      const batch = ticketIds.slice(i, i + 1000);

      try {
        const response = await fetchWithRetry(EXPO_RECEIPTS_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ ids: batch }),
        });

        const result = (await response.json()) as { data?: Record<string, PushReceipt> };

        if (!result.data) continue;

        for (const [ticketId, receipt] of Object.entries(result.data)) {
          checked++;

          if (receipt.status === 'ok') {
            await ctx.runMutation(internal.notificationsReceipts.updatePushReceipt, {
              ticketId,
              status: 'ok',
            });
          } else {
            errorCount++;
            const errorType = receipt.details?.error ?? receipt.message ?? 'Unknown';
            await ctx.runMutation(internal.notificationsReceipts.updatePushReceipt, {
              ticketId,
              status: 'error',
              error: errorType,
            });

            if (receipt.details?.error === 'DeviceNotRegistered') {
              const token = tokenMap.get(ticketId);
              if (token) {
                await ctx.runMutation(internal.notificationsTokens.deleteTokenByValue, { token });
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to check receipts:', error);
      }
    }

    return { checked, errors: errorCount };
  },
});
