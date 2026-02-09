/**
 * Tests for getCategoryConfig — resolves display metadata
 * for both built-in and custom dream categories.
 */
import { getCategoryConfig, DREAM_CATEGORIES, DREAM_CATEGORY_LIST } from '../constants/dreams';

describe('getCategoryConfig', () => {
  describe('built-in categories', () => {
    it('returns correct config for each built-in category', () => {
      for (const category of DREAM_CATEGORY_LIST) {
        if (category === 'custom') continue;
        const config = getCategoryConfig({ category });
        expect(config.label).toBe(DREAM_CATEGORIES[category].label);
        expect(config.icon).toBe(DREAM_CATEGORIES[category].icon);
        expect(config.color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it('returns travel config', () => {
      const config = getCategoryConfig({ category: 'travel' });
      expect(config.label).toBe('Travel');
      expect(config.icon).toBe('airplane');
    });

    it('returns career config', () => {
      const config = getCategoryConfig({ category: 'career' });
      expect(config.label).toBe('Career');
    });

    it('falls back to growth for unknown categories', () => {
      const config = getCategoryConfig({ category: 'nonexistent' });
      expect(config.label).toBe(DREAM_CATEGORIES.growth.label);
      expect(config.icon).toBe(DREAM_CATEGORIES.growth.icon);
    });
  });

  describe('custom categories', () => {
    it('uses custom name when provided', () => {
      const config = getCategoryConfig({
        category: 'custom',
        customCategoryName: 'Fitness',
      });
      expect(config.label).toBe('Fitness');
    });

    it('uses custom icon when provided', () => {
      const config = getCategoryConfig({
        category: 'custom',
        customCategoryIcon: 'flame.fill',
      });
      expect(config.icon).toBe('flame.fill');
    });

    it('uses custom color when provided', () => {
      const config = getCategoryConfig({
        category: 'custom',
        customCategoryColor: '#ff0000',
      });
      expect(config.color).toBe('#ff0000');
    });

    it('falls back to defaults when custom fields are missing', () => {
      const config = getCategoryConfig({ category: 'custom' });
      expect(config.label).toBe('Custom');
      expect(config.icon).toBe('star.fill');
      expect(config.color).toBe('#8b8b8b');
    });

    it('falls back to defaults when custom fields are undefined', () => {
      const config = getCategoryConfig({
        category: 'custom',
        customCategoryName: undefined,
        customCategoryIcon: undefined,
        customCategoryColor: undefined,
      });
      expect(config.label).toBe('Custom');
      expect(config.icon).toBe('star.fill');
      expect(config.color).toBe('#8b8b8b');
    });

    it('uses all custom fields together', () => {
      const config = getCategoryConfig({
        category: 'custom',
        customCategoryName: 'Fitness',
        customCategoryIcon: 'flame.fill',
        customCategoryColor: '#e74c3c',
      });
      expect(config).toEqual({
        label: 'Fitness',
        icon: 'flame.fill',
        color: '#e74c3c',
      });
    });
  });
});
