import { View, Pressable } from "react-native";
import { router } from "expo-router";
import type { Doc } from "@/convex/_generated/dataModel";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { getCategoryConfig } from "@/constants/dreams";
import { haptics } from "@/lib/haptics";
import type { ColorPalette } from "@/constants/theme";

export function DreamsList({
  dreams,
  title,
  isArchived = false,
  colors,
}: {
  dreams: Doc<"dreams">[];
  title: string;
  isArchived?: boolean;
  colors: ColorPalette;
}) {
  if (!dreams || dreams.length === 0) return null;

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
        {title} ({dreams.length})
      </ThemedText>
      {dreams.map((dream) => {
        const categoryConfig = getCategoryConfig(dream);
        return (
          <Pressable
            key={dream._id}
            onPress={() => {
              haptics.selection();
              router.push(`/(app)/dream/${dream._id}`);
            }}
            style={({ pressed }) => ({
              opacity: pressed ? Opacity.pressed : 1,
              marginBottom: Spacing.sm,
            })}
          >
            <MaterialCard
              style={{
                padding: Spacing.lg,
                borderLeftWidth: 4,
                borderLeftColor: isArchived
                  ? categoryConfig?.color ?? colors.mutedForeground
                  : categoryConfig?.color ?? colors.success,
                opacity: isArchived ? 0.7 : 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
                <IconSymbol
                  name={isArchived ? "trash.fill" : "checkmark.circle.fill"}
                  size={IconSize.xl}
                  color={isArchived ? colors.mutedForeground : colors.success}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
                    {dream.title}
                  </ThemedText>
                  {dream.completedAt && !isArchived ? (
                    <ThemedText style={{ fontSize: FontSize.xs }} color={colors.mutedForeground}>
                      Completed {new Date(dream.completedAt).toLocaleDateString()}
                    </ThemedText>
                  ) : (
                    <ThemedText style={{ fontSize: FontSize.xs }} color={colors.mutedForeground}>
                      Tap to bring it back
                    </ThemedText>
                  )}
                </View>
                <IconSymbol
                  name="chevron.right"
                  size={IconSize.lg}
                  color={colors.mutedForeground}
                />
              </View>
            </MaterialCard>
          </Pressable>
        );
      })}
    </View>
  );
}
