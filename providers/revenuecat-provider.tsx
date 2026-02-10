import { useEffect } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { api } from '@/convex/_generated/api';
import { env } from '@/lib/env';

let sdkConfigured = false;

interface RevenueCatProviderProps {
  children: React.ReactNode;
}

export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.auth.getCurrentUser);

  // Configure SDK once on mount
  useEffect(() => {
    const apiKey = env.revenuecatAppleApiKey;

    if (!apiKey) {
      if (__DEV__) console.warn('[RevenueCat] No API key configured for platform');
      return;
    }

    if (sdkConfigured) return;

    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });
    sdkConfigured = true;

    if (__DEV__) console.log('[RevenueCat] SDK configured');
  }, []);

  // Sync user login/logout with RevenueCat
  useEffect(() => {
    if (isLoading) return; // Don't sync until auth state is known

    const syncUser = async () => {
      if (isAuthenticated && user?._id) {
        try {
          await Purchases.logIn(user._id);
        } catch (error) {
          if (__DEV__) console.error('[RevenueCat] Login failed:', error);
        }
      } else if (!isAuthenticated) {
        try {
          // Only log out if user is not anonymous (was previously logged in)
          const isAnonymous = await Purchases.isAnonymous();
          if (!isAnonymous) {
            await Purchases.logOut();
          }
        } catch {
          // Ignore logout errors (SDK may not be configured)
        }
      }
    };

    syncUser();
  }, [isAuthenticated, isLoading, user?._id]);

  return <>{children}</>;
}
