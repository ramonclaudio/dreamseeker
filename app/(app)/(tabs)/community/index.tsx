import { View, FlatList, RefreshControl, Pressable } from 'react-native';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useQuery } from 'convex/react';

import { FeedItem } from '@/components/community/feed-item';
import { PendingRequestsBanner } from '@/components/community/pending-requests-banner';
import { EmptyCommunity } from '@/components/community/empty-community';
import { LockedCommunity } from '@/components/community/locked-community';
import { PremiumBanner } from '@/components/community/premium-banner';
import { WeeklyChallengeCard } from '@/components/community/weekly-challenge-card';
import { ProfileSetupModal } from '@/components/community/profile-setup-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { useFeed } from '@/hooks/use-feed';
import { useFriends } from '@/hooks/use-friends';
import { useSubscription } from '@/hooks/use-subscription';
import { api } from '@/convex/_generated/api';
import { Spacing, MaxWidth, IconSize, TAB_BAR_HEIGHT } from '@/constants/layout';
import { Opacity } from '@/constants/ui';

export default function CommunityFeedScreen() {
  const colors = useColors();
  const { events, isLoading, reactions, toggleReaction } = useFeed();
  const { pendingCount, friends } = useFriends();
  const { isPremium, showUpgrade } = useSubscription();
  const myProfile = useQuery(api.community.getMyProfile);
  const [refreshing, setRefreshing] = useState(false);
  const [profileSetupDone, setProfileSetupDone] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  const handlePressUser = (userId: string) => {
    router.push(`/(app)/user-profile/${userId}`);
  };

  const handleReact = (eventId: string, emoji: 'fire' | 'heart' | 'clap') => {
    toggleReaction(eventId, emoji);
  };

  const handleHeaderAction = (route: string) => {
    if (!isPremium) {
      showUpgrade();
      return;
    }
    router.push(route as never);
  };

  // Show locked state for free users with no friends
  const showLocked = !isPremium && friends.length === 0 && !isLoading;

  // Show profile setup for premium users without a display name
  const needsProfileSetup =
    isPremium &&
    !profileSetupDone &&
    myProfile !== undefined &&
    (!myProfile || !myProfile.displayName);

  const isEmpty = !isLoading && events.length === 0 && friends.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: Spacing.lg }}>
              <Pressable
                onPress={() => handleHeaderAction('/(app)/(tabs)/community/search')}
                style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1, padding: Spacing.xs })}
                accessibilityRole="button"
                accessibilityLabel="Search people"
              >
                <IconSymbol
                  name="magnifyingglass"
                  size={IconSize.xl}
                  color={isPremium ? colors.tint : colors.mutedForeground}
                />
              </Pressable>
              <Pressable
                onPress={() => handleHeaderAction('/(app)/(tabs)/community/friends')}
                style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1, padding: Spacing.xs })}
                accessibilityRole="button"
                accessibilityLabel="Friends list"
              >
                <IconSymbol
                  name="person.badge.plus"
                  size={IconSize.xl}
                  color={isPremium ? colors.tint : colors.mutedForeground}
                />
              </Pressable>
            </View>
          ),
        }}
      />

      {needsProfileSetup && (
        <ProfileSetupModal
          visible
          onComplete={() => setProfileSetupDone(true)}
        />
      )}

      {showLocked ? (
        <View style={{ flex: 1, justifyContent: 'center', padding: Spacing.lg }}>
          <LockedCommunity onUpgrade={showUpgrade} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <FeedItem
              event={item}
              onPressUser={handlePressUser}
              reactions={reactions[item._id]}
              onReact={handleReact}
              isPremium={isPremium}
              onUpgrade={showUpgrade}
            />
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
          ListHeaderComponent={
            <>
              <WeeklyChallengeCard isPremium={isPremium} onUpgrade={showUpgrade} />
              {!isPremium && friends.length > 0 && (
                <PremiumBanner onPress={showUpgrade} />
              )}
              {pendingCount > 0 && (
                <PendingRequestsBanner
                  count={pendingCount}
                  onPress={() => router.push('/(app)/(tabs)/community/friends')}
                />
              )}
            </>
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                <ThemedText color={colors.mutedForeground}>
                  Loading...
                </ThemedText>
              </View>
            ) : isEmpty ? (
              <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                <ThemedText color={colors.mutedForeground}>
                  No recent activity from friends.
                </ThemedText>
              </View>
            ) : friends.length === 0 ? (
              <EmptyCommunity
                onSearch={() => handleHeaderAction('/(app)/(tabs)/community/search')}
              />
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}
