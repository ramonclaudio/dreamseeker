import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { router } from 'expo-router';

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UpgradeBanner } from '@/components/upgrade-banner';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { Colors, Radius } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

type Task = Doc<'tasks'>;

function TaskItem({
  task,
  onToggle,
  onDelete,
  colorScheme,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  colorScheme: 'light' | 'dark';
}) {
  const colors = Colors[colorScheme];

  return (
    <GlassCard style={styles.taskItem}>
      <Pressable onPress={onToggle} style={styles.taskContent}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: colors.primary,
              backgroundColor: task.isCompleted ? colors.primary : 'transparent',
            },
          ]}>
          {task.isCompleted && (
            <Text style={[styles.checkmark, { color: colors.primaryForeground }]}>✓</Text>
          )}
        </View>
        <Text
          style={[
            styles.taskText,
            {
              color: colors.foreground,
              textDecorationLine: task.isCompleted ? 'line-through' : 'none',
              opacity: task.isCompleted ? 0.5 : 1,
            },
          ]}>
          {task.text}
        </Text>
      </Pressable>
      <Pressable onPress={onDelete} style={styles.deleteButton}>
        <Text style={[styles.deleteText, { color: colors.destructive }]}>×</Text>
      </Pressable>
    </GlassCard>
  );
}

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
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

  const handleToggleTask = async (id: Task['_id']) => {
    haptics.selection();
    await toggleTask({ id });
  };

  const handleDeleteTask = async (id: Task['_id']) => {
    haptics.warning();
    await deleteTask({ id });
  };

  if (isLoading || tasks === undefined) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.foreground }]}>Tasks</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </Text>
        </View>
        {canAccess('starter') && (
          <Pressable
            onPress={() => {
              haptics.light();
              router.push('/history');
            }}
            style={({ pressed }) => [styles.historyButton, { opacity: pressed ? 0.7 : 1 }]}>
            <IconSymbol name="clock.arrow.circlepath" size={24} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      <UpgradeBanner />

      <GlassCard style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder="Add a new task..."
          placeholderTextColor={colors.mutedForeground}
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <Pressable
          onPress={handleAddTask}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          disabled={!newTaskText.trim()}>
          <Text style={[styles.addButtonText, { color: colors.primaryForeground }]}>Add</Text>
        </Pressable>
      </GlassCard>

      <View style={styles.taskList}>
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No tasks yet. Add one above!
            </Text>
          </View>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              colorScheme={colorScheme}
              onToggle={() => handleToggleTask(task._id)}
              onDelete={() => handleDeleteTask(task._id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 100 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  headerContent: { flex: 1 },
  historyButton: { padding: 8, marginBottom: 4 },
  title: { fontSize: 34, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  inputContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16 },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  addButton: { paddingHorizontal: 20, justifyContent: 'center', borderRadius: Radius.md, margin: 4 },
  addButtonText: { fontWeight: '600', fontSize: 14 },
  taskList: { paddingHorizontal: 20 },
  taskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, marginBottom: 8 },
  taskContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: Radius.sm, borderWidth: 2, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkmark: { fontSize: 14, fontWeight: 'bold' },
  taskText: { fontSize: 16, flex: 1 },
  deleteButton: { padding: 8 },
  deleteText: { fontSize: 24, fontWeight: '300' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 16 },
});
