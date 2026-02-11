import { View, ScrollView, KeyboardAvoidingView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { ProgressDots } from '@/components/ui/progress-dots';
import { NavigationButtons } from '@/components/ui/navigation-buttons';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { haptics } from '@/lib/haptics';
import { Spacing, MaxWidth } from '@/constants/layout';

import { NameSlide } from '@/components/onboarding/welcome-slide';
import { SendOffSlide } from '@/components/onboarding/dream-title-slide';

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const skipOnboarding = useMutation(api.userPreferences.skipOnboarding);

  const {
    currentSlide,
    totalSlides,
    state,
    isSubmitting,
    error,
    canGoNext,
    canGoBack,
    goNext,
    goBack,
    updateField,
    finish,
  } = useOnboarding();

  const isLastSlide = currentSlide === totalSlides - 1;

  const handleContinue = async () => {
    if (isLastSlide) {
      const success = await finish();
      if (success) {
        router.replace('/(app)/(tabs)/today');
      }
    } else {
      haptics.light();
      goNext();
    }
  };

  const handleBack = () => {
    haptics.light();
    goBack();
  };

  const handleSkip = async () => {
    haptics.light();
    await skipOnboarding();
    await AsyncStorage.removeItem('@onboarding_state').catch(() => {});
    router.replace('/(app)/(tabs)/today');
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return (
          <NameSlide
            colors={colors}
            displayName={state.displayName}
            onChangeName={(t) => updateField('displayName', t)}
          />
        );
      case 1:
        return <SendOffSlide colors={colors} displayName={state.displayName} />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              paddingTop: Math.max(insets.top, Spacing.lg) + Spacing.md,
              paddingBottom: Spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: Spacing.xl,
            }}
          >
            <View style={{ flex: 1 }}>
              <ProgressDots total={totalSlides} current={currentSlide} />
            </View>
            {!isLastSlide && (
              <Pressable
                onPress={handleSkip}
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingLeft: Spacing.md })}
                accessibilityRole="button"
                accessibilityLabel="Skip onboarding"
              >
                <ThemedText style={{ fontSize: 15, fontWeight: '500' }} color={colors.mutedForeground}>
                  Skip
                </ThemedText>
              </Pressable>
            )}
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: Spacing.xl,
              paddingBottom: Spacing.xl,
              maxWidth: MaxWidth.content,
              alignSelf: 'center',
              width: '100%',
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {renderSlide()}
          </ScrollView>

          {error && (
            <ThemedText
              style={{
                color: colors.destructive,
                textAlign: 'center',
                marginBottom: Spacing.sm,
                paddingHorizontal: Spacing.xl,
              }}
            >
              {error}
            </ThemedText>
          )}

          <NavigationButtons
            onBack={canGoBack ? handleBack : undefined}
            onContinue={handleContinue}
            continueLabel={isLastSlide ? "Let's Go!" : 'Continue'}
            continueDisabled={!canGoNext}
            isLoading={isSubmitting}
            bottomInset={insets.bottom}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
