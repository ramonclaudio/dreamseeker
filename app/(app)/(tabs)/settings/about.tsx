import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from "react-native";
import Constants from "expo-constants";
import * as Application from "expo-application";
import * as Device from "expo-device";

import { GlassCard } from "@/components/ui/glass-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Radius } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { haptics } from "@/lib/haptics";

function AboutItem({
  icon,
  label,
  value,
  onPress,
  colors,
}: {
  icon: Parameters<typeof IconSymbol>[0]["name"];
  label: string;
  value?: string;
  onPress?: () => void;
  colors: (typeof Colors)["light"];
}) {
  const content = (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <IconSymbol name={icon} size={22} color={colors.mutedForeground} />
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {value && (
          <Text style={[styles.itemValue, { color: colors.mutedForeground }]}>
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
        }}
      >
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
    "1.0.0";
  const buildNumber = Application.nativeBuildVersion ?? "1";

  const deviceInfo = Device.modelName
    ? `${Device.manufacturer ?? ""} ${Device.modelName}`.trim()
    : Platform.OS;

  const osVersion = Device.osVersion
    ? `${Platform.OS === "ios" ? "iOS" : "Android"} ${Device.osVersion}`
    : Platform.OS;

  const handleOpenGitHub = () => {
    Linking.openURL("https://github.com/ramonclaudio/expo-starter-app");
  };

  const handleOpenPrivacyPolicy = () => {
    Linking.openURL("https://ramonclaudio.com/privacy");
  };

  const handleOpenTerms = () => {
    Linking.openURL("https://ramonclaudio.com/terms");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          App
        </Text>
        <GlassCard style={styles.card}>
          <AboutItem
            icon="info.circle.fill"
            label="Version"
            value={`${appVersion} (${buildNumber})`}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <AboutItem
            icon="hammer.fill"
            label="Expo SDK"
            value={Constants.expoConfig?.sdkVersion ?? "Unknown"}
            colors={colors}
          />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Device
        </Text>
        <GlassCard style={styles.card}>
          <AboutItem
            icon="gear"
            label="Device"
            value={deviceInfo}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <AboutItem
            icon="gearshape.fill"
            label="OS"
            value={osVersion}
            colors={colors}
          />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Links
        </Text>
        <GlassCard style={styles.card}>
          <AboutItem
            icon="link"
            label="GitHub"
            onPress={handleOpenGitHub}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <AboutItem
            icon="doc.text.fill"
            label="Privacy Policy"
            onPress={handleOpenPrivacyPolicy}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <AboutItem
            icon="doc.plaintext.fill"
            label="Terms of Service"
            onPress={handleOpenTerms}
            colors={colors}
          />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <GlassCard style={styles.card}>
          <View style={styles.footerContainer}>
            <Text
              style={[styles.footerText, { color: colors.mutedForeground }]}
            >
              © Copyright 2026 | All rights reserved.
            </Text>
          </View>
        </GlassCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 100 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
    opacity: 0.6,
  },
  card: { borderRadius: Radius.lg, overflow: "hidden" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemLabel: { fontSize: 16 },
  itemValue: { fontSize: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 50 },
  footerContainer: { padding: 16, alignItems: "center" },
  footerText: { fontSize: 14 },
});
