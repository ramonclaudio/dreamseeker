import { useState, useRef, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import ConfettiCannon from 'react-native-confetti-cannon';
import { router } from 'expo-router';

import { ProgressDots } from '@/components/ui/progress-dots';
import { NavigationButtons } from '@/components/ui/navigation-buttons';
import { ThemedText } from '@/components/ui/themed-text';
import { useColors } from '@/hooks/use-color-scheme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { haptics } from '@/lib/haptics';
import { Spacing, MaxWidth, FontSize } from '@/constants/layout';
import { Confetti } from '@/constants/ui';

import { WelcomeSlide } from '@/components/onboarding/welcome-slide';
import { MeetGabbySlide } from '@/components/onboarding/meet-gabby-slide';
import { ProblemSlide } from '@/components/onboarding/problem-slide';
import { PersonalitySlide } from '@/components/onboarding/personality-slide';
import { MotivationSlide } from '@/components/onboarding/motivation-slide';
import { CategoriesSlide } from '@/components/onboarding/categories-slide';
import { DreamTitleSlide } from '@/components/onboarding/dream-title-slide';
import { WhyItMattersSlide } from '@/components/onboarding/why-it-matters-slide';
import { ConfidenceSlide } from '@/components/onboarding/confidence-slide';
import { PaceSlide } from '@/components/onboarding/pace-slide';
import { NotificationsSlide } from '@/components/onboarding/notifications-slide';
import { PremiumSlide } from '@/components/onboarding/premium-slide';
import { PersonalizingSlide } from '@/components/onboarding/personalizing-slide';
import { CelebrationSlide } from '@/components/onboarding/celebration-slide';

const PREMIUM_SLIDE = 10;
const NOTIFICATIONS_SLIDE = 11;
const PERSONALIZING_SLIDE = 12;
const CELEBRATION_SLIDE = 13;

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const confettiRef = useRef<ConfettiCannon>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showFallbackContinue, setShowFallbackContinue] = useState(false);
  const fallbackOpacity = useRef(new Animated.Value(0)).current;

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
    toggleCategory,
    updateField,
    toggleMotivation,
    finish,
  } = useOnboarding();

  useEffect(() => {
    if (currentSlide === CELEBRATION_SLIDE) {
      const timer = setTimeout(() => confettiRef.current?.start(), 300);
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);

  useEffect(() => {
    if (currentSlide !== PERSONALIZING_SLIDE) {
      setShowFallbackContinue(false);
      fallbackOpacity.setValue(0);
      return;
    }

    const timeout = setTimeout(() => {
      setShowFallbackContinue(true);
      Animated.timing(fallbackOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 6000);

    return () => clearTimeout(timeout);
  }, [currentSlide, fallbackOpacity]);

  const handleContinue = async () => {
    if (currentSlide === totalSlides - 1) {
      const success = await finish();
      if (success) {
        haptics.success();
        router.replace('/(app)/(tabs)/today');
      } else {
        haptics.error();
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

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return <WelcomeSlide colors={colors} />;
      case 1:
        return <MeetGabbySlide colors={colors} />;
      case 2:
        return <ProblemSlide colors={colors} />;
      case 3:
        return (
          <PersonalitySlide
            colors={colors}
            selected={state.personality}
            onSelect={(p) => updateField('personality', p)}
          />
        );
      case 4:
        return (
          <MotivationSlide
            colors={colors}
            selectedMotivations={state.motivations}
            onToggle={toggleMotivation}
          />
        );
      case 5:
        return (
          <CategoriesSlide
            colors={colors}
            selectedCategories={state.selectedCategories}
            onToggle={toggleCategory}
          />
        );
      case 6:
        return (
          <DreamTitleSlide
            colors={colors}
            title={state.dreamTitle}
            onChangeTitle={(t) => updateField('dreamTitle', t)}
            selectedCategory={state.dreamCategory}
            selectedCategories={state.selectedCategories}
          />
        );
      case 7:
        return (
          <WhyItMattersSlide
            colors={colors}
            text={state.whyItMatters}
            onChangeText={(t) => updateField('whyItMatters', t)}
          />
        );
      case 8:
        return (
          <ConfidenceSlide
            colors={colors}
            selected={state.confidence}
            onSelect={(c) => updateField('confidence', c)}
          />
        );
      case 9:
        return (
          <PaceSlide
            colors={colors}
            selected={state.pace}
            onSelect={(p) => updateField('pace', p)}
          />
        );
      case 10:
        return (
          <PremiumSlide
            colors={colors}
            bottomInset={insets.bottom}
            onContinue={handleContinue}
          />
        );
      case 11:
        return (
          <NotificationsSlide
            colors={colors}
            time={state.notificationTime}
            onSelectTime={() => setShowTimePicker(true)}
            onSkip={() => updateField('notificationTime', null)}
          />
        );
      case 12:
        return <PersonalizingSlide colors={colors} onComplete={goNext} />;
      case 13:
        return <CelebrationSlide colors={colors} />;
      default:
        return null;
    }
  };

  const getContinueLabel = () => {
    if (currentSlide === CELEBRATION_SLIDE) return "Let's Go!";
    if (currentSlide === NOTIFICATIONS_SLIDE && !state.notificationTime) return 'Skip';
    return 'Continue';
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ paddingTop: Math.max(insets.top, Spacing.lg) + Spacing.md, paddingBottom: Spacing.lg }}>
          <ProgressDots total={totalSlides} current={currentSlide} />
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

        {currentSlide !== PERSONALIZING_SLIDE && currentSlide !== PREMIUM_SLIDE && (
          <NavigationButtons
            onBack={canGoBack ? handleBack : undefined}
            onContinue={handleContinue}
            continueLabel={getContinueLabel()}
            continueDisabled={!canGoNext}
            isLoading={isSubmitting}
            bottomInset={insets.bottom}
          />
        )}

        {showFallbackContinue && currentSlide === PERSONALIZING_SLIDE && (
          <Animated.View style={{ opacity: fallbackOpacity, paddingBottom: Math.max(insets.bottom, Spacing.md) }}>
            <Pressable
              onPress={() => {
                setShowFallbackContinue(false);
                goNext();
              }}
              style={{ alignItems: 'center', paddingVertical: Spacing.md }}
              accessibilityRole="button"
              accessibilityLabel="Tap to continue"
            >
              <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
                Tap to continue
              </ThemedText>
            </Pressable>
          </Animated.View>
        )}
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={
            state.notificationTime
              ? new Date(`2000-01-01T${state.notificationTime}:00`)
              : new Date()
          }
          mode="time"
          display="spinner"
          onChange={(_, date) => {
            setShowTimePicker(false);
            if (date) {
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              updateField('notificationTime', `${hours}:${minutes}`);
            }
          }}
        />
      )}

      <ConfettiCannon
        ref={confettiRef}
        count={Confetti.count}
        origin={{ x: -20, y: 0 }}
        autoStart={false}
        fadeOut
        fallSpeed={Confetti.fallSpeed}
        explosionSpeed={Confetti.explosionSpeed}
        colors={Confetti.colors as unknown as string[]}
      />
    </KeyboardAvoidingView>
    </View>
  );
}
