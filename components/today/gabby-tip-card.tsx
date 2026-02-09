import { View } from "react-native";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import type { ColorPalette } from "@/constants/theme";

export function GabbyTipCard({
  quote,
  colors,
}: {
  quote: string;
  colors: ColorPalette;
}) {
  return (
    <MaterialCard
      variant="outlined"
      style={{
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
        backgroundColor: colors.surfaceTinted,
        borderWidth: 2,
        borderColor: colors.primary,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: Spacing.md,
          gap: Spacing.sm,
        }}
      >
        <IconSymbol
          name="sparkles"
          size={IconSize["2xl"]}
          color={colors.primary}
          weight="bold"
        />
        <ThemedText
          style={{
            fontSize: FontSize.lg,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
          color={colors.primary}
        >
          Gabby&apos;s Daily Tip
        </ThemedText>
      </View>

      <ThemedText
        style={{
          fontSize: FontSize.xl,
          lineHeight: 24,
          fontWeight: "500",
        }}
      >
        {quote}
      </ThemedText>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: Spacing.md,
          gap: Spacing.xs,
        }}
      >
        <View
          style={{
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: colors.mutedForeground,
          }}
        />
        <ThemedText
          style={{
            fontSize: FontSize.sm,
            fontWeight: "600",
          }}
          color={colors.mutedForeground}
        >
          Gabby Beckford
        </ThemedText>
      </View>
    </MaterialCard>
  );
}
