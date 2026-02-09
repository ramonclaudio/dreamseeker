import { Pressable } from 'react-native';
import { Stack, router } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';
import { IconSize, Spacing } from '@/constants/layout';
import { Opacity } from '@/constants/ui';

export default function ProfileLayout() {
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
      <Stack.Screen name="settings" options={{ title: 'Settings', headerBackTitle: 'Profile' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications', headerBackTitle: 'Settings' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy', headerBackTitle: 'Settings' }} />
      <Stack.Screen name="about" options={{ title: 'About', headerBackTitle: 'Settings' }} />
      <Stack.Screen name="help" options={{ title: 'Help', headerBackTitle: 'Settings' }} />
    </Stack>
  );
}
