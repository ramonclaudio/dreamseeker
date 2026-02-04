# Expo Starter App

Production-ready Expo starter with authentication, subscriptions, and email. RevenueCat integration for App Store and Play Store in-app purchases.

## Stack

| Layer | Tech |
| :--- | :--- |
| Framework | Expo SDK 55 · React 19 · React Compiler |
| Backend | Convex (real-time) · Better Auth · Resend |
| Payments | RevenueCat · `convex-revenuecat` component |
| Styling | StyleSheet · Theme system |
| Native | iOS 26 Liquid Glass · SF Symbols · Haptics |

## Branches

```text
main       → Clean base, no payments
stripe     → Stripe integration
revenuecat → RevenueCat integration (you are here)
```

## What's Included

- **Auth** — Email/password with verification, password reset, rate limiting
- **Subscriptions** — Free (10 tasks) and Premium (unlimited) tiers
- **Profile** — Avatar upload, account deletion with full data cleanup
- **Tasks** — Tier-limited task management
- **Push Notifications** — Expo push with token management
- **UI** — Theme system (System/Light/Dark), offline banner, cross-platform

## Prerequisites

| Service | Purpose | Sign Up |
| :--- | :--- | :--- |
| [Convex](https://convex.dev) | Real-time backend | Free tier available |
| [RevenueCat](https://revenuecat.com) | In-app purchases | Free tier available |
| [Resend](https://resend.com) | Transactional email | Free tier (3k/month) |
| [Expo](https://expo.dev) | Build service | Free tier available |

**Local requirements:**

- Node 18+
- Xcode 16+ (iOS) or Android Studio (Android)

> [!IMPORTANT]
> Expo Go is not supported — SDK 55 requires development builds.

---

## Setup Guide

> [!IMPORTANT]
> **The first `npx convex dev` will fail** — this is expected. You need to set environment
> variables in the Convex dashboard, then run it again. Follow the steps in order.

<details>
<summary><strong>Step 1: Clone and Install</strong></summary>

```bash
git clone -b revenuecat https://github.com/ramonclaudio/expo-starter-app.git
cd expo-starter-app
npm install
```

This creates `.env.local` from `.env.local.dev` automatically.

</details>

<details>
<summary><strong>Step 2: Create Convex Project</strong></summary>

```bash
npx convex dev
```

This will:
1. Prompt you to log in / create account
2. Create a new project
3. **Fail on the first push** — this is expected (env vars not set yet)

Note your deployment slug from the output (e.g., `amiable-seahorse-506`).

</details>

<details>
<summary><strong>Step 3: Get API Keys (All Services)</strong></summary>

Before initializing Convex, gather all required API keys:

### 3.1 Better Auth Secret

Generate a secret for authentication:

```bash
openssl rand -base64 32
```

### 3.2 Resend (Email)

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email domain (or use test domain for dev)
3. Go to **API Keys** → **Create API Key** → copy the key (`re_xxx`)
4. Go to **Webhooks** → **Add Webhook**:
   - URL: `https://your-deployment.convex.site/resend-webhook`
   - Select all delivery events
   - Copy the webhook secret

### 3.3 Expo (Push Notifications) — Optional

1. Go to [expo.dev](https://expo.dev) and sign up
2. Go to **Account Settings** → **Access Tokens** → **Create Token**
3. Copy the token

### 3.4 RevenueCat (Payments)

1. Go to [revenuecat.com](https://revenuecat.com) and sign up
2. Create a project and add your app (iOS/Android)
3. Go to **API Keys** → copy Public SDK Keys for iOS (`appl_xxx`) and Android (`goog_xxx`)
4. Create webhook:
   - URL: `https://your-deployment.convex.site/revenuecat/webhook`
   - Generate bearer token: `openssl rand -base64 32`
   - Add as Authorization header

</details>

<details>
<summary><strong>Step 4: Set Convex Environment Variables</strong></summary>

> [!IMPORTANT]
> These must be set BEFORE running `npx convex dev`.

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project → **Settings** → **Environment Variables**
3. Add all required variables:

```bash
# App
SITE_URL=expostarterapp://
SUPPORT_EMAIL=your@email.com

# Auth
BETTER_AUTH_SECRET=<from Step 3.1>

# Email (Resend)
RESEND_API_KEY=<from Step 3.2>
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_WEBHOOK_SECRET=<from Step 3.2>

# Push Notifications (Optional)
EXPO_ACCESS_TOKEN=<from Step 3.3>

# RevenueCat
REVENUECAT_WEBHOOK_BEARER_TOKEN=<from Step 3.4>
```

</details>

<details>
<summary><strong>Step 5: Complete Convex Setup</strong></summary>

Now run Convex dev again:

```bash
npx convex dev
```

This time it should succeed. The CLI outputs your deployment URLs.

Update `.env.local` with the URLs:

```bash
CONVEX_DEPLOYMENT=dev:your-deployment-slug
EXPO_PUBLIC_CONVEX_URL=https://your-deployment-slug.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment-slug.convex.site
```

</details>

<details>
<summary><strong>Step 6: RevenueCat Product Setup</strong></summary>

### Create Products in App Store

In App Store Connect / Google Play Console:

1. Create in-app purchase products (subscriptions)
2. Note the Product IDs (e.g., `premium_monthly`, `premium_annual`)

### Configure RevenueCat

1. Go to **Products** → **+ New Product** → add your product IDs
2. Go to **Entitlements** → **+ New Entitlement** → create `premium`
3. Attach your products to the `premium` entitlement

> [!IMPORTANT]
> The entitlement identifier must be `premium` — the app expects this exact string.

</details>

<details>
<summary><strong>Step 7: Set Local Environment Variables</strong></summary>

Edit `.env.local` with your values:

```bash
# Convex
CONVEX_DEPLOYMENT=dev:your-slug
EXPO_PUBLIC_CONVEX_URL=https://your-slug.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-slug.convex.site

# App
EXPO_PUBLIC_SITE_URL=expostarterapp://

# RevenueCat (from Step 3.4)
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=appl_xxx
EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY=goog_xxx
```

</details>

<details>
<summary><strong>Step 8: Run the App</strong></summary>

Open **two terminals**:

**Terminal 1 — Backend:**

```bash
npm run convex
```

**Terminal 2 — App:**

```bash
npm run ios        # iOS Simulator
npm run android    # Android Emulator
```

</details>

---

## Environment Summary

| Location | What Goes There | When Used |
| :--- | :--- | :--- |
| `.env.local` | Convex URLs, RevenueCat public keys | Local simulator/device |
| Convex Dashboard (dev) | Server secrets, webhook token | `npm run convex` |
| Convex Dashboard (prod) | Server secrets, webhook token | Production app |
| EAS Dashboard (prod) | Deploy key, public vars, RC keys | `eas build --profile production` |
| EAS Dashboard (dev) | Deploy key, public vars, RC keys | `eas build --profile development` |

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

## Subscriptions

### Tiers

| Tier | Task Limit | Entitlement |
| :--- | :---: | :--- |
| Free | 10 | — |
| Premium | Unlimited | `premium` |

### How It Works

1. **RevenueCat SDK** initializes on app start (`RevenueCatProvider`)
2. User logs in → SDK syncs with RevenueCat using Convex user ID
3. User purchases → RevenueCat handles App Store/Play Store transaction
4. Webhook fires → `convex-revenuecat` component updates entitlements
5. `useSubscription` hook reads entitlement status from Convex

### Using the Hook

```typescript
import { useSubscription } from '@/hooks/use-subscription';

function MyComponent() {
  const {
    tier,           // 'free' | 'premium'
    isPremium,      // boolean
    taskLimit,      // 10 | null (null = unlimited)
    canCreateTask,  // boolean
    showUpgrade,    // () => Promise<boolean> — shows paywall
    restore,        // () => Promise<RestoreResult>
    manageBilling,  // () => Promise<void> — opens subscription settings
  } = useSubscription();

  if (!isPremium) {
    return <Button onPress={showUpgrade}>Upgrade</Button>;
  }
}
```

### Testing Purchases

> [!WARNING]
> **Physical device required** — Simulator doesn't support StoreKit.

1. Create a **Sandbox Tester** in App Store Connect
2. Sign into sandbox account on device (Settings → App Store → Sandbox Account)
3. Purchases are free in sandbox mode

---

## Push Notifications

Already wired up. Just needs `EXPO_ACCESS_TOKEN` in Convex dashboard (set in Step 6).

**Requirements:**

- Physical device (iOS Simulator doesn't support push)
- EAS project ID (auto-configured from `app.json`)

<details>
<summary><strong>How it works</strong></summary>

1. User signs in → app registers push token with Convex
2. Token stored in `pushTokens` table with device ID
3. Backend sends via Expo Push API (`convex/notifications.ts`)
4. Receipts tracked, stale tokens auto-cleaned

</details>

<details>
<summary><strong>Testing</strong></summary>

1. Run on physical device
2. Sign in
3. Go to **Settings** → **Notifications** → **Send Test**

</details>

<details>
<summary><strong>Sending from backend</strong></summary>

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

</details>

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

```text
app/
├── _layout.tsx           # Root: Convex + Auth + RevenueCat providers
├── (auth)/               # Sign in, sign up, password reset
└── (app)/(tabs)/         # Home, tasks, explore, profile, settings

convex/
├── auth.ts               # Better Auth setup
├── revenuecat.ts         # RevenueCat component setup
├── subscriptions.ts      # Tier logic, entitlement checks
├── tasks.ts              # Tasks CRUD (tier-limited)
├── users.ts              # Account management
├── storage.ts            # File uploads
├── notifications.ts      # Push notifications
└── email.ts              # Email sending

providers/
├── revenuecat-provider.tsx      # SDK config + user sync
└── revenuecat-provider.web.tsx  # Web passthrough (no-op)

hooks/
├── use-subscription.ts          # Subscription state + actions
├── use-push-notifications.ts
├── use-color-scheme.ts
└── use-avatar-upload.ts

lib/
├── auth-client.ts        # Auth client
└── env.ts                # Environment validation
```

---

## Troubleshooting

| Problem | Solution |
| :--- | :--- |
| "Missing CONVEX_URL" | Check `.env.local` exists and has values |
| "Unauthorized" errors | Verify Convex env vars in dashboard |
| Push notifications fail | Use physical device (simulator doesn't support) |
| EAS build fails | Check `CONVEX_DEPLOY_KEY` is set in EAS |
| Purchases not working | Use physical device with sandbox account |
| Entitlements not updating | Check webhook URL and bearer token in RevenueCat |
| "No API key configured" | Set `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` |
| Paywall not showing | Ensure products are attached to `premium` entitlement |

---

## Production Checklist

- [ ] Create Convex production deployment
- [ ] Set all Convex prod env vars (including `REVENUECAT_WEBHOOK_BEARER_TOKEN`)
- [ ] Set up email DNS records for Resend
- [ ] Configure EAS production env vars (including RevenueCat keys)
- [ ] Generate new `BETTER_AUTH_SECRET` for prod
- [ ] Create production webhook in RevenueCat pointing to prod Convex URL
- [ ] Submit in-app purchases for review (App Store / Play Store)
- [ ] Test full signup and purchase flow in TestFlight / Internal Testing

---

## License

MIT
