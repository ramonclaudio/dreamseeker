import { View } from "react-native";
import type { Doc } from "@/convex/_generated/dataModel";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import type { ColorPalette } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";

export function DreamHeader({
  dream,
  categoryColor,
  colors,
}: {
  dream: Doc<"dreams">;
  categoryColor: string;
  colors: ColorPalette;
}) {
  return (
    <MaterialCard
      style={{
        padding: Spacing.xl,
        marginBottom: Spacing.md,
        marginTop: Spacing.xl,
        backgroundColor: `${categoryColor}08`,
        borderLeftWidth: 5,
        borderLeftColor: categoryColor,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: Spacing.md,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: `${categoryColor}20`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconSymbol name="sparkles" size={IconSize["3xl"]} color={categoryColor} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText variant="title">{dream.title}</ThemedText>
          {dream.whyItMatters && (
            <ThemedText color={colors.mutedForeground} style={{ marginTop: Spacing.xs }}>
              {dream.whyItMatters}
            </ThemedText>
          )}
          {dream.targetDate && (
            <ThemedText
              style={{ fontSize: FontSize.sm, marginTop: Spacing.sm }}
              color={colors.mutedForeground}
            >
              Target:{" "}
              {new Date(dream.targetDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </ThemedText>
          )}
        </View>
      </View>
    </MaterialCard>
  );
}
