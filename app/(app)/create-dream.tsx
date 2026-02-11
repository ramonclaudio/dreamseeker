import { useEffect, useRef } from 'react';
import { View, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { router } from 'expo-router';

import { ProgressDots } from '@/components/ui/progress-dots';
import { NavigationButtons } from '@/components/ui/navigation-buttons';
import { ThemedText } from '@/components/ui/themed-text';
import { SentencePreview } from '@/components/create-dream/sentence-preview';
import {
  TitleStep,
  TimelineStep,
  WhyStep,
  CategoryStep,
  ActionsStep,
  CelebrationStep,
} from '@/components/create-dream/steps';
import { useColors } from '@/hooks/use-color-scheme';
import { useCreateDream } from '@/hooks/use-create-dream';
import { useSubscription } from '@/hooks/use-subscription';
import { haptics } from '@/lib/haptics';
import { Spacing, MaxWidth } from '@/constants/layout';
import { Confetti } from '@/constants/ui';
import { formatDuration } from '@/constants/dream-suggestions';

const CELEBRATION_STEP = 5;

export default function CreateDreamScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const confettiRef = useRef<ConfettiCannon>(null);
  const createdDreamId = useRef<string | null>(null);
  const { canCreateDream, showUpgrade } = useSubscription();

  // Redirect to paywall if at dream limit
  useEffect(() => {
    if (canCreateDream === false) {
      showUpgrade().then(() => router.back());
    }
  }, [canCreateDream, showUpgrade]);

  const {
    state,
    totalSteps,
    setTitle,
    setTargetDate,
    setWhyItMatters,
    setCategory,
    setCustomCategoryConfig,
    setActions,
    nextStep,
    prevStep,
    canGoNext,
    submit,
  } = useCreateDream();

  useEffect(() => {
    if (state.step === CELEBRATION_STEP) {
      const timer = setTimeout(() => confettiRef.current?.start(), 300);
      return () => clearTimeout(timer);
    }
  }, [state.step]);

  const handleContinue = async () => {
    if (state.step === CELEBRATION_STEP) {
      if (createdDreamId.current) {
        router.replace(`/(app)/dream/${createdDreamId.current}`);
      } else {
        router.replace('/(app)/(tabs)/(dreams)');
      }
      return;
    }

    if (state.step === 4) {
      const dreamId = await submit();
      if (dreamId) {
        createdDreamId.current = dreamId;
        haptics.success();
        nextStep();
      } else {
        haptics.error();
      }
      return;
    }

    haptics.light();
    nextStep();
  };

  const handleBack = () => {
    if (state.step === 0) {
      router.back();
      return;
    }
    haptics.light();
    prevStep();
  };

  const showPreview = state.step > 0 && state.step < CELEBRATION_STEP;

  const getContinueLabel = () => {
    if (state.step === CELEBRATION_STEP) return 'View My Dream';
    if (state.step === 4) return 'Create Dream';
    if (state.step === 2 && !state.targetDate) return 'Skip';
    if (state.step === 3 && !state.whyItMatters.trim()) return 'Skip';
    return 'Continue';
  };

  const renderStep = () => {
    switch (state.step) {
      case 0:
        return (
          <CategoryStep
            selected={state.category}
            onSelect={setCategory}
            customConfig={state.customCategoryConfig}
            onSelectCustom={setCustomCategoryConfig}
          />
        );
      case 1:
        return <TitleStep title={state.title} onChangeTitle={setTitle} category={state.category} />;
      case 2:
        return (
          <TimelineStep
            selected={state.targetDate}
            onSelect={setTargetDate}
            onSkip={() => { setTargetDate(null); haptics.light(); nextStep(); }}
          />
        );
      case 3:
        return <WhyStep whyItMatters={state.whyItMatters} onChangeText={setWhyItMatters} />;
      case 4:
        return (
          <ActionsStep
            actions={state.actions}
            onChange={setActions}
            category={state.category}
          />
        );
      case 5:
        return <CelebrationStep />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ paddingTop: Math.max(insets.top, Spacing.lg) + Spacing.md, paddingBottom: Spacing.lg }}>
          <ProgressDots total={totalSteps} current={state.step} />
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
            gap: Spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showPreview && (
            <SentencePreview
              title={state.title || undefined}
              targetDate={state.targetDate ? formatDuration(state.targetDate) : undefined}
              identity={state.whyItMatters || undefined}
              activeStep={state.step - 1}
            />
          )}

          {renderStep()}
        </ScrollView>

        {state.error && (
          <ThemedText
            style={{
              color: colors.destructive,
              textAlign: 'center',
              marginBottom: Spacing.sm,
              paddingHorizontal: Spacing.xl,
            }}
          >
            {state.error}
          </ThemedText>
        )}

        <NavigationButtons
          onBack={state.step < CELEBRATION_STEP ? handleBack : undefined}
          onContinue={handleContinue}
          continueLabel={getContinueLabel()}
          continueDisabled={!canGoNext}
          isLoading={state.isSubmitting}
          bottomInset={insets.bottom}
        />
      </View>

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
