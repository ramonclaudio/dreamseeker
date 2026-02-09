import { useEffect } from "react";
import { View, Modal, StyleSheet } from "react-native";

import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { GradientButton } from "@/components/ui/gradient-button";
import { useColors } from "@/hooks/use-color-scheme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";

type BadgeEarnedModalProps = {
  visible: boolean;
  badge: {
    key: string;
    title: string;
    description?: string;
    icon?: string;
  } | null;
  onDismiss: () => void;
};

export function BadgeEarnedModal({ visible, badge, onDismiss }: BadgeEarnedModalProps) {
  const colors = useColors();

  useEffect(() => {
    if (visible && badge) {
      haptics.success();
      setTimeout(() => shootConfetti(), 200);
    }
  }, [visible, badge]);

  if (!badge) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent
      onRequestClose={onDismiss}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* Badge icon with glow */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${colors.primary}20` },
            ]}
          >
            <IconSymbol
              name={(badge.icon as IconSymbolName) ?? "star.fill"}
              size={IconSize["5xl"]}
              color={colors.primary}
            />
          </View>

          {/* Title */}
          <ThemedText variant="title" style={styles.title}>
            {badge.title}
          </ThemedText>

          {/* Description */}
          {badge.description && (
            <ThemedText
              style={styles.description}
              color={colors.mutedForeground}
            >
              {badge.description}
            </ThemedText>
          )}

          {/* XP chip */}
          <View
            style={[
              styles.xpChip,
              { backgroundColor: colors.surfaceTinted, borderColor: colors.borderAccent },
            ]}
          >
            <IconSymbol name="bolt.fill" size={IconSize.lg} color={colors.gold} />
            <ThemedText style={styles.xpText}>+25 XP</ThemedText>
          </View>

          {/* Dismiss button */}
          <GradientButton
            onPress={onDismiss}
            label="Own It!"
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    borderRadius: Radius["2xl"],
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: "center",
    fontSize: FontSize.base,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  xpChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  xpText: {
    fontSize: FontSize.base,
    fontWeight: "600",
  },
  button: {
    width: "100%",
  },
});
