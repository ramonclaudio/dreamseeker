import { useCallback, useRef, type ReactNode } from "react";
import { View, Pressable } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";

import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Radius } from "@/constants/theme";
import { FontSize } from "@/constants/layout";
import { haptics } from "@/lib/haptics";

const ACTION_WIDTH = 76;

// --- Animated swipe action buttons ---

function SwipeButton({
  progress,
  icon,
  label,
  backgroundColor,
  onPress,
  borderRadiusSide,
}: {
  progress: SharedValue<number>;
  icon: IconSymbolName;
  label: string;
  backgroundColor: string;
  onPress: () => void;
  borderRadiusSide?: "left" | "right";
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [0.6, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      progress.value,
      [0, 0.3, 1],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
  }));

  const borderRadius =
    borderRadiusSide === "left"
      ? { borderTopLeftRadius: Radius.lg, borderBottomLeftRadius: Radius.lg }
      : borderRadiusSide === "right"
        ? {
            borderTopRightRadius: Radius.lg,
            borderBottomRightRadius: Radius.lg,
          }
        : {};

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: ACTION_WIDTH,
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        ...borderRadius,
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View style={[{ alignItems: "center" }, animStyle]}>
        <IconSymbol name={icon} size={20} color="#fff" weight="semibold" />
        <ThemedText
          style={{
            color: "#fff",
            fontSize: FontSize.xs,
            fontWeight: "600",
            marginTop: 2,
          }}
        >
          {label}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

// --- Left action (swipe right → complete) ---

function LeftActions({
  progress,
  color,
  onComplete,
}: {
  progress: SharedValue<number>;
  color: string;
  onComplete: () => void;
}) {
  return (
    <SwipeButton
      progress={progress}
      icon="checkmark"
      label="Done"
      backgroundColor={color}
      onPress={onComplete}
      borderRadiusSide="left"
    />
  );
}

// --- Right actions (swipe left → edit + delete) ---

function RightActions({
  progress,
  onEdit,
  onDelete,
  editColor,
  deleteColor,
  deleteLabel,
  deleteIcon,
}: {
  progress: SharedValue<number>;
  onEdit?: () => void;
  onDelete?: () => void;
  editColor: string;
  deleteColor: string;
  deleteLabel: string;
  deleteIcon: IconSymbolName;
}) {
  return (
    <View style={{ flexDirection: "row" }}>
      {onEdit && (
        <SwipeButton
          progress={progress}
          icon="pencil"
          label="Edit"
          backgroundColor={editColor}
          onPress={onEdit}
        />
      )}
      {onDelete && (
        <SwipeButton
          progress={progress}
          icon={deleteIcon}
          label={deleteLabel}
          backgroundColor={deleteColor}
          onPress={onDelete}
          borderRadiusSide="right"
        />
      )}
    </View>
  );
}

// --- Main SwipeableRow ---

type Props = {
  children: ReactNode;
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  completeColor?: string;
  editColor?: string;
  deleteColor?: string;
  deleteLabel?: string;
  deleteIcon?: IconSymbolName;
  enabled?: boolean;
};

export function SwipeableRow({
  children,
  onComplete,
  onEdit,
  onDelete,
  completeColor = "#5A9A52",
  editColor = "#8A7B6D",
  deleteColor = "#c4453a",
  deleteLabel = "Delete",
  deleteIcon = "trash.fill",
  enabled = true,
}: Props) {
  const swipeableRef = useRef<SwipeableMethods>(null);

  const close = useCallback(() => {
    swipeableRef.current?.close();
  }, []);

  const renderLeft = useCallback(
    (progress: SharedValue<number>) => (
      <LeftActions
        progress={progress}
        color={completeColor}
        onComplete={() => {
          haptics.success();
          close();
          onComplete?.();
        }}
      />
    ),
    [onComplete, completeColor, close]
  );

  const renderRight = useCallback(
    (progress: SharedValue<number>) => (
      <RightActions
        progress={progress}
        editColor={editColor}
        deleteColor={deleteColor}
        deleteLabel={deleteLabel}
        deleteIcon={deleteIcon}
        onEdit={
          onEdit
            ? () => {
                haptics.selection();
                close();
                onEdit();
              }
            : undefined
        }
        onDelete={
          onDelete
            ? () => {
                haptics.light();
                close();
                onDelete();
              }
            : undefined
        }
      />
    ),
    [onEdit, onDelete, editColor, deleteColor, deleteLabel, deleteIcon, close]
  );

  if (!enabled) return <>{children}</>;

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderLeftActions={onComplete ? renderLeft : undefined}
      renderRightActions={onEdit || onDelete ? renderRight : undefined}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      leftThreshold={ACTION_WIDTH}
      rightThreshold={ACTION_WIDTH}
    >
      {children}
    </ReanimatedSwipeable>
  );
}
