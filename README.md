# DreamSeeker

**From Dreaming to Doing.** Goal-achievement app. Break big dreams into daily micro-actions, then keep going with streaks, XP, and daily challenges.

Built for [Gabby Beckford](https://instagram.com/packslight) (@packslight) · [RevenueCat Shipyard Hackathon 2026](https://revenuecat-shipyard-2026.devpost.com)

`Expo SDK 55` · `React 19` · `Convex` · `RevenueCat` · `Better Auth`

---

**TestFlight:** [TODO]
**Demo Video:** [TODO]
**Devpost:** [TODO]

---

## The Problem

Gabby talks to ambitious women, late 20s to 40s, who want to travel solo, start businesses, switch careers, and stop playing it safe. They watch her content, get fired up, close the app, and do nothing. Not because they lack ambition. Because they're waiting: for the right time, for permission, for confidence that never shows up on its own.

Goal apps don't help here. They give you a task list. The problem was never organization. The problem is that these women don't believe they're allowed to start yet.

## The Solution

DreamSeeker attacks the actual blocker: mindset.

You pick a dream. The app breaks it into small, concrete actions. Then it pairs those actions with daily challenges and mindset prompts that chip away at the "I'm not ready" loop. Streaks, XP, levels, confetti, win cards. You feel progress because the app tracks it and celebrates it.

Mindset shifts + micro-actions + gamification. That's the whole thesis.

## Features

- **Dreams** - 6 categories (travel, money, career, lifestyle, growth, relationships), micro-actions per dream, timelines, progress tracking
- **Today** - daily challenges, morning check-ins, mindset moments, quick actions surfaced per day
- **Journal** - mood tracking, reflection prompts, entries linked to specific dreams
- **Progress** - XP levels (Dreamer → Seeker → Achiever → Go-Getter → Trailblazer), streaks, badges, activity heatmap
- **Focus Timer** - Pomodoro sessions tied to dream actions
- **Onboarding** - 13-slide guided flow: category selection, pace, confidence, personality
- **Gamification** - confetti on completions, win cards on dream complete, streak milestones, badge gallery
- **Profile** - avatar upload, theme picker (system/light/dark), notifications, account management

## Monetization

| | Free | Premium |
| :--- | :---: | :---: |
| Dreams | 3 | Unlimited |
| Daily challenges | ✓ | ✓ |
| Mindset moments | ✓ | ✓ |
| Journal | ✓ | ✓ |
| Focus timer | ✓ | ✓ |
| Streaks & XP | ✓ | ✓ |
| Badges | ✓ | ✓ |
| All 6 categories | — | ✓ |

### RevenueCat Integration

- **SDK:** `react-native-purchases` + `react-native-purchases-ui`
- **Paywall:** Native RevenueCat paywall via `presentPaywallIfNeeded`
- **Webhook:** `/revenuecat/webhook` → Convex HTTP route → updates entitlements in real time
- **Client:** `useSubscription()` hook reads from `subscriptions.getSubscriptionStatus` query
- **Entitlement ID:** `premium`

**Upgrade entry points:** Dream creation (at limit), category selection (locked categories), subscribe screen, profile settings, paywall prompt on premium features.

## Navigation

```text
(auth)/
  sign-in, sign-up, forgot-password, reset-password

(app)/
  onboarding, subscribe, create-dream, focus-timer, journal-entry
  dream/[id], dream-complete/[id]

  (tabs)/
    today
    (dreams)/ → index, [category]
    journal
    progress
    profile/ → index, notifications, privacy, help, about
```

22 screens total.

## Architecture

| Layer | Tech |
| :--- | :--- |
| Framework | Expo SDK 55 · React 19 · React Compiler |
| Backend | Convex (real-time queries, mutations, actions) |
| Auth | Better Auth (email/password + Apple Sign-In) |
| Payments | RevenueCat · `convex-revenuecat` |
| Email | Resend via `@convex-dev/resend` |
| Styling | React Native StyleSheet · Theme system (System/Light/Dark) |
| Native | SF Symbols · Haptics · Push Notifications |

### Data Flow

```
Auth (Better Auth) → Convex real-time subscriptions → UI
RevenueCat SDK → Webhook → Convex HTTP → Entitlement sync → UI
User actions → Convex mutations → XP/streak/badge calculations → Real-time updates
```

### Backend

37 Convex modules: auth, dreams, actions, progress, challenges, check-ins, journal, focus sessions, badges, notifications, subscriptions, email, storage. All data goes through Convex queries and mutations. No raw database calls.

**Auth guards:** Queries return empty arrays for unauthenticated users. Mutations throw. Rate limiting: 10/min default, 5/15min sign-in, 3/hr sign-up.

**Real-time:** All UI reads are live Convex subscriptions. Progress, streaks, and badge checks fire automatically on action completion.

## Roadmap

**Near-term**
- Personalized action suggestions (micro-actions based on dream context)
- Streak freezes and recovery mechanics
- Shareable win cards with @packslight branding
- Home screen widgets (iOS/Android)

**Long-term**
- Community features: dream groups, accountability partners
- Gabby's exclusive content: video messages, monthly challenges
- Deeper progress analytics (per-dream trends, weekly reports)
- Web companion app

## Developer

**Ray Claudio** · [@ramonclaudio](https://github.com/ramonclaudio) · Brooklyn, NY

Senior software engineer, 13+ years, CS degree. 4,300+ GitHub contributions across 45 public repos (334 stars). Open source contributor.

**Why this project:** I built `convex-revenuecat` for this exact stack (Expo + Convex + RevenueCat). When I read Gabby's brief about helping people go from stuck to actually doing something, it matched what I was already building for. Real app, real monetization, real stack I know inside out.

---

<details>
<summary><strong>Setup &amp; Development</strong></summary>

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

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/ramonclaudio/dreamseeker.git
cd dreamseeker
npm install
```

This creates `.env.local` from `.env.example` automatically.

### 2. Create Convex Deployment

```bash
npx convex dev
```

Follow the prompts to create a project. **The first push will fail** — this is expected since environment variables aren't set yet.

Convex auto-populates `.env.local` with your deployment URLs:

```bash
CONVEX_DEPLOYMENT=dev:your-slug-123
EXPO_PUBLIC_CONVEX_URL=https://your-slug-123.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-slug-123.convex.site
```

### 3. Set Environment Variables

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
# Get these from dashboard.revenuecat.com → API Keys
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=appl_xxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY=goog_xxxxxxxxxxxx
```

Then re-run `npx convex dev` — it will push successfully.

### 4. Set Optional Secrets (skip for now)

```bash
# Push notifications (requires physical device)
npx convex env set EXPO_ACCESS_TOKEN=<from expo.dev → Access Tokens>

# Apple Sign-In (optional)
npx convex env set APPLE_CLIENT_ID=your-services-id
npx convex env set APPLE_CLIENT_SECRET=your-jwt-secret
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

</details>

<details>
<summary><strong>Detailed Service Setup</strong></summary>

### RevenueCat Setup

1. Go to [revenuecat.com](https://revenuecat.com) and sign up
2. Create a project and add your app (iOS/Android)
3. Go to **API Keys** → copy Public SDK Keys:
   - iOS: starts with `appl_`
   - Android: starts with `goog_`
4. Create products in App Store Connect / Google Play Console
5. In RevenueCat: **Products** → add product IDs, **Entitlements** → create `premium`, attach products
6. **Integrations** → **Webhooks** → URL: `https://your-deployment.convex.site/revenuecat/webhook`, add bearer token

> [!IMPORTANT]
> The entitlement identifier must be `premium` — the app expects this exact string.

### Resend (Email) Setup

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email domain (or use test domain for dev)
3. Go to **API Keys** → **Create API Key** → copy the key (`re_xxx`)
4. (Optional) Go to **Webhooks** → **Add Webhook** → URL: `https://your-deployment.convex.site/resend-webhook`

### Expo (Push Notifications) Setup

1. Go to [expo.dev](https://expo.dev) and sign up
2. Go to **Account Settings** → **Access Tokens** → **Create Token**
3. Add to Convex Dashboard as `EXPO_ACCESS_TOKEN`

> Push notifications require a physical device — iOS Simulator doesn't support them.

### Apple Sign-In (Optional)

1. Apple Developer Portal → Identifiers → Enable "Sign In with Apple"
2. Create a Services ID for web auth
3. Generate a private key and JWT client secret
4. Set in Convex dashboard: `APPLE_CLIENT_ID` and `APPLE_CLIENT_SECRET`

</details>

<details>
<summary><strong>Environment Reference</strong></summary>

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
| `RESEND_WEBHOOK_SECRET` | | ✓ | |
| `REVENUECAT_WEBHOOK_BEARER_TOKEN` | | ✓ | |

</details>

<details>
<summary><strong>Commands</strong></summary>

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
npm run test                # Jest watch mode
npm run test:ci             # Jest CI mode

# Reset
npm run clean               # Project reset
npm run clean:nuclear       # Full reset (all caches)
```

</details>

<details>
<summary><strong>EAS Builds</strong></summary>

Set these in [expo.dev](https://expo.dev) → Your Project → **Environment Variables**:

```bash
EXPO_PUBLIC_CONVEX_URL=https://your-prod-slug.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-prod-slug.convex.site
EXPO_PUBLIC_SITE_URL=dreamseeker://
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=appl_xxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY=goog_xxxxxxxxxxxx
```

Then build:

```bash
eas build --platform ios --profile development   # Testing
eas build --platform ios --profile production    # App Store
```

</details>

<details>
<summary><strong>Troubleshooting</strong></summary>

| Problem | Solution |
| :--- | :--- |
| First `convex dev` fails | Expected — set env vars per step 3, then re-run |
| "Missing CONVEX_URL" | Check `.env.local` exists and has values |
| "Unauthorized" errors | Verify Convex env vars with `npx convex env list` |
| Push notifications fail | Use physical device (simulator doesn't support) |
| Purchases not working | Use physical device with sandbox account |
| Entitlements not updating | Check webhook URL and bearer token in RevenueCat |
| "No API key configured" | Set `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` |
| Paywall not showing | Ensure products are attached to `premium` entitlement |

</details>

<details>
<summary><strong>Production Checklist</strong></summary>

- [ ] Create Convex production deployment (`npx convex deploy`)
- [ ] Set all Convex prod env vars
- [ ] Generate new `BETTER_AUTH_SECRET` for prod
- [ ] Set up email DNS records for Resend
- [ ] Configure EAS production env vars
- [ ] Create production webhook in RevenueCat pointing to prod Convex URL
- [ ] Submit in-app purchases for review (App Store / Play Store)
- [ ] Test full signup and purchase flow in TestFlight / Internal Testing

</details>

---

## License

MIT
