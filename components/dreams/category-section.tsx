import { memo, useMemo } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { Link } from "expo-router";

import { CompactDreamRow, type DreamWithCounts } from "@/components/dreams/compact-dream-row";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { type ColorPalette } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Opacity, HypeCopy } from "@/constants/ui";
import { DREAM_CATEGORIES, CATEGORY_ICONS, CATEGORY_PROMPTS, type DreamCategory } from "@/constants/dreams";

// ── Category Section ─────────────────────────────────────────────────────────

const MAX_INLINE_DREAMS = 3;

export const CategorySection = memo(function CategorySection({
  category,
  dreams,
  colors,
}: {
  category: DreamCategory;
  dreams: DreamWithCounts[];
  colors: ColorPalette;
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
        <CompactDreamRow key={dream._id} dream={dream} colors={colors} />
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
              color={colors.primary}
            >
              See all {dreams.length} →
            </ThemedText>
          </Pressable>
        </Link>
      )}
    </View>
  );
});

// ── Empty Category Cards ────────────────────────────────────────────────────

const CARD_WIDTH = 120;
const ICON_BADGE = 40;

export function EmptyCategoryCards({
  emptyCategories,
  colors,
}: {
  emptyCategories: DreamCategory[];
  colors: ColorPalette;
}) {
  const quote = useMemo(
    () => HypeCopy.visionBoard[Math.floor(Math.random() * HypeCopy.visionBoard.length)],
    [],
  );

  if (emptyCategories.length === 0) return null;

  return (
    <View style={{ gap: Spacing.md }}>
      <ThemedText
        style={{
          fontSize: FontSize.sm,
          fontStyle: "italic",
          lineHeight: 18,
        }}
        color={colors.mutedForeground}
      >
        {quote}
      </ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: Spacing.sm, paddingRight: Spacing.md }}
      >
        {emptyCategories.map((category) => {
          const config = DREAM_CATEGORIES[category];
          return (
            <Link key={category} href="/(app)/create-dream/" asChild>
              <Pressable
                style={({ pressed }) => ({
                  opacity: pressed ? Opacity.pressed : 1,
                  width: CARD_WIDTH,
                })}
                accessibilityRole="button"
                accessibilityLabel={`Create ${config.label} dream`}
              >
                <View
                  style={{
                    backgroundColor: `${config.color}10`,
                    borderRadius: 16,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: `${config.color}20`,
                    paddingVertical: Spacing.md,
                    paddingHorizontal: Spacing.md,
                    alignItems: "center",
                    gap: Spacing.sm,
                  }}
                >
                  <View
                    style={{
                      width: ICON_BADGE,
                      height: ICON_BADGE,
                      borderRadius: ICON_BADGE / 2,
                      backgroundColor: `${config.color}20`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconSymbol
                      name={CATEGORY_ICONS[category]}
                      size={IconSize.xl}
                      color={config.color}
                    />
                  </View>

                  <ThemedText
                    style={{
                      fontSize: FontSize.sm,
                      fontWeight: "600",
                    }}
                    color={colors.foreground}
                  >
                    {config.label}
                  </ThemedText>

                  <ThemedText
                    style={{
                      fontSize: FontSize.xs,
                      textAlign: "center",
                      lineHeight: 14,
                    }}
                    color={colors.mutedForeground}
                    numberOfLines={1}
                  >
                    {CATEGORY_PROMPTS[category]}
                  </ThemedText>
                </View>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
    </View>
  );
}
