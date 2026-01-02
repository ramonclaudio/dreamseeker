import { Resend } from '@convex-dev/resend';
import { components } from './_generated/api';
import { ActionCtx } from './_generated/server';

// testMode: false = production (sends to real addresses)
// testMode: true = development (only allows @resend.dev test addresses)
// Set RESEND_TEST_MODE=false in Convex dashboard for production
const isTestMode = process.env.RESEND_TEST_MODE !== 'false';

export const resend = new Resend(components.resend, {
  testMode: isTestMode,
});

const APP_NAME = 'Expo Starter App';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com';

const sendEmail = async (
  ctx: ActionCtx,
  { to, subject, html }: { to: string; subject: string; html: string },
) => {
  await resend.sendEmail(ctx, {
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
};

export const sendResetPassword = async (
  ctx: ActionCtx,
  { to, url }: { to: string; url: string },
) => {
  await sendEmail(ctx, {
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #666; font-size: 12px;">Or copy this link: ${url}</p>
      </div>
    `,
  });
};

export const sendEmailVerification = async (
  ctx: ActionCtx,
  { to, url }: { to: string; url: string },
) => {
  await sendEmail(ctx, {
    to,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        <p style="color: #666; font-size: 12px;">Or copy this link: ${url}</p>
      </div>
    `,
  });
};
