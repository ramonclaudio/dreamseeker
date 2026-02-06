import { internalMutation } from './_generated/server';

// Seed all data (mindset moments + daily challenges)
export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      mindsetMoments: { seeded: false, count: 0 },
      dailyChallenges: { seeded: false, count: 0 },
    };

    // Seed mindset moments
    const existingQuote = await ctx.db.query('mindsetMoments').first();
    if (!existingQuote) {
      const quotes = [
        // Gabby Beckford quotes
        {
          quote:
            "Be confident, be delusional, and if you're not there yet—borrow some of the delusional confidence that I have in you.",
          author: 'Gabby Beckford',
          category: 'motivation',
        },
        {
          quote: 'Give yourself permission to live in your possibilities.',
          author: 'Gabby Beckford',
          category: 'mindset',
        },
        {
          quote: 'Seek risk. Seize opportunity. See the world.',
          author: 'Gabby Beckford',
          category: 'travel',
        },
        {
          quote: "I didn't have a dream job. I had a dream LIFE.",
          author: 'Gabby Beckford',
          category: 'lifestyle',
        },
        {
          quote: 'Done is better than perfect.',
          author: 'Gabby Beckford',
          category: 'action',
        },
        {
          quote: 'The people who show up consistently are the people who win.',
          author: 'Gabby Beckford',
          category: 'consistency',
        },
        {
          quote: "You don't have to have it all figured out to move forward.",
          author: 'Gabby Beckford',
          category: 'growth',
        },
        {
          quote: 'Your comfort zone is a beautiful place, but nothing ever grows there.',
          author: 'Gabby Beckford',
          category: 'growth',
        },
        {
          quote: "Stop waiting for the 'right time.' The right time is when you decide to start.",
          author: 'Gabby Beckford',
          category: 'action',
        },
        {
          quote: 'Travel taught me that I could be brave, resourceful, and resilient.',
          author: 'Gabby Beckford',
          category: 'travel',
        },
        {
          quote: "Your dreams are valid. Don't let anyone tell you otherwise.",
          author: 'Gabby Beckford',
          category: 'dreams',
        },
        {
          quote: 'The best investment you can make is in yourself.',
          author: 'Gabby Beckford',
          category: 'growth',
        },
        {
          quote: 'Every expert was once a beginner.',
          author: 'Gabby Beckford',
          category: 'growth',
        },
        {
          quote: 'Take the trip. Make the memory. Live the life.',
          author: 'Gabby Beckford',
          category: 'travel',
        },
        {
          quote: 'You are capable of more than you know. Believe it, then prove it.',
          author: 'Gabby Beckford',
          category: 'motivation',
        },
      ];

      for (const quote of quotes) {
        await ctx.db.insert('mindsetMoments', quote);
      }
      results.mindsetMoments = { seeded: true, count: quotes.length };
    }

    // Seed daily challenges
    const existingChallenge = await ctx.db.query('dailyChallenges').first();
    if (!existingChallenge) {
      const challenges = [
        // Travel challenges
        {
          title: 'Research Your Dream Destination',
          description: 'Spend 10 minutes researching a place you want to visit. Save 3 interesting facts.',
          category: 'travel',
          xpReward: 25,
          isActive: true,
        },
        {
          title: 'Create a Travel Vision Board',
          description: 'Save 5 images of your dream travel destination to a folder or board.',
          category: 'travel',
          xpReward: 25,
          isActive: true,
        },
        // Money challenges
        {
          title: 'Track Your Spending',
          description: 'Write down every purchase you make today, no matter how small.',
          category: 'money',
          xpReward: 25,
          isActive: true,
        },
        {
          title: 'No-Spend Challenge',
          description: 'Go the entire day without spending any money (except for necessities).',
          category: 'money',
          xpReward: 30,
          isActive: true,
        },
        // Career challenges
        {
          title: 'Update Your LinkedIn',
          description: 'Spend 15 minutes updating your LinkedIn profile or portfolio.',
          category: 'career',
          xpReward: 25,
          isActive: true,
        },
        {
          title: 'Learn Something New',
          description: 'Watch one educational video or read one article related to your career goals.',
          category: 'career',
          xpReward: 20,
          isActive: true,
        },
        // Lifestyle challenges
        {
          title: 'Morning Routine',
          description: 'Complete your morning routine before checking social media.',
          category: 'lifestyle',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'Digital Detox Hour',
          description: 'Spend one hour today without any screens.',
          category: 'lifestyle',
          xpReward: 25,
          isActive: true,
        },
        // Growth challenges
        {
          title: 'Journal Entry',
          description: 'Write at least 3 sentences about your goals and how you feel about them.',
          category: 'growth',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'Gratitude Practice',
          description: 'Write down 3 things you are grateful for today.',
          category: 'growth',
          xpReward: 15,
          isActive: true,
        },
        {
          title: 'Step Outside Comfort Zone',
          description: 'Do one small thing today that scares you a little.',
          category: 'growth',
          xpReward: 30,
          isActive: true,
        },
        // Relationships challenges
        {
          title: 'Reach Out',
          description: "Send a thoughtful message to someone you haven't talked to in a while.",
          category: 'relationships',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'Active Listening',
          description:
            'Have a conversation where you focus entirely on listening without planning your response.',
          category: 'relationships',
          xpReward: 25,
          isActive: true,
        },
        // General challenges
        {
          title: 'Complete One Action',
          description: 'Complete at least one action step towards any of your dreams.',
          category: 'general',
          xpReward: 15,
          isActive: true,
        },
        {
          title: 'Mindset Moment',
          description: "Read today's mindset quote and write down how it applies to your life.",
          category: 'general',
          xpReward: 15,
          isActive: true,
        },
        {
          title: 'Celebrate Small Wins',
          description: 'Write down 3 small wins you had this week, no matter how small.',
          category: 'general',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'Visualize Success',
          description: 'Spend 5 minutes visualizing yourself achieving your biggest dream.',
          category: 'general',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'Share Your Dream',
          description: 'Tell one person about a dream you are working towards.',
          category: 'general',
          xpReward: 25,
          isActive: true,
        },
        {
          title: 'Break It Down',
          description: 'Add 3 new action steps to one of your dreams.',
          category: 'general',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'Declutter',
          description: 'Spend 10 minutes decluttering one area of your physical or digital space.',
          category: 'lifestyle',
          xpReward: 20,
          isActive: true,
        },
      ];

      for (const challenge of challenges) {
        await ctx.db.insert('dailyChallenges', challenge);
      }
      results.dailyChallenges = { seeded: true, count: challenges.length };
    }

    return results;
  },
});
