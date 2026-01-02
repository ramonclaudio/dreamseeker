import { Resend, vOnEmailEventArgs } from '@convex-dev/resend';
import { components, internal } from './_generated/api';
import { ActionCtx, internalMutation } from './_generated/server';
import { resetPasswordTemplate, emailVerificationTemplate } from './email_templates';

// testMode: false = production (sends to real addresses)
// testMode: true = development (only allows @resend.dev test addresses)
// Set RESEND_TEST_MODE=false in Convex dashboard for production
const isTestMode = process.env.RESEND_TEST_MODE !== 'false';

// Site URL for unsubscribe links (required - set in Convex dashboard)
const siteUrl = process.env.SITE_URL;
if (!siteUrl) {
  throw new Error('SITE_URL environment variable is required. Set it in the Convex dashboard.');
}

export const resend: Resend = new Resend(components.resend, {
  testMode: isTestMode,
  webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
  onEmailEvent: internal.email.handleEmailEvent,
});

const APP_NAME = 'Expo Starter App';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com';

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  idempotencyKey?: string;
  headers?: Array<{ name: string; value: string }>;
};

/**
 * Send an email with error handling, idempotency, and custom headers
 * Includes List-Unsubscribe headers for Gmail/Yahoo compliance (Feb 2024 requirement)
 * @throws Error if email fails after logging
 */
const sendEmail = async (ctx: ActionCtx, options: EmailOptions) => {
  const { to, subject, html, idempotencyKey, headers = [] } = options;

  // Add X-Entity-Ref-ID to prevent Gmail threading on similar email types
  const entityRefId = idempotencyKey ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Build headers with unsubscribe support (Gmail/Yahoo requirement since Feb 2024)
  // Note: For transactional auth emails, unsubscribe is optional but improves deliverability
  const emailHeaders: Array<{ name: string; value: string }> = [
    { name: 'X-Entity-Ref-ID', value: entityRefId },
    { name: 'List-Unsubscribe', value: `<${siteUrl}/unsubscribe?email=${encodeURIComponent(to)}>` },
    { name: 'List-Unsubscribe-Post', value: 'List-Unsubscribe=One-Click' },
    ...headers,
  ];

  try {
    const result = await resend.sendEmail(ctx, {
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      headers: emailHeaders,
    });

    return result;
  } catch (error) {
    // Log error for debugging but don't expose internal details to caller
    console.error('[Email] Failed to send email:', {
      to,
      subject,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Failed to send email. Please try again later.');
  }
};

/**
 * Generate a unique idempotency key for email operations
 * Format: <type>-<recipient-hash>-<timestamp>
 */
const generateIdempotencyKey = (type: string, email: string): string => {
  // Simple hash of email for privacy (not cryptographic, just for uniqueness)
  const emailHash = email.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  return `${type}-${Math.abs(emailHash).toString(36)}-${Date.now()}`;
};

export const sendResetPassword = async (
  ctx: ActionCtx,
  { to, url }: { to: string; url: string },
) => {
  const idempotencyKey = generateIdempotencyKey('reset-password', to);

  await sendEmail(ctx, {
    to,
    subject: 'Reset your password',
    html: resetPasswordTemplate(url),
    idempotencyKey,
  });
};

export const sendEmailVerification = async (
  ctx: ActionCtx,
  { to, url }: { to: string; url: string },
) => {
  const idempotencyKey = generateIdempotencyKey('email-verification', to);

  await sendEmail(ctx, {
    to,
    subject: 'Verify your email address',
    html: emailVerificationTemplate(url),
    idempotencyKey,
  });
};

/**
 * Handle email delivery events from Resend webhooks
 * Tracks bounces and complaints for deliverability monitoring
 */
export const handleEmailEvent = internalMutation({
  args: vOnEmailEventArgs,
  handler: async (_ctx, { id, event }) => {
    const eventType = event.type;

    // Log all events for debugging (can be removed in production)
    console.log(`[Email] Event ${eventType} for email ${id}`);

    // Handle bounces - indicates delivery failure
    if (eventType === 'email.bounced') {
      const bounce = event.data.bounce;
      console.warn('[Email] Bounce detected:', {
        emailId: id,
        type: bounce?.type,
        message: bounce?.message,
        recipient: event.data.to?.[0],
      });
      // Future: Add to suppression list table to prevent re-sending
    }

    // Handle spam complaints - critical for domain reputation
    if (eventType === 'email.complained') {
      console.error('[Email] Spam complaint received:', {
        emailId: id,
        recipient: event.data.to?.[0],
      });
      // Future: Add to suppression list and alert
    }

    // Handle delivery failures
    if (eventType === 'email.failed') {
      console.error('[Email] Delivery failed:', {
        emailId: id,
        recipient: event.data.to?.[0],
      });
    }
  },
});
