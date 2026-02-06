import type { IconSymbolName } from '@/components/ui/icon-symbol';
import type { useColors } from '@/hooks/use-color-scheme';
import type { Confidence, Pace, DreamCategory } from '@/constants/dreams';

export type SlideColors = ReturnType<typeof useColors>;

export { type Confidence, type Pace, type DreamCategory };

export const CATEGORY_ICONS: Record<DreamCategory, IconSymbolName> = {
  travel: 'airplane',
  money: 'creditcard.fill',
  career: 'briefcase.fill',
  lifestyle: 'house.fill',
  growth: 'leaf.fill',
  relationships: 'heart.fill',
};

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
