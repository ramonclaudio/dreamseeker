import { View, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { memo, useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import { MaterialCard } from '@/components/ui/material-card';
import { SwipeableRow } from '@/components/ui/swipeable-row';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { EditActionModal } from '@/components/dream/edit-action-modal';
import { BadgeEarnedModal } from '@/components/engagement/badge-earned-modal';
import { StreakMilestoneToast } from '@/components/engagement/streak-milestone-toast';
import { FirstActionModal } from '@/components/engagement/first-action-modal';
import { XpCelebration } from '@/components/ui/xp-celebration';
import { useColors } from '@/hooks/use-color-scheme';
import { useDeadlineLabel } from '@/hooks/use-deadline-label';
import { Spacing, FontSize, IconSize, MaxWidth, TAB_BAR_CLEARANCE, TouchTarget } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { ColorPalette } from '@/constants/theme';
import { getCategoryConfig } from '@/constants/dreams';
import { haptics } from '@/lib/haptics';
import { shootConfetti } from '@/lib/confetti';
import { timezone } from '@/lib/timezone';
import { scheduleActionReminder, cancelActionReminder } from '@/lib/local-notifications';

// ── Action Row ──────────────────────────────────────────────────────────────

type PendingAction = {
  _id: string;
  text: string;
  dreamId: string;
  dreamTitle: string;
  dreamCategory?: string;
  deadline?: number;
};

const AllActionsRow = memo(function AllActionsRow({
  action,
  checked,
  celebrating,
  onToggle,
  onEdit,
  onDelete,
  onCelebrationComplete,
  colors,
}: {
  action: PendingAction;
  checked: boolean;
  celebrating: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCelebrationComplete: () => void;
  colors: ColorPalette;
}) {
  const categoryColor = action.dreamCategory
    ? getCategoryConfig({ category: action.dreamCategory }).color
    : colors.primary;
  const deadlineInfo = useDeadlineLabel(checked ? undefined : action.deadline);

  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <SwipeableRow
        onComplete={checked ? undefined : onToggle}
        onEdit={checked ? undefined : onEdit}
        onDelete={checked ? undefined : onDelete}
        completeColor={colors.success}
        editColor={colors.accent}
        deleteColor={colors.destructive}
        enabled={!checked}
      >
        <Pressable
          onPress={checked ? undefined : onEdit}
          disabled={checked}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          accessibilityRole="button"
          accessibilityLabel={`${action.text}, for dream: ${action.dreamTitle}`}
        >
          <MaterialCard>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: Spacing.lg,
                minHeight: TouchTarget.min,
                gap: Spacing.md,
                borderLeftWidth: 3,
                borderLeftColor: categoryColor,
                borderRadius: Radius.lg,
              }}
            >
              {/* Checkbox */}
              <Pressable
                onPress={checked ? undefined : onToggle}
                disabled={checked}
                hitSlop={8}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 2.5,
                    borderColor: categoryColor,
                    backgroundColor: checked ? categoryColor : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {checked && (
                    <IconSymbol name="checkmark" size={16} color={colors.onColor} weight="bold" />
                  )}
                </View>
              </Pressable>

              {/* Content */}
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={{
                    fontSize: FontSize.xl,
                    ...(checked && {
                      textDecorationLine: 'line-through' as const,
                      opacity: 0.4,
                    }),
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
                {deadlineInfo && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: Spacing.xxs,
                    }}
                  >
                    <IconSymbol
                      name={deadlineInfo.isOverdue ? 'exclamationmark.circle.fill' : 'clock'}
                      size={12}
                      color={deadlineInfo.isOverdue ? colors.destructive : colors.mutedForeground}
                    />
                    <ThemedText
                      style={{ fontSize: FontSize.xs, fontWeight: '500' }}
                      color={deadlineInfo.isOverdue ? colors.destructive : colors.mutedForeground}
                    >
                      {deadlineInfo.label}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
            <XpCelebration
              visible={celebrating}
              xpAmount={10}
              color={categoryColor}
              onComplete={onCelebrationComplete}
            />
          </MaterialCard>
        </Pressable>
      </SwipeableRow>
    </View>
  );
});

// ── Screen ──────────────────────────────────────────────────────────────────

export default function AllActionsScreen() {
  const colors = useColors();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const handleBack = useCallback(() => {
    if (from === 'today') {
      router.navigate('/(app)/(tabs)/today');
    } else {
      router.back();
    }
  }, [from]);
  const [refreshing, setRefreshing] = useState(false);
  const [editingAction, setEditingAction] = useState<Doc<'actions'> | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  // Celebration state
  const [newBadge, setNewBadge] = useState<{
    key: string;
    title: string;
    description?: string;
    icon?: string;
  } | null>(null);
  const [streakMilestone, setStreakMilestone] = useState<{
    streak: number;
    xpReward: number;
  } | null>(null);
  const [showFirstAction, setShowFirstAction] = useState(false);

  const user = useQuery(api.auth.getCurrentUser);
  const pendingActions = useQuery(api.actions.listPending, {});
  const toggleAction = useMutation(api.actions.toggle);
  const updateAction = useMutation(api.actions.update);
  const removeAction = useMutation(api.actions.remove);

  // Sort: deadline actions first (soonest), then no-deadline in original order
  const sortedActions = useMemo(() => {
    if (!pendingActions) return null;
    const withDeadline = pendingActions
      .filter((a) => a.deadline !== undefined)
      .sort((a, b) => a.deadline! - b.deadline!);
    const withoutDeadline = pendingActions.filter((a) => a.deadline === undefined);
    return [...withDeadline, ...withoutDeadline];
  }, [pendingActions]);

  const handleToggle = useCallback(
    async (id: string) => {
      try {
        haptics.success();
        setCompletedIds((prev) => new Set(prev).add(id));
        setCelebratingId(id);
        shootConfetti('small');
        setTimeout(() => haptics.light(), 200);

        const result = await toggleAction({
          id: id as Id<'actions'>,
          timezoneOffsetMinutes: new Date().getTimezoneOffset(),
          timezone,
        });
        cancelActionReminder(id);
        if (result?.isFirstAction) setShowFirstAction(true);
        if (result?.newBadge) setNewBadge(result.newBadge);
        if (result?.streakMilestone) setStreakMilestone(result.streakMilestone);
      } catch {
        haptics.error();
        setCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [toggleAction],
  );

  const handleEdit = useCallback((action: Doc<'actions'>) => {
    haptics.selection();
    setEditingAction(action);
  }, []);

  const handleSaveAction = useCallback(
    async (text: string, deadline?: number, clearDeadline?: boolean, reminder?: number, clearReminder?: boolean) => {
      if (!editingAction) return;
      try {
        await updateAction({ id: editingAction._id, text, deadline, clearDeadline, reminder, clearReminder });

        if (clearReminder) {
          cancelActionReminder(editingAction._id);
        } else if (reminder) {
          const dreamTitle = (editingAction as { dreamTitle?: string }).dreamTitle ?? "your dream";
          scheduleActionReminder({
            actionId: editingAction._id,
            actionText: text,
            dreamTitle,
            reminderMs: reminder,
          });
        }

        haptics.success();
        setEditingAction(null);
      } catch {
        haptics.error();
      }
    },
    [editingAction, updateAction],
  );

  const handleDelete = useCallback(
    (actionId: Id<'actions'>, text: string) => {
      Alert.alert('Delete Action', `Delete "${text}"? This will also deduct any XP earned.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAction({ id: actionId, timezone });
              cancelActionReminder(actionId);
              haptics.warning();
            } catch {
              haptics.error();
              Alert.alert('Delete Failed', 'Could not delete action. Please try again.');
            }
          },
        },
      ]);
    },
    [removeAction],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  const isLoading = pendingActions === undefined;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={handleBack}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, paddingRight: Spacing.md }}
              hitSlop={8}
            >
              <IconSymbol name="chevron.left" size={22} color={colors.primary} weight="medium" />
              <ThemedText style={{ fontSize: 17 }} color={colors.primary}>
                Back
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: TAB_BAR_CLEARANCE,
          maxWidth: MaxWidth.content,
          alignSelf: 'center',
          width: '100%',
        }}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* New Action Button */}
        <Pressable
          onPress={() => {
            haptics.light();
            router.push('/(app)/create-action');
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            paddingVertical: Spacing.lg,
            marginTop: Spacing.lg,
            marginBottom: Spacing.lg,
            borderRadius: Radius.lg,
            backgroundColor: colors.accent,
            opacity: pressed ? 0.8 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Create new action"
        >
          <IconSymbol name="plus" size={IconSize.xl} color={colors.onColor} weight="bold" />
          <ThemedText style={{ fontSize: FontSize.xl, fontWeight: '600' }} color={colors.onColor}>
            New Action
          </ThemedText>
        </Pressable>

        {/* Action List */}
        {isLoading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <ThemedText color={colors.mutedForeground}>Loading...</ThemedText>
          </View>
        ) : sortedActions && sortedActions.length > 0 ? (
          sortedActions.map((action) => (
            <AllActionsRow
              key={action._id}
              action={action}
              checked={completedIds.has(action._id)}
              celebrating={celebratingId === action._id}
              onToggle={() => handleToggle(action._id)}
              onEdit={() => handleEdit(action as Doc<'actions'>)}
              onDelete={() => handleDelete(action._id as Id<'actions'>, action.text)}
              onCelebrationComplete={() => setCelebratingId(null)}
              colors={colors}
            />
          ))
        ) : (
          <MaterialCard style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <IconSymbol name="checkmark.circle.fill" size={IconSize['4xl']} color={colors.accent} />
            <ThemedText
              style={{
                fontSize: FontSize.lg,
                marginTop: Spacing.md,
                textAlign: 'center',
              }}
              color={colors.mutedForeground}
            >
              No pending actions. Add one to get started!
            </ThemedText>
          </MaterialCard>
        )}
      </ScrollView>

      {/* Edit Action Modal */}
      <EditActionModal
        visible={editingAction !== null}
        action={editingAction}
        onClose={() => setEditingAction(null)}
        onSave={handleSaveAction}
        colors={colors}
      />

      {/* Celebrations */}
      <FirstActionModal visible={showFirstAction} onDismiss={() => setShowFirstAction(false)} />
      <StreakMilestoneToast
        visible={streakMilestone !== null && !showFirstAction}
        streak={streakMilestone?.streak ?? 0}
        xpReward={streakMilestone?.xpReward ?? 0}
        handle={user?.displayName ?? user?.name}
        onDismiss={() => setStreakMilestone(null)}
      />
      <BadgeEarnedModal
        visible={newBadge !== null && !showFirstAction && streakMilestone === null}
        badge={newBadge}
        handle={user?.displayName ?? user?.name}
        onDismiss={() => setNewBadge(null)}
      />
    </View>
  );
}
