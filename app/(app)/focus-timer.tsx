import { useState, useCallback, useRef, useEffect } from "react";
import { View, Pressable, TextInput, ScrollView, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeIn, FadeInDown } from "react-native-reanimated";
import ViewShot from "react-native-view-shot";
import ConfettiCannon from "react-native-confetti-cannon";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SvgGradientBg } from "@/components/ui/svg-gradient-bg";
import { GlassControl } from "@/components/ui/glass-control";
import { GradientButton } from "@/components/ui/gradient-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { useFocusTimer } from "@/hooks/use-focus-timer";
import { useShareCapture } from "@/hooks/use-share-capture";
import { Spacing, FontSize, IconSize, TouchTarget } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { Opacity, ConfettiMedium } from "@/constants/ui";
import { haptics } from "@/lib/haptics";

const DURATION_PRESETS = [
  { label: "1 min", seconds: 1 * 60 },
  { label: "5 min", seconds: 5 * 60 },
  { label: "15 min", seconds: 15 * 60 },
  { label: "25 min", seconds: 25 * 60 },
  { label: "45 min", seconds: 45 * 60 },
  { label: "60 min", seconds: 60 * 60 },
];

const HYPE_SUBTITLES = [
  "You just locked in. RESPECT.",
  "Focus mode: DOMINATED.",
  "That was a POWER session.",
];

const CATEGORY_HYPE: Record<string, string[]> = {
  travel: [
    "One step closer to the boarding gate.",
    "Your passport is PROUD of you.",
    "Future you is sipping cocktails somewhere beautiful.",
  ],
  money: [
    "Bag secured. Keep stacking.",
    "Your bank account felt THAT.",
    "Money moves only.",
  ],
  career: [
    "Corner office energy.",
    "LinkedIn could never.",
    "Your resume just leveled up.",
  ],
  growth: [
    "Growth looks GOOD on you.",
    "Evolving in real time.",
    "The glow-up is happening.",
  ],
  lifestyle: [
    "Living on YOUR terms.",
    "Main character moment.",
    "This is the life you designed.",
  ],
  relationships: [
    "Pouring into what matters.",
    "Connection is your superpower.",
    "The people you love felt that.",
  ],
};

const RING_SIZE = 220;
const STROKE_WIDTH = 12;
const RING_RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatDurationLabel(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (seconds < 60) return `${seconds} sec of deep work`;
  return `${mins} min of deep work`;
}

function TimerControlButton({
  label,
  onPress,
  tint,
  textColor,
}: {
  label: string;
  onPress: () => void;
  tint: string;
  textColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ width: "100%" }}
    >
      <GlassControl
        isInteractive
        tint={tint}
        style={{ padding: Spacing.lg, alignItems: "center" }}
      >
        <ThemedText style={{ fontSize: FontSize.lg, fontWeight: "600" }} color={textColor}>
          {label}
        </ThemedText>
      </GlassControl>
    </Pressable>
  );
}

export default function FocusTimerScreen() {
  const { dreamId, actionId, actionText } = useLocalSearchParams<{
    dreamId?: string;
    actionId?: string;
    actionText?: string;
  }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const confettiRef = useRef<ConfettiCannon>(null);
  const timer = useFocusTimer(25 * 60);
  const [completionXP, setCompletionXP] = useState<number | null>(null);
  const [hypeSubtitle, setHypeSubtitle] = useState(() => HYPE_SUBTITLES[Math.floor(Math.random() * HYPE_SUBTITLES.length)]);
  const xpScale = useSharedValue(0);
  const [isCustom, setIsCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const [customSeconds, setCustomSeconds] = useState("");
  const customTotal = parseInt(customMinutes || "0", 10) * 60 + parseInt(customSeconds || "0", 10);
  const customValid = customTotal >= 1 && customTotal <= 180 * 60;
  const { viewShotRef, capture, isSharing } = useShareCapture();

  const user = useQuery(api.auth.getCurrentUser);
  const handle = user?.displayName ?? user?.name ?? undefined;
  const dreams = useQuery(api.dreams.listWithActionCounts);
  const [selectedDreamId, setSelectedDreamId] = useState<Id<"dreams"> | undefined>(
    dreamId ? (dreamId as Id<"dreams">) : undefined
  );
  const [selectedActionId, setSelectedActionId] = useState<Id<"actions"> | undefined>(
    actionId ? (actionId as Id<"actions">) : undefined
  );

  // Sync route params to selection (e.g. navigated from dream detail)
  useEffect(() => {
    if (dreamId) setSelectedDreamId(dreamId as Id<"dreams">);
  }, [dreamId]);
  useEffect(() => {
    if (actionId) setSelectedActionId(actionId as Id<"actions">);
  }, [actionId]);

  const selectedDream = dreams?.find((d) => d._id === selectedDreamId);
  const actions = useQuery(
    api.actions.list,
    selectedDreamId ? { dreamId: selectedDreamId } : "skip"
  );
  const pendingActions = actions?.filter((a) => !a.isCompleted);
  const selectedAction = actions?.find((a) => a._id === selectedActionId);
  const completeFocusSession = useMutation(api.focusSessions.complete);

  const handleComplete = useCallback(async () => {
    try {
      const result = await completeFocusSession({
        dreamId: selectedDreamId,
        actionId: selectedActionId,
        duration: timer.duration,
      });
      haptics.success();
      confettiRef.current?.start();
      if (timer.duration >= 30 * 60) {
        setTimeout(() => confettiRef.current?.start(), 1500);
      }
      // Pick category-specific hype if a dream is linked
      const category = selectedDream?.category;
      const pool = (category && CATEGORY_HYPE[category]) ?? HYPE_SUBTITLES;
      setHypeSubtitle(pool[Math.floor(Math.random() * pool.length)]);
      setCompletionXP(result.xpAwarded);
      xpScale.value = withSpring(1, { damping: 8, stiffness: 150, mass: 0.8 });
    } catch {
      haptics.error();
      setCompletionXP(0);
      xpScale.value = withSpring(1, { damping: 8, stiffness: 150, mass: 0.8 });
    }
  }, [completeFocusSession, selectedDreamId, selectedActionId, selectedDream?.category, timer.duration, xpScale]);

  const prevStatusRef = useRef(timer.status);
  useEffect(() => {
    if (timer.status === "complete" && prevStatusRef.current !== "complete") {
      handleComplete();
    }
    prevStatusRef.current = timer.status;
  }, [timer.status, handleComplete]);

  const handleCustomConfirm = () => {
    if (customValid) {
      haptics.selection();
      timer.setDuration(customTotal);
      setIsCustom(false);
      setCustomMinutes("");
      setCustomSeconds("");
    } else {
      haptics.error();
    }
  };

  const xpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: xpScale.value }],
  }));

  const strokeDashoffset = CIRCUMFERENCE * (1 - timer.progress);
  const contextLabel = selectedAction?.text ?? actionText ?? selectedDream?.title ?? null;
  const contextIsAction = !!(selectedAction?.text || actionText);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingBottom: insets.bottom + Spacing.xl,
      }}
    >
      {/* Header — hidden on completion */}
      {timer.status !== "complete" && (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: colors.separator }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            style={{ minHeight: TouchTarget.min, justifyContent: "center" as const }}
          >
            <ThemedText color={colors.mutedForeground}>Cancel</ThemedText>
          </Pressable>
          <ThemedText style={{ fontSize: FontSize.xl, fontWeight: "700" }}>Focus</ThemedText>
          <View style={{ minWidth: TouchTarget.min }} />
        </View>
      )}

      {/* Context label — always visible */}
      {contextLabel && timer.status !== "complete" && (
        <View style={{ alignItems: "center", paddingHorizontal: Spacing.xl, paddingTop: Spacing.md }}>
          <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
            {contextIsAction ? "Working on" : "Focusing on"}
          </ThemedText>
          <ThemedText
            style={{ fontSize: FontSize["2xl"], fontWeight: "600", textAlign: "center" }}
            numberOfLines={2}
          >
            {contextLabel}
          </ThemedText>
        </View>
      )}

      {/* Dream link pills */}
      {timer.status === "idle" && dreams && dreams.length > 0 && (
        <View style={{ marginTop: Spacing.md, paddingHorizontal: Spacing.xl }}>
          <ThemedText
            style={{
              fontSize: FontSize.base,
              fontWeight: "600",
              textTransform: "uppercase",
              marginBottom: Spacing.sm,
            }}
            color={colors.mutedForeground}
          >
            Link to a dream
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.sm }}
          >
            {dreams.map((d) => {
              const isSelected = selectedDreamId === d._id;
              return (
                <Pressable
                  key={d._id}
                  onPress={() => {
                    haptics.selection();
                    setSelectedDreamId(isSelected ? undefined : d._id);
                    setSelectedActionId(undefined);
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.lg,
                    borderRadius: Radius.full,
                    borderWidth: 1.5,
                    borderColor: isSelected ? colors.accent : colors.border,
                    backgroundColor: isSelected ? `${colors.accent}15` : colors.card,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <ThemedText
                    style={{
                      fontSize: FontSize.base,
                      fontWeight: isSelected ? "600" : "400",
                    }}
                    color={isSelected ? colors.foreground : colors.mutedForeground}
                    numberOfLines={1}
                  >
                    {d.title}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Action pills — shown when a dream is selected and has pending actions */}
          {pendingActions && pendingActions.length > 0 && (
            <View style={{ marginTop: Spacing.md }}>
              <ThemedText
                style={{
                  fontSize: FontSize.sm,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginBottom: Spacing.xs,
                }}
                color={colors.mutedForeground}
              >
                Link to an action
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: Spacing.sm }}
              >
                {pendingActions.map((a) => {
                  const isSelected = selectedActionId === a._id;
                  return (
                    <Pressable
                      key={a._id}
                      onPress={() => {
                        haptics.selection();
                        setSelectedActionId(isSelected ? undefined : a._id);
                      }}
                      style={({ pressed }) => ({
                        paddingVertical: Spacing.xs,
                        paddingHorizontal: Spacing.md,
                        borderRadius: Radius.full,
                        borderWidth: 1.5,
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? `${colors.primary}15` : colors.card,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <ThemedText
                        style={{
                          fontSize: FontSize.sm,
                          fontWeight: isSelected ? "600" : "400",
                        }}
                        color={isSelected ? colors.foreground : colors.mutedForeground}
                        numberOfLines={1}
                      >
                        {a.text}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* Duration presets */}
      {timer.status === "idle" && (
        <View style={{ alignItems: "center", marginTop: Spacing.xl, gap: Spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: Spacing.sm, flexWrap: "wrap" }}>
            {DURATION_PRESETS.map((preset) => {
              const isSelected = !isCustom && timer.duration === preset.seconds;
              return (
                <Pressable
                  key={preset.seconds}
                  onPress={() => { haptics.selection(); setIsCustom(false); timer.setDuration(preset.seconds); }}
                  accessibilityRole="button"
                  accessibilityLabel={`Set timer to ${preset.label}`}
                  accessibilityState={{ selected: isSelected }}
                  style={{
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.sm,
                    borderRadius: Radius.full,
                    backgroundColor: isSelected ? colors.accent : colors.secondary,
                  }}
                >
                  <ThemedText
                    style={{ fontSize: FontSize.base, fontWeight: "600" }}
                    color={isSelected ? colors.onColor : colors.foreground}
                  >
                    {preset.label}
                  </ThemedText>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => { haptics.selection(); setIsCustom(true); }}
              accessibilityRole="button"
              accessibilityLabel="Set custom timer duration"
              accessibilityState={{ selected: isCustom }}
              style={{
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.sm,
                borderRadius: Radius.full,
                backgroundColor: isCustom ? colors.accent : colors.secondary,
              }}
            >
              <ThemedText
                style={{ fontSize: FontSize.base, fontWeight: "600" }}
                color={isCustom ? colors.onColor : colors.foreground}
              >
                Custom
              </ThemedText>
            </Pressable>
          </View>

          {isCustom && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
              <TextInput
                style={{
                  backgroundColor: colors.secondary,
                  borderRadius: Radius.md,
                  paddingHorizontal: Spacing.lg,
                  paddingVertical: Spacing.sm,
                  fontSize: FontSize["2xl"],
                  fontWeight: "600",
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  width: 64,
                  textAlign: "center",
                  fontVariant: ["tabular-nums"],
                }}
                placeholder="5"
                placeholderTextColor={colors.mutedForeground}
                value={customMinutes}
                onChangeText={(t) => setCustomMinutes(t.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                maxLength={3}
                returnKeyType="next"
                autoFocus
              />
              <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
                min
              </ThemedText>
              <TextInput
                style={{
                  backgroundColor: colors.secondary,
                  borderRadius: Radius.md,
                  paddingHorizontal: Spacing.lg,
                  paddingVertical: Spacing.sm,
                  fontSize: FontSize["2xl"],
                  fontWeight: "600",
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  width: 64,
                  textAlign: "center",
                  fontVariant: ["tabular-nums"],
                }}
                placeholder="30"
                placeholderTextColor={colors.mutedForeground}
                value={customSeconds}
                onChangeText={(t) => {
                  const num = t.replace(/[^0-9]/g, "");
                  if (num === "" || parseInt(num, 10) <= 59) setCustomSeconds(num);
                }}
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={handleCustomConfirm}
              />
              <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
                sec
              </ThemedText>
              <Pressable
                onPress={handleCustomConfirm}
                disabled={!customValid}
                accessibilityRole="button"
                accessibilityLabel="Confirm custom duration"
                accessibilityState={{ disabled: !customValid }}
                style={({ pressed }) => ({
                  opacity: pressed ? Opacity.pressed : !customValid ? Opacity.disabled : 1,
                  paddingHorizontal: Spacing.md,
                  paddingVertical: Spacing.sm,
                  borderRadius: Radius.md,
                  backgroundColor: colors.accent,
                })}
              >
                <ThemedText style={{ fontSize: FontSize.base, fontWeight: "600" }} color={colors.onColor}>
                  Set
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* Completion celebration — full screen */}
      {timer.status === "complete" && completionXP !== null ? (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl }}>
            {/* Glow rings + trophy */}
            <Animated.View
              entering={FadeIn.duration(600)}
              style={{ alignItems: "center", justifyContent: "center", marginBottom: Spacing.xl }}
            >
              <View style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: `${colors.primary}08`,
                alignItems: "center",
                justifyContent: "center",
              }}>
                <View style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: `${colors.primary}12`,
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <View style={{
                    width: 88,
                    height: 88,
                    borderRadius: 44,
                    backgroundColor: `${colors.primary}20`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <IconSymbol name="trophy.fill" size={44} color={colors.primary} />
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* XP — the hero */}
            <Animated.View style={[xpAnimatedStyle, { overflow: "visible", marginBottom: Spacing.sm }]}>
              <ThemedText
                style={{
                  fontSize: 56,
                  fontWeight: "800",
                  textAlign: "center",
                  lineHeight: 64,
                }}
                color={colors.primary}
              >
                {completionXP > 0 ? `+${completionXP} XP` : "XP syncing..."}
              </ThemedText>
            </Animated.View>

            {/* Session complete label */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <ThemedText
                style={{
                  fontSize: FontSize.sm,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 4,
                  textAlign: "center",
                  marginBottom: Spacing.xl,
                }}
                color={colors.mutedForeground}
              >
                Session Complete
              </ThemedText>
            </Animated.View>

            {/* Duration + dream context */}
            <Animated.View entering={FadeInDown.delay(500).duration(500)} style={{ alignItems: "center", gap: Spacing.md }}>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacing.sm,
                backgroundColor: `${colors.primary}10`,
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.sm,
                borderRadius: Radius.full,
              }}>
                <IconSymbol name="timer" size={14} color={colors.primary} />
                <ThemedText style={{ fontSize: FontSize.sm, fontWeight: "600" }} color={colors.primary}>
                  {formatDurationLabel(timer.duration)}
                </ThemedText>
              </View>

              {contextLabel && (
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Spacing.sm,
                  backgroundColor: colors.surfaceTinted,
                  paddingHorizontal: Spacing.lg,
                  paddingVertical: Spacing.sm,
                  borderRadius: Radius.full,
                }}>
                  <IconSymbol name="star.fill" size={14} color={colors.mutedForeground} />
                  <ThemedText style={{ fontSize: FontSize.sm, fontWeight: "500" }} color={colors.mutedForeground} numberOfLines={1}>
                    {contextLabel}
                  </ThemedText>
                </View>
              )}
            </Animated.View>

            {/* Hype subtitle */}
            <Animated.View entering={FadeInDown.delay(700).duration(500)} style={{ marginTop: Spacing["2xl"] }}>
              <ThemedText
                style={{
                  fontSize: FontSize["2xl"],
                  fontWeight: "600",
                  textAlign: "center",
                  lineHeight: 26,
                  fontStyle: "italic",
                }}
                color={colors.mutedForeground}
              >
                {`"${hypeSubtitle}"`}
              </ThemedText>
            </Animated.View>

            {/* Legendary badge */}
            {timer.duration >= 45 * 60 && (
              <Animated.View entering={FadeInDown.delay(900).duration(500)} style={{ marginTop: Spacing.lg }}>
                <View style={{
                  backgroundColor: `${colors.gold}15`,
                  paddingHorizontal: Spacing.xl,
                  paddingVertical: Spacing.sm,
                  borderRadius: Radius.full,
                  borderWidth: 1,
                  borderColor: `${colors.gold}30`,
                }}>
                  <ThemedText
                    style={{
                      fontSize: FontSize.sm,
                      fontWeight: "700",
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: 2,
                    }}
                    color={colors.gold}
                  >
                    LEGENDARY SESSION
                  </ThemedText>
                </View>
              </Animated.View>
            )}
          </View>
        </View>
      ) : null}

      {/* Timer ring */}
      {timer.status !== "complete" && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{ width: RING_SIZE, height: RING_SIZE, alignItems: "center", justifyContent: "center" }}
            accessible={true}
            accessibilityRole="timer"
            accessibilityLabel={`Timer: ${formatTime(timer.remaining)} remaining`}
            accessibilityValue={{
              min: 0,
              max: timer.duration,
              now: timer.duration - timer.remaining,
            }}
          >
            <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: "absolute" }} accessible={false}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={colors.surfaceTinted}
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={colors.primary}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation={-90}
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
            <ThemedText
              style={{ fontSize: FontSize["5xl"], fontWeight: "700", fontVariant: ["tabular-nums"] }}
              importantForAccessibility="no"
            >
              {formatTime(timer.remaining)}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={{ gap: Spacing.md, alignItems: "center", paddingHorizontal: Spacing.xl }}>
        {timer.status === "idle" && (
          <GradientButton
            onPress={() => { haptics.medium(); timer.start(); }}
            label="Start Focus"
            icon={<IconSymbol name="timer" size={IconSize["2xl"]} color={colors.onColor} />}
            style={{ width: "100%" }}
          />
        )}

        {timer.status === "running" && (
          <TimerControlButton label="Pause" onPress={() => { haptics.light(); timer.pause(); }} tint={colors.accent} textColor={colors.onColor} />
        )}

        {timer.status === "paused" && (
          <TimerControlButton label="Resume" onPress={() => { haptics.light(); timer.resume(); }} tint={colors.accent} textColor={colors.onColor} />
        )}

        {timer.status === "complete" && completionXP !== null && (
          <View style={{ width: "100%", gap: Spacing.sm }}>
            <GradientButton
              onPress={() => router.back()}
              label="Back to it"
              style={{ width: "100%" }}
            />
            <Pressable
              onPress={capture}
              disabled={isSharing}
              accessibilityRole="button"
              accessibilityLabel="Share session"
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: Spacing.sm,
                paddingVertical: Spacing.md,
                opacity: pressed ? Opacity.pressed : 1,
              })}
            >
              <IconSymbol name="square.and.arrow.up" size={IconSize.lg} color={colors.mutedForeground} />
              <ThemedText style={{ fontSize: FontSize.base, fontWeight: "600" }} color={colors.mutedForeground}>
                Share
              </ThemedText>
            </Pressable>
          </View>
        )}

        {(timer.status === "running" || timer.status === "paused") && (
          <Pressable
            onPress={() => { haptics.warning(); timer.reset(); setCompletionXP(null); xpScale.value = 0; }}
            accessibilityRole="button"
            accessibilityLabel="Reset timer"
            accessibilityHint="Returns timer to idle state"
            style={({ pressed }) => ({
              opacity: pressed ? Opacity.pressed : 1,
              minHeight: TouchTarget.min,
              justifyContent: "center",
            })}
          >
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "600" }} color={colors.mutedForeground}>
              Reset
            </ThemedText>
          </Pressable>
        )}
      </View>

      {/* Offscreen share card */}
      {timer.status === "complete" && completionXP !== null && (
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }} style={{ position: "absolute", left: -9999 }}>
          <View style={{ width: 390, height: 700, overflow: "hidden", paddingHorizontal: Spacing.xl, paddingVertical: Spacing["4xl"], justifyContent: "center", alignItems: "center", gap: Spacing.xl }}>
            <SvgGradientBg colors={["#E8A87C", "#E07B4F"]} width={390} height={700} direction="diagonal" />
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.04)" }} />

            {/* Radial glow */}
            <View style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,215,0,0.10)" }} />

            {/* Sparkles */}
            <View style={{ position: "absolute", top: 60, right: 35 }}>
              <IconSymbol name="sparkles" size={IconSize["2xl"]} color="rgba(255,255,255,0.25)" />
            </View>
            <View style={{ position: "absolute", bottom: 140, left: 25 }}>
              <IconSymbol name="sparkles" size={IconSize.lg} color="rgba(255,255,255,0.15)" />
            </View>
            <View style={{ position: "absolute", bottom: 170, right: 20 }}>
              <IconSymbol name="sparkles" size={IconSize.md} color="rgba(255,215,0,0.2)" />
            </View>

            {/* Trophy */}
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <View style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: "rgba(255,255,255,0.12)",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <IconSymbol name="trophy.fill" size={44} color="#fff" />
              </View>
            </View>

            {/* XP */}
            <ThemedText
              style={{ fontSize: 72, fontWeight: "800", textAlign: "center", lineHeight: 80, textShadowColor: "rgba(0,0,0,0.3)", textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 20 }}
              color="#fff"
            >
              {completionXP > 0 ? `+${completionXP} XP` : "+XP"}
            </ThemedText>

            {/* Label */}
            <ThemedText
              style={{ fontSize: FontSize.base, fontWeight: "700", textTransform: "uppercase", letterSpacing: 4, textAlign: "center" }}
              color="rgba(255,255,255,0.7)"
            >
              Session Complete
            </ThemedText>

            {/* Duration + context */}
            <View style={{ alignItems: "center", gap: Spacing.sm }}>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacing.sm,
                backgroundColor: "rgba(255,255,255,0.12)",
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.sm,
                borderRadius: Radius.full,
              }}>
                <IconSymbol name="timer" size={14} color="#fff" />
                <ThemedText style={{ fontSize: FontSize.sm, fontWeight: "600" }} color="#fff">
                  {formatDurationLabel(timer.duration)}
                </ThemedText>
              </View>

              {contextLabel && (
                <ThemedText style={{ fontSize: FontSize.base, fontWeight: "600", textAlign: "center" }} color="#fff">
                  {contextLabel}
                </ThemedText>
              )}
            </View>

            {/* Hype */}
            <ThemedText
              style={{ fontSize: FontSize.lg, fontWeight: "700", textAlign: "center", fontStyle: "italic", letterSpacing: 1.5, textTransform: "uppercase" }}
              color="#FFD700"
            >
              {hypeSubtitle}
            </ThemedText>

            {/* Footer */}
            <View style={{ alignItems: "center", gap: 3 }}>
              <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }} color="rgba(255,255,255,0.7)">
                @{handle || "dreamseeker"}
              </ThemedText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
                <ThemedText style={{ fontSize: FontSize.sm, fontWeight: "700", letterSpacing: 0.5 }} color="rgba(255,255,255,0.5)">
                  DreamSeeker
                </ThemedText>
                <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.3)" }} />
                <ThemedText style={{ fontSize: FontSize.sm, fontWeight: "500" }} color="rgba(255,255,255,0.4)">
                  @packslight
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: FontSize.xs, fontWeight: "500" }} color="rgba(255,255,255,0.35)">
                Start seeking ✦ dreamseekerapp.com
              </ThemedText>
            </View>
          </View>
        </ViewShot>
      )}
      <ConfettiCannon
        ref={confettiRef}
        count={ConfettiMedium.count}
        origin={{ x: width / 2, y: ConfettiMedium.originY }}
        autoStart={false}
        fadeOut
        fallSpeed={ConfettiMedium.fallSpeed}
        explosionSpeed={ConfettiMedium.explosionSpeed}
        colors={ConfettiMedium.colors as unknown as string[]}
      />
    </View>
  );
}
