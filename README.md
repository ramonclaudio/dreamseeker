# Expo Starter App

Production-ready Expo starter with authentication, backend, and email. Payment-agnostic base for building mobile apps.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Expo SDK 55 · React 19 · React Compiler |
| Backend | Convex (real-time) · Better Auth · Resend |
| Styling | StyleSheet · Theme system |
| Native | iOS 26 Liquid Glass · SF Symbols · Haptics |

## Branches

```
main       → Clean base, no payments
stripe     → Stripe integration
revenuecat → RevenueCat integration (you are here)
```

Choose your branch based on payment needs. All branches share the same core features.

## What's Included

- **Auth**: Email/password with verification, password reset, rate limiting
- **Profile**: Avatar upload, account deletion with full data cleanup
- **Tasks**: Unlimited task management (no tier limits)
- **Push Notifications**: Expo push with token management
- **UI**: Theme system (System/Light/Dark), offline banner, cross-platform

## Prerequisites

| Service | Purpose | Sign Up |
|---------|---------|---------|
| [Convex](https://convex.dev) | Real-time backend | Free tier available |
| [Resend](https://resend.com) | Transactional email | Free tier (3k/month) |
| [Expo](https://expo.dev) | Build service | Free tier available |
| [EAS](https://expo.dev/eas) | Cloud builds | Part of Expo account |

**Local requirements:**
- Node 18+
- Xcode 16+ (iOS) or Android Studio (Android)
- Expo Go not supported—SDK 55 requires development builds

---

## Complete Setup Guide

### Step 1: Clone and Install

```bash
git clone https://github.com/ramonclaudio/expo-starter-app.git
cd expo-starter-app
npm install
```

This creates `.env.local` from `.env.local.dev` automatically.

---

### Step 2: Convex Setup

#### 2.1 Create Convex Account

1. Go to [convex.dev](https://convex.dev) and sign up
2. Create a new project (name it anything)

#### 2.2 Initialize Convex in Project

```bash
npx convex dev
```

Follow the prompts:
- Select your team/project
- This creates a **development deployment** (e.g., `amiable-seahorse-506`)
- The CLI outputs your deployment URLs

#### 2.3 Copy Convex URLs to Local Env

Open `.env.local.dev` and fill in:

```bash
CONVEX_DEPLOYMENT=dev:your-deployment-slug
EXPO_PUBLIC_CONVEX_URL=https://your-deployment-slug.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment-slug.convex.site
```

#### 2.4 Create Production Deployment

```bash
npx convex deploy
```

This creates a separate **production deployment** (e.g., `determined-civet-459`).

Save the prod URLs for later (EAS builds).

#### 2.5 Get Deploy Keys

You need deploy keys for EAS cloud builds.

**For each deployment (dev and prod):**
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your deployment
3. Go to **Settings** → **Deploy Keys**
4. Click **Generate Deploy Key**
5. Save the key (format: `prod:slug|xxxxx` or `dev:slug|xxxxx`)

---

### Step 3: Resend Setup

#### 3.1 Create Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email domain (or use their test domain for development)

#### 3.2 Get API Key

1. Go to **API Keys** → **Create API Key**
2. Copy the key (`re_xxx`)

#### 3.3 Create Webhook (Optional)

For email delivery tracking:
1. Go to **Webhooks** → **Add Webhook**
2. URL: `https://your-deployment.convex.site/resend/webhook`
3. Select events: all delivery events
4. Copy the webhook secret

---

### Step 4: Expo Setup

#### 4.1 Create Expo Account

1. Go to [expo.dev](https://expo.dev) and sign up
2. This also gives you access to EAS

#### 4.2 Get Access Token

For push notifications:
1. Go to **Account Settings** → **Access Tokens**
2. Click **Create Token**
3. Name it (e.g., "expo-starter-app")
4. Copy the token

---

### Step 5: Set Convex Environment Variables

**You must set env vars for BOTH deployments (dev and prod).**

#### 5.1 Development Deployment

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your **dev deployment**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```bash
# App
SITE_URL=expostarterapp://
SUPPORT_EMAIL=your@email.com

# Push Notifications
EXPO_ACCESS_TOKEN=<from Step 4.2>

# Better Auth
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>

# Resend
RESEND_API_KEY=<from Step 3.2>
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_WEBHOOK_SECRET=<from Step 3.3, or skip>
```

#### 5.2 Production Deployment

1. Select your **prod deployment** in Convex Dashboard
2. Go to **Settings** → **Environment Variables**
3. Add the **same variables** as dev, but with production values:
   - Generate a **different** `BETTER_AUTH_SECRET`

---

### Step 6: Set Local Environment Variables

Edit `.env.local.dev` with your values:

```bash
# Convex
CONVEX_DEPLOYMENT=dev:your-slug
EXPO_PUBLIC_CONVEX_URL=https://your-slug.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-slug.convex.site

# App
EXPO_PUBLIC_SITE_URL=expostarterapp://
```

Copy to `.env.local`:
```bash
cp .env.local.dev .env.local
```

---

### Step 7: Set EAS Environment Variables

EAS needs env vars for cloud builds. Set them for **both profiles** (development and production).

#### 7.1 Production Profile

1. Go to [EAS Dashboard](https://expo.dev) → Your Project → **Environment Variables**
2. Create variables for **production** environment:

```bash
CONVEX_DEPLOY_KEY=prod:your-slug|xxxxx
EXPO_PUBLIC_CONVEX_URL=https://your-prod-slug.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-prod-slug.convex.site
EXPO_PUBLIC_SITE_URL=expostarterapp://
```

All variables should be **Plain text** visibility.

#### 7.2 Development Profile (Optional)

If you want EAS dev builds:
1. Create variables for **development** environment
2. Use your **dev** Convex deployment URLs and deploy key

---

### Step 8: Run the App

Open **two terminals**:

**Terminal 1 - Backend:**
```bash
npm run convex
```

**Terminal 2 - App:**
```bash
npm run ios        # iOS Simulator
npm run android    # Android Emulator
```

---

## Environment Summary

| Location | What Goes There | When Used |
|----------|-----------------|-----------|
| `.env.local` | Convex URLs | Local simulator/device |
| Convex Dashboard (dev) | All server secrets | `npm run convex` |
| Convex Dashboard (prod) | All server secrets | Production app |
| EAS Dashboard (prod) | Deploy key, public vars | `eas build --profile production` |
| EAS Dashboard (dev) | Deploy key, public vars | `eas build --profile development` |

---

## Commands

```bash
# Development
npm run ios                 # Clean build + simulator
npm run ios:device          # Clean build + physical device
npm run android             # Android emulator
npm run android:device      # Android physical device
npm run web                 # Web dev server
npm run convex              # Convex backend with hot reload

# Environment
npm run env:dev             # Switch to dev backend
npm run env:prod            # Switch to prod backend

# Quality
npm run check               # Lint + typecheck
npm run lint                # ESLint
npm run typecheck           # tsc --noEmit

# Reset
npm run clean               # Project reset
npm run clean:nuclear       # Full reset (all caches)
```

---

## EAS Builds

After completing setup:

```bash
# Development build (for testing)
eas build --platform ios --profile development

# Production build (for App Store)
eas build --platform ios --profile production
```

---

## Push Notifications

Already wired up. Just needs `EXPO_ACCESS_TOKEN` in Convex dashboard (set in Step 5).

**Requirements:**
- Physical device (iOS Simulator doesn't support push)
- EAS project ID (auto-configured from `app.json`)

**How it works:**
1. User signs in → app registers push token with Convex
2. Token stored in `pushTokens` table with device ID
3. Backend sends via Expo Push API (`convex/notifications.ts`)
4. Receipts tracked, stale tokens auto-cleaned

**Testing:**
1. Run on physical device
2. Sign in
3. Go to **Settings** → **Notifications** → **Send Test**

**Sending from backend:**
```typescript
// Single user
await ctx.runAction(api.notifications.sendPushNotification, {
  userId: "user_123",
  title: "Hello",
  body: "You have a new message",
  data: { screen: "messages" },
});

// Batch (multiple users)
await ctx.runAction(api.notifications.sendBatchNotifications, {
  notifications: [
    { userId: "user_1", title: "Alert", body: "..." },
    { userId: "user_2", title: "Alert", body: "..." },
  ],
});
```

---

## Apple Sign-In (Optional)

Pre-configured but requires Apple Developer setup:

1. Apple Developer Portal → Identifiers → Enable "Sign In with Apple"
2. Create a Services ID for web auth
3. Generate a private key and JWT client secret
4. Set in Convex dashboard:
   ```bash
   APPLE_CLIENT_ID=your-services-id
   APPLE_CLIENT_SECRET=your-jwt-secret
   ```

---

## Project Structure

```
app/
├── _layout.tsx           # Root: Convex + Auth providers
├── (auth)/               # Sign in, sign up, password reset
└── (app)/(tabs)/         # Home, tasks, explore, profile, settings

convex/
├── auth.ts               # Better Auth setup
├── tasks.ts              # Tasks CRUD (unlimited)
├── users.ts              # Account management
├── storage.ts            # File uploads
├── notifications.ts      # Push notifications
└── email.ts              # Email sending

lib/
├── auth-client.ts        # Auth client
└── env.ts                # Environment validation

hooks/
├── use-push-notifications.ts
├── use-color-scheme.ts
└── use-avatar-upload.ts
```

---

## Adding Payments

Switch to a payment branch:

```bash
# For Stripe (web billing, direct control)
git checkout stripe

# For RevenueCat (App Store/Play Store IAP)
git checkout revenuecat
```

Each payment branch adds:
- Payment SDK and provider
- Subscription hooks
- Tier-gated routes
- Billing UI

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing CONVEX_URL" | Check `.env.local` exists and has values |
| "Unauthorized" errors | Verify Convex env vars in dashboard |
| Push notifications fail | Use physical device (simulator doesn't support) |
| EAS build fails | Check `CONVEX_DEPLOY_KEY` is set in EAS |

---

## Production Checklist

- [ ] Create Convex production deployment
- [ ] Set all Convex prod env vars
- [ ] Set up email DNS records for Resend
- [ ] Configure EAS production env vars
- [ ] Generate new `BETTER_AUTH_SECRET` for prod
- [ ] Test full signup flow in production

---

## License

MIT
