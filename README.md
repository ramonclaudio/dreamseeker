# Expo Starter App

Production-ready Expo starter with auth, real-time backend, and iOS 26 native features.

## Stack

| Layer | Tech |
|-------|------|
| Runtime | Expo SDK 55 (canary) · React 19 · React Compiler |
| Backend | Convex (real-time) · Better Auth · Resend |
| Styling | NativeWind v5 · Tailwind v4 · shadcn/ui tokens |
| Native | NativeTabs · SF Symbols · Liquid Glass · Haptics |

## Architecture

```
┌─────────────────────────────────────────┐
│ NativeTabs (iOS system chrome)          │ ← SF Symbols, DynamicColorIOS
├─────────────────────────────────────────┤
│ Themed Screens                          │ ← shadcn tokens, StyleSheet
│ ├─ GlassCard (GlassView→BlurView→View) │
│ ├─ Colors[colorScheme] pattern          │
│ └─ Haptic feedback on interactions      │
├─────────────────────────────────────────┤
│ Convex Backend                          │ ← Real-time queries/mutations
│ ├─ Better Auth (sessions, rate limiting)│
│ └─ Resend (transactional email)         │
└─────────────────────────────────────────┘
```

**Theming approach:** NativeWind for CSS variables + dark mode. StyleSheet for layouts. No className-first Tailwind — we use native patterns with consistent theming.

**Native feel:** Blur, haptics, SF Symbols, liquid glass, tab minimize. NOT SwiftUI system colors — custom shadcn theme everywhere for consistency.

## Features

- Email/username sign in
- Password reset via email
- Protected routes (auto-redirect)
- Rate limiting on auth
- Session persistence (7 day expiry)
- Profile with avatar upload (Convex storage)
- User-scoped tasks (CRUD example)
- iOS 26 liquid glass tab bar

## Prerequisites

- Node.js 18+
- Xcode 16+ (iOS) or Android Studio
- [Convex account](https://convex.dev) (free)
- [Resend account](https://resend.com) (free: 100/day)
- Verified domain on Resend

> Expo Go not supported. SDK 55 canary requires dev builds.

## Quick Start

```bash
# Clone
git clone https://github.com/ramonclaudio/expo-starter-app.git
cd expo-starter-app
npm install

# Start Convex (creates deployment, deploys schema)
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

# Run
npm run ios
```

## Development

```bash
npm run convex    # Terminal 1: backend (hot reload)
npm run ios       # Terminal 2: first run (builds native)
npm run start     # Terminal 2: subsequent (Metro only)
```

## Project Structure

```
app/
├── _layout.tsx              # Root: providers, error boundary
├── (auth)/                  # Public: sign-in, sign-up, forgot/reset password
└── (app)/
    ├── _layout.tsx          # Auth gate: redirects if unauthenticated
    ├── modal.tsx            # BlurView modal
    └── (tabs)/
        ├── _layout.tsx      # NativeTabs + SF Symbols
        ├── index.tsx        # Home
        ├── tasks.tsx        # CRUD example
        ├── explore.tsx      # Parallax scroll
        ├── profile.tsx      # Avatar upload, edit user
        └── settings.tsx     # Sign out, delete account

convex/
├── schema.ts                # Database schema
├── auth.ts                  # Better Auth config
├── auth.config.ts           # Auth component registration
├── http.ts                  # HTTP routes (auth, webhooks)
├── tasks.ts                 # Example CRUD with auth guards
├── email.ts                 # Resend integration
└── storage.ts               # File upload utilities

components/
├── ui/glass-card.tsx        # GlassView → BlurView → View fallback
├── themed-text.tsx          # Text with className support
├── themed-view.tsx          # View with className support
└── parallax-scroll-view.tsx # Animated blur header

constants/
├── theme.ts                 # shadcn v4 color tokens
└── auth-styles.ts           # Auth screen styles

plugins/
└── with-auto-signing.js     # iOS automatic code signing for device builds

lib/
├── auth-client.ts           # Better Auth client (platform-aware)
├── haptics.ts               # Haptic feedback utility
└── nativewind-interop.ts    # styled() for third-party components
```

## Environment Variables

**Client (.env.local):**
| Var | Description |
|-----|-------------|
| `CONVEX_DEPLOYMENT` | `dev:your-deployment` |
| `EXPO_PUBLIC_CONVEX_URL` | `.convex.cloud` URL |
| `EXPO_PUBLIC_CONVEX_SITE_URL` | `.convex.site` URL |
| `EXPO_PUBLIC_SITE_URL` | App URL for email links |

**Server (Convex Dashboard):**
| Var | Description |
|-----|-------------|
| `BETTER_AUTH_SECRET` | Auth encryption key |
| `SITE_URL` | Same as `EXPO_PUBLIC_SITE_URL` |
| `RESEND_API_KEY` | From resend.com/api-keys |
| `RESEND_FROM_EMAIL` | Verified sender |

## Auth Pattern

```typescript
// Convex function with auth guard
export const list = query({
  handler: async (ctx) => {
    const userId = await authComponent.safeGetAuthUser(ctx);
    if (!userId) return []; // Safe return for queries
    return ctx.db.query("tasks").filter(...).collect();
  },
});
```

## Theming

Colors defined in `global.css` (CSS variables) and `constants/theme.ts` (runtime access):

```typescript
const colorScheme = useColorScheme();
const colors = Colors[colorScheme];
// colors.background, colors.card, colors.primary, etc.
```

NativeWind v5 compiles Tailwind → StyleSheet.create. Use `className` when convenient, StyleSheet when you need full control.

## Native Features

**NativeTabs** (iOS 26):
- SF Symbols with default/selected states
- `minimizeBehavior="onScrollDown"`
- DynamicColorIOS for liquid glass adaptation

**GlassCard** fallback chain:
1. iOS 26+: `GlassView` (liquid glass)
2. iOS < 26, Web: `BlurView`
3. Android: Semi-transparent solid

**Haptics:**
```typescript
import { haptics } from '@/lib/haptics';
haptics.light();   // Button press
haptics.success(); // Form submit
haptics.error();   // Validation fail
```

## Production

DNS for email deliverability:
```
@ TXT "v=spf1 include:_spf.resend.com ~all"
resend._domainkey TXT <from Resend dashboard>
_dmarc TXT "v=DMARC1; p=none;"
```

Deploy Convex:
```bash
npx convex deploy
```

## Commands

```bash
# Development (two terminals)
npm run convex       # Terminal 1: Convex backend
npm run ios          # Terminal 2: Clean prebuild + iOS build

# Build commands (all run prebuild --clean by default)
npm run ios          # Prebuild + iOS simulator
npm run ios:device   # Prebuild + iOS physical device
npm run ios:fast     # Skip prebuild (when native unchanged)
npm run android      # Prebuild + Android
npm run android:fast # Skip prebuild

# Dev server
npm run start        # Metro with --clear cache
npm run web          # Web with --clear cache

# Cache clearing
npm run clean        # Nuclear: rm node_modules + ios + android + DerivedData, reinstall
npm run clean:metro  # Clear watchman + Metro cache
npm run clean:xcode  # Clear Xcode DerivedData only
npm run prebuild     # Regenerate native dirs (--clean)

# Quality
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test:ci      # Jest
npm run analyze      # Bundle analysis (Expo Atlas)
```

## License

MIT
