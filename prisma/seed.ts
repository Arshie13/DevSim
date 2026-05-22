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
import { PrismaClient, type Prisma, PassType, RewardType } from "$prismaclient";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { scenarios } from "./data/scenarios"
import { levels } from "./data/levels"
import { achievements } from "./data/achievements"

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
  console.log("🗑️  Cleared existing data\n");

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
     console.log(`✅ Created achievement: ${family.name} (${family.tiers.length} tier${family.tiers.length === 1 ? "" : "s"})`);
   }
   
  // Summary
  console.log("📊 Summary:");
  console.log(`   Levels: ${levels.length}`);
  console.log(`   Scenarios: ${scenarios.length}`);
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