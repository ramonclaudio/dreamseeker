import { View, Pressable } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassControl } from '@/components/ui/glass-control';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';
import type { SlideColors } from './shared';

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function NotificationsSlide({
  colors,
  time,
  onSelectTime,
  onSkip,
}: {
  colors: SlideColors;
  time: string | null;
  onSelectTime: () => void;
  onSkip: () => void;
}) {
  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">Daily reminders</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          When do you want to be reminded to take action on your dreams?
        </ThemedText>
      </View>

      <Pressable
        onPress={onSelectTime}
        style={({ pressed }) => ({
          opacity: pressed ? Opacity.pressed : 1,
        })}
        accessibilityLabel={`Notification time: ${time ? formatTime(time) : 'Not set'}`}
        accessibilityHint="Opens a time picker"
        accessibilityRole="button"
      >
        <GlassControl
          isInteractive
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: Spacing.lg,
            borderRadius: Radius.lg,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <IconSymbol name="bell.fill" size={IconSize.xl} color={colors.primary} />
            <ThemedText style={{ fontSize: FontSize.lg }}>Notification Time</ThemedText>
          </View>
          <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
            {time ? formatTime(time) : 'Not set'}
          </ThemedText>
        </GlassControl>
      </Pressable>

      {time && (
        <Pressable
          onPress={onSkip}
          style={({ pressed }) => ({
            opacity: pressed ? Opacity.pressed : 1,
            alignSelf: 'center',
          })}
        >
          <ThemedText color={colors.mutedForeground}>Clear time</ThemedText>
        </Pressable>
      )}

      <ThemedText
        style={{ fontSize: FontSize.sm, textAlign: 'center' }}
        color={colors.mutedForeground}
      >
        You can change this later in Settings.
      </ThemedText>
    </View>
  );
}
