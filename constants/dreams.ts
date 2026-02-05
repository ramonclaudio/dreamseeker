// Dream categories with icons and colors
export const DREAM_CATEGORIES = {
  travel: { label: 'Travel', icon: 'airplane', color: '#E91E8C' },
  money: { label: 'Money', icon: 'wallet', color: '#FFD700' },
  career: { label: 'Career', icon: 'briefcase', color: '#FF6B6B' },
  lifestyle: { label: 'Lifestyle', icon: 'home', color: '#4ECDC4' },
  growth: { label: 'Growth', icon: 'leaf', color: '#95E1D3' },
  relationships: { label: 'Relationships', icon: 'heart', color: '#F38181' },
} as const;

export type DreamCategory = keyof typeof DREAM_CATEGORIES;

export const DREAM_CATEGORY_LIST = Object.keys(DREAM_CATEGORIES) as DreamCategory[];

// XP rewards for various actions
export const XP_REWARDS = {
  actionComplete: 10,
  dreamComplete: 100,
  challengeComplete: 25,
  streakBonus: 5, // Per day of streak
} as const;

// Level progression
export const LEVELS = [
  { level: 1, xp: 0, title: 'Dreamer' },
  { level: 2, xp: 100, title: 'Seeker' },
  { level: 3, xp: 300, title: 'Achiever' },
  { level: 4, xp: 600, title: 'Go-Getter' },
  { level: 5, xp: 1000, title: 'Trailblazer' },
] as const;

export type Level = (typeof LEVELS)[number];

// Free tier dream limit
export const FREE_DREAM_LIMIT = 3;

// Helper to get level from XP
export function getLevelFromXp(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

// Helper to get XP needed for next level
export function getXpToNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const currentLevel = getLevelFromXp(xp);
  const currentLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level);
  const nextLevel = LEVELS[currentLevelIndex + 1];

  if (!nextLevel) {
    return { current: xp - currentLevel.xp, needed: 0, progress: 1 };
  }

  const xpIntoLevel = xp - currentLevel.xp;
  const xpNeeded = nextLevel.xp - currentLevel.xp;
  const progress = xpIntoLevel / xpNeeded;

  return { current: xpIntoLevel, needed: xpNeeded, progress };
}

// Dream status types
export type DreamStatus = 'active' | 'completed' | 'archived';
