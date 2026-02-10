import { View, Pressable } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { CloudShape } from '@/components/ui/cloud-shape';
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

// Staggered row layout — alternating 2-1-2-1 pattern
function getRows(items: SelectionItem[]): SelectionItem[][] {
  const rows: SelectionItem[][] = [];
  let i = 0;
  let wide = true;
  while (i < items.length) {
    const count = wide ? 2 : 1;
    rows.push(items.slice(i, i + count));
    i += count;
    wide = !wide;
  }
  return rows;
}

const CLOUD_HEIGHT = 80;

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
  const rows = getRows(items);
  let variantCounter = 0;

  return (
    <View style={{ gap: Spacing.md }}>
      {rows.map((row, rowIdx) => (
        <View
          key={`row-${rowIdx}`}
          style={{
            flexDirection: 'row',
            gap: Spacing.md,
            justifyContent: 'center',
          }}
        >
          {row.map((item) => {
            const isSelected = selectedKeys.includes(item.key);
            const isWide = row.length === 1;
            const variant = variantCounter++;

            return (
              <Pressable
                key={item.key}
                onPress={() => {
                  haptics.selection();
                  onToggle(item.key);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? Opacity.pressed : 1,
                  flex: isWide ? undefined : 1,
                  minWidth: isWide ? '55%' : undefined,
                })}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={item.label}
              >
                <View style={{ height: CLOUD_HEIGHT }}>
                  {/* Cloud SVG background */}
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <CloudShape
                      fill={isSelected ? item.color : colors.card}
                      stroke={isSelected ? undefined : colors.borderAccent}
                      strokeWidth={isSelected ? 0 : 2}
                      variant={variant}
                    />
                  </View>

                  {/* Content overlay */}
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: Spacing.md,
                      paddingHorizontal: Spacing.xl,
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: isSelected ? `${colors.onColor}25` : `${item.color}18`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconSymbol
                        name={item.icon}
                        size={IconSize.xl}
                        color={isSelected ? colors.onColor : item.color}
                      />
                    </View>
                    <ThemedText
                      style={{
                        fontSize: FontSize.lg,
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
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: `${colors.onColor}30`,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 'auto',
                        }}
                      >
                        <IconSymbol name="checkmark" size={13} color={colors.onColor} />
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
