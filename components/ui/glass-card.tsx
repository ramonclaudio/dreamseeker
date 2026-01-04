import { Platform, StyleSheet, View, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

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
  /** Blur intensity for fallback (0-100, default 50) */
  blurIntensity?: number;
  /** Disable blur fallback and use solid color instead */
  disableBlur?: boolean;
};

/**
 * A card component with glass/blur effects.
 *
 * Rendering hierarchy:
 * - iOS 26+: Liquid glass via expo-glass-effect
 * - iOS < 26, Web: BlurView from expo-blur
 * - Android: Semi-transparent background (BlurView without target)
 */
export function GlassCard({
  children,
  style,
  glassStyle = 'regular',
  isInteractive,
  blurIntensity = 50,
  disableBlur = false,
  ...props
}: GlassCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const tint = colorScheme === 'dark' ? 'dark' : 'light';

  // iOS 26+ liquid glass
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

  // BlurView fallback for iOS < 26 and web
  // Android gets semi-transparent background (blur requires BlurTargetView setup)
  if (!disableBlur && Platform.OS !== 'android') {
    return (
      <BlurView
        intensity={blurIntensity}
        tint={tint}
        style={[styles.card, style]}
        {...props}>
        {children}
      </BlurView>
    );
  }

  // Solid fallback for Android or when blur is disabled
  return (
    <View style={[styles.card, styles.solidCard, { backgroundColor: colors.card }, style]} {...props}>
      {children}
    </View>
  );
}

type GlassContainerProps = ViewProps & {
  /** Spacing between glass elements in the container */
  spacing?: number;
  /** Blur intensity for fallback (0-100, default 50) */
  blurIntensity?: number;
};

/**
 * Container for combining multiple glass elements with a unified effect.
 *
 * Rendering hierarchy:
 * - iOS 26+: GlassContainer from expo-glass-effect
 * - iOS < 26, Web: BlurView from expo-blur
 * - Android: Semi-transparent background
 */
export function GlassCardContainer({
  children,
  style,
  spacing = 10,
  blurIntensity = 50,
  ...props
}: GlassContainerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const tint = colorScheme === 'dark' ? 'dark' : 'light';

  // iOS 26+ liquid glass container
  const glass = getGlassModule();
  if (glass && canUseGlass()) {
    const { GlassContainer } = glass;
    return (
      <GlassContainer spacing={spacing} style={style} {...props}>
        {children}
      </GlassContainer>
    );
  }

  // BlurView fallback for iOS < 26 and web
  if (Platform.OS !== 'android') {
    return (
      <BlurView
        intensity={blurIntensity}
        tint={tint}
        style={[styles.card, { gap: spacing }, style]}
        {...props}>
        {children}
      </BlurView>
    );
  }

  // Solid fallback for Android
  return (
    <View
      style={[styles.card, styles.solidCard, { backgroundColor: colors.card, gap: spacing }, style]}
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
  solidCard: {
    // Slight transparency for Android to hint at glass aesthetic
    opacity: 0.95,
  },
});
