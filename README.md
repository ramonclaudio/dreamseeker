# Expo Starter App

Expo SDK 55 + React 19 + Convex + Better Auth + Resend.

Production-ready authentication starter with email/password, password reset, and real-time backend.

## Stack

| Tech | Version | Purpose |
|------|---------|---------|
| Expo SDK | 55.0.0-canary | React Native framework |
| React | 19.2.0 | UI library (with React Compiler) |
| React Native | 0.83.1 | Mobile runtime (New Architecture) |
| Convex | 1.31.2 | Real-time backend |
| Better Auth | 1.4.10 | Authentication |
| Resend | via @convex-dev/resend | Transactional email |
| TypeScript | 5.9.3 | Type safety |

## Features

- **Email/Password Auth** - Sign up, sign in, sign out
- **Password Reset** - Forgot password flow with email verification
- **Change Password** - Authenticated password change
- **Protected Routes** - Automatic redirects based on auth state
- **User-scoped Data** - Tasks demo with ownership checks
- **Rate Limiting** - Protection against brute force attacks
- **Session Management** - 7-day expiry with daily refresh
- **Email Deliverability** - Idempotency, unsubscribe headers, bounce tracking

## Requirements

- Node.js 18+
- Xcode 16+ (iOS) or Android Studio (Android)
- [Convex account](https://convex.dev) (free tier)
- [Resend account](https://resend.com) (free tier: 100 emails/day)
- **No Expo Go** - SDK 55 canary requires development builds

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Convex backend

```bash
npx convex dev
```

This creates your Convex deployment. Copy the URL to `.env.local`:

```bash
# .env.local
CONVEX_DEPLOYMENT=dev:your-deployment-name
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
EXPO_PUBLIC_SITE_URL=http://localhost:8081
```

### 3. Set Convex environment variables

```bash
# Required: Auth secret (generate a secure random string)
npx convex env set BETTER_AUTH_SECRET $(openssl rand -base64 32)

# Required: Site URL for web support and email links
npx convex env set SITE_URL http://localhost:8081

# Required: Resend API key (get from https://resend.com/api-keys)
npx convex env set RESEND_API_KEY re_xxxxxxxxxxxx

# Required: Verified sender email (verify domain at https://resend.com/domains)
npx convex env set RESEND_FROM_EMAIL noreply@yourdomain.com

# Optional: Disable test mode for production (default: true)
npx convex env set RESEND_TEST_MODE false

# Optional: Webhook secret for delivery tracking
npx convex env set RESEND_WEBHOOK_SECRET whsec_xxxxxxxxxxxx
```

### 4. Build and run

```bash
npm run ios
```

## Development Workflow

Run two terminals:

```bash
# Terminal 1: Convex backend (watches for changes)
npm run convex

# Terminal 2: Expo app
npm run ios          # First time (builds native code)
npm run start        # Subsequent runs (just Metro)
```

## Auth Flows

| Flow | Route | Description |
|------|-------|-------------|
| Sign In | `/sign-in` | Email/password login |
| Sign Up | `/sign-up` | Create new account |
| Forgot Password | `/forgot-password` | Request reset email |
| Reset Password | `/reset-password` | Set new password (from email link) |
| Change Password | Settings modal | Change password when logged in |
| Sign Out | Settings | End session |

## Project Structure

```
├── app/                      # Expo Router screens
│   ├── (auth)/               # Public auth screens
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (app)/                # Protected screens
│   │   └── (tabs)/
│   │       ├── index.tsx     # Home
│   │       ├── tasks.tsx     # Tasks demo
│   │       └── settings.tsx  # Sign out, change password
│   └── _layout.tsx           # Root layout with providers
├── convex/                   # Convex backend
│   ├── auth.ts               # Better Auth config
│   ├── auth.config.ts        # Auth tables config
│   ├── email.ts              # Resend email functions
│   ├── email_templates.ts    # HTML email templates
│   ├── http.ts               # HTTP routes + webhooks
│   ├── crons.ts              # Email cleanup cron
│   ├── tasks.ts              # User-scoped tasks
│   └── schema.ts             # Database schema
├── lib/
│   └── auth-client.ts        # Platform-specific auth client
├── components/               # Shared components
├── constants/                # Theme and styles
└── hooks/                    # Custom hooks
```

## Environment Variables

### Client-side (`.env.local`)

```bash
CONVEX_DEPLOYMENT=dev:your-deployment
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
EXPO_PUBLIC_SITE_URL=http://localhost:8081
```

### Server-side (Convex Dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | Auth encryption key |
| `SITE_URL` | Yes | Public app URL |
| `RESEND_API_KEY` | Yes | Resend API key |
| `RESEND_FROM_EMAIL` | Yes | Verified sender email |
| `RESEND_TEST_MODE` | No | `false` for production |
| `RESEND_WEBHOOK_SECRET` | No | For delivery tracking |

## Production Checklist

### DNS Records (for email deliverability)

Add these DNS records for your sending domain:

1. **SPF** (TXT at `@`): `v=spf1 include:_spf.resend.com ~all`
2. **DKIM** (TXT at `resend._domainkey`): Value from Resend dashboard
3. **DMARC** (TXT at `_dmarc`): `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`

Start DMARC with `p=none` (monitoring), then progress to `p=quarantine` and `p=reject`.

### Webhook Setup (optional)

For bounce/complaint tracking:

1. Go to Resend dashboard → Webhooks
2. Create webhook: `https://your-deployment.convex.site/resend-webhook`
3. Enable events: `email.delivered`, `email.bounced`, `email.complained`
4. Copy secret to `RESEND_WEBHOOK_SECRET`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run ios` | Build and run on iOS simulator |
| `npm run ios:device` | Build and run on physical iOS device |
| `npm run android` | Build and run on Android |
| `npm run start` | Start Metro bundler |
| `npm run web` | Start web dev server |
| `npm run convex` | Start Convex dev server |
| `npm run convex:deploy` | Deploy Convex to production |
| `npm run test` | Run tests in watch mode |
| `npm run test:ci` | Run tests once (CI) |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |

## Learn More

- [Expo docs](https://docs.expo.dev/)
- [Convex docs](https://docs.convex.dev/)
- [Better Auth docs](https://www.better-auth.com/)
- [Resend docs](https://resend.com/docs)
- [Expo Router](https://docs.expo.dev/router/introduction)
