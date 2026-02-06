import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

import { ThemedText } from "@/components/ui/themed-text";
import { type ColorPalette } from "@/constants/theme";
import { useColors } from "@/hooks/use-color-scheme";
import { Spacing, TouchTarget } from "@/constants/layout";

const ModalContent = ({ isPresented, colors }: { isPresented: boolean; colors: ColorPalette }) => (
  <View
    style={{
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: Spacing.xl,
      gap: Spacing.sm,
    }}
  >
    <ThemedText variant="title">Modal</ThemedText>
    <ThemedText style={{ textAlign: "center" }} color={colors.mutedForeground}>
      This modal uses a blur background on iOS and web.
    </ThemedText>
    <Link
      href={isPresented ? "../" : "/"}
      style={{
        marginTop: Spacing.md,
        paddingVertical: Spacing.lg,
        minHeight: TouchTarget.min,
        justifyContent: "center",
      }}
      accessibilityRole="link"
      accessibilityLabel={isPresented ? "Dismiss modal" : "Go to home screen"}
    >
      <ThemedText variant="link" color={colors.mutedForeground}>
        {isPresented ? "Dismiss" : "Go home"}
      </ThemedText>
    </Link>
  </View>
);

export default function ModalScreen() {
  const colors = useColors();
  const isPresented = router.canGoBack();

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      <ModalContent isPresented={isPresented} colors={colors} />
      <StatusBar style={process.env.EXPO_OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
