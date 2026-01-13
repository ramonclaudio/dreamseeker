import { Resend, vOnEmailEventArgs } from '@convex-dev/resend';
import { components, internal } from './_generated/api';
import { ActionCtx, internalMutation, internalAction } from './_generated/server';
import { v } from 'convex/values';
import { resetPasswordTemplate, emailVerificationTemplate, paymentFailedTemplate } from './email_templates';
import { env } from './env';

export const resend: Resend = new Resend(components.resend, {
  testMode: env.resend.testMode,
  webhookSecret: env.resend.webhookSecret,
  onEmailEvent: internal.email.handleEmailEvent,
});

const APP_NAME = 'Expo Starter App';

const sendEmail = async (ctx: ActionCtx, options: {
  to: string;
  subject: string;
  html: string;
  idempotencyKey?: string;
  headers?: Array<{ name: string; value: string }>;
}) => {
  const { to, subject, html, idempotencyKey, headers = [] } = options;
  const entityRefId = idempotencyKey ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const emailHeaders: Array<{ name: string; value: string }> = [
    { name: 'X-Entity-Ref-ID', value: entityRefId },
    { name: 'List-Unsubscribe', value: `<${env.siteUrl}/unsubscribe?email=${encodeURIComponent(to)}>` },
    { name: 'List-Unsubscribe-Post', value: 'List-Unsubscribe=One-Click' },
    ...headers,
  ];
  try {
    return await resend.sendEmail(ctx, { from: `${APP_NAME} <${env.resend.fromEmail}>`, to, subject, html, headers: emailHeaders });
  } catch (error) {
    console.error('[Email] Failed:', { to, subject, error: error instanceof Error ? error.message : 'Unknown' });
    throw new Error('Failed to send email. Please try again later.');
  }
};

const generateIdempotencyKey = (type: string, email: string): string => {
  const emailHash = email.split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
  return `${type}-${Math.abs(emailHash).toString(36)}-${Date.now()}`;
};

export const sendResetPassword = async (ctx: ActionCtx, { to, url }: { to: string; url: string }) => {
  await sendEmail(ctx, { to, subject: 'Reset your password', html: resetPasswordTemplate(url), idempotencyKey: generateIdempotencyKey('reset-password', to) });
};

export const sendEmailVerification = async (ctx: ActionCtx, { to, url }: { to: string; url: string }) => {
  await sendEmail(ctx, { to, subject: 'Verify your email address', html: emailVerificationTemplate(url), idempotencyKey: generateIdempotencyKey('email-verification', to) });
};

export const sendPaymentFailedEmail = async (ctx: ActionCtx, { to, portalUrl }: { to: string; portalUrl: string }) => {
  await sendEmail(ctx, { to, subject: 'Action Required: Payment Failed', html: paymentFailedTemplate(portalUrl), idempotencyKey: generateIdempotencyKey('payment-failed', to) });
};

export const sendPaymentFailedEmailInternal = internalAction({
  args: { to: v.string(), portalUrl: v.string() },
  handler: async (ctx, args) => {
    await sendPaymentFailedEmail(ctx, args);
  },
});

export const handleEmailEvent = internalMutation({
  args: vOnEmailEventArgs,
  handler: async (_ctx, { id, event }) => {
    console.log(`[Email] Event ${event.type} for email ${id}`);
    if (event.type === 'email.bounced') console.warn('[Email] Bounce:', { emailId: id, type: event.data.bounce?.type, recipient: event.data.to?.[0] });
    if (event.type === 'email.complained') console.error('[Email] Spam complaint:', { emailId: id, recipient: event.data.to?.[0] });
    if (event.type === 'email.failed') console.error('[Email] Failed:', { emailId: id, recipient: event.data.to?.[0] });
  },
});
