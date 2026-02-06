import { View, type ViewProps } from "react-native";

import { Radius } from "@/constants/theme";
import { useColors } from "@/hooks/use-color-scheme";

const baseCardStyle = {
  borderRadius: Radius.lg,
  borderCurve: "continuous" as const,
  overflow: "hidden" as const,
};

type MaterialCardProps = ViewProps;

/**
 * MaterialCard - Solid card for CONTENT layer (HIG compliant).
 * Uses solid View with card background color. No BlurView (first-render bug).
 */
export function MaterialCard({
  children,
  style,
  ...props
}: MaterialCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        baseCardStyle,
        { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
