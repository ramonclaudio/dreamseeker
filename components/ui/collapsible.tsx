import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = useColors();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: isOpen }}
        accessibilityHint={isOpen ? 'Double tap to collapse' : 'Double tap to expand'}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={colors.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <ThemedText variant="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <View style={{ marginTop: 6, marginLeft: 24, backgroundColor: colors.background }}>{children}</View>}
    </View>
  );
}
