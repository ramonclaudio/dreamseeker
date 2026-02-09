import { View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";

export function CelebrationStep() {
  const colors = useColors();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing['2xl'] }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: `${colors.success}20`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconSymbol name="checkmark.circle.fill" size={IconSize['5xl']} color={colors.success} />
      </View>
      <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
        <ThemedText variant="title" style={{ textAlign: 'center' }}>
          Your dream is ready!
        </ThemedText>
        <ThemedText
          style={{ fontSize: FontSize.lg, textAlign: 'center' }}
          color={colors.mutedForeground}
        >
          You&apos;ve taken the first step. Now let&apos;s make it happen.
        </ThemedText>
      </View>
    </View>
  );
}
