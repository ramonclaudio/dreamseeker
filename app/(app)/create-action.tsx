import { useState } from 'react';
import { View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { GradientButton } from '@/components/ui/gradient-button';
import { useColors } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';
import { shootConfetti } from '@/lib/confetti';
import { DREAM_CATEGORIES } from '@/convex/constants';
import { Spacing, FontSize, IconSize, TouchTarget, HitSlop } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { Id } from '@/convex/_generated/dataModel';

export default function CreateActionScreen() {
  const colors = useColors();
  const dreams = useQuery(api.dreams.list, {});
  const createAction = useMutation(api.actions.create);
  const [selectedDreamId, setSelectedDreamId] = useState<Id<'dreams'> | null>(null);
  const [actionText, setActionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeDreams = dreams ?? [];
  const canSubmit = selectedDreamId && actionText.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await createAction({ dreamId: selectedDreamId, text: actionText.trim() });
      haptics.success();
      shootConfetti('small');
      router.back();
    } catch {
      haptics.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.separator }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={HitSlop.sm}
            style={{
              minHeight: TouchTarget.min,
              minWidth: TouchTarget.min,
              justifyContent: "center" as const,
            }}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <ThemedText color={colors.mutedForeground}>Cancel</ThemedText>
          </Pressable>
          <ThemedText variant="subtitle" accessibilityRole="header">
            New Action
          </ThemedText>
          <View style={{ minWidth: TouchTarget.min }} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Dream picker */}
          <View style={styles.section}>
            <ThemedText style={styles.label} color={colors.foreground}>
              Link to a dream
            </ThemedText>
            <ThemedText style={styles.hint} color={colors.mutedForeground}>
              Every action needs a dream. Pick one.
            </ThemedText>

            {activeDreams.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surfaceTinted, borderColor: colors.border }]}>
                <IconSymbol name="sparkles" size={IconSize['2xl']} color={colors.mutedForeground} />
                <ThemedText style={styles.emptyText} color={colors.mutedForeground}>
                  No active dreams yet. Create a dream first!
                </ThemedText>
                <Pressable
                  onPress={() => {
                    router.back();
                    router.push('/(app)/create-dream');
                  }}
                >
                  <ThemedText style={styles.link} color={colors.primary}>
                    Create a Dream
                  </ThemedText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.pillGrid}>
                {activeDreams.map((dream) => {
                  const isSelected = selectedDreamId === dream._id;
                  const category = DREAM_CATEGORIES[dream.category as keyof typeof DREAM_CATEGORIES];
                  const pillColor = category?.color ?? colors.primary;

                  return (
                    <Pressable
                      key={dream._id}
                      onPress={() => {
                        haptics.light();
                        setSelectedDreamId(dream._id);
                      }}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: isSelected ? pillColor : colors.surfaceTinted,
                          borderColor: isSelected ? pillColor : colors.border,
                        },
                      ]}
                    >
                      <ThemedText
                        style={styles.pillText}
                        color={isSelected ? '#fff' : colors.foreground}
                        numberOfLines={1}
                      >
                        {dream.title}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Action text input */}
          <View style={styles.section}>
            <ThemedText style={styles.label} color={colors.foreground}>
              What&apos;s the action?
            </ThemedText>
            <ThemedText style={styles.hint} color={colors.mutedForeground}>
              Keep it small — something you can knock out in 15 min or less.
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceTinted,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={actionText}
              onChangeText={setActionText}
              placeholder="e.g. Research flights to Tokyo"
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={200}
              autoFocus={false}
            />
          </View>
        </ScrollView>

        {/* Submit button */}
        <View style={styles.footer}>
          <GradientButton
            label={isSubmitting ? 'Adding...' : 'Add Action'}
            onPress={handleSubmit}
            disabled={!canSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 0.5,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  hint: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    maxWidth: '100%',
  },
  pillText: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  link: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  input: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    fontSize: FontSize.base,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
});
