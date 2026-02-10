import { useState, useCallback, useMemo } from 'react';
import { useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import type { DreamCategory } from '@/constants/dreams';
import type { TimelineDuration } from '@/constants/dream-suggestions';
import { durationToEpoch } from '@/constants/dream-suggestions';

export interface CustomCategoryConfig {
  name: string;
  icon: string;
  color: string;
}

interface CreateDreamState {
  step: number;
  title: string;
  targetDate: TimelineDuration | null;
  whyItMatters: string;
  category: DreamCategory | null;
  customCategoryConfig: CustomCategoryConfig | null;
  actions: string[];
  isSubmitting: boolean;
  error: string | null;
}

const TOTAL_STEPS = 6;

const DEFAULT_STATE: CreateDreamState = {
  step: 0,
  title: '',
  targetDate: null,
  whyItMatters: '',
  category: null,
  customCategoryConfig: null,
  actions: [],
  isSubmitting: false,
  error: null,
};

export function useCreateDream() {
  const [state, setState] = useState<CreateDreamState>(DEFAULT_STATE);
  const createDream = useMutation(api.dreams.create);

  const setTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, title, error: null }));
  }, []);

  const setTargetDate = useCallback((targetDate: TimelineDuration | null) => {
    setState((prev) => ({ ...prev, targetDate }));
  }, []);

  const setWhyItMatters = useCallback((whyItMatters: string) => {
    setState((prev) => ({ ...prev, whyItMatters }));
  }, []);

  const setCategory = useCallback((category: DreamCategory | null) => {
    setState((prev) => ({
      ...prev,
      category,
      customCategoryConfig: category === 'custom' ? prev.customCategoryConfig : null,
    }));
  }, []);

  const setCustomCategoryConfig = useCallback((config: CustomCategoryConfig | null) => {
    setState((prev) => ({ ...prev, customCategoryConfig: config }));
  }, []);

  const setActions = useCallback((actions: string[]) => {
    setState((prev) => ({ ...prev, actions }));
  }, []);

  const addAction = useCallback((action: string) => {
    setState((prev) => ({
      ...prev,
      actions: prev.actions.length < 10 ? [...prev.actions, action] : prev.actions,
    }));
  }, []);

  const removeAction = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (prev.step >= TOTAL_STEPS - 1) return prev;
      return { ...prev, step: prev.step + 1, error: null };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => {
      if (prev.step <= 0) return prev;
      return { ...prev, step: prev.step - 1, error: null };
    });
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const canGoNext = useMemo(() => {
    switch (state.step) {
      case 0:
        if (state.category === 'custom') {
          return !!state.customCategoryConfig?.name.trim();
        }
        return state.category !== null;
      case 1:
        return state.title.trim().length > 0;
      default:
        return true;
    }
  }, [state.step, state.title, state.category, state.customCategoryConfig]);

  const submit = useCallback(async (): Promise<string | null> => {
    if (!state.category) {
      setState((prev) => ({ ...prev, error: 'Please select a category' }));
      return null;
    }
    if (!state.title.trim()) {
      setState((prev) => ({ ...prev, error: 'Please enter a dream title' }));
      return null;
    }

    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const filteredActions = state.actions.map((a) => a.trim()).filter((a) => a.length > 0);
      const dreamId = await createDream({
        title: state.title.trim(),
        category: state.category,
        whyItMatters: state.whyItMatters.trim() || undefined,
        targetDate: state.targetDate ? durationToEpoch(state.targetDate) : undefined,
        initialActions: filteredActions.length > 0 ? filteredActions : undefined,
        customCategoryName: state.category === 'custom' ? state.customCategoryConfig?.name : undefined,
        customCategoryIcon: state.category === 'custom' ? state.customCategoryConfig?.icon : undefined,
        customCategoryColor: state.category === 'custom' ? state.customCategoryConfig?.color : undefined,
      });
      return dreamId;
    } catch (e) {
      const raw = e instanceof Error ? e.message : '';
      const message = raw ? 'Something went wrong. Please try again.' : 'Failed to create dream';
      setState((prev) => ({ ...prev, error: message }));
      return null;
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [state, createDream]);

  return {
    state,
    totalSteps: TOTAL_STEPS,
    setTitle,
    setTargetDate,
    setWhyItMatters,
    setCategory,
    setCustomCategoryConfig,
    setActions,
    addAction,
    removeAction,
    nextStep,
    prevStep,
    reset,
    canGoNext,
    submit,
  };
}
