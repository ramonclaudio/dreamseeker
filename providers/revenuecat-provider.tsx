import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useConvexAuth } from 'convex/react';
import { useQuery } from 'convex/react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { api } from '@/convex/_generated/api';
import { env } from '@/lib/env';

interface RevenueCatContextValue {
  isConfigured: boolean;
}

const RevenueCatContext = createContext<RevenueCatContextValue>({
  isConfigured: false,
});

export const useRevenueCat = () => useContext(RevenueCatContext);

interface RevenueCatProviderProps {
  children: ReactNode;
}

export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.auth.getCurrentUser);
  const configuredRef = useRef(false);
  const loggedInUserIdRef = useRef<string | null>(null);

  // Configure SDK once on mount
  useEffect(() => {
    const configure = async () => {
      // Check SDK's own state to prevent double-configure
      if (await Purchases.isConfigured()) {
        configuredRef.current = true;
        return;
      }

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
      configuredRef.current = true;

      if (__DEV__) console.log('[RevenueCat] SDK configured');
    };

    configure();
  }, []);

  // Sync user login/logout with RevenueCat
  useEffect(() => {
    const syncUser = async () => {
      // Wait for SDK to be configured
      if (!(await Purchases.isConfigured())) return;

      if (isAuthenticated && user?._id) {
        // User logged in - identify them in RevenueCat
        const currentUserId = await Purchases.getAppUserID();
        if (currentUserId !== user._id) {
          try {
            await Purchases.logIn(user._id);
            loggedInUserIdRef.current = user._id;
            if (__DEV__) console.log('[RevenueCat] User logged in:', user._id);
          } catch (error) {
            if (__DEV__) console.error('[RevenueCat] Login failed:', error);
          }
        } else {
          loggedInUserIdRef.current = user._id;
        }
      } else if (!isAuthenticated && loggedInUserIdRef.current) {
        // User logged out - reset RevenueCat
        try {
          await Purchases.logOut();
          loggedInUserIdRef.current = null;
          if (__DEV__) console.log('[RevenueCat] User logged out');
        } catch (error) {
          if (__DEV__) console.error('[RevenueCat] Logout failed:', error);
        }
      }
    };

    syncUser();
  }, [isAuthenticated, user?._id]);

  return (
    <RevenueCatContext.Provider value={{ isConfigured: configuredRef.current }}>
      {children}
    </RevenueCatContext.Provider>
  );
}
