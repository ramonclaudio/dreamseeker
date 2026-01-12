import { ConvexReactClient, useConvexAuth } from 'convex/react';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useGlobalSearchParams, ErrorBoundaryProps, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, AppState } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Notifications from 'expo-notifications';

import { authClient } from '@/lib/auth-client';
import { env } from '@/lib/env';
import { StripeProvider } from '@/providers/stripe-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { confettiRef } from '@/lib/confetti';
import { usePushNotifications, useNotificationListeners, clearBadge, getInitialNotificationResponse } from '@/hooks/use-push-notifications';
import { Colors } from '@/constants/theme';

const convex = new ConvexReactClient(env.convexUrl, { expectAuth: true, unsavedChangesWarning: false });

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={errorStyles.container}>
      <Text style={errorStyles.title}>Something went wrong</Text>
      <Text style={errorStyles.message}>{error.message}</Text>
      <Pressable style={errorStyles.button} onPress={retry}>
        <Text style={errorStyles.buttonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.dark.destructive, marginBottom: 12 },
  message: { fontSize: 14, color: Colors.dark.mutedForeground, textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: Colors.dark.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: Colors.dark.primaryForeground, fontWeight: '600' },
});

SplashScreen.preventAutoHideAsync();

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
    if (typeof url === 'string') {
      router.push(url as any);
    }
  }, []);

  // Handle initial response captured at module level (before React mount)
  useEffect(() => {
    getInitialNotificationResponse().then((response) => {
      if (response) handleNotificationResponse(response);
    });
  }, [handleNotificationResponse]);

  useNotificationListeners(undefined, handleNotificationResponse);
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const { isAuthenticated, isLoading } = useConvexAuth();

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

  return (
    <KeyboardProvider>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
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
        <ConfettiCannon ref={confettiRef} count={150} origin={{ x: width / 2, y: -20 }} autoStart={false} fadeOut fallSpeed={3000} explosionSpeed={400} />
      </NavigationThemeProvider>
    </KeyboardProvider>
  );
}
