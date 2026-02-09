import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

interface JournalPromptCardProps {
  prompt: string;
  onTap?: (prompt: string) => void;
}

export function JournalPromptCard({ prompt, onTap }: JournalPromptCardProps) {
  const colors = useColors();

  const handlePress = () => {
    if (onTap) {
      haptics.light();
      onTap(prompt);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderAccentStrong,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <IconSymbol name="sparkles" size={IconSize.lg} color={colors.tint} />
        <ThemedText
          style={styles.label}
          color={colors.tint}
        >
          Gabby suggests:
        </ThemedText>
      </View>
      <ThemedText
        style={styles.prompt}
        color={colors.foreground}
      >
        {prompt}
      </ThemedText>
      {onTap && (
        <ThemedText
          style={styles.hint}
          color={colors.mutedForeground}
        >
          Tap to use as starter
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prompt: {
    fontSize: FontSize.xl,
    lineHeight: 24,
    fontWeight: '500',
  },
  hint: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
});
