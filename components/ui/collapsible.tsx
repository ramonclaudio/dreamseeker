import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSize, Spacing, TouchTarget } from '@/constants/layout';
import { Duration, Opacity } from '@/constants/ui';
import { useColors } from '@/hooks/use-color-scheme';
import { useAccessibilitySettings } from '@/hooks/use-accessibility-settings';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = useColors();
  const { reduceMotion } = useAccessibilitySettings();

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isOpen ? '90deg' : '0deg', { duration: reduceMotion ? 0 : Duration.normal }) }],
  }));

  return (
    <View style={{ backgroundColor: colors.background }}>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, minHeight: TouchTarget.min, paddingVertical: Spacing.sm }}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={Opacity.active}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: isOpen }}
        accessibilityHint={isOpen ? 'Double tap to collapse' : 'Double tap to expand'}>
        <Animated.View style={chevronStyle}>
          <IconSymbol
            name="chevron.right"
            size={IconSize.lg}
            weight="medium"
            color={colors.icon}
          />
        </Animated.View>
        <ThemedText variant="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <View style={{ marginTop: Spacing.xs, marginLeft: Spacing['2xl'], backgroundColor: colors.background }}>{children}</View>}
    </View>
  );
}
