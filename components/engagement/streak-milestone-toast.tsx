import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { MaterialCard } from "@/components/ui/material-card";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { ZIndex } from "@/constants/ui";
import { haptics } from "@/lib/haptics";

type StreakMilestoneToastProps = {
  visible: boolean;
  streak: number;
  xpReward: number;
  onDismiss: () => void;
};

export function StreakMilestoneToast({
  visible,
  streak,
  xpReward,
  onDismiss,
}: StreakMilestoneToastProps) {
  const colors = useColors();
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      haptics.success();
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onDismiss());
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-100);
    }
  }, [visible, translateY, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
      ]}
    >
      <MaterialCard
        style={[
          styles.card,
          {
            borderColor: colors.borderAccent,
            backgroundColor: colors.card,
          },
        ]}
      >
        <IconSymbol name="flame.fill" size={IconSize["3xl"]} color={colors.primary} />
        <ThemedText style={styles.streakText}>
          {streak}-day streak!
        </ThemedText>
        <ThemedText
          style={[styles.xpChip, { backgroundColor: colors.surfaceTinted }]}
          color={colors.primary}
        >
          +{xpReward} XP
        </ThemedText>
      </MaterialCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: ZIndex.toast,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  streakText: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
  xpChip: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
    overflow: "hidden",
  },
});
