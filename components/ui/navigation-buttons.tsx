import { View, Pressable } from 'react-native';

import { GlassControl } from '@/components/ui/glass-control';
import { GradientButton } from '@/components/ui/gradient-button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, TouchTarget, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';
import { useColors } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';

interface NavigationButtonsProps {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  isLoading?: boolean;
  bottomInset?: number;
}

export function NavigationButtons({
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  isLoading = false,
  bottomInset = 0,
}: NavigationButtonsProps) {
  const colors = useColors();

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: Spacing.md,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Math.max(bottomInset, Spacing.md) + Spacing.md,
      }}
    >
      {onBack && (
        <Pressable
          onPress={() => {
            haptics.light();
            onBack();
          }}
          disabled={isLoading}
          style={({ pressed }) => ({
            opacity: pressed ? Opacity.pressed : isLoading ? Opacity.disabled : 1,
          })}
        >
          <GlassControl
            isInteractive
            style={{
              width: TouchTarget.min,
              height: TouchTarget.min,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: Radius.lg,
            }}
          >
            <IconSymbol name="chevron.right" size={IconSize.xl} color={colors.foreground} style={{ transform: [{ scaleX: -1 }] }} />
          </GlassControl>
        </Pressable>
      )}

      <GradientButton
        onPress={onContinue}
        label={continueLabel}
        disabled={continueDisabled}
        isLoading={isLoading}
        style={{ flex: 1 }}
      />
    </View>
  );
}
