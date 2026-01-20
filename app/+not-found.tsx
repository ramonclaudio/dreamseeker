import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 15, backgroundColor: colors.background }}>
        <ThemedText variant="title">This screen does not exist.</ThemedText>
        <Link href="/" style={{ paddingVertical: 15 }}>
          <ThemedText variant="link" color={colors.mutedForeground}>Go to home screen!</ThemedText>
        </Link>
      </View>
    </>
  );
}
