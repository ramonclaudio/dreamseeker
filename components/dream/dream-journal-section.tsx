import { View, Pressable } from "react-native";
import { router } from "expo-router";

import type { Doc, Id } from "@/convex/_generated/dataModel";
import { MaterialCard } from "@/components/ui/material-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";
import { useSubscription } from "@/hooks/use-subscription";
import { Radius, type ColorPalette } from "@/constants/theme";
import { Spacing, TouchTarget, FontSize, IconSize, HitSlop } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { FREE_MAX_JOURNALS_PER_DREAM } from "@/convex/constants";

type JournalEntry = Doc<"journalEntries">;

export function DreamJournalSection({
  dreamId,
  entries,
  categoryColor,
  colors,
}: {
  dreamId: Id<"dreams">;
  entries: JournalEntry[] | undefined;
  categoryColor: string;
  colors: ColorPalette;
}) {
  const { isPremium, showUpgrade } = useSubscription();
  const entryCount = entries?.length ?? 0;
  const atJournalLimit = !isPremium && entryCount >= FREE_MAX_JOURNALS_PER_DREAM;

  const handleAddJournal = () => {
    if (atJournalLimit) {
      showUpgrade();
      return;
    }
    router.push({
      pathname: "/(app)/journal-entry" as const,
      params: { dreamId },
    } as never);
  };

  return (
    <View style={{ marginTop: Spacing.xl }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: Spacing.sm,
          marginLeft: Spacing.xs,
        }}
      >
        <ThemedText
          style={{
            fontSize: FontSize.base,
            fontWeight: "600",
            textTransform: "uppercase",
          }}
          color={colors.mutedForeground}
        >
          Journal
        </ThemedText>
        <Pressable
          onPress={handleAddJournal}
          hitSlop={HitSlop.md}
          style={{
            minWidth: TouchTarget.min,
            minHeight: TouchTarget.min,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconSymbol name="plus.circle.fill" size={IconSize.xl} color={categoryColor} />
        </Pressable>
      </View>

      {entries && entries.length > 0 ? (
        entries.map((entry) => (
          <Pressable
            key={entry._id}
            onPress={() =>
              router.push({
                pathname: "/(app)/journal-entry" as const,
                params: { id: entry._id },
              } as never)
            }
            style={({ pressed }) => ({
              opacity: pressed ? Opacity.pressed : 1,
              marginBottom: Spacing.sm,
            })}
          >
            <MaterialCard
              style={{
                padding: Spacing.lg,
                borderLeftWidth: 3,
                borderLeftColor: categoryColor,
              }}
            >
              <ThemedText
                style={{ fontSize: FontSize.lg, fontWeight: "600" }}
                numberOfLines={1}
              >
                {entry.title}
              </ThemedText>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Spacing.sm,
                  marginTop: Spacing.xxs,
                }}
              >
                <ThemedText
                  style={{ fontSize: FontSize.sm }}
                  color={colors.mutedForeground}
                >
                  {new Date(entry.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </ThemedText>
                {entry.mood && (
                  <View
                    style={{
                      paddingHorizontal: Spacing.sm,
                      paddingVertical: Spacing.xxs,
                      borderRadius: Radius.full,
                      backgroundColor: `${categoryColor}15`,
                    }}
                  >
                    <ThemedText
                      style={{ fontSize: FontSize.xs, fontWeight: "500" }}
                      color={categoryColor}
                    >
                      {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText
                style={{ fontSize: FontSize.base, marginTop: Spacing.xs, lineHeight: 20 }}
                color={colors.mutedForeground}
                numberOfLines={2}
              >
                {entry.body}
              </ThemedText>
            </MaterialCard>
          </Pressable>
        ))
      ) : (
        <Pressable
          onPress={handleAddJournal}
          style={({ pressed }) => ({
            opacity: pressed ? Opacity.pressed : 1,
          })}
        >
          <MaterialCard style={{ padding: Spacing.xl, alignItems: "center" }}>
            <IconSymbol
              name="book.fill"
              size={IconSize["3xl"]}
              color={`${categoryColor}60`}
              style={{ marginBottom: Spacing.md }}
            />
            <ThemedText
              style={{ fontSize: FontSize.base, textAlign: "center" }}
              color={colors.mutedForeground}
            >
              Write about your journey toward this dream
            </ThemedText>
          </MaterialCard>
        </Pressable>
      )}

      <View style={{ marginTop: Spacing.md }}>
        <UpgradeBanner used={entryCount} limit={FREE_MAX_JOURNALS_PER_DREAM} noun="Journals" />
      </View>
    </View>
  );
}
