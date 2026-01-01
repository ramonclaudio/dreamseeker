# Expo Starter App

Expo SDK 55 canary with React 19, React Native 0.83, and expo-router.

## Requirements

- Node.js 18+
- Xcode 16+ (iOS) or Android Studio (Android)
- **No Expo Go** - SDK 55 canary requires development builds

## Get started

```bash
npm install

# Build and install dev client (first time)
npm run ios          # iOS simulator
npm run ios:device   # iOS physical device
npm run android      # Android

# After initial build, just start Metro and tap the app
npm run start
```

## Development workflow

1. **First run**: `npm run ios` builds native code and installs the dev client
2. **Subsequent runs**: `npm run start` then tap the app icon on simulator/device
3. **After native changes**: Run `npm run ios` again to rebuild

## Scripts

| Command | Description |
|---------|-------------|
| `npm run ios` | Build and run on iOS simulator |
| `npm run ios:device` | Build and run on physical iOS device |
| `npm run android` | Build and run on Android |
| `npm run start` | Start Metro bundler (dev client must be installed) |
| `npm run web` | Start web dev server |
| `npm run lint` | Run ESLint with React Compiler rules |
| `npm run typecheck` | Run TypeScript checks |

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo Router](https://docs.expo.dev/router/introduction)
