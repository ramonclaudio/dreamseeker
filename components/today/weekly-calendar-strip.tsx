import { View } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { MaterialCard } from '@/components/ui/material-card';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getLast7Days(): { date: string; dayIndex: number }[] {
  const days: { date: string; dayIndex: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      dayIndex: d.getDay(),
    });
  }
  return days;
}

type WeeklyCalendarStripProps = {
  weeklyActivity: Record<string, number>;
};

export function WeeklyCalendarStrip({ weeklyActivity }: WeeklyCalendarStripProps) {
  const colors = useColors();
  const days = getLast7Days();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <MaterialCard style={{ padding: Spacing.lg, marginBottom: Spacing.xl }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {days.map(({ date, dayIndex }) => {
          const isToday = date === todayStr;
          const hasActivity = (weeklyActivity[date] ?? 0) > 0;

          return (
            <View
              key={date}
              style={{ alignItems: 'center', gap: Spacing.xs }}
            >
              <ThemedText
                style={{ fontSize: FontSize.xs, fontWeight: '500' }}
                color={isToday ? colors.accentBlue : colors.mutedForeground}
              >
                {DAY_LABELS[dayIndex]}
              </ThemedText>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: Radius.full,
                  backgroundColor: isToday ? colors.accentBlue : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ThemedText
                  style={{
                    fontSize: FontSize.base,
                    fontWeight: isToday ? '700' : '400',
                  }}
                  color={isToday ? colors.accentBlueForeground : colors.foreground}
                >
                  {new Date(date + 'T12:00:00').getDate()}
                </ThemedText>
              </View>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: hasActivity ? colors.accentBlue : 'transparent',
                }}
              />
            </View>
          );
        })}
      </View>
    </MaterialCard>
  );
}
