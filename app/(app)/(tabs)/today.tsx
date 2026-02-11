import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { useMemo } from "react";

import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { TabHeader } from "@/components/ui/tab-header";
import { TodayActionItem } from "@/components/today/action-item";
import { GetStartedCards } from "@/components/today/get-started-cards";
import { BadgeEarnedModal } from "@/components/engagement/badge-earned-modal";
import { StreakMilestoneToast } from "@/components/engagement/streak-milestone-toast";
import { FirstActionModal } from "@/components/engagement/first-action-modal";
import { AllDoneOverlay } from "@/components/engagement/all-done-overlay";
import { useColors } from "@/hooks/use-color-scheme";
import { useToday } from "@/hooks/use-today";
import { useSubscription } from "@/hooks/use-subscription";
import { Radius } from "@/constants/theme";
import type { ColorPalette } from "@/constants/theme";
import { Spacing, FontSize, MaxWidth, IconSize, TAB_BAR_CLEARANCE } from "@/constants/layout";
import { haptics } from "@/lib/haptics";

// ---------------------------------------------------------------------------
// Week Calendar Strip
// ---------------------------------------------------------------------------
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function WeekCalendarStrip({ colors }: { colors: ColorPalette }) {
  const today = new Date();
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const todayStr = today.toDateString();
  const mondayTime = monday.getTime();

  const week = useMemo(() => {
    const mon = new Date(mondayTime);
    return DAY_LABELS.map((label, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return { label, date: d.getDate(), isToday: d.toDateString() === todayStr };
    });
  }, [todayStr, mondayTime]);

  return (
    <View style={{ marginBottom: Spacing.xl }}>
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: Spacing.sm }}>
        {week.map((d) => (
          <ThemedText
            key={d.label}
            style={{
              fontSize: FontSize.sm,
              fontWeight: d.isToday ? "700" : "400",
              width: 40,
              textAlign: "center",
            }}
            color={d.isToday ? colors.foreground : colors.mutedForeground}
          >
            {d.label}
          </ThemedText>
        ))}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        {week.map((d) => (
          <View
            key={`${d.label}-${d.date}`}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: d.isToday ? colors.primary : colors.card,
              alignItems: "center",
              justifyContent: "center",
              ...(d.isToday ? {} : { borderWidth: 1, borderColor: colors.border }),
            }}
          >
            <ThemedText
              style={{ fontSize: FontSize.base, fontWeight: d.isToday ? "700" : "500" }}
              color={d.isToday ? colors.onColor : colors.foreground}
            >
              {d.date}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------
function SectionHeader({
  title,
  onSeeAll,
  colors,
}: {
  title: string;
  onSeeAll: () => void;
  colors: ColorPalette;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: Spacing.md,
      }}
    >
      <ThemedText
        style={{ fontSize: FontSize["4xl"], fontWeight: "700" }}
        color={colors.foreground}
      >
        {title}
      </ThemedText>
      <Pressable
        onPress={() => {
          haptics.light();
          onSeeAll();
        }}
        accessibilityRole="button"
        accessibilityLabel={`See all ${title}`}
      >
        <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
          See all
        </ThemedText>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// My Dreams — Full-width banner, surfaceTinted bg, icon on right
// ---------------------------------------------------------------------------
function DreamBanner({
  colors,
  onPress,
  totalDreams,
}: {
  colors: ColorPalette;
  onPress: () => void;
  totalDreams: number;
}) {
  const title =
    totalDreams === 0
      ? "Start your first dream"
      : totalDreams === 1
        ? "1 dream in progress"
        : `${totalDreams} dreams in progress`;

  const subtitle =
    totalDreams === 0
      ? "Set a goal and start chasing it."
      : "Keep the momentum going.";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      accessibilityRole="button"
      accessibilityLabel="View and manage your dreams"
    >
      <View
        style={{
          backgroundColor: colors.surfaceTinted,
          borderRadius: Radius["2xl"],
          borderWidth: 1,
          borderColor: colors.borderAccent,
          padding: Spacing.xl,
          flexDirection: "row",
          alignItems: "center",
          minHeight: 110,
        }}
      >
        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: FontSize["3xl"], fontWeight: "700", marginBottom: Spacing.xs }}>
            {title}
          </ThemedText>
          <ThemedText style={{ fontSize: FontSize.base, lineHeight: 20 }} color={colors.mutedForeground}>
            {subtitle}
          </ThemedText>
        </View>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: `${colors.primary}15`,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: Spacing.lg,
          }}
        >
          <IconSymbol name="cloud.fill" size={IconSize["3xl"]} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// My Actions — 2x2 grid, uniform card bg with icon accent
// ---------------------------------------------------------------------------
type ActionItem = {
  id: string;
  title: string;
  icon: IconSymbolName;
  route: string;
};

const ACTIONS: ActionItem[] = [
  { id: "dream", title: "New Dream", icon: "sparkles", route: "/(app)/create-dream" },
  { id: "step", title: "New Action", icon: "plus.circle.fill", route: "/(app)/create-action" },
  { id: "focus", title: "Focus", icon: "timer", route: "/(app)/focus-timer" },
  { id: "vision", title: "Manifest", icon: "square.grid.2x2", route: "/(app)/(tabs)/boards" },
];

function ActionGrid({ colors }: { colors: ColorPalette }) {
  const { canCreateDream, showUpgrade } = useSubscription();

  const handleAction = (a: ActionItem) => {
    haptics.light();
    if (a.id === 'dream' && !canCreateDream) {
      showUpgrade();
      return;
    }
    router.push(a.route as never);
  };

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, marginBottom: Spacing["3xl"] }}>
      {ACTIONS.map((a) => (
        <Pressable
          key={a.id}
          onPress={() => handleAction(a)}
          style={({ pressed }) => ({
            width: "47.5%" as unknown as number,
            flexGrow: 1,
            opacity: pressed ? 0.92 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel={a.title}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderAccent,
              borderRadius: Radius.xl,
              paddingVertical: Spacing.xl,
              paddingHorizontal: Spacing.lg,
              alignItems: "center",
              gap: Spacing.sm,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: `${colors.primary}12`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol name={a.icon} size={IconSize.xl} color={colors.primary} />
            </View>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "600" }} color={colors.foreground}>
              {a.title}
            </ThemedText>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// My Journal — Time-of-day cards: Morning, Afternoon, Evening
// ---------------------------------------------------------------------------
type TimeOfDay = "morning" | "afternoon" | "evening";

const JOURNAL_OPTIONS: {
  id: TimeOfDay;
  label: string;
  subtitle: string;
  icon: IconSymbolName;
  iconColor: (c: ColorPalette) => string;
  iconBg: (c: ColorPalette) => string;
}[] = [
  {
    id: "morning",
    label: "Morning",
    subtitle: "Set your intentions.",
    icon: "sun.max.fill",
    iconColor: (c) => c.gold,
    iconBg: (c) => `${c.gold}18`,
  },
  {
    id: "afternoon",
    label: "Afternoon",
    subtitle: "Check in with yourself.",
    icon: "sun.min.fill",
    iconColor: (c) => c.primary,
    iconBg: (c) => `${c.primary}15`,
  },
  {
    id: "evening",
    label: "Evening",
    subtitle: "Reflect on your day.",
    icon: "moon.fill",
    iconColor: (c) => c.mutedForeground,
    iconBg: (c) => `${c.mutedForeground}15`,
  },
];

function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function JournalCards({ colors }: { colors: ColorPalette }) {
  const current = getCurrentTimeOfDay();

  return (
    <View style={{ flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.xl }}>
      {JOURNAL_OPTIONS.map((opt) => {
        const isActive = opt.id === current;
        return (
          <Pressable
            key={opt.id}
            onPress={() => {
              haptics.light();
              router.push("/(app)/journal-entry");
            }}
            style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.92 : 1 })}
            accessibilityRole="button"
            accessibilityLabel={`${opt.label} reflection`}
          >
            <View
              style={{
                backgroundColor: isActive ? colors.surfaceTinted : colors.card,
                borderWidth: 1,
                borderColor: isActive ? colors.borderAccentStrong : colors.borderAccent,
                borderRadius: Radius.xl,
                padding: Spacing.md,
                minHeight: 130,
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: opt.iconBg(colors),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol name={opt.icon} size={IconSize.xl} color={opt.iconColor(colors)} />
              </View>
              <View>
                <ThemedText
                  style={{ fontSize: FontSize.lg, fontWeight: "700", marginBottom: Spacing.xxs }}
                >
                  {opt.label}
                </ThemedText>
                <ThemedText style={{ fontSize: FontSize.xs, lineHeight: 16 }} color={colors.mutedForeground}>
                  {opt.subtitle}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Today Screen
// ---------------------------------------------------------------------------
export default function TodayScreen() {
  const colors = useColors();

  const {
    user,
    pendingActions,
    handleToggleAction,
    totalDreams,
    getStartedCards,
    dismissGetStarted,
    newBadge,
    setNewBadge,
    streakMilestone,
    setStreakMilestone,
    showFirstAction,
    setShowFirstAction,
    showAllDone,
    setShowAllDone,
  } = useToday();

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hasPendingActions = (pendingActions?.length ?? 0) > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_CLEARANCE,
          paddingHorizontal: Spacing.lg,
          maxWidth: MaxWidth.content,
          alignSelf: "center",
          width: "100%",
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* ── 1. Greeting + Date + Avatar ── */}
        <TabHeader
          title={
            user?.displayName || user?.name
              ? `Hi, ${(user.displayName ?? user.name)!.split(" ")[0]}`
              : "Home"
          }
          subtitle={dateStr}
        />

        {/* ── 2. Week Calendar Strip ── */}
        <WeekCalendarStrip colors={colors} />

        {/* ── Get Started Cards (new users with 0 dreams) ── */}
        {totalDreams === 0 && getStartedCards.length > 0 && (
          <GetStartedCards
            cards={getStartedCards}
            onDismiss={dismissGetStarted}
            onPress={(action) => {
              haptics.light();
              router.push(action as never);
            }}
          />
        )}

        {/* ── Today's Actions — pending actions checklist ── */}
        {hasPendingActions && (
          <View style={{ marginBottom: Spacing["3xl"] }}>
            <SectionHeader
              title="Knock these out"
              onSeeAll={() => router.push("/(app)/(tabs)/(dreams)")}
              colors={colors}
            />
            {pendingActions!.map((action) => (
              <TodayActionItem
                key={action._id}
                action={action}
                onToggle={() => handleToggleAction(action._id)}
                onFocus={() =>
                  router.push({
                    pathname: "/(app)/focus-timer" as const,
                    params: {
                      dreamId: action.dreamId,
                      actionId: action._id,
                      actionText: action.text,
                    },
                  } as never)
                }
                colors={colors}
              />
            ))}
          </View>
        )}

        {/* ── My Dreams — landscape banner ── */}
        <SectionHeader
          title="My Dreams"
          onSeeAll={() => router.push("/(app)/(tabs)/(dreams)")}
          colors={colors}
        />
        <View style={{ marginBottom: Spacing["3xl"] }}>
          <DreamBanner
            colors={colors}
            totalDreams={totalDreams}
            onPress={() => {
              haptics.light();
              router.push("/(app)/(tabs)/(dreams)");
            }}
          />
        </View>

        {/* ── My Actions — 2x2 grid ── */}
        <SectionHeader
          title="My Actions"
          onSeeAll={() => router.push("/(app)/(tabs)/(dreams)")}
          colors={colors}
        />
        <ActionGrid colors={colors} />

        {/* ── My Journal — time-of-day cards ── */}
        <SectionHeader
          title="My Journal"
          onSeeAll={() => router.push("/(app)/(tabs)/(dreams)/journal")}
          colors={colors}
        />
        <JournalCards colors={colors} />
      </ScrollView>

      {/* First Action Modal (highest priority) */}
      <FirstActionModal visible={showFirstAction} onDismiss={() => setShowFirstAction(false)} />

      {/* Streak Milestone Toast (after first action dismisses) */}
      <StreakMilestoneToast
        visible={streakMilestone !== null && !showFirstAction}
        streak={streakMilestone?.streak ?? 0}
        xpReward={streakMilestone?.xpReward ?? 0}
        handle={user?.displayName ?? user?.name}
        onDismiss={() => setStreakMilestone(null)}
      />

      {/* Badge Earned Modal (after other celebrations dismiss) */}
      <BadgeEarnedModal
        visible={newBadge !== null && !showFirstAction && streakMilestone === null}
        badge={newBadge}
        handle={user?.displayName ?? user?.name}
        onDismiss={() => setNewBadge(null)}
      />

      {/* All Done Overlay (after everything else) */}
      <AllDoneOverlay visible={showAllDone && !showFirstAction && streakMilestone === null && newBadge === null} onDismiss={() => setShowAllDone(false)} />
    </View>
  );
}
