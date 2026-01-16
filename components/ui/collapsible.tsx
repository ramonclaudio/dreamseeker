import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={{ backgroundColor: colors.background }}>
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} onPress={() => setIsOpen((v) => !v)} activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={colors.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <Text style={[Typography.defaultSemiBold, { color: colors.text }]}>{title}</Text>
      </TouchableOpacity>
      {isOpen && <View style={{ marginTop: 6, marginLeft: 24, backgroundColor: colors.background }}>{children}</View>}
    </View>
  );
}
