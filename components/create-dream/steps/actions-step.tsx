import { View } from "react-native";

import { ActionListInput } from "@/components/create-dream/action-list-input";
import { SuggestionChips } from "@/components/create-dream/suggestion-chips";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { Spacing, FontSize } from "@/constants/layout";
import { type DreamCategory } from "@/constants/dreams";
import { ACTION_SUGGESTIONS } from "@/constants/dream-suggestions";

export function ActionsStep({
  actions,
  onChange,
  category,
}: {
  actions: string[];
  onChange: (actions: string[]) => void;
  category: DreamCategory | null;
}) {
  const colors = useColors();
  const suggestions = category ? ACTION_SUGGESTIONS[category] : [];

  const handleSuggestionSelect = (option: string) => {
    const trimmedActions = actions.map((a) => a.trim());
    if (trimmedActions.includes(option)) {
      onChange(actions.filter((a) => a.trim() !== option));
    } else {
      const emptyIndex = actions.findIndex((a) => a.trim() === '');
      if (emptyIndex >= 0) {
        const updated = [...actions];
        updated[emptyIndex] = option;
        onChange(updated);
      } else {
        onChange([...actions, option]);
      }
    }
  };

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">Break it into steps</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          What actions will get you closer to your dream?
        </ThemedText>
      </View>

      {suggestions.length > 0 && (
        <SuggestionChips
          options={suggestions}
          selected={actions.map((a) => a.trim()).filter((a) => a.length > 0)}
          onSelect={handleSuggestionSelect}
        />
      )}

      <ActionListInput actions={actions} onChange={onChange} />
    </View>
  );
}
