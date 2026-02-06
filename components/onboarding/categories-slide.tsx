import { View, Pressable } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MaterialCard } from '@/components/ui/material-card';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Opacity } from '@/constants/ui';
import { DREAM_CATEGORIES, DREAM_CATEGORY_LIST } from '@/constants/dreams';
import { haptics } from '@/lib/haptics';
import { type SlideColors, type DreamCategory, CATEGORY_ICONS } from './shared';

export function CategoriesSlide({
  colors,
  selectedCategories,
  onToggle,
}: {
  colors: SlideColors;
  selectedCategories: DreamCategory[];
  onToggle: (category: DreamCategory) => void;
}) {
  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">What are you seeking?</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Select the categories that resonate with your dreams.
        </ThemedText>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: Spacing.md,
        }}
      >
        {DREAM_CATEGORY_LIST.map((category) => {
          const config = DREAM_CATEGORIES[category];
          const isSelected = selectedCategories.includes(category);

          return (
            <Pressable
              key={category}
              onPress={() => {
                haptics.selection();
                onToggle(category);
              }}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: '45%',
                opacity: pressed ? Opacity.pressed : 1,
              })}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={config.label}
            >
              <MaterialCard
                style={{
                  padding: Spacing.lg,
                  alignItems: 'center',
                  gap: Spacing.sm,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? config.color : colors.border,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isSelected ? config.color : `${config.color}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconSymbol
                    name={CATEGORY_ICONS[category]}
                    size={IconSize['3xl']}
                    color={isSelected ? '#fff' : config.color}
                  />
                </View>
                <ThemedText style={{ fontSize: FontSize.lg, fontWeight: '600' }}>
                  {config.label}
                </ThemedText>
              </MaterialCard>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
