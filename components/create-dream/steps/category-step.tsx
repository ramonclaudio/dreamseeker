import { useState } from "react";
import { View, Pressable } from "react-native";

import { CustomCategoryPicker } from "@/components/ui/custom-category-picker";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { MaterialCard } from "@/components/ui/material-card";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { haptics } from "@/lib/haptics";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import {
  DREAM_CATEGORIES,
  DREAM_CATEGORY_LIST,
  CUSTOM_CATEGORY_ICONS,
  CUSTOM_CATEGORY_COLORS,
  type DreamCategory,
  CATEGORY_ICONS,
} from "@/constants/dreams";
import type { CustomCategoryConfig } from "@/hooks/use-create-dream";

const PRESET_CATEGORIES = DREAM_CATEGORY_LIST.filter((c) => c !== 'custom');
const MAX_CUSTOM_NAME_LENGTH = 30;

export function CategoryStep({
  selected,
  onSelect,
  customConfig,
  onSelectCustom,
}: {
  selected: DreamCategory | null;
  onSelect: (cat: DreamCategory | null) => void;
  customConfig: CustomCategoryConfig | null;
  onSelectCustom: (config: CustomCategoryConfig | null) => void;
}) {
  const colors = useColors();
  const [customName, setCustomName] = useState(customConfig?.name ?? '');
  const [customIcon, setCustomIcon] = useState<string>(customConfig?.icon ?? CUSTOM_CATEGORY_ICONS[0]);
  const [customColor, setCustomColor] = useState<string>(customConfig?.color ?? CUSTOM_CATEGORY_COLORS[0]);

  const isCustomSelected = selected === 'custom';

  const handleSelectPreset = (category: DreamCategory) => {
    haptics.selection();
    onSelect(category);
    onSelectCustom(null);
  };

  const handleSelectCustom = () => {
    haptics.selection();
    onSelect('custom');
    onSelectCustom({ name: customName, icon: customIcon, color: customColor });
  };

  const handleCustomNameChange = (text: string) => {
    const trimmed = text.slice(0, MAX_CUSTOM_NAME_LENGTH);
    setCustomName(trimmed);
    onSelectCustom({ name: trimmed, icon: customIcon, color: customColor });
  };

  const handleIconSelect = (icon: string) => {
    haptics.selection();
    setCustomIcon(icon);
    onSelectCustom({ name: customName, icon, color: customColor });
  };

  const handleColorSelect = (color: string) => {
    haptics.selection();
    setCustomColor(color);
    onSelectCustom({ name: customName, icon: customIcon, color });
  };

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">Pick a category</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          What area of your life does this dream belong to?
        </ThemedText>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md }}>
        {PRESET_CATEGORIES.map((category) => {
          const config = DREAM_CATEGORIES[category];
          const isSelected = selected === category;

          return (
            <Pressable
              key={category}
              onPress={() => handleSelectPreset(category)}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: '45%',
                opacity: pressed ? Opacity.pressed : 1,
              })}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
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
                    color={isSelected ? colors.onColor : config.color}
                  />
                </View>
                <ThemedText style={{ fontSize: FontSize.lg, fontWeight: '600' }}>
                  {config.label}
                </ThemedText>
              </MaterialCard>
            </Pressable>
          );
        })}

        {/* Custom card */}
        <Pressable
          onPress={handleSelectCustom}
          style={({ pressed }) => ({
            flex: 1,
            minWidth: '45%',
            opacity: pressed ? Opacity.pressed : 1,
          })}
          accessibilityRole="radio"
          accessibilityState={{ selected: isCustomSelected }}
          accessibilityLabel="Custom category"
        >
          <MaterialCard
            style={{
              padding: Spacing.lg,
              alignItems: 'center',
              gap: Spacing.sm,
              borderWidth: isCustomSelected ? 2 : 1,
              borderColor: isCustomSelected ? customColor : colors.border,
              borderStyle: isCustomSelected ? 'solid' : 'dashed',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: isCustomSelected ? customColor : `${customColor}20`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSymbol
                name={customIcon as IconSymbolName}
                size={IconSize['3xl']}
                color={isCustomSelected ? colors.onColor : customColor}
              />
            </View>
            <ThemedText style={{ fontSize: FontSize.lg, fontWeight: '600' }}>
              {customName.trim() || 'Custom'}
            </ThemedText>
          </MaterialCard>
        </Pressable>
      </View>

      {/* Custom config inline inputs */}
      {isCustomSelected && (
        <CustomCategoryPicker
          customName={customName}
          onNameChange={handleCustomNameChange}
          customIcon={customIcon}
          onIconChange={handleIconSelect}
          customColor={customColor}
          onColorChange={handleColorSelect}
          colors={colors}
          autoFocusName
        />
      )}
    </View>
  );
}
