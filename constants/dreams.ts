// Re-export shared constants from convex/constants.ts (single source of truth)
export {
  DREAM_CATEGORIES,
  DREAM_CATEGORY_LIST,
  XP_REWARDS,
  LEVELS,
  FREE_DREAM_LIMIT,
  MAX_TITLE_LENGTH,
  MAX_WHY_LENGTH,
  MAX_ACTION_TEXT_LENGTH,
  getLevelFromXp,
  getXpToNextLevel,
} from '@/convex/constants';

export type {
  Confidence,
  DreamCategory,
  DreamStatus,
  Level,
  Pace,
} from '@/convex/constants';
