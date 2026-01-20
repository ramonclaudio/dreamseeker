import { useState, useEffect } from 'react';
import { View, type ViewProps, Platform, AccessibilityInfo } from 'react-native';

import { Radius } from '@/constants/theme';
import { useColors } from '@/hooks/use-color-scheme';

function useReduceTransparency(): boolean {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);
    return () => subscription.remove();
  }, []);

  return reduceTransparency;
}

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

const baseCardStyle = { borderRadius: Radius.lg, borderCurve: 'continuous' as const, overflow: 'hidden' as const };

type GlassCardProps = ViewProps & { glassStyle?: 'regular' | 'clear'; isInteractive?: boolean };

export function GlassCard({ children, style, glassStyle = 'regular', isInteractive, ...props }: GlassCardProps) {
  const colors = useColors();
  const reduceTransparency = useReduceTransparency();
  const cardStyle = [baseCardStyle, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, style];

  // Fall back to solid View when Reduce Transparency is enabled (HIG accessibility)
  const glass = getGlassModule();
  if (glass && canUseGlass() && !reduceTransparency) {
    const { GlassView } = glass;
    return <GlassView style={cardStyle} glassEffectStyle={glassStyle} isInteractive={isInteractive} {...props}>{children}</GlassView>;
  }

  return <View style={cardStyle} {...props}>{children}</View>;
}

type GlassContainerProps = ViewProps & { spacing?: number };

export function GlassCardContainer({ children, style, spacing = 10, ...props }: GlassContainerProps) {
  const colors = useColors();
  const reduceTransparency = useReduceTransparency();
  const cardStyle = [baseCardStyle, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, style];

  // Fall back to solid View when Reduce Transparency is enabled (HIG accessibility)
  const glass = getGlassModule();
  if (glass && canUseGlass() && !reduceTransparency) {
    const { GlassContainer } = glass;
    return <GlassContainer spacing={spacing} style={cardStyle} {...props}>{children}</GlassContainer>;
  }

  return <View style={[...cardStyle, { gap: spacing }]} {...props}>{children}</View>;
}
