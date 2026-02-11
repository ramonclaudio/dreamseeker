import { View, Pressable, ScrollView, FlatList, Alert, ActivityIndicator, Modal, StyleSheet, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';

import { SegmentControl } from '@/components/boards/segment-control';
import { BoardPage } from '@/components/boards/board-page';
import { BoardShareCard } from '@/components/share-cards/board-share-card';
import { MasonryGrid } from '@/components/pins/masonry-grid';
import { CreatePinModal } from '@/components/pins/create-pin-modal';
import { PinDetailModal } from '@/components/pins/pin-detail-modal';
import { ProfileSetupModal } from '@/components/community/profile-setup-modal';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { TabHeader } from '@/components/ui/tab-header';
import { useColors } from '@/hooks/use-color-scheme';
import { useMyBoards, useMyPinsByBoard, useCommunityPins, type Pin } from '@/hooks/use-pins';
import { useSubscription } from '@/hooks/use-subscription';
import { useShareCapture } from '@/hooks/use-share-capture';
import { api } from '@/convex/_generated/api';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import type { ColorPalette } from '@/constants/theme';
import { Opacity } from '@/constants/ui';
import { DREAM_CATEGORIES, FREE_MAX_PINS } from '@/convex/constants';
import type { DreamCategory } from '@/convex/constants';
import { UpgradeBanner } from '@/components/ui/upgrade-banner';
import { haptics } from '@/lib/haptics';
import type { Id } from '@/convex/_generated/dataModel';

const SEGMENTS = ['My Boards', 'Community'];

const CATEGORY_FILTERS: { key: DreamCategory | null; label: string }[] = [
  { key: null, label: 'All' },
  { key: 'travel', label: 'Travel' },
  { key: 'money', label: 'Money' },
  { key: 'career', label: 'Career' },
  { key: 'lifestyle', label: 'Lifestyle' },
  { key: 'growth', label: 'Growth' },
  { key: 'relationships', label: 'Relationships' },
];

// ── Action Menu ─────────────────────────────────────────────────────────────

type ActionMenuStep = 'actions' | 'pick-board';

function ActionMenu({
  visible,
  onClose,
  onCreateBoard,
  onCreatePin,
  boards,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onCreateBoard: () => void;
  onCreatePin: (boardId?: Id<'visionBoards'>) => void;
  boards: { _id: string; name: string }[];
  colors: ColorPalette;
}) {
  const [step, setStep] = useState<ActionMenuStep>('actions');
  const insets = useSafeAreaInsets();

  // Reset step when menu closes
  useEffect(() => {
    if (!visible) setStep('actions');
  }, [visible]);

  const handleNewPin = () => {
    haptics.light();
    if (boards.length <= 1) {
      onCreatePin(boards[0]?._id as Id<'visionBoards'> | undefined);
    } else {
      setStep('pick-board');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.menuSheet,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <View style={[styles.menuHandle, { backgroundColor: colors.border }]} />

          {step === 'actions' ? (
            <>
              <ThemedText style={styles.menuTitle}>Create</ThemedText>
              <View style={styles.menuOptions}>
                <MenuOption
                  icon="square.grid.2x2"
                  label="New Board"
                  subtitle="Organize your pins"
                  colors={colors}
                  onPress={() => {
                    haptics.light();
                    onClose();
                    onCreateBoard();
                  }}
                />
                <MenuOption
                  icon="pin.fill"
                  label="New Pin"
                  subtitle="Add an image to your board"
                  colors={colors}
                  onPress={handleNewPin}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.menuTitleRow}>
                <Pressable
                  onPress={() => setStep('actions')}
                  hitSlop={12}
                  style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
                >
                  <IconSymbol name="chevron.left" size={IconSize.lg} color={colors.mutedForeground} />
                </Pressable>
                <ThemedText style={styles.menuTitle}>Pick a Board</ThemedText>
                <View style={{ width: IconSize.lg }} />
              </View>
              <View style={styles.boardPills}>
                {boards.map((board) => (
                  <Pressable
                    key={board._id}
                    onPress={() => {
                      haptics.light();
                      onCreatePin(board._id as Id<'visionBoards'>);
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
                    <View
                      style={[
                        styles.boardPillIcon,
                        { backgroundColor: `${colors.primary}15` },
                      ]}
                    >
                      <IconSymbol name="square.grid.2x2" size={IconSize.md} color={colors.primary} />
                    </View>
                    <ThemedText
                      style={styles.boardPillLabel}
                      color={colors.foreground}
                      numberOfLines={1}
                    >
                      {board.name}
                    </ThemedText>
                    <IconSymbol name="chevron.right" size={IconSize.sm} color={colors.mutedForeground} />
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MenuOption({
  icon,
  label,
  subtitle,
  colors,
  onPress,
}: {
  icon: IconSymbolName;
  label: string;
  subtitle: string;
  colors: ColorPalette;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuOption,
        {
          backgroundColor: colors.surfaceTinted,
          borderColor: colors.borderAccent,
          opacity: pressed ? Opacity.pressed : 1,
        },
      ]}
    >
      <View style={[styles.menuOptionIcon, { backgroundColor: `${colors.primary}15` }]}>
        <IconSymbol name={icon} size={IconSize['2xl']} color={colors.primary} />
      </View>
      <View style={styles.menuOptionText}>
        <ThemedText style={styles.menuOptionLabel} color={colors.foreground}>
          {label}
        </ThemedText>
        <ThemedText style={styles.menuOptionSub} color={colors.mutedForeground}>
          {subtitle}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />
    </Pressable>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function BoardsScreen() {
  const colors = useColors();
  const { width: screenWidth } = useWindowDimensions();
  const { create } = useLocalSearchParams<{ create?: string }>();

  const [activeSegment, setActiveSegment] = useState(0);
  const [showCreatePin, setShowCreatePin] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [editPin, setEditPin] = useState<Pin | null>(null);
  const [profileSetupDone, setProfileSetupDone] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [pinBoardId, setPinBoardId] = useState<Id<'visionBoards'> | undefined>(undefined);

  // ── My Boards state ─────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoCreated, setAutoCreated] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const user = useQuery(api.auth.getCurrentUser);
  const { boards, isLoading: boardsLoading, createBoard, renameBoard, deleteBoard } = useMyBoards();
  const createBoardMutation = useMutation(api.pins.createBoard);
  const { viewShotRef, capture, isSharing } = useShareCapture();

  // ── Community state ─────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<DreamCategory | undefined>(undefined);
  const { pins: communityPins, isLoading: communityLoading, hasMore, loadMore } = useCommunityPins({
    category: selectedCategory,
  });
  const { isPremium, showUpgrade } = useSubscription();
  const myProfile = useQuery(api.community.getMyProfile);
  const savedPinIds = useQuery(api.pins.getSavedPinIds);
  const savePinMutation = useMutation(api.pins.savePin);

  const needsProfileSetup =
    isPremium &&
    activeSegment === 1 &&
    !profileSetupDone &&
    myProfile !== undefined &&
    (!myProfile || !myProfile.displayName);

  // Auto-create "My Board" if user has no boards
  useEffect(() => {
    if (!boardsLoading && boards.length === 0 && !autoCreated && user) {
      setAutoCreated(true);
      createBoardMutation({ name: 'My Board' });
    }
  }, [boardsLoading, boards.length, autoCreated, user, createBoardMutation]);

  // Auto-open create pin modal when navigated with ?create=true
  useEffect(() => {
    if (create === 'true') setShowCreatePin(true);
  }, [create]);

  const currentBoard = boards[currentIndex];

  // ── Share card pin data ────────────────────────────────────────
  const { pins: boardPins } = useMyPinsByBoard(currentBoard?._id as Id<'visionBoards'> | undefined);
  const boardPinImages = (boardPins ?? []).slice(0, 6).map((p) => p.imageUrl ?? null);
  const boardPinCount = boardPins?.length ?? 0;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleAddBoard = () => {
    Alert.prompt('New Board', 'Enter a name for your board', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Create',
        onPress: async (name?: string) => {
          if (!name?.trim()) return;
          try {
            await createBoard(name.trim());
            haptics.success();
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 300);
          } catch (e: any) {
            if (e.message?.includes('BOARD_LIMIT')) {
              Alert.alert('Limit Reached', 'You can have up to 10 boards.');
            }
            haptics.error();
          }
        },
      },
    ]);
  };

  const handleBoardLongPress = () => {
    if (!currentBoard) return;
    Alert.alert(currentBoard.name, undefined, [
      {
        text: 'Rename',
        onPress: () => {
          Alert.prompt('Rename Board', 'Enter a new name', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Save',
              onPress: async (name?: string) => {
                if (!name?.trim()) return;
                try {
                  await renameBoard(currentBoard._id as Id<'visionBoards'>, name.trim());
                  haptics.success();
                } catch {
                  haptics.error();
                }
              },
            },
          ], 'plain-text', currentBoard.name);
        },
      },
      {
        text: 'Delete Board',
        style: 'destructive',
        onPress: () => {
          if (boards.length <= 1) {
            Alert.alert('Cannot Delete', 'You need at least one board.');
            return;
          }
          Alert.alert(
            'Delete Board',
            `Delete "${currentBoard.name}"? Pins will move to your first board.`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    if (currentIndex > 0) {
                      setCurrentIndex(currentIndex - 1);
                    }
                    await deleteBoard(currentBoard._id as Id<'visionBoards'>);
                    haptics.success();
                  } catch {
                    haptics.error();
                  }
                },
              },
            ],
          );
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRenameBoard = () => {
    if (!currentBoard) return;
    Alert.prompt('Rename Board', 'Enter a new name', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: async (name?: string) => {
          if (!name?.trim()) return;
          try {
            await renameBoard(currentBoard._id as Id<'visionBoards'>, name.trim());
            haptics.success();
          } catch {
            haptics.error();
          }
        },
      },
    ], 'plain-text', currentBoard.name);
  };

  const handleFabPress = () => {
    haptics.light();
    if (isMyBoards) {
      setShowActionMenu(true);
    } else if (isPremium) {
      setShowCreatePin(true);
    } else {
      showUpgrade();
    }
  };

  const handleCreatePinFromMenu = (boardId?: Id<'visionBoards'>) => {
    setShowActionMenu(false);
    setPinBoardId(boardId);
    setShowCreatePin(true);
  };

  const handleViewOriginal = (originalPinId: string) => {
    setSelectedPin(null);
    setActiveSegment(1);
    // Find the original in loaded community pins and open it
    setTimeout(() => {
      const original = communityPins.find((p) => p._id === originalPinId);
      if (original) setSelectedPin(original);
    }, 300);
  };

  const handleSaveToBoard = async (pinId: string, boardId: Id<'visionBoards'>) => {
    try {
      await savePinMutation({ pinId: pinId as Id<'pins'>, boardId });
      haptics.success();
      setSelectedPin(null);
    } catch (e: any) {
      if (e.message?.includes('ALREADY_SAVED')) {
        Alert.alert('Already Saved', 'This pin is already in your boards.');
      } else if (e.message?.includes('FREE_PIN_LIMIT')) {
        showUpgrade();
      } else {
        haptics.error();
      }
    }
  };

  const handle = user?.displayName ?? user?.name ?? undefined;
  const isMyBoards = activeSegment === 0;

  // Board ID for CreatePinModal: menu selection > current board > undefined
  const effectiveBoardId = isMyBoards
    ? pinBoardId ?? (currentBoard?._id as Id<'visionBoards'> | undefined)
    : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {needsProfileSetup && (
        <ProfileSetupModal visible onComplete={() => setProfileSetupDone(true)} />
      )}

      {/* Header */}
      <View style={{ paddingHorizontal: Spacing.lg }}>
        <TabHeader
          title="Vision Board"
          subtitle="Pin your dreams and inspiration"
          onShare={boards.length > 0 ? capture : undefined}
          shareDisabled={isSharing}
          onAdd={handleFabPress}
          addLabel="Create new board or pin"
          safeAreaTop
        />
      </View>

      {/* Segment control */}
      <View style={styles.segmentWrapper}>
        <SegmentControl
          segments={SEGMENTS}
          activeIndex={activeSegment}
          onChange={setActiveSegment}
        />
      </View>

      {/* ── My Boards segment ──────────────────────────────────── */}
      {isMyBoards && (
        <>
          {/* Board name + dot indicators */}
          {boards.length > 0 && (
            <View style={styles.boardNav}>
              <Pressable
                onPress={handleRenameBoard}
                onLongPress={handleBoardLongPress}
                hitSlop={4}
                style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
              >
                <ThemedText style={styles.boardName}>
                  {currentBoard?.name ?? ''}
                </ThemedText>
              </Pressable>
              <View style={styles.dots}>
                {boards.map((board, index) => (
                  <Pressable
                    key={board._id}
                    onPress={() => {
                      setCurrentIndex(index);
                      flatListRef.current?.scrollToIndex({ index, animated: true });
                    }}
                    hitSlop={6}
                  >
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: index === currentIndex
                            ? colors.foreground
                            : `${colors.foreground}30`,
                        },
                      ]}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {boardsLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : boards.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={boards}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
              keyExtractor={(item) => item._id}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={(_, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              renderItem={({ item }) => (
                <BoardPage
                  boardId={item._id as Id<'visionBoards'>}
                  width={screenWidth}
                  onPinPress={(pin) => setSelectedPin(pin)}
                  onCreatePin={() => setShowCreatePin(true)}
                  colors={colors}
                />
              )}
            />
          ) : (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color={colors.primary} />
              <ThemedText style={styles.setupText} color={colors.mutedForeground}>
                Setting up your board...
              </ThemedText>
            </View>
          )}

          <View style={{ paddingHorizontal: Spacing.lg, marginTop: Spacing.md }}>
            <UpgradeBanner used={boardPinCount} limit={FREE_MAX_PINS} noun="Pins" />
          </View>
        </>
      )}

      {/* ── Community segment ──────────────────────────────────── */}
      {!isMyBoards && (
        <MasonryGrid
          pins={communityPins}
          onPinPress={(pin) => setSelectedPin(pin)}
          onEndReached={hasMore ? loadMore : undefined}
          ListHeaderComponent={
            <View style={styles.communityHeader}>
              <ThemedText style={styles.subtitle} color={colors.mutedForeground}>
                Inspiration from women crushing their goals
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                {CATEGORY_FILTERS.map(({ key, label }) => {
                  const isSelected = selectedCategory === (key ?? undefined);
                  const chipColor = key ? DREAM_CATEGORIES[key].color : colors.primary;
                  return (
                    <Pressable
                      key={label}
                      onPress={() => {
                        haptics.light();
                        setSelectedCategory(key ?? undefined);
                      }}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: isSelected ? chipColor : colors.surfaceTinted,
                          borderColor: isSelected ? chipColor : colors.border,
                        },
                      ]}
                    >
                      <ThemedText
                        style={styles.filterLabel}
                        color={isSelected ? '#fff' : colors.foreground}
                      >
                        {label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          }
          ListEmptyComponent={
            communityLoading ? (
              <View style={styles.emptyState}>
                <ThemedText color={colors.mutedForeground}>Loading...</ThemedText>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <IconSymbol name="sparkles" size={IconSize['3xl']} color={colors.mutedForeground} />
                <ThemedText style={styles.emptyTitle}>No pins yet</ThemedText>
                <ThemedText style={styles.emptyText} color={colors.mutedForeground}>
                  Be the first to pin something inspiring!
                </ThemedText>
              </View>
            )
          }
        />
      )}

      {/* Off-screen share card */}
      {currentBoard && (
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={{ position: 'absolute', left: -9999 }}>
          <BoardShareCard
            boardName={currentBoard.name}
            pinImages={boardPinImages}
            pinCount={boardPinCount}
            handle={handle}
          />
        </ViewShot>
      )}

      {/* Action menu */}
      <ActionMenu
        visible={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        onCreateBoard={() => {
          setShowActionMenu(false);
          handleAddBoard();
        }}
        onCreatePin={handleCreatePinFromMenu}
        boards={boards}
        colors={colors}
      />

      <CreatePinModal
        visible={showCreatePin || !!editPin}
        onClose={() => {
          setShowCreatePin(false);
          setEditPin(null);
          setPinBoardId(undefined);
        }}
        defaultPersonalOnly={isMyBoards}
        editPin={editPin}
        boardId={effectiveBoardId}
      />
      <PinDetailModal
        pin={selectedPin}
        visible={!!selectedPin}
        onClose={() => setSelectedPin(null)}
        currentUserId={isMyBoards ? user?._id : myProfile?.userId}
        onEdit={(pin) => { setSelectedPin(null); setEditPin(pin as Pin); }}
        isSaved={selectedPin ? savedPinIds?.includes(selectedPin._id) : false}
        boards={boards}
        onSaveToBoard={handleSaveToBoard}
        onViewOriginal={handleViewOriginal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  segmentWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  boardNav: {
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  boardName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  setupText: {
    fontSize: FontSize.base,
  },
  communityHeader: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.base,
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  filterLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  // Action menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  menuHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  menuTitle: {
    fontSize: FontSize['4xl'],
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  menuOptions: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  menuOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOptionText: {
    flex: 1,
  },
  menuOptionLabel: {
    fontSize: FontSize.xl,
    fontWeight: '600',
  },
  menuOptionSub: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  // Board picker pills
  boardPills: {
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
  boardPillIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardPillLabel: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    flex: 1,
  },
});
