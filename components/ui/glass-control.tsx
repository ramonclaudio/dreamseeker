import { useState, useEffect } from "react";
import { View, type ViewProps, AccessibilityInfo } from "react-native";

import { Spacing } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { useColors } from "@/hooks/use-color-scheme";

/**
 * Hook to detect iOS Reduce Transparency accessibility setting.
 * Falls back to solid views when enabled (HIG compliance).
 */
function useReduceTransparency(): boolean {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    if (process.env.EXPO_OS !== "ios") return;

    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency,
    );
    return () => subscription.remove();
  }, []);

  return reduceTransparency;
}

let _glassModule: typeof import("expo-glass-effect") | null = null;
function getGlassModule() {
  if (_glassModule === null && process.env.EXPO_OS === "ios") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    try {
      _glassModule = require("expo-glass-effect");
    } catch {
      _glassModule = null;
    }
  }
  return _glassModule;
}

export function canUseGlass(): boolean {
  const glass = getGlassModule();
  if (!glass) return false;
  try {
    return glass.isLiquidGlassAvailable() && glass.isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

const baseCardStyle = {
  borderRadius: Radius.lg,
  borderCurve: "continuous" as const,
  overflow: "hidden" as const,
};

type GlassControlProps = ViewProps & {
  /** Glass style variant. 'clear' only for visually rich backgrounds. Default: 'regular' */
  glassStyle?: "regular" | "clear";
  /** Enable touch/pointer interaction effects (HIG recommended for custom controls) */
  isInteractive?: boolean;
  /** Tint color for primary action emphasis (HIG: use sparingly for prominent buttons) */
  tint?: string;
};

/**
 * GlassControl - Liquid Glass for CONTROLS and NAVIGATION only (HIG compliant).
 *
 * HIG: "Don't use Liquid Glass in the content layer. Liquid Glass works best when it
 * provides a clear distinction between interactive elements and content."
 *
 * HIG: "To emphasize primary actions, apply color to the background rather than to
 * symbols or text. For example, the system applies the app accent color to the
 * background in prominent buttons — such as the Done button."
 *
 * Use for: Tab bars, toolbars, buttons, navigation elements
 * For content cards: Use MaterialCard instead
 */
export function GlassControl({
  children,
  style,
  glassStyle = "regular",
  isInteractive = false,
  tint,
  ...props
}: GlassControlProps) {
  const colors = useColors();
  const reduceTransparency = useReduceTransparency();

  // Fallback style uses solid tint color or card background
  const fallbackBg = tint ?? colors.card;
  const cardStyle = [
    baseCardStyle,
    { backgroundColor: fallbackBg, borderWidth: tint ? 0 : 1, borderColor: colors.border },
    style,
  ];

  // Fall back to solid View when Reduce Transparency is enabled (HIG accessibility)
  const glass = getGlassModule();
  if (glass && canUseGlass() && !reduceTransparency) {
    const { GlassView } = glass;
    return (
      <GlassView
        style={[baseCardStyle, { borderWidth: tint ? 0 : 1, borderColor: colors.border }, style]}
        glassEffectStyle={glassStyle}
        isInteractive={isInteractive}
        tintColor={tint}
        {...props}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

type GlassContainerProps = ViewProps & {
  /** Spacing for glass effect blending (HIG: controls how shapes morph) */
  spacing?: number;
};

/**
 * GlassControlContainer - Container for multiple GlassControl elements.
 *
 * HIG: "Use GlassEffectContainer when applying Liquid Glass effects on multiple views
 * to achieve the best rendering performance. A container also allows views with
 * Liquid Glass effects to blend their shapes together."
 */
export function GlassControlContainer({
  children,
  style,
  spacing = Spacing.sm,
  ...props
}: GlassContainerProps) {
  const colors = useColors();
  const reduceTransparency = useReduceTransparency();
  const cardStyle = [
    baseCardStyle,
    { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    style,
  ];

  // Fall back to solid View when Reduce Transparency is enabled (HIG accessibility)
  const glass = getGlassModule();
  if (glass && canUseGlass() && !reduceTransparency) {
    const { GlassContainer } = glass;
    return (
      <GlassContainer spacing={spacing} style={cardStyle} {...props}>
        {children}
      </GlassContainer>
    );
  }

  return (
    <View style={[...cardStyle, { gap: spacing }]} {...props}>
      {children}
    </View>
  );
}
