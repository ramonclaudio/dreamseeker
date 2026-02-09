import { View } from "react-native";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Radius } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { LEVELS } from "@/constants/dreams";
import type { ColorPalette } from "@/constants/theme";

export function LevelJourney({
  totalXp,
  currentLevel,
  colors,
}: {
  totalXp: number;
  currentLevel: number;
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
        Level Journey
      </ThemedText>
      <MaterialCard style={{ padding: Spacing.lg }}>
        {LEVELS.map((level) => {
          const isUnlocked = totalXp >= level.xp;
          const isCurrent = currentLevel === level.level;
          return (
            <View
              key={level.level}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacing.md,
                paddingVertical: Spacing.sm,
                opacity: isUnlocked ? 1 : 0.4,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isCurrent ? colors.accentBlue : colors.secondary,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: isCurrent ? 0 : 1,
                  borderColor: colors.border,
                }}
              >
                {isUnlocked ? (
                  <ThemedText
                    style={{ fontSize: FontSize.base, fontWeight: "600" }}
                    color={isCurrent ? colors.onColor : colors.foreground}
                  >
                    {level.level}
                  </ThemedText>
                ) : (
                  <IconSymbol name="lock.fill" size={IconSize.sm} color={colors.mutedForeground} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: FontSize.base, fontWeight: isCurrent ? "600" : "400" }}>
                  {level.title}
                </ThemedText>
                <ThemedText style={{ fontSize: FontSize.xs }} color={colors.mutedForeground}>
                  {level.xp} XP
                </ThemedText>
              </View>
              {isCurrent && (
                <View
                  style={{
                    backgroundColor: colors.accentBlue,
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: Spacing.xxs,
                    borderRadius: Radius.sm,
                  }}
                >
                  <ThemedText
                    style={{ fontSize: FontSize.xs, fontWeight: "600" }}
                    color={colors.onColor}
                  >
                    Current
                  </ThemedText>
                </View>
              )}
            </View>
          );
        })}
      </MaterialCard>
    </View>
  );
}
