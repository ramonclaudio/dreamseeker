import {
  getLevelFromXp,
  getXpToNextLevel,
  LEVELS,
  XP_REWARDS,
  STREAK_MILESTONES,
  STREAK_XP_REWARDS,
  DREAM_CATEGORY_LIST,
  DREAM_CATEGORIES,
  MAX_TITLE_LENGTH,
  MAX_WHY_LENGTH,
  MAX_ACTION_TEXT_LENGTH,
  MAX_JOURNAL_BODY_LENGTH,
  FREE_JOURNAL_DAILY_LIMIT,
} from '../convex/constants';

// ── getLevelFromXp ──────────────────────────────────────────────────────────

describe('getLevelFromXp', () => {
  it('returns level 1 for 0 XP', () => {
    const level = getLevelFromXp(0);
    expect(level.level).toBe(1);
    expect(level.title).toBe('Dreamer');
  });

  it('returns level 1 for XP below level 2 threshold', () => {
    expect(getLevelFromXp(50).level).toBe(1);
    expect(getLevelFromXp(99).level).toBe(1);
  });

  it('returns correct level at each exact threshold', () => {
    for (const entry of LEVELS) {
      expect(getLevelFromXp(entry.xp).level).toBe(entry.level);
    }
  });

  it('returns correct level just below each threshold', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      const belowThreshold = LEVELS[i].xp - 1;
      expect(getLevelFromXp(belowThreshold).level).toBe(LEVELS[i - 1].level);
    }
  });

  it('returns max level for XP at and above max threshold', () => {
    const maxLevel = LEVELS[LEVELS.length - 1];
    expect(getLevelFromXp(maxLevel.xp).level).toBe(maxLevel.level);
    expect(getLevelFromXp(maxLevel.xp + 1).level).toBe(maxLevel.level);
    expect(getLevelFromXp(999999).level).toBe(maxLevel.level);
  });

  it('returns level 1 for negative XP', () => {
    expect(getLevelFromXp(-1).level).toBe(1);
    expect(getLevelFromXp(-100).level).toBe(1);
  });

  it('returns correct title for mid-range XP', () => {
    expect(getLevelFromXp(500).title).toBe('Spark'); // level 3: 300-599
    expect(getLevelFromXp(1500).title).toBe('Risk Taker'); // level 5: 1000-1599
    expect(getLevelFromXp(3000).title).toBe('Adventurer'); // level 7: 2500-3999
  });
});

// ── getXpToNextLevel ────────────────────────────────────────────────────────

describe('getXpToNextLevel', () => {
  it('returns correct progress at 0 XP (level 1)', () => {
    const result = getXpToNextLevel(0);
    expect(result.current).toBe(0);
    expect(result.needed).toBe(100); // next level at 100
    expect(result.progress).toBe(0);
  });

  it('returns correct progress midway through level 1', () => {
    const result = getXpToNextLevel(50);
    expect(result.current).toBe(50);
    expect(result.needed).toBe(100);
    expect(result.progress).toBe(0.5);
  });

  it('returns 0 current at level boundary', () => {
    const result = getXpToNextLevel(100); // exactly level 2
    expect(result.current).toBe(0);
    expect(result.needed).toBe(200); // 300 - 100
    expect(result.progress).toBe(0);
  });

  it('returns progress = 1 and needed = 0 at max level', () => {
    const maxXp = LEVELS[LEVELS.length - 1].xp;
    const result = getXpToNextLevel(maxXp);
    expect(result.progress).toBe(1);
    expect(result.needed).toBe(0);
  });

  it('returns progress = 1 above max level XP', () => {
    const result = getXpToNextLevel(999999);
    expect(result.progress).toBe(1);
    expect(result.needed).toBe(0);
  });

  it('calculates correct progress for each level boundary', () => {
    for (let i = 0; i < LEVELS.length - 1; i++) {
      const currentLevelXp = LEVELS[i].xp;
      const nextLevelXp = LEVELS[i + 1].xp;
      const midpoint = currentLevelXp + Math.floor((nextLevelXp - currentLevelXp) / 2);

      const result = getXpToNextLevel(midpoint);
      expect(result.needed).toBe(nextLevelXp - currentLevelXp);
      expect(result.current).toBe(midpoint - currentLevelXp);
      expect(result.progress).toBeGreaterThan(0);
      expect(result.progress).toBeLessThan(1);
    }
  });

  it('progress is always between 0 and 1 (inclusive)', () => {
    const testXpValues = [0, 1, 50, 99, 100, 150, 299, 300, 600, 1000, 5000, 10000, 50000];
    for (const xp of testXpValues) {
      const result = getXpToNextLevel(xp);
      expect(result.progress).toBeGreaterThanOrEqual(0);
      expect(result.progress).toBeLessThanOrEqual(1);
    }
  });
});

// ── Constants Integrity ─────────────────────────────────────────────────────

describe('Constants integrity', () => {
  describe('LEVELS', () => {
    it('has 10 levels', () => {
      expect(LEVELS).toHaveLength(10);
    });

    it('levels are sequential starting from 1', () => {
      LEVELS.forEach((entry, i) => {
        expect(entry.level).toBe(i + 1);
      });
    });

    it('XP thresholds are strictly increasing', () => {
      for (let i = 1; i < LEVELS.length; i++) {
        expect(LEVELS[i].xp).toBeGreaterThan(LEVELS[i - 1].xp);
      }
    });

    it('level 1 starts at 0 XP', () => {
      expect(LEVELS[0].xp).toBe(0);
    });

    it('every level has a non-empty title', () => {
      for (const entry of LEVELS) {
        expect(entry.title.length).toBeGreaterThan(0);
      }
    });
  });

  describe('XP_REWARDS', () => {
    it('all rewards are positive integers', () => {
      for (const [, value] of Object.entries(XP_REWARDS)) {
        expect(value).toBeGreaterThan(0);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('dream completion rewards more than action completion', () => {
      expect(XP_REWARDS.dreamComplete).toBeGreaterThan(XP_REWARDS.actionComplete);
    });

    it('onboarding gives a meaningful starting boost', () => {
      expect(XP_REWARDS.onboardingComplete).toBeGreaterThanOrEqual(50);
    });
  });

  describe('STREAK_MILESTONES', () => {
    it('milestones are in ascending order', () => {
      for (let i = 1; i < STREAK_MILESTONES.length; i++) {
        expect(STREAK_MILESTONES[i]).toBeGreaterThan(STREAK_MILESTONES[i - 1]);
      }
    });

    it('every milestone has a corresponding XP reward', () => {
      for (const milestone of STREAK_MILESTONES) {
        expect(STREAK_XP_REWARDS[milestone]).toBeDefined();
        expect(STREAK_XP_REWARDS[milestone]).toBeGreaterThan(0);
      }
    });

    it('higher milestones give more XP', () => {
      for (let i = 1; i < STREAK_MILESTONES.length; i++) {
        const prev = STREAK_XP_REWARDS[STREAK_MILESTONES[i - 1]];
        const curr = STREAK_XP_REWARDS[STREAK_MILESTONES[i]];
        expect(curr).toBeGreaterThan(prev);
      }
    });
  });

  describe('DREAM_CATEGORIES', () => {
    it('every category in the list has display metadata', () => {
      for (const cat of DREAM_CATEGORY_LIST) {
        expect(DREAM_CATEGORIES[cat]).toBeDefined();
        expect(DREAM_CATEGORIES[cat].label).toBeTruthy();
        expect(DREAM_CATEGORIES[cat].icon).toBeTruthy();
        expect(DREAM_CATEGORIES[cat].color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it('includes custom category', () => {
      expect(DREAM_CATEGORY_LIST).toContain('custom');
    });
  });

  describe('Limits', () => {
    it('text limits are reasonable', () => {
      expect(MAX_TITLE_LENGTH).toBeGreaterThanOrEqual(50);
      expect(MAX_WHY_LENGTH).toBeGreaterThanOrEqual(100);
      expect(MAX_ACTION_TEXT_LENGTH).toBeGreaterThanOrEqual(50);
      expect(MAX_JOURNAL_BODY_LENGTH).toBeGreaterThanOrEqual(1000);
    });

    it('free journal daily limit is at least 1', () => {
      expect(FREE_JOURNAL_DAILY_LIMIT).toBeGreaterThanOrEqual(1);
    });
  });
});
