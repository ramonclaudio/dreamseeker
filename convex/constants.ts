import { v } from 'convex/values';

// ── Validators (single source of truth for schema + mutations) ──────────────

export const dreamCategoryValidator = v.union(
  v.literal('travel'),
  v.literal('money'),
  v.literal('career'),
  v.literal('lifestyle'),
  v.literal('growth'),
  v.literal('relationships')
);

export const dreamStatusValidator = v.union(
  v.literal('active'),
  v.literal('completed'),
  v.literal('archived')
);

export const paceValidator = v.union(
  v.literal('gentle'),
  v.literal('steady'),
  v.literal('ambitious')
);

export const confidenceValidator = v.union(
  v.literal('confident'),
  v.literal('somewhat'),
  v.literal('not-confident')
);

// ── Types ───────────────────────────────────────────────────────────────────

export type DreamCategory = 'travel' | 'money' | 'career' | 'lifestyle' | 'growth' | 'relationships';
export type DreamStatus = 'active' | 'completed' | 'archived';
export type Pace = 'gentle' | 'steady' | 'ambitious';
export type Confidence = 'confident' | 'somewhat' | 'not-confident';

export const DREAM_CATEGORY_LIST: DreamCategory[] = [
  'travel', 'money', 'career', 'lifestyle', 'growth', 'relationships',
];

// ── XP Rewards ──────────────────────────────────────────────────────────────

export const XP_REWARDS = {
  onboardingComplete: 50,
  actionComplete: 10,
  dreamComplete: 100,
} as const;

// ── Level Progression ───────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1, xp: 0, title: 'Dreamer' },
  { level: 2, xp: 100, title: 'Seeker' },
  { level: 3, xp: 300, title: 'Achiever' },
  { level: 4, xp: 600, title: 'Go-Getter' },
  { level: 5, xp: 1000, title: 'Trailblazer' },
] as const;

export type Level = (typeof LEVELS)[number];

export function getLevelFromXp(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getXpToNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const currentLevel = getLevelFromXp(xp);
  const currentLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level);
  const nextLevel = LEVELS[currentLevelIndex + 1];

  if (!nextLevel) {
    return { current: xp - currentLevel.xp, needed: 0, progress: 1 };
  }

  const xpIntoLevel = xp - currentLevel.xp;
  const xpNeeded = nextLevel.xp - currentLevel.xp;
  return { current: xpIntoLevel, needed: xpNeeded, progress: xpIntoLevel / xpNeeded };
}

// ── Limits ──────────────────────────────────────────────────────────────────

export const MAX_TITLE_LENGTH = 200;
export const MAX_WHY_LENGTH = 500;
export const MAX_ACTION_TEXT_LENGTH = 300;

// ── Dream Categories (display metadata) ─────────────────────────────────────

export const DREAM_CATEGORIES = {
  travel: { label: 'Travel', icon: 'airplane', color: '#E91E8C' },
  money: { label: 'Money', icon: 'wallet', color: '#FFD700' },
  career: { label: 'Career', icon: 'briefcase', color: '#FF6B6B' },
  lifestyle: { label: 'Lifestyle', icon: 'home', color: '#4ECDC4' },
  growth: { label: 'Growth', icon: 'leaf', color: '#95E1D3' },
  relationships: { label: 'Relationships', icon: 'heart', color: '#F38181' },
} as const;

export const FREE_DREAM_LIMIT = 3;
