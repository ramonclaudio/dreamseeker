import { View, useWindowDimensions, StyleSheet } from "react-native";
import { useMemo } from "react";

import { ThemedText } from "@/components/ui/themed-text";
import type { ColorPalette } from "@/constants/theme";
import { Spacing, FontSize } from "@/constants/layout";

type StreakHeatmapProps = {
  activityData: Record<string, number>; // { '2025-01-15': 3, '2025-01-16': 1, ... }
  currentStreak: number;
  longestStreak: number;
  colors: ColorPalette;
  timezone: string;
};

type DayCell = {
  date: string;
  count: number;
  isToday: boolean;
  isFuture: boolean;
};

type WeekColumn = DayCell[];

const DAYS_TO_SHOW = 112; // 16 weeks
const DAYS_PER_WEEK = 7;
const DAY_LABELS = ['M', 'W', 'F'];
const DAY_LABEL_INDICES = [0, 2, 4]; // Monday, Wednesday, Friday
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getTodayString(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
}

function getWeekdayIndex(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0, Sunday = 6
}

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getMonthAbbr(dateStr: string): string {
  const [, monthStr] = dateStr.split('-');
  const monthIndex = Number.parseInt(monthStr, 10) - 1;
  return MONTH_LABELS[monthIndex] ?? '';
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

export function StreakHeatmap({ activityData, currentStreak, longestStreak, colors, timezone }: StreakHeatmapProps) {
  const { width: screenWidth } = useWindowDimensions();

  const { weeks, monthLabels, squareSize } = useMemo(() => {
    const today = getTodayString(timezone);
    const todayWeekday = getWeekdayIndex(today);

    // Calculate start date: go back enough days to fill 16 complete weeks
    // We want the grid to start on Monday, so find the Monday of the first week
    const daysToSubtract = DAYS_TO_SHOW - 1 + todayWeekday;
    const startDate = addDays(today, -daysToSubtract);

    const weeksData: WeekColumn[] = [];
    const monthLabelPositions: { month: string; columnIndex: number }[] = [];
    let currentMonth = '';

    // Build weeks (columns of 7 days each)
    for (let weekIdx = 0; weekIdx < Math.ceil(DAYS_TO_SHOW / DAYS_PER_WEEK); weekIdx++) {
      const week: DayCell[] = [];
      for (let dayIdx = 0; dayIdx < DAYS_PER_WEEK; dayIdx++) {
        const dayOffset = weekIdx * DAYS_PER_WEEK + dayIdx;
        const dateStr = addDays(startDate, dayOffset);
        const count = activityData[dateStr] ?? 0;
        const isToday = dateStr === today;
        const isFuture = dateStr > today;

        week.push({ date: dateStr, count, isToday, isFuture });

        // Track month labels — only check first day (Monday) of each week
        if (dayIdx === 0) {
          const month = getMonthAbbr(dateStr);
          if (month !== currentMonth) {
            currentMonth = month;
            monthLabelPositions.push({ month, columnIndex: weekIdx });
          }
        }
      }
      weeksData.push(week);
    }

    // Filter out month labels that are too close together (need at least 3 columns apart)
    const filteredLabels: typeof monthLabelPositions = [];
    for (const label of monthLabelPositions) {
      const prev = filteredLabels[filteredLabels.length - 1];
      if (!prev || label.columnIndex - prev.columnIndex >= 3) {
        filteredLabels.push(label);
      }
    }

    // Calculate square size based on available width
    // Layout: [dayLabels (24px)] [gap (8px)] [grid] [gap (16px)]
    const dayLabelWidth = 24;
    const leftGap = 8;
    const rightPadding = 16;
    const availableWidth = screenWidth - Spacing.lg * 2 - dayLabelWidth - leftGap - rightPadding;
    const numWeeks = weeksData.length;
    const gapBetweenSquares = 3;
    const totalGaps = (numWeeks - 1) * gapBetweenSquares;
    const calculatedSquareSize = Math.floor((availableWidth - totalGaps) / numWeeks);
    const finalSquareSize = Math.min(calculatedSquareSize, 14);

    return { weeks: weeksData, monthLabels: filteredLabels, squareSize: finalSquareSize };
  }, [activityData, timezone, screenWidth]);

  const hexToRgba = (hex: string, opacity: number) => {
    const cleanHex = hex.replace('#', '');
    const r = Number.parseInt(cleanHex.substring(0, 2), 16);
    const g = Number.parseInt(cleanHex.substring(2, 4), 16);
    const b = Number.parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const getSquareColor = (count: number, isFuture: boolean) => {
    if (isFuture) return colors.muted;
    if (count === 0) return colors.muted;

    // Color intensity based on activity count
    // Low: 1 action (30% opacity), Medium: 2-3 actions (60%), High: 4+ (100%)
    if (count === 1) return hexToRgba(colors.accent, 0.3);
    if (count <= 3) return hexToRgba(colors.accent, 0.6);
    return colors.accent;
  };

  return (
    <View style={styles.container}>
      {/* Header with streaks */}
      <View style={styles.header}>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <ThemedText style={[styles.streakNumber, { color: colors.accent }]}>
              {currentStreak}
            </ThemedText>
            <ThemedText style={styles.streakLabel} color={colors.mutedForeground}>
              Current Streak
            </ThemedText>
            <ThemedText style={styles.streakDuration} color={colors.mutedForeground}>
              {formatStreakDuration(currentStreak)}
            </ThemedText>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <ThemedText style={[styles.streakNumber, { color: colors.gold }]}>
              {longestStreak}
            </ThemedText>
            <ThemedText style={styles.streakLabel} color={colors.mutedForeground}>
              Longest Streak
            </ThemedText>
            <ThemedText style={styles.streakDuration} color={colors.mutedForeground}>
              {formatStreakDuration(longestStreak)}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Month labels */}
      <View style={styles.monthLabelsRow}>
        <View style={{ width: 24 + 8 }} />
        {monthLabels.map((label, idx) => (
          <ThemedText
            key={`month-${idx}`}
            style={[
              styles.monthLabel,
              { left: (24 + 8) + label.columnIndex * (squareSize + 3) }
            ]}
            color={colors.mutedForeground}
          >
            {label.month}
          </ThemedText>
        ))}
      </View>

      {/* Heatmap grid */}
      <View style={styles.gridContainer}>
        {/* Day labels - aligned with Mon, Wed, Fri rows */}
        <View style={styles.dayLabelsColumn}>
          {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
            const labelIndex = DAY_LABEL_INDICES.indexOf(dayIdx);
            const hasLabel = labelIndex !== -1;
            return (
              <View
                key={`day-label-${dayIdx}`}
                style={[
                  styles.dayLabelContainer,
                  { height: squareSize, marginBottom: dayIdx < 6 ? 3 : 0 }
                ]}
              >
                {hasLabel && (
                  <ThemedText style={styles.dayLabel} color={colors.mutedForeground}>
                    {DAY_LABELS[labelIndex] ?? ''}
                  </ThemedText>
                )}
              </View>
            );
          })}
        </View>

        {/* Week columns */}
        <View style={styles.weeksRow}>
          {weeks.map((week, weekIdx) => (
            <View key={`week-${weekIdx}`} style={styles.weekColumn}>
              {week.map((day, dayIdx) => (
                <View
                  key={`${day.date}`}
                  style={[
                    styles.square,
                    {
                      width: squareSize,
                      height: squareSize,
                      backgroundColor: getSquareColor(day.count, day.isFuture),
                      borderWidth: day.isToday ? 1.5 : 0,
                      borderColor: day.isToday ? colors.accent : 'transparent',
                      marginBottom: dayIdx < week.length - 1 ? 3 : 0,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <ThemedText style={styles.legendText} color={colors.mutedForeground}>
          Less
        </ThemedText>
        <View style={styles.legendSquares}>
          <View style={[styles.legendSquare, { backgroundColor: colors.muted }]} />
          <View style={[styles.legendSquare, { backgroundColor: hexToRgba(colors.accent, 0.3) }]} />
          <View style={[styles.legendSquare, { backgroundColor: hexToRgba(colors.accent, 0.6) }]} />
          <View style={[styles.legendSquare, { backgroundColor: colors.accent }]} />
        </View>
        <ThemedText style={styles.legendText} color={colors.mutedForeground}>
          More
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  streakLabel: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xxs,
  },
  streakDuration: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xxs,
  },
  monthLabelsRow: {
    flexDirection: 'row',
    height: 16,
    marginBottom: Spacing.xxs,
    position: 'relative',
  },
  monthLabel: {
    fontSize: FontSize.xs,
    position: 'absolute',
    top: 0,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dayLabelsColumn: {
    width: 24,
    justifyContent: 'space-between',
  },
  dayLabelContainer: {
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: FontSize.xs,
    textAlign: 'right',
  },
  weeksRow: {
    flexDirection: 'row',
    gap: 3,
  },
  weekColumn: {
    gap: 0,
  },
  square: {
    borderRadius: 3,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  legendText: {
    fontSize: FontSize.xs,
  },
  legendSquares: {
    flexDirection: 'row',
    gap: 3,
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});
