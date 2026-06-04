import type { Prisma } from "$prismaclient"

type TierSeed = {
    tier: "ROOKIE" | "AMATEUR" | "PRO";
    description: string;
    criteria: Prisma.InputJsonValue;
    xp_reward: number;
    coin_reward: number;
  };
  type AchievementSeed = {
    name: string;
    description: string;
    icon: string;
    category: "progress" | "exploration" | "consistency" | "mastery";
    tiers: TierSeed[];
  };

  const trio = (
    rookieDesc: string,
    amateurDesc: string,
    proDesc: string,
    rookieCriteria: Prisma.InputJsonValue,
    amateurCriteria: Prisma.InputJsonValue,
    proCriteria: Prisma.InputJsonValue,
  ): TierSeed[] => [
    { tier: "ROOKIE",  description: rookieDesc,  criteria: rookieCriteria,  xp_reward: 100, coin_reward: 50  },
    { tier: "AMATEUR", description: amateurDesc, criteria: amateurCriteria, xp_reward: 250, coin_reward: 100 },
    { tier: "PRO",     description: proDesc,     criteria: proCriteria,     xp_reward: 600, coin_reward: 200 },
  ];

export const achievements: AchievementSeed[] = [
    // Progress ────────────────────────────────────────────────────────────
    {
      name: "Stack Master",
      description: "Finish scenarios in a single stack",
      icon: "🏆",
      category: "progress",
      tiers: trio(
        "Finish 1 scenario in a single stack",
        "Finish 2 scenarios in a single stack",
        "Finish 3 scenarios in a single stack",
        { type: "scenarios_in_stack", count: 1 },
        { type: "scenarios_in_stack", count: 2 },
        { type: "scenarios_in_stack", count: 3 },
      ),
    },
    {
      name: "Level Climber",
      description: "Finish levels across your journey",
      icon: "📈",
      category: "progress",
      tiers: trio(
        "Complete 5 levels",
        "Complete 15 levels",
        "Complete 30 levels",
        { type: "levels_completed", count: 5 },
        { type: "levels_completed", count: 15 },
        { type: "levels_completed", count: 30 },
      ),
    },
    {
      name: "Task Slayer",
      description: "Complete level tasks",
      icon: "⚔️",
      category: "progress",
      tiers: trio(
        "Complete 10 tasks",
        "Complete 50 tasks",
        "Complete 150 tasks",
        { type: "tasks_completed", count: 10 },
        { type: "tasks_completed", count: 50 },
        { type: "tasks_completed", count: 150 },
      ),
    },
    // Exploration ─────────────────────────────────────────────────────────
    {
      name: "Stack Explorer",
      description: "Finish a scenario in multiple stacks",
      icon: "🧭",
      category: "exploration",
      tiers: trio(
        "Finish a scenario in 1 stack",
        "Finish a scenario in 2 stacks",
        "Finish a scenario in 3+ stacks",
        { type: "distinct_stacks", count: 1 },
        { type: "distinct_stacks", count: 2 },
        { type: "distinct_stacks", count: 3 },
      ),
    },
    {
      name: "Scenario Nomad",
      description: "Complete distinct scenarios",
      icon: "🗺️",
      category: "exploration",
      tiers: trio(
        "Complete 1 scenario",
        "Complete 3 distinct scenarios",
        "Complete 5 distinct scenarios",
        { type: "scenarios_completed", count: 1 },
        { type: "scenarios_completed", count: 3 },
        { type: "scenarios_completed", count: 5 },
      ),
    },
    // Consistency ─────────────────────────────────────────────────────────
    {
      name: "Daily Driver",
      description: "Keep a login streak going",
      icon: "🔥",
      category: "consistency",
      tiers: trio(
        "Log in 3 days in a row",
        "Log in 7 days in a row",
        "Log in 30 days in a row",
        { type: "login_streak", days: 3 },
        { type: "login_streak", days: 7 },
        { type: "login_streak", days: 30 },
      ),
    },
    {
      name: "Code Committer",
      description: "Edit files in your workspace",
      icon: "💾",
      category: "consistency",
      tiers: trio(
        "Make 50 tracked file edits",
        "Make 250 tracked file edits",
        "Make 1000 tracked file edits",
        { type: "file_edits", count: 50 },
        { type: "file_edits", count: 250 },
        { type: "file_edits", count: 1000 },
      ),
    },
    // Mastery ─────────────────────────────────────────────────────────────
    {
      name: "XP Grinder",
      description: "Accumulate total XP",
      icon: "⚡",
      category: "mastery",
      tiers: trio(
        "Reach 500 total XP",
        "Reach 2,500 total XP",
        "Reach 10,000 total XP",
        { type: "xp_total", xp: 500 },
        { type: "xp_total", xp: 2500 },
        { type: "xp_total", xp: 10000 },
      ),
    },
    {
      name: "Coin Collector",
      description: "Accumulate coins",
      icon: "🪙",
      category: "mastery",
      tiers: trio(
        "Hold 200 coins",
        "Hold 1,000 coins",
        "Hold 5,000 coins",
        { type: "coins_earned", coins: 200 },
        { type: "coins_earned", coins: 1000 },
        { type: "coins_earned", coins: 5000 },
      ),
    },
    // Single-tier exception (First Boot) ──────────────────────────────────
    {
      name: "First Boot",
      description: "Finish the onboarding tutorial",
      icon: "🚀",
      category: "progress",
      tiers: [
        {
          tier: "ROOKIE",
          description: "Finish the onboarding tutorial",
          criteria: { type: "tutorial_completed" },
          xp_reward: 100,
          coin_reward: 50,
        },
      ],
    },
  ];