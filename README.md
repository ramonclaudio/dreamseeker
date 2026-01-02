# Expo Starter App

Production-ready auth for Expo. Email/password + username login, password reset, rate limiting, real-time backend.

**Stack:** Expo SDK 55 (canary) · React 19 · Convex · Better Auth · Resend

## Features

- Sign up/in with email or username
- Password reset via email
- Protected routes with auto-redirect
- Rate limiting on auth endpoints
- Session persistence (7 day expiry)
- Email deliverability (SPF/DKIM/DMARC, bounce tracking)

## Prerequisites

Before you start, you need:

1. **Node.js 18+** - [nodejs.org](https://nodejs.org)
2. **Xcode 16+** (iOS) or **Android Studio** (Android)
3. **Convex account** - Sign up at [convex.dev](https://convex.dev) (free tier)
4. **Resend account** - Sign up at [resend.com](https://resend.com) (free: 100 emails/day)
5. **Verified domain on Resend** - Add and verify your domain at [resend.com/domains](https://resend.com/domains)

> **Note:** Expo Go is not supported. SDK 55 canary requires development builds.

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/ramonclaudio/expo-starter-app.git
cd expo-starter-app
npm install

# 2. Start Convex (creates deployment, deploys schema + auth)
npx convex dev
# Follow prompts to create a new project or link existing one
# This auto-deploys the database schema and Better Auth config

# 3. Create .env.local (Convex prints these values after setup)
cat > .env.local << 'EOF'
CONVEX_DEPLOYMENT=dev:your-deployment-name
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
EXPO_PUBLIC_SITE_URL=http://localhost:8081
EOF

# 4. Set server environment variables
npx convex env set BETTER_AUTH_SECRET $(openssl rand -base64 32)
npx convex env set SITE_URL http://localhost:8081
npx convex env set RESEND_API_KEY re_xxxxxxxxxxxx        # From resend.com/api-keys
npx convex env set RESEND_FROM_EMAIL noreply@yourdomain.com  # Your verified domain

# 5. Run the app
npm run ios
```

## What Gets Deployed

When you run `npx convex dev`, it automatically:
- Creates your Convex deployment (if new)
- Deploys database schema (`convex/schema.ts`)
- Deploys Better Auth tables and config
- Registers HTTP routes for auth endpoints
- Sets up email functions and cron jobs

No manual database setup required.

## Development

Two terminals:

```bash
npm run convex    # Terminal 1: backend (watches for changes)
npm run ios       # Terminal 2: app (first run builds native code)
npm run start     # Terminal 2: app (subsequent runs, just Metro)
```

## Environment Variables

**Client (.env.local):**
- `CONVEX_DEPLOYMENT` - Deployment name (e.g., `dev:amiable-seahorse-506`)
- `EXPO_PUBLIC_CONVEX_URL` - Convex cloud URL (`.convex.cloud`)
- `EXPO_PUBLIC_CONVEX_SITE_URL` - Convex site URL (`.convex.site`)
- `EXPO_PUBLIC_SITE_URL` - App URL for email links (`http://localhost:8081`)

**Server (Convex Dashboard → Settings → Environment Variables):**
- `BETTER_AUTH_SECRET` - Auth encryption key (required)
- `SITE_URL` - App URL, same as `EXPO_PUBLIC_SITE_URL` (required)
- `RESEND_API_KEY` - From [resend.com/api-keys](https://resend.com/api-keys) (required)
- `RESEND_FROM_EMAIL` - Your verified sender email (required)
- `RESEND_TEST_MODE` - Set `false` for production (optional)
- `RESEND_WEBHOOK_SECRET` - From [resend.com/webhooks](https://resend.com/webhooks) (optional)

## Production

**DNS records for email deliverability:**

```
@ TXT "v=spf1 include:_spf.resend.com ~all"
resend._domainkey TXT <value from Resend dashboard>
_dmarc TXT "v=DMARC1; p=none;"
```

**Webhook (optional):** Point `https://your-deployment.convex.site/resend-webhook` to Resend for bounce/complaint tracking.
