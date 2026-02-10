import { useEffect, useMemo, useRef } from "react";
import { View, Modal, StyleSheet, Animated, Pressable } from "react-native";
import ViewShot from "react-native-view-shot";

import { SvgGradientBg } from "@/components/ui/svg-gradient-bg";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { GradientButton } from "@/components/ui/gradient-button";
import { useColors } from "@/hooks/use-color-scheme";
import { useShareCapture } from "@/hooks/use-share-capture";
import { Spacing, FontSize, IconSize } from "@/constants/layout";
import { Radius } from "@/constants/theme";
import { pickHype } from "@/constants/ui";
import { haptics } from "@/lib/haptics";
import { shootConfetti } from "@/lib/confetti";

type FirstActionModalProps = {
  visible: boolean;
  handle?: string;
  onDismiss: () => void;
};

const ANIMATION_DELAY = 100;

export function FirstActionModal({ visible, handle, onDismiss }: FirstActionModalProps) {
  const colors = useColors();
  const { viewShotRef, capture, isSharing } = useShareCapture();
  const hypeSubtitle = useMemo(() => (visible ? pickHype('firstAction') : ''), [visible]);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (visible) {
      overlayOpacity.setValue(0);
      iconScale.setValue(0);
      contentOpacity.setValue(0);
      contentTranslateY.setValue(10);
      haptics.success();

      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(ANIMATION_DELAY),
          Animated.spring(iconScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(ANIMATION_DELAY + 300),
          Animated.parallel([
            Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(contentTranslateY, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
          ]),
        ]),
      ]).start();

      setTimeout(() => shootConfetti('epic'), ANIMATION_DELAY + 200);
    }
  }, [visible, overlayOpacity, iconScale, contentOpacity, contentTranslateY]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" presentationStyle="overFullScreen" transparent onRequestClose={onDismiss}>
      <Animated.View style={[styles.overlay, { backgroundColor: colors.overlay, opacity: overlayOpacity }]}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Animated.View style={[styles.iconContainer, { backgroundColor: `${colors.gold}20`, transform: [{ scale: iconScale }] }]}>
            <IconSymbol name="flame.fill" size={IconSize["5xl"]} color={colors.gold} />
          </Animated.View>
          <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentTranslateY }], alignItems: "center", width: "100%" }}>
            <ThemedText variant="title" style={styles.title}>YOUR FIRST ACTION!</ThemedText>
            <ThemedText style={styles.hypeSubtitle} color={colors.gold}>{hypeSubtitle}</ThemedText>
            <ThemedText style={styles.gabbyQuote} color={colors.mutedForeground}>
              {"\"I do them before I feel them. Trust that the feelings will catch up.\""}
            </ThemedText>
            <ThemedText style={styles.gabbyAttribution} color={colors.mutedForeground}>
              {"— Gabby"}
            </ThemedText>
            <View style={[styles.xpChip, { backgroundColor: colors.surfaceTinted, borderColor: colors.borderAccent }]}>
              <IconSymbol name="bolt.fill" size={IconSize.lg} color={colors.gold} />
              <ThemedText style={styles.xpText}>+10 XP</ThemedText>
            </View>
            <GradientButton onPress={onDismiss} label="LET'S GOOO" style={styles.button} />

            {/* Share button */}
            <Pressable
              onPress={capture}
              disabled={isSharing}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, paddingVertical: Spacing.md, alignItems: 'center' })}
            >
              <ThemedText style={{ fontSize: FontSize.base, fontWeight: '600' }} color={colors.primary}>
                Share
              </ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Offscreen share card */}
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={{ position: 'absolute', left: -9999 }}>
        <FirstActionShareCard handle={handle} />
      </ViewShot>
    </Modal>
  );
}

const SHARE_CARD_WIDTH = 390;
const SHARE_CARD_HEIGHT = 700;

function FirstActionShareCard({ handle }: { handle?: string }) {
  return (
    <View style={shareStyles.card} collapsable={false}>
      <SvgGradientBg colors={['#E8A87C', '#E07B4F']} width={SHARE_CARD_WIDTH} height={SHARE_CARD_HEIGHT} direction="diagonal" />
      <View style={shareStyles.glassOverlay} />

      <View style={shareStyles.radialGlow} />

      <View style={[shareStyles.sparkle, { top: 80, right: 40 }]}>
        <IconSymbol name="flame.fill" size={IconSize['2xl']} color="rgba(255,255,255,0.25)" />
      </View>
      <View style={[shareStyles.sparkle, { top: 140, left: 30 }]}>
        <IconSymbol name="flame.fill" size={IconSize.lg} color="rgba(255,255,255,0.15)" />
      </View>

      <View style={shareStyles.spacer} />
      <View style={shareStyles.center}>
        <View style={shareStyles.iconRing}>
          <View style={shareStyles.iconContainer}>
            <IconSymbol name="flame.fill" size={64} color="#fff" />
          </View>
        </View>
        <ThemedText style={shareStyles.label} color="rgba(255,255,255,0.7)">FIRST ACTION</ThemedText>
        <ThemedText style={shareStyles.title} color="#fff">IT BEGINS NOW</ThemedText>
        <ThemedText style={shareStyles.hype} color="#FFD700">{pickHype('firstAction')}</ThemedText>
        <View style={shareStyles.xpChip}>
          <IconSymbol name="bolt.fill" size={IconSize.lg} color="#FFD700" />
          <ThemedText style={shareStyles.xpText} color="#fff">+10 XP</ThemedText>
        </View>
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
  hype: { fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
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
  card: { width: "100%", maxWidth: 320, borderRadius: Radius["2xl"], borderCurve: "continuous", padding: Spacing["2xl"], alignItems: "center" },
  iconContainer: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg },
  title: { textAlign: "center", marginBottom: Spacing.xs },
  hypeSubtitle: { fontSize: FontSize.lg, fontWeight: "700", letterSpacing: 1, textAlign: "center", marginBottom: Spacing.sm, textTransform: "uppercase" },
  xpChip: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, marginBottom: Spacing.xl },
  xpText: { fontSize: FontSize.base, fontWeight: "600" },
  gabbyQuote: { fontSize: FontSize.base, fontStyle: "italic", textAlign: "center", lineHeight: 22, marginBottom: Spacing.xs, paddingHorizontal: Spacing.sm },
  gabbyAttribution: { fontSize: FontSize.sm, fontWeight: "600", marginBottom: Spacing.lg },
  button: { width: "100%" },
});
