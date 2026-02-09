import { memo, useState } from "react";
import { View, Pressable } from "react-native";

import type { Doc } from "@/convex/_generated/dataModel";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { XpCelebration } from "@/components/ui/xp-celebration";
import type { ColorPalette } from "@/constants/theme";
import { Radius } from "@/constants/theme";
import { Spacing, TouchTarget, FontSize, IconSize, HitSlop } from "@/constants/layout";
import { Size } from "@/constants/ui";

type Action = Doc<"actions">;

export const DreamActionItem = memo(function DreamActionItem({
  action,
  onToggle,
  onEdit,
  onDelete,
  onFocus,
  colors,
  categoryColor,
}: {
  action: Action;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFocus: () => void;
  colors: ColorPalette;
  categoryColor: string;
}) {
  const [showCelebration, setShowCelebration] = useState(false);

  const handleToggle = () => {
    // Show celebration only when completing (not when uncompleting)
    if (!action.isCompleted) {
      setShowCelebration(true);
    }
    onToggle();
  };

  return (
    <MaterialCard style={{ marginBottom: Spacing.sm, borderLeftWidth: 3, borderLeftColor: categoryColor }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: Spacing.md + 2,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <Pressable
          onPress={handleToggle}
          style={{
            flexDirection: "row",
            alignItems: "center",
            minHeight: TouchTarget.min,
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: action.isCompleted }}
          accessibilityLabel={`${action.isCompleted ? "Completed" : "Not completed"}: ${action.text}`}
          accessibilityHint={action.isCompleted ? "Double tap to mark incomplete" : "Double tap to mark complete and earn XP"}
          hitSlop={HitSlop.md}
        >
          <View
            style={{
              width: Size.checkbox,
              height: Size.checkbox,
              borderRadius: Radius.sm,
              borderWidth: 2,
              borderColor: categoryColor,
              backgroundColor: action.isCompleted ? categoryColor : "transparent",
              marginRight: Spacing.md,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {action.isCompleted && (
              <IconSymbol name="checkmark" size={14} color={colors.onColor} weight="bold" />
            )}
          </View>
        </Pressable>
        <Pressable
          onPress={onEdit}
          onLongPress={onEdit}
          style={{
            flex: 1,
            minHeight: TouchTarget.min,
            justifyContent: "center",
          }}
          accessibilityRole="button"
          accessibilityLabel={`Edit action: ${action.text}`}
        >
          <ThemedText
            style={{
              fontSize: FontSize.xl,
              textDecorationLine: action.isCompleted ? "line-through" : "none",
              opacity: action.isCompleted ? 0.5 : 1,
            }}
            numberOfLines={2}
          >
            {action.text}
          </ThemedText>
        </Pressable>
        {!action.isCompleted && (
          <Pressable
            onPress={onFocus}
            style={{
              padding: Spacing.sm,
              minWidth: TouchTarget.min,
              minHeight: TouchTarget.min,
              justifyContent: "center",
              alignItems: "center",
            }}
            hitSlop={HitSlop.md}
            accessibilityRole="button"
            accessibilityLabel={`Start focus timer for ${action.text}`}
            accessibilityHint="Opens focus timer screen"
          >
            <IconSymbol name="timer" size={IconSize.lg} color={colors.accentBlue} />
          </Pressable>
        )}
        <Pressable
          onPress={onDelete}
          style={{
            padding: Spacing.sm,
            minWidth: TouchTarget.min,
            minHeight: TouchTarget.min,
            justifyContent: "center",
            alignItems: "center",
          }}
          hitSlop={HitSlop.md}
          accessibilityRole="button"
          accessibilityLabel={`Delete action: ${action.text}`}
        >
          <ThemedText
            style={{ fontSize: FontSize["5xl"], fontWeight: "400" }}
            color={colors.destructive}
          >
            ×
          </ThemedText>
        </Pressable>
      </View>
      <XpCelebration
        visible={showCelebration}
        xpAmount={10}
        color={categoryColor}
        onComplete={() => setShowCelebration(false)}
      />
    </MaterialCard>
  );
});
