import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { GlassCard } from '@/components/ui/glass-card';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ExportScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ width: 60 }} />
        <ThemedText type="subtitle">Data Export</ThemedText>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.closeButton}>
          <IconSymbol name="xmark" size={20} color={colors.foreground} />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  closeButton: { width: 60, alignItems: 'flex-end' },
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
