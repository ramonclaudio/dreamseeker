import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { ThemedText } from '@/components/ui/themed-text';
import { type ColorPalette } from '@/constants/theme';
import { useColorScheme, useColors } from '@/hooks/use-color-scheme';
import { Spacing, TouchTarget } from '@/constants/layout';

const ModalContent = ({ isPresented, colors }: { isPresented: boolean; colors: ColorPalette }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.sm }}>
    <ThemedText variant="title">Modal</ThemedText>
    <ThemedText style={{ textAlign: 'center' }} color={colors.mutedForeground}>
      This modal uses a blur background on iOS and web.
    </ThemedText>
    <Link href={isPresented ? '../' : '/'} style={{ marginTop: Spacing.md, paddingVertical: Spacing.lg, minHeight: TouchTarget.min, justifyContent: 'center' }} accessibilityRole="link" accessibilityLabel={isPresented ? 'Dismiss modal' : 'Go to home screen'}>
      <ThemedText variant="link" color={colors.mutedForeground}>{isPresented ? 'Dismiss' : 'Go home'}</ThemedText>
    </Link>
  </View>
);

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const colors = useColors();
  const isPresented = router.canGoBack();

  if (Platform.OS === 'android') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.card }}>
        <ModalContent isPresented={isPresented} colors={colors} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={{ flex: 1 }}>
      <ModalContent isPresented={isPresented} colors={colors} />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </BlurView>
  );
}
