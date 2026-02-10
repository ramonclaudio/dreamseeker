// UI Constants - Opacity, Z-Index, Animation, Sizes

// Opacity values for interactive states
export const Opacity = {
  pressed: 0.7,
  active: 0.8,
  disabled: 0.5,
  muted: 0.6,
} as const;

// Z-index layering
export const ZIndex = {
  base: 0,
  statusBar: 1,
  dropdown: 10,
  modal: 100,
  toast: 500,
  offlineBanner: 1000,
} as const;

// Animation durations (ms)
export const Duration = {
  instant: 0,
  fast: 150,
  normal: 200,
  slow: 300,
  splash: 1000,
  confettiFall: 3000,
  confettiExplosion: 400,
} as const;

// Component sizes
export const Size = {
  checkbox: 24,
  iconContainer: 40,
  iconContainerSm: 32,
  divider: 0.5,
  dividerThick: 1,
  dividerMargin: 50,
  dragHandle: { width: 36, height: 5, radius: 3 },
  badge: 32,
  appleButton: 50,
} as const;

// Responsive image/header constants
export const Responsive = {
  header: {
    minHeight: 200,
    maxHeight: 300,
    screenRatio: 0.25,
  },
  avatar: {
    phone: 100,
    tablet: 110,
    desktop: 120,
  },
} as const;

// Confetti configuration — tiered presets (vibrant corals, golds, ocean blues)
export const ConfettiTiny = {
  count: 25,
  originY: -20,
  fallSpeed: 1500,
  explosionSpeed: 250,
  colors: ['#E07B4F', '#D06840', '#EDAF4A', '#F0CA60', '#2E86AB'],
} as const;

export const ConfettiSmall = {
  count: 50,
  originY: -20,
  fallSpeed: 2000,
  explosionSpeed: 300,
  colors: ['#E07B4F', '#D06840', '#EDAF4A', '#F0CA60', '#2E86AB'],
} as const;

export const ConfettiMedium = {
  count: 150,
  originY: -20,
  fallSpeed: 3000,
  explosionSpeed: 400,
  colors: ['#E07B4F', '#D06840', '#EDAF4A', '#F0CA60', '#2E86AB'],
} as const;

export const ConfettiEpic = {
  count: 300,
  originY: -20,
  fallSpeed: 4500,
  explosionSpeed: 500,
  colors: [
    '#E07B4F', '#D06840', '#C85A30',   // vibrant corals
    '#EDAF4A', '#F0CA60', '#D4A030',   // rich golds
    '#2E86AB', '#3A9BBF', '#1E6E8E',   // ocean blues
    '#6B9670', '#88B88E',               // greens
  ],
} as const;

/** @deprecated Use ConfettiMedium — kept for backwards compat */
export const Confetti = ConfettiMedium;

export type ConfettiTier = 'tiny' | 'small' | 'medium' | 'epic';

export const ConfettiPresets: Record<ConfettiTier, { count: number; originY: number; fallSpeed: number; explosionSpeed: number; colors: readonly string[] }> = {
  tiny: ConfettiTiny,
  small: ConfettiSmall,
  medium: ConfettiMedium,
  epic: ConfettiEpic,
} as const;

// Hype copy — randomly pick from these for celebration moments
// Infused with Gabby Beckford's philosophy and voice
export const HypeCopy = {
  achievement: [
    'YOU CRUSHED IT',
    'ABSOLUTE LEGEND',
    'YOU DID THAT',
    'UNSTOPPABLE',
    'QUEEN BEHAVIOR',
    'LITERALLY ICONIC',
    'YOU SHOWED UP AND WON',
    'DO IT BEFORE YOU FEEL IT',
    'ONE DECISION AWAY FROM EVERYTHING',
    'SEEK RISK. SEIZE OPPORTUNITY.',
  ],
  levelUp: [
    "YOU'RE ON ANOTHER LEVEL",
    "CAN'T BE STOPPED",
    'LEVELED UP AND LOCKED IN',
    'BUILT DIFFERENT',
    'MAIN CHARACTER ENERGY',
    'LIVING IN YOUR POSSIBILITIES',
    "RETHINK WHAT'S POSSIBLE",
    'THE PEOPLE WHO SHOW UP WIN',
  ],
  badge: [
    "THAT'S MINE",
    'EARNED IT',
    'ANOTHER ONE FOR THE COLLECTION',
    'ADDING TO THE TROPHY CASE',
    'YOU LOVE TO SEE IT',
    "PROOF YOU'RE BECOMING HER",
    'YOUR STORY, YOUR TROPHIES',
  ],
  streak: [
    'ON FIRE',
    'LEGENDARY STREAK',
    'UNSTOPPABLE QUEEN',
    'CONSISTENCY IS YOUR SUPERPOWER',
    "THEY CAN'T KEEP UP",
    'YOUR FUTURE SELF IS CHEERING',
    'DO IT BEFORE YOU FEEL IT',
    'DONE IS BETTER THAN PERFECT',
    'SHOW UP AND THE WINS FOLLOW',
  ],
  nextStep: [
    "WHAT'S NEXT, QUEEN?",
    "YOU DON'T STOP",
    'KEEP THAT ENERGY',
    'THE MOMENTUM IS REAL',
    "WHY NOT YOU? WHAT'S THE WORST THAT COULD HAPPEN?",
    'ONE DECISION AWAY FROM EVERYTHING',
  ],
  share: [
    'FLEX YOUR WIN',
    'SHOW THEM WHAT YOU BUILT',
    'LET THEM KNOW',
    'THIS DESERVES TO BE SEEN',
    'THE MORE YOU SHARE, THE MORE YOU GET',
    'OWN YOUR STORY',
  ],
  actionComplete: [
    'DONE.', 'CHECKED.', 'ONE LESS THING.', 'MOMENTUM.', "THAT'S PROGRESS.", 'HANDLED.',
    'ONE STEP CLOSER.', 'DO IT BEFORE YOU FEEL IT.', 'DONE IS BETTER THAN PERFECT.',
    'BE CONFIDENT. BE DELUSIONAL.', 'THE FEELINGS CATCH UP.', 'SEEK RISK.', 'ONE DECISION AWAY.',
  ],
  allDone: [
    'ALL DONE, QUEEN.', 'NOTHING LEFT BUT WINS.', 'YOU ATE THAT.', 'CLEAN SLATE.', 'FLAWLESS EXECUTION.',
    'GO LIVE YOUR LIFE, QUEEN.', 'GABBY SAYS: YOU ATE.', 'PERMISSION GRANTED TO CHILL.',
  ],
  firstAction: [
    'YOU JUST STARTED.', 'THE FIRST STEP IS EVERYTHING.', 'IT BEGINS NOW.', 'MOMENTUM: ACTIVATED.',
    'GIVE YOURSELF PERMISSION.', 'BE CONFIDENT. BE DELUSIONAL.',
    'DO IT BEFORE YOU FEEL IT.', 'GABBY BELIEVED IN YOU FIRST.', 'SEEK RISK. THIS IS IT.',
  ],
  visionBoard: [
    'Give yourself permission to live in your possibilities.',
    'This is just the beginning.',
    'Dream big. Act bigger.',
    'Be confident. Be delusional.',
    'Seek risk. Seize opportunity. See the world.',
    "I didn't have a dream job. I had a dream LIFE.",
    'One decision away from adventure.',
  ],
  dream: [
    'THIS IS YOUR DREAM.',
    'DREAM IT. DO IT.',
    'THE VISION IS CLEAR.',
    'ONE DECISION AWAY.',
    'SEEK RISK. SEIZE OPPORTUNITY.',
    'BE CONFIDENT. BE DELUSIONAL.',
    'GIVE YOURSELF PERMISSION.',
  ],
  action: [
    'ACTION TAKEN.',
    'ONE STEP CLOSER.',
    'MOMENTUM IS EVERYTHING.',
    'DO IT BEFORE YOU FEEL IT.',
    'DONE IS BETTER THAN PERFECT.',
    'THE FEELINGS CATCH UP.',
    'SEEK RISK.',
  ],
  journal: [
    'YOUR STORY MATTERS.',
    'WORDS BECOME WORLDS.',
    'REFLECT. RISE. REPEAT.',
    'THE PEN IS YOUR POWER.',
    'WRITE YOUR FUTURE.',
    'FEELINGS ARE DATA.',
    'OWN YOUR NARRATIVE.',
  ],
} as const;

/** Pick a random hype line from a category */
export function pickHype(category: keyof typeof HypeCopy): string {
  const lines = HypeCopy[category];
  return lines[Math.floor(Math.random() * lines.length)];
}

// Accessibility
export const Accessibility = {
  maxFontSizeMultiplier: 2,
} as const;
