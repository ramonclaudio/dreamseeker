import { ConvexReactClient, useConvexAuth } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack, usePathname, useGlobalSearchParams, type ErrorBoundaryProps, type Href, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useCallback } from "react";
import { View, Pressable, AppState, useWindowDimensions, Text } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";
import * as Notifications from "expo-notifications";

import { authClient } from "@/lib/auth-client";
import { env } from "@/lib/env";
import { useColorScheme, useColors } from "@/hooks/use-color-scheme";
import { RevenueCatProvider } from "@/providers/revenuecat-provider";
import { confettiRef } from "@/lib/confetti";
import {
  usePushNotifications,
  useNotificationListeners,
  clearBadge,
  getInitialNotificationResponse,
} from "@/hooks/use-push-notifications";
import { isValidDeepLink } from "@/lib/deep-link";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Spacing, TouchTarget } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { Duration, Confetti } from "@/constants/ui";

const convex = new ConvexReactClient(env.convexUrl, {
  expectAuth: true,
  unsavedChangesWarning: false,
});

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  // Don't use useColors() — the provider might have crashed
  // Use hardcoded fallback colors instead
  const isDark = useColorScheme() === "dark";
  const fallbackColors = {
    background: isDark ? "#191d19" : "#f3f6ef",
    foreground: isDark ? "#f0f3ed" : "#2c3a2e",
    mutedForeground: isDark ? "#8a9a8a" : "#6b7a6d",
    primary: "#c7d1dd",
    primaryForeground: "#1e2d3a",
  };

  // Log error for debugging but don't show it to the user
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: fallbackColors.background,
        alignItems: "center",
        justifyContent: "center",
        padding: Spacing["3xl"],
        gap: Spacing.xl,
      }}
    >
      <IconSymbol
        name="exclamationmark.triangle"
        size={64}
        color={fallbackColors.mutedForeground}
        style={{ marginBottom: Spacing.md }}
      />
      <Text
        style={{
          fontSize: 28,
          lineHeight: 36,
          fontWeight: "700",
          textAlign: "center",
          color: fallbackColors.foreground,
          letterSpacing: -0.5,
        }}
      >
        Oops! Something broke, girl.
      </Text>
      <Text
        style={{
          fontSize: 16,
          lineHeight: 24,
          textAlign: "center",
          color: fallbackColors.mutedForeground,
          marginBottom: Spacing.sm,
        }}
      >
        But we don&apos;t quit — let&apos;s try again.
      </Text>
      <Pressable
        style={{
          backgroundColor: fallbackColors.primary,
          paddingHorizontal: Spacing["2xl"],
          paddingVertical: Spacing.md,
          minHeight: TouchTarget.min,
          justifyContent: "center",
          borderRadius: Radius.full,
          borderCurve: "continuous",
          shadowColor: fallbackColors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
          marginBottom: Spacing.md,
        }}
        onPress={retry}
        accessibilityRole="button"
        accessibilityLabel="Try again"
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: fallbackColors.primaryForeground,
          }}
        >
          Try Again
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/(app)/(tabs)/today")}
        accessibilityRole="button"
        accessibilityLabel="Go home"
        style={{ padding: Spacing.md }}
      >
        <Text
          style={{
            fontSize: 14,
            color: fallbackColors.mutedForeground,
            textDecorationLine: "underline",
          }}
        >
          Go Home
        </Text>
      </Pressable>
    </View>
  );
}

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: Duration.splash, fade: true });

export const unstable_settings = { initialRouteName: "(auth)" };

export default function RootLayout() {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <RevenueCatProvider>
        <RootNavigator />
      </RevenueCatProvider>
    </ConvexBetterAuthProvider>
  );
}

function useNotificationDeepLink() {
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const url = response.notification.request.content.data?.url;
    if (typeof url === "string" && isValidDeepLink(url)) {
      router.push(url as Href);
    }
  }, []);

  // Handle initial response captured at module level (before React mount)
  useEffect(() => {
    getInitialNotificationResponse()
      .then((response) => {
        if (response) handleNotificationResponse(response);
      })
      .catch((error) => {
        if (__DEV__) console.warn("[DeepLink] Failed to get initial notification:", error);
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
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") clearBadge();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (__DEV__) console.log("[Screen]", pathname, params);
  }, [pathname, params]);

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  const { width } = useWindowDimensions();
  const colors = useColors();

  // Apply background to body on web
  useEffect(() => {
    if (process.env.EXPO_OS === "web" && typeof document !== "undefined") {
      document.body.style.backgroundColor = colors.background;
      document.body.style.color = colors.foreground;
    }
  }, [colors.background, colors.foreground]);

  return (
    <KeyboardProvider>
      <NavigationThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
              animationDuration: 250,
            }}
          >
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
          <ConfettiCannon
            ref={confettiRef}
            count={Confetti.count}
            origin={{ x: width / 2, y: Confetti.originY }}
            autoStart={false}
            fadeOut
            fallSpeed={Confetti.fallSpeed}
            explosionSpeed={Confetti.explosionSpeed}
          />
        </View>
      </NavigationThemeProvider>
    </KeyboardProvider>
  );
}
