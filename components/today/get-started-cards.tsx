import { ScrollView, View, Pressable } from 'react-native';
import { MaterialCard } from '@/components/ui/material-card';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize, HitSlop } from '@/constants/layout';
import { Opacity } from '@/constants/ui';
import { haptics } from '@/lib/haptics';

type GetStartedCard = {
  id: string;
  title: string;
  description: string;
  action: string;
};

type GetStartedCardsProps = {
  cards: GetStartedCard[];
  onDismiss: (id: string) => void;
  onPress: (action: string) => void;
};

export function GetStartedCards({ cards, onDismiss, onPress }: GetStartedCardsProps) {
  const colors = useColors();

  if (cards.length === 0) return null;

  return (
    <View style={{ marginBottom: Spacing.xl }}>
      <ThemedText
        style={{
          fontSize: FontSize.base,
          fontWeight: '600',
          textTransform: 'uppercase',
          marginBottom: Spacing.sm,
          marginLeft: Spacing.xs,
        }}
        color={colors.mutedForeground}
      >
        Get Started
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={280 + Spacing.md}
        decelerationRate="fast"
        contentContainerStyle={{ gap: Spacing.md }}
      >
        {cards.map((card) => (
          <Pressable
            key={card.id}
            onPress={() => {
              if (!card.action) return;
              haptics.light();
              onPress(card.action);
            }}
            style={({ pressed }) => ({
              width: 280,
              opacity: pressed && card.action ? Opacity.pressed : 1,
            })}
            disabled={!card.action}
          >
            <MaterialCard style={{ padding: Spacing.lg }}>
              {/* Dismiss circle */}
              <Pressable
                onPress={() => {
                  haptics.light();
                  onDismiss(card.id);
                }}
                hitSlop={HitSlop.md}
                style={({ pressed }) => ({
                  position: 'absolute',
                  top: Spacing.sm,
                  right: Spacing.sm,
                  zIndex: 1,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: pressed ? colors.border : colors.muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
                accessibilityLabel={`Dismiss ${card.title}`}
              >
                <IconSymbol name="xmark" size={9} color={colors.mutedForeground} />
              </Pressable>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: Spacing.lg }}>
                <View style={{ flex: 1, marginRight: Spacing.md }}>
                  <ThemedText style={{ fontSize: FontSize.xl, fontWeight: '600', marginBottom: Spacing.xs }}>
                    {card.title}
                  </ThemedText>
                  <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground} numberOfLines={1}>
                    {card.description}
                  </ThemedText>
                </View>
                {card.action ? (
                  <IconSymbol name="chevron.right" size={IconSize.lg} color={colors.mutedForeground} />
                ) : null}
              </View>
            </MaterialCard>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
