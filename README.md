# Expo Starter App

Production-ready Expo starter with auth, real-time backend, and iOS 26 native features.

## Stack

| Layer | Tech |
|-------|------|
| Runtime | Expo SDK 55 (canary) · React 19 · React Compiler |
| Backend | Convex (real-time) · Better Auth · Resend |
| Styling | NativeWind v5 · Tailwind v4 · shadcn/ui tokens |
| Native | NativeTabs · SF Symbols · Liquid Glass · Haptics |

## Features

- Email/username auth with password reset
- Protected routes, rate limiting, 7-day sessions
- Profile with avatar upload, user-scoped tasks (CRUD)
- Theme toggle (System/Light/Dark) — cross-platform
- iOS 26 liquid glass tab bar, haptics throughout
- Delete account with full data cleanup

## Prerequisites

- Node.js 18+, Xcode 16+ or Android Studio
- [Convex](https://convex.dev) + [Resend](https://resend.com) accounts (free tiers)
- Verified domain on Resend

> Expo Go not supported. SDK 55 canary requires dev builds.

## Quick Start

```bash
git clone https://github.com/ramonclaudio/expo-starter-app.git
cd expo-starter-app && npm install

# Start Convex (creates deployment)
npx convex dev

# Create .env.local (values printed by Convex)
cat > .env.local << 'EOF'
CONVEX_DEPLOYMENT=dev:your-deployment
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
EXPO_PUBLIC_SITE_URL=http://localhost:8081
EOF

# Set server env vars
npx convex env set BETTER_AUTH_SECRET $(openssl rand -base64 32)
npx convex env set SITE_URL http://localhost:8081
npx convex env set RESEND_API_KEY re_xxxx
npx convex env set RESEND_FROM_EMAIL noreply@yourdomain.com

# Run (two terminals)
npm run convex  # Terminal 1
npm run ios     # Terminal 2
```

## Commands

```bash
npm run convex        # Convex backend (hot reload)
npm run ios           # Clean prebuild + iOS simulator
npm run ios:device    # Clean prebuild + iOS device
npm run ios:fast      # Skip prebuild (native unchanged)
npm run android       # Clean prebuild + Android
npm run start         # Metro only (after initial build)
npm run web           # Web dev server

npm run clean         # Nuclear reset (rm all, reinstall)
npm run clean:xcode   # Clear DerivedData only
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint
```

## Production

```bash
# DNS for email deliverability
@ TXT "v=spf1 include:_spf.resend.com ~all"
resend._domainkey TXT <from Resend dashboard>
_dmarc TXT "v=DMARC1; p=none;"

# Deploy
npx convex deploy
```

## License

MIT
