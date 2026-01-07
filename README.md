# Expo Starter App

Production-ready SaaS starter for mobile. Auth, payments, real-time data—wired up and working.

## Why This Exists

Building mobile SaaS from scratch means weeks on auth flows, payment integration, and backend plumbing before writing any actual product code. This starter handles that foundation so you can focus on what makes your app unique.

## Stack

| Layer | Tech |
|-------|------|
| Runtime | Expo SDK 55 · React 19 · React Compiler |
| Backend | Convex (real-time) · Better Auth · Resend |
| Payments | Stripe (@convex-dev/stripe) |
| Styling | NativeWind v5 · Tailwind v4 |
| Native | iOS 26 Liquid Glass · SF Symbols · Haptics |

## What's Included

- **Auth**: Email/password, password reset, rate limiting, 7-day sessions
- **Payments**: Stripe subscriptions with monthly/annual toggle
- **Profile**: Avatar upload, account deletion with full data cleanup
- **UI**: Theme system (System/Light/Dark), cross-platform

## Prerequisites

- Node 18+, Xcode 16+ or Android Studio
- [Convex](https://convex.dev), [Resend](https://resend.com), [Stripe](https://stripe.com) accounts

Expo Go not supported—SDK 55 requires development builds.

## Quick Start

```bash
git clone https://github.com/ramonclaudio/expo-starter-app.git
cd expo-starter-app && npm install

npx convex dev  # Creates deployment, prints URLs
```

Create `.env.local`:

```bash
CONVEX_DEPLOYMENT=dev:your-deployment
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
EXPO_PUBLIC_SITE_URL=http://localhost:8081
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
EXPO_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxx
EXPO_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID=price_xxxx
```

Set server env vars:

```bash
npx convex env set BETTER_AUTH_SECRET $(openssl rand -base64 32)
npx convex env set SITE_URL http://localhost:8081
npx convex env set RESEND_API_KEY re_xxxx
npx convex env set RESEND_FROM_EMAIL noreply@yourdomain.com
npx convex env set STRIPE_SECRET_KEY sk_test_xxxx
npx convex env set STRIPE_WEBHOOK_SECRET whsec_xxxx
```

Run (two terminals):

```bash
npm run convex  # Terminal 1: backend
npm run ios     # Terminal 2: app
```

## Stripe Setup

1. Enable **Test Mode** in [Stripe Dashboard](https://dashboard.stripe.com)
2. Create a "Pro" product with monthly and annual prices
3. Copy price IDs (not product IDs) to your env vars
4. Local webhook: `stripe listen --forward-to https://your-deployment.convex.site/stripe/webhook`

Test card: `4242 4242 4242 4242`

## Commands

```bash
npm run ios           # Clean prebuild + simulator
npm run ios:device    # Clean prebuild + device
npm run ios:fast      # Skip prebuild (native unchanged)
npm run android       # Android
npm run web           # Web
npm run convex        # Backend with hot reload
npm run clean         # Nuclear reset
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint
```

## Production

**Email DNS** (for deliverability):

```
@ TXT "v=spf1 include:_spf.resend.com ~all"
resend._domainkey TXT <value from Resend dashboard>
_dmarc TXT "v=DMARC1; p=none;"
```

**Stripe Webhook**:

1. Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-deployment.convex.site/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.*`

**Deploy**:

```bash
npx convex deploy
```

## License

MIT
