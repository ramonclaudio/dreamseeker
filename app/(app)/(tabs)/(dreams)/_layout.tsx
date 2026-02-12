import { Stack } from 'expo-router';

import { useColors } from '@/hooks/use-color-scheme';

export default function DreamsLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Dreams' }} />
      <Stack.Screen name="all-actions" options={{ title: 'All Actions' }} />
      <Stack.Screen name="[category]" options={{ headerBackTitle: 'Dreams', title: '' }} />
      <Stack.Screen name="journal" options={{ title: 'Journal' }} />
    </Stack>
  );
}
