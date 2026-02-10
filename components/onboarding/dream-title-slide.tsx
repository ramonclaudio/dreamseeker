import { View, TextInput } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { DREAM_CATEGORIES, CATEGORY_ICONS } from '@/constants/dreams';
import { type SlideColors, type DreamCategory } from './shared';

export function DreamTitleSlide({
  colors,
  title,
  onChangeTitle,
  selectedCategory,
  selectedCategories,
  whyItMatters,
  onChangeWhyItMatters,
}: {
  colors: SlideColors;
  title: string;
  onChangeTitle: (text: string) => void;
  selectedCategory: DreamCategory;
  selectedCategories: DreamCategory[];
  whyItMatters?: string;
  onChangeWhyItMatters?: (text: string) => void;
}) {
  const categoryToUse = selectedCategories.includes(selectedCategory)
    ? selectedCategory
    : selectedCategories[0] || 'growth';
  const config = DREAM_CATEGORIES[categoryToUse];

  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">What&apos;s your first dream?</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Pick the dream that&apos;s calling you right now. You can add more later.
        </ThemedText>
      </View>

      <View style={{ gap: Spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingVertical: Spacing.sm,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: `${config.color}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSymbol
              name={CATEGORY_ICONS[categoryToUse]}
              size={IconSize.lg}
              color={config.color}
            />
          </View>
          <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
            {config.label}
          </ThemedText>
        </View>

        <TextInput
          style={{
            backgroundColor: colors.secondary,
            borderRadius: Radius.md,
            padding: Spacing.lg,
            fontSize: FontSize.xl,
            color: colors.foreground,
            borderWidth: 1,
            borderColor: colors.border,
            minHeight: 60,
          }}
          placeholder="Visit Japan, start a business, buy a home..."
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={onChangeTitle}
          autoFocus
          multiline
          returnKeyType="done"
          blurOnSubmit
          accessibilityLabel="Enter your dream title"
          accessibilityHint="Type the title of your first dream"
        />

        {onChangeWhyItMatters && (
          <TextInput
            style={{
              backgroundColor: colors.secondary,
              borderRadius: Radius.md,
              padding: Spacing.lg,
              fontSize: FontSize.base,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
              minHeight: 80,
              marginTop: Spacing.md,
            }}
            placeholder="Why does this matter to you? (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={whyItMatters}
            onChangeText={onChangeWhyItMatters}
            multiline
            accessibilityLabel="Why does this dream matter to you"
          />
        )}
      </View>
    </View>
  );
}
