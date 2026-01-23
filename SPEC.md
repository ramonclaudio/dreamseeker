# Expo Starter App - Payment Branch Strategy

## Overview

This repository maintains three parallel branches, each providing the same Expo starter app with different payment implementations. Users choose their branch based on their payment provider needs.

## Branch Structure

```
main           → Clean base, NO payment logic
├── stripe     → Stripe integration (@convex-dev/stripe)
└── revenuecat → RevenueCat integration (react-native-purchases)
```

## Branch Descriptions

### `main` (Clean Base)
- **Purpose:** Payment-agnostic foundation
- **Use case:** Starting point for custom payment implementations or no payments
- **Contains:**
  - Authentication (Better Auth)
  - Tasks CRUD (unlimited, no tier limits)
  - Push notifications
  - Email (Resend)
  - File storage (avatars)
  - Profile management
  - Settings
- **Does NOT contain:**
  - Any payment SDK
  - Subscription logic
  - Tier/entitlement gating
  - Upgrade flows
  - Billing UI

### `stripe` (Stripe Implementation)
- **Purpose:** Direct Stripe billing via Convex component
- **Use case:** Web apps, direct billing, full control over payments
- **Contains everything in `main` PLUS:**
  - `@convex-dev/stripe` component
  - `@stripe/stripe-react-native` SDK
  - `convex/stripe.ts` - checkout, billing portal, subscriptions
  - `convex/subscriptions.ts` - tier mapping from price IDs
  - `hooks/use-subscription.ts` - subscription state hook
  - `providers/stripe-provider.tsx` - Stripe SDK provider
  - Tier system (free, starter, plus, pro)
  - Task limits by tier
  - Upgrade/subscribe flow
  - Billing management UI

### `revenuecat` (RevenueCat Implementation)
- **Purpose:** IAP wrapper for App Store/Play Store + optional Stripe web
- **Use case:** Mobile apps requiring App Store/Play Store IAP
- **Contains everything in `main` PLUS:**
  - `react-native-purchases` SDK
  - `react-native-purchases-ui` for paywalls
  - `convex/revenuecat.ts` - webhook handling, subscriber verification
  - `hooks/use-subscription.ts` - entitlement state hook
  - `providers/revenuecat-provider.tsx` - Purchases.configure
  - Entitlement system (maps to same tiers)
  - Task limits by entitlement
  - RevenueCat paywall UI
  - Subscription management via Customer Center

## Current State

| Branch | Status | Location |
|--------|--------|----------|
| `main` | Original Stripe implementation | `origin/main` |
| `hackathon/revenuecat` | Clean (no payments) | Local only |
| `stripe` | Does not exist | - |
| `revenuecat` | Does not exist | - |

## Required Git Operations

```bash
# 1. Ensure we're on the clean branch
git checkout hackathon/revenuecat

# 2. Create stripe branch from original main
git branch stripe main

# 3. Rename current clean branch to main
git branch -M hackathon/revenuecat main

# 4. Create revenuecat branch from clean main
git checkout main
git checkout -b revenuecat

# 5. Force push new structure (DESTRUCTIVE - replaces remote main)
git push origin main --force
git push origin stripe
git push origin revenuecat

# 6. Clean up old remote branches
git push origin --delete hackathon/revenuecat 2>/dev/null || true
```

## Post-Restructure State

```
main (default)  → Clean, no payments [NEW]
stripe          → Original Stripe implementation [FROM old main]
revenuecat      → To be implemented [NEW, empty]
```

## File Differences by Branch

### Files ONLY in `stripe` branch (not in `main`):
```
convex/stripe.ts
convex/subscriptions.ts
convex/schema/tiers.ts
constants/subscriptions.ts
hooks/use-subscription.ts
components/tier-gate.tsx
components/upgrade-banner.tsx
providers/stripe-provider.tsx
providers/stripe-provider.web.tsx
app/(app)/subscribe.tsx
app/(app)/(starter)/
app/(app)/(plus)/
app/(app)/(pro)/
```

### Files ONLY in `revenuecat` branch (not in `main`):
```
convex/revenuecat.ts
convex/subscriptions.ts
convex/schema/tiers.ts        # Same tier structure, different mapping
constants/subscriptions.ts
hooks/use-subscription.ts     # Same interface, RevenueCat implementation
components/tier-gate.tsx
components/upgrade-banner.tsx
providers/revenuecat-provider.tsx
app/(app)/subscribe.tsx       # RevenueCat paywall instead of Stripe checkout
app/(app)/(starter)/
app/(app)/(plus)/
app/(app)/(pro)/
```

### Files modified in payment branches (vs `main`):
```
package.json                  # Payment SDK dependencies
app.json                      # Payment SDK plugins
convex/convex.config.ts       # stripe: adds stripe component
convex/http.ts                # Webhook handlers
convex/tasks.ts               # Tier limit checks
convex/env.ts                 # Payment env vars
lib/env.ts                    # Client payment env vars
app/_layout.tsx               # Payment provider wrapper
app/(app)/_layout.tsx         # Tier-gated routes
app/(app)/(tabs)/settings/index.tsx  # Subscription section
app/(app)/(tabs)/tasks/index.tsx     # Upgrade banner, limit checks
```

## Subscription Interface Contract

Both `stripe` and `revenuecat` branches MUST implement the same hook interface:

```typescript
// hooks/use-subscription.ts
export function useSubscription(): {
  // Tier info
  tier: 'free' | 'starter' | 'plus' | 'pro';
  tierName: string;

  // Task limits
  taskLimit: number | null;  // null = unlimited
  taskCount: number;
  canCreateTask: boolean;
  tasksRemaining: number | null;

  // Subscription state
  isActive: boolean;
  isTrialing: boolean;
  isCanceled: boolean;
  isLoading: boolean;

  // Actions
  showUpgrade: () => void;
  subscribe: (priceId: string) => Promise<{ success?: boolean; error?: unknown }>;
  restore: () => Promise<{ success?: boolean; error?: unknown }>;
  manageBilling: () => Promise<void>;
  cancel: () => Promise<{ success?: boolean; error?: unknown }>;

  // Feature gating
  canAccess: (minTier: TierKey) => boolean;
  hasFeature: (feature: FeatureKey) => boolean;
}
```

## Environment Variables

### `main` branch (.env.local):
```bash
EXPO_PUBLIC_CONVEX_URL=
EXPO_PUBLIC_CONVEX_SITE_URL=
EXPO_PUBLIC_SITE_URL=
```

### `stripe` branch adds:
```bash
# Client
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
EXPO_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID=
EXPO_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID=
EXPO_PUBLIC_STRIPE_PLUS_MONTHLY_PRICE_ID=
EXPO_PUBLIC_STRIPE_PLUS_ANNUAL_PRICE_ID=
EXPO_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=
EXPO_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID=

# Server (Convex dashboard)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_MONTHLY_PRICE_ID=
STRIPE_STARTER_ANNUAL_PRICE_ID=
STRIPE_PLUS_MONTHLY_PRICE_ID=
STRIPE_PLUS_ANNUAL_PRICE_ID=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=
```

### `revenuecat` branch adds:
```bash
# Client
EXPO_PUBLIC_REVENUECAT_API_KEY=

# Server (Convex dashboard)
REVENUECAT_API_KEY=
REVENUECAT_WEBHOOK_SECRET=
```

## Implementation Order

1. **Execute branch restructure** (git operations above)
2. **Verify `stripe` branch** works (should be identical to old main)
3. **Implement `revenuecat` branch:**
   - Install `react-native-purchases`, `react-native-purchases-ui`
   - Create `providers/revenuecat-provider.tsx`
   - Create `convex/revenuecat.ts` (webhook handler)
   - Create `convex/subscriptions.ts` (entitlement queries)
   - Restore `hooks/use-subscription.ts` with RC implementation
   - Restore tier-gated routes and components
   - Add RevenueCat paywall UI
4. **Test both payment branches** have feature parity

## Maintenance

When making changes:

1. **Shared changes** (auth, UI, non-payment features):
   - Make changes on `main`
   - Cherry-pick or merge into `stripe` and `revenuecat`

2. **Payment-specific changes:**
   - Make directly on the relevant branch
   - Do NOT merge between `stripe` and `revenuecat`

3. **Keep branches in sync:**
   ```bash
   # After updating main
   git checkout stripe && git merge main
   git checkout revenuecat && git merge main
   ```

---

*Spec created: 2026-01-23*
*For: expo-starter-app payment branch strategy*
