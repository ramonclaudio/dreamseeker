import { Stack } from 'expo-router';

import { useColors } from '@/hooks/use-color-scheme';

export default function HomeLayout() {
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
      <Stack.Screen name="[category]" options={{ headerBackTitle: 'Dreams' }} />
    </Stack>
  );
}
