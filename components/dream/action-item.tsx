import { memo, useState } from "react";
import { View, Pressable } from "react-native";
import ViewShot from "react-native-view-shot";

import type { Doc } from "@/convex/_generated/dataModel";
import { MaterialCard } from "@/components/ui/material-card";
import { SwipeableRow } from "@/components/ui/swipeable-row";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { XpCelebration } from "@/components/ui/xp-celebration";
import { ActionShareCard } from "@/components/share-cards/action-share-card";
import type { DreamCategory } from "@/constants/dreams";
import type { ColorPalette } from "@/constants/theme";
import { Radius } from "@/constants/theme";
import { Spacing, TouchTarget, FontSize, IconSize, HitSlop } from "@/constants/layout";
import { Size, Opacity } from "@/constants/ui";
import { useShareCapture } from "@/hooks/use-share-capture";
import { useDeadlineLabel } from "@/hooks/use-deadline-label";

type Action = Doc<"actions">;

export const DreamActionItem = memo(function DreamActionItem({
  action,
  onToggle,
  onEdit,
  onDelete,
  onFocus,
  colors,
  categoryColor,
  dreamTitle,
  dreamCategory,
  completedActions,
  totalActions,
  handle,
}: {
  action: Action;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFocus: () => void;
  colors: ColorPalette;
  categoryColor: string;
  dreamTitle?: string;
  dreamCategory?: string;
  completedActions?: number;
  totalActions?: number;
  handle?: string;
}) {
  const [showCelebration, setShowCelebration] = useState(false);
  const { viewShotRef, capture, isSharing } = useShareCapture();

  const deadlineInfo = useDeadlineLabel(action.isCompleted ? undefined : action.deadline);

  const handleToggle = () => {
    if (!action.isCompleted) {
      setShowCelebration(true);
    }
    onToggle();
  };

  return (
    <SwipeableRow
      onComplete={action.isCompleted ? undefined : handleToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      completeColor={colors.success}
      editColor={colors.accent}
      deleteColor={colors.destructive}
    >
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
            {deadlineInfo && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: Spacing.xxs }}>
                <IconSymbol
                  name={deadlineInfo.isOverdue ? "exclamationmark.circle.fill" : "clock"}
                  size={12}
                  color={deadlineInfo.isOverdue ? colors.destructive : colors.mutedForeground}
                />
                <ThemedText
                  style={{ fontSize: FontSize.xs, fontWeight: "500" }}
                  color={deadlineInfo.isOverdue ? colors.destructive : colors.mutedForeground}
                >
                  {deadlineInfo.label}
                </ThemedText>
              </View>
            )}
          </Pressable>
          {action.isCompleted && dreamTitle && (
            <Pressable
              onPress={capture}
              disabled={isSharing}
              style={{
                padding: Spacing.sm,
                minWidth: TouchTarget.min,
                minHeight: TouchTarget.min,
                justifyContent: "center",
                alignItems: "center",
                opacity: isSharing ? Opacity.pressed : 1,
              }}
              hitSlop={HitSlop.md}
              accessibilityRole="button"
              accessibilityLabel="Share completed action"
            >
              <IconSymbol name="square.and.arrow.up" size={IconSize.lg} color={colors.accent} />
            </Pressable>
          )}
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
              <IconSymbol name="timer" size={IconSize.lg} color={colors.accent} />
            </Pressable>
          )}
        </View>
        {action.isCompleted && dreamTitle && dreamCategory && (
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }} style={{ position: "absolute", left: -9999 }}>
            <ActionShareCard
              actionText={action.text}
              dreamTitle={dreamTitle}
              dreamCategory={dreamCategory as DreamCategory}
              completedActions={completedActions ?? 0}
              totalActions={totalActions ?? 0}
              handle={handle}
            />
          </ViewShot>
        )}
        <XpCelebration
          visible={showCelebration}
          xpAmount={10}
          color={categoryColor}
          onComplete={() => setShowCelebration(false)}
        />
      </MaterialCard>
    </SwipeableRow>
  );
});
