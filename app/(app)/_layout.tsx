import { Stack, Redirect, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { useColors } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: '(tabs)',
  anchor: '(tabs)',
};

export default function AppLayout() {
  const colors = useColors();
  const segments = useSegments();
  const onboardingStatus = useQuery(api.userPreferences.getOnboardingStatus);

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
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen
          name="dream/[id]"
          options={{
            headerShown: true,
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
        <Stack.Screen name="subscribe" options={{ presentation: 'modal', title: 'Upgrade to Premium', headerShown: true }} />
      </Stack>
    </View>
  );
}
