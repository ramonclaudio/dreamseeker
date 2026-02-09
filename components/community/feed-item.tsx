import { Pressable, StyleSheet, View } from 'react-native';

import { MaterialCard } from '@/components/ui/material-card';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize } from '@/constants/layout';
import { Opacity } from '@/constants/ui';
import { haptics } from '@/lib/haptics';

type FeedEvent = {
  _id: string;
  userId: string;
  type: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
  username: string;
  displayName?: string;
};

type ReactionCounts = {
  fire: number;
  heart: number;
  clap: number;
  userReacted: string[];
};

const EMOJIS = [
  { key: 'fire' as const, label: '\uD83D\uDD25' },
  { key: 'heart' as const, label: '\u2764\uFE0F' },
  { key: 'clap' as const, label: '\uD83D\uDC4F' },
];

function getRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function getEventText(event: FeedEvent): string {
  const { username, type, metadata = {} } = event;
  const title = (metadata.title as string) ?? '';
  const text = (metadata.text as string) ?? '';

  switch (type) {
    case 'dream_created':
      return `${username} started a new dream: ${title}`;
    case 'dream_completed':
      return `${username} completed a dream: ${title}`;
    case 'action_completed':
      return `${username} completed an action: ${text}`;
    case 'journal_entry':
      return `${username} wrote a journal entry: ${title}`;
    case 'badge_earned':
      return `${username} earned the ${title} badge`;
    case 'streak_milestone':
      return `${username} hit a ${metadata.streak as number}-day streak!`;
    case 'level_up':
      return `${username} reached Level ${metadata.level as number}: ${metadata.title as string}`;
    default:
      return `${username} did something awesome`;
  }
}

type FeedItemProps = {
  event: FeedEvent;
  onPressUser: (userId: string) => void;
  reactions?: ReactionCounts;
  onReact?: (eventId: string, emoji: 'fire' | 'heart' | 'clap') => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
};

export function FeedItem({
  event,
  onPressUser,
  reactions,
  onReact,
  isPremium,
  onUpgrade,
}: FeedItemProps) {
  const colors = useColors();
  const initial = event.displayName?.charAt(0).toUpperCase() ?? '?';

  const handleReact = (emoji: 'fire' | 'heart' | 'clap') => {
    haptics.light();
    if (!isPremium && onUpgrade) {
      onUpgrade();
      return;
    }
    onReact?.(event._id, emoji);
  };

  return (
    <Pressable
      onPress={() => onPressUser(event.userId)}
      style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
      accessibilityRole="button"
      accessibilityLabel={getEventText(event)}
    >
      <MaterialCard style={styles.card}>
        <View style={styles.row}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary },
            ]}
          >
            <ThemedText
              style={styles.avatarText}
              color={colors.primaryForeground}
            >
              {initial}
            </ThemedText>
          </View>

          <View style={styles.content}>
            <ThemedText style={styles.eventText} numberOfLines={2}>
              {getEventText(event)}
            </ThemedText>
            <ThemedText
              style={styles.timestamp}
              color={colors.mutedForeground}
            >
              {getRelativeTime(event.createdAt)}
            </ThemedText>
          </View>
        </View>

        {reactions && onReact && (
          <View style={styles.reactionBar}>
            {EMOJIS.map(({ key, label }) => {
              const count = reactions[key];
              const isActive = reactions.userReacted.includes(key);
              return (
                <Pressable
                  key={key}
                  onPress={() => handleReact(key)}
                  style={({ pressed }) => [
                    styles.reactionButton,
                    isActive && { backgroundColor: `${colors.primary}20` },
                    { opacity: pressed ? Opacity.pressed : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${key} reaction${count > 0 ? `, ${count}` : ''}`}
                >
                  <ThemedText style={styles.reactionEmoji}>{label}</ThemedText>
                  {count > 0 && (
                    <ThemedText
                      style={styles.reactionCount}
                      color={isActive ? colors.primary : colors.mutedForeground}
                    >
                      {count}
                    </ThemedText>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </MaterialCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: Spacing.xxs,
  },
  eventText: {
    fontSize: FontSize.base,
  },
  timestamp: {
    fontSize: FontSize.xs,
  },
  reactionBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingLeft: 44, // avatar width + gap
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: 12,
  },
  reactionEmoji: {
    fontSize: FontSize.base,
  },
  reactionCount: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
