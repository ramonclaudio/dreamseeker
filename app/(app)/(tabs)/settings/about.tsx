import { Linking, Pressable, ScrollView, View } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { Radius, type ColorPalette } from '@/constants/theme';
import { useColors } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';

const sectionStyle = { marginTop: 24, paddingHorizontal: 20, gap: 8 };
const sectionTitleStyle = { fontSize: 13, fontWeight: '500' as const, textTransform: 'uppercase' as const, marginLeft: 4, opacity: 0.6 };
const cardStyle = { borderRadius: Radius.lg, borderCurve: 'continuous' as const, overflow: 'hidden' as const };
const dividerStyle = { height: 0.5, marginLeft: 50 };

function AboutItem({
  icon,
  label,
  value,
  onPress,
  colors,
}: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  value?: string;
  onPress?: () => void;
  colors: ColorPalette;
}) {
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconSymbol name={icon} size={22} color={colors.mutedForeground} />
        <ThemedText style={{ fontSize: 16 }}>{label}</ThemedText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {value && (
          <ThemedText selectable style={{ fontSize: 16 }} color={colors.mutedForeground}>
            {value}
          </ThemedText>
        )}
        {onPress && (
          <IconSymbol
            name="chevron.right"
            size={16}
            color={colors.mutedForeground}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        onPress={() => {
          haptics.light();
          onPress();
        }}>
        {content}
      </Pressable>
    );
  }

  return content;
}

export default function AboutScreen() {
  const colors = useColors();

  const appVersion =
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    '1.0.0';
  const buildNumber = Application.nativeBuildVersion ?? '1';

  const deviceInfo = Device.modelName
    ? `${Device.manufacturer ?? ''} ${Device.modelName}`.trim()
    : process.env.EXPO_OS;

  const osVersion = Device.osVersion
    ? `${process.env.EXPO_OS === 'ios' ? 'iOS' : 'Android'} ${Device.osVersion}`
    : process.env.EXPO_OS;

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/ramonclaudio/expo-starter-app');
  };

  const handleOpenPrivacyPolicy = () => {
    Linking.openURL('https://ramonclaudio.com/privacy');
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://ramonclaudio.com/terms');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      contentInsetAdjustmentBehavior="automatic">
      <View style={sectionStyle}>
        <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>
          App
        </ThemedText>
        <GlassCard style={cardStyle}>
          <AboutItem
            icon="info.circle.fill"
            label="Version"
            value={`${appVersion} (${buildNumber})`}
            colors={colors}
          />
          <View style={[dividerStyle, { backgroundColor: colors.border }]} />
          <AboutItem
            icon="hammer.fill"
            label="Expo SDK"
            value={Constants.expoConfig?.sdkVersion ?? 'Unknown'}
            colors={colors}
          />
        </GlassCard>
      </View>

      <View style={sectionStyle}>
        <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>
          Device
        </ThemedText>
        <GlassCard style={cardStyle}>
          <AboutItem
            icon="gear"
            label="Device"
            value={deviceInfo}
            colors={colors}
          />
          <View style={[dividerStyle, { backgroundColor: colors.border }]} />
          <AboutItem
            icon="gearshape.fill"
            label="OS"
            value={osVersion}
            colors={colors}
          />
        </GlassCard>
      </View>

      <View style={sectionStyle}>
        <ThemedText style={sectionTitleStyle} color={colors.mutedForeground}>
          Links
        </ThemedText>
        <GlassCard style={cardStyle}>
          <AboutItem
            icon="link"
            label="GitHub"
            onPress={handleOpenGitHub}
            colors={colors}
          />
          <View style={[dividerStyle, { backgroundColor: colors.border }]} />
          <AboutItem
            icon="doc.text.fill"
            label="Privacy Policy"
            onPress={handleOpenPrivacyPolicy}
            colors={colors}
          />
          <View style={[dividerStyle, { backgroundColor: colors.border }]} />
          <AboutItem
            icon="doc.plaintext.fill"
            label="Terms of Service"
            onPress={handleOpenTerms}
            colors={colors}
          />
        </GlassCard>
      </View>

      <View style={sectionStyle}>
        <GlassCard style={cardStyle}>
          <View style={{ padding: 16, alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 14 }} color={colors.mutedForeground}>
              © Copyright 2026 | All rights reserved.
            </ThemedText>
          </View>
        </GlassCard>
      </View>
    </ScrollView>
  );
}
