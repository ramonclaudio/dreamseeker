import { Resend } from '@convex-dev/resend';
import { components } from './_generated/api';
import { ActionCtx } from './_generated/server';
import { resetPasswordTemplate, emailVerificationTemplate } from './email_templates';

// testMode: false = production (sends to real addresses)
// testMode: true = development (only allows @resend.dev test addresses)
// Set RESEND_TEST_MODE=false in Convex dashboard for production
const isTestMode = process.env.RESEND_TEST_MODE !== 'false';

export const resend = new Resend(components.resend, {
  testMode: isTestMode,
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
 * @throws Error if email fails after logging
 */
const sendEmail = async (ctx: ActionCtx, options: EmailOptions) => {
  const { to, subject, html, idempotencyKey, headers = [] } = options;

  // Add X-Entity-Ref-ID to prevent Gmail threading on similar email types
  const entityRefId = idempotencyKey ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const emailHeaders: Array<{ name: string; value: string }> = [
    { name: 'X-Entity-Ref-ID', value: entityRefId },
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
