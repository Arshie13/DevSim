/**
 * Prisma Seed Script
 *
 * Seeds the database with Level and Scenario data for learning DevOps and full-stack development.
 *
 * Usage:
 *   npx tsx prisma/seed.ts
 *
 * Make sure to run `npx prisma generate` first to generate the client.
 *
 * Task type values:
 *   "client" — only a client-side test exists
 *   "server" — only a server-side test exists
 *   "both"   — both client and server tests exist
 *   "none"   — no automated test (setup/manual tasks)
 */

// @ts-ignore - Prisma client path
import { PrismaClient, type Prisma } from "$prismaclient";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

import { levels as pernScenario1Levels, scenarios as pernScenario1Scenarios } from "./seed/react-express-postgres-prisma/scenario-1/seed";
import { levels as pernScenario2Levels, scenarios as pernScenario2Scenarios } from "./seed/react-express-postgres-prisma/scenario-2/seed";
import { levels as pernScenario3Levels, scenarios as pernScenario3Scenarios } from "./seed/react-express-postgres-prisma/scenario-3/seed";

import { levels as mernScenario1Levels, scenarios as mernScenario1Scenarios } from "./seed/react-express-mongodb/scenario-1/seed";
import { levels as mernScenario2Levels, scenarios as mernScenario2Scenarios } from "./seed/react-express-mongodb/scenario-2/seed";
import { levels as mernScenario3Levels, scenarios as mernScenario3Scenarios } from "./seed/react-express-mongodb/scenario-3/seed";

import { levels as nestjsScenario1Levels, scenarios as nestjsScenario1Scenarios } from "./seed/nestjs-postgres-prisma/scenario-1/seed";
import { levels as nestjsScenario2Levels, scenarios as nestjsScenario2Scenarios } from "./seed/nestjs-postgres-prisma/scenario-2/seed";
import { levels as nestjsScenario3Levels, scenarios as nestjsScenario3Scenarios } from "./seed/nestjs-postgres-prisma/scenario-3/seed";

import { levels as nextjsScenario1Levels, scenarios as nextjsScenario1Scenarios } from "./seed/nextjs-postgres-prisma/scenario-1/seed";
import { levels as nextjsScenario2Levels, scenarios as nextjsScenario2Scenarios } from "./seed/nextjs-postgres-prisma/scenario-2/seed";
import { levels as nextjsScenario3Levels, scenarios as nextjsScenario3Scenarios } from "./seed/nextjs-postgres-prisma/scenario-3/seed";

import { levels as nextjsShadcnScenario1Levels, scenarios as nextjsShadcnScenario1Scenarios } from "./seed/nextjs-shadcn-ui/scenario-1/seed";
import { levels as nextjsShadcnScenario2Levels, scenarios as nextjsShadcnScenario2Scenarios } from "./seed/nextjs-shadcn-ui/scenario-2/seed";
import { levels as nextjsShadcnScenario3Levels, scenarios as nextjsShadcnScenario3Scenarios } from "./seed/nextjs-shadcn-ui/scenario-3/seed";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data
  await prisma.completed_task.deleteMany();
  await prisma.workspace_stack.deleteMany();
  await prisma.user_file_changes.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.acceptance_criteria.deleteMany();
  await prisma.hint.deleteMany();
  await prisma.learning_section.deleteMany();
  await prisma.level_task.deleteMany();
  await prisma.level.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.achievement_tier.deleteMany();
  await prisma.user_achievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.learner_pass_day_claim.deleteMany();
  await prisma.learner_pass_enrollment.deleteMany();
  await prisma.learner_pass_reward.deleteMany();
  await prisma.user_project_access.deleteMany();

  console.log("🗑️  Cleared existing data\n");

  // Define scenarios for each tech stack
  const scenarios = [
    ...pernScenario1Scenarios,
    ...pernScenario2Scenarios,
    ...pernScenario3Scenarios,
    ...mernScenario1Scenarios,
    ...mernScenario2Scenarios,
    ...mernScenario3Scenarios,
    ...nestjsScenario1Scenarios,
    ...nestjsScenario2Scenarios,
    ...nestjsScenario3Scenarios,
    ...nextjsScenario1Scenarios,
    ...nextjsScenario2Scenarios,
    ...nextjsScenario3Scenarios,
    ...nextjsShadcnScenario1Scenarios,
    ...nextjsShadcnScenario2Scenarios,
    ...nextjsShadcnScenario3Scenarios,
  ];

  // Define levels with progressive difficulty
  const levels = [
    ...pernScenario1Levels,
    ...pernScenario2Levels,
    ...pernScenario3Levels,
    ...mernScenario1Levels,
    ...mernScenario2Levels,
    ...mernScenario3Levels,
    ...nestjsScenario1Levels,
    ...nestjsScenario2Levels,
    ...nestjsScenario3Levels,
    ...nextjsScenario1Levels,
    ...nextjsScenario2Levels,
    ...nextjsScenario3Levels,
    ...nextjsShadcnScenario1Levels,
    ...nextjsShadcnScenario2Levels,
    ...nextjsShadcnScenario3Levels,
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Achievements catalog — see docs/ACHIEVEMENTS_SPEC.md
  // Each family has up to 3 tiers: ROOKIE / AMATEUR / PRO.
  // ──────────────────────────────────────────────────────────────────────────
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
    {
      tier: "ROOKIE",
      description: rookieDesc,
      criteria: rookieCriteria,
      xp_reward: 100,
      coin_reward: 50,
    },
    {
      tier: "AMATEUR",
      description: amateurDesc,
      criteria: amateurCriteria,
      xp_reward: 250,
      coin_reward: 100,
    },
    {
      tier: "PRO",
      description: proDesc,
      criteria: proCriteria,
      xp_reward: 600,
      coin_reward: 200,
    },
  ];

  const achievements: AchievementSeed[] = [
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
        "Complete 2 levels",
        "Complete 10 levels",
        "Complete 30 levels",
        { type: "levels_completed", count: 2 },
        { type: "levels_completed", count: 10 },
        { type: "levels_completed", count: 30 },
      ),
    },
    {
      name: "Task Slayer",
      description: "Complete level tasks",
      icon: "⚔️",
      category: "progress",
      tiers: trio(
        "Complete 5 tasks",
        "Complete 20 tasks",
        "Complete 50 tasks",
        { type: "tasks_completed", count: 5 },
        { type: "tasks_completed", count: 20 },
        { type: "tasks_completed", count: 50 },
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
        "Log in 5 days in a row",
        "Log in 10 days in a row",
        "Log in 20 days in a row",
        { type: "login_streak", days: 5 },
        { type: "login_streak", days: 10 },
        { type: "login_streak", days: 20 },
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
    // Trivia ──────────────────────────────────────────────────────────────
    {
      name: "Quiz Whiz",
      description: "Answer trivia questions correctly",
      icon: "🧠",
      category: "mastery",
      tiers: trio(
        "Get your first trivia answer right",
        "Answer 10 trivia questions correctly",
        "Answer 25 trivia questions correctly",
        { type: "trivia_correct", count: 1 },
        { type: "trivia_correct", count: 10 },
        { type: "trivia_correct", count: 25 },
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

  // Insert scenarios first
  console.log("\n📦 Creating scenarios...\n");
  for (const scenario of scenarios) {
    await prisma.scenario.create({ data: scenario });
    console.log(`✅ Created scenario: ${scenario.name}`);
  }

  // Insert levels
  console.log("\n🎯 Creating levels...\n");
  for (const level of levels) {
    await prisma.level.create({ data: level });
    console.log(`✅ Created level: ${level.title}`);
  }

  // Insert achievements + tiers
  console.log("\n🏅 Creating achievements...\n");
  for (const family of achievements) {
    await prisma.achievement.create({
      data: {
        name: family.name,
        description: family.description,
        icon: family.icon,
        category: family.category,
        tiers: {
          create: family.tiers.map((t) => ({
            tier: t.tier,
            description: t.description,
            criteria: t.criteria,
            xp_reward: t.xp_reward,
            coin_reward: t.coin_reward,
          })),
        },
      },
    });
    console.log(
      `✅ Created achievement: ${family.name} (${family.tiers.length} tier${family.tiers.length === 1 ? "" : "s"})`,
    );
  }

  // Insert learner pass rewards
  console.log("\n🎁 Creating learner pass rewards...\n");

  const learnerPassRewards: { day_number: number; coins_reward: number; xp_reward: number; unlock_project_ids: string[] }[] = [
    { day_number: 1, coins_reward: 100, xp_reward: 50, unlock_project_ids: [] },
    { day_number: 2, coins_reward: 400, xp_reward: 80, unlock_project_ids: [] },
    { day_number: 3, coins_reward: 50, xp_reward: 100, unlock_project_ids: [] },
    { day_number: 4, coins_reward: 200, xp_reward: 70, unlock_project_ids: [] },
    { day_number: 5, coins_reward: 500, xp_reward: 90, unlock_project_ids: [] },
    { day_number: 6, coins_reward: 300, xp_reward: 120, unlock_project_ids: [] },
    { day_number: 7, coins_reward: 80, xp_reward: 150, unlock_project_ids: [] },
    { day_number: 8, coins_reward: 350, xp_reward: 100, unlock_project_ids: [] },
    { day_number: 9, coins_reward: 750, xp_reward: 110, unlock_project_ids: [] },
    { day_number: 10, coins_reward: 200, xp_reward: 130, unlock_project_ids: [] },
    { day_number: 11, coins_reward: 450, xp_reward: 80, unlock_project_ids: [] },
    { day_number: 12, coins_reward: 1000, xp_reward: 100, unlock_project_ids: [] },
    { day_number: 13, coins_reward: 500, xp_reward: 120, unlock_project_ids: [] },
    { day_number: 14, coins_reward: 100, xp_reward: 160, unlock_project_ids: [] },
    { day_number: 15, coins_reward: 150, xp_reward: 180, unlock_project_ids: [] },
    { day_number: 16, coins_reward: 1500, xp_reward: 100, unlock_project_ids: [] },
    { day_number: 17, coins_reward: 200, xp_reward: 200, unlock_project_ids: [] },
    { day_number: 18, coins_reward: 700, xp_reward: 150, unlock_project_ids: [] },
    { day_number: 19, coins_reward: 1800, xp_reward: 120, unlock_project_ids: [] },
    { day_number: 20, coins_reward: 300, xp_reward: 250, unlock_project_ids: [] },
    { day_number: 21, coins_reward: 900, xp_reward: 180, unlock_project_ids: [] },
    { day_number: 22, coins_reward: 250, xp_reward: 150, unlock_project_ids: [] },
    { day_number: 23, coins_reward: 1000, xp_reward: 200, unlock_project_ids: [] },
    { day_number: 24, coins_reward: 2200, xp_reward: 150, unlock_project_ids: [] },
    { day_number: 25, coins_reward: 300, xp_reward: 200, unlock_project_ids: [] },
    { day_number: 26, coins_reward: 1200, xp_reward: 220, unlock_project_ids: [] },
    { day_number: 27, coins_reward: 2500, xp_reward: 200, unlock_project_ids: [] },
    { day_number: 28, coins_reward: 1400, xp_reward: 250, unlock_project_ids: [] },
    { day_number: 29, coins_reward: 350, xp_reward: 300, unlock_project_ids: [] },
    { day_number: 30, coins_reward: 500, xp_reward: 400, unlock_project_ids: [] },
  ];

  for (const reward of learnerPassRewards) {
    await prisma.learner_pass_reward.create({ data: reward });
  }

  console.log("✅ Created 30 learner pass rewards\n");

  console.log("\n🎉 Database seeded successfully!\n");

  // Summary
  console.log("📊 Summary:");
  console.log(`   Levels: ${levels.length}`);
  console.log(`   Scenarios: ${scenarios.length}`);
  console.log(`   Learner Pass Rewards: ${learnerPassRewards.length}`);
  console.log("\n📋 Difficulty breakdown:");
  const difficultyCount = scenarios.reduce(
    (acc, s) => {
      acc[s.difficulty] = (acc[s.difficulty] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  Object.entries(difficultyCount).forEach(([diff, count]) => {
    console.log(`   ${diff}: ${count}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

