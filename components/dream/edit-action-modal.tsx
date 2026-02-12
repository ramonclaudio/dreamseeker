import { useState, useEffect } from "react";
import { View, Pressable, TextInput, Modal, KeyboardAvoidingView, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import type { Doc } from "@/convex/_generated/dataModel";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import type { ColorPalette } from "@/constants/theme";
import { Radius } from "@/constants/theme";
import { Spacing, FontSize, IconSize, HitSlop } from "@/constants/layout";
import { haptics } from "@/lib/haptics";

type Action = Doc<"actions">;

const REMINDER_PRESETS = [
  { label: "15 min before", offset: 15 * 60 * 1000 },
  { label: "1 hr before", offset: 60 * 60 * 1000 },
  { label: "1 day before", offset: 24 * 60 * 60 * 1000 },
] as const;

function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EditActionModal({
  visible,
  action,
  onClose,
  onSave,
  colors,
}: {
  visible: boolean;
  action: Action | null;
  onClose: () => void;
  onSave: (
    text: string,
    deadline?: number,
    clearDeadline?: boolean,
    reminder?: number,
    clearReminder?: boolean,
  ) => Promise<void>;
  colors: ColorPalette;
}) {
  const [text, setText] = useState(action?.text ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [deadlineCleared, setDeadlineCleared] = useState(false);
  const [reminder, setReminder] = useState<Date | null>(null);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderCleared, setReminderCleared] = useState(false);

  // Sync state when modal opens with new action
  useEffect(() => {
    if (visible && action) {
      setText(action.text);
      setDeadline(action.deadline ? new Date(action.deadline) : null);
      setDeadlineCleared(false);
      setShowDeadlinePicker(false);
      setReminder(action.reminder ? new Date(action.reminder) : null);
      setReminderCleared(false);
      setShowReminderPicker(false);
    }
  }, [visible, action]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      await onSave(
        text.trim(),
        deadlineCleared ? undefined : deadline?.getTime(),
        deadlineCleared || undefined,
        reminderCleared ? undefined : reminder?.getTime(),
        reminderCleared || undefined,
      );
      onClose();
    } catch {
      haptics.error();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: Spacing.xl,
            paddingVertical: Spacing.lg,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.separator,
          }}
        >
          <Pressable onPress={onClose} hitSlop={HitSlop.sm}>
            <ThemedText color={colors.mutedForeground}>Cancel</ThemedText>
          </Pressable>
          <ThemedText variant="subtitle">Edit Action</ThemedText>
          <Pressable
            onPress={handleSave}
            disabled={isLoading || !text.trim()}
            hitSlop={HitSlop.sm}
          >
            <ThemedText
              style={{ fontWeight: "600", opacity: isLoading || !text.trim() ? 0.5 : 1 }}
            >
              {isLoading ? "Saving..." : "Save"}
            </ThemedText>
          </Pressable>
        </View>
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ padding: Spacing.xl, gap: Spacing.xl }}>
            <TextInput
              style={{
                backgroundColor: colors.secondary,
                borderRadius: Radius.md,
                padding: Spacing.lg,
                fontSize: FontSize.xl,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholder="Action step..."
              placeholderTextColor={colors.mutedForeground}
              value={text}
              onChangeText={setText}
              autoFocus
              multiline
            />

            {/* Deadline picker */}
            <View style={{ gap: Spacing.sm }}>
              <ThemedText style={{ fontSize: FontSize.base, fontWeight: "600" }} color={colors.foreground}>
                Deadline
              </ThemedText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
                <Pressable
                  onPress={() => {
                    haptics.light();
                    if (!deadline) {
                      setDeadline(new Date(Date.now() + 24 * 60 * 60 * 1000));
                      setDeadlineCleared(false);
                    }
                    setShowDeadlinePicker(true);
                  }}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: Spacing.sm,
                    borderRadius: Radius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.secondary,
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.md,
                  }}
                >
                  <IconSymbol name="clock" size={IconSize.lg} color={colors.mutedForeground} />
                  <ThemedText
                    style={{ fontSize: FontSize.base }}
                    color={deadline ? colors.foreground : colors.mutedForeground}
                  >
                    {deadline ? formatDateTime(deadline) : "No deadline"}
                  </ThemedText>
                </Pressable>
                {deadline && (
                  <Pressable
                    onPress={() => {
                      haptics.light();
                      setDeadline(null);
                      setDeadlineCleared(true);
                      setShowDeadlinePicker(false);
                    }}
                    hitSlop={HitSlop.sm}
                  >
                    <ThemedText style={{ fontSize: FontSize.base, fontWeight: "600" }} color={colors.destructive}>
                      Clear
                    </ThemedText>
                  </Pressable>
                )}
              </View>
              {showDeadlinePicker && deadline && (
                <DateTimePicker
                  value={deadline}
                  mode="datetime"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(_event, date) => {
                    if (date) {
                      setDeadline(date);
                      setDeadlineCleared(false);
                    }
                  }}
                />
              )}
            </View>

            {/* Reminder picker */}
            <View style={{ gap: Spacing.sm }}>
              <ThemedText style={{ fontSize: FontSize.base, fontWeight: "600" }} color={colors.foreground}>
                Reminder
              </ThemedText>
              {/* Quick presets when deadline is set */}
              {deadline && !reminder && (
                <View style={{ flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" }}>
                  {REMINDER_PRESETS.map((preset) => {
                    const presetTime = deadline.getTime() - preset.offset;
                    if (presetTime <= Date.now()) return null;
                    return (
                      <Pressable
                        key={preset.label}
                        onPress={() => {
                          haptics.light();
                          setReminder(new Date(presetTime));
                          setReminderCleared(false);
                        }}
                        style={{
                          paddingHorizontal: Spacing.md,
                          paddingVertical: Spacing.sm,
                          borderRadius: Radius.full,
                          borderWidth: 1,
                          borderColor: colors.borderAccent,
                          backgroundColor: colors.surfaceTinted,
                        }}
                      >
                        <ThemedText style={{ fontSize: FontSize.sm, fontWeight: "500" }} color={colors.foreground}>
                          {preset.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
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
                      setReminderCleared(false);
                    }
                    setShowReminderPicker(true);
                  }}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: Spacing.sm,
                    borderRadius: Radius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.secondary,
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.md,
                  }}
                >
                  <IconSymbol name="bell.fill" size={IconSize.lg} color={colors.mutedForeground} />
                  <ThemedText
                    style={{ fontSize: FontSize.base }}
                    color={reminder ? colors.foreground : colors.mutedForeground}
                  >
                    {reminder ? formatDateTime(reminder) : "No reminder"}
                  </ThemedText>
                </Pressable>
                {reminder && (
                  <Pressable
                    onPress={() => {
                      haptics.light();
                      setReminder(null);
                      setReminderCleared(true);
                      setShowReminderPicker(false);
                    }}
                    hitSlop={HitSlop.sm}
                  >
                    <ThemedText style={{ fontSize: FontSize.base, fontWeight: "600" }} color={colors.destructive}>
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
                    if (date) {
                      setReminder(date);
                      setReminderCleared(false);
                    }
                  }}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
