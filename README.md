# Expo Starter App

Production-ready Expo starter with authentication, backend, and email. Payment-agnostic base for building mobile apps.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Expo SDK 55, React 19, React Native 0.83 |
| Backend | Convex |
| Auth | Better Auth |
| Email | Resend |
| Notifications | Expo Notifications |

## Branches

```
main       → Clean base, no payments (you are here)
stripe     → Stripe integration
revenuecat → RevenueCat integration
```

Choose your branch based on payment needs. All branches share the same core features.

## Quick Start

```bash
# Install
npm install

# Start Convex backend (terminal 1)
npm run convex

# Run iOS app (terminal 2)
npm run ios
```

## Features

- Email/password authentication
- Password reset flow
- Push notifications
- Avatar upload
- Tasks CRUD (unlimited)
- Settings management
- Account deletion
- Dark mode support

## Environment Setup

Copy `.env.example` and configure:

**Local** (`.env.local`):
- `CONVEX_DEPLOYMENT` - Your Convex deployment
- `EXPO_PUBLIC_CONVEX_URL` - Convex cloud URL
- `EXPO_PUBLIC_CONVEX_SITE_URL` - Convex site URL
- `EXPO_PUBLIC_SITE_URL` - Deep link scheme

**Convex Dashboard**:
- `BETTER_AUTH_SECRET` - Auth secret
- `RESEND_API_KEY` - Email API key
- `RESEND_FROM_EMAIL` - Sender email
- `EXPO_ACCESS_TOKEN` - Push notifications

See `.env.example` for full list.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run convex` | Start Convex dev server |
| `npm run ios` | Clean build + iOS simulator |
| `npm run android` | Clean build + Android emulator |
| `npm run check` | Lint + typecheck |
| `npm run clean` | Full project reset |

## Project Structure

```
app/
├── _layout.tsx           # Root providers
├── (auth)/               # Sign in, sign up, password reset
└── (app)/(tabs)/         # Home, tasks, explore, profile, settings

convex/
├── auth.ts               # Better Auth setup
├── tasks.ts              # Tasks CRUD
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

## License

MIT
