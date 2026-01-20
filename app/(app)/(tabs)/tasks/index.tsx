import { useState, useCallback, memo } from 'react';
import {
  View,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  type ListRenderItem,
} from 'react-native';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { router } from 'expo-router';

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { GlassControl } from '@/components/ui/glass-control';
import { MaterialCard } from '@/components/ui/material-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { UpgradeBanner } from '@/components/upgrade-banner';
import { useColors } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { Radius, type ColorPalette } from '@/constants/theme';
import { Spacing, TouchTarget, FontSize, HitSlop, MaxWidth, IconSize } from '@/constants/layout';
import { Opacity, Size, Keyboard } from '@/constants/ui';
import { haptics } from '@/lib/haptics';

type Task = Doc<'tasks'>;

const taskItemStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm };
const taskContentStyle = { flex: 1, flexDirection: 'row' as const, alignItems: 'center' as const, minHeight: TouchTarget.min };
const checkboxStyle = { width: Size.checkbox, height: Size.checkbox, borderRadius: Radius.sm, borderCurve: 'continuous' as const, borderWidth: 2, marginRight: Spacing.md, justifyContent: 'center' as const, alignItems: 'center' as const };
const deleteButtonStyle = { padding: Spacing.sm, minWidth: TouchTarget.min, minHeight: TouchTarget.min, justifyContent: 'center' as const, alignItems: 'center' as const };

const TaskItem = memo(function TaskItem({
  task,
  onToggle,
  onDelete,
  colors,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  colors: ColorPalette;
}) {

  return (
    <MaterialCard style={taskItemStyle}>
      <Pressable
        onPress={onToggle}
        style={taskContentStyle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.isCompleted }}
        accessibilityLabel={`${task.text}, ${task.isCompleted ? 'completed' : 'not completed'}`}
        accessibilityHint="Double tap to toggle"
        hitSlop={{ top: HitSlop.md, bottom: HitSlop.md, left: HitSlop.md, right: HitSlop.md }}
      >
        <View
          style={[
            checkboxStyle,
            {
              borderColor: colors.primary,
              backgroundColor: task.isCompleted ? colors.primary : 'transparent',
            },
          ]}>
          {task.isCompleted && (
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: 'bold' }} color={colors.primaryForeground} accessibilityElementsHidden>✓</ThemedText>
          )}
        </View>
        <ThemedText
          style={{
            fontSize: FontSize.xl,
            flex: 1,
            textDecorationLine: task.isCompleted ? 'line-through' : 'none',
            opacity: task.isCompleted ? 0.5 : 1,
          }}
          numberOfLines={2}
          ellipsizeMode="tail">
          {task.text}
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={onDelete}
        style={deleteButtonStyle}
        accessibilityRole="button"
        accessibilityLabel={`Delete task "${task.text}"`}
        accessibilityHint="Double tap to delete this task"
        hitSlop={{ top: HitSlop.md, bottom: HitSlop.md, left: HitSlop.md, right: HitSlop.md }}
      >
        <ThemedText style={{ fontSize: FontSize['5xl'], fontWeight: '400' }} color={colors.destructive} accessibilityElementsHidden>×</ThemedText>
      </Pressable>
    </MaterialCard>
  );
});

export default function TasksScreen() {
  const colors = useColors();
  const [newTaskText, setNewTaskText] = useState('');
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { canCreateTask, canAccess, showUpgrade } = useSubscription();

  const tasks = useQuery(api.tasks.list, isAuthenticated ? {} : 'skip');
  const createTask = useMutation(api.tasks.create);
  const toggleTask = useMutation(api.tasks.toggle);
  const deleteTask = useMutation(api.tasks.remove);

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    if (!canCreateTask) {
      haptics.warning();
      showUpgrade();
      return;
    }

    haptics.medium();
    try {
      await createTask({ text: newTaskText.trim() });
      setNewTaskText('');
    } catch (error) {
      if (error instanceof Error && error.message === 'LIMIT_REACHED') {
        haptics.warning();
        showUpgrade();
      }
    }
  };

  const handleToggleTask = useCallback(async (id: Task['_id']) => {
    haptics.selection();
    await toggleTask({ id });
  }, [toggleTask]);

  const handleDeleteTask = useCallback(async (id: Task['_id']) => {
    haptics.warning();
    await deleteTask({ id });
  }, [deleteTask]);

  const renderItem: ListRenderItem<Task> = useCallback(({ item }) => (
    <TaskItem
      task={item}
      colors={colors}
      onToggle={() => handleToggleTask(item._id)}
      onDelete={() => handleDeleteTask(item._id)}
    />
  ), [colors, handleToggleTask, handleDeleteTask]);

  const keyExtractor = useCallback((item: Task) => item._id, []);

  if (isLoading || tasks === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const ListHeader = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: Spacing.lg }}>
        <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </ThemedText>
        {canAccess('starter') && (
          <Pressable
            onPress={() => {
              haptics.light();
              router.push('/history');
            }}
            style={({ pressed }) => [{ padding: HitSlop.md, minWidth: TouchTarget.min, minHeight: TouchTarget.min, justifyContent: 'center', alignItems: 'center' }, { opacity: pressed ? Opacity.pressed : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="View completed tasks history"
            accessibilityHint="Opens a list of your completed tasks"
          >
            <IconSymbol name="clock.arrow.circlepath" size={IconSize['3xl']} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      <UpgradeBanner />

      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg }}>
        <MaterialCard style={{ flex: 1 }}>
          <TextInput
            style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md + 2, fontSize: FontSize.xl, color: colors.foreground }}
            placeholder="Add a new task..."
            placeholderTextColor={colors.mutedForeground}
            value={newTaskText}
            onChangeText={setNewTaskText}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
            accessibilityLabel="New task input"
            accessibilityHint="Enter a task description and tap Add or press return"
          />
        </MaterialCard>
        <GlassControl isInteractive style={{ justifyContent: 'center', paddingHorizontal: Spacing.xl }}>
          <Pressable
            onPress={handleAddTask}
            disabled={!newTaskText.trim()}
            style={{ minHeight: TouchTarget.min, justifyContent: 'center', opacity: !newTaskText.trim() ? Opacity.disabled : 1 }}
            accessibilityRole="button"
            accessibilityLabel="Add task"
            accessibilityState={{ disabled: !newTaskText.trim() }}
            accessibilityHint="Tap to add the new task"
          >
            <ThemedText style={{ fontWeight: '600', fontSize: FontSize.base }}>Add</ThemedText>
          </Pressable>
        </GlassControl>
      </View>
    </>
  );

  const ListEmpty = (
    <View style={{ paddingVertical: Spacing['4xl'], alignItems: 'center' }}>
      <ThemedText style={{ fontSize: FontSize.xl }} color={colors.mutedForeground}>
        No tasks yet. Add one above!
      </ThemedText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardVerticalOffset={Keyboard.verticalOffset}>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Spacing['4xl'], paddingHorizontal: Spacing.xl, maxWidth: MaxWidth.content, alignSelf: 'center', width: '100%' }}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
        accessibilityRole="list"
        accessibilityLabel="Task list"
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}
