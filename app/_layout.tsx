import '../global.css';
import '@/lib/nativewind-interop';

import { ConvexReactClient } from 'convex/react';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useGlobalSearchParams, ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import { StripeProvider } from '@stripe/stripe-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

import { authClient } from '@/lib/auth-client';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppearanceProvider } from '@/providers/appearance-provider';
import { confettiRef } from '@/lib/confetti';

// Initialize Convex client
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error('EXPO_PUBLIC_CONVEX_URL is required');
}

const convex = new ConvexReactClient(convexUrl, {
  // Pause queries until the user is authenticated
  expectAuth: true,
  unsavedChangesWarning: false,
});

// Error boundary for root-level errors
// Uses v4 dark mode colors since errors often occur before theme loads
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
  container: {
    flex: 1,
    backgroundColor: '#171717', // v4 dark background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b91c1c', // v4 dark destructive
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#a3a3a3', // v4 dark mutedForeground
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#e5e5e5', // v4 dark primary
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#262626', // v4 dark primaryForeground
    fontWeight: '600',
  },
});

// Prevent splash screen from auto-hiding before app is ready
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Stripe publishable key (optional - app works without it)
const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export default function RootLayout() {
  const content = (
    <AppearanceProvider>
      <RootNavigator />
    </AppearanceProvider>
  );

  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      {Platform.OS !== 'web' && stripePublishableKey ? (
        <StripeProvider
          publishableKey={stripePublishableKey}
          merchantIdentifier="merchant.com.ramonclaudio.expo-starter-app"
          urlScheme="expostarterapp"
        >
          {content}
        </StripeProvider>
      ) : (
        content
      )}
    </ConvexBetterAuthProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();

  // Screen tracking for analytics
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    if (__DEV__) {
      console.log('[Screen]', pathname, params);
    }
  }, [pathname, params]);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const { width } = Dimensions.get('window');

  return (
    <KeyboardProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: width / 2, y: -20 }}
          autoStart={false}
          fadeOut
          fallSpeed={3000}
          explosionSpeed={400}
        />
      </ThemeProvider>
    </KeyboardProvider>
  );
}
