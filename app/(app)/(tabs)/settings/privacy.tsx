import { Linking, Pressable, ScrollView, View, Text } from 'react-native';

import { GlassCard } from '@/components/ui/glass-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { haptics } from '@/lib/haptics';

const dividerStyle = { height: 0.5, marginLeft: 50 };
const sectionStyle = { marginTop: 24, paddingHorizontal: 20 };
const sectionTitleStyle = { fontSize: 13, fontWeight: '500' as const, textTransform: 'uppercase' as const, marginBottom: 8, marginLeft: 4, opacity: 0.6 };
const cardStyle = { borderRadius: Radius.lg, borderCurve: 'continuous' as const, overflow: 'hidden' as const };

function PrivacyItem({ icon, label, description, onPress, colors }: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  description: string;
  onPress?: () => void;
  colors: (typeof Colors)['light'];
}) {
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <IconSymbol name={icon} size={22} color={colors.mutedForeground} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, color: colors.text }}>{label}</Text>
          <Text style={{ fontSize: 13, marginTop: 2, color: colors.mutedForeground }}>{description}</Text>
        </View>
      </View>
      {onPress && <IconSymbol name="chevron.right" size={16} color={colors.mutedForeground} />}
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

export default function PrivacyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
      contentInsetAdjustmentBehavior="automatic">
      <View style={sectionStyle}>
        <Text style={[sectionTitleStyle, { color: colors.mutedForeground }]}>Device Permissions</Text>
        <GlassCard style={cardStyle}>
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
        </GlassCard>
      </View>

      <View style={sectionStyle}>
        <Text style={[sectionTitleStyle, { color: colors.mutedForeground }]}>Data Collection</Text>
        <GlassCard style={cardStyle}>
          <PrivacyItem
            icon="person.fill"
            label="Account Data"
            description="Name, email, and profile information"
            colors={colors}
          />
          <View style={[dividerStyle, { backgroundColor: colors.border }]} />
          <PrivacyItem
            icon="checklist"
            label="Task Data"
            description="Your tasks and completion history"
            colors={colors}
          />
          <View style={[dividerStyle, { backgroundColor: colors.border }]} />
          <PrivacyItem
            icon="creditcard.fill"
            label="Payment Data"
            description="Handled securely by Stripe"
            colors={colors}
          />
        </GlassCard>
      </View>

      <View style={sectionStyle}>
        <Text style={[sectionTitleStyle, { color: colors.mutedForeground }]}>Your Rights</Text>
        <GlassCard style={cardStyle}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 14, lineHeight: 20, color: colors.mutedForeground }}>
              You can request a copy of your data or delete your account at any time from Settings → Delete Account.
              {'\n\n'}
              We do not sell your personal information to third parties.
            </Text>
          </View>
        </GlassCard>
      </View>
    </ScrollView>
  );
}
