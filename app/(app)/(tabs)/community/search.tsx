import {
  View,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

import { UserSearchResult } from '@/components/community/user-search-result';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { useCommunity } from '@/hooks/use-community';
import { useFriends } from '@/hooks/use-friends';
import { useSubscription } from '@/hooks/use-subscription';
import { Spacing, FontSize, MaxWidth, IconSize, TAB_BAR_HEIGHT } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';
import { haptics } from '@/lib/haptics';

export default function SearchScreen() {
  const colors = useColors();
  const { isPremium, showUpgrade } = useSubscription();
  const { searchQuery, setSearchQuery, searchResults, isSearching } =
    useCommunity();
  const { sendRequest } = useFriends();

  const handleSendRequest = async (userId: string) => {
    try {
      haptics.light();
      await sendRequest(userId);
      haptics.success();
    } catch {
      haptics.error();
    }
  };

  const handlePressUser = (userId: string) => {
    router.push(`/(app)/user-profile/${userId}`);
  };

  if (!isPremium) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.lockedState}>
          <IconSymbol
            name="lock.fill"
            size={IconSize['5xl']}
            color={colors.mutedForeground}
          />
          <ThemedText style={styles.emptyTitle}>Premium Feature</ThemedText>
          <ThemedText
            style={styles.emptySubtitle}
            color={colors.mutedForeground}
          >
            Upgrade to search for friends and grow your circle.
          </ThemedText>
          <Pressable
            onPress={showUpgrade}
            style={({ pressed }) => [
              styles.upgradeButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? Opacity.pressed : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to premium"
          >
            <ThemedText style={styles.upgradeText} color={colors.primaryForeground}>
              Upgrade
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  const hasQuery = searchQuery.trim().length > 0;
  const noResults = hasQuery && !isSearching && searchResults?.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderAccent,
            },
          ]}
        >
          <IconSymbol
            name="magnifyingglass"
            size={IconSize.lg}
            color={colors.mutedForeground}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or username..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.text }]}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search users"
          />
          {isSearching && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </View>
      </View>

      <FlatList
        data={searchResults ?? []}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <UserSearchResult
            profile={item}
            onSendRequest={handleSendRequest}
            onPress={handlePressUser}
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
        ListEmptyComponent={
          !hasQuery ? (
            <View style={styles.emptyState}>
              <IconSymbol
                name="magnifyingglass"
                size={IconSize['4xl']}
                color={colors.mutedForeground}
              />
              <ThemedText
                style={styles.emptyTitle}
                color={colors.mutedForeground}
              >
                Search for people
              </ThemedText>
              <ThemedText
                style={styles.emptySubtitle}
                color={colors.mutedForeground}
              >
                Find friends by name or username.
              </ThemedText>
            </View>
          ) : noResults ? (
            <View style={styles.emptyState}>
              <IconSymbol
                name="person.fill"
                size={IconSize['4xl']}
                color={colors.mutedForeground}
              />
              <ThemedText
                style={styles.emptyTitle}
                color={colors.mutedForeground}
              >
                No results found
              </ThemedText>
              <ThemedText
                style={styles.emptySubtitle}
                color={colors.mutedForeground}
              >
                Try a different search term.
              </ThemedText>
            </View>
          ) : null
        }
        keyboardDismissMode="on-drag"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.DEFAULT,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.xl,
    paddingVertical: Spacing.xs,
  },
  lockedState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  upgradeButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  upgradeText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
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
