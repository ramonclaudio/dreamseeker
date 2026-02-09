import { View, ScrollView, Pressable, TextInput } from "react-native";

import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { MaterialCard } from "@/components/ui/material-card";
import { ThemedText } from "@/components/ui/themed-text";
import { CUSTOM_CATEGORY_ICONS, CUSTOM_CATEGORY_COLORS } from "@/constants/dreams";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { type ColorPalette, Radius } from "@/constants/theme";
import { Opacity } from "@/constants/ui";
import { haptics } from "@/lib/haptics";

const MAX_CUSTOM_NAME_LENGTH = 30;

export function CustomCategoryPicker({
  customName,
  onNameChange,
  customIcon,
  onIconChange,
  customColor,
  onColorChange,
  colors,
  nameLabel = "Category name",
  autoFocusName,
}: {
  customName: string;
  onNameChange: (name: string) => void;
  customIcon: string;
  onIconChange: (icon: string) => void;
  customColor: string;
  onColorChange: (color: string) => void;
  colors: ColorPalette;
  nameLabel?: string;
  autoFocusName?: boolean;
}) {
  return (
    <View style={{ gap: Spacing.lg }}>
      {/* Name input */}
      <View style={{ gap: Spacing.sm }}>
        <ThemedText
          style={{ fontSize: FontSize.base, fontWeight: "600" }}
          color={colors.mutedForeground}
        >
          {nameLabel}
        </ThemedText>
        <MaterialCard>
          <TextInput
            style={{
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.md + 2,
              fontSize: FontSize.xl,
              color: colors.foreground,
            }}
            placeholder="Fitness, spirituality, hobbies..."
            placeholderTextColor={colors.mutedForeground}
            value={customName}
            onChangeText={(t) => onNameChange(t.slice(0, MAX_CUSTOM_NAME_LENGTH))}
            maxLength={MAX_CUSTOM_NAME_LENGTH}
            autoFocus={autoFocusName}
          />
        </MaterialCard>
      </View>

      {/* Icon picker */}
      <View style={{ gap: Spacing.sm }}>
        <ThemedText
          style={{ fontSize: FontSize.base, fontWeight: "600" }}
          color={colors.mutedForeground}
        >
          Icon
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.sm }}
        >
          {CUSTOM_CATEGORY_ICONS.map((icon) => {
            const isActive = customIcon === icon;
            return (
              <Pressable
                key={icon}
                onPress={() => {
                  haptics.selection();
                  onIconChange(icon);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? Opacity.pressed : 1,
                })}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isActive ? customColor : `${customColor}15`,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: isActive ? 2 : 0,
                    borderColor: customColor,
                  }}
                >
                  <IconSymbol
                    name={icon as IconSymbolName}
                    size={IconSize["2xl"]}
                    color={isActive ? colors.onColor : customColor}
                  />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Color picker */}
      <View style={{ gap: Spacing.sm }}>
        <ThemedText
          style={{ fontSize: FontSize.base, fontWeight: "600" }}
          color={colors.mutedForeground}
        >
          Color
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.sm }}
        >
          {CUSTOM_CATEGORY_COLORS.map((color) => {
            const isActive = customColor === color;
            return (
              <Pressable
                key={color}
                onPress={() => {
                  haptics.selection();
                  onColorChange(color);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? Opacity.pressed : 1,
                })}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: Radius.full,
                    backgroundColor: color,
                    borderWidth: isActive ? 3 : 0,
                    borderColor: colors.foreground,
                  }}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
