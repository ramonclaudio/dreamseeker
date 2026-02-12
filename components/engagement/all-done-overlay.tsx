import { useEffect, useMemo, useRef } from "react";
import { View, Modal, StyleSheet, Animated, Pressable } from "react-native";
import ViewShot from "react-native-view-shot";

import { SvgGradientBg } from "@/components/ui/svg-gradient-bg";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useColors } from "@/hooks/use-color-scheme";
import { useShareCapture } from "@/hooks/use-share-capture";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { pickHype, Opacity } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";

type AllDoneOverlayProps = {
  visible: boolean;
  handle?: string;
  onDismiss: () => void;
};

export function AllDoneOverlay({ visible, handle, onDismiss }: AllDoneOverlayProps) {
  const colors = useColors();
  const { viewShotRef, capture, isSharing } = useShareCapture();
  const hypeText = useMemo(() => (visible ? pickHype('allDone') : ''), [visible]);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.8)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      overlayOpacity.setValue(0);
      contentOpacity.setValue(0);
      contentScale.setValue(0.8);
      iconScale.setValue(0);
      subtitleOpacity.setValue(0);

      // Double haptic hit for emphasis
      haptics.success();
      setTimeout(() => haptics.light(), 250);

      // First confetti burst immediately, second delayed for "encore"
      shootConfetti('medium');
      setTimeout(() => shootConfetti('small'), 600);

      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(contentScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(iconScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(overlayOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(contentOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => onDismiss());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, overlayOpacity, contentOpacity, contentScale, iconScale, subtitleOpacity, onDismiss]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" presentationStyle="overFullScreen" transparent onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, opacity: overlayOpacity }]} />
        <Animated.View style={[styles.content, { opacity: contentOpacity, transform: [{ scale: contentScale }] }]}>
          <Animated.View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20`, transform: [{ scale: iconScale }] }]}>
            <IconSymbol name="checkmark.circle.fill" size={IconSize["6xl"]} color={colors.primary} />
          </Animated.View>
          <ThemedText style={styles.title} color={colors.foreground}>{hypeText}</ThemedText>
          <Animated.View style={{ opacity: subtitleOpacity, alignItems: "center" }}>
            <ThemedText style={styles.gabbyQuote} color={colors.mutedForeground}>
              {"\"Go live your life.\""}
            </ThemedText>
            <ThemedText style={styles.gabbyAttribution} color={colors.mutedForeground}>
              {"— Gabby"}
            </ThemedText>
          </Animated.View>
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [styles.dismissButton, { backgroundColor: colors.surfaceTinted, opacity: pressed ? Opacity.pressed : 1 }]}
          >
            <ThemedText style={styles.dismissText} color={colors.primary}>Nice</ThemedText>
          </Pressable>

          {/* Share button */}
          <Pressable
            onPress={capture}
            disabled={isSharing}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, paddingVertical: Spacing.sm, alignItems: 'center' })}
          >
            <ThemedText style={{ fontSize: FontSize.base, fontWeight: '600' }} color={colors.primary}>
              Share
            </ThemedText>
          </Pressable>
        </Animated.View>
      </View>

      {/* Offscreen share card */}
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={{ position: 'absolute', left: -9999 }}>
        <AllDoneShareCard handle={handle} />
      </ViewShot>
    </Modal>
  );
}

const SHARE_CARD_WIDTH = 390;
const SHARE_CARD_HEIGHT = 700;

function AllDoneShareCard({ handle }: { handle?: string }) {
  return (
    <View style={shareStyles.card} collapsable={false}>
      <SvgGradientBg colors={['#E8A87C', '#E07B4F']} width={SHARE_CARD_WIDTH} height={SHARE_CARD_HEIGHT} direction="diagonal" />
      <View style={shareStyles.glassOverlay} />

      <View style={shareStyles.radialGlow} />

      <View style={[shareStyles.sparkle, { top: 80, right: 40 }]}>
        <IconSymbol name="checkmark.circle.fill" size={IconSize['2xl']} color="rgba(255,255,255,0.25)" />
      </View>
      <View style={[shareStyles.sparkle, { top: 140, left: 30 }]}>
        <IconSymbol name="sparkles" size={IconSize.lg} color="rgba(255,255,255,0.15)" />
      </View>

      <View style={shareStyles.spacer} />
      <View style={shareStyles.center}>
        <View style={shareStyles.iconRing}>
          <View style={shareStyles.iconContainer}>
            <IconSymbol name="checkmark.circle.fill" size={64} color="#fff" />
          </View>
        </View>
        <ThemedText style={shareStyles.label} color="rgba(255,255,255,0.7)">ALL DONE</ThemedText>
        <ThemedText style={shareStyles.title} color="#fff">{pickHype('allDone')}</ThemedText>
        <ThemedText style={shareStyles.subtitle} color="rgba(255,255,255,0.7)">Every action completed today</ThemedText>
      </View>
      <View style={shareStyles.footer}>
        <ThemedText style={shareStyles.handle} color="rgba(255,255,255,0.7)">@{handle || 'dreamseeker'}</ThemedText>
        <View style={shareStyles.brandRow}>
          <ThemedText style={shareStyles.brandName} color="rgba(255,255,255,0.5)">DreamSeeker</ThemedText>
          <View style={shareStyles.brandDot} />
          <ThemedText style={shareStyles.brandCreator} color="rgba(255,255,255,0.4)">@packslight</ThemedText>
        </View>
        <ThemedText style={shareStyles.cta} color="rgba(255,255,255,0.35)">Start seeking ✦ dreamseekerapp.com</ThemedText>
      </View>
    </View>
  );
}

const shareStyles = StyleSheet.create({
  card: { width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT, overflow: 'hidden', padding: Spacing.xl },
  glassOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.04)' },
  radialGlow: { position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,215,0,0.10)' },
  sparkle: { position: 'absolute' },
  spacer: { flex: 1 },
  center: { alignItems: 'center', gap: Spacing.sm },
  iconRing: { width: 130, height: 130, borderRadius: 65, borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  iconContainer: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: FontSize.base, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  title: { fontSize: FontSize['5xl'], fontWeight: '800', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  subtitle: { fontSize: FontSize.base, textAlign: 'center', lineHeight: 20 },
  xpChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, marginTop: Spacing.md, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  xpText: { fontSize: FontSize.lg, fontWeight: '700' },
  footer: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', gap: 3 },
  handle: { fontSize: FontSize.base, fontWeight: '500' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  brandName: { fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 0.5 },
  brandDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.3)' },
  brandCreator: { fontSize: FontSize.sm, fontWeight: '500' },
  cta: { fontSize: FontSize.xs, fontWeight: '500' },
});

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  content: { alignItems: "center", gap: Spacing.lg },
  iconContainer: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  title: { fontSize: FontSize["5xl"], fontWeight: "800", letterSpacing: 1.5, textAlign: "center", textTransform: "uppercase" },
  gabbyQuote: { fontSize: FontSize.xl, fontStyle: "italic", textAlign: "center" },
  gabbyAttribution: { fontSize: FontSize.base, fontWeight: "600", textAlign: "center", marginTop: Spacing.xxs },
  dismissButton: { paddingHorizontal: Spacing["2xl"], paddingVertical: Spacing.md, borderRadius: Radius.full, marginTop: Spacing.md },
  dismissText: { fontSize: FontSize.lg, fontWeight: "700" },
});
