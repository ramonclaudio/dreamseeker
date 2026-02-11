import { useState, useCallback, useEffect } from 'react';
import { View, Modal, TextInput, Pressable, ScrollView, Switch, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { ThemedText } from '@/components/ui/themed-text';
import { GradientButton } from '@/components/ui/gradient-button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { DREAM_CATEGORIES, DREAM_CATEGORY_LIST, PIN_TAGS_MAX, PIN_TAG_LENGTH_MAX } from '@/convex/constants';
import type { DreamCategory } from '@/convex/constants';
import { CATEGORY_ICONS, CUSTOM_CATEGORY_ICONS, CUSTOM_CATEGORY_COLORS } from '@/constants/dreams';
import { CustomCategoryPicker } from '@/components/ui/custom-category-picker';
import { pickImageForPin } from '@/lib/image-picker';
import { haptics } from '@/lib/haptics';
import type { Pin } from '@/hooks/use-pins';
import type { Id } from '@/convex/_generated/dataModel';

type CreatePinModalProps = {
  visible: boolean;
  onClose: () => void;
  defaultPersonalOnly?: boolean;
  editPin?: Pin | null;
  boardId?: Id<'visionBoards'>;
};

export function CreatePinModal({ visible, onClose, defaultPersonalOnly, editPin, boardId }: CreatePinModalProps) {
  const colors = useColors();
  const { isPremium, showUpgrade } = useSubscription();
  const isEditing = !!editPin;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DreamCategory | undefined>(undefined);
  const [isPersonalOnly, setIsPersonalOnly] = useState(defaultPersonalOnly ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState(CUSTOM_CATEGORY_ICONS[0] as string);
  const [customColor, setCustomColor] = useState(CUSTOM_CATEGORY_COLORS[0] as string);

  const createPin = useMutation(api.pins.createPin);
  const updatePin = useMutation(api.pins.updatePin);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  // Pre-fill form when editing
  useEffect(() => {
    if (editPin && visible) {
      setTitle(editPin.title ?? '');
      setDescription(editPin.description ?? '');
      setCategory(editPin.category);
      setIsPersonalOnly(editPin.isPersonalOnly);
      setImageAspectRatio(editPin.imageAspectRatio ?? 1);
      setImageUri(null);
      setTags(editPin.tags ?? []);
      setTagInput('');
      setCustomName(editPin.customCategoryName ?? '');
      setCustomIcon(editPin.customCategoryIcon ?? CUSTOM_CATEGORY_ICONS[0] as string);
      setCustomColor(editPin.customCategoryColor ?? CUSTOM_CATEGORY_COLORS[0] as string);
    }
  }, [editPin, visible]);

  const reset = useCallback(() => {
    setTitle('');
    setDescription('');
    setCategory(undefined);
    setIsPersonalOnly(defaultPersonalOnly ?? false);
    setImageUri(null);
    setImageAspectRatio(1);
    setTags([]);
    setTagInput('');
    setCustomName('');
    setCustomIcon(CUSTOM_CATEGORY_ICONS[0] as string);
    setCustomColor(CUSTOM_CATEGORY_COLORS[0] as string);
  }, [defaultPersonalOnly]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePickImage = async () => {
    const result = await pickImageForPin(false);
    if (!result.canceled) {
      setImageUri(result.uri);
      setImageAspectRatio(result.height / result.width);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let imageStorageId: string | undefined;

      if (imageUri) {
        setIsUploading(true);
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': blob.type || 'image/jpeg' },
          body: blob,
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload image');
        const { storageId } = await uploadResponse.json();
        imageStorageId = storageId;
        setIsUploading(false);
      }

      const trimmedTags = tags.length > 0 ? tags : undefined;

      if (isEditing) {
        await updatePin({
          pinId: editPin!._id as any,
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          category,
          tags: trimmedTags,
          imageStorageId: imageStorageId as any,
          imageAspectRatio,
          isPersonalOnly,
          customCategoryName: category === 'custom' ? customName.trim() || undefined : undefined,
          customCategoryIcon: category === 'custom' ? customIcon : undefined,
          customCategoryColor: category === 'custom' ? customColor : undefined,
        });
      } else {
        await createPin({
          type: 'image',
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          category,
          tags: trimmedTags,
          imageStorageId: imageStorageId as any,
          imageAspectRatio,
          isPersonalOnly,
          boardId,
          customCategoryName: category === 'custom' ? customName.trim() || undefined : undefined,
          customCategoryIcon: category === 'custom' ? customIcon : undefined,
          customCategoryColor: category === 'custom' ? customColor : undefined,
        });
      }

      haptics.success();
      reset();
      onClose();
    } catch (e: any) {
      haptics.error();
      if (e.message?.includes('FREE_PIN_LIMIT') || e.message?.includes('FREE_COMMUNITY_PIN_LIMIT')) {
        reset();
        onClose();
        showUpgrade();
      }
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const addTag = (raw: string) => {
    const tag = raw.replace(/^#/, '').trim().slice(0, PIN_TAG_LENGTH_MAX);
    if (!tag || tags.includes(tag) || tags.length >= PIN_TAGS_MAX) return;
    setTags((prev) => [...prev, tag]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const hasExistingImage = isEditing && editPin?.imageUrl && !imageUri;
  const canSubmit = !isSubmitting && !!(imageUri || hasExistingImage);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="subtitle">{isEditing ? 'Edit Pin' : 'Create Pin'}</ThemedText>
          <Pressable onPress={handleClose} hitSlop={12}>
            <IconSymbol name="xmark" size={IconSize.xl} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          {/* Image picker */}
          <Pressable
            onPress={handlePickImage}
            style={[styles.imagePicker, { backgroundColor: colors.surfaceTinted, borderColor: colors.border }]}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
            ) : hasExistingImage ? (
              <Image source={{ uri: editPin!.imageUrl! }} style={styles.imagePreview} contentFit="cover" />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <IconSymbol name="photo.fill" size={IconSize['4xl']} color={colors.mutedForeground} />
                <ThemedText style={styles.imagePickerText} color={colors.mutedForeground}>Tap to select a photo</ThemedText>
              </View>
            )}
          </Pressable>

          {/* Title */}
          <TextInput
            style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Title"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />

          {/* Description */}
          {title.length > 0 && (
            <TextInput
              style={[styles.input, styles.multilineInput, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.mutedForeground}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
            />
          )}

          {/* Tags */}
          <ThemedText style={styles.sectionLabel} color={colors.mutedForeground}>
            Hashtags ({tags.length}/{PIN_TAGS_MAX})
          </ThemedText>
          {tags.length > 0 && (
            <View style={styles.tagChips}>
              {tags.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => removeTag(tag)}
                  style={[styles.tagChip, { backgroundColor: colors.surfaceTinted, borderColor: colors.border }]}
                >
                  <ThemedText style={styles.tagChipText} color={colors.foreground}>#{tag}</ThemedText>
                  <IconSymbol name="xmark" size={IconSize.sm} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          )}
          {tags.length < PIN_TAGS_MAX && (
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Add a hashtag..."
              placeholderTextColor={colors.mutedForeground}
              value={tagInput}
              onChangeText={(text) => {
                if (text.endsWith(' ') || text.endsWith(',')) {
                  addTag(text);
                } else {
                  setTagInput(text);
                }
              }}
              onSubmitEditing={() => addTag(tagInput)}
              returnKeyType="done"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={PIN_TAG_LENGTH_MAX + 1}
            />
          )}

          {/* Category chips */}
          <ThemedText style={styles.sectionLabel} color={colors.mutedForeground}>Category (optional)</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
            {DREAM_CATEGORY_LIST.map((cat) => {
              const config = DREAM_CATEGORIES[cat];
              const isSelected = category === cat;
              const chipColor = cat === 'custom' && isSelected && customColor ? customColor : config.color;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(isSelected ? undefined : cat)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? chipColor : colors.surfaceTinted,
                      borderColor: isSelected ? chipColor : colors.border,
                    },
                  ]}
                >
                  <IconSymbol name={CATEGORY_ICONS[cat]} size={IconSize.md} color={isSelected ? '#fff' : chipColor} />
                  <ThemedText style={styles.categoryLabel} color={isSelected ? '#fff' : colors.foreground}>
                    {cat === 'custom' && customName ? customName : config.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Custom category picker */}
          {category === 'custom' && (
            <View style={styles.customCategorySection}>
              <CustomCategoryPicker
                customName={customName}
                onNameChange={setCustomName}
                customIcon={customIcon}
                onIconChange={setCustomIcon}
                customColor={customColor}
                onColorChange={setCustomColor}
                colors={colors}
                autoFocusName
              />
            </View>
          )}

          {/* Community toggle — premium only */}
          {isPremium && (
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabel}>
                <ThemedText style={styles.toggleTitle}>Pin to community</ThemedText>
                <ThemedText style={styles.toggleSubtitle} color={colors.mutedForeground}>
                  Others can see this pin
                </ThemedText>
              </View>
              <Switch
                value={!isPersonalOnly}
                onValueChange={(v) => setIsPersonalOnly(!v)}
                trackColor={{ true: colors.primary }}
              />
            </View>
          )}
        </ScrollView>

        {/* Submit */}
        <View style={styles.footer}>
          {isUploading && (
            <View style={styles.uploadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <ThemedText style={styles.uploadingText} color={colors.mutedForeground}>Uploading...</ThemedText>
            </View>
          )}
          <GradientButton
            onPress={handleSubmit}
            label={isSubmitting ? (isEditing ? 'Saving...' : 'Pinning...') : (isEditing ? 'Save' : 'Pin it')}
            disabled={!canSubmit}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  body: { flex: 1, paddingHorizontal: Spacing.xl },
  footer: { padding: Spacing.xl, paddingTop: Spacing.md },
  // Image picker
  imagePicker: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  imagePickerPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  imagePickerText: {
    fontSize: FontSize.base,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: Radius.lg,
  },
  // Inputs
  input: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.base,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Category
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  categoryLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  customCategorySection: {
    marginBottom: Spacing.md,
  },
  // Tags
  tagChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  toggleLabel: { flex: 1 },
  toggleTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  toggleSubtitle: {
    fontSize: FontSize.sm,
  },
  // Upload
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  uploadingText: {
    fontSize: FontSize.sm,
  },
});
