import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";

import { getCategoryConfig } from "@/constants/dreams";
import { GradientProgressBar } from "@/components/ui/gradient-progress-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { DreamHeader } from "@/components/dream/dream-header";
import { DreamActionsSection } from "@/components/dream/dream-actions-section";
import { DreamJournalSection } from "@/components/dream/dream-journal-section";
import {
  ActiveDreamActions,
  CompletedDreamActions,
  ArchivedDreamActions,
} from "@/components/dream/dream-status-actions";
import { EditActionModal } from "@/components/dream/edit-action-modal";
import { EditDreamModal } from "@/components/dream/edit-dream-modal";
import { useColors } from "@/hooks/use-color-scheme";
import { useDreamDetail } from "@/hooks/use-dream-detail";
import { Spacing, FontSize, IconSize, HitSlop, MaxWidth } from "@/constants/layout";
import { haptics } from "@/lib/haptics";

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const detail = useDreamDetail(id);

  const { dream, authLoading } = detail;

  if (authLoading || dream === undefined) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (dream === null) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background, padding: Spacing.xl }}
      >
        <ThemedText style={{ fontSize: FontSize.xl, textAlign: "center" }} color={colors.mutedForeground}>
          Dream not found
        </ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: Spacing.xl }}>
          <ThemedText style={{ fontWeight: "600" }} color={colors.primary}>Go Back</ThemedText>
        </Pressable>
      </View>
    );
  }

  const categoryConfig = getCategoryConfig(dream);
  const categoryColor = categoryConfig.color ?? colors.primary;
  const completedActions = dream.actions?.filter((a) => a.isCompleted).length ?? 0;
  const totalActions = dream.actions?.length ?? 0;
  const actionProgress = totalActions > 0 ? completedActions / totalActions : 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: categoryConfig.label ?? "Dream",
          headerTintColor: categoryColor,
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xl }}>
              <Pressable
                onPress={() => { haptics.selection(); detail.setShowEditDream(true); }}
                hitSlop={HitSlop.md}
                accessibilityRole="button"
                accessibilityLabel="Edit dream"
                accessibilityHint="Opens edit modal"
                style={{ padding: Spacing.xs }}
              >
                <IconSymbol name="pencil" size={IconSize.xl} color={colors.primary} />
              </Pressable>
              <Pressable
                onPress={detail.handleArchiveDream}
                hitSlop={HitSlop.md}
                accessibilityRole="button"
                accessibilityLabel="Archive dream"
                accessibilityHint="Moves dream to archived"
                style={{ padding: Spacing.xs }}
              >
                <IconSymbol name="trash.fill" size={IconSize.xl} color={colors.destructive} />
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingBottom: Spacing["4xl"],
          paddingHorizontal: Spacing.xl,
          maxWidth: MaxWidth.content,
          alignSelf: "center",
          width: "100%",
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <DreamHeader dream={dream} categoryColor={categoryColor} colors={colors} />

        {totalActions > 0 && (
          <View style={{ marginBottom: Spacing.xl }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.sm }}>
              <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
                Progress
              </ThemedText>
              <ThemedText style={{ fontSize: FontSize.sm, fontWeight: "600" }} color={categoryColor}>
                {completedActions}/{totalActions} actions
              </ThemedText>
            </View>
            <View
              accessible={true}
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: totalActions,
                now: completedActions,
                text: `${completedActions} of ${totalActions} actions completed`,
              }}
            >
              <GradientProgressBar progress={actionProgress} height={10} color={categoryColor} />
            </View>
          </View>
        )}

        <DreamActionsSection
          dream={dream}
          newActionText={detail.newActionText}
          onChangeText={detail.setNewActionText}
          onAddAction={detail.handleAddAction}
          onToggle={detail.handleToggleAction}
          onEdit={detail.handleEditAction}
          onDelete={detail.handleDeleteAction}
          categoryColor={categoryColor}
          colors={colors}
        />

        <DreamJournalSection
          dreamId={detail.dreamId}
          entries={detail.journalEntries}
          categoryColor={categoryColor}
          colors={colors}
        />

        {dream.status === "active" && (
          <ActiveDreamActions
            dream={dream}
            isCompleting={detail.isCompleting}
            onComplete={detail.handleCompleteDream}
            colors={colors}
          />
        )}

        {dream.status === "completed" && (
          <CompletedDreamActions
            dream={dream}
            isCompleting={detail.isCompleting}
            onReopen={detail.handleReopenDream}
            colors={colors}
          />
        )}

        {dream.status === "archived" && (
          <ArchivedDreamActions
            isCompleting={detail.isCompleting}
            onRestore={detail.handleRestoreDream}
            onDelete={detail.handleDeleteDream}
            colors={colors}
          />
        )}
      </ScrollView>

      <EditDreamModal
        visible={detail.showEditDream}
        dream={dream}
        onClose={() => detail.setShowEditDream(false)}
        onSave={detail.handleSaveDream}
        colors={colors}
      />

      <EditActionModal
        visible={detail.editingAction !== null}
        action={detail.editingAction}
        onClose={() => detail.setEditingAction(null)}
        onSave={detail.handleSaveAction}
        colors={colors}
      />
    </>
  );
}
