/**
 * Input validation tests.
 *
 * Tests the REAL validation functions exported from convex/validation.ts.
 * These are the same functions used by every mutation in the backend.
 */
import {
  requireText,
  checkLength,
  validateTags,
  validatePushToken,
  sanitizeActions,
} from '../convex/validation';
import {
  MAX_TITLE_LENGTH,
  MAX_WHY_LENGTH,
  MAX_ACTION_TEXT_LENGTH,
  MAX_JOURNAL_BODY_LENGTH,
  MAX_TAGS_COUNT,
  MAX_TAG_LENGTH,
  MAX_REFLECTION_LENGTH,
  MAX_CUSTOM_CATEGORY_NAME_LENGTH,
  MAX_CUSTOM_CATEGORY_COLOR_LENGTH,
} from '../convex/constants';

// ── requireText ─────────────────────────────────────────────────────────────

describe('requireText', () => {
  it('returns trimmed text for valid input', () => {
    expect(requireText('  hello  ', 100, 'Field')).toBe('hello');
  });

  it('throws on empty string', () => {
    expect(() => requireText('', 100, 'Title')).toThrow('Title cannot be empty');
  });

  it('throws on whitespace-only string', () => {
    expect(() => requireText('   ', 100, 'Title')).toThrow('Title cannot be empty');
  });

  it('throws on text exceeding max length', () => {
    expect(() => requireText('a'.repeat(201), 200, 'Title')).toThrow('Title cannot exceed 200 characters');
  });

  it('accepts text at exactly max length', () => {
    expect(requireText('a'.repeat(200), 200, 'Title')).toBe('a'.repeat(200));
  });

  it('trims before checking length', () => {
    // 200 chars + spaces should pass since spaces are trimmed
    const text = '  ' + 'a'.repeat(200) + '  ';
    expect(requireText(text, 200, 'Title')).toBe('a'.repeat(200));
  });

  it('includes field name in error messages', () => {
    expect(() => requireText('', 100, 'Dream title')).toThrow('Dream title cannot be empty');
    expect(() => requireText('x'.repeat(101), 100, 'Action text')).toThrow('Action text cannot exceed 100 characters');
  });

  // Real-world field limits
  it('validates dream titles against MAX_TITLE_LENGTH', () => {
    expect(requireText('Travel to Japan', MAX_TITLE_LENGTH, 'Dream title')).toBe('Travel to Japan');
    expect(() => requireText('a'.repeat(MAX_TITLE_LENGTH + 1), MAX_TITLE_LENGTH, 'Dream title')).toThrow();
  });

  it('validates journal body against MAX_JOURNAL_BODY_LENGTH', () => {
    expect(requireText('Today was great', MAX_JOURNAL_BODY_LENGTH, 'Body')).toBe('Today was great');
    expect(() => requireText('a'.repeat(MAX_JOURNAL_BODY_LENGTH + 1), MAX_JOURNAL_BODY_LENGTH, 'Body')).toThrow();
  });

  it('validates action text against MAX_ACTION_TEXT_LENGTH', () => {
    expect(requireText('Book a flight', MAX_ACTION_TEXT_LENGTH, 'Action text')).toBe('Book a flight');
    expect(() => requireText('a'.repeat(MAX_ACTION_TEXT_LENGTH + 1), MAX_ACTION_TEXT_LENGTH, 'Action text')).toThrow();
  });

  it('validates reflection against MAX_REFLECTION_LENGTH', () => {
    expect(requireText('I learned a lot', MAX_REFLECTION_LENGTH, 'Reflection')).toBe('I learned a lot');
    expect(() => requireText('a'.repeat(MAX_REFLECTION_LENGTH + 1), MAX_REFLECTION_LENGTH, 'Reflection')).toThrow();
  });
});

// ── checkLength ─────────────────────────────────────────────────────────────

describe('checkLength', () => {
  it('does nothing for undefined', () => {
    expect(() => checkLength(undefined, 100, 'Field')).not.toThrow();
  });

  it('does nothing for empty string (falsy)', () => {
    expect(() => checkLength('', 100, 'Field')).not.toThrow();
  });

  it('does nothing for text within limit', () => {
    expect(() => checkLength('hello', 100, 'Field')).not.toThrow();
  });

  it('throws on text exceeding max length', () => {
    expect(() => checkLength('a'.repeat(501), 500, 'Why')).toThrow('Why cannot exceed 500 characters');
  });

  it('accepts text at exactly max length', () => {
    expect(() => checkLength('a'.repeat(500), 500, 'Why')).not.toThrow();
  });

  // Real-world field limits
  it('validates whyItMatters against MAX_WHY_LENGTH', () => {
    expect(() => checkLength('x'.repeat(MAX_WHY_LENGTH + 1), MAX_WHY_LENGTH, '"Why it matters"')).toThrow();
  });

  it('validates customCategoryName against limit', () => {
    expect(() => checkLength('x'.repeat(MAX_CUSTOM_CATEGORY_NAME_LENGTH + 1), MAX_CUSTOM_CATEGORY_NAME_LENGTH, 'Custom category name')).toThrow();
  });

  it('validates customCategoryColor against limit', () => {
    expect(() => checkLength('x'.repeat(MAX_CUSTOM_CATEGORY_COLOR_LENGTH + 1), MAX_CUSTOM_CATEGORY_COLOR_LENGTH, 'Custom category color')).toThrow();
  });
});

// ── validateTags ────────────────────────────────────────────────────────────

describe('validateTags', () => {
  it('returns cleaned tags for valid input', () => {
    expect(validateTags(['goal', 'motivation'], 20, 50)).toEqual(['goal', 'motivation']);
  });

  it('trims whitespace from tags', () => {
    expect(validateTags(['  goal  ', ' focus '], 20, 50)).toEqual(['goal', 'focus']);
  });

  it('filters out empty tags after trimming', () => {
    expect(validateTags(['valid', '  ', '', 'another'], 20, 50)).toEqual(['valid', 'another']);
  });

  it('throws on too many tags', () => {
    const tags = Array.from({ length: MAX_TAGS_COUNT + 1 }, (_, i) => `tag${i}`);
    expect(() => validateTags(tags, MAX_TAGS_COUNT, MAX_TAG_LENGTH)).toThrow(`Cannot have more than ${MAX_TAGS_COUNT} tags`);
  });

  it('accepts exactly MAX_TAGS_COUNT tags', () => {
    const tags = Array.from({ length: MAX_TAGS_COUNT }, (_, i) => `tag${i}`);
    expect(validateTags(tags, MAX_TAGS_COUNT, MAX_TAG_LENGTH)).toHaveLength(MAX_TAGS_COUNT);
  });

  it('throws on individual tag exceeding max length', () => {
    expect(() => validateTags(['x'.repeat(MAX_TAG_LENGTH + 1)], MAX_TAGS_COUNT, MAX_TAG_LENGTH)).toThrow(`Tag cannot exceed ${MAX_TAG_LENGTH} characters`);
  });

  it('accepts tag at exactly max length', () => {
    expect(validateTags(['x'.repeat(MAX_TAG_LENGTH)], 20, MAX_TAG_LENGTH)).toHaveLength(1);
  });

  it('returns empty array for all-empty tags', () => {
    expect(validateTags(['', '  ', ''], 20, 50)).toEqual([]);
  });
});

// ── validatePushToken ───────────────────────────────────────────────────────

describe('validatePushToken', () => {
  it('accepts valid Expo push token', () => {
    expect(() => validatePushToken('ExponentPushToken[xxxxxx-xxxxxxx-xxxxx]')).not.toThrow();
  });

  it('throws on token without Expo prefix', () => {
    expect(() => validatePushToken('fcm-token-here')).toThrow('Invalid token format');
  });

  it('throws on empty string', () => {
    expect(() => validatePushToken('')).toThrow('Invalid token format');
  });

  it('throws on token over 200 chars', () => {
    const longToken = 'ExponentPushToken[' + 'x'.repeat(200) + ']';
    expect(() => validatePushToken(longToken)).toThrow('Invalid token');
  });

  it('accepts token at exactly 200 chars', () => {
    const token = 'ExponentPushToken[' + 'x'.repeat(181) + ']'; // 18 + 181 + 1 = 200
    expect(() => validatePushToken(token)).not.toThrow();
  });

  it('throws on APNs device token', () => {
    expect(() => validatePushToken('abc123def456')).toThrow('Invalid token format');
  });

  it('accepts minimal valid token', () => {
    expect(() => validatePushToken('ExponentPushToken[x]')).not.toThrow();
  });

  it('accepts token with just the prefix', () => {
    expect(() => validatePushToken('ExponentPushToken[')).not.toThrow();
  });
});

// ── sanitizeActions ─────────────────────────────────────────────────────────

describe('sanitizeActions', () => {
  it('returns trimmed, non-empty actions', () => {
    expect(sanitizeActions(['  Book flight  ', '  ', 'Pack bags'], 20, 300)).toEqual(['Book flight', 'Pack bags']);
  });

  it('throws on too many actions', () => {
    const actions = Array.from({ length: 21 }, (_, i) => `Action ${i}`);
    expect(() => sanitizeActions(actions, 20, 300)).toThrow('Too many initial actions');
  });

  it('accepts exactly 20 actions', () => {
    const actions = Array.from({ length: 20 }, (_, i) => `Action ${i}`);
    expect(sanitizeActions(actions, 20, 300)).toHaveLength(20);
  });

  it('filters out empty strings', () => {
    expect(sanitizeActions(['Valid', '', '  '], 20, 300)).toEqual(['Valid']);
  });

  it('filters out actions exceeding max text length', () => {
    expect(sanitizeActions(['Short', 'x'.repeat(301)], 20, 300)).toEqual(['Short']);
  });

  it('accepts action at exactly max text length', () => {
    const result = sanitizeActions(['x'.repeat(300)], 20, 300);
    expect(result).toHaveLength(1);
  });

  it('returns empty array when all actions are empty', () => {
    expect(sanitizeActions(['', '  ', ''], 20, 300)).toEqual([]);
  });
});
