import { Stack, Redirect, useSegments, router, type ErrorBoundaryProps } from 'expo-router';
import { View, ActivityIndicator, Pressable, Text } from 'react-native';
import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { useColors, useColorScheme } from '@/hooks/use-color-scheme';
import { useLevelUp } from '@/hooks/use-level-up';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LevelUpModal } from '@/components/engagement/level-up-modal';
import { Spacing, TouchTarget } from '@/constants/layout';
import { Radius } from '@/constants/theme';

export const unstable_settings = {
  initialRouteName: '(tabs)',
  anchor: '(tabs)',
};

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
  console.error("[App ErrorBoundary]", error);

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

export default function AppLayout() {
  const colors = useColors();
  const segments = useSegments();
  const onboardingStatus = useQuery(api.userPreferences.getOnboardingStatus);
  const { showLevelUpModal, level, levelTitle, dismissLevelUpModal } = useLevelUp();

  // Check if we're already on the onboarding route
  const isOnboardingRoute = segments.some((s) => s === 'onboarding');

  // Show loading while checking onboarding status
  if (onboardingStatus === undefined) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect to onboarding if not completed (and not already there)
  if (!onboardingStatus.completed && !isOnboardingRoute) {
    return <Redirect href="/(app)/onboarding" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          headerBackTitle: 'Back',
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
          animationDuration: 250,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen
          name="dream/[id]"
          options={{
            headerShown: true,
            headerBackTitle: 'Back',
            title: '',
          }}
        />
        <Stack.Screen name="create-dream" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="journal-entry" options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="focus-timer" options={{ presentation: 'modal', headerShown: false, gestureEnabled: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="subscribe" options={{ presentation: 'modal', title: 'Upgrade to Premium', headerShown: true, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="dream-complete/[id]" options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false, animation: 'slide_from_bottom' }} />
      </Stack>

      {/* Level-up celebration modal */}
      <LevelUpModal
        visible={showLevelUpModal}
        level={level}
        levelTitle={levelTitle}
        onDismiss={dismissLevelUpModal}
      />
    </View>
  );
}
