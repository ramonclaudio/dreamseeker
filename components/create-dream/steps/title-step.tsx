import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { Spacing, FontSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { TITLE_SUGGESTIONS } from "@/constants/dream-suggestions";
import type { DreamCategory } from "@/constants/dreams";
import { haptics } from "@/lib/haptics";

export function TitleStep({
  title,
  onChangeTitle,
  category,
}: {
  title: string;
  onChangeTitle: (t: string) => void;
  category: DreamCategory | null;
}) {
  const colors = useColors();

  const suggestions = category && category !== 'custom' ? TITLE_SUGGESTIONS[category] : [];
  const displaySuggestions = suggestions.slice(0, 6);

  const handleSuggestionPress = (suggestion: string) => {
    haptics.light();
    onChangeTitle(suggestion);
  };

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">I will...</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          What dream do you want to achieve?
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
        placeholder="Visit Japan, start a business, buy a home..."
        placeholderTextColor={colors.mutedForeground}
        value={title}
        onChangeText={onChangeTitle}
        autoFocus
        returnKeyType="next"
      />
      {displaySuggestions.length > 0 && (
        <View style={{ gap: Spacing.sm }}>
          <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
            Suggestions:
          </ThemedText>
          <View style={styles.suggestionsContainer}>
            {displaySuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                onPress={() => handleSuggestionPress(suggestion)}
                style={[
                  styles.suggestionChip,
                  {
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <ThemedText style={{ fontSize: FontSize.sm }} color={colors.foreground}>
                  {suggestion}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  suggestionChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
