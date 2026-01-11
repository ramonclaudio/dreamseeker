import { mutation, action, internalMutation, internalAction, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { authComponent } from './auth';
import type { MutationCtx } from './_generated/server';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts';
const MAX_BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const DEFAULT_TTL = 2419200; // 28 days in seconds

const getAuthUserId = async (ctx: MutationCtx) => (await authComponent.safeGetAuthUser(ctx))?._id ?? null;

type PushTicket = {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
};

type PushReceipt = {
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: string };
};

type SendResult = {
  success: boolean;
  sent: number;
  failed: number;
  errors?: string[];
};

type PushMessage = {
  to: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
  sound?: string | null;
  badge?: number;
  channelId?: string;
  priority?: string;
  ttl?: number;
  expiration?: number;
  _contentAvailable?: boolean;
};

type PushToken = {
  _id: string;
  token: string;
  platform: 'ios' | 'android';
  userId: string;
  deviceId?: string;
  lastUsed: number;
  createdAt: number;
};

type RetryableError = {
  token: string;
  message: PushMessage;
  retryAfter?: number;
};

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
  };

  const accessToken = process.env.EXPO_ACCESS_TOKEN;
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  let lastError: Error | null = null;
  let delay = INITIAL_RETRY_DELAY;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status < 500) {
        return response;
      }
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}`);
        // Check for Retry-After header
        const retryAfter = response.headers.get('Retry-After');
        if (retryAfter) {
          delay = parseInt(retryAfter, 10) * 1000;
        }
      } else {
        return response;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay *= 2;
  }
  throw lastError ?? new Error('Fetch failed');
}

async function sendPushMessagesRaw(
  messages: PushMessage[],
  deleteToken: (token: string) => Promise<unknown>,
  storeReceipts: (receipts: Array<{ ticketId: string; token: string }>) => Promise<unknown>,
  queueRetry?: (errors: RetryableError[]) => Promise<unknown>
): Promise<SendResult> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  const receiptsToStore: Array<{ ticketId: string; token: string }> = [];
  const retryable: RetryableError[] = [];

  for (let i = 0; i < messages.length; i += MAX_BATCH_SIZE) {
    const batch = messages.slice(i, i + MAX_BATCH_SIZE);

    try {
      const response = await fetchWithRetry(EXPO_PUSH_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(batch),
      });

      const result = (await response.json()) as { data?: PushTicket[]; errors?: Array<{ message: string }> };

      if (result.errors) {
        errors.push(...result.errors.map((e) => e.message));
        failed += batch.length;
        continue;
      }

      if (result.data) {
        for (let j = 0; j < result.data.length; j++) {
          const ticket = result.data[j];
          const message = batch[j];

          if (ticket.status === 'ok' && ticket.id) {
            sent++;
            receiptsToStore.push({ ticketId: ticket.id, token: message.to });
          } else if (ticket.status === 'error') {
            const errorType = ticket.details?.error;
            const errorMsg = errorType ?? ticket.message ?? 'Unknown error';

            if (errorType === 'DeviceNotRegistered') {
              await deleteToken(message.to);
              failed++;
              errors.push(`${message.to}: ${errorMsg}`);
            } else if (errorType === 'MessageRateExceeded') {
              // Queue for retry with backoff
              retryable.push({ token: message.to, message, retryAfter: 60 });
              errors.push(`${message.to}: Rate limited, will retry`);
            } else {
              failed++;
              errors.push(`${message.to}: ${errorMsg}`);
            }
          }
        }
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      failed += batch.length;
    }
  }

  if (receiptsToStore.length > 0) {
    await storeReceipts(receiptsToStore);
  }

  if (retryable.length > 0 && queueRetry) {
    await queueRetry(retryable);
  }

  return {
    success: failed === 0 && retryable.length === 0,
    sent,
    failed: failed + retryable.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export const savePushToken = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal('ios'), v.literal('android')),
    deviceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Unauthorized');

    const now = Date.now();

    const existingByToken = await ctx.db
      .query('pushTokens')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (existingByToken) {
      if (existingByToken.userId !== userId) {
        await ctx.db.delete(existingByToken._id);
        await ctx.db.insert('pushTokens', {
          userId,
          token: args.token,
          platform: args.platform,
          deviceId: args.deviceId,
          lastUsed: now,
          createdAt: now,
        });
      } else {
        await ctx.db.patch(existingByToken._id, {
          platform: args.platform,
          deviceId: args.deviceId,
          lastUsed: now,
        });
      }
      return;
    }

    await ctx.db.insert('pushTokens', {
      userId,
      token: args.token,
      platform: args.platform,
      deviceId: args.deviceId,
      lastUsed: now,
      createdAt: now,
    });
  },
});

export const removePushToken = mutation({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    if (args.token) {
      const tokenValue = args.token;
      const existing = await ctx.db
        .query('pushTokens')
        .withIndex('by_token', (q) => q.eq('token', tokenValue))
        .first();
      if (existing && existing.userId === userId) {
        await ctx.db.delete(existing._id);
      }
    } else {
      const tokens = await ctx.db
        .query('pushTokens')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .collect();
      for (const token of tokens) {
        await ctx.db.delete(token._id);
      }
    }
  },
});

export const getUserTokens = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<PushToken[]> => {
    const tokens = await ctx.db
      .query('pushTokens')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
    return tokens as PushToken[];
  },
});

export const getTokenByValue = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('pushTokens')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();
  },
});

export const deleteTokenByValue = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('pushTokens')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

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
    const oldReceipts = await ctx.db
      .query('pushReceipts')
      .filter((q) => q.lt(q.field('createdAt'), oneDayAgo))
      .collect();
    for (const receipt of oldReceipts) {
      await ctx.db.delete(receipt._id);
    }
    return oldReceipts.length;
  },
});

export const sendPushNotification = action({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.record(v.string(), v.any())),
    sound: v.optional(v.union(v.literal('default'), v.null())),
    badge: v.optional(v.number()),
    channelId: v.optional(v.string()),
    priority: v.optional(v.union(v.literal('default'), v.literal('normal'), v.literal('high'))),
    ttl: v.optional(v.number()),
    expiration: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    sent: v.number(),
    failed: v.number(),
    errors: v.optional(v.array(v.string())),
  }),
  handler: async (ctx, args): Promise<SendResult> => {
    const tokens: PushToken[] = await ctx.runQuery(internal.notifications.getUserTokens, { userId: args.userId });
    if (tokens.length === 0) {
      return { success: false, sent: 0, failed: 0, errors: ['No push tokens for user'] };
    }

    const messages: PushMessage[] = tokens.map((t) => ({
      to: t.token,
      title: args.title,
      body: args.body,
      data: args.data,
      sound: args.sound ?? 'default',
      badge: args.badge,
      channelId: args.channelId ?? 'default',
      priority: args.priority ?? 'high',
      ttl: args.ttl ?? DEFAULT_TTL,
      expiration: args.expiration,
    }));

    return sendPushMessagesRaw(
      messages,
      (token) => ctx.runMutation(internal.notifications.deleteTokenByValue, { token }),
      (receipts) => ctx.runMutation(internal.notifications.storePushReceipts, { receipts }),
      async (retryable) => {
        for (const item of retryable) {
          if (!item.message.title || !item.message.body) continue;
          await ctx.scheduler.runAfter((item.retryAfter ?? 60) * 1000, internal.notifications.retryPushNotification, {
            token: item.token,
            title: item.message.title,
            body: item.message.body,
            data: item.message.data,
          });
        }
      }
    );
  },
});

export const retryPushNotification = internalAction({
  args: {
    token: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args): Promise<SendResult> => {
    const messages: PushMessage[] = [{
      to: args.token,
      title: args.title,
      body: args.body,
      data: args.data,
      sound: 'default',
      channelId: 'default',
      priority: 'normal', // Lower priority for retries
      ttl: DEFAULT_TTL,
    }];

    return sendPushMessagesRaw(
      messages,
      (token) => ctx.runMutation(internal.notifications.deleteTokenByValue, { token }),
      (receipts) => ctx.runMutation(internal.notifications.storePushReceipts, { receipts })
      // No further retries to prevent infinite loops
    );
  },
});

export const sendBatchNotifications = action({
  args: {
    notifications: v.array(
      v.object({
        userId: v.string(),
        title: v.string(),
        body: v.string(),
        data: v.optional(v.record(v.string(), v.any())),
        ttl: v.optional(v.number()),
      })
    ),
  },
  returns: v.object({
    success: v.boolean(),
    sent: v.number(),
    failed: v.number(),
    errors: v.optional(v.array(v.string())),
  }),
  handler: async (ctx, args): Promise<SendResult> => {
    const allMessages: PushMessage[] = [];

    for (const notification of args.notifications) {
      const tokens: PushToken[] = await ctx.runQuery(internal.notifications.getUserTokens, {
        userId: notification.userId,
      });
      for (const t of tokens) {
        allMessages.push({
          to: t.token,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: 'default',
          channelId: 'default',
          priority: 'high',
          ttl: notification.ttl ?? DEFAULT_TTL,
        });
      }
    }

    if (allMessages.length === 0) {
      return { success: false, sent: 0, failed: 0, errors: ['No push tokens'] };
    }

    return sendPushMessagesRaw(
      allMessages,
      (token) => ctx.runMutation(internal.notifications.deleteTokenByValue, { token }),
      (receipts) => ctx.runMutation(internal.notifications.storePushReceipts, { receipts })
    );
  },
});

export const checkPushReceipts = internalAction({
  args: {},
  handler: async (ctx): Promise<{ checked: number; errors: number }> => {
    const pendingReceipts = await ctx.runQuery(internal.notifications.getPendingReceipts, { limit: 1000 });
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
          headers: getAuthHeaders(),
          body: JSON.stringify({ ids: batch }),
        });

        const result = (await response.json()) as { data?: Record<string, PushReceipt> };

        if (result.data) {
          for (const [ticketId, receipt] of Object.entries(result.data)) {
            checked++;

            if (receipt.status === 'ok') {
              await ctx.runMutation(internal.notifications.updatePushReceipt, {
                ticketId,
                status: 'ok',
              });
            } else {
              errorCount++;
              const errorType = receipt.details?.error ?? receipt.message ?? 'Unknown';
              await ctx.runMutation(internal.notifications.updatePushReceipt, {
                ticketId,
                status: 'error',
                error: errorType,
              });

              if (receipt.details?.error === 'DeviceNotRegistered') {
                const token = tokenMap.get(ticketId);
                if (token) {
                  await ctx.runMutation(internal.notifications.deleteTokenByValue, { token });
                }
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

export const sendTestNotification = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx): Promise<{ success: boolean; error?: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false, error: 'Not authenticated' };

    const userId = identity.subject;
    const tokens: PushToken[] = await ctx.runQuery(internal.notifications.getUserTokens, { userId });
    if (tokens.length === 0) {
      return { success: false, error: 'No push tokens for user' };
    }

    const messages: PushMessage[] = tokens.map((t) => ({
      to: t.token,
      title: 'Test Notification',
      body: 'Push notifications are working!',
      data: { test: true },
      sound: 'default',
      channelId: 'default',
      priority: 'high',
      ttl: 3600, // 1 hour for test notifications
    }));

    const result = await sendPushMessagesRaw(
      messages,
      (token) => ctx.runMutation(internal.notifications.deleteTokenByValue, { token }),
      (receipts) => ctx.runMutation(internal.notifications.storePushReceipts, { receipts })
    );

    return { success: result.success, error: result.errors?.[0] };
  },
});

export const sendPushNotificationInternal = internalAction({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.record(v.string(), v.any())),
    ttl: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<SendResult> => {
    const tokens: PushToken[] = await ctx.runQuery(internal.notifications.getUserTokens, { userId: args.userId });
    if (tokens.length === 0) {
      return { success: false, sent: 0, failed: 0, errors: ['No push tokens for user'] };
    }

    const messages: PushMessage[] = tokens.map((t) => ({
      to: t.token,
      title: args.title,
      body: args.body,
      data: args.data,
      sound: 'default',
      channelId: 'default',
      priority: 'high',
      ttl: args.ttl ?? DEFAULT_TTL,
    }));

    return sendPushMessagesRaw(
      messages,
      (token) => ctx.runMutation(internal.notifications.deleteTokenByValue, { token }),
      (receipts) => ctx.runMutation(internal.notifications.storePushReceipts, { receipts })
    );
  },
});

// Send data-only notification for background processing (headless)
export const sendBackgroundNotification = action({
  args: {
    userId: v.string(),
    data: v.record(v.string(), v.any()),
  },
  returns: v.object({
    success: v.boolean(),
    sent: v.number(),
    failed: v.number(),
    errors: v.optional(v.array(v.string())),
  }),
  handler: async (ctx, args): Promise<SendResult> => {
    const tokens: PushToken[] = await ctx.runQuery(internal.notifications.getUserTokens, { userId: args.userId });
    if (tokens.length === 0) {
      return { success: false, sent: 0, failed: 0, errors: ['No push tokens for user'] };
    }

    const messages = tokens.map((t) => ({
      to: t.token,
      data: args.data,
      _contentAvailable: true,
      priority: 'normal' as const,
      channelId: 'default',
    }));

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    const receiptsToStore: Array<{ ticketId: string; token: string }> = [];

    try {
      const response = await fetchWithRetry(EXPO_PUSH_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(messages),
      });

      const result = (await response.json()) as { data?: PushTicket[]; errors?: Array<{ message: string }> };

      if (result.errors) {
        errors.push(...result.errors.map((e) => e.message));
        failed += messages.length;
      } else if (result.data) {
        for (let j = 0; j < result.data.length; j++) {
          const ticket = result.data[j];
          const message = messages[j];

          if (ticket.status === 'ok' && ticket.id) {
            sent++;
            receiptsToStore.push({ ticketId: ticket.id, token: message.to });
          } else if (ticket.status === 'error') {
            failed++;
            const errorMsg = ticket.details?.error ?? ticket.message ?? 'Unknown error';
            errors.push(`${message.to}: ${errorMsg}`);

            if (ticket.details?.error === 'DeviceNotRegistered') {
              await ctx.runMutation(internal.notifications.deleteTokenByValue, { token: message.to });
            }
          }
        }
      }

      if (receiptsToStore.length > 0) {
        await ctx.runMutation(internal.notifications.storePushReceipts, { receipts: receiptsToStore });
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      failed += messages.length;
    }

    return {
      success: failed === 0,
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});
