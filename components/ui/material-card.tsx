import { useState, useEffect } from "react";
import { View, type ViewProps, AccessibilityInfo, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

import { Radius } from "@/constants/theme";
import { Material, type MaterialLevel } from "@/constants/ui";
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

const baseCardStyle = {
  borderRadius: Radius.lg,
  borderCurve: "continuous" as const,
  overflow: "hidden" as const,
};

type MaterialCardProps = ViewProps & {
  /** Material blur intensity level. Default: 'regular' */
  material?: MaterialLevel;
};

/**
 * MaterialCard - Standard material card for CONTENT layer (HIG compliant).
 *
 * Uses BlurView with standard material intensities (ultraThin, thin, regular, thick, ultraThick).
 * For controls/navigation, use GlassControl instead (Liquid Glass).
 *
 * HIG: "Use standard materials and effects to convey a sense of structure in the content beneath Liquid Glass."
 */
export function MaterialCard({
  children,
  style,
  material = "regular",
  ...props
}: MaterialCardProps) {
  const colors = useColors();
  const reduceTransparency = useReduceTransparency();

  const cardStyle = [
    baseCardStyle,
    { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    style,
  ];

  // Fallback to solid View when:
  // - Reduce Transparency is enabled (accessibility)
  // - Android (BlurView has issues)
  const shouldUseSolidView = reduceTransparency || process.env.EXPO_OS === "android";

  if (shouldUseSolidView) {
    return (
      <View style={cardStyle} {...props}>
        {children}
      </View>
    );
  }

  // iOS: Use BlurView as absolute backdrop, children flow naturally
  const intensity = Material[material];

  return (
    <View style={[baseCardStyle, { borderWidth: 1, borderColor: colors.border }, style]} {...props}>
      <BlurView
        intensity={intensity}
        tint="systemMaterial"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.card + "80" }]}
      />
      {children}
    </View>
  );
}
