import { View, TextInput } from "react-native";

import { SuggestionChips } from "@/components/create-dream/suggestion-chips";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { Spacing, FontSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { IDENTITY_SUGGESTIONS } from "@/constants/dream-suggestions";

export function WhyStep({
  whyItMatters,
  onChangeText,
}: {
  whyItMatters: string;
  onChangeText: (t: string) => void;
}) {
  const colors = useColors();

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">So I can become...</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Who will you be when you achieve this dream?
        </ThemedText>
      </View>
      <TextInput
        style={{
          backgroundColor: colors.secondary,
          borderRadius: Radius.md,
          padding: Spacing.lg,
          fontSize: FontSize.xl,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        placeholder="Confident, free, unstoppable..."
        placeholderTextColor={colors.mutedForeground}
        value={whyItMatters}
        onChangeText={onChangeText}
        autoFocus
        returnKeyType="next"
      />
      <SuggestionChips
        options={[...IDENTITY_SUGGESTIONS]}
        selected={whyItMatters ? [whyItMatters] : []}
        onSelect={(option) => onChangeText(option === whyItMatters ? '' : option)}
      />
    </View>
  );
}
