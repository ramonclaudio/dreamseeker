import { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';

import { ShareCardShell, type ShareCardSparkle } from '@/components/engagement/share-card-shell';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { SHARE_CARD } from '@/constants/share-card';

const SPARKLES: ShareCardSparkle[] = [
  { icon: 'sparkles', size: IconSize.lg, color: 'rgba(255,255,255,0.3)', position: { top: 40, right: 30 } },
  { icon: 'sparkles', size: IconSize.md, color: 'rgba(255,255,255,0.2)', position: { bottom: 130, left: 25 } },
];

const HEATMAP_SQUARE = 12;
const HEATMAP_GAP = 3;
const HEATMAP_WEEKS = 16;
const DAY_LABEL_WIDTH = 16;
const DAY_LABEL_GAP = 4;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS: [number, string][] = [[0, 'M'], [2, 'W'], [4, 'F']];

type HeatmapDay = { date: string; count: number; isFuture: boolean };
type MonthLabel = { month: string; col: number };

function buildHeatmapGrid(activityData: Record<string, number>) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
  const [y, m, d] = today.split('-').map(Number);
  const todayDate = new Date(y!, m! - 1, d);
  const dow = todayDate.getDay();
  const mondayOffset = dow === 0 ? 6 : dow - 1;

  const start = new Date(todayDate);
  start.setDate(start.getDate() - mondayOffset - (HEATMAP_WEEKS - 1) * 7);

  const weeks: HeatmapDay[][] = [];
  const monthLabels: MonthLabel[] = [];
  let prevMonth = '';

  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const week: HeatmapDay[] = [];
    for (let day = 0; day < 7; day++) {
      const cell = new Date(start);
      cell.setDate(cell.getDate() + w * 7 + day);
      const ds = `${cell.getFullYear()}-${String(cell.getMonth() + 1).padStart(2, '0')}-${String(cell.getDate()).padStart(2, '0')}`;
      week.push({ date: ds, count: activityData[ds] ?? 0, isFuture: ds > today });

      const mo = MONTH_LABELS[cell.getMonth()] ?? '';
      if (mo !== prevMonth) {
        prevMonth = mo;
        monthLabels.push({ month: mo, col: w });
      }
    }
    weeks.push(week);
  }
  // Filter out overlapping month labels (need at least 3 columns apart)
  const filtered: MonthLabel[] = [];
  for (const ml of monthLabels) {
    if (filtered.length === 0 || (ml.col - filtered[filtered.length - 1]!.col) >= 3) {
      filtered.push(ml);
    }
  }
  return { weeks, monthLabels: filtered };
}

function getHeatmapColor(count: number, isFuture: boolean): string {
  if (isFuture || count === 0) return 'rgba(255,255,255,0.08)';
  if (count === 1) return 'rgba(240,160,112,0.3)';
  if (count <= 3) return 'rgba(240,160,112,0.6)';
  return 'rgba(240,160,112,1.0)';
}

function formatStreakDuration(days: number): string {
  if (days === 0) return '0 days';
  const years = Math.floor(days / 365);
  const remaining = days % 365;
  const months = Math.floor(remaining / 30);
  const weeks = Math.floor((remaining % 30) / 7);
  const d = (remaining % 30) % 7;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}mo`);
  if (weeks > 0) parts.push(`${weeks}w`);
  if (d > 0 || parts.length === 0) parts.push(`${d}d`);
  return parts.join(' ');
}

type ConsistencyShareCardProps = {
  handle?: string;
  currentStreak: number;
  longestStreak: number;
  activityData: Record<string, number>;
};

export const ConsistencyShareCard = forwardRef<View, ConsistencyShareCardProps>(
  function ConsistencyShareCard({ handle, currentStreak, longestStreak, activityData }, ref) {
    const heatmap = buildHeatmapGrid(activityData);

    return (
      <ShareCardShell
        ref={ref}
        colors={SHARE_CARD.GRADIENT}
        radialGlow={SHARE_CARD.RADIAL_GLOW}
        sparkles={SPARKLES}
        handle={handle}
      >
        {/* Header */}
        <View>
          <ThemedText style={styles.headerLabel} color={SHARE_CARD.TEXT_SECONDARY}>
            CONSISTENCY
          </ThemedText>
          <ThemedText style={styles.headerTitle} color={SHARE_CARD.TEXT_PRIMARY}>
            {handle ? `${handle.split(' ')[0]}\u2019s Map` : 'My Map'}
          </ThemedText>
        </View>

        {/* Streaks */}
        <View style={styles.streakRow}>
          <View style={styles.streakCard}>
            <IconSymbol name="flame.fill" size={IconSize['2xl']} color="#FF8C42" />
            <ThemedText style={styles.streakValue} color={SHARE_CARD.TEXT_PRIMARY}>{currentStreak}</ThemedText>
            <ThemedText style={styles.streakLabel} color={SHARE_CARD.TEXT_SECONDARY}>Current Streak</ThemedText>
            <ThemedText style={styles.streakDuration} color={SHARE_CARD.TEXT_TERTIARY}>{formatStreakDuration(currentStreak)}</ThemedText>
          </View>
          <View style={styles.streakCard}>
            <IconSymbol name="flame.fill" size={IconSize['2xl']} color="#FFD700" />
            <ThemedText style={styles.streakValue} color={SHARE_CARD.TEXT_PRIMARY}>{longestStreak}</ThemedText>
            <ThemedText style={styles.streakLabel} color={SHARE_CARD.TEXT_SECONDARY}>Longest Streak</ThemedText>
            <ThemedText style={styles.streakDuration} color={SHARE_CARD.TEXT_TERTIARY}>{formatStreakDuration(longestStreak)}</ThemedText>
          </View>
        </View>

        {/* Heatmap */}
        <View style={styles.heatmapCard}>
          {/* Month labels */}
          <View style={styles.monthRow}>
            <View style={{ width: DAY_LABEL_WIDTH + DAY_LABEL_GAP }} />
            {heatmap.monthLabels.map((ml, i) => (
              <ThemedText
                key={i}
                style={[styles.monthLabel, { left: DAY_LABEL_WIDTH + DAY_LABEL_GAP + ml.col * (HEATMAP_SQUARE + HEATMAP_GAP) }]}
                color="rgba(255,255,255,0.5)"
              >
                {ml.month}
              </ThemedText>
            ))}
          </View>

          {/* Grid with day labels */}
          <View style={styles.gridRow}>
            <View style={styles.dayLabels}>
              {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
                const label = DAY_LABELS.find(([i]) => i === idx);
                return (
                  <View key={idx} style={{ height: HEATMAP_SQUARE, marginBottom: idx < 6 ? HEATMAP_GAP : 0, justifyContent: 'center' }}>
                    {label && (
                      <ThemedText style={styles.dayLabel} color="rgba(255,255,255,0.5)">
                        {label[1]}
                      </ThemedText>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={styles.weeksRow}>
              {heatmap.weeks.map((week, wi) => (
                <View key={wi} style={{ gap: HEATMAP_GAP }}>
                  {week.map((day) => (
                    <View
                      key={day.date}
                      style={[styles.heatmapSquare, { backgroundColor: getHeatmapColor(day.count, day.isFuture) }]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <ThemedText style={styles.legendText} color="rgba(255,255,255,0.5)">Less</ThemedText>
            <View style={styles.legendSquares}>
              <View style={[styles.legendSquare, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
              <View style={[styles.legendSquare, { backgroundColor: 'rgba(240,160,112,0.3)' }]} />
              <View style={[styles.legendSquare, { backgroundColor: 'rgba(240,160,112,0.6)' }]} />
              <View style={[styles.legendSquare, { backgroundColor: 'rgba(240,160,112,1.0)' }]} />
            </View>
            <ThemedText style={styles.legendText} color="rgba(255,255,255,0.5)">More</ThemedText>
          </View>
        </View>
      </ShareCardShell>
    );
  }
);

const styles = StyleSheet.create({
  headerLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: FontSize['5xl'],
    fontWeight: '900',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  streakRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  streakCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: SHARE_CARD.GLASS_BG,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SHARE_CARD.GLASS_BORDER,
    padding: Spacing.lg,
    gap: Spacing.xxs,
  },
  streakValue: {
    fontSize: FontSize['4xl'],
    fontWeight: '800',
  },
  streakLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  streakDuration: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  heatmapCard: {
    backgroundColor: SHARE_CARD.GLASS_BG,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SHARE_CARD.GLASS_BORDER,
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  monthRow: {
    height: 14,
    position: 'relative',
  },
  monthLabel: {
    fontSize: 9,
    position: 'absolute',
    top: 0,
  },
  gridRow: {
    flexDirection: 'row',
    gap: DAY_LABEL_GAP,
  },
  dayLabels: {
    width: DAY_LABEL_WIDTH,
  },
  dayLabel: {
    fontSize: 9,
    textAlign: 'right',
  },
  weeksRow: {
    flexDirection: 'row',
    gap: HEATMAP_GAP,
  },
  heatmapSquare: {
    width: HEATMAP_SQUARE,
    height: HEATMAP_SQUARE,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  legendText: {
    fontSize: 9,
  },
  legendSquares: {
    flexDirection: 'row',
    gap: 3,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
