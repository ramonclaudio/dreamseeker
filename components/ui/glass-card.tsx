import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Lazy import to avoid native module errors during bundling
let _glassModule: typeof import('expo-glass-effect') | null = null;
function getGlassModule() {
  if (_glassModule === null && Platform.OS === 'ios') {
    try {
      _glassModule = require('expo-glass-effect');
    } catch {
      _glassModule = null;
    }
  }
  return _glassModule;
}

/** Check if liquid glass effect is available on the current device */
export function canUseGlass(): boolean {
  const glass = getGlassModule();
  if (!glass) return false;
  try {
    return glass.isLiquidGlassAvailable() && glass.isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

type GlassCardProps = ViewProps & {
  /** Glass effect style - 'regular' or 'clear' (iOS 26+ only) */
  glassStyle?: 'regular' | 'clear';
  /** Enable interactive glass behavior (iOS 26+ only) */
  isInteractive?: boolean;
};

/**
 * A card component with glass/blur effects.
 *
 * - iOS 26+: Liquid glass via expo-glass-effect
 * - All other platforms: Solid card with border
 */
export function GlassCard({
  children,
  style,
  glassStyle = 'regular',
  isInteractive,
  ...props
}: GlassCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // iOS 26+ liquid glass
  const glass = getGlassModule();
  if (glass && canUseGlass()) {
    const { GlassView } = glass;
    return (
      <GlassView
        style={[
          styles.card,
          { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
          style,
        ]}
        glassEffectStyle={glassStyle}
        isInteractive={isInteractive}
        {...props}>
        {children}
      </GlassView>
    );
  }

  // Solid card fallback
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

type GlassContainerProps = ViewProps & {
  /** Spacing between glass elements in the container */
  spacing?: number;
};

/**
 * Container for combining multiple glass elements with a unified effect.
 *
 * - iOS 26+: GlassContainer from expo-glass-effect
 * - All other platforms: Solid card with border
 */
export function GlassCardContainer({
  children,
  style,
  spacing = 10,
  ...props
}: GlassContainerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // iOS 26+ liquid glass container
  const glass = getGlassModule();
  if (glass && canUseGlass()) {
    const { GlassContainer } = glass;
    return (
      <GlassContainer
        spacing={spacing}
        style={[
          styles.card,
          { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
          style,
        ]}
        {...props}>
        {children}
      </GlassContainer>
    );
  }

  // Solid card fallback
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: spacing },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
});
