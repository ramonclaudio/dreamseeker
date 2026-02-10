import { useEffect, useMemo, useRef, useState } from "react";
import { View, Modal, StyleSheet, Animated, Pressable } from "react-native";
import ViewShot from "react-native-view-shot";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { GradientButton } from "@/components/ui/gradient-button";
import { LevelShareCard } from "./level-share-card";
import { useColors } from "@/hooks/use-color-scheme";
import { useShareCapture } from "@/hooks/use-share-capture";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { pickHype } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";

type LevelUpModalProps = {
  visible: boolean;
  level: number;
  levelTitle: string;
  handle?: string;
  onDismiss: () => void;
};

const ANIMATION_DELAY = 100;
const LEVEL_ANIMATION_DURATION = 800;
const TEXT_ANIMATION_DURATION = 400;
const TITLE_ANIMATION_DELAY = 500;

export function LevelUpModal({ visible, level, levelTitle, handle, onDismiss }: LevelUpModalProps) {
  const colors = useColors();
  const [displayedLevel, setDisplayedLevel] = useState(0);
  const { viewShotRef, capture, isSharing } = useShareCapture();
  const hypeSubtitle = useMemo(() => (visible ? pickHype('levelUp') : ''), [visible]);

  // Animation values
  const levelScale = useRef(new Animated.Value(0)).current;
  const levelUpOpacity = useRef(new Animated.Value(0)).current;
  const levelUpTranslateY = useRef(new Animated.Value(-10)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(-10)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Animated level number that counts up
  const animatedLevel = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset all animation values
      levelScale.setValue(0);
      levelUpOpacity.setValue(0);
      levelUpTranslateY.setValue(-10);
      titleOpacity.setValue(0);
      titleTranslateY.setValue(-10);
      overlayOpacity.setValue(0);
      animatedLevel.setValue(0);
      setDisplayedLevel(0);

      // Trigger haptics and confetti
      haptics.success();

      // Animation sequence
      Animated.parallel([
        // Overlay fade in
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),

        // Level number count up + scale
        Animated.sequence([
          Animated.delay(ANIMATION_DELAY),
          Animated.parallel([
            // Count from 0 to level
            Animated.timing(animatedLevel, {
              toValue: level,
              duration: LEVEL_ANIMATION_DURATION,
              useNativeDriver: false,
            }),
            // Scale spring
            Animated.spring(levelScale, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();

      // "LEVEL UP!" text animation
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(levelUpOpacity, {
            toValue: 1,
            duration: TEXT_ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.spring(levelUpTranslateY, {
            toValue: 0,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, ANIMATION_DELAY + 200);

      // Title animation
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: TEXT_ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.spring(titleTranslateY, {
            toValue: 0,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, TITLE_ANIMATION_DELAY);

      // Epic confetti after level number appears
      setTimeout(() => {
        shootConfetti('epic');
      }, ANIMATION_DELAY + 400);
    }
  }, [
    visible,
    level,
    levelScale,
    levelUpOpacity,
    levelUpTranslateY,
    titleOpacity,
    titleTranslateY,
    overlayOpacity,
    animatedLevel,
  ]);

  // Update display when animated value changes
  useEffect(() => {
    const listenerId = animatedLevel.addListener(({ value }) => {
      setDisplayedLevel(Math.floor(value));
    });
    return () => animatedLevel.removeListener(listenerId);
  }, [animatedLevel]);

  if (!visible) return null;

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
          {/* Icon badge with level icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${colors.primary}20` },
            ]}
          >
            <IconSymbol
              name="trophy.fill"
              size={IconSize["5xl"]}
              color={colors.gold}
            />
          </View>

          {/* Animated level number */}
          <Animated.View
            style={[
              styles.levelContainer,
              {
                transform: [{ scale: levelScale }],
              },
            ]}
          >
            <ThemedText
              style={[
                styles.levelNumber,
                {
                  color: colors.primary,
                  textShadowColor: `${colors.primary}40`,
                  textShadowRadius: 20,
                  textShadowOffset: { width: 0, height: 4 },
                },
              ]}
            >
              {displayedLevel}
            </ThemedText>
          </Animated.View>

          {/* "LEVEL UP!" text */}
          <Animated.View
            style={{
              opacity: levelUpOpacity,
              transform: [{ translateY: levelUpTranslateY }],
            }}
          >
            <ThemedText style={styles.levelUpText} color={colors.primary}>
              LEVEL UP!
            </ThemedText>
            <ThemedText style={styles.hypeSubtitle} color={colors.gold}>
              {hypeSubtitle}
            </ThemedText>
          </Animated.View>

          {/* Level title */}
          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            }}
          >
            <ThemedText style={styles.levelTitle}>{levelTitle}</ThemedText>
            <ThemedText style={styles.gabbyQuote} color={colors.mutedForeground}>
              {"\"Be confident. Be delusional.\""}
            </ThemedText>
            <ThemedText style={styles.gabbyAttribution} color={colors.mutedForeground}>
              {"— Gabby"}
            </ThemedText>
          </Animated.View>

          {/* Dismiss button — user must tap to dismiss */}
          <GradientButton
            onPress={onDismiss}
            label="LET'S GOOO"
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
        </View>
      </Animated.View>

      {/* Offscreen share card */}
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={{ position: 'absolute', left: -9999 }}>
        <LevelShareCard level={level} levelTitle={levelTitle} handle={handle} />
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
    maxWidth: 340,
    borderRadius: Radius["2xl"],
    borderCurve: "continuous",
    padding: Spacing["3xl"],
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
  levelContainer: {
    marginBottom: Spacing.md,
  },
  levelNumber: {
    fontSize: 120,
    fontWeight: "800",
    letterSpacing: -4,
    lineHeight: 126,
  },
  levelUpText: {
    fontSize: FontSize["6xl"],
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
  },
  hypeSubtitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  levelTitle: {
    fontSize: FontSize["4xl"],
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  gabbyQuote: {
    fontSize: FontSize.base,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  gabbyAttribution: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  button: {
    width: "100%",
  },
});
