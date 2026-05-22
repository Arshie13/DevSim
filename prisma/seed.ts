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
   await prisma.achievement_tier.deleteMany();
   await prisma.user_achievement.deleteMany();
   await prisma.achievement.deleteMany();

   // Clear Learner's Pass data
   await prisma.ai_help_daily_usage.deleteMany();
   await prisma.user_reward_claim.deleteMany();
   await prisma.user_season_progression.deleteMany();
   await prisma.pass_reward_track.deleteMany();
   await prisma.user_premium_pass.deleteMany();
   await prisma.season.deleteMany();

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

   // --- Learner's Pass Seeding ---
   console.log("\n🎯 Creating Learner's Pass Season 1...\n");

   // Create Season 1
   const now = new Date();
   const startDate = now;
   const endDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from now

   const season = await prisma.season.create({
     data: {
       name: "Season 1: Rising Developer",
       slug: "season-1-rising",
       description: "Kickstart your journey with exclusive rewards!",
       startDate: startDate,
       endDate: endDate,
       isActive: true,
       xpReset: false,
     },
   });
   console.log(`✅ Created season: ${season.name} (${season.slug})`);

    // Define reward track data for levels 1-20 (xpRequired matches level thresholds from PassProgressionService)
    const xpThresholds: Record<number, number> = {
      1: 0,
      2: 100,
      3: 250,
      4: 450,
      5: 700,
      6: 1000,
      7: 1350,
      8: 1750,
      9: 2200,
      10: 2700,
      11: 3250,
      12: 3850,
      13: 4500,
      14: 5200,
      15: 5950,
      16: 6750,
      17: 7600,
      18: 8500,
      19: 9450,
      20: 10450
    };

    const freeTrackRewards = [
      { level: 1, rewardType: "COINS", rewardValue: { amount: 100 }, xpRequired: xpThresholds[1] },
      { level: 2, rewardType: "COINS", rewardValue: { amount: 150 }, xpRequired: xpThresholds[2] },
      { level: 3, rewardType: "AI_HELP_CREDITS", rewardValue: { amount: 2 }, xpRequired: xpThresholds[3] },
      { level: 4, rewardType: "COINS", rewardValue: { amount: 200 }, xpRequired: xpThresholds[4] },
      { level: 5, rewardType: "AVATAR", rewardValue: { path: "/avatars/season1-1.png" }, xpRequired: xpThresholds[5] },
      { level: 6, rewardType: "COINS", rewardValue: { amount: 250 }, xpRequired: xpThresholds[6] },
      { level: 7, rewardType: "TITLE", rewardValue: { title: "Rising Star" }, xpRequired: xpThresholds[7] },
      { level: 8, rewardType: "COINS", rewardValue: { amount: 300 }, xpRequired: xpThresholds[8] },
      { level: 9, rewardType: "AI_HELP_CREDITS", rewardValue: { amount: 3 }, xpRequired: xpThresholds[9] },
      { level: 10, rewardType: "BADGE", rewardValue: { badge: "season1_10" }, xpRequired: xpThresholds[10] },
      { level: 11, rewardType: "COINS", rewardValue: { amount: 350 }, xpRequired: xpThresholds[11] },
      { level: 12, rewardType: "COINS", rewardValue: { amount: 400 }, xpRequired: xpThresholds[12] },
      { level: 13, rewardType: "BORDER", rewardValue: { border: "season1_gold" }, xpRequired: xpThresholds[13] },
      { level: 14, rewardType: "AI_HELP_CREDITS", rewardValue: { amount: 5 }, xpRequired: xpThresholds[14] },
      { level: 15, rewardType: "COINS", rewardValue: { amount: 500 }, xpRequired: xpThresholds[15] },
      { level: 16, rewardType: "TITLE", rewardValue: { title: "Dedicated Learner" }, xpRequired: xpThresholds[16] },
      { level: 17, rewardType: "COINS", rewardValue: { amount: 600 }, xpRequired: xpThresholds[17] },
      { level: 18, rewardType: "AVATAR", rewardValue: { path: "/avatars/season1-2.png" }, xpRequired: xpThresholds[18] },
      { level: 19, rewardType: "COINS", rewardValue: { amount: 750 }, xpRequired: xpThresholds[19] },
      { level: 20, rewardType: "BADGE", rewardValue: { badge: "season1_legend" }, xpRequired: xpThresholds[20] },
    ];

    const premiumTrackRewards = [
      { level: 1, rewardType: "COINS", rewardValue: { amount: 300 }, xpRequired: xpThresholds[1] },
      { level: 2, rewardType: "XP_BOOST", rewardValue: { percent: 25 }, xpRequired: xpThresholds[2] },
      { level: 3, rewardType: "COINS", rewardValue: { amount: 400 }, xpRequired: xpThresholds[3] },
      { level: 4, rewardType: "AVATAR", rewardValue: { path: "/avatars/premium1.png" }, xpRequired: xpThresholds[4] },
      { level: 5, rewardType: "AI_HELP_CREDITS", rewardValue: { amount: 5 }, xpRequired: xpThresholds[5] },
      { level: 6, rewardType: "COINS", rewardValue: { amount: 500 }, xpRequired: xpThresholds[6] },
      { level: 7, rewardType: "BORDER", rewardValue: { border: "premium_radiant" }, xpRequired: xpThresholds[7] },
      { level: 8, rewardType: "COINS", rewardValue: { amount: 600 }, xpRequired: xpThresholds[8] },
      { level: 9, rewardType: "TITLE", rewardValue: { title: "Premium Champion" }, xpRequired: xpThresholds[9] },
      { level: 10, rewardType: "BADGE", rewardValue: { badge: "premium_10" }, xpRequired: xpThresholds[10] },
      { level: 11, rewardType: "COINS", rewardValue: { amount: 700 }, xpRequired: xpThresholds[11] },
      { level: 12, rewardType: "AI_HELP_CREDITS", rewardValue: { amount: 10 }, xpRequired: xpThresholds[12] },
      { level: 13, rewardType: "COINS", rewardValue: { amount: 800 }, xpRequired: xpThresholds[13] },
      { level: 14, rewardType: "AVATAR", rewardValue: { path: "/avatars/premium2.png" }, xpRequired: xpThresholds[14] },
      { level: 15, rewardType: "XP_BOOST", rewardValue: { percent: 50 }, xpRequired: xpThresholds[15] },
      { level: 16, rewardType: "COINS", rewardValue: { amount: 900 }, xpRequired: xpThresholds[16] },
      { level: 17, rewardType: "BADGE", rewardValue: { badge: "premium_elite" }, xpRequired: xpThresholds[17] },
      { level: 18, rewardType: "COINS", rewardValue: { amount: 1000 }, xpRequired: xpThresholds[18] },
      { level: 19, rewardType: "TITLE", rewardValue: { title: "Elite Developer" }, xpRequired: xpThresholds[19] },
      { level: 20, rewardType: "COINS", rewardValue: { amount: 1500 }, xpRequired: xpThresholds[20] },
    ];

   // Create free track rewards
   console.log("\n🎁 Creating free track rewards...\n");
   for (const reward of freeTrackRewards) {
       await prisma.pass_reward_track.create({
         data: {
           season_id: season.id,
           passType: "FREE",
           level: reward.level,
           rewardType: reward.rewardType as RewardType,
           rewardValue: reward.rewardValue,
           xpRequired: reward.xpRequired,
           isClaimable: true,
         },
       });
     console.log(`✅ Created free track level ${reward.level}: ${reward.rewardType}`);
   }

   // Create premium track rewards
   console.log("\n💎 Creating premium track rewards...\n");
   for (const reward of premiumTrackRewards) {
       await prisma.pass_reward_track.create({
         data: {
           season_id: season.id,
           passType: "PREMIUM",
           level: reward.level,
           rewardType: reward.rewardType as RewardType,
           rewardValue: reward.rewardValue,
           xpRequired: reward.xpRequired,
           isClaimable: true,
         },
       });
     console.log(`✅ Created premium track level ${reward.level}: ${reward.rewardType}`);
   }

   // Backfill existing users into season progression
   console.log("\n👥 Backfilling existing users into season progression...\n");
   const existingUsers = await prisma.user.findMany();
   let backfillCount = 0;
   for (const user of existingUsers) {
     await prisma.user_season_progression.upsert({
       where: {
         user_id_season_id: { user_id: user.id, season_id: season.id },
       },
       update: {},
       create: {
         user_id: user.id,
         season_id: season.id,
         currentLevel: 1,
         premiumLevel: 0,
         seasonXp: 0,
         totalXp: user.xp,
       },
     });
     backfillCount++;
   }
   console.log(`✅ Backfilled ${backfillCount} existing users into season progression`);

   console.log("\n🎉 Learner's Pass seeded successfully!\n");

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