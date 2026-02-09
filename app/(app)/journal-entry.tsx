import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from 'convex/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { MoodSelector } from '@/components/journal/mood-selector';
import { JournalPromptCard } from '@/components/journal/journal-prompt-card';
import { useColors } from '@/hooks/use-color-scheme';
import { useJournal } from '@/hooks/use-journal';
import { useSubscription } from '@/hooks/use-subscription';
import { Spacing, FontSize, TouchTarget, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { Mood } from '@/constants/dreams';
import { haptics } from '@/lib/haptics';
import { timezone } from '@/lib/timezone';

export default function JournalNewScreen() {
  const { id, dreamId: dreamIdParam } = useLocalSearchParams<{ id?: string; dreamId?: string }>();
  const isEditing = !!id;
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { create, update, remove } = useJournal();
  const { showUpgrade } = useSubscription();
  const existingEntry = useQuery(
    api.journal.get,
    isEditing ? { id: id as Id<'journalEntries'> } : 'skip'
  );

  const dreams = useQuery(api.dreams.listWithActionCounts);
  const dailyPrompt = useQuery(api.journalPrompts.getDailyPrompt, { timezone });

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<Mood | undefined>();
  const [dreamId, setDreamId] = useState<Id<'dreams'> | undefined>();
  const [saving, setSaving] = useState(false);

  // Populate fields when editing
  useEffect(() => {
    if (existingEntry && isEditing) {
      setTitle(existingEntry.title);
      setBody(existingEntry.body);
      setMood(existingEntry.mood ?? undefined);
      setDreamId(existingEntry.dreamId ?? undefined);
    }
  }, [existingEntry, isEditing]);

  // Pre-select dream from nav param (new entries only)
  useEffect(() => {
    if (!isEditing && dreamIdParam) {
      setDreamId(dreamIdParam as Id<'dreams'>);
    }
  }, [isEditing, dreamIdParam]);

  const handleDelete = () => {
    if (!isEditing) return;
    Alert.alert(
      'Delete this entry?',
      'Your words matter. Deleting costs 10 XP.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(id as Id<'journalEntries'>);
              haptics.warning();
              router.back();
            } catch {
              haptics.error();
              Alert.alert('Delete Failed', 'Could not delete entry. Please try again.');
            }
          },
        },
      ]
    );
  };

  const canSave = title.trim().length > 0 && body.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);

    try {
      if (isEditing) {
        await update({
          id: id as Id<'journalEntries'>,
          title,
          body,
          mood,
          dreamId,
        });
      } else {
        await create({ title, body, mood, dreamId });
      }
      haptics.success();
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message === 'JOURNAL_LIMIT_REACHED') {
        haptics.warning();
        showUpgrade();
      } else {
        haptics.error();
        Alert.alert('Save Failed', 'Could not save your entry. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Show loading for edit mode while entry loads
  if (isEditing && existingEntry === undefined) {
    return <LoadingScreen />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: Spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.separator,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{ minHeight: TouchTarget.min, justifyContent: 'center' }}
        >
          <ThemedText style={{ fontSize: FontSize.xl }} color={colors.accentBlue}>
            Cancel
          </ThemedText>
        </Pressable>
        <ThemedText style={{ fontSize: FontSize.xl, fontWeight: '600' }}>
          {isEditing ? 'Edit Entry' : 'New Entry'}
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.lg }}>
          {isEditing && (
            <Pressable
              onPress={handleDelete}
              hitSlop={12}
              style={{ minHeight: TouchTarget.min, justifyContent: 'center' }}
            >
              <IconSymbol name="trash.fill" size={IconSize.xl} color={colors.destructive} />
            </Pressable>
          )}
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            hitSlop={12}
            style={{ minHeight: TouchTarget.min, justifyContent: 'center' }}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.accentBlue} />
            ) : (
              <ThemedText
                style={{ fontSize: FontSize.xl, fontWeight: '600' }}
                color={canSave ? colors.accentBlue : colors.mutedForeground}
              >
                Save
              </ThemedText>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: Spacing.lg,
          paddingBottom: insets.bottom + Spacing['3xl'],
        }}
        keyboardDismissMode="interactive"
      >
        {/* Title */}
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Entry title..."
          placeholderTextColor={colors.mutedForeground}
          style={{
            fontSize: FontSize['5xl'],
            fontWeight: '700',
            color: colors.foreground,
            marginBottom: Spacing.lg,
            paddingVertical: Spacing.sm,
          }}
          maxLength={200}
          returnKeyType="next"
        />

        {/* Journal Prompt - show only for new entries when body is empty */}
        {!isEditing && body.trim().length === 0 && dailyPrompt && (
          <View style={{ marginBottom: Spacing.lg }}>
            <JournalPromptCard
              prompt={dailyPrompt.prompt}
              onTap={(prompt) => setBody(prompt + '\n\n')}
            />
          </View>
        )}

        {/* Body */}
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Write your thoughts..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          textAlignVertical="top"
          style={{
            fontSize: FontSize.xl,
            color: colors.foreground,
            lineHeight: 26,
            minHeight: 200,
            marginBottom: Spacing.xl,
            paddingVertical: Spacing.sm,
          }}
          maxLength={5000}
        />

        {/* Mood */}
        <View style={{ marginBottom: Spacing.xl }}>
          <ThemedText
            style={{
              fontSize: FontSize.base,
              fontWeight: '600',
              textTransform: 'uppercase',
              marginBottom: Spacing.sm,
            }}
            color={colors.mutedForeground}
          >
            How are you feeling?
          </ThemedText>
          <MoodSelector selected={mood} onSelect={setMood} />
        </View>

        {/* Dream Link */}
        {dreams && dreams.length > 0 && (
          <View style={{ marginBottom: Spacing.xl }}>
            <ThemedText
              style={{
                fontSize: FontSize.base,
                fontWeight: '600',
                textTransform: 'uppercase',
                marginBottom: Spacing.sm,
              }}
              color={colors.mutedForeground}
            >
              Link to a dream
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: Spacing.sm }}
            >
              {dreams.map((dream) => {
                const isSelected = dreamId === dream._id;
                return (
                  <Pressable
                    key={dream._id}
                    onPress={() => setDreamId(isSelected ? undefined : dream._id)}
                    style={({ pressed }) => ({
                      paddingVertical: Spacing.sm,
                      paddingHorizontal: Spacing.lg,
                      borderRadius: Radius.full,
                      borderWidth: 1.5,
                      borderColor: isSelected ? colors.accentBlue : colors.border,
                      backgroundColor: isSelected ? `${colors.accentBlue}15` : colors.card,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <ThemedText
                      style={{
                        fontSize: FontSize.base,
                        fontWeight: isSelected ? '600' : '400',
                      }}
                      color={isSelected ? colors.foreground : colors.mutedForeground}
                      numberOfLines={1}
                    >
                      {dream.title}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
