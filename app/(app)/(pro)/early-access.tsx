import { View, StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import { router } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassCard } from '@/components/ui/glass-card';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EarlyAccessScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ width: 60 }} />
        <Text style={[Typography.subtitle, { color: colors.text }]}>Early Access</Text>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.closeButton}>
          <IconSymbol name="xmark" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.contentContainer}>
        <GlassCard style={styles.card}>
          <View style={styles.featureBadge}>
            <IconSymbol name="sparkles" size={16} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>Pro Feature</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Early Access Features</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            As a Pro subscriber, you get early access to new features before they&apos;re released to everyone.
          </Text>
        </GlassCard>

        <GlassCard style={styles.featureList}>
          <Text style={[styles.featureListTitle, { color: colors.foreground }]}>Coming Soon</Text>
          {[
            'AI-powered task suggestions',
            'Advanced analytics dashboard',
            'Team collaboration',
            'Custom integrations',
          ].map((text) => (
            <View key={text} style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.foreground }]}>{text}</Text>
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  closeButton: { width: 60, alignItems: 'flex-end' },
  scrollContent: { flex: 1 },
  contentContainer: { padding: 20, gap: 20 },
  card: { padding: 20 },
  featureBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, lineHeight: 24 },
  featureList: { padding: 20, gap: 16 },
  featureListTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 16 },
});
