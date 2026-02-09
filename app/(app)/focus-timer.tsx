import { useState, useCallback, useRef, useEffect } from "react";
import { View, Pressable, TextInput } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MaterialCard } from "@/components/ui/material-card";
import { GlassControl } from "@/components/ui/glass-control";
import { GradientButton } from "@/components/ui/gradient-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { useFocusTimer } from "@/hooks/use-focus-timer";
import { Spacing, FontSize, IconSize, TouchTarget } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { Opacity } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";

const DURATION_PRESETS = [
  { label: "15 min", seconds: 15 * 60 },
  { label: "25 min", seconds: 25 * 60 },
  { label: "45 min", seconds: 45 * 60 },
  { label: "60 min", seconds: 60 * 60 },
];

const RING_SIZE = 220;
const STROKE_WIDTH = 12;
const RING_RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
  const timer = useFocusTimer(25 * 60);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");

  const dream = useQuery(
    api.dreams.get,
    dreamId ? { id: dreamId as Id<"dreams"> } : "skip"
  );
  const completeFocusSession = useMutation(api.focusSessions.complete);

  const handleComplete = useCallback(async () => {
    try {
      const result = await completeFocusSession({
        dreamId: dreamId ? (dreamId as Id<"dreams">) : undefined,
        actionId: actionId ? (actionId as Id<"actions">) : undefined,
        duration: timer.duration,
      });
      haptics.success();
      shootConfetti();
      setCompletionMessage(`Session complete! +${result.xpAwarded} XP`);
    } catch {
      haptics.error();
      setCompletionMessage("Session complete! XP will sync shortly.");
    }
  }, [completeFocusSession, dreamId, actionId, timer.duration]);

  const prevStatusRef = useRef(timer.status);
  useEffect(() => {
    if (timer.status === "complete" && prevStatusRef.current !== "complete") {
      handleComplete();
    }
    prevStatusRef.current = timer.status;
  }, [timer.status, handleComplete]);

  const handleCustomConfirm = () => {
    const mins = parseInt(customMinutes, 10);
    if (mins >= 1 && mins <= 180) {
      haptics.selection();
      timer.setDuration(mins * 60);
      setIsCustom(false);
      setCustomMinutes("");
    } else {
      haptics.error();
    }
  };

  const strokeDashoffset = CIRCUMFERENCE * (1 - timer.progress);
  const contextLabel = actionText ? actionText : dream?.title ?? null;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + Spacing.md,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.xl,
      }}
    >
      {/* Close button */}
      <View style={{ alignItems: "flex-end" }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          accessibilityHint="Returns to previous screen"
          style={{
            width: TouchTarget.min,
            height: TouchTarget.min,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconSymbol name="xmark" size={IconSize["2xl"]} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Context label */}
      {contextLabel && (
        <View style={{ alignItems: "center", marginTop: Spacing.md }}>
          <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
            {actionText ? "Working on" : "Focusing on"}
          </ThemedText>
          <ThemedText
            style={{ fontSize: FontSize["2xl"], fontWeight: "600", textAlign: "center" }}
            numberOfLines={2}
          >
            {contextLabel}
          </ThemedText>
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
                    backgroundColor: isSelected ? colors.accentBlue : colors.secondary,
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
                backgroundColor: isCustom ? colors.accentBlue : colors.secondary,
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
                  width: 80,
                  textAlign: "center",
                  fontVariant: ["tabular-nums"],
                }}
                placeholder="30"
                placeholderTextColor={colors.mutedForeground}
                value={customMinutes}
                onChangeText={(t) => setCustomMinutes(t.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                maxLength={3}
                returnKeyType="done"
                onSubmitEditing={handleCustomConfirm}
                autoFocus
              />
              <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
                minutes
              </ThemedText>
              <Pressable
                onPress={handleCustomConfirm}
                disabled={!customMinutes || parseInt(customMinutes, 10) < 1}
                accessibilityRole="button"
                accessibilityLabel="Confirm custom duration"
                accessibilityState={{ disabled: !customMinutes || parseInt(customMinutes, 10) < 1 }}
                style={({ pressed }) => ({
                  opacity: pressed ? Opacity.pressed : !customMinutes ? Opacity.disabled : 1,
                  paddingHorizontal: Spacing.md,
                  paddingVertical: Spacing.sm,
                  borderRadius: Radius.md,
                  backgroundColor: colors.accentBlue,
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

      {/* Timer ring */}
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

        {completionMessage && (
          <MaterialCard
            style={{
              marginTop: Spacing.xl,
              padding: Spacing.lg,
              backgroundColor: colors.successBackground,
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
              <IconSymbol name="checkmark.circle.fill" size={IconSize["2xl"]} color={colors.success} />
              <ThemedText style={{ fontSize: FontSize.lg, fontWeight: "600" }} color={colors.success}>
                {completionMessage}
              </ThemedText>
            </View>
          </MaterialCard>
        )}
      </View>

      {/* Controls */}
      <View style={{ gap: Spacing.md, alignItems: "center" }}>
        {timer.status === "idle" && (
          <GradientButton
            onPress={() => { haptics.medium(); timer.start(); }}
            label="Start Focus"
            icon={<IconSymbol name="timer" size={IconSize["2xl"]} color={colors.onColor} />}
            style={{ width: "100%" }}
          />
        )}

        {timer.status === "running" && (
          <TimerControlButton label="Pause" onPress={() => { haptics.light(); timer.pause(); }} tint={colors.accentBlue} textColor={colors.onColor} />
        )}

        {timer.status === "paused" && (
          <TimerControlButton label="Resume" onPress={() => { haptics.light(); timer.resume(); }} tint={colors.accentBlue} textColor={colors.onColor} />
        )}

        {timer.status === "complete" && (
          <TimerControlButton label="Done" onPress={() => router.back()} tint={colors.accentBlue} textColor={colors.onColor} />
        )}

        {(timer.status === "running" || timer.status === "paused") && (
          <Pressable
            onPress={() => { haptics.warning(); timer.reset(); setCompletionMessage(null); }}
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
    </View>
  );
}
