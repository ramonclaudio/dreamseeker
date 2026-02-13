# DreamSeeker - Written Proposal

## The Problem

Ambitious women in their 20s and 30s save posts, make mental lists, and think about ten goals at once. They rarely act on any of them because they're waiting to feel ready. They don't lack motivation, they lack a system. Existing tools are either too rigid (habit trackers that punish missed days) or too passive (vision boards disconnected from action). Nothing connects inspiration to execution while celebrating the small steps along the way.

Gabby Beckford nailed this in her creator brief: do it before you feel it, and trust the feelings will catch up. Her audience doesn't need another motivational app. They need something that makes starting easy, tracks what they actually do, and makes every step feel like a win.

## Target Audience

DreamSeeker is built for women aged 25–35 who are ambitious, juggling multiple goals, and consuming creator content about travel, career growth, and personal development. They follow people like Gabby Beckford. They're savers and planners who struggle with execution because they're overwhelmed by how much they want to do.

My partner is this person. She's 32, lives in NYC, and has followed Gabby for years. She helped design DreamSeeker from day one. Her nurse friends (all women in the 25–35 demo) tested early builds at work, pushed back on what didn't feel right, and shaped the features that stuck. They said small wins don't get celebrated enough, so that became the celebration system. They wanted inspiration tied to real goals, so I built vision boards. They wanted guided reflection instead of a blank page, so I built journal prompts.

Every core feature came from real conversations with real women in the target audience.

## Monetization Strategy

The free tier is generous enough to genuinely achieve goals: 3 active dreams, 5 actions per dream, 3 journal entries per dream, 5 vision board pins, unlimited focus sessions, and the full streak and badge system. No one hits a paywall before they've seen value.

Premium unlocks at natural growth moments when the user has already proven they take action. Premium includes unlimited dreams, actions, pins/boards, and journal entries, plus community access (an inspiration feed of shared wins and resources), and early access to new features. They pay because they want more of what's working.

RevenueCat handles subscription logic with a native paywall UI. Entitlements sync to our `Convex` backend in real-time via webhooks, so premium status is always current. Tier limits are enforced server-side on every mutation. No client-side honor system. I built `convex-revenuecat`, an open-source RevenueCat component for Convex, to power this integration.
