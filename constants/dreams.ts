import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { DREAM_CATEGORIES as _DREAM_CATEGORIES, type DreamCategory as _DreamCategory } from '@/convex/constants';

// Re-export shared constants from convex/constants.ts (single source of truth)
export {
  DREAM_CATEGORIES,
  DREAM_CATEGORY_LIST,
  CUSTOM_CATEGORY_ICONS,
  CUSTOM_CATEGORY_COLORS,
  LEVELS,
  getLevelFromXp,
  getXpToNextLevel,
} from '@/convex/constants';

export const CATEGORY_ICONS: Record<_DreamCategory, IconSymbolName> = {
  travel: 'airplane',
  money: 'creditcard.fill',
  career: 'briefcase.fill',
  lifestyle: 'house.fill',
  growth: 'leaf.fill',
  relationships: 'heart.fill',
  custom: 'star.fill',
};

export type {
  Confidence,
  DreamCategory,
  Mood,
  Motivation,
  Pace,
  Personality,
} from '@/convex/constants';

export function getCategoryConfig(dream: {
  category: string;
  customCategoryName?: string;
  customCategoryIcon?: string;
  customCategoryColor?: string;
}) {
  if (dream.category === 'custom') {
    return {
      label: dream.customCategoryName ?? 'Custom',
      icon: dream.customCategoryIcon ?? 'star.fill',
      color: dream.customCategoryColor ?? '#8b8b8b',
    };
  }
  return _DREAM_CATEGORIES[dream.category as _DreamCategory] ?? _DREAM_CATEGORIES.growth;
}
