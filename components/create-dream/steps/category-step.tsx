import { useState } from "react";
import { View, Pressable } from "react-native";

import { CustomCategoryPicker } from "@/components/ui/custom-category-picker";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { CloudShape } from "@/components/ui/cloud-shape";
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
const CLOUD_HEIGHT = 78;

// Staggered flex ratios per row for organic feel (keep ratio ≤ 1.3:1 to avoid text clipping)
const ROW_FLEX: [number, number][] = [
  [4, 5],
  [5, 4],
  [4, 5],
  [5, 4],
];

type CategoryItem = { key: DreamCategory; label: string; icon: IconSymbolName; color: string };

function getRows(items: CategoryItem[]): CategoryItem[][] {
  const rows: CategoryItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

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

  const presetItems: CategoryItem[] = PRESET_CATEGORIES.map((category) => ({
    key: category,
    label: DREAM_CATEGORIES[category].label,
    icon: CATEGORY_ICONS[category],
    color: DREAM_CATEGORIES[category].color,
  }));

  const customItem: CategoryItem = {
    key: 'custom',
    label: customName.trim() || 'Custom',
    icon: customIcon as IconSymbolName,
    color: customColor,
  };

  const allItems = [...presetItems, customItem];
  const rows = getRows(allItems);

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">Pick a category</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          What area of your life does this dream belong to?
        </ThemedText>
      </View>

      <View style={{ gap: Spacing.sm }}>
        {rows.map((row, rowIdx) => {
          const [flexL, flexR] = ROW_FLEX[rowIdx % ROW_FLEX.length];

          return (
            <View
              key={`row-${rowIdx}`}
              style={{
                flexDirection: 'row',
                gap: Spacing.xs,
                alignItems: 'center',
              }}
            >
              {row.map((item, colIdx) => {
                const isSelected = selected === item.key;
                const isCustom = item.key === 'custom';
                const flex = row.length === 2 ? (colIdx === 0 ? flexL : flexR) : 1;
                const variant = rowIdx * 2 + colIdx;

                return (
                  <Pressable
                    key={item.key}
                    onPress={() => isCustom ? handleSelectCustom() : handleSelectPreset(item.key)}
                    style={({ pressed }) => ({
                      opacity: pressed ? Opacity.pressed : 1,
                      flex,
                    })}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={item.label}
                  >
                    <View style={{ height: CLOUD_HEIGHT }}>
                      {/* Cloud SVG background */}
                      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        <CloudShape
                          fill={isSelected ? item.color : `${item.color}28`}
                          variant={variant}
                        />
                      </View>

                      {/* Content overlay */}
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: Spacing.xs,
                          paddingHorizontal: Spacing.md,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: isSelected ? `${colors.onColor}25` : `${item.color}20`,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconSymbol
                            name={item.icon}
                            size={IconSize.lg}
                            color={isSelected ? colors.onColor : item.color}
                          />
                        </View>
                        <ThemedText
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.8}
                          style={{
                            fontSize: FontSize.md,
                            fontWeight: '600',
                            flexShrink: 1,
                          }}
                          color={isSelected ? colors.onColor : colors.foreground}
                        >
                          {item.label}
                        </ThemedText>
                        {isSelected && (
                          <View
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              backgroundColor: `${colors.onColor}30`,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginLeft: 'auto',
                            }}
                          >
                            <IconSymbol name="checkmark" size={11} color={colors.onColor} />
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
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
