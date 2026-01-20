import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, TouchTarget } from '@/constants/layout';

export default function NotFoundScreen() {
  const colors = useColors();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.lg, backgroundColor: colors.background }}>
        <ThemedText variant="title">This screen does not exist.</ThemedText>
        <Link href="/" style={{ paddingVertical: Spacing.lg, minHeight: TouchTarget.min, justifyContent: 'center' }} accessibilityRole="link" accessibilityLabel="Go to home screen">
          <ThemedText variant="link" color={colors.mutedForeground}>Go to home screen!</ThemedText>
        </Link>
      </View>
    </>
  );
}
