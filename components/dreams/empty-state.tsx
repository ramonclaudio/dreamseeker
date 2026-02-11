import { View } from "react-native";
import { router } from "expo-router";

import { GradientButton } from "@/components/ui/gradient-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { type ColorPalette } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";

// ── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({
  colors,
  canCreateDream = true,
  onUpgrade,
}: {
  colors: ColorPalette;
  canCreateDream?: boolean;
  onUpgrade?: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 100,
        gap: Spacing.md,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: `${colors.primary}12`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: Spacing.sm,
        }}
        accessible={false}
      >
        <IconSymbol name="sparkles" size={IconSize["4xl"]} color={colors.primary} />
      </View>
      <ThemedText
        style={{
          fontSize: FontSize["5xl"],
          fontWeight: "700",
          textAlign: "center",
          letterSpacing: -0.5,
        }}
        color={colors.foreground}
      >
        What are you building?
      </ThemedText>
      <ThemedText
        style={{
          fontSize: FontSize.xl,
          textAlign: "center",
          lineHeight: 24,
          maxWidth: 260,
        }}
        color={colors.mutedForeground}
      >
        Big dreams need small steps. Let&apos;s break it down.
      </ThemedText>
      <GradientButton
        label="Start Your First Dream"
        onPress={() => {
          if (!canCreateDream && onUpgrade) {
            onUpgrade();
            return;
          }
          router.push("/(app)/create-dream/");
        }}
        accessibilityHint="Opens dream creation flow"
        icon={<IconSymbol name="plus" size={IconSize.lg} color={colors.onColor} weight="bold" />}
        style={{ marginTop: Spacing.lg }}
      />
    </View>
  );
}
