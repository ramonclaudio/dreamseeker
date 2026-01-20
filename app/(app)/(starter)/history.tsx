import { useCallback } from 'react';
import { View, FlatList, Pressable, ActivityIndicator, type ListRenderItem } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useColors } from '@/hooks/use-color-scheme';
import { Radius, type ColorPalette } from '@/constants/theme';
import { MaxWidth, Spacing, TouchTarget, HitSlop, FontSize, IconSize } from '@/constants/layout';
import { Size, EmptyState } from '@/constants/ui';
import { MaterialCard } from '@/components/ui/material-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';

type Task = Doc<'tasks'>;

function TaskHistoryItem({ task, colors }: { task: Task; colors: ColorPalette }) {
  return (
    <MaterialCard style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md, marginBottom: Spacing.sm }}>
      <View style={{ width: Size.checkbox, height: Size.checkbox, borderRadius: Radius.sm, borderCurve: 'continuous', borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary, borderColor: colors.primary }}>
        <ThemedText style={{ fontSize: FontSize.base, fontWeight: 'bold' }} color={colors.primaryForeground}>✓</ThemedText>
      </View>
      <ThemedText style={{ fontSize: FontSize.xl, flex: 1 }} numberOfLines={2} ellipsizeMode="tail">{task.text}</ThemedText>
    </MaterialCard>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const completedTasks = useQuery(api.tasks.listCompleted);

  const renderItem: ListRenderItem<Task> = useCallback(({ item }) => (
    <TaskHistoryItem task={item} colors={colors} />
  ), [colors]);

  const keyExtractor = useCallback((item: Task) => item._id, []);

  const ListHeader = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: colors.border, position: 'relative' }}>
      <ThemedText variant="subtitle">Task History</ThemedText>
      <Pressable onPress={() => router.back()} hitSlop={HitSlop.sm} style={{ position: 'absolute', right: Spacing.xl, padding: Spacing.sm, minHeight: TouchTarget.min, minWidth: TouchTarget.min, justifyContent: 'center', alignItems: 'center' }} accessibilityRole="button" accessibilityLabel="Close">
        <IconSymbol name="xmark" size={IconSize.xl} color={colors.foreground} />
      </Pressable>
    </View>
  );

  const ListEmpty = completedTasks === undefined ? (
    <View style={{ paddingVertical: EmptyState.paddingVertical, alignItems: 'center' }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  ) : (
    <View style={{ alignItems: 'center', paddingVertical: EmptyState.paddingVertical, gap: Spacing.md }}>
      <IconSymbol name="clock.arrow.circlepath" size={IconSize['5xl']} color={colors.mutedForeground} />
      <ThemedText style={{ fontSize: FontSize['3xl'], fontWeight: '600' }}>No History Yet</ThemedText>
      <ThemedText style={{ fontSize: FontSize.base, textAlign: 'center' }} color={colors.mutedForeground}>
        Complete some tasks to see your history here.
      </ThemedText>
    </View>
  );

  const ListHeaderSection = completedTasks && completedTasks.length > 0 ? (
    <ThemedText style={{ fontSize: FontSize.md, fontWeight: '500', textTransform: 'uppercase', marginBottom: Spacing.md }} color={colors.mutedForeground}>
      {completedTasks.length} completed {completedTasks.length === 1 ? 'task' : 'tasks'}
    </ThemedText>
  ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {ListHeader}
      <FlatList
        data={completedTasks ?? []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: Math.max(Spacing.xl, insets.bottom), maxWidth: MaxWidth.content, alignSelf: 'center', width: '100%' }}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={ListHeaderSection}
        ListEmptyComponent={ListEmpty}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        getItemLayout={(_, index) => ({ length: 64, offset: 64 * index, index })}
      />
    </View>
  );
}
