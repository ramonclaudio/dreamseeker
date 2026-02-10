import { Stack } from 'expo-router';

import { useColors } from '@/hooks/use-color-scheme';

export default function DashboardLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="settings" options={{ title: 'Settings', headerBackTitle: 'Dashboard' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications', headerBackTitle: 'Settings' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy', headerBackTitle: 'Settings' }} />
      <Stack.Screen name="about" options={{ title: 'About', headerBackTitle: 'Settings' }} />
      <Stack.Screen name="help" options={{ title: 'Help', headerBackTitle: 'Settings' }} />
    </Stack>
  );
}
