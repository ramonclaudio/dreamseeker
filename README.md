# Expo Starter App

Production-ready SaaS starter for mobile. Auth, payments, subscriptions, real-time data—wired up and working.

## Why This Exists

Building mobile SaaS from scratch means weeks on auth flows, payment integration, subscription tiers, and backend plumbing before writing any actual product code. This starter handles that foundation so you can focus on what makes your app unique.

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
- **Subscriptions**: Multi-tier system (Free → Starter → Plus → Pro) with feature gating
- **Payments**: Stripe checkout with monthly/annual toggle, billing portal
- **Tier Gating**: Hooks and components to protect routes/features by subscription tier
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

# Stripe (see "Stripe Setup" section below)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
EXPO_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxxx
EXPO_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID=price_xxxx
EXPO_PUBLIC_STRIPE_PLUS_MONTHLY_PRICE_ID=price_xxxx
EXPO_PUBLIC_STRIPE_PLUS_ANNUAL_PRICE_ID=price_xxxx
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

# Stripe price IDs (server-side for tier lookup)
npx convex env set STRIPE_STARTER_MONTHLY_PRICE_ID price_xxxx
npx convex env set STRIPE_STARTER_ANNUAL_PRICE_ID price_xxxx
npx convex env set STRIPE_PLUS_MONTHLY_PRICE_ID price_xxxx
npx convex env set STRIPE_PLUS_ANNUAL_PRICE_ID price_xxxx
npx convex env set STRIPE_PRO_MONTHLY_PRICE_ID price_xxxx
npx convex env set STRIPE_PRO_ANNUAL_PRICE_ID price_xxxx
```

Run (two terminals):

```bash
npm run convex  # Terminal 1: backend
npm run ios     # Terminal 2: app
```

## Subscription Tiers

The app uses a 4-tier freemium model. Configure in `convex/schema/tiers.ts`:

| Tier | Task Limit | Features |
|------|------------|----------|
| Free | 10 | Basic task management |
| Starter | 50 | + History, sync, email support |
| Plus | 200 | + Custom themes, data export |
| Pro | Unlimited | + Priority support, early access |

### Feature Flags

Each tier has feature flags defined in `TIER_FEATURES`:

```typescript
// convex/schema/tiers.ts
export const TIER_FEATURES = {
  free: { tasks: 10, history: false, customThemes: false, ... },
  starter: { tasks: 50, history: true, sync: true, ... },
  plus: { tasks: 200, customThemes: true, dataExport: true, ... },
  pro: { tasks: Infinity, prioritySupport: true, earlyAccess: true, ... },
};
```

### Customizing Tiers

To add/modify tiers:

1. Update `TIER_KEYS` in `convex/schema/tiers.ts`
2. Add limits to `TIER_LIMITS` and features to `TIER_FEATURES`
3. Add pricing in `constants/subscriptions.ts`
4. Create corresponding Stripe products/prices
5. Set price ID environment variables

## Stripe Setup

### 1. Create Products in Stripe Dashboard

Enable **Test Mode**, then create products for each paid tier:

| Product | Monthly Price | Annual Price |
|---------|--------------|--------------|
| Starter | $4.99/mo | $49.99/yr |
| Plus | $9.99/mo | $99.99/yr |
| Pro | $19.99/mo | $199.99/yr |

For each product:
1. Go to **Products** → **Add Product**
2. Name it (e.g., "Starter Plan")
3. Add a **Recurring** price for monthly billing
4. Add another **Recurring** price for annual billing
5. Copy the **Price IDs** (start with `price_`, not `prod_`)

### 2. Set Price IDs

**Client (`.env.local`)** - Used for checkout:
```bash
EXPO_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxxx
EXPO_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID=price_xxxx
EXPO_PUBLIC_STRIPE_PLUS_MONTHLY_PRICE_ID=price_xxxx
EXPO_PUBLIC_STRIPE_PLUS_ANNUAL_PRICE_ID=price_xxxx
EXPO_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxx
EXPO_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID=price_xxxx
```

**Server (Convex dashboard)** - Used for tier lookup from webhooks:
```bash
STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxxx
STRIPE_STARTER_ANNUAL_PRICE_ID=price_xxxx
STRIPE_PLUS_MONTHLY_PRICE_ID=price_xxxx
STRIPE_PLUS_ANNUAL_PRICE_ID=price_xxxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxxx
```

### 3. Configure Webhooks

**Local development:**
```bash
stripe listen --forward-to https://your-deployment.convex.site/stripe/webhook
```

**Production:**
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-deployment.convex.site/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

### 4. Test

Test card: `4242 4242 4242 4242` (any future expiry, any CVC)

## Tier Gating

Protect routes and features based on subscription tier.

### useSubscription Hook

Access subscription state anywhere:

```tsx
import { useSubscription } from '@/hooks/use-subscription';

function MyComponent() {
  const {
    tier,                    // 'free' | 'starter' | 'plus' | 'pro'
    features,                // Current tier's feature flags
    canAccess,               // (minTier) => boolean
    hasFeature,              // (feature) => boolean
    showUpgrade,             // Navigate to subscribe screen
    taskCount,               // Current task count
    tasksRemaining,          // null for unlimited
  } = useSubscription();

  // Check tier level
  if (canAccess('plus')) {
    // User is Plus or Pro
  }

  // Check specific feature
  if (hasFeature('dataExport')) {
    // User has data export feature
  }

  // Access feature flags directly
  if (features.customThemes) {
    // Show theme customization
  }
}
```

### TierGate Component

Conditionally render content based on tier:

```tsx
import { TierGate, UpgradePrompt } from '@/components/tier-gate';

// Gate by minimum tier
<TierGate minTier="plus">
  <AdvancedSettings />
</TierGate>

// Gate by specific feature
<TierGate feature="dataExport">
  <ExportButton />
</TierGate>

// Custom fallback when denied
<TierGate minTier="pro" fallback={<UpgradePrompt minTier="pro" />}>
  <ProFeature />
</TierGate>

// Hide completely if no access
<TierGate minTier="pro" hideOnDeny>
  <ProOnlyButton />
</TierGate>
```

### Route Protection

Protect entire route groups by tier:

```tsx
// app/(app)/(pro)/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useRequireTier } from '@/hooks/use-tier-gate';

export default function ProLayout() {
  const { hasAccess, isLoading } = useRequireTier('pro');

  if (isLoading) return <Loading />;
  if (!hasAccess) return <Redirect href="/subscribe" />;

  return <Stack>{/* Pro-only screens */}</Stack>;
}
```

### Feature-Based Route Protection

```tsx
import { useRequireFeature } from '@/hooks/use-tier-gate';

function DataExportScreen() {
  const { hasAccess, isLoading, requiredTier } = useRequireFeature('dataExport');

  if (isLoading) return <Loading />;
  if (!hasAccess) return null; // Will redirect to /subscribe

  return <ExportUI />;
}
```

### useTierAccess Hook

Check access without redirecting:

```tsx
import { useTierAccess } from '@/hooks/use-tier-gate';

function SettingsScreen() {
  const { canAccess, hasFeature, features } = useTierAccess();

  return (
    <View>
      <BasicSettings />
      {canAccess('starter') && <HistorySettings />}
      {hasFeature('customThemes') && <ThemeSettings />}
      {features.dataExport && <ExportSettings />}
    </View>
  );
}

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
