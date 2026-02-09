import { Pressable, StyleSheet, View } from 'react-native';

import { MaterialCard } from '@/components/ui/material-card';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Opacity } from '@/constants/ui';

type Friend = {
  friendshipId: string;
  friendId: string;
  profile: {
    username: string;
    displayName?: string;
    bio?: string;
    isPublic: boolean;
  } | null;
  createdAt: number;
};

type FriendRowProps = {
  friend: Friend;
  onPress: (friendId: string) => void;
};

export function FriendRow({ friend, onPress }: FriendRowProps) {
  const colors = useColors();
  const initial =
    friend.profile?.displayName?.charAt(0).toUpperCase() ?? friend.profile?.username?.charAt(0).toUpperCase() ?? '?';

  return (
    <Pressable
      onPress={() => onPress(friend.friendId)}
      style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
      accessibilityRole="button"
      accessibilityLabel={`${friend.profile?.displayName ?? friend.profile?.username ?? 'Friend'}`}
    >
      <MaterialCard style={styles.card}>
        <View style={styles.row}>
          <View
            style={[styles.avatar, { backgroundColor: colors.primary }]}
          >
            <ThemedText
              style={styles.avatarText}
              color={colors.primaryForeground}
            >
              {initial}
            </ThemedText>
          </View>

          <View style={styles.info}>
            <ThemedText style={styles.displayName} numberOfLines={1}>
              {friend.profile?.displayName ?? friend.profile?.username ?? 'Unknown'}
            </ThemedText>
            <ThemedText
              style={styles.username}
              color={colors.mutedForeground}
              numberOfLines={1}
            >
              @{friend.profile?.username ?? 'unknown'}
            </ThemedText>
          </View>

          <IconSymbol
            name="chevron.right"
            size={IconSize.md}
            color={colors.mutedForeground}
          />
        </View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: Spacing.xxs,
  },
  displayName: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  username: {
    fontSize: FontSize.sm,
  },
});
