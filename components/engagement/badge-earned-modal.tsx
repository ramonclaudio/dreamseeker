import { useEffect, useMemo, useRef } from "react";
import { View, Modal, StyleSheet, Animated, Pressable } from "react-native";
import ViewShot from "react-native-view-shot";

import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { GradientButton } from "@/components/ui/gradient-button";
import { BadgeShareCard } from "./badge-share-card";
import { useColors } from "@/hooks/use-color-scheme";
import { useShareCapture } from "@/hooks/use-share-capture";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { pickHype } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";

type BadgeEarnedModalProps = {
  visible: boolean;
  badge: {
    key: string;
    title: string;
    description?: string;
    icon?: string;
  } | null;
  handle?: string;
  onDismiss: () => void;
};

const ANIMATION_DELAY = 100;

export function BadgeEarnedModal({ visible, badge, handle, onDismiss }: BadgeEarnedModalProps) {
  const colors = useColors();
  const { viewShotRef, capture, isSharing } = useShareCapture();
  const hypeSubtitle = useMemo(() => (visible ? pickHype('badge') : ''), [visible]);

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (visible && badge) {
      // Reset
      overlayOpacity.setValue(0);
      iconScale.setValue(0);
      contentOpacity.setValue(0);
      contentTranslateY.setValue(10);

      haptics.success();

      // Animation sequence
      Animated.parallel([
        // Overlay fade in
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Icon spring bounce
        Animated.sequence([
          Animated.delay(ANIMATION_DELAY),
          Animated.spring(iconScale, {
            toValue: 1,
            tension: 60,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),
        // Content fade + slide
        Animated.sequence([
          Animated.delay(ANIMATION_DELAY + 300),
          Animated.parallel([
            Animated.timing(contentOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(contentTranslateY, {
              toValue: 0,
              tension: 80,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();

      // Confetti after icon appears
      setTimeout(() => {
        shootConfetti('medium');
      }, ANIMATION_DELAY + 200);
    }
  }, [visible, badge, overlayOpacity, iconScale, contentOpacity, contentTranslateY]);

  if (!badge) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="overFullScreen"
      transparent
      onRequestClose={onDismiss}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: colors.overlay,
            opacity: overlayOpacity,
          },
        ]}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* Badge icon with spring bounce */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                backgroundColor: `${colors.primary}20`,
                transform: [{ scale: iconScale }],
              },
            ]}
          >
            <IconSymbol
              name={(badge.icon as IconSymbolName) ?? "star.fill"}
              size={IconSize["5xl"]}
              color={colors.primary}
            />
          </Animated.View>

          {/* Content with fade animation */}
          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Title */}
            <ThemedText variant="title" style={styles.title}>
              {badge.title}
            </ThemedText>

            {/* Hype subtitle */}
            <ThemedText style={styles.hypeSubtitle} color={colors.gold}>
              {hypeSubtitle}
            </ThemedText>

            {/* Description */}
            {badge.description && (
              <ThemedText
                style={styles.description}
                color={colors.mutedForeground}
              >
                {badge.description}
              </ThemedText>
            )}

            {/* Gabby quote */}
            <ThemedText style={styles.gabbyQuote} color={colors.mutedForeground}>
              {"\"The people who show up consistently are the people who win in the long run.\""}
            </ThemedText>
            <ThemedText style={styles.gabbyAttribution} color={colors.mutedForeground}>
              {"— Gabby"}
            </ThemedText>

            {/* XP chip */}
            <View
              style={[
                styles.xpChip,
                { backgroundColor: colors.surfaceTinted, borderColor: colors.borderAccent },
              ]}
            >
              <IconSymbol name="bolt.fill" size={IconSize.lg} color={colors.gold} />
              <ThemedText style={styles.xpText}>+25 XP</ThemedText>
            </View>

            {/* Dismiss button */}
            <GradientButton
              onPress={onDismiss}
              label="THAT'S MINE"
              style={styles.button}
            />

            {/* Share button */}
            <Pressable
              onPress={capture}
              disabled={isSharing}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, paddingVertical: Spacing.md, alignItems: 'center' })}
            >
              <ThemedText style={{ fontSize: FontSize.base, fontWeight: '600' }} color={colors.primary}>
                Share
              </ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Offscreen share card */}
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={{ position: 'absolute', left: -9999 }}>
        <BadgeShareCard badge={badge} handle={handle} />
      </ViewShot>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    borderRadius: Radius["2xl"],
    borderCurve: "continuous",
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  hypeSubtitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  description: {
    textAlign: "center",
    fontSize: FontSize.base,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  gabbyQuote: {
    fontSize: FontSize.sm,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  gabbyAttribution: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  xpChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  xpText: {
    fontSize: FontSize.base,
    fontWeight: "600",
  },
  button: {
    width: "100%",
  },
});
