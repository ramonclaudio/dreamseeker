import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import { MaterialCard } from '@/components/ui/material-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';
import { FontSize, IconSize, MaxWidth, Spacing } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity } from '@/constants/ui';

const BANNER_BASE_HEIGHT = 160;
const AVATAR_SIZE = 72;
const AVATAR_BORDER = 3;

function ProfileAvatar({ name, image, size, colors }: { name: string; image?: string | null; size: number; colors: ReturnType<typeof useColors> }) {
  const initial = (name ?? '?').charAt(0).toUpperCase();

  if (image) {
    return (
      <View style={{ width: size + AVATAR_BORDER * 2, height: size + AVATAR_BORDER * 2, borderRadius: (size + AVATAR_BORDER * 2) / 2, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={{ uri: image }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  }

  return (
    <View style={{ width: size + AVATAR_BORDER * 2, height: size + AVATAR_BORDER * 2, borderRadius: (size + AVATAR_BORDER * 2) / 2, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText style={{ fontSize: size * 0.4, fontWeight: '700' }} color={colors.primaryForeground}>
          {initial}
        </ThemedText>
      </View>
    </View>
  );
}

function StatItem({ label, value, colors }: { label: string; value: string | number; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: Spacing.xs }}>
      <ThemedText style={{ fontSize: FontSize['3xl'], fontWeight: '700' }}>{String(value)}</ThemedText>
      <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>{label}</ThemedText>
    </View>
  );
}

function DreamRow({ dream, colors }: { dream: { title: string; category: string; status: string }; colors: ReturnType<typeof useColors> }) {
  const statusColor = dream.status === 'completed' ? colors.success : colors.primary;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md }}>
      <IconSymbol
        name={dream.status === 'completed' ? 'checkmark.circle.fill' : 'star.fill'}
        size={IconSize.xl}
        color={statusColor}
      />
      <View style={{ flex: 1, gap: Spacing.xxs }}>
        <ThemedText style={{ fontSize: FontSize.xl }}>{dream.title}</ThemedText>
        <ThemedText style={{ fontSize: FontSize.sm, textTransform: 'capitalize' }} color={colors.mutedForeground}>
          {dream.category}
        </ThemedText>
      </View>
      <View
        style={{
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xxs,
          borderRadius: Radius.full,
          backgroundColor: dream.status === 'completed' ? colors.successBackground : colors.secondary,
        }}
      >
        <ThemedText style={{ fontSize: FontSize.xs, fontWeight: '600', textTransform: 'capitalize' }} color={statusColor}>
          {dream.status}
        </ThemedText>
      </View>
    </View>
  );
}

function JournalRow({ entry, colors }: { entry: { title: string; date: string }; colors: ReturnType<typeof useColors> }) {
  const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md }}>
      <IconSymbol name="book.fill" size={IconSize.xl} color={colors.mutedForeground} />
      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontSize: FontSize.xl }}>{entry.title}</ThemedText>
      </View>
      <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>{formattedDate}</ThemedText>
    </View>
  );
}

function Divider({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <View style={{ height: 0.5, marginLeft: 50, backgroundColor: colors.border }} />;
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bannerHeight = BANNER_BASE_HEIGHT + insets.top;

  const currentUser = useQuery(api.auth.getCurrentUser);
  const isSelf = currentUser?._id === id;
  const publicProfile = useQuery(api.community.getPublicProfile, id ? { userId: id } : 'skip');
  const friendProfile = useQuery(api.community.getFriendProfile, !isSelf && id ? { friendId: id } : 'skip');
  const unfriend = useMutation(api.friends.unfriend);

  const isFriend = !isSelf && friendProfile !== null && friendProfile !== undefined;
  const profile = isFriend ? friendProfile.profile : publicProfile;
  const stats = isFriend ? friendProfile.stats : publicProfile?.stats;
  const bannerUrl = isFriend ? friendProfile.profile.bannerUrl : publicProfile?.bannerUrl;

  // For self-view, use the current user's image
  const avatarImage = isSelf ? currentUser?.image : null;

  if (publicProfile === undefined) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }}>
        <ThemedText style={{ fontSize: FontSize.xl, textAlign: 'center' }} color={colors.mutedForeground}>
          Profile not found
        </ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: Spacing.xl }}>
          <ThemedText style={{ fontWeight: '600' }} color={colors.primary}>Go Back</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  const displayName = profile.displayName ?? profile.username;
  const friendCount = 'friendCount' in profile ? (profile as { friendCount?: number }).friendCount ?? 0 : null;

  const handleUnfriend = () => {
    Alert.alert(
      'Unfriend',
      `Are you sure you want to remove ${displayName} as a friend?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfriend',
          style: 'destructive',
          onPress: async () => {
            haptics.warning();
            await unfriend({ friendId: id });
            router.back();
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: Spacing['4xl'],
          maxWidth: MaxWidth.content,
          alignSelf: 'center',
          width: '100%',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner + Close button */}
        <View style={{ height: bannerHeight, backgroundColor: colors.primary, overflow: 'hidden' }}>
          {bannerUrl && (
            <Image
              source={{ uri: bannerUrl }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              contentFit="cover"
              transition={200}
            />
          )}
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, right: 0 }}>
            <Pressable
              onPress={() => { haptics.light(); router.back(); }}
              style={({ pressed }) => ({
                opacity: pressed ? Opacity.pressed : 1,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(0,0,0,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: Spacing.lg,
                marginTop: Spacing.xs,
              })}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <IconSymbol name="xmark" size={IconSize.md} color="#fff" />
            </Pressable>
          </SafeAreaView>
        </View>

        {/* Avatar — overlapping the banner */}
        <View style={{ paddingHorizontal: Spacing.xl, marginTop: -(AVATAR_SIZE / 2) }}>
          <ProfileAvatar
            name={displayName}
            image={avatarImage}
            size={AVATAR_SIZE}
            colors={colors}
          />
        </View>

        {/* Name + Username + Bio */}
        <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, gap: Spacing.xxs }}>
          <ThemedText style={{ fontSize: FontSize['5xl'], fontWeight: '700' }}>
            {displayName}
          </ThemedText>
          <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
            @{profile.username}
          </ThemedText>
          {profile.bio ? (
            <ThemedText style={{ fontSize: FontSize.base, marginTop: Spacing.sm, lineHeight: 20 }}>
              {profile.bio}
            </ThemedText>
          ) : null}
        </View>

        {/* Friend count — Twitter-style inline */}
        {friendCount !== null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, marginTop: Spacing.md, gap: Spacing.xs }}>
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: '700' }}>
              {friendCount}
            </ThemedText>
            <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
              Friends
            </ThemedText>
          </View>
        )}

        {/* Stats row */}
        {stats && (
          <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing.xl }}>
            <MaterialCard style={{ borderRadius: Radius.lg, overflow: 'hidden' as const, borderCurve: 'continuous' as const }}>
              <View style={{ flexDirection: 'row', padding: Spacing.lg }}>
                <StatItem label="Level" value={stats.level} colors={colors} />
                <StatItem label="XP" value={stats.totalXp} colors={colors} />
                <StatItem label="Streak" value={stats.currentStreak} colors={colors} />
                <StatItem label="Dreams" value={stats.dreamsCompleted} colors={colors} />
              </View>
            </MaterialCard>
          </View>
        )}

        {/* Friend-only sections */}
        {isFriend && friendProfile.dreams.length > 0 && (
          <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing['2xl'], gap: Spacing.sm }}>
            <ThemedText
              style={{ fontSize: FontSize.md, fontWeight: '600', textTransform: 'uppercase', marginLeft: Spacing.xs }}
              color={colors.mutedForeground}
            >
              Dreams
            </ThemedText>
            <MaterialCard style={{ borderRadius: Radius.lg, overflow: 'hidden' as const, borderCurve: 'continuous' as const }}>
              {friendProfile.dreams.map((dream, i) => (
                <View key={dream._id}>
                  {i > 0 && <Divider colors={colors} />}
                  <DreamRow dream={dream} colors={colors} />
                </View>
              ))}
            </MaterialCard>
          </View>
        )}

        {isFriend && friendProfile.journals.length > 0 && (
          <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing['2xl'], gap: Spacing.sm }}>
            <ThemedText
              style={{ fontSize: FontSize.md, fontWeight: '600', textTransform: 'uppercase', marginLeft: Spacing.xs }}
              color={colors.mutedForeground}
            >
              Recent Journal
            </ThemedText>
            <MaterialCard style={{ borderRadius: Radius.lg, overflow: 'hidden' as const, borderCurve: 'continuous' as const }}>
              {friendProfile.journals.map((entry, i) => (
                <View key={entry._id}>
                  {i > 0 && <Divider colors={colors} />}
                  <JournalRow entry={entry} colors={colors} />
                </View>
              ))}
            </MaterialCard>
          </View>
        )}

        {/* Unfriend button */}
        {isFriend && !isSelf && (
          <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing['2xl'] }}>
            <Pressable
              onPress={handleUnfriend}
              style={({ pressed }) => ({
                opacity: pressed ? Opacity.pressed : 1,
                backgroundColor: colors.destructiveBackground,
                borderRadius: Radius.lg,
                borderCurve: 'continuous' as const,
                padding: Spacing.lg,
                alignItems: 'center',
              })}
              accessibilityRole="button"
              accessibilityLabel="Unfriend"
            >
              <ThemedText style={{ fontSize: FontSize.xl, fontWeight: '600' }} color={colors.destructive}>
                Unfriend
              </ThemedText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
