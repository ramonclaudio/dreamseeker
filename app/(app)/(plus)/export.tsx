import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.dragIndicator} />
        <Text style={[Typography.subtitle, { color: colors.text }]}>Data Export</Text>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <IconSymbol name="xmark.circle.fill" size={28} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <GlassCard style={styles.card}>
          <View style={styles.featureBadge}>
            <IconSymbol name="star.fill" size={16} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>Plus Feature</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Data Export</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            Export your tasks and data in various formats including JSON, CSV, and PDF. Keep backups or analyze your productivity.
          </Text>
        </GlassCard>

        <View style={styles.emptyState}>
          <IconSymbol name="square.and.arrow.up" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Coming Soon</Text>
          <Text style={[styles.emptyDescription, { color: colors.mutedForeground }]}>
            Data export is being built. Check back soon!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  dragIndicator: { position: 'absolute', top: 8, width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(128,128,128,0.3)' },
  closeButton: { position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center', padding: 4 },
  content: { flex: 1 },
  contentContainer: { padding: 20, gap: 20 },
  card: { padding: 20 },
  featureBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, lineHeight: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyDescription: { fontSize: 14, textAlign: 'center' },
});
