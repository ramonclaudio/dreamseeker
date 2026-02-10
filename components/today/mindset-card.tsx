import { View } from "react-native";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import type { ColorPalette } from "@/constants/theme";

export function MindsetCard({
  quote,
  author,
  colors,
}: {
  quote: string;
  author: string;
  colors: ColorPalette;
}) {
  return (
    <MaterialCard
      style={{
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
        backgroundColor: colors.secondary,
        borderLeftWidth: 4,
        borderLeftColor: colors.accent,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: Spacing.md,
        }}
      >
        <IconSymbol
          name="quote.bubble.fill"
          size={IconSize["2xl"]}
          color={colors.mutedForeground}
        />
        <View style={{ flex: 1 }}>
          <ThemedText
            style={{
              fontSize: FontSize["2xl"],
              fontStyle: "italic",
              lineHeight: 26,
            }}
          >
            {`"${quote}"`}
          </ThemedText>
          <ThemedText
            style={{ fontSize: FontSize.base, marginTop: Spacing.sm }}
            color={colors.mutedForeground}
          >
            — {author}
          </ThemedText>
        </View>
      </View>
    </MaterialCard>
  );
}
