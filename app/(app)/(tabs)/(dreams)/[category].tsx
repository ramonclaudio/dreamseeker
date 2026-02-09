import { memo, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  TextInput,
  type ListRenderItem,
} from "react-native";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useLocalSearchParams, router, Stack } from "expo-router";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { MaterialCard } from "@/components/ui/material-card";
import { GlassControl } from "@/components/ui/glass-control";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { useSubscription } from "@/hooks/use-subscription";
import type { ColorPalette } from "@/constants/theme";
import { Spacing, TouchTarget, FontSize, MaxWidth, IconSize, TAB_BAR_HEIGHT } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import { DREAM_CATEGORIES, type DreamCategory } from "@/constants/dreams";

type Dream = Doc<"dreams">;

const DreamCard = memo(function DreamCard({
  dream,
  colors,
  categoryColor,
}: {
  dream: Dream;
  colors: ColorPalette;
  categoryColor: string;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        router.push(`/(app)/dream/${dream._id}`);
      }}
      style={({ pressed }) => ({
        opacity: pressed ? Opacity.pressed : 1,
        marginBottom: Spacing.sm,
      })}
      accessibilityRole="button"
      accessibilityLabel={`Dream: ${dream.title}`}
    >
      <MaterialCard
        style={{
          padding: Spacing.lg,
          borderLeftWidth: 4,
          borderLeftColor: categoryColor,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, marginRight: Spacing.md }}>
            <ThemedText
              style={{ fontSize: FontSize.xl, fontWeight: "600" }}
              numberOfLines={2}
            >
              {dream.title}
            </ThemedText>
            {dream.targetDate && (
              <ThemedText
                style={{ fontSize: FontSize.sm, marginTop: Spacing.xs }}
                color={colors.mutedForeground}
              >
                Target:{" "}
                {new Date(dream.targetDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </ThemedText>
            )}
          </View>
          <IconSymbol
            name="chevron.right"
            size={IconSize.lg}
            color={colors.mutedForeground}
          />
        </View>
      </MaterialCard>
    </Pressable>
  );
});

export default function CategoryDreamsScreen() {
  const { category } = useLocalSearchParams<{ category: DreamCategory }>();
  const colors = useColors();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [newDreamTitle, setNewDreamTitle] = useState("");

  const categoryConfig = DREAM_CATEGORIES[category as DreamCategory] ?? DREAM_CATEGORIES.custom;
  const dreams = useQuery(
    api.dreams.list,
    isAuthenticated ? { category: category as DreamCategory } : "skip"
  );

  const createDream = useMutation(api.dreams.create);
  const { canCreateDream, showUpgrade } = useSubscription();

  const handleCreateDream = async () => {
    if (!newDreamTitle.trim()) return;

    if (!canCreateDream) {
      haptics.warning();
      showUpgrade();
      return;
    }

    haptics.medium();
    try {
      const dreamId = await createDream({
        title: newDreamTitle.trim(),
        category: category as DreamCategory,
      });
      setNewDreamTitle("");
      router.push(`/(app)/dream/${dreamId}`);
    } catch (e) {
      if (e instanceof Error && e.message === "LIMIT_REACHED") {
        haptics.warning();
        showUpgrade();
      } else {
        haptics.error();
      }
    }
  };

  const renderItem: ListRenderItem<Dream> = useCallback(
    ({ item }) => (
      <DreamCard
        dream={item}
        colors={colors}
        categoryColor={categoryConfig?.color ?? colors.primary}
      />
    ),
    [colors, categoryConfig]
  );

  const keyExtractor = useCallback((item: Dream) => item._id, []);

  if (authLoading || dreams === undefined) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const ListHeader = (
    <View style={{ paddingBottom: Spacing.lg }}>
      <ThemedText
        style={{ fontSize: FontSize.base, marginBottom: Spacing.md }}
        color={colors.mutedForeground}
      >
        {dreams.length} {dreams.length === 1 ? "dream" : "dreams"}
      </ThemedText>

      {/* Quick Add */}
      <View style={{ flexDirection: "row", gap: Spacing.sm }}>
        <MaterialCard style={{ flex: 1 }}>
          <TextInput
            style={{
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.md + 2,
              fontSize: FontSize.xl,
              color: colors.foreground,
            }}
            placeholder={`Add a ${categoryConfig?.label.toLowerCase()} dream...`}
            placeholderTextColor={colors.mutedForeground}
            value={newDreamTitle}
            onChangeText={setNewDreamTitle}
            onSubmitEditing={handleCreateDream}
            returnKeyType="done"
          />
        </MaterialCard>
        <GlassControl
          isInteractive
          style={{ justifyContent: "center", paddingHorizontal: Spacing.xl }}
        >
          <Pressable
            onPress={handleCreateDream}
            disabled={!newDreamTitle.trim()}
            style={{
              minHeight: TouchTarget.min,
              justifyContent: "center",
              opacity: !newDreamTitle.trim() ? Opacity.disabled : 1,
            }}
          >
            <ThemedText style={{ fontWeight: "600", fontSize: FontSize.base }}>
              Add
            </ThemedText>
          </Pressable>
        </GlassControl>
      </View>
    </View>
  );

  const ListEmpty = (
    <View style={{ paddingVertical: Spacing["4xl"], alignItems: "center" }}>
      <ThemedText
        style={{ fontSize: FontSize.xl, textAlign: "center" }}
        color={colors.mutedForeground}
      >
        No {categoryConfig?.label.toLowerCase()} dreams yet, girl.{"\n"}Time to add one!
      </ThemedText>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: categoryConfig?.label ?? "Dreams",
          headerTintColor: categoryConfig?.color,
        }}
      />
      <FlatList
        data={dreams}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT,
          paddingHorizontal: Spacing.xl,
          maxWidth: MaxWidth.content,
          alignSelf: "center",
          width: "100%",
        }}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        keyboardShouldPersistTaps="handled"
      />
    </>
  );
}
