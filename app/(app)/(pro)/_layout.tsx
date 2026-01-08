/**
 * Protected route layout - requires Pro tier
 * All routes in this group require Pro subscription
 *
 * Pattern similar to Better Auth's auth gating:
 * - (auth) routes = public, unauthenticated
 * - (app) routes = requires authentication
 * - (app)/(pro) routes = requires Pro subscription
 */

import { Redirect, Stack, type Href } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRequireTier } from '@/hooks/use-tier-gate';

export default function ProLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { hasAccess, isLoading } = useRequireTier('pro', { noRedirect: true });

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!hasAccess) {
    return <Redirect href={'/subscribe' as Href} />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="early-access"
        options={{ title: 'Early Access', headerShown: true }}
      />
    </Stack>
  );
}
