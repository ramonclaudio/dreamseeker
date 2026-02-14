# DreamSeeker

**From Dreaming to Doing.** Goal-achievement app for ambitious women. Break big dreams into daily micro-actions, then keep going with streaks, XP, and daily challenges.

Built for [Gabby Beckford](https://instagram.com/packslight) (@packslight) · [RevenueCat Shipyard Hackathon 2026](https://revenuecat-shipyard-2026.devpost.com)

`RevenueCat` · `Expo SDK 55` · `React 19` · `Convex` · `Better Auth`

---

My first hackathon and my first iOS app. **RevenueCat is the monetization engine.** Native paywall UI, real-time entitlement syncing via webhooks, server-side enforcement on every mutation, and tiered upgrade prompts in the normal flow. I built [`convex-revenuecat`](https://github.com/ramonclaudio/convex-revenuecat) (open source) to connect RevenueCat to Convex because the integration didn't exist. My job as the dev: build the app, design it for Gabby's core audience, help her monetize with RevenueCat. My partner is Gabby's exact audience. She and her nurse friends tested every build.

## RevenueCat Integration

RevenueCat had no Convex integration. So I built one. [`convex-revenuecat`](https://github.com/ramonclaudio/convex-revenuecat) is open source and handles the full webhook lifecycle, entitlement syncing, and subscription status queries. Any Convex developer can use it now.

- **Native Paywall:** `presentPaywallIfNeeded` from `react-native-purchases-ui`. No custom paywall screens. RevenueCat's own UI.
- **SDK:** `react-native-purchases`. Direct SDK calls for login, restore, and entitlement checks.
- **Webhook:** `/revenuecat/webhook` > Convex HTTP route > real-time entitlement updates via `convex-revenuecat`
- **Client:** `useSubscription()` hook reads subscription status from Convex in real time
- **Entitlement ID:** `DreamSeeker Premium`

Server-side enforcement on every mutation. No client-side honor system.

**RevenueCat upgrade entry points:** Dream creation (at limit), action creation (at limit), journal entry (at limit), pin creation (at limit), subscribe screen, profile settings.

## RevenueCat Monetization

RevenueCat powers the entire monetization layer. Every limit, every upgrade prompt, every paywall presentation, and every entitlement check flows through RevenueCat.

| | Free | Premium (via RevenueCat) |
| :--- | :---: | :---: |
| Dreams | 3 | Unlimited |
| Actions per dream | 5 | Unlimited |
| Journal entries per dream | 3 | Unlimited |
| Vision board pins | 5 | Unlimited |
| Daily challenges | ✓ | ✓ |
| Focus sessions | ✓ | ✓ |
| Streaks & XP | ✓ | ✓ |
| Badges | ✓ | ✓ |
| All 11 categories | ✓ | ✓ |
| Community feed | - | ✓ |

Free tier is generous enough to actually get things done. No one hits a paywall before they've seen value.

Upgrade prompts are tiered, not abrupt: a RevenueCat-powered upgrade banner appears before the limit, a limit-reached banner shows at the cap, and RevenueCat's native paywall only appears when the user tries to exceed it. Every banner is tappable — one tap opens the RevenueCat paywall so users can upgrade at any point before hitting the hard limit. Gabby gets a clear monetization path without annoying users. Premium also unlocks from the subscribe screen or profile settings.

## What It Does

Pick a dream. Break it into small actions. The Today tab pulls everything into one place so you always know what to do right now.

Celebration is the core mechanic. Every completed action triggers confetti, haptics, hype copy, XP, and a streak update. Completing a dream walks you through an achievement screen, guided reflection, shareable win card, and next steps. 26 screens across dreams, today, boards, journal, progress, focus timer, and dashboard. 12 shareable card types. 2-screen skippable onboarding.

XP drives progression: +10 per action, +100 per dream, +15 per focus session, +10 per journal, +25 per badge. 10 levels from Dreamer to Legend. 8 travel-themed badges. 16-week streak heatmap. Streak milestones at 1, 3, 5, 10, and 30 days.

## Architecture

| Layer | Tech |
| :--- | :--- |
| **Payments** | **RevenueCat · `react-native-purchases` · `react-native-purchases-ui` · `convex-revenuecat`** |
| Framework | Expo SDK 55 · React 19 · React Compiler |
| Backend | Convex (real-time queries, mutations, actions) |
| Auth | Better Auth via `@convex-dev/better-auth` |
| Email | Resend via `@convex-dev/resend` |
| Styling | React Native StyleSheet · Theme system (System/Light/Dark) |
| Native | SF Symbols · Haptics · Push Notifications |

48 Convex modules. Row-Level Security on 24 tables. Rate limiting on all endpoints. Input validation on every mutation. Auth state syncs to RevenueCat on login via `Purchases.logIn(user._id)`. All UI reads are live Convex subscriptions. RevenueCat entitlements, progress, streaks, and badge checks update in real time.

## What's Next

- Travel-specific features: trip planning templates, destination dream packs, budget trackers. Travel is Gabby's entire brand and it deserves dedicated tooling.
- Streak freezes and recovery mechanics
- Home screen widgets
- Confidence meter and deeper progress analytics
- Integration with Gabby's content calendar and SeekPTO community perks

## Developer

**Ray Claudio** · [@ramonclaudio](https://github.com/ramonclaudio) · Brooklyn, NY

Senior software engineer, 13+ years, CS degree. 4,300+ GitHub contributions across 45 public repos (334 stars). Open source contributor.

Built `convex-revenuecat` for this exact stack (Expo + Convex + RevenueCat). Real app, real monetization, real stack I know inside out.

---

<details>

<summary><strong>Setup & Development</strong></summary>

### Prerequisites

| Service | Purpose | Sign Up |
| :--- | :--- | :--- |
| [Convex](https://convex.dev) | Real-time backend | Free tier available |
| [RevenueCat](https://revenuecat.com) | In-app purchases | Free tier available |
| [Resend](https://resend.com) | Transactional email | Free tier (3k/month) |
| [Expo](https://expo.dev) | Build service | Free tier available |

**Local requirements:** Node 18+, Xcode 16+

> [!IMPORTANT]
> Expo Go is not supported. SDK 55 requires development builds.

### Quick Start

**1. Clone & Install**

```bash
git clone https://github.com/ramonclaudio/dreamseeker.git
cd dreamseeker
npm install
```

This creates `.env.local` from `.env.example` automatically.

**2. Create Convex Deployment**

```bash
npx convex dev
```

Follow the prompts to create a project. **The first push will fail.** This is expected since environment variables aren't set yet.

Convex auto-populates `.env.local` with your deployment URLs:

```bash
CONVEX_DEPLOYMENT=dev:your-slug-123
EXPO_PUBLIC_CONVEX_URL=https://your-slug-123.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-slug-123.convex.site
```

**3. Set Environment Variables**

Set the required server secrets:

```bash
npx convex env set SITE_URL=dreamseeker://
npx convex env set SUPPORT_EMAIL=your@email.com
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
npx convex env set RESEND_API_KEY=re_xxxxxxxxxxxx
npx convex env set RESEND_FROM_EMAIL=noreply@yourdomain.com
npx convex env set RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
npx convex env set REVENUECAT_WEBHOOK_BEARER_TOKEN=$(openssl rand -base64 32)
```

Update the RevenueCat client keys in `.env.local`:

```bash
# Get these from dashboard.revenuecat.com > API Keys
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=appl_xxxxxxxxxxxx
```

Then re-run `npx convex dev`. It will push successfully.

**4. Set Optional Secrets (skip for now)**

```bash
# Push notifications (requires physical device)
npx convex env set EXPO_ACCESS_TOKEN=<from expo.dev > Access Tokens>
```

**5. Run**

**Terminal 1 (Backend):**

```bash
npm run convex:dev
```

**Terminal 2 (App):**

```bash
npm run ios        # iOS Simulator
```

</details>

<details>

<summary><strong>Detailed Service Setup</strong></summary>

### RevenueCat Setup

1. Go to [revenuecat.com](https://revenuecat.com) and sign up
2. Create a project and add your iOS app
3. Go to **API Keys** > copy Public SDK Key (starts with `appl_`)
4. Create products in App Store Connect
5. In RevenueCat: **Products** > add product IDs, **Entitlements** > create `DreamSeeker Premium`, attach products
6. **Integrations** > **Webhooks** > URL: `https://your-deployment.convex.site/revenuecat/webhook`, add bearer token

> [!IMPORTANT]
> The entitlement identifier must be `DreamSeeker Premium`. The app expects this exact string.

### Resend (Email) Setup

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email domain (or use test domain for dev)
3. Go to **API Keys** > **Create API Key** > copy the key (`re_xxx`)
4. (Optional) Go to **Webhooks** > **Add Webhook** > URL: `https://your-deployment.convex.site/resend-webhook`

### Expo (Push Notifications) Setup

1. Go to [expo.dev](https://expo.dev) and sign up
2. Go to **Account Settings** > **Access Tokens** > **Create Token**
3. Add to Convex Dashboard as `EXPO_ACCESS_TOKEN`

> Push notifications require a physical device. iOS Simulator doesn't support them.

</details>

<details>

<summary><strong>Commands</strong></summary>

```bash
# Development
npm run ios                 # Clean build + simulator
npm run ios:device          # Clean build + physical device
npm run convex:dev          # Convex backend with hot reload

# Environment
npm run env:dev             # Switch to dev backend
npm run env:prod            # Switch to prod backend

# Quality
npm run check               # Lint + typecheck
npm run lint                # ESLint
npm run typecheck           # tsc --noEmit
npm run test                # Jest watch mode
npm run test:ci             # Jest CI mode

# Reset
npm run clean               # Project reset
npm run clean:nuclear       # Full reset (all caches)
```

</details>

<details>

<summary><strong>Troubleshooting</strong></summary>

| Problem | Solution |
| :--- | :--- |
| First `convex dev` fails | Expected. Set env vars per step 3, then re-run |
| "Missing CONVEX_URL" | Check `.env.local` exists and has values |
| "Unauthorized" errors | Verify Convex env vars with `npx convex env list` |
| Push notifications fail | Use physical device (simulator doesn't support) |
| Purchases not working | Use physical device with sandbox account |
| Entitlements not updating | Check webhook URL and bearer token in RevenueCat |
| "No API key configured" | Set `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` |
| Paywall not showing | Ensure products are attached to `DreamSeeker Premium` entitlement |

</details>

---

## License

MIT
