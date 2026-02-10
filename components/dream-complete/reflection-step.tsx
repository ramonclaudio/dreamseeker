import { View, TextInput, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { Radius } from "@/constants/theme";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import type { ColorPalette } from "@/constants/theme";

export function ReflectionStep({
  value,
  onChangeText,
  colors,
}: {
  value: string;
  onChangeText: (text: string) => void;
  colors: ColorPalette;
}) {
  return (
    <View style={styles.container}>
      <IconSymbol
        name="heart.fill"
        size={IconSize["5xl"]}
        color={colors.primary}
        style={{ marginBottom: Spacing.lg }}
      />
      <ThemedText variant="title" style={styles.title}>
        How does winning feel?
      </ThemedText>
      <ThemedText
        style={styles.subtitle}
        color={colors.mutedForeground}
      >
        Real talk — you just did something most people only dream about.
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.secondary,
            color: colors.foreground,
            borderColor: colors.border,
          },
        ]}
        placeholder="Pour it out..."
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
      />
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
  input: {
    width: "100%",
    minHeight: 150,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    fontSize: FontSize.xl,
    borderWidth: 1,
  },
});
