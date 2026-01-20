import { ConvexReactClient, useConvexAuth } from 'convex/react';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useGlobalSearchParams, ErrorBoundaryProps, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback } from 'react';
import { View, Text, Pressable, Dimensions, AppState, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Notifications from 'expo-notifications';

import { authClient } from '@/lib/auth-client';
import { env } from '@/lib/env';
import { StripeProvider } from '@/providers/stripe-provider';
import { useColorScheme, useColors } from '@/hooks/use-color-scheme';
import { confettiRef } from '@/lib/confetti';
import { usePushNotifications, useNotificationListeners, clearBadge, getInitialNotificationResponse } from '@/hooks/use-push-notifications';
import { isValidDeepLink } from '@/lib/deep-link';
import { OfflineBanner } from '@/components/ui/offline-banner';

const convex = new ConvexReactClient(env.convexUrl, { expectAuth: true, unsavedChangesWarning: false });

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const colors = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.destructive }}>Something went wrong</Text>
      <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginBottom: 12 }}>{error.message}</Text>
      <Pressable style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, borderCurve: 'continuous' }} onPress={retry}>
        <Text style={{ color: colors.primaryForeground, fontWeight: '600' }}>Try Again</Text>
      </Pressable>
    </View>
  );
}

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 1000, fade: true });

export const unstable_settings = { initialRouteName: '(auth)' };

export default function RootLayout() {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <StripeProvider>
        <RootNavigator />
      </StripeProvider>
    </ConvexBetterAuthProvider>
  );
}

function useNotificationDeepLink() {
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const url = response.notification.request.content.data?.url;
    if (typeof url === 'string' && isValidDeepLink(url)) {
      router.push(url as any);
    }
  }, []);

  // Handle initial response captured at module level (before React mount)
  useEffect(() => {
    getInitialNotificationResponse()
      .then((response) => {
        if (response) handleNotificationResponse(response);
      })
      .catch((error) => {
        if (__DEV__) console.warn('[DeepLink] Failed to get initial notification:', error);
      });
  }, [handleNotificationResponse]);

  useNotificationListeners(undefined, handleNotificationResponse);
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const insets = useSafeAreaInsets();

  usePushNotifications();
  useNotificationDeepLink();

  useEffect(() => {
    clearBadge();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') clearBadge();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (__DEV__) console.log('[Screen]', pathname, params);
  }, [pathname, params]);

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  const { width } = Dimensions.get('window');
  const colors = useColors();

  // Apply background to body on web
  useEffect(() => {
    if (process.env.EXPO_OS === 'web' && typeof document !== 'undefined') {
      document.body.style.backgroundColor = colors.background;
      document.body.style.color = colors.foreground;
    }
  }, [colors.background, colors.foreground]);

  return (
    <KeyboardProvider>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {!['/', '/explore'].includes(pathname) && (
            <View style={[styles.statusBarBackground, { height: insets.top, backgroundColor: colors.background }]} />
          )}
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            {/* Public routes - only when NOT authenticated */}
            <Stack.Protected guard={!isAuthenticated}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>

            {/* Protected routes - requires authentication */}
            <Stack.Protected guard={isAuthenticated}>
              <Stack.Screen name="(app)" />
            </Stack.Protected>

            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
          <OfflineBanner />
          <ConfettiCannon ref={confettiRef} count={150} origin={{ x: width / 2, y: -20 }} autoStart={false} fadeOut fallSpeed={3000} explosionSpeed={400} />
        </View>
      </NavigationThemeProvider>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
