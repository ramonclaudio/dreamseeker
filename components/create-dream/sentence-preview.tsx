import { View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { MaterialCard } from '@/components/ui/material-card';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize } from '@/constants/layout';

interface SentencePreviewProps {
  title?: string;
  targetDate?: string;
  identity?: string;
  activeStep: number;
}

export function SentencePreview({ title, targetDate, identity, activeStep }: SentencePreviewProps) {
  const colors = useColors();

  const placeholder = '___';
  const activeColor = colors.accent;
  const inactiveColor = colors.mutedForeground;

  const showDate = targetDate || activeStep === 1;
  const showIdentity = identity || activeStep === 2;

  return (
    <MaterialCard style={{ padding: Spacing.lg }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
        <ThemedText style={{ fontSize: FontSize.lg }}>I will </ThemedText>
        <ThemedText
          style={{
            fontSize: FontSize.lg,
            fontWeight: activeStep === 0 ? '700' : title ? '600' : '400',
          }}
          color={activeStep === 0 ? activeColor : title ? colors.foreground : inactiveColor}
        >
          {title || placeholder}
        </ThemedText>
        {showDate && (
          <>
            <ThemedText style={{ fontSize: FontSize.lg }}> in </ThemedText>
            <ThemedText
              style={{
                fontSize: FontSize.lg,
                fontWeight: activeStep === 1 ? '700' : targetDate ? '600' : '400',
              }}
              color={activeStep === 1 ? activeColor : targetDate ? colors.foreground : inactiveColor}
            >
              {targetDate || placeholder}
            </ThemedText>
          </>
        )}
        {showIdentity && (
          <>
            <ThemedText style={{ fontSize: FontSize.lg }}> so I can become </ThemedText>
            <ThemedText
              style={{
                fontSize: FontSize.lg,
                fontWeight: activeStep === 2 ? '700' : identity ? '600' : '400',
              }}
              color={activeStep === 2 ? activeColor : identity ? colors.foreground : inactiveColor}
            >
              {identity || placeholder}
            </ThemedText>
          </>
        )}
      </View>
    </MaterialCard>
  );
}
