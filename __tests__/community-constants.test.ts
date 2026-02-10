import {
  MAX_BIO_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  FEED_PAGE_SIZE,
  getLevelFromXp,
  LEVELS,
} from '../convex/constants';

describe('Community constants', () => {
  describe('Profile limits', () => {
    it('bio length is reasonable (100-500)', () => {
      expect(MAX_BIO_LENGTH).toBeGreaterThanOrEqual(100);
      expect(MAX_BIO_LENGTH).toBeLessThanOrEqual(500);
    });

    it('display name length is reasonable (20-100)', () => {
      expect(MAX_DISPLAY_NAME_LENGTH).toBeGreaterThanOrEqual(20);
      expect(MAX_DISPLAY_NAME_LENGTH).toBeLessThanOrEqual(100);
    });
  });

  describe('Feed limits', () => {
    it('feed page size is reasonable', () => {
      expect(FEED_PAGE_SIZE).toBeGreaterThanOrEqual(10);
      expect(FEED_PAGE_SIZE).toBeLessThanOrEqual(100);
    });

  });

  describe('Reaction emoji values', () => {
    const VALID_EMOJIS = ['fire', 'heart', 'clap'] as const;

    it('has exactly 3 emoji options', () => {
      expect(VALID_EMOJIS).toHaveLength(3);
    });

    it('all emoji keys are lowercase alpha', () => {
      for (const emoji of VALID_EMOJIS) {
        expect(emoji).toMatch(/^[a-z]+$/);
      }
    });
  });
});

describe('Level up detection logic', () => {
  it('level changes are detected at exact thresholds', () => {
    for (let i = 0; i < LEVELS.length - 1; i++) {
      const belowXp = LEVELS[i + 1].xp - 1;
      const atXp = LEVELS[i + 1].xp;
      expect(getLevelFromXp(belowXp).level).toBe(LEVELS[i].level);
      expect(getLevelFromXp(atXp).level).toBe(LEVELS[i + 1].level);
    }
  });

  it('getLevelFromXp returns correct title for level_up metadata', () => {
    for (const entry of LEVELS) {
      const result = getLevelFromXp(entry.xp);
      expect(result.title).toBe(entry.title);
      expect(result.level).toBe(entry.level);
    }
  });

  it('simulates level_up detection in awardXp pattern', () => {
    // Simulates the pattern: oldLevel -> newXp -> newLevel -> compare
    const oldXp = 95; // Level 1
    const xpReward = 10;
    const newXp = oldXp + xpReward; // 105 -> Level 2

    const oldLevel = getLevelFromXp(oldXp).level;
    const newLevel = getLevelFromXp(newXp).level;

    expect(oldLevel).toBe(1);
    expect(newLevel).toBe(2);
    expect(newLevel).toBeGreaterThan(oldLevel);
  });

  it('no false level_up when XP stays within same level', () => {
    const oldXp = 50; // Level 1
    const xpReward = 10;
    const newXp = oldXp + xpReward; // 60 -> still Level 1

    const oldLevel = getLevelFromXp(oldXp).level;
    const newLevel = getLevelFromXp(newXp).level;

    expect(oldLevel).toBe(1);
    expect(newLevel).toBe(1);
    expect(newLevel).toBe(oldLevel);
  });

  it('detects multi-level jumps', () => {
    const oldXp = 50; // Level 1
    const xpReward = 600; // Jump to 650 -> Level 4

    const oldLevel = getLevelFromXp(oldXp).level;
    const newLevel = getLevelFromXp(oldXp + xpReward).level;

    expect(oldLevel).toBe(1);
    expect(newLevel).toBe(4);
    expect(newLevel).toBeGreaterThan(oldLevel);
  });
});
