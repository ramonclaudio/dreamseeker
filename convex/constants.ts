import { v } from 'convex/values';

// ── Validators (single source of truth for schema + mutations) ──────────────

export const dreamCategoryValidator = v.union(
  v.literal('travel'),
  v.literal('money'),
  v.literal('career'),
  v.literal('lifestyle'),
  v.literal('growth'),
  v.literal('relationships'),
  v.literal('custom')
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

export const personalityValidator = v.union(
  v.literal('dreamer'),
  v.literal('planner'),
  v.literal('doer'),
  v.literal('explorer')
);

export const motivationValidator = v.union(
  v.literal('feel-better'),
  v.literal('career-growth'),
  v.literal('adventure'),
  v.literal('financial-freedom'),
  v.literal('relationships'),
  v.literal('self-discipline')
);

export const moodValidator = v.union(
  v.literal('great'),
  v.literal('good'),
  v.literal('okay'),
  v.literal('tough')
);

export const friendRequestStatusValidator = v.union(
  v.literal('pending'),
  v.literal('accepted'),
  v.literal('rejected')
);

export const hiddenItemTypeValidator = v.union(
  v.literal('dream'),
  v.literal('journal'),
  v.literal('action')
);

export const feedEventTypeValidator = v.union(
  v.literal('dream_created'),
  v.literal('dream_completed'),
  v.literal('action_completed'),
  v.literal('journal_entry'),
  v.literal('badge_earned'),
  v.literal('level_up'),
  v.literal('streak_milestone')
);

export const feedMetadataValidator = v.union(
  v.object({ title: v.string(), category: dreamCategoryValidator }),  // dream_created, dream_completed
  v.object({ text: v.string(), dreamTitle: v.string() }),             // action_completed
  v.object({ title: v.string(), mood: v.optional(moodValidator) }),   // journal_entry
  v.object({ badgeKey: v.string(), title: v.string() }),              // badge_earned
  v.object({ streak: v.number() }),                                   // streak_milestone
  v.object({ level: v.number(), title: v.string() }),                 // level_up
);

// ── Types ───────────────────────────────────────────────────────────────────

export type DreamCategory = 'travel' | 'money' | 'career' | 'lifestyle' | 'growth' | 'relationships' | 'custom';
type DreamStatus = 'active' | 'completed' | 'archived';
export type Pace = 'gentle' | 'steady' | 'ambitious';
export type Confidence = 'confident' | 'somewhat' | 'not-confident';
export type Personality = 'dreamer' | 'planner' | 'doer' | 'explorer';
export type Motivation = 'feel-better' | 'career-growth' | 'adventure' | 'financial-freedom' | 'relationships' | 'self-discipline';
export type Mood = 'great' | 'good' | 'okay' | 'tough';
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';
export type HiddenItemType = 'dream' | 'journal' | 'action';
export type FeedEventType = 'dream_created' | 'dream_completed' | 'action_completed' | 'journal_entry' | 'badge_earned' | 'level_up' | 'streak_milestone';

export type FeedMetadata =
  | { title: string; category: DreamCategory }
  | { text: string; dreamTitle: string }
  | { title: string; mood?: Mood }
  | { badgeKey: string; title: string }
  | { streak: number }
  | { level: number; title: string };

export const DREAM_CATEGORY_LIST: DreamCategory[] = [
  'travel', 'money', 'career', 'lifestyle', 'growth', 'relationships', 'custom',
];

// ── XP Rewards ──────────────────────────────────────────────────────────────

export const XP_REWARDS = {
  onboardingComplete: 50,
  actionComplete: 10,
  dreamComplete: 100,
  checkIn: 5,
  focusSession: 15,
  streakMilestone: 5,
  badgeEarned: 25,
  journalEntry: 10,
} as const;

// ── Level Progression ───────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1, xp: 0, title: 'Dreamer' },
  { level: 2, xp: 100, title: 'Awakening' },
  { level: 3, xp: 300, title: 'Spark' },
  { level: 4, xp: 600, title: 'Seeker' },
  { level: 5, xp: 1000, title: 'Risk Taker' },
  { level: 6, xp: 1600, title: 'Trailblazer' },
  { level: 7, xp: 2500, title: 'Adventurer' },
  { level: 8, xp: 4000, title: 'Opportunity Seizer' },
  { level: 9, xp: 6500, title: 'World Changer' },
  { level: 10, xp: 10000, title: 'Legend' },
] as const;

type Level = (typeof LEVELS)[number];

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
export const MAX_JOURNAL_BODY_LENGTH = 5000;
export const MAX_INTENTION_LENGTH = 500;
export const MAX_REFLECTION_LENGTH = 1000;
export const MAX_CUSTOM_CATEGORY_NAME_LENGTH = 50;
export const MAX_CUSTOM_CATEGORY_COLOR_LENGTH = 20;
export const MAX_TAG_LENGTH = 50;
export const MAX_TAGS_COUNT = 20;

export const FREE_JOURNAL_DAILY_LIMIT = 1;

export const MAX_BIO_LENGTH = 200;
export const MAX_DISPLAY_NAME_LENGTH = 50;
export const SEARCH_RESULTS_LIMIT = 20;
export const FEED_PAGE_SIZE = 30;
export const FEED_FRIENDS_RECENT_LIMIT = 10;

// ── Dream Categories (display metadata) ─────────────────────────────────────

export const DREAM_CATEGORIES = {
  travel: { label: 'Travel', icon: 'airplane', color: '#7b8d9e' },
  money: { label: 'Money', icon: 'wallet', color: '#a3976b' },
  career: { label: 'Career', icon: 'briefcase', color: '#b07d6e' },
  lifestyle: { label: 'Lifestyle', icon: 'home', color: '#7a9e96' },
  growth: { label: 'Growth', icon: 'leaf', color: '#6b9670' },
  relationships: { label: 'Relationships', icon: 'heart', color: '#9e8ba3' },
  custom: { label: 'Custom', icon: 'star.fill', color: '#8b8b8b' },
} as const;

export const CUSTOM_CATEGORY_ICONS = [
  'star.fill', 'heart.fill', 'bolt.fill', 'flame.fill', 'trophy.fill',
  'diamond.fill', 'crown.fill', 'target', 'sparkles', 'gift', 'leaf.fill', 'book.fill',
] as const;

export const CUSTOM_CATEGORY_COLORS = [
  '#7b8d9e', '#a3976b', '#b07d6e', '#7a9e96', '#6b9670',
  '#9e8ba3', '#c4786e', '#6b8a9e', '#9e956b', '#8b7ba3',
] as const;

// ── Streak Milestones ──────────────────────────────────────────────────────

export const STREAK_MILESTONES = [1, 3, 5, 10, 30] as const;

export const STREAK_XP_REWARDS: Record<number, number> = {
  1: 5,
  3: 15,
  5: 25,
  10: 50,
  30: 100,
};

// ── Badge Condition Thresholds ──────────────────────────────────────────────

export const EARLY_BIRD_HOUR = 8;
export const NIGHT_OWL_HOUR = 22;
export const PERMISSION_GRANTED_WINDOW_MS = 24 * 60 * 60 * 1000;
export const LASER_FOCUSED_THRESHOLD = 10;

export function isEarlyBird(localHour: number): boolean {
  return localHour < EARLY_BIRD_HOUR;
}

export function isNightOwl(localHour: number): boolean {
  return localHour >= NIGHT_OWL_HOUR;
}

// ── Weekly Challenges ──────────────────────────────────────────────────────

export const WEEKLY_CHALLENGES = [
  { id: 'wc1', quote: 'Tell someone about a dream you have never shared before.', theme: 'vulnerability' },
  { id: 'wc2', quote: 'Take one small action today that scares you a little.', theme: 'courage' },
  { id: 'wc3', quote: "Celebrate a friend's win as loudly as you'd celebrate your own.", theme: 'community' },
  { id: 'wc4', quote: 'Write down three things that would make this week extraordinary.', theme: 'intention' },
  { id: 'wc5', quote: 'Reach out to someone who inspires you and tell them why.', theme: 'connection' },
  { id: 'wc6', quote: 'Do one thing today that your future self will thank you for.', theme: 'growth' },
] as const;
