import { internalAction, internalMutation } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { createAuth } from './auth';

const MINDSET_MOMENTS = [
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
        // Financial mindset / money moves
        {
          quote: 'Your bank account is a reflection of the risks you were willing to take.',
          author: 'Gabby Beckford',
          category: 'money',
        },
        {
          quote: "Stop saying you can't afford it. Start asking how you CAN afford it.",
          author: 'Gabby Beckford',
          category: 'money',
        },
        {
          quote: 'Broke is temporary. Cheap is a mindset. Invest in yourself even when it feels scary.',
          author: 'Gabby Beckford',
          category: 'money',
        },
        {
          quote: 'The money will follow the woman who bets on herself.',
          author: 'Gabby Beckford',
          category: 'money',
        },
        // Career confidence / negotiation
        {
          quote: "Apply for the thing. They can only say no, and you were already at no.",
          author: 'Gabby Beckford',
          category: 'career',
        },
        {
          quote: 'You are not asking for too much. You are asking the wrong people.',
          author: 'Gabby Beckford',
          category: 'career',
        },
        {
          quote: "If you don't negotiate, you're leaving your future self's money on the table.",
          author: 'Gabby Beckford',
          category: 'career',
        },
        {
          quote: "Your career doesn't have to look like anyone else's. Build the one that fits YOUR dream life.",
          author: 'Gabby Beckford',
          category: 'career',
        },
        // Relationships / community / vulnerability
        {
          quote: 'Surround yourself with people who talk about dreams, not drama.',
          author: 'Gabby Beckford',
          category: 'relationships',
        },
        {
          quote: 'Vulnerability is not weakness. It is the birthplace of every brave thing you will ever do.',
          author: 'Gabby Beckford',
          category: 'relationships',
        },
        {
          quote: 'The right people will not be intimidated by your ambition. They will match it.',
          author: 'Gabby Beckford',
          category: 'relationships',
        },
        {
          quote: 'Community is not a luxury. It is fuel. Find your people and grow together.',
          author: 'Gabby Beckford',
          category: 'relationships',
        },
        // Imposter syndrome / self-doubt
        {
          quote: "Imposter syndrome means you're in a room you earned. Sit down and take up space.",
          author: 'Gabby Beckford',
          category: 'mindset',
        },
        {
          quote: 'Self-doubt will always show up. Let it ride passenger, but never let it drive.',
          author: 'Gabby Beckford',
          category: 'mindset',
        },
        {
          quote: "You don't need permission to be great. You already have it.",
          author: 'Gabby Beckford',
          category: 'mindset',
        },
        // Rest as productive / sustainability
        {
          quote: 'Rest is not quitting. It is how you make sure you can keep going.',
          author: 'Gabby Beckford',
          category: 'lifestyle',
        },
        {
          quote: 'You cannot pour from an empty passport — or an empty cup. Recharge so you can go further.',
          author: 'Gabby Beckford',
          category: 'lifestyle',
        },
        {
          quote: 'Burnout is not a badge of honor. Sustainable hustle is.',
          author: 'Gabby Beckford',
          category: 'lifestyle',
        },
        // Consistency over perfection
        {
          quote: 'Perfection is procrastination in disguise. Progress beats perfect every single time.',
          author: 'Gabby Beckford',
          category: 'consistency',
        },
        {
          quote: 'Small steps repeated daily will take you further than big leaps taken once.',
          author: 'Gabby Beckford',
          category: 'consistency',
        },
        {
          quote: "You don't rise to the level of your goals. You fall to the level of your habits.",
          author: 'Gabby Beckford',
          category: 'consistency',
        },
        {
          quote: 'Show up messy. Show up scared. Just show up. Consistency compounds.',
          author: 'Gabby Beckford',
          category: 'consistency',
        },
        // Solo travel / independence
        {
          quote: 'Solo travel will teach you more about yourself than any self-help book ever could.',
          author: 'Gabby Beckford',
          category: 'travel',
        },
        {
          quote: "Stop waiting for someone to go with you. The world doesn't pause for a plus-one.",
          author: 'Gabby Beckford',
          category: 'travel',
        },
        {
          quote: 'A woman who can navigate a foreign city alone can navigate anything life throws at her.',
          author: 'Gabby Beckford',
          category: 'travel',
        },
        // Starting before you're ready
        {
          quote: "Start before you're ready. Figure it out along the way. That is the whole strategy.",
          author: 'Gabby Beckford',
          category: 'action',
        },
        {
          quote: 'Readiness is a myth. Action creates clarity, not the other way around.',
          author: 'Gabby Beckford',
          category: 'action',
        },
        {
          quote: 'You are one decision away from a completely different life. Make it today.',
          author: 'Gabby Beckford',
          category: 'action',
        },
        // Dreams
        {
          quote: "Dream so big it makes people uncomfortable. Then go make them watch you do it.",
          author: 'Gabby Beckford',
          category: 'dreams',
        },
        {
          quote: 'A dream without a deadline is just a wish. Put a date on it and get moving.',
          author: 'Gabby Beckford',
          category: 'dreams',
        },
        {
          quote: "Your dream life is not some fantasy. It's a series of brave choices you haven't made yet.",
          author: 'Gabby Beckford',
          category: 'dreams',
        },
        // Motivation
        {
          quote: "The version of you that you're scared to become? She's the one the world is waiting for.",
          author: 'Gabby Beckford',
          category: 'motivation',
        },
        {
          quote: 'Stop shrinking to fit places you have already outgrown.',
          author: 'Gabby Beckford',
          category: 'motivation',
        },
        // Growth
        {
          quote: 'Growth is not comfortable and comfort is not growth. Pick one.',
          author: 'Gabby Beckford',
          category: 'growth',
        },
        {
          quote: "Failure is just data. Collect it, learn from it, and keep it moving.",
          author: 'Gabby Beckford',
          category: 'growth',
        },
] as const;

const DAILY_CHALLENGES = [
        // Travel challenges
        {
          title: 'Feed Your Wanderlust',
          description: 'Feed your wanderlust — research one dream destination today and save 3 facts about it. Future you is already packing.',
          category: 'travel',
          xpReward: 25,
          isActive: true,
        },
        {
          title: 'Build Your Vision Board',
          description: 'Permission granted: spend 10 minutes saving 5 gorgeous images of where you want to be. Your dream trip starts with a vision.',
          category: 'travel',
          xpReward: 25,
          isActive: true,
        },
        // Money challenges
        {
          title: 'Track Every Dollar',
          description: 'Your move: write down every single purchase today, no matter how small. Awareness is the first step to financial freedom.',
          category: 'money',
          xpReward: 25,
          isActive: true,
        },
        {
          title: 'No-Spend Power Day',
          description: 'Bold move: go the entire day without spending a dime (necessities excluded). Show your wallet who is in charge.',
          category: 'money',
          xpReward: 30,
          isActive: true,
        },
        // Career challenges
        {
          title: 'Glow Up Your LinkedIn',
          description: 'Channel your main character energy — spend 15 minutes making your LinkedIn or portfolio reflect the badass you actually are.',
          category: 'career',
          xpReward: 25,
          isActive: true,
        },
        {
          title: 'Level Up Your Knowledge',
          description: 'Feed your ambition — watch one video or read one article that moves you closer to your career goals. Every expert was once a beginner.',
          category: 'career',
          xpReward: 20,
          isActive: true,
        },
        // Lifestyle challenges
        {
          title: 'Own Your Morning',
          description: 'Your move: complete your full morning routine before touching social media. Start the day on YOUR terms, not the algorithm\'s.',
          category: 'lifestyle',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'Digital Detox Hour',
          description: 'Permission granted: put every screen away for one full hour. Be present with yourself — you deserve that undivided attention.',
          category: 'lifestyle',
          xpReward: 25,
          isActive: true,
        },
        // Growth challenges
        {
          title: 'Pour Into Your Journal',
          description: 'Channel your inner voice — write at least 3 sentences about your goals and how they make you feel. Your future self will thank you for this.',
          category: 'growth',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'Gratitude Check-In',
          description: 'Feed your joy — write down 3 things you are genuinely grateful for today. Gratitude is rocket fuel for your dreams.',
          category: 'growth',
          xpReward: 15,
          isActive: true,
        },
        {
          title: 'Step Outside Your Comfort Zone',
          description: 'Bold move: do one small thing today that makes your palms a little sweaty. Growth lives right on the other side of that feeling.',
          category: 'growth',
          xpReward: 30,
          isActive: true,
          isComfortZone: true,
        },
        // Relationships challenges
        {
          title: 'Reconnect With Your People',
          description: 'Your move: send a thoughtful message to someone you haven\'t talked to in a while. Relationships are part of the dream too.',
          category: 'relationships',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'Listen Like You Mean It',
          description: 'Channel your presence — have one conversation today where you truly listen without planning your response. Connection is a superpower.',
          category: 'relationships',
          xpReward: 25,
          isActive: true,
        },
        // General challenges
        {
          title: 'Take One Bold Step',
          description: 'Permission granted: complete at least one action step towards any of your dreams today. Done is better than perfect.',
          category: 'general',
          xpReward: 15,
          isActive: true,
        },
        {
          title: 'Mindset Moment',
          description: 'Feed your mindset — read today\'s quote and write down how it connects to YOUR life. The right words at the right time can change everything.',
          category: 'general',
          xpReward: 15,
          isActive: true,
        },
        {
          title: 'Celebrate Your Wins',
          description: 'Your move: write down 3 wins from this week, no matter how tiny. You are doing more than you think — own it.',
          category: 'general',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'See It to Be It',
          description: 'Channel your delusional confidence — spend 5 minutes visualizing yourself living your biggest dream. If you can see it, you can build it.',
          category: 'general',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'Speak Your Dream Out Loud',
          description: 'Bold move: tell one real person about a dream you are working on. Saying it out loud makes it real — and you deserve people who cheer you on.',
          category: 'general',
          xpReward: 25,
          isActive: true,
        },
        {
          title: 'Break It Down, Queen',
          description: 'Your move: add 3 new action steps to one of your dreams. Big dreams are just tiny steps stacked up — start stacking.',
          category: 'general',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'Create Space for Growth',
          description: 'Create space for growth — declutter one area of your physical or digital life today. Less clutter, more clarity, bigger dreams.',
          category: 'lifestyle',
          xpReward: 20,
          isActive: true,
        },
        {
          title: 'Spark a New Connection',
          description: 'Bold move: start a genuine conversation with someone new today — a barista, a neighbor, anyone. You never know who is part of your story.',
          category: 'growth',
          xpReward: 25,
          isActive: true,
          isComfortZone: true,
        },
        {
          title: 'Apply Before You\'re Ready',
          description: 'Channel your courage — submit an application for something that feels like a stretch. You don\'t need to be ready, you just need to start.',
          category: 'career',
          xpReward: 30,
          isActive: true,
          isComfortZone: true,
        },
        {
          title: 'Say YES Today',
          description: 'Permission granted: say YES to one thing that normally makes you nervous. The best stories start with a yes you almost didn\'t give.',
          category: 'growth',
          xpReward: 25,
          isActive: true,
          isComfortZone: true,
        },
        {
          title: 'Get Vulnerable Online',
          description: 'Bold move: share something real on social media — a lesson learned, a struggle, or a dream so big it scares you. Authenticity is magnetic.',
          category: 'growth',
          xpReward: 25,
          isActive: true,
          isComfortZone: true,
        },
        {
          title: 'Do the Scary Thing',
          description: 'Channel your courage — do one thing today that makes your heart beat a little faster. Fear means you are growing. Do it anyway.',
          category: 'growth',
          xpReward: 30,
          isActive: true,
          isComfortZone: true,
        },
] as const;

const BADGE_DEFINITIONS = [
        {
          key: 'permission_granted',
          title: 'Passport Stamped',
          description: 'Took action within 24 hours of creating a dream.',
          icon: 'hand.thumbsup.fill',
          category: 'action',
          xpReward: 25,
        },
        {
          key: 'on_fire',
          title: 'Globe Trotter',
          description: 'Maintained a 7-day streak.',
          icon: 'flame.fill',
          category: 'streak',
          xpReward: 25,
        },
        {
          key: 'dream_achiever',
          title: 'Destination Reached',
          description: 'Completed your first dream.',
          icon: 'trophy.fill',
          category: 'dream',
          xpReward: 25,
        },
        {
          key: 'laser_focused',
          title: 'Jet Setter',
          description: 'Completed 10 actions on one dream in 7 days.',
          icon: 'scope',
          category: 'action',
          xpReward: 25,
        },
        {
          key: 'delusionally_confident',
          title: 'Fearless Traveler',
          description: 'Started a dream with low confidence.',
          icon: 'sparkles',
          category: 'mindset',
          xpReward: 25,
        },
        {
          key: 'risk_seeker',
          title: 'Solo Adventurer',
          description: 'Completed 5 comfort zone challenges.',
          icon: 'figure.hiking',
          category: 'challenge',
          xpReward: 25,
        },
        {
          key: 'early_bird',
          title: 'Sunrise Seeker',
          description: 'Completed an action before 8am.',
          icon: 'sunrise.fill',
          category: 'time',
          xpReward: 25,
        },
        {
          key: 'night_owl',
          title: 'Midnight Explorer',
          description: 'Completed an action after 10pm.',
          icon: 'moon.fill',
          category: 'time',
          xpReward: 25,
        },
] as const;

// ── Community Seed Users ─────────────────────────────────────────────────────

const SEED_USERS: {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  bannerUrl?: string;
}[] = [
  {
    id: 'seed_maya',
    username: 'mayawanders',
    displayName: 'Maya Chen',
    bio: "Solo travel addict. 23 countries and counting. Proving you don't need a plus-one to see the world.",
    avatarUrl: 'https://images.unsplash.com/photo-1457257495536-67f31bc9773d?w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  },
  {
    id: 'seed_jade',
    username: 'jadebuilds',
    displayName: 'Jade Williams',
    bio: "Building my dream career on my own terms. Remote work nomad. If you're not negotiating, you're leaving money on the table.",
    avatarUrl: 'https://images.unsplash.com/photo-1569925444984-9e2e5fc3d1fb?w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1515400276915-8aa3a8fd70f4?w=800&q=80',
  },
  {
    id: 'seed_aria',
    username: 'ariagrows',
    displayName: 'Aria Morales',
    bio: 'Growth junkie. Morning routines, mindset work, and uncomfortable conversations that change your life.',
    avatarUrl: 'https://images.unsplash.com/photo-1567766089109-46314f8eddd8?w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1568751302450-3d84e00f2348?w=800&q=80',
  },
  {
    id: 'seed_nyla',
    username: 'nylashines',
    displayName: 'Nyla Brooks',
    bio: "Designed a life I don't need a vacation from. Remote work + travel = freedom. Currently somewhere warm.",
    avatarUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1602002418679-43121356bf41?w=800&q=80',
  },
  {
    id: 'seed_luna',
    username: 'lunaleaps',
    displayName: 'Luna Okafor',
    bio: 'Taking the scenic route through life. One dream at a time.',
    avatarUrl: 'https://images.unsplash.com/photo-1623035792727-61da15e1a383?w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1485724417692-19b9fb72d5ce?w=800&q=80',
  },
  {
    id: 'seed_zara',
    username: 'zaradreams',
    displayName: 'Zara Patel',
    bio: 'Manifesting in real time. Watch this space.',
    avatarUrl: 'https://images.unsplash.com/photo-1596787794038-be798d7248a0?w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1551857704-ba9b620ad444?w=800&q=80',
  },
];

// ── Community Pins ──────────────────────────────────────────────────────────

const COMMUNITY_PINS: {
  userIndex: number;
  type: 'image' | 'win';
  title: string;
  description: string;
  category: 'travel' | 'money' | 'career' | 'lifestyle' | 'growth' | 'relationships';
  tags: string[];
  linkImageUrl: string;
  imageAspectRatio: number;
}[] = [
  // ── Travel-heavy feed (Gabby's audience is here for the wanderlust) ────────
  {
    userIndex: 0,
    type: 'image',
    title: 'She booked the one-way ticket to Bali',
    description: 'Quit the job that drained me, booked a flight to Bali, and never looked back. This swing over the jungle? Worth every terrifying leap of faith.',
    category: 'travel',
    tags: ['bali', 'solotravel', 'leapoffaith'],
    linkImageUrl: 'https://images.unsplash.com/photo-1526309206584-51dc789367bd?w=800&q=80',
    imageAspectRatio: 1.33,
  },
  {
    userIndex: 2,
    type: 'win',
    title: 'Cappadocia was on my vision board for 3 years',
    description: 'Woke up at 4am, wrapped in a blanket, and watched a hundred balloons rise over the fairy chimneys. Manifestation is real. Put it on the board.',
    category: 'travel',
    tags: ['cappadocia', 'visionboard', 'manifestation'],
    linkImageUrl: 'https://images.unsplash.com/photo-1568751302450-3d84e00f2348?w=800&q=80',
    imageAspectRatio: 1.5,
  },
  {
    userIndex: 1,
    type: 'image',
    title: 'Positano was worth every penny I saved',
    description: 'Twelve months of the no-spend challenge. Today I am eating limoncello cake overlooking the Amalfi Coast. The money will follow the woman who bets on herself.',
    category: 'travel',
    tags: ['positano', 'amalficoast', 'worthit'],
    linkImageUrl: 'https://images.unsplash.com/photo-1515400276915-8aa3a8fd70f4?w=800&q=80',
    imageAspectRatio: 0.67,
  },
  {
    userIndex: 3,
    type: 'image',
    title: 'Maldives: vision board to reality',
    description: 'Three years ago I pinned this exact view. Today I am standing in it. Your dream life is not some fantasy — it is a series of brave choices you have not made yet.',
    category: 'travel',
    tags: ['maldives', 'manifestation', 'dreamlife'],
    linkImageUrl: 'https://images.unsplash.com/photo-1602002418679-43121356bf41?w=800&q=80',
    imageAspectRatio: 1.5,
  },
  {
    userIndex: 4,
    type: 'win',
    title: 'Solo in Kyoto during cherry blossom season',
    description: 'Everyone said "wait until you have someone to go with." I went alone. Watched the blossoms fall at golden hour. A woman who can navigate a foreign city alone can navigate anything.',
    category: 'travel',
    tags: ['kyoto', 'cherryblossoms', 'solotravel'],
    linkImageUrl: 'https://images.unsplash.com/photo-1742982533138-047c5d82ecb2?w=800&q=80',
    imageAspectRatio: 0.75,
  },
  {
    userIndex: 0,
    type: 'image',
    title: 'Santorini sunsets hit different',
    description: 'Put this on my vision board 3 years ago. Today I watched the sun set over the caldera with tears in my eyes. Dream it. Do it.',
    category: 'travel',
    tags: ['santorini', 'greece', 'visionboard'],
    linkImageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    imageAspectRatio: 1.5,
  },
  {
    userIndex: 5,
    type: 'image',
    title: 'Paris at golden hour, journal in hand',
    description: 'Sitting in a cafe watching the Eiffel Tower glow. Wrote three pages about how this version of me would have seemed impossible two years ago. She is not impossible. She is here.',
    category: 'travel',
    tags: ['paris', 'goldenhour', 'journaling'],
    linkImageUrl: 'https://images.unsplash.com/photo-1743065272150-5beced7090b3?w=800&q=80',
    imageAspectRatio: 1.5,
  },
  // ── Lifestyle / Career / Growth mix ────────────────────────────────────────
  {
    userIndex: 3,
    type: 'image',
    title: 'Designed a life I do not need a vacation from',
    description: 'Remote work, ocean view, morning yoga. This is not a holiday. This is Tuesday. Build the life you want — then live in it every single day.',
    category: 'lifestyle',
    tags: ['remotework', 'dreamlife', 'designyourlife'],
    linkImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    imageAspectRatio: 1.5,
  },
  {
    userIndex: 1,
    type: 'win',
    title: 'Negotiated remote, now the world is my office',
    description: 'She said "I know my worth" and then she proved it. Negotiated a fully remote role so every city is home. If you are not negotiating, you are leaving your future self\'s money on the table.',
    category: 'career',
    tags: ['remotework', 'negotiation', 'knowyourworth'],
    linkImageUrl: 'https://images.unsplash.com/photo-1689457362806-af3a973a3c45?w=800&q=80',
    imageAspectRatio: 0.67,
  },
  {
    userIndex: 2,
    type: 'image',
    title: 'Started a travel fund — crossed six figures',
    description: 'Two years ago I had $200 in my account. Today I crossed $100K in my travel fund. Small steps, big vision, relentless consistency. The money follows the woman who bets on herself.',
    category: 'money',
    tags: ['travelfund', 'financialfreedom', 'moneymoves'],
    linkImageUrl: 'https://images.unsplash.com/photo-1747484226164-81ae91411c1f?w=800&q=80',
    imageAspectRatio: 1.33,
  },
  {
    userIndex: 4,
    type: 'win',
    title: 'Mt. Fuji at sunrise was a spiritual experience',
    description: 'Woke up before dawn, hiked in the dark, and watched the sun rise behind Fuji through a curtain of cherry blossoms. Some moments cannot be captured. They just change you.',
    category: 'growth',
    tags: ['mtfuji', 'japan', 'growthmindset'],
    linkImageUrl: 'https://images.unsplash.com/photo-1769538012116-b26a4cecbcf7?w=800&q=80',
    imageAspectRatio: 0.75,
  },
  {
    userIndex: 5,
    type: 'image',
    title: 'Found my people on the road',
    description: 'Met these women at a hostel in Morocco. Five countries later we are still traveling together. The right people will not be intimidated by your ambition. They will match it.',
    category: 'relationships',
    tags: ['travelsisters', 'community', 'morocco'],
    linkImageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    imageAspectRatio: 0.67,
  },
];

// ── Seed Functions ──────────────────────────────────────────────────────────

async function seedMindsetMoments(ctx: MutationCtx) {
  for (const quote of MINDSET_MOMENTS) {
    await ctx.db.insert('mindsetMoments', quote);
  }
  return MINDSET_MOMENTS.length;
}

async function seedDailyChallenges(ctx: MutationCtx) {
  for (const challenge of DAILY_CHALLENGES) {
    await ctx.db.insert('dailyChallenges', challenge);
  }
  return DAILY_CHALLENGES.length;
}

async function seedBadgeDefinitions(ctx: MutationCtx) {
  for (const badge of BADGE_DEFINITIONS) {
    await ctx.db.insert('badgeDefinitions', badge);
  }
  return BADGE_DEFINITIONS.length;
}

async function seedCommunityPins(ctx: MutationCtx) {
  const now = Date.now();

  // Create seed user profiles with avatar/banner URLs and bios
  for (const user of SEED_USERS) {
    await ctx.db.insert('userProfiles', {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl,
      isPublic: true,
      createdAt: now,
    });
  }

  // Create community pins with staggered timestamps so they appear in order
  for (let i = 0; i < COMMUNITY_PINS.length; i++) {
    const pin = COMMUNITY_PINS[i];
    const user = SEED_USERS[pin.userIndex];
    await ctx.db.insert('pins', {
      userId: user.id,
      type: pin.type,
      title: pin.title,
      description: pin.description,
      category: pin.category,
      tags: pin.tags,
      linkImageUrl: pin.linkImageUrl,
      imageAspectRatio: pin.imageAspectRatio,
      isPersonalOnly: false,
      createdAt: now - (COMMUNITY_PINS.length - i) * 60_000,
    });
  }

  return COMMUNITY_PINS.length;
}

async function clearTable(ctx: MutationCtx, table: 'mindsetMoments' | 'dailyChallenges' | 'badgeDefinitions' | 'pins' | 'userProfiles') {
  let count = 0;
  const docs = await ctx.db.query(table).collect();
  for (const doc of docs) {
    // For userProfiles, only delete seed users
    if (table === 'userProfiles' && !(doc as { userId: string }).userId.startsWith('seed_')) continue;
    // For pins, only delete community (non-personal) pins from seed users
    if (table === 'pins' && !(doc as { userId: string }).userId.startsWith('seed_')) continue;
    await ctx.db.delete(doc._id);
    count++;
  }
  return count;
}

// Clear seeded tables and re-seed everything
export const clearAndReseed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cleared = {
      mindsetMoments: await clearTable(ctx, 'mindsetMoments'),
      dailyChallenges: await clearTable(ctx, 'dailyChallenges'),
      badgeDefinitions: await clearTable(ctx, 'badgeDefinitions'),
      pins: await clearTable(ctx, 'pins'),
      userProfiles: await clearTable(ctx, 'userProfiles'),
    };

    const seeded = {
      mindsetMoments: await seedMindsetMoments(ctx),
      dailyChallenges: await seedDailyChallenges(ctx),
      badgeDefinitions: await seedBadgeDefinitions(ctx),
      communityPins: await seedCommunityPins(ctx),
    };

    return { cleared, seeded };
  },
});

// Seed all data (mindset moments + daily challenges + badge definitions + community pins)
export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      mindsetMoments: { seeded: false, count: 0 },
      dailyChallenges: { seeded: false, count: 0 },
      badgeDefinitions: { seeded: false, count: 0 },
      communityPins: { seeded: false, count: 0 },
    };

    // Seed mindset moments
    const existingQuote = await ctx.db.query('mindsetMoments').first();
    if (!existingQuote) {
      const count = await seedMindsetMoments(ctx);
      results.mindsetMoments = { seeded: true, count };
    }

    // Seed daily challenges
    const existingChallenge = await ctx.db.query('dailyChallenges').first();
    if (!existingChallenge) {
      const count = await seedDailyChallenges(ctx);
      results.dailyChallenges = { seeded: true, count };
    }

    // Seed badge definitions
    const existingBadge = await ctx.db.query('badgeDefinitions').first();
    if (!existingBadge) {
      const count = await seedBadgeDefinitions(ctx);
      results.badgeDefinitions = { seeded: true, count };
    }

    // Seed community pins
    const existingPin = await ctx.db
      .query('pins')
      .withIndex('by_community_created', (q) => q.eq('isPersonalOnly', false))
      .first();
    if (!existingPin) {
      const count = await seedCommunityPins(ctx);
      results.communityPins = { seeded: true, count };
    }

    return results;
  },
});

// Create a pre-verified test account (bypasses email OTP)
export const createTestAccount = internalAction({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { email, password, name }) => {
    const auth = createAuth(ctx);
    const authCtx = await auth.$context;

    const hashedPassword = await authCtx.password.hash(password);

    const user = await authCtx.internalAdapter.createUser({
      email,
      name,
      emailVerified: true,
    });

    await authCtx.internalAdapter.linkAccount({
      userId: user.id,
      providerId: 'credential',
      accountId: user.id,
      password: hashedPassword,
    });

    return { userId: user.id, email: user.email };
  },
});
