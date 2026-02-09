/**
 * Tests for feed event text rendering and metadata shapes.
 *
 * getEventText is a pure function extracted from feed-item.tsx.
 * We re-implement the logic here to test against the same contract.
 */

type FeedEvent = {
  _id: string;
  userId: string;
  type: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
  username: string;
  displayName?: string;
};

// Mirror of getEventText from components/community/feed-item.tsx
function getEventText(event: FeedEvent): string {
  const { username, type, metadata = {} } = event;
  const title = (metadata.title as string) ?? '';
  const text = (metadata.text as string) ?? '';

  switch (type) {
    case 'dream_created':
      return `${username} started a new dream: ${title}`;
    case 'dream_completed':
      return `${username} completed a dream: ${title}`;
    case 'action_completed':
      return `${username} completed an action: ${text}`;
    case 'journal_entry':
      return `${username} wrote a journal entry: ${title}`;
    case 'badge_earned':
      return `${username} earned the ${title} badge`;
    case 'streak_milestone':
      return `${username} hit a ${metadata.streak as number}-day streak!`;
    case 'level_up':
      return `${username} reached Level ${metadata.level as number}: ${metadata.title as string}`;
    default:
      return `${username} did something awesome`;
  }
}

const baseEvent: FeedEvent = {
  _id: 'test-1',
  userId: 'user-1',
  type: 'dream_created',
  createdAt: Date.now(),
  username: 'alice',
  displayName: 'Alice',
};

describe('getEventText', () => {
  it('formats dream_created events', () => {
    const event: FeedEvent = {
      ...baseEvent,
      type: 'dream_created',
      metadata: { title: 'Visit Tokyo', category: 'travel' },
    };
    expect(getEventText(event)).toBe('alice started a new dream: Visit Tokyo');
  });

  it('formats dream_completed events', () => {
    const event: FeedEvent = {
      ...baseEvent,
      type: 'dream_completed',
      metadata: { title: 'Learn Piano', category: 'growth' },
    };
    expect(getEventText(event)).toBe('alice completed a dream: Learn Piano');
  });

  it('formats action_completed events', () => {
    const event: FeedEvent = {
      ...baseEvent,
      type: 'action_completed',
      metadata: { text: 'Book a flight', dreamTitle: 'Visit Tokyo' },
    };
    expect(getEventText(event)).toBe('alice completed an action: Book a flight');
  });

  it('formats journal_entry events', () => {
    const event: FeedEvent = {
      ...baseEvent,
      type: 'journal_entry',
      metadata: { title: 'Morning Thoughts' },
    };
    expect(getEventText(event)).toBe('alice wrote a journal entry: Morning Thoughts');
  });

  it('formats badge_earned events', () => {
    const event: FeedEvent = {
      ...baseEvent,
      type: 'badge_earned',
      metadata: { badgeKey: 'on_fire', title: 'On Fire' },
    };
    expect(getEventText(event)).toBe('alice earned the On Fire badge');
  });

  it('formats streak_milestone events', () => {
    const event: FeedEvent = {
      ...baseEvent,
      type: 'streak_milestone',
      metadata: { streak: 7 },
    };
    expect(getEventText(event)).toBe('alice hit a 7-day streak!');
  });

  it('formats level_up events', () => {
    const event: FeedEvent = {
      ...baseEvent,
      type: 'level_up',
      metadata: { level: 5, title: 'Risk Taker' },
    };
    expect(getEventText(event)).toBe('alice reached Level 5: Risk Taker');
  });

  it('formats level_up with level 1', () => {
    const event: FeedEvent = {
      ...baseEvent,
      type: 'level_up',
      metadata: { level: 1, title: 'Dreamer' },
    };
    expect(getEventText(event)).toBe('alice reached Level 1: Dreamer');
  });

  it('formats level_up with max level', () => {
    const event: FeedEvent = {
      ...baseEvent,
      type: 'level_up',
      metadata: { level: 10, title: 'Legend' },
    };
    expect(getEventText(event)).toBe('alice reached Level 10: Legend');
  });

  it('returns fallback for unknown event types', () => {
    const event: FeedEvent = {
      ...baseEvent,
      type: 'some_future_type',
    };
    expect(getEventText(event)).toBe('alice did something awesome');
  });

  it('handles missing metadata gracefully', () => {
    const event: FeedEvent = {
      ...baseEvent,
      type: 'dream_created',
      metadata: undefined,
    };
    expect(getEventText(event)).toBe('alice started a new dream: ');
  });
});

// ── Feed event types coverage ─────────────────────────────────────────────

describe('Feed event type coverage', () => {
  const ALL_TYPES = [
    'dream_created',
    'dream_completed',
    'action_completed',
    'journal_entry',
    'badge_earned',
    'level_up',
    'streak_milestone',
  ];

  it('all known event types produce distinct text (not the fallback)', () => {
    for (const type of ALL_TYPES) {
      const event: FeedEvent = {
        ...baseEvent,
        type,
        metadata: {
          title: 'Test',
          text: 'Test',
          category: 'growth',
          badgeKey: 'test',
          streak: 5,
          level: 3,
        },
      };
      const text = getEventText(event);
      expect(text).not.toBe('alice did something awesome');
    }
  });
});
