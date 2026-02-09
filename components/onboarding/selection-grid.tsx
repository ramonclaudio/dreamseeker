import { View, Pressable } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { MaterialCard } from '@/components/ui/material-card';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Opacity } from '@/constants/ui';
import { haptics } from '@/lib/haptics';
import { type SlideColors } from './shared';

type SelectionItem = {
  key: string;
  label: string;
  icon: IconSymbolName;
  color: string;
};

export function SelectionGrid({
  items,
  selectedKeys,
  onToggle,
  colors,
}: {
  items: SelectionItem[];
  selectedKeys: string[];
  onToggle: (key: string) => void;
  colors: SlideColors;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md }}>
      {items.map((item) => {
        const isSelected = selectedKeys.includes(item.key);

        return (
          <Pressable
            key={item.key}
            onPress={() => {
              haptics.selection();
              onToggle(item.key);
            }}
            style={({ pressed }) => ({
              flex: 1,
              minWidth: '45%',
              opacity: pressed ? Opacity.pressed : 1,
            })}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={item.label}
          >
            <MaterialCard
              style={{
                padding: Spacing.lg,
                alignItems: 'center',
                gap: Spacing.sm,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? item.color : colors.border,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: isSelected ? item.color : `${item.color}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSymbol
                  name={item.icon}
                  size={IconSize['3xl']}
                  color={isSelected ? colors.onColor : item.color}
                />
              </View>
              <ThemedText style={{ fontSize: FontSize.lg, fontWeight: '600' }}>
                {item.label}
              </ThemedText>
            </MaterialCard>
          </Pressable>
        );
      })}
    </View>
  );
}
