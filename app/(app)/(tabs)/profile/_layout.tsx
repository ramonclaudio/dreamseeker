import { Stack } from 'expo-router';

import { useColors } from '@/hooks/use-color-scheme';

export default function ProfileLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Profile',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
      <Stack.Screen name="help" options={{ title: 'Help' }} />
    </Stack>
  );
}
