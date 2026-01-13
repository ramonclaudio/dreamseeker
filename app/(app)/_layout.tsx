import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { meetsMinTier, type TierKey } from '@/convex/schema/tiers';

export const unstable_settings = {
  initialRouteName: '(tabs)',
  anchor: '(tabs)',
};

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { tier, isLoading } = useSubscription();

  // Show loading while subscription status is being fetched
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const canAccess = (minTier: TierKey) => meetsMinTier(tier, minTier);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {/* Base routes - all authenticated users */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="subscribe" options={{ presentation: 'modal', gestureEnabled: true }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />

        {/* Tier-gated routes - requires minimum subscription tier */}
        <Stack.Protected guard={canAccess('starter')}>
          <Stack.Screen name="(starter)" options={{ presentation: 'modal' }} />
        </Stack.Protected>

        <Stack.Protected guard={canAccess('plus')}>
          <Stack.Screen name="(plus)" options={{ presentation: 'modal' }} />
        </Stack.Protected>

        <Stack.Protected guard={canAccess('pro')}>
          <Stack.Screen name="(pro)" options={{ presentation: 'modal' }} />
        </Stack.Protected>
      </Stack>
    </View>
  );
}
