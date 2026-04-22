# Dynamic KPIs Implementation Plan

## Context

Three user-facing routes currently render KPI-style data from hardcoded mocks in `src/lib/mocks/dashboard.ts`:

- **`/` (landing)** — HeroSection stats strip (500+ ACTIVE DEVS, 12+ TECH STACKS, 50+ SCENARIOS, 4.9★ RATING)
- **`/dashboard`** — KPI row (Stacks Completed, Total XP, Coding Hours, Day Streak), Weekly Stats, Recent Activity, Leaderboard Snapshot
- **`/profile`** — ProfileCard stats (memberSince, streakDays, leaderboardRank), ProgressSection (weeklyGrowth), MetricsSection (Commits, Challenges, Reviews, Reputation), FriendsSection

None of this reflects the user's real activity. The goal is to drive every KPI from Prisma data using what the schema actually supports, keep the UI labels user-friendly (never expose "container", "Docker", etc.), and leave achievements as a mockable source until the Achievements feature lands.

---

## Decisions

1. Re-scope the KPI fields to what the DB actually supports. Keep labels user-friendly ("stack", "session", "mission" — no technical nouns). `UserAchievement` is the source for the Achievements KPI; if no rows exist, return `0` rather than faking data.
2. All four HeroSection stats go dynamic. The only one without a DB source (rating) stays as a string constant returned from the loader so the component doesn't special-case it.
3. Replace the Friends grid on `/profile` with a "Rivals" grid sourced from `User` ordered by `xp desc`, excluding the current user. No new Prisma models.
4. Activity feed = `CompletedTask.completedAt` ∪ `UserAchievement.earnedAt`. Weekly stats chart reframes from "Coding Hours" to "Tasks / Day" — same component, data source is 7-day bucket of `CompletedTask`.

---

## Implementation Phases

### Phase 1 — Stats Module `src/lib/server/stats/` ✅

- [x] `src/lib/server/stats/format.ts` — `formatCompact`, `formatRelativeTime`, `formatMemberSince`
- [x] `src/lib/server/stats/user-kpis.ts` — `getUserKpis`, `getWeeklyTaskStats`, `getProfileMetrics`
- [x] `src/lib/server/stats/activity.ts` — `getRecentActivity`
- [x] `src/lib/server/stats/leaderboard.ts` — `getLeaderboard`, `getRivals`
- [x] `src/lib/server/stats/landing.ts` — `getLandingStats` with 60s TTL cache
- [x] `src/lib/server/stats/index.ts` — re-exports

### Phase 2 — Types ✅

- [x] `src/lib/types/dashboard.ts` — add `UserKpis`, `RivalEntry`, `ProfileMetricsData`, `LandingStats`; rename `WeeklyStats.codingHours` → `counts`, `totalHours` → `total`; add optional `growthLabel`

### Phase 3 — Route Loaders ✅

- [x] Create `src/routes/+page.server.ts` — calls `getLandingStats()`
- [x] Extend `src/routes/dashboard/+page.server.ts` — add `getUserKpis`, `getWeeklyTaskStats`, `getRecentActivity`, `getLeaderboard`
- [x] Extend `src/routes/profile/+page.server.ts` — add `getProfileMetrics`, `getRivals`

### Phase 4 — UI Components ✅

- [x] `src/lib/components/dashboard/WeeklyStats.svelte` — rename field refs, subtitle, growth label, remove `h` suffix
- [x] `src/lib/components/profile/FriendsSection.svelte` — rename prop to `rivals`, heading "Rivals", show XP
- [x] `src/lib/components/landing/HeroSection.svelte` — accept `stats: LandingStats` prop, remove hardcoded array

### Phase 5 — Route Pages ✅

- [x] `src/routes/+page.svelte` — accept `data`, pass `stats={data.landingStats}` to `<HeroSection>`
- [x] `src/routes/dashboard/+page.svelte` — remove mock imports, build `KPIData[]` from `data.kpis`, pass real weekly/activity/leaderboard
- [x] `src/routes/profile/+page.svelte` — remove hardcoded values, derive from `data.metrics` and `data.rivals`

---

## Architecture

### New module: `src/lib/server/stats/`

Co-locate all aggregation so the three route loaders stay thin.

- `src/lib/server/stats/index.ts` — re-exports
- `src/lib/server/stats/user-kpis.ts` — per-user aggregations (dashboard + profile)
- `src/lib/server/stats/activity.ts` — recent activity merge + weekly buckets
- `src/lib/server/stats/leaderboard.ts` — leaderboard + rivals
- `src/lib/server/stats/landing.ts` — public landing stats with 60s module-scoped cache
- `src/lib/server/stats/format.ts` — `formatCompact(n)`, `formatRelativeTime(date)`, `formatMemberSince(date)`

All queries use the existing `prisma` singleton from [src/lib/server/client.ts](src/lib/server/client.ts).

### Helper signatures

```ts
getUserKpis(userId: string):
  Promise<{ stacksCompleted: number; totalXp: number; dayStreak: number; achievementsUnlocked: number }>

getWeeklyTaskStats(userId: string):
  Promise<{ counts: number[7]; days: string[7]; total: number; avgPerDay: number; growthLabel: string }>

getRecentActivity(userId: string, limit = 8): Promise<ActivityItem[]>

getLeaderboard(limit = 5, currentUserId?: string): Promise<LeaderboardEntry[]>

getRivals(userId: string, limit = 6): Promise<RivalEntry[]>

getProfileMetrics(userId: string):
  Promise<{ tasksCompleted: number; fileEdits: number; coinsEarned: number; achievementsCount: number;
            memberSince: Date; dayStreak: number; leaderboardRank: number; weeklyGrowth: string }>

getLandingStats():
  Promise<{ activeDevs: string; techStacks: string; scenarios: string; rating: string }>
```

### Query details (schema-verified)

| Helper | Prisma call |
|---|---|
| stacksCompleted | `container.count({ where: { userId, isArchived: true } })` |
| totalXp / coins | `user.findUnique({ where: { id: userId }, select: { xp, coins, createdAt } })` |
| dayStreak | `dailyLogin.findUnique({ where: { userId }, select: { streak } })` — `?? 0` |
| achievementsUnlocked | `userAchievement.count({ where: { userId } })` |
| tasksCompleted | `completedTask.count({ where: { container: { userId } } })` |
| fileEdits | `userFileChanges.count({ where: { container: { userId } } })` *(note: `UserFileChanges` has `containerId`, not `userId` — must traverse relation)* |
| leaderboardRank | `user.count({ where: { xp: { gt: currentXp } } }) + 1` |
| weeklyGrowth | two `completedTask.count` calls (this week vs. prior week); format `±N%`, `+0%` when prior=0 |
| recent activity | parallel: `completedTask.findMany({ where: { container: { userId } }, include: { container: { select: { level } } }, orderBy: { completedAt: 'desc' }, take: limit })` + `userAchievement.findMany({ where: { userId }, include: { achievement: true }, orderBy: { earnedAt: 'desc' }, take: limit })` → merge, sort, slice |
| weekly task stats | single `completedTask.findMany({ where: { container: { userId }, completedAt: { gte: 7-days-ago } }, select: { completedAt } })` then bucket in JS by day |
| leaderboard | `user.findMany({ orderBy: { xp: 'desc' }, take: limit, select: { id, username, name, image, xp, level } })`; `isCurrentUser = u.id === currentUserId` |
| rivals | same as leaderboard + `where: { id: { not: userId } }` |
| landing.activeDevs | `user.count()` → `formatCompact` |
| landing.techStacks | `containerStack.groupBy({ by: ['stackName'] })` `.length` → `formatCompact` |
| landing.scenarios | `scenario.count()` → `formatCompact` |
| landing.rating | constant `"4.9★"` (no DB source) |

`formatCompact(n)`: `n < 1000 ? \`${n}+\` : \`${Math.floor(n/100)/10}K+\``

---

## KPI field mapping (new labels)

### Dashboard KPI row — 4 cards

| Card | Source | Icon | Color |
|---|---|---|---|
| Stacks Completed | `stacksCompleted` | Trophy | from-amber-500 to-orange-600 |
| Total XP | `totalXp` (formatCompact) | Zap | from-cyan-500 to-blue-600 |
| Day Streak | `dayStreak` | Flame | from-rose-500 to-pink-600 |
| Achievements Unlocked | `achievementsUnlocked` | Award | from-purple-500 to-fuchsia-600 |

*(Removes the fake "Coding Hours" card — there's no reliable session-time source and the Weekly Stats section already shows activity over time.)*

### Profile MetricsSection — 4 cards (replace Commits / Challenges / Reviews / Reputation)

| Card | Source | Icon | Color |
|---|---|---|---|
| Tasks Completed | `tasksCompleted` | Target | `#07a5c9` |
| File Edits | `fileEdits` | GitCommitHorizontalIcon | `#a855f7` |
| Coins Earned | `coinsEarned` | existing coin icon | `#ffb400` |
| Achievements | `achievementsCount` | Award | `#00e5a0` |

### Profile static values → dynamic

| UI slot | Source |
|---|---|
| `memberSince` | `formatMemberSince(user.createdAt)` → `"Sep 12, 2025"` |
| `streakDays` | `dailyLogin.streak ?? 0` |
| `leaderboardRank` | `getProfileMetrics.leaderboardRank` |
| `weeklyGrowth` | `getProfileMetrics.weeklyGrowth` (e.g. `"+12%"`, `"-3%"`, `"+0%"`) |
| Friends grid | `data.rivals` (top-XP users excluding self) |

### Landing HeroSection — 4 stats (all dynamic, formatted)

`activeDevs`, `techStacks`, `scenarios` sourced from DB; `rating` is a server-returned constant so the component is provider-agnostic.

---

## Activity feed mapping

Keep existing `ActivityItem` union type ([src/lib/types/dashboard.ts](src/lib/types/dashboard.ts)). Emit two `type`s from real data; others stay unused until the respective features emit events.

- `CompletedTask` → `{ id, type: 'challenge', title: taskName, description: \`Task completed in Level ${container.level}\`, timestamp: formatRelativeTime(completedAt), icon: 'bug' }`
- `UserAchievement` (join `Achievement`) → `{ id, type: 'achievement', title: achievement.name, description: achievement.description, timestamp: formatRelativeTime(earnedAt), icon: achievement.icon ?? 'award', xp: achievement.xpReward }`

---

## Files to modify

### Create

- `src/lib/server/stats/index.ts`
- `src/lib/server/stats/user-kpis.ts`
- `src/lib/server/stats/activity.ts`
- `src/lib/server/stats/leaderboard.ts`
- `src/lib/server/stats/landing.ts`
- `src/lib/server/stats/format.ts`
- `src/routes/+page.server.ts` — **does not currently exist**; loads `getLandingStats()`

### Modify

- [src/routes/dashboard/+page.server.ts](src/routes/dashboard/+page.server.ts) — extend the `Promise.all` with `getUserKpis`, `getWeeklyTaskStats`, `getRecentActivity`, `getLeaderboard`; return `kpis`, `weekly`, `activity`, `leaderboard`.
- [src/routes/dashboard/+page.svelte](src/routes/dashboard/+page.svelte) — delete the `$mocks` import; build the `KPIData[]` array locally from `data.kpis` (icons/colors stay in UI); pass `data.weekly`, `data.activity`, `data.leaderboard` to `StatsDrawer`.
- [src/routes/profile/+page.server.ts](src/routes/profile/+page.server.ts) — add `getProfileMetrics`, `getRivals`; return `metrics`, `rivals`.
- [src/routes/profile/+page.svelte](src/routes/profile/+page.svelte) — remove the hardcoded `memberSince`, `bio`, `location`, `role`, `streakDays`, `leaderboardRank`, `weeklyGrowth`, `metrics`, `friends` literals; derive from `data.metrics` and `data.rivals`. (`bio`, `location`, `role` have no DB home — leave as `""` defaults so the card renders gracefully; tracked as follow-up.)
- [src/lib/components/dashboard/WeeklyStats.svelte](src/lib/components/dashboard/WeeklyStats.svelte) — subtitle "Coding hours this week" → "Tasks completed this week"; hardcoded `"+12% from last week"` → bound to new prop `stats.growthLabel`; tooltip and `h` suffix → swap to no-suffix or " tasks". Rename `codingHours` field on the `WeeklyStats` type to `counts` (update [src/lib/types/dashboard.ts](src/lib/types/dashboard.ts)).
- [src/lib/components/profile/FriendsSection.svelte](src/lib/components/profile/FriendsSection.svelte) — rename prop `friends` → `rivals`; heading → "Rivals", subtitle → "Top players by XP"; each tile shows `username ?? name`, `image ?? emoji fallback`, `Lv {level}`, `{xp} XP`.
- [src/lib/components/landing/HeroSection.svelte](src/lib/components/landing/HeroSection.svelte) — extend `$props()` to accept `stats: LandingStats`; delete the hardcoded `stats` array; render `{#each stats as s}` over the prop.
- [src/routes/+page.svelte](src/routes/+page.svelte) — accept `export let data`, pass `stats={data.landingStats}` to `<HeroSection>`.
- [src/lib/types/dashboard.ts](src/lib/types/dashboard.ts) — add `RivalEntry`, `ProfileMetricsData`, `LandingStats`, `UserKpis`; rename `WeeklyStats.codingHours` → `counts`, add optional `growthLabel`.
- [src/lib/mocks/dashboard.ts](src/lib/mocks/dashboard.ts) — keep file as typed fixtures for Storybook / dev, but remove its imports from the three route pages.

### Untouched

Auth, Prisma schema (no migrations), existing container/docker routes, non-KPI landing sections (About, Features, HowItWorks, Faq, TechMarquee, LandingCta, LandingNav).

---

## Loader shapes

### `src/routes/+page.server.ts` (new)

```ts
import type { PageServerLoad } from "./$types";
import { getLandingStats } from "$lib/server/stats/landing";

export const load: PageServerLoad = async () => ({
  landingStats: await getLandingStats(),
});
```

### `src/routes/dashboard/+page.server.ts` (extended)

```ts
const [allContainers, archivedStacks, dbUser, kpis, weekly, activity, leaderboard] =
  await Promise.all([
    getAllUserContainer(userData.id),
    getArchivedContainers(userData.id),
    prisma.user.findUnique({ where: { id: userData.id }, select: { coins: true, image: true } }),
    getUserKpis(userData.id),
    getWeeklyTaskStats(userData.id),
    getRecentActivity(userData.id, 8),
    getLeaderboard(5, userData.id),
  ]);
```

### `src/routes/profile/+page.server.ts` (extended)

```ts
const [dbUser, metrics, rivals] = await Promise.all([
  prisma.user.findUnique({ where: { id: session.user.id }, select: {...} }),
  getProfileMetrics(session.user.id),
  getRivals(session.user.id, 6),
]);
```

---

## Performance notes

- Every route loader issues one `Promise.all`. No N+1 — `CompletedTask`/`UserFileChanges` queries scope via `container: { userId }` using existing relations; `Container.userId` index exists ([prisma/schema.prisma:64](prisma/schema.prisma#L64)).
- `getLandingStats()` uses module-scoped memoisation (`{ value, expiresAt }`) with a 60-second TTL — landing hits are high-frequency and these counts don't need to be real-time.
- No new Prisma indexes needed. All filter fields are already indexed or are primary relations.

---

## Empty-state behavior

Every helper returns sensible defaults so first-run users see the UI without errors:

| Value | Default |
|---|---|
| counts | `0` |
| arrays (activity, leaderboard, rivals) | `[]` |
| weeklyGrowth | `"+0%"` |
| memberSince | `user.createdAt` (fall through to `new Date()` only if user missing) |
| leaderboardRank | `1` |
| weekly.counts | `[0,0,0,0,0,0,0]` |

UI components (`ActivityFeed`, `LeaderboardSnapshot`, `WeeklyStats`) already handle empty arrays — no changes needed there beyond the prop-renaming noted above.

---

## Verification

Manual end-to-end walk-through after implementation:

1. **`/` (signed out)** — hero stats show real numbers. Verify: add a `ContainerStack` row with a new `stackName`; reload page after 60s; `TECH STACKS` count increments.
2. **`/dashboard`** — sign in as a user with ≥1 archived container + ≥1 `CompletedTask`.
   - KPI "Stacks Completed" equals `SELECT COUNT(*) FROM "Container" WHERE "userId"=? AND "isArchived"=true`.
   - Open StatsDrawer: Weekly chart shows 7 bars with correct bucket for today; total equals last-7-day `CompletedTask` count; Activity feed shows intermixed task completions + achievements ordered desc; Leaderboard top 5 by xp with current user highlighted if in top 5.
3. **`/profile`** — MetricsSection shows four DB-backed numbers matching raw `SELECT COUNT(*)`; Rivals grid excludes self, sorted by xp desc; `memberSince` matches `user.createdAt`; `leaderboardRank` equals the rank shown on the dashboard.
4. **Fresh account** — create a new user via Google OAuth; visit `/dashboard` and `/profile`: all counts = 0, no console errors, no mock fallback text visible.
5. **Type check** — `npm run check` passes after the `codingHours` → `counts` rename.

---

## Out of scope (follow-ups)

- Bio / location / role fields for `ProfileCard` (schema doesn't store them; leave empty strings).
- Real friendship/follow graph (currently using top-XP rivals as a proxy).
- Streak increment job (`DailyLogin.streak` exists but whether a scheduled job updates it is outside this change).
- Coding-time tracking (no reliable session-time source today; dropped the mock "Coding Hours" card rather than fabricate).
