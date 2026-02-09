import { View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, FontSize } from '@/constants/layout';
import { DREAM_CATEGORIES, DREAM_CATEGORY_LIST, CATEGORY_ICONS } from '@/constants/dreams';
import { type SlideColors, type DreamCategory } from './shared';
import { SelectionGrid } from './selection-grid';

export function CategoriesSlide({
  colors,
  selectedCategories,
  onToggle,
}: {
  colors: SlideColors;
  selectedCategories: DreamCategory[];
  onToggle: (category: DreamCategory) => void;
}) {
  const items = DREAM_CATEGORY_LIST.map((category) => {
    const config = DREAM_CATEGORIES[category];
    return {
      key: category,
      label: config.label,
      icon: CATEGORY_ICONS[category],
      color: config.color,
    };
  });

  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">What are you seeking?</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Select the categories that resonate with your dreams.
        </ThemedText>
      </View>

      <SelectionGrid
        items={items}
        selectedKeys={selectedCategories}
        onToggle={(key) => onToggle(key as DreamCategory)}
        colors={colors}
      />
    </View>
  );
}
