import { Pressable, View } from 'react-native';

import { GlassControl } from '@/components/ui/glass-control';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSize, Spacing, TouchTarget, FontSize } from '@/constants/layout';
import { NEXT_TIER, TIERS } from '@/constants/subscriptions';
import { useColors } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { haptics } from '@/lib/haptics';

export function UpgradeBanner() {
  const colors = useColors();
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
    <GlassControl isInteractive style={{ marginBottom: Spacing.md }}>
      <Pressable
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg, minHeight: TouchTarget.min }}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${message}. Upgrade to ${nextTierName}`}
        accessibilityHint="Opens subscription options"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
          <IconSymbol name="star.fill" size={IconSize.md} color={colors.primary} />
          <ThemedText style={{ fontSize: FontSize.base, fontWeight: '500' }} color={colors.primary} numberOfLines={1}>
            {message}
          </ThemedText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexShrink: 0 }}>
          <ThemedText style={{ fontSize: FontSize.base, fontWeight: '600' }} color={colors.primary} numberOfLines={1}>
            Upgrade to {nextTierName}
          </ThemedText>
          <IconSymbol name="chevron.right" size={IconSize.sm} color={colors.primary} />
        </View>
      </Pressable>
    </GlassControl>
  );
}
