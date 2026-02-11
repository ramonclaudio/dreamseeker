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

import { type ColorPalette, Radius } from "@/constants/theme";
import { Spacing, TouchTarget, FontSize, MaxWidth, IconSize, TAB_BAR_CLEARANCE } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import { DREAM_CATEGORIES, DREAM_CATEGORY_LIST, CATEGORY_ICONS, type DreamCategory } from "@/constants/dreams";

type Dream = Doc<"dreams">;

const STRIP_WIDTH = 36;

function getStripColor(status: string, categoryColor: string, colors: ColorPalette) {
  if (status === "completed") return colors.success;
  if (status === "archived") return colors.mutedForeground;
  return categoryColor;
}

function getStripLabel(status: string) {
  if (status === "completed") return "Done";
  if (status === "archived") return "Paused";
  return "Active";
}

function VerticalLabel({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ThemedText
        style={{
          transform: [{ rotate: "-90deg" }],
          fontSize: FontSize.xs,
          fontWeight: "800",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
        numberOfLines={1}
        color={color}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const DreamCard = memo(function DreamCard({
  dream,
  colors,
  categoryColor,
}: {
  dream: Dream;
  colors: ColorPalette;
  categoryColor: string;
}) {
  const catIcon = CATEGORY_ICONS[dream.category as DreamCategory] ?? "star.fill";

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
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.card,
          borderRadius: Radius.lg,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.borderAccent,
          overflow: "hidden",
          shadowColor: colors.glowShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        {/* Content */}
        <View style={{ flex: 1, padding: Spacing.lg, gap: Spacing.sm }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: Spacing.sm,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                borderCurve: "continuous",
                backgroundColor: `${categoryColor}18`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol
                name={catIcon as never}
                size={IconSize.md}
                color={categoryColor}
              />
            </View>
            <ThemedText
              style={{
                fontSize: FontSize.xl,
                fontWeight: "700",
                flex: 1,
                letterSpacing: -0.3,
              }}
              color={colors.foreground}
              numberOfLines={2}
            >
              {dream.title}
            </ThemedText>
          </View>
          {dream.targetDate && (
            <ThemedText
              style={{ fontSize: FontSize.sm }}
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

        {/* Status strip */}
        <View
          style={{
            width: STRIP_WIDTH,
            backgroundColor: getStripColor(dream.status, categoryColor, colors),
          }}
        >
          <VerticalLabel label={getStripLabel(dream.status)} color="#fff" />
        </View>
      </View>
    </Pressable>
  );
});

export default function CategoryDreamsScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const colors = useColors();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { canCreateDream, showUpgrade } = useSubscription();
  const [newDreamTitle, setNewDreamTitle] = useState("");

  const isValidCategory = DREAM_CATEGORY_LIST.includes(category as DreamCategory);

  const categoryConfig = DREAM_CATEGORIES[category as DreamCategory] ?? DREAM_CATEGORIES.custom;
  const dreams = useQuery(
    api.dreams.list,
    isAuthenticated && isValidCategory ? { category: category as DreamCategory } : "skip"
  );

  const createDream = useMutation(api.dreams.create);

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

  // Redirect if someone navigates to an invalid category (e.g. "vision-board")
  if (!isValidCategory && !authLoading) {
    router.replace("/(app)/(tabs)/(dreams)/");
    return null;
  }

  const handleCreateDream = async () => {
    if (!newDreamTitle.trim()) return;
    if (!canCreateDream) {
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
    } catch {
      haptics.error();
    }
  };

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
          paddingBottom: TAB_BAR_CLEARANCE,
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
