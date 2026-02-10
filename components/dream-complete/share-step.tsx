import { View, StyleSheet, useWindowDimensions } from "react-native";
import ViewShot from "react-native-view-shot";
import type { RefObject } from "react";
import { DreamShareCard } from "@/components/share-cards/dream-share-card";
import { SHARE_CARD } from "@/constants/share-card";
import { Spacing } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import type { DreamCategory } from "@/constants/dreams";

type ShareAction = {
  text: string;
  isCompleted: boolean;
};

export function ShareStep({
  viewShotRef,
  dreamTitle,
  category,
  actions,
  createdAt,
  completedAt,
  handle,
}: {
  viewShotRef: RefObject<ViewShot | null>;
  dreamTitle: string;
  category: DreamCategory;
  actions: ShareAction[];
  createdAt: number;
  completedAt: number;
  handle?: string;
}) {
  const completedActions = actions.filter((a) => a.isCompleted).length;
  const { width } = useWindowDimensions();
  const cardScale = Math.min(1, (width - Spacing["2xl"] * 2) / SHARE_CARD.WIDTH);

  const cardProps = {
    title: dreamTitle,
    category,
    status: "completed" as const,
    completedActions,
    totalActions: actions.length,
    actions,
    createdAt,
    completedAt,
    handle,
  };

  return (
    <View style={styles.container}>
      {/* Scaled preview with rounded corners */}
      <View
        style={[
          styles.previewClip,
          {
            width: SHARE_CARD.WIDTH * cardScale,
            height: SHARE_CARD.HEIGHT * cardScale,
          },
        ]}
      >
        <View
          style={{
            width: SHARE_CARD.WIDTH,
            height: SHARE_CARD.HEIGHT,
            transform: [{ scale: cardScale }],
            transformOrigin: "top left",
          }}
        >
          <DreamShareCard {...cardProps} />
        </View>
      </View>

      {/* Offscreen capture target (same pattern as badge/level/streak modals) */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1 }}
        style={styles.offscreen}
      >
        <DreamShareCard {...cardProps} />
      </ViewShot>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewClip: {
    borderRadius: Radius["2xl"],
    borderCurve: "continuous",
    overflow: "hidden",
  },
  offscreen: {
    position: "absolute",
    left: -9999,
  },
});
