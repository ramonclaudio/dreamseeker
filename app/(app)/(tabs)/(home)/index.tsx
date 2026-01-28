import { Image } from "expo-image";
import { View, Pressable, useWindowDimensions } from "react-native";
import { useQuery } from "convex/react";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/ui/themed-text";
import { Link } from "expo-router";
import { api } from "@/convex/_generated/api";
import { Colors } from "@/constants/theme";
import { Spacing, TouchTarget } from "@/constants/layout";
import { Responsive } from "@/constants/ui";

const stepContainerStyle = { gap: Spacing.sm, marginBottom: Spacing.sm };

const devToolsKey =
  process.env.EXPO_OS === "ios" ? "cmd + d" : process.env.EXPO_OS === "android" ? "cmd + m" : "F12";

export default function HomeScreen() {
  const user = useQuery(api.auth.getCurrentUser);
  const { width } = useWindowDimensions();
  // Responsive image: 70% of screen width, max 290pt
  const imageWidth = Math.min(
    Responsive.heroImage.maxWidth,
    width * Responsive.heroImage.screenRatio,
  );
  const imageHeight = imageWidth * Responsive.heroImage.aspectRatio; // Maintain aspect ratio

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: Colors.light.secondary, dark: Colors.dark.secondary }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={{
            height: imageHeight,
            width: imageWidth,
            bottom: 0,
            left: 0,
            position: "absolute",
          }}
          contentFit="contain"
        />
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
        <ThemedText variant="title">{user?.name ? `Hi, ${user.name}!` : "Welcome!"}</ThemedText>
        <HelloWave />
      </View>

      <View style={stepContainerStyle}>
        <ThemedText variant="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText variant="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see
          changes. Press <ThemedText variant="defaultSemiBold">{devToolsKey}</ThemedText> to open
          developer tools.
        </ThemedText>
      </View>
      <View style={stepContainerStyle}>
        {process.env.EXPO_OS === "ios" ? (
          <Link href="/modal">
            <Link.Trigger>
              <Pressable
                style={{ minHeight: TouchTarget.min, justifyContent: "center" }}
                accessibilityRole="link"
                accessibilityLabel="Step 2: Explore"
                accessibilityHint="Opens modal with more information"
              >
                <ThemedText variant="subtitle">Step 2: Explore</ThemedText>
              </Pressable>
            </Link.Trigger>
            <Link.Preview />
          </Link>
        ) : (
          <Link href="/modal" asChild>
            <Pressable
              style={{ minHeight: TouchTarget.min, justifyContent: "center" }}
              accessibilityRole="link"
              accessibilityLabel="Step 2: Explore"
              accessibilityHint="Opens modal with more information"
            >
              <ThemedText variant="subtitle">Step 2: Explore</ThemedText>
            </Pressable>
          </Link>
        )}
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </View>
      <View style={stepContainerStyle}>
        <ThemedText variant="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText variant="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{" "}
          <ThemedText variant="defaultSemiBold">app</ThemedText> directory. This will move the
          current <ThemedText variant="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText variant="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </View>
    </ParallaxScrollView>
  );
}
