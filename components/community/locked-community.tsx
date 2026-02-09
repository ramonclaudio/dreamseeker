import { Pressable, StyleSheet } from 'react-native';

import { MaterialCard } from '@/components/ui/material-card';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';

type LockedCommunityProps = {
  onUpgrade: () => void;
};

export function LockedCommunity({ onUpgrade }: LockedCommunityProps) {
  const colors = useColors();

  return (
    <MaterialCard style={styles.card}>
      <IconSymbol
        name="lock.fill"
        size={IconSize['5xl']}
        color={colors.mutedForeground}
      />
      <ThemedText style={styles.title}>Unlock Community</ThemedText>
      <ThemedText
        style={styles.subtitle}
        color={colors.mutedForeground}
      >
        Connect with friends, cheer each other on, and achieve your dreams
        together.
      </ThemedText>
      <Pressable
        onPress={onUpgrade}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.primary,
            opacity: pressed ? Opacity.pressed : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Start free trial"
      >
        <ThemedText
          style={styles.buttonText}
          color={colors.primaryForeground}
        >
          Start Free Trial
        </ThemedText>
      </Pressable>
    </MaterialCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing['3xl'],
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
});
