import { Pressable, Share, StyleSheet } from 'react-native';

import { MaterialCard } from '@/components/ui/material-card';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';

type EmptyCommunityProps = {
  onSearch: () => void;
};

export function EmptyCommunity({ onSearch }: EmptyCommunityProps) {
  const colors = useColors();

  const handleShare = () => {
    Share.share({
      message: 'Join me on DreamSeeker — the app that helps you achieve your biggest dreams! https://dreamseeker.app',
    });
  };

  return (
    <MaterialCard style={styles.card}>
      <IconSymbol
        name="person.2.fill"
        size={IconSize['6xl']}
        color={colors.mutedForeground}
      />
      <ThemedText style={styles.title}>
        Your circle is waiting
      </ThemedText>
      <ThemedText
        style={styles.subtitle}
        color={colors.mutedForeground}
      >
        Connect with friends to cheer each other on — or invite someone to join you.
      </ThemedText>
      <Pressable
        onPress={onSearch}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.primary,
            opacity: pressed ? Opacity.pressed : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Find friends"
      >
        <IconSymbol
          name="magnifyingglass"
          size={IconSize.lg}
          color={colors.primaryForeground}
        />
        <ThemedText
          style={styles.buttonText}
          color={colors.primaryForeground}
        >
          Find Friends
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={handleShare}
        style={({ pressed }) => [
          styles.outlineButton,
          {
            borderColor: colors.border,
            opacity: pressed ? Opacity.pressed : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Share DreamSeeker"
      >
        <IconSymbol
          name="square.and.arrow.up"
          size={IconSize.lg}
          color={colors.text}
        />
        <ThemedText style={styles.outlineButtonText}>
          Share DreamSeeker
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  outlineButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
});
