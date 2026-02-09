import type { DreamCategory } from '@/constants/dreams';

export const TITLE_SUGGESTIONS: Record<DreamCategory, string[]> = {
  travel: [
    'Solo trip to Japan',
    'Visit 5 new countries',
    'Do a digital nomad month',
    'Road trip across the coast',
    'Learn to surf',
    'Backpack through Europe',
  ],
  money: [
    'Save $10K emergency fund',
    'Max out my 401K',
    'Start investing in index funds',
    'Pay off student loans',
    'Build 3 streams of income',
    'Hit $100K net worth',
  ],
  career: [
    'Launch my side business',
    'Get promoted to senior role',
    'Build a personal brand online',
    'Start freelancing on the side',
    'Negotiate a 20% raise',
    'Speak at a conference',
  ],
  lifestyle: [
    'Build a consistent gym habit',
    'Meal prep every Sunday',
    'Sleep 8 hours consistently',
    'Create a minimalist wardrobe',
    'Design my dream home office',
    'Master a new recipe weekly',
  ],
  growth: [
    'Read 24 books this year',
    'Learn a new language',
    'Start a daily meditation practice',
    'Take a public speaking course',
    'Write in my journal every day',
    'Complete a coding bootcamp',
  ],
  relationships: [
    'Host monthly friend dinners',
    'Call family every week',
    'Find my community',
    'Set better boundaries',
    'Be more vulnerable',
    'Plan weekly date nights',
  ],
  custom: [],
};

export const ACTION_SUGGESTIONS: Record<DreamCategory, string[]> = {
  travel: ['Book a trip', 'Get a passport', 'Research destinations', 'Save for trip fund'],
  money: ['Set a budget', 'Open savings account', 'Track expenses', 'Find side income'],
  career: ['Update resume', 'Network with peers', 'Learn a new skill', 'Set career goals'],
  lifestyle: ['Start a morning routine', 'Declutter my space', 'Try a new hobby', 'Plan a self-care day'],
  growth: ['Read a book', 'Start journaling', 'Take an online course', 'Practice mindfulness'],
  relationships: ['Plan a date night', 'Call an old friend', 'Write a gratitude letter', 'Join a community'],
  custom: [],
};

export type TimelineUnit = 'days' | 'weeks' | 'months' | 'years';

export interface TimelineDuration {
  amount: number;
  unit: TimelineUnit;
}

export const TIMELINE_UNITS: TimelineUnit[] = ['days', 'weeks', 'months', 'years'];

export const TIMELINE_PRESETS: TimelineDuration[] = [
  { amount: 1, unit: 'weeks' },
  { amount: 1, unit: 'months' },
  { amount: 3, unit: 'months' },
  { amount: 6, unit: 'months' },
  { amount: 1, unit: 'years' },
];

const SINGULAR_UNITS: Record<TimelineUnit, string> = {
  days: 'day',
  weeks: 'week',
  months: 'month',
  years: 'year',
};

export function formatDuration(duration: TimelineDuration): string {
  const unit = duration.amount === 1 ? SINGULAR_UNITS[duration.unit] : duration.unit;
  return `${duration.amount} ${unit}`;
}

export function durationToEpoch(duration: TimelineDuration): number {
  const now = new Date();
  switch (duration.unit) {
    case 'days':
      now.setDate(now.getDate() + duration.amount);
      break;
    case 'weeks':
      now.setDate(now.getDate() + duration.amount * 7);
      break;
    case 'months':
      now.setMonth(now.getMonth() + duration.amount);
      break;
    case 'years':
      now.setFullYear(now.getFullYear() + duration.amount);
      break;
  }
  return now.getTime();
}

export const IDENTITY_SUGGESTIONS = [
  'more confident',
  'financially free',
  'a world traveler',
  'healthier',
  'more creative',
  'a leader',
] as const;
