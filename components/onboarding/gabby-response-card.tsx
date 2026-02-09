import { ThemedText } from '@/components/ui/themed-text';
import { MaterialCard } from '@/components/ui/material-card';
import { Spacing, FontSize } from '@/constants/layout';
import type { SlideColors } from './shared';

export function GabbyResponseCard({ response, colors }: { response: string; colors: SlideColors }) {
  return (
    <MaterialCard style={{ padding: Spacing.lg }}>
      <ThemedText
        style={{ fontSize: FontSize.lg, fontStyle: 'italic', textAlign: 'center' }}
      >
        &quot;{response}&quot;
      </ThemedText>
      <ThemedText
        style={{ fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.sm }}
        color={colors.mutedForeground}
      >
        — Gabby
      </ThemedText>
    </MaterialCard>
  );
}
