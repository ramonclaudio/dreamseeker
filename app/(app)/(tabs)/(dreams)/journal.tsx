import { View, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState, useCallback } from 'react';

import type { Id } from '@/convex/_generated/dataModel';
import { SkeletonJournalEntry } from '@/components/ui/skeleton';
import { MaterialCard } from '@/components/ui/material-card';
import { SwipeableRow } from '@/components/ui/swipeable-row';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { useJournal } from '@/hooks/use-journal';
import { Spacing, FontSize, IconSize, MaxWidth, TAB_BAR_CLEARANCE } from '@/constants/layout';
import { Radius } from '@/constants/theme';
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
  const { from } = useLocalSearchParams<{ from?: string }>();

  const handleBack = useCallback(() => {
    if (from === 'today') {
      router.navigate('/(app)/(tabs)/today');
    } else {
      router.back();
    }
  }, [from]);
  const [refreshing, setRefreshing] = useState(false);
  const { entries, isLoading, remove } = useJournal();

  const handleNewEntry = () => {
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
      <Stack.Screen
        options={{
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={handleBack}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, paddingRight: Spacing.md }}
              hitSlop={8}
            >
              <IconSymbol name="chevron.left" size={22} color={colors.primary} weight="medium" />
              <ThemedText style={{ fontSize: 17 }} color={colors.primary}>
                Back
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: TAB_BAR_CLEARANCE,
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
            backgroundColor: colors.accent,
            borderWidth: 0,
            borderColor: 'transparent',
            opacity: pressed ? 0.8 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Create new journal entry"
        >
          <IconSymbol
            name="plus"
            size={IconSize.xl}
            color={colors.onColor}
            weight="bold"
          />
          <ThemedText
            style={{ fontSize: FontSize.xl, fontWeight: '600' }}
            color={colors.onColor}
          >
            New Entry
          </ThemedText>
        </Pressable>


        {/* Entries */}
        {isLoading ? (
          <>
            <SkeletonJournalEntry />
            <SkeletonJournalEntry />
            <SkeletonJournalEntry />
          </>
        ) : entries.length > 0 ? (
          entries.map((entry) => (
            <View key={entry._id} style={{ marginBottom: Spacing.sm }}>
              <SwipeableRow
                onEdit={() => handleEditEntry(entry._id)}
                onDelete={() => handleDeleteEntry(entry._id, entry.title)}
                editColor={colors.accent}
                deleteColor={colors.destructive}
              >
                <Pressable
                  onPress={() => handleEditEntry(entry._id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Journal entry: ${entry.title}`}
                  accessibilityHint="Double tap to edit"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <MaterialCard style={{ padding: Spacing.lg }}>
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
                    <ThemedText
                      style={{ fontSize: FontSize.base, lineHeight: 22 }}
                      color={colors.mutedForeground}
                      numberOfLines={2}
                    >
                      {entry.body}
                    </ThemedText>
                  </MaterialCard>
                </Pressable>
              </SwipeableRow>
            </View>
          ))
        ) : (
          <MaterialCard style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <IconSymbol
              name="book.fill"
              size={IconSize['4xl']}
              color={colors.accent}
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
