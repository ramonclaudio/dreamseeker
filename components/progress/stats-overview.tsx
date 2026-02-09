import { View } from "react-native";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import type { ColorPalette } from "@/constants/theme";

export function StatsOverview({
  dreamsCompleted,
  actionsCompleted,
  colors,
}: {
  dreamsCompleted: number;
  actionsCompleted: number;
  colors: ColorPalette;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: Spacing.md,
        marginBottom: Spacing.lg,
      }}
    >
      <MaterialCard
        variant="elevated"
        style={{
          flex: 1,
          padding: Spacing.lg,
          alignItems: "center",
          backgroundColor: colors.surfaceTinted,
        }}
        accessible={true}
        accessibilityLabel={`${dreamsCompleted} Dreams Achieved`}
      >
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: `${colors.gold}18`,
          alignItems: 'center',
          justifyContent: 'center',
        }} importantForAccessibility="no-hide-descendants">
          <IconSymbol name="trophy.fill" size={IconSize["2xl"]} color={colors.gold} />
        </View>
        <ThemedText
          style={{ fontSize: FontSize["3xl"], fontWeight: "700", marginTop: Spacing.sm }}
          importantForAccessibility="no"
        >
          {dreamsCompleted}
        </ThemedText>
        <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground} importantForAccessibility="no">
          Dreams Achieved
        </ThemedText>
      </MaterialCard>

      <MaterialCard
        variant="elevated"
        style={{
          flex: 1,
          padding: Spacing.lg,
          alignItems: "center",
          backgroundColor: colors.surfaceTinted,
        }}
        accessible={true}
        accessibilityLabel={`${actionsCompleted} Actions Done`}
      >
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: `${colors.success}18`,
          alignItems: 'center',
          justifyContent: 'center',
        }} importantForAccessibility="no-hide-descendants">
          <IconSymbol name="checkmark.circle.fill" size={IconSize["2xl"]} color={colors.success} />
        </View>
        <ThemedText
          style={{ fontSize: FontSize["3xl"], fontWeight: "700", marginTop: Spacing.sm }}
          importantForAccessibility="no"
        >
          {actionsCompleted}
        </ThemedText>
        <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground} importantForAccessibility="no">
          Actions Done
        </ThemedText>
      </MaterialCard>
    </View>
  );
}
