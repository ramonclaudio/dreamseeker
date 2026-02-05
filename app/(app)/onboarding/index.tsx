import { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ConfettiCannon from 'react-native-confetti-cannon';
import { router } from 'expo-router';

import { ProgressDots } from '@/components/ui/progress-dots';
import { NavigationButtons } from '@/components/ui/navigation-buttons';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { MaterialCard } from '@/components/ui/material-card';
import { GlassControl } from '@/components/ui/glass-control';
import { useColors } from '@/hooks/use-color-scheme';
import { useOnboarding, type Confidence, type Pace } from '@/hooks/use-onboarding';
import { haptics } from '@/lib/haptics';
import { Spacing, FontSize, IconSize, MaxWidth } from '@/constants/layout';
import { Radius } from '@/constants/theme';
import { Opacity, Confetti } from '@/constants/ui';
import { DREAM_CATEGORIES, DREAM_CATEGORY_LIST, type DreamCategory } from '@/constants/dreams';

const CATEGORY_ICONS: Record<DreamCategory, IconSymbolName> = {
  travel: 'airplane',
  money: 'creditcard.fill',
  career: 'briefcase.fill',
  lifestyle: 'house.fill',
  growth: 'leaf.fill',
  relationships: 'heart.fill',
};

const PACE_OPTIONS: { value: Pace; label: string; description: string }[] = [
  { value: 'gentle', label: 'Gentle', description: '1-2 actions per week' },
  { value: 'steady', label: 'Steady', description: '3-4 actions per week' },
  { value: 'ambitious', label: 'Ambitious', description: '5+ actions per week' },
];

const CONFIDENCE_OPTIONS: { value: Confidence; label: string }[] = [
  { value: 'confident', label: "I'm confident I can do this" },
  { value: 'somewhat', label: "I'm somewhat confident" },
  { value: 'not-confident', label: "I'm not confident yet" },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const confettiRef = useRef<ConfettiCannon>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const {
    currentSlide,
    totalSlides,
    state,
    isSubmitting,
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

  const handleContinue = async () => {
    if (currentSlide === totalSlides - 1) {
      // Final slide - finish onboarding
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
      // Trigger confetti on celebration slide
      if (currentSlide === 8) {
        setTimeout(() => confettiRef.current?.start(), 300);
      }
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
    if (currentSlide === 8 && !state.notificationTime) return 'Skip';
    return 'Continue';
  };

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={{ flex: 1 }}>
        {/* Progress dots */}
        <View style={{ paddingTop: Spacing['4xl'], paddingBottom: Spacing.lg }}>
          <ProgressDots total={totalSlides} current={currentSlide} />
        </View>

        {/* Slide content */}
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

        {/* Navigation */}
        <NavigationButtons
          onBack={canGoBack ? handleBack : undefined}
          onContinue={handleContinue}
          showBack={currentSlide > 0 && currentSlide < totalSlides - 1}
          continueLabel={getContinueLabel()}
          continueDisabled={!canGoNext}
          isLoading={isSubmitting}
        />
      </View>

      {/* Time picker modal */}
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

      {/* Confetti for celebration */}
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

// Slide Components

function WelcomeSlide({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing['2xl'] }}>
      <Image
        source={require('@/assets/image-0.webp')}
        style={{ width: 200, height: 200, borderRadius: Radius['2xl'] }}
        resizeMode="cover"
      />
      <View style={{ gap: Spacing.md, alignItems: 'center' }}>
        <ThemedText variant="title" style={{ textAlign: 'center' }}>
          Ready to go from dreaming to doing?
        </ThemedText>
        <ThemedText
          style={{ textAlign: 'center', fontSize: FontSize['2xl'] }}
          color={colors.mutedForeground}
        >
          DreamSeeker helps ambitious women turn big dreams into daily actions.
        </ThemedText>
      </View>
    </View>
  );
}

function MeetGabbySlide({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing['2xl'] }}>
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.secondary,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Image
          source={require('@/assets/image-1.webp')}
          style={{ width: 120, height: 120 }}
          resizeMode="cover"
        />
      </View>
      <View style={{ gap: Spacing.md }}>
        <ThemedText variant="title" style={{ textAlign: 'center' }}>
          Meet Gabby
        </ThemedText>
        <MaterialCard style={{ padding: Spacing.lg }}>
          <ThemedText
            style={{ textAlign: 'center', fontSize: FontSize.lg, fontStyle: 'italic' }}
          >
            &quot;Hi, I&apos;m Gabby. I built this app for women like you—smart, ambitious women who
            want to live big, bold lives of adventure.&quot;
          </ThemedText>
        </MaterialCard>
      </View>
    </View>
  );
}

function ProblemSlide({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing['2xl'] }}>
      <Image
        source={require('@/assets/image-2.webp')}
        style={{ width: 180, height: 180, borderRadius: Radius['2xl'] }}
        resizeMode="cover"
      />
      <View style={{ gap: Spacing.lg }}>
        <ThemedText variant="title" style={{ textAlign: 'center' }}>
          The Gap
        </ThemedText>
        <MaterialCard style={{ padding: Spacing.lg }}>
          <ThemedText
            style={{ textAlign: 'center', fontSize: FontSize.lg, fontStyle: 'italic' }}
          >
            &quot;There&apos;s a massive gap between inspiration and action. Sometimes we get stuck
            waiting for permission... waiting to feel confident... waiting for a sign.&quot;
          </ThemedText>
        </MaterialCard>
        <ThemedText
          style={{ textAlign: 'center', fontSize: FontSize.lg }}
          color={colors.mutedForeground}
        >
          DreamSeeker bridges that gap with small, daily actions that build unstoppable momentum.
        </ThemedText>
      </View>
    </View>
  );
}

function CategoriesSlide({
  colors,
  selectedCategories,
  onToggle,
}: {
  colors: ReturnType<typeof useColors>;
  selectedCategories: DreamCategory[];
  onToggle: (category: DreamCategory) => void;
}) {
  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">What are you seeking?</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Select the categories that resonate with your dreams.
        </ThemedText>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: Spacing.md,
        }}
      >
        {DREAM_CATEGORY_LIST.map((category) => {
          const config = DREAM_CATEGORIES[category];
          const isSelected = selectedCategories.includes(category);

          return (
            <Pressable
              key={category}
              onPress={() => {
                haptics.selection();
                onToggle(category);
              }}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: '45%',
                opacity: pressed ? Opacity.pressed : 1,
              })}
            >
              <MaterialCard
                style={{
                  padding: Spacing.lg,
                  alignItems: 'center',
                  gap: Spacing.sm,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? config.color : colors.border,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isSelected ? config.color : `${config.color}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconSymbol
                    name={CATEGORY_ICONS[category]}
                    size={IconSize['3xl']}
                    color={isSelected ? '#fff' : config.color}
                  />
                </View>
                <ThemedText style={{ fontSize: FontSize.lg, fontWeight: '600' }}>
                  {config.label}
                </ThemedText>
              </MaterialCard>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DreamTitleSlide({
  colors,
  title,
  onChangeTitle,
  selectedCategory,
  selectedCategories,
}: {
  colors: ReturnType<typeof useColors>;
  title: string;
  onChangeTitle: (text: string) => void;
  selectedCategory: DreamCategory;
  selectedCategories: DreamCategory[];
}) {
  const categoryToUse = selectedCategories.includes(selectedCategory)
    ? selectedCategory
    : selectedCategories[0] || 'growth';
  const config = DREAM_CATEGORIES[categoryToUse];

  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">What&apos;s your first dream?</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Start with something that excites you. You can always add more later.
        </ThemedText>
      </View>

      <View style={{ gap: Spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingVertical: Spacing.sm,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: `${config.color}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSymbol
              name={CATEGORY_ICONS[categoryToUse]}
              size={IconSize.lg}
              color={config.color}
            />
          </View>
          <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
            {config.label}
          </ThemedText>
        </View>

        <TextInput
          style={{
            backgroundColor: colors.secondary,
            borderRadius: Radius.md,
            padding: Spacing.lg,
            fontSize: FontSize.xl,
            color: colors.foreground,
            borderWidth: 1,
            borderColor: colors.border,
            minHeight: 60,
          }}
          placeholder="e.g., Visit Japan, Start a business..."
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={onChangeTitle}
          autoFocus
          multiline
          returnKeyType="done"
          blurOnSubmit
        />
      </View>
    </View>
  );
}

function WhyItMattersSlide({
  colors,
  text,
  onChangeText,
}: {
  colors: ReturnType<typeof useColors>;
  text: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">Why does this matter?</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Connect your dream to something deeper. This will fuel you when things get hard.
        </ThemedText>
      </View>

      <TextInput
        style={{
          backgroundColor: colors.secondary,
          borderRadius: Radius.md,
          padding: Spacing.lg,
          fontSize: FontSize.lg,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: colors.border,
          minHeight: 120,
          textAlignVertical: 'top',
        }}
        placeholder="Because it would prove to myself that..."
        placeholderTextColor={colors.mutedForeground}
        value={text}
        onChangeText={onChangeText}
        multiline
        autoFocus
      />

      <ThemedText style={{ fontSize: FontSize.sm }} color={colors.mutedForeground}>
        Optional, but powerful.
      </ThemedText>
    </View>
  );
}

function ConfidenceSlide({
  colors,
  selected,
  onSelect,
}: {
  colors: ReturnType<typeof useColors>;
  selected: Confidence | null;
  onSelect: (confidence: Confidence) => void;
}) {
  const getGabbyResponse = () => {
    switch (selected) {
      case 'confident':
        return "That's the energy! Channel that confidence into action.";
      case 'somewhat':
        return "That's honest. Confidence grows with every small win.";
      case 'not-confident':
        return "Perfect. Be confident. Be delusional. And if you're not there yet—borrow some of the delusional confidence that I have in you until you're able to fully rise.";
      default:
        return null;
    }
  };

  const response = getGabbyResponse();

  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">How confident are you?</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          Be honest. There&apos;s no wrong answer here.
        </ThemedText>
      </View>

      <View style={{ gap: Spacing.md }}>
        {CONFIDENCE_OPTIONS.map((option) => {
          const isSelected = selected === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => {
                haptics.selection();
                onSelect(option.value);
              }}
              style={({ pressed }) => ({
                opacity: pressed ? Opacity.pressed : 1,
              })}
            >
              <MaterialCard
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.md,
                  padding: Spacing.lg,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.accentBlue : colors.border,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.accentBlue : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: colors.accentBlue,
                      }}
                    />
                  )}
                </View>
                <ThemedText style={{ fontSize: FontSize.lg, flex: 1 }}>
                  {option.label}
                </ThemedText>
              </MaterialCard>
            </Pressable>
          );
        })}
      </View>

      {response && (
        <MaterialCard style={{ padding: Spacing.lg }}>
          <ThemedText
            style={{ fontSize: FontSize.lg, fontStyle: 'italic', textAlign: 'center' }}
          >
            &quot;{response}&quot;
          </ThemedText>
          <ThemedText
            style={{ fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.sm }}
            color={colors.mutedForeground}
          >
            — Gabby
          </ThemedText>
        </MaterialCard>
      )}
    </View>
  );
}

function PaceSlide({
  colors,
  selected,
  onSelect,
}: {
  colors: ReturnType<typeof useColors>;
  selected: Pace | null;
  onSelect: (pace: Pace) => void;
}) {
  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">Choose your pace</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          How quickly do you want to move toward your dreams?
        </ThemedText>
      </View>

      <View style={{ gap: Spacing.md }}>
        {PACE_OPTIONS.map((option) => {
          const isSelected = selected === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => {
                haptics.selection();
                onSelect(option.value);
              }}
              style={({ pressed }) => ({
                opacity: pressed ? Opacity.pressed : 1,
              })}
            >
              <MaterialCard
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.md,
                  padding: Spacing.lg,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.accentBlue : colors.border,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.accentBlue : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: colors.accentBlue,
                      }}
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: FontSize.lg, fontWeight: '600' }}>
                    {option.label}
                  </ThemedText>
                  <ThemedText style={{ fontSize: FontSize.base }} color={colors.mutedForeground}>
                    {option.description}
                  </ThemedText>
                </View>
              </MaterialCard>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function NotificationsSlide({
  colors,
  time,
  onSelectTime,
  onSkip,
}: {
  colors: ReturnType<typeof useColors>;
  time: string | null;
  onSelectTime: () => void;
  onSkip: () => void;
}) {
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <View style={{ flex: 1, gap: Spacing.xl }}>
      <View style={{ gap: Spacing.sm }}>
        <ThemedText variant="title">Daily reminders</ThemedText>
        <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
          When do you want to be reminded to take action on your dreams?
        </ThemedText>
      </View>

      <Pressable
        onPress={onSelectTime}
        style={({ pressed }) => ({
          opacity: pressed ? Opacity.pressed : 1,
        })}
      >
        <GlassControl
          isInteractive
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: Spacing.lg,
            borderRadius: Radius.lg,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <IconSymbol name="bell.fill" size={IconSize.xl} color={colors.primary} />
            <ThemedText style={{ fontSize: FontSize.lg }}>Notification Time</ThemedText>
          </View>
          <ThemedText style={{ fontSize: FontSize.lg }} color={colors.mutedForeground}>
            {time ? formatTime(time) : 'Not set'}
          </ThemedText>
        </GlassControl>
      </Pressable>

      {time && (
        <Pressable
          onPress={onSkip}
          style={({ pressed }) => ({
            opacity: pressed ? Opacity.pressed : 1,
            alignSelf: 'center',
          })}
        >
          <ThemedText color={colors.mutedForeground}>Clear time</ThemedText>
        </Pressable>
      )}

      <ThemedText
        style={{ fontSize: FontSize.sm, textAlign: 'center' }}
        color={colors.mutedForeground}
      >
        You can change this later in Settings.
      </ThemedText>
    </View>
  );
}

function CelebrationSlide({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing['2xl'] }}>
      <Image
        source={require('@/assets/image-6.webp')}
        style={{ width: 200, height: 200, borderRadius: Radius['2xl'] }}
        resizeMode="cover"
      />
      <View style={{ gap: Spacing.lg, alignItems: 'center' }}>
        <ThemedText variant="title" style={{ textAlign: 'center' }}>
          Welcome to DreamSeeker!
        </ThemedText>
        <MaterialCard style={{ padding: Spacing.lg }}>
          <ThemedText
            style={{ textAlign: 'center', fontSize: FontSize.lg, fontStyle: 'italic' }}
          >
            &quot;You just took your first step. You&apos;re no longer just dreaming—you&apos;re
            SEEKING. Seek risk. Seize opportunity. See the world.&quot;
          </ThemedText>
          <ThemedText
            style={{ fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.sm }}
            color={colors.mutedForeground}
          >
            — Gabby
          </ThemedText>
        </MaterialCard>
      </View>
    </View>
  );
}
