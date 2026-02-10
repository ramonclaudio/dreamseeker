/**
 * Seed data integrity tests.
 *
 * Validates that community seed data (users + pins) is well-formed before
 * it hits the database. Catches broken URLs, out-of-bounds indices, and
 * missing fields early.
 */

// The seed arrays aren't exported, so we import the file and pull data via the module internals.
// Instead, we duplicate the structural checks against the raw constants file.
// This is intentional: the test validates the DATA, not the seed function.

import * as fs from 'fs';
import * as path from 'path';

const seedSource = fs.readFileSync(path.resolve(__dirname, '../convex/seed.ts'), 'utf-8');

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Extract the data array literal (after `= [`) from source starting at the marker. */
function extractArrayBlock(source: string, startMarker: string): string {
  const start = source.indexOf(startMarker);
  if (start === -1) throw new Error(`Marker not found: ${startMarker}`);
  // Find the `= [` assignment to skip past type annotations like `{...}[] = [`
  const assignIdx = source.indexOf('= [', start);
  if (assignIdx === -1) throw new Error(`No array assignment found after: ${startMarker}`);
  const arrayStart = assignIdx + 2; // position of `[`
  let depth = 1;
  for (let i = arrayStart + 1; i < source.length; i++) {
    if (source[i] === '[') depth++;
    if (source[i] === ']') depth--;
    if (depth === 0) return source.slice(arrayStart, i + 1);
  }
  throw new Error('Unterminated array');
}

// ── SEED_USERS ──────────────────────────────────────────────────────────────

describe('SEED_USERS integrity', () => {
  it('has exactly 6 seed users', () => {
    const matches = seedSource.match(/id:\s*'seed_\w+'/g);
    expect(matches).toHaveLength(6);
  });

  it('all users have id, username, displayName, and bio', () => {
    const userBlock = extractArrayBlock(seedSource, 'const SEED_USERS');
    // Each user object must contain these required keys
    const ids = userBlock.match(/id:\s*'seed_\w+'/g)!;
    const usernames = userBlock.match(/username:\s*'/g)!;
    const displayNames = userBlock.match(/displayName:\s*'/g)!;
    const bios = userBlock.match(/bio:\s*['"]/g)!;
    expect(ids.length).toBe(6);
    expect(usernames.length).toBe(6);
    expect(displayNames.length).toBe(6);
    expect(bios.length).toBe(6);
  });

  it('all 6 users have avatarUrl and bannerUrl', () => {
    const userBlock = extractArrayBlock(seedSource, 'const SEED_USERS');
    const avatars = userBlock.match(/avatarUrl:\s*'/g) ?? [];
    const banners = userBlock.match(/bannerUrl:\s*'/g) ?? [];
    expect(avatars.length).toBe(6);
    expect(banners.length).toBe(6);
  });

  it('all avatar URLs are valid Unsplash CDN URLs', () => {
    const urls = seedSource.match(/avatarUrl:\s*'(https:\/\/images\.unsplash\.com\/[^']+)'/g) ?? [];
    for (const match of urls) {
      const url = match.replace(/avatarUrl:\s*'/, '').replace(/'$/, '');
      expect(url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
      expect(url).toContain('w=200'); // Avatars should request small size
    }
  });

  it('all banner URLs are valid Unsplash CDN URLs', () => {
    const urls = seedSource.match(/bannerUrl:\s*'(https:\/\/images\.unsplash\.com\/[^']+)'/g) ?? [];
    for (const match of urls) {
      const url = match.replace(/bannerUrl:\s*'/, '').replace(/'$/, '');
      expect(url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
      expect(url).toContain('w=800'); // Banners should request larger size
    }
  });

  it('all user IDs start with seed_ prefix', () => {
    const ids = seedSource.match(/id:\s*'(seed_\w+)'/g)!;
    for (const id of ids) {
      expect(id).toMatch(/id:\s*'seed_/);
    }
  });
});

// ── COMMUNITY_PINS ──────────────────────────────────────────────────────────

describe('COMMUNITY_PINS integrity', () => {
  it('has at least 10 community pins', () => {
    const pinBlock = extractArrayBlock(seedSource, 'const COMMUNITY_PINS');
    const titles = pinBlock.match(/title:\s*'/g)!;
    expect(titles.length).toBeGreaterThanOrEqual(10);
  });

  it('all pin userIndex values are within SEED_USERS bounds (0-5)', () => {
    const pinBlock = extractArrayBlock(seedSource, 'const COMMUNITY_PINS');
    const indices = pinBlock.match(/userIndex:\s*(\d+)/g)!;
    for (const match of indices) {
      const idx = parseInt(match.replace('userIndex: ', ''), 10);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThanOrEqual(5);
    }
  });

  it('all pin types are image or win', () => {
    const pinBlock = extractArrayBlock(seedSource, 'const COMMUNITY_PINS');
    const types = pinBlock.match(/type:\s*'(\w+)'/g)!;
    for (const match of types) {
      const type = match.replace(/type:\s*'/, '').replace(/'$/, '');
      expect(['image', 'win']).toContain(type);
    }
  });

  it('all pin categories are valid dream categories', () => {
    const validCategories = [
      'travel', 'money', 'career', 'lifestyle', 'growth', 'relationships',
      'health', 'education', 'creative', 'social', 'custom',
    ];
    const pinBlock = extractArrayBlock(seedSource, 'const COMMUNITY_PINS');
    const categories = pinBlock.match(/category:\s*'(\w+)'/g)!;
    for (const match of categories) {
      const cat = match.replace(/category:\s*'/, '').replace(/'$/, '');
      expect(validCategories).toContain(cat);
    }
  });

  it('all pin image URLs are valid Unsplash CDN URLs', () => {
    const pinBlock = extractArrayBlock(seedSource, 'const COMMUNITY_PINS');
    const urls = pinBlock.match(/linkImageUrl:\s*'(https:\/\/images\.unsplash\.com\/[^']+)'/g)!;
    expect(urls.length).toBeGreaterThanOrEqual(10);
    for (const match of urls) {
      const url = match.replace(/linkImageUrl:\s*'/, '').replace(/'$/, '');
      expect(url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
      expect(url).toContain('w=800');
    }
  });

  it('all imageAspectRatio values are positive numbers', () => {
    const pinBlock = extractArrayBlock(seedSource, 'const COMMUNITY_PINS');
    const ratios = pinBlock.match(/imageAspectRatio:\s*([\d.]+)/g)!;
    for (const match of ratios) {
      const ratio = parseFloat(match.replace('imageAspectRatio: ', ''));
      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThan(3); // Reasonable aspect ratio range
    }
  });

  it('majority of pins are travel category (>50%)', () => {
    const pinBlock = extractArrayBlock(seedSource, 'const COMMUNITY_PINS');
    const allCategories = pinBlock.match(/category:\s*'(\w+)'/g)!;
    const travelCount = allCategories.filter((c) => c.includes('travel')).length;
    expect(travelCount / allCategories.length).toBeGreaterThan(0.5);
  });

  it('all tags arrays have 3 entries each', () => {
    const pinBlock = extractArrayBlock(seedSource, 'const COMMUNITY_PINS');
    // Match tags arrays: tags: ['x', 'y', 'z']
    const tagArrays = pinBlock.match(/tags:\s*\[([^\]]+)\]/g)!;
    for (const match of tagArrays) {
      const tags = match.match(/'[^']+'/g)!;
      expect(tags.length).toBe(3);
    }
  });
});
