import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
    <View style={[styles.taskItem, { backgroundColor: colors.card }]}>
      <Pressable onPress={onToggle} style={styles.taskContent}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: colors.tint,
              backgroundColor: task.isCompleted ? colors.tint : 'transparent',
            },
          ]}>
          {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text
          style={[
            styles.taskText,
            {
              color: colors.text,
              textDecorationLine: task.isCompleted ? 'line-through' : 'none',
              opacity: task.isCompleted ? 0.5 : 1,
            },
          ]}>
          {task.text}
        </Text>
      </Pressable>
      <Pressable onPress={onDelete} style={styles.deleteButton}>
        <Text style={styles.deleteText}>×</Text>
      </Pressable>
    </View>
  );
}

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [newTaskText, setNewTaskText] = useState('');

  const tasks = useQuery(api.tasks.list);
  const createTask = useMutation(api.tasks.create);
  const toggleTask = useMutation(api.tasks.toggle);
  const deleteTask = useMutation(api.tasks.remove);

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    await createTask({ text: newTaskText.trim() });
    setNewTaskText('');
  };

  if (tasks === undefined) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </Text>
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Add a new task..."
          placeholderTextColor={colors.icon}
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <Pressable
          onPress={handleAddTask}
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          disabled={!newTaskText.trim()}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            colorScheme={colorScheme}
            onToggle={() => toggleTask({ id: item._id })}
            onDelete={() => deleteTask({ id: item._id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              No tasks yet. Add one above!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  addButton: {
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 24,
    color: '#ff6b6b',
    fontWeight: '300',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
