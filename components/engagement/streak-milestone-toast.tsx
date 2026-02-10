import { useEffect, useMemo, useRef } from "react";
import { View, Animated, Pressable, StyleSheet } from "react-native";
import ViewShot from "react-native-view-shot";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { MaterialCard } from "@/components/ui/material-card";
import { ThemedText } from "@/components/ui/themed-text";
import { StreakShareCard } from "./streak-share-card";
import { useColors } from "@/hooks/use-color-scheme";
import { useShareCapture } from "@/hooks/use-share-capture";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { ZIndex } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";
import type { ConfettiTier } from "@/constants/ui";

type StreakMilestoneToastProps = {
  visible: boolean;
  streak: number;
  xpReward: number;
  handle?: string;
  onDismiss: () => void;
};

export function getStreakHype(streak: number): { label: string; tier: ConfettiTier; dismissDelay: number } {
  if (streak >= 100) {
    return { label: `${streak}-DAY STREAK — UNSTOPPABLE QUEEN`, tier: 'epic', dismissDelay: 11000 };
  }
  if (streak >= 30) {
    return { label: `${streak}-DAY STREAK — LEGENDARY`, tier: 'epic', dismissDelay: 11000 };
  }
  if (streak >= 7) {
    return { label: `${streak}-DAY STREAK — ON FIRE`, tier: 'medium', dismissDelay: 10500 };
  }
  return { label: `${streak}-day streak!`, tier: 'small', dismissDelay: 10000 };
}

export function StreakMilestoneToast({
  visible,
  streak,
  xpReward,
  handle,
  onDismiss,
}: StreakMilestoneToastProps) {
  const colors = useColors();
  const { viewShotRef, capture } = useShareCapture();
  const translateY = useRef(new Animated.Value(-100)).current;
  const { label, tier, dismissDelay } = useMemo(() => getStreakHype(streak), [streak]);

  useEffect(() => {
    if (visible) {
      haptics.success();
      shootConfetti(tier);

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
      }, dismissDelay);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-100);
    }
  }, [visible, translateY, onDismiss, tier, dismissDelay]);

  if (!visible) return null;

  const isLegendary = streak >= 30;

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
            borderColor: isLegendary ? colors.gold : colors.borderAccent,
            backgroundColor: colors.card,
          },
        ]}
      >
        <IconSymbol
          name="flame.fill"
          size={isLegendary ? IconSize["4xl"] : IconSize["3xl"]}
          color={isLegendary ? colors.gold : colors.primary}
        />
        <View style={{ flex: 1 }}>
          <ThemedText
            style={[
              styles.streakText,
              isLegendary && styles.streakTextLegendary,
            ]}
            color={isLegendary ? colors.gold : undefined}
          >
            {label}
          </ThemedText>
          <ThemedText style={styles.gabbyQuote} color={colors.mutedForeground}>
            {"\"Done is better than perfect.\" — Gabby"}
          </ThemedText>
        </View>
        <ThemedText
          style={[styles.xpChip, { backgroundColor: colors.surfaceTinted }]}
          color={colors.primary}
        >
          +{xpReward} XP
        </ThemedText>
        <Pressable onPress={capture} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, paddingHorizontal: Spacing.sm })}>
          <IconSymbol name="square.and.arrow.up" size={IconSize.md} color={colors.primary} />
        </Pressable>
      </MaterialCard>

      {/* Offscreen share card */}
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={{ position: 'absolute', left: -9999 }}>
        <StreakShareCard streak={streak} xpReward={xpReward} handle={handle} />
      </ViewShot>
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
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
  gabbyQuote: {
    fontSize: FontSize.sm,
    fontStyle: "italic",
    marginTop: 2,
  },
  streakTextLegendary: {
    fontSize: FontSize["2xl"],
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
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
