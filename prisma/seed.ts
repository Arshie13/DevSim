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

  console.log("ℹ️  Existing data will be preserved — new records only\n");

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
    const existing = await prisma.scenario.findUnique({ where: { id: scenario.id } });
    if (existing) {
      console.log(`⏭️  Skipped scenario: ${scenario.name} (already exists)`);
      continue;
    }
    await prisma.scenario.create({ data: scenario });
    console.log(`✅ Created scenario: ${scenario.name}`);
  }

  // Insert levels
  console.log("\n🎯 Creating levels...\n");
  for (const level of levels) {
    const existing = await prisma.level.findUnique({ where: { id: level.id } });
    if (existing) {
      // Upsert tasks by (level_id, task_name).  Nested relations
      // (learning_sections, acceptance_criteria, hints) are cycled only
      // when new data is present so existing rows are preserved when the
      // seed omits them (e.g. a task with no learning_sections block).
      const { tasks, ...levelData } = level;
      await prisma.level.update({ where: { id: level.id }, data: levelData });
      for (const task of tasks.create) {
        const { acceptance_criteria, hints, ...taskData } = task;
        const learning_sections = (task as any).learning_sections;
        const updateData: any = { ...taskData };
        if (learning_sections?.create?.length) {
          updateData.learning_sections = { deleteMany: {}, create: learning_sections.create };
        }
        if (acceptance_criteria?.create?.length) {
          updateData.acceptance_criteria = { deleteMany: {}, create: acceptance_criteria.create };
        }
        if (hints?.create?.length) {
          updateData.hints = { deleteMany: {}, create: hints.create };
        }
        await prisma.level_task.upsert({
          where: { level_id_task_name: { level_id: level.id, task_name: taskData.task_name } },
          update: updateData,
          create: {
            ...taskData,
            level_id: level.id,
            learning_sections: learning_sections ?? {},
            acceptance_criteria: acceptance_criteria ?? {},
            hints: hints ?? {},
          },
        });
      }
      console.log(`🔄 Updated level: ${level.title}`);
      continue;
    }
    await prisma.level.create({ data: level });
    console.log(`✅ Created level: ${level.title}`);
  }

  // Insert achievements + tiers
  console.log("\n🏅 Creating achievements...\n");
  for (const family of achievements) {
    const existing = await prisma.achievement.findUnique({ where: { name: family.name } });
    if (existing) {
      console.log(`⏭️  Skipped achievement: ${family.name} (already exists)`);
      continue;
    }
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

  const learnerPassRewards: { reward_index: number; coins: number; xp: number; ai_helps: number; unlocks: string[]; display_type: string; display_value: string }[] = [
    { reward_index: 1,  coins: 100, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "100 Coins" },
    { reward_index: 2,  coins: 0,   xp: 0,  ai_helps: 3,  unlocks: [], display_type: "help",   display_value: "+3 AI Helps" },
    { reward_index: 3,  coins: 150, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "150 Coins" },
    { reward_index: 4,  coins: 0,   xp: 0,  ai_helps: 5,  unlocks: [], display_type: "help",   display_value: "+5 AI Helps" },
    { reward_index: 5,  coins: 200, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "200 Coins" },
    { reward_index: 6,  coins: 0,   xp: 0,  ai_helps: 0,  unlocks: ["pern-pos-scenario-3"], display_type: "scenario_unlock", display_value: "PERN Scenario 3" },
    { reward_index: 7,  coins: 0,   xp: 0,  ai_helps: 7,  unlocks: [], display_type: "help",   display_value: "+7 AI Helps" },
    { reward_index: 8,  coins: 250, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "250 Coins" },
    { reward_index: 9,  coins: 0,   xp: 0,  ai_helps: 9,  unlocks: [], display_type: "help",   display_value: "+9 AI Helps" },
    { reward_index: 10, coins: 300, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "300 Coins" },
    { reward_index: 11, coins: 0,   xp: 0,  ai_helps: 11, unlocks: [], display_type: "help",   display_value: "+11 AI Helps" },
    { reward_index: 12, coins: 0,   xp: 0,  ai_helps: 0,  unlocks: ["mern-tw-scenario-3"], display_type: "scenario_unlock", display_value: "MERN Scenario 3" },
    { reward_index: 13, coins: 400, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "400 Coins" },
    { reward_index: 14, coins: 0,   xp: 0,  ai_helps: 13, unlocks: [], display_type: "help",   display_value: "+13 AI Helps" },
    { reward_index: 15, coins: 500, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "500 Coins" },
    { reward_index: 16, coins: 0,   xp: 0,  ai_helps: 16, unlocks: [], display_type: "help",   display_value: "+16 AI Helps" },
    { reward_index: 17, coins: 600, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "600 Coins" },
    { reward_index: 18, coins: 0,   xp: 0,  ai_helps: 0,  unlocks: ["nestjs-pos-scenario-3"], display_type: "scenario_unlock", display_value: "NestJS Scenario 3" },
    { reward_index: 19, coins: 0,   xp: 0,  ai_helps: 20, unlocks: [], display_type: "help",   display_value: "+20 AI Helps" },
    { reward_index: 20, coins: 700, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "700 Coins" },
    { reward_index: 21, coins: 0,   xp: 0,  ai_helps: 24, unlocks: [], display_type: "help",   display_value: "+24 AI Helps" },
    { reward_index: 22, coins: 750, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "750 Coins" },
    { reward_index: 23, coins: 0,   xp: 0,  ai_helps: 28, unlocks: [], display_type: "help",   display_value: "+28 AI Helps" },
    { reward_index: 24, coins: 0,   xp: 0,  ai_helps: 0,  unlocks: ["nextjs-postgres-prisma-3"], display_type: "scenario_unlock", display_value: "Next.js + Prisma Scenario 3" },
    { reward_index: 25, coins: 800, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "800 Coins" },
    { reward_index: 26, coins: 0,   xp: 0,  ai_helps: 32, unlocks: [], display_type: "help",   display_value: "+32 AI Helps" },
    { reward_index: 27, coins: 900, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "900 Coins" },
    { reward_index: 28, coins: 0,   xp: 0,  ai_helps: 35, unlocks: [], display_type: "help",   display_value: "+35 AI Helps" },
    { reward_index: 29, coins: 950, xp: 0,  ai_helps: 0,  unlocks: [], display_type: "coins",  display_value: "950 Coins" },
    { reward_index: 30, coins: 0,   xp: 0,  ai_helps: 0,  unlocks: ["nextjs-shadcn-ui-scenario-3"], display_type: "scenario_unlock", display_value: "Next.js Shadcn Scenario 3" },
  ];

  for (const reward of learnerPassRewards) {
    const existing = await prisma.learner_pass_reward.findUnique({ where: { reward_index: reward.reward_index } });
    if (existing) {
      await prisma.learner_pass_reward.update({
        where: { reward_index: reward.reward_index },
        data: {
          coins: reward.coins,
          xp: reward.xp,
          ai_helps: reward.ai_helps,
          unlocked_scenario: reward.unlocks,
          display_type: reward.display_type,
          display_value: reward.display_value,
        },
      });
      console.log(`🔄 Updated learner pass reward day ${reward.reward_index}`);
      continue;
    }
    await prisma.learner_pass_reward.create({
      data: {
        reward_index: reward.reward_index,
        coins: reward.coins,
        xp: reward.xp,
        ai_helps: reward.ai_helps,
        unlocked_scenario: reward.unlocks,
        display_type: reward.display_type,
        display_value: reward.display_value,
      },
    });
  }

  console.log("✅ Created learner pass rewards\n");

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

