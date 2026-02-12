import { useState } from 'react';
import { View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { GradientButton } from '@/components/ui/gradient-button';
import { useColors } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { haptics } from '@/lib/haptics';
import { shootConfetti } from '@/lib/confetti';
import { scheduleActionReminder } from '@/lib/local-notifications';
import { DREAM_CATEGORIES } from '@/convex/constants';
import { Spacing, FontSize, IconSize, TouchTarget, HitSlop } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { Id } from '@/convex/_generated/dataModel';

export default function CreateActionScreen() {
  const colors = useColors();
  const { showUpgrade } = useSubscription();
  const dreams = useQuery(api.dreams.list, {});
  const createAction = useMutation(api.actions.create);
  const [selectedDreamId, setSelectedDreamId] = useState<Id<'dreams'> | null>(null);
  const [actionText, setActionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [reminder, setReminder] = useState<Date | null>(null);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  const activeDreams = dreams ?? [];
  const canSubmit = selectedDreamId && actionText.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const actionId = await createAction({
        dreamId: selectedDreamId,
        text: actionText.trim(),
        deadline: deadline?.getTime(),
        reminder: reminder?.getTime(),
      });

      // Schedule local notification for exact reminder time
      if (reminder && actionId) {
        const dreamTitle = activeDreams.find((d) => d._id === selectedDreamId)?.title ?? "your dream";
        scheduleActionReminder({
          actionId,
          actionText: actionText.trim(),
          dreamTitle,
          reminderMs: reminder.getTime(),
        });
      }

      haptics.success();
      shootConfetti('small');
      router.back();
    } catch (e: any) {
      haptics.error();
      if (e.message?.includes('FREE_ACTION_LIMIT')) {
        showUpgrade();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.separator }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={HitSlop.sm}
            style={{
              minHeight: TouchTarget.min,
              minWidth: TouchTarget.min,
              justifyContent: "center" as const,
            }}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <ThemedText color={colors.mutedForeground}>Cancel</ThemedText>
          </Pressable>
          <ThemedText variant="subtitle" accessibilityRole="header">
            New Action
          </ThemedText>
          <View style={{ minWidth: TouchTarget.min }} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Dream picker */}
          <View style={styles.section}>
            <ThemedText style={styles.label} color={colors.foreground}>
              Link to a dream
            </ThemedText>
            <ThemedText style={styles.hint} color={colors.mutedForeground}>
              Every action needs a dream. Pick one.
            </ThemedText>

            {activeDreams.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surfaceTinted, borderColor: colors.border }]}>
                <IconSymbol name="sparkles" size={IconSize['2xl']} color={colors.mutedForeground} />
                <ThemedText style={styles.emptyText} color={colors.mutedForeground}>
                  No active dreams yet. Create a dream first!
                </ThemedText>
                <Pressable
                  onPress={() => {
                    router.back();
                    router.push('/(app)/create-dream');
                  }}
                >
                  <ThemedText style={styles.link} color={colors.primary}>
                    Create a Dream
                  </ThemedText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.pillGrid}>
                {activeDreams.map((dream) => {
                  const isSelected = selectedDreamId === dream._id;
                  const category = DREAM_CATEGORIES[dream.category as keyof typeof DREAM_CATEGORIES];
                  const pillColor = category?.color ?? colors.primary;

                  return (
                    <Pressable
                      key={dream._id}
                      onPress={() => {
                        haptics.light();
                        setSelectedDreamId(dream._id);
                      }}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: isSelected ? pillColor : colors.surfaceTinted,
                          borderColor: isSelected ? pillColor : colors.border,
                        },
                      ]}
                    >
                      <ThemedText
                        style={styles.pillText}
                        color={isSelected ? '#fff' : colors.foreground}
                        numberOfLines={1}
                      >
                        {dream.title}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Action text input */}
          <View style={styles.section}>
            <ThemedText style={styles.label} color={colors.foreground}>
              What&apos;s the action?
            </ThemedText>
            <ThemedText style={styles.hint} color={colors.mutedForeground}>
              Keep it small — something you can knock out in 15 min or less.
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceTinted,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={actionText}
              onChangeText={setActionText}
              placeholder="e.g. Research flights to Tokyo"
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={200}
              autoFocus={false}
            />
          </View>

          {/* Deadline picker */}
          <View style={styles.section}>
            <ThemedText style={styles.label} color={colors.foreground}>
              Deadline
            </ThemedText>
            <ThemedText style={styles.hint} color={colors.mutedForeground}>
              Optional — add time pressure to stay on track.
            </ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Pressable
                onPress={() => {
                  haptics.light();
                  if (!deadline) setDeadline(new Date(Date.now() + 24 * 60 * 60 * 1000));
                  setShowPicker(true);
                }}
                style={[
                  styles.deadlineTrigger,
                  {
                    backgroundColor: colors.surfaceTinted,
                    borderColor: colors.border,
                  },
                ]}
              >
                <IconSymbol name="clock" size={IconSize.lg} color={colors.mutedForeground} />
                <ThemedText
                  style={{ fontSize: FontSize.base }}
                  color={deadline ? colors.foreground : colors.mutedForeground}
                >
                  {deadline
                    ? deadline.toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'No deadline'}
                </ThemedText>
              </Pressable>
              {deadline && (
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setDeadline(null);
                    setShowPicker(false);
                  }}
                  hitSlop={HitSlop.sm}
                >
                  <ThemedText style={{ fontSize: FontSize.base, fontWeight: '600' }} color={colors.destructive}>
                    Clear
                  </ThemedText>
                </Pressable>
              )}
            </View>
            {showPicker && deadline && (
              <DateTimePicker
                value={deadline}
                mode="datetime"
                display="spinner"
                minimumDate={new Date()}
                onChange={(_event, date) => {
                  if (date) setDeadline(date);
                }}
              />
            )}
          </View>

          {/* Reminder picker */}
          <View style={styles.section}>
            <ThemedText style={styles.label} color={colors.foreground}>
              Reminder
            </ThemedText>
            <ThemedText style={styles.hint} color={colors.mutedForeground}>
              Get a push notification at this time.
            </ThemedText>
            {/* Quick presets when deadline is set */}
            {deadline && !reminder && (
              <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
                {[
                  { label: '15 min before', offset: 15 * 60 * 1000 },
                  { label: '1 hr before', offset: 60 * 60 * 1000 },
                  { label: '1 day before', offset: 24 * 60 * 60 * 1000 },
                ].map((preset) => {
                  const presetTime = deadline.getTime() - preset.offset;
                  if (presetTime <= Date.now()) return null;
                  return (
                    <Pressable
                      key={preset.label}
                      onPress={() => {
                        haptics.light();
                        setReminder(new Date(presetTime));
                      }}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: colors.surfaceTinted,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <ThemedText style={styles.pillText} color={colors.foreground}>
                        {preset.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Pressable
                onPress={() => {
                  haptics.light();
                  if (!reminder) {
                    const defaultTime = deadline
                      ? new Date(deadline.getTime() - 60 * 60 * 1000)
                      : new Date(Date.now() + 60 * 60 * 1000);
                    if (defaultTime.getTime() <= Date.now()) {
                      defaultTime.setTime(Date.now() + 15 * 60 * 1000);
                    }
                    setReminder(defaultTime);
                  }
                  setShowReminderPicker(true);
                }}
                style={[
                  styles.deadlineTrigger,
                  {
                    backgroundColor: colors.surfaceTinted,
                    borderColor: colors.border,
                  },
                ]}
              >
                <IconSymbol name="bell.fill" size={IconSize.lg} color={colors.mutedForeground} />
                <ThemedText
                  style={{ fontSize: FontSize.base }}
                  color={reminder ? colors.foreground : colors.mutedForeground}
                >
                  {reminder
                    ? reminder.toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'No reminder'}
                </ThemedText>
              </Pressable>
              {reminder && (
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setReminder(null);
                    setShowReminderPicker(false);
                  }}
                  hitSlop={HitSlop.sm}
                >
                  <ThemedText style={{ fontSize: FontSize.base, fontWeight: '600' }} color={colors.destructive}>
                    Clear
                  </ThemedText>
                </Pressable>
              )}
            </View>
            {showReminderPicker && reminder && (
              <DateTimePicker
                value={reminder}
                mode="datetime"
                display="spinner"
                minimumDate={new Date()}
                onChange={(_event, date) => {
                  if (date) setReminder(date);
                }}
              />
            )}
          </View>
        </ScrollView>

        {/* Submit button */}
        <View style={styles.footer}>
          <GradientButton
            label={isSubmitting ? 'Adding...' : 'Add Action'}
            onPress={handleSubmit}
            disabled={!canSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 0.5,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  hint: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    maxWidth: '100%',
  },
  pillText: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  link: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  input: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    fontSize: FontSize.base,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  deadlineTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
});
