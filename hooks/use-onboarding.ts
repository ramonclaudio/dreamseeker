import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Confidence, DreamCategory, Pace } from '@/constants/dreams';

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
const STORAGE_KEY = '@onboarding_state';
const STORAGE_VERSION = 1;

const DEFAULT_STATE: OnboardingState = {
  selectedCategories: [],
  dreamTitle: '',
  dreamCategory: 'growth',
  whyItMatters: '',
  confidence: null,
  pace: null,
  notificationTime: null,
};

export function useOnboarding(): UseOnboardingResult {
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
              // Version mismatch, clear stale data
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
      .catch(() => {
        // Storage unavailable, continue with defaults
      })
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

  const setDreamTitle = (title: string) => {
    setState((prev) => ({ ...prev, dreamTitle: title }));
  };

  const setDreamCategory = (category: DreamCategory) => {
    setState((prev) => ({ ...prev, dreamCategory: category }));
  };

  const setWhyItMatters = (text: string) => {
    setState((prev) => ({ ...prev, whyItMatters: text }));
  };

  const setConfidence = (confidence: Confidence) => {
    setState((prev) => ({ ...prev, confidence }));
  };

  const setPace = (pace: Pace) => {
    setState((prev) => ({ ...prev, pace }));
  };

  const setNotificationTime = (time: string | null) => {
    setState((prev) => ({ ...prev, notificationTime: time }));
  };

  const canGoNext = useMemo(() => {
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
    if (currentSlide < TOTAL_SLIDES - 1 && canGoNext) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, canGoNext]);

  const goBack = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

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
        confidence: state.confidence ?? undefined,
        notificationTime: state.notificationTime ?? undefined,
        firstDream: state.dreamTitle.trim()
          ? {
              title: state.dreamTitle.trim(),
              category: state.dreamCategory,
              whyItMatters: state.whyItMatters.trim() || undefined,
            }
          : undefined,
      });

      await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
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
    canGoNext,
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
