import { View, Pressable } from "react-native";
import { router } from "expo-router";

import type { Doc } from "@/convex/_generated/dataModel";
import { MaterialCard } from "@/components/ui/material-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Radius, type ColorPalette } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { haptics } from "@/lib/haptics";

export function ActiveDreamActions({
  dream,
  isCompleting,
  onComplete,
  colors,
}: {
  dream: Doc<"dreams">;
  isCompleting: boolean;
  onComplete: () => void;
  colors: ColorPalette;
}) {
  return (
    <>
      <Pressable
        onPress={() => {
          haptics.light();
          router.push({
            pathname: "/(app)/focus-timer" as const,
            params: { dreamId: dream._id },
          } as never);
        }}
        style={({ pressed }) => ({
          marginTop: Spacing.xl,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: Spacing.sm,
          paddingVertical: Spacing.lg,
          borderRadius: Radius.xl,
          borderCurve: "continuous",
          borderWidth: 2,
          borderColor: colors.primary,
          opacity: pressed ? Opacity.pressed : 1,
        })}
        accessibilityRole="button"
      >
        <IconSymbol name="timer" size={IconSize["2xl"]} color={colors.primary} />
        <ThemedText
          style={{ fontSize: FontSize.xl, fontWeight: "600" }}
          color={colors.primary}
        >
          Focus on this dream
        </ThemedText>
      </Pressable>

      <GradientButton
        onPress={onComplete}
        label={isCompleting ? "Completing..." : "Mark Dream Complete"}
        icon={<IconSymbol name="trophy.fill" size={IconSize["2xl"]} color={colors.onColor} />}
        disabled={isCompleting}
        style={{ marginTop: Spacing.md }}
      />
    </>
  );
}

export function CompletedDreamActions({
  dream,
  isCompleting,
  onReopen,
  colors,
}: {
  dream: Doc<"dreams">;
  isCompleting: boolean;
  onReopen: () => void;
  colors: ColorPalette;
}) {
  return (
    <View style={{ marginTop: Spacing.xl, gap: Spacing.md }}>
      <MaterialCard
        style={{
          backgroundColor: colors.success,
          padding: Spacing.lg,
          alignItems: "center",
          borderRadius: Radius.lg,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
          <IconSymbol name="checkmark.circle.fill" size={IconSize["2xl"]} color={colors.onColor} />
          <ThemedText
            style={{ fontSize: FontSize.lg, fontWeight: "600" }}
            color={colors.onColor}
          >
            Dream Completed!
          </ThemedText>
        </View>
        {dream.completedAt && (
          <ThemedText
            style={{ fontSize: FontSize.sm, marginTop: Spacing.xs }}
            color={colors.onColor}
          >
            {new Date(dream.completedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </ThemedText>
        )}
      </MaterialCard>
      <Pressable
        onPress={() => {
          haptics.light();
          onReopen();
        }}
        disabled={isCompleting}
        style={({ pressed }) => ({
          opacity: pressed || isCompleting ? Opacity.pressed : 1,
        })}
      >
        <MaterialCard
          style={{
            padding: Spacing.lg,
            alignItems: "center",
            borderRadius: Radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <ThemedText
            style={{ fontSize: FontSize.base, fontWeight: "600" }}
            color={colors.mutedForeground}
          >
            {isCompleting ? "Reopening..." : "Reopen Dream"}
          </ThemedText>
          <ThemedText
            style={{ fontSize: FontSize.sm, marginTop: Spacing.xxs }}
            color={colors.mutedForeground}
          >
            This will deduct 100 XP
          </ThemedText>
        </MaterialCard>
      </Pressable>
    </View>
  );
}

export function ArchivedDreamActions({
  isCompleting,
  onRestore,
  onDelete,
  colors,
}: {
  isCompleting: boolean;
  onRestore: () => void;
  onDelete: () => void;
  colors: ColorPalette;
}) {
  return (
    <View style={{ marginTop: Spacing.xl, gap: Spacing.md }}>
      <Pressable
        onPress={() => {
          haptics.light();
          onRestore();
        }}
        disabled={isCompleting}
        style={({ pressed }) => ({
          opacity: pressed || isCompleting ? Opacity.pressed : 1,
        })}
      >
        <MaterialCard
          style={{
            backgroundColor: colors.primary,
            padding: Spacing.lg,
            alignItems: "center",
            borderRadius: Radius.lg,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
            <IconSymbol name="arrow.up.right" size={IconSize["2xl"]} color={colors.onColor} />
            <ThemedText
              style={{ fontSize: FontSize.lg, fontWeight: "600" }}
              color={colors.onColor}
            >
              {isCompleting ? "Restoring..." : "Restore Dream"}
            </ThemedText>
          </View>
        </MaterialCard>
      </Pressable>
      <Pressable
        onPress={() => {
          haptics.light();
          onDelete();
        }}
        style={({ pressed }) => ({
          opacity: pressed ? Opacity.pressed : 1,
        })}
      >
        <MaterialCard
          style={{
            padding: Spacing.lg,
            alignItems: "center",
            borderRadius: Radius.lg,
            borderWidth: 1,
            borderColor: colors.destructive,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
            <IconSymbol name="trash.fill" size={IconSize["2xl"]} color={colors.destructive} />
            <ThemedText
              style={{ fontSize: FontSize.lg, fontWeight: "600" }}
              color={colors.destructive}
            >
              Delete Forever
            </ThemedText>
          </View>
        </MaterialCard>
      </Pressable>
    </View>
  );
}
