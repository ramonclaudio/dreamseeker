import { View, Pressable, ActivityIndicator } from 'react-native';

import { GlassControl } from '@/components/ui/glass-control';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, TouchTarget, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';
import { useColors } from '@/hooks/use-color-scheme';

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
          onPress={onBack}
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

      <Pressable
        onPress={onContinue}
        disabled={continueDisabled || isLoading}
        style={({ pressed }) => ({
          flex: 1,
          opacity: pressed ? Opacity.pressed : continueDisabled ? Opacity.disabled : 1,
        })}
      >
        <GlassControl
          isInteractive
          tint={colors.accentBlue}
          style={{
            height: TouchTarget.min,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: Radius.lg,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.accentBlueForeground} />
          ) : (
            <ThemedText
              style={{ fontWeight: '600' }}
              color={colors.accentBlueForeground}
            >
              {continueLabel}
            </ThemedText>
          )}
        </GlassControl>
      </Pressable>
    </View>
  );
}
