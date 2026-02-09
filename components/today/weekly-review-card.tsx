import { View } from "react-native";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import type { ColorPalette } from "@/constants/theme";

type WeeklySummary = {
  actionsCompleted: number;
  journalEntries: number;
  currentStreak: number;
  xpEarned: number;
};

function getGabbyComment(actionsCompleted: number): string {
  if (actionsCompleted >= 5) {
    return "You're on fire this week, girl!";
  }
  if (actionsCompleted >= 2) {
    return "Steady progress, queen. Keep building!";
  }
  return "Fresh week, fresh start. Let's make it count!";
}

export function WeeklyReviewCard({
  summary,
  colors,
}: {
  summary: WeeklySummary;
  colors: ColorPalette;
}) {
  return (
    <MaterialCard
      variant="tinted"
      style={{
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: Spacing.lg,
          gap: Spacing.sm,
        }}
      >
        <IconSymbol
          name="checklist"
          size={IconSize["2xl"]}
          color={colors.accentBlue}
          weight="bold"
        />
        <ThemedText
          style={{
            fontSize: FontSize.lg,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
          color={colors.accentBlue}
        >
          Your Week
        </ThemedText>
      </View>

      {/* Stats Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: Spacing.lg,
          gap: Spacing.md,
        }}
      >
        {/* Actions */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <ThemedText
            style={{
              fontSize: FontSize["3xl"],
              fontWeight: "700",
            }}
            color={colors.primary}
          >
            {summary.actionsCompleted}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: FontSize.sm,
              fontWeight: "600",
              textAlign: "center",
            }}
            color={colors.mutedForeground}
          >
            {summary.actionsCompleted === 1 ? "Action" : "Actions"}
          </ThemedText>
        </View>

        {/* Journals */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <ThemedText
            style={{
              fontSize: FontSize["3xl"],
              fontWeight: "700",
            }}
            color={colors.primary}
          >
            {summary.journalEntries}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: FontSize.sm,
              fontWeight: "600",
              textAlign: "center",
            }}
            color={colors.mutedForeground}
          >
            {summary.journalEntries === 1 ? "Journal" : "Journals"}
          </ThemedText>
        </View>

        {/* Streak */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <ThemedText
            style={{
              fontSize: FontSize["3xl"],
              fontWeight: "700",
            }}
            color={colors.primary}
          >
            {summary.currentStreak}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: FontSize.sm,
              fontWeight: "600",
              textAlign: "center",
            }}
            color={colors.mutedForeground}
          >
            Day Streak
          </ThemedText>
        </View>

        {/* XP */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <ThemedText
            style={{
              fontSize: FontSize["3xl"],
              fontWeight: "700",
            }}
            color={colors.primary}
          >
            {summary.xpEarned}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: FontSize.sm,
              fontWeight: "600",
              textAlign: "center",
            }}
            color={colors.mutedForeground}
          >
            XP
          </ThemedText>
        </View>
      </View>

      {/* Gabby Comment */}
      <View
        style={{
          paddingTop: Spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.borderAccent,
        }}
      >
        <ThemedText
          style={{
            fontSize: FontSize.base,
            fontWeight: "500",
            textAlign: "center",
          }}
          color={colors.text}
        >
          {getGabbyComment(summary.actionsCompleted)}
        </ThemedText>
      </View>
    </MaterialCard>
  );
}
