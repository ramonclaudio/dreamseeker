import { View, type ViewProps } from "react-native";

import { Radius } from "@/constants/theme";
import { useColors } from "@/hooks/use-color-scheme";
import { useAccessibilitySettings } from "@/hooks/use-accessibility-settings";

let _glassModule: typeof import("expo-glass-effect") | null = null;
function getGlassModule() {
  if (_glassModule === null) {
    try {
      // Dynamic require needed for conditional iOS-only loading
      _glassModule = require("expo-glass-effect"); // eslint-disable-line @typescript-eslint/no-require-imports
    } catch {
      _glassModule = null;
    }
  }
  return _glassModule;
}

function canUseGlass(): boolean {
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
  const { reduceTransparency } = useAccessibilitySettings();

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

