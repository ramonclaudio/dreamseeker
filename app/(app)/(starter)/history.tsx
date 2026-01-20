import { useCallback } from 'react';
import { View, FlatList, Pressable, ActivityIndicator, type ListRenderItem } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';

type Task = Doc<'tasks'>;

function TaskHistoryItem({ task, colorScheme }: { task: Task; colorScheme: 'light' | 'dark' }) {
  const colors = Colors[colorScheme];
  return (
    <GlassCard style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, marginBottom: 8 }}>
      <View style={{ width: 24, height: 24, borderRadius: Radius.sm, borderCurve: 'continuous', borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary, borderColor: colors.primary }}>
        <ThemedText style={{ fontSize: 14, fontWeight: 'bold' }} color={colors.primaryForeground}>✓</ThemedText>
      </View>
      <ThemedText style={{ fontSize: 16, flex: 1 }}>{task.text}</ThemedText>
    </GlassCard>
  );
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const completedTasks = useQuery(api.tasks.listCompleted);

  const renderItem: ListRenderItem<Task> = useCallback(({ item }) => (
    <TaskHistoryItem task={item} colorScheme={colorScheme} />
  ), [colorScheme]);

  const keyExtractor = useCallback((item: Task) => item._id, []);

  const ListHeader = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
      <View style={{ width: 60 }} />
      <ThemedText variant="subtitle">Task History</ThemedText>
      <Pressable onPress={() => router.back()} hitSlop={8} style={{ width: 60, alignItems: 'flex-end' }}>
        <IconSymbol name="xmark" size={20} color={colors.foreground} />
      </Pressable>
    </View>
  );

  const ListEmpty = completedTasks === undefined ? (
    <View style={{ paddingVertical: 60, alignItems: 'center' }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  ) : (
    <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
      <IconSymbol name="clock.arrow.circlepath" size={48} color={colors.mutedForeground} />
      <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>No History Yet</ThemedText>
      <ThemedText style={{ fontSize: 14, textAlign: 'center' }} color={colors.mutedForeground}>
        Complete some tasks to see your history here.
      </ThemedText>
    </View>
  );

  const ListHeaderSection = completedTasks && completedTasks.length > 0 ? (
    <ThemedText style={{ fontSize: 13, fontWeight: '500', textTransform: 'uppercase', marginBottom: 12 }} color={colors.mutedForeground}>
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
        contentContainerStyle={{ padding: 20 }}
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
