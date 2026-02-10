import { ConvexReactClient, useConvexAuth } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack, usePathname, useGlobalSearchParams, type Href, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useCallback } from "react";
import { View, AppState, useWindowDimensions } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";
import * as Notifications from "expo-notifications";

import { authClient } from "@/lib/auth-client";
import { env } from "@/lib/env";
import { useColorScheme, useColors } from "@/hooks/use-color-scheme";
import { RevenueCatProvider } from "@/providers/revenuecat-provider";
import { confettiTinyRef, confettiSmallRef, confettiMediumRef, confettiEpicRef } from "@/lib/confetti";
import {
  usePushNotifications,
  useNotificationListeners,
  clearBadge,
  getInitialNotificationResponse,
} from "@/hooks/use-push-notifications";
import { isValidDeepLink } from "@/lib/deep-link";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { Duration, ConfettiTiny, ConfettiSmall, ConfettiMedium, ConfettiEpic } from "@/constants/ui";

const convex = new ConvexReactClient(env.convexUrl, {
  expectAuth: true,
  unsavedChangesWarning: false,
});

export { AppErrorBoundary as ErrorBoundary } from "@/components/ui/error-boundary";

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
            ref={confettiTinyRef}
            count={ConfettiTiny.count}
            origin={{ x: width / 2, y: ConfettiTiny.originY }}
            autoStart={false}
            fadeOut
            fallSpeed={ConfettiTiny.fallSpeed}
            explosionSpeed={ConfettiTiny.explosionSpeed}
            colors={ConfettiTiny.colors as unknown as string[]}
          />
          <ConfettiCannon
            ref={confettiSmallRef}
            count={ConfettiSmall.count}
            origin={{ x: width / 2, y: ConfettiSmall.originY }}
            autoStart={false}
            fadeOut
            fallSpeed={ConfettiSmall.fallSpeed}
            explosionSpeed={ConfettiSmall.explosionSpeed}
            colors={ConfettiSmall.colors as unknown as string[]}
          />
          <ConfettiCannon
            ref={confettiMediumRef}
            count={ConfettiMedium.count}
            origin={{ x: width / 2, y: ConfettiMedium.originY }}
            autoStart={false}
            fadeOut
            fallSpeed={ConfettiMedium.fallSpeed}
            explosionSpeed={ConfettiMedium.explosionSpeed}
            colors={ConfettiMedium.colors as unknown as string[]}
          />
          <ConfettiCannon
            ref={confettiEpicRef}
            count={ConfettiEpic.count}
            origin={{ x: width / 2, y: ConfettiEpic.originY }}
            autoStart={false}
            fadeOut
            fallSpeed={ConfettiEpic.fallSpeed}
            explosionSpeed={ConfettiEpic.explosionSpeed}
            colors={ConfettiEpic.colors as unknown as string[]}
          />
        </View>
      </NavigationThemeProvider>
    </KeyboardProvider>
  );
}
