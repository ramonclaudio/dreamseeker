import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';

type PremiumBannerProps = {
  onPress: () => void;
};

export function PremiumBanner({ onPress }: PremiumBannerProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
      accessibilityRole="button"
      accessibilityLabel="Upgrade to react and connect"
    >
      <View
        style={[
          styles.banner,
          { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
        ]}
      >
        <IconSymbol
          name="sparkles"
          size={IconSize.lg}
          color={colors.primary}
        />
        <ThemedText style={styles.text} color={colors.primary}>
          Upgrade to react and connect
        </ThemedText>
        <IconSymbol
          name="chevron.right"
          size={IconSize.sm}
          color={colors.primary}
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
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  text: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
