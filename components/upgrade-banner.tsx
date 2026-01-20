import { Pressable, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
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
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 14, borderRadius: Radius.md, borderCurve: 'continuous', borderWidth: 1, marginBottom: 12, backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }}
      onPress={handlePress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <IconSymbol name="star.fill" size={16} color={colors.primary} />
        <ThemedText style={{ fontSize: 14, fontWeight: '500' }} color={colors.primary}>
          {message}
        </ThemedText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <ThemedText style={{ fontSize: 14, fontWeight: '600' }} color={colors.primary}>
          Upgrade to {nextTierName}
        </ThemedText>
        <IconSymbol name="chevron.right" size={14} color={colors.primary} />
      </View>
    </Pressable>
  );
}
