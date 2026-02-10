import { View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, FontSize } from '@/constants/layout';
import { DREAM_CATEGORIES, DREAM_CATEGORY_LIST, CATEGORY_ICONS } from '@/constants/dreams';
import {
  type SlideColors,
  type DreamCategory,
  type Personality,
  type Motivation,
  PERSONALITY_OPTIONS,
  MOTIVATION_OPTIONS,
} from './shared';
import { RadioOptionList } from './radio-option-list';
import { SelectionGrid } from './selection-grid';

export function YouAndGoalsSlide({
  colors,
  selectedPersonality,
  onSelectPersonality,
  selectedMotivations,
  onToggleMotivation,
  selectedCategories,
  onToggleCategory,
}: {
  colors: SlideColors;
  selectedPersonality: Personality | null;
  onSelectPersonality: (personality: Personality) => void;
  selectedMotivations: Motivation[];
  onToggleMotivation: (motivation: Motivation) => void;
  selectedCategories: DreamCategory[];
  onToggleCategory: (category: DreamCategory) => void;
}) {
  const motivationItems = MOTIVATION_OPTIONS.map((option) => ({
    key: option.value,
    label: option.label,
    icon: option.icon,
    color: colors.accent,
  }));

  const categoryItems = DREAM_CATEGORY_LIST.map((category) => {
    const config = DREAM_CATEGORIES[category];
    return {
      key: category,
      label: config.label,
      icon: CATEGORY_ICONS[category],
      color: config.color,
    };
  });

  return (
    <View style={{ flex: 1, gap: Spacing['2xl'] }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">You + Your Goals</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Help us personalize your experience.
        </ThemedText>
      </View>

      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="subtitle">Which one sounds like you?</ThemedText>
      </View>
      <RadioOptionList
        options={PERSONALITY_OPTIONS}
        selected={selectedPersonality}
        onSelect={onSelectPersonality}
        colors={colors}
        accessibilityPrefix="Personality"
      />

      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="subtitle">What brings you here?</ThemedText>
      </View>
      <SelectionGrid
        items={motivationItems}
        selectedKeys={selectedMotivations}
        onToggle={(key) => onToggleMotivation(key as Motivation)}
        colors={colors}
      />

      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="subtitle">What are you seeking?</ThemedText>
      </View>
      <SelectionGrid
        items={categoryItems}
        selectedKeys={selectedCategories}
        onToggle={(key) => onToggleCategory(key as DreamCategory)}
        colors={colors}
      />
    </View>
  );
}
