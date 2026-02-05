import { Stack } from 'expo-router';

import { useColors } from '@/hooks/use-color-scheme';

export default function OnboardingLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
