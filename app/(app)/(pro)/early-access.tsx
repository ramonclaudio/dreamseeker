/**
 * Example Pro-only page
 * This page is protected by the (pro)/_layout.tsx
 * Only users with Pro subscription can access
 */

import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EarlyAccessScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <IconSymbol name="sparkles" size={48} color={colors.primary} />
        </View>
        <ThemedText type="title" style={styles.title}>
          Early Access Features
        </ThemedText>
        <ThemedText style={[styles.description, { color: colors.mutedForeground }]}>
          As a Pro subscriber, you get early access to new features before they're released to everyone.
        </ThemedText>

        <View style={[styles.featureList, { borderColor: colors.border }]}>
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
            <ThemedText style={styles.featureText}>AI-powered task suggestions</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
            <ThemedText style={styles.featureText}>Advanced analytics dashboard</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
            <ThemedText style={styles.featureText}>Team collaboration (coming soon)</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  featureList: {
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 24,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
  },
});
