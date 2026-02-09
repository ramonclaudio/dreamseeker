import { View, StyleSheet } from "react-native";
import ViewShot from "react-native-view-shot";
import type { RefObject } from "react";
import { ThemedText } from "@/components/ui/themed-text";
import { WinCard } from "@/components/engagement/win-card";
import { Spacing, FontSize } from "@/constants/layout";
import type { DreamCategory } from "@/constants/dreams";
import type { ColorPalette } from "@/constants/theme";

export function ShareStep({
  viewShotRef,
  dreamTitle,
  category,
  completedActions,
  totalActions,
  completedAt,
  handle,
  colors,
}: {
  viewShotRef: RefObject<ViewShot | null>;
  dreamTitle: string;
  category: DreamCategory;
  completedActions: number;
  totalActions: number;
  completedAt: number;
  handle?: string;
  colors: ColorPalette;
}) {
  return (
    <View style={styles.container}>
      <ThemedText variant="title" style={styles.title}>
        Share your win
      </ThemedText>
      <ThemedText
        style={styles.subtitle}
        color={colors.mutedForeground}
      >
        Let the world know what you achieved!
      </ThemedText>
      <View style={styles.cardWrapper}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 1 }}
        >
          <WinCard
            dreamTitle={dreamTitle}
            category={category}
            completedActions={completedActions}
            totalActions={totalActions}
            completedAt={completedAt}
            handle={handle}
          />
        </ViewShot>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    fontSize: FontSize.base,
    marginBottom: Spacing.xl,
  },
  cardWrapper: {
    alignItems: "center",
  },
});
