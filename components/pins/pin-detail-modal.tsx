import { useState } from 'react';
import { View, Modal, Pressable, Alert, ActionSheetIOS, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { api } from '@/convex/_generated/api';
import { ThemedText } from '@/components/ui/themed-text';
import { GlassControl } from '@/components/ui/glass-control';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-color-scheme';
import { Spacing, FontSize, IconSize } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';
import { DREAM_CATEGORIES } from '@/convex/constants';
import type { DreamCategory, PinType } from '@/convex/constants';
import { haptics } from '@/lib/haptics';
import { useShareCapture } from '@/hooks/use-share-capture';
import ViewShot from 'react-native-view-shot';
import { PinShareCard } from '@/components/share-cards/pin-share-card';
import { SaveToBoardModal } from '@/components/pins/save-to-board-modal';
import type { Id } from '@/convex/_generated/dataModel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PinData = {
  _id: string;
  userId: string;
  type: PinType;
  title?: string;
  description?: string;
  category?: DreamCategory;
  tags?: string[];
  imageUrl?: string | null;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImageUrl?: string;
  linkDomain?: string;
  imageAspectRatio?: number;
  isPersonalOnly: boolean;
  originalPinId?: string;
  customCategoryName?: string;
  customCategoryIcon?: string;
  customCategoryColor?: string;
  createdAt: number;
  username: string;
  displayName?: string;
  avatarInitial: string;
  avatarUrl?: string | null;
  authorIsPublic?: boolean;
};

type PinDetailModalProps = {
  pin: PinData | null;
  visible: boolean;
  onClose: () => void;
  currentUserId?: string;
  onEdit?: (pin: PinData) => void;
  isSaved?: boolean;
  boards?: { _id: string; name: string }[];
  onSaveToBoard?: (pinId: string, boardId: Id<'visionBoards'>) => void;
  onViewOriginal?: (originalPinId: string) => void;
};

export function PinDetailModal({ pin, visible, onClose, currentUserId, onEdit, isSaved, boards, onSaveToBoard, onViewOriginal }: PinDetailModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const deletePin = useMutation(api.pins.deletePin);
  const reportPinMutation = useMutation(api.pins.reportPin);
  const blockUserMutation = useMutation(api.pins.blockUser);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [showBoardPicker, setShowBoardPicker] = useState(false);
  const { viewShotRef, capture, isSharing } = useShareCapture();
  const user = useQuery(api.auth.getCurrentUser);

  if (!pin) return null;
  const isOwner = currentUserId != null && pin.userId === currentUserId;
  const canSave = !isOwner && !!onSaveToBoard && !!boards && boards.length > 0;
  const canViewProfile = !isOwner && (pin.authorIsPublic ?? false);
  const isAnonymousAuthor = !isOwner && !(pin.authorIsPublic ?? false);
  const hasImage = !!pin.imageUrl;

  const handleBookmark = () => {
    if (!canSave || !pin) return;
    haptics.light();
    if (boards!.length === 1) {
      onSaveToBoard!(pin._id, boards![0]._id as Id<'visionBoards'>);
    } else {
      setShowBoardPicker(true);
    }
  };

  const categoryInfo = pin.category && pin.category !== 'custom'
    ? DREAM_CATEGORIES[pin.category]
    : pin.category === 'custom' && pin.customCategoryName
      ? { label: pin.customCategoryName, color: pin.customCategoryColor ?? '#888' }
      : null;

  const handleDelete = () => {
    Alert.alert('Delete Pin', 'Are you sure you want to delete this pin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deletePin({ pinId: pin._id as any });
            haptics.success();
            onClose();
          } catch {
            haptics.error();
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const doReport = async () => {
    setIsReporting(true);
    try {
      await reportPinMutation({ pinId: pin._id as Id<'pins'> });
      haptics.success();
      Alert.alert('Thanks for reporting', "We'll review this pin.");
    } catch {
      haptics.error();
    } finally {
      setIsReporting(false);
    }
  };

  const doBlock = async () => {
    try {
      await blockUserMutation({ blockedUserId: pin.userId });
      haptics.success();
      Alert.alert('User blocked', "You won't see their content anymore.");
      onClose();
    } catch {
      haptics.error();
    }
  };

  const doBlockAndReport = async () => {
    setIsReporting(true);
    try {
      await Promise.all([
        reportPinMutation({ pinId: pin._id as Id<'pins'> }),
        blockUserMutation({ blockedUserId: pin.userId }),
      ]);
      haptics.success();
      Alert.alert('User blocked & pin reported', "You won't see their content anymore.");
      onClose();
    } catch {
      haptics.error();
    } finally {
      setIsReporting(false);
    }
  };

  const handleModeration = () => {
    if (process.env.EXPO_OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Report Pin', 'Block User', 'Block & Report'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) doReport();
          else if (index === 2) doBlock();
          else if (index === 3) doBlockAndReport();
        },
      );
    } else {
      Alert.alert('Moderation', 'Choose an action', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report Pin', onPress: doReport },
        { text: 'Block User', onPress: doBlock },
        { text: 'Block & Report', style: 'destructive', onPress: doBlockAndReport },
      ]);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Full-screen image */}
        {hasImage ? (
          <Image
            source={{ uri: pin.imageUrl! }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
        )}

        {/* Top scrim */}
        <View style={[styles.topScrim, { height: insets.top + 56 }]} pointerEvents="none">
          <Svg width={SCREEN_WIDTH} height={insets.top + 56}>
            <Defs>
              <LinearGradient id="topFade" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#000" stopOpacity={0.6} />
                <Stop offset="100%" stopColor="#000" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={SCREEN_WIDTH} height={insets.top + 56} fill="url(#topFade)" />
          </Svg>
        </View>

        {/* Bottom scrim */}
        <View style={styles.bottomScrim} pointerEvents="none">
          <Svg width={SCREEN_WIDTH} height={200}>
            <Defs>
              <LinearGradient id="bottomFade" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#000" stopOpacity={0} />
                <Stop offset="100%" stopColor="#000" stopOpacity={0.7} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={SCREEN_WIDTH} height={200} fill="url(#bottomFade)" />
          </Svg>
        </View>

        {/* Top header buttons */}
        <View style={[styles.floatingHeader, { paddingTop: insets.top + Spacing.sm }]}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => [styles.iconPill, { opacity: pressed ? Opacity.pressed : 1 }]}
          >
            <IconSymbol name="xmark" size={IconSize.lg} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }} />
          <View style={styles.headerActions}>
            {canSave && (
              <Pressable
                onPress={handleBookmark}
                hitSlop={8}
                style={({ pressed }) => [styles.iconPill, { opacity: pressed ? Opacity.pressed : 1 }]}
              >
                <IconSymbol
                  name={isSaved ? 'bookmark.fill' : 'bookmark'}
                  size={IconSize.lg}
                  color="#fff"
                />
              </Pressable>
            )}
            <Pressable
              onPress={capture}
              disabled={isSharing}
              hitSlop={8}
              style={({ pressed }) => [styles.iconPill, { opacity: pressed || isSharing ? Opacity.pressed : 1 }]}
            >
              <IconSymbol name="square.and.arrow.up" size={IconSize.lg} color="#fff" />
            </Pressable>
            {!isOwner && (
              <Pressable
                onPress={handleModeration}
                disabled={isReporting}
                hitSlop={8}
                style={({ pressed }) => [styles.iconPill, { opacity: pressed || isReporting ? Opacity.pressed : 1 }]}
              >
                <IconSymbol name="flag.fill" size={IconSize.lg} color="#fff" />
              </Pressable>
            )}
            {isOwner && onEdit && !pin.originalPinId && (
              <Pressable
                onPress={() => { haptics.light(); onEdit(pin); }}
                hitSlop={8}
                style={({ pressed }) => [styles.iconPill, { opacity: pressed ? Opacity.pressed : 1 }]}
              >
                <IconSymbol name="pencil" size={IconSize.lg} color="#fff" />
              </Pressable>
            )}
            {isOwner && (
              <Pressable
                onPress={handleDelete}
                disabled={isDeleting}
                hitSlop={8}
                style={({ pressed }) => [styles.iconPill, { opacity: pressed || isDeleting ? Opacity.pressed : 1 }]}
              >
                <IconSymbol name="trash.fill" size={IconSize.lg} color="#fff" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Bottom glass overlay */}
        <View style={[styles.bottomOverlay, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <View style={styles.bottomRow}>
            {/* Author pill */}
            <Pressable
              onPress={() => {
                if (!canViewProfile) return;
                haptics.light();
                onClose();
                router.push(`/user-profile/${pin.userId}`);
              }}
              disabled={!canViewProfile}
              style={({ pressed }) => ({ opacity: pressed && canViewProfile ? Opacity.pressed : 1 })}
            >
              <GlassControl style={styles.authorPill} glassStyle="clear">
                {!isAnonymousAuthor && pin.avatarUrl ? (
                  <Image
                    source={{ uri: pin.avatarUrl }}
                    style={styles.authorAvatarImage}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View style={[styles.authorAvatar, { backgroundColor: isAnonymousAuthor ? colors.muted : colors.primary }]}>
                    <ThemedText style={styles.authorInitial} color={isAnonymousAuthor ? colors.mutedForeground : colors.primaryForeground}>
                      {isAnonymousAuthor ? '?' : pin.avatarInitial}
                    </ThemedText>
                  </View>
                )}
                <ThemedText style={styles.authorName} color={hasImage ? '#fff' : colors.foreground}>
                  {isAnonymousAuthor ? 'Anonymous Dreamer' : (pin.displayName ?? pin.username)}
                </ThemedText>
              </GlassControl>
            </Pressable>

            {/* Category pill */}
            {categoryInfo && (
              <GlassControl style={styles.categoryPill} glassStyle="clear">
                <ThemedText style={styles.categoryText} color={hasImage ? '#fff' : categoryInfo.color}>
                  {categoryInfo.label}
                </ThemedText>
              </GlassControl>
            )}
          </View>

          {/* Title + description */}
          {(pin.title || pin.description) && (
            <View style={styles.textOverlay}>
              {pin.title && (
                <ThemedText style={styles.title} color="#fff">
                  {pin.title}
                </ThemedText>
              )}
              {pin.description && (
                <ThemedText style={styles.description} color="rgba(255,255,255,0.8)" numberOfLines={3}>
                  {pin.description}
                </ThemedText>
              )}
            </View>
          )}

          {/* Tags */}
          {pin.tags && pin.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {pin.tags.map((tag) => (
                <GlassControl key={tag} style={styles.tagPill} glassStyle="clear">
                  <ThemedText style={styles.tagText} color={hasImage ? 'rgba(255,255,255,0.9)' : colors.mutedForeground}>
                    #{tag}
                  </ThemedText>
                </GlassControl>
              ))}
            </View>
          )}

          {/* Saved from Community link */}
          {pin.originalPinId && onViewOriginal && (
            <Pressable
              onPress={() => { haptics.light(); onViewOriginal(pin.originalPinId!); }}
              style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1 })}
            >
              <GlassControl style={styles.savedFromPill} glassStyle="clear">
                <IconSymbol name="bookmark.fill" size={IconSize.sm} color="rgba(255,255,255,0.9)" />
                <ThemedText style={styles.savedFromText} color="rgba(255,255,255,0.9)">
                  Saved from Community
                </ThemedText>
                <IconSymbol name="chevron.right" size={IconSize.sm} color="rgba(255,255,255,0.6)" />
              </GlassControl>
            </Pressable>
          )}
        </View>

        {/* Off-screen share card */}
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }} style={{ position: "absolute", left: -9999 }}>
          <PinShareCard
            title={pin.title}
            description={pin.description}
            category={pin.category}
            customCategoryName={pin.customCategoryName}
            imageUrl={pin.imageUrl}
            tags={pin.tags}
            username={pin.username}
            displayName={pin.displayName}
            handle={user?.displayName ?? user?.name ?? undefined}
          />
        </ViewShot>

        {/* Board picker — rendered inside the fullScreen modal so it appears on top */}
        {canSave && (
          <SaveToBoardModal
            visible={showBoardPicker}
            onClose={() => setShowBoardPicker(false)}
            boards={boards!}
            onSelect={(boardId) => {
              setShowBoardPicker(false);
              onSaveToBoard!(pin._id, boardId);
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const ICON_PILL_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Scrims
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  bottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
  },
  // Floating header
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconPill: {
    width: ICON_PILL_SIZE,
    height: ICON_PILL_SIZE,
    borderRadius: ICON_PILL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  // Bottom overlay
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  // Author pill
  authorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.xs,
    paddingRight: Spacing.lg,
    borderRadius: Radius.full,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  authorInitial: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  authorName: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  // Category pill
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  // Text
  textOverlay: {
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize['5xl'],
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: FontSize.base,
    lineHeight: 20,
  },
  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tagPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: FontSize.sm,
  },
  // Saved from community
  savedFromPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    borderRadius: Radius.full,
  },
  savedFromText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
