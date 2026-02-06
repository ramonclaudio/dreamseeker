import { useState, useRef, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView } from 'react-native';
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
import { Spacing, MaxWidth } from '@/constants/layout';
import { Confetti } from '@/constants/ui';

import { WelcomeSlide } from '@/components/onboarding/welcome-slide';
import { MeetGabbySlide } from '@/components/onboarding/meet-gabby-slide';
import { ProblemSlide } from '@/components/onboarding/problem-slide';
import { CategoriesSlide } from '@/components/onboarding/categories-slide';
import { DreamTitleSlide } from '@/components/onboarding/dream-title-slide';
import { WhyItMattersSlide } from '@/components/onboarding/why-it-matters-slide';
import { ConfidenceSlide } from '@/components/onboarding/confidence-slide';
import { PaceSlide } from '@/components/onboarding/pace-slide';
import { NotificationsSlide } from '@/components/onboarding/notifications-slide';
import { CelebrationSlide } from '@/components/onboarding/celebration-slide';

const NOTIFICATIONS_SLIDE = 8;
const CELEBRATION_SLIDE = 9;

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const confettiRef = useRef<ConfettiCannon>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
    setDreamTitle,
    setWhyItMatters,
    setConfidence,
    setPace,
    setNotificationTime,
    finish,
  } = useOnboarding();

  useEffect(() => {
    if (currentSlide === CELEBRATION_SLIDE) {
      setTimeout(() => confettiRef.current?.start(), 300);
    }
  }, [currentSlide]);

  const handleContinue = async () => {
    if (currentSlide === totalSlides - 1) {
      const success = await finish();
      if (success) {
        haptics.success();
        router.replace('/(app)/(tabs)/(home)');
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
          <CategoriesSlide
            colors={colors}
            selectedCategories={state.selectedCategories}
            onToggle={toggleCategory}
          />
        );
      case 4:
        return (
          <DreamTitleSlide
            colors={colors}
            title={state.dreamTitle}
            onChangeTitle={setDreamTitle}
            selectedCategory={state.dreamCategory}
            selectedCategories={state.selectedCategories}
          />
        );
      case 5:
        return (
          <WhyItMattersSlide
            colors={colors}
            text={state.whyItMatters}
            onChangeText={setWhyItMatters}
          />
        );
      case 6:
        return (
          <ConfidenceSlide
            colors={colors}
            selected={state.confidence}
            onSelect={setConfidence}
          />
        );
      case 7:
        return (
          <PaceSlide
            colors={colors}
            selected={state.pace}
            onSelect={setPace}
          />
        );
      case 8:
        return (
          <NotificationsSlide
            colors={colors}
            time={state.notificationTime}
            onSelectTime={() => setShowTimePicker(true)}
            onSkip={() => setNotificationTime(null)}
          />
        );
      case 9:
        return <CelebrationSlide colors={colors} />;
      default:
        return null;
    }
  };

  const getContinueLabel = () => {
    if (currentSlide === totalSlides - 1) return "Let's Go!";
    if (currentSlide === NOTIFICATIONS_SLIDE && !state.notificationTime) return 'Skip';
    return 'Continue';
  };

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
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
              marginBottom: 8,
              paddingHorizontal: Spacing.xl,
            }}
          >
            {error}
          </ThemedText>
        )}

        <NavigationButtons
          onBack={canGoBack ? handleBack : undefined}
          onContinue={handleContinue}
          continueLabel={getContinueLabel()}
          continueDisabled={!canGoNext}
          isLoading={isSubmitting}
          bottomInset={insets.bottom}
        />
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
              setNotificationTime(`${hours}:${minutes}`);
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
      />
    </KeyboardAvoidingView>
  );
}
