import { memo } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { Link } from "expo-router";

import { CompactDreamRow, type DreamWithCounts } from "@/components/dreams/compact-dream-row";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MaterialCard } from "@/components/ui/material-card";
import { ThemedText } from "@/components/ui/themed-text";
import { type ColorPalette } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { DREAM_CATEGORIES, CATEGORY_ICONS, type DreamCategory } from "@/constants/dreams";

// ── Category Section ─────────────────────────────────────────────────────────

const MAX_INLINE_DREAMS = 3;

export const CategorySection = memo(function CategorySection({
  category,
  dreams,
  colors,
  hiddenDreamIds,
}: {
  category: DreamCategory;
  dreams: DreamWithCounts[];
  colors: ColorPalette;
  hiddenDreamIds?: Set<string>;
}) {
  const config = DREAM_CATEGORIES[category];
  const shown = dreams.slice(0, MAX_INLINE_DREAMS);
  const hasMore = dreams.length > MAX_INLINE_DREAMS;

  return (
    <View style={{ gap: Spacing.sm }}>
      {/* Section label */}
      <Link href={`/(app)/(tabs)/(dreams)/${category}`} asChild>
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? Opacity.pressed : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel={`${config.label}, ${dreams.length} dreams`}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: Spacing.sm,
              paddingVertical: Spacing.xs,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                borderCurve: "continuous",
                backgroundColor: `${config.color}18`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol
                name={CATEGORY_ICONS[category]}
                size={IconSize.md}
                color={config.color}
              />
            </View>
            <ThemedText
              style={{
                fontSize: FontSize.base,
                fontWeight: "600",
                textTransform: "uppercase",
                flex: 1,
                letterSpacing: 0.5,
              }}
              color={colors.mutedForeground}
            >
              {config.label}
            </ThemedText>
            <ThemedText
              style={{ fontSize: FontSize.sm }}
              color={colors.mutedForeground}
            >
              {dreams.length}
            </ThemedText>
            <IconSymbol
              name="chevron.right"
              size={IconSize.sm}
              color={colors.mutedForeground}
            />
          </View>
        </Pressable>
      </Link>

      {/* Inline dream cards */}
      {shown.map((dream) => (
        <CompactDreamRow key={dream._id} dream={dream} colors={colors} isHidden={hiddenDreamIds?.has(dream._id)} />
      ))}

      {/* See all link */}
      {hasMore && (
        <Link href={`/(app)/(tabs)/(dreams)/${category}`} asChild>
          <Pressable
            style={({ pressed }) => ({
              opacity: pressed ? Opacity.pressed : 1,
              alignSelf: "flex-end",
              paddingVertical: Spacing.xs,
            })}
          >
            <ThemedText
              style={{ fontSize: FontSize.sm, fontWeight: "600" }}
              color={colors.accentBlue}
            >
              See all {dreams.length} →
            </ThemedText>
          </Pressable>
        </Link>
      )}
    </View>
  );
});

// ── Empty Category Cards ─────────────────────────────────────────────────────

export function EmptyCategoryCards({
  emptyCategories,
  colors,
}: {
  emptyCategories: DreamCategory[];
  colors: ColorPalette;
}) {
  if (emptyCategories.length === 0) return null;

  return (
    <View style={{ gap: Spacing.sm }}>
      <ThemedText
        style={{
          fontSize: FontSize.base,
          fontWeight: "600",
          textTransform: "uppercase",
          marginLeft: Spacing.xs,
          letterSpacing: 0.5,
        }}
        color={colors.mutedForeground}
      >
        Explore More
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: Spacing.md }}
      >
        {emptyCategories.map((category) => {
          const config = DREAM_CATEGORIES[category];
          return (
            <Link key={category} href="/(app)/create-dream/" asChild>
              <Pressable
                style={({ pressed }) => ({
                  opacity: pressed ? Opacity.pressed : 1,
                })}
              >
                <MaterialCard
                  style={{
                    width: 130,
                    borderLeftWidth: 4,
                    borderLeftColor: config.color,
                    padding: Spacing.lg,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: `${config.color}18`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: Spacing.md,
                    }}
                  >
                    <IconSymbol
                      name={CATEGORY_ICONS[category]}
                      size={IconSize.xl}
                      color={config.color}
                    />
                  </View>
                  <ThemedText
                    style={{ fontSize: FontSize.lg, fontWeight: "600" }}
                    color={colors.foreground}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {config.label}
                  </ThemedText>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                      marginTop: Spacing.xs,
                    }}
                  >
                    <IconSymbol
                      name="plus.circle.fill"
                      size={IconSize.sm}
                      color={colors.accentBlue}
                    />
                    <ThemedText
                      style={{ fontSize: FontSize.sm, fontWeight: "500" }}
                      color={colors.accentBlue}
                    >
                      Add dream
                    </ThemedText>
                  </View>
                </MaterialCard>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
    </View>
  );
}
