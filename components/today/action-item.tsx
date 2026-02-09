import { memo, useState } from "react";
import { View, Pressable } from "react-native";
import { MaterialCard } from "@/components/ui/material-card";
import { ThemedText } from "@/components/ui/themed-text";
import { XpCelebration } from "@/components/ui/xp-celebration";
import { Spacing, TouchTarget, FontSize } from "@/constants/layout";
import { getCategoryConfig } from "@/constants/dreams";
import type { ColorPalette } from "@/constants/theme";

type PendingAction = {
  _id: string;
  text: string;
  dreamTitle: string;
  dreamCategory?: string;
};

export const TodayActionItem = memo(function TodayActionItem({
  action,
  onToggle,
  colors,
}: {
  action: PendingAction;
  onToggle: () => void;
  colors: ColorPalette;
}) {
  const [showCelebration, setShowCelebration] = useState(false);
  const categoryColor = action.dreamCategory
    ? getCategoryConfig({ category: action.dreamCategory }).color
    : colors.primary;

  const handleToggle = () => {
    setShowCelebration(true);
    onToggle();
  };

  return (
    <MaterialCard style={{ marginBottom: Spacing.sm }}>
      <Pressable
        onPress={handleToggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: Spacing.lg,
          minHeight: TouchTarget.min,
          gap: Spacing.md,
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: false }}
        accessibilityLabel={`${action.text}, for dream: ${action.dreamTitle}`}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: categoryColor,
          }}
        />
        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: FontSize.xl }} numberOfLines={2}>
            {action.text}
          </ThemedText>
          <ThemedText
            style={{ fontSize: FontSize.sm, marginTop: Spacing.xxs }}
            color={colors.mutedForeground}
          >
            {action.dreamTitle}
          </ThemedText>
        </View>
      </Pressable>
      <XpCelebration
        visible={showCelebration}
        xpAmount={10}
        color={categoryColor}
        onComplete={() => setShowCelebration(false)}
      />
    </MaterialCard>
  );
});
