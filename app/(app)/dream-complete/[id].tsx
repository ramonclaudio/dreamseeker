import { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import ViewShot from "react-native-view-shot";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassControl } from "@/components/ui/glass-control";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { DreamShareCard } from "@/components/share-cards/dream-share-card";
import { AchievementStep } from "@/components/dream-complete/achievement-step";
import { ReflectionStep } from "@/components/dream-complete/reflection-step";
import { ShareStep } from "@/components/dream-complete/share-step";
import { NextStep } from "@/components/dream-complete/next-step";
import { BadgeEarnedModal } from "@/components/engagement/badge-earned-modal";
import { useColors } from "@/hooks/use-color-scheme";
import { useShareCapture } from "@/hooks/use-share-capture";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { Opacity } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";
import { getCategoryConfig, type DreamCategory } from "@/constants/dreams";

const STEPS = ["achievement", "reflection", "share", "next"] as const;

type BadgeInfo = { key: string; title: string; description?: string; icon?: string };

export default function DreamCompleteScreen() {
  const { id, badge: badgeParam } = useLocalSearchParams<{ id: string; badge?: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = useQuery(api.auth.getCurrentUser);
  const [step, setStep] = useState(0);
  const [reflection, setReflection] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { viewShotRef, capture } = useShareCapture();
  const hasConfettied = useRef(false);
  const [showBadge, setShowBadge] = useState(false);

  // Parse badge from search params (passed by dream detail when completing)
  const earnedBadge = useRef<BadgeInfo | null>(null);
  if (earnedBadge.current === null && badgeParam) {
    try { earnedBadge.current = JSON.parse(decodeURIComponent(badgeParam)); } catch { /* ignore */ }
  }

  const dream = useQuery(api.dreams.get, { id: id as Id<"dreams"> });
  const saveReflection = useMutation(api.dreams.saveReflection);

  // Shoot confetti on first render — make it EXPLODE
  useEffect(() => {
    if (dream && !hasConfettied.current) {
      hasConfettied.current = true;
      // First burst: epic confetti
      const timer1 = setTimeout(() => {
        haptics.success();
        shootConfetti('epic');
      }, 300);
      // Second burst: encore medium burst for sustained celebration
      const timer2 = setTimeout(() => {
        haptics.light();
        shootConfetti('medium');
      }, 1200);
      // Show badge modal after celebration settles
      const timer3 = earnedBadge.current
        ? setTimeout(() => setShowBadge(true), 2200)
        : undefined;
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        if (timer3) clearTimeout(timer3);
      };
    }
  }, [dream]);

  const handleSaveReflection = useCallback(async () => {
    if (!dream || !reflection.trim()) {
      setStep(2);
      return;
    }
    setIsSaving(true);
    try {
      await saveReflection({ id: dream._id, reflection: reflection.trim() });
      haptics.success();
    } catch {
      // Reflection is optional, continue regardless
    } finally {
      setIsSaving(false);
      setStep(2);
    }
  }, [dream, reflection, saveReflection]);

  const handleShare = useCallback(async () => {
    await capture();
    setStep(3);
  }, [capture]);

  if (dream === undefined) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (dream === null) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, padding: Spacing.xl }]}>
        <ThemedText style={{ fontSize: FontSize.xl, textAlign: "center" }} color={colors.mutedForeground}>
          Dream not found
        </ThemedText>
        <Pressable onPress={() => { if (router.canGoBack()) router.back(); }} style={{ marginTop: Spacing.xl }}>
          <ThemedText style={{ fontWeight: "600" }} color={colors.primary}>Go Back</ThemedText>
        </Pressable>
      </View>
    );
  }

  const handleClose = () => {
    Alert.alert(
      "Leave already?",
      "Don't skip your victory lap! You can always see this in Progress.",
      [
        { text: "Stay", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: () => {
          if (router.canGoBack()) router.back();
        } },
      ]
    );
  };

  const categoryConfig = getCategoryConfig(dream);
  const categoryColor = categoryConfig.color;
  const completedActions = dream.actions?.filter((a) => a.isCompleted).length ?? 0;
  const totalActions = dream.actions?.length ?? 0;

  if (step === 2) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Card preview — fills remaining space, centers vertically */}
        <ShareStep
          viewShotRef={viewShotRef}
          dreamTitle={dream.title}
          category={dream.category as DreamCategory}
          actions={(dream.actions ?? []).map((a) => ({ text: a.text, isCompleted: a.isCompleted }))}
          createdAt={dream.createdAt}
          completedAt={dream.completedAt ?? Date.now()}
          handle={user?.displayName ?? user?.name ?? undefined}
        />

        {/* Glass bottom controls */}
        <View style={[styles.shareBottom, { paddingBottom: insets.bottom + Spacing.md }]}>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === step ? colors.primary : colors.border,
                    width: i === step ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.shareActions}>
            <GlassControl isInteractive style={styles.shareSkipGlass}>
              <Pressable
                onPress={() => {
                  haptics.light();
                  setStep(3);
                }}
                style={({ pressed }) => [styles.shareSkipInner, { opacity: pressed ? Opacity.pressed : 1 }]}
              >
                <ThemedText style={styles.shareSkipText} color={colors.mutedForeground}>
                  Skip
                </ThemedText>
              </Pressable>
            </GlassControl>
            <GlassControl tint={colors.primary} isInteractive style={styles.shareShareGlass}>
              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [styles.shareShareInner, { opacity: pressed ? Opacity.pressed : 1 }]}
              >
                <IconSymbol name="square.and.arrow.up" size={IconSize.lg} color={colors.onColor} />
                <ThemedText style={styles.shareShareText} color={colors.onColor}>
                  Share
                </ThemedText>
              </Pressable>
            </GlassControl>
          </View>
        </View>

        <BadgeEarnedModal
          visible={showBadge && earnedBadge.current !== null}
          badge={earnedBadge.current}
          handle={user?.displayName ?? user?.name}
          onDismiss={() => setShowBadge(false)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Close button */}
      <Pressable
        onPress={handleClose}
        style={[styles.closeButton, { top: insets.top + Spacing.sm }]}
        hitSlop={12}
      >
        <IconSymbol name="xmark" size={IconSize.xl} color={colors.mutedForeground} />
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <AchievementStep
            dreamTitle={dream.title}
            category={dream.category as DreamCategory}
            categoryColor={categoryColor}
            completedActions={completedActions}
            totalActions={totalActions}
            createdAt={dream.createdAt}
            completedAt={dream.completedAt ?? Date.now()}
            colors={colors}
          />
        )}

        {step === 1 && (
          <ReflectionStep
            value={reflection}
            onChangeText={setReflection}
            colors={colors}
          />
        )}

        {step === 3 && <NextStep colors={colors} onShare={capture} />}
      </ScrollView>

      {/* Offscreen share card for step 3 capture */}
      {step === 3 && (
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }} style={styles.offscreen}>
          <DreamShareCard
            title={dream.title}
            category={dream.category as DreamCategory}
            status="completed"
            completedActions={completedActions}
            totalActions={totalActions}
            actions={(dream.actions ?? []).map((a) => ({ text: a.text, isCompleted: a.isCompleted }))}
            createdAt={dream.createdAt}
            completedAt={dream.completedAt ?? Date.now()}
            handle={user?.displayName ?? user?.name ?? undefined}
          />
        </ViewShot>
      )}

      {/* Bottom navigation (steps 0–1 only; step 3 is self-contained via NextStep) */}
      {step !== 3 && (
        <View style={[styles.bottomNav, { paddingBottom: insets.bottom + Spacing.sm }]}>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === step ? colors.primary : colors.border,
                    width: i === step ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>
          {step === 0 && (
            <GradientButton
              onPress={() => {
                haptics.light();
                setStep(1);
              }}
              label="Continue"
            />
          )}
          {step === 1 && (
            <View style={styles.navRow}>
              <Pressable
                onPress={() => {
                  haptics.light();
                  setStep(2);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? Opacity.pressed : 1,
                  paddingVertical: Spacing.md,
                })}
              >
                <ThemedText color={colors.mutedForeground}>Skip</ThemedText>
              </Pressable>
              <GradientButton
                onPress={handleSaveReflection}
                label={isSaving ? "Saving..." : "Save & Continue"}
                disabled={isSaving}
                style={{ flex: 1, marginLeft: Spacing.lg }}
              />
            </View>
          )}
        </View>
      )}

      <BadgeEarnedModal
        visible={showBadge && earnedBadge.current !== null}
        badge={earnedBadge.current}
        handle={user?.displayName ?? user?.name}
        onDismiss={() => setShowBadge(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.xs,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing["3xl"],
  },
  bottomNav: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  offscreen: {
    position: "absolute",
    left: -9999,
  },
  // Share step — glass bottom controls
  shareBottom: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  shareActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  shareSkipGlass: {
    borderRadius: Radius.full,
  },
  shareSkipInner: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  shareSkipText: {
    fontSize: FontSize.xl,
    fontWeight: "600",
  },
  shareShareGlass: {
    flex: 1,
    borderRadius: Radius.full,
  },
  shareShareInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  shareShareText: {
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
});
