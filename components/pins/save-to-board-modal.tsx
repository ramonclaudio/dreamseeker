import { Modal, Pressable, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';
import { haptics } from '@/lib/haptics';
import type { Id } from '@/convex/_generated/dataModel';

type SaveToBoardModalProps = {
  visible: boolean;
  onClose: () => void;
  boards: { _id: string; name: string }[];
  onSelect: (boardId: Id<'visionBoards'>) => void;
};

export function SaveToBoardModal({ visible, onClose, boards, onSelect }: SaveToBoardModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <ThemedText style={styles.title}>Save to Board</ThemedText>
          <View style={styles.boardList}>
            {boards.map((board) => (
              <Pressable
                key={board._id}
                onPress={() => {
                  haptics.light();
                  onSelect(board._id as Id<'visionBoards'>);
                }}
                style={({ pressed }) => [
                  styles.boardPill,
                  {
                    backgroundColor: colors.surfaceTinted,
                    borderColor: colors.borderAccent,
                    opacity: pressed ? Opacity.pressed : 1,
                  },
                ]}
              >
                <View style={[styles.boardIcon, { backgroundColor: `${colors.primary}15` }]}>
                  <IconSymbol name="square.grid.2x2" size={IconSize.md} color={colors.primary} />
                </View>
                <ThemedText
                  style={styles.boardLabel}
                  color={colors.foreground}
                  numberOfLines={1}
                >
                  {board.name}
                </ThemedText>
                <IconSymbol name="chevron.right" size={IconSize.sm} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize['4xl'],
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  boardList: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  boardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  boardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardLabel: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    flex: 1,
  },
});
