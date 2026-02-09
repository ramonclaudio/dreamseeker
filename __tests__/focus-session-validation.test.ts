/**
 * Focus session and notification validation tests.
 *
 * Tests REAL functions and constants from the codebase:
 * - validateFocusDuration from convex/validation.ts
 * - classifyTicket, constants from convex/notificationsSend.ts
 */
import {
  validateFocusDuration,
  MIN_FOCUS_DURATION,
  MAX_FOCUS_DURATION,
} from '../convex/validation';

// Mock Convex internals that notificationsSend.ts transitively imports
jest.mock('../convex/_generated/server', () => ({
  action: (opts: unknown) => opts,
  internalAction: (opts: unknown) => opts,
  internalMutation: (opts: unknown) => opts,
}));
jest.mock('../convex/_generated/api', () => ({ internal: {} }));
jest.mock('../convex/env', () => ({ env: { expo: {} } }));

import {
  classifyTicket,
  PUSH_RATE_LIMIT,
  PUSH_RATE_WINDOW_MS,
  MAX_BATCH_SIZE,
  MAX_RETRIES,
  INITIAL_RETRY_DELAY,
  MAX_NOTIF_TITLE_LENGTH,
  MAX_NOTIF_BODY_LENGTH,
  type PushTicket,
} from '../convex/notificationsSend';

// ── Focus Session Duration (REAL from convex/validation.ts) ─────────────────

describe('Focus session duration validation', () => {
  it('rejects duration under 1 minute', () => {
    expect(validateFocusDuration(0).valid).toBe(false);
    expect(validateFocusDuration(30).valid).toBe(false);
    expect(validateFocusDuration(59).valid).toBe(false);
  });

  it('accepts exactly 1 minute (60 seconds)', () => {
    expect(validateFocusDuration(MIN_FOCUS_DURATION).valid).toBe(true);
  });

  it('accepts normal session durations', () => {
    expect(validateFocusDuration(300).valid).toBe(true); // 5 min
    expect(validateFocusDuration(1500).valid).toBe(true); // 25 min (pomodoro)
    expect(validateFocusDuration(3600).valid).toBe(true); // 1 hour
    expect(validateFocusDuration(7200).valid).toBe(true); // 2 hours
  });

  it('accepts exactly 8 hours', () => {
    expect(validateFocusDuration(MAX_FOCUS_DURATION).valid).toBe(true);
  });

  it('rejects duration over 8 hours', () => {
    expect(validateFocusDuration(MAX_FOCUS_DURATION + 1).valid).toBe(false);
    expect(validateFocusDuration(86400).valid).toBe(false);
  });

  it('rejects negative duration', () => {
    expect(validateFocusDuration(-1).valid).toBe(false);
    expect(validateFocusDuration(-3600).valid).toBe(false);
  });

  it('returns descriptive error messages', () => {
    expect(validateFocusDuration(30).error).toContain('1 minute');
    expect(validateFocusDuration(30000).error).toContain('8 hours');
  });
});

// ── Notification Ticket Classification (REAL from convex/notificationsSend.ts) ──

describe('Notification ticket classification', () => {
  it('classifies successful ticket as sent', () => {
    expect(classifyTicket({ status: 'ok', id: 'ticket-123' })).toBe('sent');
  });

  it('classifies non-error status without id as sent', () => {
    expect(classifyTicket({ status: 'ok' })).toBe('sent');
  });

  it('classifies DeviceNotRegistered as device_removed', () => {
    expect(classifyTicket({
      status: 'error',
      details: { error: 'DeviceNotRegistered' },
    })).toBe('device_removed');
  });

  it('classifies MessageRateExceeded as rate_limited', () => {
    expect(classifyTicket({
      status: 'error',
      details: { error: 'MessageRateExceeded' },
    })).toBe('rate_limited');
  });

  it('classifies unknown error as failed', () => {
    expect(classifyTicket({
      status: 'error',
      message: 'Something went wrong',
    })).toBe('failed');
  });

  it('classifies error with unknown detail as failed', () => {
    expect(classifyTicket({
      status: 'error',
      details: { error: 'InvalidCredentials' },
    })).toBe('failed');
  });
});

// ── Notification Constants (REAL from convex/notificationsSend.ts) ──────────

describe('Notification constants', () => {
  it('rate limit is 10 per minute window', () => {
    expect(PUSH_RATE_LIMIT).toBe(10);
    expect(PUSH_RATE_WINDOW_MS).toBe(60_000);
  });

  it('batch size is 100', () => {
    expect(MAX_BATCH_SIZE).toBe(100);
  });

  it('retry config uses exponential backoff', () => {
    expect(MAX_RETRIES).toBe(3);
    expect(INITIAL_RETRY_DELAY).toBe(1000);
    // Verify total max wait: 1000 + 2000 + 4000 = 7000ms < 10s
    let total = 0;
    let delay = INITIAL_RETRY_DELAY;
    for (let i = 0; i < MAX_RETRIES; i++) {
      total += delay;
      delay *= 2;
    }
    expect(total).toBeLessThan(10_000);
  });

  it('notification message limits are reasonable', () => {
    expect(MAX_NOTIF_TITLE_LENGTH).toBe(100);
    expect(MAX_NOTIF_BODY_LENGTH).toBe(500);
  });
});

// ── Batch calculation (using REAL MAX_BATCH_SIZE) ───────────────────────────

describe('Push message batching', () => {
  it('calculates correct number of batches', () => {
    const cases = [
      { messages: 1, expected: 1 },
      { messages: 50, expected: 1 },
      { messages: 100, expected: 1 },
      { messages: 101, expected: 2 },
      { messages: 200, expected: 2 },
      { messages: 250, expected: 3 },
    ];

    for (const { messages, expected } of cases) {
      expect(Math.ceil(messages / MAX_BATCH_SIZE)).toBe(expected);
    }
  });
});
