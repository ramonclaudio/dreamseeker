import { Pressable, View } from "react-native";
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Spacing, TouchTarget, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import type { ColorPalette } from "@/constants/theme";

export function ProfileField({
  label,
  value,
  onPress,
  colors,
}: {
  label: string;
  value: string;
  onPress: () => void;
  colors: ColorPalette;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: Spacing.lg,
          minHeight: TouchTarget.min,
        },
        { opacity: pressed ? Opacity.pressed : 1 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${label}`}
      accessibilityValue={{ text: value || "Not set" }}
      accessibilityHint={`Double tap to edit your ${label.toLowerCase()}`}
    >
      <View style={{ flex: 1, gap: Spacing.xs }}>
        <ThemedText
          style={{ fontSize: FontSize.sm, fontWeight: "500", textTransform: "uppercase" }}
          color={colors.mutedForeground}
        >
          {label}
        </ThemedText>
        <ThemedText
          selectable
          style={{ fontSize: FontSize.xl }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value || "Not set"}
        </ThemedText>
      </View>
      <IconSymbol name="pencil" size={IconSize.lg} color={colors.mutedForeground} />
    </Pressable>
  );
}
