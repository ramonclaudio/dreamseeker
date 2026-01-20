import { Linking, Pressable, ScrollView, View, Text } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  colors: (typeof Colors)['light'];
}) {
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconSymbol name={icon} size={22} color={colors.mutedForeground} />
        <Text style={{ fontSize: 16, color: colors.text }}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {value && (
          <Text selectable style={{ fontSize: 16, color: colors.mutedForeground }}>
            {value}
          </Text>
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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

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
        <Text style={[sectionTitleStyle, { color: colors.mutedForeground }]}>
          App
        </Text>
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
        <Text style={[sectionTitleStyle, { color: colors.mutedForeground }]}>
          Device
        </Text>
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
        <Text style={[sectionTitleStyle, { color: colors.mutedForeground }]}>
          Links
        </Text>
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
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
              © Copyright 2026 | All rights reserved.
            </Text>
          </View>
        </GlassCard>
      </View>
    </ScrollView>
  );
}
