import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius } from '@/constants/theme';
import { NEXT_TIER, TIERS } from '@/constants/subscriptions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { haptics } from '@/lib/haptics';

export function UpgradeBanner() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { tier, taskLimit, tasksRemaining, showUpgrade } = useSubscription();

  if (tier === 'pro') return null;
  if (tasksRemaining === null || tasksRemaining > 1) return null;

  const handlePress = () => {
    haptics.light();
    showUpgrade();
  };

  const message =
    tasksRemaining === 0
      ? 'Task limit reached'
      : `${tasksRemaining} of ${taskLimit} remaining`;

  const nextTierKey = NEXT_TIER[tier];
  const nextTierName = nextTierKey ? TIERS[nextTierKey].name : 'Pro';

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
      onPress={handlePress}
    >
      <View style={styles.content}>
        <IconSymbol name="star.fill" size={16} color={colors.primary} />
        <ThemedText style={[styles.text, { color: colors.primary }]}>
          {message}
        </ThemedText>
      </View>
      <View style={styles.action}>
        <ThemedText style={[styles.actionText, { color: colors.primary }]}>
          Upgrade to {nextTierName}
        </ThemedText>
        <IconSymbol name="chevron.right" size={14} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, marginHorizontal: 20, marginBottom: 12 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 14, fontWeight: '500' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 14, fontWeight: '600' },
});
