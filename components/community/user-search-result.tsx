import { Pressable, StyleSheet, View } from 'react-native';

import { MaterialCard } from '@/components/ui/material-card';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';

type FriendshipStatus = 'friends' | 'pending' | 'none';

type Profile = {
  userId: string;
  username: string;
  displayName?: string;
  bio?: string;
  isPublic: boolean;
  friendshipStatus: FriendshipStatus;
};

type UserSearchResultProps = {
  profile: Profile;
  onSendRequest: (userId: string) => void;
  onPress: (userId: string) => void;
};

export function UserSearchResult({
  profile,
  onSendRequest,
  onPress,
}: UserSearchResultProps) {
  const colors = useColors();
  const initial = profile.displayName?.charAt(0).toUpperCase() ?? '?';

  return (
    <Pressable
      onPress={() => onPress(profile.userId)}
      style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
      accessibilityRole="button"
      accessibilityLabel={`${profile.displayName}, @${profile.username}`}
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
              {profile.displayName}
            </ThemedText>
            <ThemedText
              style={styles.username}
              color={colors.mutedForeground}
              numberOfLines={1}
            >
              @{profile.username}
            </ThemedText>
            {profile.bio ? (
              <ThemedText
                style={styles.bio}
                color={colors.mutedForeground}
                numberOfLines={1}
              >
                {profile.bio}
              </ThemedText>
            ) : null}
          </View>

          {profile.friendshipStatus === 'none' && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onSendRequest(profile.userId);
              }}
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? Opacity.pressed : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Add ${profile.displayName}`}
            >
              <ThemedText
                style={styles.addButtonText}
                color={colors.primaryForeground}
              >
                Add
              </ThemedText>
            </Pressable>
          )}

          {profile.friendshipStatus === 'pending' && (
            <ThemedText style={styles.statusText} color={colors.mutedForeground}>
              Pending
            </ThemedText>
          )}

          {profile.friendshipStatus === 'friends' && (
            <View style={styles.friendsStatus}>
              <IconSymbol
                name="checkmark"
                size={IconSize.sm}
                color={colors.success}
              />
              <ThemedText style={styles.statusText} color={colors.mutedForeground}>
                Friends
              </ThemedText>
            </View>
          )}
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
  bio: {
    fontSize: FontSize.sm,
  },
  addButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  addButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  friendsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
