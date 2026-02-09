import { View } from "react-native";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import type { ColorPalette } from "@/constants/theme";

export function StreakCards({
  currentStreak,
  longestStreak,
  colors,
}: {
  currentStreak: number;
  longestStreak: number;
  colors: ColorPalette;
}) {
  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <ThemedText
        style={{
          fontSize: FontSize.base,
          fontWeight: "600",
          textTransform: "uppercase",
          marginBottom: Spacing.sm,
          marginLeft: Spacing.xs,
        }}
        color={colors.mutedForeground}
      >
        Streaks
      </ThemedText>
      <View style={{ flexDirection: "row", gap: Spacing.md }}>
        <MaterialCard
          style={{
            flex: 1,
            padding: Spacing.lg,
            alignItems: "center",
            backgroundColor: colors.surfaceTinted,
            borderColor: colors.borderAccent,
            borderWidth: 1,
          }}
        >
          <IconSymbol name="flame.fill" size={IconSize["3xl"]} color={colors.primary} />
          <ThemedText
            style={{ fontSize: FontSize["3xl"], fontWeight: "700", marginTop: Spacing.sm }}
          >
            {currentStreak}
          </ThemedText>
          <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
            Current Streak
          </ThemedText>
        </MaterialCard>

        <MaterialCard
          style={{
            flex: 1,
            padding: Spacing.lg,
            alignItems: "center",
            backgroundColor: colors.surfaceTinted,
            borderColor: colors.borderAccent,
            borderWidth: 1,
          }}
        >
          <IconSymbol name="star.fill" size={IconSize["3xl"]} color={colors.primary} />
          <ThemedText
            style={{ fontSize: FontSize["3xl"], fontWeight: "700", marginTop: Spacing.sm }}
          >
            {longestStreak}
          </ThemedText>
          <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
            Longest Streak
          </ThemedText>
        </MaterialCard>
      </View>
    </View>
  );
}
