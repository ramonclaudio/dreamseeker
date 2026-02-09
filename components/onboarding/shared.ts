import type { IconSymbolName } from '@/components/ui/icon-symbol';
import type { useColors } from '@/hooks/use-color-scheme';
import type { Confidence, Pace, DreamCategory, Personality, Motivation } from '@/constants/dreams';

export type SlideColors = ReturnType<typeof useColors>;

export { type Confidence, type Pace, type DreamCategory, type Personality, type Motivation };

export const PACE_OPTIONS: { value: Pace; label: string; description: string }[] = [
  { value: 'gentle', label: 'Gentle', description: '1-2 actions per week' },
  { value: 'steady', label: 'Steady', description: '3-4 actions per week' },
  { value: 'ambitious', label: 'Ambitious', description: '5+ actions per week' },
];

export const CONFIDENCE_OPTIONS: { value: Confidence; label: string }[] = [
  { value: 'confident', label: "I'm confident I can do this" },
  { value: 'somewhat', label: "I'm somewhat confident" },
  { value: 'not-confident', label: "I'm not confident yet" },
];

export const PERSONALITY_OPTIONS: { value: Personality; label: string; icon: IconSymbolName; description: string }[] = [
  { value: 'dreamer', label: 'The Dreamer', icon: 'star.fill', description: 'I love imagining possibilities' },
  { value: 'planner', label: 'The Planner', icon: 'list.bullet', description: 'I map everything out first' },
  { value: 'doer', label: 'The Doer', icon: 'bolt.fill', description: 'I jump in and figure it out' },
  { value: 'explorer', label: 'The Explorer', icon: 'safari.fill', description: 'I try everything at least once' },
];

export const MOTIVATION_OPTIONS: { value: Motivation; label: string; icon: IconSymbolName }[] = [
  { value: 'feel-better', label: 'Feel Better', icon: 'heart.fill' },
  { value: 'career-growth', label: 'Career Growth', icon: 'briefcase.fill' },
  { value: 'adventure', label: 'Adventure', icon: 'airplane' },
  { value: 'financial-freedom', label: 'Financial Freedom', icon: 'creditcard.fill' },
  { value: 'relationships', label: 'Relationships', icon: 'person.2.fill' },
  { value: 'self-discipline', label: 'Self-Discipline', icon: 'figure.walk' },
];
