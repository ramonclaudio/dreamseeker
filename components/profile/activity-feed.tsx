import { StyleSheet, View } from 'react-native';
import { useQuery } from 'convex/react';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { MaterialCard } from '@/components/ui/material-card';
import { ThemedText } from '@/components/ui/themed-text';
import type { ColorPalette } from '@/constants/theme';
import { Radius } from '@/constants/theme';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { DREAM_CATEGORIES } from '@/convex/constants';
import { api } from '@/convex/_generated/api';

// ── Types ────────────────────────────────────────────────────────────────────

type FeedItem = {
  type: string;
  title: string;
  subtitle?: string;
  icon: string;
  timestamp: number;
  category?: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const ICON_CIRCLE_SIZE = 32;

/** Color for the icon circle — category color if available, else primary. */
function getIconColor(item: FeedItem, colors: ColorPalette): string {
  if (item.category && item.category in DREAM_CATEGORIES) {
    return DREAM_CATEGORIES[item.category as keyof typeof DREAM_CATEGORIES].color;
  }
  // Fallback per-type
  switch (item.type) {
    case 'badge_earned':
      return colors.gold;
    case 'focus_completed':
      return colors.tint;
    case 'journal_created':
      return colors.mutedForeground;
    default:
      return colors.primary;
  }
}

function getRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(timestamp);
}

function getEventLabel(type: string): string {
  switch (type) {
    case 'dream_created': return 'New dream';
    case 'dream_completed': return 'Dream achieved';
    case 'action_completed': return 'Action done';
    case 'journal_created': return 'Journal entry';
    case 'badge_earned': return 'Badge earned';
    case 'focus_completed': return 'Focus session';
    default: return 'Activity';
  }
}

// ── Components ───────────────────────────────────────────────────────────────

function TimelineItem({
  item,
  isLast,
  colors,
}: {
  item: FeedItem;
  isLast: boolean;
  colors: ColorPalette;
}) {
  const iconColor = getIconColor(item, colors);

  return (
    <View style={styles.itemRow}>
      {/* Left column: icon circle + connector line */}
      <View style={styles.iconColumn}>
        <View style={[styles.iconCircle, { backgroundColor: `${iconColor}20` }]}>
          <IconSymbol
            name={item.icon as IconSymbolName}
            size={IconSize.md}
            color={iconColor}
          />
        </View>
        {!isLast && (
          <View style={[styles.connector, { backgroundColor: colors.separator }]} />
        )}
      </View>

      {/* Right column: content */}
      <View style={styles.contentColumn}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.label} color={iconColor}>
            {getEventLabel(item.type)}
          </ThemedText>
          <ThemedText style={styles.time} color={colors.mutedForeground}>
            {getRelativeTime(item.timestamp)}
          </ThemedText>
        </View>
        <ThemedText style={styles.title} numberOfLines={2}>
          {item.title}
        </ThemedText>
        {item.subtitle ? (
          <ThemedText style={styles.subtitle} color={colors.mutedForeground} numberOfLines={1}>
            {item.subtitle}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

function SkeletonItem({ isLast, colors }: { isLast: boolean; colors: ColorPalette }) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.iconColumn}>
        <View style={[styles.iconCircle, { backgroundColor: colors.muted }]} />
        {!isLast && (
          <View style={[styles.connector, { backgroundColor: colors.separator }]} />
        )}
      </View>
      <View style={styles.contentColumn}>
        <View style={[styles.skeleton, { width: 80, backgroundColor: colors.muted }]} />
        <View style={[styles.skeleton, { width: 160, backgroundColor: colors.muted }]} />
        <View style={[styles.skeleton, { width: 100, backgroundColor: colors.muted }]} />
      </View>
    </View>
  );
}

export function ActivityFeed({ colors }: { colors: ColorPalette }) {
  const feed = useQuery(api.progress.getActivityFeed, { limit: 20 });

  // Loading
  if (feed === undefined) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
        <MaterialCard style={styles.card}>
          {[0, 1, 2].map((i) => (
            <SkeletonItem key={i} isLast={i === 2} colors={colors} />
          ))}
        </MaterialCard>
      </View>
    );
  }

  // Empty
  if (feed.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
        <MaterialCard style={styles.card}>
          <ThemedText style={styles.emptyText} color={colors.mutedForeground}>
            Your activity will appear here as you chase your dreams
          </ThemedText>
        </MaterialCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
      <MaterialCard style={styles.card}>
        {feed.map((item, index) => (
          <TimelineItem
            key={`${item.type}-${item.timestamp}`}
            item={item}
            isLast={index === feed.length - 1}
            colors={colors}
          />
        ))}
      </MaterialCard>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing['2xl'],
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: Spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconColumn: {
    alignItems: 'center',
    width: ICON_CIRCLE_SIZE,
  },
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    width: 1.5,
    flex: 1,
    marginVertical: Spacing.xs,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: Spacing.lg,
    gap: Spacing.xxs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  time: {
    fontSize: FontSize.xs,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: FontSize.sm,
  },
  skeleton: {
    height: 12,
    borderRadius: Radius.sm,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: FontSize.base,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
