import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/use-color-scheme';
import { MaxWidth, Spacing, FontSize, IconSize } from '@/constants/layout';
import { Size } from '@/constants/ui';
import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';

export default function ExportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ alignItems: 'center', paddingTop: Spacing.sm, paddingBottom: Spacing.lg }}>
        <View style={{ width: Size.dragHandle.width, height: Size.dragHandle.height, borderRadius: Size.dragHandle.radius, marginBottom: Spacing.md, backgroundColor: colors.separator }} />
        <ThemedText variant="subtitle">Data Export</ThemedText>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.xl, paddingBottom: Math.max(Spacing.xl, insets.bottom), gap: Spacing.xl, maxWidth: MaxWidth.content, alignSelf: 'center', width: '100%' }} contentInsetAdjustmentBehavior="automatic">
        <GlassCard style={{ padding: Spacing.xl, gap: Spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
            <IconSymbol name="star.fill" size={IconSize.md} color={colors.primary} />
            <ThemedText style={{ fontSize: FontSize.sm, fontWeight: '600', textTransform: 'uppercase' }} color={colors.primary}>Plus Feature</ThemedText>
          </View>
          <ThemedText style={{ fontSize: FontSize['5xl'], fontWeight: 'bold' }}>Data Export</ThemedText>
          <ThemedText style={{ fontSize: FontSize.xl, lineHeight: 24 }} color={colors.mutedForeground}>
            Export your tasks and data in various formats including JSON, CSV, and PDF. Keep backups or analyze your productivity.
          </ThemedText>
        </GlassCard>

        <View style={{ alignItems: 'center', paddingVertical: 60, gap: Spacing.md }}>
          <IconSymbol name="square.and.arrow.up" size={IconSize['5xl']} color={colors.mutedForeground} />
          <ThemedText style={{ fontSize: FontSize['3xl'], fontWeight: '600' }}>Coming Soon</ThemedText>
          <ThemedText style={{ fontSize: FontSize.base, textAlign: 'center' }} color={colors.mutedForeground}>
            Data export is being built. Check back soon!
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}
