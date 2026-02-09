import { Stack } from 'expo-router';

import { useColors } from '@/hooks/use-color-scheme';

export default function CommunityLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Community',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Community' }} />
      <Stack.Screen name="search" options={{ title: 'Search People' }} />
      <Stack.Screen name="friends" options={{ title: 'Friends' }} />
    </Stack>
  );
}
