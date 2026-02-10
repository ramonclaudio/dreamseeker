import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from 'convex/react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import { MaterialCard } from '@/components/ui/material-card';
import { PinCard } from '@/components/pins/pin-card';
import { PinDetailModal } from '@/components/pins/pin-detail-modal';
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
        <ThemedText style={{ fontSize: size * 0.36, fontWeight: '700', lineHeight: size * 0.42 }} color={colors.primaryForeground}>
          {initial}
        </ThemedText>
      </View>
    </View>
  );
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const bannerHeight = BANNER_BASE_HEIGHT + insets.top;

  const currentUser = useQuery(api.auth.getCurrentUser);
  const isSelf = currentUser?._id === id;
  const publicProfile = useQuery(api.community.getPublicProfile, id ? { userId: id } : 'skip');
  const userPins = useQuery(api.pins.getUserPins, id ? { userId: id } : 'skip');
  const [selectedPin, setSelectedPin] = useState<NonNullable<typeof userPins>[number] | null>(null);

  const profile = publicProfile;
  const bannerUrl = publicProfile?.bannerUrl;

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

  const isPrivate = !isSelf && profile.isPrivate;
  const displayName = profile.displayName ?? profile.username;
  // Use backend-resolved avatar for all users, fallback to current user's image for self
  const avatarImage = (!profile.isPrivate && 'avatarUrl' in profile ? profile.avatarUrl : null)
    ?? (isSelf ? currentUser?.image : null);
  const dreamingSince = !profile.isPrivate && 'createdAt' in profile
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

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
        <View style={{ paddingHorizontal: Spacing.xl, marginTop: -((AVATAR_SIZE + AVATAR_BORDER * 2) / 2) }}>
          <ProfileAvatar
            name={displayName}
            image={avatarImage}
            size={AVATAR_SIZE}
            colors={colors}
          />
        </View>

        {/* Name + Username */}
        <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, gap: Spacing.xxs }}>
          <ThemedText style={{ fontSize: FontSize['5xl'], fontWeight: '700' }}>
            {displayName}
          </ThemedText>
          <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
            @{profile.username}
          </ThemedText>
          {!isPrivate && profile.bio ? (
            <ThemedText style={{ fontSize: FontSize.base, marginTop: Spacing.sm, lineHeight: 20 }}>
              {profile.bio}
            </ThemedText>
          ) : null}
        </View>

        {/* Private profile notice — nothing else shown */}
        {isPrivate && (
          <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing.xl }}>
            <MaterialCard style={{ borderRadius: Radius.lg, overflow: 'hidden' as const, borderCurve: 'continuous' as const }}>
              <View style={{ padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm }}>
                <IconSymbol name="lock.fill" size={IconSize['3xl']} color={colors.mutedForeground} />
                <ThemedText style={{ fontSize: FontSize.xl, fontWeight: '600' }}>
                  Private Profile
                </ThemedText>
                <ThemedText style={{ fontSize: FontSize.base, textAlign: 'center' }} color={colors.mutedForeground}>
                  This dreamer prefers to keep their profile private.
                </ThemedText>
              </View>
            </MaterialCard>
          </View>
        )}

        {/* Dreaming since — only for public */}
        {!isPrivate && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, marginTop: Spacing.md, gap: Spacing.xs }}>
            <IconSymbol name="sparkles" size={IconSize.md} color={colors.mutedForeground} />
            <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
              Dreaming since {dreamingSince}
            </ThemedText>
          </View>
        )}

        {/* Community Pins — only for public profiles */}
        {!isPrivate && userPins && userPins.length > 0 && (() => {
          const gap = Spacing.sm;
          const contentWidth = Math.min(screenWidth, MaxWidth.content);
          const colWidth = (contentWidth - Spacing.xl * 2 - gap) / 2;
          const left: NonNullable<typeof userPins> = [];
          const right: NonNullable<typeof userPins> = [];
          let lh = 0;
          let rh = 0;
          for (const pin of userPins) {
            const h = (pin.imageAspectRatio ?? 1) * colWidth + (pin.title ? 40 : 0);
            if (lh <= rh) { left.push(pin); lh += h + gap; }
            else { right.push(pin); rh += h + gap; }
          }
          return (
            <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing['2xl'], gap: Spacing.sm }}>
              <ThemedText
                style={{ fontSize: FontSize.md, fontWeight: '600', textTransform: 'uppercase', marginLeft: Spacing.xs }}
                color={colors.mutedForeground}
              >
                Community Pins
              </ThemedText>
              <View style={{ flexDirection: 'row', gap }}>
                <View style={{ width: colWidth }}>
                  {left.map((pin) => (
                    <PinCard key={pin._id} pin={pin} columnWidth={colWidth} onPress={() => setSelectedPin(pin)} />
                  ))}
                </View>
                <View style={{ width: colWidth }}>
                  {right.map((pin) => (
                    <PinCard key={pin._id} pin={pin} columnWidth={colWidth} onPress={() => setSelectedPin(pin)} />
                  ))}
                </View>
              </View>
            </View>
          );
        })()}

      </ScrollView>

      <PinDetailModal
        pin={selectedPin}
        visible={!!selectedPin}
        onClose={() => setSelectedPin(null)}
        currentUserId={currentUser?._id}
      />
    </View>
  );
}
