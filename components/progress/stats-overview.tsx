import { View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
const STAT_COLORS = {
  dreams: { light: "#FFF5E0", dark: "#2E2A18", icon: "#EDAF4A" },
  actions: { light: "#E4F0DF", dark: "#1E2E1A", icon: "#5A9A52" },
  xp: { light: "#FFE0D0", dark: "#3D2820", icon: "#E8936E" },
} as const;

export function StatsOverview({
  dreamsCompleted,
  actionsCompleted,
  totalXp,
  scheme,
}: {
  dreamsCompleted: number;
  actionsCompleted: number;
  totalXp: number;
  scheme: "light" | "dark";
}) {
  const stats = [
    {
      value: dreamsCompleted,
      label: "Dreams",
      icon: "trophy.fill" as const,
      palette: STAT_COLORS.dreams,
    },
    {
      value: actionsCompleted,
      label: "Actions",
      icon: "checkmark.circle.fill" as const,
      palette: STAT_COLORS.actions,
    },
    {
      value: totalXp >= 1000 ? `${(totalXp / 1000).toFixed(1)}k` : totalXp,
      label: "Total XP",
      icon: "bolt.fill" as const,
      palette: STAT_COLORS.xp,
    },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        gap: Spacing.md,
        marginBottom: Spacing.lg,
      }}
    >
      {stats.map((stat) => {
        const bg = scheme === "dark" ? stat.palette.dark : stat.palette.light;
        const textColor = scheme === "dark" ? "#F5EDE6" : "#2D2019";
        const subColor = scheme === "dark" ? "#9A8A7A" : "#8A7B6D";

        return (
          <View
            key={stat.label}
            style={{
              flex: 1,
              backgroundColor: bg,
              borderRadius: Radius["2xl"],
              padding: Spacing.md,
              alignItems: "center",
            }}
            accessible={true}
            accessibilityLabel={`${stat.value} ${stat.label}`}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: `${stat.palette.icon}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
              importantForAccessibility="no-hide-descendants"
            >
              <IconSymbol name={stat.icon} size={IconSize.xl} color={stat.palette.icon} />
            </View>
            <ThemedText
              style={{ fontSize: FontSize["2xl"], fontWeight: "700", marginTop: Spacing.xs }}
              color={textColor}
              importantForAccessibility="no"
            >
              {stat.value}
            </ThemedText>
            <ThemedText style={{ fontSize: FontSize.xs }} color={subColor} importantForAccessibility="no">
              {stat.label}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}
