# DreamSeeker Progress Log

**Hackathon:** RevenueCat Shipyard Creator Contest
**Deadline:** Feb 12, 2026 @ 11:59pm PST
**Creator:** Gabby Beckford (@packslight)

---

## Sprint 1: MVP Foundation (Feb 5, 2026)

### Completed

#### Backend (Convex)
- [x] Schema redesign: `dreams`, `actions`, `userProgress`, `dailyChallenges`, `challengeCompletions`, `mindsetMoments`
- [x] Dreams CRUD with 3-dream free limit
- [x] Actions system with XP tracking (+10 XP per action)
- [x] User progress: XP, levels, streaks
- [x] Daily challenge system (20 challenges seeded)
- [x] Mindset moments (15 Gabby quotes seeded)
- [x] Subscription system updated: tasks → dreams, limit 3

#### Frontend (Expo)
- [x] Tab restructure: Dreams / Today / Discover / Profile
- [x] Dreams tab: Category grid (6 categories), create modal
- [x] Category view: Filtered dream list with quick-add
- [x] Dream detail: Actions checklist, progress bar, complete button
- [x] Dream editing: Edit title, whyItMatters, targetDate, category via modal
- [x] Action editing: Tap action text to edit in modal
- [x] Completed/Archived dreams: View in Discover tab, tap to reopen/restore
- [x] Reopen dream: Deducts 100 XP and dreamsCompleted count
- [x] Today tab: Daily challenge, mindset quote, pending actions
- [x] Discover tab: Stats, level progress, streak display, level journey
- [x] Profile: Updated subscription display (dreams instead of tasks)

#### Gamification
- [x] 5 levels: Dreamer → Seeker → Achiever → Go-Getter → Trailblazer
- [x] XP system: +10 action, +25 challenge, +100 dream complete
- [x] Streak tracking with daily reset logic
- [x] Confetti on dream/challenge completion
- [x] Haptic feedback throughout

#### Content
- [x] 6 dream categories with colors/icons
- [x] 15 Gabby Beckford quotes
- [x] 20 daily challenges across categories

### Files Created
| File | Purpose |
|------|---------|
| `constants/dreams.ts` | Categories, XP, levels, helpers |
| `convex/dreams.ts` | Dreams CRUD |
| `convex/actions.ts` | Actions CRUD |
| `convex/progress.ts` | User progress |
| `convex/challenges.ts` | Daily challenges |
| `convex/mindset.ts` | Quotes |
| `convex/seed.ts` | Seed data |
| `app/(app)/(tabs)/today/_layout.tsx` | Today tab layout |
| `app/(app)/(tabs)/today/index.tsx` | Today screen |
| `app/(app)/(tabs)/(home)/[category].tsx` | Category dreams |
| `app/(app)/dream/[id].tsx` | Dream detail |

### Files Modified
| File | Changes |
|------|---------|
| `convex/schema.ts` | New tables |
| `convex/subscriptions.ts` | task → dream, limit 3 |
| `convex/users.ts` | Delete dreams/actions on account delete |
| `app/(app)/(tabs)/_layout.tsx` | New tab structure |
| `app/(app)/(tabs)/(home)/index.tsx` | Dream board |
| `app/(app)/(tabs)/explore/index.tsx` | Discover/progress |
| `hooks/use-subscription.ts` | task → dream |
| `hooks/use-tab-badges.ts` | Pending actions count |
| `components/ui/icon-symbol.tsx` | New icons |

### Files Removed
| File | Reason |
|------|--------|
| `convex/tasks.ts` | Replaced by dreams.ts |
| `app/(app)/(tabs)/tasks/*` | Replaced by today tab |

### Commands
```bash
# Seed content
npx convex run seed:seedAll

# Check types
npm run check
```

---

## Sprint 2: Polish & Submission (Planned)

### TODO
- [ ] TestFlight build
- [ ] Demo video (2-3 min)
- [ ] Written proposal
- [ ] Technical docs
- [ ] Make repo public

### Nice to Have
- [ ] Onboarding slides
- [ ] Share functionality
- [ ] Level-up celebration modal
- [ ] Challenge history view

---

## Notes

### Judging Criteria Focus
| Criteria | Weight | Status |
|----------|--------|--------|
| Audience Fit | 30% | ✅ Gabby quotes, 6 categories, tone |
| UX | 25% | ✅ Confetti, haptics, streaks |
| Monetization | 20% | ✅ 3 free → unlimited premium |
| Innovation | 15% | ✅ Daily challenges, XP/levels |
| Technical | 10% | ✅ Convex real-time, TypeScript |

### Key Patterns
- Auth guard in queries: return `[]` if unauthenticated
- Auth guard in mutations: throw if unauthenticated
- XP awarded inline in action/dream/challenge mutations
- Streak updates on any completion action
