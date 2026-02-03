import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { requireActionCtx } from '@convex-dev/better-auth/utils';
import { convex, crossDomain } from '@convex-dev/better-auth/plugins';
import { betterAuth, type BetterAuthOptions } from 'better-auth/minimal';
import { username, emailOTP } from 'better-auth/plugins';
import { expo } from '@better-auth/expo';
import { components } from './_generated/api';
import { DataModel, Id } from './_generated/dataModel';
import { query } from './_generated/server';
import authConfig from './auth.config';
import { sendOTPVerification, sendResetPassword } from './email';
import { env } from './env';

export const authComponent = createClient<DataModel>(components.betterAuth);
const ONE_MINUTE = 60;
const ONE_HOUR = 60 * 60;
const ONE_DAY = ONE_HOUR * 24;
const SEVEN_DAYS = ONE_DAY * 7;

export const createAuth = (ctx: GenericCtx<DataModel>) => betterAuth({
  trustedOrigins: ['expostarterapp://', 'exp://', 'http://localhost:8081', env.siteUrl, 'https://appleid.apple.com'],
  database: authComponent.adapter(ctx),
  user: { changeEmail: { enabled: true, updateEmailWithoutVerification: false } },
  socialProviders: {
    apple: {
      clientId: env.apple.clientId,
      clientSecret: env.apple.clientSecret,
      appBundleIdentifier: 'com.ramonclaudio.expo-starter-app',
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: ONE_HOUR,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPassword(requireActionCtx(ctx), { to: user.email, url });
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
  },
  session: { expiresIn: SEVEN_DAYS, updateAge: ONE_DAY, cookieCache: { enabled: true, maxAge: ONE_MINUTE * 5 } },
  rateLimit: {
    enabled: true,
    window: ONE_MINUTE,
    max: 10,
    customRules: {
      '/sign-in/email': { window: ONE_MINUTE * 15, max: 5 },
      '/sign-in/username': { window: ONE_MINUTE * 15, max: 5 },
      '/sign-up/email': { window: ONE_HOUR, max: 3 },
      '/forgot-password': { window: ONE_HOUR, max: 3 },
      '/reset-password': { window: ONE_MINUTE * 15, max: 5 },
      '/change-password': { window: ONE_MINUTE * 15, max: 5 },
      '/email-otp/verify-email': { window: ONE_MINUTE * 15, max: 5 },
    },
  },
  plugins: [
    expo(),
    username({ minUsernameLength: 3, maxUsernameLength: 20 }),
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp }) {
        await sendOTPVerification(requireActionCtx(ctx), { to: email, otp });
      },
    }),
    convex({ authConfig }),
    crossDomain({ siteUrl: env.siteUrl }),
  ],
} satisfies BetterAuthOptions);

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;

    const isStorageId = user.image && !user.image.includes('/') && !user.image.startsWith('http');
    if (isStorageId) {
      try {
        const imageUrl = await ctx.storage.getUrl(user.image as Id<'_storage'>);
        return { ...user, image: imageUrl, imageStorageId: user.image };
      } catch {
        return { ...user, image: null, imageStorageId: null };
      }
    }
    return { ...user, imageStorageId: null };
  },
});
