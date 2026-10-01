/**
 * Achievement catalog — the single source of truth.
 *
 * The catalog lives in code, not the database. The DB only records *who unlocked
 * what* — `user_achievements.(family, tier)` — and never holds a definition. This
 * makes criteria compiler-checked, removes the denormalised family/tier rows, and
 * keeps the catalog identical across every environment.
 *
 * Rules:
 *   1. `key` is a stable identity, stored verbatim as `user_achievements.family`.
 *      NEVER rename or delete a key once shipped — historical unlock rows
 *      reference it by string. To retire an achievement set `retired: true` and
 *      leave the definition in place forever.
 *   2. `name` is display copy and may be reworded freely. It is deliberately NOT
 *      the identity, so a copy edit can never orphan unlock history.
 *   3. Criteria are a discriminated union: the compiler rejects a payload whose
 *      field does not match its `type` (`{ type: 'login_streak', count: 5 }` is
 *      a type error, not a silently-passing unlock).
 */

import type { achievement_tier_level, AchievementCategory } from "$types";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

/**
 * Discriminated union of every supported unlock condition.
 *
 * `type` MUST stay in sync with `evaluateCriterion` in `./progress.ts` — the
 * switch there is exhaustive, so adding a member without handling it fails the
 * build rather than silently shipping an unearnable achievement.
 */
export type AchievementCriterion =
  /** Distinct scenarios finished within any single stack. */
  | { type: "scenarios_in_stack"; count: number }
  /** Distinct tech stacks with a finished scenario. */
  | { type: "distinct_stacks"; count: number }
  /** Total finished scenarios (archived workspaces). */
  | { type: "scenarios_completed"; count: number }
  /** Total levels completed. */
  | { type: "levels_completed"; count: number }
  /** Total level tasks completed. */
  | { type: "tasks_completed"; count: number }
  /** Consecutive daily-login streak length, in days. */
  | { type: "login_streak"; days: number }
  /** Tracked file edits (WRITE + RENAME). */
  | { type: "file_edits"; count: number }
  /** Lifetime XP total. */
  | { type: "xp_total"; xp: number }
  /**
   * NOTE: measures the user's *current* coin balance, which spending reduces.
   * The key is kept for parity with the original criteria; rename to `coins_held`
   * if you ever want the name to match the behaviour.
   */
  | { type: "coins_earned"; coins: number }
  /** Correct trivia answers. */
  | { type: "trivia_correct"; count: number }
  /** Onboarding tutorial finished. */
  | { type: "tutorial_completed" };

export interface TierDefinition {
  tier: achievement_tier_level;
  /** Human-readable tier requirement, shown under the tier badge. */
  description: string;
  criteria: AchievementCriterion;
  xpReward: number;
  coinReward: number;
}

export interface AchievementDefinition {
  /**
   * Stable family identity, stored verbatim as `user_achievements.family`.
   * Never reuse after retiring.
   */
  key: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  /** Retired families keep their definitions so historical unlocks still render. */
  retired?: boolean;
  tiers: TierDefinition[];
}

/** A tier with its family metadata inlined — the shape consumers actually use. */
export interface ResolvedTier {
  /** Derived `${family}:${tier}` — a UI/toast key. NOT what the DB stores. */
  key: string;
  /** DB column `family`. Equals the owning `AchievementDefinition.key`. */
  family: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: achievement_tier_level;
  tierDescription: string;
  criteria: AchievementCriterion;
  xpReward: number;
  coinReward: number;
  retired: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Tier metadata
// ────────────────────────────────────────────────────────────────────────────

/** Sort/rank order. Ascending: ROOKIE is the entry tier. */
export const TIER_ORDER: Record<achievement_tier_level, number> = {
  ROOKIE: 0,
  AMATEUR: 1,
  PRO: 2,
};

/** Reward granted per tier. Uniform across families. */
export const TIER_REWARDS: Record<achievement_tier_level, { xp: number; coins: number }> = {
  ROOKIE: { xp: 100, coins: 50 },
  AMATEUR: { xp: 250, coins: 100 },
  PRO: { xp: 600, coins: 200 },
};

export const TIER_LEVELS: achievement_tier_level[] = ["ROOKIE", "AMATEUR", "PRO"];

// ────────────────────────────────────────────────────────────────────────────
// Catalog
// ────────────────────────────────────────────────────────────────────────────

interface TierInput {
  description: string;
  criteria: AchievementCriterion;
}

/** Build a standard three-tier family. Rewards come from `TIER_REWARDS`. */
function trio(rookie: TierInput, amateur: TierInput, pro: TierInput): TierDefinition[] {
  return [
    { tier: "ROOKIE", ...rookie, ...rewardFor("ROOKIE") },
    { tier: "AMATEUR", ...amateur, ...rewardFor("AMATEUR") },
    { tier: "PRO", ...pro, ...rewardFor("PRO") },
  ];
}

function rewardFor(tier: achievement_tier_level): { xpReward: number; coinReward: number } {
  return { xpReward: TIER_REWARDS[tier].xp, coinReward: TIER_REWARDS[tier].coins };
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Progress ────────────────────────────────────────────────────────────────
  {
    key: "stack_master",
    name: "Stack Master",
    description: "Finish scenarios in a single stack",
    icon: "🏆",
    category: "progress",
    tiers: trio(
      { description: "Finish 1 scenario in a single stack", criteria: { type: "scenarios_in_stack", count: 1 } },
      { description: "Finish 2 scenarios in a single stack", criteria: { type: "scenarios_in_stack", count: 2 } },
      { description: "Finish 3 scenarios in a single stack", criteria: { type: "scenarios_in_stack", count: 3 } },
    ),
  },
  {
    key: "level_climber",
    name: "Level Climber",
    description: "Finish levels across your journey",
    icon: "📈",
    category: "progress",
    tiers: trio(
      { description: "Complete 2 levels", criteria: { type: "levels_completed", count: 2 } },
      { description: "Complete 10 levels", criteria: { type: "levels_completed", count: 10 } },
      { description: "Complete 30 levels", criteria: { type: "levels_completed", count: 30 } },
    ),
  },
  {
    key: "task_slayer",
    name: "Task Slayer",
    description: "Complete level tasks",
    icon: "⚔️",
    category: "progress",
    tiers: trio(
      { description: "Complete 5 tasks", criteria: { type: "tasks_completed", count: 5 } },
      { description: "Complete 20 tasks", criteria: { type: "tasks_completed", count: 20 } },
      { description: "Complete 50 tasks", criteria: { type: "tasks_completed", count: 50 } },
    ),
  },
  // Exploration ─────────────────────────────────────────────────────────────
  {
    key: "stack_explorer",
    name: "Stack Explorer",
    description: "Finish a scenario in multiple stacks",
    icon: "🧭",
    category: "exploration",
    tiers: trio(
      { description: "Finish a scenario in 1 stack", criteria: { type: "distinct_stacks", count: 1 } },
      { description: "Finish a scenario in 2 stacks", criteria: { type: "distinct_stacks", count: 2 } },
      { description: "Finish a scenario in 3+ stacks", criteria: { type: "distinct_stacks", count: 3 } },
    ),
  },
  {
    key: "scenario_nomad",
    name: "Scenario Nomad",
    description: "Complete distinct scenarios",
    icon: "🗺️",
    category: "exploration",
    tiers: trio(
      { description: "Complete 1 scenario", criteria: { type: "scenarios_completed", count: 1 } },
      { description: "Complete 3 distinct scenarios", criteria: { type: "scenarios_completed", count: 3 } },
      { description: "Complete 5 distinct scenarios", criteria: { type: "scenarios_completed", count: 5 } },
    ),
  },
  // Consistency ─────────────────────────────────────────────────────────────
  {
    key: "daily_driver",
    name: "Daily Driver",
    description: "Keep a login streak going",
    icon: "🔥",
    category: "consistency",
    tiers: trio(
      { description: "Log in 5 days in a row", criteria: { type: "login_streak", days: 5 } },
      { description: "Log in 10 days in a row", criteria: { type: "login_streak", days: 10 } },
      { description: "Log in 20 days in a row", criteria: { type: "login_streak", days: 20 } },
    ),
  },
  {
    key: "code_committer",
    name: "Code Committer",
    description: "Edit files in your workspace",
    icon: "💾",
    category: "consistency",
    tiers: trio(
      { description: "Make 50 tracked file edits", criteria: { type: "file_edits", count: 50 } },
      { description: "Make 250 tracked file edits", criteria: { type: "file_edits", count: 250 } },
      { description: "Make 1000 tracked file edits", criteria: { type: "file_edits", count: 1000 } },
    ),
  },
  // Mastery ─────────────────────────────────────────────────────────────────
  {
    key: "xp_grinder",
    name: "XP Grinder",
    description: "Accumulate total XP",
    icon: "⚡",
    category: "mastery",
    tiers: trio(
      { description: "Reach 500 total XP", criteria: { type: "xp_total", xp: 500 } },
      { description: "Reach 2,500 total XP", criteria: { type: "xp_total", xp: 2500 } },
      { description: "Reach 10,000 total XP", criteria: { type: "xp_total", xp: 10000 } },
    ),
  },
  {
    key: "coin_collector",
    name: "Coin Collector",
    description: "Accumulate coins",
    icon: "🪙",
    category: "mastery",
    tiers: trio(
      { description: "Hold 200 coins", criteria: { type: "coins_earned", coins: 200 } },
      { description: "Hold 1,000 coins", criteria: { type: "coins_earned", coins: 1000 } },
      { description: "Hold 5,000 coins", criteria: { type: "coins_earned", coins: 5000 } },
    ),
  },
  // Trivia ──────────────────────────────────────────────────────────────────
  {
    key: "quiz_whiz",
    name: "Quiz Whiz",
    description: "Answer trivia questions correctly",
    icon: "🧠",
    category: "mastery",
    tiers: trio(
      { description: "Get your first trivia answer right", criteria: { type: "trivia_correct", count: 1 } },
      { description: "Answer 10 trivia questions correctly", criteria: { type: "trivia_correct", count: 10 } },
      { description: "Answer 25 trivia questions correctly", criteria: { type: "trivia_correct", count: 25 } },
    ),
  },
  // Single-tier exception ───────────────────────────────────────────────────
  {
    key: "first_boot",
    name: "First Boot",
    description: "Finish the onboarding tutorial",
    icon: "🚀",
    category: "progress",
    tiers: [
      {
        tier: "ROOKIE",
        description: "Finish the onboarding tutorial",
        criteria: { type: "tutorial_completed" },
        ...rewardFor("ROOKIE"),
      },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Lookups
// ────────────────────────────────────────────────────────────────────────────

/** Build the `${family}:${tier}` composite string used for UI keys and Sets. */
export function tierKey(family: string, tier: achievement_tier_level): string {
  return `${family}:${tier}`;
}

/**
 * Fail fast on a duplicate `key`. The lookup Map below would otherwise silently
 * keep only the last definition, quietly making one family unreachable.
 */
function assertUniqueKeys(defs: AchievementDefinition[]): void {
  const seen = new Set<string>();
  for (const def of defs) {
    if (seen.has(def.key)) {
      throw new Error(`Duplicate achievement key: "${def.key}"`);
    }
    seen.add(def.key);
  }
}

assertUniqueKeys(ACHIEVEMENTS);

/**
 * Every tier across every family, flattened and resolved. Includes retired
 * families so historical unlock rows can still be rendered.
 */
export const ALL_TIER_DEFS: ResolvedTier[] = ACHIEVEMENTS.flatMap((family) =>
  family.tiers.map((tier) => ({
    key: tierKey(family.key, tier.tier),
    family: family.key,
    name: family.name,
    description: family.description,
    icon: family.icon,
    category: family.category,
    tier: tier.tier,
    tierDescription: tier.description,
    criteria: tier.criteria,
    xpReward: tier.xpReward,
    coinReward: tier.coinReward,
    retired: family.retired ?? false,
  })),
);

const TIER_DEF_BY_PAIR = new Map(ALL_TIER_DEFS.map((t) => [t.key, t]));

/**
 * Resolve a stored `(family, tier)` pair back to its definition. Takes the two
 * DB columns directly; `tier` comes back from Prisma as the enum union.
 */
export function findTierDef(
  family: string,
  tier: achievement_tier_level,
): ResolvedTier | undefined {
  return TIER_DEF_BY_PAIR.get(tierKey(family, tier));
}

/** Active (non-retired) tiers, grouped into families, in catalog order. */
export function getActiveFamilies(): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((f) => !f.retired);
}
