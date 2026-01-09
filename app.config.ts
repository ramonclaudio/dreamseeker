import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({ ...config, name: config.name ?? 'expo-starter-app', slug: config.slug ?? 'expo-starter-app' });
