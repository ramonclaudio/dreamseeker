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

**Local requirements:** Node 18+, Xcode 16+ (iOS) or Android Studio (Android)

> [!IMPORTANT]
> Expo Go is not supported — SDK 55 requires development builds.

---

## Quick Start

### 1. Clone & Install

```bash
git clone -b revenuecat https://github.com/ramonclaudio/expo-starter-app.git
cd expo-starter-app
npm install
```

This creates `.env.local` from `.env.example` automatically.

### 2. Create Convex Deployment

```bash
npx convex dev
```

Follow the prompts to create a project. Note your deployment slug (e.g., `amiable-seahorse-506`).

### 3. Fill in `.env.local`

Edit `.env.local` with your deployment URLs and API keys:

```bash
# Convex (from step 2 output)
CONVEX_DEPLOYMENT=dev:your-deployment-slug
EXPO_PUBLIC_CONVEX_URL=https://your-deployment-slug.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment-slug.convex.site

# App
EXPO_PUBLIC_SITE_URL=expostarterapp://

# RevenueCat (from dashboard.revenuecat.com → API Keys)
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=appl_xxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY=goog_xxxxxxxxxxxx
```

### 4. Set Convex Dashboard Secrets

Go to [dashboard.convex.dev](https://dashboard.convex.dev) → Your Project → **Settings** → **Environment Variables**

Add these server secrets:

```bash
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>
SITE_URL=expostarterapp://
SUPPORT_EMAIL=your@email.com
EXPO_ACCESS_TOKEN=<from expo.dev → Access Tokens>
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
PAYMENT_PROVIDER=revenuecat
REVENUECAT_WEBHOOK_BEARER_TOKEN=<your webhook bearer token>
```

### 5. Run

**Terminal 1 — Backend:**

```bash
npm run convex
```

**Terminal 2 — App:**

```bash
npm run ios        # iOS Simulator
npm run android    # Android Emulator
```

---

## Detailed Setup

<details>
<summary><strong>RevenueCat Setup</strong></summary>

### Create RevenueCat Account

1. Go to [revenuecat.com](https://revenuecat.com) and sign up
2. Create a project and add your app (iOS/Android)

### Get API Keys

1. Go to **API Keys** → copy Public SDK Keys:
   - iOS: starts with `appl_`
   - Android: starts with `goog_`

### Create Products

In App Store Connect / Google Play Console:
1. Create in-app purchase products (subscriptions)
2. Note the Product IDs (e.g., `premium_monthly`, `premium_annual`)

In RevenueCat:
1. Go to **Products** → **+ New Product** → add your product IDs
2. Go to **Entitlements** → **+ New Entitlement** → create `premium`
3. Attach your products to the `premium` entitlement

> [!IMPORTANT]
> The entitlement identifier must be `premium` — the app expects this exact string.

### Create Webhook

1. Go to **Integrations** → **Webhooks** → **+ New Webhook**
2. URL: `https://your-deployment.convex.site/revenuecat/webhook`
3. Generate bearer token: `openssl rand -base64 32`
4. Add as Authorization header
5. Save token for Convex Dashboard

</details>

<details>
<summary><strong>Resend (Email) Setup</strong></summary>

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email domain (or use test domain for dev)
3. Go to **API Keys** → **Create API Key** → copy the key (`re_xxx`)
4. (Optional) Go to **Webhooks** → **Add Webhook**:
   - URL: `https://your-deployment.convex.site/resend-webhook`
   - Select all delivery events
   - Copy the webhook secret

</details>

<details>
<summary><strong>Expo (Push Notifications) Setup</strong></summary>

1. Go to [expo.dev](https://expo.dev) and sign up
2. Go to **Account Settings** → **Access Tokens** → **Create Token**
3. Copy the token and add to Convex Dashboard as `EXPO_ACCESS_TOKEN`

**Note:** Push notifications require a physical device — iOS Simulator doesn't support them.

</details>

<details>
<summary><strong>Apple Sign-In (Optional)</strong></summary>

1. Apple Developer Portal → Identifiers → Enable "Sign In with Apple"
2. Create a Services ID for web auth
3. Generate a private key and JWT client secret
4. Set in Convex dashboard:

```bash
APPLE_CLIENT_ID=your-services-id
APPLE_CLIENT_SECRET=your-jwt-secret
```

</details>

---

## Environment Reference

### Where Variables Go

| Variable | `.env.local` | Convex Dashboard | EAS Dashboard |
| :--- | :---: | :---: | :---: |
| `CONVEX_DEPLOYMENT` | ✓ | | |
| `EXPO_PUBLIC_CONVEX_URL` | ✓ | | ✓ |
| `EXPO_PUBLIC_CONVEX_SITE_URL` | ✓ | | ✓ |
| `EXPO_PUBLIC_SITE_URL` | ✓ | | ✓ |
| `EXPO_PUBLIC_REVENUECAT_*` | ✓ | | ✓ |
| `BETTER_AUTH_SECRET` | | ✓ | |
| `SITE_URL` | | ✓ | |
| `SUPPORT_EMAIL` | | ✓ | |
| `EXPO_ACCESS_TOKEN` | | ✓ | |
| `RESEND_API_KEY` | | ✓ | |
| `RESEND_FROM_EMAIL` | | ✓ | |
| `PAYMENT_PROVIDER` | | ✓ | |
| `REVENUECAT_WEBHOOK_BEARER_TOKEN` | | ✓ | |

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

## Subscriptions

### Tiers

| Tier | Task Limit | Entitlement |
| :--- | :---: | :--- |
| Free | 10 | — |
| Premium | Unlimited | `premium` |

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
    restore,        // () => Promise<boolean>
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

## EAS Builds

Set these in [expo.dev](https://expo.dev) → Your Project → **Environment Variables**:

```bash
EXPO_PUBLIC_CONVEX_URL=https://your-prod-slug.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-prod-slug.convex.site
EXPO_PUBLIC_SITE_URL=expostarterapp://
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=appl_xxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY=goog_xxxxxxxxxxxx
```

Then build:

```bash
eas build --platform ios --profile development   # Testing
eas build --platform ios --profile production    # App Store
```

---

## Troubleshooting

| Problem | Solution |
| :--- | :--- |
| "Missing CONVEX_URL" | Check `.env.local` exists and has values |
| "Unauthorized" errors | Verify Convex env vars in dashboard |
| Push notifications fail | Use physical device (simulator doesn't support) |
| Purchases not working | Use physical device with sandbox account |
| Entitlements not updating | Check webhook URL and bearer token in RevenueCat |
| "No API key configured" | Set `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` |
| Paywall not showing | Ensure products are attached to `premium` entitlement |

---

## Production Checklist

- [ ] Create Convex production deployment (`npx convex deploy`)
- [ ] Set all Convex prod env vars
- [ ] Generate new `BETTER_AUTH_SECRET` for prod
- [ ] Set up email DNS records for Resend
- [ ] Configure EAS production env vars
- [ ] Create production webhook in RevenueCat pointing to prod Convex URL
- [ ] Submit in-app purchases for review (App Store / Play Store)
- [ ] Test full signup and purchase flow in TestFlight / Internal Testing

---

## License

MIT
