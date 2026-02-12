import { memo, useState } from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  FadeOut,
  SlideOutRight,
  ZoomIn,
} from "react-native-reanimated";
import { MaterialCard } from "@/components/ui/material-card";
import { SwipeableRow } from "@/components/ui/swipeable-row";
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { XpCelebration } from "@/components/ui/xp-celebration";
import { Spacing, TouchTarget, FontSize } from "@/constants/layout";
import { getCategoryConfig } from "@/constants/dreams";
import type { ColorPalette } from "@/constants/theme";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";
import { pickHype } from "@/constants/ui";
import { useDeadlineLabel } from "@/hooks/use-deadline-label";

type PendingAction = {
  _id: string;
  text: string;
  dreamId: string;
  dreamTitle: string;
  dreamCategory?: string;
  deadline?: number;
};

export const TodayActionItem = memo(function TodayActionItem({
  action,
  onToggle,
  onEdit,
  onDelete,
  onFocus,
  colors,
}: {
  action: PendingAction;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFocus?: () => void;
  colors: ColorPalette;
}) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [checked, setChecked] = useState(false);
  const [hypeText, setHypeText] = useState<string | null>(null);
  const checkScale = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const categoryColor = action.dreamCategory
    ? getCategoryConfig({ category: action.dreamCategory }).color
    : colors.primary;
  const deadlineInfo = useDeadlineLabel(action.deadline);

  const handleToggle = () => {
    haptics.success();
    setChecked(true);
    setShowCelebration(true);

    // Card punch animation: scale up then back
    cardScale.value = withSequence(
      withSpring(1.03, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );

    // Glow flash behind the card
    glowOpacity.value = withSequence(
      withTiming(0.6, { duration: 150 }),
      withTiming(0, { duration: 500 })
    );

    // Checkmark bounce animation
    checkScale.value = withSequence(
      withSpring(1.4, { damping: 6, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    // Small confetti burst — every action should celebrate
    shootConfetti('small');

    // Second haptic hit after a beat for extra punch
    setTimeout(() => haptics.light(), 200);

    setHypeText(pickHype('actionComplete'));
    setTimeout(() => setHypeText(null), 2000);
    // Delay toggle to let celebration play
    setTimeout(() => onToggle(), 900);
  };

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: withTiming(checked ? 1 : 0, { duration: 150 }),
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <>
      <Animated.View
        exiting={SlideOutRight.duration(400).delay(300)}
        style={[cardAnimStyle, { marginBottom: Spacing.sm }]}
      >
        {/* Glow flash behind card on completion */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: 14,
              backgroundColor: categoryColor,
            },
            glowStyle,
          ]}
          pointerEvents="none"
        />
      <SwipeableRow
        onComplete={checked ? undefined : handleToggle}
        onEdit={checked ? undefined : onEdit}
        onDelete={checked ? undefined : onDelete}
        completeColor={colors.success}
        editColor={colors.accent}
        deleteColor={colors.destructive}
        enabled={!checked}
      >
        <MaterialCard>
          <Pressable
            onPress={handleToggle}
            disabled={checked}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: Spacing.lg,
              minHeight: TouchTarget.min,
              gap: Spacing.md,
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={`${action.text}, for dream: ${action.dreamTitle}`}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                borderWidth: 2.5,
                borderColor: categoryColor,
                backgroundColor: checked ? categoryColor : 'transparent',
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {checked && (
                <Animated.View style={checkAnimStyle}>
                  <IconSymbol name="checkmark" size={16} color={colors.onColor} weight="bold" />
                </Animated.View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{
                  fontSize: FontSize.xl,
                  fontWeight: checked ? '600' : undefined,
                  ...(checked && { textDecorationLine: 'line-through' as const, opacity: 0.4 }),
                }}
                numberOfLines={2}
              >
                {action.text}
              </ThemedText>
              <ThemedText
                style={{ fontSize: FontSize.sm, marginTop: Spacing.xxs }}
                color={colors.mutedForeground}
              >
                {action.dreamTitle}
              </ThemedText>
              {deadlineInfo && !checked && (
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
            </View>
            {!checked && onFocus && (
              <Pressable
                onPress={() => {
                  haptics.light();
                  onFocus();
                }}
                hitSlop={8}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: categoryColor + '18',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                accessibilityLabel="Start focus session for this action"
                accessibilityRole="button"
              >
                <IconSymbol name="timer" size={18} color={categoryColor} />
              </Pressable>
            )}
          </Pressable>
          <XpCelebration
            visible={showCelebration}
            xpAmount={10}
            color={categoryColor}
            onComplete={() => setShowCelebration(false)}
          />
        </MaterialCard>
      </SwipeableRow>
      </Animated.View>
      {hypeText && (
        <Animated.View
          entering={ZoomIn.springify().damping(12).stiffness(200)}
          exiting={FadeOut.duration(300)}
        >
          <ThemedText
            style={{
              textAlign: 'center',
              fontSize: FontSize.base,
              fontWeight: '800',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginTop: Spacing.xxs,
              marginBottom: Spacing.sm,
            }}
            color={colors.gold}
          >
            {hypeText}
          </ThemedText>
        </Animated.View>
      )}
    </>
  );
});
