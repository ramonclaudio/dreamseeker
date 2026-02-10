import { View } from "react-native";
import { GradientProgressBar } from "@/components/ui/gradient-progress-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import type { ColorPalette } from "@/constants/theme";

const LEVEL_CARD_COLORS = {
  light: { bg: "#FFE0D0", text: "#2D2019", sub: "#5A4B3D" },
  dark: { bg: "#3D2820", text: "#F5EDE6", sub: "#C4B5A5" },
} as const;

export function LevelProgressCard({
  currentLevel,
  totalXp,
  xpProgress,
  colors,
  scheme,
}: {
  currentLevel: { level: number; title: string };
  totalXp: number;
  xpProgress: { current: number; needed: number; progress: number };
  colors: ColorPalette;
  scheme: "light" | "dark";
}) {
  const c = LEVEL_CARD_COLORS[scheme];

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
        accessibilityRole="header"
      >
        Your Level
      </ThemedText>
      <View style={{ backgroundColor: c.bg, borderRadius: Radius["2xl"], padding: Spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: Spacing.md,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ThemedText
                style={{ fontSize: FontSize["3xl"], fontWeight: "700" }}
                color={colors.onColor}
              >
                {currentLevel.level}
              </ThemedText>
            </View>
            <View>
              <ThemedText style={{ fontSize: FontSize.xl, fontWeight: "600" }} color={c.text}>
                {currentLevel.title}
              </ThemedText>
              <ThemedText style={{ fontSize: FontSize.sm }} color={c.sub}>
                {totalXp} XP total
              </ThemedText>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <IconSymbol name="bolt.fill" size={IconSize.xl} color={colors.gold} />
            <ThemedText style={{ fontSize: FontSize.sm }} color={c.sub}>
              {xpProgress.needed > 0 ? `${xpProgress.needed - xpProgress.current} to next` : "Max level!"}
            </ThemedText>
          </View>
        </View>

        {xpProgress.needed > 0 && (
          <View
            accessible={true}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: xpProgress.needed,
              now: xpProgress.current,
              text: `${Math.round(xpProgress.progress * 100)}% to next level`,
            }}
          >
            <GradientProgressBar progress={xpProgress.progress} />
          </View>
        )}
      </View>
    </View>
  );
}
