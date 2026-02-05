import { memo, useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useLocalSearchParams, router, Stack } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

import { api } from "@/convex/_generated/api";
import type { Id, Doc } from "@/convex/_generated/dataModel";
import { MaterialCard } from "@/components/ui/material-card";
import { GlassControl } from "@/components/ui/glass-control";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { Radius, type ColorPalette } from "@/constants/theme";
import { Spacing, TouchTarget, FontSize, MaxWidth, IconSize, HitSlop } from "@/constants/layout";
import { Opacity, Size } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";
import {
  DREAM_CATEGORIES,
  DREAM_CATEGORY_LIST,
  type DreamCategory,
} from "@/constants/dreams";

type Action = Doc<"actions">;

const CATEGORY_ICONS: Record<DreamCategory, any> = {
  travel: "airplane",
  money: "creditcard.fill",
  career: "briefcase.fill",
  lifestyle: "house.fill",
  growth: "leaf.fill",
  relationships: "heart.fill",
};

const ActionItem = memo(function ActionItem({
  action,
  onToggle,
  onEdit,
  onDelete,
  colors,
  categoryColor,
}: {
  action: Action;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  colors: ColorPalette;
  categoryColor: string;
}) {
  return (
    <MaterialCard style={{ marginBottom: Spacing.sm }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: Spacing.md + 2,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <Pressable
          onPress={onToggle}
          style={{
            flexDirection: "row",
            alignItems: "center",
            minHeight: TouchTarget.min,
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: action.isCompleted }}
          hitSlop={HitSlop.md}
        >
          <View
            style={{
              width: Size.checkbox,
              height: Size.checkbox,
              borderRadius: Radius.sm,
              borderWidth: 2,
              borderColor: categoryColor,
              backgroundColor: action.isCompleted ? categoryColor : "transparent",
              marginRight: Spacing.md,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {action.isCompleted && (
              <IconSymbol name="checkmark" size={14} color="#fff" weight="bold" />
            )}
          </View>
        </Pressable>
        <Pressable
          onPress={onEdit}
          onLongPress={onEdit}
          style={{
            flex: 1,
            minHeight: TouchTarget.min,
            justifyContent: "center",
          }}
          accessibilityRole="button"
          accessibilityLabel={`Edit action: ${action.text}`}
        >
          <ThemedText
            style={{
              fontSize: FontSize.xl,
              textDecorationLine: action.isCompleted ? "line-through" : "none",
              opacity: action.isCompleted ? 0.5 : 1,
            }}
            numberOfLines={2}
          >
            {action.text}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={{
            padding: Spacing.sm,
            minWidth: TouchTarget.min,
            minHeight: TouchTarget.min,
            justifyContent: "center",
            alignItems: "center",
          }}
          hitSlop={HitSlop.md}
        >
          <ThemedText
            style={{ fontSize: FontSize["5xl"], fontWeight: "400" }}
            color={colors.destructive}
          >
            ×
          </ThemedText>
        </Pressable>
      </View>
    </MaterialCard>
  );
});

function EditActionModal({
  visible,
  action,
  onClose,
  onSave,
  colors,
}: {
  visible: boolean;
  action: Action | null;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
  colors: ColorPalette;
}) {
  const [text, setText] = useState(action?.text ?? "");
  const [isLoading, setIsLoading] = useState(false);

  // Sync state when modal opens with new action
  useEffect(() => {
    if (visible && action) {
      setText(action.text);
    }
  }, [visible, action]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      await onSave(text.trim());
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
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
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
        <View style={{ padding: Spacing.xl }}>
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function EditDreamModal({
  visible,
  dream,
  onClose,
  onSave,
  colors,
}: {
  visible: boolean;
  dream: Doc<"dreams"> | null;
  onClose: () => void;
  onSave: (data: {
    title?: string;
    whyItMatters?: string;
    targetDate?: number;
    category?: DreamCategory;
  }) => Promise<void>;
  colors: ColorPalette;
}) {
  const [title, setTitle] = useState(dream?.title ?? "");
  const [whyItMatters, setWhyItMatters] = useState(dream?.whyItMatters ?? "");
  const [category, setCategory] = useState<DreamCategory>(
    (dream?.category as DreamCategory) ?? "growth"
  );
  const [targetDate, setTargetDate] = useState<Date | null>(
    dream?.targetDate ? new Date(dream.targetDate) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state when modal opens with dream data
  useEffect(() => {
    if (visible && dream) {
      setTitle(dream.title);
      setWhyItMatters(dream.whyItMatters ?? "");
      setCategory(dream.category as DreamCategory);
      setTargetDate(dream.targetDate ? new Date(dream.targetDate) : null);
    }
  }, [visible, dream]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      await onSave({
        title: title.trim(),
        whyItMatters: whyItMatters.trim() || undefined,
        targetDate: targetDate?.getTime(),
        category,
      });
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
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
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
          <ThemedText variant="subtitle">Edit Dream</ThemedText>
          <Pressable
            onPress={handleSave}
            disabled={isLoading || !title.trim()}
            hitSlop={HitSlop.sm}
          >
            <ThemedText
              style={{ fontWeight: "600", opacity: isLoading || !title.trim() ? 0.5 : 1 }}
            >
              {isLoading ? "Saving..." : "Save"}
            </ThemedText>
          </Pressable>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={{ gap: Spacing.sm }}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
              Dream Title
            </ThemedText>
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
              placeholder="Your dream..."
              placeholderTextColor={colors.mutedForeground}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Why It Matters */}
          <View style={{ gap: Spacing.sm }}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
              Why It Matters (Optional)
            </ThemedText>
            <TextInput
              style={{
                backgroundColor: colors.secondary,
                borderRadius: Radius.md,
                padding: Spacing.lg,
                fontSize: FontSize.xl,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 80,
              }}
              placeholder="What will achieving this dream mean to you?"
              placeholderTextColor={colors.mutedForeground}
              value={whyItMatters}
              onChangeText={setWhyItMatters}
              multiline
            />
          </View>

          {/* Target Date */}
          <View style={{ gap: Spacing.sm }}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
              Target Date (Optional)
            </ThemedText>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={{
                backgroundColor: colors.secondary,
                borderRadius: Radius.md,
                padding: Spacing.lg,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <ThemedText
                style={{ fontSize: FontSize.xl }}
                color={targetDate ? colors.foreground : colors.mutedForeground}
              >
                {targetDate
                  ? targetDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Select a date"}
              </ThemedText>
              {targetDate && (
                <Pressable
                  onPress={() => setTargetDate(null)}
                  hitSlop={HitSlop.md}
                >
                  <IconSymbol
                    name="xmark.circle.fill"
                    size={IconSize.xl}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              )}
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={targetDate ?? new Date()}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setTargetDate(selectedDate);
                }}
              />
            )}
          </View>

          {/* Category */}
          <View style={{ gap: Spacing.sm }}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: "500" }}>
              Category
            </ThemedText>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm }}>
              {DREAM_CATEGORY_LIST.map((cat) => {
                const config = DREAM_CATEGORIES[cat];
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      haptics.selection();
                      setCategory(cat);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: Spacing.xs,
                      paddingHorizontal: Spacing.md,
                      paddingVertical: Spacing.sm,
                      borderRadius: Radius.full,
                      backgroundColor: isSelected ? config.color : colors.secondary,
                      borderWidth: 1,
                      borderColor: isSelected ? config.color : colors.border,
                    }}
                  >
                    <IconSymbol
                      name={CATEGORY_ICONS[cat]}
                      size={IconSize.lg}
                      color={isSelected ? "#fff" : config.color}
                    />
                    <ThemedText
                      style={{ fontSize: FontSize.base, fontWeight: "500" }}
                      color={isSelected ? "#fff" : colors.foreground}
                    >
                      {config.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { isLoading: authLoading } = useConvexAuth();
  const [newActionText, setNewActionText] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [showEditDream, setShowEditDream] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);

  const dream = useQuery(api.dreams.get, { id: id as Id<"dreams"> });
  const createAction = useMutation(api.actions.create);
  const toggleAction = useMutation(api.actions.toggle);
  const updateAction = useMutation(api.actions.update);
  const removeAction = useMutation(api.actions.remove);
  const updateDream = useMutation(api.dreams.update);
  const completeDream = useMutation(api.dreams.complete);
  const archiveDream = useMutation(api.dreams.archive);
  const reopenDream = useMutation(api.dreams.reopen);
  const restoreDream = useMutation(api.dreams.restore);

  const categoryConfig = dream ? DREAM_CATEGORIES[dream.category as DreamCategory] : null;
  const categoryColor = categoryConfig?.color ?? colors.primary;

  const handleAddAction = async () => {
    if (!newActionText.trim() || !dream) return;
    haptics.medium();
    try {
      await createAction({
        dreamId: dream._id,
        text: newActionText.trim(),
      });
      setNewActionText("");
    } catch {
      haptics.error();
    }
  };

  const handleToggleAction = useCallback(
    async (actionId: Id<"actions">) => {
      haptics.selection();
      await toggleAction({ id: actionId });
    },
    [toggleAction]
  );

  const handleEditAction = useCallback((action: Action) => {
    haptics.selection();
    setEditingAction(action);
  }, []);

  const handleSaveAction = useCallback(
    async (text: string) => {
      if (!editingAction) return;
      haptics.success();
      await updateAction({ id: editingAction._id, text });
      setEditingAction(null);
    },
    [editingAction, updateAction]
  );

  const handleDeleteAction = useCallback(
    async (actionId: Id<"actions">) => {
      haptics.warning();
      await removeAction({ id: actionId });
    },
    [removeAction]
  );

  const handleSaveDream = useCallback(
    async (data: {
      title?: string;
      whyItMatters?: string;
      targetDate?: number;
      category?: DreamCategory;
    }) => {
      if (!dream) return;
      haptics.success();
      await updateDream({ id: dream._id, ...data });
    },
    [dream, updateDream]
  );

  const handleCompleteDream = async () => {
    if (!dream || isCompleting) return;

    const hasIncompleteActions = dream.actions?.some((a: Action) => !a.isCompleted);
    if (hasIncompleteActions) {
      Alert.alert(
        "Incomplete Actions",
        "You still have incomplete actions. Are you sure you want to mark this dream as complete?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Complete Anyway",
            onPress: async () => {
              setIsCompleting(true);
              haptics.success();
              shootConfetti();
              await completeDream({ id: dream._id });
              setIsCompleting(false);
              router.back();
            },
          },
        ]
      );
      return;
    }

    setIsCompleting(true);
    haptics.success();
    shootConfetti();
    await completeDream({ id: dream._id });
    setIsCompleting(false);
    router.back();
  };

  const handleArchiveDream = () => {
    if (!dream) return;

    Alert.alert(
      "Archive Dream",
      "Are you sure you want to archive this dream? You can restore it later.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            haptics.warning();
            await archiveDream({ id: dream._id });
            router.back();
          },
        },
      ]
    );
  };

  const handleReopenDream = () => {
    if (!dream) return;

    Alert.alert(
      "Reopen Dream",
      "This will mark the dream as active again and deduct the 100 XP that was awarded for completing it. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reopen",
          onPress: async () => {
            setIsCompleting(true);
            haptics.warning();
            try {
              await reopenDream({ id: dream._id });
            } catch (e) {
              if (e instanceof Error && e.message === "LIMIT_REACHED") {
                Alert.alert(
                  "Dream Limit Reached",
                  "You have reached your free dream limit. Upgrade to premium for unlimited dreams."
                );
              }
            }
            setIsCompleting(false);
          },
        },
      ]
    );
  };

  const handleRestoreDream = () => {
    if (!dream) return;

    Alert.alert(
      "Restore Dream",
      "This will restore the dream to your active dreams. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: async () => {
            setIsCompleting(true);
            haptics.success();
            try {
              await restoreDream({ id: dream._id });
            } catch (e) {
              if (e instanceof Error && e.message === "LIMIT_REACHED") {
                Alert.alert(
                  "Dream Limit Reached",
                  "You have reached your free dream limit. Upgrade to premium for unlimited dreams."
                );
              }
            }
            setIsCompleting(false);
          },
        },
      ]
    );
  };

  if (authLoading || dream === undefined) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (dream === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          padding: Spacing.xl,
        }}
      >
        <ThemedText
          style={{ fontSize: FontSize.xl, textAlign: "center" }}
          color={colors.mutedForeground}
        >
          Dream not found
        </ThemedText>
        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: Spacing.xl }}
        >
          <ThemedText style={{ fontWeight: "600" }} color={colors.primary}>
            Go Back
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  const completedActions = dream.actions?.filter((a: Action) => a.isCompleted).length ?? 0;
  const totalActions = dream.actions?.length ?? 0;
  const progress = totalActions > 0 ? completedActions / totalActions : 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: categoryConfig?.label ?? "Dream",
          headerTintColor: categoryColor,
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xl }}>
              <Pressable
                onPress={() => {
                  haptics.selection();
                  setShowEditDream(true);
                }}
                hitSlop={HitSlop.md}
                style={{ padding: Spacing.xs }}
              >
                <IconSymbol
                  name="pencil"
                  size={IconSize.xl}
                  color={colors.primary}
                />
              </Pressable>
              <Pressable
                onPress={handleArchiveDream}
                hitSlop={HitSlop.md}
                style={{ padding: Spacing.xs }}
              >
                <IconSymbol
                  name="trash.fill"
                  size={IconSize.xl}
                  color={colors.destructive}
                />
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingBottom: Spacing["4xl"],
          paddingHorizontal: Spacing.xl,
          maxWidth: MaxWidth.content,
          alignSelf: "center",
          width: "100%",
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        {/* Dream Header */}
        <View style={{ paddingVertical: Spacing.xl }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: Spacing.md,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: `${categoryColor}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol
                name="sparkles"
                size={IconSize["3xl"]}
                color={categoryColor}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText variant="title">
                {dream.title}
              </ThemedText>
              {dream.whyItMatters && (
                <ThemedText color={colors.mutedForeground} style={{ marginTop: Spacing.xs }}>
                  {dream.whyItMatters}
                </ThemedText>
              )}
              {dream.targetDate && (
                <ThemedText
                  style={{ fontSize: FontSize.sm, marginTop: Spacing.sm }}
                  color={colors.mutedForeground}
                >
                  Target:{" "}
                  {new Date(dream.targetDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </ThemedText>
              )}
            </View>
          </View>
        </View>

        {/* Progress */}
        {totalActions > 0 && (
          <View style={{ marginBottom: Spacing.xl }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: Spacing.sm,
              }}
            >
              <ThemedText
                style={{ fontSize: FontSize.sm }}
                color={colors.mutedForeground}
              >
                Progress
              </ThemedText>
              <ThemedText
                style={{ fontSize: FontSize.sm, fontWeight: "600" }}
                color={categoryColor}
              >
                {completedActions}/{totalActions} actions
              </ThemedText>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: colors.secondary,
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${progress * 100}%`,
                  backgroundColor: categoryColor,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        )}

        {/* Actions Section */}
        <View>
          <ThemedText
            style={{
              fontSize: FontSize.base,
              fontWeight: "600",
              textTransform: "uppercase",
              marginBottom: Spacing.sm,
              marginLeft: Spacing.xs,
            }}
            color={colors.mutedForeground}
          >
            Actions
          </ThemedText>

          {/* Add Action Input */}
          <View style={{ flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.lg }}>
            <MaterialCard style={{ flex: 1 }}>
              <TextInput
                style={{
                  paddingHorizontal: Spacing.lg,
                  paddingVertical: Spacing.md + 2,
                  fontSize: FontSize.xl,
                  color: colors.foreground,
                }}
                placeholder="Add an action step..."
                placeholderTextColor={colors.mutedForeground}
                value={newActionText}
                onChangeText={setNewActionText}
                onSubmitEditing={handleAddAction}
                returnKeyType="done"
              />
            </MaterialCard>
            <GlassControl
              isInteractive
              style={{ justifyContent: "center", paddingHorizontal: Spacing.xl }}
            >
              <Pressable
                onPress={handleAddAction}
                disabled={!newActionText.trim()}
                style={{
                  minHeight: TouchTarget.min,
                  justifyContent: "center",
                  opacity: !newActionText.trim() ? Opacity.disabled : 1,
                }}
              >
                <ThemedText style={{ fontWeight: "600", fontSize: FontSize.base }}>
                  Add
                </ThemedText>
              </Pressable>
            </GlassControl>
          </View>

          {/* Action List */}
          {dream.actions && dream.actions.length > 0 ? (
            dream.actions.map((action: Action) => (
              <ActionItem
                key={action._id}
                action={action}
                colors={colors}
                categoryColor={categoryColor}
                onToggle={() => handleToggleAction(action._id)}
                onEdit={() => handleEditAction(action)}
                onDelete={() => handleDeleteAction(action._id)}
              />
            ))
          ) : (
            <MaterialCard style={{ padding: Spacing.xl, alignItems: "center" }}>
              <ThemedText
                style={{ fontSize: FontSize.base, textAlign: "center" }}
                color={colors.mutedForeground}
              >
                Break down your dream into small, actionable steps.
              </ThemedText>
            </MaterialCard>
          )}
        </View>

        {/* Status-based Action Buttons */}
        {dream.status === "active" && (
          <Pressable
            onPress={handleCompleteDream}
            disabled={isCompleting}
            style={({ pressed }) => ({
              marginTop: Spacing.xl,
              opacity: pressed || isCompleting ? Opacity.pressed : 1,
            })}
          >
            <MaterialCard
              style={{
                backgroundColor: categoryColor,
                padding: Spacing.lg,
                alignItems: "center",
                borderRadius: Radius.lg,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}
              >
                <IconSymbol name="trophy.fill" size={IconSize["2xl"]} color="#fff" />
                <ThemedText
                  style={{ fontSize: FontSize.lg, fontWeight: "600" }}
                  color="#fff"
                >
                  {isCompleting ? "Completing..." : "Mark Dream Complete"}
                </ThemedText>
              </View>
            </MaterialCard>
          </Pressable>
        )}

        {dream.status === "completed" && (
          <View style={{ marginTop: Spacing.xl, gap: Spacing.md }}>
            <MaterialCard
              style={{
                backgroundColor: colors.success,
                padding: Spacing.lg,
                alignItems: "center",
                borderRadius: Radius.lg,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}
              >
                <IconSymbol name="checkmark.circle.fill" size={IconSize["2xl"]} color="#fff" />
                <ThemedText
                  style={{ fontSize: FontSize.lg, fontWeight: "600" }}
                  color="#fff"
                >
                  Dream Completed!
                </ThemedText>
              </View>
              {dream.completedAt && (
                <ThemedText
                  style={{ fontSize: FontSize.sm, marginTop: Spacing.xs }}
                  color="rgba(255,255,255,0.8)"
                >
                  {new Date(dream.completedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </ThemedText>
              )}
            </MaterialCard>
            <Pressable
              onPress={handleReopenDream}
              disabled={isCompleting}
              style={({ pressed }) => ({
                opacity: pressed || isCompleting ? Opacity.pressed : 1,
              })}
            >
              <MaterialCard
                style={{
                  padding: Spacing.lg,
                  alignItems: "center",
                  borderRadius: Radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <ThemedText
                  style={{ fontSize: FontSize.base, fontWeight: "600" }}
                  color={colors.mutedForeground}
                >
                  {isCompleting ? "Reopening..." : "Reopen Dream"}
                </ThemedText>
                <ThemedText
                  style={{ fontSize: FontSize.sm, marginTop: Spacing.xxs }}
                  color={colors.mutedForeground}
                >
                  This will deduct 100 XP
                </ThemedText>
              </MaterialCard>
            </Pressable>
          </View>
        )}

        {dream.status === "archived" && (
          <Pressable
            onPress={handleRestoreDream}
            disabled={isCompleting}
            style={({ pressed }) => ({
              marginTop: Spacing.xl,
              opacity: pressed || isCompleting ? Opacity.pressed : 1,
            })}
          >
            <MaterialCard
              style={{
                backgroundColor: colors.primary,
                padding: Spacing.lg,
                alignItems: "center",
                borderRadius: Radius.lg,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}
              >
                <IconSymbol name="arrow.up.right" size={IconSize["2xl"]} color="#fff" />
                <ThemedText
                  style={{ fontSize: FontSize.lg, fontWeight: "600" }}
                  color="#fff"
                >
                  {isCompleting ? "Restoring..." : "Restore Dream"}
                </ThemedText>
              </View>
            </MaterialCard>
          </Pressable>
        )}
      </ScrollView>

      {/* Edit Dream Modal */}
      <EditDreamModal
        visible={showEditDream}
        dream={dream}
        onClose={() => setShowEditDream(false)}
        onSave={handleSaveDream}
        colors={colors}
      />

      {/* Edit Action Modal */}
      <EditActionModal
        visible={editingAction !== null}
        action={editingAction}
        onClose={() => setEditingAction(null)}
        onSave={handleSaveAction}
        colors={colors}
      />
    </>
  );
}
