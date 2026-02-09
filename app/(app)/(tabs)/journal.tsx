import { View, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

import type { Id } from '@/convex/_generated/dataModel';
import { SkeletonJournalEntry } from '@/components/ui/skeleton';
import { MaterialCard } from '@/components/ui/material-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { ProBadge } from '@/components/ui/pro-badge';
import { useColors } from '@/hooks/use-color-scheme';
import { useJournal } from '@/hooks/use-journal';
import { useSubscription } from '@/hooks/use-subscription';
import { Spacing, FontSize, IconSize, MaxWidth, TAB_BAR_HEIGHT, HitSlop } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { FREE_JOURNAL_DAILY_LIMIT } from '@/convex/constants';
import { haptics } from '@/lib/haptics';

const MOOD_LABELS: Record<string, string> = {
  great: '\u{1F31F} Great',
  good: '\u{1F60A} Good',
  okay: '\u{1F610} Okay',
  tough: '\u{1F614} Tough',
};

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function JournalListScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const { entries, todayCount, isLoading, remove } = useJournal();
  const { isPremium, showUpgrade } = useSubscription();

  const canCreateEntry = isPremium || todayCount < FREE_JOURNAL_DAILY_LIMIT;
  const isAtLimit = !isPremium && todayCount >= FREE_JOURNAL_DAILY_LIMIT;

  const handleNewEntry = () => {
    if (!canCreateEntry) {
      haptics.warning();
      showUpgrade();
      return;
    }
    haptics.light();
    router.push('/(app)/journal-entry');
  };

  const handleEditEntry = (id: string) => {
    haptics.light();
    router.push({ pathname: '/(app)/journal-entry', params: { id } });
  };

  const handleDeleteEntry = (id: string, title: string) => {
    Alert.alert(
      'Delete this entry?',
      `Delete "${title}"? Costs 10 XP.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(id as Id<'journalEntries'>);
              haptics.warning();
            } catch {
              haptics.error();
              Alert.alert('Delete Failed', 'Could not delete entry. Please try again.');
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT,
          maxWidth: MaxWidth.content,
          alignSelf: 'center',
          width: '100%',
        }}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* New Entry Button */}
        <Pressable
          onPress={handleNewEntry}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            paddingVertical: Spacing.lg,
            marginTop: Spacing.lg,
            marginBottom: Spacing.lg,
            borderRadius: Radius.lg,
            backgroundColor: isAtLimit ? colors.surfaceTinted : colors.accentBlue,
            borderWidth: isAtLimit ? 1.5 : 0,
            borderColor: isAtLimit ? colors.borderAccent : 'transparent',
            opacity: pressed ? 0.8 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel={isAtLimit ? 'Upgrade to create more journal entries' : 'Create new journal entry'}
        >
          <IconSymbol
            name={isAtLimit ? 'lock.fill' : 'plus'}
            size={IconSize.xl}
            color={isAtLimit ? colors.mutedForeground : colors.onColor}
            weight="bold"
          />
          <ThemedText
            style={{ fontSize: FontSize.xl, fontWeight: '600' }}
            color={isAtLimit ? colors.mutedForeground : colors.onColor}
          >
            {isAtLimit ? 'Unlock More Entries' : 'New Entry'}
          </ThemedText>
          {isAtLimit && <ProBadge />}
        </Pressable>

        {isAtLimit && (
          <Pressable
            onPress={() => {
              haptics.light();
              showUpgrade();
            }}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to Premium for unlimited journal entries"
            accessibilityHint="Opens subscription screen"
            style={({ pressed }) => ({
              alignSelf: 'center',
              marginBottom: Spacing.lg,
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.sm,
              borderRadius: Radius.lg,
              backgroundColor: colors.surfaceTinted,
              borderWidth: 1,
              borderColor: colors.borderAccent,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <IconSymbol name="sparkles" size={IconSize.md} color={colors.accentBlue} />
              <ThemedText
                style={{ fontSize: FontSize.base, fontWeight: '600' }}
                color={colors.foreground}
              >
                Ready to journal unlimited?
              </ThemedText>
            </View>
            <ThemedText
              style={{ fontSize: FontSize.sm, marginTop: Spacing.xxs }}
              color={colors.mutedForeground}
            >
              Premium unlocks unlimited entries. Your thoughts deserve space.
            </ThemedText>
          </Pressable>
        )}

        {/* Entries */}
        {isLoading ? (
          <>
            <SkeletonJournalEntry />
            <SkeletonJournalEntry />
            <SkeletonJournalEntry />
          </>
        ) : entries.length > 0 ? (
          entries.map((entry) => (
            <Pressable
              key={entry._id}
              onPress={() => handleEditEntry(entry._id)}
              accessibilityRole="button"
              accessibilityLabel={`Journal entry: ${entry.title}`}
              accessibilityHint="Double tap to edit"
              style={({ pressed }) => ({
                marginBottom: Spacing.sm,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <MaterialCard style={{ padding: Spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <ThemedText
                      style={{ fontSize: FontSize.xl, fontWeight: '600', marginBottom: Spacing.xs }}
                      numberOfLines={1}
                    >
                      {entry.title}
                    </ThemedText>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: Spacing.sm,
                        marginBottom: Spacing.sm,
                      }}
                    >
                      <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
                        {formatDate(entry.date)}
                      </ThemedText>
                      {entry.mood && (
                        <View
                          style={{
                            paddingHorizontal: Spacing.sm,
                            paddingVertical: Spacing.xxs,
                            borderRadius: Radius.sm,
                            backgroundColor: colors.secondary,
                          }}
                        >
                          <ThemedText style={{ fontSize: FontSize.sm }}>
                            {MOOD_LABELS[entry.mood] ?? entry.mood}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteEntry(entry._id, entry.title);
                    }}
                    hitSlop={HitSlop.md}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${entry.title}`}
                    accessibilityHint="Costs 10 XP"
                    style={{ padding: Spacing.xs }}
                  >
                    <IconSymbol name="trash.fill" size={IconSize.lg} color={colors.destructive} />
                  </Pressable>
                </View>
                <ThemedText
                  style={{ fontSize: FontSize.base, lineHeight: 22 }}
                  color={colors.mutedForeground}
                  numberOfLines={2}
                >
                  {entry.body}
                </ThemedText>
              </MaterialCard>
            </Pressable>
          ))
        ) : (
          <MaterialCard style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <IconSymbol
              name="book.fill"
              size={IconSize['4xl']}
              color={colors.accentBlue}
            />
            <ThemedText
              style={{
                fontSize: FontSize.lg,
                marginTop: Spacing.md,
                textAlign: 'center',
              }}
              color={colors.mutedForeground}
            >
              Your story starts here, sis. Write your first entry and earn XP!
            </ThemedText>
          </MaterialCard>
        )}
      </ScrollView>
    </View>
  );
}
