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
import { YouAndGoalsSlide } from '@/components/onboarding/you-and-goals-slide';
import { DreamTitleSlide } from '@/components/onboarding/dream-title-slide';
import { NotificationsSlide } from '@/components/onboarding/notifications-slide';
import { CelebrationSlide } from '@/components/onboarding/celebration-slide';

const NOTIFICATIONS_SLIDE = 3;
const CELEBRATION_SLIDE = 4;

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
        return (
          <YouAndGoalsSlide
            colors={colors}
            selectedPersonality={state.personality}
            onSelectPersonality={(p) => updateField('personality', p)}
            selectedMotivations={state.motivations}
            onToggleMotivation={toggleMotivation}
            selectedCategories={state.selectedCategories}
            onToggleCategory={toggleCategory}
          />
        );
      case 2:
        return (
          <DreamTitleSlide
            colors={colors}
            title={state.dreamTitle}
            onChangeTitle={(t) => updateField('dreamTitle', t)}
            selectedCategory={state.dreamCategory}
            selectedCategories={state.selectedCategories}
            whyItMatters={state.whyItMatters}
            onChangeWhyItMatters={(t) => updateField('whyItMatters', t)}
          />
        );
      case 3:
        return (
          <NotificationsSlide
            colors={colors}
            time={state.notificationTime}
            onSelectTime={() => setShowTimePicker(true)}
            onSkip={() => updateField('notificationTime', null)}
          />
        );
      case 4:
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
      behavior="padding"
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
