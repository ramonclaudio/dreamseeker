import { createAuthClient } from 'better-auth/react';
import { usernameClient } from 'better-auth/client/plugins';
import { convexClient, crossDomainClient } from '@convex-dev/better-auth/client/plugins';
import { expoClient } from '@better-auth/expo/client';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { env } from './env';

// scheme from app.json - can be string or string[], library handles both
const rawScheme = Constants.expoConfig?.scheme;
const scheme = Array.isArray(rawScheme) ? rawScheme[0] : rawScheme;

const platformPlugins = Platform.OS === 'web'
  ? [crossDomainClient()]
  : [expoClient({ scheme, storagePrefix: scheme ?? 'better-auth', storage: SecureStore })];

const client = createAuthClient({
  baseURL: env.convexSiteUrl,
  plugins: [convexClient(), usernameClient(), ...platformPlugins],
});

type UsernameSignIn = (data: { username: string; password: string }) => Promise<{ data: unknown; error: { message: string } | null }>;

export const authClient = client;
export const signInWithUsername = (client.signIn as unknown as { username: UsernameSignIn }).username;
