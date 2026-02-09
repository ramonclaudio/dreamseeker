import { action, internalAction, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { env } from './env';
import type { PushToken } from './notificationsTokens';

export const PUSH_RATE_LIMIT = 10; // max sends per window
export const PUSH_RATE_WINDOW_MS = 60 * 1000; // 1 minute

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
export const MAX_BATCH_SIZE = 100;
export const MAX_RETRIES = 3;
export const INITIAL_RETRY_DELAY = 1000;
const DEFAULT_TTL = 2419200; // 28 days in seconds
export const MAX_NOTIF_TITLE_LENGTH = 100;
export const MAX_NOTIF_BODY_LENGTH = 500;

export type PushTicket = {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
};

export type SendResult = {
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

type RetryableError = {
  token: string;
  message: PushMessage;
  retryAfter?: number;
};

const NO_TOKENS_RESULT: SendResult = { success: false, sent: 0, failed: 0, errors: ['No push tokens for user'] };

/** Build the standard deleteToken/storeReceipts callbacks for sendPushMessagesRaw. */
function makeSendCallbacks(ctx: { runMutation: (...args: any[]) => Promise<any> }) {
  return {
    deleteToken: (token: string) => ctx.runMutation(internal.notificationsTokens.deleteTokenByValue, { token }),
    storeReceipts: (receipts: { ticketId: string; token: string }[]) =>
      ctx.runMutation(internal.notificationsReceipts.storePushReceipts, { receipts }),
  };
}

/** Fetch tokens for a user. Returns null (with NO_TOKENS_RESULT) if empty. */
async function getTokensOrFail(ctx: { runQuery: (...args: any[]) => Promise<any> }, userId: string): Promise<PushToken[] | null> {
  const tokens: PushToken[] = await ctx.runQuery(internal.notificationsTokens.getUserTokens, { userId });
  return tokens.length === 0 ? null : tokens;
}

function getAuthHeaders(): Record<string, string> | null {
  const token = env.expo.accessToken;
  if (!token) return null;
  return {
    Accept: 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  let lastError: Error | null = null;
  let delay = INITIAL_RETRY_DELAY;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || (response.status < 500 && response.status !== 429)) {
        return response;
      }
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}`);
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

type TicketProcessResult = {
  sent: number;
  failed: number;
  errors: string[];
  receipts: { ticketId: string; token: string }[];
  retryable: RetryableError[];
};

/** Classify a single push ticket by outcome. */
export function classifyTicket(ticket: PushTicket): 'sent' | 'device_removed' | 'rate_limited' | 'failed' {
  if (ticket.status === 'ok' && ticket.id) return 'sent';
  if (ticket.status !== 'error') return 'sent';
  const errorType = ticket.details?.error;
  if (errorType === 'DeviceNotRegistered') return 'device_removed';
  if (errorType === 'MessageRateExceeded') return 'rate_limited';
  return 'failed';
}

/**
 * Classify an array of Expo push tickets against the batch that produced them.
 * Deletes tokens for unregistered devices; queues rate-limited messages for retry.
 */
async function processTickets(
  tickets: PushTicket[],
  batch: PushMessage[],
  deleteToken: (token: string) => Promise<unknown>
): Promise<TicketProcessResult> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  const receipts: { ticketId: string; token: string }[] = [];
  const retryable: RetryableError[] = [];

  for (let j = 0; j < tickets.length; j++) {
    const ticket = tickets[j];
    const message = batch[j];

    if (ticket.status === 'ok' && ticket.id) {
      sent++;
      receipts.push({ ticketId: ticket.id, token: message.to });
      continue;
    }

    if (ticket.status !== 'error') continue;

    const errorType = ticket.details?.error;
    const errorMsg = errorType ?? ticket.message ?? 'Unknown error';

    if (errorType === 'DeviceNotRegistered') {
      await deleteToken(message.to);
      failed++;
      errors.push(`${message.to}: ${errorMsg}`);
    } else if (errorType === 'MessageRateExceeded') {
      retryable.push({ token: message.to, message, retryAfter: 60 });
      errors.push(`${message.to}: Rate limited, will retry`);
    } else {
      failed++;
      errors.push(`${message.to}: ${errorMsg}`);
    }
  }

  return { sent, failed, errors, receipts, retryable };
}

async function sendPushMessagesRaw(
  messages: PushMessage[],
  deleteToken: (token: string) => Promise<unknown>,
  storeReceipts: (receipts: { ticketId: string; token: string }[]) => Promise<unknown>,
  queueRetry?: (errors: RetryableError[]) => Promise<unknown>
): Promise<SendResult> {
  const headers = getAuthHeaders();
  if (!headers) {
    console.warn('[Push] EXPO_ACCESS_TOKEN not configured, skipping');
    return { success: false, sent: 0, failed: messages.length, errors: ['EXPO_ACCESS_TOKEN not configured'] };
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  const allReceipts: { ticketId: string; token: string }[] = [];
  const allRetryable: RetryableError[] = [];

  for (let i = 0; i < messages.length; i += MAX_BATCH_SIZE) {
    const batch = messages.slice(i, i + MAX_BATCH_SIZE);

    try {
      const response = await fetchWithRetry(EXPO_PUSH_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(batch),
      });

      const result = (await response.json()) as { data?: PushTicket[]; errors?: { message: string }[] };

      if (result.errors) {
        errors.push(...result.errors.map((e) => e.message));
        failed += batch.length;
        continue;
      }

      if (!result.data) continue;

      const processed = await processTickets(result.data, batch, deleteToken);
      sent += processed.sent;
      failed += processed.failed;
      errors.push(...processed.errors);
      allReceipts.push(...processed.receipts);
      allRetryable.push(...processed.retryable);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      failed += batch.length;
    }
  }

  if (allReceipts.length > 0) {
    await storeReceipts(allReceipts);
  }

  if (allRetryable.length > 0 && queueRetry) {
    await queueRetry(allRetryable);
  }

  return {
    success: failed === 0 && allRetryable.length === 0,
    sent,
    failed: failed + allRetryable.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export const checkPushRateLimit = internalMutation({
  args: { userId: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const cutoff = Date.now() - PUSH_RATE_WINDOW_MS;
    const recent = await ctx.db
      .query('pushNotificationRateLimit')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.gte(q.field('createdAt'), cutoff))
      .collect();

    if (recent.length >= PUSH_RATE_LIMIT) return false;

    await ctx.db.insert('pushNotificationRateLimit', {
      userId: args.userId,
      createdAt: Date.now(),
    });
    return true;
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
    // Actions use ctx.auth.getUserIdentity() instead of authComponent.safeGetAuthUser()
    // because ActionCtx doesn't provide db access needed by the Better Auth adapter.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    if (identity.subject !== args.userId) throw new Error('Forbidden: Cannot send notifications to other users');

    if (args.title.length > MAX_NOTIF_TITLE_LENGTH) throw new Error(`Title cannot exceed ${MAX_NOTIF_TITLE_LENGTH} characters`);
    if (args.body.length > MAX_NOTIF_BODY_LENGTH) throw new Error(`Body cannot exceed ${MAX_NOTIF_BODY_LENGTH} characters`);

    const allowed = await ctx.runMutation(internal.notificationsSend.checkPushRateLimit, { userId: args.userId });
    if (!allowed) throw new Error('Too many notifications. Please try again later.');

    const tokens = await getTokensOrFail(ctx, args.userId);
    if (!tokens) return NO_TOKENS_RESULT;

    const { deleteToken, storeReceipts } = makeSendCallbacks(ctx);
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
      deleteToken,
      storeReceipts,
      async (retryErrors) => {
        for (const item of retryErrors) {
          if (!item.message.title || !item.message.body) continue;
          await ctx.scheduler.runAfter((item.retryAfter ?? 60) * 1000, internal.notificationsSend.retryPushNotification, {
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
    const { deleteToken, storeReceipts } = makeSendCallbacks(ctx);
    const messages: PushMessage[] = [{
      to: args.token,
      title: args.title,
      body: args.body,
      data: args.data,
      sound: 'default',
      channelId: 'default',
      priority: 'normal',
      ttl: DEFAULT_TTL,
    }];

    return sendPushMessagesRaw(messages, deleteToken, storeReceipts);
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
    const tokens = await getTokensOrFail(ctx, userId);
    if (!tokens) return { success: false, error: 'No push tokens for user' };

    const { deleteToken, storeReceipts } = makeSendCallbacks(ctx);
    const messages: PushMessage[] = tokens.map((t) => ({
      to: t.token,
      title: 'Notifications On',
      body: "We're connected, girl. Now let's get to work.",
      data: { test: true },
      sound: 'default',
      channelId: 'default',
      priority: 'high',
      ttl: 3600,
    }));

    const result = await sendPushMessagesRaw(messages, deleteToken, storeReceipts);

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
    const tokens = await getTokensOrFail(ctx, args.userId);
    if (!tokens) return NO_TOKENS_RESULT;

    const { deleteToken, storeReceipts } = makeSendCallbacks(ctx);
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

    return sendPushMessagesRaw(messages, deleteToken, storeReceipts);
  },
});

