/**
 * Badge condition logic tests.
 *
 * Tests REAL functions from the codebase:
 * - getLocalHour from convex/dates.ts
 * - isEarlyBird, isNightOwl from convex/constants.ts
 * - EARLY_BIRD_HOUR, NIGHT_OWL_HOUR, PERMISSION_GRANTED_WINDOW_MS,
 *   LASER_FOCUSED_THRESHOLD from convex/constants.ts
 */
import { getLocalHour } from '../convex/dates';
import {
  isEarlyBird,
  isNightOwl,
  EARLY_BIRD_HOUR,
  NIGHT_OWL_HOUR,
  PERMISSION_GRANTED_WINDOW_MS,
  LASER_FOCUSED_THRESHOLD,
} from '../convex/constants';

// ── getLocalHour (REAL from convex/dates.ts) ────────────────────────────────

describe('getLocalHour', () => {
  it('returns UTC hour when offset is 0', () => {
    const now = new Date('2025-06-15T14:30:00Z').getTime();
    expect(getLocalHour(now, 0)).toBe(14);
  });

  it('converts UTC to EST (offset = +300)', () => {
    const now = new Date('2025-06-15T14:30:00Z').getTime();
    expect(getLocalHour(now, 300)).toBe(9);
  });

  it('converts UTC to JST (offset = -540)', () => {
    const now = new Date('2025-06-15T14:30:00Z').getTime();
    expect(getLocalHour(now, -540)).toBe(23);
  });

  it('handles midnight crossing (wraps back)', () => {
    const now = new Date('2025-06-15T03:00:00Z').getTime();
    expect(getLocalHour(now, 300)).toBe(22);
  });

  it('handles day-forward crossing (wraps forward)', () => {
    const now = new Date('2025-06-15T20:00:00Z').getTime();
    expect(getLocalHour(now, -540)).toBe(5);
  });
});

// ── isEarlyBird (REAL from convex/constants.ts) ─────────────────────────────

describe('isEarlyBird', () => {
  it('returns true for hours 0 through EARLY_BIRD_HOUR-1', () => {
    for (let h = 0; h < EARLY_BIRD_HOUR; h++) {
      expect(isEarlyBird(h)).toBe(true);
    }
  });

  it('returns false at EARLY_BIRD_HOUR boundary', () => {
    expect(isEarlyBird(EARLY_BIRD_HOUR)).toBe(false);
  });

  it('returns false for all hours >= EARLY_BIRD_HOUR', () => {
    for (let h = EARLY_BIRD_HOUR; h < 24; h++) {
      expect(isEarlyBird(h)).toBe(false);
    }
  });
});

// ── isNightOwl (REAL from convex/constants.ts) ──────────────────────────────

describe('isNightOwl', () => {
  it('returns true for hours >= NIGHT_OWL_HOUR', () => {
    expect(isNightOwl(NIGHT_OWL_HOUR)).toBe(true);
    expect(isNightOwl(23)).toBe(true);
  });

  it('returns false at NIGHT_OWL_HOUR-1 boundary', () => {
    expect(isNightOwl(NIGHT_OWL_HOUR - 1)).toBe(false);
  });

  it('returns false for all hours < NIGHT_OWL_HOUR', () => {
    for (let h = 0; h < NIGHT_OWL_HOUR; h++) {
      expect(isNightOwl(h)).toBe(false);
    }
  });
});

// ── End-to-end timezone scenarios using REAL getLocalHour + badge checks ────

describe('Badge timezone scenarios', () => {
  it('NYC 6am action triggers early bird', () => {
    const now = new Date('2025-06-15T11:00:00Z').getTime();
    const localHour = getLocalHour(now, 300);
    expect(localHour).toBe(6);
    expect(isEarlyBird(localHour)).toBe(true);
    expect(isNightOwl(localHour)).toBe(false);
  });

  it('Tokyo 11pm action triggers night owl', () => {
    const now = new Date('2025-06-15T14:00:00Z').getTime();
    const localHour = getLocalHour(now, -540);
    expect(localHour).toBe(23);
    expect(isNightOwl(localHour)).toBe(true);
    expect(isEarlyBird(localHour)).toBe(false);
  });

  it('London noon triggers neither badge', () => {
    const now = new Date('2025-06-15T12:00:00Z').getTime();
    const localHour = getLocalHour(now, 0);
    expect(localHour).toBe(12);
    expect(isEarlyBird(localHour)).toBe(false);
    expect(isNightOwl(localHour)).toBe(false);
  });

  it('midnight is early bird, not night owl', () => {
    expect(isEarlyBird(0)).toBe(true);
    expect(isNightOwl(0)).toBe(false);
  });
});

// ── Badge condition constants (REAL from convex/constants.ts) ───────────────

describe('Badge condition constants', () => {
  it('EARLY_BIRD_HOUR is before business hours', () => {
    expect(EARLY_BIRD_HOUR).toBe(8);
  });

  it('NIGHT_OWL_HOUR is late evening', () => {
    expect(NIGHT_OWL_HOUR).toBe(22);
  });

  it('PERMISSION_GRANTED_WINDOW_MS is 24 hours', () => {
    expect(PERMISSION_GRANTED_WINDOW_MS).toBe(24 * 60 * 60 * 1000);
  });

  it('LASER_FOCUSED_THRESHOLD is 10 actions', () => {
    expect(LASER_FOCUSED_THRESHOLD).toBe(10);
  });
});
