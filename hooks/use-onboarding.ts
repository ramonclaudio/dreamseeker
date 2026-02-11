import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { authClient } from '@/lib/auth-client';
import { haptics } from '@/lib/haptics';

interface OnboardingState {
  displayName: string;
}

const TOTAL_SLIDES = 2;
const STORAGE_KEY = '@onboarding_state';
const STORAGE_VERSION = 7;

const DEFAULT_STATE: OnboardingState = {
  displayName: '',
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

  // Both slides always passable (name optional, send-off is static)
  const canGoNext = useMemo(() => true, []);

  const goNext = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide]);

  const goBack = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const finish = useCallback(async (): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const displayName = state.displayName.trim() || undefined;

      await completeOnboarding({ displayName });

      // Update Better Auth name client-side
      if (displayName) {
        await authClient.updateUser({ name: displayName }).catch(() => {});
      }

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
    updateField,
    finish,
  };
}
