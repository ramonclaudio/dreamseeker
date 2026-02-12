import { useState, useEffect } from 'react';
import { Stack, Redirect, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { useColors } from '@/hooks/use-color-scheme';
import { useLevelUp } from '@/hooks/use-level-up';
import { LevelUpModal } from '@/components/engagement/level-up-modal';

export const unstable_settings = {
  initialRouteName: '(tabs)',
  anchor: '(tabs)',
};

export { AppErrorBoundary as ErrorBoundary } from '@/components/ui/error-boundary';

export default function AppLayout() {
  const colors = useColors();
  const segments = useSegments();
  const onboardingStatus = useQuery(api.userPreferences.getOnboardingStatus);
  const user = useQuery(api.auth.getCurrentUser);
  const { showLevelUpModal, level, levelTitle, dismissLevelUpModal } = useLevelUp();
  const [ready, setReady] = useState(false);

  // Check if we're already on the onboarding route
  const isOnboardingRoute = segments.some((s) => s === 'onboarding');

  // Mark ready once onboarding status resolves — never go back to loading
  // so the Stack stays mounted through query re-evaluations
  useEffect(() => {
    if (onboardingStatus !== undefined) setReady(true);
  }, [onboardingStatus]);

  // Block only on initial load — never unmount the Stack after first render
  if (!ready) {
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
  if (onboardingStatus && !onboardingStatus.completed && !isOnboardingRoute) {
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: '' }} />
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
        <Stack.Screen name="create-action" options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="user-profile/[id]" options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
      </Stack>

      {/* Level-up celebration modal */}
      <LevelUpModal
        visible={showLevelUpModal}
        level={level}
        levelTitle={levelTitle}
        handle={user?.displayName ?? user?.name}
        onDismiss={dismissLevelUpModal}
      />
    </View>
  );
}
