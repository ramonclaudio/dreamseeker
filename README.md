# Expo Starter App

Expo SDK 55 + React 19 + Convex real-time backend.

## Stack

| Tech | Version |
|------|---------|
| Expo SDK | 55.0.0-canary |
| React | 19.2.0 |
| React Native | 0.83.1 |
| Convex | 1.31.2 |
| TypeScript | 5.9.3 |

## Requirements

- Node.js 18+
- Xcode 16+ (iOS) or Android Studio (Android)
- [Convex account](https://convex.dev) (free tier available)
- **No Expo Go** - SDK 55 canary requires development builds

## Get started

```bash
npm install

# Set up Convex backend
npx convex dev
# Copy the deployment URL to .env.local:
# EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Build and run (new terminal)
npm run ios
```

## Development workflow

Run two terminals:

```bash
# Terminal 1: Convex backend (watches for changes)
npm run convex

# Terminal 2: Expo app
npm run ios          # First time (builds native code)
npm run start        # Subsequent runs (just Metro)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run ios` | Build and run on iOS simulator |
| `npm run ios:device` | Build and run on physical iOS device |
| `npm run android` | Build and run on Android |
| `npm run start` | Start Metro bundler |
| `npm run web` | Start web dev server |
| `npm run convex` | Start Convex dev server |
| `npm run convex:deploy` | Deploy Convex to production |
| `npm run test` | Run tests in watch mode |
| `npm run test:ci` | Run tests once (CI) |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |

## Project structure

```
├── app/                 # Expo Router screens
│   ├── (tabs)/          # Tab navigator
│   │   ├── index.tsx    # Home tab
│   │   ├── tasks.tsx    # Tasks tab (Convex demo)
│   │   └── explore.tsx  # Explore tab
│   └── _layout.tsx      # Root layout with providers
├── convex/              # Convex backend
│   ├── schema.ts        # Database schema
│   └── tasks.ts         # Queries and mutations
├── components/          # Shared components
├── constants/           # Theme and config
└── hooks/               # Custom hooks
```

## Learn more

- [Expo docs](https://docs.expo.dev/)
- [Convex docs](https://docs.convex.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction)
