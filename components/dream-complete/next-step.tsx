import { View, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { GradientButton } from "@/components/ui/gradient-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Opacity } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import type { ColorPalette } from "@/constants/theme";

interface NextStepProps {
  colors: ColorPalette;
  onShare: () => void;
}

export function NextStep({ colors, onShare }: NextStepProps) {
  return (
    <View style={styles.container}>
      <IconSymbol
        name="sparkles"
        size={IconSize["6xl"]}
        color={colors.primary}
        style={{ marginBottom: Spacing.lg }}
      />
      <ThemedText variant="title" style={styles.title}>
        {"WHAT'S NEXT, QUEEN?"}
      </ThemedText>
      <ThemedText
        style={styles.subtitle}
        color={colors.mutedForeground}
      >
        {"You don't stop. What's the next dream?"}
      </ThemedText>

      <View style={styles.buttons}>
        <GradientButton
          onPress={() => {
            haptics.medium();
            router.replace("/(app)/create-dream" as never);
          }}
          label="DREAM BIGGER"
          icon={
            <IconSymbol name="plus" size={IconSize.xl} color={colors.onColor} weight="bold" />
          }
        />
        <GradientButton
          variant="secondary"
          onPress={onShare}
          label="FLEX YOUR WIN"
          icon={
            <IconSymbol name="square.and.arrow.up" size={IconSize.xl} color={colors.accent} />
          }
        />
        <Pressable
          onPress={() => {
            haptics.light();
            if (router.canGoBack()) {
              router.back();
            }
          }}
          style={({ pressed }) => ({
            opacity: pressed ? Opacity.pressed : 1,
            paddingVertical: Spacing.lg,
            alignItems: "center",
          })}
        >
          <ThemedText
            style={{ fontSize: FontSize.xl, fontWeight: "600" }}
            color={colors.mutedForeground}
          >
            {"I'm done flexing"}
          </ThemedText>
        </Pressable>
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
    marginBottom: Spacing["2xl"],
  },
  buttons: {
    width: "100%",
    gap: Spacing.sm,
  },
});
