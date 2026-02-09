import { useEffect, useRef } from "react";
import { View, Animated, type ViewStyle, type StyleProp, type DimensionValue } from "react-native";
import { useColors } from "@/hooks/use-color-scheme";
import { Spacing, FontSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";

// ── Base Skeleton Loader ─────────────────────────────────────────────────────

type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = Radius.sm,
  style,
}: SkeletonProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const baseStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: colors.muted,
  };

  return (
    <Animated.View
      style={[
        baseStyle,
        { opacity },
        style,
      ]}
    />
  );
}

// ── Preset: Dream Card ───────────────────────────────────────────────────────

export function SkeletonDreamCard() {
  const colors = useColors();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
        marginBottom: Spacing.sm,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        {/* Accent bar */}
        <View
          style={{
            width: 4,
            backgroundColor: colors.muted,
            opacity: 0.5,
          }}
        />
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: Spacing.md,
            paddingLeft: Spacing.md,
            paddingRight: Spacing.md,
            gap: Spacing.md,
          }}
        >
          <View style={{ flex: 1, gap: Spacing.xs }}>
            {/* Title */}
            <Skeleton width="70%" height={FontSize.xl} />
            {/* Subtitle */}
            <Skeleton width="50%" height={FontSize.sm} />
          </View>
          {/* Progress circle */}
          <Skeleton width={34} height={34} borderRadius={17} />
        </View>
      </View>
    </View>
  );
}

// ── Preset: Journal Entry ────────────────────────────────────────────────────

export function SkeletonJournalEntry() {
  const colors = useColors();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: Spacing.lg,
        marginBottom: Spacing.sm,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          {/* Title */}
          <Skeleton
            width="80%"
            height={FontSize.xl}
            style={{ marginBottom: Spacing.xs }}
          />
          {/* Date + Mood */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: Spacing.sm,
              marginBottom: Spacing.sm,
            }}
          >
            <Skeleton width={80} height={FontSize.sm} />
            <Skeleton width={60} height={20} borderRadius={Radius.sm} />
          </View>
        </View>
        {/* Delete icon */}
        <Skeleton width={20} height={20} borderRadius={Radius.sm} />
      </View>
      {/* Body preview */}
      <Skeleton width="100%" height={FontSize.base} />
      <Skeleton
        width="60%"
        height={FontSize.base}
        style={{ marginTop: Spacing.xs }}
      />
    </View>
  );
}

// ── Preset: Generic List Item ────────────────────────────────────────────────

export function SkeletonListItem() {
  const colors = useColors();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: Spacing.lg,
        marginBottom: Spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
      }}
    >
      {/* Icon circle */}
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={{ flex: 1, gap: Spacing.xs }}>
        {/* Primary text */}
        <Skeleton width="70%" height={FontSize.base} />
        {/* Secondary text */}
        <Skeleton width="50%" height={FontSize.sm} />
      </View>
    </View>
  );
}

// ── Preset: Stats Card ───────────────────────────────────────────────────────

export function SkeletonStatsCard() {
  const colors = useColors();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          gap: Spacing.lg,
        }}
      >
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ alignItems: "center", flex: 1 }}>
            <Skeleton width={50} height={FontSize["5xl"]} style={{ marginBottom: Spacing.xs }} />
            <Skeleton width="80%" height={FontSize.sm} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Preset: Action Item ──────────────────────────────────────────────────────

export function SkeletonActionItem() {
  const colors = useColors();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
      }}
    >
      {/* Checkbox */}
      <Skeleton width={24} height={24} borderRadius={6} />
      <View style={{ flex: 1, gap: Spacing.xs }}>
        {/* Action text */}
        <Skeleton width="85%" height={FontSize.base} />
        {/* Dream title */}
        <Skeleton width="50%" height={FontSize.sm} />
      </View>
    </View>
  );
}
