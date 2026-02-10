import { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';

import { ShareCardShell } from '@/components/engagement/share-card-shell';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { pickHype } from '@/constants/ui';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { SHARE_CARD, DEFAULT_SPARKLES } from '@/constants/share-card';

import type { IconSymbolName } from '@/components/ui/icon-symbol';

const MOOD_MAP: Record<string, { icon: IconSymbolName; label: string }> = {
  great: { icon: 'sun.max.fill', label: 'Great' },
  good: { icon: 'sun.min.fill', label: 'Good' },
  okay: { icon: 'cloud.fill', label: 'Okay' },
  tough: { icon: 'cloud.fill', label: 'Tough' },
};

type JournalShareCardProps = {
  title: string;
  body: string;
  mood?: string;
  date: number;
  handle?: string;
};

export const JournalShareCard = forwardRef<View, JournalShareCardProps>(
  function JournalShareCard({ title, body, mood, date, handle }, ref) {
    const moodInfo = mood ? MOOD_MAP[mood] : undefined;
    const truncatedBody = body.length > 200 ? body.slice(0, 200).trimEnd() + '...' : body;
    const formattedDate = new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <ShareCardShell
        ref={ref}
        colors={SHARE_CARD.GRADIENT}
        radialGlow={SHARE_CARD.RADIAL_GLOW}
        sparkles={DEFAULT_SPARKLES}
        handle={handle}
      >
        <View style={styles.center}>
          {/* Hero: floating book icon */}
          <IconSymbol name="book.fill" size={56} color="rgba(255,255,255,0.9)" />

          {/* Label */}
          <ThemedText style={styles.label} color={SHARE_CARD.TEXT_SECONDARY}>
            JOURNAL REFLECTION
          </ThemedText>

          {/* Mood row */}
          {moodInfo && (
            <View style={styles.moodRow}>
              <View style={styles.moodCircle}>
                <IconSymbol name={moodInfo.icon} size={IconSize.xl} color={SHARE_CARD.TEXT_PRIMARY} />
              </View>
              <ThemedText style={styles.moodLabel} color={SHARE_CARD.TEXT_PRIMARY}>{moodInfo.label}</ThemedText>
            </View>
          )}

          {/* Title */}
          <ThemedText style={styles.title} color={SHARE_CARD.TEXT_PRIMARY} numberOfLines={2}>
            {title}
          </ThemedText>

          {/* Quote block with gold left border */}
          <View style={styles.quoteBlock}>
            <View style={styles.quoteBorder} />
            <ThemedText style={styles.quoteText} color="rgba(255,255,255,0.85)" numberOfLines={4}>
              {truncatedBody}
            </ThemedText>
          </View>

          {/* Date */}
          <ThemedText style={styles.date} color={SHARE_CARD.TEXT_TERTIARY}>
            {formattedDate}
          </ThemedText>

          {/* Hype text */}
          <ThemedText style={styles.hype} color={SHARE_CARD.GOLD}>
            {pickHype('journal')}
          </ThemedText>
        </View>
      </ShareCardShell>
    );
  },
);

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: Spacing.sm },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  moodCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SHARE_CARD.GLASS_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodLabel: { fontSize: FontSize.xl, fontWeight: '700' },
  title: {
    fontSize: FontSize['6xl'],
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  quoteBlock: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.sm,
    width: '100%',
  },
  quoteBorder: {
    width: 3,
    backgroundColor: SHARE_CARD.GOLD,
    borderRadius: 2,
  },
  quoteText: {
    flex: 1,
    fontSize: FontSize.lg,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  date: { fontSize: FontSize.sm, fontWeight: '500' },
  hype: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
