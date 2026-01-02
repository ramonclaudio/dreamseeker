import { createAuthClient } from 'better-auth/react';
import { usernameClient } from 'better-auth/client/plugins';
import { convexClient, crossDomainClient } from '@convex-dev/better-auth/client/plugins';
import { expoClient } from '@better-auth/expo/client';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const scheme = Constants.expoConfig?.scheme as string;

// Create platform-specific plugins array
const platformPlugins =
  Platform.OS === 'web'
    ? [crossDomainClient()]
    : [
        expoClient({
          scheme,
          storagePrefix: scheme,
          storage: SecureStore,
        }),
      ];

const client = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
  plugins: [convexClient(), usernameClient(), ...platformPlugins],
});

// Type helper for signIn.username (TypeScript can't infer plugin types with Convex)
type UsernameSignIn = (data: { username: string; password: string }) => Promise<{
  data: unknown;
  error: { message: string } | null;
}>;

export const authClient = client;
export const signInWithUsername = (client.signIn as unknown as { username: UsernameSignIn })
  .username;
