import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useMutation, useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { MaterialCard } from '@/components/ui/material-card';
import { GlassSwitch } from '@/components/ui/glass-switch';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { Radius, type ColorPalette } from '@/constants/theme';
import { FontSize, IconSize, LineHeight, MaxWidth, Spacing, TouchTarget, TAB_BAR_HEIGHT } from '@/constants/layout';
import { Opacity, Size } from '@/constants/ui';
import { useColors } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';
import { DREAM_CATEGORIES } from '@/convex/constants';

const dividerStyle = { height: Size.divider, marginLeft: Size.dividerMargin };
const sectionStyle = { marginTop: Spacing['2xl'], paddingHorizontal: Spacing.xl, gap: Spacing.sm };
const sectionTitleStyle = { fontSize: FontSize.md, fontWeight: '500' as const, textTransform: 'uppercase' as const, marginLeft: Spacing.xs, opacity: 0.6 };
const cardStyle = { borderRadius: Radius.lg, borderCurve: 'continuous' as const, overflow: 'hidden' as const };

function PrivacyItem({ icon, label, description, onPress, colors }: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  description: string;
  onPress?: () => void;
  colors: ColorPalette;
}) {
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 }}>
        <IconSymbol name={icon} size={IconSize['2xl']} color={colors.mutedForeground} />
        <View style={{ flex: 1, gap: Spacing.xs / 2 }}>
          <ThemedText style={{ fontSize: FontSize.xl }}>{label}</ThemedText>
          <ThemedText style={{ fontSize: FontSize.md }} color={colors.mutedForeground}>{description}</ThemedText>
        </View>
      </View>
      {onPress && <IconSymbol name="chevron.right" size={IconSize.md} color={colors.mutedForeground} />}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => ({ opacity: pressed ? Opacity.pressed : 1, minHeight: TouchTarget.min })}
        onPress={() => {
          haptics.light();
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={description}>
        {content}
      </Pressable>
    );
  }

  return content;
}

function ToggleRow({ icon, label, description, value, onToggle, disabled, colors }: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
  colors: ColorPalette;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 }}>
        <IconSymbol name={icon} size={IconSize['2xl']} color={colors.mutedForeground} />
        <View style={{ flex: 1, gap: Spacing.xs / 2 }}>
          <ThemedText style={{ fontSize: FontSize.xl }}>{label}</ThemedText>
          <ThemedText style={{ fontSize: FontSize.md }} color={colors.mutedForeground}>{description}</ThemedText>
        </View>
      </View>
      <GlassSwitch value={value} onValueChange={onToggle} disabled={disabled} />
    </View>
  );
}

const CATEGORY_ENTRIES = Object.entries(DREAM_CATEGORIES) as [string, { label: string; icon: string }][];

export default function PrivacyScreen() {
  const colors = useColors();
  const getOrCreateProfile = useMutation(api.community.getOrCreateProfile);
  const updateProfile = useMutation(api.community.updateProfile);
  const hideCategoryMutation = useMutation(api.hiddenItems.hideCategory);
  const unhideCategoryMutation = useMutation(api.hiddenItems.unhideCategory);
  const hiddenCategories = useQuery(api.hiddenItems.listHiddenCategories);

  const [hideAll, setHideAll] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [defaultHideDreams, setDefaultHideDreams] = useState(false);
  const [defaultHideJournals, setDefaultHideJournals] = useState(false);
  const [defaultHideActions, setDefaultHideActions] = useState(false);

  useEffect(() => {
    getOrCreateProfile().then((profile) => {
      if (profile) {
        setHideAll(profile.hideAll ?? false);
        setDefaultHideDreams(profile.defaultHideDreams ?? false);
        setDefaultHideJournals(profile.defaultHideJournals ?? false);
        setDefaultHideActions(profile.defaultHideActions ?? false);
        setProfileLoaded(true);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleHideAll = async (value: boolean) => {
    haptics.light();
    setHideAll(value);
    try {
      await updateProfile({ hideAll: value });
    } catch {
      setHideAll(!value);
      haptics.error();
    }
  };

  const handleToggleDefault = async (
    field: 'defaultHideDreams' | 'defaultHideJournals' | 'defaultHideActions',
    value: boolean,
    setter: (v: boolean) => void
  ) => {
    haptics.light();
    setter(value);
    try {
      await updateProfile({ [field]: value });
    } catch {
      setter(!value);
      haptics.error();
    }
  };

  const handleToggleCategory = async (category: string, hide: boolean) => {
    haptics.light();
    try {
      if (hide) {
        await hideCategoryMutation({ category });
      } else {
        await unhideCategoryMutation({ category });
      }
    } catch {
      haptics.error();
    }
  };

  const hiddenSet = new Set(hiddenCategories ?? []);

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT, maxWidth: MaxWidth.content, alignSelf: 'center', width: '100%' }}
      contentInsetAdjustmentBehavior="automatic">
      {/* Visibility Controls */}
      <View style={sectionStyle}>
        <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>What Friends See</ThemedText>
        <MaterialCard style={cardStyle}>
          <ToggleRow
            icon="eye.slash.fill"
            label="Hide Everything"
            description="Friends see your profile but none of your activity"
            value={hideAll}
            onToggle={handleToggleHideAll}
            disabled={!profileLoaded}
            colors={colors}
          />
        </MaterialCard>
        {!hideAll && (
          <MaterialCard style={cardStyle}>
            <View style={{ padding: Spacing.lg, paddingBottom: Spacing.xs }}>
              <ThemedText style={{ fontSize: FontSize.md, fontWeight: '500' }} color={colors.mutedForeground}>
                Hide by category
              </ThemedText>
            </View>
            {CATEGORY_ENTRIES.map(([key, cat], index) => (
              <View key={key}>
                {index > 0 && <View style={[dividerStyle, { backgroundColor: colors.border }]} />}
                <ToggleRow
                  icon="eye.slash.fill"
                  label={cat.label}
                  description={`Hide all ${cat.label.toLowerCase()} from friends`}
                  value={hiddenSet.has(key)}
                  onToggle={(hide) => handleToggleCategory(key, hide)}
                  disabled={!profileLoaded}
                  colors={colors}
                />
              </View>
            ))}
            <View style={[dividerStyle, { backgroundColor: colors.border }]} />
            <ToggleRow
              icon="eye.slash.fill"
              label="Journal Entries"
              description="Hide all journal entries from friends"
              value={hiddenSet.has('journal')}
              onToggle={(hide) => handleToggleCategory('journal', hide)}
              disabled={!profileLoaded}
              colors={colors}
            />
          </MaterialCard>
        )}
      </View>

      {!hideAll && (
        <View style={sectionStyle}>
          <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>Default Visibility</ThemedText>
          <MaterialCard style={cardStyle}>
            <ToggleRow
              icon="lock.fill"
              label="New Dreams"
              description="New dreams are hidden from friends by default"
              value={defaultHideDreams}
              onToggle={(v) => handleToggleDefault('defaultHideDreams', v, setDefaultHideDreams)}
              disabled={!profileLoaded}
              colors={colors}
            />
            <View style={[dividerStyle, { backgroundColor: colors.border }]} />
            <ToggleRow
              icon="lock.fill"
              label="New Journals"
              description="New journal entries are hidden from friends by default"
              value={defaultHideJournals}
              onToggle={(v) => handleToggleDefault('defaultHideJournals', v, setDefaultHideJournals)}
              disabled={!profileLoaded}
              colors={colors}
            />
            <View style={[dividerStyle, { backgroundColor: colors.border }]} />
            <ToggleRow
              icon="lock.fill"
              label="New Actions"
              description="New actions are hidden from friends by default"
              value={defaultHideActions}
              onToggle={(v) => handleToggleDefault('defaultHideActions', v, setDefaultHideActions)}
              disabled={!profileLoaded}
              colors={colors}
            />
          </MaterialCard>
        </View>
      )}

      <View style={sectionStyle}>
        <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>Device Permissions</ThemedText>
        <MaterialCard style={cardStyle}>
          <PrivacyItem
            icon="camera.fill"
            label="Camera & Photos"
            description="Used for profile avatar"
            onPress={handleOpenSettings}
            colors={colors}
          />
          <View style={[dividerStyle, { backgroundColor: colors.border }]} />
          <PrivacyItem
            icon="bell.fill"
            label="Notifications"
            description="Push notification access"
            onPress={handleOpenSettings}
            colors={colors}
          />
        </MaterialCard>
      </View>

      <View style={sectionStyle}>
        <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>Data Collection</ThemedText>
        <MaterialCard style={cardStyle}>
          <PrivacyItem
            icon="person.fill"
            label="Account Data"
            description="Name, email, and profile information"
            colors={colors}
          />
          <View style={[dividerStyle, { backgroundColor: colors.border }]} />
          <PrivacyItem
            icon="checklist"
            label="Action Data"
            description="Your actions and completion history"
            colors={colors}
          />
        </MaterialCard>
      </View>

      <View style={sectionStyle}>
        <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>Your Rights</ThemedText>
        <MaterialCard style={cardStyle}>
          <View style={{ padding: Spacing.lg }}>
            <ThemedText style={{ fontSize: FontSize.base, lineHeight: LineHeight.base }} color={colors.mutedForeground}>
              You can request a copy of your data or delete your account at any time from Settings → Delete Account.
              {'\n\n'}
              Your personal information is never sold to third parties.
            </ThemedText>
          </View>
        </MaterialCard>
      </View>
    </ScrollView>
  );
}
