import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { DreamCategory } from '@/constants/dreams';

export type Pace = 'gentle' | 'steady' | 'ambitious';
export type Confidence = 'confident' | 'somewhat' | 'not-confident';

export interface OnboardingState {
  selectedCategories: DreamCategory[];
  dreamTitle: string;
  dreamCategory: DreamCategory;
  whyItMatters: string;
  confidence: Confidence | null;
  pace: Pace | null;
  notificationTime: string | null;
}

export interface UseOnboardingResult {
  currentSlide: number;
  totalSlides: number;
  state: OnboardingState;
  isSubmitting: boolean;
  error: string | null;
  setCurrentSlide: (slide: number) => void;
  goNext: () => void;
  goBack: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  toggleCategory: (category: DreamCategory) => void;
  setDreamTitle: (title: string) => void;
  setDreamCategory: (category: DreamCategory) => void;
  setWhyItMatters: (text: string) => void;
  setConfidence: (confidence: Confidence) => void;
  setPace: (pace: Pace) => void;
  setNotificationTime: (time: string | null) => void;
  finish: () => Promise<boolean>;
}

const TOTAL_SLIDES = 10;

export function useOnboarding(): UseOnboardingResult {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<OnboardingState>({
    selectedCategories: [],
    dreamTitle: '',
    dreamCategory: 'growth',
    whyItMatters: '',
    confidence: null,
    pace: null,
    notificationTime: null,
  });

  const completeOnboarding = useMutation(api.userPreferences.completeOnboarding);

  const toggleCategory = useCallback((category: DreamCategory) => {
    setState((prev) => {
      const isSelected = prev.selectedCategories.includes(category);
      return {
        ...prev,
        selectedCategories: isSelected
          ? prev.selectedCategories.filter((c) => c !== category)
          : [...prev.selectedCategories, category],
        // Auto-set dream category to first selected if not yet set
        dreamCategory:
          !isSelected && prev.selectedCategories.length === 0 ? category : prev.dreamCategory,
      };
    });
  }, []);

  const setDreamTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, dreamTitle: title }));
  }, []);

  const setDreamCategory = useCallback((category: DreamCategory) => {
    setState((prev) => ({ ...prev, dreamCategory: category }));
  }, []);

  const setWhyItMatters = useCallback((text: string) => {
    setState((prev) => ({ ...prev, whyItMatters: text }));
  }, []);

  const setConfidence = useCallback((confidence: Confidence) => {
    setState((prev) => ({ ...prev, confidence }));
  }, []);

  const setPace = useCallback((pace: Pace) => {
    setState((prev) => ({ ...prev, pace }));
  }, []);

  const setNotificationTime = useCallback((time: string | null) => {
    setState((prev) => ({ ...prev, notificationTime: time }));
  }, []);

  const canGoNext = useCallback(() => {
    switch (currentSlide) {
      case 3: // Categories - need at least one
        return state.selectedCategories.length > 0;
      case 4: // Dream title - need text
        return state.dreamTitle.trim().length > 0;
      case 6: // Confidence - need selection
        return state.confidence !== null;
      case 7: // Pace - need selection
        return state.pace !== null;
      default:
        return true;
    }
  }, [currentSlide, state]);

  const goNext = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1 && canGoNext()) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, canGoNext]);

  const goBack = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const finish = useCallback(async (): Promise<boolean> => {
    if (!state.pace || state.selectedCategories.length === 0) {
      setError('Please complete all required fields');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await completeOnboarding({
        selectedCategories: state.selectedCategories,
        pace: state.pace,
        notificationTime: state.notificationTime ?? undefined,
        firstDream: state.dreamTitle.trim()
          ? {
              title: state.dreamTitle.trim(),
              category: state.dreamCategory,
              whyItMatters: state.whyItMatters.trim() || undefined,
            }
          : undefined,
      });

      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to complete onboarding');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [state, completeOnboarding]);

  return {
    currentSlide,
    totalSlides: TOTAL_SLIDES,
    state,
    isSubmitting,
    error,
    setCurrentSlide,
    goNext,
    goBack,
    canGoNext: canGoNext(),
    canGoBack: currentSlide > 0,
    toggleCategory,
    setDreamTitle,
    setDreamCategory,
    setWhyItMatters,
    setConfidence,
    setPace,
    setNotificationTime,
    finish,
  };
}
