import { query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './helpers';
import { getTodayString } from './dates';

// Gabby-voiced journal prompts (rotate daily)
const JOURNAL_PROMPTS = [
  "You've been grinding on your dreams — what felt different today?",
  "Real talk: what almost made you quit this week, and why didn't you?",
  "Name one small win from today. Even tiny ones count, sis.",
  "What would future-you thank present-you for doing right now?",
  "Who supported your dreams today? Shout them out.",
  "What fear showed up today? How did you handle it?",
  "Describe your dream life in 3 words. Now — what did you do today to get closer?",
  "What surprised you about yourself this week?",
  "If doubt had a voice today, what did it say? And what's the truth?",
  "What are you proud of that nobody else knows about?",
  "What would you do today if you knew you couldn't fail?",
  "Who do you need to forgive — including yourself?",
  "What's one thing you're tolerating that you shouldn't be?",
  "If your dreams had a theme song, what would it be? Why?",
  "What permission do you need to give yourself today?",
  "What's draining your energy? What's fueling it?",
  "If your future self could text you right now, what would she say?",
  "What boundary did you set (or need to set) this week?",
  "What would you do differently if you loved yourself more?",
  "What's the story you keep telling yourself? Is it still true?",
  "What are you avoiding? And what's it costing you?",
  "What does 'success' mean to you today? Has it changed?",
  "Who are you becoming? Do you like her?",
  "What legacy are you building with today's choices?",
  "What would your 10-year-old self think of you right now?",
  "What's one thing you did today that your past self would be proud of?",
  "What are you grateful for that you usually take for granted?",
  "What conversation do you need to have but keep postponing?",
  "What's possible for you that wasn't possible a year ago?",
  "What does your gut tell you that your head keeps ignoring?",
  "What would change if you trusted yourself completely?",
  "What's the hardest truth you're facing right now?",
  "What are you ready to let go of?",
  "What lights you up? When's the last time you felt it?",
  "What would you do if you had nothing to prove?",
  "What's one thing you wish someone would ask you about?",
] as const;

// Get today's journal prompt based on date + user's active dreams
export const getDailyPrompt = query({
  args: { timezone: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Get user's active dreams
    const dreams = await ctx.db
      .query('dreams')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
      .take(5);

    // Hash the date to get a deterministic prompt
    const today = getTodayString(args.timezone);
    const dateHash = today.split('-').reduce((acc, val) => acc + parseInt(val, 10), 0);
    const promptIndex = dateHash % JOURNAL_PROMPTS.length;
    const prompt = JOURNAL_PROMPTS[promptIndex];

    return {
      prompt,
      dreamTitles: dreams.map((d) => d.title),
      hasActiveDreams: dreams.length > 0,
    };
  },
});
