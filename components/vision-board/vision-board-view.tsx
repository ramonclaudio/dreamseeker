import { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';

import { SvgGradientBg } from '@/components/ui/svg-gradient-bg';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { DreamCard } from './dream-card';
import type { DreamCategory } from '@/constants/dreams';
import { pickHype } from '@/constants/ui';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';

type Dream = {
  _id: string;
  title: string;
  category: DreamCategory;
  status: string;
  completedActions: number;
  totalActions: number;
};

type VisionBoardViewProps = {
  dreams: Dream[];
  handle?: string;
};

const BOARD_WIDTH = 390;
const BOARD_HEIGHT = 700;

export const VisionBoardView = forwardRef<View, VisionBoardViewProps>(function VisionBoardView({ dreams, handle }, ref) {
  const visibleDreams = dreams.slice(0, 6);
  const overflow = dreams.length > 6 ? dreams.length - 6 : 0;
  const now = new Date();
  const year = now.getFullYear();
  const completedCount = dreams.filter((d) => d.status === 'completed').length;

  return (
    <View ref={ref} style={styles.board} collapsable={false}>
      {/* Deep warm gradient background */}
      <SvgGradientBg
        colors={['#E8A87C', '#E07B4F']}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        direction="diagonal"
      />
      {/* Subtle glass overlay */}
      <View style={styles.glassOverlay} />

      {/* Decorative sparkles */}
      <View style={[styles.sparkle, { top: 30, right: 28 }]}>
        <IconSymbol name="sparkles" size={IconSize.lg} color="rgba(255,255,255,0.3)" />
      </View>
      <View style={[styles.sparkle, { top: 60, right: 60 }]}>
        <IconSymbol name="sparkles" size={IconSize.sm} color="rgba(255,255,255,0.2)" />
      </View>
      <View style={[styles.sparkle, { bottom: 120, left: 20 }]}>
        <IconSymbol name="sparkles" size={IconSize.md} color="rgba(255,255,255,0.2)" />
      </View>
      <View style={[styles.sparkle, { bottom: 80, right: 24 }]}>
        <IconSymbol name="sparkles" size={IconSize.sm} color="rgba(255,215,0,0.2)" />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerLabel} color="rgba(255,255,255,0.6)">
          MY {year} VISION BOARD
        </ThemedText>
        <ThemedText style={styles.headerTitle} color="#fff">My Vision Board</ThemedText>
        <View style={styles.handleRow}>
          <ThemedText style={styles.headerHandle} color="rgba(255,255,255,0.7)">
            @{handle || 'dreamseeker'}
          </ThemedText>
          {completedCount > 0 && (
            <View style={styles.completedChip}>
              <IconSymbol name="trophy.fill" size={IconSize.sm} color="#FFD700" />
              <ThemedText style={styles.completedChipText} color="#FFD700">
                {completedCount} achieved
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {visibleDreams.map((dream) => (
          <DreamCard
            key={dream._id}
            title={dream.title}
            category={dream.category}
            status={dream.status}
            completedActions={dream.completedActions}
            totalActions={dream.totalActions}
          />
        ))}
      </View>
      {overflow > 0 && (
        <ThemedText style={styles.overflow} color="rgba(255,255,255,0.6)">
          +{overflow} more dreams
        </ThemedText>
      )}

      {/* Footer branding */}
      <View style={styles.footer}>
        <ThemedText style={styles.tagline} color="rgba(255,255,255,0.8)">
          {pickHype('visionBoard')}
        </ThemedText>
        <View style={styles.brandRow}>
          <ThemedText style={styles.brandName} color="rgba(255,255,255,0.5)">
            DreamSeeker
          </ThemedText>
          <View style={styles.brandDot} />
          <ThemedText style={styles.brandCreator} color="rgba(255,255,255,0.4)">
            @packslight
          </ThemedText>
        </View>
        <ThemedText style={styles.cta} color="rgba(255,255,255,0.35)">
          Start seeking dreamseekerapp.com
        </ThemedText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  board: {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    overflow: 'hidden',
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  sparkle: {
    position: 'absolute',
  },
  header: { gap: 2 },
  headerLabel: { fontSize: FontSize.sm, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' },
  headerTitle: {
    fontSize: FontSize['7xl'],
    fontWeight: '900',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  handleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  headerHandle: { fontSize: FontSize.base, fontWeight: '500' },
  completedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  completedChipText: { fontSize: FontSize.xs, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  overflow: { fontSize: FontSize.sm, textAlign: 'center', fontWeight: '600' },
  footer: { alignItems: 'center', gap: 3 },
  tagline: {
    fontSize: FontSize.base,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  brandName: { fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 0.5 },
  brandDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.3)' },
  brandCreator: { fontSize: FontSize.sm, fontWeight: '500' },
  cta: { fontSize: FontSize.xs, fontWeight: '500' },
});
