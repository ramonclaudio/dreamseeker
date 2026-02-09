import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/use-subscription';
import { Spacing, FontSize } from '@/constants/layout';

interface ProBadgeProps {
  show?: boolean;
}

export function ProBadge({ show }: ProBadgeProps = {}) {
  const colors = useColors();
  const { isPremium } = useSubscription();

  // Don't show if user is premium or if explicitly hidden
  if (isPremium || show === false) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${colors.primary}33`, // 20% opacity
          borderColor: `${colors.primary}66`, // 40% opacity
        },
      ]}
    >
      <ThemedText style={styles.text} color={colors.primary}>
        PRO
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
