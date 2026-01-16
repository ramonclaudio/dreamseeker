import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Typography } from '@/constants/theme';
import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { haptics } from '@/lib/haptics';

export default function ExportScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handleClose = () => {
    haptics.light();
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 16, paddingTop: insets.top + 8 }}>
        <View style={{ position: 'absolute', top: 8, width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(128,128,128,0.3)' }} />
        <Text style={[Typography.subtitle, { color: colors.text }]}>Data Export</Text>
        <Pressable onPress={handleClose} style={{ position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center', padding: 4 }}>
          <IconSymbol name="xmark.circle.fill" size={28} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }} contentInsetAdjustmentBehavior="automatic">
        <GlassCard style={{ padding: 20, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <IconSymbol name="star.fill" size={16} color={colors.primary} />
            <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: colors.primary }}>Plus Feature</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.foreground }}>Data Export</Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.mutedForeground }}>
            Export your tasks and data in various formats including JSON, CSV, and PDF. Keep backups or analyze your productivity.
          </Text>
        </GlassCard>

        <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
          <IconSymbol name="square.and.arrow.up" size={48} color={colors.mutedForeground} />
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>Coming Soon</Text>
          <Text style={{ fontSize: 14, textAlign: 'center', color: colors.mutedForeground }}>
            Data export is being built. Check back soon!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
