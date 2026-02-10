import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Opacity } from '@/constants/ui';

type TabHeaderProps = {
  title: string;
  subtitle?: string;
  onShare?: () => void;
  shareDisabled?: boolean;
  onAdd?: () => void;
  addLabel?: string;
  /** When true, adds safe area top inset (for screens that don't use contentInsetAdjustmentBehavior). */
  safeAreaTop?: boolean;
};

export function TabHeader({
  title,
  subtitle,
  onShare,
  shareDisabled,
  onAdd,
  addLabel = 'Create new',
  safeAreaTop,
}: TabHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        safeAreaTop && { paddingTop: insets.top + Spacing.lg },
      ]}
    >
      <View style={styles.titleGroup}>
        <ThemedText variant="title" accessibilityRole="header">
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText style={styles.subtitle} color={colors.mutedForeground}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <View style={styles.actions}>
        {onShare && (
          <Pressable
            onPress={onShare}
            disabled={shareDisabled}
            hitSlop={12}
            style={({ pressed }) => ({
              opacity: pressed || shareDisabled ? Opacity.pressed : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Share"
          >
            <IconSymbol name="square.and.arrow.up" size={IconSize.xl} color={colors.primary} />
          </Pressable>
        )}
        {onAdd && (
          <Pressable
            onPress={onAdd}
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                opacity: pressed ? Opacity.pressed : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={addLabel}
          >
            <IconSymbol name="plus" size={IconSize.lg} color={colors.onColor} weight="bold" />
          </Pressable>
        )}
        <UserAvatar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  titleGroup: {
    flex: 1,
    gap: Spacing.xxs,
  },
  subtitle: {
    fontSize: FontSize.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
});
