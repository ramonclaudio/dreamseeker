import { View, ScrollView } from 'react-native';

import { useColors } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';

export default function ExportScreen() {
  const colors = useColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ width: 36, height: 5, borderRadius: 3, marginBottom: 12, backgroundColor: colors.separator }} />
        <ThemedText variant="subtitle">Data Export</ThemedText>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }} contentInsetAdjustmentBehavior="automatic">
        <GlassCard style={{ padding: 20, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconSymbol name="star.fill" size={16} color={colors.primary} />
            <ThemedText style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }} color={colors.primary}>Plus Feature</ThemedText>
          </View>
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>Data Export</ThemedText>
          <ThemedText style={{ fontSize: 16, lineHeight: 24 }} color={colors.mutedForeground}>
            Export your tasks and data in various formats including JSON, CSV, and PDF. Keep backups or analyze your productivity.
          </ThemedText>
        </GlassCard>

        <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
          <IconSymbol name="square.and.arrow.up" size={48} color={colors.mutedForeground} />
          <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>Coming Soon</ThemedText>
          <ThemedText style={{ fontSize: 14, textAlign: 'center' }} color={colors.mutedForeground}>
            Data export is being built. Check back soon!
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}
