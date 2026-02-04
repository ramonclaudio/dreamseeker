import { useEffect } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { api } from '@/convex/_generated/api';
import { env } from '@/lib/env';

interface RevenueCatProviderProps {
  children: React.ReactNode;
}

export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.auth.getCurrentUser);

  // Configure SDK once on mount
  useEffect(() => {
    const apiKey =
      process.env.EXPO_OS === 'ios'
        ? env.revenuecatAppleApiKey
        : env.revenuecatGoogleApiKey;

    if (!apiKey) {
      if (__DEV__) console.warn('[RevenueCat] No API key configured for platform');
      return;
    }

    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });

    if (__DEV__) console.log('[RevenueCat] SDK configured');
  }, []);

  // Sync user login/logout with RevenueCat
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      Purchases.logIn(user._id).catch((error) => {
        if (__DEV__) console.error('[RevenueCat] Login failed:', error);
      });
    } else if (!isAuthenticated) {
      Purchases.logOut().catch(() => {
        // Ignore logout errors — user may not have been logged in
      });
    }
  }, [isAuthenticated, user?._id]);

  return <>{children}</>;
}
