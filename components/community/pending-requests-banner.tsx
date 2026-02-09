import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';

type PendingRequestsBannerProps = {
  count: number;
  onPress: () => void;
};

export function PendingRequestsBanner({
  count,
  onPress,
}: PendingRequestsBannerProps) {
  const colors = useColors();

  if (count <= 0) return null;

  const label = count === 1
    ? 'You have 1 friend request'
    : `You have ${count} friend requests`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.banner,
          {
            backgroundColor: colors.primary,
          },
        ]}
      >
        <IconSymbol
          name="person.badge.plus"
          size={IconSize.lg}
          color={colors.primaryForeground}
        />
        <ThemedText
          style={styles.text}
          color={colors.primaryForeground}
        >
          {label}
        </ThemedText>
        <IconSymbol
          name="chevron.right"
          size={IconSize.sm}
          color={colors.primaryForeground}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  text: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
