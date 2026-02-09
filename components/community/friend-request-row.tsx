import { Pressable, StyleSheet, View } from 'react-native';

import { MaterialCard } from '@/components/ui/material-card';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';

type IncomingRequest = {
  requestId: string;
  fromUserId: string;
  profile: {
    username: string;
    displayName?: string;
  } | null;
  createdAt: number;
};

type FriendRequestRowProps = {
  request: IncomingRequest;
  onAccept: () => void;
  onReject: () => void;
};

export function FriendRequestRow({
  request,
  onAccept,
  onReject,
}: FriendRequestRowProps) {
  const colors = useColors();
  const initial =
    request.profile?.displayName?.charAt(0).toUpperCase() ?? request.profile?.username?.charAt(0).toUpperCase() ?? '?';

  return (
    <MaterialCard style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <ThemedText
            style={styles.avatarText}
            color={colors.primaryForeground}
          >
            {initial}
          </ThemedText>
        </View>

        <View style={styles.info}>
          <ThemedText style={styles.displayName} numberOfLines={1}>
            {request.profile?.displayName ?? request.profile?.username ?? 'Unknown'}
          </ThemedText>
          <ThemedText
            style={styles.username}
            color={colors.mutedForeground}
            numberOfLines={1}
          >
            @{request.profile?.username ?? 'unknown'}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onAccept}
            style={({ pressed }) => [
              styles.acceptButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? Opacity.pressed : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Accept request from ${request.profile?.displayName ?? request.profile?.username ?? 'user'}`}
          >
            <ThemedText
              style={styles.buttonText}
              color={colors.primaryForeground}
            >
              Accept
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={onReject}
            style={({ pressed }) => [
              styles.rejectButton,
              {
                backgroundColor: colors.destructiveBackground,
                opacity: pressed ? Opacity.pressed : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Reject request from ${request.profile?.displayName ?? request.profile?.username ?? 'user'}`}
          >
            <ThemedText
              style={styles.buttonText}
              color={colors.destructive}
            >
              Reject
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </MaterialCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: Spacing.xxs,
  },
  displayName: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  username: {
    fontSize: FontSize.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  acceptButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  rejectButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  buttonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
