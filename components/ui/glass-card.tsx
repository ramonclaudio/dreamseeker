import { StyleSheet, View, type ViewProps } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

let _glassModule: typeof import('expo-glass-effect') | null = null;
function getGlassModule() {
  if (_glassModule === null && process.env.EXPO_OS === 'ios') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    try { _glassModule = require('expo-glass-effect'); } catch { _glassModule = null; }
  }
  return _glassModule;
}

export function canUseGlass(): boolean {
  const glass = getGlassModule();
  if (!glass) return false;
  try { return glass.isLiquidGlassAvailable() && glass.isGlassEffectAPIAvailable(); } catch { return false; }
}

type GlassCardProps = ViewProps & { glassStyle?: 'regular' | 'clear'; isInteractive?: boolean };

export function GlassCard({ children, style, glassStyle = 'regular', isInteractive, ...props }: GlassCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const cardStyle = [styles.card, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, style];

  const glass = getGlassModule();
  if (glass && canUseGlass()) {
    const { GlassView } = glass;
    return <GlassView style={cardStyle} glassEffectStyle={glassStyle} isInteractive={isInteractive} {...props}>{children}</GlassView>;
  }

  return <View style={cardStyle} {...props}>{children}</View>;
}

type GlassContainerProps = ViewProps & { spacing?: number };

export function GlassCardContainer({ children, style, spacing = 10, ...props }: GlassContainerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const cardStyle = [styles.card, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, style];

  const glass = getGlassModule();
  if (glass && canUseGlass()) {
    const { GlassContainer } = glass;
    return <GlassContainer spacing={spacing} style={cardStyle} {...props}>{children}</GlassContainer>;
  }

  return <View style={[...cardStyle, { gap: spacing }]} {...props}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, overflow: 'hidden' },
});
