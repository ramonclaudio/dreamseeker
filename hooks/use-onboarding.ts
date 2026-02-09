import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Confidence, DreamCategory, Pace, Personality, Motivation } from '@/constants/dreams';
import { haptics } from '@/lib/haptics';

interface OnboardingState {
  selectedCategories: DreamCategory[];
  dreamTitle: string;
  dreamCategory: DreamCategory;
  whyItMatters: string;
  confidence: Confidence | null;
  pace: Pace | null;
  personality: Personality | null;
  motivations: Motivation[];
  notificationTime: string | null;
}

const TOTAL_SLIDES = 14;
const STORAGE_KEY = '@onboarding_state';
const STORAGE_VERSION = 2;

const DEFAULT_STATE: OnboardingState = {
  selectedCategories: [],
  dreamTitle: '',
  dreamCategory: 'growth',
  whyItMatters: '',
  confidence: null,
  pace: null,
  personality: null,
  motivations: [],
  notificationTime: null,
};

export function useOnboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const initialized = useRef(false);

  // Restore saved state on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as { version?: number; slide: number; state: OnboardingState };
            if (parsed.version !== STORAGE_VERSION) {
              AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
              return;
            }
            setCurrentSlide(Math.min(parsed.slide, TOTAL_SLIDES - 1));
            setState(parsed.state);
          } catch {
            // Corrupted data, ignore
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        initialized.current = true;
      });
  }, []);

  // Persist state on changes (after initial load)
  useEffect(() => {
    if (!initialized.current) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, slide: currentSlide, state })
    ).catch(() => {});
  }, [currentSlide, state]);

  const completeOnboarding = useMutation(api.userPreferences.completeOnboarding);

  const updateField = useCallback(
    <K extends keyof OnboardingState>(field: K, value: OnboardingState[K]) => {
      setState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleCategory = useCallback((category: DreamCategory) => {
    setState((prev) => {
      const isSelected = prev.selectedCategories.includes(category);
      return {
        ...prev,
        selectedCategories: isSelected
          ? prev.selectedCategories.filter((c) => c !== category)
          : [...prev.selectedCategories, category],
        dreamCategory:
          !isSelected && prev.selectedCategories.length === 0 ? category : prev.dreamCategory,
      };
    });
  }, []);

  const toggleMotivation = useCallback((motivation: Motivation) => {
    setState((prev) => {
      const isSelected = prev.motivations.includes(motivation);
      return {
        ...prev,
        motivations: isSelected
          ? prev.motivations.filter((m) => m !== motivation)
          : [...prev.motivations, motivation],
      };
    });
  }, []);

  const canGoNext = useMemo(() => {
    switch (currentSlide) {
      case 3:
        return state.personality !== null;
      case 4:
        return state.motivations.length > 0;
      case 5:
        return state.selectedCategories.length > 0;
      case 6:
        return state.dreamTitle.trim().length > 0;
      case 8:
        return state.confidence !== null;
      case 9:
        return state.pace !== null;
      case 11:
        return false;
      default:
        return true;
    }
  }, [currentSlide, state]);

  const goNext = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide]);

  const goBack = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const finish = useCallback(async (): Promise<boolean> => {
    if (!state.pace || state.selectedCategories.length === 0) {
      setError('Please complete all required fields');
      haptics.error();
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await completeOnboarding({
        selectedCategories: state.selectedCategories,
        pace: state.pace,
        confidence: state.confidence ?? undefined,
        personality: state.personality ?? undefined,
        motivations: state.motivations.length > 0 ? state.motivations : undefined,
        notificationTime: state.notificationTime ?? undefined,
        firstDream: state.dreamTitle.trim()
          ? {
              title: state.dreamTitle.trim(),
              category: state.dreamCategory,
              whyItMatters: state.whyItMatters.trim() || undefined,
            }
          : undefined,
      });

      haptics.success();
      await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to complete onboarding');
      haptics.error();
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
    goNext,
    goBack,
    canGoNext,
    canGoBack: currentSlide > 0,
    toggleCategory,
    updateField,
    toggleMotivation,
    finish,
  };
}
