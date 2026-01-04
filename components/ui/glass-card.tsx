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
 * A card component that uses iOS 26+ liquid glass when available.
 * Falls back to a standard card with theme colors on other platforms.
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
  const glass = getGlassModule();

  if (glass && canUseGlass()) {
    const { GlassView } = glass;
    return (
      <GlassView
        style={[styles.card, style]}
        glassEffectStyle={glassStyle}
        isInteractive={isInteractive}
        {...props}>
        {children}
      </GlassView>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card }, style]} {...props}>
      {children}
    </View>
  );
}

type GlassContainerProps = ViewProps & {
  /** Spacing between glass elements in the container */
  spacing?: number;
};

/**
 * Container for combining multiple GlassCard elements with a unified glass effect.
 * Falls back to a regular View on non-iOS 26+ platforms.
 */
export function GlassCardContainer({ children, style, spacing = 10, ...props }: GlassContainerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const glass = getGlassModule();

  if (glass && canUseGlass()) {
    const { GlassContainer } = glass;
    return (
      <GlassContainer spacing={spacing} style={style} {...props}>
        {children}
      </GlassContainer>
    );
  }

  return (
    <View style={[{ backgroundColor: colors.card, gap: spacing }, style]} {...props}>
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
