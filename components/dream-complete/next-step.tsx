import { View, Pressable, StyleSheet, Share } from "react-native";
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
  dreamTitle: string;
}

export function NextStep({ colors, dreamTitle }: NextStepProps) {
  return (
    <View style={styles.container}>
      <IconSymbol
        name="sparkles"
        size={IconSize["6xl"]}
        color={colors.primary}
        style={{ marginBottom: Spacing.lg }}
      />
      <ThemedText variant="title" style={styles.title}>
        {"What's next?"}
      </ThemedText>
      <ThemedText
        style={styles.subtitle}
        color={colors.mutedForeground}
      >
        Winners keep moving. What&apos;s your next play?
      </ThemedText>

      <View style={styles.buttons}>
        <GradientButton
          onPress={() => {
            haptics.medium();
            router.replace("/(app)/create-dream" as never);
          }}
          label="Dream Bigger"
          icon={
            <IconSymbol name="plus" size={IconSize.xl} color={colors.onColor} weight="bold" />
          }
        />
        <GradientButton
          variant="secondary"
          onPress={async () => {
            haptics.light();
            try {
              await Share.share({
                message: `I just achieved my dream: '${dreamTitle}' on DreamSeeker! 🎯✨ #DreamSeeker #GoalCrusher`,
              });
              haptics.success();
            } catch {
              // Sharing cancelled or failed, no action needed
            }
          }}
          label="Share Your Win"
          icon={
            <IconSymbol name="square.and.arrow.up" size={IconSize.xl} color={colors.accentBlue} />
          }
        />
        <Pressable
          onPress={() => {
            haptics.light();
            router.replace("/(app)/(tabs)" as never);
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
            Done
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
