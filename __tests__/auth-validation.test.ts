/**
 * Auth validation tests.
 *
 * Tests the REAL validation functions from convex/validation.ts —
 * the same functions used by sign-up.tsx and backend mutations.
 */
import {
  validatePassword,
  validateUsername,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  USERNAME_REGEX,
} from '../convex/validation';

// ── validatePassword ────────────────────────────────────────────────────────

describe('validatePassword', () => {
  it('rejects empty password', () => {
    expect(validatePassword('').valid).toBe(false);
  });

  it('rejects passwords shorter than MIN_PASSWORD_LENGTH', () => {
    expect(validatePassword('short').valid).toBe(false);
    expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH - 1)).valid).toBe(false);
  });

  it('accepts passwords at exactly MIN_PASSWORD_LENGTH', () => {
    expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH)).valid).toBe(true);
  });

  it('accepts passwords within valid range', () => {
    expect(validatePassword('validPassword123').valid).toBe(true);
    expect(validatePassword('a'.repeat(50)).valid).toBe(true);
  });

  it('accepts passwords at exactly MAX_PASSWORD_LENGTH', () => {
    expect(validatePassword('a'.repeat(MAX_PASSWORD_LENGTH)).valid).toBe(true);
  });

  it('rejects passwords exceeding MAX_PASSWORD_LENGTH', () => {
    expect(validatePassword('a'.repeat(MAX_PASSWORD_LENGTH + 1)).valid).toBe(false);
  });

  it('returns descriptive error for too-short password', () => {
    const result = validatePassword('short');
    expect(result.error).toContain(`${MIN_PASSWORD_LENGTH}`);
  });

  it('returns descriptive error for too-long password', () => {
    const result = validatePassword('a'.repeat(MAX_PASSWORD_LENGTH + 1));
    expect(result.error).toContain(`${MAX_PASSWORD_LENGTH}`);
  });
});

// ── validateUsername ─────────────────────────────────────────────────────────

describe('validateUsername', () => {
  it('rejects empty username', () => {
    expect(validateUsername('').valid).toBe(false);
  });

  it('rejects usernames shorter than MIN_USERNAME_LENGTH', () => {
    expect(validateUsername('a').valid).toBe(false);
    expect(validateUsername('ab').valid).toBe(false);
  });

  it('accepts usernames at exactly MIN_USERNAME_LENGTH', () => {
    expect(validateUsername('abc').valid).toBe(true);
  });

  it('accepts valid usernames within range', () => {
    expect(validateUsername('user123').valid).toBe(true);
    expect(validateUsername('a'.repeat(MAX_USERNAME_LENGTH)).valid).toBe(true);
  });

  it('rejects usernames exceeding MAX_USERNAME_LENGTH', () => {
    expect(validateUsername('a'.repeat(MAX_USERNAME_LENGTH + 1)).valid).toBe(false);
  });

  it('accepts underscores and hyphens', () => {
    expect(validateUsername('user_name').valid).toBe(true);
    expect(validateUsername('user-name').valid).toBe(true);
    expect(validateUsername('_under_').valid).toBe(true);
  });

  it('rejects spaces', () => {
    expect(validateUsername('user name').valid).toBe(false);
  });

  it('rejects special characters', () => {
    expect(validateUsername('user@name').valid).toBe(false);
    expect(validateUsername('user.name').valid).toBe(false);
    expect(validateUsername('user!name').valid).toBe(false);
    expect(validateUsername('user#name').valid).toBe(false);
  });

  it('returns descriptive error for invalid characters', () => {
    const result = validateUsername('user@name');
    expect(result.error).toContain('letters, numbers, underscores, and hyphens');
  });
});

// ── Constants integrity ────────────────────────────────────────────────────

describe('Auth validation constants', () => {
  it('MIN_PASSWORD_LENGTH is 10', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(10);
  });

  it('MAX_PASSWORD_LENGTH is 128', () => {
    expect(MAX_PASSWORD_LENGTH).toBe(128);
  });

  it('MIN_USERNAME_LENGTH is 3', () => {
    expect(MIN_USERNAME_LENGTH).toBe(3);
  });

  it('MAX_USERNAME_LENGTH is 20', () => {
    expect(MAX_USERNAME_LENGTH).toBe(20);
  });

  it('USERNAME_REGEX matches expected pattern', () => {
    expect(USERNAME_REGEX.test('abc123')).toBe(true);
    expect(USERNAME_REGEX.test('a_b-c')).toBe(true);
    expect(USERNAME_REGEX.test('a b')).toBe(false);
    expect(USERNAME_REGEX.test('a@b')).toBe(false);
  });
});
