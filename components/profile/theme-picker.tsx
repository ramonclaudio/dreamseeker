import { View, Pressable } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Radius, type ColorPalette } from "@/constants/theme";
import { Spacing, TouchTarget, FontSize, IconSize } from "@/constants/layout";
import { useColorScheme, type ThemeMode } from "@/hooks/use-color-scheme";
import { haptics } from "@/lib/haptics";

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function ThemePicker({
  mode,
  onModeChange,
  colors,
}: {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  colors: ColorPalette;
}) {
  const colorScheme = useColorScheme();
  const icon = colorScheme === "dark" ? "moon.fill" : "sun.max.fill";
  return (
    <View style={{ padding: Spacing.lg, gap: Spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md }}>
        <IconSymbol name={icon} size={IconSize["2xl"]} color={colors.mutedForeground} />
        <ThemedText style={{ fontSize: FontSize.xl }}>Theme</ThemedText>
      </View>
      <View
        style={{
          flexDirection: "row",
          borderRadius: Radius.md,
          borderCurve: "continuous",
          padding: Spacing.xxs,
          backgroundColor: colors.muted,
        }}
      >
        {THEME_OPTIONS.map((option) => {
          const isSelected = mode === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                {
                  flex: 1,
                  paddingVertical: Spacing.md,
                  minHeight: TouchTarget.min,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: Radius.sm,
                  borderCurve: "continuous",
                },
                isSelected && {
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 2,
                  elevation: 2,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={() => {
                haptics.light();
                onModeChange(option.value);
              }}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label} theme`}
              accessibilityState={{ selected: isSelected }}
            >
              <ThemedText
                style={{ fontSize: FontSize.base, fontWeight: "500" }}
                color={isSelected ? colors.foreground : colors.mutedForeground}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
