import { View, Pressable, StyleSheet } from 'react-native';

import { MaterialCard } from '@/components/ui/material-card';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { WEEKLY_CHALLENGES } from '@/convex/constants';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';

type WeeklyChallengeCardProps = {
  isPremium: boolean;
  onUpgrade: () => void;
};

export function WeeklyChallengeCard({ isPremium, onUpgrade }: WeeklyChallengeCardProps) {
  const colors = useColors();
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const challenge = WEEKLY_CHALLENGES[weekNumber % WEEKLY_CHALLENGES.length];

  return (
    <MaterialCard style={[styles.card, { borderLeftColor: colors.primary, borderLeftWidth: 2 }]}>
      <View style={styles.header}>
        <IconSymbol name="sparkles" size={IconSize.lg} color={colors.primary} />
        <ThemedText style={styles.headerText} color={colors.primary}>
          This Week&apos;s Challenge
        </ThemedText>
      </View>

      {isPremium ? (
        <>
          <ThemedText style={styles.quote}>
            {challenge.quote}
          </ThemedText>
          <ThemedText style={styles.attribution} color={colors.mutedForeground}>
            — Gabby Beckford
          </ThemedText>
        </>
      ) : (
        <Pressable
          onPress={onUpgrade}
          style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
        >
          <View style={[styles.lockedContent, { backgroundColor: colors.muted }]}>
            <IconSymbol name="lock.fill" size={IconSize.lg} color={colors.mutedForeground} />
            <ThemedText style={styles.lockedText} color={colors.mutedForeground}>
              Unlock with Premium
            </ThemedText>
          </View>
        </Pressable>
      )}
    </MaterialCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quote: {
    fontSize: FontSize.xl,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  attribution: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  lockedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.md,
  },
  lockedText: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
});
