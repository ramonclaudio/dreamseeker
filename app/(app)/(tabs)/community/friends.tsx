import { View, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

import { FriendRequestRow } from '@/components/community/friend-request-row';
import { FriendRow } from '@/components/community/friend-row';
import { MaterialCard } from '@/components/ui/material-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { useFriends } from '@/hooks/use-friends';
import { useSubscription } from '@/hooks/use-subscription';
import { Spacing, FontSize, MaxWidth, IconSize, TAB_BAR_HEIGHT } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

type IncomingRequest = {
  requestId: string;
  fromUserId: string;
  profile: { username: string; displayName?: string } | null;
  createdAt: number;
};

type FriendEntry = {
  friendshipId: string;
  friendId: string;
  profile: { username: string; displayName?: string; bio?: string; isPublic: boolean } | null;
  createdAt: number;
};

type OutgoingRequest = {
  requestId: string;
  toUserId: string;
  profile: { username: string; displayName?: string } | null;
  createdAt: number;
};

type SectionItem =
  | { type: 'request'; data: IncomingRequest }
  | { type: 'friend'; data: FriendEntry }
  | { type: 'outgoing'; data: OutgoingRequest };

export default function FriendsScreen() {
  const colors = useColors();
  const { isPremium } = useSubscription();
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    isLoading,
    acceptRequest,
    rejectRequest,
  } = useFriends();

  const handleAccept = async (requestId: string) => {
    try {
      haptics.light();
      await acceptRequest(requestId as never);
      haptics.success();
    } catch {
      haptics.error();
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      haptics.light();
      await rejectRequest(requestId as never);
    } catch {
      haptics.error();
    }
  };

  const handlePressFriend = (friendId: string) => {
    router.push(`/(app)/user-profile/${friendId}`);
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const sections: { title: string; data: SectionItem[] }[] = [];

  if (incomingRequests.length > 0) {
    sections.push({
      title: 'Pending Requests',
      data: incomingRequests.map((r: IncomingRequest) => ({ type: 'request' as const, data: r })),
    });
  }

  if (friends.length > 0) {
    sections.push({
      title: 'Friends',
      data: friends.map((f: FriendEntry) => ({ type: 'friend' as const, data: f })),
    });
  }

  if (isPremium && outgoingRequests.length > 0) {
    sections.push({
      title: 'Sent Requests',
      data: outgoingRequests.map((r: OutgoingRequest) => ({ type: 'outgoing' as const, data: r })),
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => {
          if (item.type === 'request') return item.data.requestId;
          if (item.type === 'friend') return item.data.friendshipId;
          return item.data.requestId;
        }}
        renderItem={({ item }) => {
          if (item.type === 'request') {
            return (
              <FriendRequestRow
                request={item.data}
                onAccept={() => handleAccept(item.data.requestId)}
                onReject={() => handleReject(item.data.requestId)}
              />
            );
          }
          if (item.type === 'friend') {
            return (
              <FriendRow
                friend={item.data}
                onPress={handlePressFriend}
              />
            );
          }
          // outgoing
          const profile = item.data.profile;
          const initial = profile?.displayName?.charAt(0).toUpperCase() ?? profile?.username?.charAt(0).toUpperCase() ?? '?';
          return (
            <MaterialCard style={styles.outgoingCard}>
              <View style={styles.outgoingRow}>
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
                <View style={styles.info}>
                  <ThemedText style={styles.displayName} numberOfLines={1}>
                    {profile?.displayName ?? profile?.username ?? 'Unknown'}
                  </ThemedText>
                  <ThemedText
                    style={styles.username}
                    color={colors.mutedForeground}
                    numberOfLines={1}
                  >
                    @{profile?.username ?? 'unknown'}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.requestedBadge,
                    { backgroundColor: colors.muted },
                  ]}
                >
                  <ThemedText
                    style={styles.requestedText}
                    color={colors.mutedForeground}
                  >
                    Requested
                  </ThemedText>
                </View>
              </View>
            </MaterialCard>
          );
        }}
        renderSectionHeader={({ section }) => (
          <View
            style={[
              styles.sectionHeader,
              { backgroundColor: colors.background },
            ]}
          >
            <ThemedText
              style={styles.sectionTitle}
              color={colors.mutedForeground}
              accessibilityRole="header"
            >
              {section.title}
            </ThemedText>
          </View>
        )}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.md,
          paddingBottom: TAB_BAR_HEIGHT,
          maxWidth: MaxWidth.content,
          alignSelf: 'center',
          width: '100%',
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol
              name="person.2.fill"
              size={IconSize['4xl']}
              color={colors.mutedForeground}
            />
            <ThemedText
              style={styles.emptyTitle}
              color={colors.mutedForeground}
            >
              No friends yet
            </ThemedText>
            <ThemedText
              style={styles.emptySubtitle}
              color={colors.mutedForeground}
            >
              Search for people to connect with.
            </ThemedText>
          </View>
        }
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  outgoingCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  outgoingRow: {
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
  requestedBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  requestedText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing['4xl'],
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
  },
});
