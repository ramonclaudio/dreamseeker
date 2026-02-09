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
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { GradientButton } from "@/components/ui/gradient-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { AchievementStep } from "@/components/dream-complete/achievement-step";
import { ReflectionStep } from "@/components/dream-complete/reflection-step";
import { ShareStep } from "@/components/dream-complete/share-step";
import { NextStep } from "@/components/dream-complete/next-step";
import { useColors } from "@/hooks/use-color-scheme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";
import { getCategoryConfig, type DreamCategory } from "@/constants/dreams";

const STEPS = ["achievement", "reflection", "share", "next"] as const;

export default function DreamCompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = useQuery(api.auth.getCurrentUser);
  const [step, setStep] = useState(0);
  const [reflection, setReflection] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);
  const hasConfettied = useRef(false);

  const dream = useQuery(api.dreams.get, { id: id as Id<"dreams"> });
  const saveReflection = useMutation(api.dreams.saveReflection);

  // Shoot confetti on first render
  useEffect(() => {
    if (dream && !hasConfettied.current) {
      hasConfettied.current = true;
      const timer = setTimeout(() => {
        haptics.success();
        shootConfetti();
      }, 300);
      return () => clearTimeout(timer);
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
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share your achievement",
        });
      }
    } catch {
      // Sharing cancelled or failed, no action needed
    }
    setStep(3);
  }, []);

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
        <Pressable onPress={() => router.replace("/(app)/(tabs)")} style={{ marginTop: Spacing.xl }}>
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
        { text: "Leave", style: "destructive", onPress: () => router.replace("/(app)/(tabs)") },
      ]
    );
  };

  const categoryConfig = getCategoryConfig(dream);
  const categoryColor = categoryConfig.color;
  const completedActions = dream.actions?.filter((a) => a.isCompleted).length ?? 0;
  const totalActions = dream.actions?.length ?? 0;

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

        {step === 2 && (
          <ShareStep
            viewShotRef={viewShotRef}
            dreamTitle={dream.title}
            category={dream.category as DreamCategory}
            completedActions={completedActions}
            totalActions={totalActions}
            completedAt={dream.completedAt ?? Date.now()}
            handle={user?.displayName ?? user?.name ?? undefined}
            colors={colors}
          />
        )}

        {step === 3 && <NextStep colors={colors} dreamTitle={dream.title} />}
      </ScrollView>

      {/* Bottom navigation */}
      <View style={[styles.bottomNav, { borderTopColor: colors.separator }]}>
        {/* Progress dots */}
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

        {/* Navigation buttons */}
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
        {step === 2 && (
          <View style={styles.navRow}>
            <Pressable
              onPress={() => {
                haptics.light();
                setStep(3);
              }}
              style={({ pressed }) => ({
                opacity: pressed ? Opacity.pressed : 1,
                paddingVertical: Spacing.md,
              })}
            >
              <ThemedText color={colors.mutedForeground}>Skip</ThemedText>
            </Pressable>
            <GradientButton
              onPress={handleShare}
              label="Share"
              icon={
                <IconSymbol name="square.and.arrow.up" size={IconSize.xl} color={colors.onColor} />
              }
              style={{ flex: 1, marginLeft: Spacing.lg }}
            />
          </View>
        )}
        {step === 3 && (
          <GradientButton
            onPress={() => router.replace("/(app)/(tabs)")}
            label="Back to Dreams"
            icon={<IconSymbol name="sparkles" size={IconSize.xl} color={colors.onColor} />}
          />
        )}
      </View>
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
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing["2xl"],
    borderTopWidth: 0.5,
    gap: Spacing.lg,
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
});
