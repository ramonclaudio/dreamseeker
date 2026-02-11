import { View, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

interface UpgradeBannerProps {
  used: number;
  limit: number;
  noun: string;
}

export function UpgradeBanner({ used, limit, noun }: UpgradeBannerProps) {
  const colors = useColors();
  const { isPremium, hasTrialExpired, showUpgrade } = useSubscription();

  if (isPremium || used < limit - 1) return null;

  const atLimit = used >= limit;
  const almostAtLimit = used === limit - 1;

  return (
    <Pressable
      onPress={() => { haptics.light(); showUpgrade(); }}
      style={[
        styles.container,
        {
          backgroundColor: atLimit ? `${colors.destructive}12` : `${colors.primary}12`,
          borderColor: atLimit ? `${colors.destructive}40` : `${colors.primary}40`,
        },
      ]}
    >
      <View style={styles.left}>
        <IconSymbol
          name={atLimit ? 'lock.fill' : 'sparkles'}
          size={IconSize.lg}
          color={atLimit ? colors.destructive : colors.primary}
        />
        <View style={styles.text}>
          <ThemedText style={styles.title} color={atLimit ? colors.destructive : colors.foreground}>
            {atLimit
              ? `${noun} limit reached`
              : `${used}/${limit} ${noun.toLowerCase()} used`}
          </ThemedText>
          <ThemedText style={styles.subtitle} color={colors.mutedForeground}>
            {hasTrialExpired
              ? `Your trial ended \u2014 upgrade for unlimited ${noun.toLowerCase()}`
              : atLimit
                ? `Upgrade for unlimited ${noun.toLowerCase()}`
                : almostAtLimit
                  ? `1 ${noun.toLowerCase().replace(/s$/, '')} left \u2014 upgrade for unlimited`
                  : `Upgrade for unlimited ${noun.toLowerCase()}`}
          </ThemedText>
        </View>
      </View>
      <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
