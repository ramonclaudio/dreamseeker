import { Stack } from 'expo-router';

import { useColors } from '@/hooks/use-color-scheme';

export default function BoardsLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Boards',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
