import { WEEKLY_CHALLENGES } from '../convex/constants';

describe('WEEKLY_CHALLENGES', () => {
  it('has at least 5 challenges for meaningful rotation', () => {
    expect(WEEKLY_CHALLENGES.length).toBeGreaterThanOrEqual(5);
  });

  it('every challenge has a non-empty quote', () => {
    for (const challenge of WEEKLY_CHALLENGES) {
      expect(challenge.quote.length).toBeGreaterThan(0);
    }
  });

  it('every challenge has a unique id', () => {
    const ids = WEEKLY_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every challenge has a non-empty theme', () => {
    for (const challenge of WEEKLY_CHALLENGES) {
      expect(challenge.theme.length).toBeGreaterThan(0);
    }
  });

  it('rotation logic cycles through all challenges', () => {
    const seen = new Set<string>();
    for (let week = 0; week < WEEKLY_CHALLENGES.length; week++) {
      const challenge = WEEKLY_CHALLENGES[week % WEEKLY_CHALLENGES.length];
      seen.add(challenge.id);
    }
    expect(seen.size).toBe(WEEKLY_CHALLENGES.length);
  });

  it('rotation wraps correctly', () => {
    const len = WEEKLY_CHALLENGES.length;
    expect(WEEKLY_CHALLENGES[0]).toBe(WEEKLY_CHALLENGES[len % len]);
    expect(WEEKLY_CHALLENGES[0]).toBe(WEEKLY_CHALLENGES[(len * 2) % len]);
  });
});
