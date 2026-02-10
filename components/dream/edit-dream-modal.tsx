import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import type { Doc } from "@/convex/_generated/dataModel";
import { CustomCategoryPicker } from "@/components/ui/custom-category-picker";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import type { ColorPalette } from "@/constants/theme";
import { Radius } from "@/constants/theme";
import { Spacing, FontSize, IconSize, HitSlop } from "@/constants/layout";
import { haptics } from "@/lib/haptics";

import {
  DREAM_CATEGORIES,
  DREAM_CATEGORY_LIST,
  CUSTOM_CATEGORY_ICONS,
  CUSTOM_CATEGORY_COLORS,
  type DreamCategory,
  CATEGORY_ICONS,
} from "@/constants/dreams";

export function EditDreamModal({
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
    customCategoryName?: string;
    customCategoryIcon?: string;
    customCategoryColor?: string;
  }) => Promise<void>;
  colors: ColorPalette;
}) {
  const [title, setTitle] = useState(dream?.title ?? "");
  const [whyItMatters, setWhyItMatters] = useState(dream?.whyItMatters ?? "");
  const [category, setCategory] = useState<DreamCategory>(
    (dream?.category as DreamCategory) ?? "growth"
  );
  const [customName, setCustomName] = useState(dream?.customCategoryName ?? "");
  const [customIcon, setCustomIcon] = useState(dream?.customCategoryIcon ?? CUSTOM_CATEGORY_ICONS[0]);
  const [customColor, setCustomColor] = useState(dream?.customCategoryColor ?? CUSTOM_CATEGORY_COLORS[0]);
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
      setCustomName(dream.customCategoryName ?? "");
      setCustomIcon(dream.customCategoryIcon ?? CUSTOM_CATEGORY_ICONS[0]);
      setCustomColor(dream.customCategoryColor ?? CUSTOM_CATEGORY_COLORS[0]);
      setTargetDate(dream.targetDate ? new Date(dream.targetDate) : null);
    }
  }, [visible, dream]);

  const handleSave = async () => {
    if (!title.trim()) return;
    if (category === 'custom' && !customName.trim()) return;
    setIsLoading(true);
    try {
      await onSave({
        title: title.trim(),
        whyItMatters: whyItMatters.trim() || undefined,
        targetDate: targetDate?.getTime(),
        category,
        customCategoryName: category === 'custom' ? customName : undefined,
        customCategoryIcon: category === 'custom' ? customIcon : undefined,
        customCategoryColor: category === 'custom' ? customColor : undefined,
      });
      onClose();
    } catch {
      haptics.error();
    } finally {
      setIsLoading(false);
    }
  };

  const isCustomSelected = category === 'custom';
  const canSave = title.trim().length > 0 && (!isCustomSelected || customName.trim().length > 0);

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
          <ThemedText variant="subtitle">Edit Dream</ThemedText>
          <Pressable
            onPress={handleSave}
            disabled={isLoading || !canSave}
            hitSlop={HitSlop.sm}
          >
            <ThemedText
              style={{ fontWeight: "600", opacity: isLoading || !canSave ? 0.5 : 1 }}
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
              <>
                <DateTimePicker
                  value={targetDate ?? new Date()}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(_, selectedDate) => {
                    if (selectedDate) setTargetDate(selectedDate);
                  }}
                />
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  style={{
                    alignSelf: "center",
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.xl,
                  }}
                >
                  <ThemedText style={{ fontSize: FontSize.base, fontWeight: "600" }} color={colors.primary}>
                    Done
                  </ThemedText>
                </Pressable>
              </>
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
                const chipColor = cat === 'custom' ? customColor : config.color;
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
                      backgroundColor: isSelected ? chipColor : colors.secondary,
                      borderWidth: 1,
                      borderColor: isSelected ? chipColor : colors.border,
                      borderStyle: cat === 'custom' && !isSelected ? 'dashed' : 'solid',
                    }}
                  >
                    <IconSymbol
                      name={CATEGORY_ICONS[cat]}
                      size={IconSize.lg}
                      color={isSelected ? colors.onColor : chipColor}
                    />
                    <ThemedText
                      style={{ fontSize: FontSize.base, fontWeight: "500" }}
                      color={isSelected ? colors.onColor : colors.foreground}
                    >
                      {cat === 'custom' && customName.trim() ? customName.trim() : config.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Custom category config */}
          {isCustomSelected && (
            <CustomCategoryPicker
              customName={customName}
              onNameChange={(t) => setCustomName(t)}
              customIcon={customIcon}
              onIconChange={setCustomIcon}
              customColor={customColor}
              onColorChange={setCustomColor}
              colors={colors}
              nameLabel="Custom Category Name"
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
