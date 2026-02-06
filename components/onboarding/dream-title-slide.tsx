import { View, TextInput } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { DREAM_CATEGORIES } from '@/constants/dreams';
import { type SlideColors, type DreamCategory, CATEGORY_ICONS } from './shared';

export function DreamTitleSlide({
  colors,
  title,
  onChangeTitle,
  selectedCategory,
  selectedCategories,
}: {
  colors: SlideColors;
  title: string;
  onChangeTitle: (text: string) => void;
  selectedCategory: DreamCategory;
  selectedCategories: DreamCategory[];
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
          Start with something that excites you. You can always add more later.
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
          placeholder="e.g., Visit Japan, Start a business..."
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
      </View>
    </View>
  );
}
