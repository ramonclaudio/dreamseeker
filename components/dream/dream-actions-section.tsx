import { View, Pressable, TextInput } from "react-native";
import { router } from "expo-router";

import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { DreamWithActions } from "@/hooks/use-dream-detail";
import { MaterialCard } from "@/components/ui/material-card";
import { GlassControl } from "@/components/ui/glass-control";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { DreamActionItem } from "@/components/dream/action-item";
import type { ColorPalette } from "@/constants/theme";
import { Spacing, TouchTarget, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { haptics } from "@/lib/haptics";

type Action = Doc<"actions">;

export function DreamActionsSection({
  dream,
  newActionText,
  onChangeText,
  onAddAction,
  onToggle,
  onEdit,
  onDelete,
  categoryColor,
  colors,
}: {
  dream: DreamWithActions;
  newActionText: string;
  onChangeText: (text: string) => void;
  onAddAction: () => void;
  onToggle: (id: Id<"actions">) => void;
  onEdit: (action: Action) => void;
  onDelete: (id: Id<"actions">) => void;
  categoryColor: string;
  colors: ColorPalette;
}) {
  return (
    <View>
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
        Actions
      </ThemedText>

      <View style={{ flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.lg }}>
        <MaterialCard style={{ flex: 1, borderLeftWidth: 3, borderLeftColor: `${categoryColor}40` }}>
          <TextInput
            style={{
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.md + 2,
              fontSize: FontSize.xl,
              color: colors.foreground,
            }}
            placeholder="Add an action step..."
            placeholderTextColor={colors.mutedForeground}
            value={newActionText}
            onChangeText={onChangeText}
            onSubmitEditing={onAddAction}
            returnKeyType="done"
          />
        </MaterialCard>
        <GlassControl
          isInteractive
          style={{ justifyContent: "center", paddingHorizontal: Spacing.xl }}
        >
          <Pressable
            onPress={() => {
              haptics.light();
              onAddAction();
            }}
            disabled={!newActionText.trim()}
            style={{
              minHeight: TouchTarget.min,
              justifyContent: "center",
              opacity: !newActionText.trim() ? Opacity.disabled : 1,
            }}
          >
            <ThemedText style={{ fontWeight: "700", fontSize: FontSize.base }} color={categoryColor}>
              Add
            </ThemedText>
          </Pressable>
        </GlassControl>
      </View>

      {dream.actions && dream.actions.length > 0 ? (
        dream.actions.map((action: Action) => (
          <DreamActionItem
            key={action._id}
            action={action}
            colors={colors}
            categoryColor={categoryColor}
            onToggle={() => onToggle(action._id)}
            onEdit={() => onEdit(action)}
            onDelete={() => onDelete(action._id)}
            onFocus={() =>
              router.push({
                pathname: "/(app)/focus-timer" as const,
                params: {
                  dreamId: dream._id,
                  actionId: action._id,
                  actionText: action.text,
                },
              } as never)
            }
          />
        ))
      ) : (
        <MaterialCard style={{ padding: Spacing.xl, alignItems: "center" }}>
          <IconSymbol
            name="plus.circle.fill"
            size={IconSize["3xl"]}
            color={`${categoryColor}60`}
            style={{ marginBottom: Spacing.md }}
          />
          <ThemedText
            style={{ fontSize: FontSize.base, textAlign: "center" }}
            color={colors.mutedForeground}
          >
            Break down your dream into small, actionable steps.
          </ThemedText>
        </MaterialCard>
      )}
    </View>
  );
}
