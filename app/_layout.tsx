import '../global.css';
import '@/lib/nativewind-interop';

import { ConvexReactClient } from 'convex/react';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useGlobalSearchParams, ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';

import { authClient } from '@/lib/auth-client';
import { StripeProvider } from '@/providers/stripe-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '@/providers/theme-provider';
import { confettiRef } from '@/lib/confetti';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!convexUrl) throw new Error('EXPO_PUBLIC_CONVEX_URL is required');

const convex = new ConvexReactClient(convexUrl, { expectAuth: true, unsavedChangesWarning: false });

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
  container: { flex: 1, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#b91c1c', marginBottom: 12 },
  message: { fontSize: 14, color: '#a3a3a3', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#e5e5e5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#262626', fontWeight: '600' },
});

SplashScreen.preventAutoHideAsync();

export const unstable_settings = { initialRouteName: '(auth)' };

export default function RootLayout() {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <StripeProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </StripeProvider>
    </ConvexBetterAuthProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    if (__DEV__) console.log('[Screen]', pathname, params);
  }, [pathname, params]);

  useEffect(() => { SplashScreen.hideAsync(); }, []);

  const { width } = Dimensions.get('window');

  return (
    <KeyboardProvider>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
        <ConfettiCannon ref={confettiRef} count={150} origin={{ x: width / 2, y: -20 }} autoStart={false} fadeOut fallSpeed={3000} explosionSpeed={400} />
      </NavigationThemeProvider>
    </KeyboardProvider>
  );
}
